/* ============ 学无忧 · 矩阵消元大作战引擎 ============ */
'use strict';

var WG_Matrix = (function () {
  var cfg, mat, steps, maxSteps, selected, gameOver, elapsed, timerId, onStats, onEnd, par, mtxK;

  function start(c, cb) {
    cfg = c;
    onStats = cb.onStats; onEnd = cb.onEnd;
    maxSteps = c.maxSteps || 10;
    var g = genMatrix();
    mat = g.mat; par = g.par;
    steps = 0; selected = -1; gameOver = false; elapsed = 0; mtxK = 1;
    if (timerId) { clearInterval(timerId); timerId = null; }
    timerId = setInterval(function () { elapsed++; if (onStats) onStats(stats()); }, 1000);
    render();
    if (onStats) onStats(stats());
  }

  function stats() {
    return {
      minesLeft: '—', time: elapsed, combo: 'x0',
      livesText: '剩 ' + Math.max(0, maxSteps - steps) + ' 步',
      lives: Math.max(0, maxSteps - steps), solved: steps, score: 0
    };
  }

  function genMatrix() {
    var m = [];
    for (var i = 0; i < 3; i++) {
      m[i] = [0, 0, 0];
      m[i][i] = 1 + rnd(3);
      for (var j = i + 1; j < 3; j++) m[i][j] = rnd(5);
    }
    var nOps = 5 + rnd(3);
    for (var k = 0; k < nOps; k++) {
      var op = rnd(2);
      if (op === 0) { /* swap */
        var a = rnd(3), b = rnd(3);
        if (a !== b) { var t = m[a]; m[a] = m[b]; m[b] = t; }
      } else { /* row_add */
        var src = rnd(3), dst = rnd(3);
        if (src !== dst) {
          var kv = choice([-2, -1, 1, 2]);
          for (var j2 = 0; j2 < 3; j2++) m[dst][j2] += kv * m[src][j2];
        }
      }
    }
    return { mat: m, par: nOps + 3 };
  }

  function isUpperTriangular() {
    for (var i = 0; i < 3; i++)
      for (var j = 0; j < i; j++)
        if (mat[i][j] !== 0) return false;
    return true;
  }

  function applyOp(fn) {
    if (gameOver) return;
    fn();
    steps++;
    if (onStats) onStats(stats());
    if (isUpperTriangular()) { endGame(true); return; }
    if (steps >= maxSteps) { endGame(false); return; }
    render();
  }

  function render() {
    var box = document.getElementById('customArea');
    var html = '<div style="border:1px solid var(--rule);border-radius:16px;background:linear-gradient(160deg,var(--bg3),var(--bg2));padding:1.3rem 1.4rem;">';
    html += '<div style="font-size:0.78rem;color:var(--gold);letter-spacing:0.14em;margin-bottom:0.4rem;">矩阵消元大作战</div>';
    html += '<h3 style="font-size:1.1rem;margin-bottom:0.3rem;">把矩阵化为上三角（主对角线下方全为 0）</h3>';
    html += '<p style="font-size:0.82rem;color:var(--muted);margin-bottom:0.8rem;">上限 ' + maxSteps + ' 步，超步挂科。<b style="color:var(--ink);">点一行选中</b>，<b style="color:var(--ink);">点另一行直接交换</b>，或用行上的 ＋/－ 按钮做倍加。</p>';

    /* 矩阵（每行带 ± 按钮） */
    html += '<div style="display:inline-block;border:1px solid var(--rule-strong);border-radius:12px;overflow:hidden;margin-bottom:1rem;">';
    for (var i = 0; i < 3; i++) {
      var isSel = i === selected;
      html += '<div style="display:flex;align-items:stretch;">';
      /* ± 操作按钮（非选中行上） */
      if (selected >= 0 && selected !== i) {
        html += '<button class="mtx-op" data-op="minus" data-dst="' + i + '" title="第' + (i + 1) + '行 − ' + mtxK + '×第' + (selected + 1) + '行">−' + mtxK + '</button>';
        html += '<button class="mtx-op" data-op="plus" data-dst="' + i + '" title="第' + (i + 1) + '行 + ' + mtxK + '×第' + (selected + 1) + '行">+' + mtxK + '</button>';
      } else if (selected === i) {
        html += '<button class="mtx-op selmark">★</button>';
      } else {
        html += '<button class="mtx-op" style="opacity:.35;cursor:default;"></button>';
      }
      for (var j = 0; j < 3; j++) {
        html += '<div style="width:52px;height:46px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;font-weight:700;cursor:pointer;' +
          (isSel ? 'background:rgba(251,191,36,.22);border:1px solid rgba(251,191,36,.5);' : 'border:1px solid var(--rule);') +
          '" data-row="' + i + '" data-col="' + j + '">' + mat[i][j] + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';

    /* 倍加系数 k 切换 + 提示 */
    html += '<div style="display:flex;gap:0.7rem;align-items:center;flex-wrap:wrap;margin-bottom:0.6rem;">';
    html += '<span style="font-size:0.82rem;color:var(--muted);">倍加系数 k：</span>';
    html += '<button class="btn" id="mtxKToggle" style="font-size:0.9rem;font-weight:700;min-width:2.6rem;">k = ' + mtxK + '</button>';
    html += '<span style="font-size:0.8rem;color:var(--muted);">选中行：<b style="color:var(--gold);">' + (selected >= 0 ? '第 ' + (selected + 1) + ' 行' : '未选中') + '</b>　点其它行 = 交换</span>';
    html += '</div>';
    html += '<div style="font-size:0.78rem;color:var(--muted);line-height:1.8;">技巧：先选一行作"基准"，再用别的行上的 ＋/－ 按钮把它加进去消元；点 k 切换倍数。</div>';
    html += '</div>';
    box.innerHTML = html;

    box.querySelectorAll('[data-row]').forEach(function (el) {
      el.addEventListener('click', function () {
        var r = +el.dataset.row;
        if (selected >= 0 && selected !== r) {
          /* 点另一行 = 交换 */
          applyOp(function () {
            var t = mat[selected]; mat[selected] = mat[r]; mat[r] = t;
          });
          selected = r;
        } else {
          selected = r;
          render();
        }
      });
    });
    box.querySelectorAll('.mtx-op[data-op]').forEach(function (el) {
      el.addEventListener('click', function () {
        var dst = +el.dataset.dst;
        var sign = el.dataset.op === 'plus' ? 1 : -1;
        applyOp(function () {
          for (var j = 0; j < 3; j++) mat[dst][j] += sign * mtxK * mat[selected][j];
        });
      });
    });
    var kBtn = box.querySelector('#mtxKToggle');
    if (kBtn) kBtn.addEventListener('click', function () {
      mtxK = mtxK === 1 ? 2 : (mtxK === 2 ? 3 : 1);
      render();
    });
  }

  function endGame(win) {
    if (gameOver) return;
    gameOver = true;
    stop();
    var stars = 0;
    if (win) {
      stars = steps <= Math.max(4, par - 1) ? 3 : (steps <= maxSteps - 2 ? 2 : 1);
    }
    if (onEnd) onEnd({
      win: win, stars: stars, time: elapsed, score: win ? 50 + (maxSteps - steps) * 10 : 0,
      correct: win ? 1 : 0, wrong: win ? 0 : 1, viewed: 0, maxCombo: 0, accuracy: 0,
      msg: win ? '消元完成，线代顺利过关！' : '超步数，挂科了（点击行可撤销思路，重新规划）'
    });
  }

  function stop() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  return { start: start, stop: stop };
})();
