import * as T from 'three';
import * as academy from '../../../../examples/campus-3d-v5/src/architecture.js';
import {createClassroomSystems} from '../../../../examples/campus-3d-v5/src/classroom.js';
import * as library from '../../../../examples/library-3d/src/architecture.js';
import {facilityStops} from '../../../../examples/library-3d/src/facilities.js';

export async function createInteriors(openFeature,getPose){
 const assetRoot=new URL('../../../examples/campus-3d-v5/assets/',document.baseURI);
 await Promise.all([academy.loadMaterials({assetRoot}),library.loadMaterials({assetRoot})]);
 const academyRoot=academy.createBuilding();academyRoot.position.set(0,0,-30);
 const systems=createClassroomSystems(academyRoot,academy.materials);
 const built=library.createBuilding({sharedSite:true}),libraryRoot=built.building;libraryRoot.position.set(-34,0,1);libraryRoot.rotation.y=Math.PI/2;
 built.r1Light.parent.removeFromParent();
 academyRoot.updateMatrixWorld(true);libraryRoot.updateMatrixWorld(true);
 const interactions=[],boxes=[],doors=[];
 function local(root,x,z,y=0){return new T.Vector3(x,y,z).applyMatrix4(root.matrixWorld);}
 function point(root,id,label,x,z,action,radius=1.65,y=1){const object=new T.Object3D();object.position.set(x,y,z);root.add(object);const item={id,label,object,radius,action};interactions.push(item);return item;}
 function collider(root,c,prefix){const b=new T.Box3(new T.Vector3(c.minX,0,c.minZ),new T.Vector3(c.maxX,4.5,c.maxZ)).applyMatrix4(root.matrixWorld);const out={id:prefix+c.id,minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z,maxY:4.5};Object.defineProperty(out,'enabled',{get:()=>!c.disabled});boxes.push(out);}
 for(const c of academy.colliders)collider(academyRoot,c,'academy.');for(const c of library.colliders)collider(libraryRoot,c,'library.');
 function inDoor(door){const p=getPose(),q=door.root.worldToLocal(new T.Vector3(p.x,0,p.z)),dx=q.x-door.x,dz=q.z-door.z,side=!!door.native?.rotation;return Math.abs(side?dx:dz)<.65&&Math.abs(side?dz:dx)<(door.native?.width||2.8)/2+.3;}
 function toggle(root,door){if(door.target&&inDoor(door))return{ok:false,message:'请先离开门洞，再关门。'};door.target=door.target?0:1;return{ok:true,message:door.target?'门正在打开，可以步行进入。':'门正在关闭。'};}
 for(const d of academy.doors){const door={native:d,id:'academy.door.'+d.id,root:academyRoot,x:d.position.x,z:d.position.z,get target(){return d.target;},set target(v){d.target=v;}};doors.push(door);const item=point(academyRoot,door.id,d.label,d.position.x,d.position.z,()=>toggle(academyRoot,door),2.5);Object.defineProperty(item,'label',{get:()=>(d.target?'关闭':'打开')+d.label});}
 const ld={id:'library.door',root:libraryRoot,x:0,z:9,get target(){return built.door.target;},set target(v){built.door.target=v;}};doors.push(ld);const li=point(libraryRoot,ld.id,'打开图书馆玻璃门',0,10.2,()=>toggle(libraryRoot,ld),2.5);Object.defineProperty(li,'label',{get:()=>(ld.target?'关闭':'打开')+'图书馆玻璃门'});
 function seat(root,id,label,x,z,y,dx,dz,approach,extra={}){point(root,id,'坐下 · '+label,approach.x,approach.z,()=>({ok:true,kind:'seat',id,label,position:local(root,x,z,y).toArray(),directions:[new T.Vector3(dx,0,dz).transformDirection(root.matrixWorld).toArray()],...extra}),1.1);}
 for(const s of academy.seats)seat(academyRoot,'academy.'+s.id,s.label,s.x,s.z,s.y,1,0,s.approach,{feature:'courses'});
 point(academyRoot,'academy.courses','课程板 · 课程与学习笔记',-3.4,-4.6,()=>openFeature('courses'),2.4);
 point(academyRoot,'academy.practice','讲台 · 打开真实题库',21,-3.8,()=>openFeature('bank'),1.7);
 point(academyRoot,'academy.equipment','教室灯光、卷帘与投影',9.8,.8,()=>({ok:true,kind:'equipment'}),1.5);
 for(const s of library.shelves)point(libraryRoot,'library.shelf.'+s.id,s.label,s.approach.x,s.approach.z,()=>openFeature('library',{mode:'catalog',category:s.id}),1.55);
 for(const s of library.seats)seat(libraryRoot,'library.seat.'+s.id,s.label,s.x,s.z,1.18,0,s.yaw===0?-1:1,s.approach,{feature:'reading'});
 for(const z of [-4.5,1.3])point(libraryRoot,'library.book.'+z,'翻开桌上导读书',7.15,z+2.18,()=>openFeature('library',{mode:'book'}),1.35);
 point(libraryRoot,'library.catalog','馆藏检索台',-7,7.25,()=>openFeature('library',{mode:'catalog'}),1.55);
 for(const f of facilityStops)point(libraryRoot,'library.'+f.id,f.label,f.approach.x,f.approach.z,()=>openFeature('library',{mode:f.category?'catalog':'book',category:f.category}),f.range);
 const bounds=(root,p,w,d)=>{const q=root.worldToLocal(new T.Vector3(p.x,0,p.z));return Math.abs(q.x)<w&&Math.abs(q.z)<d;};
 return{roots:[academyRoot,libraryRoot],boxes,interactions,systems,
  inside(p){if(p.x>-23.9&&p.x<23.9&&p.z<-26&&p.z>-36)return 'classroom';if(bounds(libraryRoot,p,11.9,8.9))return 'library';return null;},
  open(id,instant=false){if(id==='classroom')for(const d of academy.doors){d.target=1;if(instant)d.open=1;}if(id==='library'){ld.target=1;if(instant)built.door.open=1;}if(instant)this.update(0);return{ok:true,message:'入口已打开，请步行进入。'};},
  moving:()=>academy.doors.some(d=>Math.abs(d.target-d.open)>.001)||Math.abs(built.door.target-built.door.open)>.001||Math.abs(systems.state.blindsTarget-systems.state.blinds)>.001,
  update(dt){for(const door of doors)if(!door.target&&inDoor(door)){if(door.native?.open>0||door===ld&&built.door.open>0)door.target=1;}academy.updateDoors(dt);const d=built.door;d.open=T.MathUtils.damp(d.open,d.target,7,dt);if(Math.abs(d.open-d.target)<.001)d.open=d.target;for(const leaf of d.leaves)leaf.leaf.position.x=leaf.s*(.7+d.open*1.43);d.collider.disabled=d.open>.87;systems.update(dt);},
  dispose(){built.r1Light.shadow.dispose();for(const t of library.r1ReviewResources().textures)t?.dispose();for(const m of [...Object.values(academy.materials),...Object.values(library.materials),...library.r1ReviewResources().materials]){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();}},
  snapshot:()=>({academySeats:academy.seats.length,librarySeats:library.seats.length,shelves:library.shelves.length,equipment:systems.snapshot(),doors:[...academy.doors.map(d=>({id:d.id,open:d.open,target:d.target,blocked:!d.collider.disabled})),{id:'library',open:built.door.open,target:ld.target,blocked:!built.door.collider.disabled}]})};
}
