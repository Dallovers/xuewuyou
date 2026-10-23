import * as T from 'three';

export function createSkyEnvironment(hdr){
 const material=new T.MeshBasicMaterial({map:hdr,side:T.BackSide,depthWrite:false,fog:true});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vSkyDirection;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvSkyDirection=(modelMatrix*vec4(transformed,1.0)).xyz-cameraPosition;');
  shader.fragmentShader='varying vec3 vSkyDirection;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>','gl_FragColor.rgb=mix(fogColor,gl_FragColor.rgb,smoothstep(.015,.28,normalize(vSkyDirection).y));');
 };
 material.customProgramCacheKey=()=> 'campus-horizon-sky-v1';
 const mesh=new T.Mesh(new T.SphereGeometry(100,48,24),material);mesh.name='HDR sky with matched atmospheric horizon';mesh.renderOrder=-1000;mesh.frustumCulled=false;mesh.userData.skipContactAO=true;
 mesh.onBeforeRender=(_renderer,_scene,camera)=>{mesh.position.copy(camera.position);mesh.updateMatrixWorld(true);};
 return{mesh,dispose(){mesh.removeFromParent();mesh.geometry.dispose();material.dispose();hdr.dispose();}};
}
