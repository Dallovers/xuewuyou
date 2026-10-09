'use strict';
const crypto = require('node:crypto');
const { Server } = require('socket.io');
const { questions } = require('../integrations/questions');
const SUBJECTS = ['高等数学','线性代数','概率论','英语','雅思'];
const objective = [...questions.values()].filter(q => !q.selfAssessed);
const topicOptions = [...new Set(objective.map(q => q.topic))].map(topic => ({topic,subject:objective.find(q=>q.topic===topic).subject,count:objective.filter(q=>q.topic===topic).length})).filter(t=>t.count>=5);
const fail = (message,status=400) => {throw Object.assign(new Error(message),{status});};
const clone = value => JSON.parse(JSON.stringify(value));
module.exports = function({route,authUser,sendJson,readBody,store,syncReviews}) {
  let io, namespace;
  const connections = new Map(), limits = new Map();
  const state = () => clone(store.get('community','main',{profiles:{},requests:[],friends:{},posts:[],challenges:[]}));
  const save = data => store.set('community','main',data);
  const key = (a,b) => [a,b].sort().join(':');
  const profile = (data,id) => data.profiles[id] || {visible:false,nick:(store.get('users',id,{})||{}).nick || '同学',subjects:[],goal:'',availability:''};
  const person = (data,id) => {const p=profile(data,id);return {id,nick:p.nick,visible:p.visible,subjects:p.visible?p.subjects:[],goal:p.visible?p.goal:'',availability:p.visible?p.availability:'',online:p.visible&&!!connections.get(id)};};
  const friendship = (data,a,b) => !!data.friends[key(a,b)];
  const notify = (ids,kind) => store.afterCommit(() => {if(namespace)for(const id of new Set(ids))namespace.to('user:'+id).emit('community:changed',{kind});});
  const postNotice = () => store.afterCommit(() => namespace?.emit('community:changed',{kind:'posts'}));
  function deliverLearning(s,c,id){
    const mine=c.sessions[id];if(!mine?.records||mine.delivered)return;
    const existing=store.get('userData',id,{payload:{}}),payload=clone(existing.payload||{});payload.answers=payload.answers||[];payload.mistakes=payload.mistakes||[];
    const known=new Set(payload.answers.map(a=>a.eventId).filter(Boolean));
    for(const rec of mine.records){if(known.has(rec.eventId))continue;payload.answers.push(rec);if(!rec.correct){const saved=mine.mistakes.find(m=>String(m.qid)===rec.qid),old=payload.mistakes.find(m=>String(m.qid)===rec.qid);if(saved&&old&&Number(old.lastAt||0)<=saved.lastAt)Object.assign(old,saved);else if(saved&&!old)payload.mistakes.push(saved);}}
    payload.answers=payload.answers.slice(-5000);payload.mistakes=payload.mistakes.slice(-500);store.set('userData',id,{...existing,payload,updatedAt:Date.now()});syncReviews(id);mine.delivered=true;save(s);
  }
  // Resume an interrupted result-to-learning delivery after a server restart.
  function recover() { const recovery=state();for(const c of recovery.challenges)for(const id of c.members)if(c.sessions[id]?.records&&!c.sessions[id].delivered)deliverLearning(recovery,c,id); }
  if (!store.database) recover();
  function limited(id,kind,max) {
    const k=id+':'+kind,now=Date.now(),hits=(limits.get(k)||[]).filter(t=>now-t<60000);
    if(hits.length>=max)fail('操作频繁，请稍后再试',429);
    hits.push(now);limits.set(k,hits);
    if(limits.size>2000)for(const [name,rows] of limits)if(now-rows.at(-1)>60000)limits.delete(name);
  }
  function text(value,max,required=false) {
    if(typeof value!=='string'||value.length>max||required&&!value.trim())fail('请填写有效内容，且不超过 '+max+' 字');
    return value.trim();
  }
  function own(method,path,fn) {
    route(method,'/api/community/'+path,async(req,res)=>{
      const user=authUser(req);if(!user)return sendJson(res,401,{ok:false,error:'请先登录云端账号使用校园互动'});
      try {
        limited(user.id,'api',180);
        const body=method==='GET'?{}:JSON.parse(await readBody(req,0.1)||'{}');
        if(!body||typeof body!=='object'||Array.isArray(body))fail('请求格式错误');
        // Mutations below are synchronous once the body has been read.
        const result=fn(user,new URL(req.url,'http://localhost').searchParams,body);
        sendJson(res,200,{ok:true,...result});
      } catch(e){sendJson(res,e.status||(e instanceof SyntaxError?400:500),{ok:false,error:e.status?e.message:e instanceof SyntaxError?'请求格式错误':'校园互动处理失败，请重试'});}
    });
  }
  own('GET','home',(user,query)=>{
    const s=state(), subject=query.get('subject')||'',term=(query.get('search')||'').slice(0,40).toLowerCase(),self=profile(s,user.id);
    const directory=Object.keys(s.profiles).filter(id=>id!==user.id&&s.profiles[id].visible).map(id=>({...person(s,id),isFriend:friendship(s,id,user.id)}))
      .filter(p=>(!subject||p.subjects.includes(subject))&&(!term||p.nick.toLowerCase().includes(term)))
      .sort((a,b)=>b.subjects.filter(x=>self.subjects.includes(x)).length-a.subjects.filter(x=>self.subjects.includes(x)).length||a.nick.localeCompare(b.nick)).slice(0,50);
    const friends=Object.values(s.friends).filter(f=>f.members.includes(user.id)).map(f=>person(s,f.members.find(id=>id!==user.id)));
    const requests=s.requests.filter(r=>r.status==='pending'&&(r.from===user.id||r.to===user.id)).map(r=>({...r,person:person(s,r.from===user.id?r.to:r.from)}));
    const challenges=s.challenges.filter(c=>c.members.includes(user.id));
    return {uid:user.id,profile:self,directory,friends,requests,subjects:SUBJECTS,topics:topicOptions,stats:{friends:friends.length,requests:requests.filter(r=>r.to===user.id).length,challenges:challenges.filter(c=>c.status==='active'&&c.expiresAt>Date.now()&&!c.sessions[user.id]?.finishedAt).length,posts:s.posts.filter(p=>p.author===user.id&&!p.deleted).length}};
  });
  own('PUT','profile',(user,_,body)=>{
    if(typeof body.visible!=='boolean'||!Array.isArray(body.subjects)||body.subjects.length>5||body.subjects.some(x=>!SUBJECTS.includes(x)))fail('请选择有效课程与公开设置');
    const s=state();s.profiles[user.id]={nick:text(body.nick,24,true),visible:body.visible,subjects:[...new Set(body.subjects)],goal:text(body.goal,160),availability:text(body.availability,100),updatedAt:Date.now()};
    save(s);notify([user.id],'profile');return {profile:s.profiles[user.id]};
  });
  own('POST','request',(user,_,body)=>{
    limited(user.id,'requests',15);const s=state(),target=String(body.to||'');
    if(target===user.id||!s.profiles[target]?.visible||!store.get('users',target))fail('该同学未公开搭子资料',404);
    if(friendship(s,user.id,target))fail('你们已经是学习搭子',409);
    const old=s.requests.find(r=>r.status==='pending'&&key(r.from,r.to)===key(user.id,target));
    if(old){if(old.to===user.id)fail('对方已发来请求，请在邀请列表处理',409);return {request:old};}
    if(s.requests.filter(r=>r.status==='pending'&&(r.from===user.id||r.to===target)).length>=100)fail('待处理邀请过多，请先处理已有邀请');
    const r={id:crypto.randomUUID(),from:user.id,to:target,message:text(body.message||'',160),status:'pending',createdAt:Date.now()};s.requests.push(r);
    s.requests=s.requests.filter(r=>r.status==='pending'||Date.now()-r.createdAt<30*86400000);save(s);notify([user.id,target],'friends');return {request:r};
  });
  own('PUT','request',(user,_,body)=>{
    const s=state(),r=s.requests.find(r=>r.id===body.id);if(!r||(r.from!==user.id&&r.to!==user.id))fail('邀请不存在',404);
    if(r.status!=='pending')return {status:r.status};
    if(body.action==='cancel'&&r.from===user.id)r.status='cancelled';
    else if(['accept','reject'].includes(body.action)&&r.to===user.id){r.status=body.action==='accept'?'accepted':'rejected';if(body.action==='accept')s.friends[key(r.from,r.to)]={members:[r.from,r.to],createdAt:Date.now()};}
    else fail('只能处理发给自己的邀请，或取消自己发出的邀请',403);
    save(s);notify([r.from,r.to],'friends');return {status:r.status};
  });
  own('DELETE','friend',(user,_,body)=>{
    const s=state(),target=String(body.id||'');if(!friendship(s,user.id,target))fail('搭子关系不存在',404);
    delete s.friends[key(user.id,target)];save(s);notify([user.id,target],'friends');return {};
  });
  function scope(value){if(!value)return null;const q=questions.get(String(value));if(!q)fail('题目不存在',404);return q.id;}
  function publicPost(s,p,user){return {...p,author:{id:p.author,nick:profile(s,p.author).nick},canDelete:p.author===user.id};}
  own('GET','posts',(user,query)=>{
    const s=state(),qid=scope(query.get('qid')),mode=query.get('mode');
    const items=s.posts.filter(p=>qid?p.qid===qid:mode==='all'||!p.qid).slice(-100);
    const q=qid?questions.get(qid):null;
    return {posts:items.map(p=>publicPost(s,p,user)),question:q?{id:q.id,topic:q.topic,question:q.question}:null};
  });
  own('POST','posts',(user,_,body)=>{
    limited(user.id,'posts',20);const s=state(),qid=scope(body.qid),content=text(body.text,3000,true);
    if(s.posts.length>=5000)fail('留言区已达到当前容量，请联系网站维护者');
    let parent=null;if(body.parent){parent=s.posts.find(p=>p.id===body.parent);if(!parent||parent.deleted||parent.qid!==qid)fail('回复目标不存在或不属于当前讨论',404);}
    const p={id:crypto.randomUUID(),author:user.id,qid,text:content,parent:parent?.id||null,createdAt:Date.now(),deleted:false};s.posts.push(p);save(s);postNotice();return {post:publicPost(s,p,user)};
  });
  own('DELETE','posts',(user,_,body)=>{
    const s=state(),p=s.posts.find(p=>p.id===body.id);if(!p)fail('留言不存在',404);if(p.author!==user.id)fail('只能删除自己的留言',403);
    p.deleted=true;p.text='';p.updatedAt=Date.now();save(s);postNotice();return {};
  });
  const duel = (s,id,user) => {const c=s.challenges.find(c=>c.id===id);if(!c||!c.members.includes(user.id))fail('挑战不存在',404);return c;};
  function summary(s,c,user,detail=false) {
    const complete=c.status==='completed',mine=c.sessions[user.id]||{},peer=c.members.find(id=>id!==user.id),other=c.sessions[peer]||{};
    const result={id:c.id,topic:c.topic,count:c.qids.length,creator:c.creator,status:c.status==='active'&&Date.now()>c.expiresAt?'expired':c.status,createdAt:c.createdAt,expiresAt:c.expiresAt,peer:person(s,peer),mine:{startedAt:mine.startedAt||null,finishedAt:mine.finishedAt||null,score:mine.finishedAt?mine.score:null,elapsedMs:mine.finishedAt?mine.elapsedMs:null},opponent:{submitted:!!other.finishedAt,...(complete?{score:other.score,elapsedMs:other.elapsedMs}:{})},maxMinutes:15};
    if(complete){result.winner=c.members.slice().sort((a,b)=>c.sessions[b].score-c.sessions[a].score||c.sessions[a].elapsedMs-c.sessions[b].elapsedMs)[0];if(mine.score===other.score&&mine.elapsedMs===other.elapsedMs)result.winner=null;}
    if(detail&&complete)result.review=c.qids.map(id=>{const q=questions.get(id);return {qid:id,topic:q.topic,question:q.question,options:q.options,answer:q.answer,analysis:q.analysis,yours:mine.answers[id]||null,correct:mine.answers[id]===q.answer};});
    // Questions are sent only after the authenticated participant starts; answers wait until both finish.
    if(detail&&mine.startedAt&&!mine.finishedAt&&result.status==='active')result.questions=c.qids.map(id=>{const q=questions.get(id);return {qid:id,topic:q.topic,question:q.question,options:q.options};});
    return result;
  }
  own('GET','challenges',user=>{const s=state();return {challenges:s.challenges.filter(c=>c.members.includes(user.id)).slice(-50).reverse().map(c=>summary(s,c,user))};});
  own('POST','challenges',(user,_,body)=>{
    limited(user.id,'challenges',10);const s=state(),target=String(body.to||'');if(!friendship(s,user.id,target))fail('请先添加并确认学习搭子',403);
    const bank=objective.filter(q=>q.topic===body.topic);if(bank.length<5)fail('请选择至少有五道客观题的主题');
    if(s.challenges.length>=2000)fail('挑战记录已达到当前容量，请联系网站维护者');
    if(s.challenges.filter(c=>c.status==='active'&&c.expiresAt>Date.now()&&c.members.includes(user.id)).length>=10)fail('请先完成或取消已有挑战');
    for(let i=bank.length-1;i>0;i--){const j=crypto.randomInt(i+1);[bank[i],bank[j]]=[bank[j],bank[i]];}
    const c={id:crypto.randomUUID(),creator:user.id,members:[user.id,target],topic:body.topic,qids:bank.slice(0,5).map(q=>q.id),sessions:{},status:'active',createdAt:Date.now(),expiresAt:Date.now()+86400000};s.challenges.push(c);save(s);notify(c.members,'challenges');return {challenge:summary(s,c,user)};
  });
  own('GET','challenge',(user,query)=>{const s=state();return {challenge:summary(s,duel(s,query.get('id'),user),user,true)};});
  own('POST','challenge/start',(user,_,body)=>{
    const s=state(),c=duel(s,body.id,user);if(c.status!=='active'||Date.now()>c.expiresAt)fail('挑战已结束或过期',409);
    if(!c.sessions[user.id]){c.sessions[user.id]={startedAt:Date.now(),finishedAt:null};save(s);notify(c.members,'challenges');}
    return {challenge:summary(s,c,user,true)};
  });
  own('POST','challenge/submit',(user,_,body)=>{
    const s=state(),c=duel(s,body.id,user),mine=c.sessions[user.id];
    if(mine?.finishedAt){deliverLearning(s,c,user.id);return {challenge:summary(s,c,user,true),recorded:0};}
    if(c.status!=='active'||Date.now()>c.expiresAt||!mine)fail('请先开始有效挑战',409);
    if(!body.answers||typeof body.answers!=='object'||Array.isArray(body.answers)||Object.keys(body.answers).some(id=>!c.qids.includes(id))||Object.values(body.answers).some(a=>!['A','B','C','D'].includes(a)))fail('答案格式错误');
    const now=Date.now(),elapsed=now-mine.startedAt,answers=elapsed<=15*60000?body.answers:{};
    mine.answers=answers;mine.finishedAt=now;mine.elapsedMs=Math.min(elapsed,15*60000);mine.score=c.qids.filter(id=>answers[id]===questions.get(id).answer).length;
    if(c.members.every(id=>c.sessions[id]?.finishedAt))c.status='completed';
    // Accepted answers become real objective observations exactly once.
    const existing=store.get('userData',user.id,{payload:{}}),payload=clone(existing.payload||{});payload.answers=payload.answers||[];payload.mistakes=payload.mistakes||[];
    c.qids.forEach((id,i)=>{const q=questions.get(id),correct=answers[id]===q.answer;payload.answers.push({qid:id,q:q.question,topic:q.topic,type:'好友挑战',correct,timeMs:now+i,eventId:'challenge-'+c.id+'-'+id});if(!correct){const old=payload.mistakes.find(m=>String(m.qid)===id);if(old){old.wrongCount=(old.wrongCount||0)+1;old.lastAt=now;}else payload.mistakes.push({qid:id,question:q.question,topic:q.topic,answer:answers[id]||'',correctAns:q.answer,wrongCount:1,lastAt:now});}});
    payload.answers=payload.answers.slice(-5000);payload.mistakes=payload.mistakes.slice(-500);
    // Persist the result and its learning events before delivery; retries/restarts deduplicate events.
    mine.records=c.qids.map((id,i)=>payload.answers.findLast(a=>a.eventId==='challenge-'+c.id+'-'+id));
    mine.mistakes=payload.mistakes.filter(m=>c.qids.includes(String(m.qid)));
    save(s);deliverLearning(s,c,user.id);notify(c.members,'challenges');return {challenge:summary(s,c,user,true),recorded:c.qids.length};
  });
  own('PUT','challenge/cancel',(user,_,body)=>{
    const s=state(),c=duel(s,body.id,user);if(c.status!=='active')fail('挑战已结束',409);if(c.members.some(id=>c.sessions[id]?.finishedAt))fail('已有同学完成作答，请完成挑战后查看结果',409);
    c.status='cancelled';save(s);notify(c.members,'challenges');return {};
  });
  function attach(server) {
    io=new Server(server,{serveClient:false,maxHttpBufferSize:10000,cors:{origin:process.env.FRONTEND_ORIGIN || 'https://dallovers.github.io',methods:['GET','POST']}});namespace=io.of('/community');
    namespace.use((socket,next)=>{store.run(()=>{const user=authUser({headers:{authorization:'Bearer '+(socket.handshake.auth?.token||'')}});if(!user)return next(new Error('请登录云端账号'));socket.data.uid=user.id;next();},{readOnly:true}).catch(()=>next(new Error('账号验证暂不可用，请重试')));});
    namespace.on('connection',socket=>{
      const id=socket.data.uid;socket.join('user:'+id);connections.set(id,(connections.get(id)||0)+1);
      const timer=setInterval(()=>{store.run(()=>{if(!authUser({headers:{authorization:'Bearer '+(socket.handshake.auth?.token||'')}}))socket.disconnect(true);},{readOnly:true}).catch(()=>socket.disconnect(true));},60000);timer.unref();
      socket.on('disconnect',()=>{clearInterval(timer);const n=(connections.get(id)||1)-1;if(n)connections.set(id,n);else connections.delete(id);});
    });
  }
  return {attach,recover,close:()=>new Promise(resolve=>{if(io)io.close(resolve);else resolve();})};
};
