/** A owns this model; D owns host input/panels. No renderer, camera or animation loop. */
export function buildChallengeTable({ THREE, root, add, boxGeo, blockBox, M, interactions, openFeature }) {
  const x=4.2,z=3.0;
  const piece=(w,h,d,dx,y,dz,material,name)=>add(boxGeo(w,h,d),material,x+dx,y,z+dz,{name:'challenge:'+name});
  // 1.70 x 0.80m table, 0.75m top, 40mm wood; 0.45m seats, 35mm boards.
  const top=piece(1.7,.04,.8,0,.73,0,M.oak_flat,'top');
  for(const dx of [-.65,.65])for(const dz of [-.28,.28])piece(.06,.71,.06,dx,.355,dz,M.metal_dark,'leg');
  for(const dz of [-.28,.28])piece(1.36,.09,.035,0,.665,dz,M.metal_dark,'apron');
  for(const dx of [-.65,.65])piece(.06,.04,.62,dx,.04,0,M.metal_dark,'foot');
  blockBox(1.7,.75,.8,x,z,'social:challenge-table');
  for(const dz of [-1.05,1.05]) {
    piece(1.2,.035,.38,0,.4325,dz,M.oak_flat,'seat');
    for(const dx of [-.44,.44])piece(.10,.415,.30,dx,.2075,dz,M.stone_light,'seat-base');
    blockBox(1.2,.45,.38,x,z+dz,'social:challenge-seat');
  }
  const standingPositions=[{x:2.85,y:1.6,z:3},{x:5.55,y:1.6,z:3}];
  top.userData.feature='community/arena';
  interactions.push({
    id:'social.challenge',label:'双人竞技桌',prompt:'按 E 邀请好友竞技',object:top,radius:2.2,
    standingPositions,
    action(){return openFeature('community',{tab:'arena',from:'social.challenge'});},
  });
  return {object:top,standingPositions};
}
