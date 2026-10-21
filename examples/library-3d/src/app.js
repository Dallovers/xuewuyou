import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createRendering} from './rendering.js';
import {building,materials as libraryMaterials,loadMaterials,createBuilding,reviewGlass,setR1Look,r1ReviewResources,colliders,shelves,seats,dimensions} from './architecture.js';
import {blocked,move,indexColliders} from './navigation.js';
import {initCatalog} from './catalog.js';
import {treeDetail,setTreeDetail,updateTreeDetail,representativeTree,disposeLandscape} from './landscape.js';
import {createR1Lighting} from './r1-lighting.js';
import {createInteractionGuide} from './interaction-guide.js';
import {createReadingActivities} from './reading-activities.js';
const $=id=>document.getElementById(id),canvas=$('world');
const scene=new T.Scene(),camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.08,180);
const graphics=createRendering(canvas,scene,camera),{renderer}=graphics;
const orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.minDistance=1;orbit.maxDistance=75;orbit.maxPolarAngle=Math.PI*.91;
const state={ready:false,mode:'inspect',view:'exterior',pos:new T.Vector3(0,0,14),yaw:0,pitch:0,seated:null,seatReturn:null,modal:false,nearest:null,frames:0};
const keys=new Set();let door,r1Light,r1Lighting,catalog,guide,activities,targets=[],drag=null,toastTimer,lastShadow=0,doorWasMoving=false,disposed=false;
const presets={exterior:{eye:[25,10.5,30],target:[0,2.2,1]},hall:{eye:[1.7,1.78,6.7],target:[-3.6,1.5,-3.6]},reading:{eye:[2.1,1.78,6.6],target:[7.8,1.3,-2.5]},sample:{eye:[2.7,1.7,-5.2],target:[9,1.25,-4.6]},sampleTree:{eye:[23,3,4],target:[16,3.6,-4]},chair:{eye:[4.55,1.0,-7.1],target:[5.62,.48,-5.63]},treeFar:{eye:[39,4.5,22],target:[16,3.7,-4]}};
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4200);}
function clearInput(){keys.clear();drag=null;}
function pause(){state.modal=true;clearInput();orbit.enabled=false;$('interact').hidden=true;guide?.update(performance.now(),true);activities?.sync();}
function resume(){if(disposed||document.querySelector('dialog[open]'))return;state.modal=false;clearInput();orbit.enabled=state.mode==='inspect';if(state.mode==='walk')canvas.focus();nearby();activities?.sync();guide?.update(performance.now(),true);}
function locationName(){if(state.seated)return state.seated.label;if(state.pos.z>9)return '图书馆前庭';if(state.pos.z>4.5)return '入口门厅';return state.pos.x<-.8?'馆藏书架区':state.pos.x>2.5?'窗边阅览区':'中央通道';}
function updateCamera(){camera.position.set(state.pos.x,state.seated?1.18:1.65,state.pos.z);camera.rotation.order='YXZ';camera.rotation.set(state.pitch,state.yaw,0);}
function stand(){if(!state.seated)return;activities?.sync();const fallback=state.seated.approach,p=state.seatReturn&&!blocked(state.seatReturn.x,state.seatReturn.z)?state.seatReturn:fallback;state.pos.set(p.x,0,p.z);state.seated=null;state.seatReturn=null;$('touch').hidden=!(matchMedia('(pointer:coarse)').matches||innerWidth<700);$('stand').hidden=true;$('seat-status').textContent='开放阅览';clearInput();updateCamera();activities?.sync();toast('已站起，可以继续漫游');}
function setView(id){if(state.modal||!presets[id])return;stand();state.mode='inspect';document.body.dataset.mode='inspect';state.nearest=null;state.view=id;clearInput();orbit.enabled=true;camera.position.fromArray(presets[id].eye);orbit.target.fromArray(presets[id].target);orbit.update();$('walk').textContent='进入漫游';$('crosshair').hidden=true;$('touch').hidden=true;$('interact').hidden=true;$('help').textContent='点击标记查阅或入座 · 拖动旋转 · 滚轮缩放';$('location').textContent=({exterior:'图书馆前庭',hall:'馆藏书架区',reading:'窗边阅览区',sample:'窗边阅览区',sampleTree:'图书馆侧庭',chair:'窗边阅览区',treeFar:'图书馆侧庭'})[id];document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===id)));}
function walk(){if(!state.ready||state.modal)return;if(state.mode==='walk'){setView('exterior');return;}state.mode='walk';document.body.dataset.mode='walk';orbit.enabled=false;clearInput();state.seated=null;state.pos.set(state.view!=='exterior'?1.7:0,0,state.view!=='exterior'?6.7:14);state.yaw=0;state.pitch=0;$('walk').textContent='结束漫游';$('crosshair').hidden=false;$('touch').hidden=!(matchMedia('(pointer:coarse)').matches||innerWidth<700);$('help').textContent='WASD / 方向键移动 · 拖动看向 · J/L 转向 · E 操作 · Esc 站起';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));canvas.focus();updateCamera();toast('有文字标记的地方可以互动。走近后按 E 或点击标记。');}
function createTargets(){
 const anchor=(x,y,z)=>new T.Vector3(x,y,z);
 return [
  {id:'door',kind:'door',label:'入口玻璃门',short:'入口 · 开关门',description:'走近按 E 开门或关门',action:'开关玻璃门',anchor:anchor(0,1.4,10.9),approach:{x:0,z:9},range:2.5},
  ...shelves.map(s=>({id:'shelf-'+s.id,kind:'shelf',shelf:s,label:s.label,short:s.label,description:'查看对应分类的真实资料',action:'查看 '+s.label,anchor:anchor(s.x,1.65,s.z+.32),approach:s.approach,range:1.55})),
  ...seats.map(s=>({id:'seat-'+s.id,kind:'seat',seat:s,label:s.label,short:'坐下 · '+s.id,description:'坐下选资料，也可开启阅读计时',action:'坐下 · '+s.label,anchor:anchor(s.x,.95,s.z),approach:s.approach,range:1.12})),
  ...[-4.5,1.3].map((z,i)=>({id:'book-R'+(i+1),kind:'book',label:'桌上导读书 · R'+(i+1),short:'翻开导读书',description:'从本地馆藏挑一份资料打开阅读',action:'翻开桌上导读书',anchor:anchor(7.15,.95,z+.35),approach:{x:7.15,z:z+2.18},range:1.35})),
  {id:'desk',kind:'desk',label:'馆藏检索台',short:'馆藏检索台',description:'按分类、学科和关键词查找资料',action:'使用馆藏检索台',anchor:anchor(-7,1.5,6.8),approach:{x:-7,z:7.25},range:1.55}
 ];
}
function activateTarget(t){if(disposed||!state.ready||state.modal)return;
 if(state.mode==='walk'&&!guide.isReachable(t,state)){guide.select(t);toast('走近 '+t.label+' 后再互动');return;}
 if(t.kind==='seat'&&state.mode==='inspect'){
  if(blocked(t.approach.x,t.approach.z)){toast('这个座位的通道暂时不可用，请选择其他座位');return;}
  walk();state.pos.set(t.approach.x,0,t.approach.z);updateCamera();
 }
 guide.clear();interact({...t,label:t.action,targetId:t.id});
}
function nearby(){
 if(state.mode!=='walk'||state.modal){state.nearest=null;$('interact').hidden=true;return;}
 if(state.seated){state.nearest={kind:'read',label:'查找资料开始阅读',distance:0};}
 else{
  const candidates=[];
  for(const t of targets){const d=Math.hypot(state.pos.x-t.approach.x,state.pos.z-t.approach.z);if(d<t.range)candidates.push({...t,label:t.kind==='door'?(door.target?'关闭':'打开')+'入口玻璃门':t.action,targetId:t.id,distance:d});}
  const selected=guide?.selectedId;candidates.sort((a,b)=>Number(b.targetId===selected)-Number(a.targetId===selected)||a.distance-b.distance);state.nearest=candidates[0]||null;
 }
 $('interact').hidden=!state.nearest||!!state.seated;if(state.nearest)$('interact').textContent='E · '+state.nearest.label;
}
function interact(target){if(!state.ready||state.modal)return;const n=target||state.nearest;if(!n)return;
 if(n.kind==='door'){if(door.target&&Math.abs(state.pos.x)<1.8&&Math.abs(state.pos.z-9)<.7){toast('请先离开门口，再关闭入口');return;}door.target=door.target?0:1;}
 if(n.kind==='shelf')catalog.open(n.shelf.id);
 if(n.kind==='read')catalog.open();
 if(n.kind==='desk')catalog.open();
 if(n.kind==='book')activities.openBook();
 if(n.kind==='seat'){state.seatReturn={x:state.pos.x,z:state.pos.z};state.seated=n.seat;state.pos.set(n.seat.x,0,n.seat.z);state.yaw=n.seat.yaw;state.pitch=-.1;clearInput();$('stand').hidden=false;$('touch').hidden=true;$('seat-status').textContent=n.seat.label+' · 已入座';updateCamera();toast('已坐下。按 E 查找资料，Esc 或「站起」离座。');}
 nearby();
 activities?.sync();guide?.update(performance.now(),true);
}
async function modelBuffer(){const policy=treeDetail().policy;setTreeDetail('near');try{building.updateMatrixWorld(true);return await new GLTFExporter().parseAsync(building,{binary:true,onlyVisible:true,trs:false});}finally{setTreeDetail(policy);}}
async function treeModelBuffer(detail='far'){const tree=representativeTree(detail);if(!tree)throw Error('Unknown tree variant');return new GLTFExporter().parseAsync(tree,{binary:true,onlyVisible:true,trs:false});}
async function exportModel(){const button=$('export');button.disabled=true;try{const buffer=await modelBuffer(),url=URL.createObjectURL(new Blob([buffer],{type:'model/gltf-binary'})),a=document.createElement('a');a.href=url;a.download='wenku-library.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(r1Lighting?.snapshot().enabled?'已导出几何与材质，窗边烘焙图需配套保留':'已导出可编辑 GLB，包含分组几何与内嵌材质');}catch(e){toast('模型导出失败：'+e.message);}finally{button.disabled=false;}}
$('walk').onclick=walk;$('catalog').onclick=()=>catalog?.open();$('interact').onclick=()=>interact();$('stand').onclick=stand;$('export').onclick=exportModel;$('quality').onchange=()=>graphics.quality($('quality').value);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
const inputTarget=e=>!!e.target.closest?.('dialog,input,textarea,select,button,a');
addEventListener('keydown',e=>{if(state.modal)return;if(e.code==='Escape'&&state.seated&&!e.target.closest?.('input,textarea,select')){e.preventDefault();stand();clearInput();canvas.focus();return;}if(inputTarget(e))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyJ','KeyL','KeyI','KeyK','Space'].includes(e.code)&&state.mode==='walk'){e.preventDefault();keys.add(e.code);}if(e.repeat)return;if(e.code==='KeyE')interact();if(e.code==='Escape'){stand();clearInput();}if(e.code==='KeyV')setView('exterior');});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',clearInput);
canvas.addEventListener('pointerdown',e=>{if(state.mode!=='walk'||state.modal)return;canvas.focus();canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||state.modal)return;state.yaw-=(e.clientX-drag.x)*.004;state.pitch=T.MathUtils.clamp(state.pitch-(e.clientY-drag.y)*.003,-1.05,1.05);drag.x=e.clientX;drag.y=e.clientY;});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{if(state.modal)return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(b.dataset.key);}
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();graphics.resize();if(state.mode==='walk')$('touch').hidden=!!state.seated||!(matchMedia('(pointer:coarse)').matches||innerWidth<700);},120);});
const clock=new T.Clock();
function frame(){const actualDelta=clock.getDelta(),dt=Math.min(actualDelta,.06);graphics.frameTime(actualDelta*1000,!document.hidden&&!state.modal);
 if(!state.modal&&state.mode==='walk'){
  if(!state.seated){const f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),r=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),scale=2.8*dt/Math.max(1,Math.hypot(f,r));move(state.pos,(-Math.sin(state.yaw)*f+Math.cos(state.yaw)*r)*scale,(-Math.cos(state.yaw)*f-Math.sin(state.yaw)*r)*scale);}
  state.yaw+=((keys.has('KeyJ')?1:0)-(keys.has('KeyL')?1:0))*dt*1.2;state.pitch=T.MathUtils.clamp(state.pitch+((keys.has('KeyI')?1:0)-(keys.has('KeyK')?1:0))*dt*.8,-1.05,1.05);updateCamera();$('location').textContent=locationName();nearby();
 }else if(state.mode==='inspect'&&!state.modal)orbit.update();
 if(door){const moving=Math.abs(door.open-door.target)>.001;if(moving){door.open=T.MathUtils.damp(door.open,door.target,6,dt);if(Math.abs(door.open-door.target)<.001)door.open=door.target;for(const {leaf,s} of door.leaves)leaf.position.x=s*(.7+door.open*1.38);door.collider.disabled=door.open>.94;if(performance.now()-lastShadow>120){graphics.shadow();lastShadow=performance.now();}}if(!moving&&doorWasMoving)graphics.shadow();doorWasMoving=moving;}
 if(!state.modal||doorWasMoving){updateTreeDetail(camera);graphics.render();}guide?.update();state.frames++;
}
function modelStats(){let meshes=0,triangles=0,instances=0,landscape=null;const materials=new Set();building.traverse(n=>{if(n.userData.foliageInstances)landscape=n.userData;if(n.isMesh){for(let p=n;p;p=p.parent)if(!p.visible)return;meshes++;triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3*(n.isInstancedMesh?n.count:1);if(n.isInstancedMesh)instances+=n.count;materials.add(n.material.name);}});return {meshes,triangles,instances,materials:[...materials],groups:building.children.map(g=>g.name),dimensions,colliders:colliders.length,shelves:shelves.length,seats:seats.length,landscape};}
function dispose(){if(disposed)return;disposed=true;renderer.setAnimationLoop(null);guide?.dispose();activities?.dispose();r1Lighting?.dispose();catalog?.dispose();clearInput();clearTimeout(toastTimer);clearTimeout(resizeTimer);orbit.dispose();const geometries=new Set(),materials=new Set(),textures=new Set();building.traverse(n=>{if(!n.isMesh)return;geometries.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});const review=r1ReviewResources();review.textures.forEach(t=>textures.add(t));review.materials.forEach(m=>materials.add(m));scene.traverse(n=>n.shadow?.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());disposeLandscape();scene.environment?.dispose();scene.background?.dispose();graphics.composer.passes.forEach(p=>p.dispose?.());graphics.composer.dispose();renderer.dispose();}
document.addEventListener('visibilitychange',()=>{clearInput();clock.getDelta();if(state.ready&&!disposed)renderer.setAnimationLoop(document.hidden?null:frame);});addEventListener('pagehide',e=>{if(!e.persisted)dispose();else renderer.setAnimationLoop(null);});addEventListener('pageshow',()=>{if(state.ready&&!disposed)renderer.setAnimationLoop(frame);});
async function waitForWarmGPU(){const gl=renderer.getContext();if(!gl.fenceSync)return;const sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();try{const start=performance.now();while(!disposed&&performance.now()-start<15000){const status=gl.clientWaitSync(sync,0,0);if(status!==gl.TIMEOUT_EXPIRED)break;await new Promise(resolve=>setTimeout(resolve,16));}}finally{gl.deleteSync(sync);}}
async function init(){try{
 await loadMaterials();scene.add(building);({door,r1Light}=createBuilding());indexColliders();
 const hdr=await new RGBELoader().loadAsync(new URL('../campus-3d-v5/assets/sky.hdr',document.baseURI).href);hdr.mapping=T.EquirectangularReflectionMapping;scene.background=hdr;scene.backgroundIntensity=.9;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(hdr).texture;scene.environmentIntensity=.4;pmrem.dispose();
 scene.add(new T.HemisphereLight(0xe0ebf0,0xa89d82,.38));scene.fog=new T.Fog(0xdce2de,65,135);
 const sun=new T.DirectionalLight(0xfff1dc,2.65);sun.position.set(18,23,17);sun.target.position.set(0,0,0);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-27,right:27,top:24,bottom:-22,near:1,far:90});sun.shadow.normalBias=.025;sun.shadow.bias=-.00016;scene.add(sun);graphics.watchSun(sun);
 for(const z of [-4,3]){const light=new T.PointLight(0xfff0d7,16,15,2);light.position.set(5,3.5,z);scene.add(light);}
 r1Lighting=createR1Lighting({building,materials:libraryMaterials,renderer,shadow:()=>graphics.shadow()});await r1Lighting.load();if(disposed)return;
 catalog=await initCatalog({pause,resume,report:toast});targets=createTargets();
 guide=createInteractionGuide({scene,camera,building,targets,getState:()=>state,activate:activateTarget,report:toast});
 activities=createReadingActivities({catalog,getState:()=>state,pause,resume,report:toast});
 const view=new URLSearchParams(location.search).get('view');setView(Object.hasOwn(presets,view)?view:'exterior');$('quality').value=graphics.stats().quality;
 const requestedView=state.view;
 if(r1Lighting.snapshot().enabled){setView('sample');await renderer.compileAsync(scene,camera);if(disposed)return;graphics.shadow();graphics.render();await waitForWarmGPU();if(disposed)return;setView(requestedView);}
 await renderer.compileAsync(scene,camera);if(disposed)return;graphics.shadow();graphics.render();await waitForWarmGPU();if(disposed)return;state.ready=true;$('loading').hidden=true;renderer.setAnimationLoop(frame);
 }catch(e){console.error(e);$('loading').querySelector('h2').textContent='图书馆加载失败';$('loading').querySelector('p').textContent=e.message+'。请使用 node server.mjs 启动后刷新。';}}
