const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

/* 教室入座这条链路有两段，分开测：
   1. 座位 UI：#enter / #feature-cue / #seat-tools 的文案与可点性（横竖屏都测）。
   2. 刷题：课程面板只是「选哪一科」，仍然是小窗；**点科目直接整页跳进主站题库**，
      不再塞进 #business 的 iframe。所以后半段的断言都对着顶层页面做，
      并且要确认校园页那套 dialog 在跳转后根本不存在了。 */
const CAMPUS='http://127.0.0.1:4184/js/features/campus-hub/index.html';
const SITE='http://127.0.0.1:4184/index.html';

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(CAMPUS);
  await page.waitForFunction(()=>window.__campusHub?.snapshot().ready&&window.__campusHub.snapshot().frames>3,null,{timeout:120000});
  const seat=await page.evaluate(()=>window.__campusHub.interactions().find(item=>item.id.startsWith('academy.seat-')));
  assert(seat,'classroom has an actual interactive chair');
  assert(await page.evaluate(p=>window.__campusHub.setPose(p[0],p[2]),seat.position));
  await page.waitForFunction(id=>window.__campusHub.snapshot().nearest===id,seat.id);
  await page.locator('#world').focus();
  assert.match(await page.locator('#enter').innerText(),/坐下刷题/,'chair advertises the connected practice flow');
  await page.keyboard.press('KeyE');
  await page.waitForFunction(()=>window.__campusHub.snapshot().seated);
  await page.waitForFunction(()=>document.querySelector('#enter').textContent.includes('开始刷题'));
  assert.match(await page.locator('#feature-cue').innerText(),/已入座.*按 E 开始刷题/);
  assert.equal(await page.locator('#seat-tools [data-reading-tool]:visible').count(),0,'classroom does not show unrelated reading tools');
  await page.screenshot({path:path.resolve(__dirname,'../test-results/classroom-seat-action-desktop.png')});
  await page.setViewportSize({width:375,height:812});
  await page.waitForTimeout(200);
  assert(await page.locator('#feature-cue').evaluate(card=>{const r=card.getBoundingClientRect(),dock=document.querySelector('footer').getBoundingClientRect(),top=document.querySelector('#presence').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>top.bottom&&r.bottom<dock.top;}),'mobile cue clears the header and primary action');
  assert(await page.locator('#enter').evaluate(button=>button.getBoundingClientRect().height>=44),'mobile main action remains touch sized');
  await page.screenshot({path:path.resolve(__dirname,'../test-results/classroom-seat-action-mobile.png')});
  await page.setViewportSize({width:844,height:390});await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
  assert(await page.locator('#feature-cue').evaluate(card=>{const r=card.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<innerHeight;}),'landscape keeps the seated hint on screen');
  assert(await page.locator('#seat-feature').evaluate(button=>{const r=button.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<innerHeight;}),'landscape preserves the visible practice button');
  await page.screenshot({path:path.resolve(__dirname,'../test-results/classroom-seat-action-landscape.png')});
  await page.setViewportSize({width:1440,height:900});

  /* 课程面板（选学科）仍然是小窗：它不开题，只是分流 */
  await page.locator('#enter').click();
  await page.getByRole('button',{name:'高等数学',exact:true}).waitFor({state:'visible'});
  assert.match(await page.locator('.dialog-head .panel-eyebrow').innerText(),/网站功能/);
  await page.locator('#close-business').click();
  assert(await page.evaluate(()=>window.__campusHub.snapshot().seated),'closing the picker preserves the seat');

  /* 点科目 = 离开校园页，整页进题库模块 */
  await page.locator('#world').focus();await page.keyboard.press('KeyE');
  await page.getByRole('button',{name:'高等数学',exact:true}).click();
  await page.waitForURL(/#bank\/b3$/,{timeout:60000});
  assert.equal(await page.evaluate(()=>!!document.querySelector('#business')),false,'campus dialog does not come along with the jump');
  await page.locator('#view-module').waitFor({state:'visible',timeout:60000});
  assert.equal(await page.locator('#modTitle').innerText(),'高数综合刷题','subject card lands on its formal module');

  /* 有的版本把「练习设置 + 筛选 + 章节列表」收在 <details> 里（嵌在校园小窗时是展开的），
     有的版本直接平铺。有就展开，没有就跳过，两种布局都要能跑。 */
  const openSettings=async()=>{
   const details=page.locator('.atlas-practice-settings');
   if(await details.count())await details.evaluate(d=>{d.open=true;});
  };
  const modHint=()=>page.locator('#modFilterHint').evaluate(el=>el.textContent);
  await openSettings();

  /* 在主站页面上真的答一道题，记录仍然写进同一个学习档案 */
  await page.locator('#modFilter [data-form="choice"]').click();
  await page.locator('#subGrid [data-topic]:not(.mod-card-empty)').first().click();
  await page.locator('.bank-opt').first().waitFor({state:'visible',timeout:30000});
  assert.equal(await page.locator('.bank-opt').count(),4,'real question options render');
  await page.locator('.bank-opt').first().click();
  await page.locator('#bankGrasp button[data-g="weak"]').click();
  const records=await page.evaluate(()=>JSON.parse(localStorage.getItem('wenguo_v1')));
  assert.equal(records.answers.length,1,'answer saved in the main study record');
  assert.equal(records.mistakes.length,1,'wrong answer is added to the wrong-question list');
  assert(records.answers[0].qid,'saved answer has the original bank question ID');

  /* 另外两科：深链直接落到各自模块（换 hash 不会重载，先回空白页再进） */
  for(const [moduleId,title]of [['l3','线代综合刷题'],['p3','概率综合刷题']]){
   await page.goto('about:blank');
   await page.goto(SITE+'#bank/'+moduleId);
   await page.locator('#view-module').waitFor({state:'visible',timeout:60000});
   assert.equal(await page.locator('#modTitle').innerText(),title,moduleId+' opens its formal subject module');
   assert.match(await modHint(),/共 [1-9]\d* 题/,moduleId+' has real questions');
  }

  /* 不带模块的深链落到课程目录页：学科页签 + 模块清单（题数/难度/查看章节） */
  await page.goto('about:blank');
  await page.goto(SITE+'#bank');
  await page.locator('#view-bank').waitFor({state:'visible',timeout:60000});
  assert.equal(await page.locator('#bankTitle').innerText(),'课程目录','#bank falls back to the full course catalogue');
  assert((await page.locator('#bankGrid > *').count())>1,'the catalogue lists its modules');

  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'question bank page has no mobile horizontal overflow');
  await page.locator('#view-bank').waitFor({state:'visible'});
  await page.screenshot({path:path.resolve(__dirname,'../test-results/classroom-real-practice-mobile.png')});
  assert.equal(errors.length,0,'no uncaught browser errors: '+errors.join('; '));

  /* 题库文件下载失败时：不能白屏，要给出可重试的提示；恢复后重载能出题 */
  const retryPage=await browser.newPage({viewport:{width:1440,height:900}});
  const retryErrors=[];retryPage.on('pageerror',error=>retryErrors.push(error.message));
  let blockedBank=false;
  await retryPage.route('**/js/gaoshu_bank.js*',route=>{if(!blockedBank){blockedBank=true;route.abort();}else route.continue();});
  await retryPage.goto(SITE+'#bank/b3');
  await retryPage.locator('#view-bank').waitFor({state:'visible',timeout:60000});
  /* 提示要真的落在屏幕上（降级时会切到列表模式），不能只是藏在 display:none 的容器里 */
  await retryPage.locator('#bankGrid').waitFor({state:'visible',timeout:30000});
  assert.match(await retryPage.locator('#bankGrid').innerText(),/题库暂时没有加载成功/, 'a failed bank download degrades to a readable message instead of a blank page');
  assert(blockedBank,'the first question-bank request was deliberately interrupted');
  assert.equal(retryErrors.length,0,'the degraded path does not throw: '+retryErrors.join('; '));
  await retryPage.reload();
  await retryPage.locator('#view-module').waitFor({state:'visible',timeout:60000});
  assert.match(await retryPage.locator('#modFilterHint').evaluate(el=>el.textContent),/共 [1-9]\d* 题/,'reload after the bank recovers shows real questions');
  console.log(JSON.stringify({passed:true,answers:records.answers.length,mistakes:records.mistakes.length,viewport:'390x844',bankFailureRetry:true,errors,retryErrors},null,2));
  await retryPage.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
