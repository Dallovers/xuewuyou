/* ============ 学无忧 · 重型数据延迟加载器 ============
 * 首屏只加载核心逻辑（约 250KB），题库 / 词库 / 资料大数据
 * （合计约 4.3MB，其中 gaoshu_bank.js 3.7MB）在首屏渲染完成后
 * 于后台按顺序加载，进入首页 / 题库前保证数据就绪。
 */
'use strict';
window.WG_Heavy = (function () {
  /* 带 ?v= 版本号：这几个文件不在 index.html 的 script 标签里，
     没有版本号时改了内容也会被浏览器旧缓存挡住（wenku_cat.js 的主题色就属于这种） */
  var FILES = [
    'js/gaoshu_bank.js?v=1',   /* 高数题库 3.7MB */
    'js/english_words.js?v=1', /* 四六级词库 337KB */
    'js/ielts_words.js?v=1',   /* 雅思词库 26KB */
    'js/wenku.js?v=1',         /* 学习资料 182KB */
    'js/wenku_cat.js?v=2'      /* 资料归类 7KB */
  ];
  var promise = null;
  var done = false;
  var loadedFiles = Object.create(null);
  var pendingFiles = Object.create(null);
  var sourceRoot = new URL('../', document.currentScript.src);

  // A slow question bank must not hold the small materials catalogue hostage.
  // Share requests with background loading and bound failures so retry works.
  function loadFile(f) {
    if (loadedFiles[f]) return Promise.resolve();
    if (pendingFiles[f]) return pendingFiles[f];
    var request = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      var timer = setTimeout(function () { finish(new Error('数据请求超时')); }, 15000);
      function finish(error) {
        clearTimeout(timer); s.onload = s.onerror = null;
        if (error) { s.remove(); reject(error); }
        else { loadedFiles[f] = true; resolve(); }
      }
      s.src = new URL(f, sourceRoot).href;
      // Materials are explicitly sequenced by readyWenku(). They must not sit
      // in the browser's async=false execution queue behind a stalled bank.
      s.async = true;
      s.onload = function () { finish(); };
      s.onerror = function () { finish(new Error('数据文件未能下载')); };
      document.head.appendChild(s);
    });
    pendingFiles[f] = request.then(function () {
      delete pendingFiles[f];
    }, function (error) {
      delete pendingFiles[f];
      throw error;
    });
    return pendingFiles[f];
  }

  function readyWenku() {
    if (typeof WENKU !== 'undefined' && typeof WG_WenkuCat !== 'undefined') return Promise.resolve();
    return loadFile(FILES[3]).then(function () { return loadFile(FILES[4]); }).then(function () {
      if (typeof WENKU === 'undefined' || typeof WG_WenkuCat === 'undefined') throw new Error('学习资料目录未能初始化');
    }).catch(function () {
      throw new Error('学习资料暂时加载失败，请检查网络后重试');
    });
  }

  /* 后台开始加载（幂等，可多次调用）。串行加载避免并发解析大文件卡顿。 */
  function load() {
    if (promise) return promise;
    promise = new Promise(function (resolve) {
      var chain = Promise.resolve();
      FILES.forEach(function (f) {
        chain = chain.then(function () {
          // The classifier snapshots WENKU at initialization. Loading it after
          // a failed catalogue request would cache an empty library forever.
          if (f === FILES[4] && typeof WENKU === 'undefined') return;
          return loadFile(f).catch(function () {
            console.warn('[学无忧] 数据文件加载失败，可重试:', f);
          });
        });
      });
      chain.then(function () { done = true; resolve(); });
    });
    return promise;
  }

  /* 数据是否已就绪 */
  function isReady() {
    return done ||
      (typeof GAOSHU_BANK !== 'undefined' && typeof WG_WenkuCat !== 'undefined');
  }

  /* 等数据就绪：已就绪立即 resolve，否则触发加载 */
  function ready() {
    if (isReady()) return Promise.resolve();
    return load();
  }

  /* A completed request sequence may include a failed bank download. Retry only
     missing files and never route the classroom into an empty practice page. */
  function readyBank() {
    if (typeof GAOSHU_BANK !== 'undefined') return Promise.resolve();
    return load().then(function () {
      if (typeof GAOSHU_BANK !== 'undefined') return;
      done = false;
      promise = null;
      throw new Error('题库暂时没有加载成功，请检查网络后重试');
    });
  }

  /* 数据未就绪时的占位 HTML（首页题库 / 资料板块） */
  function placeholder(label) {
    return '<div class="hg-loading" role="status" aria-live="polite">' +
      '<span class="hg-spin" aria-hidden="true"></span>' +
      (label || '题库数据加载中，请稍候…') + '</div>';
  }

  return { load: load, ready: ready, readyBank: readyBank, readyWenku: readyWenku, isReady: isReady, placeholder: placeholder };
})();
