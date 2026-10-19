import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
export async function loadBakedLighting(building,systems){
 const [gltf,...maps]=await Promise.all([new GLTFLoader().loadAsync('assets/classroom-baked.glb'),...['day-open','day-closed','led'].map(name=>new RGBELoader().loadAsync('assets/lightmaps/'+name+'.hdr'))]);
 for(const texture of maps){texture.flipY=false;texture.channel=1;texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;texture.generateMipmaps=false;texture.colorSpace=T.LinearSRGBColorSpace;texture.needsUpdate=true;}
 const uniforms={closed:{value:systems.state.blinds},led:{value:systems.state.lights},gain:{value:1}};
 const original=[];
 function visit(node,receiver=false,dynamic=false){receiver=receiver||!!node.userData.bakeReceiver;dynamic=dynamic||!!node.userData.dynamic;if(node.isMesh&&receiver&&!dynamic)original.push(node);for(const child of node.children)visit(child,receiver,dynamic);}
 visit(building);for(const node of original){node.removeFromParent();node.geometry.dispose();}
 const root=gltf.scene;root.name='Cycles baked classroom and lobby';root.userData.bakedLighting=true;
 root.traverse(mesh=>{if(!mesh.isMesh)return;mesh.castShadow=true;mesh.receiveShadow=true;
  if(!mesh.geometry.attributes.uv1)throw Error('Baked receiver is missing the second UV channel');
  for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
   material.lightMap=maps[0];material.lightMapIntensity=Math.PI;material.envMapIntensity=.24;
   material.onBeforeCompile=shader=>{
    shader.uniforms.campusClosed=uniforms.closed;shader.uniforms.campusLED=uniforms.led;shader.uniforms.campusGain=uniforms.gain;shader.uniforms.campusClosedMap={value:maps[1]};shader.uniforms.campusLEDMap={value:maps[2]};
    shader.fragmentShader='uniform float campusClosed;uniform float campusLED;uniform float campusGain;uniform sampler2D campusClosedMap;uniform sampler2D campusLEDMap;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_maps>',`#include <lights_fragment_maps>\n#ifdef USE_LIGHTMAP\nvec3 openDay=texture2D(lightMap,vLightMapUv).rgb;vec3 closedDay=texture2D(campusClosedMap,vLightMapUv).rgb;vec3 lamp=texture2D(campusLEDMap,vLightMapUv).rgb;irradiance=(mix(openDay,closedDay,campusClosed)*3.0+lamp*campusLED*0.65)*PI*campusGain;iblIrradiance=vec3(0.0);\n#endif`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directDiffuse=vec3(0.0);');
   };
   material.customProgramCacheKey=()=> 'campus-cycles-three-state-v5';material.needsUpdate=true;
  }
 });building.add(root);
 return{update:()=>{uniforms.closed.value=systems.state.blinds;uniforms.led.value=systems.state.lights;},stats:()=>({loaded:true,receiverMeshes:original.length,uvChannel:1,maps:maps.length,atlas:[maps[0].image.width,maps[0].image.height],gain:uniforms.gain.value}),setGain:value=>uniforms.gain.value=value};
}
