/* ============ 学无忧 · API 客户端 ============
 * 负责与后端通信：登录/注册、学习数据云同步、自习统计/设置、AI 代理。
 * 未登录时所有云功能自动降级为纯本地模式，不影响使用。
 */
'use strict';

var WG_API = (function () {
  var TOKEN_KEY = 'xwy_token';
  var USER_KEY = 'xwy_user';
  var BASE = ''; // 同源部署，直接用相对路径；跨域时可改为后端地址

  var listeners = []; // 登录状态变化回调

  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lss(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsr(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function getToken() { return ls(TOKEN_KEY); }
  function getUser() { try { return JSON.parse(ls(USER_KEY) || 'null'); } catch (e) { return null; } }
  function isLoggedIn() { return !!getToken(); }

  function emit() {
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
  }
  function onAuthChange(fn) { listeners.push(fn); }

  async function req(method, path, body) {
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    var opts = { method: method, headers: headers };
    if (body !== undefined) opts.body = JSON.stringify(body);
    var res = await fetch(BASE + path, opts);
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      var err = new Error(data.error || ('请求失败(' + res.status + ')'));
      err.code = data.code || 'ERR';
      err.status = res.status;
      if (res.status === 401) logout(false); // token 失效自动登出
      throw err;
    }
    return data;
  }

  /* ---- 认证 ---- */
  async function register(username, password, nick) {
    var d = await req('POST', '/api/auth/register', { username: username, password: password, nick: nick });
    setSession(d.token, d.user);
    return d;
  }
  async function login(username, password) {
    var d = await req('POST', '/api/auth/login', { username: username, password: password });
    setSession(d.token, d.user);
    return d;
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

  /* ---- 登录后数据同步：拉取云端并合并写回 ---- */
  async function pullMerge(localData) {
    var d = await getData();
    var cloud = d.data || {};
    var merged = mergeCloudLocal(cloud, localData);
    await putData(merged); // 双向合并结果回写云端
    return merged;
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
    req: req,
    isLoggedIn: isLoggedIn,
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
