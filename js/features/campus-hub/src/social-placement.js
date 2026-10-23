import * as T from 'three';

// Turn the service assembly in place. The rest of the social plaza retains its
// footprint, including the path to the arena, seating and small fountain.
export function faceSocialCourtyard(district,{cx,cz}){
 const selected=name=>/^(pavilion:|board:|social:desk-|detail:|nearfield:(cleat-|board-))/.test(name);
 const pivot=new T.Group();pivot.name='Social courtyard-facing service pavilion';pivot.position.set(cx,0,cz);district.root.add(pivot);
 district.root.updateMatrixWorld(true);
 for(const child of [...district.root.children])if(selected(child.name))pivot.attach(child);
 pivot.rotation.y=Math.PI;
 for(const collider of district.colliders){
  const name=collider.id||collider.name||'';
  if(name==='social:desk'||selected(name)){
   // A half-turn preserves the local AABB half sizes while rotating its centre.
   collider.center[0]=2*cx-collider.center[0];collider.center[2]=2*cz-collider.center[2];
  }
 }
 district.root.updateMatrixWorld(true);
 return pivot;
}
