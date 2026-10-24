import {lessons} from './course-lessons.js';
export function renderRoomTools(root,name,{equipment,openFeature,notify}){
 root.replaceChildren();
 const el=(tag,text,parent=root)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;parent.append(e);return e;};
 const button=(text,fn,parent=root)=>{const b=el('button',text,parent);b.type='button';b.onclick=fn;return b;};
 if(name==='equipment'){
  el('h2','教室灯光、卷帘与投影');el('p','选择设备状态，关闭面板后观察同一间教室的变化。');
  el('h3','场景预设').className='tool-section-title';const presets=el('div');presets.className='tool-grid';
  for(const [label,values] of [['日光自习',{blinds:0,lights:0,projector:0}],['课堂讲授',{blinds:0,lights:1,projector:0}],['投影演示',{blinds:1,lights:.18,projector:1}]])button(label,()=>{equipment.target(values);notify('已设置：'+label);},presets);
  el('h3','单独控制').className='tool-section-title';const switches=el('div');switches.className='tool-grid';
  for(const [key,label] of [['lights','灯光'],['blinds','卷帘'],['projector','投影']])button('切换'+label,()=>{equipment.target({[key]:equipment.state[key+'Target']?0:1});notify(label+'已切换');},switches);return;
 }
 let records;try{records=JSON.parse(localStorage.getItem('xuewuyou-academy-v2'));}catch{}if(!records||!Array.isArray(records.answers))records={answers:[],notes:'',visits:[]};
 const save=()=>{try{localStorage.setItem('xuewuyou-academy-v2',JSON.stringify(records));return true;}catch{notify('保存失败，内容仍保留在面板中。');return false;}};
 function notes(){root.replaceChildren();el('h2','学习笔记 · 本机记录');const input=el('textarea');input.value=records.notes||'';input.setAttribute('aria-label','学习笔记');const actions=el('div');actions.className='tool-actions';button('保存笔记',()=>{records.notes=input.value;if(save())notify('笔记已保存');},actions);button('返回课程',courses,actions);}
 function quiz(lesson,index=0,score=0){root.replaceChildren();const q=lesson.questions[index];el('h2',lesson.name+' · 示范练习 '+(index+1));el('p',q.q);const choices=el('div');choices.className='tool-options';let selected=null;const buttons=q.choices.map((text,i)=>button(String.fromCharCode(65+i)+' '+text,()=>{selected=i;buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));submit.disabled=false;},choices));const actions=el('div');actions.className='tool-actions';const submit=button('提交答案',()=>{buttons.forEach(b=>b.disabled=true);submit.disabled=true;const correct=selected===q.answer;records.answers.push({course:lesson.id,index,correct,time:new Date().toISOString()});save();el('p',(correct?'回答正确。':'回答错误。')+q.explain);button(index+1<lesson.questions.length?'下一题':'查看结果',()=>{if(index+1<lesson.questions.length)quiz(lesson,index+1,score+Number(correct));else{root.replaceChildren();el('h2','本次练习完成');el('p','答对 '+(score+Number(correct))+' / '+lesson.questions.length+' 题');button('写学习笔记',notes);button('返回课程',courses);}});},actions);submit.disabled=true;}
 function warmups(){root.replaceChildren();el('h2','课堂热身 · 示范练习');const list=el('div');list.className='tool-grid';for(const lesson of lessons)button(lesson.name,()=>quiz(lesson),list);button('返回正式刷题',courses);}
 function courses(){root.replaceChildren();el('h2','教室刷题');el('p','选择学科进入正式题库。作答、解析、错题本和学习记录沿用网站原有功能。');const list=el('div');list.className='tool-grid';for(const [label,moduleId] of [['高等数学','b3'],['线性代数','l3'],['概率论','p3']])button(label,()=>openFeature('bank',{moduleId}),list);const actions=el('div');actions.className='tool-actions';button('学习笔记',notes,actions);button('打开真实题库',()=>openFeature('bank'),actions);button('课堂热身',warmups,actions);}
 courses();
}
