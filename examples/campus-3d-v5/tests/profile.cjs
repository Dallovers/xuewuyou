const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
const url=process.argv[2]||'http://127.0.0.1:4183/';const output=process.argv[3]||path.resolve(__dirname,'artifacts/performance.json');
const browser=await chromium.launch({headless:true,...(process.env.CAMPUS_CHROMIUM?{executablePath:process.env.CAMPUS_CHROMIUM}:{}),args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1.5});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await fs.mkdir(path.dirname(output),{recursive:true});await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__academy?.snapshot().ready,{timeout:90000});
const environment=await page.evaluate(()=>{const c=document.querySelector('canvas'),g=c.getContext('webgl2'),ext=g.getExtension('WEBGL_debug_renderer_info');return{viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,buffer:[c.width,c.height],gpu:ext?g.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown',agent:navigator.userAgent}});
async function sample(view,key){await page.evaluate(v=>{window.__academy.setView(v);window.__academy.walk();},view);await page.waitForTimeout(1000);if(key)await page.keyboard.down(key);
const metrics=await page.evaluate(()=>new Promise(resolve=>{let last=performance.now(),start=last;const intervals=[];function tick(now){intervals.push(now-last);last=now;if(now-start<3500)requestAnimationFrame(tick);else{const a=intervals.slice(3).sort((a,b)=>a-b);resolve({frames:a.length,mean_ms:a.reduce((a,b)=>a+b,0)/a.length,p50_ms:a[Math.floor(a.length*.5)],p95_ms:a[Math.floor(a.length*.95)],p99_ms:a[Math.floor(a.length*.99)],over_33ms:a.filter(x=>x>33.5).length,over_50ms:a.filter(x=>x>50.5).length});}}requestAnimationFrame(tick);}));if(key)await page.keyboard.up(key);return{view,key,...metrics,diagnostics:await page.evaluate(()=>window.__academy.performance?.()||window.__academy.snapshot())};}
const samples=[];for(const v of ['entry','classroom']){samples.push(await sample(v,'KeyW'));samples.push(await sample(v,'KeyL'));}
await page.screenshot({path:path.resolve(output).replace('.json','.png')});
const report={url,environment,samples,errors,date:new Date().toISOString()};await fs.writeFile(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
