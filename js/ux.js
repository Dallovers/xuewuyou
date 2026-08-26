/* ===========================================================
   ux.js — 交互动效 + 无障碍增强层
   由 Dallovers-design 工作流 C（上线优化）阶段二/三生成。
   设计原则：只做增强，不接管任何既有业务逻辑。
   全部通过独立监听 / MutationObserver 实现，app.js 无需改动。
   =========================================================== */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 键盘可达：logo 作为 role=button 需响应 Enter / Space ---------- */
  function wireLogoKeyboard() {
    var logo = $('logoBtn');
    if (!logo) return;
    logo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        logo.click();
      }
    });
  }

  /* ---------- 2. AI 侧边栏：aria-expanded 同步 + Esc 关闭 + 焦点管理 ---------- */
  var lastFocus = null;

  function wireAiSide() {
    var side = $('aiSide');
    var fab = $('aiFab');
    if (!side || !fab) return;

    /* 用 MutationObserver 跟随 app.js 对 .hidden 的增删，双向同步 aria 状态 */
    var mo = new MutationObserver(function () {
      var open = !side.classList.contains('hidden');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        lastFocus = document.activeElement;
        var input = $('aiInput');
        if (input) setTimeout(function () { input.focus(); }, 60);
      } else if (lastFocus && document.contains(lastFocus)) {
        lastFocus.focus();
        lastFocus = null;
      }
    });
    mo.observe(side, { attributes: true, attributeFilter: ['class'] });

    /* 焦点循环：Tab 不逃出侧边栏 */
    side.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = side.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      var vis = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
      if (!vis.length) return;
      var first = vis[0], last = vis[vis.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- 3. 全局 Esc：优先关弹窗，其次关侧边栏、文库详情 ---------- */
  function wireEscape() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var mask = $('modalMask');
      if (mask && mask.classList.contains('show')) { mask.classList.remove('show'); return; }
      var wkd = $('wenkuDetail');
      if (wkd && !wkd.classList.contains('hidden')) { wkd.classList.add('hidden'); return; }
      var side = $('aiSide');
      if (side && !side.classList.contains('hidden')) {
        var close = $('aiSideClose');
        if (close) close.click(); else side.classList.add('hidden');
      }
    });
  }

  /* ---------- 4. 弹窗打开时把焦点送进去，关闭后送回 ---------- */
  function wireModalFocus() {
    var mask = $('modalMask');
    if (!mask) return;
    var before = null;
    new MutationObserver(function () {
      if (mask.classList.contains('show')) {
        before = document.activeElement;
        var btn = mask.querySelector('.btn:not(.hidden)');
        if (btn) setTimeout(function () { btn.focus(); }, 60);
      } else if (before && document.contains(before)) {
        before.focus();
        before = null;
      }
    }).observe(mask, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- 5. 滚动渐显：.reveal → .reveal.in ---------- */
  var io = null;
  function initReveal() {
    if (reduce || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  }

  function observeReveal(root) {
    if (!io) return;
    (root || document).querySelectorAll('.reveal:not(.in)').forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. 卡片网格入场 stagger（视图切换后自动重放） ---------- */
  /* 与 index.html 实际存在的容器 id 一一对应，勿凭猜测添加 */
  var GRIDS = ['homeBankGrid', 'bankGrid', 'subGrid', 'mistakeList', 'wenkuList', 'reportBody'];

  function animateGrid(el) {
    if (reduce || !el) return;
    el.classList.remove('stagger');
    /* 强制回流以重启动画 */
    void el.offsetWidth;
    el.classList.add('stagger');
  }

  function wireGridStagger() {
    GRIDS.forEach(function (id) {
      var g = $(id);
      if (!g) return;
      /* 子节点变化 = 重新渲染，重放入场动画 */
      var t = null;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(function () { animateGrid(g); observeReveal(g); }, 16);
      }).observe(g, { childList: true });
    });
  }

  /* ---------- 7. 视图切换时给主要区块补 reveal ---------- */
  var VIEWS = ['home', 'bank', 'module', 'wenku', 'game', 'report', 'mistakes', 'ai'];

  function wireViewReveal() {
    VIEWS.forEach(function (v) {
      var el = $('view-' + v);
      if (!el) return;
      new MutationObserver(function () {
        if (el.classList.contains('hidden')) return;
        /* 视图刚显示：滚回顶部 + 重放入场 */
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        GRIDS.forEach(function (id) {
          var g = $(id);
          if (g && el.contains(g)) animateGrid(g);
        });
        observeReveal(el);
      }).observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ---------- 8. 答题正误反馈 ----------
     quiz.js / gaoshu.js 的判定结果只写进 #quizFeed 的文本（✓ 开头为对，✗ 为错），
     并不给选项挂 class。所以这里监听 #quizFeed 的文本变化来驱动动效，
     顺带给它补 aria-live 让读屏能播报。 */
  function wireQuizFeedback() {
    var feed = $('quizFeed');
    if (!feed) return;

    feed.setAttribute('role', 'status');
    feed.setAttribute('aria-live', 'assertive');
    feed.setAttribute('aria-atomic', 'true');

    if (reduce) return;
    var opts = $('quizOpts');

    new MutationObserver(function () {
      var t = (feed.textContent || '').trim();
      if (!t) return;
      var ok = t.indexOf('✓') === 0;
      var bad = t.indexOf('✗') === 0;
      if (!ok && !bad) return;

      /* 反馈条本身抖/弹一下 */
      var cls = ok ? 'fx-pop' : 'fx-shake';
      feed.classList.remove('fx-pop', 'fx-shake');
      void feed.offsetWidth;
      feed.classList.add(cls);
      setTimeout(function () { feed.classList.remove(cls); }, 420);

      /* 答错时整个选项区一起轻抖，强化"这题错了"的体感 */
      if (bad && opts) {
        opts.classList.remove('fx-shake');
        void opts.offsetWidth;
        opts.classList.add('fx-shake');
        setTimeout(function () { opts.classList.remove('fx-shake'); }, 420);
      }
    }).observe(feed, { childList: true, characterData: true, subtree: true });
  }

  /* ---------- 9. 按钮点击涟漪反馈（轻量，只对 .btn 生效） ---------- */
  function wireRipple() {
    if (reduce) return;
    document.addEventListener('pointerdown', function (e) {
      var btn = e.target.closest && e.target.closest('.btn, .wt-btn');
      if (!btn || btn.disabled) return;
      btn.classList.add('is-press');
      var off = function () { btn.classList.remove('is-press'); };
      btn.addEventListener('pointerup', off, { once: true });
      btn.addEventListener('pointerleave', off, { once: true });
    }, { passive: true });
  }

  /* ---------- 10. 数字滚动：统计卡片数值平滑到位 ---------- */
  function countUp(el, to, dur) {
    if (reduce) { el.textContent = to; return; }
    var from = parseFloat(el.textContent) || 0;
    if (from === to) return;
    var t0 = performance.now();
    dur = dur || 600;
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* 暴露给可能的调用方，不强依赖 */
  window.WG_UX = { countUp: countUp, observeReveal: observeReveal, animateGrid: animateGrid };

  /* ---------- 启动 ---------- */
  function boot() {
    initReveal();
    wireLogoKeyboard();
    wireAiSide();
    wireEscape();
    wireModalFocus();
    wireGridStagger();
    wireViewReveal();
    wireQuizFeedback();
    wireRipple();
    observeReveal(document);
  }

  /* app.js 用 DOMContentLoaded 初始化；这里排在其后，确保 DOM 与绑定就绪 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); });
  } else {
    setTimeout(boot, 0);
  }
})();
