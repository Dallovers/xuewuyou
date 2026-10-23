import * as T from 'three';
import {STUDY_PLACEMENT} from './layout.js';
import {worldBoxes} from './navigation.js';
import {createCourtyard} from './courtyard.js';
import {loadSurfaces} from './surface-materials.js';
import {createCampusContext} from './campus-context.js';
import {createWhitePaving} from './paving-material.js';
import {faceSocialCourtyard} from './social-placement.js';
import {createInteriors} from './interiors.js';

export async function createWorld(scene,openFeature,progress,getPose){
 const root=new T.Group();root.name='Campus shared public ground';scene.add(root);
 const boxes=[],districts=[],interactions=[],owned=new Set(),textures=new Set();
 progress('正在准备庭院材质…');const surfaces=await loadSurfaces();
 const mat=(color,opts={})=>{const m=new T.MeshStandardMaterial({color,roughness:.8,...opts});owned.add(m);return m;};
 const stone=mat(0xe2dfd2),wood=mat(0xb39265),metal=mat(0x34473e,{metalness:.2,roughness:.5}),lawn=mat(0x7e8d69),soil=mat(0x80735b);
 surfaces.apply(stone,'stone',{normal:.16,color:0xe5e1d4});surfaces.apply(wood,'wood',{meters:1.6,normal:.13,color:0xe9dcc4});
 const pavingMaterial=createWhitePaving(surfaces);owned.add(pavingMaterial);
 const groundNames=new Set(['site:paving','path:main','path:branch','path:edge','ring:apron','pavilion:floor-slab','pavilion:landing-slab']);
 const pavingMeshes=[];
 function unifyPaving(mesh){if(!mesh.isMesh)return;mesh.material=pavingMaterial;pavingMeshes.push(mesh);}
 function box(g,name,x,y,z,w,h,d,m){const geo=new T.BoxGeometry(w,h,d),mesh=new T.Mesh(geo,m);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;}
 function plane(name,x,z,w,d,m,y=0){if(m===lawn&&lawn.map){m=lawn.clone();Object.assign(m,surfaces.copySet('grass',w/2,d/2));owned.add(m);}const mesh=new T.Mesh(new T.PlaneGeometry(w,d),m);mesh.name=name;mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.receiveShadow=true;root.add(mesh);return mesh;}
 function paving(x,z,w,d){const mesh=plane('Walkable limestone paving',x,z,w,d,pavingMaterial,.006);pavingMeshes.push(mesh);return mesh;}
 Object.assign(lawn,surfaces.copySet('grass',100,90));lawn.normalScale=new T.Vector2(.5,.5);lawn.color.setHex(0x90ad83);lawn.needsUpdate=true;
 plane('Shared lawn',3,-2,2000,2000,lawn,-.06);
 plane('Campus service road',0,43.8,1000,5,mat(0x777c76),-.03);
 root.add(createCampusContext(surfaces));
 paving(-2,10,43,50);paving(-12,-19,36,9);paving(-24,1,10,7);paving(-27,15,15,7);paving(-13,30,18,5);paving(3,37,9,10);paving(20,-10,8,8);
 // 庭院中间那块 10×14 的草坪岛（连同四周 8 cm 石边）已撤除：它整个落在 D(-2,10,43,50) 这块大铺地范围内，
 // 直接让下面的连续白石铺地露出来即可 —— 板缝按世界坐标投影，接得上，不需要再叠一层（同高会共面闪烁）。
 const leafMap=await new T.TextureLoader().loadAsync(new URL('../social/assets/generated/camphor-leaf-v1.png',document.baseURI).href);leafMap.colorSpace=T.SRGBColorSpace;textures.add(leafMap);
 const courtyard=createCourtyard(openFeature,leafMap,surfaces,pavingMaterial);root.add(courtyard.root);boxes.push(...courtyard.boxes);interactions.push(...courtyard.interactions);
 function bench(x,z,angle=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;root.add(g);for(const s of [-1,1])box(g,'Bench stone support',s*.65,.21,0,.20,.42,.45,stone);for(let i=0;i<4;i++)box(g,'Warm timber bench slat',0,.46,(i-1.5)*.12,1.85,.055,.10,wood);boxes.push({id:'bench',minX:x-(angle?.33:1),maxX:x+(angle?.33:1),minZ:z-(angle?1:.33),maxZ:z+(angle?1:.33)});}
 for(const [x,z,a]of [[-18,13,Math.PI/2],[-18,-7,Math.PI/2],[-36,16,0],[-7,-15,0]])bench(x,z,a);
 for(const [x,z]of [[-4,34],[4,34],[-20,9],[-20,-10],[5,-13],[13,31],[30,15],[51,-8]]){
  box(root,'Bronze pedestrian lamp',x,1.95,z,.10,3.9,.10,metal);box(root,'Lamp overhang',x+.24,3.85,z,.58,.10,.17,metal);box(root,'Lamp diffuser',x+.28,3.78,z,.42,.035,.13,mat(0xfff5dc,{emissive:0xffefd0,emissiveIntensity:.45}));
  boxes.push({id:'lamp',minX:x-.1,maxX:x+.1,minZ:z-.1,maxZ:z+.1});
 }
 progress('加载教学楼与图书馆完整室内…');
 const interiors=await createInteriors(openFeature,getPose);for(const building of interiors.roots)root.add(building);boxes.push(...interiors.boxes);interactions.push(...interiors.interactions);
 progress('连接自习室、社交广场和竞技场…');
 // Runtime imports preserve each author's import.meta.url asset bases.
 const [study,social,arena,landscape]=await Promise.all([
  import(new URL('../study/district.js?v=study-roof-88',document.baseURI).href),import(new URL('../social/social-district.js?campus=hub1',document.baseURI).href),import(new URL('../arena/arena-district.js?campus=arena89-round4',document.baseURI).href),import(new URL('../social/social-landscape.js',document.baseURI).href)
 ]);
 const studyDistrict=study.createDistrict({THREE:T,openFeature,mode:'runtime'});studyDistrict.root.position.set(STUDY_PLACEMENT.x,0,STUDY_PLACEMENT.z);studyDistrict.root.rotation.y=STUDY_PLACEMENT.yaw;
 // Reuse B's room furniture and measured doorway/furniture colliders.
 // The host owns camera/input and adapts the original picker and local seats.
 root.add(studyDistrict.root);districts.push(studyDistrict);boxes.push(...worldBoxes(T,studyDistrict));
 for(const item of studyDistrict.interactions){
  if(item.id.startsWith('study.seat.')){const original=item.action;item.action=()=>{const result=original();if(result.mode!=='sit')return result;const node=item.object;node.updateWorldMatrix(true,false);const s=studyDistrict.root.userData.parts.seats.userData.seats.find(s=>item.id==='study.seat.'+s.id),yaw=s.kind==='window'?Math.PI/2:s.id.endsWith('n')?Math.PI:0;const direction=new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)).transformDirection(studyDistrict.root.matrixWorld);return{ok:true,kind:'seat',label:'自习座位 '+s.id+' · 本地',position:node.getWorldPosition(new T.Vector3()).add(new T.Vector3(0,1.18,0)).toArray(),directions:[direction.toArray()],feature:'study',onStand:original};};}
  interactions.push(item);
 }

 // Camera obstruction includes the new eaves/ridge; navigation keeps the
 // ground-level wall footprint so the overhang never blocks pedestrians.
 studyDistrict.root.updateMatrixWorld(true);
 const roofBounds=new T.Box3(),roof=studyDistrict.root.getObjectByName('Roof');
 roof?.traverse(n=>{if(n.isMesh&&!['RainPipe','RainHopper'].includes(n.name))roofBounds.union(new T.Box3().setFromObject(n));});
 const cameraObstacles=[...courtyard.cameraObstacles,...(roofBounds.isEmpty()?[]:[{id:'study-roof',minX:roofBounds.min.x,maxX:roofBounds.max.x,minY:roofBounds.min.y,maxY:roofBounds.max.y,minZ:roofBounds.min.z,maxZ:roofBounds.max.z}])];

 // Exterior-only warm timber screen and entrance canopy; retain B's room,
 // door opening, interior, picking and seat implementation unchanged.
 const studyExterior=new T.Group();studyExterior.name='Study entrance exterior';studyDistrict.root.add(studyExterior);
 box(studyExterior,'Study entrance canopy',3.3,3.25,5.2,3.1,.14,1.5,metal);
 const slats=new T.InstancedMesh(new T.BoxGeometry(.07,3.05,.10),wood,26),dummy=new T.Object3D();slats.name='Study external timber sun screen';
 for(let i=0;i<26;i++){dummy.position.set(.8-i*.23,1.65,4.86);dummy.updateMatrix();slats.setMatrixAt(i,dummy.matrix);}slats.castShadow=slats.receiveShadow=true;studyExterior.add(slats);
 for(const [module,x]of [[social,18],[arena,39]]){
  const district=module.createDistrict({THREE:T,openFeature,mode:'runtime',sharedSite:true,bakedAO:false});
  if(module===social)faceSocialCourtyard(district,social.SOCIAL_LAYOUT.pavilion);
  district.root.position.set(x,0,2);root.add(district.root);districts.push(district);boxes.push(...worldBoxes(T,district));interactions.push(...district.interactions);await district.ready;
  district.root.traverse(mesh=>{if(groundNames.has(mesh.name))unifyPaving(mesh);});
 }
 // Shared low-density vegetation uses A's actual tree builder and texture.
 const leaf=mat(0xb8c2a4,{map:leafMap,transparent:false,alphaTest:.42,side:T.DoubleSide,roughness:.85}),bark=mat(0x77654b);
 for(const [i,[x,z,scale]]of [[-44,-17,1.6],[34,-34,1.7],[-41,25,1.35],[-17,30,1.45],[18,31,1.3],[53,16,1.6],[5,-10,1.4],[-16,-12,1.5]].entries()){
  const tree=new T.Group();tree.position.set(x,0,z);tree.rotation.y=i*1.8;tree.scale.setScalar(scale);root.add(tree);
  const add=(geo,m,px,py,pz,opts={})=>{const mesh=new T.Mesh(geo,m);mesh.position.set(px,py,pz);mesh.name=opts.name||'Tree';mesh.castShadow=mesh.receiveShadow=true;tree.add(mesh);return mesh;};
  landscape.buildCampusTree({THREE:T,root:tree,add,M:{leaf,bark,soil},x:0,z:0,leafCount:2400,seedOffset:100+i*197});boxes.push({id:'tree',minX:x-.35,maxX:x+.35,minZ:z-.35,maxZ:z+.35});
 }
 return{root,boxes,interiors,study:studyDistrict,inside(p){const q=studyDistrict.root.worldToLocal(new T.Vector3(p.x,0,p.z));return Math.abs(q.x)<5.95&&Math.abs(q.z)<4.45?'study':interiors.inside(p);},enter(id){if(id==='classroom'||id==='library')return interiors.open(id);if(id==='study')return{ok:true,message:'自习室入口开放，可以直接走进房间。'};return openFeature('community',{tab:id==='arena'?'arena':'friends'});},cameraObstacles,interactions,districts,courtyard,pavingSnapshot:()=>({name:pavingMaterial.name,meshes:pavingMeshes.length,materials:[...new Set(pavingMeshes.map(m=>m.material.uuid))].length}),update(dt){interiors.update(dt);courtyard.update(dt);for(const d of districts)d.update?.(dt);},dispose(){interiors.dispose();courtyard.dispose();for(const d of districts)d.dispose?.();const geos=new Set(),mats=new Set(owned),maps=new Set([...textures,...surfaces.textures]);root.traverse(n=>{if(n.geometry)geos.add(n.geometry);for(const m of n.material?(Array.isArray(n.material)?n.material:[n.material]):[]){mats.add(m);for(const v of Object.values(m))if(v?.isTexture)maps.add(v);}});for(const g of geos)g.dispose();for(const t of maps)t.dispose();for(const m of mats)m.dispose();scene.remove(root);}};
}
