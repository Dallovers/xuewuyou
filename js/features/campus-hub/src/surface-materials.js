import * as T from 'three';

// Reuse the project's existing Poly Haven files; no runtime CDN or new assets.
export async function loadSurfaces(){
 const loader=new T.TextureLoader(),textures=new Set(),sets={};
 await Promise.all(['stone','wood','brick','grass'].map(async name=>{
  const dir=name==='grass'?'../social/assets/pbr/':'../../../examples/campus-3d-v5/assets/';
  const files=name==='grass'?['grass-diff.jpg','grass-nor_gl.jpg','grass-rough.jpg']:[name+'-color.jpg',name+'-normal.jpg',name+'-roughness.jpg'];
  const maps=await Promise.all(files.map(f=>loader.loadAsync(new URL(dir+f,document.baseURI).href)));
  maps.forEach((map,i)=>{map.colorSpace=i===0?T.SRGBColorSpace:T.NoColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;textures.add(map);});
  if(name==='stone'){
   // The existing concrete scan is weathered. Use its fine luminance structure
   // within a narrow, neutral range appropriate to maintained campus stone.
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d');c.drawImage(maps[0].image,0,0,1024,1024);const image=c.getImageData(0,0,1024,1024),d=image.data;
   for(let i=0;i<d.length;i+=4){const l=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2],detail=(l-140)*.075;d[i]=213+detail;d[i+1]=210+detail;d[i+2]=201+detail;}
   c.putImageData(image,0,0);const clean=new T.CanvasTexture(canvas);clean.colorSpace=T.SRGBColorSpace;clean.wrapS=clean.wrapT=T.RepeatWrapping;clean.anisotropy=8;textures.add(clean);maps[0]=clean;
  }
  if(name==='brick'){
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d');c.drawImage(maps[0].image,0,0,1024,1024);const image=c.getImageData(0,0,1024,1024),d=image.data;
   for(let i=0;i<d.length;i+=4){const l=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2],value=154+(l-110)*.65;d[i]=value;d[i+1]=value+1;d[i+2]=value+1;}
   c.putImageData(image,0,0);const neutral=new T.CanvasTexture(canvas);neutral.colorSpace=T.SRGBColorSpace;neutral.wrapS=neutral.wrapT=T.RepeatWrapping;neutral.anisotropy=8;textures.add(neutral);maps[0]=neutral;
  }
  sets[name]={map:maps[0],normalMap:maps[1],roughnessMap:maps[2]};
 }));
 function copySet(name,repeatX=1,repeatY=1){const maps={};for(const [role,texture]of Object.entries(sets[name])){const t=texture.clone();t.repeat.set(repeatX,repeatY);textures.add(t);maps[role]=t;}return maps;}
 function apply(material,name,{meters=2,normal=.18,color}={}){
  Object.assign(material,sets[name]);const amplitude=name==='stone'?Math.min(normal,.08):normal;material.normalScale=new T.Vector2(amplitude,amplitude);material.roughness=name==='wood'?.85:.94;
  if(color!==undefined)material.color.setHex(color);
  // Metric local projections work for both real-sized meshes and scaled box
  // instances. Preserve each plank's local grain direction after rotation.
  material.onBeforeCompile=shader=>{
   const extra=`
    vec3 metricPosition = position;
    #ifdef USE_INSTANCING
      metricPosition *= vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    #endif
    vec3 axisWeight = abs(normal);
    vec2 metricUv = axisWeight.y > max(axisWeight.x, axisWeight.z) ? metricPosition.xz : (axisWeight.x > axisWeight.z ? metricPosition.zy : metricPosition.xy);
    ${name==='wood'?'metricUv = metricUv.yx;':''}
    metricUv /= ${Number(meters).toFixed(4)};
    #ifdef USE_MAP
      vMapUv = (mapTransform * vec3(metricUv, 1.0)).xy;
    #endif
    #ifdef USE_NORMALMAP
      vNormalMapUv = (normalMapTransform * vec3(metricUv, 1.0)).xy;
    #endif
    #ifdef USE_ROUGHNESSMAP
      vRoughnessMapUv = (roughnessMapTransform * vec3(metricUv, 1.0)).xy;
    #endif
   `;
   shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n'+extra);
  };
  material.customProgramCacheKey=()=>`campus-metric-pbr-${name}-${meters}`;material.needsUpdate=true;return material;
 }
 return{sets,textures,copySet,apply};
}
