import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Deterministic geometry and a procedural cutout, never a generated scene photograph.
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;};}
function leafTexture(){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;const c=canvas.getContext('2d');
 c.fillStyle='#c1cba8';c.beginPath();c.moveTo(64,12);c.bezierCurveTo(120,66,116,169,64,242);c.bezierCurveTo(12,169,8,66,64,12);c.fill();
 c.strokeStyle='#7e9169';c.lineWidth=3;c.beginPath();c.moveTo(64,25);c.lineTo(64,234);c.stroke();c.lineWidth=1;
 for(let i=0;i<9;i++){const y=50+i*18;c.beginPath();c.moveTo(64,y+13);c.lineTo(32,y-5);c.moveTo(64,y+13);c.lineTo(96,y-5);c.stroke();}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}
// The east-window sample uses a cupped blade rather than intersecting large cards.
// A 9 cm x 24 cm blade is modelled in metres; every instance has a varied normal.
function curvedLeaf(){
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,-.12,0,-.045,-.04,-.012,0,-.04,.014,.045,-.04,-.012,-.04,.045,-.008,0,.045,.024,.04,.045,-.008,0,.12,-.02],3));
 g.setAttribute('uv',new T.Float32BufferAttribute([.5,0,0,.33,.5,.33,1,.33,0,.69,.5,.69,1,.69,.5,1],2));g.setIndex([0,1,2,0,2,3,1,4,2,2,4,5,2,5,3,3,5,6,4,7,5,5,7,6]);g.computeVertexNormals();return g;
}
export function createLandscape(parent,wood,obstacle){
 const root=new T.Group();root.name='Library landscape trees and planted beds';parent.add(root);
 const leafPlane=new T.PlaneGeometry(.28,.5),cross=leafPlane.clone().rotateY(Math.PI/2),geometry=mergeGeometries([leafPlane,cross]);leafPlane.dispose();cross.dispose();
 const leaves=[],sampleLeaves=[],bark=new T.MeshStandardMaterial({name:'Tree bark',color:0x645948,roughness:.98,map:wood.map,normalMap:wood.normalMap,normalScale:new T.Vector2(.2,.2)});
 function branch(g,a,b,r1,r2){const v=b.clone().sub(a),geo=new T.CylinderGeometry(r2,r1,v.length(),8,1),mesh=new T.Mesh(geo,bark);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());mesh.updateMatrix();g.push(geo.applyMatrix4(mesh.matrix));}
 function sampleCrown(parts,rng,x,z,height){
  const V=(x,y,z)=>new T.Vector3(x,y,z),leader=V(.16,height*.87,-.09);
  branch(parts,V(0,0,0),V(.10,2.7,-.05),.16,.10);branch(parts,V(.10,2.7,-.05),leader,.10,.018);
  function cluster(center,rx,ry,rz){
   for(let j=0;j<6;j++){const a=j*2.399963,tip=center.clone().add(V(Math.cos(a)*rx*.85,(j%3-1)*ry*.75,Math.sin(a)*rz*.85));branch(parts,center,tip,.0045,.0012);}
   for(let k=0;k<160;k++){const az=rng()*Math.PI*2,v=rng()*2-1,rad=Math.cbrt(rng()),r=Math.sqrt(1-v*v);sampleLeaves.push({x:x+center.x+Math.cos(az)*r*rad*rx,y:-.30+center.y+v*rad*ry,z:z+center.z+Math.sin(az)*r*rad*rz,angle:rng()*Math.PI*2,tilt:.4+rng()*2.4,roll:rng()*Math.PI*2,scale:.72+rng()*.48,tint:rng()});}
  }
  for(let i=0;i<8;i++){
   const angle=i*2.399963+.35+rng()*.35,length=1.65+rng()*.5,base=V(.1,2.6+i*.25,-.05),mid=V(Math.cos(angle)*length*.58,3.35+i*.28,Math.sin(angle)*length*.58),end=V(Math.cos(angle)*length,3.9+i*.29,Math.sin(angle)*length);
   branch(parts,base,mid,.065-i*.004,.032);branch(parts,mid,end,.032,.012);
   for(let j=0;j<3;j++){const a=angle+(j-1)*.68,tip=end.clone().add(V(Math.cos(a)*.44,(j===1?.55:.15)+rng()*.25,Math.sin(a)*.44));branch(parts,end,tip,.012,.003);cluster(tip,.72+rng()*.13,.52+rng()*.12,.72+rng()*.13);}
  }
  for(let i=0;i<4;i++){const center=V(Math.sin(i*2.4)*.65,4.35+i*.7,Math.cos(i*2.4)*.65),base=V(.13,center.y-.35,-.07);branch(parts,base,center,.02,.005);cluster(center,.90,.68,.90);}
 }
 for(const [x,z,height,seed] of [[-16,-3,7.2,142],[16,-4,7.5,623],[-16,13,6.6,318]]){
  const rng=random(seed),parts=[],tree=new T.Group();tree.name='Library tree '+seed;tree.position.set(x,-.30,z);root.add(tree);
  if(seed===623)sampleCrown(parts,rng,x,z,height);
  else{branch(parts,new T.Vector3(0,0,0),new T.Vector3(.16,height*.69,-.09),.16,.045);
  for(let i=0;i<11;i++){
   const angle=i*2.399963+seed,base=new T.Vector3(.10,height*(.32+i*.027),-.05),length=1.8+(i<6?.6:0)+rng()*.4,end=new T.Vector3(Math.cos(angle)*length,height*(.56+i*.029),Math.sin(angle)*length);
   branch(parts,base,end,.055-i*.002,.012);
   for(let j=0;j<3;j++){
    const a=angle+(j-1)*.65,tip=end.clone().add(new T.Vector3(Math.cos(a)*.65,.4+rng()*.4,Math.sin(a)*.65));branch(parts,end,tip,.013,.004);
    for(let k=0;k<46;k++){const az=rng()*Math.PI*2,vertical=rng()*2-1,rad=Math.cbrt(rng())*.94,r=Math.sqrt(1-vertical*vertical);leaves.push({x:x+tip.x+Math.cos(az)*r*rad,y:-.30+tip.y+vertical*rad*.6,z:z+tip.z+Math.sin(az)*r*rad,angle:rng()*Math.PI*2,tilt:rng()*.9-.45,scale:.65+rng()*.7,tint:rng()});}
   }
  }
  }
  const merged=mergeGeometries(parts);parts.forEach(g=>g.dispose());const trunk=new T.Mesh(merged,bark);trunk.name='Connected trunk and branches';trunk.castShadow=true;trunk.receiveShadow=true;tree.add(trunk);obstacle(x,z,.42,.42,'tree');
 }
 for(const x of [-9,9]){const rng=random(x<0?29:92);for(let i=0;i<160;i++)leaves.push({x:x+(rng()-.5)*2.25,y:.58+rng()*.28,z:12.5+(rng()-.5)*.82,angle:rng()*Math.PI*2,tilt:rng()*1.3-.65,scale:.7+rng()*.5,tint:rng()});}
 const material=new T.MeshStandardMaterial({name:'Botanical leaf cutouts',map:leafTexture(),color:0xffffff,alphaTest:.45,side:T.DoubleSide,roughness:.93,metalness:0});
 const inst=new T.InstancedMesh(geometry,material,leaves.length),dummy=new T.Object3D();inst.name='Instanced tree and planter foliage';inst.castShadow=true;inst.receiveShadow=true;
 const a=new T.Color(0x617b48),b=new T.Color(0x9d9f64);
 leaves.forEach((leaf,i)=>{dummy.position.set(leaf.x,leaf.y,leaf.z);dummy.rotation.set(leaf.tilt,leaf.angle,leaf.tilt*.5);dummy.scale.setScalar(leaf.scale);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);inst.setColorAt(i,a.clone().lerp(b,leaf.tint*.55));});inst.computeBoundingSphere();root.add(inst);
 const sample=new T.InstancedMesh(curvedLeaf(),material,sampleLeaves.length);sample.name='East window sample cupped foliage';sample.castShadow=true;sample.receiveShadow=true;
 sampleLeaves.forEach((leaf,i)=>{dummy.position.set(leaf.x,leaf.y,leaf.z);dummy.rotation.set(leaf.tilt,leaf.angle,leaf.roll);dummy.scale.setScalar(leaf.scale);dummy.updateMatrix();sample.setMatrixAt(i,dummy.matrix);sample.setColorAt(i,a.clone().lerp(b,leaf.tint*.55));});sample.computeBoundingSphere();root.add(sample);
 root.userData={trees:3,foliageInstances:leaves.length+sampleLeaves.length,sample:{tree:623,leaves:sampleLeaves.length,bladeMetres:[.09,.24],clusters:28},source:'Procedural branches and leaf alpha, no external image dependency'};
 return root;
}
