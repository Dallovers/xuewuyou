import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {createWorld} from './world.js';
import {createStudentAvatar} from './avatar.js';
import {createNavigation} from './navigation.js';
import {ENTRIES,SITE_EXIT,START,groundAt} from './layout.js';
import {readReturn,restorePose,KEY} from './return-state.js';
import {createBusinessBridge} from './business.js';
import {createVisualEffects} from './visual-effects.js';
import {createSkyEnvironment} from './sky-environment.js';
import {createCampusPresence} from './presence.js';

const $=selector=>document.querySelector(selector),canvas=$('#world'),scene=new T.Scene(),camera=new T.PerspectiveCamera(49,innerWidth/innerHeight,.1,350);
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.87;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
scene.background=new T.Color(0xd4ddd8);scene.fog=new T.Fog(0xd4ddd8,145,270);
const hemisphere=new T.HemisphereLight(0xe3edf1,0x686c5c,.36);scene.add(hemisphere);const sun=new T.DirectionalLight(0xffefd9,2.6);sun.position.set(-40,62,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.radius=2.2;Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:170});sun.shadow.normalBias=.016;sun.shadow.bias=-.00002;scene.add(sun);scene.add(sun.target);
const effects=createVisualEffects(renderer,scene,camera,sun);
const orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.minDistance=8;orbit.maxDistance=180;orbit.maxPolarAngle=Math.PI*.49;
const state={ready:false,mode:'overview',...START,seated:null,path:null,frames:0,returnRestored:false};
const keys=new Set(),clock=new T.Clock();let presence,studyPicker,pickerEnabled=false,world,avatar,sky,navigation,drag,nearest,disposed=false,toastTimer,lastShadow=0,studentYaw=0,lastX=0,lastZ=START.z,cameraCheck=0,cameraDistance=5.3,cameraBoxes=[];
const coarsePointer=matchMedia('(pointer:coarse)');
const ray=new T.Raycaster(),aim=new T.Vector3(),direction=new T.Vector3(),targetCamera=new T.Vector3();
const bridge=createBusinessBridge({clearInput,route:goTo,equipment:()=>world?.interiors.systems,status:()=>{if(bridge.paused)avatar?.cancelAction();syncControls();}});
function syncControls(){
 const walking=state.ready&&state.mode==='walk',paused=bridge.paused,seated=!!state.seated;
 $('#touch').hidden=!walking||seated||paused||!(coarsePointer.matches||innerWidth<700);
 $('#actions').hidden=!walking||seated||paused;
 $('#seat-tools').hidden=!seated||paused;
 $('#book-actions').hidden=!pickerEnabled||!studyPicker?.isHolding()||paused;
 if(document.body.dataset.seated!==String(seated))document.body.dataset.seated=String(seated);
}
function setPlaces(open,focus=false){
 clearInput();$('#places').hidden=!open;$('#directory').setAttribute('aria-expanded',String(open));document.body.dataset.placesOpen=String(open);
 if(focus)(open?$('#close-places'):$('#directory')).focus({preventScroll:true});
}
function measureHUD(){
 const headerBottom=Math.ceil($('.campus-toolbar').getBoundingClientRect().bottom),dockHeight=Math.ceil($('footer').getBoundingClientRect().height);
 document.documentElement.style.setProperty('--header-bottom',headerBottom+'px');document.documentElement.style.setProperty('--dock-height',dockHeight+'px');
}
const hudObserver=new ResizeObserver(measureHUD);hudObserver.observe($('.campus-toolbar'));hudObserver.observe($('footer'));
function clearInput(){keys.clear();drag=null;state.path=null;}
function focusScene(){if(state.ready&&state.mode==='walk'&&!bridge.paused&&!disposed)canvas.focus({preventScroll:true});}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);}
function resize(){const q=$('#quality').value,ratio=q==='high'?1.5:q==='fluid'?.8:innerWidth<700?.9:1;renderer.setPixelRatio(Math.min(devicePixelRatio,ratio));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();effects.resize(innerWidth,innerHeight,q);world?.courtyard.configureQuality(q,innerWidth);renderer.shadowMap.needsUpdate=true;syncControls();measureHUD();}
function setMode(mode){if(!state.ready)return;state.seated?.onStand?.();clearInput();avatar.cancelAction();state.seated=null;state.mode=mode;orbit.enabled=mode==='overview';$('#overview').setAttribute('aria-pressed',String(mode==='overview'));$('#walk').setAttribute('aria-pressed',String(mode==='walk'));syncControls();setPlaces(false);if(mode==='overview'){camera.position.set(56,57,68);orbit.target.set(3,1,-4);orbit.update();}else{canvas.focus();updateCamera(.1);}}
function stand(){if(!state.seated)return;state.seated.onStand?.();state.seated=null;clearInput();focusScene();toast('已起身');}
function goTo(id){if(!state.ready||bridge.paused)return;stand();setMode('walk');if(world.inside(state))world.interiors.open(world.inside(state),true);const entry=ENTRIES.find(e=>e.id===id)||(id===SITE_EXIT.id?SITE_EXIT:null);if(!entry)return;const goal={x:entry.outside[0],z:entry.outside[1]};const route=navigation.route(state,goal);if(!route){toast('暂时找不到通路，请换个站位重试。');return;}state.path=route;toast('正在前往'+entry.label+(id===SITE_EXIT.id?'，走近后按 E 返回网站。':'，走近后按 E 互动。'));}
function exitSite(){clearInput();try{sessionStorage.removeItem(KEY);}catch{}location.assign(new URL('../../../index.html#home',document.baseURI).href);return{ok:true};}
function findNearest(){
 nearest=null;if(!state.ready||state.mode!=='walk'||bridge.paused||avatar.actionState.current)return;
 if(pickerEnabled&&(studyPicker.isHolding()||studyPicker.getAim())){nearest={id:'study.pick',label:studyPicker.isHolding()?'放回 · '+studyPicker.getHeldLabel():'拿起 · '+studyPicker.getAim().label,action:()=>{studyPicker.isHolding()?studyPicker.putBack():studyPicker.take();return{ok:true};}};return;}
 if(state.seated){nearest={label:'起身继续行走',action:stand};return;}
 const entries=ENTRIES.map(e=>({id:e.id,label:'进入'+e.label,distance:Math.hypot(state.x-e.at[0],state.z-e.at[1]),radius:2.3,action:()=>world.enter(e.id)}));
 for(const item of world.interactions){if(item.disabled)continue;const p=item.object.getWorldPosition(new T.Vector3());entries.push({...item,distance:Math.hypot(state.x-p.x,state.z-p.z)});}
 nearest=entries.filter(i=>i.distance<=i.radius).sort((a,b)=>a.distance-b.distance)[0]||null;
}
async function activate(){if(!state.ready||bridge.paused)return;if(state.mode==='overview'){setMode('walk');toast('漫游已开启，走近设施后按 E，或点击底部互动按钮。');return;}if(!nearest)return;clearInput();try{const result=await nearest.action?.();if(result?.kind==='seat'){state.seated=result;state.pitch=0;state.yaw=Math.atan2(result.directions[0][0],-result.directions[0][2]);toast('已坐下，拖动环顾，按 E 或 Esc 起身。');}else if(result?.kind==='equipment'){bridge.openFeature('equipment');}else if(result?.kind==='note'){bridge.openFeature('note',{text:result.text});}else if(result?.message)toast(result.message);}catch(error){toast('操作未完成：'+error.message);}finally{focusScene();}}
function jump(){if(state.mode==='walk'&&!bridge.paused&&!state.seated)avatar?.act('jump',groundAt(state.x,state.z));}
function updateCamera(dt){
 if(!state.seated&&world?.inside(state)){camera.position.set(state.x,groundAt(state.x,state.z)+1.6+(avatar?.jumpHeight||0),state.z);camera.lookAt(state.x+Math.sin(state.yaw),camera.position.y-state.pitch,state.z-Math.cos(state.yaw));return;}
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
   if(forward||right){state.path=null;const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?6:3.6)*dt/Math.max(1,Math.hypot(forward,right));navigation.move(state,(Math.sin(state.yaw)*forward+Math.cos(state.yaw)*right)*speed,(-Math.cos(state.yaw)*forward+Math.sin(state.yaw)*right)*speed);}
   else if(state.path?.length){const goal=state.path[0],dx=goal.x-state.x,dz=goal.z-state.z,d=Math.hypot(dx,dz),distance=Math.min(d,dt*3.6);if(d<.10)state.path.shift();else{navigation.move(state,dx/d*distance,dz/d*distance);state.yaw=Math.atan2(dx,-dz);if(Math.hypot(state.x-oldX,state.z-oldZ)<.0001){state.path=null;toast('通路暂时受阻，请手动调整站位。');}}}
   state.yaw+=(Number(keys.has('KeyL'))-Number(keys.has('KeyJ')))*dt*1.6;
  }
  const dx=state.x-lastX,dz=state.z-lastZ,moving=Math.hypot(dx,dz)>.0001;if(moving){const angle=Math.atan2(dx,dz);studentYaw+=Math.atan2(Math.sin(angle-studentYaw),Math.cos(angle-studentYaw))*(1-Math.exp(-dt*18));}
  const inside=world.inside(state);hemisphere.intensity=inside?1.05:.36;avatar.setVisible(!state.seated&&!inside);avatar.update({position:{x:state.x,z:state.z,groundY:groundAt(state.x,state.z)},yaw:studentYaw,dt:paused?0:dt,moving:!paused&&moving,sprinting:keys.has('ShiftLeft')||keys.has('ShiftRight')||!!state.path});lastX=state.x;lastZ=state.z;
  world.update(paused?0:dt);effects.fitShadow(state);if(state.mode==='overview')orbit.update();else updateCamera(dt);
  if(inside==='study'&&!pickerEnabled){studyPicker?.enable();pickerEnabled=!!studyPicker;}else if(inside!=='study'&&pickerEnabled){studyPicker.disable();pickerEnabled=false;}
  if(pickerEnabled)studyPicker.update(paused?0:dt);
  $('#room-exit').hidden=!inside||bridge.paused;syncControls();
  findNearest();$('#enter').disabled=bridge.paused||(state.mode!=='overview'&&!nearest);$('#enter').textContent=state.mode==='overview'?'开始漫游 · 开启互动':nearest?'E · '+nearest.label:'走近设施后按 E 互动';$('#jump').disabled=!!avatar.actionState.current||!!state.seated;
  $('#location').textContent=inside?({classroom:'教学楼 · 门厅与示范教室',library:'知识图书馆',study:'自习室'})[inside]:state.seated?(state.seated.label||'社交广场 · 休息'):state.z<-15?'教学楼前庭':state.x<-20&&state.z<15?'图书馆前庭':state.x<-20&&state.z>=15?'自习室前庭':state.x>28?'竞技场':state.x>7&&state.z<14?'社交广场':'中央庭院';
  $('#instructions').textContent=state.mode==='overview'?'拖动旋转，滚轮缩放':state.seated?'拖动环顾，E / Esc 起身':(coarsePointer.matches||innerWidth<700)?'方向键移动，拖动画面转向':'WASD 移动 · Shift 快跑 · E 互动';
  if(!paused&&(moving||avatar.actionState.current||world.interiors.moving())&&performance.now()-lastShadow>110){renderer.shadowMap.needsUpdate=true;lastShadow=performance.now();}state.frames++;
 }presence?.update(dt);effects.render();
}
const roomExit=document.createElement('button');roomExit.id='room-exit';roomExit.hidden=true;roomExit.textContent='回庭院';roomExit.onclick=()=>goTo(world.inside(state)||'classroom');$('#context-actions').append(roomExit);
const seatTools=document.createElement('div');seatTools.id='seat-tools';seatTools.hidden=true;seatTools.setAttribute('role','group');seatTools.setAttribute('aria-label','座位工具');$('#context-actions').append(seatTools);
for(const [label,fn]of [['起身',stand],['课程 / 资料',()=>state.seated?.feature==='courses'?bridge.openFeature('courses'):bridge.openFeature('library',{mode:'catalog',seated:true})],['阅读计时',()=>bridge.openFeature('library',{mode:'focus',seated:true})],['书签摘记',()=>bridge.openFeature('library',{mode:'shelf',seated:true})],['自习房间',()=>bridge.openFeature('rooms')]]){const b=document.createElement('button');b.textContent=label;b.onclick=fn;seatTools.append(b);}
const bookActions=document.createElement('div');bookActions.id='book-actions';bookActions.hidden=true;bookActions.setAttribute('role','group');bookActions.setAttribute('aria-label','手中书本');$('#context-actions').append(bookActions);for(const [label,fn]of [['翻书 Q',()=>studyPicker.toggleOpen()],['举起细看',()=>studyPicker.setInspect(!studyPicker.isInspecting())],['放下 G',()=>studyPicker.drop()]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{fn();focusScene();};bookActions.append(b);}
$('#overview').onclick=()=>setMode('overview');$('#walk').onclick=()=>setMode('walk');$('#directory').onclick=()=>setPlaces($('#places').hidden,true);$('#close-places').onclick=()=>setPlaces(false,true);$('#controls-help').onclick=()=>{setPlaces(false);bridge.openFeature('controls');};$('#enter').onclick=activate;$('#jump').onclick=()=>{jump();canvas.focus();};$('#quality').onchange=()=>{resize();focusScene();};$('#retry').onclick=()=>location.reload();
for(const entry of [...ENTRIES,SITE_EXIT]){const b=document.createElement('button');b.textContent=entry.label;b.dataset.place=entry.id;const span=document.createElement('span');span.textContent='前往';b.append(span);b.onclick=()=>goTo(entry.id);$('#destinations').append(b);}
$('#site-exit').onclick=e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();exitSite();};
addEventListener('keydown',e=>{
 if(!state.ready||e.target.closest?.('input,textarea,select,[contenteditable=true]')||bridge.paused)return;
 if(e.code==='Escape'){if(!$('#places').hidden){e.preventDefault();setPlaces(false,true);return;}stand();clearInput();return;}
 if(state.mode!=='walk'){if(e.code==='KeyE'&&!e.repeat){e.preventDefault();activate();}return;}
 if(!e.repeat&&pickerEnabled&&['KeyQ','KeyR','KeyG'].includes(e.code)){e.preventDefault();if(e.code==='KeyQ')studyPicker.toggleOpen();else studyPicker.drop();return;}
 if(!e.repeat&&e.code==='KeyC'&&world.inside(state)==='study'){e.preventDefault();if(state.seated){stand();return;}const seats=world.interactions.filter(i=>i.id.startsWith('study.seat.')).map(i=>({i,d:i.object.getWorldPosition(new T.Vector3()).distanceTo(new T.Vector3(state.x,0,state.z))})).sort((a,b)=>a.d-b.d);if(seats[0]?.d<1.65){nearest=seats[0].i;activate();}return;}
 if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyJ','KeyL'].includes(e.code)){e.preventDefault();focusScene();keys.add(e.code);state.path=null;}
 if(e.code==='KeyE'||e.code==='Space'&&!e.target.closest?.('button,a')){e.preventDefault();if(!e.repeat){if(e.code==='Space')jump();else activate();}}
});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',clearInput);
canvas.onpointerdown=e=>{if(e.button===2&&pickerEnabled&&!bridge.paused){studyPicker.setInspect(true);return;}if(bridge.paused||state.mode!=='walk')return;canvas.focus();canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};};
canvas.onpointermove=e=>{if(drag?.id!==e.pointerId||bridge.paused)return;state.yaw+=(e.clientX-drag.x)*.004;state.pitch=T.MathUtils.clamp(state.pitch+(e.clientY-drag.y)*.003,-.45,.7);drag.x=e.clientX;drag.y=e.clientY;};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;studyPicker?.setInspect(false);};
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);state.path=null;};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key);}
addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{clearInput();studyPicker?.setInspect(false);clock.getDelta();if(state.ready)renderer.setAnimationLoop(document.hidden?null:frame);});
function dispose(){if(disposed)return;disposed=true;clearInput();clearTimeout(toastTimer);hudObserver.disconnect();renderer.setAnimationLoop(null);presence?.dispose();bridge.dispose();avatar?.dispose();studyPicker?.disable();world?.dispose();effects.dispose();sky?.dispose();orbit.dispose();sun.shadow.dispose();scene.environment?.dispose();if(scene.background?.isTexture)scene.background.dispose();renderer.dispose();renderer.forceContextLoss();}
addEventListener('pagehide',dispose);addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
async function init(){try{
 resize();const hdr=await new RGBELoader().loadAsync(new URL('../../../examples/campus-3d-v5/assets/sky.hdr',document.baseURI).href),pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(hdr).texture;scene.environmentIntensity=.5;sky=createSkyEnvironment(hdr);scene.add(sky.mesh);pmrem.dispose();
 world=await createWorld(scene,(name,options)=>name==='exit-site'?exitSite():bridge.openFeature(name,options),text=>$('#progress').textContent=text,()=>state);navigation=createNavigation(world.boxes);
 await import(new URL('../study/pick.js?campus=interiors6',document.baseURI).href);studyPicker=window.StudyDistrict.pick.createPicker({THREE:T,camera,root:world.study.root,scene,dom:canvas,colliders:world.study.colliders,externalInput:true});
 world.courtyard.configureQuality($('#quality').value,innerWidth);
 cameraBoxes=[...world.boxes,...world.cameraObstacles].map(b=>new T.Box3(new T.Vector3(b.minX,b.minY??0,b.minZ),new T.Vector3(b.maxX,b.maxY??(b.id?.startsWith('academy')?18:b.id==='library'?6:b.id==='study'?4.2:b.id==='bench'?.5:b.id==='lamp'?4:3),b.maxZ)));
 $('#progress').textContent='加载校园人物…';avatar=await createStudentAvatar(scene);
 const record=readReturn(sessionStorage);if(record){Object.assign(state,restorePose(record,navigation));state.returnRestored=!!record.pending;record.pending=false;sessionStorage.setItem(KEY,JSON.stringify(record));}studentYaw=Number.isFinite(record?.heading)?record.heading:Math.PI-state.yaw;lastX=state.x;lastZ=state.z;state.ready=true;
 setMode(record?'walk':'overview');avatar.update({position:{x:state.x,z:state.z,groundY:groundAt(state.x,state.z)},yaw:studentYaw,dt:0});avatar.setVisible(true);await renderer.compileAsync(scene,camera);renderer.shadowMap.needsUpdate=true;
 presence=createCampusPresence({scene,camera,getPose:()=>({x:state.x,y:groundAt(state.x,state.z),z:state.z,yaw:studentYaw,height:avatar.jumpHeight,time:avatar.actionState.elapsed,clip:bridge.paused||state.seated?'idle':avatar.clip,avatar:avatar.variant,studying:bridge.paused||!!state.seated}),setSpawn:(p,sent)=>{if(Math.hypot(state.x-sent.x,state.z-sent.z)<.2&&!navigation.blocked(p.x,p.z)){state.x=p.x;state.z=p.z;lastX=p.x;lastZ=p.z;}},openAccount:()=>bridge.openFeature('account'),shadowChanged:()=>{renderer.shadowMap.needsUpdate=true;}});
 $('#loading').hidden=true;clock.getDelta();renderer.setAnimationLoop(frame);if(state.returnRestored)toast('已返回对应入口。');
 }catch(error){console.error(error);$('#loading strong').textContent='校园暂时无法加载';$('#progress').textContent=error.message;$('#retry').hidden=false;}}
