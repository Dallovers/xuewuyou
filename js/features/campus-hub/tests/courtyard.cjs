const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const out=path.resolve(__dirname,'../test-results/courtyard-v2');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 const snap=()=>page.evaluate(()=>window.__campusHub.snapshot());
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 async function pose(x,z,yaw=0){assert(await page.evaluate(([x,z,yaw])=>window.__campusHub.setPose(x,z,yaw),[x,z,yaw]));await page.locator('#world').focus();await page.waitForTimeout(160);}
 async function pressAt(id){await page.waitForFunction(id=>window.__campusHub.snapshot().nearest===id,id,{timeout:10000});await page.keyboard.press('KeyE');}
 try{
  await page.goto('http://127.0.0.1:4184/js/features/campus-hub/index.html');
  await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:120000});
  check('courtyard has seven real interaction points',await page.evaluate(()=>window.__campusHub.courtyard().interactionCount===7));
  await page.screenshot({path:path.join(out,'overview.png')});
  check('basin blocks walking while four-metre east corridor remains clear',await page.evaluate(()=>window.__campusHub.blocked(0,5.5)&&[3,4,5,6].every(x=>!window.__campusHub.blocked(x,5.5))));
  await pose(4.25,12.65,0);await page.keyboard.down('KeyW');await page.waitForTimeout(220);await page.keyboard.up('KeyW');await pressAt('courtyard.water-switch');
  check('real walking and E switch water off',await page.evaluate(()=>!window.__campusHub.courtyard().waterOn));
  await page.keyboard.press('KeyE');check('E switches water on again',await page.evaluate(()=>window.__campusHub.courtyard().waterOn));
  await pose(6,2.6,-Math.PI/2);await pressAt('courtyard.water-seat-east-1');
  check('water-edge seat enters seated camera',(await snap()).seated);const seated=await snap();await page.keyboard.press('KeyW');await page.waitForTimeout(200);
  check('walking does not slide a seated visitor',(await snap()).pos.every((v,i)=>v===seated.pos[i]));await page.screenshot({path:path.join(out,'water-seat.png')});await page.keyboard.press('Escape');check('Esc stands up',!(await snap()).seated);
  await pose(-12.6,3,-Math.PI/2);await pressAt('courtyard.reading-seat');check('pergola bench is usable',(await snap()).seated);await page.screenshot({path:path.join(out,'reading-pergola.png')});await page.keyboard.press('KeyE');
  await pose(-9.6,3.3,-Math.PI/2);await pressAt('courtyard.reading-book');
  await page.waitForFunction(()=>document.querySelector('#business-status').textContent==='关闭后回到当前站位。',null,{timeout:60000});
  check('physical book opens original wenku document',await page.frameLocator('#business-frame').locator('#view-wenku').isVisible());await page.locator('#close-business').click();
  await pose(-6.1,-7.8,0);await pressAt('courtyard.directory');check('directory opens accessible route choices',await page.locator('#campus-guide').isVisible()&&await page.locator('[data-guide-place]').count()===5);
  const paused=await snap();await page.keyboard.press('KeyW');await page.waitForTimeout(180);check('directory pauses movement',(await snap()).pos.every((v,i)=>v===paused.pos[i]));
  await page.screenshot({path:path.join(out,'directory.png')});await page.locator('[data-guide-place="study"]').click();
  await page.waitForFunction(()=>{const s=window.__campusHub.snapshot();return s.path?.length===0&&s.nearest==='study';},null,{timeout:60000});check('directory really walks to courtyard-facing study entrance',!(await snap()).modal);
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.__campusHub.openFeature('campus-guide'));await page.screenshot({path:path.join(out,'mobile-guide.png')});
  check('390px guide has no horizontal overflow',await page.evaluate(()=>{const e=document.querySelector('#campus-guide');return e.scrollWidth<=e.clientWidth+1&&[...e.querySelectorAll('button')].every(b=>b.getBoundingClientRect().height>=44);}));await page.keyboard.press('Escape');check('guide Esc closes modal',!(await snap()).modal);
  await page.setViewportSize({width:1440,height:900});await pose(5.2,13.5,-.25);await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'courtyard-eye-level.png')});
  check('no uncaught browser errors',errors.length===0);
  await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,errors,snapshot:await snap(),courtyard:await page.evaluate(()=>window.__campusHub.courtyard())},null,2));
 }catch(error){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:false,error:error.stack,checks,errors},null,2));throw error;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
