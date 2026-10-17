'use strict';
/* 前端 API 客户端 · 请求策略回归测试（A01）
 *
 * js/api.js 是浏览器 IIFE，这里用 vm + stub fetch 在 Node 中原样加载前端真实文件
 * （不是复制品），覆盖：冷启动提示、退避重试上限、4xx 不重试、错误分类，以及
 * pullMerge 所依赖的 isBackendDown 判定口径。
 *
 * 时序通过 window.WG_API_TIMING 注入，测试跑在毫秒级，不需要真的等 30 秒。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'api.js'), 'utf8');

const FAST = { reqTimeout: 120, wakeHint: 40, maxRetries: 3, retryTotal: 4000, retryBase: 10 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeClient(fetchImpl, options) {
  options = options || {};
  const store = new Map();
  const states = [];
  const toasts = [];
  const sandbox = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Promise, Date, Math, JSON, URL, Error, TypeError, AbortSignal, Buffer,
    fetch: fetchImpl,
    WG_Runtime: {},
    window: {
      WG_DEPLOY: options.deploy || { apiBase: 'https://example.test' },
      WG_Runtime: {},
      WG_API_TIMING: Object.assign({}, FAST, options.timing || {}),
      toast: (msg) => toasts.push(msg)
    },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k)
    }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox, { filename: 'api.js' });
  const api = sandbox.WG_API;
  api.onStatus((s) => { states.push(s); return true; }); // 自行接管，不落到 toast
  return { api, states, toasts, store };
}

function resp(status, body, opts) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (opts && opts.invalidJson) throw new SyntaxError('Unexpected token <');
      return body;
    }
  };
}

/* 永不主动返回，只有 AbortSignal 触发时才以 TimeoutError 拒绝——模拟冷启动挂起。
   注意：Node 里 AbortSignal.timeout() 的定时器是 unref 的，只等它会让事件循环提前
   退出，所以额外挂一个 ref 定时器把循环撑住（仅测试需要，浏览器无此问题）。 */
function hang(url, opts) {
  return new Promise((resolve, reject) => {
    let keep = null;
    const fail = () => {
      if (keep) { clearTimeout(keep); keep = null; }
      const e = new Error('The operation was aborted due to timeout');
      e.name = 'TimeoutError';
      reject(e);
    };
    keep = setTimeout(() => {}, 5000);
    if (opts && opts.signal) {
      if (opts.signal.aborted) return fail();
      opts.signal.addEventListener('abort', fail);
    }
  });
}

test('冷启动慢响应：先提示 waking，恢复后发 ready，且全程只请求一次', async () => {
  let calls = 0;
  const c = makeClient(async () => {
    calls += 1;
    await sleep(80); // 超过 wakeHint(40ms)
    return resp(200, { ok: true });
  });
  const data = await c.api.req('GET', '/api/health');
  assert.deepStrictEqual(data, { ok: true });
  assert.strictEqual(calls, 1, '慢响应不应触发重试');
  assert.ok(c.states.includes('waking'), '应发出 waking 提示');
  assert.ok(c.states.includes('ready'), '恢复后应发出 ready');
  assert.strictEqual(c.states[0], 'waking', 'waking 应先于 ready');
});

test('网关 502（HTML 错误页）后自动退避重试成功', async () => {
  let calls = 0;
  const c = makeClient(async () => {
    calls += 1;
    if (calls === 1) return resp(502, null, { invalidJson: true });
    return resp(200, { ok: true, second: true });
  });
  const data = await c.api.req('GET', '/api/health');
  assert.deepStrictEqual(data, { ok: true, second: true });
  assert.strictEqual(calls, 2);
  assert.ok(c.states.includes('retrying'));
});

test('401 属确定性错误：不重试并抛 AUTH_FAILED', async () => {
  let calls = 0;
  const c = makeClient(async () => {
    calls += 1;
    return resp(401, { ok: false, error: '未登录' });
  });
  await assert.rejects(() => c.api.req('GET', '/api/data'), (e) => {
    assert.strictEqual(e.code, 'AUTH_FAILED');
    assert.strictEqual(e.status, 401);
    return true;
  });
  assert.strictEqual(calls, 1, '401 不应重试');
});

test('持续不可达：重试次数有上限，最终抛 NET_UNREACHABLE', async () => {
  let calls = 0;
  const c = makeClient(async () => { calls += 1; throw new TypeError('fetch failed'); });
  await assert.rejects(() => c.api.req('GET', '/api/health'), (e) => {
    assert.strictEqual(e.code, 'NET_UNREACHABLE');
    assert.strictEqual(e.status, 0);
    return true;
  });
  assert.strictEqual(calls, 1 + FAST.maxRetries, '应为首次 + MAX_RETRIES 次');
  assert.strictEqual(c.states[c.states.length - 1], 'unreachable');
});

test('请求挂起超时归类为 COLD_START_TIMEOUT，而不是普通断网', async () => {
  const c = makeClient(hang);
  await assert.rejects(() => c.api.req('GET', '/api/health'), (e) => {
    assert.strictEqual(e.code, 'COLD_START_TIMEOUT');
    return true;
  });
});

test('noRetry 选项：只请求一次', async () => {
  let calls = 0;
  const c = makeClient(async () => { calls += 1; throw new TypeError('fetch failed'); });
  await assert.rejects(() => c.api.req('GET', '/api/health', undefined, { noRetry: true }));
  assert.strictEqual(calls, 1);
});

test('isBackendDown 口径：403 / 404 不再算"后端不可达"', () => {
  const c = makeClient(async () => resp(200, {}));
  assert.strictEqual(c.api.isBackendDown({ status: 403 }), false);
  assert.strictEqual(c.api.isBackendDown({ status: 404 }), false);
  assert.strictEqual(c.api.isBackendDown({ status: 401 }), false);
});

test('isBackendDown 口径：网络失败 / 冷启动超时 / 5xx 仍算"后端不可达"', () => {
  const c = makeClient(async () => resp(200, {}));
  assert.strictEqual(c.api.isBackendDown({ status: 0, code: 'COLD_START_TIMEOUT' }), true);
  assert.strictEqual(c.api.isBackendDown({ status: 0 }), true);
  assert.strictEqual(c.api.isBackendDown({ status: 500 }), true);
  assert.strictEqual(c.api.isBackendDown({ status: 502 }), true);
  assert.strictEqual(c.api.isBackendDown({ status: 503 }), true);
  assert.strictEqual(c.api.isBackendDown({ status: 504 }), true);
});

test('pullMerge：/api/data 返回 403 时不再静默吞错（权限问题应暴露）', async () => {
  const c = makeClient(async (url) => {
    if (String(url).endsWith('/api/data')) return resp(403, { ok: false, error: '无权访问' });
    return resp(200, { ok: true, data: {} });
  });
  await assert.rejects(() => c.api.pullMerge({ answers: [], mistakes: [], cleared: [] }),
    (e) => e.status === 403);
});

test('pullMerge：/api/data 返回 503 时保留本地数据并照常返回', async () => {
  const c = makeClient(async () => resp(503, { ok: false, error: '服务不可用' }));
  const local = { answers: [{ qid: 'q1', timeMs: 1, correct: true }], mistakes: [], cleared: [], nick: '小明' };
  const merged = await c.api.pullMerge(local);
  assert.strictEqual(merged.answers.length, 1, '本地作答应保留');
  assert.strictEqual(merged.nick, '小明');
});
