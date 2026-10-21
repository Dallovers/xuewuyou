import * as T from 'three';

// UI-only helpers live outside the exportable/baked building. No furniture is changed.
export function createInteractionGuide({scene,camera,building,targets,getState,activate,report}){
 const layer=document.getElementById('interaction-markers'),toggle=document.getElementById('hint-toggle');
 const dialog=document.getElementById('explore-dialog'),list=document.getElementById('explore-list');
 const destination=document.getElementById('destination'),destinationText=document.getElementById('destination-text');
 const projected=new T.Vector3(),direction=new T.Vector3(),ray=new T.Raycaster();
 const ring=new T.Mesh(new T.RingGeometry(.38,.43,48),new T.MeshBasicMaterial({color:0xd9ad54,transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false,toneMapped:false}));
 ring.name='Interaction location hint';ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);
 const entries=new Map();let shown=true,selected=null,lastUpdate=-Infinity,disposed=false,visible=[],cachedRects=[];
 const icon={door:'门',shelf:'书',seat:'座',book:'读',desk:'询'};
 for(const target of targets){
  const button=document.createElement('button');button.className='world-marker';button.dataset.target=target.id;button.hidden=true;
  const badge=document.createElement('span');badge.className='marker-icon';badge.textContent=icon[target.kind];badge.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.className='marker-label';
  button.append(badge,label);button.onclick=()=>choose(target);layer.append(button);entries.set(target.id,{button,label,target});
  const item=document.createElement('button');item.className='explore-item';item.dataset.destination=target.id;
  const name=document.createElement('strong'),detail=document.createElement('span');name.textContent=target.label;detail.textContent=target.description;
  item.append(name,detail);item.onclick=()=>{dialog.close();select(target);report('已标记 '+target.label+'。'+(getState().seated?'先站起，再跟随方向走近。':'进入漫游后，跟随方向提示走近。'));};list.append(item);
 }
 function select(target){selected=target;destination.hidden=false;updateDestination();}
 function choose(target){const state=getState();if(state.modal||!state.ready)return;
  if(state.mode==='walk'&&!reachable(target,state)){select(target);report('已标记 '+target.label+'，走近后按 E 或点击标记。');return;}
  activate(target);
 }
 function reachable(t,state){if(t.kind==='book'&&state.seated)return t.id==='book-'+state.seated.id.split('-')[0];return Math.hypot(state.pos.x-t.approach.x,state.pos.z-t.approach.z)<t.range;}
 function updateDestination(){if(!selected)return;const state=getState();
  const outside=state.pos.z>9.5&&selected.kind!=='door',point=outside?{x:0,z:11}:selected.approach;
  const distance=Math.hypot(state.pos.x-point.x,state.pos.z-point.z);
  const bearing=Math.atan2(-(point.x-state.pos.x),-(point.z-state.pos.z))-state.yaw;
  document.getElementById('destination-arrow').style.transform=`rotate(${-bearing}rad)`;
  destinationText.textContent=state.mode==='inspect'?selected.label+' · 进入漫游后跟随方向':outside?'先从入口玻璃门进入':reachable(selected,state)?selected.label+' · 已到达，可按 E 互动':selected.label+' · '+distance.toFixed(1)+' 米';
 }
 // Only architectural meshes occlude labels. Skip thousands of instanced leaves and clear glass.
 const blockers=[];building.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const name=o.userData.sourceMaterial||o.material?.name||'';
  if(/Cream limestone|Honed grey stone|Grey brick|Mineral plaster/.test(name))blockers.push(o);
 });
 function isVisible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
 function occluded(point){direction.copy(point).sub(camera.position);const length=direction.length();ray.set(camera.position,direction.normalize());ray.far=Math.max(0,length-.12);
  return ray.intersectObjects(blockers.filter(isVisible),false).length>0;
 }
 function overlaps(a,b,pad=7){return a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;}
 function refreshRects(){cachedRects=[...document.querySelectorAll('.topbar,.guide,.bottom,#touch,#focus-panel,#destination,#interact,#toast')].filter(e=>!e.hidden).map(e=>e.getBoundingClientRect());}
 function hide(){for(const {button} of entries.values())button.hidden=true;visible=[];ring.visible=false;}
 function update(now=performance.now(),force=false){if(disposed)return;const state=getState();
  if(!state.ready||state.modal||document.hidden){hide();destination.hidden=true;return;}
  destination.hidden=!selected||!!state.seated;updateDestination();
  if(!shown){hide();return;}if(!force&&now-lastUpdate<120)return;lastUpdate=now;refreshRects();hide();
  const candidates=[];camera.updateMatrixWorld();
  for(const entry of entries.values()){
   const t=entry.target;if(state.seated&&(t.kind!=='book'||!reachable(t,state)))continue;
   const dist=camera.position.distanceTo(t.anchor);if(dist>(t.kind==='door'?55:31))continue;
   projected.copy(t.anchor).project(camera);if(projected.z< -1||projected.z>1||Math.abs(projected.x)>1||Math.abs(projected.y)>1)continue;
   const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;
   const compact=innerWidth<640,label=compact?t.short:t.label,width=compact?142:190,height=48;
   const rect={left:x-width/2,right:x+width/2,top:y-height,bottom:y};
   if(rect.left<10||rect.right>innerWidth-10||rect.top<8||rect.bottom>innerHeight-12||cachedRects.some(r=>overlaps(rect,r)))continue;
   candidates.push({entry,rect,x,y,label,dist,priority:(selected===t?-100:0)+(state.nearest?.targetId===t.id?-80:0)+(t.kind==='seat'?4:0)+dist});
  }
  candidates.sort((a,b)=>a.priority-b.priority);const accepted=[];
  for(const c of candidates){if(accepted.length>=(innerWidth<640?3:6)||accepted.some(r=>overlaps(c.rect,r,10))||occluded(c.entry.target.anchor))continue;
   const {button,label,target}=c.entry,near=state.mode==='walk'&&reachable(target,state);
   label.textContent=c.label;button.dataset.near=String(near);button.dataset.selected=String(selected===target);button.title=state.mode==='inspect'?target.action:near?target.action:'标记方向，走近互动';
   button.setAttribute('aria-label',target.label+'，'+button.title);button.style.transform=`translate(${Math.round(c.x)}px,${Math.round(c.y)}px) translate(-50%,-100%)`;
   button.hidden=false;accepted.push(c.rect);visible.push(target.id);
  }
  const focus=targets.find(t=>t.id===state.nearest?.targetId);
  if(focus&&state.mode==='walk'&&!state.seated){ring.position.set(focus.anchor.x,focus.kind==='book'?.823:.022,focus.anchor.z);ring.scale.setScalar(focus.kind==='book'?.45:focus.kind==='door'?1.5:1);ring.visible=true;}
 }
 toggle.onclick=()=>{shown=!shown;toggle.setAttribute('aria-pressed',String(shown));toggle.textContent=shown?'互动标记：开':'互动标记：关';update(performance.now(),true);};
 document.getElementById('destination-clear').onclick=()=>{selected=null;destination.hidden=true;};
 return {update,select,clear(){selected=null;destination.hidden=true;},isReachable:reachable,
  get selectedId(){return selected?.id||null;},snapshot:()=>({shown,disposed,selected:selected?.id||null,visible:[...visible],targets:targets.length}),
  dispose(){if(disposed)return;disposed=true;hide();destination.hidden=true;toggle.onclick=null;document.getElementById('destination-clear').onclick=null;ring.removeFromParent();ring.geometry.dispose();ring.material.dispose();layer.replaceChildren();list.replaceChildren();}};
}
