import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {VRMLoaderPlugin,VRMUtils} from '@pixiv/three-vrm';
import {createAvatarActions} from './avatar-actions.js';
import catalog from '../../../../server/campus/skin-catalog.json';
import {retargetVrmMotion,nativeCampusClips} from './skin-motion.js';

const CLIPS={
 anime:{idle:['idle'],walk:['walk'],run:['run'],jump:['jump'],wave:['wave'],punch:['punch']},
 robot:{idle:['Idle'],walk:['Walking'],run:['Running'],jump:['Jump'],wave:['Wave'],punch:['Punch']},
 formal:{idle:['Student_Idle'],walk:['Student_Walk'],run:['Student_Run']},
 prototype:{idle:['CharacterArmature|Idle_Neutral','CharacterArmature|Idle'],walk:['CharacterArmature|Walk'],run:['CharacterArmature|Run'],wave:['CharacterArmature|Wave'],punch:['CharacterArmature|Punch_Left']}
};
// Share source downloads, never live skeletons/materials: each person owns the
// parsed model so disposing a remote player cannot damage another character.
const sources=new Map();
function loadSource(url,type){
 const key=url.href;
 if(!sources.has(key))sources.set(key,fetch(key,{signal:AbortSignal.timeout(45000)}).then(response=>{if(!response.ok)throw Error('Character download failed');return type==='json'?response.json():response.arrayBuffer();}).catch(error=>{sources.delete(key);throw error;}));
 const value=sources.get(key);if(sources.size>3)sources.delete(sources.keys().next().value);return value;
}

function disposeModel(model){const images=new Set();model.traverse(node=>{for(const material of node.material?(Array.isArray(node.material)?node.material:[node.material]):[])for(const value of Object.values(material))if(value?.isTexture&&value.image?.close)images.add(value.image);});VRMUtils.deepDispose(model);for(const image of images)image.close();}

