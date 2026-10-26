'use strict';
// Run only against an isolated staging API forwarded to localhost. Creates two
// disposable users; never point this at the production API or production data.
const assert=require('node:assert/strict');
const {io}=require('socket.io-client');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.ARENA_SMOKE_BASE||'http://127.0.0.1:4199';
assert(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Use an isolated localhost staging API');
const sockets=[],checks=[],pause=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,condition)=>{assert(condition,name);checks.push(name);console.log('PASS',name);};
const pose={x:39,y:0,z:2,yaw:0,height:0,time:0,clip:'idle'};
async function req(user,route,method='GET',body){
 const response=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(user?{Authorization:'Bearer '+user.token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});
 const result=await response.json();assert(response.ok,route+': '+JSON.stringify(result));return result;
}
const ack=(socket,event,body)=>socket.timeout(10000).emitWithAck(event,body);
function event(socket,name,predicate=()=>true,ms=15000){
 const pending=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{socket.off(name,handler);reject(Error('Timed out waiting for '+name));},ms);function handler(value){if(!predicate(value))return;clearTimeout(timer);socket.off(name,handler);resolve(value);}socket.on(name,handler);});
 pending.catch(()=>{});return pending;
}
async function connect(user){
 const socket=io(base+'/community',{auth:{token:user.token},transports:['websocket'],reconnection:false,timeout:10000});sockets.push(socket);
 await new Promise((resolve,reject)=>{socket.once('connect',resolve);socket.once('connect_error',reject);});
 const joined=await ack(socket,'campus:join',{world:'campus-hub-v1',avatar:'anime',pose});assert.equal(joined.ok,true,JSON.stringify(joined));return {socket,joined};
}
(async()=>{
 const stamp=Date.now().toString(36);
 try{
  const a=await req(null,'auth/register','POST',{username:'arena'+stamp+'a',password:'StageOnlyDuel123456'});
  const b=await req(null,'auth/register','POST',{username:'arena'+stamp+'b',password:'StageOnlyDuel123456'});
  for(const [user,nick] of [[a,'隔离验收甲'],[b,'隔离验收乙']])await req(user,'community/profile','PUT',{nick,visible:true,subjects:['高等数学'],goal:'发布验收',availability:'临时'});
  const presenceA=await connect(a);await pause(900);const arenaA=await connect(a);
  check('same account keeps its player identity across presence and arena sockets',presenceA.joined.self.id===arenaA.joined.self.id);
  const queued=await ack(arenaA.socket,'duel:match',{station:'jia'});check('first player enters the real matching queue',queued.ok&&queued.waiting);
  presenceA.socket.disconnect();
  console.log('Waiting 125 real seconds without pose updates, with the other account connection disconnected...');
  for(let i=0;i<5;i++){await pause(25000);console.log('Waited '+(i+1)*25+' seconds');}
  const presenceB=await connect(b);await pause(900);const arenaB=await connect(b);
  const announced=event(arenaA.socket,'duel:matched');
  const match=await ack(arenaB.socket,'duel:match',{station:'jia'}),first=await announced;
  check('waiting over two minutes and losing the other socket still matches both players',match.ok&&match.matched&&first.challenge===match.challenge);
  check('two players who chose the same seat receive distinct seats',first.station==='jia'&&match.station==='yi');
  const id=match.challenge;
  for(const [entry,seat] of [[arenaA,first.station],[arenaB,match.station]]){const result=await ack(entry.socket,'duel:enter',{challenge:id,station:seat});assert.equal(result.ok,true,JSON.stringify(result));}
  const qa=(await req(a,'community/challenge/start','POST',{id})).challenge,qb=(await req(b,'community/challenge/start','POST',{id})).challenge;
  check('both seated players receive five identical real questions',qa.questions.length===5&&JSON.stringify(qa.questions)===JSON.stringify(qb.questions));
  check('question payload hides answers before submission',qa.questions.every(q=>q.answer===undefined&&q.analysis===undefined));
  const complete=event(arenaA.socket,'duel:state',m=>m.challenge===id&&m.status==='completed');
  const answers=Object.fromEntries(qa.questions.map(q=>[q.qid,'A']));
  const submittedA=await req(a,'community/challenge/submit','POST',{id,answers});
  check('first submission waits for the opponent without exposing review',submittedA.challenge.status==='active'&&!submittedA.challenge.review);
  const submittedB=await req(b,'community/challenge/submit','POST',{id,answers});await complete;
  const resultA=(await req(a,'community/challenge?id='+encodeURIComponent(id))).challenge;
  check('both receive completed server-graded results',submittedB.challenge.status==='completed'&&resultA.status==='completed'&&resultA.review.length===5&&Number.isFinite(resultA.mine.score)&&resultA.mine.score>=0&&resultA.mine.score<=5);
  const left=await ack(arenaA.socket,'duel:leave',{challenge:id});check('leaving the podium is acknowledged',left.ok===true);
  const directory=path.resolve(__dirname,'../../js/features/campus-hub/test-results/arena-release');fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'staging-validation.json'),JSON.stringify({testedAt:new Date().toISOString(),waitSeconds:125,checks},null,2));
  console.log('Isolated staging acceptance complete; no production accounts or learning records created.');
 }finally{for(const socket of sockets)socket.disconnect();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
