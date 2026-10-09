/* 学无忧：FSRS 复习与私有资料问答，使用现有云端账号。 */
'use strict';
window.WG_Integrations = (function () {
  var review = null, requestedReview = null, eventId = '', config = {}, docs = [], polling = null, pollBusy = false, sessionEpoch = 0;
  var $ = function (id) { return document.getElementById(id); };
  var api = function (method, path, body) { return WG_API.req(method, path, body); };
  function typeset(el) {
    if (window.renderMathInElement) renderMathInElement(el, { delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }, { left: '$$', right: '$$', display: true }], throwOnError: false, trust: false, strict: 'ignore' });
  }
  var text = function (id, value) { var el = $(id); el.textContent = value; if (['reviewStem', 'reviewAnswerText', 'reviewAnalysis', 'knowledgeAnswerText'].includes(id)) typeset(el); };
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
  function button(parent, label, callback) { var b = add(parent, 'button', label, 'btn ghost'); b.type = 'button'; b.onclick = callback; return b; }
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
  async function loadConfig() {
    config = await api('GET', '/api/integrations/status');
    text('knowledgeService', config.ragflow ? (config.mineru ? '资料检索与文档解析服务已配置' : '资料检索已配置；PDF 和图片解析待配置') : '资料检索服务待配置；可先上传 TXT / MD 并查看解析文本');
    $('knowledgeAsk').disabled = !config.ragflow;
  }
  async function loadDocs() {
    var epoch = sessionEpoch;
    var result = await api('GET', '/api/knowledge/documents');
    if (epoch !== sessionEpoch) return;
    docs = result.documents; renderDocs();
  }
  function renderDocs() {
    var selected = Array.from(document.querySelectorAll('[name="knowledgeDoc"]:checked')).map(function (x) { return x.value; });
    var list = $('knowledgeDocuments'); list.replaceChildren();
    if (!docs.length) add(list, 'p', '还没有资料。上传课程讲义、复习笔记或实验说明开始使用。', 'integration-muted');
    var statuses = { queued: '等待处理', parsing: '解析中', parsed: '文本已解析 · 待配置检索', indexing: '正在建立索引', ready: '可用于问答', failed: '处理失败' };
    docs.forEach(function (d) {
      var item = add(list, 'article', undefined, 'integration-document');
      var head = add(item, 'label', undefined, 'integration-doc-title');
      var check = document.createElement('input'); check.type = 'checkbox'; check.name = 'knowledgeDoc'; check.value = d.id; check.disabled = d.status !== 'ready'; check.checked = selected.indexOf(d.id) >= 0; head.appendChild(check);
      add(head, 'span', d.filename); add(item, 'p', statuses[d.status] || d.status, 'integration-muted');
      if (d.error) add(item, 'p', d.error, 'integration-error');
      var actions = add(item, 'div', undefined, 'integration-actions');
      if (d.hasText) button(actions, '查看文本', function (e) { action(e.currentTarget, async function (epoch) { var r = await api('GET', '/api/knowledge/text?id=' + encodeURIComponent(d.id)); if (epoch !== sessionEpoch) return; text('knowledgeTextTitle', r.filename); text('knowledgeText', r.markdown); $('knowledgeTextDialog').showModal(); }, 'knowledgeMessage'); });
      if (d.status === 'failed' || (d.status === 'parsed' && config.ragflow)) button(actions, '重试', function (e) { action(e.currentTarget, async function () { await api('POST', '/api/knowledge/refresh', { id: d.id }); await loadDocs(); }, 'knowledgeMessage'); });
      if (!['queued', 'parsing'].includes(d.status)) button(actions, '删除', function (e) {
        var b = e.currentTarget;
        if (!confirm('删除「' + d.filename + '」及它的检索索引？')) return;
        action(b, async function () { await api('DELETE', '/api/knowledge/document?id=' + encodeURIComponent(d.id)); await loadDocs(); }, 'knowledgeMessage');
      });
    });
    $('knowledgeAsk').disabled = !config.ragflow || !docs.some(function (d) { return d.status === 'ready'; });
  }
  async function upload(epoch) {
    if (!guard('knowledgeMessage')) return;
    var file = $('knowledgeFile').files[0];
    if (!file) throw new Error('请选择一份课程资料');
    if (!file.size || file.size > 8 * 1024 * 1024) throw new Error('请选择不超过 8 MB 的非空文件');
    text('knowledgeMessage', '正在上传并安排处理…');
    var base64 = await new Promise(function (resolve, reject) { var reader = new FileReader(); reader.onload = function () { resolve(reader.result.split(',')[1]); }; reader.onerror = reject; reader.readAsDataURL(file); });
    if (epoch !== sessionEpoch) return;
    await api('POST', '/api/knowledge/upload', { filename: file.name, base64: base64 });
    if (epoch !== sessionEpoch) return;
    $('knowledgeFile').value = ''; text('knowledgeMessage', '上传成功，处理状态会自动更新。'); await loadDocs();
  }
  async function ask(epoch) {
    if (!guard('knowledgeMessage')) return;
    var question = $('knowledgeQuestion').value.trim(); if (!question) throw new Error('请先输入问题');
    text('knowledgeMessage', '正在检索所选资料…'); $('knowledgeAnswer').hidden = true;
    var r = await api('POST', '/api/knowledge/ask', { question: question, documentIds: Array.from(document.querySelectorAll('[name="knowledgeDoc"]:checked')).map(function (x) { return x.value; }) });
    if (epoch !== sessionEpoch) return;
    text('knowledgeAnswerText', r.answer); $('knowledgeAnswer').hidden = false;
    text('knowledgeMessage', r.generated ? '回答已生成，下方可核对引用。' : '检索完成，下方显示资料依据。');
    var list = $('knowledgeCitations'); list.replaceChildren();
    r.citations.forEach(function (c) { var item = add(list, 'details', undefined, 'integration-citation'); add(item, 'summary', '[' + c.id + '] ' + c.documentName); typeset(add(item, 'p', c.content, 'integration-prose')); });
  }
  async function open(name) {
    clearInterval(polling); polling = null;
    if (name === 'review') { try { await loadReview(); } catch (e) { err('reviewMessage', e); } }
    else if (name === 'knowledge') {
      if (!guard('knowledgeMessage')) return;
      try { await loadConfig(); await loadDocs(); text('knowledgeMessage', '勾选资料限定问答范围；不勾选时检索你的全部可用资料。'); } catch (e) { err('knowledgeMessage', e); }
      polling = setInterval(async function () {
        if (pollBusy || !cloud() || $('view-knowledge').classList.contains('hidden')) return;
        pollBusy = true;
        try {
          for (var d of docs.filter(function (x) { return x.status === 'indexing'; })) await api('POST', '/api/knowledge/refresh', { id: d.id });
          if (docs.some(function (x) { return ['queued', 'parsing', 'indexing'].includes(x.status); })) await loadDocs();
        } catch (e) { err('knowledgeMessage', e); }
        finally { pollBusy = false; }
      }, 5000);
    }
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
    $('knowledgeUpload').onclick = function (e) { action(e.currentTarget, upload, 'knowledgeMessage'); };
    $('knowledgeAsk').onclick = function (e) { action(e.currentTarget, ask, 'knowledgeMessage'); };
    $('knowledgeRefresh').onclick = function (e) { action(e.currentTarget, async function () { await loadConfig(); for (var d of docs.filter(function (x) { return x.status === 'indexing'; })) await api('POST', '/api/knowledge/refresh', { id: d.id }); await loadDocs(); }, 'knowledgeMessage'); };
    $('knowledgeTextClose').onclick = function () { $('knowledgeTextDialog').close(); };
    document.querySelectorAll('[data-integration-nav]').forEach(function (b) { b.onclick = function () { StudyAppBridge.navTo(b.dataset.integrationNav); }; });
    WG_API.onAuthChange(function () {
      sessionEpoch++; clearInterval(polling); polling = null; docs = []; review = null; requestedReview = null; config = {};
      $('knowledgeDocuments').replaceChildren(); $('knowledgeCitations').replaceChildren(); text('knowledgeAnswerText', ''); text('knowledgeText', '');
      $('knowledgeAnswer').hidden = true; $('reviewQuestion').hidden = true; $('knowledgeAsk').disabled = true;
      $('knowledgeTextDialog').close();
    });
  }
  document.addEventListener('DOMContentLoaded', init);
  return { open: open, openQuestion: function(qid){requestedReview=String(qid);StudyAppBridge.navTo('review');} };
})();
