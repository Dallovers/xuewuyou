/* 好友竞技场 · 独立页业务层
 *
 * 擂台台阶与报名处的面板不再放说明卡，直接读既有的社区接口：
 *   GET  /api/community/home                     学习搭子、待处理邀请、可选主题
 *   GET  /api/community/challenges               我的挑战列表
 *   POST /api/community/challenges               发起挑战 {to, topic}
 *   POST /api/community/challenge/start          开始计时 {id}
 *   PUT  /api/community/challenge/cancel         取消 / 婉拒 {id}
 *   PUT  /api/community/request                  接受 / 婉拒 / 取消邀请 {id, action}
 *
 * 与 js/community.js 的分工：那边是主站面板（含答题与数学排版），这边只做
 * 「读列表 + 发起 + 开始 + 处理邀请」这几个不需要排版的动作，答题和复盘一律
 * 走 #community/arena 深链回主站。这一层不缓存挑战状态，也不自己算比分——
 * 判分在服务端，本地再存一份就会出现第二个真相源。
 *
 * 依赖主站的 js/api.js（window.WG_API）。没加载时降级成说明，不伪造成功。
 */

const PREFIX = '/api/community/';

/* 状态文案与 js/community.js 的 labels 保持一致 */
const STATUS = { active: '进行中', completed: '已完成', cancelled: '已取消', expired: '已过期' };

/* 主站深链：#community/<tab> 由 js/app.js 的 init() 处理；
   落在好友竞技场这一栏，用户回去就能看到同一批挑战。 */
const MAIN = '../../../index.html';
function site(tab) { return MAIN + '#community' + (tab ? '/' + tab : ''); }

/* ---------- 会话 ---------- */

export function session() {
  const api = window.WG_API;
  if (!api) return { state: 'no-bridge', user: null };
  const user = api.getUser();
  if (!api.isLoggedIn()) return { state: 'guest', user: user };
  /* local.* token 是后端不可达时降级产生的，没有云端，挑战发不出去 */
  if (!api.isCloudSession()) return { state: 'local', user: user };
  return { state: 'cloud', user: user };
}

async function call(method, path, body) {
  const api = window.WG_API;
  if (!api) throw Object.assign(new Error('主站接口没有加载'), { code: 'NO_BRIDGE' });
  return api.req(method, PREFIX + path, body);
}

/* 后端错误 → 一句能读懂的话。错误码来自 js/api.js 的归一化。 */
function explain(err) {
  const code = err && err.code;
  if (code === 'NO_BRIDGE') return '这一页没加载主站接口，请从主站入口重新进来。';
  if (code === 'STATIC_ONLY') return '当前是纯静态托管，云端服务没接上，挑战和搭子都读不到。';
  if (code === 'COLD_START_TIMEOUT' || code === 'NET_UNREACHABLE') return '连不上后端：服务可能正在从休眠里唤醒，过一会儿再试。';
  if (code === 'AUTH_FAILED' || (err && err.status === 401)) return '登录状态已过期，请回主站重新登录。';
  if (code === 'BAD_RESPONSE') return '后端返回了看不懂的东西，稍后再试。';
  return (err && err.message) || '请求失败，稍后再试。';
}

/* ---------- DOM 小工具 ---------- */

function el(parent, tag, text, cls) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (cls) node.className = cls;
  if (parent) parent.appendChild(node);
  return node;
}

function button(parent, label, onClick, primary) {
  const b = el(parent, 'button', label, primary ? 'biz-btn primary' : 'biz-btn');
  b.type = 'button';
  b.onclick = onClick;
  return b;
}

function link(parent, label, href, primary) {
  const a = el(parent, 'a', label, primary ? 'biz-btn primary' : 'biz-btn');
  a.href = href;
  return a;
}

function select(parent, label, items, preset) {
  const wrap = el(parent, 'label', null, 'biz-field');
  el(wrap, 'span', label, 'biz-label');
  const sel = el(wrap, 'select');
  items.forEach(function (it) {
    const o = el(sel, 'option', it.label);
    o.value = it.value;
  });
  if (preset && items.some(function (i) { return i.value === preset; })) sel.value = preset;
  return sel;
}

/* ---------- 面板 ---------- */

