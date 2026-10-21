// Real browser checks for the new atlas, its ownership and failure/abort paths.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.LIBRARY_URL||'http://127.0.0.1:5096';
const out=path.resolve(process.env.LIBRARY_OUTPUT||path.join(__dirname,'../validation/review-v7'));
const ready=p=>p.waitForFunction(()=>window.__library?.snapshot().ready,null,{timeout:60000});
const pause=(p,ms=700)=>p.waitForTimeout(ms);
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 // Full Chromium supports BFCache; Playwright's default headless shell does not.
 // Remove the default BFCache-disabling flag and wait for commit on restored pages.
 const browser=await chromium.launch({headless:true,channel:'chromium',ignoreDefaultArgs:['--disable-back-forward-cache'],args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const report={date:new Date().toISOString(),base,checks:[],errors:[],consoleErrors:[],failedResources:[]};
 const pass=(name,data)=>report.checks.push({name,passed:true,data});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1});
  const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
  p.on('response',r=>{if(r.status()>=400)report.failedResources.push({url:r.url(),status:r.status()});});
  await p.goto(base+'/examples/library-3d/?view=sample');await ready(p);
  report.initial=await p.evaluate(()=>__library.bake());assert.equal(report.initial.ready,true);assert.equal(report.initial.enabled,true);
  assert.equal(report.initial.receivers,47);assert.equal(report.initial.meshes,50);assert.equal(report.initial.materials,8);
  assert.deepEqual(report.initial.atlasSize,[2048,2048]);assert.equal(report.initial.atlasChannel,1);assert.equal(report.initial.irradianceScale,Math.PI);
  pass('实际加载 47 个 UV1 接收面及线性 HDR atlas',report.initial);
  await p.locator('#quality').selectOption('high');
  for(const [view,name] of [['sample','overall'],['chair','chair-close']]){
   await p.evaluate(v=>__library.setView(v),view);
   for(const enabled of [false,true]){
    assert(await p.evaluate(v=>__library.reviewBake(v),enabled));await pause(p);
    const graphics=await p.evaluate(()=>__library.performance());assert.equal(graphics.exposure,1);assert.equal(graphics.quality,'high');
    await p.screenshot({path:path.join(out,(enabled?'baked-':'legacy-')+name+'.png')});
   }
  }
  pass('同页同机位、相同曝光与画质的真实前后对比');
  await p.evaluate(()=>__library.reviewBake(false));const legacy=await p.evaluate(()=>__library.modelStats());
  await p.evaluate(()=>__library.reviewBake(true));const baked=await p.evaluate(()=>__library.modelStats());
  assert.equal(legacy.meshes,102);assert.equal(baked.meshes,123);assert.equal(baked.seats,8);assert.equal(baked.shelves,4);assert.equal(baked.instances,legacy.instances);
  pass('原场景回切、八座书架与树实例数量保持',{legacy,baked});
  const seats=await p.evaluate(()=>__library.seats());
  for(let cycle=0;cycle<3;cycle++)for(const seat of seats){
   assert(await p.evaluate(s=>__library.setPose(s.approach.x,s.approach.z),seat));await p.locator('#world').focus();
   await p.keyboard.press('KeyE');assert.equal(await p.evaluate(()=>__library.snapshot().seated),seat.id);
   await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>{const pos=__library.snapshot().pos;return __library.blocked(pos[0],pos[2]);}),false);
  }
  pass('八座各三次入座／站起，24 次均落在无碰撞通道');
  await p.evaluate(()=>__library.setView('sample'));await p.locator('#quality').selectOption('fluid');await pause(p);
  await p.setViewportSize({width:390,height:844});await pause(p);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.screenshot({path:path.join(out,'baked-narrow.png')});pass('流畅画质及 390×844 窄屏');
  const frames=await p.evaluate(()=>{const frames=__library.snapshot().frames;__library.dispose();return frames;});await pause(p,350);
  assert.equal(await p.evaluate(()=>__library.snapshot().frames),frames);
  const disposed=await p.evaluate(()=>__library.bake());assert.deepEqual(disposed.released,{geometries:50,materials:8,textures:1});
  for(let i=0;i<2;i++){await p.evaluate(()=>__library.dispose());await pause(p,250);assert.equal(await p.evaluate(()=>__library.snapshot().frames),frames);assert.deepEqual((await p.evaluate(()=>__library.bake())).released,disposed.released);}
  pass('停止渲染，私有几何／材质／atlas 各释放一次，重复释放幂等',disposed);
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.consoleErrors,[]);assert.deepEqual(report.failedResources,[]);
  await context.close();

  const missing=await browser.newPage();await missing.route('**/assets/r1-lighting/*.exr',r=>r.fulfill({status:503,body:'Intentional acceptance-only atlas failure'}));
  await missing.goto(base+'/examples/library-3d/?view=sample');await ready(missing);
  const failed=await missing.evaluate(()=>({bake:__library.bake(),model:__library.modelStats()}));
  assert.equal(failed.bake.ready,false);assert.equal(failed.bake.enabled,false);assert.match(failed.bake.error,/503/);assert.equal(failed.model.meshes,102);
  await missing.locator('#catalog').click();await missing.locator('#library-dialog').waitFor({state:'visible'});
  pass('atlas 请求失败时恢复完整实时场景，目录仍可打开',failed.bake);await missing.close();

  const assets=path.join(__dirname,'../assets/r1-lighting'),config=JSON.parse(fs.readFileSync(path.join(assets,'r1-bake.json')));
  const original=fs.readFileSync(path.join(assets,config.geometry));const n=original.readUInt32LE(12),doc=JSON.parse(original.subarray(20,20+n));
  delete doc.meshes[0].primitives[0].attributes.TEXCOORD_1;
  let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
  const bin=original.subarray(20+n),head=Buffer.alloc(20);head.writeUInt32LE(0x46546c67,0);head.writeUInt32LE(2,4);head.writeUInt32LE(20+json.length+bin.length,8);head.writeUInt32LE(json.length,12);head.writeUInt32LE(0x4e4f534a,16);
  const invalid=await browser.newPage();await invalid.route('**/assets/r1-lighting/*.glb',r=>r.fulfill({contentType:'model/gltf-binary',body:Buffer.concat([head,json,bin])}));
  await invalid.goto(base+'/examples/library-3d/?view=sample');await ready(invalid);
  const rollback=await invalid.evaluate(()=>({bake:__library.bake(),model:__library.modelStats()}));assert.match(rollback.bake.error,/UV1/);assert.equal(rollback.model.meshes,102);
  assert.equal(rollback.bake.released.geometries,50);assert.equal(rollback.bake.released.textures,1);
  pass('UV1 缺失时回滚且释放已解析资源',rollback.bake);await invalid.close();

  let release,held=false;const barrier=new Promise(resolve=>release=resolve);const pending=await browser.newPage();
  await pending.route('**/assets/r1-lighting/*.exr',async r=>{held=true;await barrier;await r.abort().catch(()=>{});});
  await pending.goto(base+'/examples/library-3d/?view=sample',{waitUntil:'domcontentloaded'});
  await pending.waitForFunction(()=>window.__library?.bake(),null,{timeout:60000});
  for(let i=0;i<100&&!held;i++)await pause(pending,50);assert(held);
  await pending.evaluate(()=>__library.dispose());release();await pause(pending,350);
  const cancelled=await pending.evaluate(()=>({bake:__library.bake(),frames:__library.snapshot().frames}));assert.equal(cancelled.bake.disposed,true);assert.equal(cancelled.frames,0);
  assert.deepEqual(cancelled.bake.released,{geometries:0,materials:0,textures:0});pass('加载中离页／取消不安装迟到资源',cancelled);await pending.close();
  const backend=process.env.LIBRARY_BACKEND||'http://127.0.0.1:5097';
  const actualHost=await browser.newPage();await actualHost.addInitScript(backend=>{window.WG_DEPLOY={apiBase:backend};window.__r1PageToken=Math.random().toString(36);window.__r1PageShows=[];addEventListener('pageshow',e=>window.__r1PageShows.push({persisted:e.persisted}));},backend);
  await actualHost.goto(backend+'/examples/library-3d/?view=sample');await ready(actualHost);
  assert.equal(await actualHost.evaluate(()=>__library.bake().enabled),true);
  for(const route of ['/examples/library-3d/tools/bake-r1.py','/examples/library-3d/Library_Editable.blend'])assert.equal((await fetch(backend+route)).status,403);
  pass('实际后端入口加载新 atlas，烘焙源码与 Blender 文件保持禁止访问');
  const beforeBack=await actualHost.evaluate(()=>({token:window.__r1PageToken,frames:__library.snapshot().frames}));
  await actualHost.goto(backend+'/index.html#wenku');await actualHost.goBack({waitUntil:'commit'});await ready(actualHost);await pause(actualHost,400);
  const afterBack=await actualHost.evaluate(()=>({token:window.__r1PageToken,frames:__library.snapshot().frames,shows:window.__r1PageShows,bake:__library.bake()}));
  assert.equal(afterBack.token,beforeBack.token);assert(afterBack.shows.some(s=>s.persisted));assert(afterBack.frames>beforeBack.frames);assert.equal(afterBack.bake.enabled,true);assert.equal(afterBack.bake.disposed,false);
  pass('实际主站往返由 BFCache 恢复同一 atlas 和渲染循环',{before:beforeBack,after:afterBack});await actualHost.close();
  report.passed=true;
 }catch(e){report.passed=false;report.failure=e.stack;throw e;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'r1-lighting-results.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify({passed:report.passed,checks:report.checks.length}));
})().catch(e=>{console.error(e);process.exitCode=1;});
