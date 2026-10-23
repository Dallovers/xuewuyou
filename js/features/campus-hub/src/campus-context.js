import * as T from 'three';

// Quiet exterior context beyond navigation bounds; these are not new entrances.
export function createCampusContext(surfaces){
 const root=new T.Group();root.name='Distant campus context';
 const wall=new T.MeshStandardMaterial({color:0xe1dfd3,roughness:.9});surfaces.apply(wall,'stone',{normal:.04});
 const roof=new T.MeshStandardMaterial({color:0x667777,roughness:.65,metalness:.32});
 const frame=new T.MeshStandardMaterial({color:0x34433f,roughness:.6,metalness:.25});
 const glass=new T.MeshStandardMaterial({color:0x93aeb0,roughness:.18,metalness:.35});
 const line=new T.MeshStandardMaterial({color:0xd5d3c3,roughness:.95});
 const unit=new T.BoxGeometry(1,1,1),batches=new Map(),dummy=new T.Object3D();
 function box(material,x,y,z,w,h,d){if(!batches.has(material))batches.set(material,[]);dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,0,0);dummy.updateMatrix();batches.get(material).push(dummy.matrix.clone());}
 for(const [x,z,w,d,floors]of [[-68,-64,24,11,3],[52,-82,36,12,4],[76,26,15,21,2]]){
  const h=floors*3.4;box(wall,x,h/2,z,w,h,d);box(roof,x,h+.10,z,w+.3,.20,d+.3);
  for(let level=0;level<floors;level++){
   const y=1.75+level*3.4;
   for(const side of [-1,1]){
    for(let px=-w/2+2;px<w/2-1.5;px+=2.9){box(frame,x+px,y,z+side*(d/2+.032),1.52,1.95,.055);box(glass,x+px,y,z+side*(d/2+.066),1.36,1.77,.028);}
    for(let pz=-d/2+2;pz<d/2-1.5;pz+=2.9){box(frame,x+side*(w/2+.032),y,z+pz,.055,1.95,1.52);box(glass,x+side*(w/2+.066),y,z+pz,.028,1.77,1.36);}
   }
   if(level>0)box(roof,x,level*3.4,z,w+.08,.075,d+.08);
  }
 }
 for(let i=-125;i<126;i++)box(line,i*4,.0,43.8,2.0,.012,.12);
 for(const side of [-1,1])box(line,0,.04,43.8+side*2.55,1000,.14,.18);
 for(const [material,matrices]of batches){const mesh=new T.InstancedMesh(unit,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.name='Campus background '+(material===glass?'glazing':'construction');mesh.receiveShadow=true;mesh.castShadow=false;root.add(mesh);}
 return root;
}
