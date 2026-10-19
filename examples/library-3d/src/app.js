import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createRendering} from './rendering.js';
import {building,loadMaterials,createBuilding,colliders,shelves,seats,dimensions} from './architecture.js';
import {blocked,move,indexColliders} from './navigation.js';
import {initCatalog} from './catalog.js';
const $=id=>document.getElementById(id),canvas=$('world');
const scene=new T.Scene(),camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.08,180);
const graphics=createRendering(canvas,scene,camera),{renderer}=graphics;
const orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.minDistance=1;orbit.maxDistance=75;orbit.maxPolarAngle=Math.PI*.91;
const state={ready:false,mode:'inspect',view:'exterior',pos:new T.Vector3(0,0,14),yaw:0,pitch:0,seated:null,seatReturn:null,modal:false,nearest:null,frames:0};
const keys=new Set();let door,catalog,drag=null,toastTimer,lastShadow=0,doorWasMoving=false,disposed=false;
const presets={exterior:{eye:[25,10.5,30],target:[0,2.2,1]},hall:{eye:[1.7,1.78,6.7],target:[-3.6,1.5,-3.6]},reading:{eye:[2.1,1.78,6.6],target:[7.8,1.3,-2.5]}};
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4200);}
function clearInput(){keys.clear();drag=null;}
function pause(){state.modal=true;clearInput();orbit.enabled=false;$('interact').hidden=true;}
function resume(){state.modal=false;clearInput();orbit.enabled=state.mode==='inspect';if(state.mode==='walk')canvas.focus();}
function locationName(){if(state.seated)return state.seated.label;if(state.pos.z>9)return '图书馆前庭';if(state.pos.z>4.5)return '入口门厅';return state.pos.x<-.8?'馆藏书架区':state.pos.x>2.5?'窗边阅览区':'中央通道';}
function updateCamera(){camera.position.set(state.pos.x,state.seated?1.18:1.65,state.pos.z);camera.rotation.order='YXZ';camera.rotation.set(state.pitch,state.yaw,0);}
function stand(){if(!state.seated)return;const fallback=state.seated.approach,p=state.seatReturn&&!blocked(state.seatReturn.x,state.seatReturn.z)?state.seatReturn:fallback;state.pos.set(p.x,0,p.z);state.seated=null;state.seatReturn=null;$('stand').hidden=true;$('seat-status').textContent='开放阅览';clearInput();updateCamera();toast('已站起，可以继续漫游');}
function setView(id){if(state.modal||!presets[id])return;stand();state.mode='inspect';state.view=id;clearInput();orbit.enabled=true;camera.position.fromArray(presets[id].eye);orbit.target.fromArray(presets[id].target);orbit.update();$('walk').textContent='进入漫游';$('crosshair').hidden=true;$('touch').hidden=true;$('interact').hidden=true;$('help').textContent='拖动旋转 · 滚轮缩放 · 进入漫游后可操作书架和座位';$('location').textContent=({exterior:'图书馆前庭',hall:'馆藏书架区',reading:'窗边阅览区'})[id];document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===id)));}
function walk(){if(!state.ready||state.modal)return;if(state.mode==='walk'){setView('exterior');return;}state.mode='walk';orbit.enabled=false;clearInput();state.seated=null;state.pos.set(state.view!=='exterior'?1.7:0,0,state.view!=='exterior'?6.7:14);state.yaw=0;state.pitch=0;$('walk').textContent='结束漫游';$('crosshair').hidden=false;$('touch').hidden=!(matchMedia('(pointer:coarse)').matches||innerWidth<700);$('help').textContent='WASD / 方向键移动 · 拖动看向 · J/L 转向 · E 操作 · Esc 站起';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));canvas.focus();updateCamera();toast('走近入口按 E 开门。书架可检索，阅览位可坐下。');}
function nearby(){
 if(state.mode!=='walk'||state.modal){state.nearest=null;$('interact').hidden=true;return;}
 if(state.seated){state.nearest={kind:'read',label:'查找资料开始阅读',distance:0};}
 else{
  const candidates=[],distance=p=>Math.hypot(state.pos.x-p.x,state.pos.z-p.z);
  const d=distance({x:0,z:9});if(d<2.5)candidates.push({kind:'door',label:(door.target?'关闭':'打开')+'入口玻璃门',distance:d});
  for(const s of shelves){const d=distance(s.approach);if(d<1.55)candidates.push({kind:'shelf',shelf:s,label:'查看 '+s.label,distance:d});}
  for(const s of seats){const d=distance(s.approach);if(d<1.12)candidates.push({kind:'seat',seat:s,label:'坐下 · '+s.label,distance:d});}
  candidates.sort((a,b)=>a.distance-b.distance);state.nearest=candidates[0]||null;
 }
 $('interact').hidden=!state.nearest;if(state.nearest)$('interact').textContent='E · '+state.nearest.label;
}
function interact(){if(!state.ready||state.modal)return;const n=state.nearest;if(!n)return;
 if(n.kind==='door'){if(door.target&&Math.abs(state.pos.x)<1.8&&Math.abs(state.pos.z-9)<.7){toast('请先离开门口，再关闭入口');return;}door.target=door.target?0:1;}
 if(n.kind==='shelf')catalog.open(n.shelf.id);
 if(n.kind==='read')catalog.open();
 if(n.kind==='seat'){state.seatReturn={x:state.pos.x,z:state.pos.z};state.seated=n.seat;state.pos.set(n.seat.x,0,n.seat.z);state.yaw=n.seat.yaw;state.pitch=-.1;clearInput();$('stand').hidden=false;$('seat-status').textContent=n.seat.label+' · 已入座';updateCamera();toast('已坐下。按 E 查找资料，Esc 或「站起」离座。');}
 nearby();
}
async function modelBuffer(){building.updateMatrixWorld(true);return new GLTFExporter().parseAsync(building,{binary:true,onlyVisible:true,trs:false});}
async function exportModel(){const button=$('export');button.disabled=true;try{const buffer=await modelBuffer(),url=URL.createObjectURL(new Blob([buffer],{type:'model/gltf-binary'})),a=document.createElement('a');a.href=url;a.download='wenku-library.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出可编辑 GLB，包含分组几何与内嵌材质');}catch(e){toast('模型导出失败：'+e.message);}finally{button.disabled=false;}}
$('walk').onclick=walk;$('catalog').onclick=()=>catalog?.open();$('interact').onclick=interact;$('stand').onclick=stand;$('export').onclick=exportModel;$('quality').onchange=()=>graphics.quality($('quality').value);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
const inputTarget=e=>!!e.target.closest?.('dialog,input,textarea,select,button,a');
addEventListener('keydown',e=>{if(state.modal||inputTarget(e))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyJ','KeyL','KeyI','KeyK','Space'].includes(e.code)&&state.mode==='walk'){e.preventDefault();keys.add(e.code);}if(e.repeat)return;if(e.code==='KeyE')interact();if(e.code==='Escape'){stand();clearInput();}if(e.code==='KeyV')setView('exterior');});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',clearInput);
canvas.addEventListener('pointerdown',e=>{if(state.mode!=='walk'||state.modal)return;canvas.focus();canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||state.modal)return;state.yaw-=(e.clientX-drag.x)*.004;state.pitch=T.MathUtils.clamp(state.pitch-(e.clientY-drag.y)*.003,-1.05,1.05);drag.x=e.clientX;drag.y=e.clientY;});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{if(state.modal)return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(b.dataset.key);}
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();graphics.resize();if(state.mode==='walk')$('touch').hidden=!(matchMedia('(pointer:coarse)').matches||innerWidth<700);},120);});
const clock=new T.Clock();
function frame(){const actualDelta=clock.getDelta(),dt=Math.min(actualDelta,.06);graphics.frameTime(actualDelta*1000,!document.hidden&&!state.modal);
 if(!state.modal&&state.mode==='walk'){
  if(!state.seated){const f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),r=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),scale=2.8*dt/Math.max(1,Math.hypot(f,r));move(state.pos,(-Math.sin(state.yaw)*f+Math.cos(state.yaw)*r)*scale,(-Math.cos(state.yaw)*f-Math.sin(state.yaw)*r)*scale);}
  state.yaw+=((keys.has('KeyJ')?1:0)-(keys.has('KeyL')?1:0))*dt*1.2;state.pitch=T.MathUtils.clamp(state.pitch+((keys.has('KeyI')?1:0)-(keys.has('KeyK')?1:0))*dt*.8,-1.05,1.05);updateCamera();$('location').textContent=locationName();nearby();
 }else if(state.mode==='inspect'&&!state.modal)orbit.update();
 if(door){const moving=Math.abs(door.open-door.target)>.001;if(moving){door.open=T.MathUtils.damp(door.open,door.target,6,dt);if(Math.abs(door.open-door.target)<.001)door.open=door.target;for(const {leaf,s} of door.leaves)leaf.position.x=s*(.7+door.open*1.38);door.collider.disabled=door.open>.94;if(performance.now()-lastShadow>120){graphics.shadow();lastShadow=performance.now();}}if(!moving&&doorWasMoving)graphics.shadow();doorWasMoving=moving;}
 if(!state.modal||doorWasMoving)graphics.render();state.frames++;
}
function modelStats(){let meshes=0,triangles=0,instances=0,landscape=null;const materials=new Set();building.traverse(n=>{if(n.userData.foliageInstances)landscape=n.userData;if(n.isMesh){meshes++;triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3*(n.isInstancedMesh?n.count:1);if(n.isInstancedMesh)instances+=n.count;materials.add(n.material.name);}});return {meshes,triangles,instances,materials:[...materials],groups:building.children.map(g=>g.name),dimensions,colliders:colliders.length,shelves:shelves.length,seats:seats.length,landscape};}
function dispose(){if(disposed)return;disposed=true;renderer.setAnimationLoop(null);catalog?.dispose();clearInput();clearTimeout(toastTimer);clearTimeout(resizeTimer);orbit.dispose();const geometries=new Set(),materials=new Set(),textures=new Set();building.traverse(n=>{if(!n.isMesh)return;geometries.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());scene.environment?.dispose();scene.background?.dispose();graphics.composer.passes.forEach(p=>p.dispose?.());graphics.composer.dispose();renderer.dispose();}
document.addEventListener('visibilitychange',()=>{clearInput();clock.getDelta();if(state.ready&&!disposed)renderer.setAnimationLoop(document.hidden?null:frame);});addEventListener('pagehide',e=>{if(!e.persisted)dispose();else renderer.setAnimationLoop(null);});addEventListener('pageshow',()=>{if(state.ready&&!disposed)renderer.setAnimationLoop(frame);});
async function init(){try{
 await loadMaterials();scene.add(building);({door}=createBuilding());indexColliders();
 const hdr=await new RGBELoader().loadAsync(new URL('../campus-3d-v5/assets/sky.hdr',document.baseURI).href);hdr.mapping=T.EquirectangularReflectionMapping;scene.background=hdr;scene.backgroundIntensity=.9;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(hdr).texture;scene.environmentIntensity=.4;pmrem.dispose();
 scene.add(new T.HemisphereLight(0xe0ebf0,0xa89d82,.38));scene.fog=new T.Fog(0xdce2de,65,135);
 const sun=new T.DirectionalLight(0xfff1dc,2.65);sun.position.set(18,23,17);sun.target.position.set(0,0,0);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-27,right:27,top:24,bottom:-22,near:1,far:90});sun.shadow.normalBias=.025;sun.shadow.bias=-.00016;scene.add(sun);graphics.watchSun(sun);
 for(const z of [-4,3]){const light=new T.PointLight(0xfff0d7,16,15,2);light.position.set(5,3.5,z);scene.add(light);}
 catalog=await initCatalog({pause,resume,report:toast});setView(new URLSearchParams(location.search).get('view')==='hall'?'hall':'exterior');$('quality').value=graphics.stats().quality;
 await renderer.compileAsync(scene,camera);graphics.shadow();graphics.render();state.ready=true;$('loading').hidden=true;renderer.setAnimationLoop(frame);
 }catch(e){console.error(e);$('loading').querySelector('h2').textContent='图书馆加载失败';$('loading').querySelector('p').textContent=e.message+'。请使用 node server.mjs 启动后刷新。';}}
// Read-only diagnostics plus explicit pose/move operations used by reproducible browser acceptance tests.
window.__library={snapshot:()=>({ready:state.ready,mode:state.mode,pos:state.pos.toArray(),yaw:state.yaw,seated:state.seated?.id||null,modal:state.modal,nearest:state.nearest?.kind||null,door:door?{open:door.open,target:door.target,blocked:!door.collider.disabled}:null,frames:state.frames,catalog:catalog?.snapshot()}),performance:()=>graphics.stats(),modelStats,setView,walk,interact,stand,blocked,move:(dx,dz)=>{if(!state.modal&&!state.seated)move(state.pos,dx,dz);},setPose:(x,z,yaw=0)=>{if(state.modal||blocked(x,z))return false;stand();state.mode='walk';orbit.enabled=false;state.pos.set(x,0,z);state.yaw=yaw;state.pitch=0;clearInput();updateCamera();nearby();return true;},shelves:()=>shelves,seats:()=>seats,exportModel,modelBuffer,dispose};
init();
