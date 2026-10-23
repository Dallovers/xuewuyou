import * as T from 'three';

// Human reference pose, five-finger hands and foot planting. This is an offline
// retarget pass; the browser only loads the resulting ordinary animation clips.
export function bakeHumanActions(source,target,idleJson){
 const mapping={hips:'DEF-hips',spine:'DEF-spine.001',chest:'DEF-spine.002',upperChest:'DEF-spine.003',neck:'DEF-neck',head:'DEF-head'};
 for(const [side,suffix] of [['left','L'],['right','R']]){
  for(const [part,bone] of [['Shoulder','shoulder'],['UpperArm','upper_arm'],['LowerArm','forearm'],['Hand','hand'],['UpperLeg','thigh'],['LowerLeg','shin'],['Foot','foot'],['Toes','toe']])mapping[side+part]=`DEF-${bone}.${suffix}`;
  for(const [digit,bone] of [['Index','f_index'],['Middle','f_middle'],['Ring','f_ring'],['Little','f_pinky'],['Thumb','thumb']])for(const [i,part] of (digit==='Thumb'?['Metacarpal','Proximal','Distal']:['Proximal','Intermediate','Distal']).entries())mapping[side+digit+part]=`DEF-${bone}.0${i+1}.${suffix}`;
 }
 const names=Object.keys(mapping),node=name=>source.scene.getObjectByName(T.PropertyBinding.sanitizeNodeName(name));
 const sourceMixer=new T.AnimationMixer(source.scene);
 function sampleSource(name,time){sourceMixer.stopAllAction();const clip=source.animations.find(c=>c.name===name);if(!clip)throw Error(`Missing human clip ${name}`);sourceMixer.clipAction(clip).reset().play();sourceMixer.setTime(T.MathUtils.clamp(time,0,clip.duration-1e-6));source.scene.updateMatrixWorld(true);}
 sampleSource('A_TPose',0);
 const restInverse={},alignment={},positions={},parents={},targetNames=new Map(Object.entries(target.bones).map(([name,bone])=>[bone,name]));
 for(const name of names){
  const bone=node(mapping[name]);if(!bone||!target.bones[name])throw Error(`Missing human bone ${name}`);
  restInverse[name]=bone.getWorldQuaternion(new T.Quaternion()).invert();positions[name]=target.bones[name].getWorldPosition(new T.Vector3());
  let p=target.bones[name].parent;while(p&&!mapping[targetNames.get(p)])p=p.parent;parents[name]=targetNames.get(p);
  alignment[name]=new T.Quaternion();
 }
 const rig=new T.Group(),normalized={};
 function addBone(name){if(normalized[name])return normalized[name];const bone=new T.Object3D();bone.name=name;const parent=parents[name]?addBone(parents[name]):rig;bone.position.copy(positions[name]);if(parents[name])bone.position.sub(positions[parents[name]]);parent.add(bone);normalized[name]=bone;return bone;}
 for(const name of names)addBone(name);
 for(const name of names){
  const child=names.find(n=>parents[n]===name);if(!child)continue;
  const from=positions[child].clone().sub(positions[name]).normalize();
  const to=node(mapping[child]).getWorldPosition(new T.Vector3()).sub(node(mapping[name]).getWorldPosition(new T.Vector3())).normalize();
  // Torso/shoulder placement differs between characters; directional offsets
  // only belong on limbs/fingers, never as extra torso rotations.
  if(/Arm|Leg|Hand|Foot|Index|Middle|Ring|Little|Thumb/.test(name))alignment[name].setFromUnitVectors(from,to);
 }
 const idleMixer=new T.AnimationMixer(rig);idleMixer.clipAction(T.AnimationClip.parse(idleJson)).play();idleMixer.setTime(.9);rig.updateMatrixWorld(true);
 const idle={q:Object.fromEntries(names.map(name=>[name,normalized[name].quaternion.clone()])),hips:normalized.hips.position.clone()};
 const footBaselineZ=(normalized.leftFoot.getWorldPosition(new T.Vector3()).z+normalized.rightFoot.getWorldPosition(new T.Vector3()).z)/2;idleMixer.stopAllAction();
 const clone=pose=>({q:Object.fromEntries(names.map(n=>[n,pose.q[n].clone()])),hips:pose.hips.clone()});
 function blend(a,b,t){const p=clone(a);for(const n of names)p.q[n].slerp(b.q[n],t);p.hips.lerp(b.hips,t);return p;}
 function sample(name,time,{punch=false}={}){
  sampleSource(name,time);const desired={};for(const n of names)desired[n]=node(mapping[n]).getWorldQuaternion(new T.Quaternion()).multiply(restInverse[n]).multiply(alignment[n]);
  const pose={q:{},hips:positions.hips.clone()};
  for(const n of names)pose.q[n]=parents[n]?desired[parents[n]].clone().invert().multiply(desired[n]).normalize():desired[n].clone().normalize();
  if(punch){
   // A stationary jab: transfer the pelvis turn to the torso and keep the
   // existing support legs/hip height. No raised knee or involuntary step.
   const turn=idle.q.hips.clone().invert().multiply(pose.q.hips);pose.q.spine.premultiply(turn);
   pose.q.hips.copy(idle.q.hips);pose.hips.copy(idle.hips);
   for(const n of names.filter(n=>/Leg|Foot|Toes/.test(n)))pose.q[n].copy(idle.q[n]);
  }
  return pose;
 }
 function plant(pose){
  for(const n of names)normalized[n].quaternion.copy(pose.q[n]);normalized.hips.position.copy(pose.hips);rig.updateMatrixWorld(true);
  let lowest=Infinity;
  const footZ=(normalized.leftFoot.getWorldPosition(new T.Vector3()).z+normalized.rightFoot.getWorldPosition(new T.Vector3()).z)/2;
  pose.hips.z+=footBaselineZ-footZ;
  for(const side of ['left','right']){
   const foot=side+'Foot',toe=side+'Toes';
   const heel=normalized[foot].localToWorld(new T.Vector3(0,-positions[foot].y,0)).y;
   const ball=normalized[toe].getWorldPosition(new T.Vector3()).y-positions[toe].y;
   lowest=Math.min(lowest,heel,ball);
  }
  pose.hips.y-=lowest;return pose;
 }
 // Sample the source continuously. Easing between a handful of frozen poses
 // used to bring every joint to a stop at each intermediate key.
 const profile={takeoff:.22,flight:.84,height:.85},contact=profile.takeoff+profile.flight,duration=contact+.28;
 const crouch=blend(idle,sample('Jump_Start',0),.48);
 const launch=sample('Sprint_Loop',.12),strideEnd=sample('Sprint_Loop',.34);
 const touchdown=blend(idle,sample('Jump_Land',0),.45);
 const armNames=names.filter(n=>/^(left|right)(Shoulder|.*Arm|Hand|Index|Middle|Ring|Little|Thumb)/.test(n));
 const copyArms=(pose,arms)=>{for(const n of armNames)pose.q[n].copy(arms.q[n]);return pose;};
 copyArms(crouch,blend(idle,launch,.35));copyArms(touchdown,strideEnd);
 const guard=sample('Punch_Enter',.80,{punch:true});
 function jumpAt(time){
  if(time<profile.takeoff){
   const preparation=blend(idle,crouch,T.MathUtils.smoothstep(time,0,.10));
   return blend(preparation,launch,T.MathUtils.smoothstep(time,.08,profile.takeoff));
  }
  if(time<contact){
   const u=(time-profile.takeoff)/profile.flight;
   // Advance a single stride: same lead knee and opposite arm directions.
   // Continuous original samples keep knee, ankle, elbow and torso follow-through.
   const stride=sample('Sprint_Loop',.12+.22*u);
   return blend(stride,touchdown,T.MathUtils.smoothstep(u,.80,1));
  }
  const u=T.MathUtils.clamp((time-contact)/(duration-contact),0,1);
  const recovery=blend(idle,sample('Jump_Land',u*.78),.45*(1-T.MathUtils.smoothstep(u,.28,1)));
  return copyArms(recovery,blend(strideEnd,idle,T.MathUtils.smoothstep(u,0,.85)));
 }
 function punchAt(time){if(time<.24)return blend(idle,guard,T.MathUtils.smoothstep(time,0,.24));if(time<.90)return sample('Punch_Jab',(time-.24)/.66*.8333333,{punch:true});return blend(guard,idle,T.MathUtils.smoothstep(time,.90,1.18));}
 const clips=[];
 for(const [name,clipDuration,sampler] of [['jump',duration,jumpAt],['punch',1.18,punchAt]]){
  const times=[],values=Object.fromEntries(names.map(n=>[n,[]])),hips=[],count=Math.ceil(clipDuration*60);
  for(let i=0;i<=count;i++){
   const t=i*clipDuration/count,pose=sampler(t);
   if(name==='jump'){
    const planted=plant(clone(pose)),u=T.MathUtils.clamp((t-profile.takeoff)/profile.flight,0,1);
    // Contact constraints belong to the ground. Release the pelvis in flight
    // instead of pinning it to whichever animated foot happens to be lowest.
    const grounding=1-T.MathUtils.smoothstep(u,0,.16)*(1-T.MathUtils.smoothstep(u,.80,1));
    pose.hips.lerp(planted.hips,grounding);
   }else plant(pose);
   times.push(t);for(const n of names)pose.q[n].toArray(values[n],values[n].length);pose.hips.toArray(hips,hips.length);
  }
  const tracks=names.map(n=>new T.QuaternionKeyframeTrack(`${n}.quaternion`,times,values[n]));tracks.push(new T.VectorKeyframeTrack('hips.position',times,hips));
  clips.push(T.AnimationClip.toJSON(new T.AnimationClip(name,clipDuration,tracks)));
 }
 sourceMixer.stopAllAction();sourceMixer.uncacheRoot(source.scene);idleMixer.uncacheRoot(rig);
 return{clips,actions:{jump:profile}};
}
