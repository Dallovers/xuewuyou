'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
// Reuse the repository's pure option/answer parser. Only this checked-in source
// is executable; submitted answers and bank text are data, never code.
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../../js/qenhance.js'),'utf8'),context,{timeout:2000});
function correctChoice(question){
 if(!question)return null;
 const options=question.options?.length?question.options:context.WG_QE.parseOpts(question.question)?.opts;
 if(!options||options.length<2||options.length>4)return null;
 const answer=question.answer||context.WG_QE.parseAns(question.analysis);
 return typeof answer==='string'&&/^[A-D]$/.test(answer)&&answer.charCodeAt(0)-65<options.length?answer:null;
}
module.exports={correctChoice};
