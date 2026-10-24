const {createRequire}=require('node:module');
const path=require('node:path'),http=require('node:http');
const requireProject=createRequire(path.resolve(__dirname,'../../js/features/campus-hub/package.json'));
const {chromium}=requireProject('playwright');
const fs=require('node:fs/promises'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/characters/validation');
 const base=process.env.CHARACTER_PREVIEW_URL||'http://127.0.0.1:4197';
 await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[],warnings=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(['warning','error'].includes(m.type()))warnings.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 page.on('requestfailed',r=>errors.push(r.url()+' '+r.failure()?.errorText));
 page.on('request',r=>{if(/\.(glb|gltf|vrm)(\?|$)/.test(r.url()))requests.push(r.url());});
 let proxy;
 try{
  await page.goto(base+'/examples/character-preview/');
  await page.waitForFunction(()=>!!window.__characterPreview);
  assert.equal(requests.length,0,'No models requested on first screen');
  const allEntries=await page.evaluate(()=>window.__characterPreview.entries());
  let entries=allEntries;
  assert.equal(await page.locator('#batch').inputValue(),'wave3-anime','Anime is the default batch');
  assert(!allEntries.some(e=>e.batch==='wave2-mechs'),'Rejected mechs removed from active catalog');
  await page.selectOption('#batch','wave3-anime');
  assert.equal(await page.locator('#character option').count(),entries.filter(e=>e.batch==='wave3-anime').length,'Anime batch filter');
  assert.equal(requests.length,0,'Filtering does not request models');
  await page.selectOption('#batch','all');
  const requested=process.env.CHARACTER_IDS?.split(',');
  if(requested){for(const id of requested)assert(allEntries.some(e=>e.id===id),'Unknown requested ID '+id);entries=entries.filter(e=>requested.includes(e.id));}
  assert(entries.length>0,'At least one model must be validated');
  const rows=[];
  for(const entry of entries){
   const before=requests.length;
   await page.evaluate(id=>window.__characterPreview.load(id),entry.id);
   const displayed=await page.evaluate(()=>window.__characterPreview.step(0));
   assert(displayed.ready&&displayed.triangles&&displayed.bounds.every(v=>Number.isFinite(v)&&v>0),'Model rendered '+entry.id);
   let staticPoseChecks=null;
   if(entry.format?.startsWith('VRM')){
    assert.equal(displayed.vrmVersion,'0','VRM0 parsed with existing loader');
    assert.equal(displayed.vrmHumanoidBoneCount,54,'VRM normalized humanoid parsed');
    assert.equal(displayed.nativeAnimationCount,0,'No native animations claimed');
    assert.equal(await page.locator('#clip').isDisabled(),true,'No invented animation options');
    await page.selectOption('#pose','t');
    const t=await page.evaluate(()=>{window.__characterPreview.step(0);return window.__characterPreview.probe();});
    await page.selectOption('#pose','relaxed');
    const relaxed=await page.evaluate(()=>{window.__characterPreview.step(0);return window.__characterPreview.probe();});
    staticPoseChecks={scope:'static presentation only, not animation',finite:t.every(Number.isFinite)&&relaxed.every(Number.isFinite),changed:relaxed.some((n,i)=>Math.abs(n-t[i])>1e-6)};
    assert(staticPoseChecks.finite&&staticPoseChecks.changed,'VRM presentation poses');
   }
   const checks=[];
   for(const clip of displayed.animations){
    const result=await page.evaluate(name=>{
     const p=window.__characterPreview;p.play(name);p.step(0);
     const a=p.probe();p.step(Math.min(.37,p.snapshot().animations.find(c=>c.name===name).duration*.37));const b=p.probe();
     return{changed:b.some((n,i)=>Math.abs(n-a[i])>1e-6),finite:b.every(Number.isFinite),nodeTransformValues:b.length};
    },clip.name);
    assert(result.finite,'Finite animation '+entry.id+' '+clip.name);checks.push({name:clip.name,...result});
   }
   const idle=displayed.animations.find(c=>c.name==='Idle'||c.name==='idle')||displayed.animations.find(c=>/idle/i.test(c.name))||displayed.animations[0];
   if(idle)await page.evaluate(n=>{window.__characterPreview.play(n);window.__characterPreview.step(.2);},idle.name);
   await page.screenshot({path:path.join(out,entry.id+'.png')});
   if(entry.id==='fox')assert.match(await page.locator('#credit').textContent(),/tomkranis.*AsoboStudio.*scurest/,'Fox credits visible');
   assert.equal(requests.length-before,1,'Exactly one model request per selected entry');
   rows.push({id:entry.id,status:'可显示',campusActionsVerified:false,displayed,staticPoseChecks,animationScope:checks.length?'bundled single-point sampling':'no native animations supplied',clipChecks:checks,modelRequests:requests.length-before});
   console.log('PASS',entry.id,checks.length,'clips',checks.filter(c=>c.changed).length,'changed');
  }
  const beforeBatchPage=requests.length;
  await page.goto(base+'/examples/character-preview/?batch=wave3-anime');
  await page.waitForFunction(()=>!!window.__characterPreview);
  assert.equal(await page.locator('#batch').inputValue(),'wave3-anime','Direct batch link');
  assert.equal(await page.locator('#character option').count(),allEntries.filter(e=>e.batch==='wave3-anime').length,'Direct link lists anime batch');
  assert.equal(requests.length,beforeBatchPage,'Direct batch link does not autoload');
  await page.selectOption('#batch','all');
  await page.goto(base+'/examples/character-preview/?batch=wave2-mechs');
  await page.waitForFunction(()=>!!window.__characterPreview);
  assert.equal(await page.locator('#batch').inputValue(),'wave3-anime','Old mech bookmark falls back to anime');
  assert.equal(requests.length,beforeBatchPage,'Old bookmark does not request mechs');
  await page.selectOption('#batch','all');
  const lifecycle=[];
  for(let i=0;i<3;i++){
   await page.evaluate(()=>window.__characterPreview.load('kaykit-knight'));
   await page.evaluate(()=>window.__characterPreview.step(.1));
   lifecycle.push((await page.evaluate(()=>window.__characterPreview.snapshot())).memory);
  }
  assert(lifecycle.every(m=>m.geometries===lifecycle[0].geometries&&m.textures===lifecycle[0].textures),'Stable GPU counts over three same-model reloads');
  const vrmLifecycle=[];
  for(let i=0;i<3;i++){
   await page.evaluate(()=>window.__characterPreview.load('vroid-vita'));
   await page.evaluate(()=>window.__characterPreview.step(.1));
   vrmLifecycle.push((await page.evaluate(()=>window.__characterPreview.snapshot())).memory);
  }
  assert(vrmLifecycle.every(m=>m.geometries===vrmLifecycle[0].geometries&&m.textures===vrmLifecycle[0].textures),'Stable VRM GPU counts across reloads');
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile no horizontal overflow');
  await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
  proxy=http.createServer((req,res)=>{
   const target=new URL(req.url.replace(/^\/xuewuyou(?=\/)/,''),base);
   const upstream=http.get(target,r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});
   upstream.on('error',()=>{res.writeHead(502);res.end();});
  });
  await new Promise(r=>proxy.listen(0,'127.0.0.1',r));
  await page.goto('http://127.0.0.1:'+proxy.address().port+'/xuewuyou/examples/character-preview/');
  await page.waitForFunction(()=>window.__characterPreview);
  await page.evaluate(()=>window.__characterPreview.load('kenney-ghost'));
  assert((await page.evaluate(()=>window.__characterPreview.step(.1))).ready,'Pages prefix supports external PNG');
  await page.evaluate(()=>window.__characterPreview.load('vroid-vita'));
  assert((await page.evaluate(()=>window.__characterPreview.step(0))).vrmVersion==='0','Pages prefix supports VRM MToon');
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>window.__characterPreview);
  await page.evaluate(()=>window.__characterPreview.load('kaykit-mage'));
  assert.equal(await page.locator('#pause').textContent(),'继续','Reduced motion starts paused');
  const report={date:'2026-10-24',passed:errors.length===0&&warnings.length===0,engine:'Three.js 0.170.0 GLTFLoader + three-vrm 3.3.3 / Edge headless WebGL',firstScreenModelRequests:0,batchFilterVerified:true,batchDirectLinkVerified:true,lifecycleGpuCounts:lifecycle,vrmLifecycleGpuCounts:vrmLifecycle,staticPoseScope:'runtime presentation only; not native animation or campus action integration',rejectedMechsExcluded:true,mobileNoOverflow:true,pagesPrefixVerified:true,reducedMotionVerified:true,errors,warnings,rows};
  const reportName=process.env.CHARACTER_REPORT||(requested?'filtered-browser.json':'browser.json');
  assert(/^[a-zA-Z0-9_-]+\.json$/.test(reportName),'Report must be a JSON filename');
  await fs.writeFile(path.join(out,reportName),JSON.stringify(report,null,2));
  assert(report.passed,JSON.stringify({errors,warnings}));
 }finally{await browser.close();if(proxy){proxy.closeAllConnections();await new Promise(r=>proxy.close(r));}}
})().catch(e=>{console.error(e);process.exitCode=1;});
