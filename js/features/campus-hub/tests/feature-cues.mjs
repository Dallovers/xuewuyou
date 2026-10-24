import assert from 'node:assert/strict';
import {describeFeatureCue as cue} from '../src/feature-cues.js';

assert.equal(cue({interior:'classroom',nearest:{id:'academy.seat-1'}}).action,'坐下刷题');
assert.equal(cue({seated:{feature:'courses'}}).action,'开始刷题');
assert.equal(cue({seated:{feature:'courses'}}).step,2);
assert.equal(cue({interior:'classroom',nearest:{id:'academy.door.classroom'}}),null);
assert.equal(cue({interior:'classroom',nearest:{id:'academy.equipment'}}),null);
assert.equal(cue({nearest:{id:'social.desk'}}).action,'打开好友与学习搭子');
assert.equal(cue({nearest:{id:'social.board'}}).action,'打开校园留言板');
assert.equal(cue({nearest:{id:'study.entry'}}).action,'打开在线自习房间');
assert.equal(cue({nearest:{id:'arena'}}).action,'打开竞技挑战');
assert.equal(cue({nearest:{id:'library.catalog'}}).tag,'网站功能');
assert.equal(cue({nearest:{id:'courtyard.water-switch'}}),null);
console.log('Feature cues: classroom, connected website tools and scene-only actions verified.');
