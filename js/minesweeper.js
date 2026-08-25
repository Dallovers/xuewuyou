/* ============ 稳过 · 高数扫雷引擎（关卡 + 三星评分 + 数据记录） ============ */
'use strict';

var WG_Game = (function () {
  var R, C, M, grid, levelCfg, lives, score, combo, maxCombo, revealedCnt, flagsCnt, elapsed;
  var started, gameOver, activeEdit, timerId, mistakes, correct, wrong, viewed;
  var onStats, onEnd, onWrong;
  var devMinesPlaced = false;
  var boardEl, els = {};

  var NUM_COLORS = [null, 'n1','n2','n3','n4','n5','n6','n7','n8'];
  var FLAG_SVG = '<svg viewBox="0 0 24 24"><path d="M6 3v18" stroke="#6ea8ff" stroke-width="2.2" stroke-linecap="round"/><path d="M6 4h11l-3 4.2 3 4.2H6z" fill="#6ea8ff"/></svg>';
  var MINE_SVG = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="#ff6b6b"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" stroke="#ff6b6b" stroke-width="1.8" stroke-linecap="round"/></svg>';

  function bind() {
    boardEl = document.getElementById('board');
    els = {
      mines: document.getElementById('stMines'),
      time: document.getElementById('stTime'),
      combo: document.getElementById('stCombo'),
      stars: document.getElementById('stStars'),
      lives: document.getElementById('stLives'),
      solved: document.getElementById('stSolved')
    };
    boardEl.addEventListener('click', onBoardClick);
    boardEl.addEventListener('contextmenu', onBoardRight);
  }

  /* ---------- 开始一关 ---------- */
  function start(cfg, cb) {
    levelCfg = cfg;
    R = cfg.rows; C = cfg.cols; M = cfg.mines;
    onStats = cb.onStats; onEnd = cb.onEnd; onWrong = cb.onWrong;
    grid = [];
    for (var r = 0; r < R; r++) {
      grid[r] = [];
      for (var c = 0; c < C; c++) {
        grid[r][c] = { mine: false, open: false, flag: false, detonated: false,
                       count: 0, problem: null, verified: false, wrong: false, viewed: false };
      }
    }
    started = false; gameOver = false;
    lives = 3; score = 0; combo = 0; maxCombo = 0;
    revealedCnt = 0; flagsCnt = 0; elapsed = 0;
    mistakes = 0; correct = 0; wrong = 0; viewed = 0;
    activeEdit = null;
    devMinesPlaced = false;
    if (timerId) { clearInterval(timerId); timerId = null; }
    render();
    if (onStats) onStats(stats());
  }

  function stats() {
    return {
      minesLeft: M - flagsCnt,
      time: elapsed,
      combo: combo,
      starsGoal: '☆☆☆',
      lives: lives,
      solved: correct,
      score: score
    };
  }

  function fmtTime(s) {
    var m = Math.floor(s / 60), sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function inGrid(r, c) { return r >= 0 && r < R && c >= 0 && c < C; }
  var DR = [-1,-1,-1,0,0,1,1,1], DC = [-1,0,1,-1,1,-1,0,1];
  function nbList(r, c) {
    var out = [];
    for (var i = 0; i < 8; i++) {
      var nr = r + DR[i], nc = c + DC[i];
      if (inGrid(nr, nc)) out.push([nr, nc]);
    }
    return out;
  }

  function placeMines(safeR, safeC) {
    var pos = [];
    for (var r = 0; r < R; r++)
      for (var c = 0; c < C; c++) {
        if (r === safeR && c === safeC) continue;
        var isNb = false;
        for (var i = 0; i < 8; i++)
          if (r + DR[i] === safeR && c + DC[i] === safeC) { isNb = true; break; }
        if (!isNb) pos.push([r, c]);
      }
    for (var j = pos.length - 1; j > 0; j--) {
      var k = rnd(j + 1), t = pos[j]; pos[j] = pos[k]; pos[k] = t;
    }
    for (var m = 0; m < M; m++) grid[pos[m][0]][pos[m][1]].mine = true;
    for (var rr = 0; rr < R; rr++)
      for (var cc = 0; cc < C; cc++) {
        var cnt = 0;
        for (var n = 0; n < 8; n++) {
          var nr = rr + DR[n], nc = cc + DC[n];
          if (inGrid(nr, nc) && grid[nr][nc].mine) cnt++;
        }
        grid[rr][cc].count = cnt;
      }
  }

  function startTimer() {
    if (timerId) return;
    timerId = setInterval(function () {
      elapsed++;
      if (onStats) onStats(stats());
    }, 1000);
  }

  /* ---------- 翻开 ---------- */
  function reveal(r, c) {
    if (gameOver || activeEdit) return;
    var cell = grid[r][c];
    if (cell.flag) return;
    if (cell.open) {
      if (cell.verified && cell.count > 0) chord(r, c);
      return;
    }
    if (!started) {
      started = true;
      if (!devMinesPlaced) placeMines(r, c);
      startTimer();
    }
    cell.open = true;
    if (cell.mine) { hitMine(r, c); render(); return; }
    revealedCnt++;
    if (cell.count === 0) flood(r, c);
    else cell.problem = genProblem(cell.count, levelCfg.kw, levelCfg.diff);
    render();
    checkWin();
  }

  function flood(r, c) {
    var q = [[r, c]];
    while (q.length) {
      var cur = q.pop();
      var nbs = nbList(cur[0], cur[1]);
      for (var i = 0; i < nbs.length; i++) {
        var nb = grid[nbs[i][0]][nbs[i][1]];
        if (!nb.open && !nb.mine && !nb.flag) {
          nb.open = true;
          revealedCnt++;
          if (nb.count === 0) q.push(nbs[i]);
          else nb.problem = genProblem(nb.count, levelCfg.kw, levelCfg.diff);
        }
      }
    }
  }

  function hitMine(r, c) {
    grid[r][c].detonated = true;
    mistakes++;
    if (dev().invincible) {
      toast('💥 踩雷（开发者模式：不掉血）', 'bad');
    } else {
      lives--;
      toast('💥 踩雷了！剩余生命 ' + lives, 'bad');
      if (lives <= 0) endGame(false, '踩雷了，生命耗尽');
    }
    if (onStats) onStats(stats());
  }

  /* 开发者模式：一键通关（翻开所有安全格） */
  function devWin() {
    if (gameOver) return;
    if (!started) { started = true; placeMines(0, 0); startTimer(); }
    for (var r = 0; r < R; r++)
      for (var c = 0; c < C; c++) {
        var cell = grid[r][c];
        if (!cell.mine && !cell.open) {
          cell.open = true;
          revealedCnt++;
          if (cell.count > 0) cell.problem = genProblem(cell.count, levelCfg.kw, levelCfg.diff);
        }
      }
    render();
    checkWin();
  }

  function dev() { var d = WG_Data.get(); return d.dev || {}; }

  function revealAllMines() {
    for (var r = 0; r < R; r++)
      for (var c = 0; c < C; c++)
        if (grid[r][c].mine && !grid[r][c].detonated) grid[r][c].open = true;
  }

  /* ---------- 答题 ---------- */
  function submitAnswer(r, c, val) {
    var cell = grid[r][c];
    if (!cell.problem || cell.verified || gameOver) return;
    cell.verified = true;
    var ok = val === cell.problem.answer;
    if (ok) {
      correct++; combo++; maxCombo = Math.max(maxCombo, combo);
      var gain = 10 + combo * 2;
      score += gain;
      toast('✓ 正确！+' + gain + ' 分', 'ok');
      WG_Data.recordAnswer({ q: cell.problem.text, topic: cell.problem.topic, correct: true, timeMs: Date.now() });
    } else {
      wrong++; combo = 0; cell.wrong = true; mistakes++;
      lives--;
      toast('✗ 答错了，答案应为 ' + cell.problem.answer, 'bad');
      WG_Data.recordAnswer({ q: cell.problem.text, topic: cell.problem.topic, correct: false, timeMs: Date.now() });
      if (onWrong) onWrong(cell.problem.text, val, cell.problem.answer);
      if (lives <= 0) { endGame(false, '答错太多，生命耗尽'); return; }
    }
    render();
    if (onStats) onStats(stats());
  }

  function viewAnswer(r, c) {
    var cell = grid[r][c];
    if (!cell.problem || cell.verified || gameOver) return;
    cell.verified = true; cell.viewed = true; viewed++; combo = 0; mistakes++;
    lives--;
    toast('答案：' + cell.problem.answer + '（查看答案 −1 生命）', 'bad');
    if (lives <= 0) { endGame(false, '生命耗尽'); return; }
    render();
    if (onStats) onStats(stats());
  }

  /* ---------- 连扫 ---------- */
  function chord(r, c) {
    var cell = grid[r][c];
    var fl = 0, nbs = nbList(r, c);
    for (var i = 0; i < nbs.length; i++) if (grid[nbs[i][0]][nbs[i][1]].flag) fl++;
    if (fl !== cell.count) return;
    for (var j = 0; j < nbs.length; j++) {
      var nb = grid[nbs[j][0]][nbs[j][1]];
      if (!nb.open && !nb.flag) reveal(nbs[j][0], nbs[j][1]);
    }
    render();
    checkWin();
  }

  /* ---------- 胜负与星级 ---------- */
  function checkWin() {
    if (gameOver) return;
    if (revealedCnt === R * C - M) endGame(true);
  }

  function calcStars(win) {
    if (!win) return 0;
    var stars = 1;
    if (mistakes <= 2 && elapsed <= levelCfg.timeLimit) stars = 2;
    if (mistakes === 0 && elapsed <= levelCfg.timeLimit) stars = 3;
    return stars;
  }

  function endGame(win, failMsg) {
    if (gameOver) return;
    gameOver = true;
    if (timerId) { clearInterval(timerId); timerId = null; }
    if (!win) revealAllMines();
    var stars = win ? calcStars(true) : 0;
    var result = {
      win: win, stars: stars, time: elapsed, score: score,
      correct: correct, wrong: wrong, viewed: viewed, maxCombo: maxCombo,
      accuracy: correct + wrong > 0 ? Math.round(correct / (correct + wrong) * 100) : 100,
      msg: win ? (stars === 3 ? '零失误通关，卷王本卷！' : stars === 2 ? '通关！再稳一点就满星' : '通关！') : (failMsg || '挑战失败')
    };
    render();
    if (onEnd) onEnd(result);
  }

  /* ---------- 渲染 ---------- */
  function cellHTML(r, c) {
    var cell = grid[r][c];
    if (!cell.open) {
      if (cell.flag) return '<div class="cell" data-r="' + r + '" data-c="' + c + '">' + FLAG_SVG + '</div>';
      if (dev().showMines && cell.mine) return '<div class="cell dev-mine" data-r="' + r + '" data-c="' + c + '">' + MINE_SVG + '</div>';
      return '<div class="cell" data-r="' + r + '" data-c="' + c + '"></div>';
    }
    if (cell.detonated) return '<div class="cell open detonated" data-r="' + r + '" data-c="' + c + '">' + MINE_SVG + '</div>';
    if (cell.mine && gameOver) return '<div class="cell open mine-show" data-r="' + r + '" data-c="' + c + '">' + MINE_SVG + '</div>';
    if (cell.count === 0) return '<div class="cell open empty" data-r="' + r + '" data-c="' + c + '"></div>';
    if (activeEdit && activeEdit.r === r && activeEdit.c === c) {
      return '<div class="cell open problem" data-r="' + r + '" data-c="' + c + '"><input class="cell-input" type="text" inputmode="numeric" autocomplete="off" data-editing="1"></div>';
    }
    if (cell.problem && !cell.verified) {
      return '<div class="cell open problem" data-r="' + r + '" data-c="' + c + '" title="' + cell.problem.text + '"><span class="prob">' + cell.problem.text + '</span></div>';
    }
    var cls = 'cell open verified' + (cell.wrong ? ' wrong' : '') + (cell.viewed ? ' viewed' : '');
    var badge = (cell.wrong ? '<span class="badge">✗</span>' : '') + (cell.viewed ? '<span class="badge">?</span>' : '');
    return '<div class="' + cls + '" data-r="' + r + '" data-c="' + c + '"><span class="num ' + NUM_COLORS[cell.count] + '">' + cell.count + '</span>' + badge + '</div>';
  }

  function render() {
    if (!started && dev().showMines && !devMinesPlaced) {
      placeMines(0, 0);
      devMinesPlaced = true;
    }
    var html = '';
    for (var r = 0; r < R; r++) for (var c = 0; c < C; c++) html += cellHTML(r, c);
    boardEl.style.gridTemplateColumns = 'repeat(' + C + ', minmax(0, 1fr))';
    if (C > 14) {
      boardEl.style.width = 'min(96vw, 860px)';
      boardEl.style.maxWidth = '';
    } else {
      boardEl.style.width = (Math.min(50, 42 + 3 * C) * C) + 'px';
      boardEl.style.maxWidth = '96vw';
    }
    boardEl.innerHTML = html;
    if (activeEdit) {
      var inp = boardEl.querySelector('input[data-editing]');
      if (inp) {
        inp.focus();
        inp.addEventListener('keydown', inputKeydown);
        inp.addEventListener('blur', function () { if (activeEdit) { activeEdit = null; render(); } });
      }
    }
    if (onStats) onStats(stats());
  }

  function inputKeydown(e) {
    if (!activeEdit) return;
    var val = parseInt(e.target.value, 10);
    if (e.key === 'Enter') {
      if (!isNaN(val)) {
        var r = activeEdit.r, c = activeEdit.c;
        activeEdit = null;
        submitAnswer(r, c, val);
      }
    } else if (e.key === 'Escape') {
      activeEdit = null; render();
    }
  }

  /* ---------- 事件 ---------- */
  function onBoardClick(e) {
    var cellEl = e.target.closest ? e.target.closest('.cell') : null;
    if (!cellEl || !boardEl.contains(cellEl)) return;
    var r = +cellEl.dataset.r, c = +cellEl.dataset.c;
    if (cellEl.querySelector('input')) return;
    var cell = grid[r][c];
    if (activeEdit) { activeEdit = null; render(); return; }
    if (!cell.open) { reveal(r, c); return; }
    if (cell.problem && !cell.verified) {
      activeEdit = { r: r, c: c };
      render();
      return;
    }
    if (cell.verified && cell.count > 0) chord(r, c);
  }

  function onBoardRight(e) {
    e.preventDefault();
    if (gameOver || activeEdit) return;
    var cellEl = e.target.closest ? e.target.closest('.cell') : null;
    if (!cellEl || !boardEl.contains(cellEl)) return;
    var r = +cellEl.dataset.r, c = +cellEl.dataset.c;
    var cell = grid[r][c];
    if (cell.open) return;
    cell.flag = !cell.flag;
    flagsCnt += cell.flag ? 1 : -1;
    render();
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg, type) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.className = type || '';
    requestAnimationFrame(function () { el.classList.add('show'); });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1500);
  }

  function stop() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  return { start: start, bind: bind, fmtTime: fmtTime, render: render, devWin: devWin, stop: stop };
})();
