import * as T from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {FOUNTAIN} from './layout.js';

export function createWaterSurface(reduced=false){
 const source=Reflector.ReflectorShader;
 const shader={...source,uniforms:{...source.uniforms,uTime:{value:0}},
  vertexShader:source.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv;\nvarying vec3 vWaterWorld;').replace('vUv = textureMatrix * vec4( position, 1.0 );','vUv = textureMatrix * vec4( position, 1.0 );\nvWaterWorld = (modelMatrix * vec4(position,1.0)).xyz;'),
  fragmentShader:source.fragmentShader.replace('varying vec4 vUv;','varying vec4 vUv;\nvarying vec3 vWaterWorld;\nuniform float uTime;').replace('vec4 base = texture2DProj( tDiffuse, vUv );\n\t\t\tgl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',`
   vec4 rippleUv = vUv;
   vec2 radial = vWaterWorld.xz-vec2(-.6,5.5);
   float wave=sin(length(radial)*22.0-uTime*3.5)*.00032;
   rippleUv.xy += (normalize(radial+vec2(.0001))*wave+vec2(sin(vWaterWorld.x*7.0+uTime*.5),cos(vWaterWorld.z*5.0-uTime*.4))*.00042)*rippleUv.w;
   vec3 reflection = texture2DProj(tDiffuse,rippleUv).rgb;
   float facing = clamp(dot(normalize(cameraPosition-vWaterWorld),vec3(0.0,1.0,0.0)),0.0,1.0);
   float fresnel = .025+.975*pow(1.0-facing,4.0);
   gl_FragColor=vec4(mix(color,reflection,.20+.76*fresnel),1.0);
  `)};
 if(!shader.fragmentShader.includes('float fresnel'))throw Error('Water shader patch is incompatible with this Three.js version');
 const mesh=new Reflector(new T.CircleGeometry(FOUNTAIN.waterRadius,128),{textureWidth:384,textureHeight:384,multisample:0,clipBias:.003,color:0x547872,shader});
 mesh.name='Courtyard circular fountain water';mesh.rotation.x=-Math.PI/2;mesh.position.set(FOUNTAIN.x,FOUNTAIN.waterY,FOUNTAIN.z);
 const reflectedMaterial=mesh.material,fallback=new T.MeshPhysicalMaterial({name:'Lightweight water',color:0x66847c,roughness:.18,metalness:0,clearcoat:1,clearcoatRoughness:.08});
 const drawReflection=mesh.onBeforeRender;let enabled=true,last=-Infinity,count=0,phase=0,size=384,disposed=false,paused=false;
 mesh.onBeforeRender=(renderer,scene,camera,...args)=>{
  if(disposed||!enabled||scene.overrideMaterial)return;
  const now=performance.now(),distance=camera.position.distanceTo(mesh.position),interval=distance>35?300:100;
  if(count>0&&(paused||now-last<interval))return;
  last=now;count++;drawReflection.call(mesh,renderer,scene,camera,...args);
 };
 function configure(quality,width){
  enabled=quality!=='fluid'&&width>=900;const next=quality==='high'?768:384;
  if(size!==next){size=next;mesh.getRenderTarget().setSize(size,size);last=-Infinity;count=0;}
  mesh.material=enabled?reflectedMaterial:fallback;
 }
 return{mesh,configure,update(dt){paused=dt<=0;if(dt>0&&!reduced){phase+=dt;reflectedMaterial.uniforms.uTime.value=phase;}},snapshot:()=>({shape:'circle',radius:FOUNTAIN.waterRadius,reflection:enabled,reflectionFrames:count,size}),dispose(){disposed=true;mesh.getRenderTarget().dispose();reflectedMaterial.dispose();fallback.dispose();}};
}
