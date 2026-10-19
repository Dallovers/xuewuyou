import {colliders} from './architecture.js';
import {heightAt} from './terrain.js';
import {makeNavigation} from './navigation-core.js';
export {bounds} from './navigation-core.js';
let navigation,count=-1;
function current(){if(count!==colliders.length){navigation=makeNavigation(colliders,heightAt);count=colliders.length;}return navigation;}
export const blocked=(...args)=>current().blocked(...args);
export const move=(...args)=>current().move(...args);
export const pathfind=(...args)=>current().pathfind(...args);
