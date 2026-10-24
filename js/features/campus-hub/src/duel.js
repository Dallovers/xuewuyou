/* 擂台现场（第十五轮）—— 两个真人玩家在同一座擂台上互相看得见。
 *
 * 分工先说清楚，否则很容易长出第二套状态：
 *   服务端 community 模块   —— 谁发起、谁开始、答几题、得几分，唯一真相
 *   服务端 campus/presence  —— 谁站在哪个位、在做什么动作（一次性表现，刷新即失）
 *   本模块                  —— 把上面两件事接到 3D 上：连一条 socket、进出位、转发动作
 *
 * 这个文件自己不判分、不计时、不存答案。它唯一"记住"的是：我现在在哪个位、
 * 对手在哪个位、对手最后一次做了什么动作。这三样丢了都不影响比赛结果。
 */
import { VERSION, ARENA_ROOT } from './layout.js';

/* 站位世界坐标：与 server/campus/presence.js 的 DUEL_STATIONS 一致。
 *   台心 = ARENA_ROOT.x + 1.8 = 40.8，z = ARENA_ROOT.z = 2
 *   南北各离台心 2.14（1.62 台位 + 0.26 挑边 + 0.26 身位），台面高 0.63
 * 改台位尺寸要三处一起改：arena-district.js 的 L.ring、layout.js 的 ARENA_TOP、这里。 */
export const DUEL_TOP = 0.63;
export const DUEL_STATIONS = {
  jia: { x: ARENA_ROOT.x + 1.8, z: ARENA_ROOT.z + 2.14, yaw: Math.PI, seat: '甲' },
  yi: { x: ARENA_ROOT.x + 1.8, z: ARENA_ROOT.z - 2.14, yaw: 0, seat: '乙' },
};
export const otherSeat = (id) => (id === 'yi' ? 'jia' : id === 'jia' ? 'yi' : null);

/* 「云端已连接」的判定。
 *
 * 注意这里**不能只看 window.WG_API**：整合版 campus-hub 是独立页面，
 * 它只引了 deploy-config.js，没有引主站的 js/api.js，所以 WG_API 根本不存在。
 * 同目录的 presence.js 也是直接读 localStorage 的 xwy_token 的——两边保持一致：
 *   有 WG_API 就用它（独立竞技场页 / 主站里嵌进来时），
 *   没有就直接读 localStorage（整合版页面自己跑的时候）。
 * 两条路读到的都是同一个键，所以判定结果不会分叉。 */
const TOKEN_KEY = 'xwy_token';
const USER_KEY = 'xwy_user';
export function session() {
  const api = window.WG_API;
  if (api) {
    const user = api.getUser ? api.getUser() : null;
    if (!api.isLoggedIn?.()) return { state: 'guest', user, token: '' };
    if (!api.isCloudSession?.()) return { state: 'local', user, token: '' };
    const token = api.getToken?.() || '';
    if (!token || token.startsWith('local.')) return { state: 'local', user, token: '' };
    return { state: 'cloud', user, token };
  }
  let token = '', user = null;
  try {
    token = localStorage.getItem(TOKEN_KEY) || '';
    try { user = JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { user = null; }
  } catch { return { state: 'no-bridge', user: null, token: '' }; }
  if (!token) return { state: 'guest', user, token: '' };
  if (token.startsWith('local.')) return { state: 'local', user, token: '' };
  return { state: 'cloud', user, token };
}

const apiBase = () => String(window.WG_DEPLOY?.apiBase || location.origin).replace(/\/$/, '');

let clientLibrary;
function loadClient() {
  if (window.io) return Promise.resolve(window.io);
  if (!clientLibrary) {
    clientLibrary = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('../../../vendor/socketio/socket.io.min.js', document.baseURI).href;
      script.onload = () => { const io = window.io; delete script.dataset; script.remove(); io ? resolve(io) : reject(Error('联网组件未就绪')); };
      script.onerror = () => { script.remove(); clientLibrary = null; reject(Error('联网组件加载失败')); };
      document.head.append(script);
    });
  }
  return clientLibrary;
}

/**
 * @param {object} options
 * @param {(text:string)=>void} options.toast
 */
