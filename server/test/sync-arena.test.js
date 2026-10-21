'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'xwy-sync-arena-'));delete process.env.DATABASE_URL;process.env.DATA_DIR=temp;process.env.JWT_SECRET='sync-arena-isolated-test';
const {questions}=require('../integrations/questions');let app,store,base,a,b,outsider,id;
async function req(user,p,method='GET',body,prefix='/api/community/'){const r=await fetch(base+prefix+p,{method,headers:{'Content-Type':'application/json',...(user?{Authorization:'Bearer '+user.token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {http:r.status,...await r.json()};}
async function create(requestId='request-'+crypto.randomUUID()){return req(a,'challenges','POST',{to:b.user.id,topic:'函数与极限',mode:'sync',requestId});}
async function data(u){return (await req(u,'data','GET',null,'/api/')).data;}
function mutate(id,fn){const s=store.get('community','main');fn(s.challenges.find(c=>c.id===id));store.set('community','main',s);}
function running(id){mutate(id,c=>{c.startsAt=Date.now()-100;c.deadlineAt=c.startsAt+15*60000;for(const m of c.members)c.sessions[m].startedAt=c.startsAt;});}
async function startNew(){const r=await create(),id=r.challenge.id;await req(b,'challenge/accept','POST',{id});await req(a,'challenge/ready','POST',{id,ready:true});await req(b,'challenge/ready','POST',{id,ready:true});running(id);return id;}
before(async()=>{app=require('../server');store=require('../lib/store');await app.start(0,'127.0.0.1');base='http://127.0.0.1:'+app.server.address().port;[a,b,outsider]=await Promise.all(['同步甲','同步乙','旁观丙'].map(username=>req(null,'register','POST',{username,password:'Test123456'},'/api/auth/')));for(const u of [a,b])await req(u,'profile','PUT',{nick:u.user.username,visible:true,subjects:['高等数学'],goal:'',availability:''});const invite=await req(a,'request','POST',{to:b.user.id});await req(b,'request','PUT',{id:invite.request.id,action:'accept'});});
after(async()=>{await app.studyRooms.close();await app.integrations.close();await app.community.close();await store.close();fs.rmSync(temp,{recursive:true,force:true});});
test('sync invitation is deduplicated, membership protected and answers concealed',async()=>{
 const r=await create('stable-invitation-1');assert.equal(r.http,200);id=r.challenge.id;assert.equal((await req(a,'state','GET',null,'/api/campus/')).locations.find(l=>l.id==='arena').value,1);assert.equal(r.challenge.mode,'sync');assert.equal(r.challenge.status,'invited');
 const duplicate=await create('stable-invitation-1');assert.equal(duplicate.challenge.id,id);
 assert.equal((await req(outsider,'challenge?id='+id)).http,404);assert.equal((await req(null,'challenge?id='+id)).http,401);
 const view=(await req(b,'challenge?id='+id)).challenge;assert.equal(view.questions,undefined);assert.equal(view.review,undefined);assert.equal(view.opponent.answers,undefined);
 assert.equal((await req(a,'challenge/start','POST',{id})).http,409);assert.equal((await req(a,'challenge/ready','POST',{id,ready:true})).http,409);
 assert.equal((await req(a,'challenge/accept','POST',{id})).http,403);
});
test('accept, unready, concurrent ready and retry lock exactly one shared future start',async()=>{
 assert.equal((await req(b,'challenge/accept','POST',{id})).challenge.status,'waiting');await req(b,'challenge/accept','POST',{id});
 await req(a,'challenge/ready','POST',{id,ready:true});await req(a,'challenge/ready','POST',{id,ready:false});
 const waiting=await req(b,'challenge/ready','POST',{id,ready:true});assert.equal(waiting.challenge.status,'waiting');
 const rows=await Promise.all([req(a,'challenge/ready','POST',{id,ready:true}),req(a,'challenge/ready','POST',{id,ready:true})]);assert.equal(rows[0].challenge.startsAt,rows[1].challenge.startsAt);assert.equal(rows[0].challenge.deadlineAt-rows[0].challenge.startsAt,15*60000);
 assert.ok(rows[0].challenge.startsAt>rows[0].challenge.serverNow);assert.equal(rows[0].challenge.questions,undefined);
 assert.equal((await req(a,'challenge/submit','POST',{id,answers:{},expectedVersion:0})).http,409);assert.equal((await req(b,'challenge/ready','POST',{id,ready:false})).http,409);assert.equal((await req(b,'challenge/cancel','PUT',{id})).http,409);
 await new Promise(r=>setTimeout(r,3100));const [av,bv]=await Promise.all([req(a,'challenge?id='+id),req(b,'challenge?id='+id)]);assert.equal(av.challenge.mine.startedAt,bv.challenge.mine.startedAt);assert.deepEqual(av.challenge.questions,bv.challenge.questions);assert.equal(av.challenge.questions.length,5);for(const q of av.challenge.questions){assert.equal(q.answer,undefined);assert.equal(q.analysis,undefined);}
});
test('drafts restore privately, reject stale tabs and invalid answers',async()=>{
 const view=(await req(a,'challenge?id='+id)).challenge,qid=view.questions[0].qid;
 assert.equal((await req(a,'challenge/answers','PUT',{id,answers:{forged:'A'},expectedVersion:0})).http,400);
 const saved=await req(a,'challenge/answers','PUT',{id,answers:{[qid]:'A'},expectedVersion:0});assert.equal(saved.challenge.mine.answerVersion,1);
 const restore=(await req(a,'challenge?id='+id)).challenge;assert.equal(restore.mine.answers[qid],'A');assert.equal((await req(b,'challenge?id='+id)).challenge.opponent.answers,undefined);
 assert.equal((await req(a,'challenge/answers','PUT',{id,answers:{},expectedVersion:0})).http,409);assert.equal((await req(a,'challenge/submit','POST',{id,answers:{},expectedVersion:0})).http,409);
});
test('submission is idempotent and learning cannot leak standard answers before both finish',async()=>{
 const view=(await req(a,'challenge?id='+id)).challenge,answers=Object.fromEntries(view.questions.map((q,i)=>[q.qid,i<3?questions.get(q.qid).answer:questions.get(q.qid).answer==='A'?'B':'A']));
 const rows=await Promise.all([req(a,'challenge/submit','POST',{id,answers,expectedVersion:1}),req(a,'challenge/submit','POST',{id,answers:{},expectedVersion:1})]);assert.equal(rows[0].challenge.mine.score,null);assert.equal(rows[1].recorded,0);assert.equal(rows[0].challenge.review,undefined);assert.equal((await data(a)).answers?.length||0,0);assert.equal((await data(a)).mistakes?.length||0,0);
 const bv=(await req(b,'challenge?id='+id)).challenge,correct=Object.fromEntries(bv.questions.map(q=>[q.qid,questions.get(q.qid).answer]));const done=await req(b,'challenge/submit','POST',{id,answers:correct,expectedVersion:0});assert.equal(done.challenge.status,'completed');assert.equal(done.challenge.mine.score,5);assert.equal(done.challenge.review.length,5);assert.equal(done.challenge.winner,b.user.id);
 assert.equal((await req(a,'state','GET',null,'/api/campus/')).locations.find(l=>l.id==='arena').value,0);assert.equal((await data(a)).answers.length,5);assert.equal((await data(a)).mistakes.length,2);assert.equal((await data(b)).answers.length,5);await req(a,'challenge/submit','POST',{id,answers:{},expectedVersion:0});assert.equal((await data(a)).answers.length,5);
});
test('timeout persists saved drafts for both disconnected users without a client submission',async()=>{
 const next=await startNew(),c=(await req(a,'challenge?id='+next)).challenge,qid=c.questions[0].qid;await req(a,'challenge/answers','PUT',{id:next,answers:{[qid]:questions.get(qid).answer},expectedVersion:0});
 mutate(next,c=>{c.startsAt=Date.now()-15*60000-50;c.deadlineAt=c.startsAt+15*60000;for(const m of c.members)c.sessions[m].startedAt=c.startsAt;});
 await new Promise(r=>setTimeout(r,1200));const saved=store.get('community','main').challenges.find(c=>c.id===next);assert.equal(saved.status,'completed');assert.equal(saved.sessions[a.user.id].score,1);assert.equal(saved.sessions[b.user.id].score,0);assert.ok(saved.sessions[a.user.id].timedOut);assert.equal(saved.sessions[a.user.id].elapsedMs,15*60000);assert.equal((await data(a)).answers.length,10);
});
test('restart recovery repairs partial learning delivery exactly once',async()=>{
 const s=store.get('community','main'),c=s.challenges.find(c=>c.id===id);c.sessions[a.user.id].delivered=false;store.set('community','main',s);const row=store.get('userData',a.user.id);row.payload.answers=row.payload.answers.filter(rec=>!rec.eventId.startsWith('challenge-'+id+'-'));store.set('userData',a.user.id,row);app.community.recover();app.community.recover();assert.equal((await data(a)).answers.length,10);
});
test('cancel, refusal and lobby/invitation expiry are stable on repeats',async()=>{
 const next=(await create()).challenge.id;assert.equal((await req(b,'challenge/cancel','PUT',{id:next})).challenge.status,'cancelled');assert.equal((await req(a,'challenge/cancel','PUT',{id:next})).challenge.status,'cancelled');assert.equal((await req(b,'challenge/accept','POST',{id:next})).http,409);
 const expired=(await create()).challenge.id;mutate(expired,c=>c.expiresAt=Date.now()-1);assert.equal((await req(a,'challenge?id='+expired)).challenge.status,'expired');
 const lobby=(await create()).challenge.id;await req(b,'challenge/accept','POST',{id:lobby});mutate(lobby,c=>c.lobbyExpiresAt=Date.now()-1);assert.equal((await req(a,'challenge?id='+lobby)).challenge.status,'expired');
});
