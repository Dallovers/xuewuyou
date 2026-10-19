import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {Tree} from '@dgreenheck/ez-tree';

import {DESIGN} from './terrain.js';
export {DESIGN,heightAt} from './terrain.js';
export const materials={},colliders=[],doors=[],seats=[];
export const building=new T.Group();building.name='CourseAcademy_EditableArchitecture';
building.userData={design:DESIGN,source:'Rebuilt geometry guided by three generated elevations; not automatic AI mesh cleanup',units:'metres'};
const loader=new T.TextureLoader(),units=new Map();
function material(name,color,extra={},unit=2){const m=new T.MeshStandardMaterial({name,color,roughness:.82,...extra});units.set(m,unit);return m;}
function tiledStoneTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d');c.fillStyle='#abaea6';c.fillRect(0,0,1024,1024);const colors=['#deded5','#dcdcd2','#dfdfd7','#ddddd4','#e0dfd7','#deded5','#dcddd3','#dfded6','#ddddd3'];for(let y=0;y<3;y++)for(let x=0;x<3;x++){c.fillStyle=colors[y*3+x];const left=Math.round(x*1024/3),top=Math.round(y*1024/3),right=Math.round((x+1)*1024/3),bottom=Math.round((y+1)*1024/3);c.fillRect(left+1,top+1,right-left-2,bottom-top-2);}const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;}
export async function loadMaterials(){
 async function tex(name,color=false){const t=await loader.loadAsync('assets/'+name+'.jpg');t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(color)t.colorSpace=T.SRGBColorSpace;return t;}
 const [brick,bn,br,stone,sn,sr,wood,wn,wr]=await Promise.all([tex('brick-color',true),tex('brick-normal'),tex('brick-roughness'),tex('stone-color',true),tex('stone-normal'),tex('stone-roughness'),tex('wood-color',true),tex('wood-normal'),tex('wood-roughness')]);
 materials.brick=material('Grey masonry',0xc0c6c3,{map:brick,normalMap:bn,normalScale:new T.Vector2(.10,.10),roughnessMap:br},1.7);
 materials.stone=material('Pale limestone',0xd6d1c4,{normalMap:sn,normalScale:new T.Vector2(.025,.025),roughness:.81},3);
 materials.trim=material('Cut limestone trim',0xd8d3c7,{roughness:.73});
 materials.roof=material('Blue grey standing seam zinc',0x627483,{metalness:.68,roughness:.43});
 materials.metal=material('Dark bronze frames',0x38433f,{metalness:.65,roughness:.34});
 materials.wood=material('Natural oak',0xfff3dc,{map:wood,normalMap:wn,normalScale:new T.Vector2(.045,.045),roughness:.64},1.8);
 materials.wall=material('Warm mineral plaster',0xe6e7e3,{roughness:.94});
 materials.ceiling=material('Acoustic ceiling',0xe8e6dd,{roughness:.94});
 const stoneTiles=tiledStoneTexture();
 materials.floor=material('Honed interior stone',0xf4f4ee,{map:stoneTiles,normalMap:sn,normalScale:new T.Vector2(.012,.012),roughness:.6},2.7);
 materials.paving=material('Jointed courtyard stone',0xf2eedf,{map:stoneTiles,normalMap:sn,normalScale:new T.Vector2(.025,.025),roughness:.8},3.6);
 materials.black=material('Chair steel',0x2e3837,{metalness:.68,roughness:.38});
 materials.glass=new T.MeshPhysicalMaterial({name:'Clear architectural glass',color:0xc6d7d8,roughness:.08,metalness:.05,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide,envMapIntensity:1.2});
 materials.board=material('Teaching board',0x334d43,{roughness:.68});
 materials.light=material('Warm linear luminaire',0xfff0d5,{emissive:0xffedc9,emissiveIntensity:2.3,roughness:.4});
 materials.classroomLight=materials.light.clone();materials.classroomLight.name='Classroom dimmable luminaire';
 materials.fabric=material('Grey green upholstery',0x879188,{roughness:.97});
 materials.paper=material('Paper',0xe7e4d9,{roughness:.92});
 materials.book=material('Muted book cover',0x6c7f77,{roughness:.86});
 materials.water=new T.MeshPhysicalMaterial({name:'Shallow fountain water',color:0x82aaa2,roughness:.12,metalness:.05,transparent:true,opacity:.8,envMapIntensity:1.3});
 return materials;
}
function group(name,parent=building){const g=new T.Group();g.name=name;parent.add(g);return g;}
function uvWorld(geometry,x,y,z,m){if(!m.map)return;const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv,unit=units.get(m)||2;for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));const a=ax>ay&&ax>az?p.getZ(i)+z:p.getX(i)+x,b=ay>ax&&ay>az?p.getZ(i)+z:p.getY(i)+y;uv.setXY(i,a/unit,b/unit);}}
function box(g,name,x,y,z,w,h,d,m,bevel=0){const geometry=bevel?new RoundedBoxGeometry(w,h,d,1,Math.min(bevel,w/4,h/4,d/4)):new T.BoxGeometry(w,h,d);uvWorld(geometry,x,y,z,m);const a=new T.Mesh(geometry,m);a.name=name;a.position.set(x,y,z);a.castShadow=!m.transparent;a.receiveShadow=true;g.add(a);return a;}
function cylinder(g,name,a,b,r,m,sides=12){const delta=new T.Vector3().subVectors(b,a);const mesh=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),sides),m);mesh.name=name;mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());mesh.castShadow=!m.transparent;mesh.receiveShadow=true;g.add(mesh);return mesh;}
function beam(g,name,a,b,width,depth,m){const delta=new T.Vector3().subVectors(b,a);const mesh=box(g,name,0,0,0,width,delta.length(),depth,m,.008);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return mesh;}
function obstacle(x,z,w,d,id='wall'){const c={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,id};colliders.push(c);return c;}
function plaque(g,text,x,y,z,w=1.8,h=.5,rotation=0,bg='#ddd8c8',ink='#3c4943'){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 88px "Microsoft YaHei",sans-serif';ctx.fillText(text,512,132,960);const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;
 const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({name:'Physical wayfinding sign',map:t,roughness:.87}));mesh.name='Physical sign '+text;mesh.position.set(x,y,z);mesh.rotation.y=rotation;g.add(mesh);return mesh;
}
function wallRun(g,name,axis,at,start,end,openings,base=.6,top=15.8,m=materials.brick,thickness=.38){
 const cuts=[start,end,...openings.flatMap(o=>[Math.max(start,o.u-o.w/2),Math.min(end,o.u+o.w/2)])].sort((a,b)=>a-b).filter((v,i,a)=>!i||Math.abs(v-a[i-1])>.001);
 const put=(a,b,lo,hi)=>{if(b-a<.002||hi-lo<.002)return;axis==='x'?box(g,name,(a+b)/2,(lo+hi)/2,at,b-a,hi-lo,thickness,m):box(g,name,at,(lo+hi)/2,(a+b)/2,thickness,hi-lo,b-a,m);};
 for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],u=(a+b)/2;const intervals=openings.filter(o=>u>o.u-o.w/2-.001&&u<o.u+o.w/2+.001).map(o=>[Math.max(base,o.y-o.h/2),Math.min(top,o.y+o.h/2)]).filter(o=>o[1]>o[0]).sort((a,b)=>a[0]-b[0]);let y=base;for(const [lo,hi] of intervals){if(lo>y)put(a,b,y,lo);y=Math.max(y,hi);}if(y<top)put(a,b,y,top);}
}
function window(g,axis,at,u,y,w,h=2.5,side=1){
 const frame=(du,dy,ww,hh,dd,m=materials.metal,offset=.04)=>axis==='x'?box(g,'Window frame',u+du,y+dy,at+side*offset,ww,hh,dd,m,.009):box(g,'Window frame',at+side*offset,y+dy,u+du,dd,hh,ww,m,.009);
 for(const x of [-w/2,w/2,0])frame(x,0,.065,h+.08,.12);
 for(const dy of [-h/2,h/2,h/2-.53])frame(0,dy,w+.07,.065,.12);
 frame(0,0,w-.08,h-.08,.014,materials.glass,-.025);
 frame(0,-h/2-.10,w+.27,.13,.56,materials.trim,.025);
 // Window recesses are bounded by real wall thickness; reveals are geometry.
 frame(-w/2-.055,0,.1,h+.08,.38,materials.trim,-.03);frame(w/2+.055,0,.1,h+.08,.38,materials.trim,-.03);
}
function facade(g,name,axis,at,start,end,centres,widths,{side=1,door=false,wing=false}={}){
 const walls=group(name+' walls',g),frames=group(name+' glazing and frames',g),openings=[];
 for(let row=0;row<4;row++){const y=.6+row*3.8+2.05;for(let i=0;i<centres.length;i++){
  const u=centres[i],w=Array.isArray(widths)?widths[i]:widths;
  if(door&&row===0&&Math.abs(u)<9.1)continue;
  openings.push({u,w,y,h:2.5});window(frames,axis,at,u,y,w,2.5,side);
 }}
 if(door)openings.push({u:0,w:18,y:2.07,h:2.94});
 wallRun(walls,'Masonry with real openings',axis,at,start,end,openings);
 wallRun(walls,'Internal plaster window reveals',axis,at-side*.215,start,end,openings,.6,15.8,materials.wall,.045);
 for(let level=0;level<=4;level++){const y=.6+level*3.8;axis==='x'?box(walls,'Floor stone band',(start+end)/2,y,at+side*.09,end-start,.15,.55,materials.trim,.012):box(walls,'Floor stone band',at+side*.09,y,(start+end)/2,.55,.15,end-start,materials.trim,.012);}
 const piers=wing?[start+.25,end-.25]:[start+.23,end-.23,...centres.slice(0,-1).map((c,i)=>(c+centres[i+1])/2)].filter(u=>!door||Math.abs(u)>9.2);
 for(const u of piers)axis==='x'?box(walls,'Stone facade pier',u,8.2,at+side*.08,.32,15.2,.52,materials.trim,.009):box(walls,'Stone facade pier',at+side*.08,8.2,u,.52,15.2,.32,materials.trim,.009);
 return openings;
}
function hippedRoof(g,name,x,z,w,d,eave,rise){
 const verts=[],indices=[],a=w/2,b=d/2;
 let points;if(w>=d){const inset=Math.min(b,w*.25);points=[[-a,0,-b],[a,0,-b],[a,0,b],[-a,0,b],[-a+inset,rise,0],[a-inset,rise,0]];indices.push(0,4,5,0,5,1,3,2,5,3,5,4,0,3,4,1,5,2);}else{const inset=Math.min(a,d*.25);points=[[-a,0,-b],[a,0,-b],[a,0,b],[-a,0,b],[0,rise,-b+inset],[0,rise,b-inset]];indices.push(0,4,1,3,2,5,0,3,5,0,5,4,1,4,5,1,5,2);}
 for(const p of points)verts.push(...p);let geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(verts,3));geometry.setIndex(indices);geometry=geometry.toNonIndexed();geometry.computeVertexNormals();const roof=new T.Mesh(geometry,materials.roof);roof.name=name+' sloping metal panels';roof.position.set(x,eave,z);roof.castShadow=true;roof.receiveShadow=true;g.add(roof);
 const p3=i=>new T.Vector3(x+points[i][0],eave+points[i][1]+.035,z+points[i][2]);for(const [i,j] of w>=d?[[0,4],[3,4],[1,5],[2,5],[4,5]]:[[0,4],[1,4],[2,5],[3,5],[4,5]])beam(g,'Folded ridge flashing',p3(i),p3(j),.055,.055,materials.roof);
 if(w>=d){const inset=Math.min(b,w*.25);for(let xx=-a+inset+.3;xx<a-inset;xx+=.58)for(const s of [-1,1])beam(g,'Standing seam',new T.Vector3(x+xx,eave+.02,z+s*b),new T.Vector3(x+xx,eave+rise+.02,z),.018,.026,materials.roof);}else{const inset=Math.min(a,d*.25);for(let zz=-b+inset+.3;zz<b-inset;zz+=.58)for(const s of [-1,1])beam(g,'Standing seam',new T.Vector3(x+s*a,eave+.02,z+zz),new T.Vector3(x,eave+rise+.02,z+zz),.018,.026,materials.roof);}
 box(g,'Roof fascia',x,eave-.11,z,w+.06,.24,d+.06,materials.trim,.012);
 // Fascia is a hollow perimeter rather than a slab which could obscure the roof.
 g.remove(g.children.at(-1));
 for(const s of [-1,1]){box(g,'Eave fascia',x,eave-.10,z+s*b,w,.22,.13,materials.trim,.008);box(g,'Eave fascia',x+s*a,eave-.10,z,.13,.22,d,materials.trim,.008);}
}
function glassEntrance(g){
 const wall=group('Ground floor curtain wall',g),at=4;
 for(const u of [-9,-6,-3,-1.55,1.55,3,6,9])box(wall,'Bronze curtain wall mullion',u,2.05,at,.065,2.9,.14,materials.metal,.008);
 box(wall,'Curtain wall head',0,3.52,at,18,.09,.14,materials.metal,.008);
 for(const [x,w] of [[-5.3,7.3],[5.3,7.3]])box(wall,'Curtain wall glass',x,2.02,at-.02,w,2.78,.018,materials.glass);
 makeDoor(g,'entry','入口玻璃门',0,4,3.1,2.82,'slide');
 obstacle(-5.35,4,7.6,.38,'entry glazing');obstacle(5.35,4,7.6,.38,'entry glazing');
}
function makeDoor(g,id,label,x,z,width,height,kind='swing',rotation=0){
 const root=group(label,g);root.position.set(x,.6,z);root.rotation.y=rotation;root.userData.dynamic=true;
 const leaves=[];
 const makeLeaf=(centre,w)=>{const l=new T.Group();root.add(l);l.position.x=centre;for(const a of [-w/2,w/2])box(l,'Door stile',a,height/2,0,.055,height,.10,materials.metal,.006);for(const yy of [0,height])box(l,'Door rail',0,yy,0,w,.065,.1,materials.metal,.006);box(l,'Door glass',0,height/2,0,w-.06,height-.08,.018,materials.glass);cylinder(l,'Pull handle',new T.Vector3(.12,1.0,.11),new T.Vector3(.12,1.45,.11),.017,materials.metal);return l;};
 let pivot;
 if(kind==='slide'){for(const s of [-1,1]){const l=makeLeaf(s*width/4,width/2);leaves.push({object:l,closed:s*width/4,sign:s});}}else{pivot=new T.Group();pivot.position.x=-width/2;root.add(pivot);const l=makeLeaf(0,width);root.remove(l);pivot.add(l);l.position.x=width/2;leaves.push({object:pivot});}
 const c=rotation?obstacle(x,z,.20,width,id):obstacle(x,z,width,.20,id);const item={id,label,root,kind,width,leaves,open:0,target:0,collider:c,position:new T.Vector3(x,1.9,z),rotation};doors.push(item);return item;
}
function stairsAndPortico(g){
 const p=group('Straight entrance steps ramp and portico',g);
 box(p,'Entrance landing',0,.46,6.25,20,.28,4.5,materials.stone,.016);
 for(let i=0;i<4;i++){const h=(i+1)*.15,z=10.35-i*.45;box(p,'Straight stone step '+(i+1),0,h/2,z,20,h,.46,materials.stone,.01);box(p,'Step nosing',0,h-.018,z+.23,20,.028,.035,materials.trim,.005);}
 for(const x of [-8.7,-2.9,2.9,8.7]){box(p,'Square portico column',x,2.45,7.45,.62,3.7,.62,materials.trim,.016);box(p,'Column plinth',x,.73,7.45,.76,.26,.76,materials.stone,.012);obstacle(x,7.45,.62,.62,'portico column');}
 box(p,'Entrance canopy stone slab',0,4.45,6.08,20.1,.4,4.15,materials.trim,.018);box(p,'Entrance canopy lower soffit',0,4.215,6.06,18.7,.045,3.5,materials.wood,.003);
 for(let x=-8;x<=8;x+=2)box(p,'Recessed canopy lighting',x,4.177,6.4,.045,.018,2.3,materials.light,.003);
 plaque(p,'课 程 学 院',0,4.47,8.165,3.4,.26,0,'#d2cbbc','#47524d');
 // Accessible ramp descends eastward over 10.5m, with actual sloping geometry.
 const {highX:x0,lowX:x1,minZ:z0,maxZ:z1,top}=DESIGN.ramp;
 const shape=new T.BufferGeometry();shape.setAttribute('position',new T.Float32BufferAttribute([x0,0,z0,x1,0,z0,x1,0,z1,x0,0,z1,x0,top,z0,x1,.03,z0,x1,.03,z1,x0,top,z1],3));shape.setIndex([4,7,6,4,6,5,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5]);shape.computeVertexNormals();const ramp=new T.Mesh(shape,materials.trim);ramp.name='Accessible ramp 1 to 18';ramp.castShadow=true;ramp.receiveShadow=true;p.add(ramp);
 box(p,'Upper ramp landing',10.2,.3,6.6,1.9,.6,7.3,materials.stone,.012);
 for(const z of [8.4,10.25]){beam(p,'Bronze ramp handrail',new T.Vector3(x0,1.56,z),new T.Vector3(x1,.99,z),.04,.04,materials.metal);for(let x=x0;x<=x1;x+=1.5){const h=.6*(x1-x)/(x1-x0);cylinder(p,'Ramp rail post',new T.Vector3(x,h,z),new T.Vector3(x,h+.94,z),.018,materials.metal);}}
}
function chair(g,x,z,rotation=0){
 const c=group('Bent plywood student chair',g);c.position.set(x,.6,z);c.rotation.y=rotation;
 box(c,'Plywood seat',0,.45,0,.45,.045,.44,materials.wood,.025);
 const vertices=[],uv=[],indices=[],nx=12,ny=8;
 for(let side=0;side<2;side++)for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const y=.61+j/ny*.31,d=Math.max(0,.025-Math.min(y-.61,.92-y)),half=.2+Math.sqrt(Math.max(0,.025**2-d*d)),xx=-half+2*half*i/nx;
  vertices.push(xx,y,.225-.065*(xx/.225)**2+(y-.65)*.11+(side-.5)*.018);uv.push((xx+.225)*1.3,(y-.61)*1.3);
 }
 const stride=nx+1,n=(nx+1)*(ny+1);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*stride+i;indices.push(a,a+stride+1,a+1,a,a+stride,a+stride+1,a+n,a+1+n,a+stride+1+n,a+n,a+stride+1+n,a+stride+n);}
 const rim=[];for(let i=0;i<=nx;i++)rim.push(i);for(let j=1;j<=ny;j++)rim.push(j*stride+nx);for(let i=nx-1;i>=0;i--)rim.push(ny*stride+i);for(let j=ny-1;j>0;j--)rim.push(j*stride);
 for(let i=0;i<rim.length;i++){const a=rim[i],b=rim[(i+1)%rim.length];indices.push(a,b,b+n,a,b+n,a+n);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const back=new T.Mesh(geo,materials.wood);back.name='Curved laminated plywood back';back.castShadow=true;back.receiveShadow=true;c.add(back);
 for(const sx of [-.17,.17])for(const sz of [-.16,.16])cylinder(c,'Tubular chair leg',new T.Vector3(sx*1.15,.02,sz*1.2),new T.Vector3(sx,.45,sz),.014,materials.black);
 for(const sx of [-.17,.17])for(const sz of [-.16,.16])cylinder(c,'Rubber floor protector',new T.Vector3(sx*1.15,.004,sz*1.2),new T.Vector3(sx*1.15,.027,sz*1.2),.019,materials.black,16);
 for(const sx of [-.17,.17])cylinder(c,'Chair back support',new T.Vector3(sx,.3,.16),new T.Vector3(sx,.9,.24),.013,materials.black);
 return c;
}
function desk(g,x,z){
 box(g,'Oak double student desk',x,1.35,z,.63,.048,1.55,materials.wood,.018);
 for(const dz of [-.64,.64]){box(g,'Desk frame crossbar',x,1.24,z+dz,.48,.045,.045,materials.black,.009);for(const dx of [-.23,.23])cylinder(g,'Desk leg',new T.Vector3(x+dx,.62,z+dz),new T.Vector3(x+dx,1.32,z+dz),.02,materials.black);}
 box(g,'Desk modesty panel',x+.27,1.11,z,.025,.32,1.38,materials.wood,.007);
 for(const dz of [-.64,.64])for(const dx of [-.23,.23])cylinder(g,'Desk levelling foot',new T.Vector3(x+dx,.607,z+dz),new T.Vector3(x+dx,.638,z+dz),.027,materials.black,16);
}
function interiors(g){
 const shell=group('Accessible ground floor lobby and classroom',g),furniture=group('Lobby and classroom furniture',g);
 shell.userData.bakeReceiver=true;furniture.userData.bakeReceiver=true;
 // Lobby: x -9..9, z -6..4. Classroom: x 9..23.6, z -6..4.
 wallRun(shell,'Lobby east partition','z',9,-6,4,[{u:-1.6,w:1.8,y:1.96,h:2.72}],.6,4.24,materials.wall,.20);
 box(shell,'Lobby west partition',-9,2.42,-1,.2,3.64,10,materials.wall);obstacle(-9,-1,.2,10,'lobby west wall');
 box(shell,'Rear lobby and classroom wall',7.3,2.42,-6,33.2,3.64,.22,materials.wall);obstacle(7.3,-6,33.2,.22,'rear room wall');
 obstacle(9,-4.24,.2,3.52,'classroom partition');obstacle(9,1.65,.2,4.5,'classroom partition');
 makeDoor(shell,'classroom','教室玻璃门',9,-1.6,1.8,2.72,'swing',Math.PI/2);
 // Built-in wall and ceiling treatments are tangible objects.
 box(shell,'Classroom east wall',23.5,2.42,-1,.22,3.64,10,materials.wall);obstacle(23.5,-1,.22,10,'classroom east wall');
 box(shell,'Lobby oak wall lining',-8.86,1.48,-1,.045,1.75,9.8,materials.wood,.004);
 for(let z=-5.8;z<3.8;z+=.16)box(shell,'Lobby wall timber slat',-8.82,1.5,z,.04,1.8,.055,materials.wood,.003);
 for(const [x,w] of [[0,17.8],[16.25,14.1]]){
  box(shell,'Acoustic ceiling',x,4.20,-1,w,.11,9.8,materials.ceiling);
  for(let z=-4.8;z<3.9;z+=1.2)box(shell,'Ceiling panel joint',x,4.137,z,w,.007,.012,materials.trim);
 }
 for(const x of [-5.9,0,5.9,12,16,20])for(const z of [-3.2,1.1]){const fixture=box(shell,'Linear ceiling light',x,4.123,z,.07,.026,2.6,x>9?materials.classroomLight:materials.light,.004);if(x>9)fixture.userData.dynamic=true;}
 // Reception, directory and a short lounge, arranged clear of the main route.
 box(furniture,'Reception counter oak base',-5.7,1.08,.1,3.6,.94,1.0,materials.wood,.018);box(furniture,'Reception stone top',-5.7,1.59,.1,3.8,.09,1.15,materials.trim,.018);obstacle(-5.7,.1,3.8,1.15,'reception desk');
 box(furniture,'Reception bronze kickplate',-5.7,.74,.62,3.5,.22,.03,materials.metal,.003);
 box(furniture,'Course board timber surround',-3.4,2.26,-5.82,4.6,1.7,.15,materials.wood,.015);box(furniture,'Course board',-3.4,2.26,-5.72,4.35,1.44,.035,materials.board,.005);
 plaque(furniture,'课 程 与 学 习',-3.4,2.62,-5.69,2.7,.30,0,'#334d43','#e7e4d9');
 for(const [i,label] of ['高等数学','线性代数','概率论'].entries())plaque(furniture,label,-4.75+i*1.36,2.08,-5.685,1.1,.22,0,'#334d43','#d8dfd7');
 for(const x of [-6.6,-4.7]){box(furniture,'Lobby lounge seat',x,1.02,-3.7,1.65,.32,.75,materials.fabric,.055);box(furniture,'Lounge backrest',x,1.37,-4.02,1.65,.55,.17,materials.fabric,.045);for(const dx of [-.65,.65])for(const dz of [-.24,.24])cylinder(furniture,'Lounge seat leg',new T.Vector3(x+dx,.61,-3.7+dz),new T.Vector3(x+dx,.88,-3.7+dz),.023,materials.black);obstacle(x,-3.7,1.65,.9,'lounge seat');}
 box(furniture,'Low lounge table',-5.65,.96,-2.6,1.1,.07,.55,materials.wood,.02);
 for(const x of [-6.05,-5.25])box(furniture,'Low table leg',x,.77,-2.6,.045,.34,.38,materials.black,.006);
 // Teaching front faces west, desks face east. 24 independently selectable seats.
 box(furniture,'Teaching board wood frame',23.31,2.45,-1,.12,1.8,6.6,materials.wood,.016);box(furniture,'Green teaching board',23.23,2.45,-1,.04,1.62,6.3,materials.board,.008);
 box(furniture,'Teacher lectern',21.8,1.18,-3.8,.8,1.16,1.3,materials.wood,.02);obstacle(21.8,-3.8,.8,1.3,'lectern');
 for(let row=0;row<4;row++)for(let col=0;col<3;col++){
  const x=11.7+row*2.45,z=-3.7+col*2.65;desk(furniture,x,z);obstacle(x,z,.68,1.56,'student desk');
  for(const [i,dz] of [-.4,.4].entries()){chair(furniture,x-.66,z+dz,-Math.PI/2);seats.push({id:`seat-${row}-${col}-${i}`,label:`${row+1}排${col*2+i+1}座`,x:x-.66,z:z+dz,y:1.76,yaw:Math.PI/2,approach:{x:x-1.15,z:z+(col===2?1.05:-1.05)}});}
  if((row+col)%3===0){box(furniture,'Book lower cover',x,1.379,z+.28,.30,.006,.22,materials.book,.003);box(furniture,'Visible book page block',x,1.395,z+.28,.29,.026,.21,materials.paper,.001);box(furniture,'Book upper cover',x,1.411,z+.28,.30,.006,.22,materials.book,.003);box(furniture,'Notebook paper',x,1.383,z-.23,.28,.014,.20,materials.paper,.002);cylinder(furniture,'Desk pen',new T.Vector3(x-.085,1.395,z-.30),new T.Vector3(x-.085,1.395,z-.17),.004,materials.metal,10);}
 }
 plaque(furniture,'课程学院 · 示范教室',23.19,3.55,-1,3.7,.24,-Math.PI/2,'#e4e2d8','#526057');
 plaque(furniture,'示范教室',8.87,3.61,-1.6,1.45,.24,-Math.PI/2);
}
function upperInteriors(g){
 const upper=group('Upper storey visible interior structure',g);
 for(let level=1;level<4;level++){
  const base=.6+level*3.8;
  box(upper,'Upper rear classroom partition',0,base+1.8,-5.5,47.6,3.6,.16,materials.wall);
  for(const x of [-21,-15,-9,-3,3,9,15,21])box(upper,'Upper classroom dividing wall',x,base+1.8,-.9,.14,3.6,9,materials.wall);
  for(let x=-21.4;x<22;x+=5.8)for(const z of [-2,1.2]){
   box(upper,'Visible upper classroom desk',x,base+.74,z,1.55,.045,.65,materials.wood,.01);
   for(const dx of [-.58,.58])box(upper,'Upper desk leg',x+dx,base+.37,z,.045,.74,.48,materials.black);
  }
 }
}
export function createBuilding(){
 const structure=group('Floors and foundations'),front=group('South teaching facade'),sides=group('East west and north facades'),roof=group('Independent roof and drainage');
 for(let level=0;level<=4;level++){
  const y=.49+level*3.8,m=level===0?materials.floor:materials.ceiling;
  box(structure,'Main floor '+level,0,y,-4,48,.22,16,m);
  for(const s of [-1,1])box(structure,'Wing floor '+level,s*27,y,1,6,.22,26,m);
 }
 const main=[-22.1,-18.8,-11.6,-8.7,-5.8,-2.9,0,2.9,5.8,8.7,11.6,18.8,22.1];
 facade(front,'Main front','x',4,-24,24,main,main.map(x=>Math.abs(x)>16?2.75:2.3),{door:true});
 for(const x of [-14.8,14.8]){box(front,'Stone stair core facing',x,8.32,4.26,2.35,15.45,.30,materials.stone,.015);box(front,'Stair core coping',x,16.1,4.22,2.53,.18,.55,materials.trim,.015);}
 for(let i=0;i<=9;i++)box(front,'Upper main facade limestone pier',-13.05+i*2.9,10.15,4.16,.38,11.3,.55,materials.trim,.01);
 for(const s of [-1,1]){
  facade(front,'Wing front '+s,'x',14,s*27-3,s*27+3,[s*27-1.05,s*27+1.05],1.18,{wing:true});
  facade(sides,'Outer wing '+s,'z',s*30,-12,14,[-10.2,-6.8,-3.4,0,3.4,6.8,10.2],2.55,{side:s,wing:true});
  facade(sides,'Inner wing '+s,'z',s*24,4.2,14,[6.6,10.8],2.65,{side:-s,wing:true});
  obstacle(s*30,1,.4,26,'external side wall');obstacle(s*24,9,.4,10,'inner wing wall');obstacle(s*27,14,6,.4,'wing end wall');
  // Ground floor wing rooms are furnished lightly behind clear glazing.
  for(const z of [-7,1,9])box(structure,'Wing room partition',s*27,2.4,z,5.7,3.6,.16,materials.wall);
  hippedRoof(roof,'Wing '+s,s*27,1,6.8,26.8,16.1,1.15);
 }
 facade(sides,'Rear facade','x',-12,-30,30,Array.from({length:17},(_,i)=>-27.2+i*3.4),2.55,{side:-1});obstacle(0,-12,60,.4,'rear exterior wall');
 obstacle(-16.8,4,14.4,.4,'front exterior wall');obstacle(16.8,4,14.4,.4,'front exterior wall');
 hippedRoof(roof,'Main',0,-4,48.8,16.8,16.02,1.28);
 for(const s of [-1,1]){cylinder(roof,'Bronze rainwater pipe',new T.Vector3(s*23.6,.66,4.47),new T.Vector3(s*23.6,15.97,4.47),.052,materials.metal);cylinder(roof,'Rainwater hopper',new T.Vector3(s*23.6,15.80,4.47),new T.Vector3(s*23.6,16.02,4.47),.085,materials.metal);}
 glassEntrance(front);stairsAndPortico(front);interiors(building);upperInteriors(building);constructionDetails(structure);
 // Material-separated batches retain architectural categories while keeping draw calls modest.
 batchRecursive(building);building.updateMatrixWorld(true);for(const category of building.children)batchCategory(category);building.updateMatrixWorld(true);
 return building;
}
function constructionDetails(g){
 const bakeFloor=group('Classroom lightmapped stone floor');bakeFloor.userData.bakeReceiver=true;
 box(bakeFloor,'Classroom stone floor finish',16.25,.597,-1,14.3,.02,9.8,materials.floor,.001);
 const equipment=group('Classroom equipment and chalk teaching surface');equipment.userData.bakeReceiver=true;
 const graphite=material('Graphite teaching equipment',0x34403e,{metalness:.35,roughness:.42});
 box(equipment,'Lectern laptop base',21.86,1.784,-3.8,.30,.025,.45,graphite,.01);box(equipment,'Lectern laptop display casing',22.005,1.93,-3.8,.018,.28,.44,graphite,.009);box(equipment,'Lectern keyboard inset',21.85,1.799,-3.8,.22,.006,.37,materials.black,.003);
 box(equipment,'Wall mounted air conditioner',16.3,3.55,-5.72,1.2,.31,.27,materials.ceiling,.028);box(equipment,'HVAC outlet recess',16.3,3.43,-5.575,1.04,.045,.012,materials.black,.005);for(let x=15.84;x<16.8;x+=.09)box(equipment,'HVAC outlet guide vane',x,3.43,-5.563,.012,.041,.023,materials.ceiling,.002);
 const boardCanvas=document.createElement('canvas');boardCanvas.width=2048;boardCanvas.height=512;const ctx=boardCanvas.getContext('2d');ctx.fillStyle='#334d43';ctx.fillRect(0,0,2048,512);ctx.fillStyle='#d3d9ca';ctx.font='44px "KaiTi","Microsoft YaHei",sans-serif';ctx.fillText('导数与变化率',85,90);ctx.font='37px "Times New Roman",serif';ctx.fillText('f(x) = x²',85,175);ctx.fillText('f′(x) = lim [ f(x+h) − f(x) ] / h',85,255);ctx.fillText('= 2x',265,330);ctx.font='30px "KaiTi",serif';ctx.fillText('在 x = 3 处，切线斜率为 6',85,430);ctx.strokeStyle='#b9c7b6';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(1100,390);ctx.lineTo(1910,390);ctx.moveTo(1250,110);ctx.lineTo(1250,440);ctx.stroke();ctx.beginPath();for(let i=0;i<=120;i++){const x=-1.3+i/120*4.5,xx=1250+x*170,yy=390-x*x*28;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();ctx.strokeStyle='#bfb89a';ctx.beginPath();ctx.moveTo(1250+1.6*170,390-(6*1.6-9)*28);ctx.lineTo(1250+3.2*170,390-(6*3.2-9)*28);ctx.stroke();
 const chalkTexture=new T.CanvasTexture(boardCanvas);chalkTexture.colorSpace=T.SRGBColorSpace;chalkTexture.anisotropy=8;const chalk=new T.MeshStandardMaterial({name:'Chalk writing on physical teaching board',map:chalkTexture,roughness:.9});const writing=new T.Mesh(new T.PlaneGeometry(6.25,1.55),chalk);writing.name='Chalk teaching surface';writing.rotation.y=-Math.PI/2;writing.position.set(23.201,2.45,-1);writing.receiveShadow=true;equipment.add(writing);
 box(g,'Continuous front stone foundation',0,.29,4.02,48,.58,.43,materials.stone,.007);box(g,'Continuous rear foundation',0,.29,-12,60,.58,.43,materials.stone,.007);
 for(const s of [-1,1]){box(g,'Wing foundation',s*30,.29,1,.43,.58,26,materials.stone,.007);box(g,'Courtyard wing foundation',s*24,.29,9,.43,.58,10,materials.stone,.007);box(g,'Wing end foundation',s*27,.29,14,6,.58,.43,materials.stone,.007);}
 for(const z of [-5.86,3.75])box(g,'Classroom limestone skirting',16.2,.66,z,14.1,.12,.035,materials.trim,.003);
 box(g,'Classroom front skirting',23.36,.66,-1,.035,.12,9.7,materials.trim,.003);
 cylinder(g,'Projector suspension',new T.Vector3(16,4.13,-1),new T.Vector3(16,3.91,-1),.023,materials.black);
 box(g,'Ceiling projector',16,3.85,-1,.36,.14,.3,materials.ceiling,.023);
 cylinder(g,'Projector optical lens',new T.Vector3(16.16,3.85,-1),new T.Vector3(16.23,3.85,-1),.042,materials.metal,20);
 box(g,'Chalk tray',23.12,1.61,-1,.13,.04,6.4,materials.metal,.004);box(g,'Board eraser',23.1,1.66,.6,.075,.035,.15,materials.wood,.004);
}
// Merge repeated static chair and façade parts across nested groups, retaining the
// seven architectural categories and independent animated doors for GLB export.
function batchCategory(g){
 if(g.userData.bakeReceiver)return;
 const inv=g.matrixWorld.clone().invert(),buckets=new Map();
 function visit(node){if(node.userData.dynamic)return;if(node.isMesh&&!node.material.transparent&&!node.material.map?.isCanvasTexture){if(!buckets.has(node.material))buckets.set(node.material,[]);buckets.get(node.material).push(node);}for(const child of node.children)visit(child);}
 visit(g);
 for(const [m,items] of buckets){if(items.length<2)continue;const geometries=items.map(item=>{const geo=item.geometry.index?item.geometry.toNonIndexed():item.geometry.clone();geo.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,item.matrixWorld));if(!geo.attributes.uv)geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));return geo;});const geometry=mergeGeometries(geometries,false);if(!geometry)throw Error('Category batching failed');const mesh=new T.Mesh(geometry,m);mesh.name=g.name+' / '+m.name;mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);for(const item of items){item.removeFromParent();item.geometry.dispose();}for(const geo of geometries)geo.dispose();}
}
function batchRecursive(g){
 if(g.userData.dynamic)return;
 for(const child of [...g.children])if(child.isGroup)batchRecursive(child);
 const buckets=new Map();for(const m of [...g.children])if(m.isMesh&&!m.userData.dynamic&&!m.material.map?.isCanvasTexture){if(!buckets.has(m.material))buckets.set(m.material,[]);buckets.get(m.material).push(m);}
 for(const [m,items] of buckets){if(items.length<2)continue;const geometries=items.map(item=>{item.updateMatrix();let geo=item.geometry.index?item.geometry.toNonIndexed():item.geometry.clone();geo.applyMatrix4(item.matrix);if(!geo.attributes.uv)geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));return geo;});const geo=mergeGeometries(geometries,false);if(!geo)throw Error('Failed to batch '+g.name);const merged=new T.Mesh(geo,m);merged.name=g.name+' / '+m.name;merged.userData={sourceModuleCount:items.length};merged.castShadow=!m.transparent;merged.receiveShadow=true;g.add(merged);for(const item of items){g.remove(item);item.geometry.dispose();}for(const geo of geometries)geo.dispose();}
}
export function updateDoors(dt){for(const door of doors){const speed=dt*1.15;door.open=T.MathUtils.damp(door.open,door.target,6,dt);if(Math.abs(door.open-door.target)<.001)door.open=door.target;if(door.kind==='slide')for(const leaf of door.leaves)leaf.object.position.x=leaf.closed+leaf.sign*door.open*(door.width/2+.12);else door.leaves[0].object.rotation.y=-door.open*Math.PI*.48;door.collider.disabled=door.open>.87;}}
export function createSite(scene){
 const site=group('Open campus public space',scene),ground=material('Muted open lawn',0x768563,{roughness:1}),asphalt=material('Campus asphalt',0x8a8b83,{roughness:.98}),joint=material('Stone paving joint',0xb4b6aa,{roughness:.95});
 box(site,'Continuous campus ground',0,-.15,8,2000,.28,2000,ground);
 box(site,'Open courtyard paving',0,-.04,22,48,.08,24,materials.paving);
 box(site,'Main pedestrian route five metres wide',0,-.025,43,5,.08,25,materials.paving);
 for(const x of [-25,25])box(site,'Side pedestrian route',x,-.025,2,3.2,.08,57,materials.paving);
 box(site,'Rear campus link',0,-.04,-19,65,.08,4.5,asphalt);
 // Real paving joints establish scale without a projected facade image.
 // Mipmapped joints avoid the subpixel raised strips flickering during walking.
 for(const x of [-24,24])box(site,'Courtyard stone edge',x,.035,22,.12,.08,24,materials.trim,.008);
 for(const [x,z,w] of [[-67,-69,38],[55,-94,44]]){
  box(site,'Distant campus teaching block',x,5.5,z,w,11,14,materials.wall);box(site,'Distant roof',x,11.1,z,w+.5,.25,14.5,materials.roof);
  for(const y of [2.2,5.8,9.4])box(site,'Distant shaded glazing',x,y,z+7.02,w-2.4,1.45,.07,materials.metal);
 }
 for(const [x,z,preset,height] of [[-24,28,'Ash Medium',8.5],[26.8,24,'Oak Medium',7.1]]){
  const tree=new Tree();tree.loadPreset(preset);tree.options.seed=x<0?318:623;tree.options.leaves.count=45;tree.options.leaves.size*=1.18;tree.options.leaves.tint=x<0?0xb4c59d:0xa5b99b;tree.generate();const b=new T.Box3().setFromObject(tree),size=b.getSize(new T.Vector3());tree.scale.setScalar(height/size.y);tree.position.set(x,0,z);site.add(tree);tree.traverse(o=>{if(o.isMesh)o.castShadow=true;});obstacle(x,z,.7,.7,'tree');
  box(site,'Tree planting pit',x,.035,z,2.2,.09,2.2,materials.metal,.012);
 }
 for(const [x,z] of [[10.5,25],[15,25],[-17,18]]){
  for(let k=0;k<6;k++)box(site,'Timber bench slat',x,.48,z+(k-2.5)*.10,2.3,.07,.085,materials.wood,.012);
  for(const s of [-1,1])box(site,'Bench metal support',x+s*.8,.24,z,.075,.47,.60,materials.metal,.012);obstacle(x,z,2.3,.7,'bench');
 }
 const fountain=group('Interactive shallow courtyard fountain',site);fountain.position.set(-9,0,24);
 box(fountain,'Fountain foundation',0,.15,0,6.2,.3,3.4,materials.stone,.025);
 for(const s of [-1,1]){box(fountain,'Pool long coping',0,.34,s*1.7,6.4,.17,.26,materials.trim,.018);box(fountain,'Pool end coping',s*3.12,.34,0,.26,.17,3.2,materials.trim,.018);}
 box(fountain,'Shallow water surface',0,.31,0,5.95,.025,3.05,materials.water);
 const jets=[];for(const x of [-1.8,0,1.8]){cylinder(fountain,'Fountain nozzle',new T.Vector3(x,.29,0),new T.Vector3(x,.36,0),.045,materials.metal);const curve=new T.CatmullRomCurve3([new T.Vector3(x,.36,0),new T.Vector3(x,.9,.13),new T.Vector3(x,.99,.4),new T.Vector3(x,.45,.8)]);const jet=new T.Mesh(new T.TubeGeometry(curve,20,.016,6,false),materials.water);jet.name='Running water jet';jet.userData.dynamic=true;fountain.add(jet);jets.push(jet);}
 obstacle(-9,24,6.4,3.5,'fountain');
 for(const x of [-20,20]){cylinder(site,'Bronze light pole',new T.Vector3(x,0,16),new T.Vector3(x,4,16),.035,materials.metal);box(site,'Path light fitting',x+.12,4,16,.56,.09,.22,materials.metal,.01);box(site,'Path light diffuser',x+.12,3.945,16,.44,.02,.18,materials.light,.003);}
 batchRecursive(site);site.traverse(n=>{if(n.isMesh&&n.parent===site&&/Muted open lawn|Pale limestone|Jointed courtyard stone|Stone paving joint/.test(n.name+' '+n.material.name))n.castShadow=false;});return{site,jets};
}
