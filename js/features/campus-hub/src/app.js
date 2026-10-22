import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {createWorld} from './world.js';
import {createStudentAvatar} from './avatar.js';
import {createNavigation} from './navigation.js';
import {ENTRIES,START,groundAt} from './layout.js';
import {readReturn,makeReturn,restorePose,KEY} from './return-state.js';
import {createBusinessBridge} from './business.js';

const $=selector=>document.querySelector(selector),canvas=$('#world'),scene=new T.Scene(),camera=new T.PerspectiveCamera(49,innerWidth/innerHeight,.1,350);
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
scene.background=new T.Color(0xd4ddd8);scene.fog=new T.Fog(0xd4ddd8,145,270);
scene.add(new T.HemisphereLight(0xe3edf1,0x88967a,1.1));const sun=new T.DirectionalLight(0xffefd9,2.5);sun.position.set(-40,62,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:170});sun.shadow.normalBias=.025;sun.shadow.bias=-.00003;scene.add(sun);scene.add(sun.target);
const orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.minDistance=8;orbit.maxDistance=180;orbit.maxPolarAngle=Math.PI*.49;
const state={ready:false,mode:'overview',...START,seated:null,path:null,frames:0,returnRestored:false};
const keys=new Set(),clock=new T.Clock();let world,avatar,navigation,drag,nearest,disposed=false,toastTimer,lastShadow=0,studentYaw=0,lastX=0,lastZ=START.z,cameraCheck=0,cameraDistance=5.3,cameraBoxes=[];
const ray=new T.Raycaster(),aim=new T.Vector3(),direction=new T.Vector3(),targetCamera=new T.Vector3();
const bridge=createBusinessBridge({clearInput,status:()=>{if(bridge.paused)avatar?.cancelAction();}});
function clearInput(){keys.clear();drag=null;state.path=null;}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);}
function resize(){const q=$('#quality').value,ratio=q==='high'?1.5:q==='fluid'?.8:innerWidth<700?.9:1;renderer.setPixelRatio(Math.min(devicePixelRatio,ratio));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;}
function setMode(mode){if(!state.ready)return;clearInput();avatar.cancelAction();state.seated=null;state.mode=mode;orbit.enabled=mode==='overview';$('#overview').setAttribute('aria-pressed',String(mode==='overview'));$('#walk').textContent=mode==='overview'?'开始漫游':'漫游中';$('#touch').hidden=mode!=='walk'||!(matchMedia('(pointer:coarse)').matches||innerWidth<700);$('#actions').hidden=mode!=='walk';$('#places').hidden=mode==='walk'&&innerWidth<700;if(mode==='overview'){camera.position.set(56,57,68);orbit.target.set(3,1,-4);orbit.update();}else{canvas.focus();updateCamera(.1);}}
function stand(){if(!state.seated)return;state.seated=null;clearInput();toast('已起身');}
function goTo(id){if(!state.ready||bridge.paused)return;stand();setMode('walk');const entry=ENTRIES.find(e=>e.id===id),goal={x:entry.outside[0],z:entry.outside[1]};const route=navigation.route(state,goal);if(!route){toast('暂时找不到通路，请换个站位重试。');return;}state.path=route;toast('正在前往'+entry.label+'，走近后按 E 进入。');}
function enterScene(entry){
 try{const record=makeReturn(entry,{...state,heading:studentYaw});sessionStorage.setItem(KEY,JSON.stringify(record));const url=new URL('../../../'+entry.path,document.baseURI);url.searchParams.set('campusTicket',record.ticket);url.searchParams.set('campusScene',entry.id);clearInput();location.assign(url.href);}catch{toast('无法保存返回位置，请检查浏览器存储权限。');}
}
function findNearest(){
 nearest=null;if(!state.ready||state.mode!=='walk'||bridge.paused||avatar.actionState.current)return;
 if(state.seated){nearest={label:'起身继续行走',action:stand};return;}
 const entries=ENTRIES.map(e=>({id:e.id,label:'进入'+e.label,distance:Math.hypot(state.x-e.at[0],state.z-e.at[1]),radius:2.3,action:()=>enterScene(e)}));
 for(const item of world.interactions){const p=item.object.getWorldPosition(new T.Vector3());entries.push({...item,distance:Math.hypot(state.x-p.x,state.z-p.z)});}
 nearest=entries.filter(i=>i.distance<=i.radius).sort((a,b)=>a.distance-b.distance)[0]||null;
}
async function activate(){if(!nearest||bridge.paused)return;clearInput();try{const result=await nearest.action?.();if(result?.kind==='seat'){state.seated=result;state.yaw=Math.atan2(result.directions[0][0],-result.directions[0][2]);toast('已坐下，拖动环顾，按 E 或 Esc 起身。');}else if(result?.message)toast(result.message);}catch(error){toast('操作未完成：'+error.message);}}
function jump(){if(state.mode==='walk'&&!bridge.paused&&!state.seated)avatar?.act('jump',groundAt(state.x,state.z));}
function updateCamera(dt){
 if(state.seated){camera.position.fromArray(state.seated.position);camera.lookAt(camera.position.x+Math.sin(state.yaw),camera.position.y-state.pitch,camera.position.z-Math.cos(state.yaw));return;}
 const ground=groundAt(state.x,state.z),height=avatar?.jumpHeight||0;aim.set(state.x,ground+1.12+height*.65,state.z);direction.set(-Math.sin(state.yaw)*5,1.7+state.pitch*3,Math.cos(state.yaw)*5).normalize();
 if(performance.now()-cameraCheck>90){ray.set(aim,direction);cameraDistance=5.3;for(const box of cameraBoxes){const hit=ray.ray.intersectBox(box,new T.Vector3());if(hit)cameraDistance=Math.min(cameraDistance,Math.max(.5,hit.distanceTo(aim)-.2));}cameraCheck=performance.now();}
 targetCamera.copy(aim).addScaledVector(direction,cameraDistance);camera.position.copy(targetCamera);camera.lookAt(aim);
}
function frame(){
 if(disposed)return;const dt=Math.min(clock.getDelta(),.10),paused=bridge.paused||document.hidden;
 if(state.ready){
  const oldX=state.x,oldZ=state.z;
  if(state.mode==='walk'&&!paused&&!state.seated&&!avatar.locksMovement){
   const forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),right=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
   if(forward||right){state.path=null;const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?3.2:1.65)*dt/Math.max(1,Math.hypot(forward,right));navigation.move(state,(Math.sin(state.yaw)*forward+Math.cos(state.yaw)*right)*speed,(-Math.cos(state.yaw)*forward+Math.sin(state.yaw)*right)*speed);}
   else if(state.path?.length){const goal=state.path[0],dx=goal.x-state.x,dz=goal.z-state.z,d=Math.hypot(dx,dz),distance=Math.min(d,dt*3.2);if(d<.10)state.path.shift();else{navigation.move(state,dx/d*distance,dz/d*distance);state.yaw=Math.atan2(dx,-dz);if(Math.hypot(state.x-oldX,state.z-oldZ)<.0001){state.path=null;toast('通路暂时受阻，请手动调整站位。');}}}
   state.yaw+=(Number(keys.has('KeyL'))-Number(keys.has('KeyJ')))*dt*1.6;
  }
  const dx=state.x-lastX,dz=state.z-lastZ,moving=Math.hypot(dx,dz)>.0001;if(moving){const angle=Math.atan2(dx,dz);studentYaw+=Math.atan2(Math.sin(angle-studentYaw),Math.cos(angle-studentYaw))*(1-Math.exp(-dt*18));}
  avatar.setVisible(!state.seated);avatar.update({position:{x:state.x,z:state.z,groundY:groundAt(state.x,state.z)},yaw:studentYaw,dt:paused?0:dt,moving:!paused&&moving,sprinting:keys.has('ShiftLeft')||keys.has('ShiftRight')||!!state.path});lastX=state.x;lastZ=state.z;
  world.update(paused?0:dt);if(state.mode==='overview')orbit.update();else updateCamera(dt);
  findNearest();$('#enter').disabled=!nearest;$('#enter').textContent=nearest?'E · '+nearest.label:'走近入口或互动设施';$('#jump').disabled=!!avatar.actionState.current||!!state.seated;
  $('#location').textContent=state.seated?'社交广场 · 休息':state.z<-15?'教学楼前庭':state.x<-20&&state.z<15?'图书馆前庭':state.x<-20&&state.z>=15?'自习室前庭':state.x>28?'竞技场':state.x>7&&state.z<14?'社交广场':'中央庭院';
  $('#instructions').textContent=state.mode==='overview'?'拖动旋转 · 滚轮缩放 · 进入漫游后可行走':state.seated?'拖动环顾 · E / Esc 起身':'WASD 移动 · Shift 快跑 · 空格跳跃 · E 互动';
  if(!paused&&(moving||avatar.actionState.current)&&performance.now()-lastShadow>110){renderer.shadowMap.needsUpdate=true;lastShadow=performance.now();}state.frames++;
 }renderer.render(scene,camera);
}
$('#overview').onclick=()=>setMode('overview');$('#walk').onclick=()=>setMode('walk');$('#directory').onclick=()=>{$('#places').hidden=!$('#places').hidden;};$('#enter').onclick=activate;$('#jump').onclick=()=>{jump();canvas.focus();};$('#quality').onchange=resize;$('#retry').onclick=()=>location.reload();
for(const entry of ENTRIES){const b=document.createElement('button');b.textContent=entry.label;b.dataset.place=entry.id;const span=document.createElement('span');span.textContent='前往';b.append(span);b.onclick=()=>goTo(entry.id);$('#destinations').append(b);}
addEventListener('keydown',e=>{
 if(e.target.closest?.('input,textarea,select,[contenteditable=true]')||bridge.paused)return;
 if(e.code==='Escape'){stand();clearInput();return;}
 if(state.mode!=='walk')return;
 if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyJ','KeyL'].includes(e.code)){if(e.target.closest?.('button,a'))return;e.preventDefault();keys.add(e.code);state.path=null;}
 if(['Space','KeyE'].includes(e.code)&&!e.target.closest?.('button,a')){e.preventDefault();if(!e.repeat){if(e.code==='Space')jump();else activate();}}
});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',clearInput);
canvas.onpointerdown=e=>{if(bridge.paused||state.mode!=='walk')return;canvas.focus();canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};};
canvas.onpointermove=e=>{if(drag?.id!==e.pointerId||bridge.paused)return;state.yaw+=(e.clientX-drag.x)*.004;state.pitch=T.MathUtils.clamp(state.pitch+(e.clientY-drag.y)*.003,-.45,.7);drag.x=e.clientX;drag.y=e.clientY;};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);state.path=null;};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key);}
addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{clearInput();clock.getDelta();if(state.ready)renderer.setAnimationLoop(document.hidden?null:frame);});
function dispose(){if(disposed)return;disposed=true;clearInput();clearTimeout(toastTimer);renderer.setAnimationLoop(null);bridge.dispose();avatar?.dispose();world?.dispose();orbit.dispose();sun.shadow.dispose();scene.environment?.dispose();if(scene.background?.isTexture)scene.background.dispose();renderer.dispose();renderer.forceContextLoss();}
addEventListener('pagehide',dispose);addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
async function init(){try{
 resize();const hdr=await new RGBELoader().loadAsync(new URL('../../../examples/campus-3d-v5/assets/sky.hdr',document.baseURI).href),pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(hdr).texture;scene.environmentIntensity=.5;hdr.mapping=T.EquirectangularReflectionMapping;scene.background=hdr;pmrem.dispose();
 world=await createWorld(scene,(...args)=>bridge.openFeature(...args),text=>$('#progress').textContent=text);navigation=createNavigation(world.boxes);
 cameraBoxes=world.boxes.map(b=>new T.Box3(new T.Vector3(b.minX,b.minY??0,b.minZ),new T.Vector3(b.maxX,b.maxY??(b.id?.startsWith('academy')?18:b.id==='library'?6:b.id==='study'?4.2:b.id==='bench'?.5:b.id==='lamp'?4:3),b.maxZ)));
 $('#progress').textContent='加载校园人物…';avatar=await createStudentAvatar(scene);
 const record=readReturn(sessionStorage);if(record){Object.assign(state,restorePose(record,navigation));state.returnRestored=!!record.pending;record.pending=false;sessionStorage.setItem(KEY,JSON.stringify(record));}studentYaw=Number.isFinite(record?.heading)?record.heading:Math.PI-state.yaw;lastX=state.x;lastZ=state.z;state.ready=true;
 setMode(record?'walk':'overview');avatar.update({position:{x:state.x,z:state.z,groundY:groundAt(state.x,state.z)},yaw:studentYaw,dt:0});avatar.setVisible(true);await renderer.compileAsync(scene,camera);renderer.shadowMap.needsUpdate=true;$('#loading').hidden=true;clock.getDelta();renderer.setAnimationLoop(frame);if(state.returnRestored)toast('已返回对应入口。');
 }catch(error){console.error(error);$('#loading strong').textContent='校园暂时无法加载';$('#progress').textContent=error.message;$('#retry').hidden=false;}}
window.__campusHub={snapshot:()=>({ready:state.ready,mode:state.mode,pos:[state.x,groundAt(state.x,state.z),state.z],yaw:state.yaw,path:state.path,modal:bridge.paused,returnRestored:state.returnRestored,seated:!!state.seated,frames:state.frames,entries:ENTRIES,nearest:nearest?.id||null,avatar:avatar?.snapshot(),boxes:world?.boxes.length,render:renderer.info.render}),route:id=>goTo(id),setPose:(x,z,yaw=0)=>{if(!navigation||navigation.blocked(x,z))return false;clearInput();setMode('walk');Object.assign(state,{x,z,yaw});lastX=x;lastZ=z;return true;},blocked:(x,z)=>navigation?.blocked(x,z),entry:id=>{const e=ENTRIES.find(e=>e.id===id);if(e)enterScene(e);},openFeature:(...args)=>bridge.openFeature(...args),dispose};
init();
