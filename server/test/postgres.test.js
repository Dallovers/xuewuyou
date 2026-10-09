'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {Pool}=require('pg');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {setTimeout:delay}=require('node:timers/promises');
const {questions}=require('../integrations/questions');
const configured=!!process.env.DATABASE_TEST_URL;
let admin,url,base,child,temp,store,a,b,duel;
const dbName='xwy_test_'+require('node:crypto').randomBytes(8).toString('hex');
async function startServer() {
  const net=require('node:net'),portServer=net.createServer();
  await new Promise(resolve=>portServer.listen(0,'127.0.0.1',resolve));
  const port=portServer.address().port; await new Promise(resolve=>portServer.close(resolve));
  base='http://127.0.0.1:'+port;
  child=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),windowsHide:true,env:{...process.env,DATABASE_URL:url,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:temp,JWT_SECRET:'postgres-integration-test-only-secret',AI_API_KEY:'',RAGFLOW_BASE_URL:'',MINERU_BASE_URL:''},stdio:'ignore'});
  for(let i=0;i<150;i++){if(child.exitCode!==null)throw new Error('数据库测试服务器启动失败');try{if((await fetch(base+'/api/health')).ok)return;}catch{}await delay(100);}
  throw new Error('数据库测试服务器启动超时');
}
async function stopServer(){if(!child||child.exitCode!==null)return;const exited=once(child,'exit');child.kill('SIGTERM');await exited;child=null;}
async function req(who,endpoint,method='GET',body){const r=await fetch(base+endpoint,{method,headers:{'Content-Type':'application/json',...(who?{Authorization:'Bearer '+who.token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return {...await r.json(),status:r.status};}
before(async()=>{
  if(!configured)return;
  const source=new URL(process.env.DATABASE_TEST_URL);
  assert.ok(['127.0.0.1','localhost','[::1]'].includes(source.hostname),'测试只允许本机临时 PostgreSQL，不能指向 Neon 生产数据库');
  admin=new Pool({connectionString:source.href});await admin.query('CREATE DATABASE '+dbName);
  source.pathname='/'+dbName;url=source.href;temp=fs.mkdtempSync(path.join(os.tmpdir(),'xwy-postgres-'));
  process.env.DATABASE_URL=url;process.env.JWT_SECRET='postgres-integration-test-only-secret';
  store=require('../lib/store-postgres'); await store.init(); await startServer();
});
after(async()=>{if(!configured)return;await stopServer();if(store)await store.close();if(admin){await admin.query('DROP DATABASE IF EXISTS '+dbName+' WITH (FORCE)');await admin.end();}if(temp)fs.rmSync(temp,{recursive:true,force:true});});
test('PostgreSQL rolls back failed writes and serializes competing read-modify-write operations',{skip:!configured},async()=>{
  await assert.rejects(store.run(()=>{store.set('studySetup','rollback',{value:1});throw new Error('expected rollback');}),/expected rollback/);
  await store.run(()=>assert.equal(store.get('studySetup','rollback'),undefined));
  await Promise.all(Array.from({length:12},()=>store.run(async()=>{const n=store.get('studyDaily','counter',0);await delay(3);store.set('studyDaily','counter',n+1);}))); 
  await store.run(()=>assert.equal(store.get('studyDaily','counter'),12));
  await assert.rejects(store.run(()=>store.set('studySetup','readOnly',1),{readOnly:true}),/只读/);
  let emitted=false;await store.run(()=>{store.set('studySetup','cancelled',1);store.afterCommit(()=>{emitted=true;});},{commit:()=>false});
  assert.equal(emitted,false);await store.run(()=>assert.equal(store.get('studySetup','cancelled'),undefined));
});
test('Accounts, social activity, experiments, boards and uploaded source files survive a backend restart',{skip:!configured},async()=>{
  const same=await Promise.all([req(null,'/api/auth/register','POST',{username:'同名账号',password:'Test123456'}),req(null,'/api/auth/register','POST',{username:'同名账号',password:'Test123456'})]);
  assert.deepEqual(same.map(x=>x.status).sort(),[200,409]);
  a=await req(null,'/api/auth/register','POST',{username:'云端甲',password:'Test123456'});b=await req(null,'/api/auth/register','POST',{username:'云端乙',password:'Test123456'});
  for(const who of[a,b])assert.equal((await req(who,'/api/community/profile','PUT',{nick:who.user.nick,visible:true,subjects:['高等数学'],goal:'一起备考',availability:'晚间'})).status,200);
  const invitation=await req(a,'/api/community/request','POST',{to:b.user.id});assert.equal((await req(b,'/api/community/request','PUT',{id:invitation.request.id,action:'accept'})).status,200);
  await Promise.all(Array.from({length:6},(_,i)=>req(i%2?a:b,'/api/community/posts','POST',{text:'持久留言'+i})));
  const created=await req(a,'/api/community/challenges','POST',{to:b.user.id,topic:'函数与极限'});duel=created.challenge.id;
  for(const who of[a,b]){const started=await req(who,'/api/community/challenge/start','POST',{id:duel});const answers=Object.fromEntries(started.challenge.questions.map(q=>[q.qid,questions.get(q.qid).answer]));assert.equal((await req(who,'/api/community/challenge/submit','POST',{id:duel,answers})).status,200);}
  assert.equal((await req(a,'/api/learning/board','PUT',{qid:'7036',version:0,elements:[],appState:{viewBackgroundColor:'#abcdef'},files:{}})).status,200);
  assert.equal((await req(a,'/api/learning/experiment','POST',{title:'积分实验',qid:'7036',code:'print(42)',output:'42',images:[]})).status,200);
  const doc=await req(a,'/api/knowledge/upload','POST',{filename:'讲义.md',base64:Buffer.from('# 持久资料\n积分换元').toString('base64')});assert.equal(doc.status,202);
  for(let i=0;i<100;i++){const list=await req(a,'/api/knowledge/documents');if(list.documents[0].status==='parsed')break;await delay(20);}
  await stopServer();fs.rmSync(temp,{recursive:true,force:true});fs.mkdirSync(temp);await startServer();
  assert.equal((await req(a,'/api/auth/me')).status,200);
  assert.equal((await req(a,'/api/community/home')).friends.length,1);
  assert.equal((await req(a,'/api/community/posts')).posts.length,6);
  assert.equal((await req(a,'/api/community/challenge?id='+duel)).challenge.status,'completed');
  assert.equal((await req(a,'/api/data')).data.answers.length,5);
  assert.equal((await req(a,'/api/learning/board?id=7036')).board.appState.viewBackgroundColor,'#abcdef');
  assert.equal((await req(a,'/api/learning/experiments')).experiments[0].title,'积分实验');
  assert.match((await req(a,'/api/knowledge/text?id='+doc.document.id)).markdown,/积分换元/);
  await store.run(async()=>assert.match((await store.getFile(a.user.id,doc.document.id)).toString(),/积分换元/));
  const retried=await req(a,'/api/community/challenge/submit','POST',{id:duel,answers:{}});assert.equal(retried.recorded,0);
  assert.equal((await req(a,'/api/data')).data.answers.length,5);
  assert.equal((await req(b,'/api/knowledge/text?id='+doc.document.id)).status,404);
});