export function createPanels(refs) {
  const titleEl = refs.titleEl;
  const subEl = refs.subEl;
  const bodyEl = refs.bodyEl;
  const toast = refs.toast;

  function head(title, sub) {
    titleEl.textContent = title;
    subEl.textContent = sub || '';
  }

  function identity(parent, s) {
    const row = el(parent, 'p', null, 'biz-identity');
    const nick = (s.user && s.user.nick) || '同学';
    el(row, 'span', nick.slice(0, 1), 'biz-avatar');
    el(row, 'span', nick, 'biz-who');
    el(row, 'span', '云端已连接', 'biz-pill is-ok');
  }

  /* 没登录 / 本地账号：说清楚缺什么，给一条能走的路，不假装有数据 */
  function gate(parent, s) {
    const box = el(parent, 'div', null, 'biz');
    if (s.state === 'no-bridge') {
      el(box, 'p', '这一页没加载主站接口，读不到挑战和搭子。', 'biz-empty');
    } else if (s.state === 'guest') {
      el(box, 'p', '这个浏览器里还没有登录态。好友挑战要先有账号，才能找到搭子。', 'biz-empty');
    } else {
      el(box, 'p', '当前是本地账号（' + ((s.user && s.user.nick) || '同学') + '），云端没连上，挑战读不到也发不出。', 'biz-empty');
    }
    link(box, s.state === 'guest' ? '去主站登录' : '去主站连接云端', site('arena'), true);
    el(box, 'div', '主站登录后回到这里，站在擂台台阶前按 E 就能直接发起挑战。', 'dialog-note');
  }

  function failure(parent, err, retry) {
    const box = el(parent, 'div', null, 'biz-error');
    el(box, 'strong', '没能读到数据');
    el(box, 'p', explain(err), 'biz-meta');
    button(box, '重试', function () { return retry(); }, true);
    console.error('[arena] 业务接口失败', err);
  }

  /* ---------- 擂台：挑战列表 + 发起 ---------- */

  async function ring(opts) {
    opts = opts || {};
    head('擂台 · 好友挑战', '擂台台阶 → 真实好友挑战');
    bodyEl.replaceChildren();
    const s = session();
    if (s.state !== 'cloud') { gate(bodyEl, s); return; }

    const box = el(bodyEl, 'div', null, 'biz');
    const wait = el(box, 'p', '正在读取挑战与学习搭子…', 'biz-wait');

    let home, data;
    try {
      const both = await Promise.all([call('GET', 'home'), call('GET', 'challenges')]);
      home = both[0];
      data = both[1];
    } catch (err) {
      wait.remove();
      failure(box, err, function () { return ring(opts); });
      return;
    }
    wait.remove();

    const friends = home.friends || [];
    const challenges = data.challenges || [];
    head('擂台 · 好友挑战', '擂台台阶 → ' + friends.length + ' 位搭子 · ' + challenges.length + ' 场挑战');
    identity(box, s);
    form(box, home, opts.friendId);
    list(box, home, challenges);
    el(box, 'div',
      '判分在服务端：五道客观题、每人限时 15 分钟，先比正确题数再比用时。'
      + '答题和复盘要排数学式子，仍由主站承担——这里的「在主站继续」会直接落在好友竞技场那一栏。',
      'dialog-note');
  }

  function form(parent, home, presetFriend) {
    const f = el(parent, 'form', null, 'biz-form');
    f.id = 'arenaChallengeForm';
    el(f, 'h3', '发起挑战');

    const friends = home.friends || [];
    if (!friends.length) {
      el(f, 'p', '还没有学习搭子。挑战的前提是先有人可打。', 'biz-empty');
      link(f, '去主站搭子广场找人', site('friends'), true);
      return;
    }
    const topics = (home.topics || []).map(function (t) {
      return { label: t.topic + ' · ' + t.count + ' 道客观题', value: t.topic };
    });
    if (!topics.length) {
      el(f, 'p', '题库里还没有可挑战的客观题主题。', 'biz-empty');
      return;
    }

    const row = el(f, 'div', null, 'biz-row');
    const friend = select(row, '学习搭子', friends.map(function (p) {
      return { label: p.nick, value: p.id };
    }), presetFriend);
    const topic = select(row, '挑战主题', topics);
    const submit = el(row, 'button', '发送挑战', 'biz-btn primary');
    submit.type = 'submit';

    f.onsubmit = async function (e) {
      e.preventDefault();
      if (!friend.value || !topic.value) { toast('先选搭子和主题。'); return; }
      submit.disabled = true;
      submit.textContent = '发送中…';
      try {
        await call('POST', 'challenges', { to: friend.value, topic: topic.value });
        toast('挑战已发送，等搭子确认。');
        await ring({ friendId: friend.value });
      } catch (err) {
        submit.disabled = false;
        submit.textContent = '发送挑战';
        toast(explain(err));
      }
    };
  }

  function list(parent, home, challenges) {
    const box = el(parent, 'section', null, 'biz-section');
    el(box, 'h3', '我的挑战 · ' + challenges.length);
    if (!challenges.length) {
      el(box, 'p', '还没有挑战。上面选个搭子发起第一场。', 'biz-empty');
      return;
    }
    challenges.forEach(function (c) { card(box, home, c); });
  }

  function card(parent, home, c) {
    const item = el(parent, 'article', null, 'biz-card');
    const top = el(item, 'div', null, 'biz-card-head');
    el(top, 'strong', c.topic + ' · ' + ((c.peer && c.peer.nick) || '搭子'));
    el(top, 'span', STATUS[c.status] || c.status, 'biz-pill is-' + (c.status || 'unknown'));

    const mine = c.mine || {};
    const opp = c.opponent || {};
    el(item, 'p',
      '你' + (mine.finishedAt ? '已交卷（答对 ' + mine.score + '/5）' : '尚未交卷')
      + ' · 搭子' + (opp.submitted ? '已交卷' : '尚未交卷'),
      'biz-meta');

    const acts = el(item, 'div', null, 'biz-actions');
    /* 列表接口不保证带 creator：拿不到就按「发起人」处理，按钮文案随之切换 */
    const isCreator = !c.creator || c.creator === home.uid;

    if (c.status === 'active' && !mine.finishedAt) {
      if (!mine.startedAt) {
        button(acts, '开始挑战', function () { return start(c.id); }, true);
      } else {
        el(acts, 'span', '已开始计时 · 回主站作答', 'biz-meta');
      }
    }
    link(acts, c.status === 'completed' ? '去主站看复盘' : '在主站继续', site('arena'));
    if (c.status === 'active') {
      button(acts, isCreator ? '取消挑战' : '婉拒挑战', function () { return cancel(c.id); });
    }
  }

  async function start(id) {
    try {
      await call('POST', 'challenge/start', { id: id });
      toast('已开始作答 · 到擂台的甲/乙位就位，对面那位会和你同场 15 分钟。');
      await ring({});
    } catch (err) {
      toast(explain(err));
    }
  }

  async function cancel(id) {
    if (!window.confirm('取消这场挑战？取消后要重新发起。')) return;
    try {
      await call('PUT', 'challenge/cancel', { id: id });
      toast('这场挑战已取消。');
      await ring({});
    } catch (err) {
      toast(explain(err));
    }
  }

  /* ---------- 报名处：搭子簿 + 邀请 ---------- */

  async function roster() {
    head('报名处 · 搭子簿', '报名处 → 真实学习搭子与邀请');
    bodyEl.replaceChildren();
    const s = session();
    if (s.state !== 'cloud') { gate(bodyEl, s); return; }

    const box = el(bodyEl, 'div', null, 'biz');
    const wait = el(box, 'p', '正在读取搭子簿…', 'biz-wait');
    let home;
    try {
      home = await call('GET', 'home');
    } catch (err) {
      wait.remove();
      failure(box, err, function () { return roster(); });
      return;
    }
    wait.remove();

    const friends = home.friends || [];
    const requests = home.requests || [];
    head('报名处 · 搭子簿', '报名处 → ' + friends.length + ' 位搭子 · ' + requests.length + ' 条待处理');
    identity(box, s);

    const reqBox = el(box, 'section', null, 'biz-section');
    el(reqBox, 'h3', '待处理邀请 · ' + requests.length);
    if (!requests.length) el(reqBox, 'p', '没有待处理的邀请。', 'biz-empty');
    requests.forEach(function (r) {
      const item = el(reqBox, 'article', null, 'biz-card');
      const incoming = r.to === home.uid;
      const top = el(item, 'div', null, 'biz-card-head');
      el(top, 'strong', r.person.nick);
      el(top, 'span', incoming ? '邀请你成为搭子' : '等待对方确认', 'biz-pill is-active');
      el(item, 'p', r.message || '一起学习', 'biz-meta');
      const acts = el(item, 'div', null, 'biz-actions');
      if (incoming) {
        button(acts, '接受', function () { return answer(r.id, 'accept'); }, true);
        button(acts, '婉拒', function () { return answer(r.id, 'reject'); });
      } else {
        button(acts, '取消邀请', function () { return answer(r.id, 'cancel'); });
      }
    });

    const friendBox = el(box, 'section', null, 'biz-section');
    el(friendBox, 'h3', '我的学习搭子 · ' + friends.length);
    if (!friends.length) {
      el(friendBox, 'p', '还没有学习搭子。', 'biz-empty');
      link(friendBox, '去主站搭子广场找人', site('friends'), true);
    }
    friends.forEach(function (p) {
      const item = el(friendBox, 'article', null, 'biz-person');
      const line = el(item, 'div', null, 'biz-person-head');
      el(line, 'span', p.nick.slice(0, 1), 'biz-avatar');
      const info = el(line, 'div');
      el(info, 'strong', p.nick);
      el(info, 'span', p.online ? '当前在线' : '当前离线', 'biz-meta');
      if (p.goal) el(item, 'p', p.goal, 'biz-meta');
      if (p.subjects && p.subjects.length) {
        const tags = el(item, 'div', null, 'biz-tags');
        p.subjects.forEach(function (sub) { el(tags, 'span', sub); });
      }
      const acts = el(item, 'div', null, 'biz-actions');
      /* 真实联动：直接切到擂台面板并预选这个人，不用回主站开会话 */
      button(acts, '发起挑战', function () { return ring({ friendId: p.id }); }, true);
    });

    el(box, 'div',
      '这里只处理既有的搭子关系：接受或婉拒邀请、取消自己发出的邀请、从搭子直接发起挑战。'
      + '想找新搭子得先把名片公开，那是主站搭子广场的事。',
      'dialog-note');
  }

  async function answer(id, action) {
    const done = { accept: '已接受', reject: '已婉拒', cancel: '已取消邀请' }[action] || '已处理';
    try {
      await call('PUT', 'request', { id: id, action: action });
      toast(done + '。');
      await roster();
    } catch (err) {
      toast(explain(err));
    }
  }

  return { ring: ring, roster: roster };
}
