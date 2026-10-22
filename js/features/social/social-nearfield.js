/** Local construction and surface refinement. Metres; district-owned, no host/UI work. */
export function refineSocialNearfield({THREE,root,M,L,owner,add,bevel,colliders}) {
  const body=root.getObjectByName('social:desk-body');
  // A 22mm five-panel carcass, open behind the existing two door leaves.
  // Keep the original mesh centre, interaction object, external envelope and metric bevel UVs.
  const w=L.desk.w-.04,h=L.desk.h-.04,d=L.desk.d-.05,t=.022;
  const parts=[[w,t,d,0,-(h-t)/2,0],[w,t,d,0,(h-t)/2,0],
    [t,h-2*t,d,-(w-t)/2,0,0],[w-t,h-2*t,t,t/2,0,-(d-t)/2],[w-t,h-2*t,t,t/2,0,(d-t)/2]];
  const arrays={position:[],normal:[],uv:[]};
  for(const [pw,ph,pd,x,y,z]of parts){
    const g=bevel(THREE,pw,ph,pd,.0015,1.8);g.translate(x,y,z);
    for(const name of Object.keys(arrays))arrays[name].push(...g.attributes[name].array);
    g.dispose();
  }
  const carcass=new THREE.BufferGeometry();
  for(const [name,values]of Object.entries(arrays))carcass.setAttribute(name,new THREE.Float32BufferAttribute(values,name==='uv'?2:3));
  carcass.userData.__socialDisposable=true;
  body.geometry.dispose();body.geometry.userData.__socialDisposable=false;body.geometry=carcass;
  body.userData.construction={panelThickness:t,hollow:true,outer:[w,h,d]};

  // Offset each real board's UV origin, preserving millimetres/texel and all bevel faces.
  let board=0;
  root.traverse(o=>{
    if(!o.isMesh||!['social:desk-door','social:desk-side-panel','bench:seat'].includes(o.name))return;
    const uv=o.geometry.attributes.uv,du=(++board*.173)%1,dv=(board*.317)%1;
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)+du,uv.getY(i)+dv);
    uv.needsUpdate=true;
  });

  const steel=M.metal_frame.clone();steel.name='nearfield:fixings';steel.color.setHex(0x777971);steel.metalness=.82;steel.roughness=.43;owner.ownMaterial(steel);
  function batch(geometry,material,matrices,name){
    geometry.userData.__socialDisposable=true;
    const mesh=new THREE.InstancedMesh(geometry,material,matrices.length);mesh.name=name;
    matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;
    mesh.castShadow=false;mesh.receiveShadow=true;root.add(mesh);return mesh;
  }
  function matrix(x,y,z,rz=0){return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),rz),new THREE.Vector3(1,1,1));}
  root.updateMatrixWorld(true);
  const screws=[];
  for(const bench of root.children.filter(o=>o.name==='social:bench'))for(const x of [-.54,.54])for(let i=0;i<4;i++){
    const p=new THREE.Vector3(x,.4498,(i-1.5)*.105).applyMatrix4(bench.matrix);
    screws.push(matrix(p.x,p.y,p.z));
  }
  batch(new THREE.CylinderGeometry(.0045,.003,.001,12),steel,screws,'nearfield:bench-flush-fixing');
  const heads=[],washers=[];
  for(const x of [L.pavilion.cx-1.35,L.pavilion.cx+1.35])for(const z of [-3.75,-1,1.75])for(const side of [-1,1])for(const dy of [-.045,.045]){
    washers.push(matrix(x+side*.123,2.94+dy,z,Math.PI/2));
    heads.push(matrix(x+side*.128,2.94+dy,z,Math.PI/2));
  }
  batch(new THREE.CylinderGeometry(.011,.011,.002,12),steel,washers,'nearfield:cleat-washer');
  batch(new THREE.CylinderGeometry(.008,.008,.008,6),steel,heads,'nearfield:cleat-head');

  // Flush base plates; expand only the two local foot colliders, outside the main road.
  const footAnchors=[];
  for(const dz of [-1.16,1.16]){
    add(bevel(THREE,.24,.018,.24,.002,1),M.metal_dark,L.board.x,.019,L.board.z+dz,{name:'nearfield:board-foot'});
    colliders.push({name:'nearfield:board-foot',type:'box',center:[L.board.x,.019,L.board.z+dz],half:[.125,.019,.125]});
    for(const dx of [-.09,.09])for(const oz of [-.09,.09])footAnchors.push(matrix(L.board.x+dx,.031,L.board.z+dz+oz));
  }
  batch(new THREE.CylinderGeometry(.008,.008,.006,6),steel,footAnchors,'nearfield:board-anchor');

  if(typeof document==='undefined')return;
  let seed=56319;const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  function texture(size,colour,pixel){
    const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),a=g.createImageData(size,size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const p=pixel(x,y);a.data.set([...p,255],(y*size+x)*4);}g.putImageData(a,0,0);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=colour?THREE.SRGBColorSpace:THREE.NoColorSpace;
    tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=8;owner.ownTexture(tex);return tex;
  }
  // 0.12m repeat: fine pores rather than using albedo stains as displacement.
  const stoneHeight=texture(256,false,()=>{const p=rnd()<.035?104:125+rnd()*5;return [p,p,p];});
  const stoneRough=texture(256,false,()=>{const p=220+rnd()*22;return [p,p,p];});
  stoneHeight.repeat.set(10,10);stoneRough.repeat.set(10,10);
  for(const id of ['stone_light','stone_light_in']){
    M[id].bumpMap=stoneHeight;M[id].bumpScale=.00007;M[id].roughnessMap=stoneRough;
    M[id].userData.nearfieldStone=true;M[id].needsUpdate=true;
  }
  // A restrained cork face on the existing solid backing; no poster used as geometry.
  const cork=texture(512,true,(x,y)=>{
    const cell=(Math.imul(x>>1,73856093)^Math.imul(y>>1,19349663))>>>0;
    const v=163+(cell%997)/997*16+(rnd()-.5)*18;
    return [v+9,v+3,v-12];
  });
  const corkHeight=texture(512,false,()=>{const v=115+rnd()*26;return [v,v,v];});
  const panel=root.getObjectByName('board:panel'),mat=panel.material.clone();
  mat.name='nearfield:cork';mat.color.setHex(0xffffff);mat.map=cork;mat.normalMap=null;mat.roughnessMap=null;
  mat.bumpMap=corkHeight;mat.bumpScale=.0003;mat.roughness=.94;owner.ownMaterial(mat);panel.material=mat;
}
