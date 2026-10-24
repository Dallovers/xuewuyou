const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],out=path.resolve(__dirname,'../test-results/skins');await fs.mkdir(out,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/js/deploy-config.js*',r=>r.fulfill({contentType:'application/javascript',body:'window.WG_DEPLOY={apiBase:location.origin};'}));
 try{
  await page.goto((process.env.CAMPUS_TEST_BASE||'http://127.0.0.1:4192/')+'js/features/campus-hub/index.html?avatar=robot');
  await page.waitForFunction(()=>window.__campusHub?.snapshot().ready,null,{timeout:120000});
  await page.waitForFunction(()=>window.__campusHub.snapshot().avatar?.avatar==='robot',null,{timeout:45000});
  await page.click('#skin-shop');await page.waitForFunction(()=>window.__campusSkins?.snapshot().preview?.avatar==='robot');
  const ids=await page.locator('[data-skin]').evaluateAll(nodes=>nodes.map(n=>n.dataset.skin)),checks=[];
  for(const id of ids){
   await page.locator(`[data-skin="${id}"]`).click();
   await page.waitForFunction(id=>window.__campusSkins.snapshot().preview?.avatar===id,id,{timeout:60000});
   const initial=await page.evaluate(()=>window.__campusSkins.snapshot().preview);
   assert(initial.meshes>0&&initial.bounds.every(Number.isFinite),id+' finite rendered geometry');
   const states=await page.locator('[data-motion]:enabled').evaluateAll(nodes=>nodes.map(n=>n.dataset.motion));
   for(const state of states){await page.click(`[data-motion="${state}"]`);await page.waitForTimeout(state==='jump'?300:160);const p=await page.evaluate(()=>window.__campusSkins.snapshot().preview);assert(p.clip===state||state==='idle',id+' '+state+' plays');assert(p.bounds.every(Number.isFinite),id+' '+state+' finite');}
   await page.click('[data-motion="idle"]');await page.waitForTimeout(250);
   if(process.env.GENERATE_SKIN_THUMBNAILS){const sharp=require('sharp'),folder=path.resolve(__dirname,'../assets/skins');await fs.mkdir(folder,{recursive:true});await sharp(await page.locator('.skin-preview canvas').screenshot()).resize(240,240,{fit:'contain',background:'#1d302e'}).webp({quality:86}).toFile(path.join(folder,id+'.webp'));}
   if(id.startsWith('vroid-')){const p=await page.evaluate(()=>window.__campusSkins.snapshot().preview);assert(p.joints.leftHand[1]<p.joints.head[1],id+' left hand below head');assert(p.joints.rightHand[1]<p.joints.head[1],id+' right hand below head');await page.screenshot({path:path.join(out,id+'.png')});}
   checks.push({id,states,initial});console.log('PASS',id,states.join(','));
  }
  await page.locator('[data-skin="kenney-ghost"]').click();await page.waitForFunction(()=>window.__campusSkins.snapshot().preview?.avatar==='kenney-ghost');await page.click('[data-equip]');await page.waitForFunction(()=>window.__campusHub.snapshot().avatar?.avatar==='kenney-ghost');
  await page.screenshot({path:path.join(out,'desktop.png')});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'mobile.png')});assert(await page.locator('#skin-shop-dialog').evaluate(n=>n.scrollWidth<=n.clientWidth+2),'no mobile dialog overflow');
  await page.keyboard.press('Escape');assert(!await page.locator('#skin-shop-dialog').evaluate(n=>n.open));
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({checks,errors},null,2));
 }catch(error){console.error(error);await page.screenshot({path:path.join(out,'failure.png')});console.log(await page.locator('[data-loading]').textContent().catch(()=>''));process.exitCode=1;}finally{await browser.close();}
})();
