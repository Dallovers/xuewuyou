import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createLandscape} from './landscape.js';
import {bentwoodChairFactory} from './chairs.js';
import {createBookDetails} from './books.js';
import {createFacilities} from './facilities.js';

export const dimensions={width:24,depth:18,clearHeight:4.4,doorWidth:2.8,mainAisle:3,units:'metres'};
export const colliders=[],shelves=[],seats=[];
export const building=new T.Group();building.name='Wenku_Editable_Library';building.userData={...dimensions,lighting:'New library geometry; realtime sun + environment + screen space ambient occlusion. No classroom lightmap.'};
export const materials={};
let samplePane;
let bentwoodChair;
const r1Maps={};
const bookDetails=createBookDetails();
export function r1ReviewResources(){return {textures:Object.values(r1Maps),materials:[materials.previousSampleGlass].filter(Boolean)};}
export function setR1Look(mode='final'){
 if(!['baseline','contact','final'].includes(mode))return false;
 materials.sampleWood.map=mode==='final'?r1Maps.tableFinal:r1Maps.tableBaseline;materials.chairWood.map=mode==='final'?r1Maps.chairFinal:r1Maps.chairBaseline;
 return {mode,localFillCandela:mode==='baseline'?0:26,contactShadowMap:1024,globalExposure:1};
}
export function reviewGlass(mode='clear'){
 if(!samplePane||!['none','previous','clear'].includes(mode))return false;
 samplePane.visible=mode!=='none';samplePane.material=mode==='previous'?materials.previousSampleGlass:materials.sampleGlass;
 return {mode,geometryThicknessMetres:.012,materialThickness:samplePane.material.thickness,roughness:samplePane.material.roughness,transmission:samplePane.material.transmission};
}
const textureRoot=new URL('../campus-3d-v5/assets/',document.baseURI);
const geoCache=new Map();
function group(name,parent=building){const g=new T.Group();g.name=name;parent.add(g);return g;}
function obstacle(x,z,w,d,id){const c={x,z,w,d,id,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2};colliders.push(c);return c;}
export async function loadMaterials({assetRoot=textureRoot}={}){
 const loader=new T.TextureLoader();
 async function tex(file,color=false){const t=await loader.loadAsync(new URL(file+'.jpg',assetRoot).href);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(color)t.colorSpace=T.SRGBColorSpace;return t;}
 const [wood,wn,wr,sn,sr,brick,bn,br]=await Promise.all([tex('wood-color',true),tex('wood-normal'),tex('wood-roughness'),tex('stone-normal'),tex('stone-roughness'),tex('brick-color',true),tex('brick-normal'),tex('brick-roughness')]);
 const mat=(name,color,extra={})=>new T.MeshStandardMaterial({name,color,roughness:.8,...extra});
 function surface(kind){const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d');const shades=kind==='stone'?['#d0cbbd','#cdc8b9','#cecabc','#d2cdbf']:['#c0c3bd','#c5c7c0','#c2c5be','#c4c6c0'];c.fillStyle=kind==='stone'?'#b6b2a7':'#9fa69d';c.fillRect(0,0,1024,1024);for(let row=0;row<2;row++)for(let col=0;col<2;col++){c.fillStyle=shades[row*2+col];c.fillRect(col*512+1,row*512+1,510,510);}for(let i=0;i<14000;i++){c.fillStyle=i%2?'rgba(255,255,249,.07)':'rgba(78,84,73,.035)';c.fillRect(i*61%1024,i*131%1024,kind==='stone'?3:2,1);}const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;}
 materials.stone=mat('Cream limestone',0xffffff,{map:surface('stone'),normalMap:sn,normalScale:new T.Vector2(.025,.025),roughnessMap:sr,roughness:.8});
 materials.floor=mat('Honed grey stone',0xffffff,{map:surface('floor'),normalMap:sn,normalScale:new T.Vector2(.008,.008),roughness:.54});
 materials.grout=mat('Stone floor joints',0x8d9891,{roughness:.9});
 materials.brick=mat('Grey brick',0xc6c9c5,{map:brick,normalMap:bn,normalScale:new T.Vector2(.14,.14),roughnessMap:br});
 materials.wood=mat('White oak veneer',0xffeed6,{map:wood,normalMap:wn,normalScale:new T.Vector2(.08,.08),roughnessMap:wr,roughness:.7});
 materials.metal=mat('Dark bronze powder coating',0x35423f,{metalness:.32,roughness:.43});
 materials.roof=mat('Blue grey standing seam roof',0x637783,{metalness:.66,roughness:.46});
 materials.plaster=mat('Mineral plaster and acoustic ceiling',0xe9e7de);
 const weave=document.createElement('canvas');weave.width=weave.height=64;const wc=weave.getContext('2d');wc.fillStyle='#a7afa0';wc.fillRect(0,0,64,64);wc.fillStyle='#778573';for(let i=0;i<64;i+=4){wc.fillRect(i,0,1,64);wc.fillRect(0,i,64,1);}const wt=new T.CanvasTexture(weave);wt.wrapS=wt.wrapT=T.RepeatWrapping;wt.repeat.set(24,24);wt.anisotropy=4;
 materials.fabric=mat('Sage woven upholstery',0x7c8573,{bumpMap:wt,bumpScale:.003,roughness:.91});
 materials.paper=mat('Paper edges',0xede9dd,{roughness:.95});
 materials.light=mat('Linear LED diffuser',0xfff3dd,{emissive:0xffebc7,emissiveIntensity:1.4});
 materials.glass=new T.MeshPhysicalMaterial({name:'Clear architectural glass',color:0xd4e7e7,transparent:true,opacity:.14,roughness:.09,metalness:.1,depthWrite:false,side:T.DoubleSide});
 // One review sample only: table R1, its four upholstered seats and the adjacent east pane.
 materials.sampleWood=materials.wood.clone();materials.sampleWood.name='Sample R1 longitudinal white oak';materials.sampleWood.roughness=.76;
 for(const key of ['map','normalMap','roughnessMap']){const t=materials.wood[key].clone();t.center.set(.5,.5);t.rotation=Math.PI/2;t.needsUpdate=true;materials.sampleWood[key]=t;}
 const normal=document.createElement('canvas');normal.width=normal.height=64;const nc=normal.getContext('2d'),pixels=nc.createImageData(64,64);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4;pixels.data[i]=128+Math.round(Math.sin(x*Math.PI/2)*18);pixels.data[i+1]=128+Math.round(Math.sin(y*Math.PI/2)*18);pixels.data[i+2]=254;pixels.data[i+3]=255;}nc.putImageData(pixels,0,0);
 const normalTexture=new T.CanvasTexture(normal);normalTexture.wrapS=normalTexture.wrapT=T.RepeatWrapping;normalTexture.repeat.set(48,48);normalTexture.anisotropy=4;
 materials.sampleFabric=mat('Sample R1 sage fine woven upholstery',0x7c8573,{normalMap:normalTexture,normalScale:new T.Vector2(.16,.16),roughness:.95});
 materials.sampleGlass=new T.MeshPhysicalMaterial({name:'Sample east pane 12mm clear glass',color:0xffffff,transmission:.96,thickness:.012,ior:1.5,roughness:.008,metalness:0,attenuationColor:new T.Color(0xe8f0e9),attenuationDistance:6,depthWrite:false,side:T.DoubleSide});
 materials.previousSampleGlass=materials.sampleGlass.clone();materials.previousSampleGlass.name='Previous sample glass diagnostic';
 materials.sampleGlass.side=T.FrontSide;
 // r170 clamps physical roughness to .0525, then bicubic/mip filters transmission.
 // Only this polished pane samples the full-resolution base level below LOD .75.
 // Fresnel reflection, IOR, volume absorption and the 12mm mesh remain physical.
 materials.sampleGlass.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_pars_fragment>',T.ShaderChunk.transmission_pars_fragment.replace('return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );','if ( lod < 0.75 ) return textureLod( transmissionSamplerMap, fragCoord.xy, 0.0 );\n return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );'));};
 materials.sampleGlass.customProgramCacheKey=()=> 'library-polished-pane-r170-base-level-v1';
 materials.sampleGlass.userData={geometryThicknessMetres:.012,opticalThicknessMetres:.012,runtimeSampling:'r170 polished-pane base LOD below .75; standard physical glTF fallback'};
 materials.chairWood=materials.sampleWood.clone();materials.chairWood.name='Pale bent oak chair veneer';materials.chairWood.roughness=.78;materials.chairWood.normalScale.set(.045,.045);
 const oakCanvas=document.createElement('canvas');oakCanvas.width=wood.image.width;oakCanvas.height=wood.image.height;const oc=oakCanvas.getContext('2d');oc.drawImage(wood.image,0,0);oc.fillStyle='rgba(234,220,197,.28)';oc.fillRect(0,0,oakCanvas.width,oakCanvas.height);
 const oakTexture=new T.CanvasTexture(oakCanvas);oakTexture.colorSpace=T.SRGBColorSpace;oakTexture.wrapS=oakTexture.wrapT=T.RepeatWrapping;oakTexture.center.set(.5,.5);oakTexture.rotation=Math.PI/2;oakTexture.anisotropy=4;materials.chairWood.map=oakTexture;
 function paleOak(strength){const c=document.createElement('canvas');c.width=wood.image.width;c.height=wood.image.height;const ctx=c.getContext('2d');ctx.drawImage(wood.image,0,0);ctx.fillStyle=`rgba(234,220,197,${strength})`;ctx.fillRect(0,0,c.width,c.height);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.center.set(.5,.5);t.rotation=Math.PI/2;t.anisotropy=4;return t;}
 r1Maps.tableBaseline=materials.sampleWood.map;r1Maps.chairBaseline=materials.chairWood.map;r1Maps.tableFinal=paleOak(.18);r1Maps.chairFinal=paleOak(.40);setR1Look('final');
 return materials;
}
function box(g,name,x,y,z,w,h,d,m,bevel=.008){
 const key=[w,h,d,bevel].join(',');let geometry=geoCache.get(key);
 if(!geometry){geometry=bevel?new RoundedBoxGeometry(w,h,d,1,Math.min(bevel,w/4,h/4,d/4)):new T.BoxGeometry(w,h,d);const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));uv.setXY(i,(ax>ay&&ax>az?p.getZ(i):p.getX(i))/1.6,(ay>ax&&ay>az?p.getZ(i):p.getY(i))/1.6);}geoCache.set(key,geometry);}
 const mesh=new T.Mesh(geometry,m);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=!m.transparent&&!m.transmission;mesh.receiveShadow=true;g.add(mesh);return mesh;
}
function sign(g,text,x,y,z,w,h,rotation=0){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#edece3';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#172e26';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 104px "Microsoft YaHei",sans-serif';ctx.fillText(text,512,128,970);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({name:'Wayfinding: '+text,map:t,roughness:.85}));mesh.name='Sign '+text;mesh.position.set(x,y,z);mesh.rotation.y=rotation;g.add(mesh);return mesh;}
function wall(g,axis,at,start,end,openings){
 const cuts=[start,end,...openings.flatMap(o=>[o.u-o.w/2,o.u+o.w/2])].sort((a,b)=>a-b);
 function put(a,b,lo,hi){if(b-a<.001||hi-lo<.001)return;const x=axis==='x'?(a+b)/2:at,z=axis==='x'?at:(a+b)/2,w=axis==='x'?b-a:.34,d=axis==='x'?.34:b-a;box(g,'Wall with real opening',x,(lo+hi)/2,z,w,hi-lo,d,materials.stone);if(lo<1.85)obstacle(x,z,w,d,'wall');}
 for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],o=openings.find(o=>(a+b)/2>o.u-o.w/2&&(a+b)/2<o.u+o.w/2);if(o){put(a,b,0,o.bottom);put(a,b,o.top,4.5);}else put(a,b,0,4.5);}
 for(const o of openings){if(o.door)continue;const w=o.w,h=o.top-o.bottom,y=(o.top+o.bottom)/2;function f(du,dy,ww,hh,dd,m=materials.metal){return axis==='x'?box(g,'Window frame and glazing',o.u+du,y+dy,at,ww,hh,dd,m):box(g,'Window frame and glazing',at,y+dy,o.u+du,dd,hh,ww,m);}
  for(const u of [-w/2,0,w/2])f(u,0,.055,h,.13);for(const v of [-h/2,h/2,h/2-.65])f(0,v,w,.055,.13);const pane=f(0,0,w-.07,h-.06,.012,axis==='z'&&at===12&&o.u===-5.8?materials.sampleGlass:materials.glass);if(pane.material===materials.sampleGlass)samplePane=pane;
  f(0,-h/2-.05,w+.14,.1,.52,materials.stone);
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
 for(const dx of [-1.2,1.2])box(shelf,'Sign mounting post',x+dx,2.33,z-.03,.018,.26,.025,materials.metal);
 box(shelf,'Oak category sign backing',x,2.48,z,3.02,.4,.04,materials.wood);
 sign(shelf,label,x,2.48,z+.03,2.95,.36);obstacle(x,z,w+.06,d,'shelf '+id);
 shelves.push({id,label,x,z,approach:{x,z:z+1.05}});
 bookDetails.shelf(shelf,id,x,z);
}
function makeReadingTable(g,index,x,z){
 const wood=index===1?materials.sampleWood:materials.wood,fabric=index===1?materials.sampleFabric:materials.fabric;
 const table=group('Reading table '+index,g);box(table,'Solid oak desktop',x,.75,z,3.8,.055,1.2,wood,.015);box(table,'Oak centre divider',x,.93,z,3.78,.28,.045,wood);
 for(const dx of [-1.65,1.65])for(const dz of [-.43,.43])box(table,'Bronze table leg',x+dx,.36,z+dz,.045,.72,.045,materials.metal);
 box(table,'Undertable apron',x,.64,z,3.4,.15,.06,wood);obstacle(x,z,3.8,1.2,'table');
 for(const side of [-1,1])for(const dx of [-.98,.98]){
  const cx=x+dx,cz=z+side*1.13,id=`R${index}-${side<0?'N':'S'}${dx<0?1:2}`,chair=group('Chair '+id,g);
  if(index===1){bentwoodChair??=bentwoodChairFactory(materials.chairWood,fabric,materials.metal,materials.fabric);const module=bentwoodChair();module.position.set(cx,0,cz);module.rotation.y=side<0?Math.PI:0;chair.add(module);}
  else{box(chair,'Upholstered seat',cx,.46,cz,.5,.075,.48,fabric,.025);box(chair,'Upholstered back',cx,.76,cz+side*.21,.49,.44,.065,fabric,.025);
  box(chair,'Oak seat support shell',cx,.405,cz,.49,.035,.47,wood,.015);
  for(const a of [-.205,.205])box(chair,'Connected back support',cx+a,.65,cz+side*.215,.023,.55,.025,materials.metal);
  for(const a of [-.21,.21])for(const b of [-.19,.19])box(chair,'Chair steel leg',cx+a,.225,cz+b,.023,.45,.023,materials.metal);
  for(const a of [-.21,.21])for(const b of [-.19,.19])box(chair,'Chair foot protector',cx+a,.015,cz+b,.029,.03,.029,materials.fabric,.004);
  }
  obstacle(cx,cz,.54,index===1?.60:.55,'chair '+id);
  seats.push({id,label:'阅览位 '+id,x:cx,z:cz,yaw:side===1?0:Math.PI,approach:{x:cx,z:cz+side*.85}});
  box(table,'Recessed desktop power outlet',cx,.782,z+side*.12,.22,.007,.07,materials.metal);
 }
 bookDetails.guide(table,index,x+.55,z+.35);
}
// Merge only repeated decorative construction within each named group; architecture remains editable.
function batchStatic(g){if(g.userData.bookGuide)return;for(const child of [...g.children])if(child.isGroup)batchStatic(child);const batches=new Map();for(const child of g.children){if(!child.isMesh||child.isInstancedMesh||Array.isArray(child.material))continue;const key=child.material.uuid;const list=batches.get(key)||[];list.push(child);batches.set(key,list);}for(const list of batches.values()){if(list.length<3)continue;const geometries=list.map(m=>{m.updateMatrix();return m.geometry.clone().applyMatrix4(m.matrix);});const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!geometry)continue;const mesh=new T.Mesh(geometry,list[0].material);mesh.name=list[0].material.name+' construction';mesh.castShadow=!mesh.material.transparent;mesh.receiveShadow=true;mesh.userData.components=list.map(m=>m.name);list.forEach(m=>g.remove(m));g.add(mesh);}}
export function createBuilding({sharedSite=false}={}){
 const structure=group('Structure stone and real window openings'),furniture=group('Furniture bookcases and reading desks'),roof=group('Roof editable zinc and clerestory'),site=group('Library forecourt');
 box(structure,'Continuous accessible floor',0,-.14,0,24.4,.28,18.4,materials.floor);
 // Mipmapped physical-scale joints avoid flickering subpixel raised strips.
 const front=[{u:-7.2,w:5.2,bottom:.65,top:3.65},{u:0,w:2.8,bottom:0,top:4,door:true},{u:7.2,w:5.2,bottom:.65,top:3.65}];
 wall(structure,'x',9,-12,12,front);wall(structure,'x',-9,-12,12,[-7,7].map(u=>({u,w:4.8,bottom:.7,top:3.7})));
 for(const x of [-12,12])wall(structure,'z',x,-9,9,[-5.8,0,5.8].map(u=>({u,w:4.3,bottom:.65,top:3.7})));
 for(const x of [-11.8,11.8])for(const z of [-8.8,8.8])box(structure,'Stone corner pier',x,2.2,z,.5,4.4,.5,materials.stone);
 for(const x of [-11.8,11.8])box(structure,'Internal stone skirting',x,.065,0,.08,.13,17.5,materials.grout);
 box(structure,'Rear stone skirting',0,.065,-8.8,23.5,.13,.08,materials.grout);
 for(const x of [-6.7,6.7])box(structure,'Entrance stone skirting',x,.065,8.8,10.4,.13,.08,materials.grout);
 // A low volume with raised central roof monitor distinguishes it from the course academy.
 for(const x of [-7.6,7.6]){box(roof,'Wing acoustic ceiling',x,4.47,0,8.8,.16,18.7,materials.plaster);box(roof,'Wing zinc roof',x,4.61,0,9,.12,19,materials.roof);}
 box(roof,'Raised central ceiling',0,5.75,0,6.5,.18,19.2,materials.plaster);box(roof,'Raised central zinc roof',0,5.89,0,6.7,.12,19.5,materials.roof);
 for(const x of [-3.3,3.3]){box(roof,'Clerestory glass',x,5.12,0,.016,1.15,18.8,materials.glass);for(let z=-9;z<=9;z+=1.5)box(roof,'Clerestory mullion',x,5.12,z,.065,1.28,.065,materials.metal);for(const y of [4.52,5.7])box(roof,'Clerestory rail',x,y,0,.075,.075,19,materials.metal);}
 for(let x=-11.7;x<12;x+=.65){const central=Math.abs(x)<3.3;box(roof,'Standing seam',x,central?5.97:4.69,0,.025,.035,central?19.5:19,materials.roof);}
 for(const z of [-9.1,9.1])box(roof,'Clerestory stone end fascia',0,5.12,z,6.6,1.25,.22,materials.stone);
 box(roof,'Stone entrance canopy',0,3.95,10.1,7,.2,2.6,materials.stone);box(roof,'Canopy bronze soffit',0,3.83,10.1,6.75,.035,2.4,materials.metal);
 for(const x of [-3.3,3.3]){box(structure,'Canopy stone column',x,1.91,10.7,.24,3.82,.24,materials.stone);obstacle(x,10.7,.24,.24,'canopy column');}
 sign(structure,'知 识 图 书 馆',0,5.12,9.22,5.4,.75);sign(structure,'馆藏书架',-5.4,3.4,5.4,3.4,.46);sign(structure,'安静阅览',6.4,3.4,5.4,3.4,.46);
 for(const x of [-9,-5.1,5.4,9])for(const z of [-5,1.3,6]){box(structure,'Suspended linear light housing',x,4.25,z,2.74,.07,.09,materials.metal);box(structure,'Suspended linear light',x,4.21,z,2.7,.015,.075,materials.light);for(const dx of [-1.12,1.12])box(structure,'Light suspension rod',x+dx,4.36,z,.008,.23,.008,materials.metal,.002);}
 for(const [id,label,x,z] of [['exam','考研真题卷',-8.1,-4.8],['book','教材习题集',-3.6,-4.8],['ielts','雅思备考库',-8.1,.2],['topic','专题与心得',-3.6,.2]])makeShelf(furniture,id,label,x,z);
 makeReadingTable(furniture,1,6.6,-4.5);makeReadingTable(furniture,2,6.6,1.3);
 const welcome=group('Welcome and catalogue desk',furniture);box(welcome,'Oak enquiry desk',-7,.5,6.3,3.7,1,.8,materials.wood);box(welcome,'Stone enquiry counter',-7,1.04,6.3,3.85,.08,.9,materials.stone);
 for(const x of [-8.2,-5.8])box(welcome,'Catalogue header mounting post',x,1.5,6.1,.022,.85,.025,materials.metal);
 box(welcome,'Catalogue header oak backing',-7,2.05,6.1,2.65,.32,.045,materials.wood);
 sign(welcome,'馆 藏 检 索',-7,2.05,6.126,2.5,.28);obstacle(-7,6.3,3.85,.9,'welcome desk');
 box(structure,'Rear grey brick accent',0,2.15,-8.79,5.2,4.3,.07,materials.brick);sign(structure,'学 无 忧  ·  阅 读 与 思 考',0,2.5,-8.73,4.5,.52);
 if(!sharedSite){
 box(site,'Accessible forecourt',0,-.16,16,40,.28,14.1,materials.floor);box(site,'Site ground',0,-.37,0,100,.12,80,new T.MeshStandardMaterial({name:'Landscape ground',color:0x8e9c83,roughness:1}));
 for(const x of [-9,9]){box(site,'Courtyard planter',x,.28,12.5,2.6,.56,1.1,materials.brick);box(site,'Planter soil',x,.57,12.5,2.4,.025,.95,new T.MeshStandardMaterial({name:'Planting soil',color:0x514d3d,roughness:1}));obstacle(x,12.5,2.6,1.1,'planter');for(let i=0;i<5;i++)box(site,'Forecourt bench timber slat',x,.45,16.2+(i-2)*.10,3,.07,.085,materials.wood);for(const dx of [-1.2,1.2])box(site,'Bench leg',x+dx,.21,16.2,.08,.42,.4,materials.metal);obstacle(x,16.2,3,.5,'bench');}
 for(const x of [-19.95,19.95])box(site,'Courtyard stone edge',x,-.065,16,.10,.11,14.1,materials.stone);
 createLandscape(site,materials.wood,obstacle);
 }
 const door=makeDoor(structure);
 createFacilities({parent:building,materials,box,sign,obstacle});
 batchStatic(building);
 // Bounded window-sky approximation for R1 only. The low-bias cached local
 // shadow resolves feet much smaller than the full-site sun shadow texels.
 const fillRoot=group('R1 bounded daylight fill'),r1Light=new T.SpotLight(0xeaf0f2,26,8,.86,.95,2);r1Light.name='R1 window sky approximation';r1Light.position.set(11.35,2.4,-6.1);r1Light.lookAt(6.6,.4,-4.5);r1Light.target.position.set(0,0,-1);r1Light.add(r1Light.target);r1Light.castShadow=true;r1Light.shadow.mapSize.set(1024,1024);r1Light.shadow.camera.near=.12;r1Light.shadow.bias=-.00002;r1Light.shadow.normalBias=.001;fillRoot.add(r1Light);fillRoot.userData={purpose:'Local real-time window-sky approximation and contact shadow; no baked indirect light',rangeMetres:8,globalExposureUnchanged:true};
 return {building,door,r1Light};
}
