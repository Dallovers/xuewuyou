const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
(async()=>{
 const base=process.env.CAMPUS_HUB_URL||'http://127.0.0.1:4184',out=path.resolve(__dirname,'../test-results/site-exit');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),checks=[],errors=[];let proxy;
 page.on('pageerror',e=>errors.push(e.message));
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 try{
  await page.goto(base+'/js/features/campus-hub/index.html');
  await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:120000});
  await page.locator('[data-place="site-exit"]').click();
  await page.waitForFunction(()=>{const s=window.__campusHub.snapshot();return s.path?.length===0&&s.nearest==='courtyard.site-exit';},null,{timeout:30000});
  check('south exit is reachable by actual walking route',true);
  await page.evaluate(()=>{sessionStorage.setItem('xuewuyou:campus-hub:return:v1','old-ticket');sessionStorage.setItem('site-exit-test:keep','kept');});
  await page.screenshot({path:path.join(out,'exit-place.png')});
  await page.locator('#world').focus();await page.keyboard.press('KeyE');await page.waitForURL(u=>u.pathname==='/index.html'&&u.hash==='#home',{timeout:60000});
  await page.waitForFunction(()=>!!window.StudyAppBridge?.navTo,null,{timeout:60000});
  check('E leaves 3D for original website page',await page.locator('#world').count()===0&&(await page.locator('#view-home').isVisible()||await page.locator('#view-onboard').isVisible()));
  check('only campus return ticket is cleared',await page.evaluate(()=>sessionStorage.getItem('xuewuyou:campus-hub:return:v1')===null&&sessionStorage.getItem('site-exit-test:keep')==='kept'));
  await page.screenshot({path:path.join(out,'website-home.png')});
  proxy=http.createServer((req,res)=>{const target=new URL(req.url.replace(/^\/xuewuyou(?=\/)/,''),base);const upstream=http.request(target,{method:req.method,headers:{...req.headers,host:target.host}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});upstream.on('error',()=>{res.writeHead(502);res.end();});req.pipe(upstream);});await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));
  const prefix='http://127.0.0.1:'+proxy.address().port+'/xuewuyou';await page.setViewportSize({width:390,height:844});
  // Keep character loading pending: the ordinary link must work before 3D is ready.
  await page.route('**/student-anime.vrm',async route=>{await new Promise(resolve=>setTimeout(resolve,1500));await route.abort();});
  await page.goto(prefix+'/js/features/campus-hub/index.html',{waitUntil:'domcontentloaded'});await page.locator('#site-exit').waitFor();
  // Loading mask must not cover the permanent return link.
  const hit=await page.locator('#site-exit').evaluate(e=>{const r=e.getBoundingClientRect();return{inside:r.x>=0&&r.right<=innerWidth,height:r.height,reachable:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('#site-exit')===e};});
  check('390px exit is visible and clickable while loading',hit.inside&&hit.height>=44&&hit.reachable);
  await page.screenshot({path:path.join(out,'mobile-exit.png')});await page.locator('#site-exit').click();await page.waitForURL(prefix+'/index.html#home',{timeout:60000});
  check('exit preserves Pages subpath',page.url()===prefix+'/index.html#home');
  check('no uncaught errors',errors.length===0);
  await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,errors},null,2));
 }catch(error){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error;}finally{await browser.close();if(proxy){proxy.closeAllConnections();await new Promise(resolve=>proxy.close(resolve));}}
})().catch(e=>{console.error(e);process.exitCode=1;});
