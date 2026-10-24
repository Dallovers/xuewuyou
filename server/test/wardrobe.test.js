'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const wardrobe=require('../campus/wardrobe'),{questions}=require('../integrations/questions');
const {correctChoice}=require('../campus/quiz-grader');
const rows=new Map(),store={get:(table,key,fallback)=>structuredClone(rows.get(key)||fallback),set:(table,key,value)=>rows.set(key,structuredClone(value))};
const bank=[...questions.values()].filter(q=>!q.selfAssessed);
test('wallets are isolated and paid skin cannot be equipped before purchase',()=>{assert.equal(wardrobe.wallet(store,'a').balance,0);assert(wardrobe.owns(store,'a','anime'));assert(!wardrobe.owns(store,'a','kaykit-knight'));assert.throws(()=>wardrobe.redeem(store,'a','kaykit-knight'),/不足/);assert.equal(wardrobe.wallet(store,'b').balance,0);});
test('wrong answers earn nothing; correct question pays once per Shanghai day',()=>{
 const q=bank[0],wrong=q.answer==='A'?'B':'A';assert.equal(wardrobe.reward(store,'a',q.id,wrong).gained,0);assert.equal(wardrobe.reward(store,'a',q.id,q.answer).gained,10);assert.equal(wardrobe.reward(store,'a',q.id,q.answer).gained,0);assert.throws(()=>wardrobe.reward(store,'a','forged','A'));assert.throws(()=>wardrobe.reward(store,'a',q.id,{correct:true}));
});
test('daily cap and authoritative price; repeat redemption never double charges',()=>{
 for(const q of bank.slice(0,25))wardrobe.reward(store,'a',q.id,q.answer);
 assert.equal(wardrobe.wallet(store,'a').balance,200);wardrobe.redeem(store,'a','kaykit-knight');assert.equal(wardrobe.wallet(store,'a').balance,120);assert(wardrobe.owns(store,'a','kaykit-knight'));wardrobe.redeem(store,'a','kaykit-knight');assert.equal(wardrobe.wallet(store,'a').balance,120);assert(!wardrobe.owns(store,'b','kaykit-knight'));assert.throws(()=>wardrobe.redeem(store,'a','__proto__'));
});
test('a new day resets reward dedupe without losing balance or ownership',()=>{
 const q=bank[0],before=wardrobe.wallet(store,'a');assert.equal(wardrobe.reward(store,'a',q.id,q.answer,new Date('2026-11-01T00:00:00Z')).gained,10);assert.equal(wardrobe.wallet(store,'a').balance,before.balance+10);assert(wardrobe.owns(store,'a','kaykit-knight'));
});
test('embedded choices use the same checked-in parser as the real question UI',()=>{
 const embedded={question:'下面哪个值正确？\nA. 1\nB. 2\nC. 3\nD. 4',options:[],answer:'',analysis:'因此选 B。'};
 assert.equal(correctChoice(embedded),'B');assert.equal(correctChoice({...embedded,analysis:'比较不同方法后自行判断。'}),null);assert.equal(correctChoice({question:'证明函数连续',options:[],answer:'',analysis:'证明略'}),null);
 for(const q of questions.values()){const answer=correctChoice(q);if(!q.selfAssessed)assert.equal(answer,q.answer);}
});
