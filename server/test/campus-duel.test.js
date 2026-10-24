'use strict';
/* 擂台现场（第十五轮）：两个真人玩家同场作答时，服务端只做两件事——
 *   1) 把「谁在哪个作答位」告诉同场的另一个人；
 *   2) 把动作（举手/交卷）转发过去。
 * 这个测试盯住的就是这两件事的边界：不是挑战成员不能就位、一个位只能一个人、
 * 动作只发一次且不落库、离开/断线立刻清位。
 *
 * 房间是**懒建**的：没人就位就不占内存；但「挑战还活着」就允许就位，
 * 不再要求"有人先开始作答"——那条前置条件会造成「坐不上→没法开始→更坐不上」的死锁。
 * 另外两个不是学习搭子的人也要能开一局（现场匹配，见文件末尾）。
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
/* 直接读库里的 friends 表：key 是两个 id 排序后拼起来（见 community/index.js 的 key()）。 */
function friendship(x,y){const data=require('../lib/store').get('community','main',{})||{};return !!(data.friends||{})[[x,y].sort().join(':')];}

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

test('a live challenge can be seated on before anybody starts, and sitting down is what opens the room',async()=>{
  /* 没人就位时台上没有房：房间是懒建的，不为"只是发了邀请"的挑战占内存。 */
  assert.equal(roomOf(challenge.id),undefined,'没人就位时台上还没有房');
  /* 但**进得去**。以前这里要求"有人先 start"，于是「坐不上→没法开始→更坐不上」死锁：
   * 真实用户就这么卡在台上，看到的是"答不了题"。坐着的人一开面板就会 start。 */
  const early=await ack(sa,'duel:enter',{challenge:challenge.id,station:'jia'});
  assert.equal(early.ok,true,'挑战还活着就能坐上去:'+JSON.stringify(early));
  const room=roomOf(challenge.id);
  assert.ok(room,'人就位这一步把房建起来');
  assert.equal(room.members,2);
  assert.deepEqual(room.seats.map(s=>s.station),['jia'],'坐着的人已经在座位上');
  await req(a,'challenge/start','POST',{id:challenge.id});
  assert.ok(roomOf(challenge.id),'开始作答后房还在');
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

/* 第十九轮：两个**不是学习搭子**的人，只是都在竞技场，也要能开一局。
 * 好友挑战那条路要求先加搭子，所以台上等人永远等不到——这就是用户说的「匹配不上」。 */
test('two strangers on the arena can be matched into one real challenge',async()=>{
  const d=await register('匹配丁'),e=await register('匹配戊');
  await req(d,'profile','PUT',card('丁同学'));await req(e,'profile','PUT',card('戊同学'));
  const sd=(await connect(d)).socket,se=(await connect(e)).socket;

  const waiting=await ack(sd,'duel:match',{station:'jia'});
  assert.equal(waiting.ok,true);
  assert.equal(waiting.waiting,true,'只有一个人时进等待队列');
  assert.equal(campusLive.snapshot().waiting,1);

  /* 先挂好监听再让第二个人点——emit 就在 ack 之前，慢一步就永远等不到。 */
  const announcedP=wait(sd,'duel:matched');
  const matched=await ack(se,'duel:match',{station:'jia'});
  assert.equal(matched.ok,true);
  assert.equal(matched.matched,true,'第二个人一到就配成一对');
  const announced=await announcedP;
  assert.equal(announced.challenge,matched.challenge,'两边拿到的是同一场挑战');
  assert.equal(announced.station,'jia','先等的人保持自己要的位');
  assert.equal(matched.station,'yi','两个人都点了甲位时，后来的去乙位，不叠在一起');
  assert.equal(campusLive.snapshot().waiting,0,'配对成功后队列清空');

  /* 配对结果必须是一条**真的**挑战：落在 community 里、五道题、两边都是成员。 */
  const detail=await req(d,'challenge?id='+matched.challenge);
  assert.equal(detail.challenge.status,'active');
  assert.equal(detail.challenge.count,5,'五道题，和好友挑战同一套题库');
  assert.equal(detail.challenge.topic,'函数与极限','没指定主题时用默认主题');
  /* 从头到尾没有发过好友申请——现场匹配不要求先加学习搭子 */
  assert.equal(friendship(d.user.id,e.user.id),false,'两人不是学习搭子');

  const seatD=await ack(sd,'duel:enter',{challenge:matched.challenge,station:'jia'});
  const seatE=await ack(se,'duel:enter',{challenge:matched.challenge,station:'yi'});
  assert.equal(seatD.ok,true,'匹配到就能坐下:'+JSON.stringify(seatD));
  assert.equal(seatE.ok,true);
  assert.equal(roomOf(matched.challenge).seats.length,2,'两个真人都坐在台上');

  await req(d,'challenge/cancel','PUT',{id:matched.challenge});
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

