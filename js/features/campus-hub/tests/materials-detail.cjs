const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.CAMPUS_TEST_BASE||'http://127.0.0.1:4198/';
const out=path.resolve(__dirname,'../test-results/materials-detail');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[],errors=[];
 fs.mkdirSync(out,{recursive:true});
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 async function visibleReader(page,label){
  await page.locator('#wenkuDetail:not(.hidden)').waitFor();
  // DOM visibility alone misses a dialog centered thousands of pixels offscreen.
  const geometry=await page.evaluate(()=>{
   const bounds=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
   return {width:innerWidth,height:innerHeight,mask:bounds(document.querySelector('#wenkuDetail')),card:bounds(document.querySelector('#wenkuDetail>div'))};
  });
  check(label+' is centered in the actual viewport',Math.abs(geometry.mask.x)<2&&Math.abs(geometry.mask.y)<2&&Math.abs(geometry.mask.height-geometry.height)<2&&geometry.card.x>=0&&geometry.card.y>=0&&geometry.card.right<=geometry.width+1&&geometry.card.bottom<=geometry.height+1);
  check(label+' mask covers the header instead of sitting behind it',await page.evaluate(()=>document.elementFromPoint(50,30)===document.querySelector('#wenkuDetail')));
  await page.screenshot({path:path.join(out,label+'.png')});
 }
 try{
  for(const viewport of [{width:1440,height:800},{width:390,height:844}]){
   const label=viewport.width===390?'mobile':'desktop';
   const context=await browser.newContext({viewport}),page=await context.newPage();
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base,{waitUntil:'domcontentloaded'});await page.click('#obSkip');
   if(viewport.width===390)await page.click('#atlasMenuToggle');
   await page.locator('[data-nav="wenku"]:visible').first().click();
   await page.locator('#wenkuList .wk-item').first().waitFor();
   await page.locator('#wenkuList .wk-item').nth(1).click();
   await visibleReader(page,label+'-first');
   await page.locator('#wkdClose').click();
   check(label+' close button dismisses the mask',await page.locator('#wenkuDetail').isHidden());
   const deep=page.locator('#wenkuList .wk-item').nth(40);
   await deep.click();await visibleReader(page,label+'-deep');
   await page.keyboard.press('Escape');
   check(label+' Escape returns to the scrolled list',await page.locator('#wenkuDetail').isHidden()&&await page.evaluate(()=>scrollY>1000));
   await page.locator('[data-wklocal]').click();
   const pdf=page.waitForResponse(r=>r.url().includes('/data/pdf/')&&r.request().resourceType()==='document');
   const local=page.locator('#wenkuList .wk-item').first();await local.focus();await page.keyboard.press('Enter');
   await visibleReader(page,label+'-local-pdf');
   const response=await pdf;
   check(label+' keyboard-opened reader fetches a real PDF',response.ok()&&/pdf/.test(response.headers()['content-type']||'')&&await page.locator('#wkdPreview').isVisible());
   if(label==='desktop'){
    await page.click('#wkdModeAi');
    await page.waitForFunction(()=>{const n=Number(document.querySelector('#wkdAiPageInfo').textContent.match(/\d+/)?.[0]);return n>0&&document.querySelectorAll('#wkdAiPages .pdf-page-wrap').length===n;},null,{timeout:20000});
    check('main reader renders actual PDF pages in AI mode',await page.locator('#wkdAiPages canvas').count()>0);
    await page.evaluate(()=>{
     WG_AI.chat=async()=> '测试回答：这是选中文字的解释。';
     const text=[...document.querySelectorAll('#wkdAiPages .pdf-text-layer span')].find(e=>e.textContent.trim().length>2);
     const range=document.createRange();range.selectNodeContents(text);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
     document.querySelector('#wkdAiPages').dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
    });
    await page.locator('#wkdAiFloatBtn').waitFor({state:'visible'});await page.locator('#wkdAiFloatBtn').click();
    await page.locator('#wkdAiAnswerContent').filter({hasText:'测试回答'}).waitFor();
    check('selection AI answer stays above the relocated reader',await page.locator('#wkdAiAnswerMask').isVisible()&&await page.evaluate(()=>{const e=document.querySelector('#wkdAiAnswerContent'),r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));
    await page.screenshot({path:path.join(out,'desktop-ai-reader.png')});
    await page.click('#wkdAiAnswerClose');await page.click('#wkdModeIframe');
   }
   await page.evaluate(()=>document.querySelector('[data-nav="home"]').click());
   check(label+' navigating away dismisses the body-level reader',await page.locator('#wenkuDetail').isHidden()&&await page.locator('#view-home').isVisible());
   await context.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify({checks,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
