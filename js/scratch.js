/* ===========================================================
   草稿纸 WG_Scratch
   一块可开合、可拖动的手写板。做题时算两步中间过程用，
   不做持久化（刷新即弃），但切题不清空，方便对着同一题连写。
   =========================================================== */
var WG_Scratch = (function () {
  'use strict';

  var panel = null, canvas = null, ctx = null;
  var wired = false, open = false;
  var mode = 'pen';               /* pen / eraser */
  var drawing = false;
  var lastX = 0, lastY = 0;
  var strokes = [];               /* 每一笔：{mode, size, pts:[{x,y}]} —— 撤销靠重放 */
  var cur = null;
  var dpr = 1;
  var raf = 0;

  var PEN_SIZE = 2.4;
  var ERASER_SIZE = 22;

  function $(id) { return document.getElementById(id); }

  /* ---------- 尺寸 ---------- */
  /* canvas 的 CSS 尺寸由布局决定，位图尺寸要乘设备像素比，
     否则高分屏上线条发虚。改尺寸会清空位图，所以之后要重放笔迹。 */
  function fit() {
    if (!canvas) return;
    var box = canvas.parentNode;
    if (!box) return;
    var w = Math.max(120, box.clientWidth);
    var h = Math.max(120, box.clientHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nw = Math.round(w * dpr), nh = Math.round(h * dpr);
    if (canvas.width === nw && canvas.height === nh) return;
    canvas.width = nw;
    canvas.height = nh;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    replay();
  }

  function scheduleFit() {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; fit(); });
  }

  /* ---------- 绘制 ---------- */
  function styleFor(s) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = s.size;
    if (s.mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue('color') || '#e8ecff';
    }
  }

  function drawSeg(s, ax, ay, bx, by) {
    styleFor(s);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  function replay() {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    strokes.forEach(function (s) {
      if (!s.pts.length) return;
      if (s.pts.length === 1) {
        drawSeg(s, s.pts[0].x, s.pts[0].y, s.pts[0].x + 0.01, s.pts[0].y);
        return;
      }
      for (var i = 1; i < s.pts.length; i++) {
        drawSeg(s, s.pts[i - 1].x, s.pts[i - 1].y, s.pts[i].x, s.pts[i].y);
      }
    });
  }

  function posOf(e) {
    var r = canvas.getBoundingClientRect();
    var p = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  }

  function startDraw(e) {
    if (!ctx) return;
    /* 手写笔/手指按下就吃掉事件，避免同时触发页面滚动和滑动切题 */
    if (e.cancelable) e.preventDefault();
    var p = posOf(e);
    drawing = true;
    lastX = p.x; lastY = p.y;
    cur = { mode: mode, size: mode === 'eraser' ? ERASER_SIZE : PEN_SIZE, pts: [{ x: p.x, y: p.y }] };
    strokes.push(cur);
    if (strokes.length > 400) strokes.shift();
    drawSeg(cur, p.x, p.y, p.x + 0.01, p.y);
  }

  function moveDraw(e) {
    if (!drawing || !cur) return;
    if (e.cancelable) e.preventDefault();
    var p = posOf(e);
    if (Math.abs(p.x - lastX) < 0.6 && Math.abs(p.y - lastY) < 0.6) return;
    cur.pts.push({ x: p.x, y: p.y });
    drawSeg(cur, lastX, lastY, p.x, p.y);
    lastX = p.x; lastY = p.y;
  }

  function endDraw() {
    drawing = false;
    cur = null;
  }

  /* ---------- 工具 ---------- */
  function setMode(m) {
    mode = m === 'eraser' ? 'eraser' : 'pen';
    var pen = $('scPen'), er = $('scEraser');
    if (pen) {
      pen.classList.toggle('is-on', mode === 'pen');
      pen.setAttribute('aria-pressed', mode === 'pen' ? 'true' : 'false');
    }
    if (er) {
      er.classList.toggle('is-on', mode === 'eraser');
      er.setAttribute('aria-pressed', mode === 'eraser' ? 'true' : 'false');
    }
    if (canvas) canvas.classList.toggle('is-eraser', mode === 'eraser');
  }

  function undo() {
    if (!strokes.length) return;
    strokes.pop();
    replay();
  }

  function clear() {
    strokes = [];
    replay();
  }

  /* ---------- 拖动 ---------- */
  /* 面板默认贴在右下，用户想挪就按住标题栏拖。拖动只改 left/top，
     拖过一次之后就不再跟随默认定位。 */
  var dragOn = false, dragX = 0, dragY = 0, baseX = 0, baseY = 0;

  function dragStart(e) {
    if (e.target && e.target.closest && e.target.closest('button')) return;
    var p = (e.touches && e.touches[0]) || e;
    var r = panel.getBoundingClientRect();
    dragOn = true;
    dragX = p.clientX; dragY = p.clientY;
    baseX = r.left; baseY = r.top;
    panel.classList.add('is-dragging');
  }

  function dragMove(e) {
    if (!dragOn) return;
    var p = (e.touches && e.touches[0]) || e;
    if (e.cancelable) e.preventDefault();
    var w = panel.offsetWidth, h = panel.offsetHeight;
    var x = baseX + (p.clientX - dragX);
    var y = baseY + (p.clientY - dragY);
    x = Math.max(4, Math.min(window.innerWidth - w - 4, x));
    y = Math.max(4, Math.min(window.innerHeight - h - 4, y));
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  function dragEnd() {
    if (!dragOn) return;
    dragOn = false;
    panel.classList.remove('is-dragging');
  }

  /* ---------- 装配 ---------- */
  function wire() {
    if (wired) return true;
    panel = $('scratchPanel');
    canvas = $('scratchCanvas');
    if (!panel || !canvas) return false;
    wired = true;
    ctx = canvas.getContext('2d');

    /* 指针事件优先，没有就退回 mouse + touch */
    if (window.PointerEvent) {
      canvas.addEventListener('pointerdown', function (e) {
        canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
        startDraw(e);
      });
      canvas.addEventListener('pointermove', moveDraw);
      canvas.addEventListener('pointerup', endDraw);
      canvas.addEventListener('pointercancel', endDraw);
      canvas.addEventListener('pointerleave', endDraw);
    } else {
      canvas.addEventListener('mousedown', startDraw);
      canvas.addEventListener('mousemove', moveDraw);
      document.addEventListener('mouseup', endDraw);
      canvas.addEventListener('touchstart', startDraw, { passive: false });
      canvas.addEventListener('touchmove', moveDraw, { passive: false });
      canvas.addEventListener('touchend', endDraw);
    }

    var pen = $('scPen'), er = $('scEraser'), ud = $('scUndo'), cl = $('scClear'), cs = $('scClose');
    if (pen) pen.addEventListener('click', function () { setMode('pen'); });
    if (er) er.addEventListener('click', function () { setMode('eraser'); });
    if (ud) ud.addEventListener('click', undo);
    if (cl) cl.addEventListener('click', clear);
    if (cs) cs.addEventListener('click', hide);

    var head = $('scratchDrag');
    if (head) {
      head.addEventListener('mousedown', dragStart);
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragEnd);
      head.addEventListener('touchstart', dragStart, { passive: true });
      document.addEventListener('touchmove', dragMove, { passive: false });
      document.addEventListener('touchend', dragEnd);
    }

    window.addEventListener('resize', function () { if (open) scheduleFit(); });
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { hide(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); undo(); }
    });
    return true;
  }

  function syncBtn() {
    var b = $('examScratchBtn');
    if (!b) return;
    b.classList.toggle('is-on', open);
    b.setAttribute('aria-pressed', open ? 'true' : 'false');
  }

  function show() {
    if (!wire()) return;
    open = true;
    panel.classList.remove('hidden');
    syncBtn();
    scheduleFit();
  }

  function hide() {
    if (!panel) { panel = $('scratchPanel'); }
    open = false;
    if (panel) panel.classList.add('hidden');
    endDraw();
    dragEnd();
    syncBtn();
  }

  function toggle() {
    if (open) hide(); else show();
  }

  return {
    show: show,
    hide: hide,
    toggle: toggle,
    clear: clear,
    isOpen: function () { return open; }
  };
})();