export function createArenaDuel(options = {}) {
  const toast = options.toast || (() => {});
  const shared=typeof options.campusConnection==='function',bindings=[];
  function bind(event,handler){socket.on(event,handler);bindings.push([socket,event,handler]);}
  function unbind(){for(const [target,event,handler]of bindings)target.off(event,handler);bindings.length=0;}
  /* id → { topic, peer, status, ticking, finishedAt }
   *   ticking    我自己真的点了「开始作答」（只用于排序，不决定能不能坐）
   *   finishedAt 我自己已交卷（那就不该再上去了） */
  const meta = new Map();
  let socket, io, joined = false, selfId = '';
  let challenge = null;              // 当前就位的挑战 id
  let station = null;                // 'jia' | 'yi'
  let seats = new Map();             // id → { id, nick, station }
  let submitted = new Map();         // id → true（服务端 sessions 的投影）
  let peer = null;                   // 对手：{ id, nick, seat, act, at, here }
  let detail = null;                 // 服务端给的挑战详情（含题目/得分/对面状态）
  let topic = '';
  let status = 'idle';               // idle | connecting | seated | error
  let matching = false;              // 正在等对手（服务端队列里有我）
  let connecting = null, joining = null, closed = false;
  let listeners = new Set();

  const emit = () => { for (const fn of listeners) { try { fn(snapshot()); } catch { } } };

  /* ---------- 挑战列表 ----------
   * 两个来源，字段不同但都要认：
   *   GET /api/community/challenges  → {id, topic, status, mine:{startedAt,finishedAt}, peer:{nick}}
   *   campus:join 的 ack.duels       → {challenge, topic, status}
   * 前者更全，后者是"我一条 HTTP 都没发也已经知道"的兜底。 */
  function setMeta(list) {
    meta.clear();
    for (const c of list || []) {
      const id = c.id || c.challenge;
      if (!id) continue;
      const st = c.status || 'active';
      const mine = c.mine || {};
      meta.set(id, {
        topic: c.topic || '',
        peer: c.peer?.nick || '搭子',
        status: st,
        ticking: !!mine.startedAt && !mine.finishedAt,
        finishedAt: !!mine.finishedAt,
      });
    }
  }

  function candidate() {
    /* 只要这场挑战还活着（active、没交卷），就可以上去坐——
     * 不必等"我自己也点了开始"：房间里只要有一个成员开始作答，
     * 服务端就认这间房，另一个人可以就位等他。 */
    const live = [...meta.entries()].filter(([, m]) => m.status !== 'completed' && !m.finishedAt);
    if (!live.length) return null;
    const ticking = live.filter(([, m]) => m.ticking);
    const pool = ticking.length ? ticking : live;
    return pool[pool.length - 1][0];
  }

  /* 候选的**第二来源**：直接问 /api/community/challenges。
   * 为什么不只靠 campus:join 的 duels：页面先打开、之后才点「开始作答」是很常见的顺序。
   * 那时 join 已经发过，ack 里的 duels 是空数组；等服务端建房之后再发 join 又会被节流挡。
   * 直接查一次 HTTP 既没有节流，也不依赖 socket 时序。 */
  async function fromApi() {
    const s = session();
    if (s.state !== 'cloud') return false;
    try {
      const r = await fetch(apiBase() + '/api/community/challenges', { headers: { Authorization: 'Bearer ' + s.token }, credentials: 'omit' });
      if (!r.ok) return false;
      const j = await r.json();
      if (!Array.isArray(j.challenges)) return false;
      setMeta(j.challenges);
      emit();
      return !!candidate();
    } catch { return false; }
  }

  /* ---------- 连接 ---------- */
  async function connect() {
    if (socket?.connected) { if (!joined) ensureJoined(); return socket; }
    if (connecting) return connecting;
    const s = session();
    if (s.state !== 'cloud') return null;
    connecting = (async () => {
      try {
        unbind();
        if(shared){
          const link=await options.campusConnection();if(!link||closed)return null;
          socket=link.socket;joined=true;selfId=link.selfId;if(link.duels?.length)setMeta(link.duels);
        }else{
          io=await loadClient();if(closed)return null;
          socket=io(apiBase()+'/community',{auth:cb=>cb({token:s.token}),reconnection:true,reconnectionDelay:700,reconnectionDelayMax:5000,timeout:10000});
        }
        bind('connect', () => { if (!closed) ensureJoined(); });
        bind('duel:seats', onSeats);
        bind('duel:seat', (m) => { if (m?.id) upsertSeat(m); onSeats(m); });
        bind('duel:state', onState);
        bind('duel:act', onAct);
        /* 匹配成功：由服务端告诉我"配到哪一场、坐哪个位"。
         * 这时候人已经站在台上了，所以直接走就位那一步，不再问一次挑战列表。 */
        bind('duel:matched', (m) => { onMatched(m); });
        bind('duel:left', (m) => {
          if (!m?.id) return;
          seats.delete(m.id);
          if (peer?.id === m.id) peer = null;
          emit();
        });
        bind('disconnect', () => { joined = false; selfId = ''; });
      } catch (error) {
        toast('擂台现场连接失败：' + (error?.message || error));
        return null;
      } finally { connecting = null; }
      return socket;
    })();
    return connecting;
  }

  /* 事件里没有 uid（服务端只对外发 id/nick/station），按 player id 建键即可：
   * 这里唯一要回答的是"对面那个位有没有人"，不用再拉一份 uid 映射。 */
  function upsertSeat(m) {
    if (!m?.id) return;
    seats.set(m.id, { ...(seats.get(m.id) || {}), ...m });
  }

  function onSeats(message) {
    if (!message || typeof message.challenge !== 'string' || !joined) return;
    if (Array.isArray(message.seats)) {
      seats = new Map();
      for (const s of message.seats) if (s?.id) seats.set(s.id, s);
    }
    recomputePeer();
    if (seats.has(selfId)) status = 'seated';
    emit();
  }

  function onState(message) {
    if (!message || message.challenge !== challenge) return;
    if (Array.isArray(message.seats)) {
      seats = new Map();
      for (const s of message.seats) if (s?.id) seats.set(s.id, s);
    }
    if (message.submitted && typeof message.submitted === 'object') submitted = new Map(Object.entries(message.submitted));
    recomputePeer();
    emit();
  }

  function onAct(message) {
    if (!message || message.challenge !== challenge) return;
    if (message.id === selfId) return;
    if (!peer) recomputePeer();
    if (!peer || peer.id !== message.id) return;
    peer = { ...peer, act: message.act, at: message.at || Date.now(), here: true };
    emit();
  }

  function recomputePeer() {
    const mine = seats.get(selfId) || null;
    if (!mine) { peer = null; return; }
    const facing = otherSeat(mine.station);
    const found = [...seats.values()].find((s) => s.id !== selfId && (!facing || s.station === facing));
    if (!found) { peer = null; return; }
    const same = peer?.id === found.id;
    /* submitted 必须挂在 peer 上带出去：它是 socket 里最新的一份"对面交没交"，
     * 比 GET /challenge 的 detail.opponent.submitted 新鲜（那份只在请求时成立）。
     * 答题面板和台上提示都读这个字段，缺了就永远是"作答中"。 */
    peer = { id: found.id, nick: found.nick, seat: found.station, at: same ? peer.at : 0, act: same ? peer.act : null, here: true, submitted: !!submitted.get(found.id) };
  }

  /* ---------- 就位 ---------- */
  /* 同一时刻只允许一次 campus:join 在飞：connect 事件和 enter() 都会来要它。 */
  function ensureJoined() {
    if (joined) return Promise.resolve(true);
    if (!joining) joining = join().finally(() => { joining = null; });
    return joining;
  }

  const joinPose = () => ({ x: ARENA_ROOT.x + 1.8, y: DUEL_TOP, z: ARENA_ROOT.z + 2.14, yaw: Math.PI, height: 0, time: 0, clip: 'idle' });

  async function join() {
    if (closed) return false;
    if(shared){const link=await options.campusConnection();if(!link)return false;joined=true;selfId=link.selfId;if(link.duels?.length)setMeta(link.duels);if(challenge)sendEnter(challenge,station);emit();return true;}

    /* 不要在这里直接 `if(!socket.connected) return false`：
     * 那是一个静默失败，调用方拿不到"只是还没连上"和"连接坏了"的区别，
     * 前者会让人莫名停在 connecting。等一等，等不到再算失败。 */
    if (!(socket && (socket.connected || await waitConnected(5000)))) return false;
    const result = await new Promise((resolve) => {
      socket.timeout(8000).emit('campus:join', { world: VERSION, avatar: 'anime', pose: joinPose() }, (error, value) => resolve(error ? null : value));
    });
    if (!result?.ok) { toast(result?.error || '擂台现场暂时连不上，可以先自己作答'); return false; }
    joined = true;
    selfId = result.self?.id || selfId;
    /* 服务端在 campus:join 的 ack 里已经告诉我"我有哪些进行中的挑战"（duels）。
     * 页面本身不读挑战列表，不 setMeta 的话 candidate() 会一直是空表。
     * 注意别覆盖掉 fromApi() 已经拿到的那份更全的数据：只有 ack 非空时才换。 */
    if (Array.isArray(result.duels) && result.duels.length) setMeta(result.duels);
    if (challenge) sendEnter(challenge, station);
    emit();
    return true;
  }

  /* 服务端对 campus:join 有 800ms 节流（`socket.data.campusJoinAfter`）：
   * 同一条 socket 刚 join 过再发一次，会被挡回来（"请稍后再加入"）。
   * 所以重试几轮，每轮间隔都比节流窗口长；拿到就收手。 */
  async function refreshDuels(rounds = 2) {
    if(shared){await fromApi();return !!candidate();}
    for (let i = 0; i < rounds; i++) {
      await new Promise((r) => setTimeout(r, 900));
      if (!socket?.connected) return false;
      const result = await new Promise((resolve) => {
        socket.timeout(8000).emit('campus:join', { world: VERSION, avatar: 'anime', pose: joinPose() }, (error, value) => resolve(error ? null : value));
      });
      if (!result?.ok) continue;
      selfId = result.self?.id || selfId;
      if (Array.isArray(result.duels) && result.duels.length) setMeta(result.duels);
      emit();
      if (candidate()) return true;
    }
    return !!candidate();
  }

  function sendEnter(id, seat) {
    return new Promise((resolve) => {
      if (!socket?.connected || !joined) { resolve({ ok: false, error: '擂台现场未连接' }); return; }
      /* 必须带 timeout：不带的话服务端万一没回 ack，这个 Promise 永不落地，
       * 人就卡在"正在连接擂台现场"，界面上完全看不出在等谁。 */
      socket.timeout(6000).emit('duel:enter', { challenge: id, station: seat }, (error, result) => {
        if (error) { resolve({ ok: false, error: '就位超时（服务端没有回应）' }); return; }
        if (!result?.ok) { resolve({ ok: false, error: result?.error || '就位失败' }); return; }
        topic = result.topic || '';
        seats = new Map();
        for (const s of result.seats || []) if (s?.id) seats.set(s.id, s);
        recomputePeer();
        status = 'seated';
        emit();
        resolve({ ok: true, peer: peer ? { id: peer.id, nick: peer.nick, seat: peer.seat } : null });
      });
    });
  }

  /* 等到 transport 真的连上。
   * 为什么需要这一步：`await connect()` 只保证 `io(...)` 这个客户端对象建好了，
   * 它内部的握手是异步的，回来时 `socket.connected` 往往还是 false。
   * 这时直接 ensureJoined() 会被 join() 的 `if (!socket.connected) return false`
   * 立刻挡掉——人就停在"正在连接擂台现场"，而实际上半秒后连接就好了。
   * 所以这里显式等一次 connect 事件（已经连上就直接过）。 */
  function waitConnected(ms = 8000) {
    return new Promise((resolve) => {
      if (socket?.connected) { resolve(true); return; }
      if (!socket) { resolve(false); return; }
      let done = false;
      const finish = (value) => { if (done) return; done = true; clearTimeout(timer); socket.off('connect', onConnect); socket.off('connect_error', onError); resolve(value); };
      const onConnect = () => finish(true);
      const onError = () => finish(false);
      const timer = setTimeout(() => finish(false), ms);
      socket.on('connect', onConnect);
      socket.on('connect_error', onError);
    });
  }

  /**
   * 站到某个作答位：告诉服务端我在哪，顺便把「谁在对面」算出来。
   * @param {'jia'|'yi'} seat
   * @param {string} [id] 指定挑战；不传就用候选（进行中、未交卷的最近一场）
   */
  async function enter(seat, id) {
    const s = session();
    if (s.state !== 'cloud') {
      status = s.state === 'guest' ? 'guest' : 'local';
      emit();
      return { ok: false, online: false, state: s.state, message: '未登录云端账号', peer: null, challenge: null, station: seat };
    }
    await connect();
    /* 先把握手等完，再去 join；否则 join 会被 socket.connected=false 挡回，
     * 人已经站上台了却显示"正在连接擂台现场"，对面也永远等不到我。 */
    if (!joined) { if (await waitConnected()) await ensureJoined(); }
    /* 候选为空是常态而不是异常：页面先打开、之后才点「开始作答」，
     * 那时 join 的 ack 里根本没有这场挑战。两条路都试一下。 */
    if (!id && !candidate()) {
      await fromApi();
      if (!candidate()) await refreshDuels(1);
    }
    const chosen = id || candidate();
    challenge = chosen || null;
    station = seat;
    seats = new Map();
    peer = null;

    if (!chosen) {
      /* 没有候选挑战 = 台上没房：就位本身成功（人确实站到台上了），
       * 但要让宿主知道"没有可参加的现场"。 */
      status = 'idle'; emit();
      return { ok: true, online: !!joined, challenge: null, station: seat, peer: null, message: '还没有进行中的挑战' };
    }
    if (!joined) {
      status = 'connecting'; emit();
      return { ok: true, online: false, challenge: chosen, station: seat, peer: null, message: '正在连接擂台现场' };
    }
    const sent = await sendEnter(chosen, seat);
    if (!sent.ok) {
      status = 'error'; emit();
      return { ok: false, online: true, challenge: chosen, station: seat, peer: null, message: sent.error };
    }
    return { ok: true, online: true, challenge: chosen, station: seat, peer: sent.peer };
  }

  /* 匹配成功（服务端 emit 回来）：把我放到服务端指定的位上。
   * 为什么用事件而不是"让调用方 await"：配对要等另一边坐上来，
   * 可能在我点完按钮之后几十秒才发生，这不是一次请求的时长。 */
  async function onMatched(message) {
    if (!message || typeof message.challenge !== 'string') return null;
    if (message.challenge === challenge && status === 'seated') return null;
    const seat = message.station === 'jia' || message.station === 'yi' ? message.station : null;
    if (!seat) return null;
    matching = false;
    challenge = message.challenge;
    station = seat;
    seats = new Map();
    peer = null;
    const sent = await sendEnter(challenge, seat);
    if (!sent.ok) {
      status = 'error';
      toast('就位失败：' + sent.error);
      emit();
      return { ok: false, error: sent.error };
    }
    return { ok: true, matched: true, challenge, station: seat, peer: sent.peer };
  }

  /**
   * 现场匹配：两个都站在竞技场的人各自点一次，服务端把两人配成一场挑战。
   * 不需要先加学习搭子——点「开始匹配」本身就是同意。
   * @param {'jia'|'yi'} seat 我想坐的位；配对时先等的人保持原位，后来的人去另一边
   */
  async function match(seat) {
    const s = session();
    if (s.state !== 'cloud') {
      status = s.state === 'guest' ? 'guest' : 'local';
      emit();
      return { ok: false, online: false, state: s.state, message: '未登录云端账号' };
    }
    await connect();
    if (!joined) { if (await waitConnected()) await ensureJoined(); }
    if (!joined) { status = 'connecting'; emit(); return { ok: false, online: false, message: '正在连接擂台现场' }; }
    const result = await new Promise((resolve) => {
      socket.timeout(8000).emit('duel:match', { station: seat }, (error, value) => resolve(error ? { ok: false, error: '匹配超时（服务端没有回应）' } : value));
    });
    if (!result?.ok) { matching = false; emit(); return result; }
    if (result.matched) {
      /* 自己配对成功：直接落座（服务端可能把我挪到另一个位，以它给的为准） */
      return (await onMatched({ challenge: result.challenge, station: result.station })) || { ok: false, error: '配对成功但落座失败' };
    }
    matching = true;
    emit();
    return { ok: true, waiting: true, station: seat };
  }

  function leave() {
    if (socket?.connected && joined && challenge) socket.emit('duel:leave', { challenge });
    /* 还在队列里的时候下台，要顺手把自己从匹配队列摘掉，
     * 否则对面点匹配会跟一个"已经走开的人"配成一场没人答的挑战。 */
    if (socket?.connected && matching) socket.emit('duel:match/cancel');
    matching = false;
    challenge = null; station = null; seats = new Map(); submitted = new Map(); peer = null; topic = ''; status = 'idle';
    detail = null;
    emit();
  }

  /** 举手 / 交卷：只发动作，不含任何答案，服务端也只负责转发 */
  function act(kind) {
    if (!socket?.connected || !joined || !challenge) return false;
    if (!['cheer', 'answer', 'done'].includes(kind)) return false;
    socket.emit('duel:act', { challenge, act: kind });
    return true;
  }

  /* ---------- 作答（题目、计时、交卷） ----------
   * 这一段只负责"把服务端给的题目搬到界面上、把用户的选择送回去"。
   * 判分、计时、胜负、写学习记录**全部在服务端**（server/community/index.js）：
   *   GET  /api/community/challenge?id=   → detail=true 时，只有"我已开始未交卷"才带 questions
   *   POST /api/community/challenge/start → 写 sessions[uid].startedAt（也是建房条件）
   *   POST /api/community/challenge/submit→ 传 answers，回 score/elapsedMs
   * 这里**不**自己算分、不自己计时，避免出现"界面说对、服务端说错"的第二套真相。
   *
   * detail 的形状（服务端 summary 的投影）：
   *   { topic, count, status, mine:{startedAt,finishedAt,score,elapsedMs},
   *     opponent:{submitted,score?,elapsedMs?}, maxMinutes, questions?, review?, winner? }
   */

  const authHeaders = () => {
    const s = session();
    return s.state === 'cloud' ? { Authorization: 'Bearer ' + s.token } : null;
  };

  async function callApi(path, options = {}) {
    const headers = authHeaders();
    if (!headers) return { ok: false, error: '未登录云端账号' };
    try {
      const response = await fetch(apiBase() + '/api/community/' + path, {
        credentials: 'omit',
        ...options,
        headers: { 'Content-Type': 'application/json', ...headers, ...(options.headers || {}) },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.ok === false) return { ok: false, error: body.error || ('请求失败（' + response.status + '）') };
      return { ok: true, ...body };
    } catch (error) {
      return { ok: false, error: (error && error.message) || '网络异常' };
    }
  }

  /** 拉当前挑战的详情（题目只在"我已开始且未交卷"时才有）。 */
  async function fetchDetail(id) {
    const target = id || challenge;
    if (!target) return null;
    const result = await callApi('challenge?id=' + encodeURIComponent(target));
    if (!result.ok) return null;
    detail = result.challenge || null;
    emit();
    return detail;
  }

  /** 开始计时。坐到作答位上就等于「开始作答」，服务端据此建房/发题。 */
  async function start(id) {
    const target = id || challenge;
    if (!target) return { ok: false, error: '还没有进行中的挑战' };
    const result = await callApi('challenge/start', { method: 'POST', body: JSON.stringify({ id: target }) });
    if (!result.ok) return result;
    detail = result.challenge || detail;
    emit();
    return { ok: true, challenge: detail };
  }

  /** 交卷。answers 是 { [qid]: 'A' } 这样的映射；分数由服务端算，这里只把它读回来。 */
  async function submit(answers) {
    const target = challenge;
    if (!target) return { ok: false, error: '还没有进行中的挑战' };
    if (!detail?.questions?.length) return { ok: false, error: '题目还没拿到，请稍等' };
    const result = await callApi('challenge/submit', { method: 'POST', body: JSON.stringify({ id: target, answers: answers || {} }) });
    if (!result.ok) return result;
    detail = result.challenge || detail;
    /* 交卷动作同步给对面：他只该看到「你已经交了」，看不到分数——分数要等两边都交。 */
    act('done');
    emit();
    return { ok: true, challenge: detail, recorded: result.recorded };
  }

  function snapshot() {
    return {
      joined,
      selfId,
      challenge,
      station,
      peer: peer ? { id: peer.id, nick: peer.nick, seat: peer.seat, act: peer.act, at: peer.at, submitted: !!submitted.get(peer.id) } : null,
      seated: [...seats.values()].map((s) => ({ nick: s.nick, station: s.station, self: s.id === selfId })),
      candidate: candidate(),
      status,
      matching,
      online: joined,
      detail,
    };
  }

  return {
    get snapshot() { return snapshot(); },
    get challenge() { return challenge; },
    get peer() { return peer; },
    get detail() { return detail; },
    /** 对手刚做了个动作（12 秒内），宿主拿它来播举手/点头 */
    get peerAct() { const p = peer; return p && p.act && Date.now() - p.at < 12000 ? p : null; },
    setMeta,
    connect,
    enter,
    match,
    leave,
    act,
    fetchDetail,
    start,
    submit,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    dispose() {
      closed = true;
      listeners.clear();
      try { leave(); } catch { }
      unbind();if(socket&&!shared){socket.removeAllListeners();socket.disconnect();}socket=null;
      joined = false;
      detail = null;
    },
  };
}
