/* ============ 稳过 · 应用主逻辑：路由 / 状态 / 大厅 ============ */
'use strict';

var WG_Data = (function () {
  var KEY = 'wenguo_v1';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(d) {
    localStorage.setItem(KEY, JSON.stringify(d));
    /* 登录后自动同步到云端（防抖由 syncToCloud 负责） */
    if (window.WG_SyncHook) window.WG_SyncHook();
  }

  return {
    get: function () {
      var d = load();
      if (!d.levels) d.levels = {};        /* levelId -> {stars, bestTime} */
      if (!d.nick) d.nick = '同学';
      if (!d.answers) d.answers = [];      /* 做题记录 -> 学情分析 */
      if (!d.mistakes) d.mistakes = [];    /* 错题本：[{qid, topic, question, answer, correctAns, wrongCount, lastAt}] */
      if (!d.cleared) d.cleared = [];      /* 已攻克的错题：[{qid, topic, at}]，掌握度的分母 */
      if (!d.checkin) d.checkin = [];      /* 打卡日期 */
      if (!d.profile) d.profile = null;    /* 登录信息 + 个性化需求 */
      if (!d.marks) d.marks = {};          /* 标记的题：qid -> true，跨轮次保留 */
      return d;
    },
    save: save,
    /* 标记（题目「回头再看」）：单独存一张表，换轮次、换筛选都不丢 */
    getMarks: function () {
      var d = load();
      return d.marks || {};
    },
    setMark: function (qid, on) {
      if (qid == null || qid === '') return;
      var d = load();
      if (!d.marks) d.marks = {};
      if (on) d.marks[String(qid)] = 1;
      else delete d.marks[String(qid)];
      save(d);
    },
    markCount: function () {
      var d = load();
      return Object.keys(d.marks || {}).length;
    },
    setNick: function (n) { var d = load(); d.nick = n; save(d); },
    setProfile: function (p) {
      var d = load();
      d.profile = p;
      d.nick = (p && p.nick) || d.nick;
      save(d);
    },
    saveProfilePlan: function (plan) {
      var d = load();
      if (!d.profile) d.profile = {};
      d.profile.plan = plan;
      d.profile.planAt = Date.now();
      save(d);
    },
    /* 记录一次答题：{q, topic, correct, grasp, qid, type, diff, timeMs} */
    recordAnswer: function (a) {
      var d = load();
      if (!d.answers) d.answers = [];
      var rec = {
        q: a.q || '', topic: a.topic || '综合', correct: !!a.correct,
        grasp: a.grasp || '', qid: a.qid || '', type: a.type || '',
        diff: a.diff || '', timeMs: a.timeMs || Date.now()
      };
      d.answers.push(rec);
      if (d.answers.length > 5000) d.answers = d.answers.slice(-5000);

      /* 错题本：答错 或 标记「不会」的题自动收录 */
      if (!a.correct || a.grasp === 'weak') {
        if (!d.mistakes) d.mistakes = [];
        var m = d.mistakes.find(function (x) { return x.qid === a.qid; });
        if (m) {
          m.wrongCount++;
          m.lastAt = Date.now();
          if (a.grasp === 'weak') m.markedWeak = true;
        } else {
          d.mistakes.push({
            qid: a.qid || '', topic: a.topic || '综合',
            question: a.q || '', answer: a.answer || '', correctAns: a.correctAns || '',
            wrongCount: 1, markedWeak: a.grasp === 'weak', lastAt: Date.now()
          });
        }
        if (d.mistakes.length > 500) d.mistakes = d.mistakes.slice(-500);
      }
      save(d);
    },
    /* 从错题本移除。opts.mastered 为真表示「重做答对并标记掌握了」，
       这类要留一条攻克记录，否则掌握度没有分母，永远算不出进度。 */
    removeMistake: function (qid, opts) {
      var d = load();
      if (!d.mistakes) return;
      var hit = d.mistakes.find(function (x) { return String(x.qid) === String(qid); });
      d.mistakes = d.mistakes.filter(function (x) { return String(x.qid) !== String(qid); });
      if (hit && opts && opts.mastered) {
        if (!d.cleared) d.cleared = [];
        if (!d.cleared.some(function (x) { return String(x.qid) === String(qid); })) {
          d.cleared.push({ qid: String(qid), topic: hit.topic || '综合', at: Date.now() });
          if (d.cleared.length > 800) d.cleared = d.cleared.slice(-800);
        }
      }
      save(d);
    },
    /* 错题按知识点归集成「错题集」，带掌握度。
       掌握度 = 已攻克 /（已攻克 + 仍未攻克），没有任何记录时算 0。 */
    mistakeGroups: function () {
      var d = load();
      var ms = d.mistakes || [];
      var cl = d.cleared || [];
      var g = {};
      function slot(t) {
        var k = t || '综合';
        if (!g[k]) g[k] = { name: k, items: [], cleared: 0 };
        return g[k];
      }
      ms.forEach(function (m) { slot(m.topic).items.push(m); });
      cl.forEach(function (c) { slot(c.topic).cleared++; });
      return Object.keys(g).map(function (k) {
        var v = g[k];
        var open = v.items.length;
        var base = open + v.cleared;
        /* 新错的排前面，同时把反复错的顶上来 */
        v.items.sort(function (a, b) {
          var dw = (b.wrongCount || 1) - (a.wrongCount || 1);
          return dw !== 0 ? dw : (b.lastAt || 0) - (a.lastAt || 0);
        });
        return {
          name: v.name, items: v.items, open: open, cleared: v.cleared,
          mastery: base ? Math.round(v.cleared / base * 100) : 0
        };
      }).sort(function (a, b) {
        /* 未攻克多的先看，其次掌握度低的先看 */
        return b.open - a.open || a.mastery - b.mastery;
      });
    },
    /* 学情分析：按知识点统计正确率、错题分布、把握程度 */
    analyze: function () {
      var d = load();
      var ans = d.answers || [];
      var byTopic = {};
      var total = { c: 0, w: 0, weak: 0, fuzzy: 0, master: 0 };
      ans.forEach(function (a) {
        var t = a.topic || '综合';
        if (!byTopic[t]) byTopic[t] = { c: 0, w: 0 };
        byTopic[t][a.correct ? 'c' : 'w']++;
        total[a.correct ? 'c' : 'w']++;
        if (a.grasp === 'master') total.master++;
        else if (a.grasp === 'fuzzy') total.fuzzy++;
        else if (a.grasp === 'weak') total.weak++;
      });
      var topics = Object.keys(byTopic).map(function (t) {
        var v = byTopic[t];
        var done = v.c + v.w;
        return {
          name: t, correct: v.c, wrong: v.w, total: done,
          accuracy: done ? Math.round(v.c / done * 100) : 0
        };
      }).sort(function (a, b) { return b.total - a.total; });
      return { answers: ans.length, topics: topics, mistakes: (d.mistakes || []).length, total: total };
    },
    recordLevel: function (levelId, stars, time) {
      var d = load();
      if (!d.levels) d.levels = {};
      var cur = d.levels[levelId];
      if (!cur || stars > cur.stars || (stars === cur.stars && time < cur.bestTime)) {
        d.levels[levelId] = { stars: stars, bestTime: time, at: Date.now() };
      }
      save(d);
    },
    /* 整体替换（登录后云端合并结果写回本地） */
    replaceAll: function (d) {
      if (d && typeof d === 'object') save(d);
    }
  };
})();

