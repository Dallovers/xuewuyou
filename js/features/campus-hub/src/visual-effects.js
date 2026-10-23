import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

export function createVisualEffects(renderer,scene,camera,sun){
 let composer,ao,output,lastMode='',lastX=NaN,lastZ=NaN,enabled=false,disposed=false;
 function releaseComposer(){ao?.dispose();ao?.ssaoMaterial.dispose();ao?.noiseTexture?.dispose();output?.dispose();composer?.dispose();composer=ao=output=null;}
 function resize(width,height,quality){
  const shadowSize=quality==='high'&&width>=700?4096:2048;if(sun.shadow.mapSize.x!==shadowSize){sun.shadow.mapSize.set(shadowSize,shadowSize);sun.shadow.map?.dispose();sun.shadow.map=null;renderer.shadowMap.needsUpdate=true;}
  enabled=quality==='high'&&width>=700;
  if(!enabled&&composer)releaseComposer();
  if(enabled&&!composer){composer=new EffectComposer(renderer);const samples=Math.min(4,renderer.capabilities.maxSamples);composer.renderTarget1.samples=samples;composer.renderTarget2.samples=samples;composer.addPass(new RenderPass(scene,camera));ao=new SSAOPass(scene,camera,1,1,12);ao.kernelRadius=.7;ao.minDistance=.001;ao.maxDistance=.025;
   const cacheVisibility=ao.overrideVisibility.bind(ao);ao.overrideVisibility=()=>{cacheVisibility();scene.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material];if(o.userData.skipContactAO||o.isReflector||o.isSkinnedMesh||mats.every(m=>m.transparent||m.alphaTest>0))o.visible=false;}});};
   composer.addPass(ao);output=new OutputPass();composer.addPass(output);}
  if(composer){const ratio=renderer.getPixelRatio();composer.setPixelRatio(ratio);composer.setSize(width,height);ao.setSize(Math.max(1,Math.floor(width*ratio*.5)),Math.max(1,Math.floor(height*ratio*.5)));}
 }
 function fitShadow(state){
  const mode=state.mode,span=mode==='overview'?68:26;
  const x=mode==='overview'?0:Math.round(state.x/2)*2,z=mode==='overview'?0:Math.round(state.z/2)*2;
  if(mode===lastMode&&x===lastX&&z===lastZ)return;
  lastMode=mode;lastX=x;lastZ=z;sun.position.set(x-40,62,z+35);sun.target.position.set(x,0,z);sun.target.updateMatrixWorld();
  Object.assign(sun.shadow.camera,{left:-span,right:span,top:span,bottom:-span,near:1,far:170});sun.shadow.camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;
 }
 return{resize,fitShadow,render(){if(disposed)return;if(enabled)composer.render();else renderer.render(scene,camera);},snapshot:()=>({contactAO:enabled,aoScale:.5,shadowSpan:lastMode==='overview'?136:52,targets:composer?5:0}),dispose(){disposed=true;releaseComposer();}};
}
