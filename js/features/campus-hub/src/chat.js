import * as T from 'three';

export function createCampusChat({panel,camera,selfId,send,join,clearInput,changed,getHead}){
 const toggle=document.createElement('button');toggle.id='chat-toggle';toggle.type='button';toggle.textContent='聊天';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','campus-chat');panel.append(toggle);
 const drawer=document.createElement('section');drawer.id='campus-chat';drawer.hidden=true;drawer.setAttribute('aria-label','同场聊天');
 drawer.innerHTML=`<header><div><span class="panel-eyebrow">校园频道</span><h2>同场聊天</h2></div><button type="button" data-chat-close aria-label="收起聊天">收起</button></header><p class="chat-intro">同一校园可见 · 最近 50 条临时消息</p><ol id="chat-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="同场消息"></ol><p class="chat-empty">和同场同学打个招呼吧。</p><button type="button" data-chat-join>登录 / 加入同场</button><form><label class="sr-only" for="chat-input">发送给同场同学</label><textarea id="chat-input" rows="2" maxlength="280" placeholder="说点什么… Enter 发送，Shift+Enter 换行"></textarea><button id="chat-send" type="submit">发送</button></form><div class="chat-bottom"><span id="chat-status" role="status"></span><span id="chat-count">0 / 140</span></div>`;
 document.body.append(drawer);
 const overlay=document.createElement('div');overlay.id='campus-speech';overlay.setAttribute('aria-hidden','true');document.body.append(overlay);
 const find=s=>drawer.querySelector(s),log=find('#chat-log'),input=find('#chat-input'),submit=find('#chat-send'),status=find('#chat-status'),empty=find('.chat-empty'),joinButton=find('[data-chat-join]');
 const items=new Map(),bubbles=new Map(),point=new T.Vector3();let joined=false,unread=0,busy=false,nonce='',nonceText='',epoch=0,disposed=false;
 function badge(){toggle.textContent=unread?'聊天 · '+Math.min(unread,99):'聊天';}
 function paint(){input.disabled=!joined;submit.disabled=!joined||busy||![...input.value.trim()].length||[...input.value.trim()].length>140;joinButton.hidden=joined;empty.hidden=items.size>0;find('#chat-count').textContent=[...input.value].length+' / 140';}
 function layout(){const view=window.visualViewport,keyboard=view?Math.max(0,innerHeight-view.height-view.offsetTop):0;drawer.style.bottom=keyboard>100?keyboard+8+'px':'';drawer.style.maxHeight=keyboard>100?Math.max(150,view.height-24)+'px':'';}
 function close(focus=true){drawer.hidden=true;toggle.setAttribute('aria-expanded','false');document.body.dataset.chatOpen='false';clearInput();changed();if(focus)document.querySelector('#world')?.focus({preventScroll:true});}
 function open(){if(disposed)return;drawer.hidden=false;toggle.setAttribute('aria-expanded','true');document.body.dataset.chatOpen='true';unread=0;badge();clearInput();changed();layout();if(joined)input.focus({preventScroll:true});else joinButton.focus();log.scrollTop=log.scrollHeight;}
 toggle.onclick=()=>drawer.hidden?open():close();find('[data-chat-close]').onclick=()=>close();joinButton.onclick=()=>{close(false);join();};
 function setJoined(value){joined=!!value;if(!joined){epoch++;busy=false;for(const bubble of bubbles.values())bubble.node.remove();bubbles.clear();status.textContent='登录并加入同场后可发送消息';}else status.textContent='Enter 发送 · Esc 收起';paint();}
 function reset(){epoch++;nonce='';nonceText='';input.value='';items.clear();log.replaceChildren();unread=0;badge();for(const bubble of bubbles.values())bubble.node.remove();bubbles.clear();paint();}
 function receive(message,history=false){
  if(!message||typeof message.id!=='string'||typeof message.playerId!=='string'||typeof message.nick!=='string'||typeof message.text!=='string'||!Number.isFinite(message.at)||[...message.text].length>140||items.has(message.id))return;
  const nearBottom=log.scrollHeight-log.scrollTop-log.clientHeight<45,mine=message.playerId===selfId();
  const row=document.createElement('li');row.dataset.message=message.id;if(mine)row.className='chat-mine';
  const meta=document.createElement('div'),name=document.createElement('strong'),time=document.createElement('time'),body=document.createElement('p');
  name.textContent=message.nick+(mine?' · 我':'');time.dateTime=new Date(message.at).toISOString();time.textContent=new Date(message.at).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});meta.append(name,time);body.textContent=message.text;row.append(meta,body);log.append(row);items.set(message.id,message);
  if(items.size>50){items.delete(items.keys().next().value);log.firstElementChild?.remove();}
  if(nearBottom||mine)log.scrollTop=log.scrollHeight;
  if(!history){
   if(drawer.hidden&&!mine){unread++;badge();}
   let bubble=bubbles.get(message.playerId);if(!bubble){const node=document.createElement('div');node.className='speech-bubble'+(mine?' speech-self':'');node.dataset.speaker=message.playerId;node.hidden=true;overlay.append(node);bubble={node};bubbles.set(message.playerId,bubble);}
   bubble.node.textContent=message.text;bubble.until=performance.now()+6500;
  }
  paint();
 }
 async function onSubmit(event){
  event.preventDefault();if(!joined||busy)return;
  const text=input.value.trim();if(!text||[...text].length>140){status.textContent='请输入 1—140 字';return;}
  if(text!==nonceText||!nonce){nonce=crypto.randomUUID();nonceText=text;}
  const current=epoch;busy=true;status.textContent='发送中…';paint();
  try{const result=await send({text,clientId:nonce});if(disposed||current!==epoch)return;if(!result?.ok)throw Error(result?.error||'发送失败，请重试');receive(result.message);if(input.value.trim()===text)input.value='';nonce='';nonceText='';status.textContent='已发送 · 头顶气泡显示约 6 秒';}
  catch(error){if(current===epoch)status.textContent=error.message+'，内容已保留';}
  finally{if(current===epoch&&!disposed){busy=false;paint();input.focus({preventScroll:true});}}
 }
 drawer.querySelector('form').onsubmit=onSubmit;
 input.oninput=()=>{paint();clearInput();};input.onfocus=clearInput;
 input.onkeydown=event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229){event.preventDefault();drawer.querySelector('form').requestSubmit();}};
 function escape(event){if(!drawer.hidden&&event.key==='Escape'&&!event.isComposing){event.preventDefault();event.stopImmediatePropagation();close();}}
 document.addEventListener('keydown',escape,true);window.visualViewport?.addEventListener('resize',layout);addEventListener('resize',layout);
 return {
  open,close,setJoined,reset,receive,get isOpen(){return !drawer.hidden;},
  history(messages){for(const message of Array.isArray(messages)?messages.slice(-50):[])receive(message,true);},
  update(){const now=performance.now();for(const [id,bubble]of bubbles){if(now>=bubble.until){bubble.node.remove();bubbles.delete(id);continue;}const head=getHead(id);if(!head?.visible){bubble.node.hidden=true;continue;}point.set(head.x,head.y+.26,head.z).project(camera);const visible=point.z>=-1&&point.z<=1&&Math.abs(point.x)<.95&&Math.abs(point.y)<.95;bubble.node.hidden=!visible;if(visible)bubble.node.style.transform=`translate(-50%,-100%) translate(${(point.x*.5+.5)*innerWidth}px,${(-point.y*.5+.5)*innerHeight}px)`;}},
  snapshot:()=>({open:!drawer.hidden,joined,unread,messages:[...items.values()],bubbles:[...bubbles].map(([id,b])=>({playerId:id,text:b.node.textContent,visible:!b.node.hidden}))}),
  dispose(){disposed=true;epoch++;document.removeEventListener('keydown',escape,true);window.visualViewport?.removeEventListener('resize',layout);removeEventListener('resize',layout);drawer.remove();overlay.remove();toggle.remove();}
 };
}
