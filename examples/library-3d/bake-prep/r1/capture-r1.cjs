// Capture the UNMODIFIED application, then independently parse the subset in GLTFLoader.
// Existing Playwright/esbuild/Three r170 install; no application source or bundle rewriting.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const runtime=createRequire(path.join(process.env.LIBRARY_NODE_MODULES,'../package.json'));
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.LIBRARY_URL||'http://127.0.0.1:4896';
const out=path.resolve(process.env.LIBRARY_OUTPUT||__dirname);
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const report={base,date:new Date().toISOString(),errors:[],failedResources:[],shots:[]};
 try{
  const p=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
  p.on('pageerror',e=>report.errors.push(e.message));
  p.on('response',r=>{if(r.status()>=400)report.failedResources.push({url:r.url(),status:r.status()});});
  await p.goto(base+'/examples/library-3d/?view=sample');
  await p.waitForFunction(()=>window.__library?.snapshot().ready,null,{timeout:60000});
  await p.locator('#quality').selectOption('high');
  for(const [view,name] of [['sample','overall'],['chair','chair-close']]){
   await p.evaluate(v=>__library.setView(v),view);await p.waitForTimeout(1000);
   const graphics=await p.evaluate(()=>__library.performance());assert.equal(graphics.exposure,1);assert.equal(graphics.quality,'high');
   await p.screenshot({path:path.join(out,name+'.png')});report.shots.push({name,view,graphics});
  }
  const eye=[4.2,1.65,-3.1],aim=[8.2,.9,-4.5];
  const yaw=-Math.atan2(aim[0]-eye[0],-(aim[2]-eye[2]));
  const pitch=Math.atan2(aim[1]-eye[1],Math.hypot(aim[0]-eye[0],aim[2]-eye[2]));
  assert(await p.evaluate(({eye,yaw})=>__library.setPose(eye[0],eye[2],yaw),{eye,yaw}));
  // setPose resets pitch to zero; production pointer handling changes it by -dy * .003.
  await p.mouse.move(700,450);await p.mouse.down();await p.mouse.move(700,450-pitch/.003);await p.mouse.up();
  await p.waitForTimeout(1000);await p.screenshot({path:path.join(out,'backlit.png')});
  const backlit=await p.evaluate(()=>({snapshot:__library.snapshot(),graphics:__library.performance()}));
  assert.equal(backlit.graphics.exposure,1);assert.equal(backlit.graphics.quality,'high');assert.equal(backlit.snapshot.yaw,yaw);
  report.shots.push({name:'backlit',eye,aim,yaw,pitch,...backlit});
  report.model=await p.evaluate(()=>__library.modelStats());assert.equal(report.model.seats,8);
  report.webgl=await p.evaluate(()=>{const gl=document.getElementById('world').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);});
  // This second page only validates the extracted file; it does not modify the running app.
  const bundle=await runtime('esbuild').build({stdin:{contents:`
   import * as T from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
   window.subsetReady=(async()=>{const gltf=await new GLTFLoader().loadAsync(${JSON.stringify(base+'/examples/library-3d/bake-prep/r1/r1-local.glb')});
    gltf.scene.updateMatrixWorld(true);const box=new T.Box3().setFromObject(gltf.scene),objects=[],materials=new Set(),textures=new Set();
    gltf.scene.traverse(o=>{if(!o.isMesh)return;materials.add(o.material);for(const v of Object.values(o.material))if(v?.isTexture)textures.add(v);
     const u=o.geometry.attributes.uv;let min=[Infinity,Infinity],max=[-Infinity,-Infinity];for(let i=0;i<u.count;i++){min[0]=Math.min(min[0],u.getX(i));min[1]=Math.min(min[1],u.getY(i));max[0]=Math.max(max[0],u.getX(i));max[1]=Math.max(max[1],u.getY(i));}
     objects.push({id:o.userData.id,role:o.userData.role,uv0:{min,max},hasUv1:!!o.geometry.attributes.uv1});});
    return{objects,materialCount:materials.size,textureCount:textures.size,bounds:{min:box.min.toArray(),max:box.max.toArray()},decodedTextures:[...textures].map(t=>({name:t.name,width:t.image.width,height:t.image.height}))};})();`,resolveDir:__dirname},nodePaths:[process.env.LIBRARY_NODE_MODULES],bundle:true,write:false,format:'iife',target:'es2022'});
  const check=await browser.newPage();
  // A blank same-origin document supplies the origin for the standalone loader.
  await check.route('**/__r1_asset_check__',route=>route.fulfill({contentType:'text/html',body:'<html><body>R1 asset verification</body></html>'}));
  await check.goto(base+'/__r1_asset_check__');
  await check.addScriptTag({content:bundle.outputFiles[0].text});report.subset=await check.evaluate(()=>window.subsetReady);
  assert.equal(report.subset.objects.length,166);assert.equal(report.subset.materialCount,17);
  assert(report.subset.decodedTextures.every(t=>t.width>0&&t.height>0));assert(report.subset.objects.every(o=>!o.hasUv1));
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);report.passed=true;
 }finally{await browser.close();fs.writeFileSync(path.join(out,'capture-and-loader-results.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify({passed:report.passed,meshObjects:report.subset?.objects.length,shots:report.shots.map(s=>s.name)}));
})().catch(e=>{console.error(e);process.exitCode=1;});
