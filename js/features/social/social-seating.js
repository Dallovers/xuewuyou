/** Seating poses only. Movement, camera and input remain the host's responsibility. */
export function registerSocialSeat({THREE, object, interactions, owner, id, label, localEye=[0,1.18,0]}) {
  interactions.push({
    id, kind:'seat', label, prompt:'按 E 坐下休息', object, radius:1.25,
    action() {
      if(owner.disposed)return {ok:false,reason:'disposed'};
      object.updateWorldMatrix(true,false);
      const position=new THREE.Vector3(...localEye).applyMatrix4(object.matrixWorld).toArray();
      const directions=[1,-1].map(sign=>new THREE.Vector3(0,0,sign).transformDirection(object.matrixWorld).toArray());
      return {ok:true,kind:'seat',id,label,position,directions};
    },
  });
}
