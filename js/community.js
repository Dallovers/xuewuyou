'use strict';
window.WG_Community=(function(){
  var $=function(id){return document.getElementById(id);},epoch=0,home=null,tabName='friends',scope=null,reply=null,challenge=null,socket=null,countdown=null,libraries=null,profileDirty=false,loadSerial=0,postSerial=0,challengeSerial=0,arenaPoll=null,answerSaveTimer=null,answerState=null,arenaClock=null,arenaRequestId=null,selectedFriend=null,selectedChallengeId=null,communityVisible=false;
  var api=function(method,path,body){return WG_API.req(method,'/api/community/'+path,body);};
  function el(parent,tag,value,cls){var n=document.createElement(tag);if(value!==undefined)n.textContent=value;if(cls)n.className=cls;parent.appendChild(n);return n;}
  function button(parent,value,fn,primary){var b=el(parent,'button',value,'btn '+(primary?'primary':'ghost'));b.type='button';b.onclick=function(){run(b,fn);};return b;}
  function message(value){$('communityMessage').textContent=value;}
  function date(value){return new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}
  async function run(b,fn){if(b.disabled)return;var s=epoch;b.disabled=true;b.setAttribute('aria-busy','true');try{await fn(s);}catch(e){if(s===epoch)message(e.message||'操作失败，请重试');}finally{b.disabled=false;b.removeAttribute('aria-busy');}}
  function cloud(){if(WG_API.isCloudSession())return true;message('请先登录云端账号，才能添加学习搭子、留言或挑战。');return false;}
  function math(node){if(window.renderMathInElement)renderMathInElement(node,{delimiters:[{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true},{left:'$$',right:'$$',display:true}],throwOnError:false,trust:false});}
  function markdown(body,source,parser){
    var saved=[],prefix='XWYMATH'+crypto.randomUUID().replace(/-/g,'')+'TOKEN';
    var safe=source.replace(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$/g,function(value){var index=saved.push(value)-1;return prefix+index+'END';});
    body.innerHTML=parser.render(safe);
    // Restore formula delimiters as text nodes, never as raw HTML or attributes.
    var walk=document.createTreeWalker(body,NodeFilter.SHOW_TEXT),nodes=[],node;
    while((node=walk.nextNode()))nodes.push(node);
    var pattern=new RegExp(prefix+'(\\d+)END','g');
    nodes.forEach(function(n){n.nodeValue=n.nodeValue.replace(pattern,function(_,index){return saved[Number(index)];});});
    body.querySelectorAll('a').forEach(function(a){a.rel='nofollow noreferrer';});math(body);
  }
  function library(){if(libraries)return libraries;libraries=Promise.all([['/vendor/socketio/socket.io.min.js','io'],['/vendor/markdown-it/markdown-it.min.js','markdownit']].map(function(item){if(window[item[1]])return Promise.resolve();return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=WG_Runtime.asset(item[0]);s.onload=resolve;s.onerror=function(){reject(new Error('校园互动资源加载失败，请重新启动网站后刷新'));};document.head.appendChild(s);});})).catch(function(e){libraries=null;throw e;});return libraries;}
  async function connect(){var session=epoch;if(!cloud())return;await library();if(session!==epoch||socket)return;
    socket=io((WG_API.getBase()||location.origin)+'/community',{auth:function(cb){cb({token:WG_API.getToken()});}});
    socket.on('connect',function(){$('communityConnection').textContent='实时通知已连接';});socket.on('disconnect',function(){$('communityConnection').textContent='连接中断，可手动刷新';});socket.on('connect_error',function(){$('communityConnection').textContent='通知暂不可用，可手动刷新';});
    socket.on('community:changed',function(event){if(session!==epoch)return;liveQueue(event.kind==='posts'?'posts':'social');window.dispatchEvent(new CustomEvent('xwy:community-changed',{detail:event}));});
    startLivePolling();
  }
  /* ---------- 实时刷新 ----------
   * 原来收到 socket 事件只弹一句「刷新后查看」，得用户自己去点。现在直接把数据换掉。
   * 但必须守住三条，否则体验比手动刷新还差：
   *   1) 正在写留言 / 正在回复时不动列表——重绘会把草稿和光标一起吞掉；
   *   2) 短时间内的多次变更合并成一次刷新，连发三条不至于重绘三次；
   *   3) 页面在后台时不刷新，回到前台再补一次。 */
  var liveTimer=null,liveKind=null,pollTimer=null;
  function composing(){var c=$('postComposer');return !!(c&&c.open)||!!reply;}
  function notice(text){var n=$('communityNotice');if(!n)return;n.hidden=false;n.firstElementChild.textContent=text;}
  function liveQueue(kind){liveKind=(liveKind==='posts'||kind==='posts')?'posts':'social';if(liveTimer)return;liveTimer=setTimeout(liveRun,450);}
  async function liveRun(){
    liveTimer=null;var kind=liveKind;liveKind=null;
    if(!WG_API.isCloudSession())return;
    if(document.hidden)return;
    /* 不在留言页时收到留言事件就不管它：切到那个 tab 本来就会重新 load 一次。 */
    if(kind==='posts'&&tabName!=='posts')return;
    if(kind==='posts'&&composing()){notice('有新的留言，写完这句就会显示。');return;}
    var s=epoch,top=0;
    try{top=document.scrollingElement?document.scrollingElement.scrollTop:0;}catch(e){}
    try{
      if(tabName==='posts')await loadPosts(s);
      else if(tabName==='arena'){await loadChallenges(s);if(s===epoch&&challenge)await openChallenge(challenge.id,s);}
      else await loadHome(s);
    }catch(e){if(s===epoch)notice('自动更新失败，可以点右边刷新。');return;}
    if(s!==epoch)return;
    /* 读长文时别把视线拽走：已经在上面就直接跳回顶部看新内容，滚下去了就停在原处。 */
    try{var root=document.scrollingElement;if(root&&top>120)root.scrollTop=top;}catch(e){}
    $('communityNotice').hidden=true;
  }
  function startLivePolling(){
    if(pollTimer)return;
    /* 兜底：有些网络会掐掉 WebSocket，socket 连不上时这里 15 秒补一次。
     * 连上了就一次都不轮询，不白耗流量。 */
    pollTimer=setInterval(function(){
      if(document.hidden||!WG_API.isCloudSession()||!home)return;
      if(socket&&socket.connected)return;
      liveQueue(tabName==='posts'?'posts':'social');
    },15000);
  }
  function tab(name){tabName=name;document.querySelectorAll('[data-community-tab]').forEach(function(b){var on=b.dataset.communityTab===name;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;$('community-'+b.dataset.communityTab).hidden=!on;});}
  function fillSelect(node,items,first){var old=node.value;node.replaceChildren();if(first){var o=el(node,'option',first);o.value='';}items.forEach(function(item){var o=el(node,'option',item.label);o.value=item.value;});if(items.some(function(i){return i.value===old;}))node.value=old;}
  function renderHome(){if(!home)return;
    if(!profileDirty){$('buddyNick').value=home.profile.nick;$('buddyGoal').value=home.profile.goal;$('buddyAvailability').value=home.profile.availability;$('buddyVisible').checked=home.profile.visible;$('buddySubjects').replaceChildren();home.subjects.forEach(function(s){var label=el($('buddySubjects'),'label',undefined,'community-check'),input=el(label,'input');input.type='checkbox';input.value=s;input.name='buddySubject';input.checked=home.profile.subjects.includes(s);el(label,'span',s);});}
    if($('buddyFilter').options.length<2)fillSelect($('buddyFilter'),home.subjects.map(function(s){return{label:s,value:s};}),'全部课程');
    fillSelect($('challengeFriend'),home.friends.map(function(p){return{label:p.nick,value:p.id};}),home.friends.length?'选择学习搭子':'先添加学习搭子');
    fillSelect($('challengeTopic'),home.topics.map(function(t){return{label:t.topic+' · '+t.count+' 道客观题',value:t.topic};}));
    if(selectedFriend){if(home.friends.some(function(p){return p.id===selectedFriend;}))$('challengeFriend').value=selectedFriend;else message('该同学不在当前好友列表，请重新选择学习搭子。');selectedFriend=null;}
    $('buddyDirectory').replaceChildren();if(!home.directory.length)el($('buddyDirectory'),'p','暂时没有符合条件的公开名片。你可以公开自己的名片，邀请同学注册后一起学习。','community-empty');
    home.directory.forEach(function(p){var item=personCard($('buddyDirectory'),p),pending=home.requests.find(function(r){return r.person.id===p.id;}),actions=el(item,'div',undefined,'community-actions');
      if(p.isFriend)el(actions,'span','已是学习搭子','community-muted');else if(pending)el(actions,'span',pending.from===home.uid?'邀请待确认':'对方已邀请你','community-muted');else button(actions,'邀请成为搭子',async function(s){await api('POST','request',{to:p.id,message:'一起学习 '+p.subjects.join('、')});if(s===epoch){message('邀请已发送，等待对方确认。');await loadHome(s);}});
    });
    $('buddyRequests').replaceChildren();home.requests.forEach(function(r){var item=el($('buddyRequests'),'article',undefined,'buddy-request');el(item,'strong',r.person.nick+(r.to===home.uid?' 邀请你成为搭子':' · 等待确认'));el(item,'p',r.message||'一起学习');var actions=el(item,'div',undefined,'community-actions');(r.to===home.uid?[['接受','accept'],['婉拒','reject']]:[['取消邀请','cancel']]).forEach(function(a){button(actions,a[0],async function(s){await api('PUT','request',{id:r.id,action:a[1]});if(s===epoch){message(a[0]+'成功。');await loadHome(s);}});});});
    $('buddyFriends').replaceChildren();el($('buddyFriends'),'h3','我的学习搭子 · '+home.friends.length);if(!home.friends.length)el($('buddyFriends'),'p','还没有学习搭子，先在广场发出邀请。','community-empty');home.friends.forEach(function(p){var item=personCard($('buddyFriends'),p),actions=el(item,'div',undefined,'community-actions');button(actions,'发起挑战',function(){tab('arena');$('challengeFriend').value=p.id;return loadChallenges(epoch);},true);button(actions,'解除搭子',async function(s){if(!confirm('解除与 '+p.nick+' 的搭子关系？'))return;await api('DELETE','friend',{id:p.id});if(s===epoch)await loadHome(s);});});
  }
  function personCard(parent,p){var item=el(parent,'article',undefined,'buddy-person');item.dataset.person=p.id;var head=el(item,'div',undefined,'buddy-person-head');el(head,'span',p.nick.slice(0,1),'buddy-avatar');var info=el(head,'div');el(info,'strong',p.nick);el(info,'p',p.online?'当前在线':'当前离线');var tags=el(item,'div',undefined,'buddy-tags');p.subjects.forEach(function(s){el(tags,'span',s);});if(p.goal)el(item,'p',p.goal);if(p.availability)el(item,'p','学习时间：'+p.availability);return item;}
  async function loadHome(s){var serial=++loadSerial,r=await api('GET','home?subject='+encodeURIComponent($('buddyFilter').value)+'&search='+encodeURIComponent($('buddySearchText').value));if(s!==epoch||serial!==loadSerial)return;home=r;renderHome();}
  async function load(){if(!cloud())return;var s=epoch;try{await connect();await loadHome(s);if(s!==epoch)return;if(tabName==='posts')await loadPosts(s);if(tabName==='arena'){await loadChallenges(s);var remembered=rememberedChallenge();if(remembered){try{await openChallenge(remembered,s);}catch(e){if(e.status===404){rememberChallenge('');challenge=null;}else throw e;}}}$('communityNotice').hidden=true;return {ok:true};}catch(e){if(s===epoch)message(e.message);return {ok:false,reason:'load-failed'};}}
  function composer(open,focus){$('postComposer').open=open;$('postWrite').setAttribute('aria-expanded',String(open));if(focus&&open)$('postText').focus();}
  function paperStyle(id){var hash=0;for(var i=0;i<id.length;i++)hash=(hash*31+id.charCodeAt(i))>>>0;return {color:['butter','rose','sage','sky','lilac'][hash%5],angle:[-.8,.6,-.4,.8,0][hash%5]};}
  function renderPost(parent,p,posts,parser,isReply){
    var item=el(parent,'article',undefined,'community-post '+(isReply?'community-reply':'sticky-note'));
    item.dataset.post=p.id;item.tabIndex=-1;
    if(!isReply){var paper=paperStyle(p.id);item.dataset.paper=paper.color;item.style.setProperty('--note-angle',paper.angle+'deg');el(item,'span',undefined,'note-pin').setAttribute('aria-hidden','true');}
    var header=el(item,'div',undefined,'community-post-header');
    if(!isReply)el(header,'span',p.author.nick.slice(0,1),'note-avatar').setAttribute('aria-hidden','true');
    var who=el(header,'div',undefined,'note-author');el(who,'strong',p.author.nick);var time=el(who,'time',date(p.createdAt));time.dateTime=new Date(p.createdAt).toISOString();
    if(p.parent){var original=posts.get(p.parent);el(item,'p','回复 '+(original?original.author.nick:'此前的留言'),'note-reply-label');}
    var content=item;
    if(!p.deleted&&p.text.length>380){el(item,'p',p.text.slice(0,160)+'…','note-preview');content=el(item,'details',undefined,'note-long-text');el(content,'summary','展开完整便签 · '+p.text.length+' 字');}
    var body=el(content,'div',undefined,'community-markdown');
    if(p.deleted){body.textContent='这张便签已由作者收回。';item.classList.add('note-deleted');}else markdown(body,p.text,parser);
    if(!p.deleted){var actions=el(item,'div',undefined,'community-actions note-actions');button(actions,'回复',function(){reply=p.id;$('postReplyContext').textContent='正在回复 '+p.author.nick;$('postCancelReply').hidden=false;composer(true,true);});if(p.canDelete)button(actions,'删除',async function(session){if(!confirm('删除这条留言？'))return;await api('DELETE','posts',{id:p.id});if(session===epoch){if(reply===p.id)clearReply();await loadPosts(session);message('留言已删除。');}});}
    return item;
  }
  async function loadPosts(s){
    var requested=scope,serial=++postSerial;
    var r=await api('GET','posts'+(requested?'?qid='+encodeURIComponent(requested):''));if(s!==epoch||scope!==requested||serial!==postSerial)return;
    var list=$('postList'),expanded=new Set(Array.from(list.querySelectorAll('.note-thread[open]')).map(function(n){return n.dataset.thread;}));list.replaceChildren();
    $('postScopeTitle').textContent=r.question?'题目讨论板 · '+r.question.topic:'校园留言板';$('postResetScope').hidden=!r.question;$('postQuestion').replaceChildren();$('postQuestion').hidden=!r.question;
    list.setAttribute('aria-label',r.question?'题目讨论便签':'校园留言便签');
    if(r.question)math(el($('postQuestion'),'p','题号 '+r.question.id+'：'+r.question.question));
    var parser=markdownit({html:false,breaks:true,linkify:false});parser.disable('image');
    var posts=new Map(r.posts.map(function(p){return[p.id,p];})),roots=[],threads=new Map();
    r.posts.forEach(function(p){var root=p,seen=new Set([p.id]);while(root.parent&&posts.has(root.parent)&&!seen.has(root.parent)){seen.add(root.parent);root=posts.get(root.parent);}if(root.id===p.id)roots.push(p);else{if(!threads.has(root.id))threads.set(root.id,[]);threads.get(root.id).push(p);}});
    var notes=roots.filter(function(p){return!p.deleted;}).length,replies=r.posts.filter(function(p){return p.parent&&!p.deleted;}).length;
    $('postCount').textContent=notes+' 张便签 · '+replies+' 条回复';
    if(!r.posts.length){var empty=el(list,'div',undefined,'wall-empty');el(empty,'span','这里，留给第一张便签','wall-empty-title');el(empty,'p',r.question?'写下你的解题思路，让讨论从这里开始。':'今天学到了什么？或者，想约谁一起自习？');button(empty,'贴上第一张便签',function(){clearReply();composer(true,true);},true);}
    roots.reverse().forEach(function(p){var item=renderPost(list,p,posts,parser,false),responses=threads.get(p.id)||[];if(responses.length){var thread=el(item,'details',undefined,'note-thread');thread.dataset.thread=p.id;thread.open=expanded.has(p.id);el(thread,'summary',responses.length+' 条回复 · 展开讨论');responses.forEach(function(response){renderPost(thread,response,posts,parser,true);});}});
  }
  function clearReply(){reply=null;$('postReplyContext').textContent='';$('postCancelReply').hidden=true;}
  var labels={invited:'等待接受',waiting:'准备区',active:'进行中',completed:'已完成',cancelled:'已取消',expired:'已过期'};
  async function loadChallenges(s){var r=await api('GET','challenges');if(s!==epoch)return;var list=$('challengeList');list.replaceChildren();if(!r.challenges.length)el(list,'p','还没有挑战。邀请搭子完成同一组题，再一起讨论。','community-empty');r.challenges.forEach(function(c){var item=el(list,'article',undefined,'challenge-item');item.dataset.challenge=c.id;item.dataset.status=c.status;el(item,'strong',c.topic+' · '+c.peer.nick);el(item,'p',labels[c.status]+' · '+date(c.createdAt));el(item,'p',(c.mine.finishedAt?'你已交卷':'你尚未交卷')+' · '+(c.opponent.submitted?'搭子已交卷':'搭子尚未交卷'));button(item,c.status==='completed'?'查看复盘':'查看挑战',function(session){return openChallenge(c.id,session);});});}
  function rememberChallenge(id){try{sessionStorage.setItem('xwy-arena-'+WG_API.getUser().id,id);}catch(e){}}
  function rememberedChallenge(){try{return sessionStorage.getItem('xwy-arena-'+WG_API.getUser().id);}catch(e){return null;}}
  async function openChallenge(id,s,background){
    if(background&&id!==selectedChallengeId)return;
    if(!background)selectedChallengeId=id;
    var serial=++challengeSerial,begin=performance.now(),r=await api('GET','challenge?id='+encodeURIComponent(id));
    if(s!==epoch||serial!==challengeSerial||tabName!=='arena'||id!==selectedChallengeId)return;
    challenge=r.challenge;rememberChallenge(id);
    if(challenge.mode==='sync')arenaClock={server:challenge.serverNow+(performance.now()-begin)/2,local:performance.now()};
    renderChallenge();startArenaPolling();
  }
  function startArenaPolling(){
    if(arenaPoll)return;
    var busy=false;
    arenaPoll=setInterval(async function(){
      if(busy||document.hidden||!communityVisible||tabName!=='arena'||!challenge||!WG_API.isCloudSession())return;
      if(challenge.mode!=='sync'||!['invited','waiting','active'].includes(challenge.status))return;
      busy=true;var s=epoch,id=challenge.id;
      try{await openChallenge(id,s,true);if(answerState&&answerState.dirty&&!answerState.conflict)await flushAnswers();}catch(e){if(s===epoch)saveStatus('连接中断，已保存答案可恢复；正在重试。');}finally{busy=false;}
    },1500);
  }
  function serverTime(){return arenaClock?arenaClock.server+performance.now()-arenaClock.local:Date.now();}
  function saveStatus(text){var n=$('challengeSaveStatus');if(n)n.textContent=text;}
  function syncSelection(){if(!answerState)return;document.querySelectorAll('#challengeAnswerForm input').forEach(function(i){i.checked=answerState.answers[i.name.slice(10)]===i.value;});}
  async function flushAnswers(){
    var state=answerState;if(!state||state.conflict)return;
    if(state.pending){await state.pending;return flushAnswers();}
    while(state===answerState&&state.dirty&&!state.conflict){
      state.dirty=false;var snapshot=Object.assign({},state.answers);saveStatus('正在保存答案…');
      state.pending=api('PUT','challenge/answers',{id:state.id,answers:snapshot,expectedVersion:state.version});
      try{var r=await state.pending;if(state!==answerState)return;state.version=r.challenge.mine.answerVersion;saveStatus('答案已保存，可刷新恢复。');}
      catch(e){state.dirty=true;if(e.status===409){state.conflict=true;saveStatus('比赛或答案版本已变化，请点“重新载入比赛”后继续。');}else saveStatus('答案尚未保存，连接恢复后自动重试。');throw e;}
      finally{state.pending=null;}
    }
  }
  function renderSyncChallenge(){
    var c=challenge,root=$('challengeDetail'),form=$('challengeAnswerForm');
    if(c.status==='active'&&c.questions&&form&&root.dataset.syncId===c.id&&!c.mine.finishedAt){
      if(answerState&&c.mine.answerVersion!==answerState.version&&!answerState.pending){
        if(answerState.dirty){answerState.conflict=true;saveStatus('另一窗口已更新答案，请重新载入比赛。');}
        else{answerState.answers=Object.assign({},c.mine.answers);answerState.version=c.mine.answerVersion;syncSelection();}
      }
      startSyncTick();return;
    }
    root.replaceChildren();root.dataset.syncId=c.id;
    el(root,'h2',c.topic+' · 与 '+c.peer.nick+' 的双人竞技');el(root,'p',labels[c.status]+' · 同五题 · 服务器统一计时 15 分钟','community-muted');
    if(c.status==='completed'){delete root.dataset.syncId;return renderLegacyResult();}
    if(['cancelled','expired'].includes(c.status)){el(root,'p','本场已结束，可以重新邀请好友。');return;}
    async function act(endpoint,body,s){var r=await api('POST',endpoint,Object.assign({id:c.id},body));if(s===epoch){challenge=r.challenge;arenaClock={server:challenge.serverNow,local:performance.now()};renderChallenge();await loadChallenges(s);}}
    if(c.status==='invited'){
      el(root,'p',c.creator===home.uid?'邀请已发出，等待对方接受。':'好友邀请你完成同一组五道客观题。接受后双方进入准备区。');
      if(c.creator!==home.uid)button(root,'接受挑战',function(s){return act('challenge/accept',{},s);},true);
    }else if(c.status==='waiting'){
      el(root,'p','你：'+(c.mine.ready?'已准备':'未准备')+' · 好友：'+(c.opponent.ready?'已准备':'未准备'));
      el(root,'p','双方准备后锁定开局，3 秒后统一发题。锁定后断线不停表，已保存的选择可恢复。准备区 10 分钟有效。','community-muted');
      button(root,c.mine.ready?'撤回准备':'准备比赛',function(s){return act('challenge/ready',{ready:!c.mine.ready},s);},!c.mine.ready);
    }
    if(['invited','waiting'].includes(c.status))button(root,c.creator===home.uid?'取消挑战':'拒绝 / 退出挑战',async function(s){await api('PUT','challenge/cancel',{id:c.id});if(s===epoch)await openChallenge(c.id,s);});
    if(c.status!=='active')return;
    if(c.mine.finishedAt){el(root,'p','你已交卷，等待好友交卷或超时。双方结束后才开放分数、答案和学习记录。','challenge-score');return;}
    el(root,'p','服务器倒计时：','community-muted');var timer=el(root,'strong','');timer.id='challengeCountdown';
    if(!c.questions){el(root,'p','双方已准备，等待统一开局发题。');startSyncTick();return;}
    if(!answerState||answerState.id!==c.id)answerState={id:c.id,answers:Object.assign({},c.mine.answers),version:c.mine.answerVersion,dirty:false,pending:null,conflict:false};
    var state=answerState,n=el(root,'p','答案已保存，可刷新恢复。','community-muted');n.id='challengeSaveStatus';n.setAttribute('role','status');
    button(root,'重新载入比赛',async function(s){answerState=null;root.replaceChildren();await openChallenge(c.id,s);});
    form=el(root,'form',undefined,'community-form');form.id='challengeAnswerForm';
    c.questions.forEach(function(q,i){var field=el(form,'fieldset',undefined,'challenge-task');el(field,'legend','第 '+(i+1)+' 题');math(el(field,'div',q.question,'community-question'));var opts=el(field,'div',undefined,'challenge-options');q.options.forEach(function(value,index){var label=el(opts,'label'),input=el(label,'input');input.type='radio';input.name='challenge-'+q.qid;input.value=String.fromCharCode(65+index);math(el(label,'span',input.value+' · '+value));input.onchange=function(){state.answers[q.qid]=input.value;state.dirty=true;saveStatus('答案尚未保存…');clearTimeout(answerSaveTimer);answerSaveTimer=setTimeout(function(){flushAnswers().catch(function(){});},350);};});});
    syncSelection();var submit=el(form,'button','交卷并等待结果','btn primary');submit.type='submit';
    form.onsubmit=function(e){e.preventDefault();run(submit,async function(s){await flushAnswers();if(state.dirty||state.conflict)throw new Error('答案尚未保存或已在另一窗口更新，请重新载入后交卷。');var r=await api('POST','challenge/submit',{id:c.id,answers:state.answers,expectedVersion:state.version});if(s===epoch){challenge=r.challenge;renderChallenge();await loadChallenges(s);}});};
    startSyncTick();
  }
  function startSyncTick(){
    clearInterval(countdown);function tick(){var c=challenge,n=$('challengeCountdown');if(!n||!c||!communityVisible||tabName!=='arena')return;var before=serverTime()<c.startsAt,remaining=Math.max(0,(before?c.startsAt:c.deadlineAt)-serverTime());n.textContent=before?'开局前 '+Math.ceil(remaining/1000)+' 秒':Math.floor(remaining/60000)+':'+String(Math.floor(remaining/1000)%60).padStart(2,'0');if(!before&&!remaining)n.textContent='时间到，等待服务器结算…';}
    tick();countdown=setInterval(tick,250);
  }
  function renderLegacyResult(){
    // Reuse the existing result/review renderer; only the in-memory view copy is adapted.
    var actual=challenge;challenge=Object.assign({},actual,{mode:'async'});renderChallenge();challenge=actual;
    if(WG_API.isCloudSession())WG_API.pullMerge(WG_Data.get()).then(function(merged){if(challenge===actual)WG_Data.replaceAll(merged);}).catch(function(){message('结果已保存，学习记录同步稍后重试。');});
  }
  function renderChallenge(){clearInterval(countdown);if(challenge&&challenge.mode==='sync'){renderSyncChallenge();return;}var root=$('challengeDetail');root.replaceChildren();if(!challenge)return;var c=challenge;el(root,'h2',c.topic+' · 与 '+c.peer.nick+' 的挑战');el(root,'p',labels[c.status]+' · 五题 · 每人限时 15 分钟','community-muted');
    if(c.status==='completed'){el(root,'p',c.winner===home.uid?'你赢得了这次挑战':c.winner?'这次搭子领先，一起看看解题过程':'本次平局','challenge-score');el(root,'p','你答对 '+c.mine.score+'/5 · 用时 '+seconds(c.mine.elapsedMs)+'；搭子答对 '+c.opponent.score+'/5 · 用时 '+seconds(c.opponent.elapsedMs));c.review.forEach(function(q,i){var item=el(root,'article',undefined,'challenge-review');el(item,'strong',String(i+1)+' · '+(q.correct?'答对':'待巩固'));math(el(item,'p',q.question,'community-question'));el(item,'p','你的答案：'+(q.yours||'未答')+' · 标准答案：'+q.answer);var detail=el(item,'details',undefined,'challenge-analysis');el(detail,'summary','展开解题解析');math(el(detail,'div',q.analysis,'community-question'));var actions=el(item,'div',undefined,'community-actions');button(actions,'讨论这道题',function(){openQuestion(q.qid);});button(actions,'打开题目白板',function(){WG_Whiteboard.openBoard({qid:q.qid,question:q.question,topic:q.topic});});});return;}
    if(c.status!=='active'){el(root,'p','这场挑战已结束，可重新发起挑战。','community-empty');return;}
    if(c.mine.finishedAt){el(root,'p','你已交卷，答对 '+c.mine.score+'/5。等待搭子交卷后查看完整解析。','challenge-score');button(root,'刷新结果',function(session){return openChallenge(c.id,session);});return;}
    if(!c.mine.startedAt){el(root,'p','开始后计时。双方可以在不同时间完成，完整解析在双方交卷后开放。','community-muted');button(root,'开始挑战',async function(s){var r=await api('POST','challenge/start',{id:c.id});if(s===epoch){challenge=r.challenge;renderChallenge();}},true);button(root,c.creator===home.uid?'取消挑战':'婉拒挑战',async function(s){await api('PUT','challenge/cancel',{id:c.id});if(s===epoch){await openChallenge(c.id,s);await loadChallenges(s);}});return;}
    el(root,'p','剩余时间：','community-muted');var timer=el(root,'strong','');timer.id='challengeCountdown';
    var form=el(root,'form',undefined,'community-form');form.id='challengeAnswerForm';(c.questions||[]).forEach(function(q,i){var field=el(form,'fieldset',undefined,'challenge-task');el(field,'legend','第 '+(i+1)+' 题');math(el(field,'div',q.question,'community-question'));var options=el(field,'div',undefined,'challenge-options');q.options.forEach(function(value,index){var label=el(options,'label'),input=el(label,'input');input.type='radio';input.name='challenge-'+q.qid;input.value=String.fromCharCode(65+index);math(el(label,'span',input.value+' · '+value));});});
    var submit=el(form,'button','交卷并保存学习记录','btn primary');submit.type='submit';form.onsubmit=function(e){e.preventDefault();run(submit,function(s){return submitChallenge(s);});};
    function tick(){var remain=Math.max(0,15*60000-(Date.now()-c.mine.startedAt));timer.textContent=Math.floor(remain/60000)+':'+String(Math.floor(remain/1000)%60).padStart(2,'0');if(!remain){clearInterval(countdown);run(submit,function(s){return submitChallenge(s);});}}
    tick();countdown=setInterval(tick,1000);
  }
  function seconds(ms){return (Math.max(0,ms)/1000).toFixed(1)+' 秒';}
  async function submitChallenge(s){var answers={};document.querySelectorAll('#challengeAnswerForm input:checked').forEach(function(i){answers[i.name.slice(10)]=i.value;});var r=await api('POST','challenge/submit',{id:challenge.id,answers:answers});if(s!==epoch)return;challenge=r.challenge;renderChallenge();message('挑战已交卷，五道客观题已计入你的学习记录。');var merged=await WG_API.pullMerge(WG_Data.get());if(s!==epoch)return;WG_Data.replaceAll(merged);await loadChallenges(s);}
  function open(name){tab(name||'friends');StudyAppBridge.navTo('community');}
  async function openArena(options){
    options=options||{};if(typeof options!=='object'||Array.isArray(options)||(options.friendId!==undefined&&typeof options.friendId!=='string'))return {ok:false,reason:'invalid-options'};
    selectedFriend=options.friendId||null;open('arena');if(!WG_API.isCloudSession())return {ok:false,reason:'auth-required'};
    var s=epoch,result=await load();if(s!==epoch)return {ok:false,reason:'session-changed'};if(!result||!result.ok)return result||{ok:false,reason:'load-failed'};
    if(options.friendId&&!home.friends.some(function(p){return p.id===options.friendId;}))return {ok:false,reason:'not-friend'};
    if(options.friendId)$('challengeFriend').value=options.friendId;return {ok:true,tab:'arena',friendId:options.friendId||null};
  }
  function openQuestion(qid){scope=String(qid);clearReply();open('posts');}
  function init(){
    document.querySelectorAll('[data-community-tab]').forEach(function(b){b.onclick=function(){tab(b.dataset.communityTab);load();};b.onkeydown=function(e){if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();var nodes=Array.from(document.querySelectorAll('[data-community-tab]')),i=nodes.indexOf(b),next=e.key==='Home'?0:e.key==='End'?nodes.length-1:(i+(e.key==='ArrowRight'?1:-1)+nodes.length)%nodes.length;nodes[next].focus();nodes[next].click();};});
    $('buddyProfileForm').oninput=function(){profileDirty=true;};$('buddyProfileForm').onsubmit=function(e){e.preventDefault();run(e.submitter,async function(s){if(!cloud())return;await api('PUT','profile',{nick:$('buddyNick').value,goal:$('buddyGoal').value,availability:$('buddyAvailability').value,visible:$('buddyVisible').checked,subjects:Array.from(document.querySelectorAll('[name=buddySubject]:checked')).map(function(i){return i.value;})});if(s===epoch){profileDirty=false;await loadHome(s);message('搭子名片已保存。');}});};
    $('buddySearch').onclick=function(e){run(e.currentTarget,function(s){return loadHome(s);});};$('communityRefresh').onclick=function(e){run(e.currentTarget,async function(s){await load();if(s===epoch&&challenge&&tabName==='arena')await openChallenge(challenge.id,s);});};
    $('postResetScope').onclick=function(){scope=null;clearReply();run(this,loadPosts);};$('postCancelReply').onclick=clearReply;$('postRefresh').onclick=function(){run(this,loadPosts);};
    $('postWrite').onclick=function(){clearReply();composer(true,true);};$('postComposerClose').onclick=function(){composer(false,false);$('postWrite').focus();};$('postComposer').addEventListener('toggle',function(){$('postWrite').setAttribute('aria-expanded',String(this.open));});
    $('postForm').onsubmit=function(e){e.preventDefault();run(e.submitter,async function(s){if(!cloud())return;var parent=reply,requested=scope;await api('POST','posts',{qid:requested,text:$('postText').value,parent:parent});if(s===epoch){$('postText').value='';clearReply();composer(false,false);if(scope===requested){await loadPosts(s);if(parent){var note=Array.from($('postList').querySelectorAll('[data-post]')).find(function(n){return n.dataset.post===parent;});if(note){var thread=note.closest('.sticky-note').querySelector('.note-thread');if(thread)thread.open=true;}}}$('postWrite').focus();message('留言已发布。');}});};
    $('challengeCreateForm').onsubmit=function(e){e.preventDefault();run(e.submitter,async function(s){if(!cloud())return;var r=await api('POST','challenges',{to:$('challengeFriend').value,topic:$('challengeTopic').value,mode:'sync',requestId:arenaRequestId||(arenaRequestId=crypto.randomUUID())});if(s===epoch){arenaRequestId=null;message('挑战已发送，等待好友接受并准备。');await loadChallenges(s);await openChallenge(r.challenge.id,s);}});};$('challengeRefresh').onclick=function(){run(this,async function(s){await loadChallenges(s);if(s===epoch&&challenge)await openChallenge(challenge.id,s);});};
    /* 切回标签页时补一次刷新：后台里不刷新，回来要立刻看到最新的。 */
    window.addEventListener('xwy:view-changed',function(e){communityVisible=e.detail.view==='community';});
    $('challengeCreateForm').addEventListener('input',function(){arenaRequestId=null;});
    document.addEventListener('visibilitychange',function(){if(document.hidden)return;if(!home||!WG_API.isCloudSession())return;liveQueue(tabName==='posts'?'posts':'social');});
    WG_API.onAuthChange(function(){epoch++;loadSerial++;postSerial++;challengeSerial++;clearInterval(arenaPoll);arenaPoll=null;clearTimeout(answerSaveTimer);answerState=null;arenaClock=null;arenaRequestId=null;selectedFriend=null;selectedChallengeId=null;composer(false,false);home=null;scope=null;reply=null;challenge=null;profileDirty=false;clearInterval(countdown);if(socket){socket.disconnect();socket=null;}$('communityConnection').textContent='实时通知待连接';$('communityNotice').hidden=true;['buddyDirectory','buddyFriends','buddyRequests','postList','postQuestion','challengeList','challengeDetail'].forEach(function(id){$(id).replaceChildren();});$('buddyProfileForm').reset();$('postForm').reset();clearReply();$('postCount').textContent='登录后查看便签';message('');$('buddySearchText').value='';$('buddyFilter').value='';tab('friends');fillSelect($('challengeFriend'),[],'先添加学习搭子');});
  }
  document.addEventListener('DOMContentLoaded',init);
  return{load:load,open:open,openArena:openArena,openQuestion:openQuestion};
})();
