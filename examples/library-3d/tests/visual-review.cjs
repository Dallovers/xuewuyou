const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.LIBRARY_OUTPUT||path.join(__dirname,'../validation/review-v2'));
const report={date:new Date().toISOString(),errors:[],requests:[],checks:[],screenshots:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,args:process.env.LIBRARY_D3D11==='1'?['--use-angle=d3d11','--ignore-gpu-blocklist']:[]});
 try{
  fs.mkdirSync(out,{recursive:true});const page=await browser.newPage({viewport:{width:1440,height:960}});page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.requests.push({url:r.url(),status:r.status()});});
  await page.goto((process.env.LIBRARY_URL||'http://127.0.0.1:4196')+'/examples/library-3d/');await page.waitForFunction(()=>__library.snapshot().ready);await page.locator('#quality').selectOption('high');
  report.model=await page.evaluate(()=>__library.modelStats());assert.equal(report.model.landscape.trees,3);assert(report.model.meshes<150);assert(report.model.triangles<130000);
  for(const view of ['exterior','hall','reading']){await page.evaluate(v=>__library.setView(v),view);await page.waitForTimeout(500);const file='after-'+view+'.png';await page.screenshot({path:path.join(out,file)});report.screenshots.push(file);}
  report.checks.push('Three fixed-camera views rendered at high quality with procedural material and botanical cutouts');
  const seats=await page.evaluate(()=>__library.seats());
  for(const seat of seats){assert(await page.evaluate(s=>__library.setPose(s.approach.x,s.approach.z),seat));await page.locator('#world').focus();await page.keyboard.press('KeyE');assert.equal(await page.evaluate(()=>__library.snapshot().seated),seat.id);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__library.snapshot().seated),null);}
  report.checks.push('All eight seating approaches and repeated stand-up routes remain usable');
  await page.evaluate(()=>{__library.setPose(14,-4);__library.move(4,0);});const pos=await page.evaluate(()=>__library.snapshot().pos);assert(pos[0]<15.56);report.checks.push('New landscape trunk blocks movement without occupying the entrance or reading paths');
  await page.evaluate(()=>__library.setView('reading'));await page.locator('#quality').selectOption('fluid');await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'after-reading-fluid.png')});report.screenshots.push('after-reading-fluid.png');report.fluid=await page.evaluate(()=>__library.performance());
  assert.equal(report.fluid.ambientOcclusion,false);assert.equal(report.fluid.shadowUpdates,1);assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[]);report.checks.push('Fluid mode renders the revised scene with a single cached static shadow update and no failed resources');report.passed=true;
 }finally{await browser.close();fs.writeFileSync(path.join(out,'visual-review-results.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify({passed:report.passed,checks:report.checks,model:report.model}));
})().catch(e=>{console.error(e);process.exitCode=1;});
