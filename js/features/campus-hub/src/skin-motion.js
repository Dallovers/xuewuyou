import * as T from 'three';

// Normalized VRM0 poses face -Z; VRM1 poses face +Z. Conjugate rotations
// by the half-turn instead of copying VRM1 arm rotations into the old basis.
export function retargetVrmMotion(vrm,motion){
 const old=vrm.meta.metaVersion==='0';
 const idle=motion.clips.find(clip=>clip.name==='idle');
 const sourceHip=idle.tracks.find(track=>track.name==='hips.position').values.slice(0,3);
 const hip=vrm.humanoid.getNormalizedBoneNode('hips').position.clone();
 const scale=hip.y/sourceHip[1];
 return motion.clips.map(json=>{
  const clip=T.AnimationClip.parse(json),tracks=[];
  for(const track of clip.tracks){
   const [bone,property]=track.name.split('.'),node=vrm.humanoid.getNormalizedBoneNode(bone);
   if(!node)continue; // Optional upper-chest/finger bones vary between exports.
   if(old&&property==='quaternion')for(let i=0;i<track.values.length;i+=4){track.values[i]*=-1;track.values[i+2]*=-1;}
   if(property==='position'&&bone==='hips')for(let i=0;i<track.values.length;i+=3){
    track.values[i]=hip.x+(track.values[i]-sourceHip[0])*scale*(old?-1:1);
    track.values[i+1]=hip.y+(track.values[i+1]-sourceHip[1])*scale;
    track.values[i+2]=hip.z+(track.values[i+2]-sourceHip[2])*scale*(old?-1:1);
   }
   track.name=`${node.uuid}.${property}`;tracks.push(track);
  }
  clip.tracks=tracks;return clip;
 });
}

export function nativeCampusClips(gltf,mapping){
 const nodes=new Map();gltf.scene.traverse(node=>nodes.set(node.name,node));
 const output=[];
 for(const [state,name]of Object.entries(mapping)){
  const source=gltf.animations.find(clip=>clip.name===name);if(!source)throw Error(`缺少${state}动作`);
  const clip=source.clone();clip.name=state;
  for(const track of clip.tracks){
   const match=/^(.+)\.position$/.exec(track.name);if(!match||!/^(root|hips|pelvis|armature|rig)$/i.test(match[1]))continue;
   const rest=nodes.get(match[1])?.position;if(!rest)continue;
   for(let i=0;i<track.values.length;i+=3){track.values[i]=rest.x;track.values[i+2]=rest.z;if(state==='jump')track.values[i+1]=rest.y;}
  }
  output.push(clip);
 }
 return output;
}
