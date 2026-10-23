/** Deterministic, geometry-based foliage; no billboard tree or image backdrop. */
export function buildCampusTree({THREE,root,add,cylGeo,M,x,z,leafCount=3600,seedOffset=0}) {
  let seed = (Math.round((x+32)*1000)^Math.round((z+20)*900)^seedOffset)>>>0;
  const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  const branchMeshes=[];
  function branch(points,r0,r1) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments=r0>.035?7:3,radial=r0>.035?10:5;
    const g=new THREE.TubeGeometry(curve,segments,1,radial,false),pos=g.attributes.position,uv=g.attributes.uv;
    for(let row=0;row<=segments;row++)for(let col=0;col<=radial;col++){
      const i=row*(radial+1)+col,t=row/segments,centre=curve.getPointAt(t),v=new THREE.Vector3().fromBufferAttribute(pos,i).sub(centre),r=r0*(1-t)+r1*t;
      v.multiplyScalar(r*(1+.035*Math.sin(col/radial*Math.PI*6+t*7))).add(centre);
      if(x<0&&v.z<0)v.z*=.65; // Pruned north side beside the existing pavilion roof.
      pos.setXYZ(i,v.x,v.y,v.z);uv.setXY(i,col/radial*2*Math.PI*r/.6,t*curve.getLength()/.9);
    }
    g.computeVertexNormals();
    const mesh=add(g,M.bark||M.soil,x,0,z,{name:'green:branch'});branchMeshes.push(mesh);return curve;
  }
  const trunk=branch([[0,.2,0],[.045,1.0,.02],[-.025,1.9,.045],[.14,2.75,.03],[.08,3.45,-.08]],.13,.021),tips=[];
  for(let i=0;i<6;i++){
    const angle=i*2.39996+(rnd()-.5)*.7,base=trunk.getPoint(.43+rnd()*.30),spread=.95+rnd()*.45;
    const end=new THREE.Vector3(Math.cos(angle)*spread,2.7+rnd()*.75,Math.sin(angle)*spread);
    const middle=base.clone().lerp(end,.48);middle.y-=.12;
    const primary=branch([base.toArray(),middle.toArray(),end.toArray()],.044,.009);
    for(let j=0;j<6;j++){
      const from=primary.getPoint(.30+j*.115),a=angle+(j%2?1:-1)*(.45+rnd()*.8),length=.30+rnd()*.45;
      const to=from.clone().add(new THREE.Vector3(Math.cos(a)*length,.10+rnd()*.44,Math.sin(a)*length));
      const mid=from.clone().lerp(to,.5);mid.y-=.035;
      const twig=branch([from.toArray(),mid.toArray(),to.toArray()],.011,.0022);
      for(let k=0;k<4;k++)tips.push(twig.getPoint(.4+k*.2).toArray());
    }
  }
  // Bake the branch transforms into one mesh per tree; cached sources remain owner-managed.
  const positions=[],normals=[],uvs=[];
  for(const mesh of branchMeshes) {
    mesh.updateMatrix();const source=mesh.geometry.toNonIndexed();source.applyMatrix4(mesh.matrix);
    positions.push(...source.attributes.position.array);normals.push(...source.attributes.normal.array);uvs.push(...source.attributes.uv.array);
    source.dispose();if(!mesh.geometry.userData.__socialCached)mesh.geometry.dispose();root.remove(mesh);
  }
  const branches=new THREE.BufferGeometry();
  branches.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));branches.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));branches.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  add(branches,M.bark||M.soil,0,0,0,{name:'green:branches'});
  // One gently curved surface per leaf; generated botanical albedo/alpha supplies veins and outline.
  const verts=[],uv=[],indices=[];
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    verts.push((col-1)*.5,row/2-.5,Math.sin(row/2*Math.PI)*.035+(col===1?.018:0));uv.push(col/2,row/2);
  }
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){
    const a=row*3+col,b=a+1,c=a+3,d=c+1;indices.push(a,b,d,a,d,c);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();geo.userData.__socialDisposable=true;
  const count=leafCount,leaves=new THREE.InstancedMesh(geo,M.leaf,count),dummy=new THREE.Object3D();leaves.name='green:leaves';leaves.userData.bakeOccluder=false;
  const colour=new THREE.Color();
  for(let i=0;i<count;i++) {
    const tip=tips[i%tips.length];
    const a=rnd()*Math.PI*2,v=rnd()*2-1,r=Math.cbrt(rnd())*.26,s=Math.sqrt(1-v*v);
    const pz=tip[2]+Math.sin(a)*s*r;dummy.position.set(x+tip[0]+Math.cos(a)*s*r,tip[1]+v*r*.8,z+(x<0&&pz<0?pz*.65:pz));
    dummy.rotation.set(rnd()*Math.PI,rnd()*Math.PI*2,rnd()*Math.PI*2);
    const scale=.085+rnd()*.06;dummy.scale.set(scale*2/3,scale,scale);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
    const tint=.76+rnd()*.24;colour.setRGB(tint*.96,tint,tint*.88);leaves.setColorAt(i,colour);
  }
  leaves.castShadow=true;leaves.receiveShadow=true;leaves.instanceMatrix.needsUpdate=true;root.add(leaves);
}

/** Batch repeated boxes once after assembly. Interaction objects stay unbatched. */
export function batchSocialDetails(THREE,root) {
  const names=new Set(['pavilion:soffit-batten','pavilion:standing-seam','placeholder:facade-pier','placeholder:facade-spandrel','placeholder:window-frame','placeholder:window-sill','placeholder:facade-glazing','placeholder:window-interior','facade:frame','facade:glass','facade:pier','facade:gasket','facade:sill','detail:beam-cleat','detail:desk-pull-fixing','detail:pipe-clip']);
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

/** A small western garden edge, outside gameplay: three young trees and a low seat wall. */
export function buildSocialGardenEdge({THREE,root,add,boxGeo,cylGeo,M}) {
  add(boxGeo(.32,.60,28),M.brick_grey,-13.55,.30,0,{name:'garden:seat-wall'});
  add(boxGeo(.43,.055,28.08),M.stone_light_in,-13.55,.6275,0,{name:'garden:wall-cap'});
  for(let i=0;i<3;i++) {
    const group=new THREE.Group();group.name='garden:tree';root.add(group);
    const localAdd=(g,m,x,y,z,opts={})=>add(g,m,x,y,z,{...opts,parent:group});
    buildCampusTree({THREE,root:group,add:localAdd,cylGeo,M,x:0,z:0,leafCount:1900,seedOffset:i*311});
    group.position.set(-16.5-(i%2)*1.2,0,-9+i*9.3);group.scale.setScalar([1.5,1.65,1.42][i]);
    group.traverse(o=>{if(o.isMesh)o.castShadow=false;});
  }
}

export function mergeSocialCurtains(THREE,root) {
  const items=root.children.filter(o=>o.isMesh&&o.name==='facade:curtain');if(!items.length)return;
  const positions=[],normals=[],uv=[];
  for(const o of items){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);g.dispose();o.geometry.dispose();root.remove(o);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.userData.__socialDisposable=true;
  const mesh=new THREE.Mesh(g,items[0].material);mesh.name='facade:curtains';mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);
}
