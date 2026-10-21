/** Deterministic, geometry-based foliage; no billboard tree or image backdrop. */
export function buildCampusTree({THREE,root,add,cylGeo,M,x,z}) {
  let seed = (Math.round((x+32)*1000)^Math.round((z+20)*900))>>>0;
  const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  const branchMeshes=[];
  function branch(a,b,r0,r1) {
    const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);
    const mid=from.clone().add(to).multiplyScalar(.5);
    const mesh=add(cylGeo(r1,r0,delta.length(),7,false),M.soil,x+mid.x,mid.y,z+mid.z,{name:'green:branch'});
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    branchMeshes.push(mesh);
  }
  branch([0,.2,0],[.04,2.3,0],.13,.055);
  const tips=[];
  for(let i=0;i<12;i++) {
    const angle=i*2.39996+rnd()*.35, spread=.5+rnd()*.5;
    const base=[.04,1.55+rnd()*.65,0];
    const end=[Math.cos(angle)*spread,2.7+rnd()*.85,Math.sin(angle)*spread];
    branch(base,end,.044,.017);
    for(let j=0;j<5;j++) {
      const a=angle+j*1.7, r=.28+rnd()*.5;
      const tip=[end[0]+Math.cos(a)*r,end[1]+(rnd()-.25)*.65,end[2]+Math.sin(a)*r];
      branch(end,tip,.014,.004);tips.push(tip);
    }
  }
  // Bake the branch transforms into one mesh per tree; cached sources remain owner-managed.
  const positions=[],normals=[],uvs=[];
  for(const mesh of branchMeshes) {
    mesh.updateMatrix();const source=mesh.geometry.toNonIndexed();source.applyMatrix4(mesh.matrix);
    positions.push(...source.attributes.position.array);normals.push(...source.attributes.normal.array);uvs.push(...source.attributes.uv.array);
    source.dispose();root.remove(mesh);
  }
  const branches=new THREE.BufferGeometry();
  branches.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));branches.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));branches.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  add(branches,M.soil,0,0,0,{name:'green:branches'});
  // One gently curved surface per leaf; generated botanical albedo/alpha supplies veins and outline.
  const verts=[],uv=[],indices=[];
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    verts.push((col-1)*.5,row/2-.5,Math.sin(row/2*Math.PI)*.035+(col===1?.018:0));uv.push(col/2,row/2);
  }
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){
    const a=row*3+col,b=a+1,c=a+3,d=c+1;indices.push(a,b,d,a,d,c);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();geo.userData.__socialDisposable=true;
  const count=2400,leaves=new THREE.InstancedMesh(geo,M.leaf,count),dummy=new THREE.Object3D();leaves.name='green:leaves';leaves.userData.bakeOccluder=false;
  const colour=new THREE.Color();
  for(let i=0;i<count;i++) {
    const tip=tips[i%tips.length];
    const a=rnd()*Math.PI*2,v=rnd()*2-1,r=Math.cbrt(rnd())*.46,s=Math.sqrt(1-v*v);
    dummy.position.set(x+tip[0]+Math.cos(a)*s*r,tip[1]+v*r*.8,z+tip[2]+Math.sin(a)*s*r);
    dummy.rotation.set(rnd()*Math.PI,rnd()*Math.PI*2,rnd()*Math.PI*2);
    const scale=.085+rnd()*.06;dummy.scale.set(scale*2/3,scale,scale);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
    const tint=.76+rnd()*.24;colour.setRGB(tint*.96,tint,tint*.88);leaves.setColorAt(i,colour);
  }
  leaves.castShadow=true;leaves.receiveShadow=true;leaves.instanceMatrix.needsUpdate=true;root.add(leaves);
}

