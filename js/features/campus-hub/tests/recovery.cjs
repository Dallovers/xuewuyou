const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),checks=[],errors=[],out=path.resolve(__dirname,'../test-results/campus-recovery');await fs.mkdir(out,{recursive:true});
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};page.on('pageerror',e=>errors.push(e.message));
 const snap=()=>page.evaluate(()=>window.__campusHub.snapshot());
 try{
  await page.goto('http://127.0.0.1:4184/js/features/campus-hub/index.html');await page.waitForFunction(()=>window.__campusHub?.snapshot().ready,null,{timeout:120000});
  await page.locator('#walk').click();check('automatic walking avoids the extra whole-campus reflection pass',!(await page.evaluate(()=>window.__campusHub.visuals())).water.reflection);
  const perf=await page.evaluate(()=>new Promise(resolve=>{const times=[];let last=performance.now();function step(now){times.push(now-last);last=now;if(times.length<80)requestAnimationFrame(step);else{times.sort((a,b)=>a-b);resolve({frameMs:{p50:times[40],p95:times[76]},render:window.__campusHub.snapshot().render});}}requestAnimationFrame(step);}));
  await page.selectOption('#quality','high');check('explicit high quality retains the full fountain reflection',(await page.evaluate(()=>window.__campusHub.visuals())).water.reflection);await page.selectOption('#quality','auto');
  check('new arena answering station is reachable after UI recovery',await page.evaluate(()=>window.__campusHub.setPose(40.8,4.7,0)));
  await page.waitForFunction(()=>window.__campusHub.snapshot().nearest==='arena.stage.jia');await page.keyboard.press('KeyE');await page.waitForFunction(()=>window.__campusHub.snapshot().stance==='jia');
  let s=await snap();check('answering station keeps correct world coordinates and opposing NPC',Math.abs(s.pos[0]-40.8)<.01&&Math.abs(s.pos[2]-4.14)<.01&&s.opponent.station==='yi');
  await page.keyboard.down('KeyW');await page.waitForTimeout(300);await page.keyboard.up('KeyW');check('answer stance locks movement until Esc',(await snap()).pos.every((v,i)=>Math.abs(v-s.pos[i])<.001));
  await page.keyboard.press('Escape');check('Esc still exits the new arena stance',!(await snap()).stance);
  check('other arena station is reachable',await page.evaluate(()=>window.__campusHub.setPose(40.8,-.7,Math.PI)));await page.waitForFunction(()=>window.__campusHub.snapshot().nearest==='arena.stage.yi');await page.keyboard.press('KeyE');await page.waitForFunction(()=>window.__campusHub.snapshot().stance==='yi');
  check('NPC changes to the opposite answering station',(await snap()).opponent.station==='jia');
  await page.screenshot({path:path.join(out,'arena-station.png')});await page.locator('#overview').click();check('switching to overview releases answer stance and restores overview water',!(await snap()).stance&&(await page.evaluate(()=>window.__campusHub.visuals())).water.reflection);
  check('no browser errors',errors.length===0);await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,perf,errors},null,2));console.log('Frame interval sample',JSON.stringify(perf));
 }catch(error){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
