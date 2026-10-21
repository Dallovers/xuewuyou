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
  // Folded leaf: 8 triangles, actual opaque outline with a central crease.
  const verts=[],uv=[];
  const outline=[[0,-.5],[.3,-.3],[.38,0],[.25,.32],[0,.5],[-.25,.32],[-.38,0],[-.3,-.3]];
  for(let i=0;i<8;i++) {
    const a=outline[i],b=outline[(i+1)%8];
    verts.push(0,0,.004,a[0],a[1],0,b[0],b[1],0);
    uv.push(.5,.5,a[0]+.5,a[1]+.5,b[0]+.5,b[1]+.5);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();geo.userData.__socialDisposable=true;
  const count=2400,leaves=new THREE.InstancedMesh(geo,M.leaf,count),dummy=new THREE.Object3D();leaves.name='green:leaves';
  const colour=new THREE.Color();
  for(let i=0;i<count;i++) {
    const tip=tips[i%tips.length];
    const a=rnd()*Math.PI*2,v=rnd()*2-1,r=Math.cbrt(rnd())*.46,s=Math.sqrt(1-v*v);
    dummy.position.set(x+tip[0]+Math.cos(a)*s*r,tip[1]+v*r*.8,z+tip[2]+Math.sin(a)*s*r);
    dummy.rotation.set(rnd()*Math.PI,rnd()*Math.PI*2,rnd()*Math.PI*2);
    const scale=.09+rnd()*.10;dummy.scale.set(scale*.8,scale,scale);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
    colour.setHSL(.205+rnd()*.045,.30+rnd()*.18,.16+rnd()*.15);leaves.setColorAt(i,colour);
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
