'use strict';
const catalog=require('./skin-catalog.json');
const {questions}=require('../integrations/questions');
const {correctChoice}=require('./quiz-grader');
const skins=new Map(catalog.skins.map(s=>[s.id,s]));
const starters=catalog.skins.filter(s=>s.starter).map(s=>s.id);
function wallet(store,uid){return store.get('wardrobe',uid,{balance:0,owned:[...starters],equipped:'anime',earned:0,spent:0,day:'',rewarded:[]});}
function owns(store,uid,id){return skins.has(id)&&(starters.includes(id)||wallet(store,uid).owned.includes(id));}
function redeem(store,uid,id){
 const skin=skins.get(id);if(!skin)throw Error('不存在的皮肤');
 const w=wallet(store,uid);if(owns(store,uid,id))return w;
 if(w.balance<skin.price)throw Error('学习币不足，先去完成题库练习吧');
 w.balance-=skin.price;w.spent+=skin.price;w.owned.push(id);store.set('wardrobe',uid,w);return w;
}
function reward(store,uid,qid,answer,now=new Date()){
 const q=questions.get(String(qid)),correct=correctChoice(q);
 if(!correct||typeof answer!=='string'||! /^[A-D]$/.test(answer))throw Error('此题暂不支持学习币奖励');
 const w=wallet(store,uid),day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(now);
 if(w.day!==day){w.day=day;w.rewarded=[];}
 let gained=0;
 if(correct===answer&&!w.rewarded.includes(q.id)&&w.rewarded.length*catalog.rewardPerQuestion<catalog.dailyRewardLimit){
  gained=catalog.rewardPerQuestion;w.rewarded.push(q.id);w.balance+=gained;w.earned+=gained;
 }
 store.set('wardrobe',uid,w);return {wallet:w,gained};
}
function register({route,authUser,sendJson,readBody,store}){
 const endpoint=(method,path,handler)=>route(method,'/api/skins/'+path,async(req,res)=>{
  const user=authUser(req);if(!user)return sendJson(res,401,{ok:false,error:'请先登录云端账号'});
  let body={};if(method==='POST')try{body=JSON.parse(await readBody(req,.004)||'{}');if(!body||typeof body!=='object'||Array.isArray(body))throw Error();}catch{return sendJson(res,400,{ok:false,error:'请求格式错误'});}
  try{sendJson(res,200,{ok:true,...handler(user.id,body)});}catch(e){sendJson(res,400,{ok:false,error:e.message});}
 });
 endpoint('GET','wallet',uid=>({wallet:wallet(store,uid)}));
 endpoint('POST','purchase',(uid,b)=>({wallet:redeem(store,uid,b.id)}));
 endpoint('POST','equip',(uid,b)=>{if(!owns(store,uid,b.id))throw Error('请先兑换这件皮肤');const w=wallet(store,uid);w.equipped=b.id;store.set('wardrobe',uid,w);return {wallet:w};});
 endpoint('POST','answer',(uid,b)=>reward(store,uid,b.qid,b.answer));
}
module.exports={register,wallet,owns,redeem,reward,skins};
