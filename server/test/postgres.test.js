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
  const studyRoom=await req(a,'/api/study/rooms','POST',{title:'持久自习室',subject:'高等数学',goal:'一起复习极限',duration:5,capacity:2,visibility:'invite'});
  assert.equal(studyRoom.status,200);const roomId=studyRoom.room.id;
  assert.equal((await req(a,'/api/study/rooms/invite','POST',{id:roomId,to:b.user.id})).status,200);
  assert.equal((await req(b,'/api/study/rooms/join','POST',{id:roomId})).status,200);
  for(const [who,instance]of[[a,'postgres-tab-a'],[b,'postgres-tab-b']])assert.equal((await req(who,'/api/study/rooms/member','POST',{id:roomId,instance,visible:true,ready:true,goal:'重启后继续复习'})).status,200);
  const readyRoom=await req(a,'/api/study/rooms/room?id='+roomId);
  const focusing=await req(a,'/api/study/rooms/control','POST',{id:roomId,action:'start',version:readyRoom.room.version});assert.equal(focusing.room.phase,'focus');
  const paused=await req(a,'/api/study/rooms/control','POST',{id:roomId,action:'pause',version:focusing.room.version});assert.equal(paused.room.phase,'paused');
  await stopServer();fs.rmSync(temp,{recursive:true,force:true});fs.mkdirSync(temp);await startServer();
  assert.equal((await req(a,'/api/auth/me')).status,200);
  const savedRoom=await req(a,'/api/study/rooms/room?id='+roomId);assert.equal(savedRoom.room.phase,'paused');assert.equal(savedRoom.room.remainingMs,paused.room.remainingMs);assert.equal(savedRoom.room.members.length,2);assert.equal(savedRoom.room.members[0].goal,'重启后继续复习');
  assert.equal((await req(a,'/api/study/rooms/control','POST',{id:roomId,action:'finish',version:savedRoom.room.version})).room.phase,'ended');
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
test('断点续学会话在 PostgreSQL 下持久化、按用户隔离并保持版本冲突语义',{skip:!configured},async()=>{
  const qids=[...questions.keys()].slice(0,3);
  const created=await req(a,'/api/practice/session','POST',{clientRequestId:'pg-practice-0001',qids,topic:'函数与极限'});
  assert.equal(created.status,200);assert.equal(created.replayed,false);
  const s=created.session;
  const saved=await req(a,'/api/practice/session','PUT',{id:s.id,expectedVersion:s.version,currentIndex:2,drafts:{[qids[0]]:{text:'PG草稿'}}});
  assert.equal(saved.status,200);assert.equal(saved.session.currentIndex,2);
  // 版本冲突在数据库模式下同样成立并且不覆盖进度
  assert.equal((await req(a,'/api/practice/session','PUT',{id:s.id,expectedVersion:s.version,currentIndex:1})).status,409);
  assert.equal((await req(a,'/api/practice/session?id='+s.id)).session.currentIndex,2);
  // 跨用户不可读
  assert.equal((await req(b,'/api/practice/session?id='+s.id)).status,404);
  // 结束后不能被继续保存
  const finished=await req(a,'/api/practice/session/finish','POST',{id:s.id,status:'finished'});
  assert.equal(finished.session.status,'finished');
  assert.equal((await req(a,'/api/practice/session','PUT',{id:s.id,expectedVersion:finished.session.version,currentIndex:0})).status,409);
  // 重启后会话与草稿仍在（真写进了 xwy_state 的 JSONB payload）
  await stopServer();await startServer();
  const again=await req(a,'/api/practice/session?id='+s.id);
  assert.equal(again.status,200);assert.equal(again.session.currentIndex,2);
  assert.equal(again.session.drafts[qids[0]].text,'PG草稿');assert.equal(again.session.status,'finished');
  // 幂等键跨重启有效
  const replay=await req(a,'/api/practice/session','POST',{clientRequestId:'pg-practice-0001',qids});
  assert.equal(replay.replayed,true);assert.equal(replay.session.id,s.id);
});
test('管理员后台在 PostgreSQL 下可用：处罚生效、审计落库、重启后仍在',{skip:!configured},async()=>{
  /* 这条测试的存在原因：adminAudit 一开始只登记进了文件存储的 FILES 表，
   * 没登记进 store-postgres 的 names 白名单。本地全绿、CI 的 pg 任务也不报，
   * 一部署到用 Neon 的线上就是「每次处罚 500」。所以必须有一条走真实 Postgres 的用例。 */
  await store.run(()=>{const users=store.get('users');users[a.user.id].role='admin';store.set('users',users);});
  assert.equal((await req(a,'/api/auth/me')).user.role,'admin');

  /* overview / users / audit 都会读 adminAudit —— 集合没登记时这里直接 500 */
  assert.equal((await req(a,'/api/admin/overview')).status,200);
  const list=await req(a,'/api/admin/users');
  assert.equal(list.status,200);
  assert.ok(!JSON.stringify(list).includes('passHash'),'账号列表不能带出哈希');

  /* 禁言生效：被禁言的人发留言要被挡 */
  assert.equal((await req(a,'/api/admin/user-action','POST',{action:'mute',uid:b.user.id,minutes:10,reason:'集成测试'})).status,200);
  assert.equal((await req(b,'/api/community/posts','POST',{text:'被禁言还能发吗'})).status,403);

  /* 封号生效：封禁前签发的 token 立即失效 */
  assert.equal((await req(a,'/api/admin/user-action','POST',{action:'ban',uid:b.user.id,reason:'集成测试封禁'})).status,200);
  assert.equal((await req(b,'/api/auth/me')).status,401);
  assert.equal((await req(a,'/api/admin/user-action','POST',{action:'unban',uid:b.user.id})).status,200);
  assert.equal((await req(b,'/api/auth/me')).status,200);

  /* 重启后审计与禁言状态仍在 —— 证明真的写进了 JSONB，而不是只在内存里 */
  await stopServer();await startServer();
  const audit=await req(a,'/api/admin/audit');
  assert.equal(audit.status,200);
  for(const action of ['mute','ban','unban'])assert.ok(audit.items.some(x=>x.action===action),'审计里应有 '+action+' 记录');
  const bRow=(await req(a,'/api/admin/users')).items.find(u=>u.id===b.user.id);
  assert.ok(bRow.mutedUntil>Date.now(),'禁言截止时间应持久化');
});

