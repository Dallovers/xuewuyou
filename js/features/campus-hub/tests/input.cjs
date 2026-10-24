const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const out=path.resolve(__dirname,'../test-results/input-v7');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:1440,height:900}}),checks=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));const snap=()=>page.evaluate(()=>window.__campusHub.snapshot()),check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 try{
  await page.goto(new URL('js/features/campus-hub/index.html',process.env.CAMPUS_TEST_BASE||'http://127.0.0.1:4184/').href);await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:120000});
  check('overview offers an enabled explicit interaction start button',await page.locator('#enter').isEnabled()&&(await page.locator('#enter').textContent()).includes('开启互动'));await page.locator('#enter').click();check('start button enters walk mode and focuses scene',(await snap()).mode==='walk'&&await page.evaluate(()=>document.activeElement.id==='world'));
  // Follow normal UI navigation, with no setPose or explicit canvas.focus().
  await page.locator('#directory').click();await page.locator('[data-place="library"]').click();await page.waitForFunction(()=>window.__campusHub.snapshot().path?.length===0,null,{timeout:60000});
  await page.locator('#enter').click();await page.waitForFunction(()=>window.__campusHub.snapshot().rooms.doors.find(d=>d.id==='library').open>.9);
  check('clicking a door returns focus to the scene',await page.evaluate(()=>document.activeElement.id==='world'));
  const before=await snap();await page.keyboard.down('KeyW');await page.waitForTimeout(450);await page.keyboard.up('KeyW');check('walking still works immediately after clicking interaction',Math.hypot((await snap()).pos[0]-before.pos[0],(await snap()).pos[2]-before.pos[2])>.3);
  await page.locator('#directory').click();await page.keyboard.press('KeyE');await page.waitForFunction(()=>window.__campusHub.snapshot().rooms.doors.find(d=>d.id==='library').target===0,null,{timeout:3000});check('E still works after clicking other campus controls',true);
  await page.locator('#directory').click();const focusedStart=await snap();await page.keyboard.down('KeyS');await page.waitForTimeout(450);await page.keyboard.up('KeyS');check('WASD works while a campus button had keyboard focus',Math.hypot((await snap()).pos[0]-focusedStart.pos[0],(await snap()).pos[2]-focusedStart.pos[2])>.3);
  await page.locator('#overview').click();await page.keyboard.press('KeyE');check('E can also start interaction from overview',(await snap()).mode==='walk');
  await page.selectOption('#quality','fluid');const qualityStart=await snap();await page.keyboard.down('KeyS');await page.waitForTimeout(450);await page.keyboard.up('KeyS');check('choosing quality returns control without an extra canvas click',await page.evaluate(()=>document.activeElement.id==='world')&&Math.hypot((await snap()).pos[0]-qualityStart.pos[0],(await snap()).pos[2]-qualityStart.pos[2])>.3);
  await page.screenshot({path:path.join(out,'input-fixed.png')});
  check('no browser errors',errors.length===0);await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:true,checks,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({passed:false,error:e.stack,checks,errors,snapshot:await snap().catch(()=>null),focus:await page.evaluate(()=>document.activeElement.id)},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
