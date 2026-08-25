/* ============ 学无忧 · 快答 / 自习刷题引擎（支持题库与数学生成） ============ */
'use strict';

var WG_Quiz = (function () {
  var cfg, timerId, timeLeft, lives, score, combo, maxCombo, correct, wrong;
  var current, gameOver, onStats, onEnd, onWrong, startAt, pendingQ, bankQueue;

  function start(c, cb) {
    cfg = c;
    onStats = cb.onStats; onEnd = cb.onEnd; onWrong = cb.onWrong;
    var isPractice = c.type === 'practice';
    timeLeft = isPractice ? 0 : (c.quizTime || 60);
    lives = isPractice ? Infinity : (c.lives || 3);
    score = 0; combo = 0; maxCombo = 0; correct = 0; wrong = 0;
    gameOver = false; current = null; startAt = Date.now();
    if (timerId) { clearInterval(timerId); timerId = null; }
    if (pendingQ) { clearTimeout(pendingQ); pendingQ = null; }
    /* 题库去重：整场不重复 */
    bankQueue = [];
    if (c.bank === 'ENGLISH') bankQueue = ENGLISH_BANK.slice();
    else if (c.bank === 'MATH') bankQueue = MATH_BANK.slice();
    shuffle(bankQueue);
    if (!isPractice) {
      timerId = setInterval(tick, 1000);
    }
    nextQuestion();
    if (onStats) onStats(stats());
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = rnd(i + 1), t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
  }

  function tick() {
    timeLeft--;
    if (timeLeft <= 0) { timeLeft = 0; end(true, '时间到！'); return; }
    if (onStats) onStats(stats());
  }

  function pickBank() {
    if (cfg.bank === 'ENGLISH' || cfg.bank === 'MATH') return bankQueue.pop();
    return null;
  }

  /* 出一道四选一选择题 */
  function nextQuestion() {
    if (gameOver) return;
    var text, ansVal, opts, topic;
    var bq = pickBank();
    if (bq) {
      text = bq.q; topic = bq.topic || cfg.kw;
      if (bq.opts) {
        /* 英语题：自带四个选项，答案按字符串匹配 */
        opts = bq.opts.slice();
        var ansStr = opts[bq.ans];
        for (var i = opts.length - 1; i > 0; i--) {
          var j = rnd(i + 1), t = opts[i]; opts[i] = opts[j]; opts[j] = t;
        }
        ansVal = ansStr;
      } else {
        /* 数学题：答案 1-8，生成数字干扰项 */
        ansVal = bq.ans;
        opts = [ansVal];
        var guard = 0;
        while (opts.length < 4 && guard < 30) {
          var d = 1 + rnd(8);
          if (opts.indexOf(d) < 0) opts.push(d);
          guard++;
        }
      }
    } else {
      var k = 1 + rnd(8);
      var p = genProblem(k, cfg.kw, cfg.diff);
      text = p.text; ansVal = p.answer; topic = p.topic;
      opts = [ansVal];
      var guard2 = 0;
      while (opts.length < 4 && guard2 < 30) {
        var d2 = 1 + rnd(8);
        if (opts.indexOf(d2) < 0) opts.push(d2);
        guard2++;
      }
    }
    var ansIdx = opts.indexOf(ansVal);
    current = { text: text, opts: opts, ansIdx: ansIdx, topic: topic };
    renderQuestion();
  }

  function answer(i) {
    if (gameOver || !current) return;
    var ok = i === current.ansIdx;
    var correctVal = current.opts[current.ansIdx];
    var isPractice = cfg.type === 'practice';
    if (ok) {
      correct++; combo++; maxCombo = Math.max(maxCombo, combo);
      score += 10 + combo * 2;
      WG_Data.recordAnswer({ q: current.text, topic: current.topic, correct: true, timeMs: Date.now() });
      feed('✓ 正确！+' + (10 + combo * 2) + ' 分', true);
    } else {
      wrong++; combo = 0;
      if (!isPractice) lives--;
      WG_Data.recordAnswer({ q: current.text, topic: current.topic, correct: false, timeMs: Date.now() });
      feed('✗ 错了，正确答案是 ' + correctVal, false);
      if (onWrong) onWrong(current.text, current.opts[i], correctVal);
      if (!isPractice && lives <= 0) { end(false, '生命耗尽'); return; }
    }
    if (onStats) onStats(stats());
    if (isPractice && correct + wrong >= (cfg.n || 10)) { end(true, ''); return; }
    if (pendingQ) clearTimeout(pendingQ);
    pendingQ = setTimeout(nextQuestion, ok ? 300 : 900);
  }

  function feed(msg, ok) {
    var el = document.getElementById('quizFeed');
    el.textContent = msg;
    el.style.color = ok ? 'var(--ok)' : 'var(--danger)';
  }

  function renderQuestion() {
    var qEl = document.getElementById('quizQ');
    var oEl = document.getElementById('quizOpts');
    qEl.textContent = current.text;
    oEl.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D'];
    current.opts.forEach(function (v, i) {
      var b = document.createElement('button');
      b.className = 'btn';
      b.style.cssText = 'font-size:1rem;font-weight:600;padding:0.7rem 0.5rem;line-height:1.5;';
      b.textContent = letters[i] + '. ' + v;
      b.addEventListener('click', function () { answer(i); });
      oEl.appendChild(b);
    });
  }

  function end(win, msg) {
    if (gameOver) return;
    gameOver = true;
    stop();
    var isPractice = cfg.type === 'practice';
    var stars = 0;
    if (win) {
      if (isPractice) {
        var acc = correct + wrong > 0 ? correct / (correct + wrong) : 1;
        stars = acc >= 0.9 ? 3 : (acc >= 0.7 ? 2 : 1);
      } else {
        stars = score >= 10 ? 3 : (score >= 6 ? 2 : 1);
      }
    }
    if (onEnd) onEnd({
      win: win, stars: stars,
      time: isPractice ? Math.round((Date.now() - startAt) / 1000) : ((cfg.quizTime || 60) - timeLeft),
      score: score, correct: correct, wrong: wrong, viewed: 0, maxCombo: maxCombo,
      accuracy: correct + wrong > 0 ? Math.round(correct / (correct + wrong) * 100) : 100,
      msg: isPractice
        ? (win ? '学习完成！正确率 ' + Math.round(correct / (correct + wrong) * 100) + '%' : msg || '挑战失败')
        : (win ? (stars === 3 ? '手速与脑力并存，卷王本卷！' : stars === 2 ? '不错！再快一点就满分' : '通关！') : (msg || '挑战失败'))
    });
  }

  function stats() {
    return {
      minesLeft: '—',
      time: cfg.type === 'practice' ? Math.round((Date.now() - startAt) / 1000) : timeLeft,
      combo: combo,
      starsGoal: '☆☆☆',
      livesText: lives === Infinity ? '∞ 不限' : undefined,
      lives: lives === Infinity ? '∞' : lives,
      solved: correct,
      score: score
    };
  }

  function stop() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    if (pendingQ) { clearTimeout(pendingQ); pendingQ = null; }
  }

  return { start: start, stop: stop };
})();
