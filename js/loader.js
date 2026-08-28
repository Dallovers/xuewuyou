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

  /* 后台开始加载（幂等，可多次调用）。串行加载避免并发解析大文件卡顿。 */
  function load() {
    if (promise) return promise;
    promise = new Promise(function (resolve) {
      var chain = Promise.resolve();
      FILES.forEach(function (f) {
        chain = chain.then(function () {
          return new Promise(function (ok) {
            var s = document.createElement('script');
            s.src = f;
            s.async = false;
            s.onload = function () { ok(); };
            s.onerror = function () {
              console.warn('[学无忧] 数据文件加载失败(可忽略):', f);
              ok();
            };
            document.head.appendChild(s);
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

  /* 数据未就绪时的占位 HTML（首页题库 / 资料板块） */
  function placeholder(label) {
    return '<div class="hg-loading" role="status" aria-live="polite">' +
      '<span class="hg-spin" aria-hidden="true"></span>' +
      (label || '题库数据加载中，请稍候…') + '</div>';
  }

  return { load: load, ready: ready, isReady: isReady, placeholder: placeholder };
})();
