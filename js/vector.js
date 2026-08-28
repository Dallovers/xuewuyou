/* ============ 学无忧 · 向量瞄准引擎 ============ */
'use strict';

var WG_Vector = (function () {
  var cfg, round, lives, score, correct, wrong, gameOver, onStats, onEnd, current, total;

  function start(c, cb) {
    cfg = c;
    onStats = cb.onStats; onEnd = cb.onEnd;
    total = c.rounds || 5;
    round = 0; lives = c.lives || 3; score = 0; correct = 0; wrong = 0;
    gameOver = false;
    next();
    if (onStats) onStats(stats());
  }

  function stats() {
    return {
      minesLeft: '—', time: 0, combo: 'x0',
      livesText: '第 ' + (round + 1) + '/' + total + ' 题 · 剩 ' + lives + ' 命',
      lives: lives, solved: correct, score: score
    };
  }

  function next() {
    if (gameOver) return;
    if (round >= total) { endGame(true); return; }
    /* 目标向量 (a,b)，a,b ∈ 1..6 */
    var a = 1 + rnd(6), b = 1 + rnd(6);
    var opts = [[a, b]];
    var guard = 0;
    while (opts.length < 4 && guard < 40) {
      var x = 1 + rnd(6), y = 1 + rnd(6);
      var dup = false;
      for (var i = 0; i < opts.length; i++) if (opts[i][0] === x && opts[i][1] === y) dup = true;
      if (!dup) opts.push([x, y]);
      guard++;
    }
    /* 打乱 */
    for (var j = opts.length - 1; j > 0; j--) {
      var k = rnd(j + 1), t = opts[j]; opts[j] = opts[k]; opts[k] = t;
    }
    current = { target: [a, b], opts: opts, ansIdx: opts.indexOf(opts.find(function (o) { return o[0] === a && o[1] === b; })) };
    render();
  }

  function answer(i) {
    if (gameOver || !current) return;
    var ok = i === current.ansIdx;
    var correctVal = '(' + current.target[0] + ',' + current.target[1] + ')';
    if (ok) {
      correct++; score += 10;
      WG_Data.recordAnswer({ q: '向量 (' + current.target[0] + ',' + current.target[1] + ')', topic: '向量', correct: true, timeMs: Date.now() });
    } else {
      wrong++; lives--;
      WG_Data.recordAnswer({ q: '向量 (' + current.target[0] + ',' + current.target[1] + ')', topic: '向量', correct: false, timeMs: Date.now() });
      if (lives <= 0) { endGame(false); return; }
    }
    round++;
    if (onStats) onStats(stats());
    if (round >= total) { endGame(true); return; }
    next();
  }

  function render() {
    var box = document.getElementById('customArea');
    var t = current.target;
    /* SVG 坐标系：0..420，原点在 (210,210)，比例 30px/单位，范围 ±7 */
    var C = 210, SC = 30;
    var html = '<div style="border:1px solid var(--rule);border-radius:16px;background:linear-gradient(160deg,var(--bg3),var(--bg2));padding:1.2rem 1.3rem;">';
    html += '<div style="font-size:0.78rem;color:var(--gold);letter-spacing:0.14em;margin-bottom:0.4rem;">向量瞄准 · 第 ' + (round + 1) + '/' + total + ' 题</div>';
    html += '<p style="font-size:0.85rem;color:var(--muted);margin-bottom:0.8rem;">从原点出发，选一个向量，恰好到达目标点 <b style="color:var(--gold);">(' + t[0] + ', ' + t[1] + ')</b></p>';
    html += '<svg viewBox="0 0 420 420" style="width:min(320px,100%);display:block;margin:0 auto;">';
    /* 网格 */
    for (var i = -7; i <= 7; i++) {
      var x = C + i * SC;
      html += '<line x1="' + x + '" y1="20" x2="' + x + '" y2="400" stroke="rgba(16,74,68,.12)" stroke-width="1"/>';
      html += '<line x1="20" y1="' + x + '" x2="400" y2="' + x + '" stroke="rgba(16,74,68,.12)" stroke-width="1"/>';
    }
    html += '<line x1="20" y1="210" x2="400" y2="210" stroke="rgba(16,74,68,.42)" stroke-width="1.5"/>';
    html += '<line x1="210" y1="20" x2="210" y2="400" stroke="rgba(16,74,68,.42)" stroke-width="1.5"/>';
    /* 目标 */
    html += '<circle cx="' + (C + t[0] * SC) + '" cy="' + (C - t[1] * SC) + '" r="9" fill="var(--gold)" stroke="#ffffff" stroke-width="2"/>';
    html += '<text x="' + (C + t[0] * SC + 12) + '" y="' + (C - t[1] * SC - 8) + '" fill="var(--gold)" font-size="13" font-weight="700">目标</text>';
    html += '</svg>';

    /* 选项 */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-top:0.9rem;">';
    var letters = ['A', 'B', 'C', 'D'];
    current.opts.forEach(function (o, i) {
      html += '<button class="btn" data-vi="' + i + '" style="font-size:0.95rem;font-weight:700;padding:0.6rem 0.4rem;">' + letters[i] + '. 向量 (' + o[0] + ', ' + o[1] + ')</button>';
    });
    html += '</div>';
    html += '<div style="font-size:0.8rem;color:var(--muted);margin-top:0.6rem;">向量 (' + t[0] + ',' + t[1] + ') = 向右 ' + t[0] + ' 单位 + 向上 ' + t[1] + ' 单位</div>';
    html += '</div>';
    box.innerHTML = html;

    box.querySelectorAll('[data-vi]').forEach(function (btn) {
      btn.addEventListener('click', function () { answer(+btn.dataset.vi); });
    });
  }

  function endGame(win) {
    if (gameOver) return;
    gameOver = true;
    var stars = 0;
    if (win) stars = correct >= total ? 3 : (correct >= total - 1 ? 2 : 1);
    if (onEnd) onEnd({
      win: win, stars: stars, time: 0, score: score,
      correct: correct, wrong: wrong, viewed: 0, maxCombo: 0,
      accuracy: correct + wrong > 0 ? Math.round(correct / (correct + wrong) * 100) : 100,
      msg: win ? '全部命中，向量大神！' : '命中了 ' + correct + '/' + total + ' 个目标'
    });
  }

  return { start: start, stop: function () {} };
})();
