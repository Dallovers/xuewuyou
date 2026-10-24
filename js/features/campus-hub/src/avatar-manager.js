import * as T from 'three';
import {createStudentAvatar} from './avatar.js';

// Keep navigation usable while a selected model downloads. Late loads own their
// resources and cannot replace a more recent selection or a disposed scene.
export function createAvatarManager(scene,{changed=()=>{}}={}){
 const anchor=new T.Group();let current=null,generation=0,disposed=false,pose=null,visible=true,loading=false;
 return {
  get height(){return current?.height||1.72;},
  headPosition:target=>current?.headPosition(target),
  get root(){return current?.root||anchor;},get model(){return current?.model;},
  get variant(){return current?.variant||'anime';},get clip(){return current?.clip||'idle';},
  get actionState(){return current?.actionState||{current:null,elapsed:0};},
  get jumpHeight(){return current?.jumpHeight||0;},get locksMovement(){return current?.locksMovement||false;},
  get clips(){return current?.clips||[];},
  async equip(id){
   const request=++generation;loading=true;
   try{
    const next=await createStudentAvatar(scene,{variant:id});
    if(disposed||request!==generation){next.dispose();return false;}
    current?.dispose();current=next;if(pose)current.update({...pose,dt:0});current.setVisible(visible);changed(id);return true;
   }finally{if(request===generation)loading=false;}
  },
  act:(...args)=>current?.act(...args)||false,cancelAction:()=>current?.cancelAction(),
  update(value){pose=value;current?.update(value);},setVisible(value){visible=value;current?.setVisible(value);},
  snapshot:()=>current?{...current.snapshot(),loading}:{loading,visible:false,avatar:null},
  dispose(){disposed=true;generation++;current?.dispose();}
 };
}
