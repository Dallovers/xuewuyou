/*
 * A 的前端服务封装：plan / explain / scenes 接口。
 * 未登录或未配置 AI 时降级为明确标注的“演示模式”（本地规则解析 + 本地存储），
 * 保证手动编辑、案例加载和模型运行始终可用；真实接口恢复后自动切换。
 */
import { cloneScene, degToRad, MODEL_SPECS, makeId } from './contract.js';

const STORAGE_KEY = 'xwy.exploration.records.v1';

function apiBase() {
  const path = typeof location !== 'undefined' ? location.pathname : '/js/features/exploration/index.html';
  const marker = '/js/features/exploration/';
  const index = path.indexOf(marker);
  const root = index >= 0 ? path.slice(0, index) : '';
  return `${root}/api/exploration`;
}

function readLocalRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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

/** 演示模式规则解析：只覆盖比赛中明确列出的示例指令，原文回显未识别部分 */
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
    onStatus && onStatus({ mode, detail });
  }

  async function request(path, options = {}) {
    const controller = new AbortController();
    controllers.add(controller);
    try {
      const response = await fetch(`${apiBase()}${path}`, {
        ...options,
        signal: controller.signal,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.ok !== true) throw new Error((data && data.error) || '接口返回失败');
      apiAvailable = true;
      report('api', '已连接 A 的真实接口');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      if (apiAvailable !== false) report('preview', `接口不可用（${error.message}），已切换演示模式`);
      apiAvailable = false;
      return null;
    } finally {
      controllers.delete(controller);
    }
  }

  return {
    async plan(message, scene) {
      const data = await request('/plan', { method: 'POST', body: JSON.stringify({ message, scene }) });
      if (data && data.plan) return { ...data, source: 'api' };
      const preview = previewPlan(message, scene);
      return { ...preview, source: 'preview' };
    },

    async explain(question, scene, observations) {
      const data = await request('/explain', {
        method: 'POST',
        body: JSON.stringify({ question, scene, observations })
      });
      if (data && typeof data.answer === 'string') return { ...data, source: 'api' };
      return previewExplain(question, scene, observations);
    },

    async listScenes() {
      const data = await request('/scenes');
      if (data && Array.isArray(data.scenes)) return { source: 'api', scenes: data.scenes };
      return { source: 'local', scenes: readLocalRecords() };
    },

    async saveRecord(record) {
      const data = await request('/scenes', { method: 'POST', body: JSON.stringify(record) });
      if (data && data.record) return { source: 'api', record: data.record };
      const records = readLocalRecords();
      const stored = { ...cloneScene(record), id: record.id || makeId(), revision: 1, savedAt: new Date().toISOString(), local: true };
      const index = records.findIndex(item => item.id === stored.id);
      if (index >= 0) records[index] = stored;
      else records.unshift(stored);
      writeLocalRecords(records);
      return { source: 'local', record: stored };
    },

    async getRecord(id) {
      const data = await request(`/scene?id=${encodeURIComponent(id)}`);
      if (data && data.record) return { source: 'api', record: data.record };
      return { source: 'local', record: readLocalRecords().find(item => item.id === id) || null };
    },

    async updateRecord(id, payload) {
      const data = await request(`/scene?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });
      if (data && data.record) return { source: 'api', record: data.record };
      const records = readLocalRecords();
      const index = records.findIndex(item => item.id === id);
      if (index < 0) return { source: 'local', record: null, error: '本地未找到该记录' };
      const stored = { ...records[index], ...payload, revision: (records[index].revision || 1) + 1, savedAt: new Date().toISOString(), local: true };
      records[index] = stored;
      writeLocalRecords(records);
      return { source: 'local', record: stored };
    },

    mode: () => apiAvailable,
    dispose() {
      controllers.forEach(controller => controller.abort());
      controllers.clear();
    }
  };
}
