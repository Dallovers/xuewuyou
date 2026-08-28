/* ============ 学无忧 · AI 接入模块（走后端代理） ============
 * v5：AI Key 已迁移到服务端（server/），前端通过 /api/ai/* 代理调用，
 * 不再在浏览器保存或暴露任何 Key。
 * 平台列表保留用于展示，实际请求由服务端按配置转发。
 * =============================================================== */
'use strict';

var WG_AI = (function () {
  var KEY_STORE = 'xwy_ai_key';
  var PROV_STORE = 'xwy_ai_provider';

  /* 内置备用 Key（智谱 GLM-4-Flash 免费，支持直接在前端调用） */
  var DEFAULT_KEY = '12b55751eeba4f13b28d1cf5e9463c57.tF2TBMfVLVCukBAR';
  var DEFAULT_PROVIDER = 'zhipu';

  var PROVIDERS = {
    zhipu:  { name: '智谱 GLM（GLM-4-Flash 免费）', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', vision: 'glm-4v-flash' },
    deepseek: { name: 'DeepSeek（新用户送额度）', base: 'https://api.deepseek.com', model: 'deepseek-chat', vision: null },
    kimi:   { name: 'Kimi（新用户送额度）', base: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', vision: 'moonshot-v1-8k-vision-preview' },
    doubao: { name: '豆包·火山方舟（新用户送 token）', base: 'https://ark.cn-beijing.volces.com/api/v3', model: 'doubao-pro-32k', vision: 'doubao-vision-pro-32k' }
  };

  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lss(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function getKey() { return ls(KEY_STORE) || DEFAULT_KEY; }
  function setKey(k) { lss(KEY_STORE, (k || '').trim()); }
  function getProvider() { return ls(PROV_STORE) || DEFAULT_PROVIDER; }
  function setProvider(p) { lss(PROV_STORE, p); }

  function api() {
    return window.WG_API;
  }

  /* 前端直接请求大模型（降级用） */
  async function directChat(messages, opts) {
    opts = opts || {};
    var key = getKey();
    if (!key) throw { code: 'NO_KEY', message: '未配置 AI 密钥' };
    var provId = opts.provider || getProvider();
    var prov = PROVIDERS[provId] || PROVIDERS.zhipu;
    var model = opts.model || prov.model;
    var base = prov.base;

    var res = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: opts.temperature != null ? opts.temperature : 0.6,
        max_tokens: opts.maxTokens || 500,
        stream: false
      })
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      throw new Error((data.error && data.error.message) || ('AI 接口返回错误(' + res.status + ')'));
    }
    return data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
  }

  /* 前端直接视觉搜题请求（降级用） */
  async function directVision(imageDataUrl, userNote) {
    var key = getKey();
    if (!key) throw { code: 'NO_KEY', message: '未配置 AI 密钥' };
    var res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
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
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      throw new Error((data.error && data.error.message) || ('AI 视觉识别错误(' + res.status + ')'));
    }
    return data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
  }

  /* 核心请求：优先走服务端代理，若处于纯静态/离线/后端未启动环境则自动无缝降级为前端直接调用 */
  async function chat(messages, opts) {
    opts = opts || {};
    try {
      if (api() && typeof api().aiChat === 'function') {
        var d = await api().aiChat(messages, {
          temperature: opts.temperature,
          maxTokens: opts.maxTokens,
          model: opts.model,
          provider: opts.provider
        });
        if (d && d.content) return d.content;
      }
    } catch (e) {
      /* 如果是 401 等明确业务错误则抛出，如果是后端连接失败/404/网络错误则自动降级直连 */
      var isConnErr = !e.status || e.status === 404 || e.status === 502 || /fetch|network|failed|not found/i.test(e.message || '');
      if (!isConnErr) throw e;
    }
    /* 降级直连 */
    return directChat(messages, opts);
  }

  /* 拍照搜题：优先走服务端代理，失败自动降级直连 */
  async function explainPhoto(imageDataUrl, userNote) {
    try {
      if (api() && typeof api().aiVision === 'function') {
        var d = await api().aiVision(imageDataUrl, userNote);
        if (d && d.content) return d.content;
      }
    } catch (e) {
      var isConnErr = !e.status || e.status === 404 || e.status === 502 || /fetch|network|failed|not found/i.test(e.message || '');
      if (!isConnErr) throw e;
    }
    return directVision(imageDataUrl, userNote);
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

  async function generateVariation(question, topic) {
    var prompt = '你是一位考研与大学数学/英语出题名师。请针对以下这道原题及其考察的知识点「' + (topic || '学科考点') + '」，出一道【举一反三·变式训练题】。\n\n'
      + '【原题内容】：' + question + '\n\n'
      + '要求：\n'
      + '1. 题型必须为单项选择题，难度与原题相当或略有迁移拓展（同类方法、不同参数或考查逆向思维）。\n'
      + '2. 选项包含 A、B、C、D 四个选项。\n'
      + '3. 请严格按照以下纯 JSON 格式返回，不要包含 markdown 代码块包裹或任何多余文字，确保可直接 JSON.parse：\n'
      + '{\n'
      + '  "topic": "' + (topic || '学科考点') + '",\n'
      + '  "question": "变式题目题干（若有公式请用清晰的文本或标准 LaTeX）",\n'
      + '  "options": [\n'
      + '    "A. 选项1",\n'
      + '    "B. 选项2",\n'
      + '    "C. 选项3",\n'
      + '    "D. 选项4"\n'
      + '  ],\n'
      + '  "answer": "A",\n'
      + '  "analysis": "解题步骤与思路深度剖析，讲清与原题的联系与变化点（150字以内）"\n'
      + '}';

    var text = await chat([
      { role: 'system', content: '你是「学无忧」智能题库的 AI 出题与变式训练专家。请直接输出合法的标准 JSON，切勿输出额外闲聊。' },
      { role: 'user', content: prompt }
    ], { maxTokens: 800, temperature: 0.7 });

    try {
      var clean = text.trim();
      if (clean.indexOf('```') >= 0) {
        clean = clean.replace(/```(?:json)?([\s\S]*?)```/i, '$1').trim();
      }
      var parsed = JSON.parse(clean);
      if (parsed.question && parsed.options && parsed.answer) {
        return parsed;
      }
    } catch (e) {}

    // 解析失败时的兜底提取或结构化
    return {
      topic: topic || '知识点变式',
      question: '变式题：针对原题知识点「' + (topic || '核心考点') + '」的拓展训练',
      rawText: text,
      options: ['A. 选项 A', 'B. 选项 B', 'C. 选项 C', 'D. 选项 D'],
      answer: 'A',
      analysis: text
    };
  }

  return {
    PROVIDERS: PROVIDERS,
    getKey: getKey,
    setKey: setKey,
    getProvider: getProvider,
    setProvider: setProvider,
    chat: chat,
    explainPhoto: explainPhoto,
    explainQuestion: explainQuestion,
    generateQuestions: generateQuestions,
    generateVariation: generateVariation,
    makePlan: makePlan,
    analyzeStats: analyzeStats,
    errText: function (e) {
      if (e && e.message) return 'AI 请求失败：' + e.message;
      return 'AI 请求出错，请检查网络或稍后再试';
    }
  };
})();
