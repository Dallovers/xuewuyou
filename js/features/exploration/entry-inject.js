/* 学无忧 · 自主探究入口无侵入注入脚本
 * 用法：在主站 index.html 与校园页面底部各加一行
 *   <script src="js/features/exploration/entry-inject.js"></script>
 * 脚本按自身路径推导 /xuewuyou/ 子路径，不修改现有业务代码；
 * 重复引入、重复执行均不会产生重复入口。
 */
(function () {
  'use strict';
  if (window.__XWY_EXPLORATION_ENTRY_READY) return;
  window.__XWY_EXPLORATION_ENTRY_READY = true;

  var script = document.currentScript;
  var base = './';
  if (script && script.src) {
    var marker = 'js/features/exploration/entry-inject.js';
    var index = script.src.indexOf(marker);
    if (index >= 0) base = script.src.slice(0, index);
    else base = script.src.replace(/[^/]*$/, '../../../');
  } else {
    base = new URL('../../../', location.href).href;
  }
  var workspace = new URL('js/features/exploration/index.html', base).href;
  var onCampus = /campus|world3d|3d/i.test(location.pathname) || !!document.getElementById('campusCanvas');
  var target = workspace + '?from=' + (onCampus ? 'campus' : 'main');

  function openWorkspace(event) {
    if (event) event.preventDefault();
    try {
      if (window.top && window.top !== window.self) window.top.location.href = target;
      else location.href = target;
    } catch (error) {
      location.href = target;
    }
  }

  function addTo(selector, makeNode, marker) {
    var container = document.querySelector(selector);
    if (!container || container.querySelector(marker)) return false;
    container.appendChild(makeNode());
    return true;
  }

  function start() {
    // 主站侧边栏“课程与资料”分组
    addTo('#subnavCourse', function () {
      var link = document.createElement('a');
      link.href = target;
      link.setAttribute('data-nav', 'exploration');
      link.textContent = '自主探究';
      link.addEventListener('click', openWorkspace);
      return link;
    }, '[data-nav="exploration"]');

    // 主站首页“全部功能入口”
    addTo('.feature-directory-grid section:first-child', function () {
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-exploration-entry', '1');
      button.textContent = '自主探究工作区';
      button.addEventListener('click', openWorkspace);
      return button;
    }, 'button[data-exploration-entry]');

    // 校园教室课程工具区；找不到专用容器时提供固定悬浮按钮
    var campusHost = document.querySelector('#classroomTools, .classroom-tools, #lessonTools, #toolbar, .toolbar');
    if (onCampus && !document.getElementById('xwyExplorationCampusBtn')) {
      var campusBtn = document.createElement('button');
      campusBtn.type = 'button';
      campusBtn.id = 'xwyExplorationCampusBtn';
      campusBtn.textContent = '进入自主探究工作区';
      campusBtn.setAttribute('aria-label', '从校园课程工具进入自主探究工作区');
      campusBtn.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:9999;padding:10px 16px;border:0;border-radius:12px;background:#e5457a;color:#fff;font:600 14px system-ui,sans-serif;box-shadow:0 8px 24px rgba(229,69,122,.32);cursor:pointer;';
      campusBtn.addEventListener('click', openWorkspace);
      (campusHost || document.body).appendChild(campusBtn);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
