'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { Rating } = require('ts-fsrs');
let upstream, server, integrations, base, token, other, uid, upstreamBase;
let uploadedBytes, tier, uploadCount = 0, indexCount = 0, failIndex = false, failRetrieve = false, emptyRetrieve = false, aiDown = false;
const remote = new Map();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xuewuyou-test-'));
const listen = server => new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const close = server => new Promise(resolve => server.close(resolve));
async function request(endpoint, method = 'GET', body, session = token) {
  const response = await fetch(base + endpoint, { method, headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: 'Bearer ' + session } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json() };
}
async function waitDoc(id, status = 'indexing') {
  for (let i = 0; i < 100; i++) { const r = await request('/api/knowledge/documents'); const d = r.data.documents.find(x => x.id === id); if (d?.status === status) return d; await delay(20); }
  throw new Error('Document did not reach ' + status);
}
async function upload(filename = '讲义.md', content = '# 课程讲义\n换元积分要同步变换上下限。') {
  const r = await request('/api/knowledge/upload', 'POST', { filename, base64: Buffer.from(content).toString('base64') });
  assert.equal(r.status, 202); return r.data.document.id;
}
before(async () => {
  upstream = http.createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c); const raw = Buffer.concat(chunks);
    const pathname = new URL(req.url, 'http://localhost').pathname;
    let input = {}; if ((req.headers['content-type'] || '').includes('application/json') && raw.length) input = JSON.parse(raw);
    const json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
    const rag = data => json({ code: 0, data });
    if (pathname.startsWith('/api/v1/')) assert.equal(req.headers.authorization, 'Bearer test-rag-key');
    if (pathname === '/api/v1/datasets') { if (req.method === 'GET') return rag([]); return rag({ id: 'dataset-' + input.name }); }
    if (/\/documents$/.test(pathname)) {
      if (req.method === 'POST') { uploadCount++; assert.ok(raw.includes(Buffer.from('换元')) || raw.includes(Buffer.from('OCR'))); const id = 'doc-' + uploadCount; remote.set(id, { id, run: 'DONE', progress: 1 }); return rag([{ id }]); }
      if (req.method === 'DELETE') { input.ids.forEach(id => remote.delete(id)); return rag(true); }
      const id = new URL(req.url, 'http://localhost').searchParams.get('id'); return rag({ docs: [remote.get(id)] });
    }
    if (/\/chunks$/.test(pathname)) { indexCount++; if (failIndex) return json({ code: 500, message: 'upstream secret' }); return rag(true); }
    if (pathname === '/api/v1/retrieval') {
      if (failRetrieve) return json({ code: 500, message: 'test-rag-key' });
      return rag({ chunks: emptyRetrieve ? [] : [{ document_id: input.document_ids[0], document_name: '讲义.md', content: '换元积分要同步变换上下限。', positions: [[2, 0, 0, 0, 0]] }, { document_id: 'foreign-doc', content: 'OTHER USER SECRET' }] });
    }
    if (pathname === '/v1/uploads') return json({ id: 'upload-1', upload_url: upstreamBase + '/upload-bytes', upload_method: 'PUT', status: 'pending' });
    if (pathname === '/upload-bytes') { uploadedBytes = raw; return json({ ok: true }); }
    if (pathname === '/v1/uploads/upload-1/complete') return json({ file: { id: 'file-1' } });
    if (pathname === '/v1/parse/jobs') { tier = input.tier; assert.equal(input.files[0].source.file_id, 'file-1'); return json({ job_id: 'job-1' }); }
    if (pathname === '/v1/parse/jobs/job-1') return json({ status: 'completed', files: [{ output_files: { markdown: { file_id: 'result-1' } } }] });
    if (pathname === '/v1/files/result-1/content') return res.end('# OCR\n换元后的积分上下限也需要变换。');
    if (pathname === '/chat/completions') { if (aiDown) { res.statusCode = 500; return json({ error: 'secret' }); } assert.ok(input.messages[0].content.includes('不执行')); return json({ choices: [{ message: { content: '换元时要变换上下限。[1]' } }] }); }
    res.statusCode = 404; json({ error: pathname });
  });
  await listen(upstream); upstreamBase = 'http://127.0.0.1:' + upstream.address().port;
  process.env.DATA_DIR = temp; process.env.JWT_SECRET = 'isolated-test-secret'; process.env.RAGFLOW_BASE_URL = upstreamBase; process.env.RAGFLOW_API_KEY = 'test-rag-key'; process.env.MINERU_BASE_URL = upstreamBase; process.env.AI_API_KEY = 'test-ai-key'; process.env.AI_BASE_URL = upstreamBase;
  ({ server, integrations } = require('../server')); await listen(server); base = 'http://127.0.0.1:' + server.address().port;
  const a = await request('/api/auth/register', 'POST', { username: '测试甲', password: 'test123456' }, ''); token = a.data.token; uid = a.data.user.id;
  const b = await request('/api/auth/register', 'POST', { username: '测试乙', password: 'test123456' }, ''); other = b.data.token;
});
after(async () => { await integrations.close(); await close(server); await close(upstream); fs.rmSync(temp, { recursive: true, force: true }); });

