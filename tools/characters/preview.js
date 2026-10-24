import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {VRMLoaderPlugin,VRMUtils} from '@pixiv/three-vrm';
const $=id=>document.getElementById(id),canvas=$('view');
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
const scene=new T.Scene();scene.background=new T.Color('#e5edf4');
const camera=new T.PerspectiveCamera(36,1,.01,100);camera.position.set(3,1.8,4.8);
const controls=new OrbitControls(camera,canvas);controls.target.set(0,.85,0);controls.enableDamping=true;
scene.add(new T.HemisphereLight(0xf2f7ff,0x77849a,2.5));
const key=new T.DirectionalLight(0xffedda,3);key.position.set(3,5,4);scene.add(key);
const fill=new T.DirectionalLight(0xc1dcff,1.6);fill.position.set(-3,2,-2);scene.add(fill);
const floor=new T.Mesh(new T.PlaneGeometry(12,12),new T.MeshStandardMaterial({color:0xc5d2df,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.005;scene.add(floor);
scene.add(new T.GridHelper(6,12,0x7b91ad,0xb6c6d6));scene.add(new T.AxesHelper(.7));
let entries=[],current=null,mixer=null,clips=[],action=null,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,request=0,frames=0,last=performance.now(),failure=null;
const assetUrl=path=>new URL('../../'+path,import.meta.url).href;
const snapshot=()=>({id:current?.entry.id,ready:!!current,frames,clip:action?.getClip().name,animationTime:action?.time,animationSource:current?.animationSource,presentationPose:current?.vrm?$('pose').value:null,nativeAnimationCount:current?.gltf.animations.length||0,vrmVersion:current?.vrm?.meta.metaVersion,vrmHumanoidBoneCount:current?.vrm?Object.keys(current.vrm.humanoid.normalizedHumanBones).length:0,animations:clips.map(c=>({name:c.name,duration:c.duration,tracks:c.tracks.length})),bounds:current?new T.Box3().setFromObject(current.root).getSize(new T.Vector3()).toArray():null,renderCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,memory:{...renderer.info.memory},failure});
function dispose(gltf){
 const textures=new Set(),materials=new Set(),geometries=new Set(),skeletons=new Set();
 gltf.scene.traverse(n=>{if(n.isMesh){if(n.skeleton)skeletons.add(n.skeleton);geometries.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);for(const u of Object.values(m.uniforms||{})){if(u?.value?.isTexture)textures.add(u.value);}}}});
 textures.forEach(t=>{t.image?.close?.();t.dispose();});materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());skeletons.forEach(s=>s.dispose());
}
function play(name){if(!current)return;action?.stop();const clip=clips.find(c=>c.name===name);action=clip?mixer.clipAction(clip):null;action?.reset().play();$('clip').value=name;return !!action;}
function poseVrm(vrm,name){
 if(!vrm)return;
 vrm.humanoid.resetNormalizedPose();
 if(name==='relaxed'){
  vrm.humanoid.getNormalizedBoneNode('leftUpperArm').rotation.z=Math.PI/3;
  vrm.humanoid.getNormalizedBoneNode('rightUpperArm').rotation.z=-Math.PI/3;
 }
 vrm.update(0);
}
async function load(id){
 const entry=entries.find(e=>e.id===id);if(!entry)throw Error('Unknown character');
 $('character').value=id;const generation=++request;$('load').disabled=true;failure=null;$('status').textContent='加载 '+entry.displayName+'…';
 let gltf,installed=false;
 try{
  const loader=new GLTFLoader();if(entry.format?.startsWith('VRM'))loader.register(parser=>new VRMLoaderPlugin(parser));
  gltf=await loader.loadAsync(assetUrl(entry.modelPath));const vrm=gltf.userData.vrm;
  if(entry.format?.startsWith('VRM')&&!vrm)throw Error('VRM humanoid unavailable');
  if(vrm){for(const joint of [...(vrm.springBoneManager?.joints||[])]){joint.reset();vrm.springBoneManager.deleteJoint(joint);}VRMUtils.rotateVRM0(vrm);gltf.scene.traverse(n=>{if(n.isMesh)for(const m of Array.isArray(n.material)?n.material:[n.material])if(m.isOutline)m.visible=false;});poseVrm(vrm,$('pose').value);}
  if(generation!==request){dispose(gltf);return;}
  const root=new T.Group();root.add(gltf.scene);const nextMixer=new T.AnimationMixer(gltf.scene),nextClips=gltf.animations;
  const idle=nextClips.find(c=>c.name==='Idle'||c.name==='idle')||nextClips.find(c=>/idle/i.test(c.name))||nextClips[0];
  if(idle)nextMixer.clipAction(idle).play();nextMixer.update(0);vrm?.update(0);gltf.scene.updateMatrixWorld(true);
  const raw=new T.Box3().setFromObject(gltf.scene),size=raw.getSize(new T.Vector3());if(!(size.y>0))throw Error('Invalid height');
  gltf.scene.scale.setScalar(1.72/size.y);gltf.scene.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(gltf.scene),center=bounds.getCenter(new T.Vector3());gltf.scene.position.add(new T.Vector3(-center.x,-bounds.min.y,-center.z));root.rotation.y=Number($('yaw').value)*Math.PI/180;
  if(current){mixer.stopAllAction();mixer.uncacheRoot(current.gltf.scene);scene.remove(current.root);dispose(current.gltf);}
  current={entry,gltf,root,vrm,animationSource:gltf.animations.length?'bundled':'none'};installed=true;scene.add(root);mixer=nextMixer;clips=nextClips;action=null;key.intensity=vrm?1.2:3;fill.intensity=vrm ? .5 : 1.6;scene.children.find(n=>n.isHemisphereLight).intensity=vrm ? .8 : 2.5;$('pose').disabled=!vrm;camera.position.set(...(vrm?[1.8,1.45,3.3]:[3,1.8,4.8]));controls.target.set(0,.85,0);controls.update();
  $('clip').replaceChildren(...clips.map(c=>new Option(c.name,c.name)));$('clip').disabled=!clips.length;$('pause').disabled=!clips.length;play(idle?.name);
  $('clip-label').textContent='自带动画';$('pause').textContent=clips.length?(playing?'暂停':'继续'):'无自带动画';
  $('status').textContent='可显示 · '+gltf.animations.length+' 段自带动画（'+(clips.length?'校园动作未接入':'动作待适配')+'）';
  $('caption').textContent=entry.displayName+' · 拖动检查外观';
  $('details').textContent=JSON.stringify({id:entry.id,author:entry.author,bytes:entry.totalBytes,license:entry.license,source:entry.sourceUrl,skins:gltf.parser.json.skins?.length||0,rawHeight:size.y,vrmVersion:vrm?.meta.metaVersion,nativeAnimations:gltf.animations.length,presentationPose:vrm?'运行时静态站姿，可切 T 姿；不是动画':null,normalization:'仅预览归一为 1.72m；校园朝向与脚底仍需校准'},null,2);
  const sourceLink=document.createElement('a');sourceLink.href=entry.sourceUrl;sourceLink.textContent='来源';sourceLink.target='_blank';sourceLink.rel='noopener';
  const licenseLink=document.createElement('a');licenseLink.href=entry.attributionRequired?'https://creativecommons.org/licenses/by/4.0/':'https://creativecommons.org/publicdomain/zero/1.0/';licenseLink.textContent=entry.attributionRequired?'CC BY 4.0':'CC0 1.0';licenseLink.target='_blank';licenseLink.rel='noopener';
  $('credit').replaceChildren(document.createTextNode((entry.attribution||'')+' '),sourceLink,document.createTextNode(' / '),licenseLink);return snapshot();
 }catch(e){if(gltf&&!installed)dispose(gltf);failure=e.message;$('status').textContent='加载失败：'+e.message;throw e;}finally{if(generation===request)$('load').disabled=false;}
}
$('load').onclick=()=>load($('character').value).catch(console.error);$('clip').onchange=()=>play($('clip').value);
$('pause').onclick=()=>{playing=!playing;$('pause').textContent=playing?'暂停':'继续';};
$('pose').onchange=()=>poseVrm(current?.vrm,$('pose').value);
$('yaw').oninput=()=>{if(current)current.root.rotation.y=Number($('yaw').value)*Math.PI/180;};
new ResizeObserver(()=>{const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}).observe(canvas.parentElement);
function update(dt){mixer?.update(dt);current?.vrm?.update(dt);scene.updateMatrixWorld(true);}
renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;update(playing?dt:0);controls.update();renderer.render(scene,camera);frames++;});
$('pause').textContent=playing?'暂停':'继续';
entries=await (await fetch(assetUrl('docs/characters/sources.json'))).json();
function filterEntries(){const batch=$('batch').value,visible=entries.filter(e=>batch==='all'||(e.batch||'wave1')===batch),selected=$('character').value;$('character').replaceChildren(...visible.map(e=>new Option(e.displayName||e.id,e.id)));if(visible.some(e=>e.id===selected))$('character').value=selected;$('status').textContent=visible.length+' 个人物候选 · 点击加载查看';return visible.map(e=>e.id);}
const initialBatch=new URLSearchParams(location.search).get('batch');if([...$('batch').options].some(o=>o.value===initialBatch))$('batch').value=initialBatch;
$('batch').onchange=filterEntries;filterEntries();
window.__characterPreview={load,play,snapshot,step(dt){update(dt);renderer.render(scene,camera);return snapshot();},probe(){const values=[];current?.gltf.scene.traverse(n=>{values.push(...n.position.toArray(),...n.quaternion.toArray(),...n.scale.toArray());});return values;},entries:()=>entries};
