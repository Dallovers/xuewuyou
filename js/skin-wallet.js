/* Learning currency is graded and credited by the server, never from local scores. */
(function(){
 'use strict';
 window.WG_SkinWallet={answer:function(qid,answer){
  var token=localStorage.getItem('xwy_token')||'';if(!token||token.indexOf('local.')===0)return;
  var base=String(window.WG_DEPLOY&&window.WG_DEPLOY.apiBase||'').replace(/\/$/,'');
  fetch(base+'/api/skins/answer',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({qid:String(qid),answer:answer}),signal:AbortSignal.timeout(10000)})
   .then(function(r){if(!r.ok)return null;return r.json();}).then(function(data){
    if(!data||!data.gained)return;
    var reward=document.createElement('span');reward.className='bank-coin-reward';reward.textContent='答对奖励 +'+data.gained+' 学习币 · 余额 '+data.wallet.balance;
    reward.setAttribute('role','status');document.getElementById('bankFeedback')?.append(reward);
   }).catch(function(){/* A reward outage must not interrupt solving or alter the score. */});
 }};
})();
