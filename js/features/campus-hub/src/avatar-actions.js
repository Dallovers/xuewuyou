// Simulation time only: modal pauses and hidden tabs cannot finish an action.
// Horizontal movement/collision stays with the campus navigation system.
export function createAvatarActions(durations,timings={}){
 let current=null,elapsed=0,height=0,launchGround=0,landed=false;
 const cancel=()=>{current=null;elapsed=0;height=0;landed=false;};
 return{
  get current(){return current;},get height(){return height;},
  get busy(){return current!==null;},get locksMovement(){return current!==null&&current!=='jump';},
  start(name,ground=0){
   if(current||!['jump','wave','punch'].includes(name)||!(durations[name]>0))return false;
   current=name;elapsed=0;height=0;launchGround=ground;landed=false;return true;
  },
  update(dt,ground=0){
   if(!current||!(dt>0)||!Number.isFinite(dt))return;
   elapsed+=dt;const duration=durations[current];
   if(elapsed>=duration){cancel();return;}
   if(current!=='jump')return;
   const takeoff=timings.jump?.takeoff??duration*.12,flight=timings.jump?.flight??duration*.72,apex=timings.jump?.height??.6;
   if(elapsed<=takeoff){launchGround=ground;return;}
   const u=Math.min(1,(elapsed-takeoff)/flight);
   const footY=launchGround+4*apex*u*(1-u);
   if(u>=.5&&footY<=ground)landed=true;
   height=landed?0:Math.max(0,footY-ground);
  },
  cancel,
  snapshot(){return{current,elapsed,height,airborne:height>1e-5,phase:current==='jump'?(height>1e-5?'airborne':elapsed<(timings.jump?.takeoff??durations.jump*.12)?'takeoff':'landing'):current?'gesture':'grounded'};}
 };
}
