const {chromium}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const out=path.resolve(__dirname,'../test-results/social-facing-v5');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),checks=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 const snap=()=>page.evaluate(()=>window.__campusHub.snapshot());
 async function walk(x,z,id){assert(await page.evaluate(p=>window.__campusHub.setPose(...p),[x,z,Math.PI/2]));await page.locator('#world').focus();await page.keyboard.down('KeyW');await page.waitForTimeout(180);await page.keyboard.up('KeyW');await page.waitForFunction(id=>window.__campusHub.snapshot().nearest===id,id,{timeout:10000});check('west approach walks to '+id,(await snap()).pos[0]>x+.1);await page.keyboard.press('KeyE');await page.waitForFunction(()=>document.querySelector('#business-status').textContent==='关闭后回到当前站位。',null,{timeout:60000});}
 try{
  await page.goto('http://127.0.0.1:4184/js/features/campus-hub/index.html');await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:120000});
  const social=await page.evaluate(()=>window.__campusHub.districts().find(d=>d.name==='district:social'));
  check('service pavilion faces west into central courtyard',social?.serviceFacing?.[0]<-.99);
  const desk=social.interactions.find(i=>i.id==='social.desk').position,board=social.interactions.find(i=>i.id==='social.board').position;
  check('interaction anchors follow rotated physical desk and board',Math.hypot(desk[0]-10.8,desk[2]+.65)<.001&&Math.hypot(board[0]-7.8,board[2]+2.6)<.001);
  check('new fixtures block walking and former fixture positions are clear',await page.evaluate(()=>window.__campusHub.blocked(10.8,-.65)&&window.__campusHub.blocked(7.8,-2.6)&&!window.__campusHub.blocked(10.8,2.65)&&!window.__campusHub.blocked(13.8,4.6)));
  await page.screenshot({path:path.join(out,'overview.png')});
  await walk(8.6,-.65,'social.desk');check('courtyard-facing desk opens original friends tab',await page.frameLocator('#business-frame').locator('[data-community-tab="friends"]').getAttribute('aria-selected')==='true');await page.locator('#close-business').click();
  await walk(5.5,-2.6,'social.board');check('courtyard-facing board opens original posts tab',await page.frameLocator('#business-frame').locator('[data-community-tab="posts"]').getAttribute('aria-selected')==='true');
  const paused=await snap();await page.keyboard.press('KeyW');await page.waitForTimeout(150);check('opened panel freezes visitor position',(await snap()).pos.every((v,i)=>v===paused.pos[i]));await page.locator('#close-business').click();
  check('closing restores courtyard control and releases iframe',!(await snap()).modal&&await page.locator('#business-frame').getAttribute('src')===null);
  await page.evaluate(()=>window.__campusHub.setPose(5.5,-.5,Math.PI/2));await page.selectOption('#quality','high');await page.waitForTimeout(400);await page.addStyleTag({content:'#places,#toast{visibility:hidden}'});await page.screenshot({path:path.join(out,'front.png')});
  check('no uncaught browser errors',errors.length===0);await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,errors,social,final:await snap()},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:false,error:e.stack,checks,errors},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
