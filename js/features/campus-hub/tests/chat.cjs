const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../../..'),dataRoot=path.join(root,'server/data');fs.mkdirSync(dataRoot,{recursive:true});const temp=fs.mkdtempSync(path.join(dataRoot,'chat-browser-'));
process.env.DATA_DIR=temp;process.env.JWT_SECRET='chat-browser-isolated-only';
const app=require(path.join(root,'server/server'));
(async()=>{
 let browser,base,pa,pb;const errors=[],checks=[],out=path.resolve(__dirname,'../test-results/chat');fs.mkdirSync(out,{recursive:true});
 const check=(name,ok)=>{assert(ok,name);checks.push(name);console.log('PASS',name);};
 async function api(url,body,token,method='POST'){const r=await fetch(base+'/api/'+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert(r.ok,JSON.stringify(data));return data;}
 try{
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.server.address().port;
  const a=await api('auth/register',{username:'聊天体验甲',password:'ChatBrowser123',nick:'1'}),b=await api('auth/register',{username:'聊天体验乙',password:'ChatBrowser123',nick:'2'});
  for(const who of[a,b]){await api('community/profile',{nick:who.user.nick,visible:true,subjects:[],goal:'',availability:''},who.token,'PUT');await api('skins/equip',{id:'robot'},who.token);}
  browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist','--disable-backgrounding-occluded-windows']});
  async function pageFor(user){const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addInitScript(user=>{localStorage.setItem('xwy_token',user.token);localStorage.setItem('xwy_user',JSON.stringify(user.user));},user);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('**/js/deploy-config.js*',r=>r.fulfill({contentType:'application/javascript',body:'window.WG_DEPLOY={apiBase:location.origin};'}));await page.goto(base+'/js/features/campus-hub/index.html');await page.waitForFunction(()=>window.__campusHub?.snapshot().frames>3,null,{timeout:120000});return page;}
  pa=await pageFor(a);pb=await pageFor(b);await Promise.all([pa,pb].map(p=>p.waitForFunction(()=>window.__campusHub.presence()?.loaded===1,null,{timeout:90000})));
  for(const p of[pa,pb])await p.click('#walk');
  await pa.locator('#world').focus();await pa.keyboard.press('Enter');await pa.locator('#chat-input').waitFor({state:'visible'});
  const before=await pa.evaluate(()=>window.__campusHub.snapshot().pos);
  await pa.locator('#chat-input').fill('wasd E 空格不会移动');await pa.keyboard.press('Space');await pa.waitForTimeout(150);
  check('typing movement keys does not move or interact',JSON.stringify(before)===JSON.stringify(await pa.evaluate(()=>window.__campusHub.snapshot().pos))&&!await pa.evaluate(()=>window.__campusHub.snapshot().seated));
  await pa.locator('#chat-input').fill('你好，同学 👋');await pa.locator('#chat-input').evaluate(input=>input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,isComposing:true})));
  await pa.waitForTimeout(100);check('Chinese IME Enter does not send prematurely',(await pa.evaluate(()=>window.__campusHub.chat().messages.length))===0);
  await pa.keyboard.press('Enter');
  await pb.waitForFunction(()=>window.__campusHub.chat().messages.some(m=>m.text==='你好，同学 👋'));
  await Promise.all([pa,pb].map(p=>p.waitForFunction(()=>window.__campusHub.chat().bubbles.some(b=>b.text==='你好，同学 👋'&&b.visible))));
  check('both senders and peers see live head bubbles and one chat entry',(await pa.locator('#chat-log li').count())===1&&(await pb.locator('#chat-log li').count())===1);
  check('closed chat counts unread messages',(await pb.evaluate(()=>window.__campusHub.chat().unread))===1);
  await pb.screenshot({path:path.join(out,'remote-head-bubble.png')});await pa.screenshot({path:path.join(out,'desktop-chat.png')});
  await pa.waitForTimeout(850);await pa.locator('#chat-input').fill('<img src=x onerror="window.badChat=1">');await pa.click('#chat-send');
  await pb.waitForFunction(()=>window.__campusHub.chat().messages.length===2);
  check('HTML is rendered as text in log and speech bubble',await pb.locator('#chat-log img,#campus-speech img').count()===0&&!await pb.evaluate(()=>window.badChat));
  check('new speech replaces the old bubble for that speaker',(await pb.evaluate(()=>window.__campusHub.chat().bubbles.length))===1);
  await pa.locator('#chat-input').fill('too soon');await pa.click('#chat-send');await pa.waitForFunction(()=>document.querySelector('#chat-status').textContent.includes('太快'));
  check('rejected rapid sends preserve the draft',(await pa.locator('#chat-input').inputValue())==='too soon');
  await pa.keyboard.press('Escape');check('Esc closes chat without standing or moving',!await pa.locator('#campus-chat').isVisible()&&JSON.stringify(before)===JSON.stringify(await pa.evaluate(()=>window.__campusHub.snapshot().pos)));
  await pb.waitForFunction(()=>window.__campusHub.chat().bubbles.length===0,null,{timeout:10000});check('head bubbles expire while chat log remains',(await pb.evaluate(()=>window.__campusHub.chat().messages.length))===2);
  await pb.reload();await pb.waitForFunction(()=>window.__campusHub?.chat()?.joined&&window.__campusHub.chat().messages.length===2,null,{timeout:120000});check('rejoin restores short history without replaying old head bubbles',(await pb.evaluate(()=>window.__campusHub.chat().bubbles.length))===0);
  await pb.waitForFunction(()=>window.__campusHub.presence()?.loaded===1,null,{timeout:90000});await pb.click('#walk');
  await pa.keyboard.press('Enter');await pa.locator('#chat-input').fill('气泡跟着我走，也会跟着跳');await pa.keyboard.press('Enter');await pb.waitForFunction(()=>window.__campusHub.chat().bubbles.some(b=>b.visible));
  await pa.keyboard.press('Escape');const speech=pb.locator('.speech-bubble'),start=await speech.boundingBox();
  await pa.keyboard.down('d');await pa.waitForTimeout(400);await pa.keyboard.up('d');await pb.waitForTimeout(250);const walked=await speech.boundingBox();
  check('head bubble follows the walking peer',!!walked&&Math.abs(walked.x-start.x)>5);
  await pa.keyboard.press('Space');await pb.waitForTimeout(400);const jumped=await speech.boundingBox();
  check('head bubble follows the animated jumping head',!!jumped&&jumped.y<walked.y-8);await pb.screenshot({path:path.join(out,'jump-head-bubble.png')});
  await pa.waitForTimeout(1300);
  await pa.setViewportSize({width:390,height:844});await pa.click('#chat-toggle');await pa.screenshot({path:path.join(out,'mobile-chat.png')});
  check('390px chat panel and send button stay in viewport',await pa.locator('#campus-chat').evaluate(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&n.scrollWidth<=n.clientWidth+1;}));
  await pa.setViewportSize({width:844,height:390});await pa.waitForTimeout(100);await pa.screenshot({path:path.join(out,'landscape-chat.png')});
  check('landscape keeps input and close control visible',await pa.locator('#chat-input').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}));
  await pa.click('#presence-toggle');await pa.waitForFunction(()=>!window.__campusHub.chat().joined);check('leaving disables sending immediately',await pa.locator('#chat-send').isDisabled());
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify({checks,errors},null,2));
 }catch(error){console.error(error);if(pa){await pa.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});console.log(await pa.evaluate(()=>({progress:document.querySelector('#progress')?.textContent,chat:window.__campusHub?.chat(),presence:window.__campusHub?.presence()})).catch(()=>{}));}process.exitCode=1;
 }finally{await browser?.close();app.campusLive.close();app.studyRooms.close();await app.integrations.close();await app.community.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));if(path.dirname(temp)!==dataRoot||!path.basename(temp).startsWith('chat-browser-'))throw Error('Unsafe cleanup');fs.rmSync(temp,{recursive:true,force:true});}
})();