export async function createStudentAvatar(scene,options={}){
 const avatar=options.variant||new URLSearchParams(location.search).get('avatar')||'anime';
 const skin=catalog.skins.find(s=>s.id===avatar)||catalog.skins[0],variant=skin.id;
 const asset=skin.model.split('/').pop();
 const loader=new GLTFLoader();
 if(skin.rig.startsWith('vrm'))loader.register(parser=>new VRMLoaderPlugin(parser));
 const site=new URL('../../../',document.baseURI),modelUrl=new URL(skin.model,site),assets=new URL('.',modelUrl);
 const source=await loadSource(modelUrl,'arraybuffer');
 const gltf=await loader.parseAsync(source,assets.href),vrm=gltf.userData.vrm;
 if(skin.rig.startsWith('vrm')&&!vrm){disposeModel(gltf.scene);throw Error('VRM humanoid unavailable');}
 let animations=gltf.animations,actionTimings={};
 if(vrm){
  VRMUtils.combineSkeletons(vrm.scene);
  let motion;try{motion=await loadSource(new URL('examples/campus-3d-v5/assets/characters/student-anime-motion.json',site),'json');}catch(error){disposeModel(gltf.scene);throw error;}
  actionTimings=motion.actions||{};
  if(vrm.meta.metaVersion==='0')VRMUtils.rotateVRM0(vrm);
  animations=retargetVrmMotion(vrm,motion);
  vrm.expressionManager?.setValue('happy',.12);
  // Keep the authored hair silhouette and stable clothing while evaluating the
  // character. This sample's secondary springs overreact to the campus gait.
  for(const joint of [...(vrm.springBoneManager?.joints||[])]){
   joint.reset();vrm.springBoneManager.deleteJoint(joint);
  }
 }
 if(skin.clips)animations=nativeCampusClips(gltf,skin.clips);
 const mapping=CLIPS[variant]||Object.fromEntries(animations.map(c=>[c.name,[c.name]]));
 const root=new T.Group();root.name='Playable student avatar';root.visible=false;scene.add(root);
 const model=gltf.scene;model.name=variant==='anime'?'Anime campus student':variant==='prototype'?'Quaternius hoodie student':variant==='formal'?'MakeHuman modern student':'Campus expressive robot';root.add(model);
 const palette={Purple:0x424e5d,LightBlue:0x303b48,White:0xe3e0d7,Hair:0x201d1a,Eyebrows:0x30251f};
 const robotPalette={Main:0xe3e7e4,Grey:0x66aaa7,Black:0x25363e};
 const adjusted=new Set();
 model.traverse(node=>{if(node.isMesh){node.castShadow=options.castShadow!==false;node.receiveShadow=true;node.frustumCulled=false;
  if(variant==='robot'){
   const geometry=node.geometry;node.geometry=toCreasedNormals(geometry,Math.PI/3);geometry.dispose();
   const surprised=node.morphTargetDictionary?.Surprised;
   if(surprised!==undefined)node.morphTargetInfluences[surprised]=.12;
  }
  for(const material of Array.isArray(node.material)?node.material:[node.material]){
   if(adjusted.has(material))continue;adjusted.add(material);
   // Inverted-hull outlines break into dark speckles on the animated silhouette
   // at campus camera distances. Keep the textured MToon surface and eyeliner.
   if(vrm&&material.isOutline)material.visible=false;
   if(variant==='prototype'){
    if(palette[material.name]!==undefined)material.color.setHex(palette[material.name]);
    material.metalness=0;material.roughness=material.name==='Skin'?.72:.9;
   }
   if(variant==='robot'){
    if(robotPalette[material.name]!==undefined)material.color.setHex(robotPalette[material.name]);
    material.flatShading=false;material.metalness=.06;material.roughness=material.name==='Black'?.32:.48;
   }
  }
 }});
 const mixer=new T.AnimationMixer(model),actions=new Map();let activeName='idle';
 for(const [state,names] of Object.entries(mapping)){
  const clip=names.map(name=>animations.find(item=>item.name===name)).find(Boolean);
  if(clip){const action=mixer.clipAction(clip);if(['jump','wave','punch'].includes(state)){action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;}actions.set(state,action);}
 }
 const gestures=createAvatarActions(Object.fromEntries([...actions].map(([name,action])=>[name,action.getClip().duration])),actionTimings);
 let active=null;
 function play(name){const next=actions.get(name)||actions.get('idle');if(!next||active===next)return;const fade=name==='jump'?.075:activeName==='jump'?.14:.18;next.reset().fadeIn(fade).play();active?.fadeOut(fade);active=next;activeName=name;}
 play('idle');
 mixer.update(0);vrm?.update(0);model.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(model),height=bounds.max.y-bounds.min.y;
 model.scale.setScalar(skin.height/height);model.updateMatrixWorld(true);
 const scaledBounds=new T.Box3().setFromObject(model);model.position.y=-scaledBounds.min.y;
 model.updateMatrixWorld(true);vrm?.springBoneManager?.reset();
 const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=128;const cc=contactCanvas.getContext('2d'),fade=cc.createRadialGradient(64,64,4,64,64,62);fade.addColorStop(0,'rgba(255,255,255,.85)');fade.addColorStop(.4,'rgba(255,255,255,.35)');fade.addColorStop(1,'rgba(255,255,255,0)');cc.fillStyle=fade;cc.fillRect(0,0,128,128);const contactMap=new T.CanvasTexture(contactCanvas);
 const shadow=new T.Mesh(new T.PlaneGeometry(.90,.64),new T.MeshBasicMaterial({color:0x18221c,map:contactMap,transparent:true,opacity:.18,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;root.add(shadow);
 let expressionTime=0;
 const probeNames=['head','hips','leftUpperArm','leftLowerArm','leftHand','rightUpperArm','rightLowerArm','rightHand','leftUpperLeg','leftLowerLeg','leftFoot','leftToes','rightUpperLeg','rightLowerLeg','rightFoot','rightToes','leftMiddleProximal','leftMiddleDistal','rightMiddleProximal','rightMiddleDistal'];
 function jointPositions(){if(!vrm)return undefined;model.updateMatrixWorld(true);return Object.fromEntries(probeNames.map(name=>[name,vrm.humanoid.getRawBoneNode(name)?.getWorldPosition(new T.Vector3()).toArray()]));}
 return{
  root,model,variant,height:skin.height,clips:[...actions.keys()],
  get clip(){return activeName;},get actionState(){return gestures.snapshot();},get locksMovement(){return gestures.locksMovement;},get jumpHeight(){return gestures.height;},
  act(name,ground=0){return gestures.start(name,ground);},cancelAction(){gestures.cancel();},
  snapshot(){let meshes=0,triangles=0,skinned=0;let head=vrm?.humanoid.getRawBoneNode('head'),leg=vrm?.humanoid.getRawBoneNode('leftUpperLeg'),arm=vrm?.humanoid.getRawBoneNode('rightUpperArm');model.traverse(n=>{if(n.isMesh){meshes++;triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;if(n.isSkinnedMesh)skinned++;}if(!head&&/head/i.test(n.name))head=n;if(!leg&&/upper.?leg|thigh/i.test(n.name))leg=n;});return{asset,avatar:variant,visible:root.visible,position:root.position.toArray(),yaw:root.rotation.y,height:skin.height,clip:activeName,time:active?.time,action:gestures.snapshot(),joints:jointPositions(),meshes,triangles,skinned,texturedMaterials:[...adjusted].filter(m=>m.map).length,head:head?.quaternion.toArray(),leg:leg?.quaternion.toArray(),arm:arm?.quaternion.toArray(),bounds:new T.Box3().setFromObject(model).getSize(new T.Vector3()).toArray()};},
  update({position,yaw,dt,moving=false,sprinting=false,remoteState=null}){
   root.position.set(position.x,0,position.z);root.rotation.y=yaw;
   const ground=position.groundY||0;if(!remoteState)gestures.update(dt,ground);const height=remoteState?.height??gestures.height;root.position.y=ground+height;
   shadow.position.y=.018-height;shadow.material.opacity=.18/(1+height);shadow.scale.setScalar(1+height*.35);
   play(remoteState?.clip||gestures.current||(moving?(sprinting?'run':'walk'):'idle'));
   if(['jump','wave','punch'].includes(remoteState?.clip)&&active)active.time=Math.min(remoteState.time,active.getClip().duration-.001);
   mixer.update(dt);
   if(vrm){
    expressionTime+=dt;const blink=expressionTime%4.6;vrm.expressionManager?.setValue('blink',blink<.16?Math.sin(blink/.16*Math.PI):0);
    vrm.update(dt);
   }
  },
  setVisible(value){root.visible=!!value;},
  dispose(){scene.remove(root);mixer.stopAllAction();mixer.uncacheRoot(model);disposeModel(model);shadow.geometry.dispose();shadow.material.dispose();contactMap.dispose();}
 };
}
