import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function createClassroomSystems(building,materials){
 const group=new T.Group();group.name='Classroom operable blinds lighting and projection';group.userData.dynamic=true;building.add(group);
 const panels=[],state={blinds:0,blindsTarget:0,lights:1,lightsTarget:1,projector:0,projectorTarget:0};
 const fabric=new T.MeshStandardMaterial({name:'Woven roller blind fabric',color:0xdadbd1,roughness:.94});
 function box(name,x,y,z,w,h,d,mat,r=.005){const mesh=new T.Mesh(new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/4,h/4,d/4)),mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
 for(const [x,w] of [[11.6,2.28],[18.8,2.73],[22.1,2.73]]){
  box('Roller blind enclosed headrail',x,3.86,3.68,w+.1,.09,.085,materials.ceiling);
  const panel=box('Operable linen blind',x,3.75,3.68,w,1,.012,fabric,.002);panel.userData.classroomBlind=true;panel.scale.y=.08;panels.push(panel);
  const bottom=box('Blind bronze bottom bar',x,3.71,3.68,w,.025,.025,materials.metal);
  panel.userData.bottom=bottom.uuid;
 }
 box('Classroom control plate',9.135,1.68,.8,.035,.32,.24,materials.trim,.009);
 box('Light rocker switch',9.16,1.69,.75,.027,.15,.055,materials.ceiling,.006);
 box('Blind rocker switch',9.16,1.69,.85,.027,.15,.055,materials.ceiling,.006);
 const pilotMaterial=new T.MeshStandardMaterial({name:'Equipment power indicator',color:0x769b78,emissive:0x39785d,emissiveIntensity:.7,roughness:.35});box('Switch power indicator',9.176,1.79,.8,.008,.014,.045,pilotMaterial,.002);
 box('Projection screen roller housing',23.08,3.62,-1,.13,.12,5.35,materials.ceiling,.014);
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=900;const c=canvas.getContext('2d');c.fillStyle='#eef0eb';c.fillRect(0,0,1600,900);c.fillStyle='#304b41';c.font='500 64px "Microsoft YaHei",sans-serif';c.fillText('高等数学 · 导数与变化率',100,125);c.fillStyle='#687c72';c.font='34px "Microsoft YaHei",sans-serif';c.fillText('f(x) = x²        f′(x) = 2x',100,200);
 c.strokeStyle='#b4c2b9';c.lineWidth=3;c.beginPath();c.moveTo(250,700);c.lineTo(1370,700);c.moveTo(430,270);c.lineTo(430,760);c.stroke();
 c.strokeStyle='#3e7962';c.lineWidth=7;c.beginPath();for(let i=0;i<=200;i++){const x=-1.5+i/200*4.8,px=430+x*190,py=700-x*x*38;i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();
 c.strokeStyle='#b99156';c.lineWidth=5;c.beginPath();c.moveTo(430+.7*190,700-(4*.7-4)*38);c.lineTo(430+3.5*190,700-(4*3.5-4)*38);c.stroke();c.fillStyle='#304b41';c.font='30px "Microsoft YaHei",sans-serif';c.fillText('切线斜率表示某一点的瞬时变化率',100,830);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 const screenMaterial=new T.MeshStandardMaterial({name:'Physical projection screen',color:0xffffff,map:texture,emissive:0xffffff,emissiveMap:texture,emissiveIntensity:.55,roughness:.98});
 const screen=new T.Mesh(new T.PlaneGeometry(5.15,1),screenMaterial);screen.name='Retractable classroom projection screen';screen.rotation.y=-Math.PI/2;screen.position.set(22.99,3.5,-1);group.add(screen);
 const lensMaterial=new T.MeshStandardMaterial({name:'Projector illuminated lens',color:0x748784,metalness:.5,roughness:.15,emissive:0xd3e7ff,emissiveIntensity:0});box('Live projector lens',16.233,3.85,-1,.008,.072,.072,lensMaterial,.008);
 function target(values){if('blinds' in values)state.blindsTarget=T.MathUtils.clamp(values.blinds,0,1);if('lights' in values)state.lightsTarget=T.MathUtils.clamp(Number(values.lights),0,1);if('projector' in values)state.projectorTarget=values.projector?1:0;}
 function update(dt){const before=state.blinds;state.blinds=T.MathUtils.damp(state.blinds,state.blindsTarget,4.5,dt);state.lights=T.MathUtils.damp(state.lights,state.lightsTarget,7,dt);state.projector=T.MathUtils.damp(state.projector,state.projectorTarget,5.5,dt);for(const key of ['blinds','lights','projector'])if(Math.abs(state[key]-state[key+'Target'])<.001)state[key]=state[key+'Target'];
  const h=.08+state.blinds*2.43;for(const panel of panels){panel.scale.y=h;panel.position.y=3.79-h/2;group.getObjectByProperty('uuid',panel.userData.bottom).position.y=3.79-h;}
  materials.classroomLight.emissiveIntensity=state.lights*2.3;pilotMaterial.emissiveIntensity=.1+state.lights*.8;
  screen.visible=state.projector>.005;screen.scale.y=Math.max(.01,state.projector*2.28);screen.position.y=3.5-state.projector*2.28/2;lensMaterial.emissiveIntensity=state.projector*2.3;
  return Math.abs(before-state.blinds)>.0001;
 }
 update(0);
 return{state,group,panels,target,update,controlPosition:new T.Vector3(9.18,1.68,.8),snapshot:()=>({blinds:state.blinds,blindsTarget:state.blindsTarget,lights:state.lights,lightsTarget:state.lightsTarget,projector:state.projector,projectorTarget:state.projectorTarget,screenVisible:screen.visible})};
}
