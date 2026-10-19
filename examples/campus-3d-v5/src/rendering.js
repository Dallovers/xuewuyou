import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';

// SSAO only needs a smaller depth/normal buffer; keep the final colour image sharp.
class ScaledAO extends SSAOPass {
  setSize(w,h){super.setSize(Math.max(1,Math.round(w*(this.scale??.6))),Math.max(1,Math.round(h*(this.scale??.6))));}
}
export function createRendering(canvas,scene,camera){
 const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:false});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.info.autoReset=false;
 const composer=new EffectComposer(renderer),ao=new ScaledAO(scene,camera,innerWidth,innerHeight,12);
 ao.kernelRadius=.4;ao.minDistance=.001;ao.maxDistance=.08;
 composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(new SMAAPass(innerWidth,innerHeight));composer.addPass(new OutputPass());
 let mode='auto',ratio=1.15,lastResize=0,slow=0,fast=0,shadowUpdates=0,cpuMs=0;
 const intervals=new Float32Array(180);let count=0,cursor=0;
 try{const saved=localStorage.getItem('xuewuyou-render-quality');if(['auto','fluid','high'].includes(saved))mode=saved;}catch{}
 const modes={auto:{ratio:1.15,ao:.6},fluid:{ratio:1,ao:.5},high:{ratio:1.5,ao:.75}};
 function resize(){const cap=Math.sqrt(2600000/(innerWidth*innerHeight));const value=Math.max(.65,Math.min(devicePixelRatio,ratio,mode==='high'?1.5:cap));renderer.setPixelRatio(value);renderer.setSize(innerWidth,innerHeight);composer.setPixelRatio(value);composer.setSize(innerWidth,innerHeight);lastResize=performance.now();}
 function quality(value,persist=true){mode=value in modes?value:'auto';ratio=modes[mode].ratio;ao.scale=modes[mode].ao;slow=fast=0;resize();if(persist)try{localStorage.setItem('xuewuyou-render-quality',mode);}catch{}}
 function frameTime(ms,active=true){if(ms>0&&ms<250){intervals[cursor++%intervals.length]=ms;count=Math.min(count+1,intervals.length);}if(mode!=='auto'||!active||performance.now()-lastResize<3000||ms>200)return;
  slow=ms>23?slow+ms:Math.max(0,slow-ms*2);fast=ms<18?fast+ms:0;
  if(slow>1800&&ratio>.8){ratio=Math.max(.8,ratio-.1);slow=fast=0;resize();}
  else if(fast>12000&&ratio<1.15){ratio=Math.min(1.15,ratio+.05);fast=0;resize();}
 }
 function render(){const start=performance.now();renderer.info.reset();composer.render();cpuMs=performance.now()-start;}
 function shadow(){renderer.shadowMap.needsUpdate=true;}
 function watchSun(sun){const original=sun.shadow.updateMatrices.bind(sun.shadow);sun.shadow.updateMatrices=(...args)=>{shadowUpdates++;return original(...args);};}
 function stats(){const a=Array.from(intervals.subarray(0,count)).sort((a,b)=>a-b);return{quality:mode,pixelRatio:renderer.getPixelRatio(),buffer:[canvas.width,canvas.height],aoBuffer:[ao.width,ao.height],fps:count?Math.round(1000/(a.reduce((x,y)=>x+y,0)/count)):0,p95_ms:a[Math.floor(count*.95)]||0,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,shadowUpdates,submit_ms:Math.round(cpuMs*100)/100};}
 quality(mode,false);
 return{renderer,composer,render,resize,quality,frameTime,stats,shadow,watchSun};
}
