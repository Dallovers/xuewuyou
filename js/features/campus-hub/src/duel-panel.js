/* 擂台作答面板（第十六轮）—— 坐在台上就能看题、答题、交卷。
 *
 * 边界先说清楚，否则很容易长出第二套真相：
 *   题目、判分、计时、胜负  →  全部在服务端（server/community/index.js）
 *   这个文件只做三件事：把服务端给的题目画出来、把用户选了什么送回去、把服务端的结果显示出来。
 * 它**不**自己算分、不自己判对错、不自己决定谁赢。本地唯一"算"的是倒计时显示
 * （用服务端给的 startedAt 和 maxMinutes 反推剩余时间，只是把秒数画成 mm:ss）。
 *
 * 为什么要有这个面板：第十五轮做到了"两个真人站在同一个擂台上、能互相看见、
 * 能同步举手"，但真正答题还得回主站——台上两个人只是站着。这一轮把最后一段接上。
 *
 * 几个必须遵守的服务端约定（探测时踩过）：
 *   - questions 只在「我已 start 且未交卷」时由 GET /challenge?id= 返回；
 *   - answers 的值必须是 'A'/'B'/'C'/'D' 这样的**字母**，传选项原文会被服务端判 ok:false；
 *   - 交卷只能一次（第二次返回 recorded:0），所以交卷前要有二次确认；
 *   - review（含正确答案）要两边都交完才出现，交完自己的那份只该看到「等待对方」。
 */

const KATEX = {
  css: '../../../vendor/katex/katex.min.css',
  js: '../../../vendor/katex/katex.min.js',
  auto: '../../../vendor/katex/contrib/auto-render.min.js',
};
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/* KaTeX 按需加载：只在真的要显示题目时拉一次。
 * 和 duel.js 延迟加载 socket.io 是同一套思路——答题面板不该拖慢校园首屏。 */
let mathReady = null;
function loadMath() {
  if (window.renderMathInElement) return Promise.resolve(true);
  if (mathReady) return mathReady;
  const url = (path) => new URL(path, document.baseURI).href;
  mathReady = new Promise((resolve) => {
    if (!document.querySelector('link[data-katex]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url(KATEX.css);
      link.dataset.katex = '1';
      document.head.append(link);
    }
    const script = (src, onload) => {
      const node = document.createElement('script');
      node.src = src;
      node.onload = onload;
      node.onerror = () => resolve(false);
      document.head.append(node);
    };
    script(url(KATEX.js), () => script(url(KATEX.auto), () => resolve(!!window.renderMathInElement)));
  });
  return mathReady;
}

function typeset(node) {
  /* 第一帧往往比 KaTeX 到得早：这时不能"渲染失败就算了"，得等它到了再补一次，
   * 否则公式会以源码形式一直留在面板上（小题的那种 \\(- 1 < \\alpha < 3\\) 全裸）。 */
  if (!window.renderMathInElement) {
    loadMath().then((ready) => { if (ready && node.isConnected) typeset(node); });
    return;
  }
  try {
    window.renderMathInElement(node, {
      delimiters: [
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '$$', right: '$$', display: true },
      ],
      throwOnError: false,
      trust: false,
      strict: 'ignore',
    });
  } catch { /* 公式渲染失败只该退化成源码，不该让整块面板崩掉 */ }
}

