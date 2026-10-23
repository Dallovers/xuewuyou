export const VERSION='campus-hub-v1';
export const BOUNDS={minX:-49,maxX:56,minZ:-46,maxZ:42};
export const START={x:0,z:30,yaw:0,pitch:0};
export const FOUNTAIN={x:-.6,z:5.5,radius:3.14,waterRadius:2.75,waterY:.285};
// 自习室：门在房间局部 (3.3, 4.5)、法向 +Z。yaw 是由「门的中轴正对中央庭院」解出来的：
// 3.3 − 18.5·sinθ − 26.4·cosθ = 0 → θ = 2.0795 rad = 119.15°，指向喷泉中心的偏差 0.000°。
// 原来是 Math.PI/2（90°，门朝正东），庭院在东南约 29° 外，所以只算「大致朝着」。
export const STUDY_PLACEMENT={x:-27,z:24,yaw:2.0795};
export const SITE_EXIT={id:'site-exit',label:'校园出口',description:'返回网站首页',at:[0,37.2],outside:[0,35.3]};
// Scene names are local route IDs, not replacements for stable business IDs.
export const ENTRIES=[
 {id:'classroom',label:'教学楼',description:'进入现有教室',at:[0,-24],outside:[0,-22],path:'examples/campus-3d-v5/index.html?view=classroom'},
 {id:'library',label:'图书馆',description:'检索馆藏与阅读',at:[-24,1],outside:[-22,1],path:'examples/library-3d/index.html'},
 {id:'study',label:'自习室',description:'进入自习空间',at:[-23.72,18.39],outside:[-21.53,17.17],path:'js/features/study/preview.html'},
 {id:'social',label:'社交广场',description:'好友、留言与休息',at:[9,11],outside:[7,11],path:'js/features/social/preview.html'},
 {id:'arena',label:'竞技场',description:'好友挑战与报名',at:[31,2],outside:[29,2],path:'js/features/arena/index.html'}
];
export const BUILDING_BOXES=[
 {id:'academy-main',minX:-30.2,maxX:30.2,minZ:-42.3,maxZ:-25.8},
 {id:'academy-west',minX:-30.3,maxX:-23.7,minZ:-26,maxZ:-15.7},
 {id:'academy-east',minX:23.7,maxX:30.3,minZ:-26,maxZ:-15.7},
 {id:'library',minX:-43.3,maxX:-24.8,minZ:-11.3,maxZ:13.3},
 {id:'study',minX:-34.18,maxX:-19.82,minZ:16.24,maxZ:31.76}
];
export function groundAt(x,z){
 const local=z+30;
 if(local<4.05&&local>-12.2&&Math.abs(x)<23.9)return .6;
 if(Math.abs(x)<=10&&local>=4&&local<=10.59)return Math.max(0,Math.min(.6,(10.59-local)/1.8*.6));
 if(x>=9.25&&x<=11.15&&local>=3.9&&local<=10.25)return .6;
 if(x>=11.15&&x<=21.95&&local>=8.4&&local<=10.25)return .03+.57*(21.95-x)/10.8;
 return 0;
}
