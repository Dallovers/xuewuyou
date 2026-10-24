import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {createWorld} from './world.js';
import {createStudentAvatar} from './avatar.js';
import {createArenaDuelAvatar} from './arena-opponent.js';
import {createArenaDuel, DUEL_TOP, DUEL_STATIONS, otherSeat} from './duel.js';
import {createDuelPanel} from './duel-panel.js';
import {createNavigation} from './navigation.js';
import {ENTRIES,SITE_EXIT,START,ARENA_ROOT,groundAt} from './layout.js';
import {readReturn,restorePose,KEY} from './return-state.js';
import {createBusinessBridge} from './business.js';
import {createVisualEffects} from './visual-effects.js';
import {createSkyEnvironment} from './sky-environment.js';
import {createCampusPresence} from './presence.js';

const $=selector=>document.querySelector(selector),canvas=$('#world'),scene=new T.Scene(),camera=new T.PerspectiveCamera(49,innerWidth/innerHeight,.1,350);
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.87;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
scene.background=new T.Color(0xd4ddd8);scene.fog=new T.Fog(0xd4ddd8,145,270);
const hemisphere=new T.HemisphereLight(0xe3edf1,0x686c5c,.36);scene.add(hemisphere);const sun=new T.DirectionalLight(0xffefd9,2.6);sun.position.set(-40,62,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.radius=2.2;Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:170});sun.shadow.normalBias=.016;sun.shadow.bias=-.00002;scene.add(sun);scene.add(sun.target);
const effects=createVisualEffects(renderer,scene,camera,sun);
const orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.minDistance=8;orbit.maxDistance=180;orbit.maxPolarAngle=Math.PI*.49;
const state={ready:false,mode:'overview',...START,seated:null,stance:null,path:null,frames:0,returnRestored:false};
const keys=new Set(),clock=new T.Clock();let presence,studyPicker,pickerEnabled=false,world,avatar,opponent,duel,duelHint,duelPanel,sky,navigation,drag,nearest,disposed=false,toastTimer,lastShadow=0,studentYaw=0,lastX=0,lastZ=START.z,cameraCheck=0,cameraDistance=5.3,cameraBoxes=[],smoothGround=0;
const coarsePointer=matchMedia('(pointer:coarse)');
const ray=new T.Raycaster(),aim=new T.Vector3(),direction=new T.Vector3(),targetCamera=new T.Vector3();
const bridge=createBusinessBridge({clearInput,route:goTo,equipment:()=>world?.interiors.systems,status:()=>{if(bridge.paused)avatar?.cancelAction();syncControls();}});
function syncControls(){
 const walking=state.ready&&state.mode==='walk',paused=bridge.paused,fixed=!!state.seated||!!state.stance;
 $('#touch').hidden=!walking||fixed||paused||!(coarsePointer.matches||innerWidth<700);
 $('#actions').hidden=!walking||fixed||paused;
 $('#seat-tools').hidden=!state.seated||paused;
 $('#book-actions').hidden=!pickerEnabled||!studyPicker?.isHolding()||paused;
 if(document.body.dataset.seated!==String(fixed))document.body.dataset.seated=String(fixed);
}
function setPlaces(open,focus=false){
 clearInput();$('#places').hidden=!open;$('#directory').setAttribute('aria-expanded',String(open));document.body.dataset.placesOpen=String(open);
 if(focus)(open?$('#close-places'):$('#directory')).focus({preventScroll:true});
}
function measureHUD(){
 const headerBottom=Math.ceil($('.campus-toolbar').getBoundingClientRect().bottom),dockHeight=Math.ceil($('footer').getBoundingClientRect().height);
 document.documentElement.style.setProperty('--header-bottom',headerBottom+'px');document.documentElement.style.setProperty('--dock-height',dockHeight+'px');
}
const hudObserver=new ResizeObserver(measureHUD);hudObserver.observe($('.campus-toolbar'));hudObserver.observe($('footer'));
function clearInput(){keys.clear();drag=null;state.path=null;}
function focusScene(){if(state.ready&&state.mode==='walk'&&!bridge.paused&&!disposed)canvas.focus({preventScroll:true});}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);}
function configureWater(){const q=$('#quality').value;world?.courtyard.configureQuality(q==='auto'&&state.mode==='walk'?'fluid':q,innerWidth);}
function resize(){const q=$('#quality').value,ratio=q==='high'?1.5:q==='fluid'?.8:innerWidth<700?.9:1;renderer.setPixelRatio(Math.min(devicePixelRatio,ratio));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();effects.resize(innerWidth,innerHeight,q);configureWater();renderer.shadowMap.needsUpdate=true;syncControls();measureHUD();}
function setMode(mode){if(!state.ready)return;state.seated?.onStand?.();clearInput();avatar.cancelAction();state.seated=null;state.stance=null;
/* 旧版化身有 setStation(null)，第十五轮换成 duel 驱动的 arrive/depart：
   离开作答位时这里要主动撤人，否则换模式后对手会留在台上。 */
if(opponent?.visible)opponent.depart();
closeDuelPanel();duel?.leave();showDuelHint('');
state.mode=mode;orbit.enabled=mode==='overview';$('#overview').setAttribute('aria-pressed',String(mode==='overview'));$('#walk').setAttribute('aria-pressed',String(mode==='walk'));syncControls();setPlaces(false);configureWater();if(mode==='overview'){camera.position.set(56,57,68);orbit.target.set(3,1,-4);orbit.update();}else{canvas.focus();updateCamera(.1);}}
/* 起身：两个"定点"共用一条出口——自习室的座位（state.seated）和擂台的作答位（state.stance）。
   作答位是先锁住移动的，所以没有"走开就自动取消"这条路，只能就地解除。 */
