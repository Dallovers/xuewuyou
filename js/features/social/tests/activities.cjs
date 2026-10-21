// Walk to each activity and use real keyboard input; no account/server data.
const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const repo=path.resolve(__dirname,'../../../..'),out=path.resolve(process.env.SOCIAL_OUTPUT||path.join(repo,'previews/activities-evidence'));
let browser;const report={errors:[],consoleErrors:[]};
const server=http.createServer(async(req,res)=>{try{const f=path.resolve(repo,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!f.startsWith(repo+path.sep))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream');res.end(await fs.readFile(f));}catch{res.statusCode=404;res.end();}});
(async()=>{
 await fs.mkdir(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,executablePath:process.env.SOCIAL_BROWSER_PATH});
 const p=await browser.newPage({viewport:{width:1536,height:1024},deviceScaleFactor:1});
 p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
 if(process.env.SOCIAL_CDN_CACHE)for(const [url,file]of [['https://unpkg.com/three@0.160.0/build/three.module.js','three-r160-review.module.js'],['https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js','RGBELoader-r160-review.js']])await p.route(url,r=>r.fulfill({path:path.join(process.env.SOCIAL_CDN_CACHE,file),contentType:'text/javascript'}));
 const entry='http://127.0.0.1:'+server.address().port+'/js/features/social/preview.html?mm=35&';
 async function open(params){await p.goto(entry+params);await p.waitForFunction(()=>window.__social?.env.ok);const ready=await p.evaluate(()=>__social.district.ready);assert.equal(ready.bakedAO.ok,true);}
 await open('x=0&z=-5&yaw=-90&pitch=-12');
 const start=await p.evaluate(()=>({...__social.player}));await p.keyboard.down('w');await p.waitForFunction(()=>__social.current?.id==='social.bench.1');await p.keyboard.up('w');
 const standing=await p.evaluate(()=>({...__social.player}));assert.ok(standing.x>start.x+.5);
 await p.keyboard.press('e');await p.waitForFunction(()=>__social.seated&&__social.player.y===1.18&&__social.player.x===3.1);
 const seated=await p.evaluate(()=>({...__social.player}));assert.equal(seated.x,3.1);assert.equal(seated.z,-5);
 await p.keyboard.down('w');await p.waitForTimeout(300);await p.keyboard.up('w');assert.deepEqual(await p.evaluate(()=>({...__social.player})),seated);
 await p.mouse.move(200,500);await p.mouse.down();await p.mouse.move(1240,535);await p.mouse.up();await p.waitForTimeout(550);
 await p.screenshot({path:path.join(out,'bench-seated.png')});
 await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>__social.seated),false);assert.deepEqual(await p.evaluate(()=>({...__social.player})),standing);
 await p.keyboard.press('e');await p.waitForFunction(()=>__social.seated);await p.getByRole('button',{name:'起身 · E / Esc'}).click();assert.deepEqual(await p.evaluate(()=>({...__social.player})),standing);
 await p.keyboard.press('e');await p.waitForFunction(()=>__social.seated);await p.keyboard.press('e');assert.equal(await p.evaluate(()=>__social.seated),false);
 report.seating={start,standing,seated,walking:'W then E',movementPaused:true,escapeRestores:true,buttonRestores:true,eRestores:true};
 report.otherSeats=[];
 for(const [id,z,expectedX]of [['social.bench.2',-1.9,5.9],['social.bench.3',.9,6.3]]){
   await open('x=9&z='+z+'&yaw=90&pitch=-12');await p.keyboard.down('w');await p.waitForFunction(id=>__social.current?.id===id,id);await p.keyboard.up('w');const from=await p.evaluate(()=>({...__social.player}));await p.keyboard.press('e');await p.waitForFunction(x=>__social.seated&&__social.player.x===x&&__social.player.y===1.18,expectedX);await p.keyboard.press('Escape');assert.deepEqual(await p.evaluate(()=>({...__social.player})),from);report.otherSeats.push({id,walking:'W then E',restored:from});
 }

 await open('x=7.8&z=0&yaw=0&pitch=-10');await p.keyboard.down('w');await p.waitForFunction(()=>__social.current?.id==='social.fountain');await p.keyboard.up('w');
 await p.mouse.move(700,500);await p.mouse.down();await p.mouse.move(390,500);await p.mouse.up();
 const signatureBefore=await p.evaluate(async()=>{const T=await import('three'),{socialSceneSignature}=await import('./social-baked-ao.js');return socialSceneSignature(T,__social.district.root);});
 await p.screenshot({path:path.join(out,'fountain-off.png')});
 await p.keyboard.down('e');await p.keyboard.down('e');await p.keyboard.up('e');
 await p.waitForFunction(()=>__social.district.root.getObjectByName('fountain:dynamic-water').visible);
 const first=await p.evaluate(()=>Array.from(__social.district.root.getObjectByName('fountain:jets').geometry.attributes.position.array));await p.waitForTimeout(250);
 const second=await p.evaluate(()=>Array.from(__social.district.root.getObjectByName('fountain:jets').geometry.attributes.position.array));assert.notDeepEqual(first,second);assert.equal(await p.evaluate(()=>__social.panelOpen),false);
 await p.screenshot({path:path.join(out,'fountain-on.png')});
 report.fountain=await p.evaluate(async()=>{const T=await import('three'),{socialSceneSignature}=await import('./social-baked-ao.js');return {standing:{...__social.player},render:{...__social.renderer.info.render},memory:{...__social.renderer.info.memory},particles:__social.district.root.getObjectByName('fountain:jets').geometry.attributes.position.count,prompt:__social.current.prompt,staticSignature:socialSceneSignature(T,__social.district.root),heldEDoesNotRetoggle:true};});
 assert.equal(report.fountain.staticSignature,signatureBefore);
 report.fountain.bakeCheck=await p.evaluate(async()=>{const T=await import('three'),{createDistrict}=await import('./social-district.js'),{socialSceneSignature}=await import('./social-baked-ao.js');const d=createDistrict({THREE:T,bakedAO:false});const before=socialSceneSignature(T,d.root);d.interactions.find(x=>x.id==='social.fountain').action();d.update(.1);const after=socialSceneSignature(T,d.root);const expected=(await(await fetch('./assets/baked/ao-manifest.json')).json()).sceneSignature;d.dispose();await d.ready;return {before,after,expected};});
 assert.equal(report.fountain.bakeCheck.before,report.fountain.bakeCheck.expected);assert.equal(report.fountain.bakeCheck.after,report.fountain.bakeCheck.expected);assert.equal(report.fountain.prompt,'按 E 关闭水流');
 await p.keyboard.press('e');assert.equal(await p.evaluate(()=>__social.district.root.getObjectByName('fountain:dynamic-water').visible),false);
 await p.keyboard.press('e');assert.equal(await p.evaluate(()=>__social.district.root.getObjectByName('fountain:dynamic-water').visible),true);
 const sample=p.evaluate(()=>new Promise(resolve=>{const times=[],start=performance.now();let last=start;function tick(now){times.push(now-last);last=now;if(now-start<1600)requestAnimationFrame(tick);else{times.shift();times.sort((a,b)=>a-b);resolve({samples:times.length,p50:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)],max:times.at(-1)});}}requestAnimationFrame(tick);}));
 const movementStart=await p.evaluate(()=>({...__social.player}));await p.keyboard.down('d');await p.waitForTimeout(800);await p.keyboard.up('d');await p.keyboard.down('a');await p.waitForTimeout(800);await p.keyboard.up('a');
 report.waterOnMoving={...await sample,from:movementStart,to:await p.evaluate(()=>({...__social.player})),route:'D then A, fountain on'};
 report.cycles=await p.evaluate(async()=>{
   const T=await import('three'),{createDistrict}=await import('./social-district.js');const r=__social.renderer,c=__social.camera,s=new T.Scene(),rows=[];
   for(let i=0;i<5;i++){const d=createDistrict({THREE:T});const fountain=d.interactions.find(x=>x.id==='social.fountain');fountain.action();await d.ready;s.add(d.root);d.root.traverse(o=>{if(o.isMesh||o.isPoints||o.isLine)o.frustumCulled=false;});d.update(.1);r.render(s,c);const loaded={...r.info.memory};d.dispose();d.dispose();d.update(.1);r.render(s,c);rows.push({loaded,after:{...r.info.memory},staleAction:fountain.action(),detached:!d.root.parent});}return rows;
 });
 for(const row of report.cycles){assert.deepEqual(row.after,report.cycles[0].after);assert.equal(row.detached,true);assert.equal(row.staleAction.ok,false);}
 report.browser=await browser.version();report.conditions={viewport:[1536,1024],dpr:1,eyeStanding:1.6,eyeSeated:1.18,mm:35,exposure:.86,headless:true};
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.consoleErrors,[]);console.log(JSON.stringify(report));
})().catch(e=>{report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(async()=>{await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'validation.json'),JSON.stringify(report,null,2));await browser?.close();server.close();});
