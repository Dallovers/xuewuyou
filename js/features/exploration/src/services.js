/*
 * A 的前端服务封装：plan / explain / scenes 接口。
 * 地址与凭据复用站点现有部署配置（js/deploy-config.js）和会话（js/api.js）：
 *   - 后端来源：window.WG_DEPLOY.apiBase；未配置时退回同源根路径
 *   - 会话：window.WG_API.getToken()，退回 localStorage 的 xwy_token
 * 网络不可用才降级为明确标注的“演示模式”；401/403/409 等业务错误原样上抛，
 * 由界面保留场景与草稿并给出对应提示，绝不把失败伪装成本机保存成功。
 */
import { cloneScene, degToRad, MODEL_SPECS, makeId } from './contract.js';

const STORAGE_KEY = 'xwy.exploration.records.v1';
const DEFAULT_TIMEOUT = 20000;

export class ApiError extends Error {
  constructor(status, code, message, detail) {
    super(message || `请求失败（HTTP ${status}）`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code || (status === 401 ? 'AUTH_REQUIRED' : status === 403 ? 'FORBIDDEN' : status === 409 ? 'CONFLICT' : 'API_ERROR');
    this.detail = detail || null;
  }
}

export class UnavailableError extends Error {
  constructor(code, message, cause) {
    super(message || '后端不可用');
    this.name = 'UnavailableError';
    this.code = code || 'NETWORK';
    this.cause = cause || null;
  }
}

function pageRoot() {
  const path = typeof location !== 'undefined' ? location.pathname : '/js/features/exploration/index.html';
  const marker = '/js/features/exploration/';
  const index = path.indexOf(marker);
  return index >= 0 ? path.slice(0, index) : '';
}

/** 后端 exploration 接口根地址；每次调用重新计算，账号/部署切换后立即生效 */
export function resolveApiBase() {
  if (typeof window !== 'undefined' && window.__XWY_API_BASE__) {
    return String(window.__XWY_API_BASE__).replace(/\/$/, '');
  }
  const configured = typeof window !== 'undefined' && window.WG_DEPLOY && window.WG_DEPLOY.apiBase;
  if (configured) {
    try {
      return `${new URL(configured).origin}/api/exploration`;
    } catch (error) {
      /* 配置非法时退回同源，避免整页不可用 */
    }
  }
  return `${pageRoot()}/api/exploration`;
}

/** 每次请求都读取当前会话，账号切换后不使用旧 token */
export function currentToken() {
  try {
    if (typeof window !== 'undefined' && window.WG_API && typeof window.WG_API.getToken === 'function') {
      return window.WG_API.getToken() || '';
    }
  } catch (error) { /* 忽略并退回本地读取 */ }
  try {
    return localStorage.getItem('xwy_token') || '';
  } catch (error) {
    return '';
  }
}

function readLocalRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeLocalRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function numbersWithUnit(text, units) {
  const result = [];
  const pattern = new RegExp(`(-?\\d+(?:\\.\\d+)?)\\s*(?:${units})`, 'g');
  let match;
  while ((match = pattern.exec(text))) result.push(Number(match[1]));
  return result;
}

function resolveTarget(scene, message) {
  if (/pendulum-\d+|matrix-\d+/.test(message)) {
    const id = message.match(/pendulum-\d+|matrix-\d+/)[0];
    if (scene.objects.some(item => item.id === id)) return id;
  }
  const countMatch = message.match(/第\s*([一二三四1-4])\s*个/);
  const cn = { 一: 0, 二: 1, 三: 2, 四: 3 };
  if (countMatch) {
    const index = /[1-4]/.test(countMatch[1]) ? Number(countMatch[1]) - 1 : cn[countMatch[1]];
    if (scene.objects[index]) return scene.objects[index].id;
  }
  if (/右边|右侧|第二个/.test(message)) return scene.objects[scene.objects.length - 1].id;
  return scene.objects[0].id;
}

function clampToSpec(name, value, modelId) {
  const spec = MODEL_SPECS[modelId].params[name];
  if (!spec || !spec.min) return value;
  return Math.min(spec.max, Math.max(spec.min, value));
}

/** 演示模式规则解析：只覆盖任务书列出的示例指令，并显式标注来源 */
function previewPlan(message, scene) {
  const text = String(message || '').trim();
  if (!text) return { plan: null, error: '请输入操作指令' };
  const assumptions = ['演示模式：本地规则解析，尚未接入真实 AI'];

  if (/创建|新建|做两个|做一个|来两个/.test(text) && /摆|pendulum/.test(text)) {
    const lengths = numbersWithUnit(text, '米|m');
    const degrees = numbersWithUnit(text, '度|°');
    let count = 2;
    const countMatch = text.match(/([一二三四1-4])\s*个摆/);
    if (countMatch) count = /[1-4]/.test(countMatch[1]) ? Number(countMatch[1]) : { 一: 1, 二: 2, 三: 3, 四: 4 }[countMatch[1]] || 2;
    count = Math.min(4, Math.max(1, count));
    const defaults = MODEL_SPECS.pendulum.defaults;
    const objects = Array.from({ length: count }, (_, index) => ({
      id: `pendulum-${index + 1}`,
      kind: 'pendulum',
      position: [count === 1 ? 0 : index === 0 ? -1 : 1, 0, 0],
      params: {
        ...defaults,
        length: clampToSpec('length', lengths[index] != null ? lengths[index] : defaults.length, 'pendulum'),
        theta0: clampToSpec('theta0', degrees.length ? degToRad(degrees[0]) : defaults.theta0, 'pendulum')
      }
    }));
    const next = {
      schemaVersion: 1,
      title: text.slice(0, 40) || '自主探究',
      modelId: 'pendulum',
      modelVersion: 1,
      objects,
      environment: { gravity: scene.modelId === 'pendulum' ? scene.environment.gravity : 9.81 },
      measurement: { duration: 30, sampleHz: 30 }
    };
    return {
      plan: { kind: 'replace', scene: next, summary: `演示模式：创建 ${count} 个单摆${lengths.length ? `，摆长 ${lengths.join('、')} 米` : ''}${degrees.length ? `，初始角 ${degrees[0]}°` : ''}`, assumptions }
    };
  }

  if (/撤销|回退|上一步/.test(text)) {
    return { plan: { kind: 'patch', operations: [], summary: '演示模式：请使用撤销按钮或 Ctrl+Z 回退配置', assumptions } };
  }

  const targetId = resolveTarget(scene, text);
  const operations = [];

  if (/重力|gravity/.test(text)) {
    const match = text.match(/(-?\d+(?:\.\d+)?)/);
    if (match) operations.push({ type: 'set-environment', name: 'gravity', value: Math.min(20, Math.max(0.5, Number(match[1]))) });
    else return { plan: null, error: '未识别重力数值，例如“重力改成 3.71”' };
  } else if (/矩阵|matrix/.test(text) && scene.modelId === 'matrix2d') {
    const match = text.match(/\[\s*\[[^\]]+\]\s*,\s*\[[^\]]+\]\s*\]/);
    if (!match) return { plan: null, error: '矩阵请写成 [[a,b],[c,d]] 格式' };
    const value = JSON.parse(match[0]);
    operations.push({ type: 'set-param', targetId, name: 'matrix', value });
  } else {
    let name = null;
    let value = null;
    if (/摆长|长度|length/.test(text) || numbersWithUnit(text, '米|m').length) {
      name = 'length';
      const found = numbersWithUnit(text, '米|m');
      if (found.length) value = found[0];
    } else if (/质量|mass|kg|千克/.test(text)) {
      name = 'mass';
      const found = text.match(/(-?\d+(?:\.\d+)?)/);
      if (found) value = Number(found[1]);
    } else if (/初始角|角度|度/.test(text)) {
      name = 'theta0';
      const found = numbersWithUnit(text, '度|°');
      if (found.length) value = degToRad(found[0]);
    } else if (/阻尼|damping/.test(text)) {
      name = 'damping';
      const found = text.match(/(-?\d+(?:\.\d+)?)/);
      if (found) value = Number(found[1]);
    }
    if (!name || value == null) {
      return { plan: { kind: 'patch', operations: [], summary: '演示模式：未识别具体修改，请说明对象与参数（如“左边改成 1.5 米”）', assumptions } };
    }
    operations.push({ type: 'set-param', targetId, name, value: clampToSpec(name, value, scene.modelId) });
  }

  return {
    plan: {
      kind: 'patch',
      operations,
      summary: `演示模式：已解析 ${operations.length} 项修改（${targetId}）`,
      assumptions
    }
  };
}

