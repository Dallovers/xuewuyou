'use strict';
// Same-condition runtime evidence, with the complete previous tree served from Git.
const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('playwright');
const repo=path.resolve(__dirname,'../../../..'),before='b500fdc3bc28823d2982584c751b9357152ae942';
const out=path.resolve(process.env.SOCIAL_OUTPUT||path.join(repo,'previews/nearfield-v5'));
const views={A1:'x=-3.8&z=-1.2&yaw=118.6&pitch=-11',A2:'x=.5&z=6&yaw=47.7&pitch=0',A3:'x=-7.2&z=6.2&yaw=0&pitch=0',panorama:'x=0&z=16&yaw=0&pitch=-5',desk:'x=-5.25&z=1.6&yaw=65&pitch=-22',foot:'x=-4.4&z=.5&yaw=44&pitch=-33',bench:'x=2.8&z=-3.15&yaw=-10&pitch=-27'};
let browser;const report={before,views,errors:[],conditions:{viewport:[1536,1024],dpr:1,eye:1.6,mm:35,exposure:.86,headless:true},screens:[]};
const server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),previous=url.pathname.startsWith('/__before/');
  const name=decodeURIComponent(previous?url.pathname.slice('/__before'.length):url.pathname);
  const file=path.resolve(repo,'.'+name);if(!file.startsWith(repo+path.sep))throw Error('outside workspace');
  let bytes=previous?cp.execFileSync('git',['show',before+':'+path.relative(repo,file).split(path.sep).join('/')],{cwd:repo,maxBuffer:32*1024*1024}):await fs.readFile(file);
  if(file.endsWith('preview.html'))bytes=Buffer.from(bytes.toString().replace('const district =','window.__nearfieldScene=scene;const district ='));
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(bytes);
}catch{res.statusCode=404;res.end();}});
(async()=>{
 await fs.mkdir(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,executablePath:process.env.SOCIAL_BROWSER_PATH});
 const p=await browser.newPage({viewport:{width:1536,height:1024},deviceScaleFactor:1});
 p.on('pageerror',e=>report.errors.push(e.message));
 if(process.env.SOCIAL_CDN_CACHE)for(const [url,file]of [['https://unpkg.com/three@0.160.0/build/three.module.js','three-r160-review.module.js'],['https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js','RGBELoader-r160-review.js']])await p.route(url,r=>r.fulfill({path:path.join(process.env.SOCIAL_CDN_CACHE,file),contentType:'text/javascript'}));
 const versions=process.env.SOCIAL_CAPTURE_PHASE?[process.env.SOCIAL_CAPTURE_PHASE]:['before','after'];
 for(const version of versions)for(const [name,params]of Object.entries(views)){
  await p.goto('http://127.0.0.1:'+server.address().port+(version==='before'?'/__before':'')+'/js/features/social/preview.html?mm=35&hud=0&'+params);
  await p.waitForFunction(()=>window.__social?.env.ok);const ready=await p.evaluate(()=>__social.district.ready);
  assert.equal(ready.bakedAO?.ok,true,JSON.stringify(ready));assert.equal(ready.bakedAO.indirect,true);
  await p.waitForTimeout(300);await p.screenshot({path:path.join(out,version+'-'+name+'.png')});
  report.screens.push({version,name,ready,...await p.evaluate(()=>{const r=__social.renderer;r.render(__nearfieldScene,__social.camera);return {render:{...r.info.render},memory:{...r.info.memory},exposure:r.toneMappingExposure,eye:__social.player.y};})});
 }
 if(versions.includes('after')){
  report.construction=await p.evaluate(async()=>{
   const T=await import('three'),{createDistrict}=await import('./social-district.js'),{socialSceneSignature}=await import('./social-baked-ao.js');
   const d=createDistrict({THREE:T,bakedAO:false});await d.ready;d.root.updateMatrixWorld(true);
   const body=d.root.getObjectByName('social:desk-body'),origin=body.getWorldPosition(new T.Vector3());
   const front=new T.Raycaster(origin,new T.Vector3(1,0,0)).intersectObject(body,false),back=new T.Raycaster(origin,new T.Vector3(-1,0,0)).intersectObject(body,false);
   const fixings={};d.root.traverse(o=>{if(o.name.startsWith('nearfield:'))fixings[o.name]=(fixings[o.name]||0)+(o.isInstancedMesh?o.count:1);});
   const plates=d.root.children.filter(o=>o.name==='nearfield:board-foot');
   const contained=plates.every(o=>{const c=d.colliders.find(c=>c.name===o.name&&Math.abs(c.center[2]-o.position.z)<.001),v=new T.Vector3(...c.half);return new T.Box3(new T.Vector3(...c.center).sub(v),new T.Vector3(...c.center).add(v)).expandByScalar(.00001).containsBox(new T.Box3().setFromObject(o));});
   const stone=d.root.getObjectByName('social:desk-top').material;
   const facts={carcass:body.userData.construction,frontHits:front.length,innerBackDistance:back[0]?.distance,fixings,footCollidersContainModel:contained,stone:{bumpScale:stone.bumpScale,repeat:stone.bumpMap.repeat.toArray(),dataColourSpace:stone.bumpMap.colorSpace},signature:socialSceneSignature(T,d.root)};
   const previous=await import('/__before/js/features/social/social-district.js'),baseline=previous.createDistrict({THREE:T,bakedAO:false});await baseline.ready;
   const a=baseline.root.getObjectByName('social:desk-door').geometry.attributes.uv,b=d.root.getObjectByName('social:desk-door').geometry.attributes.uv;
   const du=b.getX(0)-a.getX(0),dv=b.getY(0)-a.getY(0);let uvScaleDeviation=0;
   for(let i=0;i<a.count;i++)uvScaleDeviation=Math.max(uvScaleDeviation,Math.abs((b.getX(i)-a.getX(i))-du),Math.abs((b.getY(i)-a.getY(i))-dv));
   facts.bevelUV={vertices:a.count,uvScaleDeviation,originOffset:[du,dv]};baseline.dispose();
   d.dispose();d.dispose();
   const hostMap=new T.Texture(),host=new T.MeshStandardMaterial({map:hostMap});let hostDisposals=0;hostMap.addEventListener('dispose',()=>hostDisposals++);host.addEventListener('dispose',()=>hostDisposals++);
   const borrowed=createDistrict({THREE:T,materials:{stone_light:host}});await borrowed.ready;borrowed.dispose();facts.hostDisposals=hostDisposals;facts.hostMapUnchanged=host.map===hostMap;host.dispose();hostMap.dispose();
   const r=__social.renderer,s=__nearfieldScene,c=__social.camera;facts.cycles=[];
   for(let i=0;i<5;i++){const d=createDistrict({THREE:T});await d.ready;s.add(d.root);d.root.traverse(o=>{if(o.isMesh)o.frustumCulled=false;});r.render(s,c);const loaded={...r.info.memory};d.dispose();d.dispose();r.render(s,c);facts.cycles.push({loaded,after:{...r.info.memory},detached:!d.root.parent});}
   return facts;
  });
  const c=report.construction;assert.equal(c.frontHits,0);assert.ok(Math.abs(c.innerBackDistance-.858)<.00001);assert.equal(c.carcass.panelThickness,.022);
  assert.ok(c.bevelUV.uvScaleDeviation<.000001,'UV changes must only translate the metric layout, including bevels');
  assert.equal(c.fixings['nearfield:bench-flush-fixing'],24);assert.equal(c.fixings['nearfield:cleat-head'],24);assert.equal(c.fixings['nearfield:board-anchor'],8);
  assert.equal(c.footCollidersContainModel,true);assert.equal(c.hostDisposals,0);assert.equal(c.hostMapUnchanged,true);
  for(const row of c.cycles){assert.equal(row.detached,true);assert.deepEqual(row.after,c.cycles[0].after);}
  const manifest=JSON.parse(await fs.readFile(path.join(repo,'js/features/social/assets/baked/ao-manifest.json'),'utf8'));assert.equal(manifest.sceneSignature,c.signature);
  const old=JSON.parse(cp.execFileSync('git',['show',before+':js/features/social/assets/baked/ao-manifest.json'],{cwd:repo,encoding:'utf8'}));assert.notEqual(c.signature,old.sceneSignature);
  report.bake={signature:c.signature,previous:old.sceneSignature};
  for(const [file,key]of [[manifest.texture,'textureHash'],[manifest.indirectTexture,'indirectTextureHash']])assert.equal(crypto.createHash('sha256').update(await fs.readFile(path.join(repo,'js/features/social/assets/baked',file))).digest('hex'),manifest[key]);
 }
 report.browser=browser.version();assert.deepEqual(report.errors,[]);
 console.log(JSON.stringify({screens:report.screens.map(s=>({version:s.version,name:s.name,render:s.render})),errors:report.errors}));
})().catch(e=>{report.failure=e.stack;process.exitCode=1;console.error(e);}).finally(async()=>{await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,(process.env.SOCIAL_CAPTURE_PHASE||'both')+'-validation.json'),JSON.stringify(report,null,2));await browser?.close();server.close();});
