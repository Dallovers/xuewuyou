'use strict';
const {randomUUID}=require('node:crypto');
const {muteRemainingMs,formatDuration}=require('../lib/moderation');
const MAX_TEXT=140,HISTORY_LIMIT=50,HISTORY_TTL=5*60*1000;
module.exports=function({store,authUser,member,broadcast}){
 let messages=[];const senders=new Map();
 function prune(){const cutoff=Date.now()-HISTORY_TTL;messages=messages.filter(m=>m.at>=cutoff).slice(-HISTORY_LIMIT);for(const [uid,s]of senders)if(s.last<cutoff)senders.delete(uid);}
 function attach(socket){
  let busy=false;
  socket.on('campus:chat/send',async(body,ack)=>{
   const reply=value=>{if(typeof ack==='function')ack(value);};
   const active=()=>{const m=member(socket);return m?.socket===socket&&socket.connected?m:null;};
   if(!active())return reply({ok:false,error:'请先加入同场，再发消息'});
   if(busy)return reply({ok:false,error:'消息正在发送，请稍后'});
   if(typeof body?.text!=='string'||body.text.length>560||typeof body?.clientId!=='string'||! /^[A-Za-z0-9_-]{8,80}$/.test(body.clientId))return reply({ok:false,error:'消息格式无效'});
   const text=body.text.replace(/[\s\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]+/gu,' ').trim();
   if(!text||[...text].length>MAX_TEXT||!text.isWellFormed())return reply({ok:false,error:'请发送 1—140 字的文字'});
   busy=true;
   try{
    const permission=await store.run(()=>{const user=authUser({headers:{authorization:'Bearer '+(socket.handshake.auth?.token||'')}});return !user?{error:'登录已失效，请重新登录'}:muteRemainingMs(user)>0?{error:'你已被禁言，'+formatDuration(muteRemainingMs(user))+'后可发言'}:{uid:user.id};},{readOnly:true});
    const m=active();if(!m||permission.uid!==m.uid)return reply({ok:false,error:permission.error||'同场连接已失效'});
    prune();const now=Date.now(),sender=senders.get(m.uid)||{last:0,times:[],sent:new Map()};
    const duplicate=sender.sent.get(body.clientId);if(duplicate){if(duplicate.text!==text)return reply({ok:false,error:'消息编号重复，请重新输入'});return reply({ok:true,message:duplicate});}
    sender.times=sender.times.filter(at=>at>now-10000);
    if(now-sender.last<800||sender.times.length>=5)return reply({ok:false,error:'发言太快了，稍等几秒再发送'});
    const message={id:randomUUID(),playerId:m.id,nick:m.nick,text,at:now};
    sender.last=now;sender.times.push(now);sender.sent.set(body.clientId,message);if(sender.sent.size>20)sender.sent.delete(sender.sent.keys().next().value);senders.set(m.uid,sender);
    messages.push(message);messages=messages.slice(-HISTORY_LIMIT);broadcast(message);reply({ok:true,message});
   }catch{return reply({ok:false,error:'消息暂时无法发送，请重试'});}finally{busy=false;}
  });
 }
 return {attach,history(){prune();return [...messages];},close(){messages=[];senders.clear();}};
};
