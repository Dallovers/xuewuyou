const cues={
 classroom:{title:'坐下后，就能开始刷题',detail:'走近课桌按 E 坐下，再按 E 选学科。',tag:'网站正式题库',steps:['走近课桌','E 坐下','E 刷题'],step:0},
 chair:{title:'在这个座位开始学习',detail:'坐下后可进入高数、线代、概率正式题库。',tag:'网站正式题库',steps:['走近课桌','E 坐下','E 刷题'],step:1,action:'坐下刷题'},
 seated:{title:'已入座 · 按 E 开始刷题',detail:'答题、解析、错题本沿用网站记录。Esc 起身。',tag:'网站正式题库',steps:['已到课桌','已入座','E 刷题'],step:2,action:'开始刷题'},
 courses:{title:'正式题库与学习笔记',detail:'选择高数、线代或概率，直接打开网站刷题功能。',tag:'网站功能',action:'选择学科开始刷题'},
 bank:{title:'打开网站正式题库',detail:'在校园内继续答题、查看解析和错题。',tag:'网站功能',action:'打开正式题库'},
 library:{title:'查阅资料与阅读',detail:'使用网站馆藏检索、阅读器、书签和摘记。',tag:'网站功能'},
 study:{title:'进入在线自习房间',detail:'打开网站自习室，选择房间和学习同伴。',tag:'网站功能',action:'打开在线自习房间'},
 friends:{title:'好友与学习搭子',detail:'打开网站好友功能，查找同学、发起学习邀请。',tag:'网站功能',action:'打开好友与学习搭子'},
 posts:{title:'校园留言板',detail:'打开网站留言功能，查看动态、发布与回复。',tag:'网站功能',action:'打开校园留言板'},
 arena:{title:'好友竞技挑战',detail:'打开网站挑战功能；完成报名和作答后可到擂台就位。',tag:'网站功能',action:'打开竞技挑战'},
 wenku:{title:'打开网站学习资料',detail:'在庭院里直接查阅原网站的学习资料。',tag:'网站功能',action:'查看学习资料'},
 reading:{title:'已入座 · 继续阅读',detail:'使用下方“查阅资料”“阅读计时”或“书签摘记”。',tag:'网站阅读功能'},
 studySeat:{title:'已入座 · 开始自习',detail:'点击下方“在线自习房间”连接网站，Esc 起身。',tag:'网站自习功能'}
};

export function describeFeatureCue({interior,nearest,seated}){
 if(seated?.feature==='courses')return cues.seated;
 if(seated?.feature==='reading')return cues.reading;
 if(seated?.feature==='study')return cues.studySeat;
 const id=nearest?.id||'';
 if(id.startsWith('academy.seat-'))return cues.chair;
 if(id==='academy.courses')return cues.courses;
 if(id==='academy.practice')return cues.bank;
 if(id==='social.desk')return cues.friends;
 if(id==='social.board')return cues.posts;
 if(id==='arena'||id==='arena.ring')return cues.arena;
 if(id==='study.entry')return cues.study;
 if(id==='courtyard.reading-book')return cues.wenku;
 if(id.startsWith('library.')&&!id.startsWith('library.seat.')&&id!=='library.door')return cues.library;
 if(interior==='classroom'&&!seated&&!id.startsWith('academy.door.')&&id!=='academy.equipment')return cues.classroom;
 return null;
}

export function createFeatureCue(parent){
 const card=document.createElement('aside');card.id='feature-cue';card.hidden=true;card.setAttribute('aria-label','当前位置的网站功能');
 const tag=document.createElement('span');tag.className='feature-tag';
 const title=document.createElement('strong'),detail=document.createElement('p'),steps=document.createElement('ol');
 card.append(tag,title,detail,steps);parent.prepend(card);let previous;
 return{
  update(cue){
   if(previous===cue)return;previous=cue;card.hidden=!cue;if(!cue)return;
   tag.textContent=cue.tag;title.textContent=cue.title;detail.textContent=cue.detail;
   steps.replaceChildren();steps.hidden=!cue.steps;
   cue.steps?.forEach((text,index)=>{const item=document.createElement('li');item.textContent=text;if(index===cue.step)item.setAttribute('aria-current','step');steps.append(item);});
  }
 };
}
