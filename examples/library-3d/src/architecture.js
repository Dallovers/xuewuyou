import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const dimensions={width:24,depth:18,clearHeight:4.4,doorWidth:2.8,mainAisle:3,units:'metres'};
export const colliders=[],shelves=[],seats=[];
export const building=new T.Group();building.name='Wenku_Editable_Library';building.userData={...dimensions,lighting:'New library geometry; realtime sun + environment + screen space ambient occlusion. No classroom lightmap.'};
export const materials={};
const textureRoot=new URL('../campus-3d-v5/assets/',document.baseURI);
const geoCache=new Map();
function group(name,parent=building){const g=new T.Group();g.name=name;parent.add(g);return g;}
function obstacle(x,z,w,d,id){const c={x,z,w,d,id,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2};colliders.push(c);return c;}
export async function loadMaterials(){
 const loader=new T.TextureLoader();
 async function tex(file,color=false){const t=await loader.loadAsync(new URL(file+'.jpg',textureRoot).href);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(color)t.colorSpace=T.SRGBColorSpace;return t;}
 const [wood,wn,wr,sn,sr,brick,bn,br]=await Promise.all([tex('wood-color',true),tex('wood-normal'),tex('wood-roughness'),tex('stone-normal'),tex('stone-roughness'),tex('brick-color',true),tex('brick-normal'),tex('brick-roughness')]);
 const mat=(name,color,extra={})=>new T.MeshStandardMaterial({name,color,roughness:.8,...extra});
 materials.stone=mat('Cream limestone',0xe5e1d5,{normalMap:sn,normalScale:new T.Vector2(.065,.065),roughnessMap:sr});
 const tileCanvas=document.createElement('canvas');tileCanvas.width=tileCanvas.height=512;const tc=tileCanvas.getContext('2d');tc.fillStyle='#c7c9c4';tc.fillRect(0,0,512,512);for(let i=0;i<6000;i++){const v=179+(i*37%27);tc.fillStyle=`rgba(${v},${v+2},${v},0.12)`;tc.fillRect(i*61%512,i*131%512,2,1);}const tile=new T.CanvasTexture(tileCanvas);tile.colorSpace=T.SRGBColorSpace;tile.wrapS=tile.wrapT=T.RepeatWrapping;
 materials.floor=mat('Honed grey stone',0xe6e7e1,{map:tile,normalMap:sn,normalScale:new T.Vector2(.006,.006),roughness:.78});
 materials.grout=mat('Stone floor joints',0x8d9891,{roughness:.9});
 materials.brick=mat('Grey brick',0xc6c9c5,{map:brick,normalMap:bn,normalScale:new T.Vector2(.14,.14),roughnessMap:br});
 materials.wood=mat('White oak veneer',0xffeed6,{map:wood,normalMap:wn,normalScale:new T.Vector2(.08,.08),roughnessMap:wr,roughness:.7});
 materials.metal=mat('Dark bronze powder coating',0x35423f,{metalness:.65,roughness:.38});
 materials.roof=mat('Blue grey standing seam roof',0x637783,{metalness:.66,roughness:.46});
 materials.plaster=mat('Mineral plaster and acoustic ceiling',0xe9e7de);
 materials.fabric=mat('Sage woven upholstery',0x7c8a7d,{roughness:.97});
 materials.paper=mat('Paper edges',0xede9dd,{roughness:.95});
 materials.light=mat('Linear LED diffuser',0xfff3dd,{emissive:0xffebc7,emissiveIntensity:1.4});
 materials.glass=new T.MeshPhysicalMaterial({name:'Clear architectural glass',color:0xd4e7e7,transparent:true,opacity:.14,roughness:.09,metalness:.1,depthWrite:false,side:T.DoubleSide});
 return materials;
}
function box(g,name,x,y,z,w,h,d,m,bevel=.008){
 const key=[w,h,d,bevel].join(',');let geometry=geoCache.get(key);
 if(!geometry){geometry=bevel?new RoundedBoxGeometry(w,h,d,1,Math.min(bevel,w/4,h/4,d/4)):new T.BoxGeometry(w,h,d);const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));uv.setXY(i,(ax>ay&&ax>az?p.getZ(i):p.getX(i))/1.6,(ay>ax&&ay>az?p.getZ(i):p.getY(i))/1.6);}geoCache.set(key,geometry);}
 const mesh=new T.Mesh(geometry,m);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=!m.transparent;mesh.receiveShadow=true;g.add(mesh);return mesh;
}
function sign(g,text,x,y,z,w,h,rotation=0){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#edece3';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#172e26';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 104px "Microsoft YaHei",sans-serif';ctx.fillText(text,512,128,970);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({name:'Wayfinding: '+text,map:t,roughness:.85}));mesh.name='Sign '+text;mesh.position.set(x,y,z);mesh.rotation.y=rotation;g.add(mesh);return mesh;}
function wall(g,axis,at,start,end,openings){
 const cuts=[start,end,...openings.flatMap(o=>[o.u-o.w/2,o.u+o.w/2])].sort((a,b)=>a-b);
 function put(a,b,lo,hi){if(b-a<.001||hi-lo<.001)return;const x=axis==='x'?(a+b)/2:at,z=axis==='x'?at:(a+b)/2,w=axis==='x'?b-a:.34,d=axis==='x'?.34:b-a;box(g,'Wall with real opening',x,(lo+hi)/2,z,w,hi-lo,d,materials.stone);if(lo<1.85)obstacle(x,z,w,d,'wall');}
 for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],o=openings.find(o=>(a+b)/2>o.u-o.w/2&&(a+b)/2<o.u+o.w/2);if(o){put(a,b,0,o.bottom);put(a,b,o.top,4.5);}else put(a,b,0,4.5);}
 for(const o of openings){if(o.door)continue;const w=o.w,h=o.top-o.bottom,y=(o.top+o.bottom)/2;function f(du,dy,ww,hh,dd,m=materials.metal){return axis==='x'?box(g,'Window frame and glazing',o.u+du,y+dy,at,ww,hh,dd,m):box(g,'Window frame and glazing',at,y+dy,o.u+du,dd,hh,ww,m);}
  for(const u of [-w/2,0,w/2])f(u,0,.055,h,.13);for(const v of [-h/2,h/2,h/2-.65])f(0,v,w,.055,.13);f(0,0,w-.07,h-.06,.012,materials.glass);
  obstacle(axis==='x'?o.u:at,axis==='x'?at:o.u,axis==='x'?w:.34,axis==='x'?.34:w,'window sill');
 }
}
function makeDoor(g){
 const root=group('Operable entrance sliding doors',g),leaves=[];
 for(const s of [-1,1]){const leaf=group(s<0?'Left door':'Right door',root);leaf.position.set(s*.7,0,9.01);for(const x of [-.69,.69])box(leaf,'Door bronze stile',x,1.55,0,.055,3.1,.1,materials.metal);for(const y of [.04,3.08])box(leaf,'Door bronze rail',0,y,0,1.4,.06,.1,materials.metal);box(leaf,'Door glass',0,1.55,0,1.31,3.02,.016,materials.glass);box(leaf,'Pull handle',-s*.48,1.23,.09,.022,.5,.035,materials.metal);leaves.push({leaf,s});}
 box(root,'Entrance transom',0,3.55,9,2.8,.8,.015,materials.glass);box(root,'Door track',0,3.15,9,5.8,.1,.16,materials.metal);
 const collider=obstacle(0,9,2.8,.22,'door');
 return {root,leaves,collider,open:0,target:0};
}
function makeShelf(g,id,label,x,z){
 const shelf=group('Bookshelf '+id,g);shelf.userData={category:id,label};const w=3.2,h=2.2,d=.48;
 for(const dx of [-w/2,w/2])box(shelf,'Oak side panel',x+dx,h/2,z,.055,h,d,materials.wood);
 box(shelf,'Oak backing',x,h/2,z-.22,w,h,.035,materials.wood);
 for(const y of [.1,.58,1.06,1.54,2.05,2.2])box(shelf,'Adjustable oak shelf',x,y,z,w,.035,d,materials.wood);
 box(shelf,'Recessed metal plinth',x,.045,z,w-.12,.09,d-.08,materials.metal);
 sign(shelf,label,x,2.48,z+.03,2.95,.36);obstacle(x,z,w+.06,d,'shelf '+id);
 shelves.push({id,label,x,z,approach:{x,z:z+1.05}});
 const palette=[0x536d64,0x647782,0x928263,0x814f47,0xa2a092,0x3e5050];
 const count=4*29,inst=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({name:'Clothbound book spines',roughness:.87}),count);inst.name='Instanced books '+id;inst.castShadow=true;inst.receiveShadow=true;const dummy=new T.Object3D();
 for(let i=0;i<count;i++){const row=Math.floor(i/29),col=i%29,seed=(i*37+id.length*17)%97,height=.27+seed/97*.14;dummy.position.set(x-1.43+col*.101,.13+row*.48+height/2,z+.025);dummy.rotation.z=(i%13===0?.06:0);dummy.scale.set(.07+seed/97*.025,height,.30+seed/97*.07);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);inst.setColorAt(i,new T.Color(palette[i%palette.length]));}shelf.add(inst);
}
function makeReadingTable(g,index,x,z){
 const table=group('Reading table '+index,g);box(table,'Solid oak desktop',x,.75,z,3.8,.055,1.2,materials.wood,.015);box(table,'Oak centre divider',x,.93,z,3.78,.28,.045,materials.wood);
 for(const dx of [-1.65,1.65])for(const dz of [-.43,.43])box(table,'Bronze table leg',x+dx,.36,z+dz,.045,.72,.045,materials.metal);
 box(table,'Undertable apron',x,.64,z,3.4,.15,.06,materials.wood);obstacle(x,z,3.8,1.2,'table');
 for(const side of [-1,1])for(const dx of [-.98,.98]){
  const cx=x+dx,cz=z+side*1.13,id=`R${index}-${side<0?'N':'S'}${dx<0?1:2}`,chair=group('Chair '+id,g);
  box(chair,'Upholstered seat',cx,.46,cz,.5,.075,.48,materials.fabric,.025);box(chair,'Upholstered back',cx,.76,cz+side*.21,.49,.44,.065,materials.fabric,.025);
  for(const a of [-.21,.21])for(const b of [-.19,.19])box(chair,'Chair steel leg',cx+a,.225,cz+b,.023,.45,.023,materials.metal);
  obstacle(cx,cz,.54,.55,'chair '+id);
  seats.push({id,label:'阅览位 '+id,x:cx,z:cz,yaw:side===1?0:Math.PI,approach:{x:cx,z:cz+side*.85}});
  box(table,'Recessed desktop power outlet',cx,.782,z+side*.12,.22,.007,.07,materials.metal);
 }
 box(table,'Reading book paper block',x+.55,.795,z+.35,.24,.024,.32,materials.paper);box(table,'Reading book cover',x+.55,.81,z+.35,.25,.004,.33,materials.fabric);
}
// Merge only repeated decorative construction within each named group; architecture remains editable.
function batchStatic(g){for(const child of [...g.children])if(child.isGroup)batchStatic(child);const batches=new Map();for(const child of g.children){if(!child.isMesh||child.isInstancedMesh||child.material.map?.isCanvasTexture)continue;const key=child.material.uuid;const list=batches.get(key)||[];list.push(child);batches.set(key,list);}for(const list of batches.values()){if(list.length<3)continue;const geometries=list.map(m=>{m.updateMatrix();return m.geometry.clone().applyMatrix4(m.matrix);});const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!geometry)continue;const mesh=new T.Mesh(geometry,list[0].material);mesh.name=list[0].material.name+' construction';mesh.castShadow=!mesh.material.transparent;mesh.receiveShadow=true;mesh.userData.components=list.map(m=>m.name);list.forEach(m=>g.remove(m));g.add(mesh);}}
export function createBuilding(){
 const structure=group('Structure stone and real window openings'),furniture=group('Furniture bookcases and reading desks'),roof=group('Roof editable zinc and clerestory'),site=group('Library forecourt');
 box(structure,'Continuous accessible floor',0,-.14,0,24.4,.28,18.4,materials.floor);
 // Thin physical joints, not a projected photograph.
 for(let x=-10.5;x<12;x+=1.5)box(structure,'Stone floor grout',x,.003,0,.005,.002,18,materials.grout,0);
 for(let z=-7.5;z<9;z+=1.5)box(structure,'Stone floor grout',0,.003,z,24,.002,.005,materials.grout,0);
 const front=[{u:-7.2,w:5.2,bottom:.65,top:3.65},{u:0,w:2.8,bottom:0,top:4,door:true},{u:7.2,w:5.2,bottom:.65,top:3.65}];
 wall(structure,'x',9,-12,12,front);wall(structure,'x',-9,-12,12,[-7,0,7].map(u=>({u,w:4.8,bottom:.7,top:3.7})));
 for(const x of [-12,12])wall(structure,'z',x,-9,9,[-5.8,0,5.8].map(u=>({u,w:4.3,bottom:.65,top:3.7})));
 for(const x of [-11.8,11.8])for(const z of [-8.8,8.8])box(structure,'Stone corner pier',x,2.2,z,.5,4.4,.5,materials.stone);
 // A low volume with raised central roof monitor distinguishes it from the course academy.
 for(const x of [-7.6,7.6]){box(roof,'Wing acoustic ceiling',x,4.47,0,8.8,.16,18.7,materials.plaster);box(roof,'Wing zinc roof',x,4.61,0,9,.12,19,materials.roof);}
 box(roof,'Raised central ceiling',0,5.75,0,6.5,.18,19.2,materials.plaster);box(roof,'Raised central zinc roof',0,5.89,0,6.7,.12,19.5,materials.roof);
 for(const x of [-3.3,3.3]){box(roof,'Clerestory glass',x,5.12,0,.016,1.15,18.8,materials.glass);for(let z=-9;z<=9;z+=1.5)box(roof,'Clerestory mullion',x,5.12,z,.065,1.28,.065,materials.metal);for(const y of [4.52,5.7])box(roof,'Clerestory rail',x,y,0,.075,.075,19,materials.metal);}
 for(let x=-11.7;x<12;x+=.65){const central=Math.abs(x)<3.3;box(roof,'Standing seam',x,central?5.97:4.69,0,.025,.035,central?19.5:19,materials.roof);}
 for(const z of [-9.1,9.1])box(roof,'Clerestory stone end fascia',0,5.12,z,6.6,1.25,.22,materials.stone);
 box(roof,'Stone entrance canopy',0,3.95,10.1,7,.2,2.6,materials.stone);box(roof,'Canopy bronze soffit',0,3.83,10.1,6.75,.035,2.4,materials.metal);
 for(const x of [-3.3,3.3]){box(structure,'Canopy stone column',x,1.91,10.7,.24,3.82,.24,materials.stone);obstacle(x,10.7,.24,.24,'canopy column');}
 sign(structure,'知 识 图 书 馆',0,5.12,9.22,5.4,.75);sign(structure,'馆藏书架',-5.4,3.4,5.4,3.4,.46);sign(structure,'安静阅览',6.4,3.4,5.4,3.4,.46);
 for(const x of [-9,-5.1,5.4,9])for(const z of [-5,1.3,6])box(structure,'Suspended linear light',x,4.23,z,2.7,.045,.075,materials.light);
 for(const [id,label,x,z] of [['exam','考研真题卷',-8.1,-4.8],['book','教材习题集',-3.6,-4.8],['ielts','雅思备考库',-8.1,.2],['topic','专题与心得',-3.6,.2]])makeShelf(furniture,id,label,x,z);
 makeReadingTable(furniture,1,6.6,-4.5);makeReadingTable(furniture,2,6.6,1.3);
 const welcome=group('Welcome and catalogue desk',furniture);box(welcome,'Oak enquiry desk',-7,.5,6.3,3.7,1,.8,materials.wood);box(welcome,'Stone enquiry counter',-7,1.04,6.3,3.85,.08,.9,materials.stone);sign(welcome,'馆 藏 检 索',-7,1.6,6.3,2.5,.4);obstacle(-7,6.3,3.85,.9,'welcome desk');
 box(structure,'Rear grey brick accent',0,2.15,-8.79,5.2,4.3,.07,materials.brick);sign(structure,'学 无 忧  ·  阅 读 与 思 考',0,2.5,-8.73,4.5,.52);
 box(site,'Accessible forecourt',0,-.16,16,40,.28,14.1,materials.floor);box(site,'Site ground',0,-.37,0,100,.12,80,new T.MeshStandardMaterial({name:'Landscape ground',color:0x8e9c83,roughness:1}));
 for(const x of [-9,9]){box(site,'Courtyard planter',x,.28,12.5,2.6,.56,1.1,materials.brick);box(site,'Planter foliage',x,.65,12.5,2.4,.3,.95,new T.MeshStandardMaterial({name:'Clipped planting',color:0x63765a,roughness:1}),.1);obstacle(x,12.5,2.6,1.1,'planter');box(site,'Forecourt bench',x,.45,16.2,3,.1,.5,materials.wood);for(const dx of [-1.2,1.2])box(site,'Bench leg',x+dx,.21,16.2,.08,.42,.4,materials.metal);obstacle(x,16.2,3,.5,'bench');}
 const door=makeDoor(structure);
 batchStatic(building);
 return {building,door};
}
