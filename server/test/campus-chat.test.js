'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {once}=require('node:events'),{io}=require('socket.io-client');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'campus-chat-')),sockets=[];
let app,base,a,b,sa,sb,observer,uidA;const received=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms)),pose={x:0,y:0,z:30,yaw:0,height:0,time:0,clip:'idle'};
const ack=(s,event,body)=>s.timeout(3000).emitWithAck(event,body);
async function user(username){const r=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'ChatTest123'})});assert(r.ok);return r.json();}
async function socket(user){const s=io(base+'/community',{auth:{token:user.token},transports:['websocket'],reconnection:false});sockets.push(s);await once(s,'connect');return s;}
before(async()=>{process.env.DATA_DIR=temp;process.env.JWT_SECRET='campus-chat-isolated-only';app=require('../server');await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.server.address().port;a=await user('聊天甲');b=await user('聊天乙');sa=await socket(a);sb=await socket(b);observer=await socket(b);observer.on('campus:chat',m=>received.push(m));});
after(async()=>{for(const s of sockets)s.disconnect();app.campusLive.close();app.studyRooms.close();await app.integrations.close();await app.community.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));if(path.dirname(temp)!==os.tmpdir()||!path.basename(temp).startsWith('campus-chat-'))throw Error('Unsafe cleanup');fs.rmSync(temp,{recursive:true,force:true});});
test('authenticated nonparticipants cannot send or receive campus chat',async()=>{const r=await ack(observer,'campus:chat/send',{text:'not joined',clientId:'observer-001'});assert.equal(r.ok,false);});
test('two participants receive one server-authored message; outsiders receive none',async()=>{
 const store=require('../lib/store');store.set('community','main',{profiles:{[a.user.id]:{nick:'1',visible:true},[b.user.id]:{nick:'2',visible:true}}});
 const ja=await ack(sa,'campus:join',{world:'campus-hub-v1',avatar:'robot',pose}),jb=await ack(sb,'campus:join',{world:'campus-hub-v1',avatar:'robot',pose});assert(ja.ok&&jb.ok);uidA=ja.self.id;assert.deepEqual(ja.chat,[]);
 const incoming=once(sb,'campus:chat');const result=await ack(sa,'campus:chat/send',{text:'你好 👋',clientId:'message-0001',nick:'forged',playerId:'forged'});const [message]=await incoming;
 assert(result.ok);assert.equal(message.text,'你好 👋');assert.equal(message.nick,'1');assert.equal(message.playerId,uidA);assert.equal(result.message.id,message.id);assert(!JSON.stringify(message).includes(a.token));assert(!JSON.stringify(message).includes(a.user.id));await delay(80);assert.deepEqual(received,[]);
});
test('retrying an acknowledged client ID never broadcasts or creates a second message',async()=>{
 const messages=[];sb.on('campus:chat',m=>messages.push(m));const result=await ack(sa,'campus:chat/send',{text:'你好 👋',clientId:'message-0001'});assert(result.ok);await delay(80);assert.equal(messages.length,0);
 await delay(850);const history=await ack(sb,'campus:join',{world:'campus-hub-v1',avatar:'robot',pose});assert.equal(history.chat.length,1);
 assert.equal((await ack(sa,'campus:chat/send',{text:'changed',clientId:'message-0001'})).ok,false);
});
test('empty, overlong and malformed content are rejected; fast sends are throttled',async()=>{
 for(const text of ['   ','字'.repeat(141),{html:'script'}])assert.equal((await ack(sa,'campus:chat/send',{text,clientId:'invalid-0001'})).ok,false);
 assert.equal((await ack(sa,'campus:chat/send',{text:'another message',clientId:'message-0002'})).ok,true);assert.equal((await ack(sa,'campus:chat/send',{text:'too fast',clientId:'message-fast'})).ok,false);
 await delay(850);const r=await ack(sa,'campus:chat/send',{text:'<img src=x onerror=alert(1)>',clientId:'message-0003'});assert(r.ok);assert.equal(r.message.text,'<img src=x onerror=alert(1)>');
});
test('moderation is rechecked after joining, and chat does not write learning or posts',async()=>{
 const store=require('../lib/store'),beforeData=JSON.stringify(store.get('userData')),beforePosts=JSON.stringify(store.get('community','main').posts);
 const users=store.get('users');users[a.user.id].mutedUntil=Date.now()+60000;store.set('users',users);
 assert.match((await ack(sa,'campus:chat/send',{text:'muted',clientId:'message-0004'})).error,/禁言/);
 users[a.user.id].mutedUntil=0;users[a.user.id].banned=true;store.set('users',users);
 assert.equal((await ack(sa,'campus:chat/send',{text:'banned',clientId:'message-0005'})).ok,false);
 assert.equal(JSON.stringify(store.get('userData')),beforeData);assert.equal(JSON.stringify(store.get('community','main').posts),beforePosts);
});
test('leaving the campus immediately revokes chat permission',async()=>{sb.emit('campus:leave');await delay(50);assert.equal((await ack(sb,'campus:chat/send',{text:'after leaving',clientId:'message-0006'})).ok,false);});
