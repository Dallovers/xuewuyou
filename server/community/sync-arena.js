'use strict';
const crypto=require('node:crypto');
const DURATION=15*60000,COUNTDOWN=3000,LOBBY=10*60000;
module.exports=function({store,save,notify,questions,person,syncReviews,fail}) {
  const pending=c=>['invited','waiting','active'].includes(c.status);
  const validAnswers=(c,answers)=>{
    if(!answers||typeof answers!=='object'||Array.isArray(answers)||Object.keys(answers).some(id=>!c.qids.includes(id))||Object.values(answers).some(a=>!['A','B','C','D'].includes(a)))fail('答案格式错误');
    return {...answers};
  };
  function finish(c,id,answers,at,timedOut=false) {
    const mine=c.sessions[id];if(mine.finishedAt)return;
    mine.answers=answers;mine.finishedAt=at;mine.elapsedMs=Math.max(0,Math.min(at-c.startsAt,DURATION));mine.timedOut=timedOut;
    mine.score=c.qids.filter(id=>answers[id]===questions.get(id).answer).length;
    mine.records=c.qids.map((id,i)=>{const q=questions.get(id);return {qid:id,q:q.question,topic:q.topic,type:'好友挑战',correct:answers[id]===q.answer,timeMs:at+i,eventId:'challenge-'+c.id+'-'+id};});
    delete mine.draft;
  }
  function deliver(s,c,id) {
    const mine=c.sessions[id];if(c.status!=='completed'||!mine?.records||mine.delivered)return;
    const existing=store.get('userData',id,{payload:{}}),payload=JSON.parse(JSON.stringify(existing.payload||{}));payload.answers=payload.answers||[];payload.mistakes=payload.mistakes||[];
    const known=new Set(payload.answers.map(a=>a.eventId).filter(Boolean));
    for(const record of mine.records) {
      if(known.has(record.eventId))continue;
      payload.answers.push(record);
      if(!record.correct){const q=questions.get(record.qid),old=payload.mistakes.find(m=>String(m.qid)===record.qid);
        if(old){old.wrongCount=(old.wrongCount||0)+1;old.lastAt=Math.max(Number(old.lastAt||0),record.timeMs);}
        else payload.mistakes.push({qid:record.qid,question:q.question,topic:q.topic,answer:mine.answers[record.qid]||'',correctAns:q.answer,wrongCount:1,lastAt:record.timeMs});
      }
    }
    payload.answers=payload.answers.slice(-5000);payload.mistakes=payload.mistakes.slice(-500);
    store.set('userData',id,{...existing,payload,updatedAt:Date.now()});syncReviews(id);mine.delivered=true;save(s);
  }
  function publish(s,c) {
    if(c.status==='active'&&c.members.every(id=>c.sessions[id]?.finishedAt))c.status='completed';
    // Commit recoverable records first; learning output stays private until BOTH finish.
    save(s);
    if(c.status==='completed')for(const id of c.members)deliver(s,c,id);
    notify(c.members,'challenges');
  }
  function settle(s,now=Date.now()) {
    for(const c of s.challenges) {
      if(c.mode!=='sync')continue;
      let changed=false;
      if(['invited','waiting'].includes(c.status)&&now>=(c.lobbyExpiresAt||c.expiresAt)){c.status='expired';changed=true;}
      if(c.status==='active'&&now>=c.deadlineAt){
        for(const id of c.members)if(!c.sessions[id].finishedAt){finish(c,id,c.sessions[id].draft||{},c.deadlineAt,true);changed=true;}
      }
      if(changed)publish(s,c);
      else if(c.status==='completed')for(const id of c.members)deliver(s,c,id);
    }
  }
  function summary(s,c,user,detail) {
    const now=Date.now(),complete=c.status==='completed',mine=c.sessions[user.id]||{},otherId=c.members.find(id=>id!==user.id),other=c.sessions[otherId]||{};
    const result={id:c.id,mode:'sync',topic:c.topic,count:c.qids.length,creator:c.creator,status:c.status,createdAt:c.createdAt,expiresAt:c.expiresAt,lobbyExpiresAt:c.lobbyExpiresAt||null,startsAt:c.startsAt||null,deadlineAt:c.deadlineAt||null,serverNow:now,peer:person(s,otherId),maxMinutes:15,
      mine:{ready:!!c.ready?.[user.id],startedAt:mine.startedAt||null,finishedAt:mine.finishedAt||null,score:complete?mine.score:null,elapsedMs:complete?mine.elapsedMs:null,timedOut:!!mine.timedOut},
      opponent:{ready:!!c.ready?.[otherId],submitted:!!other.finishedAt,...(complete?{score:other.score,elapsedMs:other.elapsedMs,timedOut:!!other.timedOut}:{})}};
    if(detail){result.mine.answers=mine.answers||mine.draft||{};result.mine.answerVersion=mine.answerVersion||0;}
    if(detail&&c.status==='active'&&now>=c.startsAt&&!mine.finishedAt)result.questions=c.qids.map(id=>{const q=questions.get(id);return {qid:id,topic:q.topic,question:q.question,options:q.options};});
    if(complete){
      const [a,b]=c.members;result.winner=c.sessions[a].score===c.sessions[b].score&&c.sessions[a].elapsedMs===c.sessions[b].elapsedMs?null:c.members.slice().sort((a,b)=>c.sessions[b].score-c.sessions[a].score||c.sessions[a].elapsedMs-c.sessions[b].elapsedMs)[0];
      if(detail)result.review=c.qids.map(id=>{const q=questions.get(id);return {qid:id,topic:q.topic,question:q.question,options:q.options,answer:q.answer,analysis:q.analysis,yours:mine.answers[id]||null,correct:mine.answers[id]===q.answer};});
    }
    return result;
  }
  function create(s,user,body,bank) {
    if(typeof body.requestId!=='string'||!/^[-a-zA-Z0-9]{8,80}$/.test(body.requestId))fail('请提供有效的挑战请求标识');
    const prior=s.challenges.find(c=>c.creator===user.id&&c.requestId===body.requestId);
    if(prior){if(prior.topic!==body.topic||!prior.members.includes(body.to))fail('请求标识已用于另一场挑战',409);return prior;}
    const c={id:crypto.randomUUID(),mode:'sync',requestId:body.requestId,creator:user.id,members:[user.id,String(body.to)],topic:body.topic,qids:bank.slice(0,5).map(q=>q.id),sessions:{},ready:{},status:'invited',createdAt:Date.now(),expiresAt:Date.now()+86400000};
    s.challenges.push(c);publish(s,c);return c;
  }
  function accept(s,c,user) {
    if(user.id===c.creator)fail('请由受邀好友接受挑战',403);
    if(['waiting','active','completed'].includes(c.status))return;
    if(c.status!=='invited')fail('邀请已结束或过期',409);
    c.status='waiting';c.acceptedAt=Date.now();c.lobbyExpiresAt=c.acceptedAt+LOBBY;publish(s,c);
  }
  function ready(s,c,user,value) {
    if(typeof value!=='boolean')fail('准备状态格式错误');
    if(['active','completed'].includes(c.status)&&value)return; // retry after the shared start was locked
    if(c.status!=='waiting')fail('请先接受邀请，比赛锁定后不能撤回准备',409);
    c.ready[user.id]=value?Date.now():null;
    if(c.members.every(id=>c.ready[id])) {
      c.status='active';c.startsAt=Date.now()+COUNTDOWN;c.deadlineAt=c.startsAt+DURATION;
      for(const id of c.members)c.sessions[id]={startedAt:c.startsAt,finishedAt:null,draft:{},answerVersion:0};
    }
    publish(s,c);
  }
  function answers(s,c,user,body) {
    const mine=c.sessions[user.id];
    if(c.status!=='active'||Date.now()<c.startsAt||Date.now()>=c.deadlineAt||mine?.finishedAt)fail('当前不能保存答案，请刷新比赛状态',409);
    const draft=validAnswers(c,body.answers);
    if(!Number.isInteger(body.expectedVersion)||body.expectedVersion!==mine.answerVersion)fail('答案版本已变化，请刷新后重试',409);
    mine.draft=draft;mine.answerVersion++;save(s);
  }
  function submit(s,c,user,body) {
    const mine=c.sessions[user.id];if(mine?.finishedAt)return {recorded:0};
    if(c.status!=='active'||Date.now()<c.startsAt||Date.now()>=c.deadlineAt)fail('比赛尚未开局或已经结束',409);
    // A stale browser tab must not overwrite the more recent saved answers.
    if(!Number.isInteger(body.expectedVersion)||body.expectedVersion!==mine.answerVersion)fail('答案版本已变化，请刷新后交卷',409);
    const snapshot=validAnswers(c,body.answers);finish(c,user.id,snapshot,Date.now());publish(s,c);
    return {recorded:c.status==='completed'?c.qids.length:0};
  }
  function cancel(s,c) {
    if(c.status==='cancelled')return;
    if(!['invited','waiting'].includes(c.status))fail('比赛已经锁定开局或结束，不能取消',409);
    c.status='cancelled';publish(s,c);
  }
  return {pending,settle,summary,create,accept,ready,answers,submit,cancel,deliver};
};