function previewExplain(question, scene, observations) {
  const summary = observations && observations.summary ? observations.summary : [];
  const configText = scene.objects.map((object) => {
    if (scene.modelId === 'pendulum') {
      return `${object.id}：摆长 ${object.params.length.toFixed(2)} m、质量 ${object.params.mass.toFixed(2)} kg、初始角 ${(object.params.theta0 * 180 / Math.PI).toFixed(1)}°`;
    }
    return `${object.id}：矩阵 ${JSON.stringify(object.params.matrix)}`;
  }).join('；');
  const evidence = summary.map(item => ({ label: item.label, value: String(item.value), unit: item.unit || '' }));
  if (scene.modelId === 'pendulum') {
    const theory = scene.objects.map((object) => {
      const T = 2 * Math.PI * Math.sqrt(object.params.length / scene.environment.gravity);
      return `${object.id} 小角度理论周期 ${T.toFixed(3)} s`;
    }).join('；');
    return {
      answer: `演示模式（未接入真实 AI）。当前配置为：${configText}；重力 ${scene.environment.gravity.toFixed(2)} m/s²。由 T=2π√(L/g) 得到 ${theory}。实际观测数据来自本轮模型采样，${summary.length ? `包括 ${summary.map(item => item.label).join('、')}` : '当前尚无足够采样'}。请结合配置与曲线判断差异来源。`,
      evidence: [
        { label: '配置摘要', value: configText, unit: '' },
        { label: '理论来源', value: 'T=2π√(L/g)', unit: 's' },
        ...evidence
      ],
      generated: false,
      source: 'preview'
    };
  }
  return {
    answer: `演示模式（未接入真实 AI）。当前矩阵为 ${JSON.stringify(scene.objects[0].params.matrix)}，输入向量 ${JSON.stringify(scene.objects[0].params.vectors)}。结果向量由矩阵乘法 A·v 计算，变换过程见右侧结果区与三维箭头。`,
    evidence: [{ label: '配置摘要', value: configText, unit: '' }, ...evidence],
    generated: false,
    source: 'preview'
  };
}

