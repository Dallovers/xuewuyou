/* ============ 学无忧 · AI 接入模块（走后端代理） ============
 * v5：AI Key 已迁移到服务端（server/），前端通过 /api/ai/* 代理调用，
 * 不再在浏览器保存或暴露任何 Key。
 * 平台列表保留用于展示，实际请求由服务端按配置转发。
 * =============================================================== */
'use strict';

var WG_AI = (function () {
  var PROVIDERS = {
    zhipu:  { name: '智谱 GLM（GLM-4-Flash 免费）', model: 'glm-4-flash' },
    deepseek: { name: 'DeepSeek（新用户送额度）', model: 'deepseek-chat' },
    kimi:   { name: 'Kimi（新用户送额度）', model: 'moonshot-v1-8k' },
    doubao: { name: '豆包·火山方舟（新用户送 token）', model: 'doubao-pro-32k' }
  };

  function api() {
    return window.WG_API;
  }

  /* 核心请求：走服务端代理（Key 在服务端） */
  async function chat(messages, opts) {
    opts = opts || {};
    var d = await api().aiChat(messages, {
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
      model: opts.model,
      provider: opts.provider
    });
    return d.content || '';
  }

  /* 拍照搜题：走服务端代理（视觉模型） */
  async function explainPhoto(imageDataUrl, userNote) {
    var d = await api().aiVision(imageDataUrl, userNote);
    return d.content || '';
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
    chat: chat,
    explainPhoto: explainPhoto,
    explainQuestion: explainQuestion,
    generateQuestions: generateQuestions,
    makePlan: makePlan,
    analyzeStats: analyzeStats,
    errText: function (e) {
      if (e && e.status === 401) return '登录已失效，请重新登录后再使用 AI 助手';
      if (e && e.message) return 'AI 请求失败：' + e.message;
      return 'AI 请求出错，请检查网络或稍后再试';
    }
  };
})();
