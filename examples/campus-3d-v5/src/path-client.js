import {colliders} from './architecture.js';
const pending=new Map();let worker,id=0;
export function requestPath(start,end){
 if(!worker){worker=new Worker(new URL('navigation.worker.js',document.baseURI),{type:'module'});worker.onmessage=({data})=>{const task=pending.get(data.id);if(task){clearTimeout(task.timer);pending.delete(data.id);task.resolve(data.path);}};worker.onerror=()=>{for(const task of pending.values()){clearTimeout(task.timer);task.resolve(null);}pending.clear();worker.terminate();worker=null;};}
 return new Promise(resolve=>{const request=++id,timer=setTimeout(()=>{pending.delete(request);resolve(null);},8000);pending.set(request,{resolve,timer});worker.postMessage({id:request,start:{x:start.x,z:start.z},end,colliders:colliders.map(c=>({...c}))});});
}