function stand(){if(state.stance){closeDuelPanel();duel?.leave();state.stance=null;avatar.cancelAction();focusScene();toast('已离开作答位');return;}if(!state.seated)return;state.seated.onStand?.();state.seated=null;clearInput();focusScene();toast('已起身');}
function goTo(id){if(!state.ready||bridge.paused)return;stand();setMode('walk');if(world.inside(state))world.interiors.open(world.inside(state),true);const entry=ENTRIES.find(e=>e.id===id)||(id===SITE_EXIT.id?SITE_EXIT:null);if(!entry)return;const goal={x:entry.outside[0],z:entry.outside[1]};const route=navigation.route(state,goal);if(!route){toast('暂时找不到通路，请换个站位重试。');return;}state.path=route;toast('正在前往'+entry.label+(id===SITE_EXIT.id?'，走近后按 E 返回网站。':'，走近后按 E 互动。'));}
function exitSite(){clearInput();try{sessionStorage.removeItem(KEY);}catch{}location.assign(new URL('../../../index.html#home',document.baseURI).href);return{ok:true};}
function findNearest(){
 nearest=null;if(!state.ready||state.mode!=='walk'||bridge.paused)return;
 /* 姿态动作（wave/punch）播放期间原来会整体吞掉提示，作答位这里要例外：
   人是锁在站位上的，动作一播完还会再按，提示中途消失会让人以为卡住了。 */
 if(pickerEnabled&&(studyPicker.isHolding()||studyPicker.getAim())){nearest={id:'study.pick',label:studyPicker.isHolding()?'放回 · '+studyPicker.getHeldLabel():'拿起 · '+studyPicker.getAim().label,action:()=>{studyPicker.isHolding()?studyPicker.putBack():studyPicker.take();return{ok:true};}};return;}
 if(state.seated){nearest={label:'起身继续行走',action:stand};return;}
 /* 作答位：E 不再"再就位一次"，而是重复做那个动作（举手抢答）。
    对手跟着回一次——台上两个人一起动，才读成"在对答"，而不是一个人在空台上挥手。 */
 if(state.stance){nearest={id:'arena.answer',label:'举手抢答',action:()=>{avatar.act('wave',smoothGround);duel?.act('cheer');return{ok:true,message:duel?.peer?'举手抢答 · 对面 '+duel.peer.nick+' 也看得见':'举手抢答（对面还没人就位）'};}};return;}
 if(avatar.actionState.current)return;
 const entries=ENTRIES.map(e=>({id:e.id,label:'进入'+e.label,distance:Math.hypot(state.x-e.at[0],state.z-e.at[1]),radius:2.3,action:()=>world.enter(e.id)}));
 for(const item of world.interactions){if(item.disabled)continue;const p=item.object.getWorldPosition(new T.Vector3());entries.push({...item,distance:Math.hypot(state.x-p.x,state.z-p.z)});}
 nearest=entries.filter(i=>i.distance<=i.radius).sort((a,b)=>a.distance-b.distance)[0]||null;
}
async function activate(){if(!state.ready||bridge.paused)return;if(state.mode==='overview'){setMode('walk');toast('漫游已开启，走近设施后按 E，或点击底部互动按钮。');return;}if(!nearest)return;clearInput();try{const result=await nearest.action?.();if(result?.kind==='seat'){state.seated=result;state.pitch=0;state.yaw=Math.atan2(result.directions[0][0],-result.directions[0][2]);toast('已坐下，拖动环顾，按 E 或 Esc 起身。');}else if(result?.kind==='pose'){
   /* 擂台作答位（arena-district.js 的 arena.stage.jia / .yi）。
      位置是直接摆过去的，不走寻路——站位点就在 1.7m 判定半径内，
      摆过去的落点和原地只差半步，走一段反而像"绕到台后"。
      就位之后**不做本地演出**：对面是谁、在不在，一律由 duel.js 从服务端取；
      这里只负责"我在哪"。没有真人就位时对面就该是空的，不摆占位替身。 */
   state.stance={id:result.station,name:'擂台上 · '+(result.seat||'')+'位作答'};
   /* 三个坐标体系不能混：
      result.stand 是**竞技场板块的局部坐标**（arena-district.js 的 root 局部），
      state.x/z 是**世界坐标**（导航、碰撞、groundAt 都按这个算）。
      两者差一个 ARENA_ROOT 的偏移——把局部值直接写进 state，人会被瞬移到庭院水池边
      （实测 x 1.8 / z 2.14，正是出发点附近）。这里换成世界坐标再落位。 */
   if(result.stand){const wx=ARENA_ROOT.x+result.stand[0],wz=ARENA_ROOT.z+result.stand[2];state.x=wx;state.z=wz;lastX=wx;lastZ=wz;smoothGround=groundAt(wx,wz);}
   /* 站位报的是"相机朝向"的约定（0 朝 -Z），人物自身朝向差一个 π，
      和 init 里 studentYaw=π−state.yaw 是同一条换算。 */
   state.yaw=Number.isFinite(result.yaw)?result.yaw:state.yaw;studentYaw=Math.PI-state.yaw;state.pitch=0;
   avatar.act(result.clip||'wave',smoothGround);
   /* 告诉服务端我在哪个位。对面若有人，他的化身随后由 duel 状态落地（见 syncDuel）；
     这里不预先摆一个"占位对手"——没有真人在线，对面本来就该是空的。
     返回值的四种情况对应四种真实处境，别混成一句"正在等"：
       ok=false                  → 服务端拒了（位子被别人占了 / 不是你的挑战）
       online=false & challenge  → 挑战在，但这条连接还没就绪，座位表还没回来
       online=false & 无 challenge → 根本还没有进行中的挑战，台上没房
       online=true               → 我真的坐下了，peer 有值就是对面已经有人 */
   const posed=await duel?.enter(result.station).catch(()=>null);
   const hint=!posed?' · 本地站位（未登录云端）'
     :!posed.ok?' · '+posed.message
     :!posed.online?(posed.challenge?' · 正在连接擂台现场':' · 还没有进行中的挑战')
     :posed.peer?' · 对面是 '+posed.peer.nick+'（'+posed.peer.seat+'位）'
     :' · 已在'+posed.station+'位，正在等搭子就位';
   toast((result.message||'已就位')+hint+' · 按 E 举手，Esc 起身');
   /* 坐到作答位就把题目端上来：真正「在台上一起答题」靠的就是这一步。
     只有真的坐到台上（online）才开面板；离线/没有挑战时台上只有人、没有题。 */
   if(posed?.online&&posed.challenge)openDuelPanel();
  }else if(result?.kind==='equipment'){bridge.openFeature('equipment');}else if(result?.kind==='note'){bridge.openFeature('note',{text:result.text});}else if(result?.message)toast(result.message);}catch(error){toast('操作未完成：'+error.message);}finally{focusScene();}}
