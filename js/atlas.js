'use strict';
window.WG_Atlas = (function () {
  var $ = function (id) { return document.getElementById(id); };
  var state = { view:null, module:null, continent:null, snapshot:null, selected:{}, game:null, scene:null, generation:0, epoch:0, pending:null, dirty:false, revision:0, zoom:1, offset:{x:0,y:0} };
  var enginePromise = null, refreshTimer = null;
  var points = [[295,240],[575,165],[840,245],[895,390],[640,435],[390,445],[175,360],[555,305],[730,320],[365,155],[490,525],[820,505]];
  var icons = {
    home:'M3 10 12 3l9 7v10H3z M9 20v-7h6v7', bank:'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16 M15 5v16',
    study:'M4 4h16v12H4z M2 20h20 M8 16v4 M16 16v4', wenku:'M3 4h8l1 2 1-2h8v16h-8l-1 1-1-1H3z M12 6v15',
    mistakes:'M5 3h14v18H5z M9 8h6 M9 12h6 M9 16h3', report:'M4 20V4 M4 20h17 M8 16v-5 M13 16V7 M18 16V4',
    review:'M4 8a8 8 0 1 1-1 7 M4 3v5h5 M12 7v5l3 2', knowledge:'M4 4h16v12H9l-5 4z M8 8h8 M8 12h5',
    learning:'M9 3h6 M10 3v6L4 20h16L14 9V3 M7 15h10', community:'M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8 M2 21v-3a6 6 0 0 1 12 0v3 M17 4a4 4 0 0 1 0 8 M17 15a5 5 0 0 1 5 5', ai:'M5 7h14v13H5z M12 3v4 M9 12h.1 M15 12h.1 M9 16h6 M2 10v6 M22 10v6'
  };
  function make(parent, tag, text, cls) { var node=document.createElement(tag); if(text!==undefined)node.textContent=text; if(cls)node.className=cls; parent.appendChild(node); return node; }
  function button(parent, text, callback, cls) { var b=make(parent,'button',text,cls||'btn ghost'); b.type='button'; b.onclick=callback; return b; }
  function engine() {
    if(window.Phaser)return Promise.resolve();
    if(!enginePromise)enginePromise=new Promise(function(resolve,reject){var s=document.createElement('script');s.src=WG_Runtime.asset('/vendor/phaser/phaser.min.js');s.onload=resolve;s.onerror=function(){enginePromise=null;reject(new Error('地图资源未准备好，请运行启动网站脚本后刷新。'));};document.head.appendChild(s);});
    return enginePromise;
  }
  function dispose() { state.generation++; if(state.game){state.game.destroy(true);state.game=null;}state.scene=null; }
  function localTopic(topic) {
    var answers=WG_Data.get().answers.filter(function(a){return a.topic===topic;}), m=WG_Data.get().mistakes.filter(function(a){return a.topic===topic;});
    return { records:answers.length, mistakes:m.length };
  }
  function topicMeta(topic) {
    var bank=typeof GAOSHU_BANK!=='undefined'&&GAOSHU_BANK[topic], meta=state.snapshot&&state.snapshot.topics.find(function(t){return t.id===topic;}), record=localTopic(topic);
    var model=state.snapshot&&state.snapshot.mastery&&state.snapshot.mastery.topics[topic];
    return { total:meta?meta.total:bank&&bank.problems?bank.problems.length:0, objective:meta?meta.objective:0, records:record.records, mistakes:record.mistakes, model:model||null };
  }
  function topicState(meta) {
    if(meta.mistakes)return'weak';
    if(meta.model&&meta.model.observations>=5)return meta.model.mastery>=.8?'stable':'weak';
    return meta.records?'exploring':'unknown';
  }
  function topicLabel(meta) { return meta.model ? '掌握估计 '+Math.round(meta.model.mastery*100)+'%'+(meta.model.observations<5?' · 样本较少':'') : meta.records ? meta.records+' 次记录 · 掌握度未评估' : '尚未探索'; }
  function activity() {
    var d=WG_Data.get(), a=state.snapshot&&state.snapshot.activity;
    return Object.assign({ answers:d.answers.length, mistakes:d.mistakes.length, cleared:d.cleared.length, due:null, reviews:0, focusMinutes:null, documents:null, experiments:null, boards:null, planned:null, completed:0,friends:null,challenges:null }, a||{}, {answers:d.answers.length,mistakes:d.mistakes.length});
  }
  function count(value, unit) { return value===null||value===undefined ? '待同步' : value+' '+(unit||''); }
  function navigate(name, tab) { closeMenu(); if(name==='community'){WG_Community.open(tab);return;}StudyAppBridge.navTo(name); if(tab)setTimeout(function(){var b=$('tab-'+tab);if(b)b.click();},0); }
  function campusNodes() {
    var a=activity();
    if(window.WG_CampusDistricts)return WG_CampusDistricts.map(function(d){var n=Object.assign({},d);n.sub=d.metric?count(a[d.metric],d.unit):d.sub;n.state=d.id==='mistakes'&&a.mistakes?'weak':'unknown';n.action=d.entries[0].label;n.go=function(){navigate(d.entries[0].view,d.entries[0].tab);};n.extraEntries=d.entries.slice(1);return n;});
    return [
      {id:'bank',label:'课程探索区',kind:'college',color:0x649573,sub:'数学 · 英语 · 雅思',description:'从课程大地图进入模块，再选择章节关卡。每个知识点都有自己的学习足迹。',facts:['课程模块对应原题库','各主题显示作答记录、错题和掌握估计'],action:'进入课程地图',go:function(){navigate('bank');}},
      {id:'wenku',label:'资料图书馆',kind:'library',color:0xc59758,sub:count(a.documents,'份私有资料'),description:'阅读学习资料，上传课程讲义；已配置课程问答服务的资料可以用于检索。',facts:['原资料库可直接阅读','已上传 '+count(a.documents,'份')+' · 索引就绪 '+count(a.readyDocuments,'份')],action:'进入资料馆',go:function(){navigate('wenku');},secondary:'上传并提问',more:function(){navigate('knowledge');}},
      {id:'lab',label:'题目草稿屋',kind:'laboratory',color:0x729ca0,sub:count(a.boards,'份题目草稿'),description:'进入练习后打开题目白板，按题号保存推导。',facts:['题目白板 '+count(a.boards,'份'),'练习与挑战复盘均可打开'],action:'选一道题写草稿',go:function(){navigate('bank');}},
      {id:'social',label:'社交广场',kind:'station',color:0xb98a60,sub:count(a.friends,'位学习搭子'),description:'找到学习搭子，看看校园留言板。',facts:['好友邀请需要对方确认','留言板可分享想法与解题思路'],action:'看看留言板',go:function(){navigate('community','posts');}},
      {id:'review',label:'记忆复习站',kind:'lodge',color:0x9a9e67,sub:count(a.due,'题到期'),description:'优先复习已经到期的错题。完成后真实更新 FSRS 记录与下次复习时间。',facts:['复习卡片 '+count(a.reviews,'张'),'到期数量来自服务器当前时间'],action:'开始到期复习',go:function(){navigate('review');}},
      {id:'study',label:'专注自习馆',kind:'college',color:0x72997e,sub:count(a.focusMinutes,'分钟专注'),description:'进入已有沉浸自习室，设置专注时长与环境声音，让学习时间留下记录。',facts:['累计云端专注 '+count(a.focusMinutes,'分钟'),'自习时长来自已保存的专注记录'],action:'进入自习室',go:function(){navigate('study');}},
      {id:'mistakes',label:'错题修复工坊',kind:'workshop',color:0xbc8b68,sub:a.mistakes+' 道待巩固',state:a.mistakes?'weak':'unknown',description:'把答错的题作为待修复的知识点，查看解析、重新练习，并保留自己的推导草稿。',facts:['当前错题 '+a.mistakes+' 道','已攻克错题 '+count(a.cleared,'道')],action:'进入错题工坊',go:function(){navigate('mistakes');}},
      {id:'report',label:'学情观测塔',kind:'tower',color:0x71958d,sub:a.answers+' 次作答记录',description:'观察自己的学习状态：哪里有记录，哪里需要巩固，哪些数据尚不足以评估。',facts:['作答记录 '+a.answers+' 次，包含原网站自评记录','BKT 仅使用客观题，不等同考试分数'],action:'查看学情报告',go:function(){navigate('report');},secondary:'知识与掌握度',more:function(){navigate('report');}}
    ];
  }
  function bankNodes() {
    var nodes=[];
    CONTINENTS.filter(function(c){return c.levels&&c.levels.length&&(!state.continent||c.id===state.continent);}).forEach(function(c){c.levels.forEach(function(l){
      var topics=l.topicList||[], group=l.group||c.name;
      if(l.subject&&typeof GAOSHU_BANK!=='undefined')topics=Object.keys(GAOSHU_BANK).filter(function(t){return GAOSHU_BANK[t].subject===l.subject;});
      var records=topics.reduce(function(sum,t){return sum+topicMeta(t).records;},0), mistakes=topics.reduce(function(sum,t){return sum+topicMeta(t).mistakes;},0);
      var models=topics.map(function(t){return topicMeta(t).model;}).filter(Boolean), graded=models.reduce(function(sum,p){return sum+p.observations;},0);
      var rec=WG_Data.get().levels[l.id];
      nodes.push({id:l.id,label:l.name,kind:group==='线性代数'?'tower':group==='概率论'?'observatory':c.id==='english'||c.id==='ielts'?'library':'college',color:c.id==='english'?0xa48782:c.id==='ielts'?0x8d90a2:group==='线性代数'?0x79989e:group==='概率论'?0xb09d69:0x6f9978,
        state:mistakes?'weak':records||rec?'exploring':'unknown',sub:topics.length?topics.length+' 个主题 · '+records+' 次记录':rec?'已完成练习':'点击开始探索',description:l.type==='gaoshu'?'进入这个模块的专属章节地图，选择知识点关卡开始练习。':'这个语言模块对应现有词汇练习，点击可直接开始。',facts:[group+' · '+c.name,topics.length?'错题 '+mistakes+' 道 · BKT 记录 '+graded+' 次':'词汇模块使用已有题库与练习评分'],action:l.type==='gaoshu'?'进入章节地图':'开始词汇练习',go:function(){StudyAppBridge.openModule(l.id);},topics:topics});
    });});
    return nodes;
  }
  function moduleNodes() {
    var l=state.module;if(!l)return[];
    var topics=l.topicList||[];if(l.subject&&typeof GAOSHU_BANK!=='undefined')topics=Object.keys(GAOSHU_BANK).filter(function(t){return GAOSHU_BANK[t].subject===l.subject;});
    return topics.map(function(topic,i){var m=topicMeta(topic), matching=$('subGrid').querySelector('[data-topic="'+CSS.escape(topic)+'"]'), filtered=matching?matching.querySelector('.mod-meta').textContent:'';
      return{id:topic,label:topic,kind:i%3===0?'college':i%3===1?'tower':'lodge',color:topicState(m)==='weak'?0xc3a071:topicState(m)==='stable'?0x608c62:0x89a48a,state:topicState(m),sub:topicLabel(m),description:'这个地点对应「'+topic+'」的真实题库与学习记录。地图状态来自你的作答，而不是预设通关动画。',facts:[filtered||'题库 '+m.total+' 题','作答 '+m.records+' 次 · 当前错题 '+m.mistakes+' 道',m.model?'客观记录 '+m.model.observations+' 次 · 下一题答对估计 '+Math.round(m.model.nextCorrect*100)+'%':'客观题记录不足或模型暂不可用'],action:matching&&matching.classList.contains('mod-card-empty')?'当前筛选下没有题':'开始这一关',disabled:matching&&matching.classList.contains('mod-card-empty'),go:function(){StudyAppBridge.practiceModule(topic);},model:m.model};
    });
  }
  function currentConfig() {
    if(state.view==='home')return{id:'campusAtlas',key:'campus',title:'你的学习，正在生长',eyebrow:'XUE WU YOU · LEARNING CAMPUS',intro:'沿着校园地图探索课程，把每一次练习变成可见的学习足迹。',nodes:campusNodes()};
    if(state.view==='bank')return{id:'courseAtlas',key:'courses-'+(state.continent||'all'),title:'课程探索地图',eyebrow:'COURSE EXPEDITION',intro:'一个模块，一张地图。选择课程地点，继续你的章节探索。',nodes:bankNodes()};
    if(state.view==='module')return{id:'moduleAtlas',key:'module-'+(state.module&&state.module.id),title:'章节探索地图',eyebrow:'CHAPTER EXPEDITION',intro:'路线表示建议先修顺序。所有章节都可进入，状态随你的真实记录更新。',nodes:moduleNodes()};
    return null;
  }
  function heading(root,config) {
    var head=make(root,'div',undefined,'atlas-heading'),copy=make(head,'div');make(copy,'span',config.eyebrow,'atlas-kicker');var title=make(copy,state.view==='module'?'h2':'h1',config.title);if(state.view==='home')title.id='campusTitle';if(state.view==='bank')title.id='courseAtlasTitle';make(copy,'p',config.intro);
    var actions=make(head,'div',undefined,'atlas-toolbar');button(actions,'地图说明',openGuide);
    var refresh=button(actions,'同步学习状态',function(){refreshSnapshot(true);});refresh.id='atlasRefresh';
    if(state.view!=='module')button(actions,$('view-'+state.view).classList.contains('atlas-show-list')?'返回地图':'列表视图',function(){ $('view-'+state.view).classList.toggle('atlas-show-list');render(); });
  }
  function stats(root) {
    var a=activity(),row=make(root,'div',undefined,'atlas-stats');
    [['作答记录',a.answers,'次真实记录'],['待巩固错题',a.mistakes,'道待复盘'],['到期复习',a.due,'按 FSRS 当前时间'],['专注时长',a.focusMinutes,'分钟 · 云端累计']].forEach(function(v){var card=make(row,'div',undefined,'atlas-stat');make(card,'span',v[0],'atlas-stat-label');make(card,'b',v[1]===null?'—':String(v[1]));make(card,'small',v[2]);});
  }
  function coords(config) {
    var layout=window.WG_AtlasAssets&&WG_AtlasAssets.campusLayout;if(config.key==='campus'&&layout&&Array.isArray(layout.positions)&&layout.positions.length>=config.nodes.length)return config.nodes.map(function(n,i){return{x:layout.positions[i][0],y:layout.positions[i][1]};});
    if(state.view==='bank'&&!state.continent){
      return config.nodes.map(function(n,i){var col=i%5,row=Math.floor(i/5);return{x:175+col*178,y:170+row*132};});
    }
    if(config.nodes.length<=12)return config.nodes.map(function(_,i){return{x:points[i][0],y:points[i][1]};});
    return config.nodes.map(function(_,i){return{x:160+(i%5)*182,y:145+Math.floor(i/5)*120};});
  }
  function selectedId(config) { var id=state.selected[config.key];if(!config.nodes.some(function(n){return n.id===id;}))id=config.nodes[0]&&config.nodes[0].id;state.selected[config.key]=id;return id; }
  function sceneHeight(config){return config.key==='campus'&&WG_AtlasAssets.campusLayout?1080/(WG_AtlasAssets.campusLayout.aspect||1.5):680;}
  function select(config,id) {
    state.selected[config.key]=id;
    document.querySelectorAll('#'+config.id+' [data-map-id]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.mapId===id));});
    detail(config);
    if(state.scene&&state.scene.walkTo){var index=config.nodes.findIndex(function(n){return n.id===id;});state.scene.walkTo(coords(config)[index]);}
  }
  function detail(config) {
    var root=$('atlasSelection'), node=config.nodes.find(function(n){return n.id===selectedId(config);});if(!root||!node)return;root.replaceChildren();
    make(root,'span',state.view==='home'?'当前目的地':'当前学习地点','atlas-kicker');make(root,'span',node.sub,'atlas-chip').dataset.state=node.state||'unknown';make(root,'h2',node.label);make(root,'p',node.description);
    if(node.model){var track=make(root,'div',undefined,'atlas-progress-track');track.setAttribute('role','meter');track.setAttribute('aria-label',node.label+'模型掌握估计');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(Math.round(node.model.mastery*100)));make(track,'span').style.width=Math.round(node.model.mastery*100)+'%';}
    var facts=make(root,'ul');node.facts.forEach(function(t){make(facts,'li',t);});var primary=button(root,node.action,node.go,'btn primary');primary.disabled=!!node.disabled;primary.dataset.atlasFocus='primary';if(node.more)button(root,node.secondary,node.more);
    (node.extraEntries||[]).forEach(function(entry){button(root,entry.label,function(){navigate(entry.view,entry.tab);});});
    make(root,'p','开始学习后，回到地图可查看新的记录和状态。','atlas-live-note');
  }
  function render() {
    var config=currentConfig();if(!config)return;var root=$(config.id);if(!root)return;
    var focused=root.contains(document.activeElement)?document.activeElement.dataset.mapId||document.activeElement.dataset.atlasFocus:null;
    dispose();root.replaceChildren();heading(root,config);if(state.view==='home')stats(root);
    if(state.view==='bank'){
      var tabs=make(root,'div',undefined,'atlas-course-tabs');[['','全部课程'],['study','数学'],['english','英语'],['ielts','雅思']].forEach(function(c){var b=button(tabs,c[1],function(){StudyAppBridge.openBank(c[0]||null);},'');b.setAttribute('aria-pressed',String((state.continent||'')===c[0]));});
    }
    var layout=make(root,'div',undefined,'atlas-content'), panel=make(layout,'div',undefined,'atlas-map-panel'), top=make(panel,'div',undefined,'atlas-map-top');make(top,'strong',state.view==='home'?'校园探索地图':state.view==='module'?'章节地点与建议路线':'模块地点总览');make(top,'span','点击地点选择 · 右侧进入 · 下方也可选择');
    var board=make(panel,'div',undefined,'atlas-map-board'),plane=make(board,'div',undefined,'atlas-plane');plane.id='atlasPlane';var canvas=make(plane,'div',undefined,'atlas-canvas');canvas.id='atlasCanvas';canvas.setAttribute('aria-hidden','true');
    if(config.key==='campus'&&WG_AtlasAssets.campusLayout){board.classList.add('atlas-art-board');board.style.aspectRatio=String(WG_AtlasAssets.campusLayout.aspect||1.5);}
    var loading=make(plane,'div','正在准备校园地图…','atlas-map-loading');loading.id='atlasMapLoading';
    var xy=coords(config),chosen=selectedId(config);
    config.nodes.forEach(function(node,i){var b=button(plane,'',function(){select(config,node.id);},'atlas-map-node');b.dataset.mapId=node.id;b.dataset.state=node.state||'unknown';b.style.left=xy[i].x/1080*100+'%';b.style.top=(xy[i].y+35)/sceneHeight(config)*100+'%';b.setAttribute('aria-label',node.label+'，'+node.sub+'，选择地点');b.setAttribute('aria-pressed',String(chosen===node.id));make(b,'span',String(i+1),'atlas-node-number');make(b,'span',node.label,'atlas-node-name');make(b,'small',node.sub);});
    var controls=make(panel,'div',undefined,'atlas-map-controls'),tools=make(controls,'div',undefined,'atlas-zoom-tools');
    [['＋','放大地图',function(){state.zoom=Math.min(1.8,state.zoom+.2);transform();}],['−','缩小地图',function(){state.zoom=Math.max(1,state.zoom-.2);transform();}],['全览','地图完整显示',function(){state.zoom=1;state.offset={x:0,y:0};transform();}],['←','向左查看地图',function(){state.offset.x+=7;transform();}],['→','向右查看地图',function(){state.offset.x-=7;transform();}],['↑','向上查看地图',function(){state.offset.y+=7;transform();}],['↓','向下查看地图',function(){state.offset.y-=7;transform();}]].forEach(function(t){var b=button(tools,t[0],t[2],'');b.setAttribute('aria-label',t[1]);});
    make(controls,'span','未探索 / 探索中 / 待巩固 / 估计稳定','atlas-legend');var selected=make(layout,'aside',undefined,'atlas-selection');selected.id='atlasSelection';detail(config);
    var list=make(root,'div',undefined,'atlas-node-list');list.setAttribute('aria-label','地图地点列表');config.nodes.forEach(function(n,i){var b=button(list,'',function(){select(config,n.id);},'atlas-node-card');b.dataset.mapId=n.id;b.setAttribute('aria-pressed',String(chosen===n.id));make(b,'strong',String(i+1).padStart(2,'0')+' · '+n.label);make(b,'small',n.sub);});
    var note=make(root,'p',snapshotNote(),'atlas-live-note');note.id='atlasSyncNote';note.setAttribute('role','status');note.setAttribute('aria-live','polite');
    if(state.view==='home')mission(root);
    state.zoom=1;state.offset={x:0,y:0};transform();draw(config,canvas,state.generation).catch(function(e){if($('atlasMapLoading'))$('atlasMapLoading').textContent=e.message+' 可使用下方地点列表继续学习。';});
    if(focused){var target=Array.from(root.querySelectorAll('[data-map-id],[data-atlas-focus]')).find(function(n){return n.dataset.mapId===focused||n.dataset.atlasFocus===focused;});if(target)target.focus({preventScroll:true});}
  }
  function transform() { var plane=$('atlasPlane');if(plane)plane.style.transform='translate('+Math.max(-25,Math.min(25,state.offset.x))+'%,'+Math.max(-25,Math.min(25,state.offset.y))+'%) scale('+state.zoom+')'; }
  function snapshotNote() {
    if(!WG_API.isCloudSession())return'本地体验：作答和错题来自本机。登录云端账号后，可同步复习、专注时长和掌握估计。';
    if(state.snapshot)return'最近同步 '+new Date(state.snapshot.generatedAt).toLocaleTimeString('zh-CN')+' · '+(state.snapshot.modelError?'掌握估计暂不可用；原功能和学习记录仍可查看。':'地图使用真实学习记录。BKT 为固定参数估计，不等同考试成绩。');
    return'正在同步学习状态；地图地点和现有功能可直接使用。';
  }
  function mission(root) {
    var a=activity(), box=make(root,'div',undefined,'atlas-mission'),copy=make(box,'div'),title,desc,callback;
    if(a.due>0){title='今天的下一步：复习 '+a.due+' 道到期错题';desc='先把已到期的复习处理掉，再探索新的章节。';callback=function(){navigate('review');};}
    else{title='今天的下一步：选择一个课程，留下第一段足迹';desc='从基础章节开始，作答后可观察错题与掌握估计怎样变化。';callback=function(){navigate('bank');};}
    make(copy,'strong',title);make(copy,'p',desc);button(box,'前往学习',callback,'btn primary');
  }
  async function refreshSnapshot(sync) {
    if(!WG_API.isCloudSession())return;
    if(state.pending)return state.pending;
    var session=state.epoch,revision=state.revision,b=$('atlasRefresh');if(b){b.disabled=true;b.textContent='同步中…';}
    state.pending=(async function(){
      try{if(sync)await WG_API.putData(WG_Data.get());var value=await WG_API.req('GET','/api/learning/twin');if(session!==state.epoch)return;state.snapshot=value;state.dirty=revision!==state.revision;if(currentConfig())render();}
      catch(e){if(session===state.epoch&&$('atlasSyncNote'))$('atlasSyncNote').textContent='同步失败：'+e.message+'。地图保留本机的作答和错题数据，可重试同步。';}
      finally{if(session===state.epoch){state.pending=null;var current=$('atlasRefresh');if(current){current.disabled=false;current.textContent='同步学习状态';}if(revision!==state.revision&&currentConfig()){clearTimeout(refreshTimer);refreshTimer=setTimeout(function(){refreshSnapshot(true);},500);}}}
    })();return state.pending;
  }
  function backgroundKey(config) { if(config.key==='campus')return'campus';var group=state.view==='module'&&state.module&&state.module.group;return state.continent==='english'?'english':state.continent==='ielts'?'ielts':group==='线性代数'?'algebra':group==='概率论'?'probability':'mathematics'; }
  function validAsset(value) { return typeof value==='string'&&/^\/vendor\/atlas-art\/[a-zA-Z0-9_./-]+\.(png|webp|svg)$/.test(value)&&!value.includes('..')?WG_Runtime.asset(value):null; }
  async function draw(config,parent,generation) {
    await engine();if(generation!==state.generation||!document.contains(parent))return;
    var positions=coords(config), height=sceneHeight(config),assets=window.WG_AtlasAssets||{},bg=validAsset((assets.backgrounds||{})[backgroundKey(config)]), reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
    var scene={
      preload:function(){if(bg)this.load.image('atlas-background',bg);var self=this;Object.keys(assets.buildings||{}).forEach(function(key){var url=validAsset(assets.buildings[key]);if(url)self.load.image('building-'+key,url);});var avatar=validAsset(assets.avatar);if(avatar)this.load.image('atlas-avatar',avatar);},
      create:function(){
        if(generation!==state.generation)return;var self=this,g=this.add.graphics();state.scene=this;
        function polygon(points,color){g.fillStyle(color,1);g.fillPoints(points.map(function(p){return{x:p[0],y:p[1]};}),true);}
        function box(x,y,w,d,h,color){polygon([[x-w/2,y],[x,y+d/2],[x,y+d/2-h],[x-w/2,y-h]],shade(color,.82));polygon([[x,y+d/2],[x+w/2,y],[x+w/2,y-h],[x,y+d/2-h]],shade(color,.67));polygon([[x-w/2,y-h],[x,y-d/2-h],[x+w/2,y-h],[x,y+d/2-h]],color);}
        function tree(x,y,size){g.fillStyle(0x7c9877,.13);g.fillEllipse(x+7,y+5,34*size,14*size);g.fillStyle(0x887856,1);g.fillRect(x-3*size,y-20*size,6*size,20*size);polygon([[x-18*size,y-13*size],[x,y-48*size],[x+18*size,y-13*size]],0x88a77a);polygon([[x-14*size,y-25*size],[x,y-57*size],[x+14*size,y-25*size]],0x75976d);}
        function building(x,y,node,index){
          if(self.textures.exists('building-'+node.kind)){var size=config.key==='campus'&&assets.campusLayout&&assets.campusLayout.assetSizes&&assets.campusLayout.assetSizes[node.kind]||135;self.add.image(x,y,'building-'+node.kind).setOrigin(.5,.88).setDisplaySize(size,size);return;}
          if(bg){g.fillStyle(0x365443,.18);g.fillEllipse(x,y+7,72,24);g.lineStyle(3,0xe9d6a0,.9);g.strokeEllipse(x,y,57,25);g.fillStyle(0xf8eed0,.85);g.fillEllipse(x,y-5,44,20);g.lineStyle(3,0xb79c68,1);g.lineBetween(x,y-10,x,y-48);g.fillStyle(0xeed48a,1);g.fillCircle(x,y-51,8);return;}
          var h=node.kind==='tower'?92:node.kind==='observatory'?62:55,w=node.kind==='library'?92:74;
          g.fillStyle(0x254936,.13);g.fillEllipse(x+10,y+8,110,42);box(x,y+7,112,56,11,0xc6ceac);box(x,y,w,42,h,0xe9e4ca);
          if(node.kind==='observatory'){g.fillStyle(node.color,1);g.fillEllipse(x,y-h-10,w+14,44);g.fillStyle(0xb7c6b4,1);g.fillEllipse(x+2,y-h-20,33,15);}
          else{polygon([[x-w/2-7,y-h-2],[x,y-h-37],[x+w/2+7,y-h-2],[x,y-h+22]],node.color);polygon([[x,y-h-37],[x+w/2+7,y-h-2],[x,y-h+22]],shade(node.color,.78));}
          g.fillStyle(0x6b8d83,1);g.fillRect(x-24,y-h+24,10,16);g.fillRect(x+10,y-h+33,10,16);g.fillStyle(0x55765e,1);g.fillRect(x-4,y-22,13,22);
          if(node.kind==='college'||node.kind==='station'){g.lineStyle(3,0x897e5e,1);g.lineBetween(x+32,y-h-12,x+32,y-h-48);polygon([[x+32,y-h-49],[x+57,y-h-40],[x+32,y-h-32]],0xd7ad6d);}
          if(node.state==='stable'){g.fillStyle(0xf0ce71,1);g.fillCircle(x+38,y-58,7);}
          if(node.state==='weak'){g.fillStyle(0xcf9a5c,1);g.fillCircle(x+38,y-58,7);}
          tree(x-58,y+6,.55);
        }
        var theme=backgroundKey(config),ground=theme==='algebra'?0xd8e6e2:theme==='probability'?0xeee7c9:theme==='english'?0xeadfd8:theme==='ielts'?0xdce7ec:0xdfe8c6;
        if(bg&&this.textures.exists('atlas-background'))this.add.image(540,height/2,'atlas-background').setDisplaySize(1080,height).setDepth(-2);
        else{
          g.fillStyle(0x719986,.11);g.fillEllipse(560,544,850,165);
          polygon([[84,288],[540,46],[1020,266],[1044,404],[594,632],[84,426]],0xc2cbb1);
          polygon([[84,288],[84,315],[594,655],[594,632]],0xb0bda2);polygon([[594,632],[594,655],[1044,427],[1044,404]],0x9cafa0);
          polygon([[84,288],[540,46],[1020,266],[1044,404],[594,632],[84,426]],ground);
          g.fillStyle(0xa3bfaf,1);g.fillEllipse(755,430,205,98);g.fillStyle(0xb4c9b8,1);g.fillEllipse(760,426,176,75);
          g.lineStyle(2,0xd5e0ba,1);for(var i=0;i<12;i++){g.lineBetween(155+i*59,284-i*22,667+i*30,562-i*26);}
          [[139,310],[227,221],[403,140],[510,95],[719,165],[943,299],[983,393],[851,503],[728,562],[569,596],[424,539],[300,486],[136,397],[676,103],[330,185]].forEach(function(p,i){tree(p[0],p[1],.7+(i%3)*.13);});
          g.fillStyle(0xf0edd8,1);g.fillEllipse(530,333,136,65);g.fillStyle(0xb5c5a6,1);g.fillEllipse(530,328,79,32);g.fillStyle(0xe4e5cc,1);g.fillEllipse(530,321,56,21);
        }
        var pairs=[];
        if(state.view==='module'&&state.snapshot){state.snapshot.edges.forEach(function(e){var a=config.nodes.findIndex(function(n){return n.id===e[0];}),b=config.nodes.findIndex(function(n){return n.id===e[1];});if(a>=0&&b>=0)pairs.push([a,b]);});}
        if(!pairs.length)for(var j=1;j<positions.length;j++)pairs.push([j-1,j]);
        if(!bg)pairs.forEach(function(pair){var a=positions[pair[0]],b=positions[pair[1]],source=config.nodes[pair[0]],target=config.nodes[pair[1]],visited=source.state&&source.state!=='unknown';g.lineStyle(13,0xf1e9d2,.98);g.beginPath();g.moveTo(a.x,a.y+12);g.lineTo((a.x+b.x)/2,a.y+32);g.lineTo(b.x,b.y+12);g.strokePath();g.lineStyle(visited?4:1,visited?0x87ac8c:0xd7cead,.85);g.lineBetween(a.x,a.y+12,(a.x+b.x)/2,a.y+32);if(visited&&target.state&&target.state!=='unknown')g.lineBetween((a.x+b.x)/2,a.y+32,b.x,b.y+12);});
        positions.map(function(p,i){return{p:p,n:config.nodes[i],i:i};}).sort(function(a,b){return a.p.y-b.p.y;}).forEach(function(t){building(t.p.x,t.p.y,t.n,t.i);});
        var selected=selectedId(config),at=positions[config.nodes.findIndex(function(n){return n.id===selected;})]||positions[0],avatar;
        if(this.textures.exists('atlas-avatar'))avatar=this.add.image(at.x,at.y+20,'atlas-avatar').setOrigin(.5,1).setDisplaySize(32,48);
        else{avatar=this.add.graphics({x:at.x,y:at.y+15});avatar.fillStyle(0x355c49,.18);avatar.fillEllipse(0,5,25,10);avatar.fillStyle(0x466b55,1);avatar.fillRoundedRect(-7,-16,14,19,4);avatar.fillStyle(0xeed5ad,1);avatar.fillCircle(0,-22,8);avatar.fillStyle(0x375543,1);avatar.fillEllipse(0,-28,19,7);}
        avatar.setDepth(100);this.walkTo=function(p){if(!p)return;self.tweens.killTweensOf(avatar);if(reduced)avatar.setPosition(p.x,p.y+15);else self.tweens.add({targets:avatar,x:p.x,y:p.y+15,duration:450,ease:'Sine.easeInOut'});};
        if($('atlasMapLoading'))$('atlasMapLoading').remove();parent.dataset.engine='Phaser '+Phaser.VERSION;
      }
    };
    state.game=new Phaser.Game({type:Phaser.CANVAS,parent:parent,width:1080,height:height,transparent:true,banner:false,audio:{noAudio:true},fps:{target:30},input:{keyboard:false,mouse:false,touch:false},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:scene});
  }
  function shade(color,amount) { var r=(color>>16)&255,g=(color>>8)&255,b=color&255;return(Math.round(r*amount)<<16)+(Math.round(g*amount)<<8)+Math.round(b*amount); }
  function closeMenu() {document.body.classList.remove('atlas-menu-open');$('atlasMenuToggle').setAttribute('aria-expanded','false');}
  function openGuide() {
    var dialog=$('atlasGuideDialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='atlasGuideDialog';dialog.className='atlas-guide-dialog';dialog.setAttribute('aria-labelledby','atlasGuideTitle');document.body.appendChild(dialog);make(dialog,'h2','如何读这张学习地图').id='atlasGuideTitle';
      make(dialog,'p','建筑对应真实功能，课程地点对应现有题库模块。选择地图地点后，点击「进入」或「开始这一关」即可学习。手机上地点显示编号，下方列表提供相同操作。');
      make(dialog,'p','未探索：还没有记录。探索中：已有记录，但样本不足。待巩固：存在错题或掌握估计低于 80%。估计稳定：至少 5 次客观记录且 BKT 估计达到 80%。这些状态不限制进入课程。');
      make(dialog,'p','这是一套学习状态的数字映射原型。地图造型不代表真实校园建筑，模型也未经过学生群体校准。每次作答、复习和计划完成后，同步状态可观察相应变化。');
      button(dialog,'继续探索',function(){dialog.close();},'btn primary');}
    dialog.showModal();
  }
  window.addEventListener('xwy:view-changed',function(e){var d=e.detail;state.view=d.view;state.module=d.module;state.continent=d.continent;closeMenu();dispose();['campusAtlas','courseAtlas','moduleAtlas'].forEach(function(id){$(id).replaceChildren();});if(currentConfig()){render();refreshSnapshot(state.dirty);if(window.WG_Heavy&&!WG_Heavy.isReady())WG_Heavy.ready().then(function(){if(currentConfig())render();});}});
  window.addEventListener('xwy:data-changed',function(){state.dirty=true;state.revision++;clearTimeout(refreshTimer);refreshTimer=setTimeout(function(){if(currentConfig()){render();refreshSnapshot(true);}},650);});
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&currentConfig())refreshSnapshot(false);});
  window.addEventListener('xwy:community-changed',function(){if(currentConfig())refreshSnapshot(false);});
  WG_API.onAuthChange(function(){state.epoch++;state.pending=null;state.snapshot=null;state.selected={};state.dirty=false;state.revision++;clearTimeout(refreshTimer);dispose();['campusAtlas','courseAtlas','moduleAtlas'].forEach(function(id){$(id).replaceChildren();});});
  $('atlasMenuToggle').onclick=function(){var open=document.body.classList.toggle('atlas-menu-open');$('atlasMenuToggle').setAttribute('aria-expanded',String(open));};
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});
  document.querySelectorAll('#topnav a').forEach(function(a){var ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('stroke-linecap','round');svg.setAttribute('aria-hidden','true');svg.classList.add('atlas-nav-icon');path.setAttribute('d',icons[a.dataset.nav]||icons.home);svg.appendChild(path);a.prepend(svg);});
  document.addEventListener('DOMContentLoaded',function(){var visible=['home','bank','module'].find(function(v){return!$('view-'+v).classList.contains('hidden');});if(visible){state.view=visible;render();refreshSnapshot(false);}});
  return { refresh:function(){return refreshSnapshot(true);}, getSnapshot:function(){return state.snapshot;} };
})();