test('PostgreSQL wardrobe serializes rewards and purchases and survives restart',{skip:!configured},async()=>{
  const bank=[...questions.values()].filter(q=>!q.selfAssessed),first=bank[0];
  const rewarded=await Promise.all(Array.from({length:6},()=>req(a,'/api/skins/answer','POST',{qid:first.id,answer:first.answer})));
  assert(rewarded.every(r=>r.status===200));assert.equal(rewarded.reduce((n,r)=>n+r.gained,0),10);
  for(const q of bank.slice(1,8))assert.equal((await req(a,'/api/skins/answer','POST',{qid:q.id,answer:q.answer})).gained,10);
  assert.equal((await req(a,'/api/skins/wallet')).wallet.balance,80);
  const purchases=await Promise.all(Array.from({length:2},()=>req(a,'/api/skins/purchase','POST',{id:'kaykit-knight',price:0})));
  assert(purchases.every(r=>r.status===200));
  const w=(await req(a,'/api/skins/wallet')).wallet;assert.equal(w.balance,0);assert.equal(w.spent,80);assert.equal(w.owned.filter(id=>id==='kaykit-knight').length,1);
  assert.equal((await req(b,'/api/skins/equip','POST',{id:'kaykit-knight'})).status,400);
  assert.equal((await req(a,'/api/skins/equip','POST',{id:'kaykit-knight'})).wallet.equipped,'kaykit-knight');
  await stopServer();await startServer();
  const restored=(await req(a,'/api/skins/wallet')).wallet;assert.equal(restored.balance,0);assert.equal(restored.equipped,'kaykit-knight');assert.equal(restored.earned,80);
  assert.equal((await req(b,'/api/skins/wallet')).wallet.balance,0);
});
