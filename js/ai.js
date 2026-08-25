/* ============ 学无忧 · AI 接入模块（多平台免费大模型） ============
 * 大模型只能通过 API 调用，但有很多"免费额度"平台可供学生使用：
 *  - 智谱 GLM-4-Flash  免费模型，注册即用（推荐，见 open.bigmodel.cn）
 *  - DeepSeek          新用户赠送额度（platform.deepseek.com）
 *  - 豆包 / Kimi       新用户赠送 token
 * 下面预置了各平台的接入配置，Key 存在浏览器 localStorage，演示够用；
 * 正式上线应改为后端代理，避免 Key 泄露。
 * =============================================================== */
'use strict';

var WG_AI = (function () {
  var KEY_STORE = 'xwy_ai_key';
  var PROV_STORE = 'xwy_ai_provider';

  /* 演示用默认 Key（智谱，免费额度）；正式上线前请移除并改为后端代理 */
  var DEFAULT_KEY = '12b55751eeba4f13b28d1cf5e9463c57.tF2TBMfVLVCukBAR';
  var DEFAULT_PROVIDER = 'zhipu';

  /* 预置免费/低价平台（OpenAI 兼容格式） */
  var PROVIDERS = {
    zhipu:  { name: '智谱 GLM（GLM-4-Flash 免费）', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
    deepseek: { name: 'DeepSeek（新用户送额度）', base: 'https://api.deepseek.com', model: 'deepseek-chat' },
    kimi:   { name: 'Kimi（新用户送额度）', base: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
    doubao: { name: '豆包·火山方舟（新用户送 token）', base: 'https://ark.cn-beijing.volces.com/api/v3', model: 'doubao-pro-32k' }
  };
  var CUSTOM_BASE = 'xwy_ai_base';
  var CUSTOM_MODEL = 'xwy_ai_model';

  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lss(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function getKey() { return ls(KEY_STORE) || DEFAULT_KEY; }
  function setKey(k) { lss(KEY_STORE, (k || '').trim()); }
  function getProvider() { return ls(PROV_STORE) || DEFAULT_PROVIDER; }
  function setProvider(p) { lss(PROV_STORE, p); }
  function getEndpoint() {
    var id = getProvider();
    if (id === 'custom') {
      return { name: '自定义', base: ls(CUSTOM_BASE) || 'https://api.deepseek.com', model: ls(CUSTOM_MODEL) || 'deepseek-chat' };
    }
    return PROVIDERS[id] || PROVIDERS.zhipu;
  }
  function setCustom(base, model) { lss(CUSTOM_BASE, base); lss(CUSTOM_MODEL, model); }

  /* 核心请求：一次对话补全（支持图片，OpenAI 兼容视觉格式） */
  async function chat(messages, opts) {
    opts = opts || {};
    var key = getKey();
    if (!key) { throw { code: 'NO_KEY' }; }
    var ep = getEndpoint();
    var model = opts.model || ep.model;
    var res = await fetch(ep.base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: opts.temperature != null ? opts.temperature : 0.6,
        max_tokens: opts.maxTokens || 500,
        stream: false
      })
    });
    var data = await res.json();
    if (!res.ok) { throw { code: 'API_ERR', msg: (data.error && data.error.message) || '请求失败(' + res.status + ')' }; }
    return data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
  }

  /* 拍照搜题：把图片直接发给视觉模型（智谱 GLM-4V-Flash，免费） */
  async function explainPhoto(imageDataUrl, userNote) {
    var key = getKey();
    if (!key) { throw { code: 'NO_KEY' }; }
    var res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model: 'glm-4v-flash',
        temperature: 0.5,
        max_tokens: 600,
        messages: [
          { role: 'system', content: '你是「学无忧」的 AI 助教。用户会发来一道题的图片，请读出题目并给出清晰、简短的解题思路（150 字以内）。如果图片不是题目，就说明一下。' },
          {
            role: 'user',
            content: [
              { type: 'text', text: userNote || '帮我看看这道题怎么做？' },
              { type: 'image_url', image_url: { url: imageDataUrl } }
            ]
          }
        ]
      })
    });
    var data = await res.json();
    if (!res.ok) { throw { code: 'API_ERR', msg: (data.error && data.error.message) || '请求失败(' + res.status + ')' }; }
    return data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
  }

  function sys() {
    return { role: 'system', content: '你是「学无忧」学习平台的 AI 助教，面向备考大学生（四六级、考研、期末）。回答要简洁、口语化、有耐心，多用步骤和思路，少讲空话。' };
  }

  async function explainQuestion(question, userAnswer, correctAnswer) {
    return chat([
      sys(),
      { role: 'user', content: '这道题我不会，帮我讲清楚思路：题目【' + question + '】。我答的是 ' + userAnswer + '，正确答案是 ' + correctAnswer + '。请用 120 字以内讲清楚解题关键步骤，不要说废话。' }
    ], { maxTokens: 320 });
  }

  async function generateQuestions(topic, n) {
    n = n || 3;
    return chat([
      sys(),
      { role: 'user', content: '请围绕知识点「' + topic + '」出 ' + n + ' 道备考题，难度适合大二大三学生。格式：每题一行，用 "题|答案" 分隔，答案必须是确定的一个整数或短语。不要多余解释。' }
    ], { maxTokens: 400, temperature: 0.9 });
  }

  async function makePlan(days, weakTopics) {
    return chat([
      sys(),
      { role: 'user', content: '距离考试还有 ' + days + ' 天，我的薄弱知识点是：' + (weakTopics || '待检测') + '。请给我一份按天安排的备考计划，简洁分点，不要超过 200 字。' }
    ], { maxTokens: 350 });
  }

  async function analyzeStats(stats) {
    return chat([
      sys(),
      { role: 'user', content: '这是我的做题数据：' + JSON.stringify(stats) + '。请用 150 字以内给我学习建议，指出最该优先补强的点。' }
    ], { maxTokens: 300 });
  }

  return {
    PROVIDERS: PROVIDERS,
    getKey: getKey, setKey: setKey,
    getProvider: getProvider, setProvider: setProvider,
    getEndpoint: getEndpoint, setCustom: setCustom,
    chat: chat,
    explainPhoto: explainPhoto,
    explainQuestion: explainQuestion,
    generateQuestions: generateQuestions,
    makePlan: makePlan,
    analyzeStats: analyzeStats,
    errText: function (e) {
      if (e && e.code === 'NO_KEY') return '还没有配置 API Key：到「AI 助手」页选择一个免费平台（推荐智谱 GLM-4-Flash），粘贴 Key 即可';
      if (e && e.code === 'API_ERR') return 'AI 请求失败：' + (e.msg || '请检查 Key 是否正确、所选平台是否开通');
      return 'AI 请求出错：' + (e && e.message ? e.message : '网络异常');
    }
  };
})();