/** Batch repeated boxes once after assembly. Interaction objects stay unbatched. */
export function batchSocialDetails(THREE,root) {
  const names=new Set(['pavilion:soffit-batten','pavilion:standing-seam','placeholder:facade-pier','placeholder:facade-spandrel','placeholder:window-frame','placeholder:window-sill','placeholder:facade-glazing','placeholder:window-interior']);
  const groups=new Map();
  for(const mesh of root.children) if(mesh.isMesh&&!mesh.isInstancedMesh&&names.has(mesh.name)) {
    const key=mesh.geometry.uuid+'/'+mesh.material.uuid;
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);
  }
  for(const items of groups.values()) if(items.length>2) {
    const src=items[0],batch=new THREE.InstancedMesh(src.geometry,src.material,items.length);batch.name=src.name;
    batch.castShadow=src.castShadow;batch.receiveShadow=src.receiveShadow;batch.userData={...src.userData};
    items.forEach((mesh,i)=>{mesh.updateMatrix();batch.setMatrixAt(i,mesh.matrix);root.remove(mesh);});
    batch.instanceMatrix.needsUpdate=true;root.add(batch);
  }
}

/** Short grass occupies the soil outside the paved footprint, with no gameplay collider. */
export function buildCampusGrass({THREE,root,owner}) {
  let seed=89521;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  const positions=[],colours=[];
  function vertex(x,y,z){positions.push(x,y,z);const shade=.65+.35*y;colours.push(shade*.95,shade,shade*.8);}
  for(let blade=0;blade<3;blade++) {
    const angle=blade*Math.PI*.618,ux=Math.cos(angle),uz=Math.sin(angle),bend=.22;
    const p=[[-.065,0,0],[.065,0,0],[-.035,.55,bend],[.035,.55,bend],[0,1,bend*2.3]];
    for(const id of [0,1,3,0,3,2,2,3,4]){const [x,y,z]=p[id];vertex(ux*x-uz*z,y,uz*x+ux*z);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geo.computeVertexNormals();geo.userData.__socialDisposable=true;
  const mat=new THREE.MeshStandardMaterial({color:0x849158,roughness:.94,side:THREE.DoubleSide,vertexColors:true,envMapIntensity:.6});owner.ownMaterial(mat);
  const count=5200,grass=new THREE.InstancedMesh(geo,mat,count),dummy=new THREE.Object3D(),colour=new THREE.Color();
  grass.name='green:short-grass';grass.userData.bakeOccluder=false;
  for(let i=0;i<count;i++){
    let x,z;do{x=random()*26-13;z=random()*8+9.2;}while(Math.abs(x)<11.16&&Math.abs(z)<9.16);
    dummy.position.set(x,-.037,z);dummy.rotation.set(0,random()*Math.PI*2,0);const h=.025+random()*.025;dummy.scale.set(h,h,h);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);
    const t=.75+random()*.25;colour.setRGB(t,t,t*.91);grass.setColorAt(i,colour);
  }
  grass.castShadow=false;grass.receiveShadow=true;grass.instanceMatrix.needsUpdate=true;root.add(grass);
}

/** A low west-boundary planting strip, outside the original walkable rectangle. */
export function buildCampusHedge({THREE,root,M}) {
  const source=root.getObjectByName('green:leaves');if(!source)return;
  const count=17*300,hedge=new THREE.InstancedMesh(source.geometry,M.leaf,count),dummy=new THREE.Object3D(),colour=new THREE.Color();
  let seed=613749;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  hedge.name='green:west-hedge';hedge.userData.bakeOccluder=false;
  for(let i=0;i<count;i++){
    const shrub=Math.floor(i/300),a=random()*Math.PI*2,v=random()*2-1,r=Math.cbrt(random())*.46,s=Math.sqrt(1-v*v);
    dummy.position.set(-12+Math.cos(a)*s*r,.36+v*r*.75,-7.8+shrub*.92+Math.sin(a)*s*r);
    dummy.rotation.set(random()*Math.PI,random()*Math.PI*2,random()*Math.PI*2);const scale=.10+random()*.04;dummy.scale.set(scale*2/3,scale,scale);dummy.updateMatrix();hedge.setMatrixAt(i,dummy.matrix);
    const t=.65+random()*.25;colour.setRGB(t*.95,t,t*.85);hedge.setColorAt(i,colour);
  }
  hedge.castShadow=true;hedge.receiveShadow=true;hedge.instanceMatrix.needsUpdate=true;root.add(hedge);
}
