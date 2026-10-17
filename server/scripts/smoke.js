#!/usr/bin/env node
'use strict';
/* ============ 学无忧 · 发布冒烟（A07） ============
 *
 * 对一个**正在运行**的部署走一遍关键路径，输出可读的检查表。
 * 纯 HTTP，不依赖服务端源码，所以既能打本地，也能打线上。
 *
 *   node scripts/smoke.js http://127.0.0.1:3000
 *   node scripts/smoke.js https://xuewuyou-campus.onrender.com
 *   node scripts/smoke.js <url> --read-only     只跑只读检查，不建账号不写数据
 *
 * 退出码：全通过 0，有任何失败 1 —— 可以直接串进发布流程。
 */

const RAW_BASE = process.argv[2] || process.env.SMOKE_BASE || 'http://127.0.0.1:3000';
const BASE = RAW_BASE.replace(/\/+$/, '');
const READ_ONLY = process.argv.includes('--read-only');
const TIMEOUT = Number(process.env.SMOKE_TIMEOUT || 20000);

const results = [];
let token = '';
const stamp = Date.now().toString(36);

function record(name, ok, detail) {
  results.push({ name, ok, detail: detail || '' });
  console.log((ok ? '  ✓ ' : '  ✗ ') + name + (detail ? '  — ' + detail : ''));
}

async function http(method, path, body, headers) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(headers || {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(TIMEOUT)
  });
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, body: json };
}

/* 免费的托管实例会休眠，第一次请求可能要等将近一分钟，给几次重试 */
async function waitForServer() {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await http('GET', '/api/health');
      if (r.status === 200) return true;
    } catch { /* 冷启动中 */ }
    if (i < 3) {
      console.log('  … 等待服务就绪（免费实例可能正在唤醒）');
      await new Promise((r) => setTimeout(r, 8000));
    }
  }
  return false;
}

async function step(name, fn) {
  try {
    const detail = await fn();
    record(name, true, detail);
    return true;
  } catch (e) {
    record(name, false, e && e.message ? e.message : String(e));
    return false;
  }
}

function expect(cond, message) {
  if (!cond) throw new Error(message);
}

