const {chromium}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
(async()=>{
 const base=process.env.CAMPUS_HUB_URL||'http://127.0.0.1:4184',url=base+'/js/features/campus-hub/index.html',out=path.resolve(__dirname,'../test-results/lifecycle-v6');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:1440,height:900},hasTouch:true});
 let proxy;const errors=[],failed=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/')&&!r.url().includes('favicon'))failed.push({url:r.url(),status:r.status()});});
 const snap=()=>page.evaluate(()=>window.__campusHub.snapshot()),check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 async function ready(){await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:120000});}
 async function panel(){await page.waitForFunction(()=>document.querySelector('#business-status').textContent==='关闭后回到当前站位。',null,{timeout:60000});}
 try{
  await page.goto(url);await ready();await page.locator('#walk').click();await page.locator('#world').focus();await page.keyboard.down('KeyW');await page.waitForFunction(()=>window.__campusHub.snapshot().pos[2]<28.7);await page.keyboard.up('KeyW');check('actual keyboard movement remains live',(await snap()).pos[2]<29);
  await page.keyboard.press('Space');await page.waitForFunction(()=>window.__campusHub.snapshot().avatar.action.height>.75);check('existing anime jump keeps original height',(await snap()).avatar.action.current==='jump');await page.waitForFunction(()=>!window.__campusHub.snapshot().avatar.action.current);
  for(const entry of (await snap()).entries){
   if(await page.locator('#places').isHidden())await page.locator('#directory').click();await page.locator('[data-place="'+entry.id+'"]').click();
   await page.waitForFunction(id=>{const s=window.__campusHub.snapshot(),e=s.entries.find(e=>e.id===id);return s.path?.length===0&&Math.hypot(s.pos[0]-e.outside[0],s.pos[2]-e.outside[1])<.15;},entry.id,{timeout:120000});
   const s=await snap();check('actual walking route reaches '+entry.id,page.url()===url&&!await page.evaluate(p=>window.__campusHub.blocked(...p),[s.pos[0],s.pos[2]]));
  }
  const initialMemory=await page.evaluate(()=>window.__campusHub.visuals().memory);
  for(let i=0;i<5;i++){
   await page.evaluate(()=>window.__campusHub.openFeature('rooms'));await panel();const before=await snap();await page.keyboard.press('KeyW');await page.waitForTimeout(180);check('business cycle '+(i+1)+' freezes movement',(await snap()).modal&&(await snap()).pos.every((n,j)=>n===before.pos[j]));
   const child=page.frameLocator('#business-frame');check('cycle '+(i+1)+' embeds rooms with 3D links hidden',await child.locator('#view-rooms').isVisible()&&await child.locator('#campusHubEntry').isHidden()&&await child.locator('#arena3dEntry').isHidden());await page.locator('#close-business').click();await page.waitForFunction(()=>document.querySelector('#business-frame').contentDocument?.URL==='about:blank');
  }
  check('five panel cycles keep one campus canvas and stable GPU resources',await page.locator('canvas').count()===1&&await page.evaluate(before=>{const after=window.__campusHub.visuals().memory;return after.geometries===before.geometries&&after.textures===before.textures;},initialMemory));
  await page.evaluate(()=>window.__campusHub.openFeature('study'));await panel();const child=page.frameLocator('#business-frame');await child.locator('#studyModalMask').waitFor({state:'visible'});await child.locator('#studySubjectInput').focus();await page.keyboard.press('Escape');await child.locator('#studyModalMask').waitFor({state:'hidden'});check('first Esc closes real nested setup while retaining campus panel',(await snap()).modal);
  await child.locator('body').click({position:{x:5,y:5}});await page.keyboard.press('Escape');check('second Esc closes campus panel',!(await snap()).modal);
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.__campusHub.setPose(0,28));const rect=await page.locator('[data-key="KeyW"]').boundingBox(),cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width/2,y:rect.y+rect.height/2,id:11}]});await page.waitForFunction(()=>window.__campusHub.snapshot().pos[2]<27.5);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check('390px real touch input moves visitor',(await snap()).pos[2]<27.5);await page.screenshot({path:path.join(out,'mobile.png')});
  for(let i=0;i<5;i++){await page.locator('#site-exit').click();await page.waitForURL(base+'/index.html#home');await page.waitForFunction(()=>!!window.StudyAppBridge?.navTo);await page.goBack();await ready();const before=(await snap()).frames;await page.waitForFunction(n=>window.__campusHub.snapshot().frames>n+2,before);check('website/back lifecycle '+(i+1)+' restores one live campus',await page.locator('canvas').count()===1&&!(await snap()).modal);}
  await page.goto(base+'/examples/library-3d/index.html');await page.waitForFunction(()=>window.__library?.snapshot().ready,null,{timeout:120000});check('original standalone library still renders',await page.locator('#world').isVisible());
  proxy=http.createServer((req,res)=>{const target=new URL(req.url.replace(/^\/xuewuyou(?=\/)/,''),base),upstream=http.request(target,{method:req.method,headers:{...req.headers,host:target.host}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});upstream.on('error',()=>{res.writeHead(502);res.end();});req.pipe(upstream);});await new Promise(r=>proxy.listen(0,'127.0.0.1',r));
  const prefix='http://127.0.0.1:'+proxy.address().port+'/xuewuyou';await page.goto(prefix+'/js/features/campus-hub/index.html');await ready();await page.evaluate(()=>window.__campusHub.openFeature('library',{category:'book'}));await panel();const frame=page.frames().find(f=>f.url().includes('campusPanel='));check('Pages prefix loads shared rooms and original catalogue panel',frame.url().startsWith(prefix+'/examples/library-3d/')&&await frame.evaluate(()=>window.__libraryPanel.snapshot().catalog.category==='book')&&page.url().startsWith(prefix+'/js/features/campus-hub/'));await page.locator('#close-business').click();
  check('no uncaught errors or missing static assets',errors.length===0&&failed.length===0);await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,errors,failed,final:await snap()},null,2));
 }catch(error){await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:false,error:error.stack,checks,errors,failed},null,2));await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error;}
 finally{await browser.close();if(proxy){proxy.closeAllConnections();await new Promise(r=>proxy.close(r));}}
})().catch(e=>{console.error(e);process.exitCode=1;});
