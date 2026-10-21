/* 3D 自习入口 + #rooms 深链垫片（不改 app.js）
 *
 * 修复 PR35 P2-2/P2-3：
 *  - 等主应用真正就绪（StudyAppBridge.navTo 可用）再处理 #rooms，避免 defer 阶段
 *    提前 click 触发 <a href="#"> 默认跳转、把 hash 清掉。
 *  - 业务 iframe 内隐藏 3D 入口，且不处理深链，避免递归创建第二个 3D 宿主。
 */
(function () {
  'use strict';

  var embedded = false;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }

  function whenAppReady(cb) {
    var tries = 0;
    (function poll() {
      if (window.StudyAppBridge && typeof window.StudyAppBridge.navTo === 'function') {
        cb(true);
        return;
      }
      if (++tries > 200) { cb(false); return; } // ~10s，最后回退到点击导航
      setTimeout(poll, 50);
    })();
  }

  function clickRoomsNav() {
    var nav = document.querySelector('[data-nav="rooms"]');
    if (!nav) return false;
    var a = nav.closest ? nav.closest('a') : null;
    if (a) a.addEventListener('click', function (e) { e.preventDefault(); }, { once: true });
    nav.click();
    return true;
  }

  var navigating = false;
  var lastNav = 0;
  function goRooms(ready) {
    if (embedded || location.hash !== '#rooms' || navigating) return;
    if (Date.now() - lastNav < 300) return; // 防止 navTo 改 hash 后 hashchange 再触发一次
    navigating = true;
    lastNav = Date.now();
    try {
      if (ready && window.StudyAppBridge && typeof window.StudyAppBridge.navTo === 'function') {
        window.StudyAppBridge.navTo('rooms');
      } else {
        clickRoomsNav();
      }
    } finally {
      setTimeout(function () { navigating = false; }, 0);
    }
  }

  function bindButton() {
    var btn = document.getElementById('rooms3d');
    if (!btn || btn.__campus3dBound) return;
    btn.__campus3dBound = true;
    if (embedded) {
      // 业务面板 iframe 里不再提供“再进一个 3D”的入口
      btn.hidden = true;
      btn.style.display = 'none';
      return;
    }
    btn.addEventListener('click', function () {
      location.href = 'examples/campus-integration/preview.html';
    });
  }

  function start() {
    bindButton();
    if (embedded) return; // 嵌入模式不处理深链
    whenAppReady(function (ready) { goRooms(ready); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.addEventListener('hashchange', function () {
    if (embedded) return;
    whenAppReady(function (ready) { goRooms(ready); });
  });
})();
