/* 学无忧：FSRS 复习，使用现有云端账号。 */
'use strict';
window.WG_Integrations = (function () {
  var review = null, requestedReview = null, eventId = '', sessionEpoch = 0;
  var $ = function (id) { return document.getElementById(id); };
  var api = function (method, path, body) { return WG_API.req(method, path, body); };
  function typeset(el) {
    if (window.renderMathInElement) renderMathInElement(el, { delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }, { left: '$$', right: '$$', display: true }], throwOnError: false, trust: false, strict: 'ignore' });
  }
  var text = function (id, value) { var el = $(id); el.textContent = value; if (['reviewStem', 'reviewAnswerText', 'reviewAnalysis'].includes(id)) typeset(el); };
  var math = function (value) { return value || ''; };
  var date = function (value) { return value ? new Date(value).toLocaleString('zh-CN') : '暂无'; };
  var cloud = function () { return WG_API.isCloudSession(); };
  var err = function (id, e) { text(id, e.message || '操作失败，请重试'); };
  async function action(button, fn, messageId) {
    if (button.disabled) return;
    var epoch = sessionEpoch;
    button.disabled = true; button.setAttribute('aria-busy', 'true');
    try { await fn(epoch); } catch (e) { if (epoch === sessionEpoch) err(messageId, e); }
    finally { button.disabled = false; button.removeAttribute('aria-busy'); }
  }
  function add(parent, tag, value, cls) {
    var el = document.createElement(tag); if (value !== undefined) el.textContent = value;
    if (cls) el.className = cls; parent.appendChild(el); return el;
  }
  function guard(messageId) { if (cloud()) return true; text(messageId, '请先登录云端账号。通过启动脚本打开网站即可注册；本地体验账号暂不支持这些云端功能。'); return false; }
  async function loadReview() {
    if (!guard('reviewMessage')) { $('reviewQuestion').hidden = true; return; }
    var epoch = sessionEpoch;
    text('reviewMessage', '正在同步错题并读取复习安排…');
    await WG_API.putData(WG_Data.get());
    var result = await api('GET', '/api/reviews/queue');
    if (epoch !== sessionEpoch) return;
    text('reviewDue', result.due); text('reviewTotal', result.total); text('reviewNext', date(result.nextDue));
    var requested = requestedReview; requestedReview = null;
    review = requested ? result.cards.find(function(c){return c.qid === requested;}) || null : result.cards[0] || null; eventId = crypto.randomUUID();
    $('reviewQuestion').hidden = !review; $('reviewResult').hidden = true; $('reviewNextButton').hidden = true;
    text('reviewMessage', review ? '先独立作答，再选择熟练程度。答错会自动安排再次复习。' : (result.total ? '今天到期的复习已完成。下一次复习时间见上方。' : '当前没有错题。去题库练习，答错的题会自动进入复习队列。'));
    if (requested && !review) text('reviewMessage','这道题当前未到复习时间。可刷新查看其他到期题，或从错题本重新练习。');
    if (!review) return;
    text('reviewTopic', review.topic); text('reviewStem', math(review.question));
    if (window.WG_Whiteboard) WG_Whiteboard.attachQuestion($('reviewStem'), review);
    var opts = $('reviewOptions'); opts.replaceChildren();
    review.options.forEach(function (o, i) {
      var label = add(opts, 'label', undefined, 'integration-option');
      var input = document.createElement('input'); input.type = 'radio'; input.name = 'reviewAnswer'; input.value = 'ABCD'[i]; label.appendChild(input);
      typeset(add(label, 'span', 'ABCD'[i] + '. ' + math(o)));
    });
    $('reviewReveal').hidden = !review.selfAssessed; $('reviewSubmit').hidden = review.selfAssessed;
    $('reviewRating').value = '3';
    text('reviewAssessment', review.selfAssessed ? '这道题需要自评。请先在纸上作答，再查看解析并评估掌握程度。' : '选择题将与题库标准答案核对。');
  }
  async function submitReview(epoch) {
    if (!review) return;
    var checked = document.querySelector('input[name="reviewAnswer"]:checked');
    if (!review.selfAssessed && !checked) throw new Error('请先选择答案');
    var r = await api('POST', '/api/reviews/answer', { qid: review.qid, version: review.version, eventId: eventId, rating: Number($('reviewRating').value), answer: checked ? checked.value : '' });
    if (epoch !== sessionEpoch) return;
    if (!r.selfAssessed) WG_Data.recordAnswer({ qid: review.qid, q: review.question, topic: review.topic, correct: r.correct, grasp: r.rating === 1 ? 'weak' : r.rating === 2 ? 'fuzzy' : 'master', answer: checked.value, correctAns: r.answer, type: 'FSRS复习', timeMs: Date.now() });
    $('reviewResult').hidden = false;
    text('reviewFeedback', r.selfAssessed ? '已按你的自评安排下次复习' : r.correct ? '回答正确' : '本次答错，已安排再次复习');
    text('reviewAnswerText', math(r.answer)); text('reviewAnalysis', math(r.analysis)); text('reviewDueText', '下次复习：' + date(r.nextDue));
    $('reviewSubmit').hidden = true; $('reviewReveal').hidden = true; $('reviewNextButton').hidden = false;
    text('reviewMessage', '本次复习已保存。');
  }
  async function open(name) {
    if (name === 'review') { try { await loadReview(); } catch (e) { err('reviewMessage', e); } }
  }
  function init() {
    $('integrationExport').onclick = function (e) { action(e.currentTarget, async function (epoch) {
      if (!guard('reviewMessage')) return;
      var data = await api('GET', '/api/integrations/export'); if (epoch !== sessionEpoch) return;
      var url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      var a = document.createElement('a'); a.href = url; a.download = '学无忧-复习与资料记录.json'; a.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      text('reviewMessage', '复习日志与资料文本已导出。');
    }, 'reviewMessage'); };
    $('reviewRefresh').onclick = function (e) { action(e.currentTarget, loadReview, 'reviewMessage'); };
    $('reviewSubmit').onclick = function (e) { action(e.currentTarget, submitReview, 'reviewMessage'); };
    $('reviewNextButton').onclick = function (e) { action(e.currentTarget, loadReview, 'reviewMessage'); };
    $('reviewReveal').onclick = function (e) { action(e.currentTarget, async function (epoch) { var r = await api('POST', '/api/reviews/reveal', { qid: review.qid }); if (epoch !== sessionEpoch) return; $('reviewResult').hidden = false; text('reviewFeedback', '请对照解析自评，随后提交熟练程度'); text('reviewAnswerText', math(r.answer)); text('reviewAnalysis', math(r.analysis)); text('reviewDueText', ''); $('reviewSubmit').hidden = false; $('reviewReveal').hidden = true; }, 'reviewMessage'); };
    document.querySelectorAll('[data-integration-nav]').forEach(function (b) { b.onclick = function () { StudyAppBridge.navTo(b.dataset.integrationNav); }; });
    WG_API.onAuthChange(function () {
      sessionEpoch++; review = null; requestedReview = null;
      $('reviewQuestion').hidden = true;
    });
  }
  document.addEventListener('DOMContentLoaded', init);
  return { open: open, openQuestion: function(qid){requestedReview=String(qid);StudyAppBridge.navTo('review');} };
})();