(async () => {
  console.log('\n学无忧 · 发布冒烟  →  ' + BASE + (READ_ONLY ? '（只读）' : '') + '\n');

  await step('服务可达 /api/health', async () => {
    expect(await waitForServer(), '服务在多次重试后仍不可达');
    const r = await http('GET', '/api/health');
    expect(r.status === 200 && r.body && r.body.ok === true, '健康检查返回异常：' + r.status);
    return 'ok';
  });

  await step('题库元信息（公开接口）', async () => {
    const r = await http('GET', '/api/questions/meta');
    expect(r.status === 200, '状态码 ' + r.status);
    expect(typeof r.body.total === 'number' && r.body.total > 0, '题库总量异常');
    expect(!/"answer"|"analysis"/.test(JSON.stringify(r.body)), '元信息泄露了答案');
    return '共 ' + r.body.total + ' 题，版本 ' + r.body.version;
  });

  await step('未登录访问受保护接口应 401', async () => {
    const saved = token; token = '';
    try {
      const r = await http('GET', '/api/campus/state');
      expect(r.status === 401, '未登录却返回 ' + r.status);
    } finally { token = saved; }
    return 'campus/state → 401';
  });

  if (READ_ONLY) {
    return finish();
  }

  await step('注册临时账号', async () => {
    const r = await http('POST', '/api/auth/register', { username: '冒烟' + stamp, password: 'Smoke' + stamp + '!' });
    expect(r.status === 200 && r.body.token, '注册失败：' + r.status + ' ' + (r.body && r.body.error));
    token = r.body.token;
    return '账号 冒烟' + stamp;
  });

  await step('学习记录同步', async () => {
    const answers = [{ qid: '7036', topic: '函数与极限', correct: true, timeMs: Date.now() }];
    const put = await http('PUT', '/api/data', { data: { answers, mistakes: [] } });
    expect(put.status === 200, '写入失败：' + put.status);
    const got = await http('GET', '/api/data');
    expect(got.status === 200 && (got.body.data.answers || []).length >= 1, '读回条数不符');
    return '写入并读回 ' + got.body.data.answers.length + ' 条';
  });

  await step('断点续学：建会话 → 存进度 → 恢复', async () => {
    const created = await http('POST', '/api/practice/session', { clientRequestId: 'smoke-' + stamp, qids: ['7036', '7037'], topic: '函数与极限' });
    expect(created.status === 200 && created.body.session, '创建失败：' + created.status);
    const s = created.body.session;

    const saved = await http('PUT', '/api/practice/session', { id: s.id, expectedVersion: s.version, currentIndex: 1, drafts: { 7036: { text: '冒烟草稿' } } });
    expect(saved.status === 200, '保存失败：' + saved.status);

    const stale = await http('PUT', '/api/practice/session', { id: s.id, expectedVersion: s.version, currentIndex: 0 });
    expect(stale.status === 409, '过期版本未返回 409，实际 ' + stale.status);

    const restored = await http('GET', '/api/practice/session');
    expect(restored.body.session && restored.body.session.currentIndex === 1, '恢复的进度不对');
    expect(restored.body.session.drafts['7036'].text === '冒烟草稿', '草稿未恢复');

    await http('POST', '/api/practice/session/finish', { id: s.id, status: 'finished' });
    return '位置与草稿均恢复，冲突返回 409';
  });

  await step('校园八地点状态', async () => {
    const r = await http('GET', '/api/campus/state');
    expect(r.status === 200, '状态码 ' + r.status);
    expect(Array.isArray(r.body.locations) && r.body.locations.length === 8, '地点数不是 8');
    const ids = r.body.locations.map((l) => l.id).join(',');
    expect(ids === 'bank,wenku,lab,social,arena,study,mistakes,report', '地点 ID 不符：' + ids);
    return '8 个地点齐全';
  });

  await step('世界位置存档', async () => {
    const put = await http('PUT', '/api/world/progress', { worldVersion: 'smoke-w1', sceneId: 'campus', position: { x: 1, y: 0, z: 1 }, heading: 0 });
    expect(put.status === 200, '保存失败：' + put.status);
    const got = await http('GET', '/api/world/progress');
    expect(got.body.progress && got.body.progress.position.x === 1, '读回位置不符');
    const bad = await http('PUT', '/api/world/progress', { worldVersion: 'smoke-w1', sceneId: 'campus', position: { x: 1e9, y: 0, z: 0 } });
    expect(bad.status === 400, '越界坐标未被拒绝');
    return '可存可取，越界坐标被拒';
  });

  await step('自习统计边界', async () => {
    const day = new Date().toISOString().slice(0, 10);
    const ok = await http('PUT', '/api/study/stats', { day, focusMinutes: 30 });
    expect(ok.status === 200, '正常上报失败：' + ok.status);
    const over = await http('PUT', '/api/study/stats', { day, focusMinutes: 100000 });
    expect(over.status === 400, '离谱时长未被拒绝，实际 ' + over.status);
    return '正常值通过，100000 分钟被拒';
  });

  await step('题目分发默认不含答案', async () => {
    const r = await http('GET', '/api/questions?limit=5');
    expect(r.status === 200 && r.body.items.length === 5, '列表异常');
    expect(!/"answer"|"analysis"/.test(JSON.stringify(r.body.items)), '列表泄露了答案');
    const withAnswer = await http('GET', '/api/questions?limit=1&include=answer');
    expect(withAnswer.status === 200 && typeof withAnswer.body.items[0].answer === 'string', '显式索取答案失败');
    return '默认隐藏，include=answer 可取';
  });

  finish();
})().catch((e) => {
  console.error('\n冒烟脚本异常：' + (e && e.message ? e.message : e));
  process.exit(1);
});

function finish() {
  const failed = results.filter((r) => !r.ok);
  console.log('\n' + '─'.repeat(60));
  console.log('通过 ' + (results.length - failed.length) + ' / ' + results.length);
  if (failed.length) {
    console.log('失败项：');
    failed.forEach((f) => console.log('  - ' + f.name + '：' + f.detail));
    process.exit(1);
  }
  console.log('冒烟全部通过 ✓');
  process.exit(0);
}