function jump(){if(state.mode==='walk'&&!bridge.paused&&!state.seated&&!state.stance)avatar?.act('jump',smoothGround);}
/* ---------- 擂台现场：把服务端的状态落到 3D 上（第十五轮） ----------
 * 这一段是"真人 vs 真人"的落地处，规则只有三条：
 *   1) 对面有人在那个位 → 在那个位生成他的化身；没人 → 撤掉，并挂一块等候提示；
 *   2) 对面做了什么动作 → 播对应的 clip；其余时间一律 idle，不做本地表演；
 *   3) 我不在作答位 → 对手化身全部撤掉，擂台回归空的。
 * 判分、计时、交卷都不在这里：它们由 DOM 面板走 /api/community/*，服务端说了算。
 */
function syncDuel(){
 if(!duel)return;
 const peer=duel.peer;
 if(!state.stance){if(opponent?.visible)opponent.depart();showDuelHint('');return;}
 if(!peer){
  /* 我站上台了，但对面那个位没人。这里必须说清是「等人」还是「没比赛」，
   * 否则空台会被读成"游戏坏了"。 */
  if(opponent?.visible)opponent.depart();
  const s=duel.snapshot;
  const opposite=otherSeat(s.station);
  showDuelHint(!s.challenge
    ?(s.status==='connecting'?'正在连接擂台现场…':'还没有进行中的挑战')
    :'正在等搭子就位'+(opposite?' · 对面那位上线后会出现在'+DUEL_STATIONS[opposite].seat+'位':''));
  return;
 }
 /* 别人朝我，正好是我朝向的 π：我在甲位（yaw π）时他在乙位（yaw 0） */
 const facing=Math.PI-(peer.seat==='jia'?Math.PI:0);
 if(opponent?.visible&&opponent.seat===peer.seat){
  showDuelHint(peer.submitted?peer.nick+' · 已交卷':peer.nick+' · 已在对面');
 }else if(opponent){
  opponent.arrive(peer.seat,peer.nick,facing);
  showDuelHint(peer.nick+' · 已就位');
  toast(peer.nick+' 也上台了，两人一起作答。');
 }
 const act=duel.peerAct;
 if(act)opponent?.act(act.act,act.at);
 /* 对手那头交卷了：本地只换提示，不替他宣布成绩 */
 if(peer.submitted)showDuelHint(peer.nick+' · 已交卷');
 /* 注意：作答面板不在这里刷。syncDuel 每帧都跑，而面板重绘要重建题目 DOM，
   每帧做一次等于把答题卡在地上摩擦。面板改为订阅 duel.onChange（见 init），
   只在 socket 事件真正带来变化时刷新。 */
}
function showDuelHint(text){
 if(!duelHint)return;
 /* syncDuel 每帧都跑，文案没变就不要碰 DOM——每帧写 textContent 会让浏览器一直重排。 */
 if(duelHint.dataset.text===text)return;
 duelHint.dataset.text=text;
 duelHint.textContent=text;
 duelHint.hidden=!text;
}
/* ---------- 作答面板（第十六轮） ----------
 * 坐到作答位上就把题目端出来，人在台上直接答题、直接交卷。
 * 面板只负责显示和收集选择；判分/计时/胜负全在服务端（见 duel-panel.js 顶部说明）。
 * 打开期间角色不能走：WASD 会被面板吃掉，键盘交给选项和交卷。 */