export function createServices({ onStatus } = {}) {
  const controllers = new Set();
  let apiAvailable = null;

  function report(mode, detail) {
    onStatus && onStatus({ mode, detail, apiBase: resolveApiBase(), token: !!currentToken() });
  }

  function markAvailable(available, detail) {
    if (apiAvailable !== available) {
      apiAvailable = available;
      report(available ? 'api' : 'preview', detail || (available ? '已连接后端接口' : '后端不可用，使用演示模式'));
    }
  }

  async function request(path, options = {}) {
    const base = resolveApiBase();
    const url = `${base}${path}`;
    const token = currentToken();
    const controller = new AbortController();
    controllers.add(controller);
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || (typeof window !== 'undefined' && window.__XWY_API_TIMEOUT__) || DEFAULT_TIMEOUT);
    let sameOrigin = true;
    try { sameOrigin = new URL(url).origin === location.origin; } catch (error) { /* 测试环境无 location */ }

    try {
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        credentials: sameOrigin ? 'same-origin' : 'omit',
        headers
      });
      let data = null;
      try { data = await response.json(); } catch (error) { /* 非 JSON 响应 */ }
      if (!response.ok) {
        throw new ApiError(response.status, data && data.code, (data && data.error) || `请求失败（HTTP ${response.status}）`, data);
      }
      if (!data || data.ok !== true) {
        throw new ApiError(response.status, data && data.code, (data && data.error) || '接口返回失败', data);
      }
      markAvailable(true, '已连接后端接口');
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        apiAvailable = false;
        report('error', `${error.status} ${error.code || ''} ${error.message}`);
        throw error;
      }
      if (error.name === 'AbortError') {
        markAvailable(false, '请求超时');
        throw new UnavailableError('TIMEOUT', '请求超时：后端未在限定时间内响应');
      }
      markAvailable(false, '网络不可用');
      throw new UnavailableError('NETWORK', '网络连接失败：请检查网络或后端服务', error);
    } finally {
      clearTimeout(timeout);
      controllers.delete(controller);
    }
  }

  function localRecord(record) {
    return { ...cloneScene(record), id: record.id || makeId(), revision: 1, savedAt: new Date().toISOString(), local: true };
  }

  return {
    apiBase: resolveApiBase,
    hasToken: () => !!currentToken(),
    mode: () => apiAvailable,

    async plan(message, scene) {
      try {
        const data = await request('/plan', { method: 'POST', body: JSON.stringify({ message, scene }) });
        if (data && data.plan) return { ...data, source: 'api' };
        throw new ApiError(200, 'INVALID_PLAN', '后端未返回可执行计划');
      } catch (error) {
        if (error instanceof UnavailableError) {
          return { ...previewPlan(message, scene), source: 'preview', notice: '后端不可用，已使用演示模式' };
        }
        throw error;
      }
    },

    async explain(question, scene, observations) {
      try {
        const data = await request('/explain', { method: 'POST', body: JSON.stringify({ question, scene, observations }) });
        if (data && typeof data.answer === 'string') return { ...data, source: 'api' };
        throw new ApiError(200, 'INVALID_ANSWER', '后端未返回解释内容');
      } catch (error) {
        if (error instanceof UnavailableError) return { ...previewExplain(question, scene, observations), notice: '后端不可用，已使用演示模式' };
        throw error;
      }
    },

    async listScenes() {
      try {
        const data = await request('/scenes');
        return { source: 'api', scenes: Array.isArray(data.scenes) ? data.scenes : [] };
      } catch (error) {
        if (error instanceof UnavailableError) return { source: 'local', scenes: readLocalRecords(), notice: '后端不可用，显示本机记录' };
        throw error;
      }
    },

    listLocalRecords() { return readLocalRecords(); },
    getLocalRecord(id) { return readLocalRecords().find(item => item.id === id) || null; },

    async saveRecord(record) {
      const data = await request('/scenes', { method: 'POST', body: JSON.stringify(record) });
      if (!data.record) throw new ApiError(200, 'INVALID_RECORD', '保存成功但未返回记录');
      return { source: 'api', record: data.record };
    },

    async updateRecord(id, payload) {
      const data = await request(`/scene?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });
      if (!data.record) throw new ApiError(200, 'INVALID_RECORD', '更新成功但未返回记录');
      return { source: 'api', record: data.record };
    },

    async getRecord(id) {
      try {
        const data = await request(`/scene?id=${encodeURIComponent(id)}`);
        if (data.record) return { source: 'api', record: data.record };
        throw new ApiError(200, 'INVALID_RECORD', '接口未返回记录');
      } catch (error) {
        if (error instanceof UnavailableError) return { source: 'local', record: readLocalRecords().find(item => item.id === id) || null };
        throw error;
      }
    },

    /** 明确的用户选择：保存到本机，不调用云端 */
    saveLocalRecord(record) {
      const records = readLocalRecords();
      const stored = localRecord(record);
      const index = records.findIndex(item => item.id === stored.id);
      if (index >= 0) records[index] = stored;
      else records.unshift(stored);
      writeLocalRecords(records);
      return { source: 'local', record: stored };
    },

    async updateLocalRecord(id, payload) {
      const records = readLocalRecords();
      const index = records.findIndex(item => item.id === id);
      if (index < 0) return { source: 'local', record: null, error: '本机未找到该记录' };
      const stored = { ...records[index], ...payload, revision: (records[index].revision || 1) + 1, savedAt: new Date().toISOString(), local: true };
      records[index] = stored;
      writeLocalRecords(records);
      return { source: 'local', record: stored };
    },

    dispose() {
      controllers.forEach(controller => controller.abort());
      controllers.clear();
    }
  };
}
