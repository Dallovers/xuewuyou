const {chromium}=require('playwright');
const fs=require('node:fs/promises');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const out=path.resolve(__dirname,'../test-results/photo-v3');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[],checks=[],memory=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,500));});page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/'))failed.push({url:r.url(),status:r.status()});});
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 const state=()=>page.evaluate(()=>window.__campusHub.visuals());
 async function quality(value){await page.selectOption('#quality',value);await page.waitForTimeout(550);}
 try{
  await page.goto('http://127.0.0.1:4184/js/features/campus-hub/index.html');await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:120000});
  await page.evaluate(()=>window.__campusHub.setPose(5.2,13.5,-.25));await quality('high');
  await page.waitForFunction(()=>window.__campusHub.visuals().water.reflectionFrames>0);
  let s=await state();check('high quality has half-resolution AO and 768px planar reflection',s.contactAO&&s.aoScale===.5&&s.water.reflection&&s.water.size===768);
  check('near shadow map covers 52m instead of whole campus',s.shadowSpan===52);
  await page.screenshot({path:path.join(out,'quality-high.png')});
  await quality('fluid');s=await state();check('fluid quality disables reflection and frees AO render targets',!s.contactAO&&s.targets===0&&!s.water.reflection);
  for(let i=0;i<5;i++){await quality('high');await quality('fluid');memory.push((await state()).memory);}
  check('five quality cycles have stable geometry and texture counts',memory.slice(1).every(m=>m.geometries===memory[1].geometries&&m.textures===memory[1].textures));
  await page.setViewportSize({width:390,height:844});await quality('high');s=await state();check('390px keeps the lighter rendering path',!s.contactAO&&!s.water.reflection);await page.screenshot({path:path.join(out,'mobile-quality.png')});
  await page.setViewportSize({width:1440,height:900});await quality('auto');await page.evaluate(()=>window.__campusHub.setPose(-4,18,0));await page.locator('#world').focus();
  const sample=page.evaluate(()=>new Promise(resolve=>{const a=[];let last=performance.now(),start=last;function tick(now){a.push(now-last);last=now;if(now-start<6200)requestAnimationFrame(tick);else resolve(a);}requestAnimationFrame(tick);}));
  await page.keyboard.down('KeyW');await page.waitForTimeout(3000);await page.keyboard.up('KeyW');const middle=await page.evaluate(()=>window.__campusHub.snapshot().pos);await page.keyboard.down('KeyS');await page.waitForTimeout(3000);await page.keyboard.up('KeyS');
  const samples=await sample,sorted=[...samples].sort((a,b)=>a-b),perf={samples:samples.length,p50:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],max:sorted.at(-1),over50:samples.filter(t=>t>50).length};
  check('real W and S movement stays responsive in automatic quality',middle[2]<17&&samples.length>30&&perf.max<1000);
  check('no browser or shader errors',errors.length===0);check('PBR assets load without failed requests',failed.length===0);
  await fs.writeFile(path.join(out,'quality-validation.json'),JSON.stringify({passed:true,checks,memory,perf,samples,errors,failed},null,2));console.log('Frame interval sample',JSON.stringify(perf));
 }catch(error){await page.screenshot({path:path.join(out,'quality-failure.png')}).catch(()=>{});await fs.writeFile(path.join(out,'quality-validation.json'),JSON.stringify({passed:false,error:error.stack,checks,memory,errors,failed},null,2));throw error;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