function openDuelPanel(){if(!duelPanel)return;clearInput();duelPanel.open();}
function closeDuelPanel(){duelPanel?.close();}
/* 面板开着时，键盘归面板：移动键、E、空格都不该再驱动角色。 */
const duelPanelOpen=()=>!!duelPanel?.isOpen;
function updateCamera(dt){
 if(!state.seated&&world?.inside(state)){camera.position.set(state.x,smoothGround+1.6+(avatar?.jumpHeight||0),state.z);camera.lookAt(state.x+Math.sin(state.yaw),camera.position.y-state.pitch,state.z-Math.cos(state.yaw));return;}
 if(state.seated){camera.position.fromArray(state.seated.position);camera.lookAt(camera.position.x+Math.sin(state.yaw),camera.position.y-state.pitch,camera.position.z-Math.cos(state.yaw));return;}
 const ground=smoothGround,height=avatar?.jumpHeight||0;aim.set(state.x,ground+1.12+height*.65,state.z);direction.set(-Math.sin(state.yaw)*5,1.7+state.pitch*3,Math.cos(state.yaw)*5).normalize();
 if(performance.now()-cameraCheck>90){ray.set(aim,direction);cameraDistance=5.3;for(const box of cameraBoxes){const hit=ray.ray.intersectBox(box,new T.Vector3());if(hit)cameraDistance=Math.min(cameraDistance,Math.max(.5,hit.distanceTo(aim)-.2));}cameraCheck=performance.now();}
 targetCamera.copy(aim).addScaledVector(direction,cameraDistance);camera.position.copy(targetCamera);camera.lookAt(aim);
}
function frame(){
 if(disposed)return;const dt=Math.min(clock.getDelta(),.10),paused=bridge.paused||document.hidden;
 if(state.ready){
  const oldX=state.x,oldZ=state.z;
  if(state.mode==='walk'&&!paused&&!state.seated&&!state.stance&&!avatar.locksMovement){
   const forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),right=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
   if(forward||right){state.path=null;const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?6:3.6)*dt/Math.max(1,Math.hypot(forward,right));navigation.move(state,(Math.sin(state.yaw)*forward+Math.cos(state.yaw)*right)*speed,(-Math.cos(state.yaw)*forward+Math.sin(state.yaw)*right)*speed);}
   else if(state.path?.length){const goal=state.path[0],dx=goal.x-state.x,dz=goal.z-state.z,d=Math.hypot(dx,dz),distance=Math.min(d,dt*3.6);if(d<.10)state.path.shift();else{navigation.move(state,dx/d*distance,dz/d*distance);state.yaw=Math.atan2(dx,-dz);if(Math.hypot(state.x-oldX,state.z-oldZ)<.0001){state.path=null;toast('通路暂时受阻，请手动调整站位。');}}}
   state.yaw+=(Number(keys.has('KeyL'))-Number(keys.has('KeyJ')))*dt*1.6;
  }
  const dx=state.x-lastX,dz=state.z-lastZ,moving=Math.hypot(dx,dz)>.0001;if(moving){const angle=Math.atan2(dx,dz);studentYaw+=Math.atan2(Math.sin(angle-studentYaw),Math.cos(angle-studentYaw))*(1-Math.exp(-dt*18));}
  /* 地面高度做一次指数平滑再交给相机和人物（第十四轮）。
     原本直接把 groundAt() 的结果当脚底高度，擂台那三跑 0.21 的台阶在画面上是"瞬移"：
     一帧之内人抬 21cm，读成掉了帧。这里按 15/s 趋近，0.21 大约 0.15 秒抬完——
     正好是一个抬腿的时间，不再是跳上去。
     跳变超过 1.2m（setPose、返回状态、传送）直接吸附，不然人会在空中飘一段。 */
  const rawGround=groundAt(state.x,state.z);
  if(Math.abs(rawGround-smoothGround)>1.2)smoothGround=rawGround;
  else smoothGround+=(rawGround-smoothGround)*(1-Math.exp(-(paused?0:dt)*15));
  const inside=world.inside(state);hemisphere.intensity=inside?1.05:.36;avatar.setVisible(!state.seated&&!inside);avatar.update({position:{x:state.x,z:state.z,groundY:smoothGround},yaw:studentYaw,dt:paused?0:dt,moving:!paused&&moving,sprinting:keys.has('ShiftLeft')||keys.has('ShiftRight')||!!state.path});lastX=state.x;lastZ=state.z;
  opponent?.update(paused?0:dt);
  if(state.stance)syncDuel();
  world.update(paused?0:dt,{x:state.x,z:state.z});effects.fitShadow(state);if(state.mode==='overview')orbit.update();else updateCamera(dt);
  if(inside==='study'&&!pickerEnabled){studyPicker?.enable();pickerEnabled=!!studyPicker;}else if(inside!=='study'&&pickerEnabled){studyPicker.disable();pickerEnabled=false;}
  if(pickerEnabled)studyPicker.update(paused?0:dt);
  $('#room-exit').hidden=!inside||bridge.paused;syncControls();
  findNearest();$('#enter').disabled=bridge.paused||(state.mode!=='overview'&&!nearest);$('#enter').textContent=state.mode==='overview'?'开始漫游 · 开启互动':nearest?'E · '+nearest.label:'走近设施后按 E 互动';$('#jump').disabled=!!avatar.actionState.current||!!state.seated||!!state.stance;
  $('#location').textContent=inside?({classroom:'教学楼 · 门厅与示范教室',library:'知识图书馆',study:'自习室'})[inside]:state.seated?(state.seated.label||'社交广场 · 休息'):state.stance?state.stance.name:state.z<-15?'教学楼前庭':state.x<-20&&state.z<15?'图书馆前庭':state.x<-20&&state.z>=15?'自习室前庭':state.x>28?'竞技场':state.x>7&&state.z<14?'社交广场':'中央庭院';
  $('#instructions').textContent=state.mode==='overview'?'拖动旋转，滚轮缩放':state.stance?'作答中 · E 举手抢答 · Esc 起身':state.seated?'拖动环顾，E / Esc 起身':(coarsePointer.matches||innerWidth<700)?'方向键移动，拖动画面转向':'WASD 移动 · Shift 快跑 · E 互动';
  if(!paused&&(moving||avatar.actionState.current||opponent?.moving||world.interiors.moving())&&performance.now()-lastShadow>110){renderer.shadowMap.needsUpdate=true;lastShadow=performance.now();}state.frames++;
 }
 presence?.update(dt);effects.render();
}
const roomExit=document.createElement('button');roomExit.id='room-exit';roomExit.hidden=true;roomExit.textContent='回庭院';roomExit.onclick=()=>goTo(world.inside(state)||'classroom');$('#context-actions').append(roomExit);
const seatTools=document.createElement('div');seatTools.id='seat-tools';seatTools.hidden=true;seatTools.setAttribute('role','group');seatTools.setAttribute('aria-label','座位工具');$('#context-actions').append(seatTools);
for(const [label,fn]of [['起身',stand],['课程 / 资料',()=>state.seated?.feature==='courses'?bridge.openFeature('courses'):bridge.openFeature('library',{mode:'catalog',seated:true})],['阅读计时',()=>bridge.openFeature('library',{mode:'focus',seated:true})],['书签摘记',()=>bridge.openFeature('library',{mode:'shelf',seated:true})],['自习房间',()=>bridge.openFeature('rooms')]]){const b=document.createElement('button');b.textContent=label;b.onclick=fn;seatTools.append(b);}
const bookActions=document.createElement('div');bookActions.id='book-actions';bookActions.hidden=true;bookActions.setAttribute('role','group');bookActions.setAttribute('aria-label','手中书本');$('#context-actions').append(bookActions);for(const [label,fn]of [['翻书 Q',()=>studyPicker.toggleOpen()],['举起细看',()=>studyPicker.setInspect(!studyPicker.isInspecting())],['放下 G',()=>studyPicker.drop()]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{fn();focusScene();};bookActions.append(b);}
$('#overview').onclick=()=>setMode('overview');$('#walk').onclick=()=>setMode('walk');$('#directory').onclick=()=>setPlaces($('#places').hidden,true);$('#close-places').onclick=()=>setPlaces(false,true);$('#controls-help').onclick=()=>{setPlaces(false);bridge.openFeature('controls');};$('#enter').onclick=activate;$('#jump').onclick=()=>{jump();canvas.focus();};$('#quality').onchange=()=>{resize();focusScene();};$('#retry').onclick=()=>location.reload();
for(const entry of [...ENTRIES,SITE_EXIT]){const b=document.createElement('button');b.textContent=entry.label;b.dataset.place=entry.id;const span=document.createElement('span');span.textContent='前往';b.append(span);b.onclick=()=>goTo(entry.id);$('#destinations').append(b);}
$('#site-exit').onclick=e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();exitSite();};
addEventListener('keydown',e=>{
 if(!state.ready||e.target.closest?.('input,textarea,select,[contenteditable=true]')||bridge.paused)return;
 /* 作答面板开着时键盘全归面板：A/B/C/D 选项、Enter 交卷、Esc 下台。
    面板吃掉一切（连移动键也吃），人锁在作答位上，不该边走边答题。
    唯一例外是面板明确交回来的键（现在是 E）——底部写着「E 举手抢答」，
    那就得真的还能举手，不能给一个按了没反应的按钮。 */
 if(duelPanel?.isOpen&&duelPanel.handleKey(e)){e.preventDefault();return;}
 if(e.code==='Escape'){if(!$('#places').hidden){e.preventDefault();setPlaces(false,true);return;}stand();clearInput();return;}
 if(state.mode!=='walk'){if(e.code==='KeyE'&&!e.repeat){e.preventDefault();activate();}return;}
 if(!e.repeat&&pickerEnabled&&['KeyQ','KeyR','KeyG'].includes(e.code)){e.preventDefault();if(e.code==='KeyQ')studyPicker.toggleOpen();else studyPicker.drop();return;}
 if(!e.repeat&&e.code==='KeyC'&&world.inside(state)==='study'){e.preventDefault();if(state.seated){stand();return;}const seats=world.interactions.filter(i=>i.id.startsWith('study.seat.')).map(i=>({i,d:i.object.getWorldPosition(new T.Vector3()).distanceTo(new T.Vector3(state.x,0,state.z))})).sort((a,b)=>a.d-b.d);if(seats[0]?.d<1.65){nearest=seats[0].i;activate();}return;}
 if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyJ','KeyL'].includes(e.code)){e.preventDefault();focusScene();keys.add(e.code);state.path=null;}
 if(e.code==='KeyE'||e.code==='Space'&&!e.target.closest?.('button,a')){e.preventDefault();if(!e.repeat){if(e.code==='Space')jump();else activate();}}
});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',clearInput);
canvas.onpointerdown=e=>{if(duelPanel?.isOpen)return;if(e.button===2&&pickerEnabled&&!bridge.paused){studyPicker.setInspect(true);return;}if(bridge.paused||state.mode!=='walk')return;canvas.focus();canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};};
canvas.onpointermove=e=>{if(duelPanel?.isOpen)return;if(drag?.id!==e.pointerId||bridge.paused)return;state.yaw+=(e.clientX-drag.x)*.004;state.pitch=T.MathUtils.clamp(state.pitch+(e.clientY-drag.y)*.003,-.45,.7);drag.x=e.clientX;drag.y=e.clientY;};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;studyPicker?.setInspect(false);};
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{if(duelPanel?.isOpen)return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);state.path=null;};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key);}
addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{clearInput();studyPicker?.setInspect(false);clock.getDelta();if(state.ready)renderer.setAnimationLoop(document.hidden?null:frame);});
function dispose(){if(disposed)return;disposed=true;clearInput();clearTimeout(toastTimer);hudObserver.disconnect();renderer.setAnimationLoop(null);duelPanel?.dispose();presence?.dispose();bridge.dispose();avatar?.dispose();opponent?.dispose();duel?.dispose();duelHint?.remove();studyPicker?.disable();world?.dispose();effects.dispose();sky?.dispose();orbit.dispose();sun.shadow.dispose();scene.environment?.dispose();if(scene.background?.isTexture)scene.background.dispose();renderer.dispose();renderer.forceContextLoss();}
addEventListener('pagehide',dispose);addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
async function init(){try{
 resize();const hdr=await new RGBELoader().loadAsync(new URL('../../../examples/campus-3d-v5/assets/sky.hdr',document.baseURI).href),pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(hdr).texture;scene.environmentIntensity=.5;sky=createSkyEnvironment(hdr);scene.add(sky.mesh);pmrem.dispose();
 world=await createWorld(scene,(name,options)=>name==='exit-site'?exitSite():bridge.openFeature(name,options),text=>$('#progress').textContent=text,()=>state);navigation=createNavigation(world.boxes);
 await import(new URL('../study/pick.js?campus=interiors6',document.baseURI).href);studyPicker=window.StudyDistrict.pick.createPicker({THREE:T,camera,root:world.study.root,scene,dom:canvas,colliders:world.study.colliders,externalInput:true});
  configureWater();
 cameraBoxes=[...world.boxes,...world.cameraObstacles].map(b=>new T.Box3(new T.Vector3(b.minX,b.minY??0,b.minZ),new T.Vector3(b.maxX,b.maxY??(b.id?.startsWith('academy')?18:b.id==='library'?6:b.id==='study'?4.2:b.id==='bench'?.5:b.id==='lamp'?4:3),b.maxZ)));
 $('#progress').textContent='加载校园人物…';avatar=await createStudentAvatar(scene);
 /* 擂台现场（第十五轮）：化身、连接、对手状态，三样都**可选**。
     单独 try：他加载失败只该"台上只有我一个人"，不该让整个校园打不开。 */
 try{$('#progress').textContent='加载擂台化身…';opponent=await createArenaDuelAvatar(scene);}catch(error){console.warn('擂台化身加载失败',error);}
 /* 擂台现场（第十五轮）：连一条 /community socket，进出作答位时告诉服务端我在哪，
     对手的动作从 duel:act 回来。这里不读挑战列表——挑哪一场交给 duel.js 的候选规则，
     它只需要知道「有没有已开始、未交卷的挑战」，那件事在就位那一刻由 socket 回话给出。 */
 duel=createArenaDuel({toast});
 const record=readReturn(sessionStorage);if(record){Object.assign(state,restorePose(record,navigation));state.returnRestored=!!record.pending;record.pending=false;sessionStorage.setItem(KEY,JSON.stringify(record));}studentYaw=Number.isFinite(record?.heading)?record.heading:Math.PI-state.yaw;lastX=state.x;lastZ=state.z;state.ready=true;
 smoothGround=groundAt(state.x,state.z);
 setMode(record?'walk':'overview');avatar.update({position:{x:state.x,z:state.z,groundY:smoothGround},yaw:studentYaw,dt:0});avatar.setVisible(true);await renderer.compileAsync(scene,camera);renderer.shadowMap.needsUpdate=true;
presence=createCampusPresence({scene,camera,getPose:()=>({x:state.x,y:smoothGround,z:state.z,yaw:studentYaw,height:avatar.jumpHeight,time:avatar.actionState.elapsed,clip:bridge.paused||state.seated||state.stance?'idle':avatar.clip,avatar:avatar.variant,studying:bridge.paused||!!state.seated||!!state.stance}),setSpawn:(p,sent)=>{if(Math.hypot(state.x-sent.x,state.z-sent.z)<.2&&!navigation.blocked(p.x,p.z)){state.x=p.x;state.z=p.z;lastX=p.x;lastZ=p.z;}},openAccount:()=>bridge.openFeature('account'),prepareAvatar:peer=>renderer.compileAsync(peer.root,camera,scene),shadowChanged:()=>{renderer.shadowMap.needsUpdate=true;}});
/* 对面没人在那个位时挂一块牌子：空台对读不出"我在等谁"，而凭空放一个替身
   又会被读成"和人机对打"。牌子只用一句话说清楚状态，不参与任何判定。 */
duelHint=document.createElement('p');duelHint.id='duel-hint';duelHint.hidden=true;duelHint.setAttribute('role','status');document.body.append(duelHint);
/* 作答面板（第十六轮）：坐到作答位上就打开，题目从服务端取，交卷回服务端判。
   它订阅 duel 的变化而不是在每帧里轮询——对面交卷、双方交完出结果都是事件驱动的。 */
duelPanel=createDuelPanel({duel,onStand:()=>stand(),toast});
duel.onChange(()=>{if(duelPanel?.isOpen)duelPanel.sync();});
$('#loading').hidden=true;clock.getDelta();renderer.setAnimationLoop(frame);if(state.returnRestored)toast('已返回对应入口。');
 }catch(error){console.error(error);$('#loading strong').textContent='校园暂时无法加载';$('#progress').textContent=error.message;$('#retry').hidden=false;}}
