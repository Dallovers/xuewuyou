// Keep every in-range action available, even when another facility is closer.
export function createInteractionSelection(){
 let items=[],chosen=null;
 const current=()=>items.find(item=>item.id===chosen)||items[0]||null;
 return{
  update(entries){
   items=entries.filter(item=>!item.disabled&&Number.isFinite(item.distance)&&item.distance<=item.radius)
    .sort((a,b)=>a.distance-b.distance);
   if(!items.some(item=>item.id===chosen))chosen=null;
   return current();
  },
  choose(id){if(!items.some(item=>item.id===id))return null;chosen=id;return current();},
  cycle(){if(items.length<2)return current();const index=items.findIndex(item=>item.id===current()?.id);chosen=items[(index+1)%items.length].id;return current();},
  clear(){items=[];chosen=null;},
  get items(){return items;},
  get current(){return current();}
 };
}

export function createInteractionChoices(parent,onActivate){
 const root=document.createElement('section');root.id='interaction-choices';root.hidden=true;root.setAttribute('aria-label','附近可用互动');
 const title=document.createElement('div');title.className='interaction-choices-title';
 const heading=document.createElement('strong');heading.textContent='附近互动';
 const hint=document.createElement('span');hint.textContent='点击使用 · 电脑按 F 切换';title.append(heading,hint);
 const list=document.createElement('div');list.className='interaction-choice-list';list.setAttribute('role','group');list.setAttribute('aria-label','选择要使用的设施');root.append(title,list);parent.append(root);
 const buttons=new Map();let previous='';
 return{
  update(items,selected){
   root.hidden=items.length<2;if(root.hidden){previous='';return;}
   const signature=JSON.stringify([selected?.id,items.map(item=>[item.id,item.label])]);
   if(previous===signature)return;previous=signature;
   const ids=new Set(items.map(item=>item.id));
   for(const [id,button]of buttons)if(!ids.has(id)){button.remove();buttons.delete(id);}
   for(const item of items){
    let button=buttons.get(item.id);
    if(!button){button=document.createElement('button');button.type='button';button.dataset.interaction=item.id;button.onclick=()=>onActivate(item.id);buttons.set(item.id,button);list.append(button);}
    if(button.textContent!==item.label)button.textContent=item.label;
    if(item.id===selected?.id){if(button.getAttribute('aria-current')!=='true')button.setAttribute('aria-current','true');}
    else button.removeAttribute('aria-current');
   }
  }
 };
}
