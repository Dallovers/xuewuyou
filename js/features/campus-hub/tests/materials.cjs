const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.CAMPUS_TEST_BASE||'http://127.0.0.1:4198/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[],errors=[],out=path.resolve(__dirname,'../test-results/materials');fs.mkdirSync(out,{recursive:true});
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 async function main(page){page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'domcontentloaded'});await page.click('#obSkip');}
 try{
  const context=await browser.newContext(),page=await context.newPage();let release;const hold=new Promise(r=>release=r);
  await page.route('**/js/gaoshu_bank.js*',async r=>{await hold;await r.abort().catch(()=>{});});await main(page);await page.evaluate(()=>{WG_Heavy.load();});
  await page.locator('[data-nav="wenku"]:visible').first().click();await page.locator('#wenkuList .wk-item').first().waitFor({timeout:5000});
  check('materials list opens while question bank is still blocked',await page.evaluate(()=>typeof GAOSHU_BANK==='undefined'&&!!WG_WenkuCat));
  await page.locator('#wenkuSearch').fill('2026');check('materials search works independently',(await page.locator('#wenkuList .wk-item').count())>0);await page.screenshot({path:path.join(out,'independent-catalog.png')});release();await context.close();

  const retryContext=await browser.newContext(),retry=await retryContext.newPage();let fail=true,hits=0;
  await retry.route('**/js/wenku.js*',r=>{hits++;return fail?r.abort():r.continue();});await main(retry);await retry.locator('[data-nav="wenku"]:visible').first().click();await retry.locator('[data-wenku-retry]').waitFor({timeout:7000});
  check('failed download stays on materials with visible retry',await retry.locator('#view-wenku').isVisible()&&(await retry.locator('#wenkuList').innerText()).includes('暂时加载失败'));
  fail=false;await retry.click('[data-wenku-retry]');await retry.locator('#wenkuList .wk-item').first().waitFor({timeout:5000});check('retry really requests missing data and restores the list',hits>=2);await retryContext.close();

  const navContext=await browser.newContext(),nav=await navContext.newPage();let releaseMaterials;const waitMaterials=new Promise(r=>releaseMaterials=r);
  await nav.route('**/js/wenku.js*',async r=>{await waitMaterials;await r.continue().catch(()=>{});});await main(nav);await nav.locator('[data-nav="wenku"]:visible').first().click();await nav.locator('[data-nav="home"]:visible').first().click();releaseMaterials();await nav.waitForFunction(()=>typeof WG_WenkuCat!=='undefined');check('finishing a background download does not pull users away from home',await nav.locator('#view-home').isVisible());await navContext.close();

  const libraryContext=await browser.newContext(),library=await libraryContext.newPage();let releaseManifest;const waitManifest=new Promise(r=>releaseManifest=r);
  await library.route('**/assets/catalog-availability.json',async r=>{await waitManifest;await r.abort().catch(()=>{});});library.on('pageerror',e=>errors.push(e.message));await library.goto(new URL('examples/library-3d/index.html?campusPanel=catalog',base).href,{waitUntil:'domcontentloaded'});await library.waitForFunction(()=>window.__libraryPanel?.ready,null,{timeout:8000});check('campus catalogue opens even when optional file manifest hangs',await library.locator('#library-dialog').isVisible());
  await library.locator('#results article button').first().click();await library.waitForFunction(()=>document.querySelector('#reader-status').textContent.includes('已显示实际 PDF'),null,{timeout:15000});check('actual PDF can still be read without the optional manifest',(await library.locator('#pdf-page').textContent()).includes('/ 13'));await library.screenshot({path:path.join(out,'fallback-reader.png')});releaseManifest();await libraryContext.close();
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify({checks,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