window.__campusHub={snapshot:()=>({ready:state.ready,mode:state.mode,pos:[state.x,groundAt(state.x,state.z),state.z],yaw:state.yaw,path:state.path,modal:bridge.paused,returnRestored:state.returnRestored,seated:!!state.seated,stance:state.stance?.id||null,ground:smoothGround,opponent:opponent?.snapshot()||null,duel:duel?.snapshot||null,frames:state.frames,interior:world?.inside(state),rooms:world?.interiors.snapshot(),picker:studyPicker?{held:studyPicker.isHolding(),open:studyPicker.isBookOpen(),aim:studyPicker.getAim()}:null,entries:ENTRIES,nearest:nearest?.id||null,avatar:avatar?.snapshot(),boxes:world?.boxes.length,render:renderer.info.render}),route:id=>goTo(id),setPose:(x,z,yaw=0,pitch=0)=>{if(!navigation||navigation.blocked(x,z))return false;clearInput();setMode('walk');Object.assign(state,{x,z,yaw,pitch});lastX=x;lastZ=z;return true;},blocked:(x,z)=>navigation?.blocked(x,z),entry:id=>world?.enter(id),openFeature:(...args)=>bridge.openFeature(...args),dispose};
window.__campusHub.studyObjects=()=>{const out=[];world?.study.root.updateMatrixWorld(true);world?.study.root.traverse(n=>{if(n.userData.pickables)for(const ids of n.userData.pickables.groups.slice(0,16)){const m=new T.Matrix4();n.getMatrixAt(ids[0],m);out.push({label:n.userData.pickables.label,position:new T.Vector3().setFromMatrixPosition(m).applyMatrix4(n.matrixWorld).toArray()});}});return out;};
window.__campusHub.interactions=()=>world?.interactions.map(i=>({id:i.id,label:i.label,position:i.object.getWorldPosition(new T.Vector3()).toArray(),radius:i.radius}));
window.__campusHub.courtyard=()=>world?.courtyard.snapshot();
window.__campusHub.districts=()=>world?.districts.map(d=>{
 const features={},plaqueNormals=[];d.root.updateMatrixWorld(true);
 d.root.traverse(n=>{if(n.name==='arena:podium'||n.name==='arena:rope'||n.name==='site:lawn'||n.name.startsWith('dressing:'))features[n.name]=(features[n.name]||0)+1;if(n.name==='arena:podium-plaque-face')plaqueNormals.push(new T.Vector3(0,0,1).transformDirection(n.matrixWorld).toArray());});
 const front=d.root.getObjectByName('Social courtyard-facing service pavilion');
 return{name:d.root.name,features,plaqueNormals,stage:d.stage||null,serviceFacing:front?new T.Vector3(1,0,0).transformDirection(front.matrixWorld).toArray():null,interactions:d.interactions?.map(i=>({id:i.id,disabled:!!i.disabled,position:i.object.getWorldPosition(new T.Vector3()).toArray()}))};
});
window.__campusHub.visuals=()=>({...effects.snapshot(),memory:{...renderer.info.memory},programs:renderer.info.programs.length,water:world?.courtyard.snapshot().water,paving:world?.pavingSnapshot()});
window.__campusHub.presence=()=>presence?.snapshot();
/* 擂台现场的自检入口：把 duel 本体的接口和 enter() 的**原始返回值**交出来。
   只读，不改状态；排查"人在台上但对面看不见"的时候，看这个比看 3D 快得多。 */
window.__campusHub.duelApi=()=>duel?{snapshot:duel.snapshot,challenge:duel.challenge,peer:duel.peer,peerAct:duel.peerAct,enter:seat=>duel.enter(seat),act:kind=>duel.act(kind),connect:()=>duel.connect()}:null;
window.__campusHub.duelEnter=async(seat,id)=>{if(!duel)return{error:'duel 未初始化'};try{return await duel.enter(seat,id);}catch(error){return{thrown:true,message:String(error&&error.message||error),stack:String(error&&error.stack||'').split('\n').slice(0,4)};}};
init();
