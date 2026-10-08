'use strict';
const { questions } = require('../integrations/questions');
const { edges } = require('./topics');
const { run } = require('./engine');
const crypto = require('node:crypto');
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
const clone = x => JSON.parse(JSON.stringify(x));
module.exports = function ({ route, authUser, sendJson, readBody, store, syncReviews }) {
  const cache = new Map();
  const topicNames = [...new Set([...questions.values()].map(q => q.topic))];
  const state = uid => clone(store.get('learning', uid, { boards: {}, experiments: [], plan: null }));
  const save = (uid, value) => store.set('learning', uid, value);
  function own(method, endpoint, handler) {
    route(method, '/api/learning/' + endpoint, async (req, res) => {
      const user = authUser(req);
      if (!user) return sendJson(res, 401, { ok: false, error: '请先登录云端账号' });
      try {
        const body = method === 'GET' ? {} : JSON.parse(await readBody(req, 3) || '{}');
        const query = new URL(req.url, 'http://localhost').searchParams;
        const result = await handler(user.id, body, query);
        sendJson(res, 200, { ok: true, ...result });
      } catch (e) { sendJson(res, e.status || (e instanceof SyntaxError ? 400 : 500), { ok: false, error: e.status ? e.message : e instanceof SyntaxError ? '请求格式错误' : '学习数据处理失败' }); }
    });
  }
  function observations(uid) {
    const answers = store.get('userData', uid, {}).payload?.answers || [];
    const events = store.get('integrations', uid, {}).events || [];
    const rows = [];
    for (const a of answers) {
      const q = questions.get(String(a.qid));
      if (!q || q.selfAssessed || a.type === 'FSRS复习' || typeof a.correct !== 'boolean' || !Number.isFinite(a.timeMs)) continue;
      rows.push({ topic: q.topic, correct: a.correct, at: a.timeMs, qid: q.id });
    }
    for (const e of events) {
      const q = questions.get(String(e.qid));
      if (!q || q.selfAssessed || typeof e.result?.correct !== 'boolean') continue;
      const at = new Date(e.at).getTime();
      if (Number.isFinite(at)) rows.push({ topic: q.topic, correct: e.result.correct, at, qid: q.id });
    }
    return rows.sort((a,b) => a.at - b.at).slice(-10000);
  }
  async function mastery(uid) {
    const rows = observations(uid);
    const hash = crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');
    const entry = cache.get(uid);
    if (entry?.hash === hash && entry.expires > Date.now()) return entry.promise;
    const promise = run({ action: 'mastery', observations: rows });
    if (cache.size > 100) cache.delete(cache.keys().next().value);
    cache.set(uid, { hash, promise, expires: Date.now() + 60000 });
    try { return await promise; } catch (e) { cache.delete(uid); throw e; }
  }
  function topics(uid) {
    const mistakes = store.get('userData', uid, {}).payload?.mistakes || [];
    return topicNames.map(name => {
      const bank = [...questions.values()].filter(q => q.topic === name);
      return { id: name, subject: bank[0].subject, total: bank.length, objective: bank.filter(q => !q.selfAssessed).length, mistakes: mistakes.filter(m => questions.get(String(m.qid))?.topic === name).length,
        samples: bank.slice(0, 8).map(q => ({ id:q.id, question:q.question, topic:q.topic, selfAssessed:q.selfAssessed })) };
    });
  }
  own('GET', 'map', uid => ({ topics: topics(uid), edges, relationSource: '课程先修关系，可在 server/learning/topics.js 修改' }));
  own('GET', 'twin', async uid => {
    const local = store.get('userData', uid, {}).payload || {}, learning = state(uid), integrated = syncReviews(uid);
    let bkt = null, modelError = null;
    try { bkt = await mastery(uid); } catch(e) { modelError = e.status ? e.message : '掌握模型暂不可用'; }
    const cards = Object.values(integrated.cards || {}), daily = Object.values(store.get('studyDaily',uid,{}));
    const social=store.get('community','main',{friends:{},requests:[],posts:[],challenges:[]});
    return { generatedAt:new Date().toISOString(), topics:topics(uid), edges, mastery:bkt, modelError,
      activity:{ answers:(local.answers || []).length, mistakes:(local.mistakes || []).length, cleared:(local.cleared || []).length,
        reviews:cards.length, due:cards.filter(c=>new Date(c.card?.due).getTime()<=Date.now()).length,
        focusMinutes:daily.reduce((sum,d)=>sum+(Number(d.focusMinutes)||0),0),
        documents:(integrated.documents || []).length, readyDocuments:(integrated.documents || []).filter(d=>d.status==='ready').length,
        boards:Object.keys(learning.boards).length, experiments:learning.experiments.length,
        friends:Object.values(social.friends).filter(f=>f.members.includes(uid)).length,
        friendRequests:social.requests.filter(r=>r.to===uid&&r.status==='pending').length,
        ownPosts:social.posts.filter(p=>p.author===uid&&!p.deleted).length,
        challenges:social.challenges.filter(c=>c.members.includes(uid)&&c.status==='active'&&c.expiresAt>Date.now()&&!c.sessions[uid]?.finishedAt).length,
        planned:(learning.plan?.scheduled || []).filter(t=>!t.done).length, completed:(learning.plan?.scheduled || []).filter(t=>t.done).length },
      plan:learning.plan ? { scheduled:learning.plan.scheduled, unscheduled:learning.plan.unscheduled, version:learning.plan.version } : null };
  });
  own('GET', 'mastery', uid => mastery(uid));
  own('GET', 'status', async () => ({ ...(await run({ action:'health' })), mathRuntime:'local Pyodide', whiteboard:'Excalidraw' }));
  function qid(value) { const id = String(value || ''); if (!questions.has(id)) fail('请选择题库中的题目'); return id; }
  own('GET', 'board', (uid, _, query) => {
    const id = qid(query.get('id'));
    return { qid:id, board:state(uid).boards[id] || { version:0, elements:[], appState:{}, files:{} } };
  });
  own('PUT', 'board', (uid, body) => {
    const id = qid(body.qid), s = state(uid), existing = s.boards[id];
    if (body.version !== (existing?.version || 0)) fail('白板已在其他窗口更新。请导出当前草稿，再重新打开最新版本。', 409);
    if (!Array.isArray(body.elements) || body.elements.length > 1500 || body.elements.some(e => !e || typeof e.id !== 'string' || typeof e.type !== 'string')) fail('白板元素格式错误或超过 1500 个');
    if (Buffer.byteLength(JSON.stringify(body)) > 2 * 1024 * 1024) fail('白板超过 2 MB，请缩小图片后保存');
    const files = body.files || {};
    if (typeof files !== 'object' || Array.isArray(files) || Object.keys(files).length > 20) fail('白板图片格式错误');
    for (const file of Object.values(files)) if (!file || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(file.dataURL || '')) fail('白板只支持 PNG、JPEG、WebP 图片');
    const raw = body.appState || {}, appState = {};
    for (const key of ['viewBackgroundColor','currentItemStrokeColor','currentItemBackgroundColor','currentItemFontFamily','currentItemFontSize','scrollX','scrollY','zoom']) if (raw[key] !== undefined) appState[key] = raw[key];
    s.boards[id] = { version:(existing?.version || 0) + 1, elements:body.elements, appState, files, updatedAt:new Date().toISOString() };
    save(uid, s); return { qid:id, version:s.boards[id].version, updatedAt:s.boards[id].updatedAt };
  });
  own('GET', 'experiments', uid => ({ experiments:state(uid).experiments.map(({ code, output, images, ...meta }) => meta) }));
  own('GET', 'experiment', (uid, _, query) => {
    const experiment = state(uid).experiments.find(e => e.id === query.get('id'));
    if (!experiment) fail('实验不存在', 404); return { experiment };
  });
  own('POST', 'experiment', (uid, body) => {
    if (typeof body.code !== 'string' || body.code.length > 20000 || typeof body.output !== 'string' || body.output.length > 100000) fail('代码或输出长度超过限制');
    if (!Array.isArray(body.images) || body.images.length > 3 || body.images.some(x => typeof x !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(x))) fail('实验图片格式错误');
    if (Buffer.byteLength(JSON.stringify(body)) > 2 * 1024 * 1024) fail('实验超过 2 MB，请减少图像尺寸');
    const experiment = { id:crypto.randomUUID(), title:String(body.title || '数学实验').slice(0,80), qid:body.qid ? qid(body.qid) : null, code:body.code, output:body.output, images:body.images, createdAt:new Date().toISOString() };
    const s = state(uid); if (s.experiments.length >= 50) fail('已保存 50 个实验，请先删除旧实验');
    s.experiments.unshift(experiment); save(uid,s); return { experiment };
  });
  own('DELETE', 'experiment', (uid, body) => { const s = state(uid); s.experiments = s.experiments.filter(e => e.id !== body.id); save(uid,s); return {}; });
  const shanghaiDate = () => new Date(Date.now() + 8*3600000).toISOString().slice(0,10);
  const dateValue = value => { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value+'T00:00:00Z')) || new Date(value+'T00:00:00Z').toISOString().slice(0,10) !== value) fail('日期格式错误'); return value; };
  const minutes = value => { if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) fail('时间格式错误'); const [h,m] = value.split(':').map(Number); return h*60+m; };
  own('GET', 'plan', uid => ({ plan:state(uid).plan }));
  own('POST', 'plan', async (uid, body) => {
    const initial = state(uid), version = initial.plan?.version || 0;
    if (body.version !== version) fail('计划已更新，请先刷新计划',409);
    const config = body.config || {}, startDate = dateValue(config.startDate), examDate = dateValue(config.examDate);
    if (startDate < shanghaiDate() || examDate < startDate) fail('计划开始日期须为今天或以后，截止日期不能早于开始日期');
    const days = Math.round((Date.parse(examDate)-Date.parse(startDate))/86400000)+1;
    if (days > 30) fail('每次最多安排 30 天，临近考试再滚动更新');
    const startMinute = minutes(config.startTime), endMinute = minutes(config.endTime);
    if (endMinute <= startMinute || endMinute-startMinute > 240) fail('每天请选择不超过 4 小时的连续学习时间');
    const blocked = config.blocked || [];
    if (!Array.isArray(blocked) || blocked.length > 100) fail('占用时间最多 100 段');
    const busy = blocked.map(b => { const date = dateValue(b.date), from = minutes(b.start), to = minutes(b.end); if (to<=from) fail('占用时间结束须晚于开始'); return { date, from, to }; });
    const completed = (initial.plan?.scheduled || []).filter(t=>t.done), completedIds = new Set(completed.map(t=>t.id));
    const slots = [];
    for (let d=0; d<days; d++) {
      const date = new Date(Date.parse(startDate)+d*86400000).toISOString().slice(0,10);
      for (let m=startMinute; m+20<=endMinute; m+=25) {
        if (busy.some(b => b.date===date && m<b.to && m+20>b.from)) continue;
        const start = new Date(date+'T00:00:00+08:00').getTime()+m*60000;
        if (start<=Date.now()) continue;
        if (completed.some(t=>start<new Date(t.end).getTime() && start+20*60000>new Date(t.start).getTime())) continue;
        slots.push({ date, start:new Date(start).toISOString(), end:new Date(start+20*60000).toISOString() });
      }
    }
    const model = await mastery(uid);
    const selected = Array.isArray(config.topics) && config.topics.length ? config.topics : topicNames;
    if (selected.some(t=>!topicNames.includes(t))) fail('计划主题不存在');
    const meta = topics(uid).filter(t=>selected.includes(t.id));
    const tasks = [];
    const cards = store.get('integrations',uid,{}).cards || {};
    for (const [id,c] of Object.entries(cards)) {
      const q = questions.get(id);
      if (!q || !selected.includes(q.topic) || new Date(c.card?.due).getTime()>Date.now()) continue;
      tasks.push({ id:'review-'+id, qid:id, topic:q.topic, label:'到期错题复习', priority:100, reason:'FSRS 已到期' });
      if (tasks.length>=30) break;
    }
    for (const t of meta) {
      const p = model.topics[t.id], priority = p ? Math.round((1-p.mastery)*60)+20 : 35;
      tasks.push({ id:'topic-'+t.id, topic:t.id, label:'专项练习', qid:t.samples[0].id, priority:Math.min(95,priority+Math.min(15,t.mistakes*3)), reason:p ? '掌握估计 '+Math.round(p.mastery*100)+'% · '+t.mistakes+' 道错题' : '暂无客观作答数据，先诊断基础' });
    }
    const result = await run({ action:'schedule', tasks:tasks.filter(t=>!completedIds.has(t.id)), slots, edges });
    const latest = state(uid); if ((latest.plan?.version || 0)!==version) fail('计算期间计划发生变化，请重新生成',409);
    latest.plan = { ...result, config:{...config,startDate,examDate}, version:version+1, scheduled:[...completed,...result.scheduled].sort((a,b)=>a.start.localeCompare(b.start)), createdAt:new Date().toISOString() };
    save(uid,latest); return { plan:latest.plan };
  });
  own('PUT', 'plan/task', (uid, body) => {
    const s = state(uid), plan = s.plan;
    if (!plan) fail('尚未生成计划',404);
    if (body.version!==plan.version) fail('计划已更新，请刷新后操作',409);
    const task = plan.scheduled.find(t=>t.id===body.id);
    if (!task || typeof body.done!=='boolean') fail('任务格式错误');
    task.done = body.done; plan.version++; save(uid,s); return { plan };
  });
};
