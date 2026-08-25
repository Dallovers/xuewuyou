/* ============ 学无忧 · 逻辑门搭建引擎 ============ */
'use strict';

var WG_Logic = (function () {
  var GATES = ['AND', 'OR', 'XOR'];
  var GATE_CN = { AND: '与门(AND)', OR: '或门(OR)', XOR: '异或门(XOR)' };

  var cfg, level, lives, attempts, onStats, onEnd, gameOver;

  function gateVal(name, a, b) {
    if (name === 'AND') return a & b;
    if (name === 'OR') return a | b;
    return a ^ b; /* XOR */
  }

  /* 两级门链：X = g1(A,B)，out = g2(X, B)，返回 4 行真值表 */
  function computeTable(g1, g2) {
    var rows = [];
    for (var a = 0; a <= 1; a++)
      for (var b = 0; b <= 1; b++) {
        var x = gateVal(g1, a, b);
        rows.push(gateVal(g2, x, b));
      }
    return rows;
  }

  /* 预生成真值表唯一的所有组合（排除重复表），作为关卡 */
  function buildLevels() {
    var seen = {}, out = [];
    GATES.forEach(function (g1) {
      GATES.forEach(function (g2) {
        var rows = computeTable(g1, g2);
        var key = rows.join('');
        if (!seen[key]) {
          seen[key] = true;
          out.push({ g1: g1, g2: g2, rows: rows });
        }
      });
    });
    return out;
  }
  var LEVELS = buildLevels();

  function start(c, cb) {
    cfg = c;
    onStats = cb.onStats; onEnd = cb.onEnd;
    level = LEVELS[c.levelIndex % LEVELS.length];
    lives = c.lives || 3;
    attempts = 0; gameOver = false;
    render();
    if (onStats) onStats(stats());
  }

  function stats() {
    return {
      minesLeft: '—', time: 0, combo: 'x0',
      livesText: '尝试 ' + (lives - attempts) + ' 次',
      lives: lives - attempts, solved: attempts, score: 0
    };
  }

  function render() {
    var box = document.getElementById('customArea');
    var html = '<div style="border:1px solid var(--rule);border-radius:16px;background:linear-gradient(160deg,var(--bg3),var(--bg2));padding:1.3rem 1.4rem;">';
    html += '<div style="font-size:0.78rem;color:var(--gold);letter-spacing:0.14em;margin-bottom:0.4rem;">逻辑门电路搭建 · ' + (cfg.diff >= 3 ? '挑战' : (cfg.diff >= 2 ? '进阶' : '入门')) + '</div>';
    html += '<h3 style="font-size:1.1rem;margin-bottom:0.5rem;">两级门链：X = 门1(A,B)，输出 = 门2(X,B)</h3>';
    html += '<p style="font-size:0.82rem;color:var(--muted);margin-bottom:0.9rem;">从 与门 / 或门 / 异或门 中选两个，让输出真值表与目标一致。错误连接会"短路"哦。</p>';

    /* 真值表 */
    html += '<div style="display:inline-block;border:1px solid var(--rule-strong);border-radius:10px;overflow:hidden;margin-bottom:1rem;">';
    html += '<div style="display:flex;background:var(--bg3);"><div style="width:52px;height:34px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;">A</div><div style="width:52px;height:34px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;">B</div><div style="width:52px;height:34px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:var(--gold);">目标</div></div>';
    var ab = [[0, 0], [0, 1], [1, 0], [1, 1]];
    level.rows.forEach(function (v, i) {
      html += '<div style="display:flex;">';
      html += '<div style="width:52px;height:34px;display:flex;align-items:center;justify-content:center;border-top:1px solid var(--rule);">' + ab[i][0] + '</div>';
      html += '<div style="width:52px;height:34px;display:flex;align-items:center;justify-content:center;border-top:1px solid var(--rule);">' + ab[i][1] + '</div>';
      html += '<div style="width:52px;height:34px;display:flex;align-items:center;justify-content:center;border-top:1px solid var(--rule);color:var(--gold);font-weight:700;">' + v + '</div>';
      html += '</div>';
    });
    html += '</div>';

    /* 门选择 */
    html += '<div style="display:flex;gap:0.8rem;flex-wrap:wrap;align-items:center;margin-bottom:0.8rem;">';
    html += '<div><div style="font-size:0.78rem;color:var(--muted);margin-bottom:0.25rem;">门 1</div><select id="lg1">';
    GATES.forEach(function (g) { html += '<option value="' + g + '">' + GATE_CN[g] + '</option>'; });
    html += '</select></div>';
    html += '<div><div style="font-size:0.78rem;color:var(--muted);margin-bottom:0.25rem;">门 2</div><select id="lg2">';
    GATES.forEach(function (g) { html += '<option value="' + g + '">' + GATE_CN[g] + '</option>'; });
    html += '</select></div>';
    html += '<button class="btn primary" id="lgRun" style="align-self:flex-end;">⚡ 运行电路</button>';
    html += '</div>';
    html += '<div id="lgResult" style="font-size:0.88rem;color:var(--muted);min-height:1.6rem;line-height:1.8;"></div>';
    html += '</div>';
    box.innerHTML = html;

    box.querySelectorAll('select').forEach(function (s) { s.style.cssText = 'background:var(--bg2);color:var(--ink);border:1px solid var(--rule);border-radius:8px;padding:0.4rem 0.6rem;font-size:0.85rem;'; });
    box.querySelector('#lgRun').addEventListener('click', run);
  }

  function run() {
    if (gameOver) return;
    attempts++;
    var g1 = document.getElementById('lg1').value;
    var g2 = document.getElementById('lg2').value;
    var got = computeTable(g1, g2);
    var resEl = document.getElementById('lgResult');
    var match = got.join('') === level.rows.join('');
    if (match) {
      resEl.textContent = '💡 电路点亮！(' + GATE_CN[g1] + ' → ' + GATE_CN[g2] + ') 输出与目标完全一致。';
      resEl.style.color = 'var(--ok)';
      var stars = attempts === 1 ? 3 : (attempts === 2 ? 2 : 1);
      endGame(true, stars);
    } else {
      var wrongRows = [];
      for (var i = 0; i < 4; i++) if (got[i] !== level.rows[i]) wrongRows.push('第' + (i + 1) + '行');
      resEl.textContent = '⚡ 短路了！输出与目标不一致（' + wrongRows.join('、') + '），还剩 ' + (lives - attempts) + ' 次机会';
      resEl.style.color = 'var(--danger)';
      if (onStats) onStats(stats());
      if (attempts >= lives) endGame(false, 0);
    }
  }

  function endGame(win, stars) {
    if (gameOver) return;
    gameOver = true;
    if (onEnd) onEnd({
      win: win, stars: stars || 0, time: attempts, score: win ? stars * 40 : 0,
      correct: win ? 1 : 0, wrong: win ? 0 : 1, viewed: 0, maxCombo: 0, accuracy: 0,
      msg: win ? '电路搭对了，逻辑满分！' : '试了太多次，电路烧了'
    });
  }

  return { start: start, stop: function () {} };
})();
