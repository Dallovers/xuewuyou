import * as T from 'three';
import {createStudentAvatar} from './avatar.js';
import {VERSION} from './layout.js';

let clientLibrary;
function loadClient(){
 if(window.io)return Promise.resolve(window.io);
 if(!clientLibrary)clientLibrary=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=new URL('../../../vendor/socketio/socket.io.min.js',document.baseURI).href;
  script.onload=()=>resolve(window.io);script.onerror=()=>{script.remove();clientLibrary=null;reject(Error('联网组件加载失败'));};document.head.append(script);
 });return clientLibrary;
}
const token=()=>{try{const t=localStorage.getItem('xwy_token')||'';return t.startsWith('local.')?'':t;}catch{return '';}};
export function createCampusPresence({scene,camera,getPose,setSpawn,openAccount,shadowChanged,prepareAvatar=async()=>{}}){
 const panel=document.createElement('section');panel.id='presence';panel.setAttribute('aria-label','校园同场');
 const status=document.createElement('span'),button=document.createElement('button');status.id='presence-status';status.setAttribute('role','status');button.id='presence-toggle';panel.append(status,button);document.body.append(panel);
 const labels=document.createElement('div');labels.id='peer-labels';labels.setAttribute('aria-hidden','true');document.body.append(labels);
 const peers=new Map(),project=new T.Vector3();let socket,selfId='',joined=false,wanted=true,disposed=false,generation=0,lastToken=token(),lastSend=0,lastSnapshot=0,loading=false,remoteRevision=0,painted='';
 const cap=()=>innerWidth<700?2:4;
 function paint(text,action){const value=text+'|'+action;if(value===painted)return;painted=value;status.textContent=text;button.textContent=action;}
 function release(peer){peer.cancelled=true;peer.avatar?.dispose();peer.label?.remove();peers.delete(peer.id);shadowChanged();}
 function clear(){for(const peer of [...peers.values()])release(peer);selfId='';joined=false;lastSnapshot=0;}
 function disconnect(){generation++;if(socket){socket.removeAllListeners();socket.disconnect();socket=null;}clear();}
 function setIdle(){paint(lastToken?'单人漫游':'单人漫游 · 登录后可同场',lastToken?'加入同场':'登录加入');}
 function receive(message){
  if(!joined||message?.world!==VERSION||!Array.isArray(message.players))return;
  lastSnapshot=performance.now();const live=new Set();
  for(const p of message.players){if(p.id===selfId)continue;live.add(p.id);let peer=peers.get(p.id);if(peer&&peer.variant!==p.avatar){release(peer);peer=null;}
   if(!peer){peer={id:p.id,nick:p.nick,variant:p.avatar,from:p,to:p,received:performance.now(),seq:-1,avatar:null,label:null};peers.set(p.id,peer);}
   if(p.seq!==peer.seq){peer.from=interpolate(peer,performance.now());peer.to=p;peer.received=performance.now();peer.seq=p.seq;peer.nick=p.nick;remoteRevision++;}
  }
  for(const peer of [...peers.values()])if(!live.has(peer.id))release(peer);
  paint('同场 '+(peers.size+1)+' 人'+(peers.size?'':' · 等待同学加入'),'离开同场');
 }
 function interpolate(peer,now){const t=Math.min(1,Math.max(0,(now-peer.received)/110)),a=peer.from,b=peer.to;return {...b,x:T.MathUtils.lerp(a.x,b.x,t),y:T.MathUtils.lerp(a.y,b.y,t),z:T.MathUtils.lerp(a.z,b.z,t),height:T.MathUtils.lerp(a.height,b.height,t),yaw:a.yaw+Math.atan2(Math.sin(b.yaw-a.yaw),Math.cos(b.yaw-a.yaw))*t,time:b.time+(now-peer.received)/1000};}
 function join(){
  if(!socket?.connected||!wanted||document.hidden)return;
  const sent=getPose(),activeSocket=socket,current=generation;socket.timeout(8000).emit('campus:join',{world:VERSION,avatar:sent.avatar,pose:sent},(error,result)=>{
   if(disposed||current!==generation||socket!==activeSocket||!socket?.connected||!wanted)return;
   if(error||!result?.ok){paint(result?.error||'同场连接超时','重新连接');return;}
   selfId=result.self.id;joined=true;setSpawn(result.self,sent);receive({world:VERSION,players:result.players});publish(true);
  });
 }
 async function connect(){
  disconnect();lastToken=token();if(disposed||!wanted||document.hidden)return;
  if(!lastToken){setIdle();return;}
  const current=generation;paint('正在连接同学…','取消连接');
  try{
   const io=await loadClient();if(disposed||current!==generation||!wanted||document.hidden)return;
   const base=String(window.WG_DEPLOY?.apiBase||location.origin).replace(/\/$/,'');
   socket=io(base+'/community',{auth:cb=>cb({token:token()}),reconnection:true,reconnectionDelay:700,reconnectionDelayMax:5000,timeout:10000});
   socket.on('connect',join);socket.on('campus:state',receive);
   socket.on('campus:left',p=>{const peer=peers.get(p.id);if(peer)release(peer);});
   socket.on('disconnect',()=>{generation++;clear();if(wanted)paint('连接已断开，正在重连…','取消连接');});
   socket.on('connect_error',error=>{clear();paint(/登录|账号/.test(error.message)?'登录已失效，请重新登录':'暂时无法连接同场，可继续漫游',/登录|账号/.test(error.message)?'重新登录':'重新连接');});
   socket.on('campus:replaced',()=>{wanted=false;disconnect();paint('此账号已在另一窗口进入同场','重新加入');});
   socket.on('campus:expired',()=>{clear();join();});
  }catch(error){if(current===generation)paint(error.message,'重新连接');}
 }
 function publish(force=false){if(!joined||!socket?.connected||document.hidden)return;const now=performance.now();if(force||now-lastSend>=100){lastSend=now;socket.volatile.emit('campus:pose',getPose());}}
 /* 移动（teleport）后必须立刻走 campus:teleport，不能靠下一帧 publish：
    campus:pose 有速度包络（一步跨 40 米会被判异常丢掉），而丢一次不是丢一帧——
    服务端记的还是旧位置，之后每次比较都拒，人走到哪里别人都看不见。
    限频由服务端管（1.2s）；这里只负责把新位置送出去。 */
 function teleport(){
  if(!joined||!socket?.connected||document.hidden)return false;
  lastSend=performance.now();socket.volatile.emit('campus:teleport',getPose());return true;
 }
 button.onclick=()=>{
  if(button.textContent.includes('登录')){openAccount();return;}
  if((joined&&button.textContent!=='重新连接')||button.textContent==='取消连接'){wanted=false;disconnect();setIdle();return;}
  wanted=true;connect();
 };
 function syncAuth(){const next=token();if(next!==lastToken){lastToken=next;wanted=true;connect();}else if(joined)publish();}
 function visibility(){if(document.hidden)disconnect();else if(wanted)connect();}
 function online(){if(wanted)connect();}
 addEventListener('storage',syncAuth);addEventListener('online',online);document.addEventListener('visibilitychange',visibility);
 const authTimer=setInterval(syncAuth,1000);connect();
 return {
  update(dt){
   if(disposed)return;publish();const now=performance.now();
   // Asset decoding, background throttling and brief network jitter can delay
   // volatile snapshots. Give the server's 15s membership expiry time to run
   // before replacing an otherwise healthy transport and all visible avatars.
   if(joined&&lastSnapshot&&now-lastSnapshot>20000){clear();paint('同步中断，正在重新连接…','取消连接');socket?.disconnect().connect();}
   const me=getPose(),near=[...peers.values()].filter(p=>Math.hypot(p.to.x-me.x,p.to.z-me.z)<42).sort((a,b)=>Math.hypot(a.to.x-me.x,a.to.z-me.z)-Math.hypot(b.to.x-me.x,b.to.z-me.z)).slice(0,cap()),visible=new Set(near.map(p=>p.id));
   for(const peer of peers.values()){
    if(peer.avatar&&!visible.has(peer.id)){peer.avatar.dispose();peer.avatar=null;peer.label?.remove();peer.label=null;shadowChanged();}
    if(!peer.avatar)continue;const p=interpolate(peer,now);peer.avatar.setVisible(true);peer.avatar.update({position:{x:p.x,z:p.z,groundY:p.y},yaw:p.yaw,dt:Math.min(dt,.1),remoteState:p});
    const distance=Math.hypot(p.x-me.x,p.z-me.z);project.set(p.x,p.y+p.height+2.05,p.z).project(camera);
    peer.label.hidden=distance>20||project.z< -1||project.z>1||Math.abs(project.x)>1||Math.abs(project.y)>1;
    const text=peer.nick+(p.studying?' · 学习中':'');if(peer.label.textContent!==text)peer.label.textContent=text;peer.label.style.transform=`translate(-50%,-100%) translate(${(project.x*.5+.5)*innerWidth}px,${(-project.y*.5+.5)*innerHeight}px)`;
   }
   const pending=near.find(p=>!p.avatar&&!p.loading&&(!p.retryAt||now>=p.retryAt));
   if(pending&&!loading){loading=true;pending.loading=true;const peer=pending;
    createStudentAvatar(scene,{variant:peer.variant,castShadow:false}).then(async avatar=>{
     if(disposed||peer.cancelled||!peers.has(peer.id)||!visible.has(peer.id)){avatar.dispose();return;}
     try{await prepareAvatar(avatar);}catch(error){avatar.dispose();throw error;}
     if(disposed||peer.cancelled||!peers.has(peer.id)){avatar.dispose();return;}
     peer.avatar=avatar;avatar.root.name='Online campus peer';peer.label=document.createElement('span');peer.label.className='peer-label';peer.label.hidden=true;labels.append(peer.label);shadowChanged();
    }).catch(()=>{peer.retries=(peer.retries||0)+1;peer.retryAt=performance.now()+Math.min(30000,3000*2**(peer.retries-1));paint('同学已在线，角色正在重试加载','重新连接');}).finally(()=>{loading=false;peer.loading=false;});
   }
  },
  snapshot:()=>({joined,wanted,selfId,players:peers.size+Number(joined),loaded:[...peers.values()].filter(p=>p.avatar).length,remoteRevision,peers:[...peers.values()].map(p=>({id:p.id,nick:p.nick,pose:p.to,rendered:p.avatar?.root.position.toArray(),clip:p.avatar?.snapshot().clip})),status:status.textContent}),
  appearance(){if(joined&&socket?.connected)socket.timeout(8000).emit('campus:appearance',{avatar:getPose().avatar},()=>{});},
  teleport,
  dispose(){disposed=true;wanted=false;disconnect();clearInterval(authTimer);removeEventListener('storage',syncAuth);removeEventListener('online',online);document.removeEventListener('visibilitychange',visibility);panel.remove();labels.remove();}
 };
}
