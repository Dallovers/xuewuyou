export const DESIGN={width:60,depth:26,floor:.6,storey:3.8,levels:4,front:4,back:-12,wingFront:14,roofEave:16.05,roofRidge:17.35,ramp:{highX:11.15,lowX:21.95,minZ:8.4,maxZ:10.25,top:.6,bottom:.03}};
export function heightAt(x,z){
 if(z<=4.05&&z>=-12.2&&Math.abs(x)<30.1||Math.abs(x)>23.8&&Math.abs(x)<30.1&&z<=14.2&&z>=4)return .6;
 if(x>=9.25&&x<=11.15&&z>=3.9&&z<=10.25)return .6;
 if(Math.abs(x)<=10&&z>=4&&z<=10.59)return Math.max(0,Math.min(.6,(10.59-z)/1.8*.6));
 const r=DESIGN.ramp;if(x>=r.highX&&x<=r.lowX&&z>=r.minZ&&z<=r.maxZ)return r.bottom+(r.top-r.bottom)*(r.lowX-x)/(r.lowX-r.highX);
 return 0;
}
