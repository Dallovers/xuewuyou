import * as T from 'three';

// One host-owned material for outdoor paving. Global XZ coordinates keep the
// 800mm joints continuous across separately translated district roots.
export function createWhitePaving(surfaces){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
 const ctx=canvas.getContext('2d');ctx.drawImage(surfaces.sets.stone.map.image,0,0,1024,1024);
 const image=ctx.getImageData(0,0,1024,1024),pixels=image.data;
 for(let i=0;i<pixels.length;i+=4){const detail=(pixels[i]-213)*.75;pixels[i]=228+detail;pixels[i+1]=226+detail;pixels[i+2]=220+detail;}
 ctx.putImageData(image,0,0);ctx.strokeStyle='#b9b8b1';ctx.lineWidth=1.4;
 for(let row=0;row<4;row++){
  ctx.beginPath();ctx.moveTo(0,row*256);ctx.lineTo(1024,row*256);ctx.stroke();
  for(let col=-1;col<5;col++){const x=col*256+(row%2)*128;ctx.beginPath();ctx.moveTo(x,row*256);ctx.lineTo(x,(row+1)*256);ctx.stroke();}
 }
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;
 const joints=map.clone();joints.colorSpace=T.NoColorSpace;surfaces.textures.add(map);surfaces.textures.add(joints);
 const material=new T.MeshStandardMaterial({name:'Campus unified warm-white stone paving',color:0xffffff,...surfaces.sets.stone,map,bumpMap:joints,bumpScale:.006,normalScale:new T.Vector2(.035,.035),roughness:.94});
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
   vec4 pavingPosition=vec4(position,1.0);
   #ifdef USE_INSTANCING
    pavingPosition=instanceMatrix*pavingPosition;
   #endif
   vec2 pavingUv=(modelMatrix*pavingPosition).xz/3.2;
   #ifdef USE_MAP
    vMapUv=(mapTransform*vec3(pavingUv,1.0)).xy;
   #endif
   #ifdef USE_NORMALMAP
    vNormalMapUv=(normalMapTransform*vec3(pavingUv,1.0)).xy;
   #endif
   #ifdef USE_ROUGHNESSMAP
    vRoughnessMapUv=(roughnessMapTransform*vec3(pavingUv,1.0)).xy;
   #endif
   #ifdef USE_BUMPMAP
    vBumpMapUv=(bumpMapTransform*vec3(pavingUv,1.0)).xy;
   #endif
  `);
 };
 material.customProgramCacheKey=()=> 'campus-unified-white-paving-v1';
 return material;
}