var WG_App = (function () {
  var state = {
    view: 'home',
    continentId: 'study',
    currentLevel: null,
    currentIndex: -1,
    /* 「再来一组」怎么重开这一局。各入口自己登记，
       因为错题重做／随机组卷／模块刷题的关卡都是临时拼的，
       按 id 回查 CONTINENTS 找不到，也带不回筛选条件。 */
    replay: null
  };
  var els = {};

  function $ (id) { return document.getElementById(id); }
  function showView(name) {
    /* 离开自习室视图时通知 StudyRoom 暂停计时（如去刷题、切到其他页面） */
    if (state.view === 'study' && name !== 'study' &&
        window.StudyRoom && typeof window.StudyRoom.onViewHidden === 'function') {
      window.StudyRoom.onViewHidden();
    }
    ['home', 'bank', 'module', 'study', 'wenku', 'game', 'report', 'mistakes', 'ai', 'onboard'].forEach(function (v) {
      var el = $('view-' + v);
      if (el) el.classList.toggle('hidden', v !== name);
    });
    /* 导航高亮 */
    if (['home', 'bank', 'study', 'wenku', 'report', 'mistakes', 'ai'].indexOf(name) >= 0) {
      var links = document.querySelectorAll('#topnav a');
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-nav') === name);
      });
    }
    state.view = name;
  }

  /* ---------- 模块详情（子模块 + 题数选择 + 筛选） ---------- */
  /* 0 = 不限：默认把筛选后的题全放进一轮，答题卡里题库有多少就列多少 */
  var currentCount = 0;
  /* 筛选条状态：难度（''=不限）与作答形态（'all'=不限） */
  var currentDiff = '';
  var currentForm = 'all';

  /* 判断一道题落在哪种作答形态，与 gaoshu.js 的口径保持一致 */
  function formOf(p) {
    if (typeof WG_QE !== 'undefined' && WG_QE.enhance) WG_QE.enhance(p);
    return (p._qe && p._qe.kind) || 'view';
  }

  function matchForm(p, form) {
    if (!form || form === 'all') return true;
    var k = formOf(p);
    if (form === 'gradable') return k === 'choice' || k === 'fill';
    if (form === 'choice') return k === 'choice' || k === 'choice-open';
    return k === form;
  }

  /* 模块覆盖哪些知识点：topicList 直接用，只给 subject 的（综合刷题）
     要按学科反查题库，否则题量算成 0，筛选对综合模块整个失效。 */
  function topicKeysOf(level) {
    if (!level) return [];
    if (level.topicList && level.topicList.length) return level.topicList.slice();
    if (!GAOSHU_BANK) return [];
    var keys = Object.keys(GAOSHU_BANK);
    if (level.subject) {
      keys = keys.filter(function (tk) {
        var td = GAOSHU_BANK[tk];
        return td && td.subject === level.subject;
      });
    }
    return keys;
  }

  /* 当前筛选条件下某知识点还剩多少题，用于卡片上的实时题量 */
  function countTopic(tk) {
    var td = GAOSHU_BANK && GAOSHU_BANK[tk];
    if (!td || !td.problems) return 0;
    return td.problems.filter(function (p) {
      if (currentDiff && p.difficulty !== currentDiff) return false;
      return matchForm(p, currentForm);
    }).length;
  }
  function renderModule(level) {
    stopGames();
    /* 换模块时把筛选条件清干净，别把上一个模块的筛选带过来 */
    if (state.currentModule !== level) { currentDiff = ''; currentForm = 'all'; }
    state.currentModule = level;
    $('modTitle').textContent = level.name;
    $('modSub').textContent = (level.group || '模块') + ' · 选择子模块开始刷题';
    var subGrid = $('subGrid');
    if (!subGrid) { showView('home'); return; }
    var html = '';
    /* 题量按当前筛选条件实时计算，避免点进去才发现没题 */
    var keys = topicKeysOf(level);
    var allCount = 0;
    keys.forEach(function (tk) { allCount += countTopic(tk); });
    if (!keys.length) allCount = moduleCount(level);
    html += '<div class="mod-card' + (allCount === 0 ? ' mod-card-empty' : '') + '" data-mode="all">' +
      '<div class="mod-tag">混合</div>' +
      '<div class="mod-name">全部知识点</div>' +
      '<div class="mod-meta">' + (allCount === 0 ? '当前筛选下无题' : '共 ' + allCount + ' 题，随机混合抽题') + '</div>' +
      '<div class="mod-go">' + (allCount === 0 ? '放宽筛选条件' : '开始练习 →') + '</div></div>';
    /* 子模块 */
    keys.forEach(function (tk) {
      var cnt = countTopic(tk);
      var total = GAOSHU_BANK[tk] ? GAOSHU_BANK[tk].problems.length : 0;
      var filtered = (currentDiff || currentForm !== 'all');
      html += '<div class="mod-card' + (cnt === 0 ? ' mod-card-empty' : '') + '" data-topic="' + tk + '">' +
        '<div class="mod-tag">' + (level.group || '') + '</div>' +
        '<div class="mod-name">' + tk + '</div>' +
        '<div class="mod-meta">' + cnt + ' 题' +
        (filtered && total !== cnt ? ' <span class="mod-meta-dim">/ 全部 ' + total + '</span>' : '') +
        '</div>' +
        '<div class="mod-go">' + (cnt === 0 ? '放宽筛选条件' : '开始练习 →') + '</div></div>';
    });
    subGrid.innerHTML = html;
    syncFilterUI();
    showView('module');
  }

  /* 同步筛选条按钮高亮 + 命中数量提示 */
  function syncFilterUI() {
    var box = $('modFilter');
    if (!box) return;
    box.querySelectorAll('button[data-diff]').forEach(function (b) {
      b.classList.toggle('active', (b.getAttribute('data-diff') || '') === currentDiff);
    });
    box.querySelectorAll('button[data-form]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-form') === currentForm);
    });
    var hint = $('modFilterHint');
    if (!hint) return;
    var lv = state.currentModule;
    var tks = topicKeysOf(lv);
    if (!tks.length) { hint.textContent = ''; return; }
    var hit = 0, total = 0;
    tks.forEach(function (tk) {
      hit += countTopic(tk);
      total += GAOSHU_BANK[tk] ? GAOSHU_BANK[tk].problems.length : 0;
    });
    if (!currentDiff && currentForm === 'all') {
      hint.textContent = '共 ' + total + ' 题';
    } else {
      hint.textContent = '筛选命中 ' + hit + ' / ' + total + ' 题' +
        (hit === 0 ? '（条件太窄，试试放宽）' : '');
    }
  }

  /* 从模块进入刷题 */
  function startFromModule(mode, topic) {
    stopGames();
    var lv = state.currentModule;
    var lvl = {
      id: lv.id, name: lv.name, type: 'gaoshu', group: lv.group,
      topicList: lv.topicList, subject: lv.subject, diff: lv.diff
    };
    if (mode === 'all') {
      /* 混合刷：用 topicList 或 subject */
    } else if (topic) {
      lvl.topic = topic;
      delete lvl.topicList;
      delete lvl.subject;
    }
    /* 把筛选条件带进刷题引擎。难度以筛选条为准：选了就按它筛，
       选「不限」就得删掉关卡自带的 diff，否则引擎仍按「提高」筛，
       和卡片上按不限难度算出来的题量对不上。 */
    if (currentDiff) lvl.diff = currentDiff;
    else delete lvl.diff;
    lvl.form = currentForm;
    /* 可用题量按筛选后算，「全部」不会再要到筛掉的题 */
    var avail = topic ? countTopic(topic) : (function () {
      var s = 0;
      topicKeysOf(lv).forEach(function (tk) { s += countTopic(tk); });
      return s || moduleCount(lv);
    })();
    lvl.n = currentCount > 0 ? Math.min(currentCount, avail) : avail;
    state.currentLevel = lvl;
    state.currentIndex = 0;
    state.backView = 'module';
    /* 再来一组：按当前筛选条件重新抽一批题 */
    state.replay = function () { startFromModule(mode, topic); };
    var fname = { all: '', gradable: '可判分', choice: '选择', fill: '填空', step: '解答证明' }[currentForm] || '';
    var badge = [currentDiff, fname].filter(Boolean).join(' · ');
    $('gameTitle').textContent = lv.name + (topic ? ' · ' + topic : ' · 综合');
    $('gameSub').textContent = (lv.group || '') + ' · 题库刷题' + (badge ? ' · ' + badge : '');
    $('goalHint').textContent = (currentCount > 0 ? '本轮 ' + lvl.n + ' 道题' : '共 ' + lvl.n + ' 道题 · 不限量')
      + ' · 可随时跳题 / 标记 / 结束本轮';
    if ($('stStars')) $('stStars').textContent = '☆☆☆';
    $('board').classList.add('hidden');
    $('quizArea').classList.add('hidden');
    $('customArea').classList.remove('hidden');
    /* 左侧栏：进度归零 + 目录高亮到当前章节 */
    resetExamProgress();
    renderExamNav({ level: lv, topic: topic || null, mode: mode });
    closeExamSide();
    showView('game');
    WG_Gaoshu.start(lvl, { onStats: renderStats, onEnd: onGameEnd });
  }

  /* 计算模块真实题量 */
  function moduleCount(l) {
    if (l.bank === 'ENGLISH_CET4' && typeof ENGLISH_CET4_BANK !== 'undefined') return ENGLISH_CET4_BANK.length;
    if (l.bank === 'ENGLISH_CET6' && typeof ENGLISH_CET6_BANK !== 'undefined') return ENGLISH_CET6_BANK.length;
    if (l.bank === 'IELTS_SYNONYM' && typeof IELTS_SYNONYM_BANK !== 'undefined') return IELTS_SYNONYM_BANK.length;
    if (l.bank === 'IELTS_VOCAB' && typeof IELTS_VOCAB_BANK !== 'undefined') return IELTS_VOCAB_BANK.length;
    if (l.bank === 'IELTS_WRITING' && typeof IELTS_WRITING_BANK !== 'undefined') return IELTS_WRITING_BANK.length;
    if (!GAOSHU_BANK) return l.n || 10;
    var count = 0;
    if (l.topicList) {
      l.topicList.forEach(function (tk) {
        var td = GAOSHU_BANK[tk];
        if (td && td.problems) count += td.problems.length;
      });
    } else if (l.topic) {
      var td2 = GAOSHU_BANK[l.topic];
      if (td2) count = td2.problems.length;
    } else if (l.subject) {
      Object.keys(GAOSHU_BANK).forEach(function (tk) {
        var td3 = GAOSHU_BANK[tk];
        if (td3 && td3.subject === l.subject) count += td3.problems.length;
      });
    }
    return count || (l.n || 10);
  }

  /* 学科英文副标题与图标：首页大入口用 */
  var SUBJECT_META = {
    study: { en: 'Mathematics', icon: '📐' },
    english: { en: 'CET-4 / CET-6', icon: '🔤' },
    ielts: { en: 'IELTS', icon: '🌍' }
  };

  /* 统计某学科的关卡数、总题量、子板块名、已练进度 */
  function subjectSummary(cont) {
    var data = WG_Data.get();
    var lvs = getLevelsOf(cont.id);
    var subs = [];
    var total = 0, practiced = 0, stars = 0;
    lvs.forEach(function (l) {
      var g = l.group || '通用';
      if (subs.indexOf(g) < 0) subs.push(g);
      total += moduleCount(l);
      var rec = data.levels[l.id];
      if (rec) { practiced++; stars += (rec.stars || 0); }
    });
    subs.sort(function (a, b) {
      var order = GROUP_ORDER[cont.id] || [];
      var ia = order.indexOf(a), ib = order.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return { levels: lvs, subs: subs, total: total, practiced: practiced, stars: stars };
  }

  /* 子板块排序表（首页与题库共用） */
  var GROUP_ORDER = {
    'study': ['高等数学', '线性代数', '概率论'],
    'english': ['四级', '六级'],
    'ielts': ['雅思阅读', '雅思词汇', '雅思写作']
  };

  /* ---------- 首页：学科大入口 ---------- */
  /* 首页每个学科只出一张大卡，点进去才展开子板块，避免首页一屏塞十几张小卡 */
  function renderSubjectPortal(containerId) {
    var box = $(containerId);
    if (!box) return;
    var conts = CONTINENTS.filter(function (c) { return c.unlocked && getLevelsOf(c.id).length > 0; });

    box.innerHTML = conts.map(function (cont) {
      var s = subjectSummary(cont);
      var meta = SUBJECT_META[cont.id] || { en: '', icon: '📘' };
      var subChips = s.subs.map(function (g) {
        return '<span class="sp-sub">' + escHtml(g) + '</span>';
      }).join('');
      var badge = s.practiced
        ? '<span class="sp-badge">已练 ' + s.practiced + '/' + s.levels.length + '</span>'
        : '';
      return '<article class="sp-card" data-continent="' + cont.id + '" tabindex="0" role="button" ' +
        'aria-label="进入' + escHtml(cont.name) + '板块" style="--sp-color:' + cont.color + ';">' +
        badge +
        '<div class="sp-head">' +
        '<div class="sp-icon">' + meta.icon + '</div>' +
        '<div class="sp-title-wrap">' +
        '<h3 class="sp-name">' + escHtml(cont.name) + '</h3>' +
        '<span class="sp-en">' + escHtml(meta.en) + '</span>' +
        '</div>' +
        '</div>' +
        '<p class="sp-desc">' + escHtml(cont.desc || '') + '</p>' +
        '<div class="sp-subs">' + subChips + '</div>' +
        '<div class="sp-foot">' +
        '<div class="sp-stat"><b>' + s.subs.length + '</b><span>子板块</span></div>' +
        '<div class="sp-stat"><b>' + s.levels.length + '</b><span>练习模块</span></div>' +
        '<div class="sp-stat"><b>' + s.total + '</b><span>道题目</span></div>' +
        '<span class="sp-go">进入板块 <i>→</i></span>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  /* 渲染模块卡片（按大板块 -> 子板块层级展示）
     contFilter 传学科 id 时只渲染该学科，用于从首页大入口点进来的细分页 */
  function renderModCards(containerId, contFilter) {
    var data = WG_Data.get();
    /* 按已解锁大陆渲染板块（数学、英语、雅思） */
    var unlockedContinents = CONTINENTS.filter(function (c) {
      if (!c.unlocked || getLevelsOf(c.id).length === 0) return false;
      return contFilter ? c.id === contFilter : true;
    });

    var html = unlockedContinents.map(function (cont) {
      var lvs = getLevelsOf(cont.id);
      /* 获取当前板块下的子板块（按 group 分组） */
      var subGroups = [];
      var defaultOrder = GROUP_ORDER[cont.id] || [];
      lvs.forEach(function (l) {
        var g = l.group || '通用';
        if (subGroups.indexOf(g) < 0) subGroups.push(g);
      });
      subGroups.sort(function (a, b) {
        var ia = defaultOrder.indexOf(a), ib = defaultOrder.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });

      var contTotal = 0;
      var subGroupHtml = subGroups.map(function (g) {
        var items = lvs.filter(function (l) { return (l.group || '通用') === g; });
        var gTotal = 0;
        var cards = items.map(function (l, i) {
          var rec = data.levels[l.id];
          var stars = rec ? rec.stars : 0;
          var starStr = stars ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
          var cnt = moduleCount(l);
          gTotal += cnt;
          var diffTxt = l.diff === 3 ? '拔尖' : l.diff === 1 ? '基础' : '适中';
          return '<div class="mod-card" data-level="' + l.id + '" data-idx="' + i + '" tabindex="0" role="button">' +
            '<div class="mod-tag">' + g + '</div>' +
            '<div class="mod-name">' + l.name + '</div>' +
            '<div class="mod-meta"><span class="mod-cnt">' + cnt + ' 题</span>' +
            '<span class="mod-diff mod-diff-' + (l.diff || 2) + '">' + diffTxt + '</span></div>' +
            '<div class="mod-foot">' +
            (starStr ? '<span class="mod-stars">' + starStr + '</span>' : '<span class="mod-stars mod-stars-none">未练习</span>') +
            '<span class="mod-go">开始练习 →</span>' +
            '</div>' +
            '</div>';
        }).join('');
        contTotal += gTotal;

        /* 单一子板块时直接展示卡片；多子板块时呈现清晰的子板块标题 */
        return '<div class="mod-subgroup">' +
          '<div class="msg-head">' +
          '<h4 class="msg-name"><span class="msg-dot"></span>' + g + '</h4>' +
          '<span class="msg-meta">' + items.length + ' 关 · ' + gTotal + ' 题</span>' +
          '</div>' +
          '<div class="mod-grid">' + cards + '</div>' +
          '</div>';
      }).join('');

      /* 大板块卡片容器 */
      return '<section class="mod-group mod-continent-section" style="--cont-color:' + cont.color + ';">' +
        '<div class="mg-head">' +
        '<div>' +
        '<h3 class="mg-name" style="color:' + cont.color + ';">' + cont.name + '</h3>' +
        '<div class="mg-desc">' + (cont.desc || '') + '</div>' +
        '</div>' +
        '<span class="mg-meta">' + lvs.length + ' 个模块 · ' + contTotal + ' 题</span>' +
        '</div>' +
        '<div class="mod-subgroups-wrap">' + subGroupHtml + '</div>' +
        '</section>';
    }).join('');

    var box = $(containerId);
    if (box) box.innerHTML = html;
  }

  /* ---------- 首页 ---------- */
  /* 题库总数（数据就绪后刷新顶部统计） */
  function totalBankCount() {
    var n = 0;
    if (typeof GAOSHU_BANK !== 'undefined') {
      Object.keys(GAOSHU_BANK).forEach(function (tk) {
        var td = GAOSHU_BANK[tk];
        if (td && td.problems) n += td.problems.length;
      });
    }
    if (typeof ENGLISH_CET4_BANK !== 'undefined') n += ENGLISH_CET4_BANK.length;
    if (typeof ENGLISH_CET6_BANK !== 'undefined') n += ENGLISH_CET6_BANK.length;
    if (typeof IELTS_SYNONYM_BANK !== 'undefined') n += IELTS_SYNONYM_BANK.length;
    if (typeof IELTS_VOCAB_BANK !== 'undefined') n += IELTS_VOCAB_BANK.length;
    if (typeof IELTS_WRITING_BANK !== 'undefined') n += IELTS_WRITING_BANK.length;
    return n;
  }

  /* 进入需要题库数据的视图前先等数据就绪（重型数据仍在后台加载时兜底） */
  function gateData(fn) {
    if (!window.WG_Heavy || WG_Heavy.isReady()) { fn(); return; }
    toast('题库数据加载中，请稍候…');
    WG_Heavy.ready().then(fn);
  }

  /* 首页学习资料板块：按归类后的 4 个大类出入口 */
  function renderHomeWenku() {
    var wkGrid = $('homeWenkuGrid');
    if (!wkGrid || typeof WG_WenkuCat === 'undefined') return;
    wkGrid.innerHTML = WG_WenkuCat.CATS.map(function (c) {
      var n = WG_WenkuCat.countOf(c.id);
      var f = WG_WenkuCat.facetsOf(c.id);
      /* 副标题优先报学科分布，没有学科维度就报可直接打开的份数 */
      var sub = f.subjects.slice(0, 3).map(function (s) { return s.key; }).join(' · ');
      return '<a class="wk-entry wk-entry-cat" data-wenku="' + c.id + '" href="javascript:void(0)" ' +
        'style="--wk-color:' + c.color + ';">' +
        '<div class="wk-ic">' + c.icon + '</div>' +
        '<div class="wk-t">' + escHtml(c.name) + '</div>' +
        '<div class="wk-c">' + n.total + ' 份' +
        (n.local ? ' · 可直接看 ' + n.local + ' 份' : '') +
        (sub ? '<br><span class="wk-sub">' + escHtml(sub) + '</span>' : '') +
        '</div>' +
        '</a>';
    }).join('');
  }

  /* 首页敬请期待板块 */
  function renderHomeComing() {
    var comingGrid = $('homeComingGrid');
    if (!comingGrid) return;
    var comingItems = [
      { id: 'computer', name: '计算机考级', icon: '💻', tag: 'NCRE', desc: '二级Office · C语言 · Python · 数据结构', color: '#67e8f9' },
      { id: 'final', name: '专业课速通', icon: '⚡', tag: 'MAJOR', desc: '期末速通 · 考研专业课 · 考前突击', color: '#fbbf24' }
    ];
    comingGrid.innerHTML = comingItems.map(function (x) {
      return '<div class="coming-card" style="--card-color:' + x.color + ';">' +
        '<div class="coming-ic">' + x.icon + '</div>' +
        '<div class="coming-name">' + x.name + '</div>' +
        '<div class="coming-tag">' + x.tag + '</div>' +
        '<div class="coming-desc">' + x.desc + '</div>' +
        '<div class="coming-badge">敬请期待</div>' +
        '</div>';
    }).join('');
  }

  function renderHome() {
    var data = WG_Data.get();
    refreshNickUI();

    /* Hero 统计 */
    var a = WG_Data.analyze();
    var doneAll = a.total.c + a.total.w;
    $('hsDone').textContent = a.answers;
    $('hsAcc').textContent = doneAll ? Math.round(a.total.c / doneAll * 100) + '%' : '—';
    $('hsErr').textContent = a.mistakes;

    /* 题库 / 资料板块依赖重型数据（gaoshu_bank / wenku），
       未就绪先渲染占位，后台加载完成后自动补全 */
    if (window.WG_Heavy && !WG_Heavy.isReady()) {
      var pg = $('homeBankGrid'), wg = $('homeWenkuGrid');
      if (pg && !pg.innerHTML) pg.innerHTML = WG_Heavy.placeholder('题库数据加载中…');
      if (wg && !wg.innerHTML) wg.innerHTML = WG_Heavy.placeholder('资料数据加载中…');
      if ($('hsTotal')) $('hsTotal').textContent = '…';
      WG_Heavy.ready().then(function () {
        if (state.view === 'home') renderHome();
      });
      renderHomeComing();
      showView('home');
      return;
    }

    /* 数据就绪：刷新题库总数 + 各板块 */
    if ($('hsTotal')) $('hsTotal').textContent = totalBankCount();
    renderSubjectPortal('homeBankGrid');
    renderHomeWenku();
    renderHomeComing();
    showView('home');
  }

  /* ---------- 题库页 ----------
     bankFilter 为 null 时展示全科；传学科 id 时只展示该学科的子板块，
     首页大入口点进来走的就是后者。 */
  var bankFilter = null;
  function renderBank(contId) {
    stopGames();
    bankFilter = contId || null;
    var cont = bankFilter ? getContinent(bankFilter) : null;

    /* 页头随筛选切换：全科题库 or 单学科 */
    var titleEl = $('bankTitle'), descEl = $('bankDesc'), subDescEl = $('bankSubDesc'), backEl = $('bankBack');
    if (cont) {
      var s = subjectSummary(cont);
      if (titleEl) {
        titleEl.textContent = cont.name;
        titleEl.style.color = cont.color;
      }
      if (descEl) {
        descEl.textContent = cont.name + ' · 子板块细分';
        descEl.style.color = cont.color;
      }
      if (subDescEl) subDescEl.textContent = cont.desc || '';
      var subBar = $('bankSubBar');
      if (subBar) {
        subBar.innerHTML = '<span class="bsb-label">子板块</span>' +
          s.subs.map(function (g) {
            return '<span class="bsb-chip" style="--sp-color:' + cont.color + ';">' + escHtml(g) + '</span>';
          }).join('') +
          '<span class="bsb-meta">' + s.levels.length + ' 个模块 · ' + s.total + ' 题</span>';
        subBar.classList.remove('hidden');
      }
      if (backEl) backEl.classList.remove('hidden');
    } else {
      if (titleEl) {
        titleEl.textContent = '全科题库';
        titleEl.style.color = '#67e8f9';
      }
      if (descEl) {
        descEl.textContent = '全科题库';
        descEl.style.color = '#67e8f9';
      }
      if (subDescEl) {
        subDescEl.textContent = '数学（高数 · 线代 · 概率） · 英语（四级 · 六级） · 雅思（阅读 · 词汇 · 写作），按学科与子板块归类，全部自由练习';
      }
      if ($('bankSubBar')) $('bankSubBar').classList.add('hidden');
      if (backEl) backEl.classList.add('hidden');
    }

    renderModCards('bankGrid', bankFilter);
    showView('bank');
  }

  /* ---------- 学习资料页 ----------
     四个大类 → 学科/板块 → 院校 → 年份，逐层收窄，别再让 1000 份资料一次糊脸 */
  var wkState = { cat: 'exam', subject: '', school: '', year: '', localOnly: false, page: 1 };
  var WK_PAGE_SIZE = 60;

  function wkChipRow(label, items, activeKey, attr, colorVar) {
    if (!items.length) return '';
    var chips = '<button class="wkf-chip' + (activeKey ? '' : ' active') + '" data-' + attr + '="">全部</button>' +
      items.map(function (it) {
        return '<button class="wkf-chip' + (activeKey === it.key ? ' active' : '') + '" data-' + attr + '="' +
          escHtml(it.key) + '">' + escHtml(it.key) + '<b>' + it.n + '</b></button>';
      }).join('');
    return '<div class="wkf-row" style="--wk-color:' + colorVar + ';">' +
      '<span class="wkf-label">' + label + '</span>' +
      '<div class="wkf-chips">' + chips + '</div>' +
      '</div>';
  }

  function renderWenku(cat) {
    stopGames();
    if (typeof WG_WenkuCat === 'undefined') { showView('home'); return; }
    /* 切换大类时把下级筛选清空，避免残留一个选不中的院校 */
    if (cat && cat !== wkState.cat) {
      wkState.cat = cat;
      wkState.subject = ''; wkState.school = ''; wkState.year = ''; wkState.page = 1;
    }
    var meta = WG_WenkuCat.catMeta(wkState.cat);
    var facets = WG_WenkuCat.facetsOf(wkState.cat);

    /* 大类 tab */
    var tabBox = $('wenkuTabs');
    if (tabBox) {
      tabBox.innerHTML = WG_WenkuCat.CATS.map(function (c) {
        var n = WG_WenkuCat.countOf(c.id);
        return '<button class="wt-btn' + (c.id === wkState.cat ? ' active' : '') + '" data-wt="' + c.id + '">' +
          c.icon + ' ' + escHtml(c.name) + ' <b>' + n.total + '</b></button>';
      }).join('');
    }
    /* 大类说明 */
    var intro = $('wenkuIntro');
    if (intro) {
      var cn = WG_WenkuCat.countOf(wkState.cat);
      intro.innerHTML = '<span class="wki-name" style="color:' + meta.color + ';">' + meta.icon + ' ' + escHtml(meta.name) + '</span>' +
        '<span class="wki-desc">' + escHtml(meta.desc) + '</span>' +
        '<span class="wki-meta">共 ' + cn.total + ' 份' + (cn.local ? ' · 站内可直接阅读 ' + cn.local + ' 份' : ' · 均托管于原站') + '</span>';
    }

    /* 逐层筛选条：学科 → 院校 → 年份 */
    var fBox = $('wenkuFilters');
    if (fBox) {
      var subjectLabel = wkState.cat === 'ielts' ? '板块' : '学科';
      var html = wkChipRow(subjectLabel, facets.subjects, wkState.subject, 'wksubject', meta.color);
      html += wkChipRow('院校', facets.schools.slice(0, 40), wkState.school, 'wkschool', meta.color);
      html += wkChipRow('年份', facets.years, wkState.year, 'wkyear', meta.color);
      html += '<div class="wkf-row"><span class="wkf-label">显示</span><div class="wkf-chips">' +
        '<button class="wkf-chip' + (wkState.localOnly ? ' active' : '') + '" data-wklocal="1">仅看站内可读</button>' +
        '</div></div>';
      fBox.innerHTML = html;
    }

    var kw = ($('wenkuSearch') ? $('wenkuSearch').value : '').trim();
    var list = WG_WenkuCat.query({
      cat: wkState.cat,
      subject: wkState.subject,
      school: wkState.school,
      year: wkState.year,
      localOnly: wkState.localOnly,
      kw: kw
    });

    var box = $('wenkuList');
    if (!box) { showView('home'); return; }
    if (!list.length) {
      box.innerHTML = '<div class="wk-empty">当前筛选下没有资料，放宽条件或换个关键词试试。</div>';
      box._list = [];
    } else {
      var shown = list.slice(0, WK_PAGE_SIZE * wkState.page);
      box.innerHTML = shown.map(function (r, i) {
        var x = r.raw;
        /* 标签只留有信息量的维度，原始 tag 里一堆重复的层次词就不铺了 */
        var chips = [];
        if (r.subject && r.subject !== '综合专题') chips.push(r.subject);
        if (r.ieltsGroup) chips.push(r.ieltsGroup);
        if (r.school) chips.push(r.school);
        if (r.year) chips.push(r.year);
        if (r.isSolution) chips.push('含解析');
        else if (r.isBlank) chips.push('仅题目');
        var tags = chips.slice(0, 5).map(function (t) {
          return '<span class="wk-tag">' + escHtml(t) + '</span>';
        }).join('');
        var badge = r.local ? '<span class="wk-local">站内可读</span>' : '<span class="wk-pending">原站</span>';
        var goText = r.local ? '打开 PDF →' : '查看详情 →';
        return '<div class="wk-item" data-idx="' + i + '" tabindex="0" role="button">' +
          '<div class="wk-item-head">' + escHtml(x.title || '') + ' ' + badge + '</div>' +
          (tags ? '<div class="wk-item-tags">' + tags + '</div>' : '') +
          (x.desc ? '<div class="wk-item-desc">' + escHtml(String(x.desc).slice(0, 110)) + '</div>' : '') +
          '<div class="wk-item-go">' + goText + '</div>' +
          '</div>';
      }).join('') +
        (shown.length < list.length
          ? '<button class="btn ghost wk-more" id="wkMore">继续加载（还有 ' + (list.length - shown.length) + ' 份）</button>'
          : '') +
        '<div class="wk-count">已展示 ' + shown.length + ' / ' + list.length + ' 份' +
        '（站内可读 ' + list.filter(function (r) { return r.local; }).length + ' 份）</div>';
      /* 详情弹层取的是原始条目 */
      box._list = shown.map(function (r) { return r.raw; });
    }
    showView('wenku');
  }

  /* 资料详情弹层 */
  function showWenkuDetail(x) {
    if (!x) return;
    var el = $('wenkuDetail');
    if (!el) return;
    $('wkdTitle').textContent = x.title || '';
    var meta = [];
    if (x.tags && x.tags.length) meta.push(x.tags.slice(0, 5).join(' · '));
    if (x.desc) meta.push(x.desc.slice(0, 60));
    $('wkdMeta').textContent = meta.join(' · ') || '';
    var desc = x.desc || '暂无简介';
    if (x.tags && x.tags.length) desc += '\n\n分类：' + x.tags.join('、');
    $('wkdDesc').textContent = desc;
    var link = $('wkdLink');
    var isLocal = x.link && x.link.indexOf('data/pdf/') === 0;
    var pvWrap = $('wkdPreviewWrap');
    var pvIfr = $('wkdPreview');
    if (link) {
      if (isLocal) {
        link.href = x.link;
        link.textContent = '↗ 在新标签打开 / 下载';
        link.target = '_blank';
        link.rel = 'noopener';
        link.removeAttribute('download');
        link.style.cursor = 'pointer';
        $('wkdHint').textContent = '上方已内嵌预览。如预览空白，请点击按钮在新标签页打开；若浏览器直接下载该文件属正常行为。';
        if (pvWrap && pvIfr) {
          pvWrap.classList.remove('hidden');
          pvIfr.src = x.link;
        }
      } else {
        /* 非本地资料：提供原站分类页链接 */
        var catUrl = x.link || 'https://suncoastmath.cn/pdfs';
        link.href = catUrl;
        link.textContent = '🌐 前往原站查看 ↗';
        link.target = '_blank';
        link.rel = 'noopener';
        link.removeAttribute('download');
        link.style.cursor = 'pointer';
        $('wkdHint').textContent = '资料托管在 suncoastmath.cn 阳光海岸数学练习室，访问原站可能需要登录/注册。';
        if (pvWrap && pvIfr) {
          pvWrap.classList.add('hidden');
          pvIfr.removeAttribute('src');
        }
      }
    }
    el.classList.remove('hidden');
  }

  /* ---------- 进入学习模块 ---------- */
  function enterLevel(levelId, idx) {
    var cont = getContinent(state.continentId);
    var lvs = getLevelsOf(cont.id);
    var level = lvs.find(function (l) { return l.id === levelId; });
    if (!level && typeof findLevel === 'function') level = findLevel(levelId);
    if (!level) return;
    state.backView = state.view === 'bank' ? 'bank' : (state.view === 'module' ? 'module' : 'home');
    state.currentLevel = level;
    state.currentIndex = idx;
    /* 定位所属大陆（跨大陆模块用 findLevelContinent） */
    var ownerCont = cont;
    if (typeof findLevelContinent === 'function') ownerCont = findLevelContinent(level.id) || cont;
    /* 每个入口都登记一次，后开的局覆盖前一局，
       免得上一局留下的 replay 漏到这一局里 */
    state.replay = function () { enterLevel(levelId, idx); };
    stopGames();
    $('gameTitle').textContent = level.name;
    $('gameSub').textContent = ownerCont.name + ' · ' + (level.kw || '综合');
    var isQuiz = level.type === 'quiz' || level.type === 'practice';
    var isGaoshu = level.type === 'gaoshu';
    /* 题库关卡的 n 已放开为 0（不限量），文案不再写死题数 */
    var goalMap = {
      practice: '连做 ' + (level.n || 10) + ' 题 · 按正确率评分',
      gaoshu: (level.n > 0 ? '本轮 ' + level.n + ' 道题' : '不限量刷题')
        + ' · 可随时跳题 / 标记 / 结束本轮'
    };
    $('goalHint').textContent = goalMap[level.type] || '';
    if ($('stStars')) $('stStars').textContent = '☆☆☆';
    $('board').classList.toggle('hidden', isQuiz || isGaoshu);
    $('quizArea').classList.toggle('hidden', !isQuiz);
    $('customArea').classList.toggle('hidden', !isGaoshu);
    /* 从题库/首页直接进关：目录按这一关自己的知识点列 */
    resetExamProgress();
    renderExamNav(isGaoshu ? { level: level, topic: level.topic || null, mode: 'all' } : null);
    closeExamSide();
    showView('game');
    var common = { onStats: renderStats, onEnd: onGameEnd };
    if (level.type === 'gaoshu') {
      WG_Gaoshu.start(level, common);
    } else {
      WG_Quiz.start(level, common);
    }
  }

  /* ---------- AI 对话（输出到 AI 助手页） ---------- */
  async function aiRun(label, fn) {
    var out = $('aiChat');
    if (!out) return;
    out.textContent = label + '…（AI 思考中）';
    try {
      var text = await fn();
      out.textContent = text;
    } catch (e) {
      out.textContent = '⚠ ' + WG_AI.errText(e);
    }
  }
  function aiChatAppend(tag, text) {
    var el = $('aiChat');
    if (!el) return;
    el.textContent = el.textContent ? el.textContent + '\n\n【' + tag + '】\n' + text : '【' + tag + '】\n' + text;
    el.scrollTop = el.scrollHeight;
  }

  function renderStats(s) {
    /* 简化：只显示 用时 / 答对 / 得分 */
    if ($('stTime')) $('stTime').textContent = WG_Game.fmtTime(s.time || 0);
    if ($('stSolved')) $('stSolved').textContent = s.solved != null ? s.solved : 0;
    if ($('stScore')) $('stScore').textContent = s.score != null ? s.score : 0;
    paintExamProgress(s);
  }

  /* ---------- 练习页左侧边栏：进度 / 章节目录 / 抽屉 ---------- */

  /* 进度条跟着引擎的 progress / total 走。引擎还没给出总题数时
     显示占位符，别让进度条停在一个假的 0%。 */
  function paintExamProgress(s) {
    var txt = $('esProgress'), bar = $('esProgressBar'), fill = $('esProgressFill');
    if (!txt || !bar || !fill) return;
    var total = s && s.total ? s.total : 0;
    var cur = s && s.progress ? s.progress : 0;
    if (!total) {
      txt.textContent = '—';
      fill.style.width = '0%';
      bar.setAttribute('aria-valuenow', '0');
      return;
    }
    if (cur > total) cur = total;
    var pct = Math.round(cur / total * 100);
    /* progress 现在是「已答题数」，跳题不会虚增进度 */
    txt.textContent = '已答 ' + cur + ' / ' + total;
    fill.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', String(pct));
  }

  /* 每次开局先把进度归零，免得上一局的数字残留在侧栏里 */
  function resetExamProgress() { paintExamProgress(null); }

  /* 侧栏当前挂在哪个模块上，供目录点击时重开对应章节 */
  var examNavCtx = null;

  /* 章节目录：把模块下的知识点列成目录，点一条就换到那一章。
     题库里查不到章节的入口（错题重刷、随机组卷）整块折叠掉。 */
  function renderExamNav(ctx) {
    var block = $('examNavBlock'), nav = $('examNav'), hint = $('examNavHint');
    if (!block || !nav) return;
    examNavCtx = null;
    var level = ctx && ctx.level;
    var keys = level ? topicKeysOf(level) : [];
    if (!level || keys.length < 1) {
      block.classList.add('hidden');
      nav.innerHTML = '';
      if (hint) hint.textContent = '';
      return;
    }
    examNavCtx = { level: level, topic: ctx.topic || null, mode: ctx.mode || 'topic' };
    var isAll = !ctx.topic;
    var allCount = 0;
    keys.forEach(function (tk) { allCount += countTopic(tk); });
    var html = '<div class="es-nav-group">' + escHtml(level.name) + '</div>';
    html += '<button type="button" class="es-nav-item' + (isAll ? ' active' : '') +
      (allCount === 0 ? ' is-empty' : '') + '" role="listitem" data-mode="all"' +
      (isAll ? ' aria-current="true"' : '') + '>' +
      '<span class="es-nav-name">全部知识点</span>' +
      '<span class="es-nav-count">' + allCount + '</span></button>';
    keys.forEach(function (tk) {
      var cnt = countTopic(tk);
      var on = ctx.topic === tk;
      html += '<button type="button" class="es-nav-item' + (on ? ' active' : '') +
        (cnt === 0 ? ' is-empty' : '') + '" role="listitem" data-topic="' + escHtml(tk) + '"' +
        (on ? ' aria-current="true"' : '') + '>' +
        '<span class="es-nav-name">' + escHtml(tk) + '</span>' +
        '<span class="es-nav-count">' + cnt + '</span></button>';
    });
    nav.innerHTML = html;
    if (hint) hint.textContent = keys.length + ' 章';
    block.classList.remove('hidden');
  }

  /* 目录点击：换章节等于重开一局，所以直接复用模块刷题入口。
     但返回目标要保住，别把「从题库进来」改成「从模块进来」。 */
  function jumpExamNav(btn) {
    if (!examNavCtx || !btn) return;
    var topic = btn.getAttribute('data-topic');
    if (btn.classList.contains('is-empty')) {
      toast('当前筛选条件下这一章没有题，放宽条件再试试');
      return;
    }
    if (!topic && btn.getAttribute('data-mode') !== 'all') return;
    closeExamSide();
    var back = state.backView;
    state.currentModule = examNavCtx.level;
    startFromModule(topic ? 'topic' : 'all', topic || null);
    state.backView = back;
  }

  /* 窄屏下侧栏收成左侧抽屉 */
  function openExamSide() {
    var side = $('examSide'), mask = $('examSideMask'), tg = $('examSideToggle');
    if (!side) return;
    side.classList.add('is-open');
    if (mask) { mask.hidden = false; mask.classList.add('is-open'); }
    if (tg) tg.setAttribute('aria-expanded', 'true');
  }
  function closeExamSide() {
    var side = $('examSide'), mask = $('examSideMask'), tg = $('examSideToggle');
    if (!side) return;
    side.classList.remove('is-open');
    if (mask) { mask.classList.remove('is-open'); mask.hidden = true; }
    if (tg) tg.setAttribute('aria-expanded', 'false');
  }
  function examSideOpen() {
    var side = $('examSide');
    return !!(side && side.classList.contains('is-open'));
  }

  function bindExamSide() {
    var tg = $('examSideToggle');
    if (tg) {
      tg.addEventListener('click', function () {
        if (examSideOpen()) closeExamSide(); else openExamSide();
      });
    }
    var mask = $('examSideMask');
    if (mask) mask.addEventListener('click', closeExamSide);
    var nav = $('examNav');
    if (nav) {
      nav.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.es-nav-item') : null;
        if (b) jumpExamNav(b);
      });
    }
    /* 答题卡点一格就是跳题，跳完抽屉该自己让开 */
    var card = $('examCard');
    if (card) {
      card.addEventListener('click', function (e) {
        var c = e.target.closest ? e.target.closest('.qcard-cell') : null;
        if (c) closeExamSide();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && examSideOpen()) closeExamSide();
    });
  }

  /* ---------- 结算 ---------- */
  function onGameEnd(r) {
    if (r.win) {
      WG_Data.recordLevel(state.currentLevel.id, r.stars, r.time);
    }
    $('mStars').innerHTML = r.stars === 3 ? '★★★' : r.stars === 2 ? '★★☆' : r.stars === 1 ? '★☆☆' : '☆☆☆';
    var title = $('mTitle');
    title.textContent = r.win ? '练习完成！' : '挑战失败';
    title.className = 'm-title ' + (r.win ? 'win' : 'lose');
    $('mSub').textContent = r.msg;
    $('mTime').textContent = WG_Game.fmtTime(r.time);
    $('mScore').textContent = r.score;
    $('mAcc').textContent = r.accuracy + '%';
    /* 无闯关：隐藏"下一关"，改为"再来一组" */
    $('mNext').classList.add('hidden');
    $('mRetry').classList.remove('hidden');
    $('mRetry').textContent = '再来一组';
    $('modalMask').classList.add('show');
  }

  function closeModal() { $('modalMask').classList.remove('show'); }

  /* ---------- 自习室入场契约弹窗 ---------- */
  var studySetupState = {
    subject: '高等数学',
    motto: '保持专注，全力以赴！',
    duration: 25, // 分钟，0 表示不限时
    focusMode: 'strict', // strict | gentle
    ambientSound: 'music-user' // 默认音频 | none
  };

  function openStudySetup() {
    var modal = $('studyModalMask');
    if (!modal) return;
    /* 登录后：先尝试拉取云端自习设置（失败则用本地） */
    if (window.WG_API && WG_API.isLoggedIn()) {
      WG_API.getStudySetup().then(function (d) {
        var cloud = d.setup || {};
        var local = {};
        try { local = JSON.parse(localStorage.getItem('wenguo_study_setup') || '{}'); } catch (e) {}
        var merged = Object.assign({}, cloud, local);
        localStorage.setItem('wenguo_study_setup', JSON.stringify(merged));
        applyStudySetup(merged);
      }).catch(function () { applyStudySetup(null); });
    } else {
      applyStudySetup(null);
    }
  }

  /* 把存储的设置应用到表单 UI */
  function applyStudySetup(saved) {
    var modal = $('studyModalMask');
    if (!modal) return;
    /* 恢复或读取存储的默认设置 */
    try {
      if (saved == null) saved = JSON.parse(localStorage.getItem('wenguo_study_setup') || '{}');
      if (saved.subject) studySetupState.subject = saved.subject;
      if (saved.motto) studySetupState.motto = saved.motto;
      if (saved.duration !== undefined) studySetupState.duration = saved.duration;
      if (saved.focusMode) studySetupState.focusMode = saved.focusMode;
      if (saved.ambientSound) {
        var ambientValid = ['music-user', 'music-dreamy', 'music-calmant', 'music-carefree', 'music-mystery', 'none'];
        studySetupState.ambientSound = ambientValid.indexOf(saved.ambientSound) >= 0 ? saved.ambientSound : 'music-user';
      }
    } catch (e) {}

    // 同步到表单 UI
    if ($('studySubjectInput')) $('studySubjectInput').value = studySetupState.subject;
    if ($('studyMottoInput')) $('studyMottoInput').value = studySetupState.motto;
    
    // 芯片高亮
    var chips = document.querySelectorAll('#studySubjectChips .ssc-chip');
    var matchedChip = false;
    chips.forEach(function (c) {
      var on = c.getAttribute('data-sub') === studySetupState.subject;
      c.classList.toggle('active', on);
      if (on) matchedChip = true;
    });

    // 时长高亮
    var durBtns = document.querySelectorAll('#studyDurationGrid .ssc-dur-btn');
    var isStandardDur = false;
    durBtns.forEach(function (b) {
      var m = parseInt(b.getAttribute('data-min'), 10);
      var on = (m === studySetupState.duration);
      b.classList.toggle('active', on);
      if (on) isStandardDur = true;
    });
    var customInput = $('studyCustomMin');
    if (customInput) {
      customInput.value = !isStandardDur && studySetupState.duration > 0 ? studySetupState.duration : '';
    }

    // 模式单选
    var strictCard = $('modeCardStrict');
    var gentleCard = $('modeCardGentle');
    if (strictCard && gentleCard) {
      var isStrict = studySetupState.focusMode === 'strict';
      strictCard.classList.toggle('active', isStrict);
      gentleCard.classList.toggle('active', !isStrict);
      var rStrict = strictCard.querySelector('input');
      var rGentle = gentleCard.querySelector('input');
      if (rStrict) rStrict.checked = isStrict;
      if (rGentle) rGentle.checked = !isStrict;
    }

    // 氛围音
    var ambBtns = document.querySelectorAll('#studyAmbientRow .ssc-amb-btn');
    ambBtns.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-sound') === studySetupState.ambientSound);
    });

    modal.classList.remove('hidden');
    modal.classList.add('show');
  }

  function closeStudySetup() {
    var modal = $('studyModalMask');
    if (modal) {
      modal.classList.remove('show');
      modal.classList.add('hidden');
    }
  }

  function bindStudySetup() {
    // 关闭按钮
    if ($('studySetupClose')) $('studySetupClose').addEventListener('click', closeStudySetup);
    if ($('studySetupCancel')) $('studySetupCancel').addEventListener('click', closeStudySetup);
    var mask = $('studyModalMask');
    if (mask) {
      mask.addEventListener('click', function (e) {
        if (e.target === mask) closeStudySetup();
      });
    }

    // 科目选择与输入
    var chipBox = $('studySubjectChips');
    var subInput = $('studySubjectInput');
    if (chipBox && subInput) {
      chipBox.addEventListener('click', function (e) {
        var chip = e.target.closest ? e.target.closest('.ssc-chip') : null;
        if (!chip) return;
        chipBox.querySelectorAll('.ssc-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        subInput.value = chip.getAttribute('data-sub');
        studySetupState.subject = subInput.value;
      });
      subInput.addEventListener('input', function () {
        var v = this.value.trim();
        studySetupState.subject = v || '自习';
        chipBox.querySelectorAll('.ssc-chip').forEach(function (c) {
          c.classList.toggle('active', c.getAttribute('data-sub') === v);
        });
      });
    }

    // 自习宣言
    var mottoInput = $('studyMottoInput');
    if (mottoInput) {
      mottoInput.addEventListener('input', function () {
        studySetupState.motto = this.value.trim() || '保持专注，全力以赴！';
      });
    }

    // 时长选择
    var durGrid = $('studyDurationGrid');
    var customMin = $('studyCustomMin');
    if (durGrid) {
      durGrid.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.ssc-dur-btn') : null;
        if (!btn) return;
        durGrid.querySelectorAll('.ssc-dur-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        if (customMin) customMin.value = '';
        var m = parseInt(btn.getAttribute('data-min'), 10);
        studySetupState.duration = m;
      });
    }
    if (customMin && durGrid) {
      customMin.addEventListener('input', function () {
        var v = parseInt(this.value, 10);
        if (!isNaN(v) && v > 0) {
          durGrid.querySelectorAll('.ssc-dur-btn').forEach(function (b) { b.classList.remove('active'); });
          studySetupState.duration = Math.min(180, Math.max(1, v));
        }
      });
    }

    // 专注模式卡片切换
    var strictCard = $('modeCardStrict');
    var gentleCard = $('modeCardGentle');
    if (strictCard && gentleCard) {
      strictCard.addEventListener('click', function () {
        strictCard.classList.add('active');
        gentleCard.classList.remove('active');
        var r = strictCard.querySelector('input');
        if (r) r.checked = true;
        studySetupState.focusMode = 'strict';
      });
      gentleCard.addEventListener('click', function () {
        gentleCard.classList.add('active');
        strictCard.classList.remove('active');
        var r = gentleCard.querySelector('input');
        if (r) r.checked = true;
        studySetupState.focusMode = 'gentle';
      });
    }

    // 氛围音选择
    var ambRow = $('studyAmbientRow');
    if (ambRow) {
      ambRow.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.ssc-amb-btn') : null;
        if (!btn) return;
        ambRow.querySelectorAll('.ssc-amb-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        studySetupState.ambientSound = btn.getAttribute('data-sound');
      });
    }

    // 确认进入自习室
    var confirmBtn = $('studySetupConfirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        // 读取最终参数
        if (subInput) studySetupState.subject = subInput.value.trim() || '自习';
        if (mottoInput) studySetupState.motto = mottoInput.value.trim() || '保持专注，全力以赴！';
        
        // 持久化存储用户偏好
        try {
          localStorage.setItem('wenguo_study_setup', JSON.stringify(studySetupState));
        } catch (e) {}
        /* 登录后：自习设置同步到云端 */
        if (window.WG_API && WG_API.isLoggedIn()) {
          WG_API.putStudySetup(studySetupState).catch(function () {});
        }

        closeStudySetup();
        toast('契约签订成功！进入自习室…', 'ok');
        
        // 触发进入自习室核心逻辑（Step 2 中构建完整自习室引擎）
        enterStudyRoom(studySetupState);
      });
    }
  }

  /* 进入自习室房间入口 */
  function enterStudyRoom(config) {
    stopGames();
    showView('study');
    // 调用 StudyRoom 引擎
    if (window.StudyRoom && typeof window.StudyRoom.enter === 'function') {
      window.StudyRoom.enter({
        duration: config.duration,
        mode: config.focusMode,
        subject: config.subject,
        motto: config.motto,
        sound: config.ambientSound
      });
    }
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg, type) {
    var el = $('toast');
    el.textContent = msg;
    el.className = type || '';
    requestAnimationFrame(function () { el.classList.add('show'); });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1500);
  }

  /* ---------- 昵称 / 账号 ---------- */
  var loginMode = 'login';

  function refreshNickUI() {
    var name = $('nickName');
    if (!name) return;
    var nick = WG_Data.get().nick || '同学';
    name.textContent = nick;
    if (window.WG_API && WG_API.isLoggedIn()) name.textContent = nick + ' ☁';
  }

  function promptNick() {
    /* 统一打开账号中心：未登录显示登录/注册表单，已登录显示账号管理（改昵称/同步/退出） */
    openLogin();
  }

  /* ---------- 登录 / 注册 ---------- */
  function openLogin() {
    var mask = $('loginModalMask');
    if (!mask) return;
    mask.classList.remove('hidden');
    mask.classList.add('show');
    /* 已登录：显示账号管理视图 */
    if (window.WG_API && WG_API.isLoggedIn()) {
      var user = WG_API.getUser() || {};
      var nick = WG_Data.get().nick || user.nick || user.username || '同学';
      if ($('loginAuthedNick')) $('loginAuthedNick').textContent = nick;
      if ($('loginAuthedUser')) $('loginAuthedUser').textContent = user.username || '';
      if ($('loginForm')) $('loginForm').style.display = 'none';
      if ($('loginAuthed')) $('loginAuthed').style.display = 'block';
      if ($('loginTabLogin')) $('loginTabLogin').style.display = 'none';
      if ($('loginTabReg')) $('loginTabReg').style.display = 'none';
      return;
    }
    if ($('loginForm')) $('loginForm').style.display = 'grid';
    if ($('loginAuthed')) $('loginAuthed').style.display = 'none';
    if ($('loginTabLogin')) $('loginTabLogin').style.display = 'block';
    if ($('loginTabReg')) $('loginTabReg').style.display = 'block';
    setLoginMode('login');
    if ($('loginUsername')) $('loginUsername').focus();
  }
  function closeLogin() {
    var mask = $('loginModalMask');
    if (mask) {
      mask.classList.remove('show');
      mask.classList.add('hidden');
    }
  }
  function setLoginMode(mode) {
    loginMode = mode;
    var tL = $('loginTabLogin'), tR = $('loginTabReg');
    if (tL) { tL.classList.toggle('primary', mode === 'login'); tL.classList.toggle('ghost', mode !== 'login'); }
    if (tR) { tR.classList.toggle('primary', mode === 'reg'); tR.classList.toggle('ghost', mode !== 'reg'); }
    if ($('loginNick')) $('loginNick').style.display = mode === 'reg' ? 'block' : 'none';
    if ($('loginSubmit')) $('loginSubmit').textContent = mode === 'reg' ? '注 册' : '登 录';
    if ($('loginMsg')) $('loginMsg').textContent = '';
  }
  async function handleLoginSubmit() {
    var msg = $('loginMsg');
    if (!msg) return;
    msg.textContent = '';
    var u = $('loginUsername') ? $('loginUsername').value.trim() : '';
    var p = $('loginPassword') ? $('loginPassword').value : '';
    var n = $('loginNick') ? $('loginNick').value.trim() : '';
    if (!u || !p) { msg.textContent = '请输入用户名和密码'; return; }
    try {
      if (loginMode === 'reg') {
        await WG_API.register(u, p, n);
      } else {
        await WG_API.login(u, p);
      }
      /* 登录成功：拉取云端数据，与本地合并后写回本地和云端 */
      var merged = await WG_API.pullMerge(WG_Data.get());
      WG_Data.replaceAll(merged);
      closeLogin();
      refreshNickUI();
      var user = WG_API.getUser() || {};
      toast('欢迎回来，' + (user.nick || u), 'ok');
      renderHome();
    } catch (e) {
      msg.textContent = e.message || '操作失败，请稍后再试';
    }
  }
  function bindLoginModal() {
    var mask = $('loginModalMask');
    if (!mask) return;
    $('loginClose') && $('loginClose').addEventListener('click', closeLogin);
    mask.addEventListener('click', function (e) { if (e.target === mask) closeLogin(); });
    $('loginTabLogin') && $('loginTabLogin').addEventListener('click', function () { setLoginMode('login'); });
    $('loginTabReg') && $('loginTabReg').addEventListener('click', function () { setLoginMode('reg'); });
    $('loginSubmit') && $('loginSubmit').addEventListener('click', handleLoginSubmit);
    $('loginPassword') && $('loginPassword').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleLoginSubmit();
    });
    $('loginChangeNick') && $('loginChangeNick').addEventListener('click', handleChangeNick);
    $('loginSyncNow') && $('loginSyncNow').addEventListener('click', handleSyncNow);
    $('loginLogout') && $('loginLogout').addEventListener('click', handleLogout);
  }

  /* 已登录：修改昵称 */
  function handleChangeNick() {
    var cur = WG_Data.get().nick || '同学';
    var v = prompt('修改昵称：', cur);
    if (!v || !v.trim()) return;
    WG_Data.setNick(v.trim());
    refreshNickUI();
    var btn = $('loginChangeNick');
    if (btn) btn.textContent = '✏️ ' + v.trim() + ' ✓';
    WG_API.updateNick(v.trim()).then(function () {
      refreshNickUI();
      toast('昵称已更新', 'ok');
    }).catch(function () {
      toast('昵称已保存到本机，云端同步失败');
    });
  }

  /* 已登录：立即同步本地数据到云端 */
  async function handleSyncNow() {
    var btn = $('loginSyncNow');
    if (btn) btn.textContent = '⏳ 同步中…';
    try {
      var merged = await WG_API.pullMerge(WG_Data.get());
      WG_Data.replaceAll(merged);
      /* 自习室设置也一并推送 */
      try {
        var setup = JSON.parse(localStorage.getItem('wenguo_study_setup') || '{}');
        if (Object.keys(setup).length) WG_API.putStudySetup(setup);
      } catch (e) {}
      toast('同步完成，云端与本地数据已合并', 'ok');
    } catch (e) {
      toast('同步失败：' + (e.message || '网络异常'));
    }
    if (btn) btn.textContent = '🔄 立即同步数据';
  }

  /* 已登录：退出登录 */
  function handleLogout() {
    if (!confirm('确定退出登录吗？本地数据会保留，云端数据不受影响。')) return;
    WG_API.logout();
    closeLogin();
    refreshNickUI();
    toast('已退出登录，数据仍保留在本机', 'ok');
  }

  /* ---------- 云端数据同步（登录后自动） ---------- */
  var syncTimer = null;
  function syncToCloud() {
    if (!window.WG_API || !WG_API.isLoggedIn()) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      syncTimer = null;
      WG_API.putData(WG_Data.get()).then(function () {
        /* 同步成功：静默，不打扰学习 */
      }).catch(function () {
        /* 同步失败：轻提示一次，下次操作会自动重试 */
        if (!window._syncWarned) {
          window._syncWarned = true;
          toast('云同步失败，数据已暂存本机，下次操作将自动重试');
          setTimeout(function () { window._syncWarned = false; }, 30000);
        }
      });
    }, 800);
  }
  window.WG_SyncHook = syncToCloud;

  /* ---------- 事件 ---------- */
  /* ---------- AI 侧边栏（豆包式） ---------- */
  var aiHistory = [];
  var pendingPhoto = null;
  var AI_CHAT_KEY = 'xwy_ai_chat';
  function aiMsgAdd(role, text) {
    var el = document.createElement('div');
    el.className = 'ai-msg ' + role;
    el.textContent = text;
    $('aiMsgs').appendChild(el);
    $('aiMsgs').scrollTop = $('aiMsgs').scrollHeight;
    return el;
  }
  /* 对话记录持久化（本地，最多 30 条） */
  function aiSaveChat() {
    try {
      var msgs = [];
      $('aiMsgs').querySelectorAll('.ai-msg').forEach(function (el) {
        if (el.classList.contains('loading')) return;
        var img = el.querySelector('img');
        msgs.push({
          role: el.classList.contains('user') ? 'user' : 'bot',
          text: el.textContent || '',
          photo: img ? img.src : null
        });
      });
      localStorage.setItem(AI_CHAT_KEY, JSON.stringify(msgs.slice(-30)));
    } catch (e) {}
  }
  function aiRestoreChat() {
    try {
      var msgs = JSON.parse(localStorage.getItem(AI_CHAT_KEY) || '[]');
      if (!msgs.length) return false;
      aiHistory = [];
      msgs.forEach(function (m) {
        if (m.photo) {
          var p = document.createElement('div');
          p.className = 'ai-msg ' + m.role;
          var img = document.createElement('img');
          img.src = m.photo; img.style.cssText = 'max-height:100px;border-radius:8px;display:block;';
          p.appendChild(img);
          if (m.text) { var t = document.createElement('div'); t.textContent = m.text; p.appendChild(t); }
          $('aiMsgs').appendChild(p);
        } else {
          aiMsgAdd(m.role, m.text || '');
          if (m.role === 'user' || m.role === 'bot') {
            aiHistory.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text || '' });
          }
        }
      });
      if (aiHistory.length > 12) aiHistory = aiHistory.slice(-12);
      $('aiMsgs').scrollTop = $('aiMsgs').scrollHeight;
      return true;
    } catch (e) { return false; }
  }
  function aiSideOpen() {
    $('aiSide').classList.remove('hidden');
    if (!$('aiMsgs').children.length) {
      if (!aiRestoreChat()) {
        aiMsgAdd('bot', '我是学无忧 AI 助教 👋\n可以直接打字提问，也可以点 📷 拍照搜题。');
      }
    }
  }
  function aiSideClose() { $('aiSide').classList.add('hidden'); }
  async function aiSendText() {
    var val = $('aiInput').value.trim();
    if (!val && !pendingPhoto) return;
    var hasPhoto = !!pendingPhoto;
    var photoData = pendingPhoto;
    if (val) aiMsgAdd('user', val);
    if (hasPhoto) {
      var p = document.createElement('div');
      p.className = 'ai-msg user';
      var img = document.createElement('img');
      img.src = photoData; img.style.cssText = 'max-height:100px;border-radius:8px;display:block;';
      p.appendChild(img);
      $('aiMsgs').appendChild(p);
    }
    $('aiInput').value = '';
    var loading = aiMsgAdd('bot', 'AI 思考中…');
    loading.classList.add('loading');
    try {
      var reply;
      if (hasPhoto) {
        reply = await WG_AI.explainPhoto(photoData, val || '');
      } else {
        aiHistory.push({ role: 'user', content: val });
        if (aiHistory.length > 12) aiHistory = aiHistory.slice(-12);
        reply = await WG_AI.chat([{ role: 'system', content: '你是「学无忧」的 AI 助教，面向备考大学生。回答简洁、口语化，多用步骤和思路。' }].concat(aiHistory), { maxTokens: 500 });
        aiHistory.push({ role: 'assistant', content: reply });
      }
      loading.classList.remove('loading');
      loading.textContent = reply;
      aiSaveChat();
    } catch (e) {
      loading.classList.remove('loading');
      loading.textContent = '⚠ ' + WG_AI.errText(e);
      aiSaveChat();
    }
    pendingPhoto = null;
    $('aiPhotoPreview').classList.add('hidden');
    $('aiPhotoImg').src = '';
    $('aiMsgs').scrollTop = $('aiMsgs').scrollHeight;
  }

  function bind() {
    $('logoBtn').addEventListener('click', function () { closeModal(); goHome(); });
    $('nickBtn').addEventListener('click', promptNick);
    $('backBtn').addEventListener('click', function () { closeExamSide(); closeModal(); if (state.backView) showView(state.backView); else goHome(); });
    bindExamSide();
    bindStudySetup();
    bindLoginModal();
    $('obSubmit') && $('obSubmit').addEventListener('click', onboardSubmit);
    $('obSkip') && $('obSkip').addEventListener('click', onboardSkip);
    $('obTabReg') && $('obTabReg').addEventListener('click', function () { setObMode('reg'); });
    $('obTabLogin') && $('obTabLogin').addEventListener('click', function () { setObMode('login'); });
    ['obPassword', 'obUsername'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') onboardSubmit(); });
    });

    /* 顶部导航 */
    var topnav = $('topnav');
    if (topnav) {
      topnav.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[data-nav]') : null;
        if (!a) return;
        e.preventDefault();
        closeModal();
        navTo(a.getAttribute('data-nav'));
      });
    }
    /* 板块标题右侧的「全部模块 →」「资料库 →」：它们带 data-nav，
       但顶部导航那个委托只认 #topnav 里的 a，按钮接不上，得单独兜。 */
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.sec-more[data-nav]') : null;
      if (!b) return;
      e.preventDefault();
      closeModal();
      navTo(b.getAttribute('data-nav'));
    });

    /* 首页快捷入口 */
    $('heroRandom') && $('heroRandom').addEventListener('click', function () { gateData(enterRandom); });
    $('heroStudy') && $('heroStudy').addEventListener('click', function () { closeModal(); openStudySetup(); });
    $('heroBank') && $('heroBank').addEventListener('click', function () { closeModal(); gateData(function () { renderBank(); }); });
    $('heroMistake') && $('heroMistake').addEventListener('click', function () { closeModal(); gateData(function () { renderMistakes(); }); });

    /* 首页学科大入口：点卡片进该学科的细分题库页 */
    var portal = $('homeBankGrid');
    if (portal) {
      portal.addEventListener('click', function (e) {
        var card = e.target.closest ? e.target.closest('.sp-card') : null;
        if (!card) return;
        closeModal();
        renderBank(card.getAttribute('data-continent'));
      });
      portal.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        var card = e.target.closest ? e.target.closest('.sp-card') : null;
        if (!card) return;
        e.preventDefault();
        card.click();
      });
    }

    /* 题库页：从单学科回到全科 */
    var bankBack = $('bankBack');
    if (bankBack) {
      bankBack.addEventListener('click', function () { closeModal(); renderBank(); });
    }

    /* 首页/题库模块卡片：进入模块详情（有子模块时） */
    ['homeBankGrid', 'bankGrid'].forEach(function (gridId) {
      var g = $(gridId);
      if (g) {
        g.addEventListener('click', function (e) {
          var card = e.target.closest ? e.target.closest('.mod-card') : null;
          if (!card) return;
          var level = (typeof findLevel === 'function') ? findLevel(card.getAttribute('data-level')) : null;
          if (!level) return;
          if (level.type === 'gaoshu' && (level.topicList || level.subject)) {
            renderModule(level);
          } else {
            enterLevel(level.id, +card.getAttribute('data-idx'));
          }
        });
        /* 卡片带了 tabindex + role=button，就得真的能用键盘开。
           光给焦点框不接回车，等于挂了个摆设。 */
        g.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
          var card = e.target.closest ? e.target.closest('.mod-card') : null;
          if (!card) return;
          e.preventDefault();
          card.click();
        });
      }
    });
    /* 模块详情：子模块点击 */
    var subGrid = $('subGrid');
    if (subGrid) {
      subGrid.addEventListener('click', function (e) {
        var card = e.target.closest ? e.target.closest('.mod-card') : null;
        if (!card) return;
        /* 当前筛选下这张卡没题，直接开会进到空局，先提示放宽条件 */
        if (card.classList.contains('mod-card-empty')) {
          toast('当前筛选条件下这里没有题，放宽条件再试试');
          return;
        }
        if (card.getAttribute('data-mode') === 'all') {
          startFromModule('all', null);
        } else if (card.getAttribute('data-topic')) {
          startFromModule('topic', card.getAttribute('data-topic'));
        }
      });
    }
    /* 筛选条：难度 / 作答形态，改完就地刷新题量 */
    var mfb = $('modFilter');
    if (mfb) {
      mfb.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('button') : null;
        if (!b) return;
        if (b.hasAttribute('data-diff')) {
          currentDiff = b.getAttribute('data-diff') || '';
        } else if (b.hasAttribute('data-form')) {
          currentForm = b.getAttribute('data-form') || 'all';
        } else {
          return;
        }
        if (state.currentModule) renderModule(state.currentModule);
      });
    }
    /* 题数选择 */
    var mcb = $('modCountBar');
    if (mcb) {
      mcb.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('button[data-c]') : null;
        if (!b) return;
        mcb.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var v = parseInt(b.getAttribute('data-c'), 10);
        currentCount = v;  // 0 表示全部（进入时再换算）
      });
    }
    if ($('modBack')) $('modBack').addEventListener('click', function () { closeModal(); renderBank(bankFilter); });
    /* 首页资料入口 */
    var wkGrid = $('homeWenkuGrid');
    if (wkGrid) {
      wkGrid.addEventListener('click', function (e) {
        var en = e.target.closest ? e.target.closest('[data-wenku]') : null;
        if (en) { closeModal(); renderWenku(en.getAttribute('data-wenku')); }
      });
    }
    /* 资料页 tab + 搜索 */
    var wt = $('wenkuTabs');
    if (wt) {
      wt.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.wt-btn') : null;
        if (b) renderWenku(b.getAttribute('data-wt'));
      });
    }
    if ($('wenkuSearch')) {
      $('wenkuSearch').addEventListener('input', function () { renderWenku(); });
    }
    /* 资料页筛选条：学科 / 院校 / 年份 / 仅站内 */
    var wf = $('wenkuFilters');
    if (wf) {
      wf.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.wkf-chip') : null;
        if (!b) return;
        if (b.hasAttribute('data-wksubject')) wkState.subject = b.getAttribute('data-wksubject');
        else if (b.hasAttribute('data-wkschool')) wkState.school = b.getAttribute('data-wkschool');
        else if (b.hasAttribute('data-wkyear')) wkState.year = b.getAttribute('data-wkyear');
        else if (b.hasAttribute('data-wklocal')) wkState.localOnly = !wkState.localOnly;
        else return;
        wkState.page = 1;
        renderWenku();
      });
    }
    /* 加载更多 */
    if ($('wenkuList')) {
      $('wenkuList').addEventListener('click', function (e) {
        var more = e.target.closest ? e.target.closest('#wkMore') : null;
        if (more) { wkState.page++; renderWenku(); }
      });
    }
    /* 资料条目点击 → 详情弹层 */
    var wkList = $('wenkuList');
    if (wkList) {
      wkList.addEventListener('click', function (e) {
        var item = e.target.closest ? e.target.closest('.wk-item') : null;
        if (!item) return;
        var list = wkList._list || [];
        var x = list[parseInt(item.getAttribute('data-idx'), 10)];
        if (x) showWenkuDetail(x);
      });
      /* 条目带 tabindex，回车/空格也能打开详情 */
      wkList.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        var item = e.target.closest ? e.target.closest('.wk-item') : null;
        if (!item) return;
        e.preventDefault();
        item.click();
      });
    }
    if ($('wkdClose')) $('wkdClose').addEventListener('click', function () {
      $('wenkuDetail').classList.add('hidden');
    });
    var wkd = $('wenkuDetail');
    if (wkd) {
      wkd.addEventListener('click', function (e) {
        if (e.target === wkd) wkd.classList.add('hidden');
      });
    }

    /* AI 侧边栏 */
    $('aiFab').addEventListener('click', aiSideOpen);
    $('aiSideClose').addEventListener('click', aiSideClose);
    $('aiSend').addEventListener('click', aiSendText);
    $('aiInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') aiSendText(); });
    $('aiPhotoInput').addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        pendingPhoto = reader.result;
        $('aiPhotoImg').src = reader.result;
        $('aiPhotoPreview').classList.remove('hidden');
      };
      reader.readAsDataURL(f);
      this.value = '';
    });
    $('aiPhotoClear').addEventListener('click', function () {
      pendingPhoto = null;
      $('aiPhotoPreview').classList.add('hidden');
      $('aiPhotoImg').src = '';
    });
    /* AI 侧边栏配置入口 */
    if ($('aiBtn')) $('aiBtn').addEventListener('click', function () { aiSideOpen(); });
    $('aiSideCfg').addEventListener('click', function () { aiSideClose(); closeModal(); showView('ai'); });
    var aiStatus = $('aiKeyStatus');
    if (aiStatus) {
      aiStatus.textContent = window.WG_API
        ? 'AI 请求由服务端代理，密钥不经过浏览器。'
        : 'AI 服务初始化中…';
    }

    /* 开发者模式：仅保留解锁标记清理 */
    if ($('devBtn')) $('devBtn').addEventListener('click', function () { $('devPanel').classList.toggle('hidden'); });
    if ($('devUnlock')) $('devUnlock').addEventListener('click', function () {
      var d = WG_Data.get();
      CONTINENTS.forEach(function (c) {
        getLevelsOf(c.id).forEach(function (l) {
          if (!d.levels[l.id] || d.levels[l.id].stars < 1) d.levels[l.id] = { stars: 1, bestTime: 9999, at: Date.now() };
        });
      });
      WG_Data.save(d);
      toast('已标记全部模块练习过', 'ok');
      goHome();
    });
    $('aiExplainDemo').addEventListener('click', function () {
      var q = 'lim(x→0) sin(3x)/x = ?';
      aiChatAppend('演示：讲题', '题目：' + q);
      aiRun('AI 讲题中', function () { return WG_AI.explainQuestion(q, '2', '3'); })
        .then(function () { /* 内容已写入 */ });
    });
    $('aiGenDemo').addEventListener('click', function () {
      aiRun('AI 出题中', function () {
        return WG_AI.generateQuestions('极限运算', 3).then(function (t) { aiChatAppend('演示：出题', t); return t; });
      });
    });
    $('aiPlanDemo').addEventListener('click', function () {
      aiRun('计划生成中', function () {
        return WG_AI.makePlan(47, '极限、导数').then(function (t) { aiChatAppend('演示：备考计划', t); return t; });
      });
    });
    /* 根据我的错题生成个性化计划 */
    $('aiMyPlan').addEventListener('click', function () {
      var d = WG_Data.get();
      var ans = d.answers || [];
      var byTopic = {};
      ans.forEach(function (a) {
        if (!byTopic[a.topic]) byTopic[a.topic] = { c: 0, w: 0 };
        byTopic[a.topic][a.correct ? 'c' : 'w']++;
      });
      var weak = [];
      Object.keys(byTopic).forEach(function (t) {
        var v = byTopic[t], total = v.c + v.w;
        if (total >= 2 && v.w / total > 0.25) weak.push(t + '(错' + Math.round(v.w / total * 100) + '%)');
      });
      var weakStr = weak.length ? weak.join('、') : '暂无明显薄弱点（多做几关我来帮你找）';
      aiRun('AI 生成中', function () {
        return WG_AI.makePlan(30, weakStr).then(function (t) {
          aiChatAppend('个性化学习计划 · 基于你的 ' + ans.length + ' 道做题记录（薄弱：' + weakStr + '）', t);
          return t;
        });
      });
    });

    $('mRetry').addEventListener('click', function () {
      closeModal();
      /* 有登记就按登记的方式重开，没登记才退回按 id 找关卡 */
      if (typeof state.replay === 'function') { state.replay(); return; }
      if (state.currentLevel) enterLevel(state.currentLevel.id, state.currentIndex);
    });
    $('mNext').addEventListener('click', function () { closeModal(); goHome(); });
    $('mBack').addEventListener('click', function () { closeModal(); goHome(); });

    /* 错题本列表操作 */
    var misList = $('mistakeList');
    if (misList) {
      misList.addEventListener('click', function (e) {
        var t = e.target;
        var q = function (sel) { return t.closest ? t.closest(sel) : null; };
        var retry = q('.mi-retry');
        var del = q('.mi-del');
        var redo = q('.ms-redo');
        var tog = q('.mset-toggle');
        var aiv = q('.btn-ai-var');
        if (aiv) {
          openAIVariation(aiv.getAttribute('data-qid'));
        } else if (retry) {
          gateData(function () { retryMistake(retry.getAttribute('data-qid')); });
        } else if (del) {
          WG_Data.removeMistake(del.getAttribute('data-qid'));
          toast('已移出错题本', 'ok');
          renderMistakes();
        } else if (redo) {
          /* 整组重刷：把这一组的题号一次性喂给引擎 */
          gateData(function () {
            retryMistakeSet((redo.getAttribute('data-ids') || '').split(','), redo.getAttribute('data-set') || '');
          });
        } else if (tog) {
          /* 折叠不重渲染整页，直接切 class，省掉一次全量拼串 */
          var sec = tog.closest('.mset');
          if (!sec) return;
          var folded = sec.classList.toggle('mset-fold');
          tog.setAttribute('aria-expanded', String(!folded));
          mistakeOpen[sec.getAttribute('data-set')] = !folded;
        }
      });
    }

    /* 错题本筛选 chips：全部 / 标记不会 / 高频错题 */
    var mfBar = $('mistakeFilterBar');
    if (mfBar) {
      mfBar.addEventListener('click', function (e) {
        var chip = e.target.closest ? e.target.closest('.mfb-chip') : null;
        if (!chip) return;
        mistakeFilter = chip.getAttribute('data-mfilter') || 'all';
        mfBar.querySelectorAll('.mfb-chip').forEach(function (c) {
          c.classList.toggle('active', c === chip);
        });
        renderMistakes();
      });
    }
    /* 错题关键词搜索（轻量防抖，避免每敲一个键全量重渲染） */
    var mfSearch = $('mistakeSearchInput');
    if (mfSearch) {
      var mfTimer = null;
      mfSearch.addEventListener('input', function () {
        clearTimeout(mfTimer);
        var v = this.value;
        mfTimer = setTimeout(function () { mistakeKw = v; renderMistakes(); }, 220);
      });
    }
    /* AI 错题学情诊断 */
    if ($('mdAiDiagnoseBtn')) $('mdAiDiagnoseBtn').addEventListener('click', aiDiagnose);

    /* ===== AI 举一反三 · 变式训练弹窗绑定 ===== */
    if ($('aiVarClose')) $('aiVarClose').addEventListener('click', closeAIVariation);
    if ($('aiVarDoneCloseBtn')) $('aiVarDoneCloseBtn').addEventListener('click', closeAIVariation);
    if ($('aiVarRegenBtn')) $('aiVarRegenBtn').addEventListener('click', regenerateAIVariation);
    if ($('aiVarMarkMasteredBtn')) $('aiVarMarkMasteredBtn').addEventListener('click', markAIMastered);
    var aiVarOpts = $('aiVarOptions');
    if (aiVarOpts) aiVarOpts.addEventListener('click', onVarOptionClick);

    document.addEventListener('keydown', function (e) {
      if (state.view === 'game' && e.key.toLowerCase() === 'v' && WG_Game) { /* 看答案快捷键由引擎处理 */ }
    });
  }

  /* ---------- 登录 / 注册 + 需求采集（首屏） ---------- */
  var obMode = 'reg';

  function showOnboard() {
    var p = WG_Data.get().profile;
    if (p) {
      if ($('obNick')) $('obNick').value = (p.nick && p.nick !== '同学') ? p.nick : '';
      if ($('obGrade')) $('obGrade').value = p.grade || '大二';
      if ($('obTarget')) $('obTarget').value = p.target || '期末考试';
      if ($('obDate')) $('obDate').value = p.examDate || '';
      if ($('obHours')) $('obHours').value = p.hours || '2';
      document.querySelectorAll('#obWeak input').forEach(function (inp) {
        inp.checked = (p.weak || []).indexOf(inp.value) >= 0;
      });
    }
    /* 已登录用户预填用户名 */
    if (window.WG_API && WG_API.isLoggedIn()) {
      var u = WG_API.getUser() || {};
      if ($('obUsername')) $('obUsername').value = u.username || '';
    }
    if ($('obStatus')) $('obStatus').textContent = (p && p.plan) ? '已有计划：' + (p.planAt ? new Date(p.planAt).toLocaleDateString() : '') + ' 生成，可重新提交更新' : '';
    setObMode('reg');
    showView('onboard');
  }

  /* 首屏登录/注册 Tab 切换 */
  function setObMode(mode) {
    obMode = mode;
    var tR = $('obTabReg'), tL = $('obTabLogin');
    if (tR) { tR.classList.toggle('primary', mode === 'reg'); tR.classList.toggle('ghost', mode !== 'reg'); }
    if (tL) { tL.classList.toggle('primary', mode === 'login'); tL.classList.toggle('ghost', mode !== 'login'); }
    if ($('obNick')) $('obNick').style.display = mode === 'reg' ? 'block' : 'none';
    if ($('obPassword')) $('obPassword').setAttribute('autocomplete', mode === 'reg' ? 'new-password' : 'current-password');
    if ($('obSubmit')) $('obSubmit').textContent = mode === 'reg' ? '注册并生成我的学习计划' : '登录并继续';
    if ($('obStatus')) $('obStatus').textContent = '';
  }

  function daysUntil(dateStr) {
    if (!dateStr) return 30;
    var d = new Date(dateStr), now = new Date();
    return Math.max(1, Math.round((d - now) / 86400000));
  }

  /* 本地生成个性化学习计划（不依赖 AI API） */
  function makeLocalPlan(profile, days) {
    var weak = profile.weak || [];
    var target = profile.target || '期末考试';
    var hours = parseFloat(profile.hours) || 2;
    var grade = profile.grade || '';
    var lines = [];
    lines.push('📋 ' + grade + ' · 目标：' + target + ' · 距离考试约 ' + days + ' 天');
    lines.push('每日可学：约 ' + hours + ' 小时');
    lines.push('');
    lines.push('【每日安排】');
    lines.push('· 前 15 分钟：回顾错题本（先攻「不会」的题）');
    lines.push('· 中间 30-60 分钟：按薄弱项刷题，每题标记掌握程度');
    lines.push('· 最后 10 分钟：记录当天的掌握情况，看学情报告');
    lines.push('');
    lines.push('【薄弱项专项】');
    if (weak.length) {
      lines.push('针对：' + weak.join('、'));
      lines.push('· 每项每天至少做 5 道题，连续 3 天正确率 ≥80% 再换下一项');
    } else {
      lines.push('先做「随机组卷」定位薄弱项，再针对性练习');
    }
    lines.push('');
    lines.push('【题库路径】');
    if (target === '考研数学') {
      lines.push('· 高数题库 → 函数与极限 / 一元积分 / 无穷级数 优先');
      lines.push('· 每周至少 2 次「综合随机刷题」检验整体水平');
    } else if (target === '四六级') {
      lines.push('· 题库 → 英语高频词 每天一组');
    } else {
      lines.push('· 高数题库按知识点逐块推进，结合专项刷题');
    }
    lines.push('');
    lines.push('【阶段目标】');
    var week1 = Math.max(1, Math.round(days * 0.3));
    var week2 = Math.max(1, Math.round(days * 0.6));
    lines.push('· 前 ' + week1 + ' 天：完成薄弱项扫盲，错题本清空一轮');
    lines.push('· 第 ' + (week1 + 1) + '-' + week2 + ' 天：全知识点过一遍，正确率目标 ≥70%');
    lines.push('· 最后 ' + Math.max(1, days - week2) + ' 天：冲刺 + 错题重刷，正确率目标 ≥85%');
    return lines.join('\n');
  }

  /* 提交 = 注册/登录 + 保存需求 + 生成计划。
     后端可用时账号落到服务端；纯静态部署（GitHub Pages）无后端时自动降级本地模式。 */
  async function onboardSubmit() {
    var st = $('obStatus');
    if (!st) return;
    st.textContent = '';
    var username = ($('obUsername') ? $('obUsername').value : '').trim();
    var password = $('obPassword') ? $('obPassword').value : '';
    var nick = ($('obNick') ? $('obNick').value : '').trim();
    var weak = Array.from(document.querySelectorAll('#obWeak input:checked')).map(function (i) { return i.value; });
    var profile = {
      nick: nick || username || WG_Data.get().nick || '同学',
      grade: $('obGrade').value, target: $('obTarget').value,
      examDate: $('obDate').value, weak: weak, hours: $('obHours').value
    };

    var btn = $('obSubmit');
    var oldTxt = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '处理中…'; }

    /* 填了账号信息才走云端注册/登录 */
    if (username && password) {
      try {
        if (obMode === 'reg') {
          st.textContent = '正在注册…';
          await WG_API.register(username, password, nick);
        } else {
          st.textContent = '正在登录…';
          await WG_API.login(username, password);
        }
        /* 登录成功：先把需求 profile 落到本地，再与云端数据合并（云端昵称优先） */
        WG_Data.setProfile(profile);
        try {
          var merged = await WG_API.pullMerge(WG_Data.get());
          WG_Data.replaceAll(merged);
        } catch (e) { /* 云端同步失败不阻断本地使用 */ }
        profile.nick = WG_Data.get().nick || profile.nick;
        WG_Data.setProfile(profile);
        refreshNickUI();
        toast('欢迎回来，' + (WG_Data.get().nick || username), 'ok');
        finishOnboard(profile);
        if (btn) { btn.disabled = false; btn.textContent = oldTxt; }
        return;
      } catch (e) {
        /* 无后端（纯静态托管）或网络问题：降级为本地模式，不让用户卡在注册上 */
        var offline = !e.status || e.status === 404 || e.status === 0 || /fetch|network|failed/i.test(e.message || '');
        if (offline) {
          st.textContent = '⚠ 未检测到后端服务，已进入本地模式（数据仅存本机，随时可右上角账号注册）';
          WG_Data.setProfile(profile);
          finishOnboard(profile);
          if (btn) { btn.disabled = false; btn.textContent = oldTxt; }
          return;
        }
        st.textContent = e.message || '操作失败，请稍后再试';
        if (btn) { btn.disabled = false; btn.textContent = oldTxt; }
        return;
      }
    }

    /* 未填账号：纯本地模式 */
    WG_Data.setProfile(profile);
    finishOnboard(profile);
    if (btn) { btn.disabled = false; btn.textContent = oldTxt; }
  }

  /* 生成个性化学习计划并进入首页 */
  function finishOnboard(profile) {
    var days = daysUntil(profile.examDate);
    var plan = makeLocalPlan(profile, days);
    WG_Data.saveProfilePlan(plan);
    var st = $('obStatus');
    if (st) st.textContent = '✓ 个性化学习计划已生成！';
    var planEl = $('obPlan');
    if (planEl) {
      planEl.textContent = plan;
      planEl.classList.remove('hidden');
    }
    setTimeout(function () { goHome(); }, 2000);
  }

  /* 跳过注册：本地体验模式，之后可随时右上角账号注册 */
  function onboardSkip() {
    var profile = {
      nick: '同学', skipped: true, grade: '大二',
      target: '期末考试', examDate: '', weak: [], hours: '2'
    };
    WG_Data.setProfile(profile);
    toast('已进入本地体验模式，随时可点击右上角「玩家」注册账号');
    goHome();
  }

  function stopGames() {
    [WG_Game, WG_Quiz, WG_Matrix, WG_Logic, WG_Vector, WG_Seq, WG_Gaoshu].forEach(function (g) { if (g && g.stop) g.stop(); });
  }

  /* ---------- 错题本 ---------- */
  /* 各错题集的展开/收起状态，只存在内存里，刷新页面回到默认展开 */
  var mistakeOpen = {};

  /* 错题本筛选状态：all｜weak(标记不会)｜multi(高频错题) */
  var mistakeFilter = 'all';
  var mistakeKw = '';

  /* 当前 AI 变式训练会话状态 */
  var aiVar = { qid: '', question: '', topic: '', answer: '', analysis: '', answered: false, correct: false, working: false };

  function setText(id, v) { var e = $(id); if (e) e.textContent = v; }

  /* 单条错题卡片：错题本统一渲染砖块（分组与筛选平铺共用） */
  function mistakeItemHtml(m) {
    var q = WG_Gaoshu.latexToText(m.question || '').slice(0, 90);
    var qid = m.qid || '';
    var date = m.lastAt ? new Date(m.lastAt).toLocaleDateString() : '';
    var topic = m.topic || '';
    return '<div class="mistake-item' + (m.markedWeak ? ' is-weak' : '') + '" data-qid="' + qid + '">' +
      '<div class="mi-head">' +
      (m.markedWeak ? '<span class="mi-weak">不会</span>' : '') +
      (m.topic ? '<span class="mi-topic-chip">' + escHtml(m.topic) + '</span>' : '') +
      '<span class="mi-wrong">错 ' + (m.wrongCount || 1) + ' 次</span>' +
      '<span class="mi-date">' + date + '</span></div>' +
      '<div class="mi-q">' + escHtml(q) + '</div>' +
      '<div class="mi-actions">' +
      '<button class="btn-ai-var" data-qid="' + qid + '" data-topic="' + escHtml(topic) + '" title="AI 根据考点生成变式题，在线作答举一反三">✨ AI 举一反三</button>' +
      '<button class="btn primary mi-retry" data-qid="' + qid + '" style="font-size:0.8rem;">重做这道题</button>' +
      '<button class="btn ghost mi-del" data-qid="' + qid + '" style="font-size:0.8rem;">移出错题本</button>' +
      '</div></div>';
  }

  function renderMistakes() {
    stopGames();
    var d = WG_Data.get();
    var ms = d.mistakes || [];
    var cl = d.cleared || [];
    var el = $('view-mistakes');
    var box = $('mistakeList');
    var head = $('mistakeCount');
    if (!box) { showView('home'); return; }
    head.textContent = ms.length;

    /* ===== 学情看板：待攻克 / 已攻克 / 综合攻克率 / 标记不会 ===== */
    var openN = ms.length;
    var clearedN = cl.length;
    var base = openN + clearedN;
    var mastery = base ? Math.round(clearedN / base * 100) : 0;
    var weakN = ms.filter(function (m) { return m.markedWeak; }).length;
    setText('mdOpenCount', openN);
    setText('mdClearedCount', clearedN);
    setText('mdMasteryPct', mastery + '%');
    setText('mdWeakCount', weakN);
    setText('mdSmartTip', '💡 智能诊断：综合攻克率 ' + mastery + '%，待攻克 ' + openN + ' 题。高频错题建议先整组重刷，再用「AI 举一反三」吃透同类考点。');

    /* ===== 多维筛选 + 关键词搜索 ===== */
    var kw = (mistakeKw || '').trim().toLowerCase();
    var filterMode = mistakeFilter !== 'all' || kw !== '';
    var list = ms;
    if (mistakeFilter === 'weak') list = list.filter(function (m) { return m.markedWeak; });
    else if (mistakeFilter === 'multi') list = list.filter(function (m) { return (m.wrongCount || 1) >= 2; });
    if (kw) {
      list = list.filter(function (m) {
        var hay = ((m.question || '') + ' ' + (m.topic || '') + ' ' + (m.qid || '')).toLowerCase();
        return hay.indexOf(kw) >= 0;
      });
    }

    if (ms.length === 0) {
      box.innerHTML = '<div style="text-align:center;padding:2.5rem 1rem;border:1px dashed var(--rule-strong);border-radius:16px;color:var(--muted);">' +
        '<div style="font-size:2rem;margin-bottom:0.6rem;">📭</div>' +
        '错题本是空的。<br>答错的题、标记「不会」的题会自动收进来。</div>';
    } else if (filterMode) {
      /* 筛选/搜索激活：平铺列出匹配项，避免分组的掌握度造成误导 */
      if (!list.length) {
        box.innerHTML = '<div style="text-align:center;padding:2.5rem 1rem;border:1px dashed var(--rule-strong);border-radius:16px;color:var(--muted);">' +
          '<div style="font-size:2rem;margin-bottom:0.6rem;">🔍</div>没有匹配的错题。<br>换个关键词或筛选条件试试。</div>';
      } else {
        box.innerHTML = '<div class="mset-note">共 ' + list.length + ' 条匹配（已按当前筛选展开）</div>' +
          list.map(mistakeItemHtml).join('');
      }
    } else {
      /* 默认：按知识点归集成错题集，每组一张卡，带掌握度和整组重刷 */
      box.innerHTML = WG_Data.mistakeGroups().map(function (g) {
        var open = mistakeOpen[g.name] !== false;   /* 默认展开，收起状态记在内存里 */
        var ids = g.items.map(function (m) { return m.qid; }).filter(Boolean);
        var lvl = g.mastery >= 80 ? 'hi' : (g.mastery >= 40 ? 'mid' : 'lo');
        return '<section class="mset' + (open ? '' : ' mset-fold') + '" data-set="' + escHtml(g.name) + '">' +
          '<header class="mset-head">' +
            '<button class="mset-toggle" aria-expanded="' + open + '">' +
              '<span class="mset-caret" aria-hidden="true">▾</span>' +
              '<span class="mset-name">' + escHtml(g.name) + '</span>' +
              '<span class="mset-num">' + g.open + ' 题待攻克</span>' +
            '</button>' +
            '<div class="mset-bar" role="img" aria-label="掌握度 ' + g.mastery + '%">' +
              '<i class="mset-fill mset-' + lvl + '" style="width:' + g.mastery + '%"></i>' +
            '</div>' +
            '<span class="mset-pct mset-' + lvl + '">掌握 ' + g.mastery + '%</span>' +
            (ids.length > 1
              ? '<button class="btn primary ms-redo" data-ids="' + ids.join(',') + '" data-set="' + escHtml(g.name) + '">整组重刷</button>'
              : '') +
          '</header>' +
          '<div class="mset-body">' +
            (g.cleared ? '<div class="mset-note">已攻克 ' + g.cleared + ' 题</div>' : '') +
            g.items.map(mistakeItemHtml).join('') +
          '</div>' +
        '</section>';
      }).join('');
    }
    showView('mistakes');
  }

  /* ===== AI 举一反三 · 变式训练弹窗 ===== */
  function openAIVariation(qid) {
    var d = WG_Data.get();
    var m = (d.mistakes || []).find(function (x) { return String(x.qid) === String(qid); });
    if (!m) { toast('未找到这道错题'); return; }
    aiVar = { qid: m.qid, question: m.question || '', topic: m.topic || '综合', answer: '', analysis: '', answered: false, correct: false, working: false };
    setText('aiVarOrigQ', '【' + (m.topic || '综合') + '】' + WG_Gaoshu.latexToText(m.question || ''));
    setText('aiVarTopicTag', m.topic || '综合');
    $('aiVarLoading').classList.remove('hidden');
    $('aiVarContent').classList.add('hidden');
    $('aiVarResult').classList.add('hidden');
    $('aiVariationModal').classList.remove('hidden');
    generateAIVariation();
  }

  function generateAIVariation() {
    aiVar.answered = false; aiVar.correct = false;
    $('aiVarLoading').classList.remove('hidden');
    $('aiVarContent').classList.add('hidden');
    $('aiVarResult').classList.add('hidden');
    var mk = $('aiVarMarkMasteredBtn');
    if (mk) { mk.disabled = true; mk.textContent = '✓ 变式题通关，移出错题本'; }
    aiVar.working = true;
    WG_AI.generateVariation(aiVar.question, aiVar.topic).then(function (v) {
      aiVar.working = false;
      renderAIVariation(v);
    }).catch(function (e) {
      aiVar.working = false;
      $('aiVarLoading').classList.add('hidden');
      /* 出题失败：展示原始内容，让错误可见而不是静默 */
      var errEl = $('aiVarQText');
      errEl.textContent = '😵 变式题生成失败：' + WG_AI.errText(e);
      $('aiVarContent').classList.remove('hidden');
      $('aiVarOptions').innerHTML = '';
    });
  }

  /* 「再出一道变式题」：清空上次作答状态后重新出题 */
  function regenerateAIVariation() {
    var mk = $('aiVarMarkMasteredBtn');
    if (mk) { mk.disabled = true; mk.textContent = '✓ 变式题通关，移出错题本'; }
    $('aiVarOptions').innerHTML = '';
    $('aiVarResult').classList.add('hidden');
    generateAIVariation();
  }

  function renderAIVariation(v) {
    $('aiVarLoading').classList.add('hidden');
    $('aiVarContent').classList.remove('hidden');
    var qtext = $('aiVarQText');
    qtext.textContent = v.question || '（AI 未返回题干）';
    /* 选项渲染：剥离「A.」前缀，字母单独成列，点击区更大 */
    var opts = v.options || [];
    $('aiVarOptions').innerHTML = opts.map(function (o, i) {
      var letter = String.fromCharCode(65 + i);
      var txt = String(o).replace(/^[A-D][.、:：)]?\s*/, '');
      return '<button type="button" class="ai-var-opt" data-letter="' + letter + '">' +
        '<b class="ai-var-opt-letter">' + letter + '.</b>' +
        '<span class="ai-var-opt-text">' + escHtml(txt) + '</span></button>';
    }).join('');
    aiVar.answer = String(v.answer || 'A').toUpperCase().replace(/[^A-D]/g, '');
    if (!aiVar.answer || aiVar.answer.length !== 1) aiVar.answer = 'A';
    aiVar.analysis = v.analysis || '（AI 未返回详细解析）';
  }

  /* 选项点击：答对全亮+出解析；答错只标红该项并提示再试，保留继续尝试的机会 */
  function onVarOptionClick(e) {
    var btn = e.target.closest ? e.target.closest('.ai-var-opt') : null;
    if (!btn || btn.disabled || aiVar.working || aiVar.answered && aiVar.correct) return;
    var letter = btn.getAttribute('data-letter');
    var ok = letter === aiVar.answer;
    if (ok) {
      aiVar.answered = true; aiVar.correct = true;
      var all = $('aiVarOptions').querySelectorAll('.ai-var-opt');
      for (var i = 0; i < all.length; i++) {
        all[i].disabled = true;
        all[i].classList.add(all[i].getAttribute('data-letter') === aiVar.answer ? 'correct' : 'dim');
      }
      var banner = $('aiVarStatusBanner');
      banner.className = 'ai-var-status-banner ok';
      banner.textContent = '🎉 回答正确！同类题你已经能举一反三了。';
      $('aiVarAnalysisText').textContent = aiVar.analysis;
      $('aiVarResult').classList.remove('hidden');
      var mk = $('aiVarMarkMasteredBtn');
      mk.disabled = false;
      mk.innerHTML = '✓ 变式题通关，移出错题本';
    } else {
      btn.disabled = true;
      btn.classList.add('wrong');
      toast('再想想，换个选项试试', '');
    }
  }

  function closeAIVariation() {
    $('aiVariationModal').classList.add('hidden');
    aiVar = { qid: '', question: '', topic: '', answer: '', analysis: '', answered: false, correct: false, working: false };
  }

  /* 变式题答对 → 标记攻克并移出错题本 */
  function markAIMastered() {
    if (!aiVar.qid || !aiVar.correct) return;
    WG_Data.removeMistake(aiVar.qid, { mastered: true });
    toast('已攻克！这道错题已移出错题本', 'ok');
    closeAIVariation();
    renderMistakes();
  }

  /* AI 错题学情诊断：调起 AI 助手侧栏，本地统计 + AI 建议 */
  function aiDiagnose() {
    var d = WG_Data.get();
    var ms = d.mistakes || [];
    var cl = d.cleared || [];
    var byTopic = {};
    ms.forEach(function (m) {
      var t = m.topic || '综合';
      var c = byTopic[t] || { n: 0, weak: 0 };
      c.n += (m.wrongCount || 1);
      if (m.markedWeak) c.weak++;
      byTopic[t] = c;
    });
    var top = Object.keys(byTopic).sort(function (a, b) {
      return byTopic[b].n - byTopic[a].n || byTopic[b].weak - byTopic[a].weak;
    }).slice(0, 5);
    var topStr = top.length
      ? top.map(function (t) { return t + '(' + byTopic[t].n + ' 次' + (byTopic[t].weak ? '，不熟练' : '') + ')'; }).join('、')
      : '暂无高频错题';
    var openN = ms.length;
    var masterRate = (openN + cl.length) ? Math.round(cl.length / (openN + cl.length) * 100) : 0;
    var summary = '📊 本地学情快照：待攻克 ' + openN + ' 题 · 已攻克 ' + cl.length + ' 题 · 综合攻克率 ' + masterRate + '%\n'
      + '🔺 高频薄弱考点：' + topStr + '\n'
      + '👉 需要 AI 给出针对性补强建议…';
    aiSideOpen();
    aiMsgAdd('user', '请根据我的错题学情，给出针对性补强建议');
    var loading = aiMsgAdd('bot', 'AI 学情诊断中…');
    loading.classList.add('loading');
    WG_AI.analyzeStats({ openMistakes: openN, cleared: cl.length, byTopic: byTopic, weakCount: ms.filter(function (m) { return m.markedWeak; }).length })
      .then(function (reply) {
        loading.classList.remove('loading');
        loading.textContent = '【📋 学情摘要】\n' + summary + '\n\n【💡 AI 建议】\n' + reply;
        aiSaveChat();
      })
      .catch(function (e) {
        loading.classList.remove('loading');
        loading.textContent = '【📋 学情摘要】\n' + summary + '\n\n（AI 建议生成失败：' + WG_AI.errText(e) + '）';
        aiSaveChat();
      });
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* 重做错题：单题或整组，走同一条路径，只是题号集合不同 */
  function retryMistake(qid) { retryMistakeSet([qid], ''); }

  function retryMistakeSet(ids, setName) {
    ids = (ids || []).filter(Boolean);
    if (!ids.length) { toast('这一组没有可重做的题'); return; }
    stopGames();
    state.backView = 'mistakes';
    var many = ids.length > 1;
    state.currentLevel = {
      id: 'mistake', name: many ? '错题集重刷' : '错题重做', type: 'gaoshu',
      topic: null, n: ids.length, mistakeIds: ids, mode: 'mistake'
    };
    state.currentIndex = 0;
    /* 再来一组：还刷这一批题号。刚攻克的题已经不在错题本里了，
       但这里是「再练一遍」而不是「重新抽题」，保留原题组更符合预期。 */
    state.replay = function () { retryMistakeSet(ids, setName); };
    $('gameTitle').textContent = many ? '错题集重刷' : '错题重做';
    $('gameSub').textContent = (setName ? setName + ' · ' : '错题本 · ') + (many ? ids.length + ' 题连刷' : '逐题攻破');
    $('goalHint').textContent = many
      ? '逐题重做，答对并标记「掌握了」的题会移出错题本'
      : '重新做这道题，答对并标记「掌握了」即移出错题本';
    if ($('stStars')) $('stStars').textContent = '☆☆☆';
    $('board').classList.add('hidden');
    $('quizArea').classList.add('hidden');
    $('customArea').classList.remove('hidden');
    /* 错题重刷是临时题组，没有章节可列，目录整块折叠 */
    resetExamProgress();
    renderExamNav(null);
    closeExamSide();
    showView('game');
    WG_Gaoshu.start(state.currentLevel, { onStats: renderStats, onEnd: onGameEnd });
  }

  /* ---------- 学情报告 ---------- */
  function renderReport() {
    stopGames();
    var a = WG_Data.analyze();
    var box = $('reportBody');
    if (!box) { showView('home'); return; }
    var total = a.total;
    var doneAll = total.c + total.w;
    var accAll = doneAll ? Math.round(total.c / doneAll * 100) : 0;
    var html = '';

    /* 概览卡片 */
    html += '<div class="report-cards">' +
      '<div class="rep-card"><div class="rep-num">' + a.answers + '</div><div class="rep-label">累计做题</div></div>' +
      '<div class="rep-card"><div class="rep-num">' + accAll + '%</div><div class="rep-label">总正确率</div></div>' +
      '<div class="rep-card"><div class="rep-num">' + a.mistakes + '</div><div class="rep-label">错题数</div></div>' +
      '<div class="rep-card"><div class="rep-num">' + total.master + '</div><div class="rep-label">已掌握</div></div>' +
      '</div>';

    if (a.answers === 0) {
      box.innerHTML = html + '<div style="text-align:center;padding:2.5rem 1rem;border:1px dashed var(--rule-strong);border-radius:16px;color:var(--muted);">' +
        '<div style="font-size:2rem;margin-bottom:0.6rem;">📊</div>还没有做题记录，先去练习一组题吧！</div>';
      showView('report');
      return;
    }

    /* 各知识点正确率 */
    html += '<div class="rep-sec-title">各知识点正确率</div><div class="rep-bars">';
    a.topics.forEach(function (t) {
      var color = t.accuracy >= 80 ? 'var(--ok)' : t.accuracy >= 60 ? 'var(--gold)' : 'var(--danger)';
      html += '<div class="rep-bar-row"><div class="rep-bar-name">' + t.name + '</div>' +
        '<div class="rep-bar-track"><div class="rep-bar-fill" style="width:' + t.accuracy + '%;background:' + color + ';"></div></div>' +
        '<div class="rep-bar-val">' + t.accuracy + '% <span class="dim">(' + t.correct + '/' + t.total + ')</span></div></div>';
    });
    html += '</div>';

    /* 把握程度分布 */
    html += '<div class="rep-sec-title">把握程度分布</div><div class="rep-grasp">' +
      '<span style="color:var(--ok);">掌握 ' + total.master + '</span>' +
      '<span style="color:var(--gold);">模糊 ' + total.fuzzy + '</span>' +
      '<span style="color:var(--danger);">不会 ' + total.weak + '</span>' +
      '</div>';

    box.innerHTML = html;
    showView('report');
  }

  /* ---------- 导航路由 ---------- */
  function navTo(name) {
    stopGames();
    if (name === 'home') renderHome();
    else if (name === 'bank') gateData(function () { renderBank(); });
    else if (name === 'study') {
      /* 若自习室仍在进行中，直接切回并按需恢复计时；否则弹出入场设置 */
      if (window.StudyRoom && typeof window.StudyRoom.isActive === 'function' && window.StudyRoom.isActive()) {
        showView('study');
        if (typeof window.StudyRoom.onViewShown === 'function') window.StudyRoom.onViewShown();
      } else {
        openStudySetup();
      }
    }
    else if (name === 'wenku') gateData(function () { renderWenku(); });
    else if (name === 'mistakes') gateData(function () { renderMistakes(); });
    else if (name === 'report') renderReport();
    else if (name === 'ai') showView('ai');
  }

  /* 随机组卷：从高数题库随机抽题 */
  function enterRandom() {
    stopGames();
    /* n 不传（0）= 不限量：随机打乱整个题库，想做多少做多少 */
    state.currentLevel = { id: 'random', name: '随机组卷', type: 'gaoshu', topic: null, n: 0, diff: null };
    state.currentIndex = 0;
    state.backView = 'home';
    /* 再来一组：重新随机抽一批 */
    state.replay = enterRandom;
    $('gameTitle').textContent = '随机组卷';
    $('gameSub').textContent = '高数题库 · 随机抽题';
    $('goalHint').textContent = '全库随机 · 不限量 · 可随时跳题 / 标记 / 结束本轮';
    if ($('stStars')) $('stStars').textContent = '☆☆☆';
    $('board').classList.add('hidden');
    $('quizArea').classList.add('hidden');
    $('customArea').classList.remove('hidden');
    /* 随机组卷跨章节抽题，目录无从对应，折叠 */
    resetExamProgress();
    renderExamNav(null);
    closeExamSide();
    showView('game');
    WG_Gaoshu.start(state.currentLevel, { onStats: renderStats, onEnd: onGameEnd });
  }

  function goHome() {
    stopGames();
    renderHome();
  }

  function init() {
    bind();
    refreshNickUI();
    /* 首屏（登录/注册界面）立即渲染，重型题库数据后台异步加载不阻塞 */
    if (window.WG_Heavy) WG_Heavy.load();
    /* 深链：#study 直接进入自习室（默认设置），方便分享直达 */
    if (location.hash === '#study') {
      if (window.StudyRoom && typeof window.StudyRoom.enter === 'function') {
        showView('study');
        window.StudyRoom.enter({
          duration: 25, mode: 'strict',
          subject: '高等数学', motto: '保持专注，全力以赴！',
          sound: 'music-user'
        });
        return;
      }
    }
    /* 已登录：静默拉取云端数据合并到本地（失败不影响使用） */
    if (window.WG_API && WG_API.isLoggedIn()) {
      WG_API.pullMerge(WG_Data.get()).then(function (merged) {
        WG_Data.replaceAll(merged);
        refreshNickUI();
        if (state.view !== 'onboard') renderHome();
      }).catch(function () {
        /* token 失效（401）等：刷新登录态显示，清除残留的 ☁ 标识 */
        refreshNickUI();
      });
    }
    if (!WG_Data.get().profile) {
      showOnboard();
    } else {
      goHome();
    }
  }

  /* 供自习室引擎调用：重新打开入场设置弹窗 */
  window.StudyAppBridge = {
    openSetup: function () { openStudySetup(); },
    navTo: function (name) { navTo(name); }
  };

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', WG_App.init);