const clock = (ms) => {
  if (!Number.isFinite(ms) || ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
};

/**
 * @param {object} options
 * @param {() => object|null} options.duel          duel.js 的实例
 * @param {() => void} options.onStand              面板里按 Esc / 点「下台」时回调宿主起身
 * @param {(text:string)=>void} options.toast
 */
export function createDuelPanel({ duel, onStand, toast } = {}) {
  const el = document.createElement('section');
  el.id = 'duel-panel';
  el.hidden = true;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'false');
  el.setAttribute('aria-label', '擂台作答');
  el.innerHTML = `
    <header class="duel-head">
      <div class="duel-head-main">
        <span class="duel-eyebrow">擂台作答</span>
        <strong class="duel-topic" data-field="topic">—</strong>
      </div>
      <div class="duel-head-meta">
        <span class="duel-timer" data-field="timer" role="timer">--:--</span>
        <span class="duel-rival" data-field="rival">等待就位</span>
      </div>
    </header>
    <div class="duel-scroll">
      <p class="duel-loading" data-field="loading">正在取题…</p>
      <div class="duel-outcome" data-field="outcome" hidden></div>
      <ol class="duel-list" data-field="list"></ol>
    </div>
    <footer class="duel-foot">
      <span class="duel-count" data-field="count">已答 0 / 0</span>
      <div class="duel-actions">
        <button type="button" class="duel-leave" data-field="leave">下台</button>
        <button type="button" class="duel-submit" data-field="submit" disabled>交卷</button>
      </div>
    </footer>`;
  document.body.append(el);

  const field = (name) => el.querySelector(`[data-field="${name}"]`);
  const listEl = field('list');
  const outcomeEl = field('outcome');
  const submitEl = field('submit');
  const leaveEl = field('leave');
  const countEl = field('count');
  const timerEl = field('timer');
  const rivalEl = field('rival');
  const topicEl = field('topic');
  const loadingEl = field('loading');

  /** id → 选中的字母。只存选择本身，不存对错——对错要等服务端说。 */
  let picks = new Map();
  let questions = [];
  /* 上一份卷面。服务端在「我已交卷、对面还没交」时既不给 questions 也不给 review
     （review 要双方都交完才出现），没有这份缓存就会在等对面时把卷面清空。 */
  let lastQuestions = [];
  /** id → review 条目（含正确答案），只有双方都交完才有 */
  let marks = new Map();
  let phase = 'idle';        // idle | loading | answering | submitting | waiting | done
  let confirmUntil = 0;      // 交卷二次确认的截止时间
  let deadline = 0;          // 服务端 startedAt + maxMinutes
  let ticker = 0;
  /* 对面从「没交」变成「交了」只该触发一次补拉：emit→fetch→emit 会自激成死循环。 */
  let seenRivalSubmitted = false;

  const isOpen = () => !el.hidden;

  function setPhase(next) {
    phase = next;
    el.dataset.phase = next;
    const answering = next === 'answering';
    submitEl.disabled = !answering || picks.size === 0;
    /* 「下台」任何时候都要在：结果页想走也只能靠它（Esc 不是所有人都知道）。
       交卷按钮按相位换文案，别让已交完的人看到一个还能点的「交卷」。 */
    leaveEl.hidden = false;
    if (next === 'waiting' || next === 'done') submitEl.textContent = '已交卷';
    else if (next === 'answering' && submitEl.textContent !== '确认交卷') submitEl.textContent = '交卷';
    el.classList.toggle('is-locked', !answering);
  }

  function renderQuestions() {
    listEl.replaceChildren();
    if (!questions.length) {
      loadingEl.hidden = false;
      loadingEl.textContent = phase === 'loading' ? '正在取题…'
        : phase === 'waiting' || phase === 'done' ? '你的卷已经交了，等对面那位交完就能看到结果'
        : '这一场还没有可以作答的题目';
      return;
    }
    loadingEl.hidden = true;
    questions.forEach((question, index) => {
      const item = document.createElement('li');
      item.className = 'duel-q';
      item.dataset.qid = question.qid;
      /* marks 只在双方都交完后由服务端 review 给出：没交完就不该有任何对错标记。 */
      const mark = marks.get(question.qid) || null;
      if (mark) item.dataset.judged = mark.correct ? 'right' : 'wrong';

      const stem = document.createElement('p');
      stem.className = 'duel-stem';
      const number = document.createElement('span');
      number.className = 'duel-index';
      number.textContent = String(index + 1);
      stem.append(number, document.createTextNode(question.question || ''));
      if (mark) {
        const verdict = document.createElement('i');
        verdict.className = 'duel-verdict';
        verdict.textContent = mark.correct ? '答对' : '答错';
        stem.append(verdict);
      }
      item.append(stem);

      const options = document.createElement('div');
      options.className = 'duel-options';
      (question.options || []).forEach((text, i) => {
        const letter = LETTERS[i] || String(i + 1);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'duel-option';
        button.dataset.pick = letter;
        button.setAttribute('aria-pressed', 'false');
        /* 只有 review 到手才标注：正解标绿、自己选错的那个标红 */
        if (mark && letter === mark.answer) button.classList.add('is-right');
        else if (mark && letter === mark.yours) button.classList.add('is-wrong');
        const tag = document.createElement('b');
        tag.textContent = letter;
        button.append(tag, document.createTextNode(text));
        button.onclick = () => pick(question.qid, letter);
        options.append(button);
      });
      item.append(options);
      listEl.append(item);
    });
    typeset(listEl);
  }

  function paintPicks() {
    for (const item of listEl.children) {
      const chosen = picks.get(item.dataset.qid) || null;
      for (const button of item.querySelectorAll('.duel-option')) {
        const on = button.dataset.pick === chosen;
        button.setAttribute('aria-pressed', String(on));
        button.classList.toggle('is-picked', on);
      }
    }
    countEl.textContent = `已答 ${picks.size} / ${questions.length}`;
    submitEl.disabled = phase !== 'answering' || picks.size === 0;
  }

  function pick(qid, letter) {
    if (phase !== 'answering') return;
    picks.set(qid, letter);
    paintPicks();
    /* 全部选完自动把焦点送到交卷按钮上，键盘用户不用摸鼠标 */
    if (picks.size === questions.length) submitEl.focus({ preventScroll: true });
  }

  function paintClock() {
    if (!deadline) { timerEl.textContent = '--:--'; return; }
    const left = deadline - Date.now();
    timerEl.textContent = clock(left);
    timerEl.classList.toggle('is-late', left <= 60_000 && left > 0);
    timerEl.classList.toggle('is-over', left <= 0);
  }

  function startTicker() {
    stopTicker();
    paintClock();
    ticker = setInterval(paintClock, 1000);
  }
  function stopTicker() {
    if (ticker) { clearInterval(ticker); ticker = 0; }
  }

  /* 对手状态：只说"在不在、交没交、交完多少分"，讲清即可，不替对面宣布输赢。 */
  function paintRival(detail, peer) {
    const nickname = peer?.nick || '对面';
    if (!peer) { rivalEl.textContent = '对面还没人就位'; rivalEl.dataset.state = 'empty'; return; }
    if (detail?.status === 'completed') {
      const other = detail.opponent || {};
      rivalEl.textContent = `${nickname} · ${other.score ?? 0} 分`;
      rivalEl.dataset.state = 'done';
      return;
    }
    const submitted = peer?.submitted ?? !!detail?.opponent?.submitted;
    rivalEl.textContent = submitted ? `${nickname} · 已交卷` : `${nickname} · 作答中`;
    rivalEl.dataset.state = submitted ? 'submitted' : 'answering';
  }

  function paintOutcome(detail) {
    const completed = detail?.status === 'completed';
    if (!completed) {
      if (phase === 'waiting') {
        outcomeEl.hidden = false;
        outcomeEl.textContent = '已交卷 · 等对面那位交完就能看到结果';
      } else {
        outcomeEl.hidden = true;
        outcomeEl.textContent = '';
      }
      return;
    }
    const mine = detail.mine || {};
    const other = detail.opponent || {};
    const verdict = detail.winner === null ? '平局' : detail.winner === undefined ? '已结束' : '已分胜负';
    outcomeEl.hidden = false;
    outcomeEl.textContent = `本场结束 · 你 ${mine.score ?? 0} 分（${clock(mine.elapsedMs)}）· 对面 ${other.score ?? 0} 分 · ${verdict}`;
  }

  /**
   * 用服务端返回的 detail 刷新整块面板。
   * detail 是唯一输入：这里不读 picks 以外任何本地状态。
   */
  function apply(detail, peer) {
    if (!detail || el.hidden) return;

    topicEl.textContent = detail.topic || '擂台作答';
    const fresh = Array.isArray(detail.questions) ? detail.questions : [];
    const review = Array.isArray(detail.review) ? detail.review : [];
    if (fresh.length) questions = fresh;
    else if (review.length) questions = review.map((r) => ({ qid: r.qid, question: r.question, options: r.options || [] }));
    /* 交完自己那份、对面还没交：服务端这时既不给 questions 也不给 review。
       卷面不能因此变空——留着刚才那份，让人看得到自己选了什么，只是锁住不能改。 */
    else if (detail.mine?.finishedAt && lastQuestions.length) questions = lastQuestions;
    else questions = [];
    if (questions.length) lastQuestions = questions;
    marks = review.length ? new Map(review.map((r) => [r.qid, r])) : new Map();

    if (detail.mine?.finishedAt) {
      setPhase(detail.status === 'completed' ? 'done' : 'waiting');
      deadline = 0;
      stopTicker();
      timerEl.textContent = clock(detail.mine.elapsedMs);
    } else if (questions.length) {
      if (phase !== 'answering') setPhase('answering');
      const startedAt = detail.mine?.startedAt || 0;
      const minutes = Number(detail.maxMinutes) || 15;
      deadline = startedAt ? startedAt + minutes * 60_000 : 0;
      startTicker();
    } else if (phase !== 'loading') {
      setPhase('loading');
    }

    renderQuestions();
    paintPicks();
    paintRival(detail, peer);
    paintOutcome(detail);
  }

  async function refresh() {
    if (!duel) return;
    const detail = await duel.fetchDetail();
    if (detail) apply(detail, duel.peer);
  }

  /** 打开面板：坐到作答位上时由宿主调用。 */
  async function open() {
    el.hidden = false;
    setPhase('loading');
    picks = new Map();
    questions = [];
    lastQuestions = [];
    marks = new Map();
    seenRivalSubmitted = false;
    renderQuestions();
    paintPicks();
    const peer = duel?.peer || null;
    topicEl.textContent = '擂台作答';
    rivalEl.textContent = peer ? `${peer.nick} · 作答中` : '对面还没人就位';
    el.querySelector('.duel-scroll').scrollTop = 0;

    /* 题目只在「我已开始且未交卷」时才有：没开始就先告诉服务端我开始 */
    const seatDetail = await duel?.fetchDetail();
    if (seatDetail && !seatDetail.mine?.startedAt) {
      const started = await duel?.start();
      if (!started?.ok) {
        loadingEl.hidden = false;
        loadingEl.textContent = started?.error || '开始作答失败，请起身重试';
        setPhase('idle');
        return;
      }
    }
    await refresh();
    /* 拉完还是没题：不是加载中，是真的没有 */
    if (phase === 'loading' && !questions.length) {
      loadingEl.hidden = false;
      loadingEl.textContent = '这一场还没有可以作答的题目';
      setPhase('idle');
    }
  }

  function close() {
    el.hidden = true;
    stopTicker();
    deadline = 0;
    confirmUntil = 0;
    phase = 'idle';
    picks = new Map();
    questions = [];
    lastQuestions = [];
    marks = new Map();
    seenRivalSubmitted = false;
    listEl.replaceChildren();
    outcomeEl.hidden = true;
  }

  async function doSubmit() {
    if (phase !== 'answering') return;
    if (!picks.size) { toast?.('还没有选，先答一题'); return; }
    if (Date.now() < confirmUntil) {
      setPhase('submitting');
      submitEl.textContent = '提交中…';
      const answers = {};
      for (const question of questions) {
        const picked = picks.get(question.qid);
        if (picked) answers[question.qid] = picked;
      }
      const result = await duel?.submit(answers);
      submitEl.textContent = '交卷';
      if (!result?.ok) {
        toast?.(result?.error || '交卷失败，请重试');
        setPhase('answering');
        return;
      }
      apply(result.challenge, duel.peer);
      toast?.(result.challenge?.status === 'completed' ? '双方都交了，结果已出。' : '已交卷，等对面交完。');
      return;
    }
    /* 第一次点：按钮变成确认态，3 秒内再点才真的交。
     * 交卷只能一次（服务端第二次返回 recorded:0），误触代价太大。 */
    confirmUntil = Date.now() + 3000;
    submitEl.textContent = '确认交卷';
    toast?.('再点一次确认交卷（交卷后不能改）');
    setTimeout(() => {
      if (phase === 'answering' && Date.now() >= confirmUntil) submitEl.textContent = '交卷';
    }, 3100);
  }

  submitEl.onclick = doSubmit;
  leaveEl.onclick = () => { onStand?.(); };

  /**
   * 处理键盘。返回 true 表示这次按键归面板，宿主不要再拿它驱动角色。
   * 由宿主的全局 keydown 调用（而不是只绑在面板上）——焦点跑到 canvas 上时
   * 面板仍然要能接住 A/B/C/D 和 Enter，否则"点了下画面再按 A 就选不了"。
   */
  function handleKey(event) {
    if (el.hidden) return false;
    if (event.code === 'Escape') { onStand?.(); return true; }
    /* E 交回宿主：底部那条操作栏写着「E 举手抢答」，答题时它也该真的能用。
       其余移动键不放行，否则人会一边答一边走开。 */
    if (event.code === 'KeyE') return false;
    if (event.code === 'Enter' || event.code === 'NumpadEnter') { doSubmit(); return true; }
    const match = /^Key([A-F])$/.exec(event.code);
    if (match && phase === 'answering') {
      /* 字母快捷键：找到第一道还没选的题，用这个字母作答 */
      const target = questions.find((question) => !picks.has(question.qid)) || questions[questions.length - 1];
      if (target) pick(target.qid, match[1]);
      return true;
    }
    /* 面板开着时，移动键/跳跃/互动一律吃掉：人锁在作答位上，不该边走边答题 */
    return true;
  }

  return {
    element: el,
    get isOpen() { return isOpen(); },
    get phase() { return phase; },
    open,
    close,
    refresh,
    handleKey,
    /**
     * duel:act / duel:state 到达时宿主叫我。
     * 只做两件事：把 socket 带来的最新对手状态画上去；对面「刚交卷」时补拉一次详情。
     * 补拉必须由状态跳变触发——sync 本身会跟着 emit 跑，无条件 fetch 就是
     * fetch → emit → sync → fetch 的自激死循环。
     */
    sync() {
      if (!isOpen() || !duel) return;
      const peer = duel.peer;
      const became = !!peer?.submitted && !seenRivalSubmitted;
      if (peer?.submitted) seenRivalSubmitted = true;
      apply(duel.detail, peer);
      if (became) refresh();
    },
    dispose() { stopTicker(); el.remove(); },
  };
}
