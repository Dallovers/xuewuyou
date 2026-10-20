/* 3D 自习入口 + #rooms 深链垫片（不改 app.js） */
(function () {
  'use strict';

  function openRoomsFromHash() {
    if (location.hash !== '#rooms') return;
    var nav = document.querySelector('[data-nav="rooms"]');
    if (nav) nav.click();
  }

  function bind() {
    var btn = document.getElementById('rooms3d');
    if (btn && !btn.__campus3dBound) {
      btn.__campus3dBound = true;
      btn.addEventListener('click', function () {
        location.href = 'examples/campus-integration/preview.html';
      });
    }
    openRoomsFromHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  window.addEventListener('hashchange', openRoomsFromHash);
})();
