/* ============ 稳过 · 应用主逻辑：路由 / 状态 / 大厅 ============ */
'use strict';

var WG_Data = (function () {
  var KEY = 'wenguo_v1';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  return {
    get: function () {
      var d = load();
      if (!d.levels) d.levels = {};        /* levelId -> {stars, bestTime} */
      if (!d.nick) d.nick = '同学';
      if (!d.answers) d.answers = [];      /* 做题记录 -> 学情分析 */
      if (!d.mistakes) d.mistakes = [];    /* 错题本：[{qid, topic, question, answer, correctAns, wrongCount, lastAt}] */
      if (!d.checkin) d.checkin = [];      /* 打卡日期 */
      if (!d.profile) d.profile = null;    /* 登录信息 + 个性化需求 */
      return d;
    },
    save: save,
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
    /* 从错题本移除（重新做对且把握度高时） */
    removeMistake: function (qid) {
      var d = load();
      if (!d.mistakes) return;
      d.mistakes = d.mistakes.filter(function (x) { return x.qid !== qid; });
      save(d);
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
    }
  };
})();

var WG_App = (function () {
  var state = {
    view: 'home',
    continentId: 'study',
    currentLevel: null,
    currentIndex: -1
  };
  var els = {};

  function $(id) { return document.getElementById(id); }
  function showView(name) {
    ['home', 'bank', 'module', 'wenku', 'game', 'report', 'mistakes', 'ai', 'onboard'].forEach(function (v) {
      var el = $('view-' + v);
      if (el) el.classList.toggle('hidden', v !== name);
    });
    /* 导航高亮 */
    if (['home', 'bank', 'wenku', 'report', 'mistakes', 'ai'].indexOf(name) >= 0) {
      var links = document.querySelectorAll('#topnav a');
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-nav') === name);
      });
    }
    state.view = name;
  }

  /* ---------- 模块详情（子模块 + 题数选择） ---------- */
  var currentCount = 20;
  function renderModule(level) {
    stopGames();
    state.currentModule = level;
    $('modTitle').textContent = level.name;
    $('modSub').textContent = (level.group || '模块') + ' · 选择子模块开始刷题';
    var subGrid = $('subGrid');
    if (!subGrid) { showView('home'); return; }
    var html = '';
    /* 全部混合入口 */
    var allCount = moduleCount(level);
    html += '<div class="mod-card" data-mode="all"><div class="mod-tag">混合</div>' +
      '<div class="mod-name">全部知识点</div>' +
      '<div class="mod-meta">共 ' + allCount + ' 题，随机混合抽题</div>' +
      '<div class="mod-go">开始练习 →</div></div>';
    /* 子模块 */
    if (level.topicList) {
      level.topicList.forEach(function (tk) {
        var td = GAOSHU_BANK[tk];
        var cnt = td ? td.problems.length : 0;
        html += '<div class="mod-card" data-topic="' + tk + '"><div class="mod-tag">' + (level.group || '') + '</div>' +
          '<div class="mod-name">' + tk + '</div>' +
          '<div class="mod-meta">' + cnt + ' 题</div>' +
          '<div class="mod-go">开始练习 →</div></div>';
      });
    }
    subGrid.innerHTML = html;
    showView('module');
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
    lvl.n = currentCount > 0 ? currentCount : moduleCount(lv);
    state.currentLevel = lvl;
    state.currentIndex = 0;
    state.backView = 'module';
    $('gameTitle').textContent = lv.name + (topic ? ' · ' + topic : ' · 综合');
    $('gameSub').textContent = (lv.group || '') + ' · 题库刷题';
    $('goalHint').textContent = '连做 ' + lvl.n + ' 道题 · 每题看解析并标记掌握程度';
    if ($('stStars')) $('stStars').textContent = '☆☆☆';
    $('board').classList.add('hidden');
    $('quizArea').classList.add('hidden');
    $('customArea').classList.remove('hidden');
    showView('game');
    WG_Gaoshu.start(lvl, { onStats: renderStats, onEnd: onGameEnd });
  }

  /* 计算模块真实题量 */
  function moduleCount(l) {
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

  /* 渲染模块卡片（按学科分组） */
  function renderModCards(containerId) {
    var data = WG_Data.get();
    var cont = getContinent('study');
    var lvs = getLevelsOf(cont.id);
    /* 按 group 分组，保持组顺序 */
    var groups = [];
    var order = ['高等数学', '线性代数', '概率论', '英语'];
    lvs.forEach(function (l) {
      var g = l.group || '其他';
      if (groups.indexOf(g) < 0) groups.push(g);
    });
    groups.sort(function (a, b) {
      var ia = order.indexOf(a), ib = order.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    var html = groups.map(function (g) {
      var items = lvs.filter(function (l) { return (l.group || '其他') === g; });
      var cards = items.map(function (l, i) {
        var rec = data.levels[l.id];
        var stars = rec ? rec.stars : 0;
        var starStr = stars ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
        var cnt = moduleCount(l);
        return '<div class="mod-card" data-level="' + l.id + '" data-idx="' + i + '">' +
          '<div class="mod-tag">' + g + '</div>' +
          '<div class="mod-name">' + l.name + '</div>' +
          '<div class="mod-meta">共 ' + cnt + ' 题 · ' + (l.diff === 3 ? '拔尖' : l.diff === 1 ? '基础' : '适中') + '</div>' +
          (starStr ? '<div class="mod-stars">' + starStr + '</div>' : '<div class="mod-go">开始练习 →</div>') +
          '</div>';
      }).join('');
      return '<div class="group-title">' + g + ' <span style="color:var(--muted);font-size:0.78rem;">' + items.length + ' 个模块</span></div>' +
        '<div class="mod-grid">' + cards + '</div>';
    }).join('');
    var box = $(containerId);
    if (box) box.innerHTML = html;
  }

  /* ---------- 首页 ---------- */
  function renderHome() {
    var data = WG_Data.get();
    $('nickName').textContent = data.nick;

    /* Hero 统计 */
    var a = WG_Data.analyze();
    var doneAll = a.total.c + a.total.w;
    $('hsDone').textContent = a.answers;
    $('hsAcc').textContent = doneAll ? Math.round(a.total.c / doneAll * 100) + '%' : '—';
    $('hsErr').textContent = a.mistakes;

    /* 首页题库板块：分组展示 */
    renderModCards('homeBankGrid');

    /* 首页学习资料板块 */
    var wkGrid = $('homeWenkuGrid');
    if (wkGrid) {
      var pdfTotal = WENKU ? (WENKU.pdfs || []).length : 0;
      var pdfLocal = WENKU ? (WENKU.pdfs || []).filter(function (x) { return x.link && x.link.indexOf('data/pdf/') === 0; }).length : 0;
      var bookTotal = WENKU ? (WENKU.books || []).length : 0;
      var bookLocal = WENKU ? (WENKU.books || []).filter(function (x) { return x.link && x.link.indexOf('data/pdf/') === 0; }).length : 0;
      var matTotal = WENKU ? (WENKU.materials || []).length : 0;
      var matLocal = WENKU ? (WENKU.materials || []).filter(function (x) { return x.link && x.link.indexOf('data/pdf/') === 0; }).length : 0;
      wkGrid.innerHTML =
        '<a class="wk-entry" data-wenku="pdfs" href="javascript:void(0)"><div class="wk-ic">📄</div><div class="wk-t">PDF 资料库</div><div class="wk-c">' + pdfLocal + '/' + pdfTotal + ' 份 · 真题/习题/心得</div></a>' +
        '<a class="wk-entry" data-wenku="books" href="javascript:void(0)"><div class="wk-ic">📚</div><div class="wk-t">教材习题</div><div class="wk-c">' + bookLocal + '/' + bookTotal + ' 本 · 高等代数等</div></a>' +
        '<a class="wk-entry" data-wenku="materials" href="javascript:void(0)"><div class="wk-ic">✏️</div><div class="wk-t">刷题资料</div><div class="wk-c">' + matLocal + '/' + matTotal + ' 份 · 真题卷/做题本</div></a>';
    }

    /* 敬请期待板块 */
    var comingGrid = $('homeComingGrid');
    if (comingGrid) {
      var comingItems = [
        { id: 'english', name: '四六级之岛', icon: '🏝️', tag: 'CET-4/6', desc: '高频词 · 语法 · 真题风格', color: '#f472b6' },
        { id: 'ielts', name: '雅思备战营', icon: '🎓', tag: 'IELTS', desc: '听说读写 · 口语题库 · 写作模板', color: '#a78bfa' },
        { id: 'computer', name: '计算机考级', icon: '💻', tag: 'NCRE', desc: '二级Office · C语言 · Python', color: '#67e8f9' }
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

    showView('home');
  }

  /* ---------- 题库页 ---------- */
  function renderBank() {
    stopGames();
    renderModCards('bankGrid');
    showView('bank');
  }

  /* ---------- 学习资料页 ---------- */
  var wenkuTab = 'pdfs';
  function renderWenku(tab) {
    stopGames();
    if (tab) wenkuTab = tab;
    /* 更新 tab 高亮与计数 */
    var tabs = document.querySelectorAll('#wenkuTabs .wt-btn');
    tabs.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-wt') === wenkuTab);
    });
    if (WENKU) {
      /* 计数显示：已下载 / 总数量 */
      if ($('wtPdfs')) $('wtPdfs').textContent = (WENKU.pdfs || []).filter(function (x) { return x.link && x.link.indexOf('data/pdf/') === 0; }).length + '/' + (WENKU.pdfs || []).length;
      if ($('wtBooks')) $('wtBooks').textContent = (WENKU.books || []).filter(function (x) { return x.link && x.link.indexOf('data/pdf/') === 0; }).length + '/' + (WENKU.books || []).length;
      if ($('wtMats')) $('wtMats').textContent = (WENKU.materials || []).filter(function (x) { return x.link && x.link.indexOf('data/pdf/') === 0; }).length + '/' + (WENKU.materials || []).length;
    }
    var kw = ($('wenkuSearch') ? $('wenkuSearch').value : '').trim();
    var list = [];
    if (WENKU) {
      if (wenkuTab === 'pdfs') list = WENKU.pdfs || [];
      else if (wenkuTab === 'books') list = WENKU.books || [];
      else list = WENKU.materials || [];
    }
    if (kw) {
      list = list.filter(function (x) {
        return (x.title || '').indexOf(kw) >= 0 || (x.tags || []).join(' ').indexOf(kw) >= 0 || (x.desc || '').indexOf(kw) >= 0;
      });
    }
    var box = $('wenkuList');
    if (!box) { showView('home'); return; }
    if (list.length === 0) {
      box.innerHTML = '<div style="text-align:center;padding:2.5rem 1rem;border:1px dashed var(--rule-strong);border-radius:16px;color:var(--muted);">暂无匹配的资料。</div>';
    } else {
      box.innerHTML = list.slice(0, 200).map(function (x, i) {
        var tags = (x.tags || []).slice(0, 4).map(function (t) {
          return '<span class="wk-tag">' + escHtml(t) + '</span>';
        }).join('');
        var desc = x.desc || '';
        var isLocal = x.link && x.link.indexOf('data/pdf/') === 0;
        var badge = isLocal ? '<span class="wk-local">已下载</span>' : '<span class="wk-pending">敬请期待</span>';
        var goText = isLocal ? '打开 PDF →' : '敬请期待';
        return '<div class="wk-item' + (isLocal ? '' : ' wk-item-pending') + '" data-idx="' + i + '" style="cursor:pointer;">' +
          '<div class="wk-item-head">' + (x.title ? escHtml(x.title) : '') + ' ' + badge + '</div>' +
          (tags ? '<div class="wk-item-tags">' + tags + '</div>' : '') +
          (desc ? '<div class="wk-item-desc">' + escHtml(desc.slice(0, 110)) + '</div>' : '') +
          '<div class="wk-item-go">' + goText + '</div>' +
          '</div>';
      }).join('') + '<div style="text-align:center;font-size:0.78rem;color:var(--muted);margin-top:1rem;">共 ' + list.length + ' 份资料（已下载 ' + list.filter(function (x) { return x.link && x.link.indexOf('data/pdf/') === 0; }).length + ' 份）</div>';
      box._list = list;
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
    if (link) {
      if (isLocal) {
        link.href = x.link;
        link.textContent = '打开本地 PDF ↓';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.cursor = 'pointer';
      } else {
        link.href = 'javascript:void(0)';
        link.textContent = '敬请期待 — 资料尚未下载';
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.style.cursor = 'default';
      }
    }
    el.classList.remove('hidden');
  }

  /* ---------- 进入学习模块 ---------- */
  function enterLevel(levelId, idx) {
    var cont = getContinent(state.continentId);
    var lvs = getLevelsOf(cont.id);
    var level = lvs.find(function (l) { return l.id === levelId; });
    if (!level) return;
    state.backView = state.view === 'bank' ? 'bank' : (state.view === 'module' ? 'module' : 'home');
    state.currentLevel = level;
    state.currentIndex = idx;
    stopGames();
    $('gameTitle').textContent = level.name;
    $('gameSub').textContent = cont.name + ' · ' + (level.kw || '综合');
    var isQuiz = level.type === 'quiz' || level.type === 'practice';
    var isGaoshu = level.type === 'gaoshu';
    var goalMap = {
      practice: '连做 ' + (level.n || 10) + ' 题 · 按正确率评分',
      gaoshu: '连做 ' + (level.n || 10) + ' 道题 · 每题看解析并标记掌握程度'
    };
    $('goalHint').textContent = goalMap[level.type] || '';
    if ($('stStars')) $('stStars').textContent = '☆☆☆';
    $('board').classList.toggle('hidden', isQuiz || isGaoshu);
    $('quizArea').classList.toggle('hidden', !isQuiz);
    $('customArea').classList.toggle('hidden', !isGaoshu);
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

  /* ---------- 昵称 ---------- */
  function promptNick() {
    var cur = WG_Data.get().nick;
    var v = prompt('给自己起个闯关昵称：', cur === '同学' ? '' : cur);
    if (v && v.trim()) { WG_Data.setNick(v.trim()); $('nickName').textContent = v.trim(); toast('昵称已更新', 'ok'); }
  }

  /* ---------- 事件 ---------- */
  /* ---------- AI 侧边栏（豆包式） ---------- */
  var aiHistory = [];
  var pendingPhoto = null;
  function aiMsgAdd(role, text) {
    var el = document.createElement('div');
    el.className = 'ai-msg ' + role;
    el.textContent = text;
    $('aiMsgs').appendChild(el);
    $('aiMsgs').scrollTop = $('aiMsgs').scrollHeight;
    return el;
  }
  function aiSideOpen() {
    $('aiSide').classList.remove('hidden');
    if (!$('aiMsgs').children.length) {
      aiMsgAdd('bot', '我是学无忧 AI 助教 👋\n可以直接打字提问，也可以点 📷 拍照搜题。');
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
    } catch (e) {
      loading.classList.remove('loading');
      loading.textContent = '⚠ ' + WG_AI.errText(e);
    }
    pendingPhoto = null;
    $('aiPhotoPreview').classList.add('hidden');
    $('aiPhotoImg').src = '';
    $('aiMsgs').scrollTop = $('aiMsgs').scrollHeight;
  }

  function bind() {
    $('logoBtn').addEventListener('click', function () { closeModal(); goHome(); });
    $('nickBtn').addEventListener('click', promptNick);
    $('backBtn').addEventListener('click', function () { closeModal(); if (state.backView) showView(state.backView); else goHome(); });
    $('obSubmit').addEventListener('click', onboardSubmit);

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
    /* 首页快捷入口 */
    $('heroRandom') && $('heroRandom').addEventListener('click', function () { enterRandom(); });
    $('heroBank') && $('heroBank').addEventListener('click', function () { closeModal(); renderBank(); });
    $('heroMistake') && $('heroMistake').addEventListener('click', function () { closeModal(); renderMistakes(); });

    /* 首页/题库模块卡片：进入模块详情（有子模块时） */
    ['homeBankGrid', 'bankGrid'].forEach(function (gridId) {
      var g = $(gridId);
      if (g) {
        g.addEventListener('click', function (e) {
          var card = e.target.closest ? e.target.closest('.mod-card') : null;
          if (!card) return;
          var lvs = getLevelsOf('study');
          var level = lvs.find(function (l) { return l.id === card.getAttribute('data-level'); });
          if (!level) return;
          if (level.type === 'gaoshu' && (level.topicList || level.subject)) {
            renderModule(level);
          } else {
            enterLevel(level, +card.getAttribute('data-idx'));
          }
        });
      }
    });
    /* 模块详情：子模块点击 */
    var subGrid = $('subGrid');
    if (subGrid) {
      subGrid.addEventListener('click', function (e) {
        var card = e.target.closest ? e.target.closest('.mod-card') : null;
        if (!card) return;
        if (card.getAttribute('data-mode') === 'all') {
          startFromModule('all', null);
        } else if (card.getAttribute('data-topic')) {
          startFromModule('topic', card.getAttribute('data-topic'));
        }
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
    if ($('modBack')) $('modBack').addEventListener('click', function () { closeModal(); renderBank(); });
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
    $('aiProvider').value = WG_AI.getProvider();
    $('aiKeyInput').value = WG_AI.getKey();
    $('aiKeySave').addEventListener('click', function () {
      WG_AI.setProvider($('aiProvider').value);
      WG_AI.setKey($('aiKeyInput').value);
      var ok = !!WG_AI.getKey();
      $('aiKeyStatus').textContent = ok
        ? '✓ 已保存：' + WG_AI.getEndpoint().name + '（Key 存于本机浏览器）'
        : '已选择 ' + WG_AI.getEndpoint().name + '，请粘贴 Key';
    });

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

    $('mRetry').addEventListener('click', function () { closeModal(); enterLevel(state.currentLevel.id, state.currentIndex); });
    $('mNext').addEventListener('click', function () { closeModal(); goHome(); });
    $('mBack').addEventListener('click', function () { closeModal(); goHome(); });

    /* 错题本列表操作 */
    var misList = $('mistakeList');
    if (misList) {
      misList.addEventListener('click', function (e) {
        var retry = e.target.closest ? e.target.closest('.mi-retry') : null;
        var del = e.target.closest ? e.target.closest('.mi-del') : null;
        if (retry) {
          retryMistake(retry.getAttribute('data-qid'));
        } else if (del) {
          WG_Data.removeMistake(del.getAttribute('data-qid'));
          toast('已移出错题本', 'ok');
          renderMistakes();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (state.view === 'game' && e.key.toLowerCase() === 'v' && WG_Game) { /* 看答案快捷键由引擎处理 */ }
    });
  }

  /* ---------- 登录 + 需求采集 ---------- */
  function showOnboard() {
    var p = WG_Data.get().profile;
    if (p) {
      $('obNick').value = p.nick || '';
      $('obGrade').value = p.grade || '大二';
      $('obTarget').value = p.target || '期末考试';
      $('obDate').value = p.examDate || '';
      $('obHours').value = p.hours || '2';
      document.querySelectorAll('#obWeak input').forEach(function (inp) {
        inp.checked = (p.weak || []).indexOf(inp.value) >= 0;
      });
    }
    $('obStatus').textContent = p && p.plan ? '已有计划：' + (p.planAt ? new Date(p.planAt).toLocaleDateString() : '') + ' 生成，可重新提交更新' : '';
    showView('onboard');
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

  function onboardSubmit() {
    var nick = $('obNick').value.trim() || '同学';
    var weak = Array.from(document.querySelectorAll('#obWeak input:checked')).map(function (i) { return i.value; });
    var profile = {
      nick: nick, grade: $('obGrade').value, target: $('obTarget').value,
      examDate: $('obDate').value, weak: weak, hours: $('obHours').value
    };
    WG_Data.setProfile(profile);
    var days = daysUntil(profile.examDate);
    var plan = makeLocalPlan(profile, days);
    WG_Data.saveProfilePlan(plan);
    var st = $('obStatus');
    st.textContent = '✓ 个性化学习计划已生成！';
    var planEl = $('obPlan');
    if (planEl) {
      planEl.textContent = plan;
      planEl.classList.remove('hidden');
    }
    setTimeout(function () { goHome(); }, 2500);
  }

  function stopGames() {
    [WG_Game, WG_Quiz, WG_Matrix, WG_Logic, WG_Vector, WG_Seq, WG_Gaoshu].forEach(function (g) { if (g && g.stop) g.stop(); });
  }

  /* ---------- 错题本 ---------- */
  function renderMistakes() {
    stopGames();
    var d = WG_Data.get();
    var ms = d.mistakes || [];
    var el = $('view-mistakes');
    var box = $('mistakeList');
    var head = $('mistakeCount');
    if (!box) { showView('home'); return; }
    head.textContent = ms.length;
    if (ms.length === 0) {
      box.innerHTML = '<div style="text-align:center;padding:2.5rem 1rem;border:1px dashed var(--rule-strong);border-radius:16px;color:var(--muted);">' +
        '<div style="font-size:2rem;margin-bottom:0.6rem;">📭</div>' +
        '错题本是空的。<br>答错的题、标记「不会」的题会自动收进来。</div>';
    } else {
      box.innerHTML = ms.map(function (m, i) {
        var q = WG_Gaoshu.latexToText(m.question || '').slice(0, 90);
        var qid = m.qid || '';
        var date = m.lastAt ? new Date(m.lastAt).toLocaleDateString() : '';
        return '<div class="mistake-item" data-qid="' + qid + '">' +
          '<div class="mi-head"><span class="tag-bank">' + (m.topic || '综合') + '</span>' +
          '<span class="mi-wrong">错 ' + (m.wrongCount || 1) + ' 次</span>' +
          '<span class="mi-date">' + date + '</span></div>' +
          '<div class="mi-q">' + escHtml(q) + '</div>' +
          '<div class="mi-actions">' +
          '<button class="btn primary mi-retry" data-qid="' + qid + '" style="font-size:0.8rem;">重做这道题</button>' +
          '<button class="btn ghost mi-del" data-qid="' + qid + '" style="font-size:0.8rem;">移出错题本</button>' +
          '</div></div>';
      }).join('');
    }
    showView('mistakes');
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* 重做单道错题 */
  function retryMistake(qid) {
    stopGames();
    state.backView = 'mistakes';
    state.currentLevel = { id: 'mistake', name: '错题重做', type: 'gaoshu', topic: null, n: 1, mistakeIds: [qid], mode: 'mistake' };
    state.currentIndex = 0;
    $('gameTitle').textContent = '错题重做';
    $('gameSub').textContent = '错题本 · 逐题攻破';
    $('goalHint').textContent = '重新做这道题，答对并标记「掌握了」即移出错题本';
    if ($('stStars')) $('stStars').textContent = '☆☆☆';
    $('board').classList.add('hidden');
    $('quizArea').classList.add('hidden');
    $('customArea').classList.remove('hidden');
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
    else if (name === 'bank') renderBank();
    else if (name === 'wenku') renderWenku();
    else if (name === 'mistakes') renderMistakes();
    else if (name === 'report') renderReport();
    else if (name === 'ai') showView('ai');
  }

  /* 随机组卷：从高数题库随机抽题 */
  function enterRandom() {
    stopGames();
    state.currentLevel = { id: 'random', name: '随机组卷', type: 'gaoshu', topic: null, n: 10, diff: null };
    state.currentIndex = 0;
    state.backView = 'home';
    $('gameTitle').textContent = '随机组卷';
    $('gameSub').textContent = '高数题库 · 随机抽题';
    $('goalHint').textContent = '随机 10 道题 · 每题看解析并标记掌握程度';
    if ($('stStars')) $('stStars').textContent = '☆☆☆';
    $('board').classList.add('hidden');
    $('quizArea').classList.add('hidden');
    $('customArea').classList.remove('hidden');
    showView('game');
    WG_Gaoshu.start(state.currentLevel, { onStats: renderStats, onEnd: onGameEnd });
  }

  function goHome() {
    stopGames();
    renderHome();
  }

  function init() {
    bind();
    if (!WG_Data.get().profile) {
      showOnboard();
    } else {
      goHome();
    }
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', WG_App.init);
