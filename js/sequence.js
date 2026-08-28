/* ============ 学无忧 · 数列挑战引擎 ============ */
'use strict';

var WG_Seq = (function () {
  var cfg, idx, total, lives, score, correct, wrong, gameOver, onStats, onEnd, current;

  function start(c, cb) {
    cfg = c;
    onStats = cb.onStats; onEnd = cb.onEnd;
    total = c.n || 8;
    idx = 0; lives = c.lives || 3; score = 0; correct = 0; wrong = 0;
    gameOver = false;
    next();
    if (onStats) onStats(stats());
  }

  function stats() {
    return {
      minesLeft: '—', time: 0, combo: 'x0',
      livesText: '第 ' + (idx + 1) + '/' + total + ' 题 · 剩 ' + lives + ' 命',
      lives: lives, solved: correct, score: score
    };
  }

  /* 生成一道数列题，答案 = k (1-8) */
  function genSeq(k) {
    var v = rnd(3);
    if (v === 0) {
      /* 等差数列：前 5 项，第 4 项为 k */
      var d = 1 + rnd(3);
      var a = k - 3 * d;
      if (a < 1) { d = 1; a = k - 3; }
      if (a < 1) return null;
      var arr = [a, a + d, a + 2 * d, '?', a + 4 * d];
      return { arr: arr, ans: k };
    }
    if (v === 1 && k === 7) {
      /* 奇数列：1,3,5,? */
      return { arr: [1, 3, 5, '?'], ans: 7 };
    }
    if (v === 1 && k === 8) {
      /* 斐波那契：1,1,2,3,5,? */
      return { arr: [1, 1, 2, 3, 5, '?'], ans: 8 };
    }
    /* 隔项等差（两个等差数列交错）：? 在奇数位 */
    var d1 = 1 + rnd(2), d2 = 1 + rnd(2);
    var s1 = k - 2 * d1, s2 = k - d2;
    if (s1 < 1 || s2 < 1) return null;
    /* 序列：奇数位用 s1 系，偶数位用 s2 系；第 5 位 = s1+2d1 = k */
    var arr = [s1, s2, s1 + d1, s2 + d2, '?'];
    return { arr: arr, ans: k };
  }

  function next() {
    if (gameOver) return;
    if (idx >= total) { endGame(true); return; }
    var k = 1 + rnd(8);
    var sq = null;
    for (var t = 0; t < 10 && !sq; t++) sq = genSeq(k);
    if (!sq) sq = { arr: [k, k, k, '?'], ans: k };
    var opts = [sq.ans];
    var guard = 0;
    while (opts.length < 4 && guard < 30) {
      var d = Math.max(1, sq.ans + choice([-3, -2, -1, 1, 2, 3]));
      if (opts.indexOf(d) < 0) opts.push(d);
      guard++;
    }
    for (var i = opts.length - 1; i > 0; i--) {
      var j = rnd(i + 1), t2 = opts[i]; opts[i] = opts[j]; opts[j] = t2;
    }
    current = { arr: sq.arr, ansIdx: opts.indexOf(sq.ans), opts: opts };
    render();
  }

  function answer(i) {
    if (gameOver || !current) return;
    var ok = i === current.ansIdx;
    var correctVal = current.opts[current.ansIdx];
    if (ok) {
      correct++; score += 10;
    } else {
      wrong++; lives--;
      if (lives <= 0) { endGame(false); return; }
    }
    WG_Data.recordAnswer({ q: current.arr.join(', '), topic: '数列', correct: ok, timeMs: Date.now() });
    idx++;
    if (onStats) onStats(stats());
    if (idx >= total) { endGame(true); return; }
    next();
  }

  function render() {
    var box = document.getElementById('customArea');
    var html = '<div style="border:1px solid var(--rule);border-radius:16px;background:linear-gradient(160deg,var(--bg3),var(--bg2));padding:1.2rem 1.3rem;">';
    html += '<div style="font-size:0.78rem;color:var(--gold);letter-spacing:0.14em;margin-bottom:0.4rem;">数列挑战 · 第 ' + (idx + 1) + '/' + total + ' 题</div>';
    html += '<p style="font-size:0.85rem;color:var(--muted);margin-bottom:0.9rem;">找出数列规律，选出 "?" 处应填的数</p>';
    /* 数列条 */
    html += '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center;margin-bottom:1rem;">';
    current.arr.forEach(function (x, i) {
      var isQ = x === '?';
      html += '<div style="min-width:44px;padding:0.6rem 0.4rem;border-radius:10px;text-align:center;font-size:1.1rem;font-weight:700;' +
        (isQ ? 'background:rgba(166,104,0,.12);border:2px dashed var(--gold);color:var(--gold);' : 'background:var(--bg2);border:1px solid var(--rule);') + '">' + x + '</div>';
    });
    html += '</div>';
    /* 选项 */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">';
    var letters = ['A', 'B', 'C', 'D'];
    current.opts.forEach(function (v, i) {
      html += '<button class="btn" data-si="' + i + '" style="font-size:1rem;font-weight:700;padding:0.6rem 0.4rem;">' + letters[i] + '. ' + v + '</button>';
    });
    html += '</div>';
    html += '</div>';
    box.innerHTML = html;
    box.querySelectorAll('[data-si]').forEach(function (btn) {
      btn.addEventListener('click', function () { answer(+btn.dataset.si); });
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
      msg: win ? '规律全看破，数列大师！' : '看破了 ' + correct + '/' + total + ' 个规律'
    });
  }

  return { start: start, stop: function () {} };
})();
