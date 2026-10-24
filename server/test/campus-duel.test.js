'use strict';
/* 擂台现场（第十五轮）：两个真人玩家同场作答时，服务端只做两件事——
 *   1) 把「谁在哪个作答位」告诉同场的另一个人；
 *   2) 把动作（举手/交卷）转发过去。
 * 这个测试盯住的就是这两件事的边界：不是挑战成员不能就位、一个位只能一个人、
 * 动作只发一次且不落库、离开/断线立刻清位。
 *
 * 房间在「有人真的点了开始作答」时才建：挑战一创建 status 就是 active，
 * 但那只是邀请发了，台上还没人——所以邀请阶段不该有房可进。
 */
const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {once}=require('node:events'),{io}=require('socket.io-client');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'xwy-duel-test-'));
let server,community,campusLive,integrations,base,a,b,c,challenge,sa,sb,sc;
const sockets=[];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const pose={x:39,y:0,z:2,yaw:0,height:0,time:0,clip:'idle'};
const ack=(s,event,data)=>s.timeout(3000).emitWithAck(event,data);
/* 等一个事件的 Promise，带超时——否则事件不来测试会永久挂住。 */
const wait=(s,event,ms=3000)=>new Promise((resolve,reject)=>{
  const t=setTimeout(()=>{s.off(event,on);reject(new Error('等不到 '+event));},ms);
  const on=(data)=>{clearTimeout(t);resolve(data);};
  s.once(event,on);
});
async function req(who,endpoint,method='GET',body,prefix='/api/community/'){const r=await fetch(base+prefix+endpoint,{method,headers:{'Content-Type':'application/json',...(who?{Authorization:'Bearer '+who.token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,...await r.json()};}
const register=username=>req(null,'register','POST',{username,password:'DuelTest123456'},'/api/auth/');
const card=(nick)=>({nick,visible:true,subjects:['高等数学'],goal:'一起练习',availability:'晚上'});
async function connect(who){const s=io(base+'/community',{auth:{token:who.token},transports:['websocket'],reconnection:false});sockets.push(s);await once(s,'connect');const joined=await ack(s,'campus:join',{world:'campus-hub-v1',avatar:'anime',pose});assert.equal(joined.ok,true);return {socket:s,self:joined.self};}
const roomOf=id=>campusLive.snapshot().rooms.find(r=>r.challenge===id);

before(async()=>{
  process.env.DATA_DIR=temp;process.env.JWT_SECRET='duel-test-secret';
  ({server,community,campusLive,integrations}=require('../server'));
  await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;
  a=await register('擂台甲');b=await register('擂台乙');c=await register('擂台丙');
  await req(a,'profile','PUT',card('甲同学'));await req(b,'profile','PUT',card('乙同学'));await req(c,'profile','PUT',card('丙同学'));
  const invite=(await req(a,'request','POST',{to:b.user.id})).request;
  await req(b,'request','PUT',{id:invite.id,action:'accept'});
  challenge=(await req(a,'challenges','POST',{to:b.user.id,topic:'函数与极限'})).challenge;
  assert.equal(challenge.status,'active');
  /* 一个账号只能有一条同场连接（后连的会把前一条顶掉），所以三个人的 socket 只连一次。 */
  sa=(await connect(a)).socket;sb=(await connect(b)).socket;sc=(await connect(c)).socket;
});
after(async()=>{for(const s of sockets)s.disconnect();campusLive.close();await community.close();await integrations.close();fs.rmSync(temp,{recursive:true,force:true});});

test('no room exists until somebody actually starts the challenge',async()=>{
  assert.equal(roomOf(challenge.id),undefined,'邀请阶段台上没有房');
  const early=await ack(sa,'duel:enter',{challenge:challenge.id,station:'jia'});
  assert.equal(early.ok,false,'没人开始作答时进不去');
  await req(a,'challenge/start','POST',{id:challenge.id});
  const room=roomOf(challenge.id);
  assert.ok(room,'有人开始作答，房才建');
  assert.equal(room.members,2);
  assert.deepEqual(room.seats,[],'房建了但没人就位');
});

test('a started challenge only lets its own members take a station',async()=>{
  const denied=await ack(sc,'duel:enter',{challenge:challenge.id,station:'yi'});
  assert.equal(denied.ok,false,'非成员不能就位');
  const mine=await ack(sa,'duel:enter',{challenge:challenge.id,station:'jia'});
  assert.equal(mine.ok,true);
  assert.equal(mine.station,'jia');
  assert.equal(mine.seats.length,1);
  assert.equal(roomOf(challenge.id).seats[0].station,'jia');
});

test('one station holds one player and the other sees the seat arrive',async()=>{
  const clash=await ack(sb,'duel:enter',{challenge:challenge.id,station:'jia'});
  assert.equal(clash.ok,false,'同一个位只能一个人');
  const watching=wait(sa,'duel:seat');
  const bSeat=await ack(sb,'duel:enter',{challenge:challenge.id,station:'yi'});
  assert.equal(bSeat.ok,true);
  const announced=await watching;
  assert.equal(announced.station,'yi');
  assert.equal(announced.challenge,challenge.id);
  assert.equal(bSeat.seats.length,2);
});

test('actions reach the other seated player only, and never persist',async()=>{
  const leaked=[];sc.on('duel:act',m=>leaked.push(m));
  const received=wait(sb,'duel:act');
  sa.emit('duel:act',{challenge:challenge.id,act:'cheer'});
  const act=await received;
  assert.equal(act.act,'cheer');
  assert.equal(act.station,'jia');
  await pause(120);assert.deepEqual(leaked,[],'不是成员收不到动作');
  /* 没坐在位上的人发动作，谁都不该收到 */
  const nothing=[];sb.on('duel:act',m=>nothing.push(m));
  sc.emit('duel:act',{challenge:challenge.id,act:'answer'});
  await pause(150);assert.deepEqual(nothing,[],'没就位的人发不出动作');
  const store=require('../lib/store');
  /* 擂台只是表现层：举手/就位/离场都不该在 learning 里留下任何一条记录。 */
  assert.equal(store.get('learning',undefined),undefined,'擂台表现不写学习记录');
});

test('leaving or disconnecting frees the station',async()=>{
  const left=wait(sa,'duel:left');
  sb.emit('duel:leave',{challenge:challenge.id});
  const gone=await left;
  assert.equal(gone.station,'yi');
  const retake=await ack(sb,'duel:enter',{challenge:challenge.id,station:'yi'});
  assert.equal(retake.ok,true,'位子空出来别人能再坐');
  const out=wait(sa,'duel:left');
  sb.disconnect();
  const byebye=await out;
  assert.equal(byebye.station,'yi','断线的人立刻从座位上消失');
  const room=roomOf(challenge.id);
  /* 人走光了，房必须还在：房间归挑战，不归座位。
   * 挑战还 active、还有人没交卷，另一位随时可以坐进来——
   * 房被顺手删掉的话，后面来的那个人一律会被判「这场挑战不在进行中」。
   * 另外甲（sa）一直坐在 jia 没动，所以这里只剩他一个座位。 */
  assert.ok(room,'座位空了不代表挑战结束，房要留着');
  assert.deepEqual(room.seats.map(s=>s.station),['jia'],'断线的乙清了位，甲的位还在');
});

/* 这一条盯的是一个真实踩过的坑：
 * 同一个账号开第二条 socket（整合版校园里，漫游同场和擂台各一条）时，
 * 后一条会顶掉前一条，前一条的 disconnect 会触发 leave → duelLeave。
 * 如果 duelLeave 顺手把「空房间」删掉，房在建好的同一秒就没了，
 * 紧接着 duel:enter 全部报「这场挑战不在进行中」——台上明明有比赛，谁也坐不上。
 * 所以这里断言：顶号之后，房还在，新连接能正常就位。 */
test('a second connection for the same account does not tear the room down',async()=>{
  /* 让房先变成空的：甲起身，乙已断线。此时 seats=[]，房必须在。 */
  await ack(sa,'duel:leave',{challenge:challenge.id});
  await pause(150);
  const empty=roomOf(challenge.id);
  assert.ok(empty,'两人都起身后房还在');
  assert.deepEqual(empty.seats,[],'座位表空了');

  /* 同账号再连一条（真实场景：漫游同场 + 擂台各一条，后连的顶掉前一条）。
   * 顶号会走 leave(旧socket) → duelLeave，这里最容易顺手删房。 */
  const again=io(base+'/community',{auth:{token:a.token},transports:['websocket'],reconnection:false});
  sockets.push(again);await once(again,'connect');
  await pause(250);   // 让旧 socket 的 disconnect 处理跑完
  assert.ok(roomOf(challenge.id),'顶号不该把空房删掉');

  /* 顶号那一刻 campus:join 可能撞上服务端的 800ms 节流（同一个 uid 刚 join 过）。
   * 这不是 bug，是防刷；测试里就重试几次，别把它当失败。 */
  let joined=null;
  for(let i=0;i<5;i++){
    try{joined=await again.timeout(4000).emitWithAck('campus:join',{world:'campus-hub-v1',avatar:'anime',pose});}catch{joined=null;}
    if(joined?.ok)break;
    await pause(400);
  }
  assert.equal(joined?.ok,true,'顶号后的新连接能正常加入:'+JSON.stringify(joined));
  const sit=await ack(again,'duel:enter',{challenge:challenge.id,station:'jia'});
  assert.equal(sit.ok,true,'新连接照样能就位:'+JSON.stringify(sit));
  assert.equal(sit.station,'jia');
  sa=again;   // 后面的事都用这条
});

