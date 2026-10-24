'use strict';
// Ephemeral presentation state only. Never writes learning, attendance or scores.
const {randomUUID}=require('node:crypto');
const WORLD='campus-hub-v1',ROOM='campus:live:'+WORLD,MAX_PLAYERS=24;
const AVATARS=new Set(['anime','robot','formal','prototype']);
const CLIPS=new Set(['idle','walk','run','jump']);
/* ---------- 擂台（第十五轮） ----------
 * 好友挑战原来是「异步」的：两边各答各的，谁也不在场。这一轮让两个人真的在同一座
 * 擂台上互相看得见——但**只同步表现**，判分、计时、交卷仍然完全由 community 模块负责。
 *
 * 这里有三个东西，都不要混：
 *   DUEL_STATIONS  站位坐标，必须和 arena-district.js / campus-hub 的 layout.js 对齐；
 *   rooms          某场挑战的在线成员，只在有人就位时存在，人走光就散；
 *   seat / act / left  三个 emitted 事件，全是「谁在哪、在做什么动作」。
 *
 * 为什么状态不落 store：这是一次性的现场表现。挑战本身早就在 community 的
 * challenges 里存着；这里丢了顶多是两个人看不见对方，刷新一下又回来。
 */
const DUEL_STATIONS={
  // 世界坐标：campus-hub 的 ARENA_ROOT(39, 2) + 台心 x 1.8，南北各离台心 2.14
  jia:{x:40.8,z:4.14,yaw:Math.PI},
  yi:{x:40.8,z:-0.14,yaw:0},
};
const DUEL_ACTS=new Set(['cheer','answer','done','left']);
function station(v){
  if(!v||typeof v!=='object'||Array.isArray(v))return null;
  if(!Object.hasOwn(DUEL_STATIONS,v.station))return null;
  return {station:v.station,at:new Date().toISOString()};
}
function pose(body){
  if(!body||typeof body!=='object'||Array.isArray(body))return null;
  const {x,y,z,yaw,height,time,clip}=body;
  if(![x,y,z,yaw,height,time].every(Number.isFinite)||x< -49||x>56||z< -46||z>42||y<0||y>1||height<0||height>1.2||time<0||time>30||!CLIPS.has(clip))return null;
  return {x,y,z,yaw:Math.atan2(Math.sin(yaw),Math.cos(yaw)),height,time,clip,studying:body.studying===true};
}
module.exports=function({authUser,store,namespace}){
  const members=new Map(),rooms=new Map();let ns,timer,closed=false;
  /* 挑战变化的旁听者。server.js 在 community.attach 之后把它接到 challenges 上：
   * 挑战一开始，就把两位成员拉进这间房（房间是懒建的，没人就位就不占内存）。 */
  const challengeById=new Map(),hooks=new Set();
  const publicPlayer=m=>({id:m.id,nick:m.nick,avatar:m.avatar,seq:m.seq,...m.pose});
  const players=()=>[...members.values()].map(publicPlayer);
  function stopIdleTimer(){if(!members.size&&!rooms.size){clearInterval(timer);timer=null;}}
  function leave(socket){
    const m=members.get(socket.data.uid);
    if(m?.socket===socket){members.delete(socket.data.uid);socket.leave(ROOM);ns.to(ROOM).emit('campus:left',{id:m.id});duelLeave(m.id);}
    stopIdleTimer();
  }
  /* ---------- 擂台房 ----------
   * 房间按挑战 id 分：一场挑战一间房，两个成员各占一个位。
   * 同一个人可能同时开着好几场挑战，但**同一时间只能就位一个位**，
   * 所以 uid → {room, station} 用一张表记，换房先退旧房。 */
  const stationOwner=new Map();   // uid → {playerId, challenge, station}
  const topic=(id)=>'duel:'+id;
  /* 一个人离场（断线 / 被同账号的新连接顶掉）：只把他的座位还回去。
   *
   * 这里**不能**「座位空了就删房」：房间的生命周期属于挑战，不属于座位。
   * 挑战一开始就该有房（有人在答、另一个人随时可以坐进来），座位表空着是常态——
   * 比如 A 刚点了「开始作答」还没就位，B 的连接先到，就会出现 seats=0。
   * 以前这里顺手 rooms.delete()，结果同账号开第二条 socket 顶掉第一条时，
   * 第一件事就是把刚建好的空房删掉，紧接着 duel:enter 一律报「这场挑战不在进行中」——
   * 台上明明有比赛，两个人却谁也坐不上去。删房只应该由「挑战失效」来决定（见 duelChallenge）。 */
  function duelLeave(playerId){
    for(const [challengeId,room] of rooms){
      for(const [uid,seat] of [...room.seats])if(seat.id===playerId){
        room.seats.delete(uid);
        ns.to(topic(challengeId)).emit('duel:left',{id:playerId,station:seat.station,challenge:challengeId});
      }
    }
    for(const [uid,r] of [...stationOwner])if(r.playerId===playerId)stationOwner.delete(uid);
    syncChallenges();
    stopIdleTimer();
  }
  /* 座位变化后把「还开着的挑战」重新过一遍：挑战已经结束/过期的房要收掉，
   * 还活着的保留（哪怕暂时没人坐）。判定见 duelChallenge 里的 isLive。 */
  function syncChallenges(){
    for(const id of [...rooms.keys()]){
      const c=challengeById.get(id);
      if(!isLive(c)){rooms.delete(id);for(const [uid,o] of [...stationOwner])if(o.challenge===id)stationOwner.delete(uid);}
    }
  }
  function duelEnter(socket,challengeId,stationId){
    const room=rooms.get(challengeId);
    if(!room)return {ok:false,error:'这场挑战不在进行中'};
    const m=members.get(socket.data.uid);
    if(!m||m.socket!==socket)return {ok:false,error:'请先加入校园同场'};
    if(!room.members.includes(socket.data.uid))return {ok:false,error:'这不是你的挑战'};
    /* 同一个位只能坐一个人：对面那位先就位了，你就只能去另一位，都有人就直说。 */
    for(const [uid,seat] of room.seats)if(seat.station===stationId&&seat.id!==m.id)return {ok:false,error:'这个作答位已经有人了'};
    const previous=stationOwner.get(socket.data.uid);
    if(previous&&previous.challenge!==challengeId){
      const old=rooms.get(previous.challenge);
      if(old){old.seats.delete(socket.data.uid);if(!old.seats.size)rooms.delete(previous.challenge);}
      ns.to(topic(previous.challenge)).emit('duel:left',{id:m.id,station:previous.station,challenge:previous.challenge});
    }
    room.seats.set(socket.data.uid,{id:m.id,nick:m.nick,station:stationId});
    stationOwner.set(socket.data.uid,{playerId:m.id,challenge:challengeId,station:stationId});
    socket.join(topic(challengeId));
    const seated=[...room.seats.values()];
    /* 自己收到的是「完整的座位表」，别人收到的是「我又就位了」——
     * 前者让刷新/后进来的人一次补齐，后者只做增量，不用重排整个房间。 */
    socket.emit('duel:seats',{challenge:challengeId,station:stationId,seats:seated,topic:room.topic,status:room.status});
    socket.to(topic(challengeId)).emit('duel:seat',{challenge:challengeId,id:m.id,nick:m.nick,station:stationId,seats:seated});
    stopIdleTimer();
    return {ok:true,challenge:challengeId,station:stationId,seats:seated,topic:room.topic};
  }
  function duelAct(socket,body){
    const challengeId=typeof body?.challenge==='string'?body.challenge:'';
    const owner=stationOwner.get(socket.data.uid);
    if(!owner||owner.challenge!==challengeId)return false;
    if(!DUEL_ACTS.has(body?.act))return false;
    const m=members.get(socket.data.uid);
    if(!m)return false;
    socket.to(topic(challengeId)).emit('duel:act',{challenge:challengeId,id:m.id,station:owner.station,act:body.act});
    return true;
  }
  /* 谁已经交卷：挑战对象里的 sessions 是唯一真相，这里只做投影，不另存一份。
   * 键必须用**玩家 id**（members 里的 m.id），不能用 uid：
   * 客户端拿到的座位、动作、self 全是玩家 id 这一套，混用会让「对面已交卷」永远读成 false
   * （sessions 按 uid 存，peer.id 是玩家 id，两个 id 空间不是一回事）。 */
  const submitted=(c)=>{
    const out={};
    for(const m of members.values())if(c.sessions?.[m.uid]?.finishedAt)out[m.id]=true;
    return out;
  };
  /* 挑战「开了」和「有人在答」是两件事：
   *   创建挑战时 status 就已经是 active，但那只是邀请发出去了，台上还没有人；
   *   真有人在答的标志是 sessions[*].startedAt。
   * 房间按后者建——所以「邀请还没被接受/还没点开始」的时候，台上没有房可进，
   * 也就不会出现一个空擂台让人以为对面正在准备。 */
  const started=(c)=>Object.values(c?.sessions||{}).some((s)=>!!s?.startedAt);
  /* 「这间房该不该存在」的唯一判定。房间归挑战，不归座位：
   * 只要挑战还 active、没过期、并且真有人点了开始作答，房就该在，
   * 哪怕此刻 seats 是空的（另一位还没就位）。 */
  const isLive=(c)=>!!c&&c.status==='active'&&(!c.expiresAt||c.expiresAt>Date.now())&&started(c);
  function duelChallenge(challenge){
    if(!challenge||typeof challenge!=='object'||typeof challenge.id!=='string')return;
    challengeById.set(challenge.id,challenge);
    if(!isLive(challenge)){
      /* 房要拆，但**先发最后一帧**：挑战变 completed 的这一刻，正是「先交卷那位」唯一一次
       * 能知道对面也交了的机会。以前这里直接 return，结果先交的人永远停在「等对面」，
       * 分数服务端早就算好了，只是没人告诉他。emit 在 rooms.delete 之前发，
       * 因为 topic 是 socket 自己 join 的房间名，与 rooms 这张表无关，删表不影响送达。 */
      const room=rooms.get(challenge.id);
      if(room){
        ns?.to(topic(challenge.id)).emit('duel:state',{
          challenge:challenge.id,topic:room.topic||challenge.topic||'',status:challenge.status,
          submitted:submitted(challenge),seats:[...room.seats.values()],
        });
      }
      rooms.delete(challenge.id);
      for(const [uid,o] of [...stationOwner])if(o.challenge===challenge.id)stationOwner.delete(uid);
      stopIdleTimer();
      return;
    }
    const room=rooms.get(challenge.id)||{members:[...(challenge.members||[])],seats:new Map(),topic:challenge.topic||'',status:challenge.status};
    room.members=[...(challenge.members||[])];room.status=challenge.status;room.topic=challenge.topic||room.topic;
    rooms.set(challenge.id,room);
    /* 有人开始作答那一刻就把两个人拉进房：即使还没就位，duel:seats 的空表也会告诉他们
     * "对手在线、还没到"，这比让他们对着一个静止的占位模型猜要诚实。 */
    for(const uid of room.members){
      const m=[...members.values()].find(x=>x.uid===uid);
      if(m)m.socket.join(topic(challenge.id));
    }
    const seated=[...room.seats.values()];
    ns?.to(topic(challenge.id)).emit('duel:state',{challenge:challenge.id,topic:room.topic,status:challenge.status,submitted:submitted(challenge),seats:seated});
    stopIdleTimer();
  }
  function startTimer(){if(timer)return;timer=setInterval(()=>{
    const now=Date.now();for(const m of members.values())if(now-m.lastSeen>15000){leave(m.socket);m.socket.emit('campus:expired');}
    if(members.size)ns.to(ROOM).volatile.emit('campus:state',{world:WORLD,players:players()});
  },100);timer.unref();}
  function spawn(p){
    if(Math.hypot(p.x,p.z-30)>1)return p;
    for(let i=0;i<MAX_PLAYERS;i++){const x=(i%5-2)*1.4,z=30-Math.floor(i/5)*1.4;
      if([...members.values()].every(m=>Math.hypot(m.pose.x-x,m.pose.z-z)>1))return {...p,x,z};}
    return p;
  }
  function attach(namespaceOrServer){ns=namespace||namespaceOrServer;ns.on('connection',socket=>{
    let joining=false;
    socket.on('campus:join',async(body,ack)=>{
      const reply=value=>{if(typeof ack==='function')ack(value);};
      if(closed||joining||Date.now()<(socket.data.campusJoinAfter||0))return reply({ok:false,error:'请稍后再加入'});
      const initial=pose(body?.pose);
      if(body?.world!==WORLD||!initial||!AVATARS.has(body?.avatar))return reply({ok:false,error:'校园版本或角色状态无效'});
      joining=true;socket.data.campusJoinAfter=Date.now()+800;
      try{
        const identity=await store.run(()=>{
          const user=authUser({headers:{authorization:'Bearer '+(socket.handshake.auth?.token||'')}});
          if(!user)return null;
          const profile=store.get('community','main',{}).profiles?.[user.id];
          return {uid:user.id,nick:profile?.visible?String(profile.nick||'同学').replace(/[\u0000-\u001f\u007f]/g,'').slice(0,24):''};
        },{readOnly:true});
        if(closed||!identity||!socket.connected)return reply({ok:false,error:'请登录有效的云端账号'});
        const old=members.get(identity.uid);
        if(!old&&members.size>=MAX_PLAYERS)return reply({ok:false,error:'当前校园已满，请稍后再来'});
        if(old?.socket===socket)return reply({ok:true,self:publicPlayer(old),players:players()});
        if(old){leave(old.socket);old.socket.emit('campus:replaced');}
        const id=randomUUID(),m={id,uid:identity.uid,socket,nick:identity.nick||'同学 '+id.slice(0,4),avatar:body.avatar,pose:spawn(initial),seq:0,lastSeen:Date.now(),lastPose:0};
        members.set(identity.uid,m);socket.join(ROOM);startTimer();
        /* 进来时顺手把已经在进行的挑战房全部补上：刷新页面不该丢掉「我在台上」这件事。 */
        for(const [challengeId,room] of rooms)if(room.members.includes(identity.uid))socket.join(topic(challengeId));
        reply({ok:true,self:publicPlayer(m),players:players(),duels:[...rooms].filter(([,r])=>r.members.includes(identity.uid)).map(([challengeId,r])=>({challenge:challengeId,topic:r.topic,status:r.status}))});
      }catch{reply({ok:false,error:'校园连接暂不可用，请重试'});}finally{joining=false;}
    });
    socket.on('campus:pose',body=>{
      const m=members.get(socket.data.uid),now=Date.now();if(!m||m.socket!==socket||now-m.lastPose<60)return;
      const next=pose(body);if(!next)return;
      // Loose speed envelope tolerates normal interpolation/collision corrections.
      if(Math.hypot(next.x-m.pose.x,next.z-m.pose.z)>3+Math.min(3,(now-m.lastSeen)/1000)*7)return;
      m.pose=next;m.seq++;m.lastSeen=now;m.lastPose=now;
    });
    /* 瞬移：上面那条速度包络会把「一步跨过 40 米」当异常丢掉，而且是**永久**丢掉——
     * 服务端记住的还是旧位置，之后每次上报都跟旧位置比，人走到哪别人都看不见。
     * 所以瞬移必须单独一条通道：不做包络，但**限频 1.2 秒**，它不是用来刷位置的。
     * 位置本身仍要过 pose() 的合法性与边界校验（越界一样拒）。 */
    socket.on('campus:teleport',body=>{
      const m=members.get(socket.data.uid),now=Date.now();if(!m||m.socket!==socket)return;
      if(now-(m.lastTeleport||0)<1200)return;
      const next=pose(body);if(!next)return;
      m.pose=next;m.seq++;m.lastSeen=now;m.lastPose=now;m.lastTeleport=now;
    });
    /* ---------- 擂台：就位 / 动作 / 起身 ---------- */
    socket.on('duel:enter',(body,ack)=>{
      const reply=value=>{if(typeof ack==='function')ack(value);};
      /* station() 收的是 {station:'jia'} 这样的对象（和 campus:join 的 pose 同一套写法），
       * 这里传 body 整包，不是 body.station 那个字符串。 */
      const at=station(body);
      if(typeof body?.challenge!=='string'||!at)return reply({ok:false,error:'挑战或作答位无效'});
      try{reply(duelEnter(socket,body.challenge,at.station));}catch{reply({ok:false,error:'就位失败，请重试'});}
    });
    socket.on('duel:act',body=>{if(!closed)duelAct(socket,body);});
    /* duel:leave 也回 ack：客户端"起身"之后要立刻知道自己已经不在位上，
     * 不接 ack 的话它只能靠猜，或者干等超时（测试里就是这么暴露出来的）。 */
    socket.on('duel:leave',(body,ack)=>{
      const reply=value=>{if(typeof ack==='function')ack(value);};
      const owner=stationOwner.get(socket.data.uid);
      if(!owner||(typeof body?.challenge==='string'&&body.challenge!==owner.challenge))return reply({ok:true,station:null});
      const room=rooms.get(owner.challenge),m=members.get(socket.data.uid);
      stationOwner.delete(socket.data.uid);
      socket.leave(topic(owner.challenge));
      if(!room)return reply({ok:true,station:null});
      room.seats.delete(socket.data.uid);
      if(m)ns.to(topic(owner.challenge)).emit('duel:left',{id:m.id,station:owner.station,challenge:owner.challenge});
      /* 座位空了**不要删房**：房归挑战，不归座位。见 duelLeave 里的说明。 */
      syncChallenges();
      stopIdleTimer();
      reply({ok:true,station:null});
    });
    socket.on('campus:leave',()=>leave(socket));socket.on('disconnect',()=>leave(socket));
  });return ns;}
  return {
    attach,
    /* 挑战变了（community 那边提交后回调）：把它翻译成「这间房还开不开」。
     * 对外只暴露这一个入口，hooks 留给测试用，避免别处又塞第二套状态进来。 */
    duel(challenge){duelChallenge(challenge);},
    onChallengeEvent(fn){hooks.add(fn);return()=>hooks.delete(fn);},
    close(){
      closed=true;clearInterval(timer);timer=null;
      for(const m of [...members.values()])leave(m.socket);
      rooms.clear();stationOwner.clear();challengeById.clear();hooks.clear();
    },
    snapshot:()=>({world:WORLD,count:members.size,max:MAX_PLAYERS,rooms:[...rooms].map(([challenge,r])=>({challenge,members:r.members.length,seats:[...r.seats.values()].map(s=>({station:s.station,id:s.id}))}))})
  };
};
module.exports.validPose=pose;
module.exports.DUEL_STATIONS=DUEL_STATIONS;
