// Fixed-camera sample evidence and a transmission-heavy stationary frame sample.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.LIBRARY_OUTPUT||path.join(__dirname,'../validation/review-v3'));
(async()=>{const browser=await chromium.launch({headless:true,args:process.env.LIBRARY_D3D11==='1'?['--use-angle=d3d11','--ignore-gpu-blocklist']:[]}),report={date:new Date().toISOString(),errors:[],failedResources:[]};
 try{fs.mkdirSync(out,{recursive:true});const page=await browser.newPage({viewport:{width:1440,height:960}});page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failedResources.push({url:r.url(),status:r.status()});});
  const url=(process.env.LIBRARY_URL||'http://127.0.0.1:4196')+'/examples/library-3d/';await page.goto(url+'?view=sample');await page.waitForFunction(()=>window.__library?.snapshot().ready);await page.locator('#quality').selectOption('high');
  for(const view of ['sample','sampleTree']){await page.evaluate(v=>__library.setView(v),view);await page.waitForTimeout(700);await page.screenshot({path:path.join(out,view==='sample'?'after-sample.png':'after-tree.png')});}
  report.model=await page.evaluate(()=>__library.modelStats());
  await page.evaluate(()=>__library.setView('sample'));await page.locator('#quality').selectOption('fluid');await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,'after-sample-fluid.png')});
  report.frames=await page.evaluate(()=>new Promise(resolve=>{const start=performance.now(),values=[];let last=start;function frame(now){values.push(now-last);last=now;if(now-start<10000){requestAnimationFrame(frame);return;}const sorted=values.slice(1).sort((a,b)=>a-b),mean=sorted.reduce((a,b)=>a+b,0)/sorted.length;resolve({durationMs:now-start,samples:sorted.length,fps:1000/mean,p95_ms:sorted[Math.floor(sorted.length*.95)],max_ms:sorted.at(-1),over50ms:sorted.filter(v=>v>50).length,graphics:__library.performance()});}requestAnimationFrame(frame);}));
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(700);await page.screenshot({path:path.join(out,'after-sample-narrow.png')});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(report.frames.graphics.ambientOcclusion,false);assert.equal(report.frames.graphics.shadowUpdates,1);assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);report.passed=true;
 }finally{await browser.close();fs.writeFileSync(path.join(out,'sample-review-results.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify({passed:report.passed,frames:report.frames}));
})().catch(e=>{console.error(e);process.exitCode=1;});
