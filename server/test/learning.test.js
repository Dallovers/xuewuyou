'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { run } = require('../learning/engine');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'xwy-learning-test-'));
let server, integrations, base, token, other;
async function req(endpoint,method='GET',body,session=token){const r=await fetch(base+'/api/learning/'+endpoint,{method,headers:{'Content-Type':'application/json',...(session?{Authorization:'Bearer '+session}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return{status:r.status,...await r.json()};}
async function putAnswers(answers){return fetch(base+'/api/data',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({data:{answers,mistakes:[]}})});}
before(async()=>{
  process.env.DATA_DIR=temp;process.env.JWT_SECRET='learning-test-secret';
  ({server,integrations}=require('../server'));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
  async function register(username){return(await(await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'test123456'})})).json()).token;}
  token=await register('学习测试甲');other=await register('学习测试乙');
});
after(async()=>{await integrations.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});});
test('real pyBKT posterior matches Bayesian update and missing probe does not add an answer',async()=>{
  const a=await run({action:'mastery',observations:[{topic:'limit',correct:true,at:1},{topic:'limit',correct:true,at:2}]});
  assert.ok(Math.abs(a.topics.limit.mastery-.82)<1e-9);assert.equal(a.count,2);
  const b=await run({action:'mastery',observations:[{topic:'limit',correct:false,at:1}]});
  assert.ok(b.topics.limit.mastery<.2);assert.deepEqual(a.parameters,{prior:.2,learns:.1,forgets:0,guesses:.25,slips:.1});
});
test('map uses bundled bank; mastery rejects self-assessed and duplicate FSRS mirror records',async()=>{
  assert.equal((await req('map','GET',undefined,'')).status,401);
  const map=await req('map');assert.equal(map.topics.length,25);assert.equal(map.topics.reduce((n,t)=>n+t.total,0),1793);
  await putAnswers([{qid:'7036',topic:'forged topic',correct:true,timeMs:Date.now()},{qid:'7036',correct:true,type:'FSRS复习',timeMs:Date.now()+1},{qid:'unknown',correct:true,timeMs:Date.now()+2}]);
  const m=await req('mastery');assert.equal(m.engine,'pyBKT');assert.equal(m.count,1);assert.equal(m.topics['函数与极限'].observations,1);
  assert.equal((await req('mastery','GET',undefined,other)).count,0);
});
test('boards are separated by user and question, preserve images, and reject stale saves',async()=>{
  const data={qid:'7036',version:0,elements:[{id:'rectangle-1',type:'rectangle',x:10,y:20,width:100,height:60}],appState:{zoom:{value:1},collaborators:{private:true}},files:{}};
  assert.equal((await req('board','PUT',data)).version,1);assert.equal((await req('board','PUT',data)).status,409);
  const own=await req('board?id=7036');assert.equal(own.board.elements.length,1);assert.equal(own.board.appState.collaborators,undefined);
  assert.equal((await req('board?id=7036','GET',undefined,other)).board.elements.length,0);
  const {questions}=require('../integrations/questions');const otherQ=[...questions.keys()].find(x=>x!=='7036');assert.equal((await req('board?id='+otherQ)).board.elements.length,0);
  assert.equal((await req('board','PUT',{...data,version:1,files:{x:{dataURL:'https://example.com'}}})).status,400);
});
test('experiments store snapshots without executing code and stay private',async()=>{
  const saved=await req('experiment','POST',{title:'线代实验',code:'raise Exception("do not execute")',output:'2, 3',images:[],qid:'7036'});
  assert.ok(saved.experiment.id);assert.equal((await req('experiment?id='+saved.experiment.id)).experiment.output,'2, 3');
  assert.equal((await req('experiment?id='+saved.experiment.id,'GET',undefined,other)).status,404);
  assert.equal((await req('experiments','GET',undefined,other)).experiments.length,0);
  await req('experiment','DELETE',{id:saved.experiment.id});assert.equal((await req('experiments')).experiments.length,0);
});
test('a real FSRS answer counts once and future reviews are excluded from planning',async()=>{
  const headers={'Content-Type':'application/json',Authorization:'Bearer '+token};
  await fetch(base+'/api/data',{method:'PUT',headers,body:JSON.stringify({data:{mistakes:[{qid:'7036',question:'函数与极限'}]}})});
  const queue=await(await fetch(base+'/api/reviews/queue',{headers})).json();const card=queue.cards.find(c=>c.qid==='7036');assert.ok(card);
  const result=await(await fetch(base+'/api/reviews/answer',{method:'POST',headers,body:JSON.stringify({qid:'7036',version:card.version,eventId:'learning-real-fsrs-1',rating:3,answer:'C'})})).json();assert.equal(result.correct,true);
  await putAnswers([{qid:'7036',type:'FSRS复习',correct:true,timeMs:Date.now()}]);
  const m=await req('mastery');assert.equal(m.count,2);
});
test('campus twin reflects private records, board saves and focus time and follows new answers',async()=>{
  assert.equal((await req('twin','GET',undefined,'')).status,401);
  const headers={'Content-Type':'application/json',Authorization:'Bearer '+token};
  await fetch(base+'/api/study/stats',{method:'PUT',headers,body:JSON.stringify({day:'2026-10-08',focusMinutes:25,completed:1})});
  const before=await req('twin');assert.equal(before.status,200);assert.equal(before.activity.boards,1);assert.equal(before.activity.focusMinutes,25);assert.equal(before.mastery.count,2);
  await putAnswers([{qid:'7036',correct:true,timeMs:Date.now()},{qid:'7036',correct:false,timeMs:Date.now()+1}]);
  const after=await req('twin');assert.equal(after.activity.answers,before.activity.answers+2);assert.equal(after.mastery.count,before.mastery.count+2);assert.equal(after.topics.length,25);
  const separate=await req('twin','GET',undefined,other);assert.equal(separate.activity.boards,0);assert.equal(separate.activity.focusMinutes,0);assert.equal(separate.mastery.count,0);assert.equal(separate.plan,null);
  await fetch(base+'/api/data',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+other},body:JSON.stringify({data:{mistakes:[{qid:'7036',question:'函数与极限'}]}})});
  const fresh=await req('twin','GET',undefined,other);assert.equal(fresh.activity.due,1);assert.equal(fresh.activity.reviews,1);assert.equal(fresh.mastery.count,0);
});
test('real OR-Tools chooses urgent tasks, handles zero capacity, and has no overlaps',async()=>{
  const tasks=[{id:'low',priority:1},{id:'urgent',priority:100}],slots=[{start:'2030-01-01T10:00:00Z',end:'2030-01-01T10:20:00Z'}];
  const r=await run({action:'schedule',tasks,slots});assert.equal(r.engine,'OR-Tools CP-SAT');assert.equal(r.scheduled[0].id,'urgent');assert.equal(r.unscheduled[0].id,'low');
  const z=await run({action:'schedule',tasks,slots:[]});assert.equal(z.scheduled.length,0);assert.equal(z.unscheduled.length,2);
});
test('plan skips busy intervals, preserves completed work, and enforces optimistic concurrency',async()=>{
  const tomorrow=new Date(Date.now()+86400000+8*3600000).toISOString().slice(0,10);
  const config={startDate:tomorrow,examDate:tomorrow,startTime:'18:00',endTime:'20:00',blocked:[{date:tomorrow,start:'18:00',end:'19:00'}],topics:['函数与极限','导数与微分','一元积分','重积分']};
  const r=await req('plan','POST',{version:0,config});assert.equal(r.status,200);assert.equal(r.plan.scheduled.length,2);assert.equal(r.plan.unscheduled.length,2);
  r.plan.scheduled.forEach(t=>assert.ok(new Date(t.start).getTime()>=new Date(tomorrow+'T19:00:00+08:00').getTime()));
  const completed=await req('plan/task','PUT',{version:r.plan.version,id:r.plan.scheduled[0].id,done:true});assert.equal(completed.plan.version,2);
  assert.equal((await req('plan','POST',{version:1,config})).status,409);
  const rebuilt=await req('plan','POST',{version:2,config});assert.ok(rebuilt.plan.scheduled.some(t=>t.id===r.plan.scheduled[0].id&&t.done));
  assert.equal(new Set(rebuilt.plan.scheduled.map(t=>t.start)).size,rebuilt.plan.scheduled.length);
  const wrong=await req('plan','POST',{version:3,config:{...config,startTime:'22:00',endTime:'21:00'}});assert.equal(wrong.status,400);
  const invalid=await req('plan','POST',{version:3,config:{...config,examDate:'2026-13-40'}});assert.equal(invalid.status,400);
  assert.equal((await req('plan','GET',undefined,other)).plan,null);
});
