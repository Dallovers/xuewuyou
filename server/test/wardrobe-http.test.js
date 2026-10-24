'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{once}=require('node:events');
const {io}=require('socket.io-client'),{questions}=require('../integrations/questions');
let app,base,a,b,sa,sb;const temp=fs.mkdtempSync(path.join(os.tmpdir(),'xwy-wardrobe-'));
async function api(url,body,token){const res=await fetch(base+'/api/'+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:res.status,...await res.json()};}
before(async()=>{process.env.DATA_DIR=temp;process.env.JWT_SECRET='wardrobe-http-test-only';app=require('../server');await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.server.address().port;a=await api('auth/register',{username:'衣橱甲',password:'WardrobeTest123'});b=await api('auth/register',{username:'衣橱乙',password:'WardrobeTest123'});assert(a.token&&b.token);});
after(async()=>{sa?.disconnect();sb?.disconnect();app.campusLive.close();app.studyRooms.close();await app.integrations.close();await app.community.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));if(path.dirname(temp)!==os.tmpdir()||!path.basename(temp).startsWith('xwy-wardrobe-'))throw Error('Unsafe cleanup');fs.rmSync(temp,{recursive:true,force:true});});
test('HTTP wallet authentication, server grading, duplicate reward and redemption',async()=>{
 assert.equal((await api('skins/wallet')).status,401);assert.equal((await api('skins/equip',{id:'vroid-vita'},a.token)).status,400);
 assert.equal((await api('skins/purchase',{id:'vroid-vita',price:0,balance:9999},a.token)).status,400);
 const bank=[...questions.values()].filter(q=>!q.selfAssessed);
 const first=await api('skins/answer',{qid:bank[0].id,answer:bank[0].answer,coins:999},a.token);assert.equal(first.gained,10);assert.equal(first.wallet.balance,10);
 assert.equal((await api('skins/answer',{qid:bank[0].id,answer:bank[0].answer},a.token)).gained,0);
 for(const q of bank.slice(1,16))assert.equal((await api('skins/answer',{qid:q.id,answer:q.answer},a.token)).gained,10);
 const purchases=await Promise.all([api('skins/purchase',{id:'vroid-vita'},a.token),api('skins/purchase',{id:'vroid-vita'},a.token)]);assert(purchases.every(r=>r.ok));assert.equal((await api('skins/wallet',null,a.token)).wallet.balance,0);
 assert.equal((await api('skins/equip',{id:'vroid-vita'},a.token)).wallet.equipped,'vroid-vita');assert.equal((await api('skins/wallet',null,b.token)).wallet.balance,0);
 const malformed=await fetch(base+'/api/skins/equip',{method:'POST',headers:{Authorization:'Bearer '+a.token},body:'null'});assert.equal(malformed.status,400);
});
test('two accounts see owned appearance changes and gestures; forged skins rejected',async()=>{
 sa=io(base+'/community',{auth:{token:a.token},transports:['websocket'],reconnection:false});sb=io(base+'/community',{auth:{token:b.token},transports:['websocket'],reconnection:false});await Promise.all([once(sa,'connect'),once(sb,'connect')]);
 const ack=(socket,event,body)=>socket.timeout(3000).emitWithAck(event,body),pose={x:0,y:0,z:30,yaw:0,height:0,time:0,clip:'idle'};
 const joinedA=await ack(sa,'campus:join',{world:'campus-hub-v1',avatar:'vroid-vita',pose}),joinedB=await ack(sb,'campus:join',{world:'campus-hub-v1',avatar:'anime',pose});assert(joinedA.ok&&joinedB.ok);
 assert.equal((await ack(sb,'campus:appearance',{avatar:'vroid-vita'})).ok,false);
 const changed=once(sb,'campus:state');assert.equal((await ack(sa,'campus:appearance',{avatar:'kenney-ghost'})).ok,true);let [snapshot]=await changed;assert.equal(snapshot.players.find(p=>p.id===joinedA.self.id).avatar,'kenney-ghost');
 const motion=once(sb,'campus:state');sa.emit('campus:pose',{...pose,clip:'punch',time:.2});[snapshot]=await motion;assert.equal(snapshot.players.find(p=>p.id===joinedA.self.id).clip,'punch');
 assert(!JSON.stringify(snapshot).includes(a.token));assert(!JSON.stringify(snapshot).includes('balance'));
});