window.__campusHub={snapshot:()=>({ready:state.ready,mode:state.mode,pos:[state.x,groundAt(state.x,state.z),state.z],yaw:state.yaw,path:state.path,modal:bridge.paused,returnRestored:state.returnRestored,seated:!!state.seated,frames:state.frames,interior:world?.inside(state),rooms:world?.interiors.snapshot(),picker:studyPicker?{held:studyPicker.isHolding(),open:studyPicker.isBookOpen(),aim:studyPicker.getAim()}:null,entries:ENTRIES,nearest:nearest?.id||null,avatar:avatar?.snapshot(),boxes:world?.boxes.length,render:renderer.info.render}),route:id=>goTo(id),setPose:(x,z,yaw=0,pitch=0)=>{if(!navigation||navigation.blocked(x,z))return false;clearInput();setMode('walk');Object.assign(state,{x,z,yaw,pitch});lastX=x;lastZ=z;return true;},blocked:(x,z)=>navigation?.blocked(x,z),entry:id=>world?.enter(id),openFeature:(...args)=>bridge.openFeature(...args),dispose};
window.__campusHub.studyObjects=()=>{const out=[];world?.study.root.updateMatrixWorld(true);world?.study.root.traverse(n=>{if(n.userData.pickables)for(const ids of n.userData.pickables.groups.slice(0,16)){const m=new T.Matrix4();n.getMatrixAt(ids[0],m);out.push({label:n.userData.pickables.label,position:new T.Vector3().setFromMatrixPosition(m).applyMatrix4(n.matrixWorld).toArray()});}});return out;};
window.__campusHub.interactions=()=>world?.interactions.map(i=>({id:i.id,label:i.label,position:i.object.getWorldPosition(new T.Vector3()).toArray(),radius:i.radius}));
window.__campusHub.courtyard=()=>world?.courtyard.snapshot();
window.__campusHub.districts=()=>world?.districts.map(d=>{
 const features={},plaqueNormals=[];d.root.updateMatrixWorld(true);
 d.root.traverse(n=>{if(n.name==='arena:podium'||n.name==='arena:rope'||n.name==='site:lawn'||n.name.startsWith('dressing:'))features[n.name]=(features[n.name]||0)+1;if(n.name==='arena:podium-plaque-face')plaqueNormals.push(new T.Vector3(0,0,1).transformDirection(n.matrixWorld).toArray());});
 const front=d.root.getObjectByName('Social courtyard-facing service pavilion');
 return{name:d.root.name,features,plaqueNormals,serviceFacing:front?new T.Vector3(1,0,0).transformDirection(front.matrixWorld).toArray():null,interactions:d.interactions?.map(i=>({id:i.id,disabled:!!i.disabled,position:i.object.getWorldPosition(new T.Vector3()).toArray()}))};
});
window.__campusHub.visuals=()=>({...effects.snapshot(),memory:{...renderer.info.memory},programs:renderer.info.programs.length,water:world?.courtyard.snapshot().water,paving:world?.pavingSnapshot()});
window.__campusHub.presence=()=>presence?.snapshot();
init();