// Read-only diagnostics plus explicit pose/move operations used by reproducible browser acceptance tests.
window.__library={snapshot:()=>({ready:state.ready,mode:state.mode,pos:state.pos.toArray(),yaw:state.yaw,seated:state.seated?.id||null,modal:state.modal,nearest:state.nearest?.kind||null,door:door?{open:door.open,target:door.target,blocked:!door.collider.disabled}:null,frames:state.frames,catalog:catalog?.snapshot()}),performance:()=>graphics.stats(),modelStats,reviewGlass,reviewR1:mode=>{const result=setR1Look(mode);if(result){r1Light.intensity=result.localFillCandela;graphics.shadow();}return result;},treeDetail,setTreeDetail,treeModelBuffer,setView,walk,interact,stand,blocked,move:(dx,dz)=>{if(!state.modal&&!state.seated)move(state.pos,dx,dz);},setPose:(x,z,yaw=0)=>{if(state.modal||blocked(x,z))return false;stand();state.mode='walk';document.body.dataset.mode='walk';orbit.enabled=false;state.pos.set(x,0,z);state.yaw=yaw;state.pitch=0;clearInput();updateCamera();nearby();return true;},shelves:()=>shelves,seats:()=>seats,exportModel,modelBuffer,dispose};
const legacyR1Review=window.__library.reviewR1;
window.__library.reviewR1=mode=>{r1Lighting?.setEnabled(false);return legacyR1Review(mode);};
window.__library.reviewBake=enabled=>r1Lighting?.setEnabled(enabled);
window.__library.bake=()=>r1Lighting?.snapshot();
window.__library.interactions=()=>guide?.snapshot();
window.__library.activities=()=>activities?.snapshot();
init();
