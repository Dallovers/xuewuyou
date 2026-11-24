/* 学无忧 · 自主探究入口注入脚本（主站 + 公共校园）
 * 用法：在主站 index.html 与 js/features/campus-hub/index.html 各加一行：
 *   <script src="/xuewuyou/js/features/exploration/entry-inject.js"></script>
 * 或按页面相对路径引用；脚本按自身 src 推导工作区地址，兼容 /xuewuyou/ 前缀。
 * 不修改业务逻辑，重复引入不会产生重复入口。
 */
(function () {
  'use strict';
  if (window.__XWY_EXPLORATION_ENTRY_READY) return;
  window.__XWY_EXPLORATION_ENTRY_READY = true;

  var script = document.currentScript;
  // script.src 位于 <站点根>/js/features/exploration/entry-inject.js，
  // 向上三级即站点根；兼容 /xuewuyou/ 子路径。
  var root = script && script.src ? new URL('../../../', script.src).href : new URL('./', location.href).href;
  var workspace = new URL('js/features/exploration/index.html', root).href;

  var path = location.pathname;
  var onCampus = path.indexOf('/js/features/campus-hub/') >= 0 || !!document.getElementById('world');
  var onMainSite = !onCampus && (path === '/' || /\/index\.html$/.test(path) || !!document.getElementById('subnavCourse'));
  var from = onCampus ? 'campus' : 'main';
  var target = workspace + '?from=' + from;

  function openWorkspace(event) {
    if (event) event.preventDefault();
    try {
      if (window.top && window.top !== window.self) window.top.location.href = target;
      else location.href = target;
    } catch (error) {
      location.href = target;
    }
  }

  function makeLink(text, className, id) {
    var link = document.createElement('a');
    link.href = target;
    link.textContent = text;
    if (className) link.className = className;
    if (id) link.id = id;
    link.addEventListener('click', openWorkspace);
    return link;
  }

  function injectMainSite() {
    var subnav = document.getElementById('subnavCourse');
    if (subnav && !subnav.querySelector('[data-exploration-entry]')) {
      var link = makeLink('自主探究', '', '');
      link.setAttribute('data-exploration-entry', '1');
      subnav.appendChild(link);
    }
    var directory = document.querySelector('.feature-directory-grid section:first-child');
    if (directory && !directory.querySelector('[data-exploration-entry]')) {
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-exploration-entry', '1');
      button.textContent = '自主探究工作区';
      button.addEventListener('click', openWorkspace);
      directory.appendChild(button);
    }
  }

  function injectCampus() {
    var nav = document.querySelector('.campus-toolbar nav.views');
    if (nav && !document.getElementById('exploration-campus-entry')) {
      var link = makeLink('自主探究', 'exploration-entry', 'exploration-campus-entry');
      link.setAttribute('aria-label', '进入自主探究工作区');
      link.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:9px;background:#e5457a;color:#fff;text-decoration:none;font-weight:600;';
      nav.insertBefore(link, nav.lastElementChild || null);
    }
    // 工具栏结构变化时保留一个可访问的兜底入口
    if (!document.getElementById('exploration-campus-entry')) {
      var fallback = makeLink('进入自主探究工作区', '', 'exploration-campus-entry');
      fallback.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:9999;padding:10px 16px;border-radius:12px;background:#e5457a;color:#fff;font:600 14px system-ui,sans-serif;text-decoration:none;box-shadow:0 8px 24px rgba(229,69,122,.32);';
      document.body.appendChild(fallback);
    }
  }

  function start() {
    if (onCampus) injectCampus();
    else if (onMainSite) injectMainSite();
    window.__XWY_EXPLORATION_ENTRY_TARGET__ = target;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
