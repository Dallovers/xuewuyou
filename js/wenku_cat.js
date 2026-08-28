/* 学无忧 · 学习资料归类引擎
   把 WENKU 里 1000+ 份零散资料按「大类 → 学科 → 院校/年份」重新归档，
   首页只露 4 个大类入口，进资料库再逐层收窄。 */
'use strict';
var WG_WenkuCat = (function () {

  /* ---------- 标签词典 ---------- */
  /* 学科：决定资料属于哪个知识域 */
  var SUBJECTS = [
    '数学分析', '高等代数', '高等数学', '线性代数', '概率论',
    '抽象代数', '复变函数', '实变函数', '常微分方程', '泛函分析',
    '微分几何', '傅立叶分析', '傅里叶分析', '交换代数',
    '雅思阅读', '雅思写作', '雅思全科'
  ];
  /* 院校层次 */
  var LEVELS = ['985院校', '重点院校', '普通院校', '夏令营'];
  /* 资料形态 */
  var FORMS = ['仅题目', '习题集', '教材PDF', '网友心得', '备考笔记', '竞赛班讲义', '通用专题', '受限资料', '高级可下载'];

  function isYear(t) { return /^\d{4}年$/.test(t); }
  function isSchool(t) {
    if (!t) return false;
    if (LEVELS.indexOf(t) >= 0) return false;
    return /大学|学院|统考|插班生考试|高校期末/.test(t);
  }

  /* ---------- 单条资料归档 ---------- */
  function classify(x) {
    var tags = x.tags || [];
    var link = x.link || '';
    var title = x.title || '';
    var has = function (t) { return tags.indexOf(t) >= 0; };

    var subject = '';
    for (var i = 0; i < SUBJECTS.length; i++) {
      if (has(SUBJECTS[i])) { subject = SUBJECTS[i]; break; }
    }
    var years = tags.filter(isYear);
    var schools = tags.filter(isSchool);
    var levels = tags.filter(function (t) { return LEVELS.indexOf(t) >= 0; });
    var forms = tags.filter(function (t) { return FORMS.indexOf(t) >= 0; });

    var isIelts = /雅思/.test(subject) || link.indexOf('data/pdf/ielts/') === 0 || /雅思|IELTS/.test(title);
    /* 真题 vs 解析：标题里带「解析」的归解析册，方便只刷题或只看答案 */
    var isSolution = /解析|答案|详解/.test(title);
    var isBlank = /留白|无解答|纯享|仅题目/.test(title) || has('仅题目');

    /* 先认教材：教材类标题（习题集/指导书/留白本）即使挂了「考研真题」标签也应归教材 */
    var looksBook = has('习题集') || has('教材PDF') || /习题集|指导书|习题解析|做题本|留白本|教材/.test(title);
    /* 再认真题：有年份或院校的考卷，含夏令营试题与统考真题卷 */
    var looksExam = (has('考研真题') || has('夏令营') || /考研|真题|试题|统考/.test(title)) &&
      (years.length > 0 || schools.length > 0);

    var cat;
    if (isIelts) cat = 'ielts';
    else if (looksBook) cat = 'book';
    else if (looksExam) cat = 'exam';
    else cat = 'topic';

    /* 雅思细分板块 */
    var ieltsGroup = '';
    if (isIelts) {
      if (has('雅思写作') || /作文|写作/.test(title)) ieltsGroup = '写作';
      else if (has('雅思阅读') || /阅读|长难句|同义替换|词海/.test(title)) ieltsGroup = '阅读';
      else ieltsGroup = '全科';
    }

    return {
      raw: x,
      cat: cat,
      subject: subject || (isIelts ? '雅思' : '综合专题'),
      ieltsGroup: ieltsGroup,
      years: years,
      schools: schools,
      levels: levels,
      forms: forms,
      year: years[0] || '',
      school: schools[0] || '',
      level: levels[0] || '',
      isSolution: isSolution,
      isBlank: isBlank,
      local: link.indexOf('data/pdf/') === 0
    };
  }

  /* ---------- 全量建档（惰性，只跑一次） ---------- */
  var _all = null;
  function all() {
    if (_all) return _all;
    var src = [];
    if (typeof WENKU !== 'undefined' && WENKU) {
      ['pdfs', 'books', 'materials'].forEach(function (k) {
        (WENKU[k] || []).forEach(function (x) { src.push(x); });
      });
    }
    /* 同名同链接的重复条目合并，原始数据里有不少重复录入 */
    var seen = {};
    _all = [];
    src.forEach(function (x) {
      var key = (x.title || '') + '||' + (x.link || '');
      if (seen[key]) return;
      seen[key] = 1;
      _all.push(classify(x));
    });
    return _all;
  }

  /* ---------- 大类定义 ---------- */
  var CATS = [
    {
      /* 大类色也是一值两用（--wk-color 装饰 + .wki-name 文字），取压暗保色相版本 */
      id: 'exam', name: '考研真题卷', en: 'Past Papers', icon: '📝', color: '#367981',
      desc: '数学分析 · 高等代数，按院校与年份归档，真题与解析成对收录'
    },
    {
      id: 'book', name: '教材习题集', en: 'Textbook', icon: '📚', color: '#7763b2',
      desc: '谢惠民 · 丘维声 · 蓝以中，留白做题本与完整解析册配套'
    },
    {
      id: 'ielts', name: '雅思备考库', en: 'IELTS', icon: '🌍', color: '#1f7c5a',
      desc: '剑雅同义替换 · 长难句 · 大小作文句式与高阶词汇手册'
    },
    {
      id: 'topic', name: '专题与心得', en: 'Topics', icon: '💡', color: '#8a6914',
      desc: '复变 · 实变 · 泛函等专题资料，含学长学姐备考心得'
    }
  ];

  function catMeta(id) {
    return CATS.filter(function (c) { return c.id === id; })[0] || CATS[0];
  }
  function itemsOf(catId) {
    return all().filter(function (r) { return r.cat === catId; });
  }
  function countOf(catId) {
    var list = itemsOf(catId);
    return { total: list.length, local: list.filter(function (r) { return r.local; }).length };
  }

  /* 某个大类下的可选筛选维度（按出现频次排序，只留有意义的） */
  function facetsOf(catId) {
    var list = itemsOf(catId);
    function tally(pick) {
      var m = {};
      list.forEach(function (r) {
        var vs = pick(r);
        (Array.isArray(vs) ? vs : [vs]).forEach(function (v) { if (v) m[v] = (m[v] || 0) + 1; });
      });
      return Object.keys(m).map(function (k) { return { key: k, n: m[k] }; })
        .sort(function (a, b) { return b.n - a.n || a.key.localeCompare(b.key); });
    }
    return {
      subjects: tally(function (r) { return catId === 'ielts' ? r.ieltsGroup : r.subject; }),
      years: tally(function (r) { return r.years; }).sort(function (a, b) { return b.key.localeCompare(a.key); }),
      schools: tally(function (r) { return r.schools; }),
      levels: tally(function (r) { return r.levels; })
    };
  }

  /* 按条件过滤 */
  function query(f) {
    f = f || {};
    var list = itemsOf(f.cat || 'exam');
    if (f.subject) {
      list = list.filter(function (r) {
        return (f.cat === 'ielts' ? r.ieltsGroup : r.subject) === f.subject;
      });
    }
    if (f.year) list = list.filter(function (r) { return r.years.indexOf(f.year) >= 0; });
    if (f.school) list = list.filter(function (r) { return r.schools.indexOf(f.school) >= 0; });
    if (f.level) list = list.filter(function (r) { return r.levels.indexOf(f.level) >= 0; });
    if (f.localOnly) list = list.filter(function (r) { return r.local; });
    if (f.kw) {
      var kw = f.kw.toLowerCase();
      list = list.filter(function (r) {
        var hay = (r.raw.title || '') + ' ' + (r.raw.tags || []).join(' ') + ' ' + (r.raw.desc || '');
        return hay.toLowerCase().indexOf(kw) >= 0;
      });
    }
    /* 排序：本地可读优先，其次年份新的在前，再按标题 */
    list = list.slice().sort(function (a, b) {
      if (a.local !== b.local) return a.local ? -1 : 1;
      if (a.year !== b.year) return (b.year || '').localeCompare(a.year || '');
      return (a.raw.title || '').localeCompare(b.raw.title || '');
    });
    return list;
  }

  return {
    CATS: CATS,
    all: all,
    catMeta: catMeta,
    itemsOf: itemsOf,
    countOf: countOf,
    facetsOf: facetsOf,
    query: query
  };
})();
