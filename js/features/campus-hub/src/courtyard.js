import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SITE_EXIT,FOUNTAIN} from './layout.js';
import {createWaterSurface} from './water-surface.js';

// Metres, Y up. Keep a four-metre route east of the water garden.
export function createCourtyard(openFeature,leafMap,surfaces,pavingMaterial){
 const root=new T.Group();root.name='Central courtyard water and reading garden';
 const boxes=[],interactions=[],batches=new Map(),cube=new T.BoxGeometry(1,1,1);
 const stone=new T.MeshStandardMaterial({name:'Honed limestone',color:0xc5c1b2,roughness:.78});
 const edge=stone.clone();edge.name='Limestone cut edges';edge.color.setHex(0xb4b2a7);
 const bronze=new T.MeshStandardMaterial({name:'Bronze fittings',color:0x394844,roughness:.48,metalness:.55});
 const wood=new T.MeshStandardMaterial({name:'Oiled ash timber',color:0x9c7951,roughness:.62});
 surfaces.apply(stone,'stone',{normal:.16,color:0xe0d9c7});surfaces.apply(edge,'stone',{normal:.20,color:0xc6c2b6});surfaces.apply(wood,'wood',{meters:1.6,normal:.15,color:0xe0d1b6});
 const soil=new T.MeshStandardMaterial({name:'Mulched planting bed',color:0x615c49,roughness:1});
 const leaf=new T.MeshStandardMaterial({name:'Mixed low planting',color:0x718164,roughness:.95});
 const shrubLeaf=new T.MeshStandardMaterial({name:'Evergreen groundcover leaves',color:0x9ca985,map:leafMap,alphaTest:.48,side:T.DoubleSide,roughness:.95});
 const dark=new T.MeshStandardMaterial({name:'Drainage slots',color:0x414844,roughness:.85});
 const bookMat=new T.MeshStandardMaterial({name:'Reading table book',color:0x526c70,roughness:.8});
 const paper=new T.MeshStandardMaterial({name:'Book page edges',color:0xdad5c5,roughness:.9});
 const dummy=new T.Object3D();let disposed=false,waterOn=true,time=0,waterTicks=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function part(geometry,material,position,scale=[1,1,1],rotation=[0,0,0],cast=true){
  const key=geometry.uuid+material.uuid+cast;
  if(!batches.has(key))batches.set(key,{geometry,material,cast,matrices:[]});
  dummy.position.fromArray(position);dummy.scale.fromArray(scale);dummy.rotation.set(...rotation,'YXZ');dummy.updateMatrix();
  batches.get(key).matrices.push(dummy.matrix.clone());
 }
 const box=(name,x,y,z,w,h,d,m=stone,ry=0,cast=true)=>part(cube,m,[x,y,z],[w,h,d],[0,ry,0],cast);
 function obstacle(id,x,z,w,d,h=1){boxes.push({id:'courtyard.'+id,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,maxY:h});}
 function point(id,label,x,y,z,action,radius=1.65){
  const object=new T.Object3D();object.name=id;object.position.set(x,y,z);root.add(object);
  interactions.push({id:'courtyard.'+id,label,object,radius,action:()=>disposed?{ok:false,message:'场景已关闭'}:action()});
 }
 // Low circular basin: closed stone section and separate curved coping stones.
 const F=FOUNTAIN;
 const basinStone=stone.clone();basinStone.name='Ivory circular fountain stone';basinStone.color.setHex(0xf8f6ef);
 const fountainBronze=new T.MeshStandardMaterial({name:'Satin fountain bronze',color:0x7b715d,metalness:.65,roughness:.35});
 const liner=new T.MeshStandardMaterial({name:'Deep green basin liner',color:0x324b47,roughness:.65});
 function revolve(name,profile,material,segments=128,start=0,length=Math.PI*2){
  const mesh=new T.Mesh(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),segments,start,length),material);
  mesh.name=name;mesh.position.set(F.x,0,F.z);mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);return mesh;
 }
 revolve('Circular basin solid stone wall',[[2.76,.08],[3.08,.08],[3.08,.29],[2.76,.29],[2.76,.08]],basinStone);
 const copingProfile=[[2.73,.29],[3.12,.29],[3.14,.31],[3.14,.35],[3.12,.375],[2.74,.375],[2.72,.355],[2.72,.31],[2.73,.29]];
 for(let i=0;i<24;i++)revolve('Curved coping stone',copingProfile,basinStone,6,i*Math.PI/12+.0008,Math.PI/12-.0016);
 part(new T.CylinderGeometry(2.77,2.77,.08,96),liner,[F.x,.12,F.z]);
 part(new T.CylinderGeometry(.62,.66,.13,64),fountainBronze,[F.x,.35,F.z]);
 const torus=new T.TorusGeometry(2.758,.012,6,128);torus.rotateX(-Math.PI/2);part(torus,fountainBronze,[F.x,.276,F.z]);
 boxes.push({id:'courtyard.water',type:'circle',x:F.x,z:F.z,radius:F.radius,minX:F.x-F.radius,maxX:F.x+F.radius,minZ:F.z-F.radius,maxZ:F.z+F.radius,maxY:.38});
 const waterSurface=createWaterSurface(reduced);root.add(waterSurface.mesh);
 // Flush circular drain outside the rim, with thin radial bars.
 part(new T.RingGeometry(3.36,3.405,144),dark,[F.x,.010,F.z],[1,1,1],[-Math.PI/2,0,0],false);
 for(let i=0;i<512;i++){const a=i*Math.PI/256;box('Flush circular drain bar',F.x+Math.sin(a)*3.3825,.013,F.z+Math.cos(a)*3.3825,.018,.002,.047,basinStone,a,false);}
 // Six outward arcs and a slender central plume; all motion shares the host tick.
 const streamMaterial=new T.MeshPhysicalMaterial({name:'Fine fountain water',color:0xe4eeea,transparent:true,opacity:.42,depthWrite:false,roughness:.10,metalness:0,clearcoat:1});
 const streams=new T.Group();streams.name='Courtyard recirculating streams';root.add(streams);
 const curves=[],landings=[];
 for(let jet=0;jet<7;jet++){
  const a=jet*Math.PI/3,central=jet===6;
  const sx=F.x+(central?0:Math.sin(a)*.46),sz=F.z+(central?0:Math.cos(a)*.46);
  part(new T.CylinderGeometry(.022,.027,.055,10),fountainBronze,[sx,.435,sz]);
  const points=[];for(let i=0;i<=32;i++){
   const t=i/32,r=central?.12*t:.46+1.48*t;
   points.push(new T.Vector3(F.x+Math.sin(a)*r,.46+(central?5.4:3.45)*t*(1-t)-.16*t,F.z+Math.cos(a)*r));
  }
  const curve=new T.CatmullRomCurve3(points);curves.push(curve);
  landings.push(curve.getPoint(1));
  const mesh=new T.Mesh(new T.TubeGeometry(curve,40,central?.025:.012,6,false),streamMaterial);mesh.name=central?'Central fountain plume':'Radial water arc';streams.add(mesh);
 }
 const droplets=new T.InstancedMesh(new T.SphereGeometry(.014,5,4),streamMaterial,84);droplets.name='Recirculating water droplets';streams.add(droplets);
 const sprayCanvas=document.createElement('canvas');sprayCanvas.width=sprayCanvas.height=32;const sc=sprayCanvas.getContext('2d'),gradient=sc.createRadialGradient(16,16,0,16,16,16);gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.45,'rgba(255,255,255,.7)');gradient.addColorStop(1,'rgba(255,255,255,0)');sc.fillStyle=gradient;sc.fillRect(0,0,32,32);
 const sprayMap=new T.CanvasTexture(sprayCanvas),sprayGeo=new T.BufferGeometry(),sprayPositions=new Float32Array(64*3);sprayGeo.setAttribute('position',new T.BufferAttribute(sprayPositions,3));
 const spray=new T.Points(sprayGeo,new T.PointsMaterial({name:'Central plume fine spray',map:sprayMap,color:0xf7fffd,size:.035,opacity:.65,transparent:true,depthWrite:false}));spray.name='Central plume spray';spray.frustumCulled=false;streams.add(spray);
 const rippleGeo=new T.TorusGeometry(.13,.004,4,32);rippleGeo.rotateX(-Math.PI/2);
 const rings=new T.InstancedMesh(rippleGeo,streamMaterial,21);rings.name='Water landing ripples';streams.add(rings);
 for(let i=0;i<21;i++){const p=landings[i%7];dummy.position.set(p.x,F.waterY+.008,p.z);dummy.scale.setScalar(.5+Math.floor(i/7)*.65);dummy.rotation.set(0,0,0);dummy.updateMatrix();rings.setMatrixAt(i,dummy.matrix);}rings.instanceMatrix.needsUpdate=true;
 box('Water control plinth',4.25,.38,11.0,.28,.76,.24,stone);
 box('Water control bronze face',4.25,.78,11.0,.31,.06,.27,bronze);
 const switchLight=new T.Mesh(new T.CylinderGeometry(.034,.034,.008,12),new T.MeshStandardMaterial({color:0xa7c8a4,emissive:0x84aa7c,emissiveIntensity:.5}));switchLight.position.set(4.25,.818,11);root.add(switchLight);
 obstacle('water-control',4.25,11,.3,.28,.83);
 point('water-switch','关闭庭院流水',4.25,.8,11,()=>{
  waterOn=!waterOn;streams.visible=waterOn;switchLight.material.emissiveIntensity=waterOn?.5:0;
  interactions.find(i=>i.id==='courtyard.water-switch').label=waterOn?'关闭庭院流水':'开启庭院流水';
  return{ok:true,message:waterOn?'庭院流水已开启':'庭院流水已关闭'};
 });
 // Reading pergola: footplates, slender posts, supported beams and timber louvres.
 const cx=-12,cz=3;
 box('Reading deck stone inset',cx,.018,cz,6.5,.025,8,pavingMaterial,0,false);
 for(const x of [-2.5,2.5])for(const z of [-3.25,3.25]){
  box('Pergola stone base',cx+x,.10,cz+z,.32,.20,.32,stone);
  box('Pergola footplate',cx+x,.214,cz+z,.23,.028,.23,bronze);
  box('Pergola column',cx+x,1.52,cz+z,.12,2.60,.12,bronze);
  obstacle('pergola-post',cx+x,cz+z,.32,.32,2.9);
  for(const dx of [-.08,.08])for(const dz of [-.08,.08])box('Anchor bolt',cx+x+dx,.237,cz+z+dz,.022,.02,.022,bronze);
 }
 for(const z of [-3.25,3.25])box('Pergola main beam',cx,2.84,cz+z,5.6,.20,.13,bronze);
 for(const x of [-2.5,2.5])box('Pergola side beam',cx+x,2.84,cz,.13,.20,6.7,bronze);
 for(let i=0;i<25;i++)box('Pergola timber louvre',cx-2.75+i*.23,2.995,cz,.075,.12,7.0,wood);
 // Benches have rounded seat slats, a canted back and steel brackets.
 const slat=new RoundedBoxGeometry(2.28,.045,.078,2,.008);
 function bench(id,x,z,angle,label){
  const local=(px,y,pz)=>[x+Math.cos(angle)*px+Math.sin(angle)*pz,y,z-Math.sin(angle)*px+Math.cos(angle)*pz];
  for(const side of [-1,1]){
   part(cube,stone,local(side*.84,.18,0),[.23,.36,.55],[0,angle,0]);
   part(cube,bronze,local(side*.84,.43,0),[.13,.08,.56],[0,angle,0]);
   part(cube,bronze,local(side*.84,.70,-.24),[.055,.56,.055],[0,angle,0]);
  }
  for(let i=0;i<6;i++)part(slat,wood,local(0,.475,-.225+i*.09),[1,1,1],[0,angle,0]);
  for(let i=0;i<3;i++)part(slat,wood,local(0,.66+i*.105,-.27-(i*.012)),[1,1,1],[Math.PI*.42,angle,0]);
  const alongX=Math.abs(Math.cos(angle))>.5;
  obstacle(id,x,z,alongX?2.40:.70,alongX?.70:2.40,1.0);
  const seat=local(0,1.23,.05),dir=[Math.sin(angle),0,Math.cos(angle)];
  point(id,'坐下 · '+label,...local(0,.55,.52),()=>({ok:true,kind:'seat',label,position:seat,directions:[dir]}),1.8);
 }
 bench('water-seat-east-1',7.2,2.6,-Math.PI/2,'水边长椅');
 bench('water-seat-east-2',7.2,8.3,-Math.PI/2,'水边长椅');
 bench('reading-seat',-14,3,Math.PI/2,'阅读廊架');
 bench('garden-seat',-11.5,-.1,0,'阅读廊架');
 // A real table-top book opens the existing library catalogue, no mock content.
 box('Reading table foot',-10.8,.055,3.3,.54,.11,.54,stone);
 box('Reading table stem',-10.8,.37,3.3,.085,.55,.085,bronze);
 part(new RoundedBoxGeometry(1.15,.07,.75,2,.009),wood,[-10.8,.735,3.3]);
 box('Book lower cover',-10.88,.785,3.3,.30,.012,.23,bookMat,.18);
 box('Book paper block',-10.88,.803,3.3,.285,.025,.215,paper,.18);
 box('Book upper cover',-10.88,.822,3.3,.30,.012,.23,bookMat,.18);
 box('Book cloth bookmark',-10.86,.83,3.36,.022,.003,.17,bronze,.18);
 obstacle('reading-table',-10.8,3.3,1.15,.75,.8);
 point('reading-book','翻阅桌上导读 · 打开学习资料',-10.8,.85,3.3,()=>openFeature('wenku',{from:'courtyard.reading-book'}),1.7);
 // Ground planting is clustered and low; no additional canopy trees.
 const shrubGeo=new T.IcosahedronGeometry(1,2),grassGeo=new T.ConeGeometry(.045,.43,4),leafGeo=new T.PlaneGeometry(1,1);
 let seed=241;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(const [x,z,w,d]of [[-16.9,3,1.0,8.0],[-12,-2.2,5.7,.9]]){
  box('Mulched perennial bed',x,.03,z,w,.04,d,soil,0,false);
  for(const s of [-1,1])box('Planting stone edge',x+s*w/2,.095,z,.11,.17,d,edge);
  for(let i=0;i<24;i++){
   const px=x+(rand()-.5)*w*.82,pz=z+(rand()-.5)*d*.94,h=.17+rand()*.26;
   part(shrubGeo,leaf,[px,h*.45,pz],[.17+rand()*.10,h*.65,.17+rand()*.10],[0,rand()*6.28,0],false);
   for(let k=0;k<22;k++){
    const a=rand()*Math.PI*2,r=.11+rand()*.2,ly=.10+rand()*h;
    part(leafGeo,shrubLeaf,[px+Math.sin(a)*r,ly,pz+Math.cos(a)*r],[.14+rand()*.10,.18+rand()*.10,1],[rand()*.8-.4,a,rand()*.6],false);
   }
   for(let j=0;j<5;j++)part(grassGeo,leaf,[px+(rand()-.5)*.36,.24,pz+(rand()-.5)*.36],[1,.6+rand()*.5,1],[0,rand()*6.28,(rand()-.5)*.25],false);
  }
 }
 // Directory stand: a readable physical campus plan rather than a floating UI.
 const plan=document.createElement('canvas');plan.width=512;plan.height=640;const ctx=plan.getContext('2d');
 ctx.fillStyle='#e4e2d5';ctx.fillRect(0,0,512,640);ctx.fillStyle='#334e44';ctx.font='bold 38px Microsoft YaHei';ctx.fillText('中央庭院',40,65);ctx.font='21px Microsoft YaHei';ctx.fillText('校园导览',40,102);
 ctx.strokeStyle='#b3b6a6';ctx.lineWidth=28;ctx.beginPath();ctx.moveTo(265,510);ctx.lineTo(265,200);ctx.moveTo(100,330);ctx.lineTo(420,330);ctx.stroke();
 for(const [x,y,w,h,text]of [[150,150,240,58,'教学楼'],[35,268,115,62,'图书馆'],[35,415,115,62,'自习室'],[335,290,140,55,'社交广场'],[335,400,140,55,'竞技场']]){ctx.fillStyle='#61786b';ctx.fillRect(x,y,w,h);ctx.fillStyle='#fffdf4';ctx.font='19px Microsoft YaHei';ctx.fillText(text,x+10,y+36);}
 ctx.fillStyle='#38586a';ctx.beginPath();ctx.arc(264,334,32,0,Math.PI*2);ctx.fill();ctx.fillStyle='#51674c';ctx.font='19px Microsoft YaHei';ctx.fillText('沿庭院步行，走近入口按 E',40,580);
 const map=new T.CanvasTexture(plan);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 const signMat=new T.MeshStandardMaterial({name:'Campus directory enamel',map,roughness:.68});
 box('Directory stone base',-6.1,.10,-9.6,1.38,.20,.6,stone);
 for(const x of [-6.6,-5.6])box('Directory bronze post',x,.76,-9.6,.065,1.32,.08,bronze);
 box('Directory frame',-6.1,1.48,-9.6,1.30,1.62,.10,bronze);
 const sign=new T.Mesh(new T.PlaneGeometry(1.17,1.48),signMat);sign.position.set(-6.1,1.48,-9.543);root.add(sign);
 obstacle('directory',-6.1,-9.6,1.38,.6,2.3);
 point('directory','查看校园导览',-6.1,1.4,-9.1,()=>openFeature('campus-guide',{from:'courtyard.directory'}),1.9);
 // A campus wayfinding marker at the south promenade, with the walkway open.
 const exitCanvas=document.createElement('canvas');exitCanvas.width=768;exitCanvas.height=384;const ec=exitCanvas.getContext('2d');
 ec.fillStyle='#e1e3d7';ec.fillRect(0,0,768,384);ec.fillStyle='#315448';ec.font='bold 70px Microsoft YaHei';ec.fillText('返回网站',65,145);ec.font='35px Microsoft YaHei';ec.fillText('离开 3D 校园 · 回到学无忧首页',65,225);ec.font='28px Microsoft YaHei';ec.fillText('走近后按 E，或点击屏幕上的返回网站',65,305);
 const exitMap=new T.CanvasTexture(exitCanvas);exitMap.colorSpace=T.SRGBColorSpace;exitMap.anisotropy=4;
 const exitMaterial=new T.MeshStandardMaterial({name:'Site exit enamel',map:exitMap,roughness:.72});
 box('South exit marker base',-2.05,.09,37.3,1.75,.18,.50,stone);
 for(const x of [-2.73,-1.37])box('South exit marker post',x,.75,37.3,.065,1.35,.065,bronze);
 box('South exit marker frame',-2.05,1.43,37.3,1.72,.90,.09,bronze);
 const exitFace=new T.Mesh(new T.PlaneGeometry(1.60,.8),exitMaterial);exitFace.position.set(-2.05,1.43,37.247);exitFace.rotation.y=Math.PI;root.add(exitFace);
 obstacle('site-exit-marker',-2.05,37.3,1.75,.50,1.9);
 point('site-exit','返回网站首页',SITE_EXIT.at[0],1,SITE_EXIT.at[1],()=>openFeature('exit-site'),2.3);
 // Batch all repeated construction pieces by geometry/material/shadow state.
 for(const batch of batches.values()){
  const mesh=new T.InstancedMesh(batch.geometry,batch.material,batch.matrices.length);mesh.name='Courtyard · '+batch.material.name;
  batch.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=batch.cast;mesh.receiveShadow=true;root.add(mesh);
 }
 function update(dt){
  waterSurface.update(dt);
  if(disposed||!waterOn||dt<=0)return;time+=dt;waterTicks+=dt;
  if(waterTicks<.05)return;waterTicks=0;
  for(let i=0;i<84;i++){
   const t=reduced?.45:(time*.60+(i%12)/12)%1,p=curves[Math.floor(i/12)].getPoint(t);
   dummy.position.copy(p);dummy.rotation.set(0,0,0);dummy.scale.set(.65,1.7,.65);dummy.updateMatrix();droplets.setMatrixAt(i,dummy.matrix);
  }droplets.instanceMatrix.needsUpdate=true;
  for(let i=0;i<64;i++){const t=reduced?(i+.5)/64:(time*.8+i*.037)%1,a=i*2.39996,r=t*(.04+(i%7)*.033);sprayPositions[i*3]=F.x+Math.sin(a)*r;sprayPositions[i*3+1]=.44+4.9*t-4.9*t*t;sprayPositions[i*3+2]=F.z+Math.cos(a)*r;}sprayGeo.attributes.position.needsUpdate=true;
 }
 update(.05);
 return{root,boxes,interactions,cameraObstacles:[{id:'courtyard.pergola-roof',minX:-14.85,maxX:-9.15,minZ:-.50,maxZ:6.50,minY:2.74,maxY:3.06}],configureQuality:(quality,width)=>waterSurface.configure(quality,width),update,dispose(){disposed=true;waterSurface.dispose();},snapshot:()=>({waterOn,fountain:{shape:'circle',center:[F.x,F.z],radius:F.radius,copingSegments:24,jets:7},reducedMotion:reduced,water:waterSurface.snapshot(),interactionCount:interactions.length,points:interactions.map(i=>({id:i.id,label:i.label,position:i.object.getWorldPosition(new T.Vector3()).toArray()}))})};
}
