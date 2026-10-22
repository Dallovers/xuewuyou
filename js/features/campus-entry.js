/* 3D 自习入口 + #rooms 深链垫片（不改 app.js）
 *
 * PR35 第二轮修复：
 *  - 不再把“StudyAppBridge 存在”当成“WG_App.init 完成”。app.js 在脚本执行阶段就
 *    挂出桥接，但 init 是 DOMContentLoaded 监听器，末尾会 goHome()；提前 navTo 会被覆盖。
 *  - 等 DOMContentLoaded（app.js 的 init 先注册、先执行）后再让一个宏任务，确保 init
 *    的 goHome 已完成，再 navTo('rooms')。
 *  - 业务 iframe 内隐藏 3D 入口，且不处理深链，避免递归创建第二个 3D 宿主。
 */
(function () {
  'use strict';

  var embedded = false;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }

  var appReady = false;
  var navigating = false;
  var lastNav = 0;

  function clickRoomsNav() {
    var nav = document.querySelector('[data-nav="rooms"]');
    if (!nav) return false;
    var a = nav.closest ? nav.closest('a') : null;
    if (a) a.addEventListener('click', function (e) { e.preventDefault(); }, { once: true });
    nav.click();
    return true;
  }

  function goRooms() {
    if (embedded || location.hash !== '#rooms' || navigating) return;
    if (!appReady) return;                 // 等 init 完成
    if (Date.now() - lastNav < 300) return; // 防 navTo 改 hash 后 hashchange 再触发
    navigating = true;
    lastNav = Date.now();
    try {
      if (window.StudyAppBridge && typeof window.StudyAppBridge.navTo === 'function') {
        window.StudyAppBridge.navTo('rooms');
      } else {
        clickRoomsNav();
      }
    } finally {
      setTimeout(function () { navigating = false; }, 0);
    }
  }

  function markReady() {
    appReady = true;
    goRooms(); // 首次带 #rooms / 刷新 / 从场景返回，都在这里处理
  }

  function boot() {
    bindButton();
    if (embedded) return;

    if (document.readyState === 'complete') {
      setTimeout(markReady, 0);
      return;
    }
    // defer 脚本执行时通常是 interactive：app.js 的 DOMContentLoaded init 已注册在前，
    // 我们的监听器会后执行；再让一个宏任务，确保 init 里的 goHome 已经跑完。
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(markReady, 0);
    }, { once: true });
  }

  function bindButton() {
    var btn = document.getElementById('rooms3d');
    if (!btn || btn.__campus3dBound) return;
    btn.__campus3dBound = true;
    if (embedded) {
      btn.hidden = true;
      btn.style.display = 'none';
      return;
    }
    btn.addEventListener('click', function () {
      location.href = 'examples/campus-integration/preview.html';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener('hashchange', function () {
    if (embedded) return;
    if (appReady) goRooms();
    // 未 ready 时由 markReady 统一处理当前 hash
  });

  // 供复核脚本读取，不改变产品行为
  window.__campusEntry = {
    get ready() { return appReady; },
    get embedded() { return embedded; },
  };
})();
