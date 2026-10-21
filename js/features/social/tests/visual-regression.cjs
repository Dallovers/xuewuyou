/* Run with NODE_PATH pointing to a Playwright installation. No backend or user data. */
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const repo = path.resolve(__dirname, '../../../..');
const out = path.resolve(process.env.SOCIAL_OUTPUT || path.join(repo, '.tmp/social-visual'));
const cache = process.env.SOCIAL_CDN_CACHE;
const oldHead = 'b1da6e147310ca68b1d9c73669c7525ee2607c05';
let browser;
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png'};
const server = http.createServer(async(req,res) => {
  try {
    const url = new URL(req.url,'http://localhost');
    const file = path.resolve(repo,'.'+decodeURIComponent(url.pathname));
    if(!file.startsWith(repo+path.sep)) throw Error('outside workspace');
    let bytes = await fs.readFile(file);
    if(url.pathname.endsWith('/social-district.js') && url.searchParams.has('previous')) {
      bytes = cp.execFileSync('git',['show',oldHead+':js/features/social/social-district.js'],{cwd:repo});
    }
    if(url.pathname.endsWith('/preview.html')) {
      let html=bytes.toString();
      if(url.searchParams.has('previous')) html=html.replace("import('./social-district.js')","import('./social-district.js?previous=1')");
      html=html.replace('/* 离开页面时清理','window.__audit={renderer,scene,camera,keys,previewRendering};\n/* 离开页面时清理');
      bytes=Buffer.from(html);
    }
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(bytes);
  } catch { res.writeHead(404);res.end(); }
});
(async()=>{
  await fs.mkdir(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,...(process.env.SOCIAL_BROWSER_PATH?{executablePath:process.env.SOCIAL_BROWSER_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1536,height:1024},deviceScaleFactor:1});
  const errors=[],consoleErrors=[],network=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  page.on('requestfailed',r=>network.push({url:r.url(),error:r.failure()?.errorText}));
  if(cache) for(const [url,file] of [
    ['https://unpkg.com/three@0.160.0/build/three.module.js','three-r160-review.module.js'],
    ['https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js','RGBELoader-r160-review.js'],
  ]) await page.route(url,r=>r.fulfill({path:path.join(cache,file),contentType:'text/javascript'}));
  const entry=origin+'/js/features/social/preview.html';
  async function open(params) {
    await page.goto(entry+'?mm=35&hud=0&'+params);
    await page.waitForFunction(()=>window.__audit&&window.__social);
    const ready=await page.evaluate(()=>__social.district.ready);
    if(!params.includes('previous=1'))assert.equal(ready.bakedAO?.ok,true,JSON.stringify(ready.bakedAO));
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(()=>__social.env.ok),true,'HDR must load');
  }
  const views={A1:'x=-3.8&z=-1.2&yaw=118.6&pitch=-11',A2:'x=.5&z=6&yaw=47.7&pitch=0',A3:'x=-7.2&z=6.2&yaw=0&pitch=0',panorama:'x=0&z=16&yaw=0&pitch=-5'};
  const screens=[];
  for(const version of ['before','after','final']) for(const [name,params]of Object.entries(views)) {
    await open(params+(version==='before'?'&previous=1&ao=0':version==='after'?'&ao=0':''));
    await page.screenshot({path:path.join(out,version+'-'+name+'.png')});
    screens.push({version,name,...await page.evaluate(()=>({render:{...__audit.renderer.info.render},memory:{...__audit.renderer.info.memory},exposure:__audit.renderer.toneMappingExposure,eye:__social.player.y,fov:__social.fov}))});
  }
  await open('x=-3.8&z=3.5&yaw=48&pitch=2');await page.screenshot({path:path.join(out,'final-eye.png')});
  await open('x=-3.8&z=-6&h=4.3&yaw=146&pitch=-12');
  await page.evaluate(()=>{
    for(const o of __social.district.root.children) if(['pavilion:roof-panel','pavilion:gable-flashing','pavilion:eave-drip','pavilion:standing-seam','pavilion:ridge-cap'].includes(o.name))o.visible=false;
    __audit.scene.traverse(o=>{if(o.isDirectionalLight&&o.castShadow)o.shadow.needsUpdate=true;});
  });
  await page.waitForTimeout(100);await page.screenshot({path:path.join(out,'roof-cutaway.png')});
  await open('x=-7.2&z=6.2&yaw=0&pitch=0');
  const pipelineCycles=await page.evaluate(async()=>{
    const { createSocialPreviewRendering } = await import('./preview-rendering.js');
    const {renderer,scene,camera,previewRendering}=__audit,cycles=[];
    for(let i=0;i<3;i++) {
      const p=createSocialPreviewRendering(renderer,scene,camera);p.resize(640,480);p.render();
      const loaded={...renderer.info.memory};p.dispose();p.dispose();previewRendering.render();
      cycles.push({loaded,after:{...renderer.info.memory}});
    }
    return cycles;
  });
  assert.ok(pipelineCycles.every(c=>c.after.textures===pipelineCycles[0].after.textures&&c.after.geometries===pipelineCycles[0].after.geometries),'preview pipeline must release its resources');
  const audit=await page.evaluate(async()=>{
    const T=await import('three'),{createDistrict}=await import('./social-district.js');
    const calls=[],d=createDistrict({THREE:T,openFeature:(...args)=>{calls.push(args);return {ok:true};}});
    await d.ready;d.root.updateMatrixWorld(true);
    const dimensions=d.root.userData.roofDimensions,boxes=[],invalid=[],geometries=new Set();
    d.root.traverse(o=>{
      if(!o.isMesh)return;
      for(const name of ['position','normal','uv']) if(o.geometry.attributes[name]&&Array.from(o.geometry.attributes[name].array).some(v=>!Number.isFinite(v)))invalid.push(o.name+':'+name);
      geometries.add(o.geometry);
      if(o.name.startsWith('pavilion:')||o.name.startsWith('bench:')) {
        if(o.isInstancedMesh) for(let i=0;i<o.count;i++) {const m=new T.Matrix4();o.getMatrixAt(i,m);m.premultiply(o.matrixWorld);const b=new T.Box3().setFromBufferAttribute(o.geometry.attributes.position).applyMatrix4(m);boxes.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});}
        else {const b=new T.Box3().setFromObject(o);boxes.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});}
      }
    });
    const deck=boxes.find(b=>b.name==='pavilion:bearing-deck');
    const connections={beamToDeck:Math.max(...boxes.filter(b=>b.name==='pavilion:beam-cross').map(b=>Math.abs(b.max[1]-deck.min[1]))),rafterToDeck:Math.max(...boxes.filter(b=>b.name==='pavilion:tapered-rafter').map(b=>Math.abs(b.min[1]-deck.max[1]))),soffitToDeck:Math.max(...boxes.filter(b=>b.name==='pavilion:soffit-batten').map(b=>Math.abs(b.max[1]-deck.min[1])))};
    let roofGap=0;
    d.root.traverse(o=>{if(o.name!=='pavilion:tapered-rafter')return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++) {const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.y>dimensions.deckTop+.001)roofGap=Math.max(roofGap,Math.abs(v.y-(dimensions.eaveUnderside+.16*(1-Math.abs(v.x+7.2)/dimensions.half))));}});
    connections.rafterToRoof=roofGap;
    const bench=d.root.children.find(o=>o.name==='social:bench');bench.updateMatrixWorld(true);
    const seats=bench.children.filter(o=>o.name==='bench:seat').map(o=>new T.Box3().setFromObject(o));
    const rails=bench.children.filter(o=>o.name==='bench:rail').map(o=>new T.Box3().setFromObject(o));
    connections.benchGap=Math.min(...seats.map(b=>b.min.y))-Math.max(...rails.map(b=>b.max.y));
    d.interactions.filter(i=>i.id!=='social.fountain').forEach(i=>i.action());
    const colliders=d.colliders;d.dispose();d.dispose();
    const {attachSocialAO}=await import('./social-baked-ao.js');
    const altered=createDistrict({THREE:T,bakedAO:false});await altered.ready;
    altered.root.getObjectByName('pavilion:column').position.x+=.01;
    const rejectedBake=await attachSocialAO(T,altered.root,{disposed:false,ownTexture(){throw Error('mismatched atlas loaded');}});altered.dispose();
    const beforeAO=createDistrict({THREE:T,bakedAO:false});await beforeAO.ready;
    let resolveImage,started;const queued=new Promise(r=>started=r);
    class AODelayedLoader {loadAsync(){return new Promise(r=>{resolveImage=r;started();});}}
    const atlasOwner={disposed:false,ownTexture(t){if(this.disposed){t.dispose();return null;}throw Error('unexpected early write');}};
    const pendingAO=attachSocialAO({...T,TextureLoader:AODelayedLoader},beforeAO.root,atlasOwner);await queued;
    const oldGeometry=beforeAO.root.getObjectByName('social:desk-body').geometry;
    beforeAO.dispose();atlasOwner.disposed=true;
    let atlasDisposals=0;const lateAtlas=new T.Texture();lateAtlas.addEventListener('dispose',()=>atlasDisposals++);resolveImage(lateAtlas);
    const lateAO={result:await pendingAO,disposals:atlasDisposals,geometryUnchanged:beforeAO.root.getObjectByName('social:desk-body').geometry===oldGeometry};
    const {renderer,scene,camera}=__audit;const cycles=[];
    for(let i=0;i<5;i++) {
      const x=createDistrict({THREE:T});x.root.traverse(o=>{if(o.isMesh)o.frustumCulled=false;});scene.add(x.root);await x.ready;
      renderer.render(scene,camera);const loaded={...renderer.info.memory};x.dispose();x.dispose();renderer.render(scene,camera);
      cycles.push({loaded,after:{...renderer.info.memory},detached:!x.root.parent});
    }
    const loaded=[],pending=[];
    class LateLoader {loadAsync(){return new Promise(resolve=>pending.push(()=>{const tex=new T.Texture();const record={disposals:0};tex.addEventListener('dispose',()=>record.disposals++);loaded.push(record);resolve(tex);}));}}
    const late=createDistrict({THREE:{...T,TextureLoader:LateLoader}});const material=late.root.getObjectByName('social:desk-body').material;
    const oldMap=material.map;late.dispose();pending.forEach(f=>f());const lateReady=await late.ready;
    const lateResult={unchanged:material.map===oldMap,ready:lateReady,textures:loaded};
    const hostMap=new T.Texture(),hostMat=new T.MeshStandardMaterial({map:hostMap,color:0xabcdef});let hostMaterialDisposes=0,hostTextureDisposes=0;
    hostMat.addEventListener('dispose',()=>hostMaterialDisposes++);hostMap.addEventListener('dispose',()=>hostTextureDisposes++);
    const borrowed=createDistrict({THREE:T,materials:{stone_light:hostMat}});await borrowed.ready;borrowed.dispose();
    const shared={hostMaterialDisposes,hostTextureDisposes,mapUnchanged:hostMat.map===hostMap,color:hostMat.color.getHex()};hostMat.dispose();hostMap.dispose();
    return {rejectedBake,lateAO,dimensions,connections,boxes,invalid,uniqueGeometry:geometries.size,calls,colliders,cycles,late:lateResult,shared};
  });
  await fs.writeFile(path.join(out,'diagnostic-audit.json'),JSON.stringify(audit,null,2));
  assert.equal(audit.invalid.length,0);
  assert.equal(audit.rejectedBake.reason,'scene-mismatch');
  assert.ok(audit.lateAO.geometryUnchanged&&audit.lateAO.disposals===1&&audit.lateAO.result.disposed);
  for(const [name,gap]of Object.entries(audit.connections))assert.ok(Math.abs(gap)<.00001,name+': '+gap);
  assert.ok(audit.cycles.every(c=>c.detached&&c.after.geometries===audit.cycles[0].after.geometries&&c.after.textures===audit.cycles[0].after.textures),'GPU allocations must return to baseline');
  assert.ok(audit.late.unchanged&&audit.late.textures.every(t=>t.disposals===1),'late textures must dispose once without writing');
  assert.equal(audit.shared.hostMaterialDisposes,0);assert.equal(audit.shared.hostTextureDisposes,0);assert.ok(audit.shared.mapUnchanged);
  await open('x=0&z=7.6&yaw=0&pitch=0');
  const from=await page.evaluate(()=>({...__social.player}));
  await page.keyboard.down('KeyW');await page.waitForTimeout(750);await page.keyboard.up('KeyW');
  const to=await page.evaluate(()=>({...__social.player}));assert.ok(to.z<from.z-1,'main road walking must advance');
  await open('x=-4.4&z=.65&yaw=90&pitch=-4');
  await page.keyboard.down('KeyW');await page.waitForTimeout(1400);await page.keyboard.up('KeyW');
  const deskStop=await page.evaluate(()=>({...__social.player}));assert.ok(deskStop.x>=-5.851&&deskStop.x<=-5.80,'desk collider should stop the player');
  await page.keyboard.press('KeyE');await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>__social.panelOpen));
  const panelBefore=await page.evaluate(()=>({...__social.player}));await page.keyboard.down('KeyW');await page.waitForTimeout(150);await page.keyboard.up('KeyW');
  const panelAfter=await page.evaluate(()=>({...__social.player}));assert.deepEqual(panelBefore,panelAfter);await page.keyboard.press('Escape');
  assert.equal(await page.locator('#hint').evaluate(e=>e.classList.contains('is-on')),true);
  // Human-visible moving frame timings, but headless: do not label this device FPS.
  await open('x=0&z=7.6&yaw=0&pitch=0');await page.keyboard.down('KeyW');
  const moving=await page.evaluate(()=>new Promise(resolve=>{const times=[],start=performance.now();let last=start;function tick(now){times.push(now-last);last=now;if(now-start<2000)requestAnimationFrame(tick);else {times.shift();times.sort((a,b)=>a-b);resolve({samples:times.length,p50:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)],max:times.at(-1),seconds:(now-start)/1000});}}requestAnimationFrame(tick);}));await page.keyboard.up('KeyW');
  assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(network,[]);
  const gpu=await page.evaluate(()=>{const g=__audit.renderer.getContext(),e=g.getExtension('WEBGL_debug_renderer_info');return e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):'unavailable';});
  const result={gpu,base:oldHead,browser:await browser.version(),conditions:{headless:true,viewport:[1536,1024],dpr:1,exposure:.86,mm:35,eye:1.6},screens,audit,pipelineCycles,walking:{from,to,deskStop,panelPauses:true,escapeRestoresHint:true},movingHeadless: moving,errors,consoleErrors,network};
  await fs.writeFile(path.join(out,'validation-v2.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({out,connections:audit.connections,cycles:audit.cycles,moving,errors}));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
