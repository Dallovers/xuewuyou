'use strict';
/* 断点续学客户端（js/practice-resume.js）逻辑测试
 *
 * 用 vm + stub 的 WG_API 在 Node 中加载前端真实文件，覆盖：本地模式降级、
 * clientRequestId 跨刷新复用、保存只走 practice 接口（不重复计分）、
 * 409 冲突恢复、保存节流、切账号清理。
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'practice-resume.js'), 'utf8');

function sess(patch) {
  return Object.assign({
    id: 's1', qids: ['7036'], currentIndex: 0, drafts: {},
    submittedQids: [], status: 'active', version: 1
  }, patch || {});
}

function makeEnv(options) {
  options = options || {};
  const store = options.store || new Map();
  const calls = [];
  const authFns = [];
  const events = [];
  let token = options.token === undefined ? 'tok-a' : options.token;
  let cloud = options.cloud !== false;

  const sandbox = {
    console, setTimeout, clearTimeout, Promise, Date, Math, JSON,
    Object, Array, String, Number, Error, TypeError,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k)
    },
    WG_API: {
      getToken: () => token,
      isCloudSession: () => cloud,
      onAuthChange: (fn) => authFns.push(fn),
      req: async (method, p, body) => {
        calls.push({ method, path: p, body });
        if (options.req) return options.req(method, p, body, calls.length);
        return { session: sess() };
      }
    }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox, { filename: 'practice-resume.js' });

  const api = sandbox.WG_Practice;
  api.onChange((evt) => events.push(evt));
  return {
    api, calls, events, store,
    setToken: (t) => { token = t; },
    switchAccount: (t) => { token = t; authFns.forEach((fn) => fn()); }
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* vm 沙箱里创建的对象/数组原型属于另一个 realm，deepStrictEqual 会因原型不同判不等；
   统一转成本 realm 的普通值再比较。 */
const norm = (v) => JSON.parse(JSON.stringify(v));

test('本地模式/未登录时整体降级，不发起任何请求', async () => {
  const env = makeEnv({ cloud: false });
  assert.equal(env.api.available(), false);
  assert.equal(await env.api.create({ qids: ['7036'] }), null);
  assert.equal(await env.api.restore(), null);
  assert.equal(env.calls.length, 0);
});

test('创建时带上 clientRequestId，刷新后复用同一个键（幂等）', async () => {
  const store = new Map();
  const ids = [];
  const mk = () => makeEnv({
    store,
    req: (m, p, body) => { ids.push(body.clientRequestId); return { session: sess({ id: 's' + ids.length }) }; }
  });
  const a = mk();
  await a.api.create({ qids: ['7036'], topic: '函数与极限' });
  const b = mk(); // 模拟刷新：新模块实例，但 localStorage 保留
  await b.api.create({ qids: ['7036'], topic: '函数与极限' });
  assert.equal(ids.length, 2);
  assert.equal(ids[1], ids[0], '刷新后应复用同一 clientRequestId');
  assert.equal(a.api.current().id, 's1');
  assert.equal(b.api.current().id, 's2');
});

test('保存只走 practice 接口，不写作答记录（不会重复计分）', async () => {
  const env = makeEnv({ req: (m) => ({ session: sess({ version: m === 'PUT' ? 2 : 1 }) }) });
  await env.api.create({ qids: ['7036'] });
  env.api.markSubmitted('7036');
  env.api.markSubmitted('7036'); // 重复标记应去重
  env.api.setIndex(1);
  await env.api.save();

  const put = env.calls.find((c) => c.method === 'PUT');
  assert.ok(put, '应发出 PUT');
  assert.deepStrictEqual(norm(put.body.submittedQids), ['7036']);
  assert.equal(put.body.currentIndex, 1);
  assert.equal(put.body.expectedVersion, 1);
  assert.ok(env.calls.every((c) => c.path.indexOf('/api/practice/session') === 0), '只允许请求 practice 接口');
  assert.ok(!env.calls.some((c) => c.path.indexOf('/api/data') === 0), '绝不能写 /api/data');
});

test('409 冲突：重新拉取最新版本并合并草稿后重试一次', async () => {
  let putCount = 0;
  const env = makeEnv({
    req: (method) => {
      if (method === 'PUT') {
        putCount += 1;
        if (putCount === 1) throw Object.assign(new Error('冲突'), { code: 'VERSION_CONFLICT', status: 409 });
        return { session: sess({ version: 7, currentIndex: 2 }) };
      }
      // GET：服务端已有另一份草稿
      return { session: sess({ version: 6, currentIndex: 2, drafts: { 7036: { text: '服务端旧草稿' } } }) };
    }
  });
  await env.api.create({ qids: ['7036'] });
  env.api.setDraft('7036', { text: '本地新草稿' });
  const r = await env.api.save();

  assert.equal(putCount, 2, '应在合并后重试一次');
  assert.equal(r.session.version, 7);
  const secondPut = env.calls.filter((c) => c.method === 'PUT')[1];
  assert.equal(secondPut.body.expectedVersion, 6, '重试应使用刚取到的最新版本');
  assert.equal(secondPut.body.drafts['7036'].text, '本地新草稿', '本次操作过的草稿以本地为准');
  assert.ok(env.events.indexOf('conflict') >= 0);
});

test('保存节流：连续调度多次只发一次请求', async () => {
  let puts = 0;
  const env = makeEnv({ req: (m) => { if (m === 'PUT') puts += 1; return { session: sess() }; } });
  env.api._config({ saveDelay: 25 });
  await env.api.create({ qids: ['7036'] });
  env.api.scheduleSave({ index: 1 });
  env.api.scheduleSave({ index: 2 });
  env.api.scheduleSave({ index: 3 });
  await sleep(120);
  assert.equal(puts, 1, '节流窗口内只应保存一次');
});

test('切换账号后清空本地会话，不再拿旧进度发请求', async () => {
  const env = makeEnv({ req: () => ({ session: sess() }) });
  await env.api.create({ qids: ['7036'] });
  assert.ok(env.api.current());

  const before = env.calls.length;
  env.switchAccount('tok-b');
  assert.equal(env.api.current(), null, '切账号应清空当前会话');

  const r = await env.api.save();
  assert.equal(r, null);
  assert.equal(env.calls.length, before, '清空后不应再发请求');
});

test('结束会话：先 flush 再调用 finish，并清空本地状态', async () => {
  const env = makeEnv({
    req: (method, p) => {
      if (String(p).endsWith('/finish')) return { session: sess({ status: 'finished', version: 3 }) };
      return { session: sess({ version: 2 }) };
    }
  });
  await env.api.create({ qids: ['7036'] });
  env.api.setIndex(1);
  const done = await env.api.finish('finished');

  const kinds = env.calls.map((c) => c.method + ' ' + c.path);
  assert.deepEqual(kinds, [
    'POST /api/practice/session',
    'PUT /api/practice/session',
    'POST /api/practice/session/finish'
  ]);
  assert.equal(done.status, 'finished');
  assert.equal(env.api.current().status, 'finished');
  assert.ok(env.events.indexOf('finished') >= 0);
});
