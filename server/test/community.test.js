'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const {spawn}=require('node:child_process');const {once}=require('node:events');
const {io}=require('socket.io-client');const {questions}=require('../integrations/questions');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'xwy-community-test-'));
let server,community,integrations,base,a,b,c,invitation,duel,qa,qb,sa,sb,sc,child;
async function req(who,endpoint,method='GET',body,prefix='/api/community/'){const r=await fetch(base+prefix+endpoint,{method,headers:{'Content-Type':'application/json',...(who?{Authorization:'Bearer '+who.token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,...await r.json()};}
async function register(username){return req(null,'register','POST',{username,password:'Test123456'},'/api/auth/');}
const card=(nick,visible)=>({nick,visible,subjects:['高等数学'],goal:'准备期末',availability:'晚上七点'});
before(async()=>{process.env.DATA_DIR=temp;process.env.JWT_SECRET='community-test-secret';({server,community,integrations}=require('../server'));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;a=await register('搭子甲');b=await register('搭子乙');c=await register('搭子丙');assert.ok(a.token&&b.token&&c.token);});
after(async()=>{for(const socket of [sa,sb,sc])socket?.disconnect();if(child){child.kill();await once(child,'exit');}await integrations.close();await community.close();fs.rmSync(temp,{recursive:true,force:true});});
test('campus profiles are opt-in, authenticated and exclude private records',async()=>{
  assert.equal((await req(null,'home')).status,401);assert.equal((await req(null,'profile','PUT',card('匿名',true))).status,401);
  await req(a,'profile','PUT',card('甲的公开名片',true));await req(b,'profile','PUT',card('乙的公开名片',true));await req(c,'profile','PUT',card('丙的私有名片',false));
  const home=await req(a,'home');assert.equal(home.directory.length,1);assert.equal(home.directory[0].id,b.user.id);assert.equal(home.directory[0].password,undefined);assert.equal(home.directory[0].answers,undefined);assert.ok(home.topics.every(t=>t.count>=5));
  assert.equal((await req(a,'home?subject=雅思')).directory.length,0);assert.equal((await req(a,'request','POST',{to:c.user.id})).status,404);
});
test('Socket.IO rejects anonymous connections and routes invitations only to participants',async()=>{
  const anonymous=io(base+'/community',{transports:['websocket'],reconnection:false});const denied=await once(anonymous,'connect_error');assert.match(denied[0].message,/登录/);anonymous.disconnect();
  [sa,sb,sc]=[a,b,c].map(who=>io(base+'/community',{auth:{token:who.token},transports:['websocket'],reconnection:false}));await Promise.all([sa,sb,sc].map(socket=>once(socket,'connect')));
  const unauthorized=[];sc.on('community:changed',e=>unauthorized.push(e));const delivered=once(sb,'community:changed');
  const outcomes=await Promise.all([req(a,'request','POST',{to:b.user.id,message:'一起学极限'}),req(a,'request','POST',{to:b.user.id,message:'一起学极限'})]);assert.equal(outcomes[0].request.id,outcomes[1].request.id);invitation=outcomes[0].request;
  assert.equal((await delivered)[0].kind,'friends');await new Promise(resolve=>setTimeout(resolve,50));assert.deepEqual(unauthorized,[]);
});
test('only the recipient accepts requests and accepted buddies can be challenged',async()=>{
  assert.equal((await req(c,'request','PUT',{id:invitation.id,action:'accept'})).status,404);assert.equal((await req(a,'request','PUT',{id:invitation.id,action:'accept'})).status,403);
  assert.equal((await req(b,'request','PUT',{id:invitation.id,action:'accept'})).status,'accepted');
  assert.equal((await req(a,'home')).friends[0].id,b.user.id);assert.equal((await req(b,'home')).friends[0].id,a.user.id);
  assert.equal((await req(a,'challenges','POST',{to:c.user.id,topic:'函数与极限'})).status,403);
});
test('question discussions support scoped replies, owner deletion and safe Markdown',async()=>{
  const saved=await req(a,'posts','POST',{qid:'7036',text:'**先求极限**\n<script>alert(1)</script>\n[坏链接](javascript:alert(1))'});assert.equal(saved.status,200);
  const reply=await req(b,'posts','POST',{qid:'7036',parent:saved.post.id,text:'我补充一个方法'});assert.equal(reply.post.parent,saved.post.id);
  assert.equal((await req(a,'posts')).posts.length,0);assert.equal((await req(a,'posts?qid=7036')).posts.length,2);
  assert.equal((await req(b,'posts','POST',{parent:saved.post.id,text:'不同范围'})).status,404);assert.equal((await req(b,'posts','DELETE',{id:saved.post.id})).status,403);
  assert.equal(saved.post.author.goal,undefined);
  const parser=require('markdown-it')({html:false,linkify:false});const rendered=parser.render(saved.post.text);assert.ok(!rendered.includes('<script>'));assert.ok(!rendered.includes('href="javascript:'));
  await req(a,'posts','DELETE',{id:saved.post.id});const all=await req(b,'posts?qid=7036');assert.equal(all.posts[0].deleted,true);assert.equal(all.posts[0].text,'');assert.equal(all.posts[1].text,'我补充一个方法');
});
test('challenge questions are identical, private and do not reveal solutions before completion',async()=>{
  const created=await req(a,'challenges','POST',{to:b.user.id,topic:'函数与极限'});assert.equal(created.status,200);duel=created.challenge.id;
  assert.equal((await req(c,'challenge?id='+duel)).status,404);assert.equal((await req(a,'challenge?id='+duel)).challenge.questions,undefined);
  qa=(await req(a,'challenge/start','POST',{id:duel})).challenge;qb=(await req(b,'challenge/start','POST',{id:duel})).challenge;
  assert.equal(qa.questions.length,5);assert.deepEqual(qa.questions,qb.questions);qa.questions.forEach(q=>{assert.equal(q.answer,undefined);assert.equal(q.analysis,undefined);});
  assert.equal((await req(a,'challenge/submit','POST',{id:duel,answers:{forged:'A'}})).status,400);
});
test('server grades once, retains learning records and waits for both submissions before review',async()=>{
  const answers=Object.fromEntries(qa.questions.map((q,i)=>[q.qid,i<3?questions.get(q.qid).answer:questions.get(q.qid).answer==='A'?'B':'A']));
  const [first,retry]=await Promise.all([req(a,'challenge/submit','POST',{id:duel,answers}),req(a,'challenge/submit','POST',{id:duel,answers})]);assert.equal(first.challenge.mine.score,3);assert.equal(retry.recorded,0);assert.equal(first.challenge.review,undefined);assert.equal(first.challenge.opponent.score,undefined);
  const data=await req(a,'data','GET',undefined,'/api/');assert.equal(data.data.answers.length,5);assert.equal(data.data.mistakes.length,2);
  const model=await req(a,'mastery','GET',undefined,'/api/learning/');assert.equal(model.count,5);
  const correct=Object.fromEntries(qb.questions.map(q=>[q.qid,questions.get(q.qid).answer]));const result=await req(b,'challenge/submit','POST',{id:duel,answers:correct});assert.equal(result.challenge.status,'completed');assert.equal(result.challenge.mine.score,5);assert.equal(result.challenge.review.length,5);assert.equal(result.challenge.winner,b.user.id);
  const own=await req(a,'challenge?id='+duel);assert.equal(own.challenge.review.filter(q=>q.correct).length,3);assert.equal(own.challenge.opponent.score,5);
  const twin=await req(a,'twin','GET',undefined,'/api/learning/');assert.equal(twin.activity.friends,1);assert.equal(twin.activity.challenges,0);assert.equal(twin.activity.due,2);
});
test('late submissions time out on the server and started challenges survive refresh',async()=>{
  const created=await req(a,'challenges','POST',{to:b.user.id,topic:'函数与极限'}),id=created.challenge.id;
  const started=await req(a,'challenge/start','POST',{id});const reloaded=await req(a,'challenge/start','POST',{id});assert.equal(started.challenge.mine.startedAt,reloaded.challenge.mine.startedAt);
  const store=require('../lib/store'),s=store.get('community','main');s.challenges.find(x=>x.id===id).sessions[a.user.id].startedAt=Date.now()-16*60000;store.set('community','main',s);
  const answers=Object.fromEntries(started.challenge.questions.map(q=>[q.qid,questions.get(q.qid).answer]));const late=await req(a,'challenge/submit','POST',{id,answers});assert.equal(late.challenge.mine.score,0);assert.equal(late.challenge.mine.elapsedMs,15*60000);
  assert.equal((await req(a,'challenge/cancel','PUT',{id})).status,409);assert.equal((await req(a,'data','GET',undefined,'/api/')).data.answers.length,10);
});
test('restart repairs interrupted learning delivery without duplicate records',async()=>{
  const filename=path.join(temp,'community.json'),saved=JSON.parse(fs.readFileSync(filename,'utf8')),match=saved.main.challenges.find(x=>x.id===duel);match.sessions[a.user.id].delivered=false;fs.writeFileSync(filename,JSON.stringify(saved));
  const dataFile=path.join(temp,'user_data.json'),rows=JSON.parse(fs.readFileSync(dataFile,'utf8'));rows[a.user.id].payload.answers=rows[a.user.id].payload.answers.filter(x=>!x.eventId?.startsWith('challenge-'+duel));fs.writeFileSync(dataFile,JSON.stringify(rows));
  child=spawn(process.execPath,['-e',"const {server}=require('./server');server.listen(0,'127.0.0.1',()=>console.log('PORT:'+server.address().port))"],{cwd:path.join(__dirname,'..'),env:process.env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output='';const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('restart timeout')),10000);child.stdout.on('data',b=>{output+=b;const m=/PORT:(\d+)/.exec(output);if(m){clearTimeout(timer);resolve(m[1]);}});child.on('exit',()=>reject(new Error('restart failed')));});
  const old=base;base='http://127.0.0.1:'+port;const data=await req(a,'data','GET',undefined,'/api/');assert.equal(data.data.answers.length,10);const replay=await req(a,'challenge/submit','POST',{id:duel,answers:{}});assert.equal(replay.recorded,0);assert.equal((await req(a,'data','GET',undefined,'/api/')).data.answers.length,10);base=old;
});
