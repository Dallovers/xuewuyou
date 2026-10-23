'use strict';
// Ephemeral presentation state only. Never writes learning, attendance or scores.
const {randomUUID}=require('node:crypto');
const WORLD='campus-hub-v1',ROOM='campus:live:'+WORLD,MAX_PLAYERS=24;
const AVATARS=new Set(['anime','robot','formal','prototype']);
const CLIPS=new Set(['idle','walk','run','jump']);
function pose(body){
  if(!body||typeof body!=='object'||Array.isArray(body))return null;
  const {x,y,z,yaw,height,time,clip}=body;
  if(![x,y,z,yaw,height,time].every(Number.isFinite)||x< -49||x>56||z< -46||z>42||y<0||y>1||height<0||height>1.2||time<0||time>30||!CLIPS.has(clip))return null;
  return {x,y,z,yaw:Math.atan2(Math.sin(yaw),Math.cos(yaw)),height,time,clip,studying:body.studying===true};
}
module.exports=function({authUser,store}){
  const members=new Map();let ns,timer,closed=false;
  const publicPlayer=m=>({id:m.id,nick:m.nick,avatar:m.avatar,seq:m.seq,...m.pose});
  const players=()=>[...members.values()].map(publicPlayer);
  function stopIdleTimer(){if(!members.size){clearInterval(timer);timer=null;}}
  function leave(socket){
    const m=members.get(socket.data.uid);
    if(m?.socket===socket){members.delete(socket.data.uid);socket.leave(ROOM);ns.to(ROOM).emit('campus:left',{id:m.id});}
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
  function attach(namespace){ns=namespace;ns.on('connection',socket=>{
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
        members.set(identity.uid,m);socket.join(ROOM);startTimer();reply({ok:true,self:publicPlayer(m),players:players()});
      }catch{reply({ok:false,error:'校园连接暂不可用，请重试'});}finally{joining=false;}
    });
    socket.on('campus:pose',body=>{
      const m=members.get(socket.data.uid),now=Date.now();if(!m||m.socket!==socket||now-m.lastPose<60)return;
      const next=pose(body);if(!next)return;
      // Loose speed envelope tolerates normal interpolation/collision corrections.
      if(Math.hypot(next.x-m.pose.x,next.z-m.pose.z)>3+Math.min(3,(now-m.lastSeen)/1000)*7)return;
      m.pose=next;m.seq++;m.lastSeen=now;m.lastPose=now;
    });
    socket.on('campus:leave',()=>leave(socket));socket.on('disconnect',()=>leave(socket));
  });return namespace;}
  return {attach,close(){closed=true;clearInterval(timer);timer=null;for(const m of [...members.values()])leave(m.socket);},snapshot:()=>({world:WORLD,count:members.size,max:MAX_PLAYERS})};
};
module.exports.validPose=pose;
