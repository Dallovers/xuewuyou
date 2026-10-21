import { WebGLRenderTarget, HalfFloatType } from 'three';
// Preview-only render pipeline. The district never owns a renderer or RAF.
import { EffectComposer } from './assets/vendor/three-r160/postprocessing/EffectComposer.js';
import { RenderPass } from './assets/vendor/three-r160/postprocessing/RenderPass.js';
import { SSAOPass } from './assets/vendor/three-r160/postprocessing/SSAOPass.js';
import { OutputPass } from './assets/vendor/three-r160/postprocessing/OutputPass.js';
export function createSocialPreviewRendering(renderer, scene, camera) {
  const target = new WebGLRenderTarget(1,1,{type:HalfFloatType,samples:renderer.capabilities.isWebGL2?4:0});
  const composer = new EffectComposer(renderer,target);
  const beauty = new RenderPass(scene,camera);
  const contact = new SSAOPass(scene,camera,1,1,16);
  contact.kernelRadius=.22; contact.minDistance=.000015; contact.maxDistance=.0015;
  const output = new OutputPass();
  composer.addPass(beauty);composer.addPass(contact);composer.addPass(output);
  // Cap AO sampling resolution; beauty stays at the full drawing-buffer resolution.
  function resize(w,h) {
    composer.setSize(w,h);
    const scale=Math.min(1,1024/(w*renderer.getPixelRatio()));
    contact.setSize(Math.max(1,Math.round(w*renderer.getPixelRatio()*scale)),Math.max(1,Math.round(h*renderer.getPixelRatio()*scale)));
  }
  let disposed=false;
  return {
    resize,
    render() { renderer.info.reset();const reset=renderer.info.autoReset;renderer.info.autoReset=false;try { composer.render(); } finally { renderer.info.autoReset=reset; } },
    dispose(){ if(disposed)return;disposed=true;contact.dispose();contact.ssaoMaterial.dispose();contact.noiseTexture.dispose();output.dispose();composer.dispose(); },
  };
}
