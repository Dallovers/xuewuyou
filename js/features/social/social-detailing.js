/** Actual small construction pieces. All materials/geometries remain district-owned. */
export function detailSocialConstruction({THREE,root,add,boxGeo,cylGeo,bevel,M,L,owner,colliders}) {
  const steel=M.metal_frame.clone();steel.color.setHex(0x7b7d74);steel.metalness=.82;steel.roughness=.38;owner.ownMaterial(steel);
  const instances=(geometry,material,items,name)=>{
    geometry.userData.__socialDisposable=true;
    const mesh=new THREE.InstancedMesh(geometry,material,items.length),d=new THREE.Object3D();mesh.name=name;
    items.forEach((p,i)=>{d.position.set(p.x,p.y,p.z);d.rotation.set(p.rx||0,p.ry||0,0);d.scale.set(1,1,1);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);});
    mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
  };
  const anchors=[],washers=[];
  for(const x of [L.pavilion.cx-1.35,L.pavilion.cx+1.35])for(const z of [-3.75,-1,1.75]) {
    // 360mm base plate on the +.24m stone pedestal; four M16 anchors sit on the actual plate top.
    for(const dx of [-.143,.143])for(const dz of [-.143,.143]){
      washers.push({x:x+dx,y:.261,z:z+dz});anchors.push({x:x+dx,y:.272,z:z+dz,ry:(x+z)*.37});
    }
  }
  instances(new THREE.CylinderGeometry(.018,.018,.006,12),steel,washers,'detail:anchor-washer');
  instances(new THREE.CylinderGeometry(.012,.012,.016,6),steel,anchors,'detail:anchor-nut');
  // Real end plates at beam/column connections, rather than floating decorative blocks.
  for(const x of [L.pavilion.cx-1.35,L.pavilion.cx+1.35])for(const z of [-3.75,-1,1.75])for(const side of [-1,1])
    add(bevel(THREE,.012,.16,.19,.001,1),M.metal_dark,x+side*.116,2.94,z,{name:'detail:beam-cleat'});
  const D=L.desk;
  // Two narrow vertical pulls, fixed through short brackets to the two actual door leaves.
  for(const dz of [-.075,.075]) {
    for(const y of [.83,.97])add(boxGeo(.028,.012,.016),steel,D.x+.916,y,D.z+dz,{name:'detail:desk-pull-fixing'});
    add(bevel(THREE,.014,.16,.014,.002,1),steel,D.x+.935,.90,D.z+dz,{name:'detail:desk-pull'});
  }
  // The old bright amber strip becomes a recessed opal diffuser in a dark U channel.
  const lamp=root.getObjectByName('social:desk-lamp');
  if(lamp){lamp.scale.set(.38,.25,1);lamp.position.x=D.x+.927;lamp.position.y=1.152;}
  for(const y of [1.14,1.164])add(boxGeo(.034,.004,D.d+.012),M.metal_dark,D.x+.912,y,D.z,{name:'detail:light-channel',cast:false});
  add(boxGeo(.004,.024,D.d+.012),M.metal_dark,D.x+.897,1.152,D.z,{name:'detail:light-channel',cast:false});
  // Positive-thickness gutter and downpipe on the west eave; the existing access remains clear.
  const x=L.pavilion.cx-(L.pavilion.width+.95)/2-.035,z0=L.pavilion.cz;
  for(const dx of [-.045,.045])add(boxGeo(.009,.075,8.02),M.roof_bluegrey,x+dx,3.249,z0,{name:'detail:gutter-side'});
  add(boxGeo(.099,.009,8.02),M.roof_bluegrey,x,3.216,z0,{name:'detail:gutter-bottom'});
  const z=z0-3.73;
  add(cylGeo(.036,.036,3.07,12),M.metal_dark,x,1.675,z,{name:'detail:downpipe'});
  colliders.push({name:'detail:downpipe',type:'box',center:[x,1.675,z],half:[.045,1.535,.045]});
  for(const y of [.55,1.7,2.85])add(boxGeo(.11,.023,.09),steel,x+.015,y,z,{name:'detail:pipe-clip'});
  // Fine, flush channel drain along the outside of the stone platform. It adds no step.
  const drainX=L.pavilion.cx+(L.pavilion.width+.5)/2+.085;
  add(boxGeo(.10,.012,7.48),M.metal_dark,drainX,.023,L.pavilion.cz,{name:'detail:drain-bed',cast:false});
  const slats=[];for(let i=0;i<150;i++)slats.push({x:drainX,y:.032,z:L.pavilion.cz-3.7+i*.0497});
  instances(new THREE.BoxGeometry(.092,.008,.012),steel,slats,'detail:drain-grate').castShadow=false;
  // Permanent instructions, never fabricated user posts or live activity counts.
  if(typeof document!=='undefined')for(const [i,title] of ['校园留言','课程交流','解题讨论','搭子互助'].entries()) {
    const c=document.createElement('canvas');c.width=512;c.height=640;const g=c.getContext('2d');
    g.fillStyle=['#ece8d7','#e8e7dc','#e5e8df','#ede5d5'][i];g.fillRect(0,0,512,640);
    g.strokeStyle='#b9b7a8';g.lineWidth=2;g.strokeRect(22,22,468,596);
    g.fillStyle='#374b41';g.textAlign='center';g.font='500 58px "Microsoft YaHei",sans-serif';g.fillText(title,256,165);
    g.font='32px "Microsoft YaHei",sans-serif';g.fillText('分享学习经验',256,305);g.fillText('交流解题方法',256,365);
    g.fillStyle='#8a917e';g.fillRect(100,465,312,2);g.font='25px "Microsoft YaHei",sans-serif';g.fillText('学无忧 · 社交广场',256,530);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;owner.ownTexture(texture);
    const mat=new THREE.MeshStandardMaterial({map:texture,roughness:.96,side:THREE.DoubleSide,envMapIntensity:.55});owner.ownMaterial(mat);
    const vertices=[],uv=[],indices=[];
    for(let row=0;row<5;row++)for(let col=0;col<5;col++){
      const u=col/4,v=row/4;vertices.push(.068+Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.002+Math.pow(u,7)*.003,(v-.5)*.59,(u-.5)*.43);uv.push(1-u,v);
    }
    for(let r=0;r<4;r++)for(let k=0;k<4;k++){const a=r*5+k;indices.push(a,a+5,a+1,a+1,a+5,a+6);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
    add(geo,mat,L.board.x,1.65,L.board.z+(i-1.5)*.55,{name:'detail:board-instruction'});
    const pin=add(cylGeo(.007,.007,.012,10),steel,L.board.x+.077,1.91,L.board.z+(i-1.5)*.55,{name:'detail:paper-pin'});pin.rotation.z=Math.PI/2;
  }
}
