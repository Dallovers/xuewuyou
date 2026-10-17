/* ============ 学无忧 · 断点续学客户端（A02） ============
 * 契约见 docs/team/practice-session-contract.md，服务端在 server/practice/index.js。
 *
 * 本模块只负责「逻辑」：创建/恢复会话、保存位置与草稿、409 冲突、切账号清理。
 * 界面入口与状态展示按 docs/team/README.md 的协作规约属于 B，B 直接调用这里的方法即可。
 *
 * 三条约束：
 *   1. 未登录或纯静态托管时整体降级为不可用，不发起任何请求。
 *   2. 草稿与位置只走 /api/practice/session，绝不调用作答记录接口，因此不会重复计分。
 *   3. 创建请求带持久化的 clientRequestId，重试与刷新都不会重复建档。
 */
'use strict';

var WG_Practice = (function () {
  var KEY = 'xwy_practice_state';     // { sessionId, createId }
  var SAVE_DELAY = 1200;              // 位置/草稿保存节流
  var MAX_RETRY_ON_CONFLICT = 1;

  var session = null;                 // 当前活动会话（服务端视图 + version）
  var createId = null;                // 幂等键，持久化以便刷新后复用
  var dirty = null;                   // 待保存的增量
  var timer = null;
  var inflight = null;
  var listeners = [];
  var lastToken = null;

  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lss(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsr(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function state() {
    try { return JSON.parse(ls(KEY) || '{}'); } catch (e) { return {}; }
  }
  function setState(v) { lss(KEY, JSON.stringify(v || {})); }

  function token() {
    return (typeof WG_API !== 'undefined' && WG_API.getToken) ? (WG_API.getToken() || '') : '';
  }
  function available() {
    if (typeof WG_API === 'undefined' || !WG_API.isCloudSession) return false;
    try { return !!WG_API.isCloudSession(); } catch (e) { return false; }
  }

  function emit(evt, data) {
    listeners.forEach(function (fn) { try { fn(evt, data); } catch (e) {} });
  }
  function onChange(fn) {
    listeners.push(fn);
    return function off() { var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
  }

  function call(method, path, body) {
    return WG_API.req(method, '/api/practice/session' + path, body);
  }

  function emptyDirty() { return { index: null, drafts: {}, submitted: [] }; }
  function ensureDirty() { if (!dirty) dirty = emptyDirty(); return dirty; }

  /* 账号切换 / 退出登录：丢掉本地缓存，避免把上一个账号的进度喂给下一个 */
  function syncAccount() {
    var t = token();
    if (lastToken !== null && t !== lastToken) clear();
    lastToken = t;
  }

  function clear() {
    session = null;
    dirty = null;
    if (timer) { clearTimeout(timer); timer = null; }
    lsr(KEY);
  }

  /* 幂等键：同一份练习在刷新、重试后仍复用同一个 clientRequestId */
  function requestId(scope) {
    var st = state();
    if (st.createId && st.createScope === scope) { createId = st.createId; return createId; }
    var id = 'xwy-' + (scope || 'default') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    createId = id;
    setState(Object.assign({}, st, { createId: id, createScope: scope }));
    return id;
  }

  function remember() {
    var st = state();
    setState(Object.assign({}, st, { sessionId: session ? session.id : null }));
  }

  /* 创建会话；已有同题序的进行中会话时优先复用，避免重复建档 */
  async function create(opts) {
    opts = opts || {};
    if (!available()) return null;
    syncAccount();
    if (session && session.status === 'active') return session;
    var qids = opts.qids || [];
    if (!qids.length) return null;
    var scope = String(opts.topic || opts.moduleId || qids[0]).slice(0, 40);
    var body = {
      clientRequestId: requestId(scope),
      qids: qids,
      moduleId: opts.moduleId || null,
      topic: opts.topic || null
    };
    var res = await call('POST', '', body);
    session = res.session;
    dirty = emptyDirty();
    remember();
    emit('created', session);
    return session;
  }

  /* 恢复：优先取最近更新的进行中会话 */
  async function restore() {
    if (!available()) return null;
    syncAccount();
    var res = await call('GET', '');
    session = res.session || null;
    dirty = emptyDirty();
    remember();
    if (session) emit('restored', session);
    return session;
  }

  async function load(id) {
    if (!available() || !id) return null;
    syncAccount();
    var res = await call('GET', '?id=' + encodeURIComponent(id));
    session = res.session || null;
    dirty = emptyDirty();
    remember();
    return session;
  }

  function current() { return session; }

  /* 本地增量 —— 不产生任何请求，也不会写入作答记录 */
  function markSubmitted(qid) {
    if (qid == null || !session) return;
    var d = ensureDirty(), q = String(qid);
    if (d.submitted.indexOf(q) < 0) d.submitted.push(q);
  }
  function setDraft(qid, draft) {
    if (qid == null || !session) return;
    ensureDirty().drafts[String(qid)] = draft || {};
  }
  function setIndex(i) {
    if (!session || typeof i !== 'number') return;
    ensureDirty().index = i;
  }

  /* 与服务端已有草稿合并：本次操作过的键以本地为准，其余保留服务端值 */
  function mergedDrafts(base, local) {
    var out = Object.assign({}, base || {});
    Object.keys(local || {}).forEach(function (k) { out[k] = local[k]; });
    return out;
  }

  async function putOnce(patch) {
    var res = await call('PUT', '', {
      id: session.id,
      expectedVersion: session.version,
      currentIndex: patch.index,
      drafts: patch.drafts,
      submittedQids: patch.submitted
    });
    session = res.session;
    remember();
    return { session: session };
  }

  /* 保存：409 时重新拉取最新版本，合并后再试一次；仍冲突就交给调用方提示 */
  async function save(patch) {
    if (!available() || !session) return null;
    syncAccount();
    var d = ensureDirty();
    var body = {
      index: patch && patch.index !== undefined ? patch.index : d.index,
      drafts: mergedDrafts(session.drafts, d.drafts),
      submitted: d.submitted.slice()
    };
    if (body.drafts && !Object.keys(body.drafts).length) body.drafts = undefined;
    if (!body.submitted.length) body.submitted = undefined;

    for (var attempt = 0; attempt <= MAX_RETRY_ON_CONFLICT; attempt++) {
      try {
        var ok = await putOnce(body);
        dirty = emptyDirty();
        emit('saved', ok.session);
        return ok;
      } catch (e) {
        if (e.code !== 'VERSION_CONFLICT' || attempt >= MAX_RETRY_ON_CONFLICT) {
          if (e.code === 'VERSION_CONFLICT') {
            emit('conflict', e);
            return { session: session, conflict: true };
          }
          throw e;
        }
        var latest = await load(session.id);
        if (!latest) { emit('conflict', e); return { session: null, conflict: true }; }
        body = {
          index: body.index,
          drafts: mergedDrafts(latest.drafts, d.drafts),
          submitted: d.submitted.slice()
        };
        emit('conflict', { recovered: true, session: latest });
      }
    }
    return { session: session, conflict: true };
  }

  /* 节流保存：位置变化频繁时只保留最后一次 */
  function scheduleSave(patch) {
    if (!available() || !session) return;
    var d = ensureDirty();
    if (patch) {
      if (patch.index !== undefined) d.index = patch.index;
      if (patch.drafts) Object.keys(patch.drafts).forEach(function (k) { d.drafts[k] = patch.drafts[k]; });
      if (patch.submitted) patch.submitted.forEach(markSubmitted);
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { timer = null; flush().catch(function () {}); }, SAVE_DELAY);
  }

  function flush() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!available() || !session) return Promise.resolve(null);
    if (inflight) return inflight;
    inflight = save().then(function (r) { inflight = null; return r; }, function (e) { inflight = null; throw e; });
    return inflight;
  }

  async function finish(status) {
    if (!available() || !session) return null;
    if (timer) { clearTimeout(timer); timer = null; }
    try { await flush(); } catch (e) {}
    var res = await call('POST', '/finish', { id: session.id, status: status || 'finished' });
    session = res.session;
    dirty = null;
    lsr(KEY);
    emit('finished', session);
    return session;
  }

  /* 账号变化时自动清理（登录/退出都会触发 WG_API.onAuthChange） */
  if (typeof WG_API !== 'undefined' && WG_API.onAuthChange) {
    WG_API.onAuthChange(function () { syncAccount(); });
  }
  lastToken = token();

  return {
    available: available,
    create: create,
    restore: restore,
    load: load,
    current: current,
    save: save,
    scheduleSave: scheduleSave,
    flush: flush,
    finish: finish,
    markSubmitted: markSubmitted,
    setDraft: setDraft,
    setIndex: setIndex,
    clear: clear,
    onChange: onChange,
    _config: function (c) { if (c && c.saveDelay != null) SAVE_DELAY = c.saveDelay; }
  };
})();
