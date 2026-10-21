// Library R1 only. Baked occluded sky + sun bounce; live sun/direct shadows remain.
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {EXRLoader} from 'three/addons/loaders/EXRLoader.js';

const prefix=new URL('./assets/r1-lighting/',document.baseURI);
export function createR1Lighting({building,materials,renderer,shadow}){
 const controller=new AbortController(),root=new T.Group();root.name='R1 baked diffuse sky and bounce';
 const geometries=new Set(),ownedMaterials=new Set(),loaderMaterials=new Set(),legacy=[];
 let atlas,disposed=false,ready=false,enabled=false,error=null,config=null;
 const released={geometries:0,materials:0,textures:0};
 async function fetchAsset(file,json=false){const response=await fetch(new URL(file,prefix),{signal:controller.signal,cache:json?'no-cache':'default'});if(!response.ok)throw Error(`R1 asset ${response.status}: ${file}`);return json?response.json():response.arrayBuffer();}
 function ownGeometry(g){if(disposed){g.dispose();return;}geometries.add(g);}
 function ownMaterial(m){if(disposed){m.dispose();return;}ownedMaterials.add(m);}
 function setEnabled(value){if(disposed||!ready)return false;enabled=!!value;root.visible=enabled;for(const item of legacy)item.object.visible=enabled?false:item.visible;shadow();return snapshot();}
 function snapshot(){return {ready,enabled,disposed,error,receivers:config?.receivers||0,meshes:geometries.size,materials:ownedMaterials.size,atlasSize:atlas?[atlas.image.width,atlas.image.height]:null,atlasChannel:atlas?.channel,irradianceScale:config?.irradianceScale,encoding:config?.encoding,released:{...released}};}
 function coat(base){
  if(!['Sample R1 longitudinal white oak','Pale bent oak chair veneer','Sample R1 sage fine woven upholstery'].includes(base.name))return base.clone();
  const m=new T.MeshPhysicalMaterial();T.MeshStandardMaterial.prototype.copy.call(m,base);m.defines={STANDARD:'',PHYSICAL:''};
  if(base.name.includes('upholstery')){m.sheen=.65;m.sheenRoughness=.85;m.sheenColor.setHex(0x9ca491);m.normalScale.set(.11,.11);}
  else{m.roughness=.74;m.clearcoat=base.name.startsWith('Sample')?.06:.04;m.clearcoatRoughness=.6;m.ior=1.47;}
  return m;
 }
 function installShader(material,floor,wall){
  material.lightMap=atlas;material.lightMapIntensity=config.irradianceScale;
  material.onBeforeCompile=shader=>{
   const declarations=`varying vec3 vR1WorldPosition;\nfloat r1Weight(){${floor?'vec2 d=min(vR1WorldPosition.xz-vec2(4.2,-6.6),vec2(9.4,-2.4)-vR1WorldPosition.xz);return smoothstep(0.0,0.5,min(d.x,d.y));':wall?'return smoothstep(0.0,0.8,min(vR1WorldPosition.z+8.7,-2.6-vR1WorldPosition.z));':'return 1.0;'}}\n`;
   shader.vertexShader='varying vec3 vR1WorldPosition;\n'+shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvR1WorldPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+declarations);
   // Existing point/spot lights approximate ambient fill. Keep their specular response,
   // but replace their diffuse on receivers with the occluded sky + bounced solution.
   const begin=T.ShaderChunk.lights_fragment_begin,cut=begin.indexOf('#if ( NUM_DIR_LIGHTS > 0 )');
   const direct='RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );';
   if(cut<0||!begin.slice(0,cut).includes(direct))throw Error('Unsupported Three lighting chunk');
   const scoped=begin.slice(0,cut).replaceAll(direct,`{vec3 beforeR1Diffuse=reflectedLight.directDiffuse;${direct}reflectedLight.directDiffuse=mix(reflectedLight.directDiffuse,beforeR1Diffuse,r1Weight());}`)+begin.slice(cut);
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',scoped);
   const maps=T.ShaderChunk.lights_fragment_maps
    .replace('irradiance += lightMapIrradiance;','irradiance = mix(irradiance,lightMapIrradiance,r1Weight());')
    .replace('iblIrradiance += getIBLIrradiance( geometryNormal );','iblIrradiance += (1.0-r1Weight())*getIBLIrradiance( geometryNormal );');
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_maps>',maps);
  };
  material.customProgramCacheKey=()=>`library-r1-indirect-r170-${floor?'floor':wall?'wall':'fixed'}-v1`;
 }
 async function load(){
  try{
   config=await fetchAsset('r1-bake.json',true);
   if(config.receivers!==47||config.encoding!=='linear-srgb-white-diffuse-radiance'||config.geometrySource!=='c75a5e2')throw Error('Unsupported R1 bake');
   const [geometryBytes,exrBytes]=await Promise.all([fetchAsset(config.geometry),fetchAsset(config.atlas)]);
   if(disposed)return snapshot();
   const decoded=new EXRLoader().parse(exrBytes),components=decoded.data.length/(decoded.width*decoded.height);
   // EXRLoader returns bottom-up rows. glTF UV1 is top-origin: reorder rows once,
   // rather than depending on typed-array UNPACK_FLIP_Y behavior.
   const data=new decoded.data.constructor(decoded.data.length),stride=decoded.width*components;
   for(let y=0;y<decoded.height;y++)data.set(decoded.data.subarray((decoded.height-1-y)*stride,(decoded.height-y)*stride),y*stride);
   atlas=new T.DataTexture(data,decoded.width,decoded.height,decoded.format,decoded.type);
   atlas.colorSpace=T.LinearSRGBColorSpace;atlas.flipY=false;atlas.channel=1;atlas.generateMipmaps=true;
   atlas.minFilter=T.LinearMipmapLinearFilter;atlas.magFilter=T.LinearFilter;atlas.anisotropy=4;atlas.needsUpdate=true;
   renderer.initTexture(atlas);
   const gltf=await new GLTFLoader().parseAsync(geometryBytes,'');
   gltf.scene.traverse(o=>{if(o.isMesh){ownGeometry(o.geometry);loaderMaterials.add(o.material);}});
   if(disposed){loaderMaterials.forEach(m=>m.dispose());loaderMaterials.clear();atlas?.dispose();atlas=null;return snapshot();}
   const furniture=building.getObjectByName('Furniture bookcases and reading desks'),table=furniture?.getObjectByName('Reading table 1');
   const chairs=furniture?.children.filter(o=>/^Chair R1-/.test(o.name))||[],floor=building.getObjectByName('Continuous accessible floor');
   const tableMeshes=table?.children.filter(o=>o.isMesh&&(o.material===materials.sampleWood||o.material===materials.metal))||[];
   const structure=building.getObjectByName('Structure stone and real window openings');
   const context=structure?.children.filter(o=>o.isMesh&&['Cream limestone construction','Dark bronze powder coating construction'].includes(o.name))||[];
   if(chairs.length!==4||tableMeshes.length!==2||!floor||context.length!==2||geometries.size!==50)throw Error('R1 receiver/source mismatch');
   [...chairs,...tableMeshes,floor,...context].forEach(object=>legacy.push({object,visible:object.visible}));
   const materialCache=new Map();let receivers=0;
   gltf.scene.traverse(o=>{
    if(!o.isMesh)return;
    const base=Object.values(materials).find(m=>m?.isMaterial&&m.name===o.userData.sourceMaterial);
    if(!base)throw Error('Unknown R1 material '+o.userData.sourceMaterial);
    if(!o.userData.bakeReceiver){o.material=base;}
    else{
     if(!o.geometry.getAttribute('uv1'))throw Error('Missing R1 UV1');
     const key=base.name+(o.userData.floorFeather?' floor':o.userData.wallFeather?' wall':'');
     if(!materialCache.has(key)){const m=coat(base);m.name=base.name+' [R1 indirect]';installShader(m,!!o.userData.floorFeather,!!o.userData.wallFeather);ownMaterial(m);materialCache.set(key,m);}
     o.material=materialCache.get(key);receivers++;
    }
    o.castShadow=true;o.receiveShadow=true;
   });
   loaderMaterials.forEach(m=>m.dispose());loaderMaterials.clear();
   if(receivers!==47)throw Error('Wrong R1 receiver count');
   root.userData.r1Lighting={...config,note:'GLB standard PBR does not reproduce the scoped irradiance shader; use the companion atlas and loader.'};
   root.add(gltf.scene);building.add(root);ready=true;setEnabled(true);
  }catch(e){if(!disposed){error=e.message;release();}if(e.name!=='AbortError'&&!disposed)console.warn('R1 lighting fallback:',e.message);}
  return snapshot();
 }
 function release(){
  root.removeFromParent();root.clear();for(const item of legacy)item.object.visible=item.visible;legacy.length=0;
  for(const g of geometries){g.dispose();released.geometries++;}geometries.clear();
  for(const m of ownedMaterials){m.dispose();released.materials++;}ownedMaterials.clear();
  loaderMaterials.forEach(m=>m.dispose());loaderMaterials.clear();
  if(atlas){atlas.dispose();released.textures++;atlas=null;}enabled=false;ready=false;
 }
 function dispose(){if(disposed)return;disposed=true;controller.abort();release();}
 return {load,setEnabled,snapshot,dispose};
}
