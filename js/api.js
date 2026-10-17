/* ============ 学无忧 · API 客户端 ============
 * 负责与后端通信：登录/注册、学习数据云同步、自习统计/设置、AI 代理。
 * 未登录时所有云功能自动降级为纯本地模式，不影响使用。
 */
'use strict';

var WG_API = (function () {
  var TOKEN_KEY = 'xwy_token';
  var USER_KEY = 'xwy_user';
  var BASE = String(window.WG_DEPLOY && window.WG_DEPLOY.apiBase || '').replace(/\/$/,'');
  if (BASE) {
    var backendUrl=new URL(BASE);
    if (backendUrl.username || backendUrl.password || backendUrl.pathname !== '/' || backendUrl.search || backendUrl.hash ||
      (backendUrl.protocol !== 'https:' && !(backendUrl.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(backendUrl.hostname)))) throw new Error('后端地址必须是 HTTPS 网站来源地址');
    BASE=backendUrl.origin;
  }
  function staticOnly() {return !!(window.WG_Runtime && WG_Runtime.staticHosting && !BASE);}

  var listeners = []; // 登录状态变化回调

  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lss(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsr(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function getToken() { return ls(TOKEN_KEY); }
  function getUser() { try { return JSON.parse(ls(USER_KEY) || 'null'); } catch (e) { return null; } }
  function isLoggedIn() { return !!getToken(); }
  /* 是否为本地账号会话（后端不可达时降级产生的 local.* token）。
     本地会话没有真正的云端，应跳过云同步提示，避免误导。 */
  function isCloudSession() {
    var t = getToken();
    return !!(!staticOnly() && t && t.indexOf('local.') !== 0);
  }

  function emit() {
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
  }
  function onAuthChange(fn) { listeners.push(fn); }

  /* ===== 请求策略（A01） =====
   * 后端在 Render 免费实例上，休眠后首次请求约需 30 秒唤醒（实测 31.07s；
   * 唤醒后 0.2~0.5s）。因此：单次超时放宽到 60 秒覆盖冷启动，但第 3 秒就
   * 给出"正在唤醒"的提示，不让用户无反馈地干等；失败一律有上限地退避重试，
   * 4xx 一律不重试；冷启动超时 / 断网 / 鉴权失败分别给出不同错误码与文案。 */
  var REQ_TIMEOUT_MS = 60000;   // 单次请求上限，须覆盖冷启动
  var WAKE_HINT_MS = 3000;      // 超过此时间未响应即提示"正在唤醒"
  var MAX_RETRIES = 3;          // 最多重试次数（不含首次）
  var RETRY_TOTAL_MS = 45000;   // 重试阶段的累计时长上限
  var RETRY_BASE_MS = 800;      // 退避基数：0.8s / 1.6s / 3.2s

  /* 状态回调：waking（正在唤醒）/ ready（已恢复）/ retrying（退避重试中）/
     unreachable（最终不可达，此时应由界面询问用户是否改用本地模式）。
     返回值 true 表示该监听者已自行处理提示，不会再落到默认 toast。 */
  var statusListeners = [];
  function onStatus(fn) {
    statusListeners.push(fn);
    return function off() { var i = statusListeners.indexOf(fn); if (i >= 0) statusListeners.splice(i, 1); };
  }
  function notify(state, detail) {
    var handled = false;
    statusListeners.forEach(function (fn) { try { if (fn(state, detail) === true) handled = true; } catch (e) {} });
    if (!handled && detail && typeof window !== 'undefined' && typeof window.toast === 'function') {
      try { window.toast(detail, ''); } catch (e) {}
    }
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* 归一化异常：区分"冷启动/请求超时"与"真正的网络不可达"，其余原样透传 */
  function toError(e) {
    if (e instanceof Error && e.status !== undefined) return e;
    var err;
    if (e && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      err = new Error('后端响应超时：服务可能正在从休眠中唤醒，请稍后重试');
      err.code = 'COLD_START_TIMEOUT';
    } else {
      err = new Error('网络连接失败：请检查网络，或确认后端服务已启动');
      err.code = 'NET_UNREACHABLE';
    }
    err.status = 0;
    return err;
  }

  /* 只重试"可能自己恢复"的失败：超时 / 断网 / 网关级错误。4xx 属确定性错误，重试无意义 */
  function isRetriable(e) {
    if (!e) return false;
    if (e.code === 'STATIC_ONLY' || e.code === 'AUTH_FAILED' ||
        e.code === 'SESSION_CHANGED' || e.code === 'BAD_REQUEST') return false;
    if (typeof e.status !== 'number') return true;
    return e.status === 0 || e.status === 502 || e.status === 503 || e.status === 504;
  }

  async function req(method, path, body, options) {
    options = options || {};
    if (staticOnly()) {
      var se = new Error('云端服务尚未连接，目前数据仅保存在本浏览器');
      se.status = 503; se.code = 'STATIC_ONLY';
      throw se;
    }
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    var opts = { method: method, headers: headers };
    if (body !== undefined) opts.body = JSON.stringify(body);

    var maxRetries = options.noRetry ? 0 : MAX_RETRIES;
    var startedAt = Date.now();
    var hinted = false;
    var attempt = 0;

    for (;;) {
      attempt += 1;
      var hintTimer = null;
      if (!hinted) {
        hintTimer = setTimeout(function () {
          if (hinted) return;
          hinted = true;
          notify('waking', '后端正在唤醒，首次访问约需 30 秒，请稍候…');
        }, WAKE_HINT_MS);
      }
      try {
        opts.signal = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout)
          ? AbortSignal.timeout(REQ_TIMEOUT_MS) : undefined;
        var res = await fetch(BASE + path, opts);
        if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
        if (hinted) { hinted = false; notify('ready', null); }
        var data;
        try {
          data = await res.json();
        } catch (pe) {
          var be = new Error('后端返回了无效响应，请检查服务地址或稍后重试');
          be.status = 502; be.code = 'BAD_RESPONSE';
          throw be;
        }
        if (!res.ok) {
          var err = new Error(data.error || ('请求失败(' + res.status + ')'));
          err.code = data.code || (res.status === 401 ? 'AUTH_FAILED' : ('HTTP_' + res.status));
          err.status = res.status;
          if (res.status === 401) logout(false); // token 失效自动登出
          throw err;
        }
        return data;
      } catch (e) {
        if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
        var fe = toError(e);
        if (attempt > maxRetries || !isRetriable(fe) || (Date.now() - startedAt) >= RETRY_TOTAL_MS) {
          if (fe.code === 'COLD_START_TIMEOUT' || fe.code === 'NET_UNREACHABLE') notify('unreachable', null);
          throw fe;
        }
        notify('retrying', null);
        await sleep(Math.min(RETRY_BASE_MS * Math.pow(2, attempt - 1), 5000));
      }
    }
  }

  /* 判断是否为"后端不可达"（纯静态托管 / 后端未启动 / 网关错误 / 冷启动超时）。
     这类错误会被 auth 流程捕获。业务性 4xx 与鉴权错误不再归入此类：
     403 是权限问题、404 可能是接口版本不匹配，把它们当成"后端挂了"会掩盖真实故障。 */
  function isBackendDown(e) {
    if (!e) return true;
    if (e.code === 'STATIC_ONLY') return true;
    if (!e.status) return true; // 0 / undefined：网络层失败或冷启动超时
    return e.status === 500 || e.status === 502 || e.status === 503 || e.status === 504;
  }

  /* ---- 认证 ---- */
  async function register(username, password, nick) {
    try {
      var d = await req('POST', '/api/auth/register', { username: username, password: password, nick: nick });
      setSession(d.token, d.user);
      return d;
    } catch (e) {
      /* 后端不可达（如 GitHub Pages 纯静态托管）→ 本地账号模式，注册即成功 */
      if (!BASE && isBackendDown(e)) return localSession(username, nick || username);
      throw e;
    }
  }
  async function login(username, password) {
    try {
      var d = await req('POST', '/api/auth/login', { username: username, password: password });
      setSession(d.token, d.user);
      return d;
    } catch (e) {
      /* 后端不可达 → 本地账号模式：视为本地身份登录成功 */
      if (!BASE && isBackendDown(e)) return localSession(username, username);
      throw e;
    }
  }
  /* 本地账号会话：无后端时用本地 token 维持"已登录"UI（数据仍只存本机） */
  function localSession(username, nick) {
    var user = { username: username || 'demo', nick: nick || username || '同学', local: true };
    var token = 'local.' + Math.random().toString(36).slice(2) + '.' + Date.now();
    setSession(token, user);
    return { token: token, user: user };
  }
  function setSession(token, user) {
    lss(TOKEN_KEY, token);
    lss(USER_KEY, JSON.stringify(user || {}));
    emit();
  }
  function logout(notify) {
    lsr(TOKEN_KEY);
    lsr(USER_KEY);
    if (notify !== false) emit();
  }
  async function updateNick(nick) {
    var d = await req('PUT', '/api/auth/profile', { nick: nick });
    setSession(getToken(), d.user);
    return d;
  }

  /* ---- 学习数据整包（wenguo_v1） ---- */
  function getData() { return req('GET', '/api/data'); }
  function putData(data) { return req('PUT', '/api/data', { data: data }); }

  /* ---- 自习：每日统计 ---- */
  function getStudyStats() { return req('GET', '/api/study/stats'); }
  function putStudyStats(day, focusMinutes, completed) {
    return req('PUT', '/api/study/stats', { day: day, focusMinutes: focusMinutes, completed: completed });
  }
  /* ---- 自习：设置 ---- */
  function getStudySetup() { return req('GET', '/api/study/setup'); }
  function putStudySetup(setup) { return req('PUT', '/api/study/setup', { setup: setup }); }

  /* ---- 自习：在线同桌 ---- */
  function putPresence(subject, motto) {
    return req('PUT', '/api/study/presence', { subject: subject, motto: motto });
  }
  function deletePresence() { return req('DELETE', '/api/study/presence'); }
  function getPresence() { return req('GET', '/api/study/presence'); }

  /* ---- AI 代理（Key 在服务端，前端不再接触） ---- */
  function aiChat(messages, opts) {
    opts = opts || {};
    return req('POST', '/api/ai/chat', {
      messages: messages,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
      model: opts.model,
      provider: opts.provider
    });
  }
  function aiVision(imageDataUrl, userNote) {
    return req('POST', '/api/ai/vision', { imageDataUrl: imageDataUrl, userNote: userNote });
  }

  /* ---- 登录后数据同步：拉取云端并合并写回 ----
     后端不可达（纯静态）时静默返回本地数据，不抛错、不阻塞登录流程 */
  async function pullMerge(localData) {
    var merged, sessionToken = getToken();
    function sameSession() { if (sessionToken !== getToken()) throw Object.assign(new Error('登录状态已变化，请重试'), { status:409, code:'SESSION_CHANGED' }); }
    function latestLocal() { return typeof WG_Data !== 'undefined' ? WG_Data.get() : localData; }
    try {
      var d = await getData();
      sameSession();
      var cloud = d.data || {};
      merged = mergeCloudLocal(mergeCloudLocal(cloud, localData), latestLocal());
    } catch (e) {
      if (!isBackendDown(e)) throw e;
      merged = mergeCloudLocal({}, latestLocal()); // 无后端：仅保留当前本地记录
    }
    sameSession();
    try { var written = await putData(merged); sameSession(); merged = mergeCloudLocal(written.data || merged, latestLocal()); } catch (e) { if (e.code === 'SESSION_CHANGED') throw e; /* 后端不可达则跳过回写 */ }
    sameSession();
    return mergeCloudLocal(merged, latestLocal());
  }

  /* 云端与本地合并（与后端 mergeData 逻辑一致的前端版） */
  function mergeCloudLocal(cloud, local) {
    var out = {};
    var levels = {};
    [cloud.levels || {}, local.levels || {}].forEach(function (src) {
      Object.keys(src).forEach(function (k) {
        var cur = src[k], old = levels[k];
        if (!old || cur.stars > old.stars || (cur.stars === old.stars && cur.bestTime < old.bestTime)) levels[k] = cur;
      });
    });
    out.levels = levels;
    out.marks = Object.assign({}, cloud.marks || {}, local.marks || {});
    var seen = {}, answers = [];
    [cloud.answers || [], local.answers || []].forEach(function (arr) {
      arr.forEach(function (a) {
        var key = (a.qid || '') + '@' + (a.timeMs || 0);
        if (seen[key]) return;
        seen[key] = 1;
        answers.push(a);
      });
    });
    answers.sort(function (a, b) { return (a.timeMs || 0) - (b.timeMs || 0); });
    out.answers = answers.slice(-5000);
    out.mistakes = (cloud.mistakes || []).concat(local.mistakes || []);
    var seenM = {};
    out.mistakes = out.mistakes.filter(function (m) {
      var k = String(m.qid || '');
      if (!k || seenM[k]) return false;
      seenM[k] = 1;
      return true;
    }).slice(0, 500);
    var seenC = {};
    out.cleared = (cloud.cleared || []).concat(local.cleared || []).filter(function (c) {
      var k = String(c.qid);
      if (seenC[k]) return false;
      seenC[k] = 1;
      return true;
    }).slice(0, 800);
    out.checkin = Array.from(new Set((cloud.checkin || []).concat(local.checkin || [])));
    out.nick = cloud.nick || local.nick || '同学';
    out.profile = cloud.profile || local.profile || null;
    return out;
  }

  return {
    getBase: function(){return BASE;},
    req: req,
    onStatus: onStatus,
    isLoggedIn: isLoggedIn,
    isCloudSession: isCloudSession,
    getToken: getToken,
    getUser: getUser,
    onAuthChange: onAuthChange,
    register: register,
    login: login,
    logout: logout,
    updateNick: updateNick,
    getData: getData,
    putData: putData,
    getStudyStats: getStudyStats,
    putStudyStats: putStudyStats,
    getStudySetup: getStudySetup,
    putStudySetup: putStudySetup,
    putPresence: putPresence,
    deletePresence: deletePresence,
    getPresence: getPresence,
    aiChat: aiChat,
    aiVision: aiVision,
    pullMerge: pullMerge
  };
})();
