/** Local preview adapter, never imported by the public host. No RAF or camera controller. */
export function createPreviewActivities({player,ui,onStand}) {
  const bar=document.createElement('div');bar.className='social-activity';bar.hidden=true;
  const text=document.createElement('span');text.setAttribute('role','status');
  const button=document.createElement('button');button.type='button';button.textContent='起身 · E / Esc';
  bar.append(text,button);ui.append(bar);
  let saved=null,target=null,elapsed=0,toastTime=0,disposed=false;
  function stand() {
    if(!saved||disposed)return false;
    Object.assign(player,saved);saved=null;target=null;bar.hidden=true;onStand();return true;
  }
  button.addEventListener('click',stand);
  return {
    get seated(){return saved!==null;},
    sit(result) {
      if(saved||disposed||result.kind!=='seat')return null;
      saved={x:player.x,y:player.y,z:player.z};target=result.position;elapsed=0;
      const approach=[player.x-target[0],player.z-target[2]];
      const direction=result.directions.reduce((a,b)=>a[0]*approach[0]+a[2]*approach[1]>=b[0]*approach[0]+b[2]*approach[1]?a:b);
      text.textContent=result.label+' · 已坐下，可以拖动查看周围';button.hidden=false;bar.hidden=false;
      return Math.atan2(-direction[0],-direction[2]);
    },
    stand,
    notify(message){if(disposed||saved)return;text.textContent=message;button.hidden=true;bar.hidden=false;toastTime=3;},
    update(dt) {
      if(disposed)return;
      if(saved){elapsed=Math.min(1,elapsed+dt/.32);const t=elapsed*elapsed*(3-2*elapsed);player.x=saved.x+(target[0]-saved.x)*t;player.y=saved.y+(target[1]-saved.y)*t;player.z=saved.z+(target[2]-saved.z)*t;}
      else if(toastTime>0){toastTime-=dt;if(toastTime<=0)bar.hidden=true;}
    },
    dispose(){if(disposed)return;disposed=true;saved=null;target=null;button.removeEventListener('click',stand);bar.remove();},
  };
}
