const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const assert=require('node:assert/strict');
const path=require('node:path');
const http=require('node:http');
(async()=>{
 const base=process.env.CAMPUS_HUB_URL||'http://127.0.0.1:4184',url=base+'/js/features/campus-hub/index.html',out=path.resolve(__dirname,'../test-results');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--enable-webgl','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:1440,height:900},hasTouch:true});
 let proxy;const errors=[],failed=[],checks=[];page.on('pageerror',e=>errors.push({url:page.url(),error:e.message}));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/')&&!r.url().includes('favicon'))failed.push({url:r.url(),status:r.status()});});
 const snap=()=>page.evaluate(()=>window.__campusHub.snapshot());
 const wait=fn=>page.waitForFunction(fn,null,{timeout:120000,polling:'raf'});
 async function ready(){await wait(()=>window.__campusHub?.snapshot().ready);await page.waitForFunction(()=>window.__campusHub.snapshot().frames>3,null,{timeout:120000});}
 const check=(name,value)=>{assert(value,name);checks.push(name);console.log('PASS',name);};
 try{
  await page.goto(url);await ready();let s=await snap();check('five entries and one campus canvas load',s.entries.length===5&&await page.locator('canvas').count()===1);await page.screenshot({path:path.join(out,'overview.png')});
  await page.locator('#walk').click();await page.keyboard.down('KeyW');await wait(()=>window.__campusHub.snapshot().pos[2]<28.7);await page.keyboard.up('KeyW');check('real W movement follows the campus ground',(await snap()).pos[2]<29);
  await page.locator('#world').focus();await page.keyboard.press('Space');await wait(()=>window.__campusHub.snapshot().avatar.action.height>.75);check('existing higher anime jump works in public campus',(await snap()).avatar.action.current==='jump');await wait(()=>!window.__campusHub.snapshot().avatar.action.current);
  await page.screenshot({path:path.join(out,'walk.png')});
  for(const entry of (await snap()).entries){
   await page.locator('#directory').click().catch(()=>{});if(await page.locator('#places').isHidden())await page.locator('#directory').click();
   await page.locator('[data-place="'+entry.id+'"]').click();await page.waitForFunction(id=>{const s=window.__campusHub.snapshot();return s.path?.length===0&&s.nearest===id;},entry.id,{timeout:120000,polling:'raf'});
   const before=await snap();check('walkable route reaches '+entry.id,!await page.evaluate(([x,z])=>window.__campusHub.blocked(x,z),[before.pos[0],before.pos[2]]));
   await page.locator('#world').focus();await page.keyboard.press('KeyE');await page.waitForURL(u=>u.searchParams.get('campusScene')===entry.id,{timeout:120000});await page.locator('#campus-return').waitFor();
   await page.waitForFunction(id=>id==='classroom'?window.__academy?.snapshot().ready:id==='library'?window.__library?.snapshot().ready:id==='study'?!!window.__studySample:id==='social'?!!window.__social:!!window.__arena,entry.id,{timeout:120000});
   check('original scene really renders '+entry.id,await page.locator('canvas').count()>0);await page.screenshot({path:path.join(out,entry.id+'.png')});
   await page.locator('#campus-return').click();await ready();s=await snap();check('returns outside '+entry.id,s.returnRestored&&Math.hypot(s.pos[0]-entry.outside[0],s.pos[2]-entry.outside[1])<.05);
   check('restores camera and character headings '+entry.id,Math.abs(s.yaw-before.yaw)<.001&&Math.abs(Math.atan2(Math.sin(s.avatar.yaw-before.avatar.yaw),Math.cos(s.avatar.yaw-before.avatar.yaw)))<.001);
  }
  for(let i=0;i<5;i++){
   await page.evaluate(()=>window.__campusHub.entry('study'));await page.locator('#campus-return').waitFor();await page.waitForFunction(()=>!!window.__studySample,null,{timeout:120000});await page.locator('#campus-return').click();await ready();check('repeat enter/return '+(i+1),(await snap()).returnRestored&&await page.locator('canvas').count()===1);
  }
  await page.evaluate(()=>window.__campusHub.openFeature('rooms'));await page.frameLocator('#business-frame').locator('#view-rooms').waitFor({state:'visible',timeout:60000});
  const paused=await snap();await page.keyboard.press('KeyW');await page.waitForTimeout(300);s=await snap();check('original rooms panel pauses campus input',s.modal&&s.pos.every((v,i)=>v===paused.pos[i]));
  check('business iframe hides 3D entrances',await page.frameLocator('#business-frame').locator('#campusHubEntry').isHidden()&&await page.frameLocator('#business-frame').locator('#arena3dEntry').isHidden());
  await page.locator('#close-business').click();check('closing destroys business iframe document',await page.locator('#business-frame').getAttribute('src')===null);
  await page.setViewportSize({width:390,height:844});await page.locator('#walk').click();
  const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('#touch button,#actions button,#enter')].map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};})}));
  check('390px controls fit and touch targets are usable',layout.scroll<=layout.width&&layout.buttons.every(r=>r.x>=0&&r.right<=390&&r.h>=44&&r.w>=44));
  await page.evaluate(()=>window.__campusHub.setPose(0,28,0));const mobileStart=await snap(),forward=page.locator('[data-key="KeyW"]'),r=await forward.boundingBox(),cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2,id:11}]});await wait(()=>window.__campusHub.snapshot().pos[2]<27.5);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check('mobile movement changes actual position',(await snap()).pos[2]<mobileStart.pos[2]);await page.screenshot({path:path.join(out,'mobile.png')});
  await page.goto(url);await ready();await page.evaluate(()=>window.__campusHub.entry('study'));await page.locator('#campus-return').waitFor();await page.goBack();await ready();check('browser back/BFCache restores a live single campus',(await snap()).returnRestored&&await page.locator('canvas').count()===1);
  proxy=http.createServer((req,res)=>{const target=new URL(req.url.replace(/^\/xuewuyou(?=\/)/,''),base);const upstream=http.request(target,{method:req.method,headers:{...req.headers,host:target.host}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});upstream.on('error',()=>{res.writeHead(502);res.end();});req.pipe(upstream);});await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));
  const prefix='http://127.0.0.1:'+proxy.address().port+'/xuewuyou';await page.goto(prefix+'/js/features/campus-hub/index.html');await ready();await page.evaluate(()=>window.__campusHub.entry('library'));await page.locator('#campus-return').waitFor();await page.waitForFunction(()=>window.__library?.snapshot().ready,null,{timeout:120000});check('Pages subpath keeps scene assets and entry prefix',page.url().startsWith(prefix+'/examples/library-3d/'));await page.locator('#campus-return').click();await ready();check('Pages subpath returns to same campus prefix',page.url().startsWith(prefix+'/js/features/campus-hub/')&&(await snap()).returnRestored);
  check('no uncaught browser errors',errors.length===0);check('no missing or forbidden scene assets',failed.length===0);
  await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,errors,failed,final:await snap()},null,2));
 }catch(error){await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:false,failure:error.stack,checks,errors,failed,snapshot:await snap().catch(()=>null)},null,2));await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error;}
 finally{await browser.close();if(proxy){proxy.closeAllConnections();await new Promise(resolve=>proxy.close(resolve));}}
})().catch(e=>{console.error(e);process.exitCode=1;});
