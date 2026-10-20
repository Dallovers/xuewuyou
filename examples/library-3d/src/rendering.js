// Based on the v5 reference. Library-only quality policy and honest unclamped frame measurements.
import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
class ScaledAO extends SSAOPass{setSize(w,h){super.setSize(Math.max(1,Math.round(w*(this.scale??.5))),Math.max(1,Math.round(h*(this.scale??.5))));}}
export function createRendering(canvas,scene,camera){
 const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.info.autoReset=false;
 const composer=new EffectComposer(renderer),ao=new ScaledAO(scene,camera,innerWidth,innerHeight,10);ao.kernelRadius=.35;ao.minDistance=.001;ao.maxDistance=.07;composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(new SMAAPass(innerWidth,innerHeight));composer.addPass(new OutputPass());
 let mode='auto',ratio=1,slow=0,shadowUpdates=0,lastResize=0,cpuMs=0;const times=[];
 try{const q=localStorage.getItem('xuewuyou-library-quality');if(['auto','fluid','high'].includes(q))mode=q;}catch{}
 function resize(){const cap=Math.sqrt(2000000/(innerWidth*innerHeight));const value=Math.max(.65,Math.min(devicePixelRatio,ratio,cap));renderer.setPixelRatio(value);renderer.setSize(innerWidth,innerHeight);composer.setPixelRatio(value);composer.setSize(innerWidth,innerHeight);lastResize=performance.now();}
 function quality(value,persist=true){mode=['auto','fluid','high'].includes(value)?value:'auto';ratio=mode==='high'?1.3:mode==='fluid'?.85:1;ao.enabled=mode!=='fluid';ao.scale=mode==='high'?.65:.45;slow=0;times.length=0;resize();if(persist)try{localStorage.setItem('xuewuyou-library-quality',mode);}catch{}}
 function frameTime(ms,active=true){if(active&&ms>0){times.push(ms);if(times.length>240)times.shift();}if(mode!=='auto'||!active||performance.now()-lastResize<1800)return;slow=ms>30?slow+ms:Math.max(0,slow-ms);if(slow>1600){if(ao.enabled){ao.enabled=false;ratio=.85;}else ratio=Math.max(.65,ratio-.1);slow=0;resize();}}
 function render(){const start=performance.now();renderer.info.reset();composer.render();cpuMs=performance.now()-start;}
 function stats(){const a=times.slice().sort((x,y)=>x-y),mean=a.length?a.reduce((x,y)=>x+y,0)/a.length:0;return {quality:mode,exposure:renderer.toneMappingExposure,pixelRatio:renderer.getPixelRatio(),ambientOcclusion:ao.enabled,buffer:[canvas.width,canvas.height],samples:a.length,fps:mean?Math.round(10000/mean)/10:0,mean_ms:mean,p95_ms:a[Math.min(a.length-1,Math.floor(a.length*.95))]||0,max_ms:a.at(-1)||0,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,shadowUpdates,submit_ms:cpuMs};}
 quality(mode,false);return {renderer,composer,resize,quality,frameTime,render,stats,shadow:()=>renderer.shadowMap.needsUpdate=true,watchSun:sun=>{const original=sun.shadow.updateMatrices.bind(sun.shadow);sun.shadow.updateMatrices=(...args)=>{shadowUpdates++;return original(...args);};}};
}
