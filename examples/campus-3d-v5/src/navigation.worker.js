import {makeNavigation} from './navigation-core.js';
import {heightAt} from './terrain.js';
self.onmessage=({data})=>{const start=performance.now();try{const path=makeNavigation(data.colliders,heightAt).pathfind(data.start,data.end);self.postMessage({id:data.id,path,ms:performance.now()-start});}catch(e){self.postMessage({id:data.id,path:null,error:e.message});}};
