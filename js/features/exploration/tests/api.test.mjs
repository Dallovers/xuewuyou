import test from 'node:test';
import assert from 'node:assert/strict';
import { createServices, ApiError, UnavailableError, resolveApiBase } from '../src/services.js';
import { resolveModelUrl } from '../src/model-host.js';
import { createDefaultScene } from '../src/contract.js';

function setGlobals({ apiBase = 'https://api.example.com', token = 'test-token', path = '/xuewuyou/js/features/exploration/index.html' } = {}) {
  global.window = { WG_DEPLOY: apiBase ? { apiBase } : {}, WG_API: { getToken: () => token } };
  global.location = { pathname: path, origin: 'https://site.example.com' };
  const store = new Map();
  global.localStorage = {
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key)
  };
  return store;
}

function mockFetch(handler) {
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return handler(String(url), options, calls.length);
  };
  return calls;
}

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

test('R2-API-01 使用部署配置地址并携带 Bearer token', async () => {
  setGlobals();
  const calls = mockFetch(() => jsonResponse({ ok: true, record: { id: 'r1', revision: 1 } }));
  const services = createServices({ onStatus() {} });
  assert.equal(resolveApiBase(), 'https://api.example.com/api/exploration');
  await services.saveRecord({ id: 'r1', scene: createDefaultScene('pendulum') });
  assert.equal(calls[0].url, 'https://api.example.com/api/exploration/scenes');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token');
  services.dispose();
});

test('R2-API-02 子路径下未配置后端时仍使用同源根路径', () => {
  setGlobals({ apiBase: '', token: '' });
  assert.equal(resolveApiBase(), '/xuewuyou/api/exploration');
});

test('R2-API-03 已有记录使用 PUT 并携带 revision', async () => {
  setGlobals();
  const calls = mockFetch(() => jsonResponse({ ok: true, record: { id: 'r1', revision: 2 } }));
  const services = createServices({ onStatus() {} });
  const result = await services.updateRecord('r1', { revision: 1, scene: createDefaultScene('pendulum') });
  assert.equal(calls[0].url, 'https://api.example.com/api/exploration/scene?id=r1');
  assert.equal(calls[0].options.method, 'PUT');
  assert.equal(JSON.parse(calls[0].options.body).revision, 1);
  assert.equal(result.record.revision, 2);
  services.dispose();
});

test('R2-API-04 409 原样上抛，不伪装成本机保存', async () => {
  setGlobals();
  mockFetch(() => jsonResponse({ ok: false, code: 'CONFLICT', error: '版本冲突' }, 409));
  const services = createServices({ onStatus() {} });
  await assert.rejects(() => services.updateRecord('r1', { revision: 1 }), error => error instanceof ApiError && error.status === 409 && error.code === 'CONFLICT');
  assert.equal(services.listLocalRecords().length, 0);
  services.dispose();
});

test('R2-API-05 401 不降级为演示模式', async () => {
  setGlobals({ token: '' });
  mockFetch(() => jsonResponse({ ok: false, code: 'AUTH_REQUIRED', error: '未登录' }, 401));
  const services = createServices({ onStatus() {} });
  await assert.rejects(() => services.plan('重力改成3.71', createDefaultScene('pendulum')), error => error instanceof ApiError && error.status === 401);
  services.dispose();
});

test('R2-API-06 网络不可用时才使用演示模式', async () => {
  setGlobals();
  global.fetch = async () => { throw new TypeError('fetch failed'); };
  const services = createServices({ onStatus() {} });
  const result = await services.plan('重力改成3.71', createDefaultScene('pendulum'));
  assert.equal(result.source, 'preview');
  assert.equal(result.plan.operations[0].value, 3.71);
  services.dispose();
});

test('R2-API-07 超时归类为 UnavailableError', async () => {
  setGlobals();
  global.window.__XWY_API_TIMEOUT__ = 30;
  global.fetch = async (url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
  });
  const services = createServices({ onStatus() {} });
  const result = await services.plan('重力改成3.71', createDefaultScene('pendulum'));
  assert.equal(result.source, 'preview');
  services.dispose();
});

test('R3-MODEL-01 模型地址以页面为基准，构建包与源码一致', () => {
  setGlobals();
  global.document = { baseURI: 'https://site.example.com/xuewuyou/js/features/exploration/index.html' };
  assert.equal(resolveModelUrl(), 'https://site.example.com/xuewuyou/js/features/exploration/models/index.mjs');
  global.window.__XWY_MODEL_URL__ = 'https://site.example.com/custom/models/index.mjs';
  assert.equal(resolveModelUrl(), 'https://site.example.com/custom/models/index.mjs');
  delete global.window.__XWY_MODEL_URL__;
});
