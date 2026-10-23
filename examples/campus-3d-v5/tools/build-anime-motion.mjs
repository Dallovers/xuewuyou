// Bake the existing CC0 campus animations onto VRM's normalized humanoid rig.
// No Blender installation or runtime download of the source student is needed.
import {readFile,writeFile} from 'node:fs/promises';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {bakeHumanActions} from './human-action-clips.mjs';

if(!globalThis.ProgressEvent)globalThis.ProgressEvent=class{constructor(type,values){this.type=type;Object.assign(this,values);}};
const base=new URL('../',import.meta.url);
async function skeleton(file){
 const bytes=await readFile(new URL(file,base)),length=bytes.readUInt32LE(12);
 const json=JSON.parse(bytes.subarray(20,20+length).toString());
 const binary=bytes.subarray(28+length);
 const humanoid=json.extensions?.VRMC_vrm?.humanoid.humanBones;
 json.buffers=[{byteLength:binary.length,uri:`data:application/octet-stream;base64,${binary.toString('base64')}`}];
 for(const key of ['images','textures','materials','meshes','skins','extensions','extensionsUsed','extensionsRequired'])delete json[key];
 for(const node of json.nodes){delete node.mesh;delete node.skin;delete node.extensions;}
 const gltf=await new GLTFLoader().parseAsync(JSON.stringify(json),'');
 gltf.scene.updateMatrixWorld(true);
 const bones=humanoid?Object.fromEntries(Object.entries(humanoid).map(([name,{node}])=>[name,gltf.scene.getObjectByName(json.nodes[node].name)])):null;
 return {...gltf,bones};
}
const target=await skeleton('assets/characters/student-anime.vrm');
const mapping={hips:'pelvis',spine:'spine_01',chest:'spine_02',upperChest:'spine_03',neck:'neck_01',head:'head'};
for(const [side,suffix] of [['left','l'],['right','r']]){
 for(const [bone,name] of [['Shoulder','clavicle'],['UpperArm','upperarm'],['LowerArm','lowerarm'],['Hand','hand'],['UpperLeg','thigh'],['LowerLeg','calf'],['Foot','foot'],['Toes','ball']])mapping[side+bone]=`${name}_${suffix}`;
}
const children={UpperArm:'LowerArm',LowerArm:'Hand',Hand:'MiddleProximal',UpperLeg:'LowerLeg',LowerLeg:'Foot',Foot:'Toes'};
const worldPosition=node=>node.getWorldPosition(new T.Vector3()),clips=[];
function bake(source,mapping,entries,{gestures=false}={}){
const sourceRest={},alignment={},parent={},targetPosition={};
const sourceBone=name=>source.scene.getObjectByName(T.PropertyBinding.sanitizeNodeName(name));
const targetNames=new Map(Object.entries(target.bones).map(([name,node])=>[node,name]));
for(const [name,sourceName] of Object.entries(mapping)){
 const node=sourceBone(sourceName);
 if(!node||!target.bones[name])throw Error(`Missing bone ${name}`);
 sourceRest[name]=node.getWorldQuaternion(new T.Quaternion()).invert();
 targetPosition[name]=worldPosition(target.bones[name]);
 let ancestor=target.bones[name].parent;
 while(ancestor&&!mapping[targetNames.get(ancestor)])ancestor=ancestor.parent;
 parent[name]=targetNames.get(ancestor);
 alignment[name]=new T.Quaternion();
 for(const [part,next] of Object.entries(children)){
  if(!name.endsWith(part))continue;
  const nextName=name.replace(part,next),targetChild=target.bones[nextName];
  const sourceChild=sourceBone(mapping[nextName]||`${next==='MiddleProximal'?'middle_01':'ball'}_${name.startsWith('left')?'l':'r'}`);
  if(!targetChild||!sourceChild)continue;
  const from=worldPosition(targetChild).sub(targetPosition[name]).normalize();
  const to=worldPosition(sourceChild).sub(worldPosition(node)).normalize();
  alignment[name].setFromUnitVectors(from,to);
 }
}
const sourceHip=worldPosition(sourceBone(mapping.hips)).y;
const hipScale=targetPosition.hips.y/sourceHip;
const mixer=new T.AnimationMixer(source.scene);
for(const [state,sourceName,durationOverride] of entries){
 mixer.stopAllAction();
 const original=source.animations.find(clip=>clip.name===sourceName);
 if(!original)throw Error(`Missing ${state}`);
 const action=mixer.clipAction(original).play();
 const count=Math.ceil(original.duration*30),times=[],values=Object.fromEntries(Object.keys(mapping).map(name=>[name,[]])),hips=[];
 for(let frame=0;frame<=count;frame++){
  const time=frame*original.duration/count;times.push(frame*(durationOverride||original.duration)/count);
  // Keep the final sample just inside the loop to avoid setTime wrapping to zero.
  mixer.setTime(Math.min(time,original.duration-1e-6));source.scene.updateMatrixWorld(true);
  const desired={};
  for(const [name,sourceName] of Object.entries(mapping)){
   desired[name]=sourceBone(sourceName).getWorldQuaternion(new T.Quaternion()).multiply(sourceRest[name]).multiply(alignment[name]);
  }
  for(const name of Object.keys(mapping)){
   const rotation=parent[name]?desired[parent[name]].clone().invert().multiply(desired[name]):desired[name];
   rotation.normalize().toArray(values[name],values[name].length);
  }
  // Navigation owns horizontal translation; preserve just the source's vertical gait.
  // Jump height belongs to the action controller, never to animation root motion.
  const y=targetPosition.hips.y+(gestures?0:(worldPosition(sourceBone(mapping.hips)).y-sourceHip)*hipScale);
  hips.push(targetPosition.hips.x,y,targetPosition.hips.z);
 }
 const tracks=Object.keys(mapping).map(name=>new T.QuaternionKeyframeTrack(`${name}.quaternion`,times,values[name]));
 tracks.push(new T.VectorKeyframeTrack('hips.position',times,hips));
 clips.push(T.AnimationClip.toJSON(new T.AnimationClip(state.toLowerCase(),durationOverride||original.duration,tracks)));
 action.stop();
}
mixer.uncacheRoot(source.scene);
}
bake(await skeleton('assets/characters/student-formal.glb'),mapping,['Idle','Walk','Run'].map(state=>[state,`Student_${state}`]));
const robotMapping={hips:'Hips',spine:'Abdomen',chest:'Torso',upperChest:'Torso',neck:'Neck',head:'Head'};
for(const [side,suffix] of [['left','L'],['right','R']])for(const part of ['Shoulder','UpperArm','LowerArm','UpperLeg','LowerLeg','Foot'])robotMapping[side+part]=`${part}.${suffix}`;
robotMapping.leftHand='Palm2.L';robotMapping.rightHand='Palm2.R';
bake(await skeleton('assets/characters/student-robot.glb'),robotMapping,[['wave','Wave']],{gestures:true});
const human=bakeHumanActions(await skeleton('tools/sources/quaternius-human-actions.glb'),target,clips.find(c=>c.name==='idle'));
clips.push(...human.clips);
const output=new URL('assets/characters/student-anime-motion.json',base);
await writeFile(output,JSON.stringify({source:'CC0 Quaternius locomotion; CC0 RobotExpressive Wave; CC0 Universal Animation Library Standard human jump/jab',actions:human.actions,clips}));
console.log(`Baked ${clips.length} normalized humanoid clips to ${output.pathname}`);
