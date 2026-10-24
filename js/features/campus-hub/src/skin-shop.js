import * as T from 'three';
import catalog from '../../../../server/campus/skin-catalog.json';
import {createStudentAvatar} from './avatar.js';

const site=()=>new URL('../../../',document.baseURI);
const token=()=>localStorage.getItem('xwy_token')||'';
const cloud=()=>!!token()&&!token().startsWith('local.');
export async function skinRequest(path,body){
 const response=await fetch(String(window.WG_DEPLOY?.apiBase||'').replace(/\/$/,'')+'/api/skins/'+path,{
  method:body?'POST':'GET',headers:{Authorization:'Bearer '+token(),...(body?{'Content-Type':'application/json'}:{})},
  ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)
 });
 const data=await response.json();if(!response.ok||!data.ok)throw Error(data.error||'暂时无法连接商城');return data.wallet;
}
export function createSkinShop({avatar,clearInput,status,toast,openAccount}){
 const dialog=document.createElement('dialog');dialog.id='skin-shop-dialog';dialog.setAttribute('aria-labelledby','skin-shop-title');
 dialog.innerHTML=`<header class="skin-head"><div><span class="panel-eyebrow">校园衣橱 · 用学习兑换新形象</span><h2 id="skin-shop-title">选一个今天的自己</h2></div><button data-close>关闭 <small>Esc</small></button></header>
 <div class="skin-balance"><strong data-balance>登录后同步学习币</strong><button data-learn>去教室赚学习币</button></div>
 <p class="skin-rules">正式题库中，可自动判分的选择题每天首次答对获得 10 学习币，每日最多 200。兑换永久保留在账号中；初始形象可免费穿戴。</p>
 <div class="skin-layout"><section class="skin-preview" aria-label="人物和动作预览"><canvas aria-label="所选人物三维预览"></canvas><p data-loading role="status"></p><h3 data-name></h3><div class="skin-motion" aria-label="试播动作"></div><p data-credit></p><button data-equip></button></section>
 <section class="skin-library" aria-label="皮肤列表"><label>浏览形象 <select data-filter><option value="all">全部形象</option><option value="owned">我的衣橱</option><option value="vrm">二次元</option><option value="other">卡通与抽象</option></select></label><div class="skin-grid"></div></section></div><p class="skin-message" role="status" aria-live="polite"></p>`;
 document.body.append(dialog);
 const find=s=>dialog.querySelector(s),grid=find('.skin-grid'),message=find('.skin-message');
 const toolbar=document.createElement('button');toolbar.id='skin-shop';toolbar.textContent='皮肤商城';toolbar.setAttribute('aria-haspopup','dialog');document.querySelector('#controls-help').before(toolbar);
 let restoreGeneration=0;
 let wallet=null,selected=catalog.skins[0],preview=null,renderer=null,scene=null,camera=null,clock=null,request=0,disposed=false,busy=false,lastToken='',opening=0;
 const starters=catalog.skins.filter(s=>s.starter).map(s=>s.id);
 const owned=s=>s.starter||!!wallet?.owned.includes(s.id);
 function paint(){
  find('[data-balance]').textContent=wallet?wallet.balance+' 学习币':'登录后同步学习币';
  const filter=find('[data-filter]').value;
  grid.replaceChildren();
  for(const skin of catalog.skins){
   if(filter==='owned'&&!owned(skin)||filter==='vrm'&&!skin.rig.startsWith('vrm')||filter==='other'&&skin.rig.startsWith('vrm'))continue;
   const button=document.createElement('button');button.className='skin-card';button.dataset.skin=skin.id;button.setAttribute('aria-pressed',String(selected.id===skin.id));
   if(skin.thumbnail){const img=document.createElement('img');img.src=new URL(skin.thumbnail,site());img.alt='';img.loading='lazy';img.width=240;img.height=180;button.append(img);}
   const title=document.createElement('strong'),price=document.createElement('span');title.textContent=skin.name;price.textContent=(avatar.variant===skin.id?'已穿戴':owned(skin)?'已拥有':skin.price+' 学习币');button.append(title,price);button.onclick=()=>select(skin);grid.append(button);
  }
  find('[data-name]').textContent=selected.name;
  const credit=find('[data-credit]');credit.replaceChildren(document.createTextNode([selected.author,selected.license].filter(Boolean).join(' · ')));
  if(selected.credit){const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='来源与授权';detail.append(summary,document.createTextNode(selected.credit));if(selected.source){const link=document.createElement('a');link.textContent=' 查看原始来源';link.href=selected.source;link.target='_blank';link.rel='noopener noreferrer';detail.append(link);}credit.append(detail);}

  const action=find('[data-equip]');action.disabled=busy||!preview||preview.variant!==selected.id;
  action.textContent=busy?'处理中…':avatar.variant===selected.id?'当前形象':owned(selected)?'穿戴此形象':cloud()?'兑换并穿戴 · '+selected.price+' 学习币':'登录后兑换';
 }
 function release(){request++;preview?.dispose();preview=null;if(renderer){renderer.setAnimationLoop(null);renderer.dispose();renderer=null;}scene=null;camera=null;}
 function fitPreview(){if(!preview||!camera)return;const bounds=new T.Box3().setFromObject(preview.model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),distance=Math.max(size.y,size.x/camera.aspect)*.65/Math.tan(camera.fov*Math.PI/360);camera.position.set(center.x,center.y+.04,distance+size.z*.5);camera.lookAt(center);}
 async function select(skin){
  selected=skin;const id=++request;preview?.dispose();preview=null;find('.skin-motion').replaceChildren();find('[data-loading]').textContent='正在加载所选人物…';paint();
  try{
   const model=await createStudentAvatar(scene,{variant:skin.id,castShadow:false});
   if(disposed||!dialog.open||id!==request){model.dispose();return;}
   preview=model;preview.setVisible(true);preview.update({position:{x:0,z:0},yaw:.28,dt:0});
   fitPreview();
   find('[data-loading]').textContent='拖动人物可旋转；动作沿用模型骨骼。';
   for(const [state,label]of [['idle','待机'],['walk','走路'],['run','跑步'],['jump','跳跃'],['wave',skin.greeting||'打招呼'],['punch','挥拳']]){
    const button=document.createElement('button');button.textContent=label;button.dataset.motion=state;button.disabled=!model.clips.includes(state);
    button.onclick=()=>{preview.cancelAction();if(['jump','wave','punch'].includes(state)){preview.previewMotion='idle';preview.act(state);}else preview.previewMotion=state;};find('.skin-motion').append(button);
   }
   if(skin.rig==='fox')find('[data-loading]').textContent='小狐狸提供原生待机、走路、跑步；没有跳跃和挥拳动画。';
   paint();
  }catch(error){if(id===request){find('[data-loading]').textContent='人物加载失败，点击卡片可重试。';message.textContent=error.message;paint();}}
 }
 async function refresh(){wallet=cloud()?await skinRequest('wallet'):null;lastToken=token();paint();}
 async function restore(){
  const revision=++restoreGeneration,boot=avatar.model?Promise.resolve():avatar.equip('robot').catch(()=>{});
  let id=new URLSearchParams(location.search).get('avatar')||'anime';
  try{if(cloud()){wallet=await skinRequest('wallet');id=wallet.equipped;}else{id=new URLSearchParams(location.search).get('avatar')||localStorage.getItem('xwy_starter_skin')||'anime';if(!starters.includes(id))id='anime';}}catch{ id='anime'; }
  await boot;if(disposed||revision!==restoreGeneration)return;try{if(avatar.variant!==id)await avatar.equip(id);}catch{toast('人物暂未加载，可继续漫游，在皮肤商城重试。');}
 }
 function close(){opening++;dialog.close();release();clearInput();status();toolbar.focus();}
 toolbar.onclick=async()=>{
  if(dialog.open)return;const open=++opening;dialog.showModal();clearInput();avatar.cancelAction();status();message.textContent='';
  scene=new T.Scene();scene.background=new T.Color('#1d302e');scene.add(new T.HemisphereLight(0xffffff,0x6d7d83,2.3));const light=new T.DirectionalLight(0xffebd7,2.4);light.position.set(3,5,4);scene.add(light);
  renderer=new T.WebGLRenderer({canvas:find('canvas'),antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;camera=new T.PerspectiveCamera(32,1,.01,30);clock=new T.Clock();
  renderer.setAnimationLoop(()=>{if(!dialog.open)return;const canvas=find('canvas'),w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();fitPreview();}
   const dt=Math.min(clock.getDelta(),.05),motion=preview?.previewMotion;preview?.update({position:{x:0,z:0},yaw:preview.previewYaw??.28,dt,moving:motion==='walk'||motion==='run',sprinting:motion==='run'});renderer.render(scene,camera);});
  selected=catalog.skins.find(s=>s.id===avatar.variant)||catalog.skins[0];select(selected);
  try{await refresh();}catch(error){if(open===opening){wallet=null;message.textContent=error.message+'；仍可预览和穿戴免费形象。';paint();}}
 };
 let drag=null;find('canvas').onpointerdown=e=>{drag=e.clientX;find('canvas').setPointerCapture(e.pointerId);};find('canvas').onpointermove=e=>{if(drag===null||!preview)return;preview.previewYaw=(preview.previewYaw??.28)+(e.clientX-drag)*.01;drag=e.clientX;};find('canvas').onpointerup=find('canvas').onpointercancel=()=>drag=null;
 find('[data-close]').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});find('[data-filter]').onchange=paint;
 find('[data-learn]').onclick=()=>{close();document.querySelector('[data-place="classroom"]')?.click();document.querySelector('[data-guide-place="classroom"]')?.click();toast('去教学楼坐下后按 E，进入正式题库。每题每日首次答对可获得学习币。');};
 find('[data-equip]').onclick=async()=>{
  if(busy)return;if(!owned(selected)&&!cloud()){close();openAccount();return;}
  const skin=selected;busy=true;paint();message.textContent='';
  try{
   if(cloud()){if(!owned(skin))wallet=await skinRequest('purchase',{id:skin.id});wallet=await skinRequest('equip',{id:skin.id});}
   if(await avatar.equip(skin.id)){if(skin.starter)localStorage.setItem('xwy_starter_skin',skin.id);message.textContent='已穿戴 '+skin.name+'，关闭后继续校园漫游。';toast('已换上 '+skin.name);}
  }catch(error){message.textContent=error.message;}finally{busy=false;if(!disposed)paint();}
 };
 function authChanged(){if(token()!==lastToken){wallet=null;lastToken=token();if(dialog.open)refresh().catch(error=>{message.textContent=error.message;});restore();}}
 addEventListener('storage',authChanged);
 window.__campusSkins={snapshot:()=>({selected:selected.id,preview:preview?.snapshot(),wallet:wallet?{balance:wallet.balance,owned:[...wallet.owned],equipped:wallet.equipped}:null})};
 dialog.addEventListener('campus-dispose',()=>{disposed=true;opening++;release();removeEventListener('storage',authChanged);dialog.remove();toolbar.remove();});
 return {restore};
}