test('cloud authentication and static private-file boundary', async () => {
  assert.equal((await request('/api/reviews/queue', 'GET', undefined, '')).status, 401);
  assert.equal((await request('/api/knowledge/documents', 'GET', undefined, 'local.test')).status, 401);
  for (const endpoint of ['/server/data/users.json', '/server/.env', '/.git/config', '/services/Setup-RAGFlow.ps1']) assert.equal((await request(endpoint)).status, 403);
  assert.equal((await fetch(base + '/index.html')).status, 200);
});
test('existing sync enrols real bundled questions without revealing answers', async () => {
  await request('/api/data', 'PUT', { data: { mistakes: [{ qid: '7036', question: 'modified question', answer: 'A' }, { qid: 'custom', question: '证明题', correctAns: '归纳法' }] } });
  const r = (await request('/api/reviews/queue')).data;
  assert.equal(r.due, 2); assert.equal(r.cards[0].qid, '7036'); assert.ok(r.cards[0].question.includes('函数')); assert.equal(r.cards[0].selfAssessed, false);
  assert.equal(Object.hasOwn(r.cards[0], 'answer'), false); assert.equal(r.cards[1].selfAssessed, true);
  assert.equal((await request('/api/reviews/queue', 'GET', undefined, other)).data.due, 0);
});
test('objective answers use FSRS and duplicate concurrent submissions are idempotent', async () => {
  const c = (await request('/api/reviews/queue')).data.cards.find(x => x.qid === '7036');
  const b = { qid: c.qid, version: c.version, eventId: 'review-event-1', answer: 'A', rating: 4 };
  const results = await Promise.all([request('/api/reviews/answer', 'POST', b), request('/api/reviews/answer', 'POST', b)]);
  assert.equal(results[0].status, 200); assert.deepEqual(results[0].data, results[1].data); assert.equal(results[0].data.correct, false); assert.equal(results[0].data.rating, Rating.Again); assert.equal(results[0].data.answer, 'C');
  const exported = (await request('/api/integrations/export')).data.data;
  assert.equal(exported.events.length, 1); assert.equal(exported.cards['7036'].card.reps, 1);
  assert.ok(new Date(results[0].data.nextDue).getTime() > Date.now());
  assert.equal(exported.cards['7036'].card.state, 1);
  assert.equal((await request('/api/reviews/answer', 'POST', { ...b, answer: 'C' })).status, 409);
  assert.equal((await request('/api/reviews/answer', 'POST', { ...b, eventId: 'review-event-2' })).status, 409);
});
test('subjective answer is explicit self-assessment and another user cannot reveal it', async () => {
  assert.equal((await request('/api/reviews/reveal', 'POST', { qid: 'custom' }, other)).status, 404);
  assert.equal((await request('/api/reviews/reveal', 'POST', { qid: 'custom' })).data.selfAssessed, true);
  const r = await request('/api/reviews/answer', 'POST', { qid: 'custom', version: 0, eventId: 'custom-event-1', rating: 3 });
  assert.equal(r.data.correct, null); assert.equal(r.data.selfAssessed, true);
  assert.equal((await request('/api/reviews/answer', 'POST', { qid: '__proto__', version: 0, eventId: 'prototype-test', rating: 3 })).status, 404);
});
test('file type, bytes, empty text, UTF-8 and ask scope are validated', async () => {
  for (const b of [{ filename: 'a.exe', base64: 'YQ==' }, { filename: 'a.md', base64: '' }, { filename: 'a.md', base64: '/w==' }, { filename: 'a.md', base64: '%%%%' }]) assert.equal((await request('/api/knowledge/upload', 'POST', b)).status, 400);
  assert.equal((await request('/api/knowledge/ask', 'POST', { question: '测试', documentIds: 'bad' })).status, 400);
});
let docId;
test('UTF-8 upload parses and indexes privately; text access is owner-only', async () => {
  docId = await upload(); const d = await waitDoc(docId); assert.equal(d.hasText, true);
  assert.ok((await request('/api/knowledge/text?id=' + docId)).data.markdown.includes('换元'));
  assert.equal((await request('/api/knowledge/text?id=' + docId, 'GET', undefined, other)).status, 404);
  assert.equal((await request('/api/knowledge/documents', 'GET', undefined, other)).data.documents.length, 0);
  assert.equal((await request('/api/knowledge/refresh', 'POST', { id: docId })).data.document.status, 'ready');
});
test('RAG retrieval rejects foreign document IDs and filters foreign citations', async () => {
  assert.equal((await request('/api/knowledge/ask', 'POST', { question: '如何换元？', documentIds: [docId] }, other)).status, 404);
  const r = (await request('/api/knowledge/ask', 'POST', { question: '如何换元？', documentIds: [docId] })).data;
  assert.equal(r.generated, true); assert.equal(r.citations.length, 1); assert.deepEqual(r.citations[0].pages, [2]); assert.ok(r.answer.includes('[1]')); assert.ok(!JSON.stringify(r).includes('OTHER USER SECRET'));
});
test('upstream failure is sanitized; empty results and AI failure preserve truthful status', async () => {
  failRetrieve = true; const r = await request('/api/knowledge/ask', 'POST', { question: '测试' }); failRetrieve = false;
  assert.equal(r.status, 502); assert.ok(!JSON.stringify(r).includes('test-rag-key'));
  emptyRetrieve = true; const empty = (await request('/api/knowledge/ask', 'POST', { question: '没有的内容' })).data; emptyRetrieve = false;
  assert.equal(empty.generated, false); assert.equal(empty.citations.length, 0);
  aiDown = true; const down = (await request('/api/knowledge/ask', 'POST', { question: '测试' })).data; aiDown = false;
  assert.equal(down.generated, false); assert.equal(down.citations.length, 1);
});
test('MinerU V1 upload, polling and text output integrate; Office uses flash tier', async () => {
  const pdf = await upload('test.pdf', '%PDF-1.7 test file'); await waitDoc(pdf); assert.ok(uploadedBytes.equals(Buffer.from('%PDF-1.7 test file'))); assert.equal(tier, 'basic');
  const office = await upload('test.docx', 'zip placeholder'); await waitDoc(office); assert.equal(tier, 'flash');
});
test('failed index is retryable without duplicate uploads', async () => {
  failIndex = true; const id = await upload('retry.md'); await waitDoc(id, 'failed'); const count = uploadCount;
  failIndex = false; await request('/api/knowledge/refresh', 'POST', { id }); await waitDoc(id); assert.equal(uploadCount, count); assert.ok(indexCount > 1);
});
test('delete removes both remote index and local source and enforces ownership', async () => {
  const d = (await request('/api/knowledge/documents')).data.documents.find(d => d.id === docId);
  assert.equal((await request('/api/knowledge/document?id=' + docId, 'DELETE', undefined, other)).status, 404);
  assert.equal((await request('/api/knowledge/document?id=' + docId, 'DELETE')).status, 200);
  assert.equal(remote.has(d.ragDocumentId), false); assert.equal(fs.existsSync(path.join(temp, 'uploads', uid, docId)), false);
  assert.equal((await request('/api/knowledge/text?id=' + docId)).status, 404);
});
test('pending records after restart become retryable and saved state is durable', async () => {
  const store = require('../lib/store'); const s = store.get('integrations', uid);
  s.documents.push({ id: 'interrupted', filename: 'interrupted.md', status: 'parsing', markdown: '' }); store.set('integrations', uid, s);
  const d = (await request('/api/knowledge/documents')).data.documents.find(d => d.id === 'interrupted'); assert.equal(d.status, 'failed');
  const persisted = JSON.parse(fs.readFileSync(path.join(temp, 'integrations.json'), 'utf8')); assert.equal(persisted[uid].cards['7036'].version, 1);
});
test('unconfigured clients fail explicitly and MinerU rejects third-party upload URLs', async () => {
  const { RagflowClient } = require('../integrations/ragflow'); const { MineruClient } = require('../integrations/mineru');
  await assert.rejects(new RagflowClient({ baseUrl: '', apiKey: '', timeoutMs: 100 }).createDataset('x'), e => e.statusCode === 503);
  await assert.rejects(new MineruClient({ baseUrl: '', apiKey: '', timeoutMs: 100 }).parse('x.pdf', Buffer.from('x')), e => e.statusCode === 503);
  const fake = http.createServer((req, res) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ id: 'up', upload_url: 'https://untrusted.invalid/upload', status: 'pending' })); }); await listen(fake);
  try { await assert.rejects(new MineruClient({ baseUrl: 'http://127.0.0.1:' + fake.address().port, apiKey: 'private', timeoutMs: 300, pollMs: 10 }).parse('x.pdf', Buffer.from('x')), e => e.statusCode === 502); } finally { await close(fake); }
});
