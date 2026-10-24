var Fs={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Bs={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Xm=0,Ff=1,Ym=2;var cp=1,jh=2,Li=3,Bn=0,yn=1,Nt=2,nn=0,fr=1,Bf=2,kf=3,zf=4,Jh=5,pi=100,qm=101,Zm=102,Km=103,jm=104,_l=200,Jm=201,Qm=202,$m=203,Lc=204,Dc=205,Qh=206,eg=207,$h=208,tg=209,ng=210,ig=211,sg=212,rg=213,og=214,Nc=0,Uc=1,Oc=2,gr=3,Fc=4,Bc=5,kc=6,zc=7,hp=0,ag=1,lg=2,rs=0,eu=1,tu=2,nu=3,Io=4,cg=5,iu=6,su=7,Hf="attached",hg="detached",up=300,xr=301,vr=302,ho=303,Hc=304,Ml=306,Wt=1e3,Pn=1001,Ls=1002,Ut=1003,Po=1004;var is=1005;var wt=1006,Ps=1007;var fn=1008;var Oi=1009,fp=1010,dp=1011,uo=1012,ru=1013,Ds=1014,Gt=1015,Bt=1016,ou=1017,au=1018,os=1020,pp=35902,mp=1021,gp=1022,cn=1023,xp=1024,vp=1025,dr=1026,as=1027,ks=1028,lu=1029,yp=1030,cu=1031;var hu=1033,Oa=33776,Fa=33777,Ba=33778,ka=33779,Vc=35840,Gc=35841,Wc=35842,Xc=35843,Yc=36196,qc=37492,Zc=37496,Kc=37808,jc=37809,Jc=37810,Qc=37811,$c=37812,eh=37813,th=37814,nh=37815,ih=37816,sh=37817,rh=37818,oh=37819,ah=37820,lh=37821,za=36492,ch=36494,hh=36495,_p=36283,uh=36284,fh=36285,dh=36286;var ls=2300,cs=2301,Jl=2302,Vf=2400,Gf=2401,Wf=2402,ug=2500;var Mp=0,Sl=1,Lo=2,fg=3200,dg=3201;var uu=0,pg=1,On="",pt="srgb",kt="srgb-linear",bl="linear",Mt="srgb";var Ks=7680;var Xf=519,mg=512,gg=513,xg=514,Sp=515,vg=516,yg=517,_g=518,Mg=519,ph=35044;var Yf="300 es",Ni=2e3,Ha=2001,Fi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let s=this._listeners[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},an=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],qf=1234567,so=Math.PI/180,yr=180/Math.PI;function Fn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(an[i&255]+an[i>>8&255]+an[i>>16&255]+an[i>>24&255]+"-"+an[e&255]+an[e>>8&255]+"-"+an[e>>16&15|64]+an[e>>24&255]+"-"+an[t&63|128]+an[t>>8&255]+"-"+an[t>>16&255]+an[t>>24&255]+an[n&255]+an[n>>8&255]+an[n>>16&255]+an[n>>24&255]).toLowerCase()}function Vt(i,e,t){return Math.max(e,Math.min(t,i))}function fu(i,e){return(i%e+e)%e}function Sg(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function bg(i,e,t){return i!==e?(t-i)/(e-i):0}function ro(i,e,t){return(1-t)*i+t*e}function wg(i,e,t,n){return ro(i,e,1-Math.exp(-t*n))}function Tg(i,e=1){return e-Math.abs(fu(i,e*2)-e)}function Ag(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Eg(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Rg(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Cg(i,e){return i+Math.random()*(e-i)}function Ig(i){return i*(.5-Math.random())}function Pg(i){i!==void 0&&(qf=i);let e=qf+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Lg(i){return i*so}function Dg(i){return i*yr}function Ng(i){return(i&i-1)===0&&i!==0}function Ug(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Og(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Fg(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),d=o((e-n)/2),p=r((n-e)/2),x=o((n-e)/2);switch(s){case"XYX":i.set(a*h,l*u,l*d,a*c);break;case"YZY":i.set(l*d,a*h,l*u,a*c);break;case"ZXZ":i.set(l*u,l*d,a*h,a*c);break;case"XZX":i.set(a*h,l*x,l*p,a*c);break;case"YXY":i.set(l*p,a*h,l*x,a*c);break;case"ZYZ":i.set(l*x,l*p,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ii(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function bt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Sn={DEG2RAD:so,RAD2DEG:yr,generateUUID:Fn,clamp:Vt,euclideanModulo:fu,mapLinear:Sg,inverseLerp:bg,lerp:ro,damp:wg,pingpong:Tg,smoothstep:Ag,smootherstep:Eg,randInt:Rg,randFloat:Cg,randFloatSpread:Ig,seededRandom:Pg,degToRad:Lg,radToDeg:Dg,isPowerOfTwo:Ng,ceilPowerOfTwo:Ug,floorPowerOfTwo:Og,setQuaternionFromProperEuler:Fg,normalize:bt,denormalize:ii},pe=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Vt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},st=class i{constructor(e,t,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],x=n[8],v=s[0],g=s[3],m=s[6],w=s[1],S=s[4],_=s[7],D=s[2],I=s[5],A=s[8];return r[0]=o*v+a*w+l*D,r[3]=o*g+a*S+l*I,r[6]=o*m+a*_+l*A,r[1]=c*v+h*w+u*D,r[4]=c*g+h*S+u*I,r[7]=c*m+h*_+u*A,r[2]=d*v+p*w+x*D,r[5]=d*g+p*S+x*I,r[8]=d*m+p*_+x*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*r,p=c*r-o*l,x=t*u+n*d+s*p;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/x;return e[0]=u*v,e[1]=(s*c-h*n)*v,e[2]=(a*n-s*o)*v,e[3]=d*v,e[4]=(h*t-s*l)*v,e[5]=(s*r-a*t)*v,e[6]=p*v,e[7]=(n*l-c*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Ql.makeScale(e,t)),this}rotate(e){return this.premultiply(Ql.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ql.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ql=new st;function bp(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function fo(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Bg(){let i=fo("canvas");return i.style.display="block",i}var Zf={};function no(i){i in Zf||(Zf[i]=!0,console.warn(i))}function kg(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function zg(i){let e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Hg(i){let e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var ct={enabled:!0,workingColorSpace:kt,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Mt&&(i.r=Ui(i.r),i.g=Ui(i.g),i.b=Ui(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Mt&&(i.r=pr(i.r),i.g=pr(i.g),i.b=pr(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===On?bl:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Ui(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function pr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Kf=[.64,.33,.3,.6,.15,.06],jf=[.2126,.7152,.0722],Jf=[.3127,.329],Qf=new st().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),$f=new st().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);ct.define({[kt]:{primaries:Kf,whitePoint:Jf,transfer:bl,toXYZ:Qf,fromXYZ:$f,luminanceCoefficients:jf,workingColorSpaceConfig:{unpackColorSpace:pt},outputColorSpaceConfig:{drawingBufferColorSpace:pt}},[pt]:{primaries:Kf,whitePoint:Jf,transfer:Mt,toXYZ:Qf,fromXYZ:$f,luminanceCoefficients:jf,outputColorSpaceConfig:{drawingBufferColorSpace:pt}}});var js,mh=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{js===void 0&&(js=fo("canvas")),js.width=e.width,js.height=e.height;let n=js.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=js}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=fo("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Ui(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ui(t[n]/255)*255):t[n]=Ui(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Vg=0,_r=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Vg++}),this.uuid=Fn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push($l(s[o].image)):r.push($l(s[o]))}else r=$l(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function $l(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?mh.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Gg=0,Ht=class i extends Fi{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Pn,s=Pn,r=wt,o=fn,a=cn,l=Oi,c=i.DEFAULT_ANISOTROPY,h=On){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Gg++}),this.uuid=Fn(),this.name="",this.source=new _r(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new pe(0,0),this.repeat=new pe(1,1),this.center=new pe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new st,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==up)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Wt:e.x=e.x-Math.floor(e.x);break;case Pn:e.x=e.x<0?0:1;break;case Ls:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Wt:e.y=e.y-Math.floor(e.y);break;case Pn:e.y=e.y<0?0:1;break;case Ls:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ht.DEFAULT_IMAGE=null;Ht.DEFAULT_MAPPING=up;Ht.DEFAULT_ANISOTROPY=1;var yt=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],x=l[9],v=l[2],g=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(x-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(x+g)<.1&&Math.abs(c+p+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let S=(c+1)/2,_=(p+1)/2,D=(m+1)/2,I=(h+d)/4,A=(u+v)/4,T=(x+g)/4;return S>_&&S>D?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=I/n,r=A/n):_>D?_<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(_),n=I/s,r=T/s):D<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(D),n=A/r,s=T/r),this.set(n,s,r,t),this}let w=Math.sqrt((g-x)*(g-x)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(w)<.001&&(w=1),this.x=(g-x)/w,this.y=(u-v)/w,this.z=(d-h)/w,this.w=Math.acos((c+p+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},gh=class extends Fi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new yt(0,0,e,t),this.scissorTest=!1,this.viewport=new yt(0,0,e,t);let s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:wt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let r=new Ht(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new _r(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},sn=class extends gh{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Va=class extends Ht{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=Pn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var xh=class extends Ht{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=Pn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var $t=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],d=r[o+0],p=r[o+1],x=r[o+2],v=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=d,e[t+1]=p,e[t+2]=x,e[t+3]=v;return}if(u!==v||l!==d||c!==p||h!==x){let g=1-a,m=l*d+c*p+h*x+u*v,w=m>=0?1:-1,S=1-m*m;if(S>Number.EPSILON){let D=Math.sqrt(S),I=Math.atan2(D,m*w);g=Math.sin(g*I)/D,a=Math.sin(a*I)/D}let _=a*w;if(l=l*g+d*_,c=c*g+p*_,h=h*g+x*_,u=u*g+v*_,g===1-a){let D=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=D,c*=D,h*=D,u*=D}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],d=r[o+1],p=r[o+2],x=r[o+3];return e[t]=a*x+h*u+l*p-c*d,e[t+1]=l*x+h*d+c*u-a*p,e[t+2]=c*x+h*p+a*d-l*u,e[t+3]=h*x-a*u-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),d=l(n/2),p=l(s/2),x=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*p*x,this._y=c*p*u-d*h*x,this._z=c*h*x+d*p*u,this._w=c*h*u-d*p*x;break;case"YXZ":this._x=d*h*u+c*p*x,this._y=c*p*u-d*h*x,this._z=c*h*x-d*p*u,this._w=c*h*u+d*p*x;break;case"ZXY":this._x=d*h*u-c*p*x,this._y=c*p*u+d*h*x,this._z=c*h*x+d*p*u,this._w=c*h*u-d*p*x;break;case"ZYX":this._x=d*h*u-c*p*x,this._y=c*p*u+d*h*x,this._z=c*h*x-d*p*u,this._w=c*h*u+d*p*x;break;case"YZX":this._x=d*h*u+c*p*x,this._y=c*p*u+d*h*x,this._z=c*h*x-d*p*u,this._w=c*h*u-d*p*x;break;case"XZY":this._x=d*h*u-c*p*x,this._y=c*p*u-d*h*x,this._z=c*h*x+d*p*u,this._w=c*h*u+d*p*x;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>u){let p=2*Math.sqrt(1+n-a-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>u){let p=2*Math.sqrt(1+a-n-u);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Vt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=s*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},B=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ed.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ed.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ec.copy(this).projectOnVector(e),this.sub(ec)}reflect(e){return this.sub(ec.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Vt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ec=new B,ed=new $t,kn=class{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint($n.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint($n.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=$n.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,$n):$n.fromBufferAttribute(r,o),$n.applyMatrix4(e.matrixWorld),this.expandByPoint($n);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),oa.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),oa.copy(n.boundingBox)),oa.applyMatrix4(e.matrixWorld),this.union(oa)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,$n),$n.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Zr),aa.subVectors(this.max,Zr),Js.subVectors(e.a,Zr),Qs.subVectors(e.b,Zr),$s.subVectors(e.c,Zr),Ji.subVectors(Qs,Js),Qi.subVectors($s,Qs),Ss.subVectors(Js,$s);let t=[0,-Ji.z,Ji.y,0,-Qi.z,Qi.y,0,-Ss.z,Ss.y,Ji.z,0,-Ji.x,Qi.z,0,-Qi.x,Ss.z,0,-Ss.x,-Ji.y,Ji.x,0,-Qi.y,Qi.x,0,-Ss.y,Ss.x,0];return!tc(t,Js,Qs,$s,aa)||(t=[1,0,0,0,1,0,0,0,1],!tc(t,Js,Qs,$s,aa))?!1:(la.crossVectors(Ji,Qi),t=[la.x,la.y,la.z],tc(t,Js,Qs,$s,aa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,$n).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize($n).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ai[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ai[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ai[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ai[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ai[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ai[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ai[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ai[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ai),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Ai=[new B,new B,new B,new B,new B,new B,new B,new B],$n=new B,oa=new kn,Js=new B,Qs=new B,$s=new B,Ji=new B,Qi=new B,Ss=new B,Zr=new B,aa=new B,la=new B,bs=new B;function tc(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){bs.fromArray(i,r);let a=s.x*Math.abs(bs.x)+s.y*Math.abs(bs.y)+s.z*Math.abs(bs.z),l=e.dot(bs),c=t.dot(bs),h=n.dot(bs);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Wg=new kn,Kr=new B,nc=new B,Ln=class{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Wg.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Kr.subVectors(e,this.center);let t=Kr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Kr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(nc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Kr.copy(e.center).add(nc)),this.expandByPoint(Kr.copy(e.center).sub(nc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Ei=new B,ic=new B,ca=new B,$i=new B,sc=new B,ha=new B,rc=new B,Bi=class{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ei)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ei.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ei.copy(this.origin).addScaledVector(this.direction,t),Ei.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){ic.copy(e).add(t).multiplyScalar(.5),ca.copy(t).sub(e).normalize(),$i.copy(this.origin).sub(ic);let r=e.distanceTo(t)*.5,o=-this.direction.dot(ca),a=$i.dot(this.direction),l=-$i.dot(ca),c=$i.lengthSq(),h=Math.abs(1-o*o),u,d,p,x;if(h>0)if(u=o*l-a,d=o*a-l,x=r*h,u>=0)if(d>=-x)if(d<=x){let v=1/h;u*=v,d*=v,p=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;else d<=-x?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c):d<=x?(u=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(ic).addScaledVector(ca,d),p}intersectSphere(e,t){Ei.subVectors(e.center,this.origin);let n=Ei.dot(this.direction),s=Ei.dot(Ei)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Ei)!==null}intersectTriangle(e,t,n,s,r){sc.subVectors(t,e),ha.subVectors(n,e),rc.crossVectors(sc,ha);let o=this.direction.dot(rc),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;$i.subVectors(this.origin,e);let l=a*this.direction.dot(ha.crossVectors($i,ha));if(l<0)return null;let c=a*this.direction.dot(sc.cross($i));if(c<0||l+c>o)return null;let h=-a*$i.dot(rc);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},je=class i{constructor(e,t,n,s,r,o,a,l,c,h,u,d,p,x,v,g){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,h,u,d,p,x,v,g)}set(e,t,n,s,r,o,a,l,c,h,u,d,p,x,v,g){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=p,m[7]=x,m[11]=v,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/er.setFromMatrixColumn(e,0).length(),r=1/er.setFromMatrixColumn(e,1).length(),o=1/er.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=o*h,p=o*u,x=a*h,v=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+x*c,t[5]=d-v*c,t[9]=-a*l,t[2]=v-d*c,t[6]=x+p*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*h,p=l*u,x=c*h,v=c*u;t[0]=d+v*a,t[4]=x*a-p,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=p*a-x,t[6]=v+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*h,p=l*u,x=c*h,v=c*u;t[0]=d-v*a,t[4]=-o*u,t[8]=x+p*a,t[1]=p+x*a,t[5]=o*h,t[9]=v-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*h,p=o*u,x=a*h,v=a*u;t[0]=l*h,t[4]=x*c-p,t[8]=d*c+v,t[1]=l*u,t[5]=v*c+d,t[9]=p*c-x,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,p=o*c,x=a*l,v=a*c;t[0]=l*h,t[4]=v-d*u,t[8]=x*u+p,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=p*u+x,t[10]=d-v*u}else if(e.order==="XZY"){let d=o*l,p=o*c,x=a*l,v=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+v,t[5]=o*h,t[9]=p*u-x,t[2]=x*u-p,t[6]=a*h,t[10]=v*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Xg,e,Yg)}lookAt(e,t,n){let s=this.elements;return Cn.subVectors(e,t),Cn.lengthSq()===0&&(Cn.z=1),Cn.normalize(),es.crossVectors(n,Cn),es.lengthSq()===0&&(Math.abs(n.z)===1?Cn.x+=1e-4:Cn.z+=1e-4,Cn.normalize(),es.crossVectors(n,Cn)),es.normalize(),ua.crossVectors(Cn,es),s[0]=es.x,s[4]=ua.x,s[8]=Cn.x,s[1]=es.y,s[5]=ua.y,s[9]=Cn.y,s[2]=es.z,s[6]=ua.z,s[10]=Cn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],x=n[2],v=n[6],g=n[10],m=n[14],w=n[3],S=n[7],_=n[11],D=n[15],I=s[0],A=s[4],T=s[8],b=s[12],y=s[1],E=s[5],F=s[9],U=s[13],k=s[2],G=s[6],V=s[10],$=s[14],X=s[3],j=s[7],P=s[11],W=s[15];return r[0]=o*I+a*y+l*k+c*X,r[4]=o*A+a*E+l*G+c*j,r[8]=o*T+a*F+l*V+c*P,r[12]=o*b+a*U+l*$+c*W,r[1]=h*I+u*y+d*k+p*X,r[5]=h*A+u*E+d*G+p*j,r[9]=h*T+u*F+d*V+p*P,r[13]=h*b+u*U+d*$+p*W,r[2]=x*I+v*y+g*k+m*X,r[6]=x*A+v*E+g*G+m*j,r[10]=x*T+v*F+g*V+m*P,r[14]=x*b+v*U+g*$+m*W,r[3]=w*I+S*y+_*k+D*X,r[7]=w*A+S*E+_*G+D*j,r[11]=w*T+S*F+_*V+D*P,r[15]=w*b+S*U+_*$+D*W,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],p=e[14],x=e[3],v=e[7],g=e[11],m=e[15];return x*(+r*l*u-s*c*u-r*a*d+n*c*d+s*a*p-n*l*p)+v*(+t*l*p-t*c*d+r*o*d-s*o*p+s*c*h-r*l*h)+g*(+t*c*u-t*a*p-r*o*u+n*o*p+r*a*h-n*c*h)+m*(-s*a*h-t*l*u+t*a*d+s*o*u-n*o*d+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],p=e[11],x=e[12],v=e[13],g=e[14],m=e[15],w=u*g*c-v*d*c+v*l*p-a*g*p-u*l*m+a*d*m,S=x*d*c-h*g*c-x*l*p+o*g*p+h*l*m-o*d*m,_=h*v*c-x*u*c+x*a*p-o*v*p-h*a*m+o*u*m,D=x*u*l-h*v*l-x*a*d+o*v*d+h*a*g-o*u*g,I=t*w+n*S+s*_+r*D;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/I;return e[0]=w*A,e[1]=(v*d*r-u*g*r-v*s*p+n*g*p+u*s*m-n*d*m)*A,e[2]=(a*g*r-v*l*r+v*s*c-n*g*c-a*s*m+n*l*m)*A,e[3]=(u*l*r-a*d*r-u*s*c+n*d*c+a*s*p-n*l*p)*A,e[4]=S*A,e[5]=(h*g*r-x*d*r+x*s*p-t*g*p-h*s*m+t*d*m)*A,e[6]=(x*l*r-o*g*r-x*s*c+t*g*c+o*s*m-t*l*m)*A,e[7]=(o*d*r-h*l*r+h*s*c-t*d*c-o*s*p+t*l*p)*A,e[8]=_*A,e[9]=(x*u*r-h*v*r-x*n*p+t*v*p+h*n*m-t*u*m)*A,e[10]=(o*v*r-x*a*r+x*n*c-t*v*c-o*n*m+t*a*m)*A,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*p-t*a*p)*A,e[12]=D*A,e[13]=(h*v*s-x*u*s+x*n*d-t*v*d-h*n*g+t*u*g)*A,e[14]=(x*a*s-o*v*s-x*n*l+t*v*l+o*n*g-t*a*g)*A,e[15]=(o*u*s-h*a*s+h*n*l-t*u*l-o*n*d+t*a*d)*A,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,d=r*c,p=r*h,x=r*u,v=o*h,g=o*u,m=a*u,w=l*c,S=l*h,_=l*u,D=n.x,I=n.y,A=n.z;return s[0]=(1-(v+m))*D,s[1]=(p+_)*D,s[2]=(x-S)*D,s[3]=0,s[4]=(p-_)*I,s[5]=(1-(d+m))*I,s[6]=(g+w)*I,s[7]=0,s[8]=(x+S)*A,s[9]=(g-w)*A,s[10]=(1-(d+v))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=er.set(s[0],s[1],s[2]).length(),o=er.set(s[4],s[5],s[6]).length(),a=er.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],ei.copy(this);let c=1/r,h=1/o,u=1/a;return ei.elements[0]*=c,ei.elements[1]*=c,ei.elements[2]*=c,ei.elements[4]*=h,ei.elements[5]*=h,ei.elements[6]*=h,ei.elements[8]*=u,ei.elements[9]*=u,ei.elements[10]*=u,t.setFromRotationMatrix(ei),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=Ni){let l=this.elements,c=2*r/(t-e),h=2*r/(n-s),u=(t+e)/(t-e),d=(n+s)/(n-s),p,x;if(a===Ni)p=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===Ha)p=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=Ni){let l=this.elements,c=1/(t-e),h=1/(n-s),u=1/(o-r),d=(t+e)*c,p=(n+s)*h,x,v;if(a===Ni)x=(o+r)*u,v=-2*u;else if(a===Ha)x=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=v,l[14]=-x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},er=new B,ei=new je,Xg=new B(0,0,0),Yg=new B(1,1,1),es=new B,ua=new B,Cn=new B,td=new je,nd=new $t,mi=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(Vt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Vt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Vt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Vt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Vt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Vt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return td.makeRotationFromQuaternion(e),this.setFromRotationMatrix(td,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return nd.setFromEuler(this),this.setFromQuaternion(nd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};mi.DEFAULT_ORDER="XYZ";var po=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},qg=0,id=new B,tr=new $t,Ri=new je,fa=new B,jr=new B,Zg=new B,Kg=new $t,sd=new B(1,0,0),rd=new B(0,1,0),od=new B(0,0,1),ad={type:"added"},jg={type:"removed"},nr={type:"childadded",child:null},oc={type:"childremoved",child:null},At=class i extends Fi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:qg++}),this.uuid=Fn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new B,t=new mi,n=new $t,s=new B(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new je},normalMatrix:{value:new st}}),this.matrix=new je,this.matrixWorld=new je,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new po,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return tr.setFromAxisAngle(e,t),this.quaternion.multiply(tr),this}rotateOnWorldAxis(e,t){return tr.setFromAxisAngle(e,t),this.quaternion.premultiply(tr),this}rotateX(e){return this.rotateOnAxis(sd,e)}rotateY(e){return this.rotateOnAxis(rd,e)}rotateZ(e){return this.rotateOnAxis(od,e)}translateOnAxis(e,t){return id.copy(e).applyQuaternion(this.quaternion),this.position.add(id.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(sd,e)}translateY(e){return this.translateOnAxis(rd,e)}translateZ(e){return this.translateOnAxis(od,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ri.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?fa.copy(e):fa.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),jr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ri.lookAt(jr,fa,this.up):Ri.lookAt(fa,jr,this.up),this.quaternion.setFromRotationMatrix(Ri),s&&(Ri.extractRotation(s.matrixWorld),tr.setFromRotationMatrix(Ri),this.quaternion.premultiply(tr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ad),nr.child=e,this.dispatchEvent(nr),nr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(jg),oc.child=e,this.dispatchEvent(oc),oc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ri.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ri.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ri),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ad),nr.child=e,this.dispatchEvent(nr),nr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(jr,e,Zg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(jr,Kg,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),p=o(e.animations),x=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),x.length>0&&(n.nodes=x)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};At.DEFAULT_UP=new B(0,1,0);At.DEFAULT_MATRIX_AUTO_UPDATE=!0;At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ti=new B,Ci=new B,ac=new B,Ii=new B,ir=new B,sr=new B,ld=new B,lc=new B,cc=new B,hc=new B,uc=new yt,fc=new yt,dc=new yt,Cs=class i{constructor(e=new B,t=new B,n=new B){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),ti.subVectors(e,t),s.cross(ti);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){ti.subVectors(s,t),Ci.subVectors(n,t),ac.subVectors(e,t);let o=ti.dot(ti),a=ti.dot(Ci),l=ti.dot(ac),c=Ci.dot(Ci),h=Ci.dot(ac),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,p=(c*l-a*h)*d,x=(o*h-a*l)*d;return r.set(1-p-x,x,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ii)===null?!1:Ii.x>=0&&Ii.y>=0&&Ii.x+Ii.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,Ii)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ii.x),l.addScaledVector(o,Ii.y),l.addScaledVector(a,Ii.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return uc.setScalar(0),fc.setScalar(0),dc.setScalar(0),uc.fromBufferAttribute(e,t),fc.fromBufferAttribute(e,n),dc.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(uc,r.x),o.addScaledVector(fc,r.y),o.addScaledVector(dc,r.z),o}static isFrontFacing(e,t,n,s){return ti.subVectors(n,t),Ci.subVectors(e,t),ti.cross(Ci).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ti.subVectors(this.c,this.b),Ci.subVectors(this.a,this.b),ti.cross(Ci).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;ir.subVectors(s,n),sr.subVectors(r,n),lc.subVectors(e,n);let l=ir.dot(lc),c=sr.dot(lc);if(l<=0&&c<=0)return t.copy(n);cc.subVectors(e,s);let h=ir.dot(cc),u=sr.dot(cc);if(h>=0&&u<=h)return t.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(ir,o);hc.subVectors(e,r);let p=ir.dot(hc),x=sr.dot(hc);if(x>=0&&p<=x)return t.copy(r);let v=p*c-l*x;if(v<=0&&c>=0&&x<=0)return a=c/(c-x),t.copy(n).addScaledVector(sr,a);let g=h*x-p*u;if(g<=0&&u-h>=0&&p-x>=0)return ld.subVectors(r,s),a=(u-h)/(u-h+(p-x)),t.copy(s).addScaledVector(ld,a);let m=1/(g+v+d);return o=v*m,a=d*m,t.copy(n).addScaledVector(ir,o).addScaledVector(sr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},wp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ts={h:0,s:0,l:0},da={h:0,s:0,l:0};function pc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var We=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=pt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=ct.workingColorSpace){return this.r=e,this.g=t,this.b=n,ct.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=ct.workingColorSpace){if(e=fu(e,1),t=Vt(t,0,1),n=Vt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=pc(o,r,e+1/3),this.g=pc(o,r,e),this.b=pc(o,r,e-1/3)}return ct.toWorkingColorSpace(this,s),this}setStyle(e,t=pt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=pt){let n=wp[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ui(e.r),this.g=Ui(e.g),this.b=Ui(e.b),this}copyLinearToSRGB(e){return this.r=pr(e.r),this.g=pr(e.g),this.b=pr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=pt){return ct.fromWorkingColorSpace(ln.copy(this),e),Math.round(Vt(ln.r*255,0,255))*65536+Math.round(Vt(ln.g*255,0,255))*256+Math.round(Vt(ln.b*255,0,255))}getHexString(e=pt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.fromWorkingColorSpace(ln.copy(this),t);let n=ln.r,s=ln.g,r=ln.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=ct.workingColorSpace){return ct.fromWorkingColorSpace(ln.copy(this),t),e.r=ln.r,e.g=ln.g,e.b=ln.b,e}getStyle(e=pt){ct.fromWorkingColorSpace(ln.copy(this),e);let t=ln.r,n=ln.g,s=ln.b;return e!==pt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ts),this.setHSL(ts.h+e,ts.s+t,ts.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ts),e.getHSL(da);let n=ro(ts.h,da.h,t),s=ro(ts.s,da.s,t),r=ro(ts.l,da.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},ln=new We;We.NAMES=wp;var Jg=0,_n=class extends Fi{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Jg++}),this.uuid=Fn(),this.name="",this.blending=fr,this.side=Bn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Lc,this.blendDst=Dc,this.blendEquation=pi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new We(0,0,0),this.blendAlpha=0,this.depthFunc=gr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Xf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ks,this.stencilZFail=Ks,this.stencilZPass=Ks,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==fr&&(n.blending=this.blending),this.side!==Bn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Lc&&(n.blendSrc=this.blendSrc),this.blendDst!==Dc&&(n.blendDst=this.blendDst),this.blendEquation!==pi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==gr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Xf&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ks&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ks&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ks&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},zn=class extends _n{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new We(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new mi,this.combine=hp,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Di=Qg();function Qg(){let i=new ArrayBuffer(4),e=new Float32Array(i),t=new Uint32Array(i),n=new Uint32Array(512),s=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(n[l]=0,n[l|256]=32768,s[l]=24,s[l|256]=24):c<-14?(n[l]=1024>>-c-14,n[l|256]=1024>>-c-14|32768,s[l]=-c-1,s[l|256]=-c-1):c<=15?(n[l]=c+15<<10,n[l|256]=c+15<<10|32768,s[l]=13,s[l|256]=13):c<128?(n[l]=31744,n[l|256]=64512,s[l]=24,s[l|256]=24):(n[l]=31744,n[l|256]=64512,s[l]=13,s[l|256]=13)}let r=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;(c&8388608)===0;)c<<=1,h-=8388608;c&=-8388609,h+=947912704,r[l]=c|h}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:s,mantissaTable:r,exponentTable:o,offsetTable:a}}function $g(i){Math.abs(i)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),i=Vt(i,-65504,65504),Di.floatView[0]=i;let e=Di.uint32View[0],t=e>>23&511;return Di.baseTable[t]+((e&8388607)>>Di.shiftTable[t])}function e0(i){let e=i>>10;return Di.uint32View[0]=Di.mantissaTable[Di.offsetTable[e]+(i&1023)]+Di.exponentTable[e],Di.floatView[0]}var ms={toHalfFloat:$g,fromHalfFloat:e0},Xt=new B,pa=new pe,Tt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ph,this.updateRanges=[],this.gpuType=Gt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)pa.fromBufferAttribute(this,t),pa.applyMatrix3(e),this.setXY(t,pa.x,pa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.applyMatrix3(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.applyMatrix4(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.applyNormalMatrix(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.transformDirection(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ii(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=bt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ii(t,this.array)),t}setX(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ii(t,this.array)),t}setY(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ii(t,this.array)),t}setZ(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ii(t,this.array)),t}setW(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),n=bt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),n=bt(n,this.array),s=bt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),n=bt(n,this.array),s=bt(s,this.array),r=bt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ph&&(e.usage=this.usage),e}};var Ga=class extends Tt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Wa=class extends Tt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var rt=class extends Tt{constructor(e,t,n){super(new Float32Array(e),t,n)}},t0=0,Un=new je,mc=new At,rr=new B,In=new kn,Jr=new kn,Qt=new B,Et=class i extends Fi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:t0++}),this.uuid=Fn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(bp(e)?Wa:Ga)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new st().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Un.makeRotationFromQuaternion(e),this.applyMatrix4(Un),this}rotateX(e){return Un.makeRotationX(e),this.applyMatrix4(Un),this}rotateY(e){return Un.makeRotationY(e),this.applyMatrix4(Un),this}rotateZ(e){return Un.makeRotationZ(e),this.applyMatrix4(Un),this}translate(e,t,n){return Un.makeTranslation(e,t,n),this.applyMatrix4(Un),this}scale(e,t,n){return Un.makeScale(e,t,n),this.applyMatrix4(Un),this}lookAt(e){return mc.lookAt(e),mc.updateMatrix(),this.applyMatrix4(mc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(rr).negate(),this.translate(rr.x,rr.y,rr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new rt(n,3))}else{for(let n=0,s=t.count;n<s;n++){let r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new kn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];In.setFromBufferAttribute(r),this.morphTargetsRelative?(Qt.addVectors(this.boundingBox.min,In.min),this.boundingBox.expandByPoint(Qt),Qt.addVectors(this.boundingBox.max,In.max),this.boundingBox.expandByPoint(Qt)):(this.boundingBox.expandByPoint(In.min),this.boundingBox.expandByPoint(In.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ln);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(e){let n=this.boundingSphere.center;if(In.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Jr.setFromBufferAttribute(a),this.morphTargetsRelative?(Qt.addVectors(In.min,Jr.min),In.expandByPoint(Qt),Qt.addVectors(In.max,Jr.max),In.expandByPoint(Qt)):(In.expandByPoint(Jr.min),In.expandByPoint(Jr.max))}In.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Qt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Qt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Qt.fromBufferAttribute(a,c),l&&(rr.fromBufferAttribute(e,c),Qt.add(rr)),s=Math.max(s,n.distanceToSquared(Qt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Tt(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let T=0;T<n.count;T++)a[T]=new B,l[T]=new B;let c=new B,h=new B,u=new B,d=new pe,p=new pe,x=new pe,v=new B,g=new B;function m(T,b,y){c.fromBufferAttribute(n,T),h.fromBufferAttribute(n,b),u.fromBufferAttribute(n,y),d.fromBufferAttribute(r,T),p.fromBufferAttribute(r,b),x.fromBufferAttribute(r,y),h.sub(c),u.sub(c),p.sub(d),x.sub(d);let E=1/(p.x*x.y-x.x*p.y);isFinite(E)&&(v.copy(h).multiplyScalar(x.y).addScaledVector(u,-p.y).multiplyScalar(E),g.copy(u).multiplyScalar(p.x).addScaledVector(h,-x.x).multiplyScalar(E),a[T].add(v),a[b].add(v),a[y].add(v),l[T].add(g),l[b].add(g),l[y].add(g))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let T=0,b=w.length;T<b;++T){let y=w[T],E=y.start,F=y.count;for(let U=E,k=E+F;U<k;U+=3)m(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let S=new B,_=new B,D=new B,I=new B;function A(T){D.fromBufferAttribute(s,T),I.copy(D);let b=a[T];S.copy(b),S.sub(D.multiplyScalar(D.dot(b))).normalize(),_.crossVectors(I,b);let E=_.dot(l[T])<0?-1:1;o.setXYZW(T,S.x,S.y,S.z,E)}for(let T=0,b=w.length;T<b;++T){let y=w[T],E=y.start,F=y.count;for(let U=E,k=E+F;U<k;U+=3)A(e.getX(U+0)),A(e.getX(U+1)),A(e.getX(U+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Tt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);let s=new B,r=new B,o=new B,a=new B,l=new B,c=new B,h=new B,u=new B;if(e)for(let d=0,p=e.count;d<p;d+=3){let x=e.getX(d+0),v=e.getX(d+1),g=e.getX(d+2);s.fromBufferAttribute(t,x),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,g),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,x),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,g),a.add(h),l.add(h),c.add(h),n.setXYZ(x,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Qt.fromBufferAttribute(e,t),Qt.normalize(),e.setXYZ(t,Qt.x,Qt.y,Qt.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),p=0,x=0;for(let v=0,g=l.length;v<g;v++){a.isInterleavedBufferAttribute?p=l[v]*a.data.stride+a.offset:p=l[v]*h;for(let m=0;m<h;m++)d[x++]=c[p++]}return new Tt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],p=e(d,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},cd=new je,ws=new Bi,ma=new Ln,hd=new B,ga=new B,xa=new B,va=new B,gc=new B,ya=new B,ud=new B,_a=new B,mt=class extends At{constructor(e=new Et,t=new zn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){ya.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(gc.fromBufferAttribute(u,e),o?ya.addScaledVector(gc,h):ya.addScaledVector(gc.sub(t),h))}t.add(ya)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ma.copy(n.boundingSphere),ma.applyMatrix4(r),ws.copy(e.ray).recast(e.near),!(ma.containsPoint(ws.origin)===!1&&(ws.intersectSphere(ma,hd)===null||ws.origin.distanceToSquared(hd)>(e.far-e.near)**2))&&(cd.copy(r).invert(),ws.copy(e.ray).applyMatrix4(cd),!(n.boundingBox!==null&&ws.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ws)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let x=0,v=d.length;x<v;x++){let g=d[x],m=o[g.materialIndex],w=Math.max(g.start,p.start),S=Math.min(a.count,Math.min(g.start+g.count,p.start+p.count));for(let _=w,D=S;_<D;_+=3){let I=a.getX(_),A=a.getX(_+1),T=a.getX(_+2);s=Ma(this,m,e,n,c,h,u,I,A,T),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let x=Math.max(0,p.start),v=Math.min(a.count,p.start+p.count);for(let g=x,m=v;g<m;g+=3){let w=a.getX(g),S=a.getX(g+1),_=a.getX(g+2);s=Ma(this,o,e,n,c,h,u,w,S,_),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let x=0,v=d.length;x<v;x++){let g=d[x],m=o[g.materialIndex],w=Math.max(g.start,p.start),S=Math.min(l.count,Math.min(g.start+g.count,p.start+p.count));for(let _=w,D=S;_<D;_+=3){let I=_,A=_+1,T=_+2;s=Ma(this,m,e,n,c,h,u,I,A,T),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let x=Math.max(0,p.start),v=Math.min(l.count,p.start+p.count);for(let g=x,m=v;g<m;g+=3){let w=g,S=g+1,_=g+2;s=Ma(this,o,e,n,c,h,u,w,S,_),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}};function n0(i,e,t,n,s,r,o,a){let l;if(e.side===yn?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Bn,a),l===null)return null;_a.copy(a),_a.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(_a);return c<t.near||c>t.far?null:{distance:c,point:_a.clone(),object:i}}function Ma(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,ga),i.getVertexPosition(l,xa),i.getVertexPosition(c,va);let h=n0(i,e,t,n,ga,xa,va,ud);if(h){let u=new B;Cs.getBarycoord(ud,ga,xa,va,u),s&&(h.uv=Cs.getInterpolatedAttribute(s,a,l,c,u,new pe)),r&&(h.uv1=Cs.getInterpolatedAttribute(r,a,l,c,u,new pe)),o&&(h.normal=Cs.getInterpolatedAttribute(o,a,l,c,u,new B),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new B,materialIndex:0};Cs.getNormal(ga,xa,va,d.normal),h.face=d,h.barycoord=u}return h}var Mn=class i extends Et{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,p=0;x("z","y","x",-1,-1,n,t,e,o,r,0),x("z","y","x",1,-1,n,t,-e,o,r,1),x("x","z","y",1,1,e,n,t,s,o,2),x("x","z","y",1,-1,e,n,-t,s,o,3),x("x","y","z",1,-1,e,t,n,s,r,4),x("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new rt(c,3)),this.setAttribute("normal",new rt(h,3)),this.setAttribute("uv",new rt(u,2));function x(v,g,m,w,S,_,D,I,A,T,b){let y=_/A,E=D/T,F=_/2,U=D/2,k=I/2,G=A+1,V=T+1,$=0,X=0,j=new B;for(let P=0;P<V;P++){let W=P*E-U;for(let ee=0;ee<G;ee++){let le=ee*y-F;j[v]=le*w,j[g]=W*S,j[m]=k,c.push(j.x,j.y,j.z),j[v]=0,j[g]=0,j[m]=I>0?1:-1,h.push(j.x,j.y,j.z),u.push(ee/A),u.push(1-P/T),$+=1}}for(let P=0;P<T;P++)for(let W=0;W<A;W++){let ee=d+W+G*P,le=d+W+G*(P+1),Y=d+(W+1)+G*(P+1),te=d+(W+1)+G*P;l.push(ee,le,te),l.push(le,Y,te),X+=6}a.addGroup(p,X,b),p+=X,d+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Mr(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function un(i){let e={};for(let t=0;t<i.length;t++){let n=Mr(i[t]);for(let s in n)e[s]=n[s]}return e}function i0(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Tp(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ct.workingColorSpace}var bn={clone:Mr,merge:un},s0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,r0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ft=class extends _n{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=s0,this.fragmentShader=r0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Mr(e.uniforms),this.uniformsGroups=i0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Xa=class extends At{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new je,this.projectionMatrix=new je,this.projectionMatrixInverse=new je,this.coordinateSystem=Ni}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},ns=new B,fd=new pe,dd=new pe,Yt=class extends Xa{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=yr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(so*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return yr*2*Math.atan(Math.tan(so*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ns.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ns.x,ns.y).multiplyScalar(-e/ns.z),ns.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ns.x,ns.y).multiplyScalar(-e/ns.z)}getViewSize(e,t){return this.getViewBounds(e,fd,dd),t.subVectors(dd,fd)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(so*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},or=-90,ar=1,vh=class extends At{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Yt(or,ar,e,t);s.layers=this.layers,this.add(s);let r=new Yt(or,ar,e,t);r.layers=this.layers,this.add(r);let o=new Yt(or,ar,e,t);o.layers=this.layers,this.add(o);let a=new Yt(or,ar,e,t);a.layers=this.layers,this.add(a);let l=new Yt(or,ar,e,t);l.layers=this.layers,this.add(l);let c=new Yt(or,ar,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===Ni)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ha)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,d,p),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},Ya=class extends Ht{constructor(e,t,n,s,r,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:xr,super(e,t,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},yh=class extends sn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Ya(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:wt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Mn(5,5,5),r=new Ft({name:"CubemapFromEquirect",uniforms:Mr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:yn,blending:nn});r.uniforms.tEquirect.value=t;let o=new mt(s,r),a=t.minFilter;return t.minFilter===fn&&(t.minFilter=wt),new vh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},xc=new B,o0=new B,a0=new st,ni=class{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=xc.subVectors(n,t).cross(o0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(xc),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||a0.getNormalMatrix(e),s=this.coplanarPoint(xc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ts=new Ln,Sa=new B,mo=class{constructor(e=new ni,t=new ni,n=new ni,s=new ni,r=new ni,o=new ni){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ni){let n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],u=s[6],d=s[7],p=s[8],x=s[9],v=s[10],g=s[11],m=s[12],w=s[13],S=s[14],_=s[15];if(n[0].setComponents(l-r,d-c,g-p,_-m).normalize(),n[1].setComponents(l+r,d+c,g+p,_+m).normalize(),n[2].setComponents(l+o,d+h,g+x,_+w).normalize(),n[3].setComponents(l-o,d-h,g-x,_-w).normalize(),n[4].setComponents(l-a,d-u,g-v,_-S).normalize(),t===Ni)n[5].setComponents(l+a,d+u,g+v,_+S).normalize();else if(t===Ha)n[5].setComponents(a,u,v,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ts.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ts.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ts)}intersectsSprite(e){return Ts.center.set(0,0,0),Ts.radius=.7071067811865476,Ts.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ts)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Sa.x=s.normal.x>0?e.max.x:e.min.x,Sa.y=s.normal.y>0?e.max.y:e.min.y,Sa.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Sa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Ap(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function l0(i){let e=new WeakMap;function t(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,x)=>p.start-x.start);let d=0;for(let p=1;p<u.length;p++){let x=u[d],v=u[p];v.start<=x.start+x.count+1?x.count=Math.max(x.count,v.start+v.count-x.start):(++d,u[d]=v)}u.length=d+1;for(let p=0,x=u.length;p<x;p++){let v=u[p];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var dn=class i extends Et{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=e/a,d=t/l,p=[],x=[],v=[],g=[];for(let m=0;m<h;m++){let w=m*d-o;for(let S=0;S<c;S++){let _=S*u-r;x.push(_,-w,0),v.push(0,0,1),g.push(S/a),g.push(1-m/l)}}for(let m=0;m<l;m++)for(let w=0;w<a;w++){let S=w+c*m,_=w+c*(m+1),D=w+1+c*(m+1),I=w+1+c*m;p.push(S,_,I),p.push(_,D,I)}this.setIndex(p),this.setAttribute("position",new rt(x,3)),this.setAttribute("normal",new rt(v,3)),this.setAttribute("uv",new rt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},c0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,h0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,u0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,f0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,d0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,p0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,m0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,g0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,x0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,v0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,y0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,_0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,M0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,S0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,b0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,w0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,T0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,A0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,E0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,R0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,C0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,I0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,P0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,L0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,D0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,N0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,U0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,O0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,F0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,B0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,k0="gl_FragColor = linearToOutputTexel( gl_FragColor );",z0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,H0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,V0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,G0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,W0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,X0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Y0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,q0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Z0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,K0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,j0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,J0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Q0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,$0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ex=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,tx=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,nx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ix=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,sx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,rx=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ox=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,ax=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lx=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,cx=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,hx=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ux=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,fx=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dx=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,px=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,mx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,gx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,xx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,vx=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,yx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,_x=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Mx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Sx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,bx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wx=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Tx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ax=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Ex=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Rx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Cx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ix=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Px=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Lx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Dx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Nx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ux=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ox=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Fx=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Bx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,kx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,zx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Hx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Vx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Gx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Wx=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Xx=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Yx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,qx=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Zx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Kx=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,jx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Jx=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Qx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,$x=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ev=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tv=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,nv=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,iv=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,sv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,rv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ov=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,av=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,lv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,cv=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,uv=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,dv=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,mv=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,gv=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,xv=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,vv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,yv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_v=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Mv=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Sv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,bv=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wv=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tv=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Av=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Ev=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rv=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Cv=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Iv=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pv=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Lv=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Dv=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Nv=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Uv=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ov=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Fv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Bv=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,kv=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,zv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Hv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,tt={alphahash_fragment:c0,alphahash_pars_fragment:h0,alphamap_fragment:u0,alphamap_pars_fragment:f0,alphatest_fragment:d0,alphatest_pars_fragment:p0,aomap_fragment:m0,aomap_pars_fragment:g0,batching_pars_vertex:x0,batching_vertex:v0,begin_vertex:y0,beginnormal_vertex:_0,bsdfs:M0,iridescence_fragment:S0,bumpmap_pars_fragment:b0,clipping_planes_fragment:w0,clipping_planes_pars_fragment:T0,clipping_planes_pars_vertex:A0,clipping_planes_vertex:E0,color_fragment:R0,color_pars_fragment:C0,color_pars_vertex:I0,color_vertex:P0,common:L0,cube_uv_reflection_fragment:D0,defaultnormal_vertex:N0,displacementmap_pars_vertex:U0,displacementmap_vertex:O0,emissivemap_fragment:F0,emissivemap_pars_fragment:B0,colorspace_fragment:k0,colorspace_pars_fragment:z0,envmap_fragment:H0,envmap_common_pars_fragment:V0,envmap_pars_fragment:G0,envmap_pars_vertex:W0,envmap_physical_pars_fragment:tx,envmap_vertex:X0,fog_vertex:Y0,fog_pars_vertex:q0,fog_fragment:Z0,fog_pars_fragment:K0,gradientmap_pars_fragment:j0,lightmap_pars_fragment:J0,lights_lambert_fragment:Q0,lights_lambert_pars_fragment:$0,lights_pars_begin:ex,lights_toon_fragment:nx,lights_toon_pars_fragment:ix,lights_phong_fragment:sx,lights_phong_pars_fragment:rx,lights_physical_fragment:ox,lights_physical_pars_fragment:ax,lights_fragment_begin:lx,lights_fragment_maps:cx,lights_fragment_end:hx,logdepthbuf_fragment:ux,logdepthbuf_pars_fragment:fx,logdepthbuf_pars_vertex:dx,logdepthbuf_vertex:px,map_fragment:mx,map_pars_fragment:gx,map_particle_fragment:xx,map_particle_pars_fragment:vx,metalnessmap_fragment:yx,metalnessmap_pars_fragment:_x,morphinstance_vertex:Mx,morphcolor_vertex:Sx,morphnormal_vertex:bx,morphtarget_pars_vertex:wx,morphtarget_vertex:Tx,normal_fragment_begin:Ax,normal_fragment_maps:Ex,normal_pars_fragment:Rx,normal_pars_vertex:Cx,normal_vertex:Ix,normalmap_pars_fragment:Px,clearcoat_normal_fragment_begin:Lx,clearcoat_normal_fragment_maps:Dx,clearcoat_pars_fragment:Nx,iridescence_pars_fragment:Ux,opaque_fragment:Ox,packing:Fx,premultiplied_alpha_fragment:Bx,project_vertex:kx,dithering_fragment:zx,dithering_pars_fragment:Hx,roughnessmap_fragment:Vx,roughnessmap_pars_fragment:Gx,shadowmap_pars_fragment:Wx,shadowmap_pars_vertex:Xx,shadowmap_vertex:Yx,shadowmask_pars_fragment:qx,skinbase_vertex:Zx,skinning_pars_vertex:Kx,skinning_vertex:jx,skinnormal_vertex:Jx,specularmap_fragment:Qx,specularmap_pars_fragment:$x,tonemapping_fragment:ev,tonemapping_pars_fragment:tv,transmission_fragment:nv,transmission_pars_fragment:iv,uv_pars_fragment:sv,uv_pars_vertex:rv,uv_vertex:ov,worldpos_vertex:av,background_vert:lv,background_frag:cv,backgroundCube_vert:hv,backgroundCube_frag:uv,cube_vert:fv,cube_frag:dv,depth_vert:pv,depth_frag:mv,distanceRGBA_vert:gv,distanceRGBA_frag:xv,equirect_vert:vv,equirect_frag:yv,linedashed_vert:_v,linedashed_frag:Mv,meshbasic_vert:Sv,meshbasic_frag:bv,meshlambert_vert:wv,meshlambert_frag:Tv,meshmatcap_vert:Av,meshmatcap_frag:Ev,meshnormal_vert:Rv,meshnormal_frag:Cv,meshphong_vert:Iv,meshphong_frag:Pv,meshphysical_vert:Lv,meshphysical_frag:Dv,meshtoon_vert:Nv,meshtoon_frag:Uv,points_vert:Ov,points_frag:Fv,shadow_vert:Bv,shadow_frag:kv,sprite_vert:zv,sprite_frag:Hv},Ue={common:{diffuse:{value:new We(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new st},alphaMap:{value:null},alphaMapTransform:{value:new st},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new st}},envmap:{envMap:{value:null},envMapRotation:{value:new st},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new st}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new st}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new st},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new st},normalScale:{value:new pe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new st},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new st}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new st}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new st}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new We(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new We(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new st},alphaTest:{value:0},uvTransform:{value:new st}},sprite:{diffuse:{value:new We(16777215)},opacity:{value:1},center:{value:new pe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new st},alphaMap:{value:null},alphaMapTransform:{value:new st},alphaTest:{value:0}}},di={basic:{uniforms:un([Ue.common,Ue.specularmap,Ue.envmap,Ue.aomap,Ue.lightmap,Ue.fog]),vertexShader:tt.meshbasic_vert,fragmentShader:tt.meshbasic_frag},lambert:{uniforms:un([Ue.common,Ue.specularmap,Ue.envmap,Ue.aomap,Ue.lightmap,Ue.emissivemap,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.fog,Ue.lights,{emissive:{value:new We(0)}}]),vertexShader:tt.meshlambert_vert,fragmentShader:tt.meshlambert_frag},phong:{uniforms:un([Ue.common,Ue.specularmap,Ue.envmap,Ue.aomap,Ue.lightmap,Ue.emissivemap,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.fog,Ue.lights,{emissive:{value:new We(0)},specular:{value:new We(1118481)},shininess:{value:30}}]),vertexShader:tt.meshphong_vert,fragmentShader:tt.meshphong_frag},standard:{uniforms:un([Ue.common,Ue.envmap,Ue.aomap,Ue.lightmap,Ue.emissivemap,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.roughnessmap,Ue.metalnessmap,Ue.fog,Ue.lights,{emissive:{value:new We(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag},toon:{uniforms:un([Ue.common,Ue.aomap,Ue.lightmap,Ue.emissivemap,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.gradientmap,Ue.fog,Ue.lights,{emissive:{value:new We(0)}}]),vertexShader:tt.meshtoon_vert,fragmentShader:tt.meshtoon_frag},matcap:{uniforms:un([Ue.common,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.fog,{matcap:{value:null}}]),vertexShader:tt.meshmatcap_vert,fragmentShader:tt.meshmatcap_frag},points:{uniforms:un([Ue.points,Ue.fog]),vertexShader:tt.points_vert,fragmentShader:tt.points_frag},dashed:{uniforms:un([Ue.common,Ue.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:tt.linedashed_vert,fragmentShader:tt.linedashed_frag},depth:{uniforms:un([Ue.common,Ue.displacementmap]),vertexShader:tt.depth_vert,fragmentShader:tt.depth_frag},normal:{uniforms:un([Ue.common,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,{opacity:{value:1}}]),vertexShader:tt.meshnormal_vert,fragmentShader:tt.meshnormal_frag},sprite:{uniforms:un([Ue.sprite,Ue.fog]),vertexShader:tt.sprite_vert,fragmentShader:tt.sprite_frag},background:{uniforms:{uvTransform:{value:new st},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:tt.background_vert,fragmentShader:tt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new st}},vertexShader:tt.backgroundCube_vert,fragmentShader:tt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:tt.cube_vert,fragmentShader:tt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:tt.equirect_vert,fragmentShader:tt.equirect_frag},distanceRGBA:{uniforms:un([Ue.common,Ue.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:tt.distanceRGBA_vert,fragmentShader:tt.distanceRGBA_frag},shadow:{uniforms:un([Ue.lights,Ue.fog,{color:{value:new We(0)},opacity:{value:1}}]),vertexShader:tt.shadow_vert,fragmentShader:tt.shadow_frag}};di.physical={uniforms:un([di.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new st},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new st},clearcoatNormalScale:{value:new pe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new st},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new st},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new st},sheen:{value:0},sheenColor:{value:new We(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new st},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new st},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new st},transmissionSamplerSize:{value:new pe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new st},attenuationDistance:{value:0},attenuationColor:{value:new We(0)},specularColor:{value:new We(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new st},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new st},anisotropyVector:{value:new pe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new st}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag};var ba={r:0,b:0,g:0},As=new mi,Vv=new je;function Gv(i,e,t,n,s,r,o){let a=new We(0),l=r===!0?0:1,c,h,u=null,d=0,p=null;function x(w){let S=w.isScene===!0?w.background:null;return S&&S.isTexture&&(S=(w.backgroundBlurriness>0?t:e).get(S)),S}function v(w){let S=!1,_=x(w);_===null?m(a,l):_&&_.isColor&&(m(_,1),S=!0);let D=i.xr.getEnvironmentBlendMode();D==="additive"?n.buffers.color.setClear(0,0,0,1,o):D==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function g(w,S){let _=x(S);_&&(_.isCubeTexture||_.mapping===Ml)?(h===void 0&&(h=new mt(new Mn(1,1,1),new Ft({name:"BackgroundCubeMaterial",uniforms:Mr(di.backgroundCube.uniforms),vertexShader:di.backgroundCube.vertexShader,fragmentShader:di.backgroundCube.fragmentShader,side:yn,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(D,I,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),As.copy(S.backgroundRotation),As.x*=-1,As.y*=-1,As.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(As.y*=-1,As.z*=-1),h.material.uniforms.envMap.value=_,h.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Vv.makeRotationFromEuler(As)),h.material.toneMapped=ct.getTransfer(_.colorSpace)!==Mt,(u!==_||d!==_.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=_,d=_.version,p=i.toneMapping),h.layers.enableAll(),w.unshift(h,h.geometry,h.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new mt(new dn(2,2),new Ft({name:"BackgroundMaterial",uniforms:Mr(di.background.uniforms),vertexShader:di.background.vertexShader,fragmentShader:di.background.fragmentShader,side:Bn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.toneMapped=ct.getTransfer(_.colorSpace)!==Mt,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||d!==_.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=_,d=_.version,p=i.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null))}function m(w,S){w.getRGB(ba,Tp(i)),n.buffers.color.setClear(ba.r,ba.g,ba.b,S,o)}return{getClearColor:function(){return a},setClearColor:function(w,S=1){a.set(w),l=S,m(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(w){l=w,m(a,l)},render:v,addToRenderList:g}}function Wv(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(y,E,F,U,k){let G=!1,V=u(U,F,E);r!==V&&(r=V,c(r.object)),G=p(y,U,F,k),G&&x(y,U,F,k),k!==null&&e.update(k,i.ELEMENT_ARRAY_BUFFER),(G||o)&&(o=!1,_(y,E,F,U),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function h(y){return i.deleteVertexArray(y)}function u(y,E,F){let U=F.wireframe===!0,k=n[y.id];k===void 0&&(k={},n[y.id]=k);let G=k[E.id];G===void 0&&(G={},k[E.id]=G);let V=G[U];return V===void 0&&(V=d(l()),G[U]=V),V}function d(y){let E=[],F=[],U=[];for(let k=0;k<t;k++)E[k]=0,F[k]=0,U[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:E,enabledAttributes:F,attributeDivisors:U,object:y,attributes:{},index:null}}function p(y,E,F,U){let k=r.attributes,G=E.attributes,V=0,$=F.getAttributes();for(let X in $)if($[X].location>=0){let P=k[X],W=G[X];if(W===void 0&&(X==="instanceMatrix"&&y.instanceMatrix&&(W=y.instanceMatrix),X==="instanceColor"&&y.instanceColor&&(W=y.instanceColor)),P===void 0||P.attribute!==W||W&&P.data!==W.data)return!0;V++}return r.attributesNum!==V||r.index!==U}function x(y,E,F,U){let k={},G=E.attributes,V=0,$=F.getAttributes();for(let X in $)if($[X].location>=0){let P=G[X];P===void 0&&(X==="instanceMatrix"&&y.instanceMatrix&&(P=y.instanceMatrix),X==="instanceColor"&&y.instanceColor&&(P=y.instanceColor));let W={};W.attribute=P,P&&P.data&&(W.data=P.data),k[X]=W,V++}r.attributes=k,r.attributesNum=V,r.index=U}function v(){let y=r.newAttributes;for(let E=0,F=y.length;E<F;E++)y[E]=0}function g(y){m(y,0)}function m(y,E){let F=r.newAttributes,U=r.enabledAttributes,k=r.attributeDivisors;F[y]=1,U[y]===0&&(i.enableVertexAttribArray(y),U[y]=1),k[y]!==E&&(i.vertexAttribDivisor(y,E),k[y]=E)}function w(){let y=r.newAttributes,E=r.enabledAttributes;for(let F=0,U=E.length;F<U;F++)E[F]!==y[F]&&(i.disableVertexAttribArray(F),E[F]=0)}function S(y,E,F,U,k,G,V){V===!0?i.vertexAttribIPointer(y,E,F,k,G):i.vertexAttribPointer(y,E,F,U,k,G)}function _(y,E,F,U){v();let k=U.attributes,G=F.getAttributes(),V=E.defaultAttributeValues;for(let $ in G){let X=G[$];if(X.location>=0){let j=k[$];if(j===void 0&&($==="instanceMatrix"&&y.instanceMatrix&&(j=y.instanceMatrix),$==="instanceColor"&&y.instanceColor&&(j=y.instanceColor)),j!==void 0){let P=j.normalized,W=j.itemSize,ee=e.get(j);if(ee===void 0)continue;let le=ee.buffer,Y=ee.type,te=ee.bytesPerElement,ne=Y===i.INT||Y===i.UNSIGNED_INT||j.gpuType===ru;if(j.isInterleavedBufferAttribute){let q=j.data,ve=q.stride,Ee=j.offset;if(q.isInstancedInterleavedBuffer){for(let Le=0;Le<X.locationSize;Le++)m(X.location+Le,q.meshPerAttribute);y.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let Le=0;Le<X.locationSize;Le++)g(X.location+Le);i.bindBuffer(i.ARRAY_BUFFER,le);for(let Le=0;Le<X.locationSize;Le++)S(X.location+Le,W/X.locationSize,Y,P,ve*te,(Ee+W/X.locationSize*Le)*te,ne)}else{if(j.isInstancedBufferAttribute){for(let q=0;q<X.locationSize;q++)m(X.location+q,j.meshPerAttribute);y.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let q=0;q<X.locationSize;q++)g(X.location+q);i.bindBuffer(i.ARRAY_BUFFER,le);for(let q=0;q<X.locationSize;q++)S(X.location+q,W/X.locationSize,Y,P,W*te,W/X.locationSize*q*te,ne)}}else if(V!==void 0){let P=V[$];if(P!==void 0)switch(P.length){case 2:i.vertexAttrib2fv(X.location,P);break;case 3:i.vertexAttrib3fv(X.location,P);break;case 4:i.vertexAttrib4fv(X.location,P);break;default:i.vertexAttrib1fv(X.location,P)}}}}w()}function D(){T();for(let y in n){let E=n[y];for(let F in E){let U=E[F];for(let k in U)h(U[k].object),delete U[k];delete E[F]}delete n[y]}}function I(y){if(n[y.id]===void 0)return;let E=n[y.id];for(let F in E){let U=E[F];for(let k in U)h(U[k].object),delete U[k];delete E[F]}delete n[y.id]}function A(y){for(let E in n){let F=n[E];if(F[y.id]===void 0)continue;let U=F[y.id];for(let k in U)h(U[k].object),delete U[k];delete F[y.id]}}function T(){b(),o=!0,r!==s&&(r=s,c(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:T,resetDefaultState:b,dispose:D,releaseStatesOfGeometry:I,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:g,disableUnusedAttributes:w}}function Xv(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function o(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let x=0;x<u;x++)p+=h[x];t.update(p,n,1)}function l(c,h,u,d){if(u===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let x=0;x<c.length;x++)o(c[x],h[x],d[x]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let x=0;for(let v=0;v<u;v++)x+=h[v]*d[v];t.update(x,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Yv(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==cn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let T=A===Bt&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==Oi&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Gt&&!T)}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),w=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),D=x>0,I=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:p,maxVertexTextures:x,maxTextureSize:v,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:w,maxVaryings:S,maxFragmentUniforms:_,vertexTextures:D,maxSamples:I}}function qv(i){let e=this,t=null,n=0,s=!1,r=!1,o=new ni,a=new st,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let p=u.length!==0||d||n!==0||s;return s=d,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,p){let x=u.clippingPlanes,v=u.clipIntersection,g=u.clipShadows,m=i.get(u);if(!s||x===null||x.length===0||r&&!g)r?h(null):c();else{let w=r?0:n,S=w*4,_=m.clippingState||null;l.value=_,_=h(x,d,S,p);for(let D=0;D!==S;++D)_[D]=t[D];m.clippingState=_,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,p,x){let v=u!==null?u.length:0,g=null;if(v!==0){if(g=l.value,x!==!0||g===null){let m=p+v*4,w=d.matrixWorldInverse;a.getNormalMatrix(w),(g===null||g.length<m)&&(g=new Float32Array(m));for(let S=0,_=p;S!==v;++S,_+=4)o.copy(u[S]).applyMatrix4(w,a),o.normal.toArray(g,_),g[_+3]=o.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,g}}function Zv(i){let e=new WeakMap;function t(o,a){return a===ho?o.mapping=xr:a===Hc&&(o.mapping=vr),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===ho||a===Hc)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new yh(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var hs=class extends Xa{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},hr=4,pd=[.125,.215,.35,.446,.526,.582],Is=20,vc=new hs,md=new We,yc=null,_c=0,Mc=0,Sc=!1,Rs=(1+Math.sqrt(5))/2,lr=1/Rs,gd=[new B(-Rs,lr,0),new B(Rs,lr,0),new B(-lr,0,Rs),new B(lr,0,Rs),new B(0,Rs,-lr),new B(0,Rs,lr),new B(-1,1,-1),new B(1,1,-1),new B(-1,1,1),new B(1,1,1)],Sr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){yc=this._renderer.getRenderTarget(),_c=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),Sc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=yd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=vd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(yc,_c,Mc),this._renderer.xr.enabled=Sc,e.scissorTest=!1,wa(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===xr||e.mapping===vr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),yc=this._renderer.getRenderTarget(),_c=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),Sc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:wt,minFilter:wt,generateMipmaps:!1,type:Bt,format:cn,colorSpace:kt,depthBuffer:!1},s=xd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=xd(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Kv(r)),this._blurMaterial=jv(r,e,t)}return s}_compileMaterial(e){let t=new mt(this._lodPlanes[0],e);this._renderer.compile(t,vc)}_sceneToCubeUV(e,t,n,s){let a=new Yt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(md),h.toneMapping=rs,h.autoClear=!1;let p=new zn({name:"PMREM.Background",side:yn,depthWrite:!1,depthTest:!1}),x=new mt(new Mn,p),v=!1,g=e.background;g?g.isColor&&(p.color.copy(g),e.background=null,v=!0):(p.color.copy(md),v=!0);for(let m=0;m<6;m++){let w=m%3;w===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):w===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));let S=this._cubeSize;wa(s,w*S,m>2?S:0,S,S),h.setRenderTarget(s),v&&h.render(x,a),h.render(e,a)}x.geometry.dispose(),x.material.dispose(),h.toneMapping=d,h.autoClear=u,e.background=g}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===xr||e.mapping===vr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=yd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=vd());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new mt(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;wa(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,vc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=gd[(s-r-1)%gd.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new mt(this._lodPlanes[s],c),d=c.uniforms,p=this._sizeLods[n]-1,x=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Is-1),v=r/x,g=isFinite(r)?1+Math.floor(h*v):Is;g>Is&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Is}`);let m=[],w=0;for(let A=0;A<Is;++A){let T=A/v,b=Math.exp(-T*T/2);m.push(b),A===0?w+=b:A<g&&(w+=2*b)}for(let A=0;A<m.length;A++)m[A]=m[A]/w;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=m,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:S}=this;d.dTheta.value=x,d.mipInt.value=S-n;let _=this._sizeLods[s],D=3*_*(s>S-hr?s-S+hr:0),I=4*(this._cubeSize-_);wa(t,D,I,3*_,2*_),l.setRenderTarget(t),l.render(u,vc)}};function Kv(i){let e=[],t=[],n=[],s=i,r=i-hr+1+pd.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>i-hr?l=pd[o-i+hr-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,x=6,v=3,g=2,m=1,w=new Float32Array(v*x*p),S=new Float32Array(g*x*p),_=new Float32Array(m*x*p);for(let I=0;I<p;I++){let A=I%3*2/3-1,T=I>2?0:-1,b=[A,T,0,A+2/3,T,0,A+2/3,T+1,0,A,T,0,A+2/3,T+1,0,A,T+1,0];w.set(b,v*x*I),S.set(d,g*x*I);let y=[I,I,I,I,I,I];_.set(y,m*x*I)}let D=new Et;D.setAttribute("position",new Tt(w,v)),D.setAttribute("uv",new Tt(S,g)),D.setAttribute("faceIndex",new Tt(_,m)),e.push(D),s>hr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function xd(i,e,t){let n=new sn(i,e,t);return n.texture.mapping=Ml,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function wa(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function jv(i,e,t){let n=new Float32Array(Is),s=new B(0,1,0);return new Ft({name:"SphericalGaussianBlur",defines:{n:Is,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:du(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:nn,depthTest:!1,depthWrite:!1})}function vd(){return new Ft({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:du(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:nn,depthTest:!1,depthWrite:!1})}function yd(){return new Ft({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:du(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:nn,depthTest:!1,depthWrite:!1})}function du(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Jv(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===ho||l===Hc,h=l===xr||l===vr;if(c||h){let u=e.get(a),d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new Sr(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{let p=a.image;return c&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new Sr(i)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Qv(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&no("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function $v(i,e,t,n){let s={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let x in d.attributes)e.remove(d.attributes[x]);for(let x in d.morphAttributes){let v=d.morphAttributes[x];for(let g=0,m=v.length;g<m;g++)e.remove(v[g])}d.removeEventListener("dispose",o),delete s[d.id];let p=r.get(d);p&&(e.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function l(u){let d=u.attributes;for(let x in d)e.update(d[x],i.ARRAY_BUFFER);let p=u.morphAttributes;for(let x in p){let v=p[x];for(let g=0,m=v.length;g<m;g++)e.update(v[g],i.ARRAY_BUFFER)}}function c(u){let d=[],p=u.index,x=u.attributes.position,v=0;if(p!==null){let w=p.array;v=p.version;for(let S=0,_=w.length;S<_;S+=3){let D=w[S+0],I=w[S+1],A=w[S+2];d.push(D,I,I,A,A,D)}}else if(x!==void 0){let w=x.array;v=x.version;for(let S=0,_=w.length/3-1;S<_;S+=3){let D=S+0,I=S+1,A=S+2;d.push(D,I,I,A,A,D)}}else return;let g=new(bp(d)?Wa:Ga)(d,1);g.version=v;let m=r.get(u);m&&e.remove(m),r.set(u,g)}function h(u){let d=r.get(u);if(d){let p=u.index;p!==null&&d.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function ey(i,e,t){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,p){i.drawElements(n,p,r,d*o),t.update(p,n,1)}function c(d,p,x){x!==0&&(i.drawElementsInstanced(n,p,r,d*o,x),t.update(p,n,x))}function h(d,p,x){if(x===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,d,0,x);let g=0;for(let m=0;m<x;m++)g+=p[m];t.update(g,n,1)}function u(d,p,x,v){if(x===0)return;let g=e.get("WEBGL_multi_draw");if(g===null)for(let m=0;m<d.length;m++)c(d[m]/o,p[m],v[m]);else{g.multiDrawElementsInstancedWEBGL(n,p,0,r,d,0,v,0,x);let m=0;for(let w=0;w<x;w++)m+=p[w]*v[w];t.update(m,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function ty(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function ny(i,e,t){let n=new WeakMap,s=new yt;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==u){let b=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",b)};d!==void 0&&d.texture.dispose();let p=a.morphAttributes.position!==void 0,x=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],w=a.morphAttributes.color||[],S=0;p===!0&&(S=1),x===!0&&(S=2),v===!0&&(S=3);let _=a.attributes.position.count*S,D=1;_>e.maxTextureSize&&(D=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);let I=new Float32Array(_*D*4*u),A=new Va(I,_,D,u);A.type=Gt,A.needsUpdate=!0;let T=S*4;for(let y=0;y<u;y++){let E=g[y],F=m[y],U=w[y],k=_*D*4*y;for(let G=0;G<E.count;G++){let V=G*T;p===!0&&(s.fromBufferAttribute(E,G),I[k+V+0]=s.x,I[k+V+1]=s.y,I[k+V+2]=s.z,I[k+V+3]=0),x===!0&&(s.fromBufferAttribute(F,G),I[k+V+4]=s.x,I[k+V+5]=s.y,I[k+V+6]=s.z,I[k+V+7]=0),v===!0&&(s.fromBufferAttribute(U,G),I[k+V+8]=s.x,I[k+V+9]=s.y,I[k+V+10]=s.z,I[k+V+11]=U.itemSize===4?s.w:1)}}d={count:u,texture:A,size:new pe(_,D)},n.set(a,d),a.addEventListener("dispose",b)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let v=0;v<c.length;v++)p+=c[v];let x=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function iy(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return u}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var br=class extends Ht{constructor(e,t,n,s,r,o,a,l,c,h=dr){if(h!==dr&&h!==as)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===dr&&(n=Ds),n===void 0&&h===as&&(n=os),super(null,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Ut,this.minFilter=l!==void 0?l:Ut,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Ep=new Ht,_d=new br(1,1),Rp=new Va,Cp=new xh,Ip=new Ya,Md=[],Sd=[],bd=new Float32Array(16),wd=new Float32Array(9),Td=new Float32Array(4);function Nr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Md[s];if(r===void 0&&(r=new Float32Array(s),Md[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function qt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Zt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function wl(i,e){let t=Sd[e];t===void 0&&(t=new Int32Array(e),Sd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function sy(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function ry(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(qt(t,e))return;i.uniform2fv(this.addr,e),Zt(t,e)}}function oy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(qt(t,e))return;i.uniform3fv(this.addr,e),Zt(t,e)}}function ay(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(qt(t,e))return;i.uniform4fv(this.addr,e),Zt(t,e)}}function ly(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(qt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Zt(t,e)}else{if(qt(t,n))return;Td.set(n),i.uniformMatrix2fv(this.addr,!1,Td),Zt(t,n)}}function cy(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(qt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Zt(t,e)}else{if(qt(t,n))return;wd.set(n),i.uniformMatrix3fv(this.addr,!1,wd),Zt(t,n)}}function hy(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(qt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Zt(t,e)}else{if(qt(t,n))return;bd.set(n),i.uniformMatrix4fv(this.addr,!1,bd),Zt(t,n)}}function uy(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function fy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(qt(t,e))return;i.uniform2iv(this.addr,e),Zt(t,e)}}function dy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(qt(t,e))return;i.uniform3iv(this.addr,e),Zt(t,e)}}function py(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(qt(t,e))return;i.uniform4iv(this.addr,e),Zt(t,e)}}function my(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function gy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(qt(t,e))return;i.uniform2uiv(this.addr,e),Zt(t,e)}}function xy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(qt(t,e))return;i.uniform3uiv(this.addr,e),Zt(t,e)}}function vy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(qt(t,e))return;i.uniform4uiv(this.addr,e),Zt(t,e)}}function yy(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(_d.compareFunction=Sp,r=_d):r=Ep,t.setTexture2D(e||r,s)}function _y(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Cp,s)}function My(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Ip,s)}function Sy(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Rp,s)}function by(i){switch(i){case 5126:return sy;case 35664:return ry;case 35665:return oy;case 35666:return ay;case 35674:return ly;case 35675:return cy;case 35676:return hy;case 5124:case 35670:return uy;case 35667:case 35671:return fy;case 35668:case 35672:return dy;case 35669:case 35673:return py;case 5125:return my;case 36294:return gy;case 36295:return xy;case 36296:return vy;case 35678:case 36198:case 36298:case 36306:case 35682:return yy;case 35679:case 36299:case 36307:return _y;case 35680:case 36300:case 36308:case 36293:return My;case 36289:case 36303:case 36311:case 36292:return Sy}}function wy(i,e){i.uniform1fv(this.addr,e)}function Ty(i,e){let t=Nr(e,this.size,2);i.uniform2fv(this.addr,t)}function Ay(i,e){let t=Nr(e,this.size,3);i.uniform3fv(this.addr,t)}function Ey(i,e){let t=Nr(e,this.size,4);i.uniform4fv(this.addr,t)}function Ry(i,e){let t=Nr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Cy(i,e){let t=Nr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Iy(i,e){let t=Nr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Py(i,e){i.uniform1iv(this.addr,e)}function Ly(i,e){i.uniform2iv(this.addr,e)}function Dy(i,e){i.uniform3iv(this.addr,e)}function Ny(i,e){i.uniform4iv(this.addr,e)}function Uy(i,e){i.uniform1uiv(this.addr,e)}function Oy(i,e){i.uniform2uiv(this.addr,e)}function Fy(i,e){i.uniform3uiv(this.addr,e)}function By(i,e){i.uniform4uiv(this.addr,e)}function ky(i,e,t){let n=this.cache,s=e.length,r=wl(t,s);qt(n,r)||(i.uniform1iv(this.addr,r),Zt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Ep,r[o])}function zy(i,e,t){let n=this.cache,s=e.length,r=wl(t,s);qt(n,r)||(i.uniform1iv(this.addr,r),Zt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Cp,r[o])}function Hy(i,e,t){let n=this.cache,s=e.length,r=wl(t,s);qt(n,r)||(i.uniform1iv(this.addr,r),Zt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Ip,r[o])}function Vy(i,e,t){let n=this.cache,s=e.length,r=wl(t,s);qt(n,r)||(i.uniform1iv(this.addr,r),Zt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Rp,r[o])}function Gy(i){switch(i){case 5126:return wy;case 35664:return Ty;case 35665:return Ay;case 35666:return Ey;case 35674:return Ry;case 35675:return Cy;case 35676:return Iy;case 5124:case 35670:return Py;case 35667:case 35671:return Ly;case 35668:case 35672:return Dy;case 35669:case 35673:return Ny;case 5125:return Uy;case 36294:return Oy;case 36295:return Fy;case 36296:return By;case 35678:case 36198:case 36298:case 36306:case 35682:return ky;case 35679:case 36299:case 36307:return zy;case 35680:case 36300:case 36308:case 36293:return Hy;case 36289:case 36303:case 36311:case 36292:return Vy}}var _h=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=by(t.type)}},Mh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Gy(t.type)}},Sh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},bc=/(\w+)(\])?(\[|\.)?/g;function Ad(i,e){i.seq.push(e),i.map[e.id]=e}function Wy(i,e,t){let n=i.name,s=n.length;for(bc.lastIndex=0;;){let r=bc.exec(n),o=bc.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Ad(t,c===void 0?new _h(a,i,e):new Mh(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new Sh(a),Ad(t,u)),t=u}}}var mr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Wy(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function Ed(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Xy=37297,Yy=0;function qy(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Rd=new st;function Zy(i){ct._getMatrix(Rd,ct.workingColorSpace,i);let e=`mat3( ${Rd.elements.map(t=>t.toFixed(4))} )`;switch(ct.getTransfer(i)){case bl:return[e,"LinearTransferOETF"];case Mt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Cd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+qy(i.getShaderSource(e),o)}else return s}function Ky(i,e){let t=Zy(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function jy(i,e){let t;switch(e){case eu:t="Linear";break;case tu:t="Reinhard";break;case nu:t="Cineon";break;case Io:t="ACESFilmic";break;case iu:t="AgX";break;case su:t="Neutral";break;case cg:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Ta=new B;function Jy(){ct.getLuminanceCoefficients(Ta);let i=Ta.x.toFixed(4),e=Ta.y.toFixed(4),t=Ta.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Qy(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(io).join(`
`)}function $y(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function e_(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function io(i){return i!==""}function Id(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Pd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var t_=/^[ \t]*#include +<([\w\d./]+)>/gm;function bh(i){return i.replace(t_,i_)}var n_=new Map;function i_(i,e){let t=tt[e];if(t===void 0){let n=n_.get(e);if(n!==void 0)t=tt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return bh(t)}var s_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ld(i){return i.replace(s_,r_)}function r_(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Dd(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function o_(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===cp?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===jh?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Li&&(e="SHADOWMAP_TYPE_VSM"),e}function a_(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case xr:case vr:e="ENVMAP_TYPE_CUBE";break;case Ml:e="ENVMAP_TYPE_CUBE_UV";break}return e}function l_(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===vr&&(e="ENVMAP_MODE_REFRACTION"),e}function c_(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case hp:e="ENVMAP_BLENDING_MULTIPLY";break;case ag:e="ENVMAP_BLENDING_MIX";break;case lg:e="ENVMAP_BLENDING_ADD";break}return e}function h_(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function u_(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=o_(t),c=a_(t),h=l_(t),u=c_(t),d=h_(t),p=Qy(t),x=$y(r),v=s.createProgram(),g,m,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(io).join(`
`),g.length>0&&(g+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(io).join(`
`),m.length>0&&(m+=`
`)):(g=[Dd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(io).join(`
`),m=[Dd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==rs?"#define TONE_MAPPING":"",t.toneMapping!==rs?tt.tonemapping_pars_fragment:"",t.toneMapping!==rs?jy("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",tt.colorspace_pars_fragment,Ky("linearToOutputTexel",t.outputColorSpace),Jy(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(io).join(`
`)),o=bh(o),o=Id(o,t),o=Pd(o,t),a=bh(a),a=Id(a,t),a=Pd(a,t),o=Ld(o),a=Ld(a),t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,m=["#define varying in",t.glslVersion===Yf?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Yf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let S=w+g+o,_=w+m+a,D=Ed(s,s.VERTEX_SHADER,S),I=Ed(s,s.FRAGMENT_SHADER,_);s.attachShader(v,D),s.attachShader(v,I),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function A(E){if(i.debug.checkShaderErrors){let F=s.getProgramInfoLog(v).trim(),U=s.getShaderInfoLog(D).trim(),k=s.getShaderInfoLog(I).trim(),G=!0,V=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,D,I);else{let $=Cd(s,D,"vertex"),X=Cd(s,I,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+E.name+`
Material Type: `+E.type+`

Program Info Log: `+F+`
`+$+`
`+X)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(U===""||k==="")&&(V=!1);V&&(E.diagnostics={runnable:G,programLog:F,vertexShader:{log:U,prefix:g},fragmentShader:{log:k,prefix:m}})}s.deleteShader(D),s.deleteShader(I),T=new mr(s,v),b=e_(s,v)}let T;this.getUniforms=function(){return T===void 0&&A(this),T};let b;this.getAttributes=function(){return b===void 0&&A(this),b};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(v,Xy)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Yy++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=D,this.fragmentShader=I,this}var f_=0,wh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Th(e),t.set(e,n)),n}},Th=class{constructor(e){this.id=f_++,this.code=e,this.usedTimes=0}};function d_(i,e,t,n,s,r,o){let a=new po,l=new wh,c=new Set,h=[],u=s.logarithmicDepthBuffer,d=s.vertexTextures,p=s.precision,x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(b){return c.add(b),b===0?"uv":`uv${b}`}function g(b,y,E,F,U){let k=F.fog,G=U.geometry,V=b.isMeshStandardMaterial?F.environment:null,$=(b.isMeshStandardMaterial?t:e).get(b.envMap||V),X=$&&$.mapping===Ml?$.image.height:null,j=x[b.type];b.precision!==null&&(p=s.getMaxPrecision(b.precision),p!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",p,"instead."));let P=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,W=P!==void 0?P.length:0,ee=0;G.morphAttributes.position!==void 0&&(ee=1),G.morphAttributes.normal!==void 0&&(ee=2),G.morphAttributes.color!==void 0&&(ee=3);let le,Y,te,ne;if(j){let xt=di[j];le=xt.vertexShader,Y=xt.fragmentShader}else le=b.vertexShader,Y=b.fragmentShader,l.update(b),te=l.getVertexShaderID(b),ne=l.getFragmentShaderID(b);let q=i.getRenderTarget(),ve=i.state.buffers.depth.getReversed(),Ee=U.isInstancedMesh===!0,Le=U.isBatchedMesh===!0,Je=!!b.map,fe=!!b.matcap,me=!!$,z=!!b.aoMap,Ne=!!b.lightMap,_e=!!b.bumpMap,Oe=!!b.normalMap,Re=!!b.displacementMap,Ze=!!b.emissiveMap,Fe=!!b.metalnessMap,O=!!b.roughnessMap,C=b.anisotropy>0,J=b.clearcoat>0,he=b.dispersion>0,ge=b.iridescence>0,ue=b.sheen>0,Ve=b.transmission>0,Ce=C&&!!b.anisotropyMap,De=J&&!!b.clearcoatMap,nt=J&&!!b.clearcoatNormalMap,we=J&&!!b.clearcoatRoughnessMap,He=ge&&!!b.iridescenceMap,Ge=ge&&!!b.iridescenceThicknessMap,Xe=ue&&!!b.sheenColorMap,ze=ue&&!!b.sheenRoughnessMap,et=!!b.specularMap,Ye=!!b.specularColorMap,Qe=!!b.specularIntensityMap,Z=Ve&&!!b.transmissionMap,re=Ve&&!!b.thicknessMap,ae=!!b.gradientMap,xe=!!b.alphaMap,ke=b.alphaTest>0,Be=!!b.alphaHash,it=!!b.extensions,Dt=rs;b.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(Dt=i.toneMapping);let jt={shaderID:j,shaderType:b.type,shaderName:b.name,vertexShader:le,fragmentShader:Y,defines:b.defines,customVertexShaderID:te,customFragmentShaderID:ne,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:p,batching:Le,batchingColor:Le&&U._colorsTexture!==null,instancing:Ee,instancingColor:Ee&&U.instanceColor!==null,instancingMorph:Ee&&U.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:q===null?i.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:kt,alphaToCoverage:!!b.alphaToCoverage,map:Je,matcap:fe,envMap:me,envMapMode:me&&$.mapping,envMapCubeUVHeight:X,aoMap:z,lightMap:Ne,bumpMap:_e,normalMap:Oe,displacementMap:d&&Re,emissiveMap:Ze,normalMapObjectSpace:Oe&&b.normalMapType===pg,normalMapTangentSpace:Oe&&b.normalMapType===uu,metalnessMap:Fe,roughnessMap:O,anisotropy:C,anisotropyMap:Ce,clearcoat:J,clearcoatMap:De,clearcoatNormalMap:nt,clearcoatRoughnessMap:we,dispersion:he,iridescence:ge,iridescenceMap:He,iridescenceThicknessMap:Ge,sheen:ue,sheenColorMap:Xe,sheenRoughnessMap:ze,specularMap:et,specularColorMap:Ye,specularIntensityMap:Qe,transmission:Ve,transmissionMap:Z,thicknessMap:re,gradientMap:ae,opaque:b.transparent===!1&&b.blending===fr&&b.alphaToCoverage===!1,alphaMap:xe,alphaTest:ke,alphaHash:Be,combine:b.combine,mapUv:Je&&v(b.map.channel),aoMapUv:z&&v(b.aoMap.channel),lightMapUv:Ne&&v(b.lightMap.channel),bumpMapUv:_e&&v(b.bumpMap.channel),normalMapUv:Oe&&v(b.normalMap.channel),displacementMapUv:Re&&v(b.displacementMap.channel),emissiveMapUv:Ze&&v(b.emissiveMap.channel),metalnessMapUv:Fe&&v(b.metalnessMap.channel),roughnessMapUv:O&&v(b.roughnessMap.channel),anisotropyMapUv:Ce&&v(b.anisotropyMap.channel),clearcoatMapUv:De&&v(b.clearcoatMap.channel),clearcoatNormalMapUv:nt&&v(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:we&&v(b.clearcoatRoughnessMap.channel),iridescenceMapUv:He&&v(b.iridescenceMap.channel),iridescenceThicknessMapUv:Ge&&v(b.iridescenceThicknessMap.channel),sheenColorMapUv:Xe&&v(b.sheenColorMap.channel),sheenRoughnessMapUv:ze&&v(b.sheenRoughnessMap.channel),specularMapUv:et&&v(b.specularMap.channel),specularColorMapUv:Ye&&v(b.specularColorMap.channel),specularIntensityMapUv:Qe&&v(b.specularIntensityMap.channel),transmissionMapUv:Z&&v(b.transmissionMap.channel),thicknessMapUv:re&&v(b.thicknessMap.channel),alphaMapUv:xe&&v(b.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(Oe||C),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!G.attributes.uv&&(Je||xe),fog:!!k,useFog:b.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:ve,skinning:U.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:W,morphTextureStride:ee,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&E.length>0,shadowMapType:i.shadowMap.type,toneMapping:Dt,decodeVideoTexture:Je&&b.map.isVideoTexture===!0&&ct.getTransfer(b.map.colorSpace)===Mt,decodeVideoTextureEmissive:Ze&&b.emissiveMap.isVideoTexture===!0&&ct.getTransfer(b.emissiveMap.colorSpace)===Mt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Nt,flipSided:b.side===yn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:it&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(it&&b.extensions.multiDraw===!0||Le)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return jt.vertexUv1s=c.has(1),jt.vertexUv2s=c.has(2),jt.vertexUv3s=c.has(3),c.clear(),jt}function m(b){let y=[];if(b.shaderID?y.push(b.shaderID):(y.push(b.customVertexShaderID),y.push(b.customFragmentShaderID)),b.defines!==void 0)for(let E in b.defines)y.push(E),y.push(b.defines[E]);return b.isRawShaderMaterial===!1&&(w(y,b),S(y,b),y.push(i.outputColorSpace)),y.push(b.customProgramCacheKey),y.join()}function w(b,y){b.push(y.precision),b.push(y.outputColorSpace),b.push(y.envMapMode),b.push(y.envMapCubeUVHeight),b.push(y.mapUv),b.push(y.alphaMapUv),b.push(y.lightMapUv),b.push(y.aoMapUv),b.push(y.bumpMapUv),b.push(y.normalMapUv),b.push(y.displacementMapUv),b.push(y.emissiveMapUv),b.push(y.metalnessMapUv),b.push(y.roughnessMapUv),b.push(y.anisotropyMapUv),b.push(y.clearcoatMapUv),b.push(y.clearcoatNormalMapUv),b.push(y.clearcoatRoughnessMapUv),b.push(y.iridescenceMapUv),b.push(y.iridescenceThicknessMapUv),b.push(y.sheenColorMapUv),b.push(y.sheenRoughnessMapUv),b.push(y.specularMapUv),b.push(y.specularColorMapUv),b.push(y.specularIntensityMapUv),b.push(y.transmissionMapUv),b.push(y.thicknessMapUv),b.push(y.combine),b.push(y.fogExp2),b.push(y.sizeAttenuation),b.push(y.morphTargetsCount),b.push(y.morphAttributeCount),b.push(y.numDirLights),b.push(y.numPointLights),b.push(y.numSpotLights),b.push(y.numSpotLightMaps),b.push(y.numHemiLights),b.push(y.numRectAreaLights),b.push(y.numDirLightShadows),b.push(y.numPointLightShadows),b.push(y.numSpotLightShadows),b.push(y.numSpotLightShadowsWithMaps),b.push(y.numLightProbes),b.push(y.shadowMapType),b.push(y.toneMapping),b.push(y.numClippingPlanes),b.push(y.numClipIntersection),b.push(y.depthPacking)}function S(b,y){a.disableAll(),y.supportsVertexTextures&&a.enable(0),y.instancing&&a.enable(1),y.instancingColor&&a.enable(2),y.instancingMorph&&a.enable(3),y.matcap&&a.enable(4),y.envMap&&a.enable(5),y.normalMapObjectSpace&&a.enable(6),y.normalMapTangentSpace&&a.enable(7),y.clearcoat&&a.enable(8),y.iridescence&&a.enable(9),y.alphaTest&&a.enable(10),y.vertexColors&&a.enable(11),y.vertexAlphas&&a.enable(12),y.vertexUv1s&&a.enable(13),y.vertexUv2s&&a.enable(14),y.vertexUv3s&&a.enable(15),y.vertexTangents&&a.enable(16),y.anisotropy&&a.enable(17),y.alphaHash&&a.enable(18),y.batching&&a.enable(19),y.dispersion&&a.enable(20),y.batchingColor&&a.enable(21),b.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reverseDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),b.push(a.mask)}function _(b){let y=x[b.type],E;if(y){let F=di[y];E=bn.clone(F.uniforms)}else E=b.uniforms;return E}function D(b,y){let E;for(let F=0,U=h.length;F<U;F++){let k=h[F];if(k.cacheKey===y){E=k,++E.usedTimes;break}}return E===void 0&&(E=new u_(i,y,b,r),h.push(E)),E}function I(b){if(--b.usedTimes===0){let y=h.indexOf(b);h[y]=h[h.length-1],h.pop(),b.destroy()}}function A(b){l.remove(b)}function T(){l.dispose()}return{getParameters:g,getProgramCacheKey:m,getUniforms:_,acquireProgram:D,releaseProgram:I,releaseShaderCache:A,programs:h,dispose:T}}function p_(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function m_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Nd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Ud(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u,d,p,x,v,g){let m=i[e];return m===void 0?(m={id:u.id,object:u,geometry:d,material:p,groupOrder:x,renderOrder:u.renderOrder,z:v,group:g},i[e]=m):(m.id=u.id,m.object=u,m.geometry=d,m.material=p,m.groupOrder=x,m.renderOrder=u.renderOrder,m.z=v,m.group=g),e++,m}function a(u,d,p,x,v,g){let m=o(u,d,p,x,v,g);p.transmission>0?n.push(m):p.transparent===!0?s.push(m):t.push(m)}function l(u,d,p,x,v,g){let m=o(u,d,p,x,v,g);p.transmission>0?n.unshift(m):p.transparent===!0?s.unshift(m):t.unshift(m)}function c(u,d){t.length>1&&t.sort(u||m_),n.length>1&&n.sort(d||Nd),s.length>1&&s.sort(d||Nd)}function h(){for(let u=e,d=i.length;u<d;u++){let p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function g_(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new Ud,i.set(n,[o])):s>=r.length?(o=new Ud,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function x_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new B,color:new We};break;case"SpotLight":t={position:new B,direction:new B,color:new We,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new B,color:new We,distance:0,decay:0};break;case"HemisphereLight":t={direction:new B,skyColor:new We,groundColor:new We};break;case"RectAreaLight":t={color:new We,position:new B,halfWidth:new B,halfHeight:new B};break}return i[e.id]=t,t}}}function v_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var y_=0;function __(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function M_(i){let e=new x_,t=v_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new B);let s=new B,r=new je,o=new je;function a(c){let h=0,u=0,d=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let p=0,x=0,v=0,g=0,m=0,w=0,S=0,_=0,D=0,I=0,A=0;c.sort(__);for(let b=0,y=c.length;b<y;b++){let E=c[b],F=E.color,U=E.intensity,k=E.distance,G=E.shadow&&E.shadow.map?E.shadow.map.texture:null;if(E.isAmbientLight)h+=F.r*U,u+=F.g*U,d+=F.b*U;else if(E.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(E.sh.coefficients[V],U);A++}else if(E.isDirectionalLight){let V=e.get(E);if(V.color.copy(E.color).multiplyScalar(E.intensity),E.castShadow){let $=E.shadow,X=t.get(E);X.shadowIntensity=$.intensity,X.shadowBias=$.bias,X.shadowNormalBias=$.normalBias,X.shadowRadius=$.radius,X.shadowMapSize=$.mapSize,n.directionalShadow[p]=X,n.directionalShadowMap[p]=G,n.directionalShadowMatrix[p]=E.shadow.matrix,w++}n.directional[p]=V,p++}else if(E.isSpotLight){let V=e.get(E);V.position.setFromMatrixPosition(E.matrixWorld),V.color.copy(F).multiplyScalar(U),V.distance=k,V.coneCos=Math.cos(E.angle),V.penumbraCos=Math.cos(E.angle*(1-E.penumbra)),V.decay=E.decay,n.spot[v]=V;let $=E.shadow;if(E.map&&(n.spotLightMap[D]=E.map,D++,$.updateMatrices(E),E.castShadow&&I++),n.spotLightMatrix[v]=$.matrix,E.castShadow){let X=t.get(E);X.shadowIntensity=$.intensity,X.shadowBias=$.bias,X.shadowNormalBias=$.normalBias,X.shadowRadius=$.radius,X.shadowMapSize=$.mapSize,n.spotShadow[v]=X,n.spotShadowMap[v]=G,_++}v++}else if(E.isRectAreaLight){let V=e.get(E);V.color.copy(F).multiplyScalar(U),V.halfWidth.set(E.width*.5,0,0),V.halfHeight.set(0,E.height*.5,0),n.rectArea[g]=V,g++}else if(E.isPointLight){let V=e.get(E);if(V.color.copy(E.color).multiplyScalar(E.intensity),V.distance=E.distance,V.decay=E.decay,E.castShadow){let $=E.shadow,X=t.get(E);X.shadowIntensity=$.intensity,X.shadowBias=$.bias,X.shadowNormalBias=$.normalBias,X.shadowRadius=$.radius,X.shadowMapSize=$.mapSize,X.shadowCameraNear=$.camera.near,X.shadowCameraFar=$.camera.far,n.pointShadow[x]=X,n.pointShadowMap[x]=G,n.pointShadowMatrix[x]=E.shadow.matrix,S++}n.point[x]=V,x++}else if(E.isHemisphereLight){let V=e.get(E);V.skyColor.copy(E.color).multiplyScalar(U),V.groundColor.copy(E.groundColor).multiplyScalar(U),n.hemi[m]=V,m++}}g>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ue.LTC_FLOAT_1,n.rectAreaLTC2=Ue.LTC_FLOAT_2):(n.rectAreaLTC1=Ue.LTC_HALF_1,n.rectAreaLTC2=Ue.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let T=n.hash;(T.directionalLength!==p||T.pointLength!==x||T.spotLength!==v||T.rectAreaLength!==g||T.hemiLength!==m||T.numDirectionalShadows!==w||T.numPointShadows!==S||T.numSpotShadows!==_||T.numSpotMaps!==D||T.numLightProbes!==A)&&(n.directional.length=p,n.spot.length=v,n.rectArea.length=g,n.point.length=x,n.hemi.length=m,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=_,n.spotShadowMap.length=_,n.directionalShadowMatrix.length=w,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=_+D-I,n.spotLightMap.length=D,n.numSpotLightShadowsWithMaps=I,n.numLightProbes=A,T.directionalLength=p,T.pointLength=x,T.spotLength=v,T.rectAreaLength=g,T.hemiLength=m,T.numDirectionalShadows=w,T.numPointShadows=S,T.numSpotShadows=_,T.numSpotMaps=D,T.numLightProbes=A,n.version=y_++)}function l(c,h){let u=0,d=0,p=0,x=0,v=0,g=h.matrixWorldInverse;for(let m=0,w=c.length;m<w;m++){let S=c[m];if(S.isDirectionalLight){let _=n.directional[u];_.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(g),u++}else if(S.isSpotLight){let _=n.spot[p];_.position.setFromMatrixPosition(S.matrixWorld),_.position.applyMatrix4(g),_.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(g),p++}else if(S.isRectAreaLight){let _=n.rectArea[x];_.position.setFromMatrixPosition(S.matrixWorld),_.position.applyMatrix4(g),o.identity(),r.copy(S.matrixWorld),r.premultiply(g),o.extractRotation(r),_.halfWidth.set(S.width*.5,0,0),_.halfHeight.set(0,S.height*.5,0),_.halfWidth.applyMatrix4(o),_.halfHeight.applyMatrix4(o),x++}else if(S.isPointLight){let _=n.point[d];_.position.setFromMatrixPosition(S.matrixWorld),_.position.applyMatrix4(g),d++}else if(S.isHemisphereLight){let _=n.hemi[v];_.direction.setFromMatrixPosition(S.matrixWorld),_.direction.transformDirection(g),v++}}}return{setup:a,setupView:l,state:n}}function Od(i){let e=new M_(i),t=[],n=[];function s(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function S_(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Od(i),e.set(s,[a])):r>=o.length?(a=new Od(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var Ah=class extends _n{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=fg,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Eh=class extends _n{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},b_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,w_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function T_(i,e,t){let n=new mo,s=new pe,r=new pe,o=new yt,a=new Ah({depthPacking:dg}),l=new Eh,c={},h=t.maxTextureSize,u={[Bn]:yn,[yn]:Bn,[Nt]:Nt},d=new Ft({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pe},radius:{value:4}},vertexShader:b_,fragmentShader:w_}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let x=new Et;x.setAttribute("position",new Tt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new mt(x,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=cp;let m=this.type;this.render=function(I,A,T){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||I.length===0)return;let b=i.getRenderTarget(),y=i.getActiveCubeFace(),E=i.getActiveMipmapLevel(),F=i.state;F.setBlending(nn),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let U=m!==Li&&this.type===Li,k=m===Li&&this.type!==Li;for(let G=0,V=I.length;G<V;G++){let $=I[G],X=$.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);let j=X.getFrameExtents();if(s.multiply(j),r.copy(X.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/j.x),s.x=r.x*j.x,X.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/j.y),s.y=r.y*j.y,X.mapSize.y=r.y)),X.map===null||U===!0||k===!0){let W=this.type!==Li?{minFilter:Ut,magFilter:Ut}:{};X.map!==null&&X.map.dispose(),X.map=new sn(s.x,s.y,W),X.map.texture.name=$.name+".shadowMap",X.camera.updateProjectionMatrix()}i.setRenderTarget(X.map),i.clear();let P=X.getViewportCount();for(let W=0;W<P;W++){let ee=X.getViewport(W);o.set(r.x*ee.x,r.y*ee.y,r.x*ee.z,r.y*ee.w),F.viewport(o),X.updateMatrices($,W),n=X.getFrustum(),_(A,T,X.camera,$,this.type)}X.isPointLightShadow!==!0&&this.type===Li&&w(X,T),X.needsUpdate=!1}m=this.type,g.needsUpdate=!1,i.setRenderTarget(b,y,E)};function w(I,A){let T=e.update(v);d.defines.VSM_SAMPLES!==I.blurSamples&&(d.defines.VSM_SAMPLES=I.blurSamples,p.defines.VSM_SAMPLES=I.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),I.mapPass===null&&(I.mapPass=new sn(s.x,s.y)),d.uniforms.shadow_pass.value=I.map.texture,d.uniforms.resolution.value=I.mapSize,d.uniforms.radius.value=I.radius,i.setRenderTarget(I.mapPass),i.clear(),i.renderBufferDirect(A,null,T,d,v,null),p.uniforms.shadow_pass.value=I.mapPass.texture,p.uniforms.resolution.value=I.mapSize,p.uniforms.radius.value=I.radius,i.setRenderTarget(I.map),i.clear(),i.renderBufferDirect(A,null,T,p,v,null)}function S(I,A,T,b){let y=null,E=T.isPointLight===!0?I.customDistanceMaterial:I.customDepthMaterial;if(E!==void 0)y=E;else if(y=T.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){let F=y.uuid,U=A.uuid,k=c[F];k===void 0&&(k={},c[F]=k);let G=k[U];G===void 0&&(G=y.clone(),k[U]=G,A.addEventListener("dispose",D)),y=G}if(y.visible=A.visible,y.wireframe=A.wireframe,b===Li?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:u[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,T.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let F=i.properties.get(y);F.light=T}return y}function _(I,A,T,b,y){if(I.visible===!1)return;if(I.layers.test(A.layers)&&(I.isMesh||I.isLine||I.isPoints)&&(I.castShadow||I.receiveShadow&&y===Li)&&(!I.frustumCulled||n.intersectsObject(I))){I.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse,I.matrixWorld);let U=e.update(I),k=I.material;if(Array.isArray(k)){let G=U.groups;for(let V=0,$=G.length;V<$;V++){let X=G[V],j=k[X.materialIndex];if(j&&j.visible){let P=S(I,j,b,y);I.onBeforeShadow(i,I,A,T,U,P,X),i.renderBufferDirect(T,null,U,P,I,X),I.onAfterShadow(i,I,A,T,U,P,X)}}}else if(k.visible){let G=S(I,k,b,y);I.onBeforeShadow(i,I,A,T,U,G,null),i.renderBufferDirect(T,null,U,G,I,null),I.onAfterShadow(i,I,A,T,U,G,null)}}let F=I.children;for(let U=0,k=F.length;U<k;U++)_(F[U],A,T,b,y)}function D(I){I.target.removeEventListener("dispose",D);for(let T in c){let b=c[T],y=I.target.uuid;y in b&&(b[y].dispose(),delete b[y])}}}var A_={[Nc]:Uc,[Oc]:kc,[Fc]:zc,[gr]:Bc,[Uc]:Nc,[kc]:Oc,[zc]:Fc,[Bc]:gr};function E_(i,e){function t(){let Z=!1,re=new yt,ae=null,xe=new yt(0,0,0,0);return{setMask:function(ke){ae!==ke&&!Z&&(i.colorMask(ke,ke,ke,ke),ae=ke)},setLocked:function(ke){Z=ke},setClear:function(ke,Be,it,Dt,jt){jt===!0&&(ke*=Dt,Be*=Dt,it*=Dt),re.set(ke,Be,it,Dt),xe.equals(re)===!1&&(i.clearColor(ke,Be,it,Dt),xe.copy(re))},reset:function(){Z=!1,ae=null,xe.set(-1,0,0,0)}}}function n(){let Z=!1,re=!1,ae=null,xe=null,ke=null;return{setReversed:function(Be){if(re!==Be){let it=e.get("EXT_clip_control");re?it.clipControlEXT(it.LOWER_LEFT_EXT,it.ZERO_TO_ONE_EXT):it.clipControlEXT(it.LOWER_LEFT_EXT,it.NEGATIVE_ONE_TO_ONE_EXT);let Dt=ke;ke=null,this.setClear(Dt)}re=Be},getReversed:function(){return re},setTest:function(Be){Be?q(i.DEPTH_TEST):ve(i.DEPTH_TEST)},setMask:function(Be){ae!==Be&&!Z&&(i.depthMask(Be),ae=Be)},setFunc:function(Be){if(re&&(Be=A_[Be]),xe!==Be){switch(Be){case Nc:i.depthFunc(i.NEVER);break;case Uc:i.depthFunc(i.ALWAYS);break;case Oc:i.depthFunc(i.LESS);break;case gr:i.depthFunc(i.LEQUAL);break;case Fc:i.depthFunc(i.EQUAL);break;case Bc:i.depthFunc(i.GEQUAL);break;case kc:i.depthFunc(i.GREATER);break;case zc:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}xe=Be}},setLocked:function(Be){Z=Be},setClear:function(Be){ke!==Be&&(re&&(Be=1-Be),i.clearDepth(Be),ke=Be)},reset:function(){Z=!1,ae=null,xe=null,ke=null,re=!1}}}function s(){let Z=!1,re=null,ae=null,xe=null,ke=null,Be=null,it=null,Dt=null,jt=null;return{setTest:function(xt){Z||(xt?q(i.STENCIL_TEST):ve(i.STENCIL_TEST))},setMask:function(xt){re!==xt&&!Z&&(i.stencilMask(xt),re=xt)},setFunc:function(xt,En,Qn){(ae!==xt||xe!==En||ke!==Qn)&&(i.stencilFunc(xt,En,Qn),ae=xt,xe=En,ke=Qn)},setOp:function(xt,En,Qn){(Be!==xt||it!==En||Dt!==Qn)&&(i.stencilOp(xt,En,Qn),Be=xt,it=En,Dt=Qn)},setLocked:function(xt){Z=xt},setClear:function(xt){jt!==xt&&(i.clearStencil(xt),jt=xt)},reset:function(){Z=!1,re=null,ae=null,xe=null,ke=null,Be=null,it=null,Dt=null,jt=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},d=new WeakMap,p=[],x=null,v=!1,g=null,m=null,w=null,S=null,_=null,D=null,I=null,A=new We(0,0,0),T=0,b=!1,y=null,E=null,F=null,U=null,k=null,G=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,$=0,X=i.getParameter(i.VERSION);X.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(X)[1]),V=$>=1):X.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),V=$>=2);let j=null,P={},W=i.getParameter(i.SCISSOR_BOX),ee=i.getParameter(i.VIEWPORT),le=new yt().fromArray(W),Y=new yt().fromArray(ee);function te(Z,re,ae,xe){let ke=new Uint8Array(4),Be=i.createTexture();i.bindTexture(Z,Be),i.texParameteri(Z,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(Z,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let it=0;it<ae;it++)Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?i.texImage3D(re,0,i.RGBA,1,1,xe,0,i.RGBA,i.UNSIGNED_BYTE,ke):i.texImage2D(re+it,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ke);return Be}let ne={};ne[i.TEXTURE_2D]=te(i.TEXTURE_2D,i.TEXTURE_2D,1),ne[i.TEXTURE_CUBE_MAP]=te(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ne[i.TEXTURE_2D_ARRAY]=te(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ne[i.TEXTURE_3D]=te(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),q(i.DEPTH_TEST),o.setFunc(gr),_e(!1),Oe(Ff),q(i.CULL_FACE),z(nn);function q(Z){h[Z]!==!0&&(i.enable(Z),h[Z]=!0)}function ve(Z){h[Z]!==!1&&(i.disable(Z),h[Z]=!1)}function Ee(Z,re){return u[Z]!==re?(i.bindFramebuffer(Z,re),u[Z]=re,Z===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=re),Z===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=re),!0):!1}function Le(Z,re){let ae=p,xe=!1;if(Z){ae=d.get(re),ae===void 0&&(ae=[],d.set(re,ae));let ke=Z.textures;if(ae.length!==ke.length||ae[0]!==i.COLOR_ATTACHMENT0){for(let Be=0,it=ke.length;Be<it;Be++)ae[Be]=i.COLOR_ATTACHMENT0+Be;ae.length=ke.length,xe=!0}}else ae[0]!==i.BACK&&(ae[0]=i.BACK,xe=!0);xe&&i.drawBuffers(ae)}function Je(Z){return x!==Z?(i.useProgram(Z),x=Z,!0):!1}let fe={[pi]:i.FUNC_ADD,[qm]:i.FUNC_SUBTRACT,[Zm]:i.FUNC_REVERSE_SUBTRACT};fe[Km]=i.MIN,fe[jm]=i.MAX;let me={[_l]:i.ZERO,[Jm]:i.ONE,[Qm]:i.SRC_COLOR,[Lc]:i.SRC_ALPHA,[ng]:i.SRC_ALPHA_SATURATE,[$h]:i.DST_COLOR,[Qh]:i.DST_ALPHA,[$m]:i.ONE_MINUS_SRC_COLOR,[Dc]:i.ONE_MINUS_SRC_ALPHA,[tg]:i.ONE_MINUS_DST_COLOR,[eg]:i.ONE_MINUS_DST_ALPHA,[ig]:i.CONSTANT_COLOR,[sg]:i.ONE_MINUS_CONSTANT_COLOR,[rg]:i.CONSTANT_ALPHA,[og]:i.ONE_MINUS_CONSTANT_ALPHA};function z(Z,re,ae,xe,ke,Be,it,Dt,jt,xt){if(Z===nn){v===!0&&(ve(i.BLEND),v=!1);return}if(v===!1&&(q(i.BLEND),v=!0),Z!==Jh){if(Z!==g||xt!==b){if((m!==pi||_!==pi)&&(i.blendEquation(i.FUNC_ADD),m=pi,_=pi),xt)switch(Z){case fr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Bf:i.blendFunc(i.ONE,i.ONE);break;case kf:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case zf:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",Z);break}else switch(Z){case fr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Bf:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case kf:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case zf:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",Z);break}w=null,S=null,D=null,I=null,A.set(0,0,0),T=0,g=Z,b=xt}return}ke=ke||re,Be=Be||ae,it=it||xe,(re!==m||ke!==_)&&(i.blendEquationSeparate(fe[re],fe[ke]),m=re,_=ke),(ae!==w||xe!==S||Be!==D||it!==I)&&(i.blendFuncSeparate(me[ae],me[xe],me[Be],me[it]),w=ae,S=xe,D=Be,I=it),(Dt.equals(A)===!1||jt!==T)&&(i.blendColor(Dt.r,Dt.g,Dt.b,jt),A.copy(Dt),T=jt),g=Z,b=!1}function Ne(Z,re){Z.side===Nt?ve(i.CULL_FACE):q(i.CULL_FACE);let ae=Z.side===yn;re&&(ae=!ae),_e(ae),Z.blending===fr&&Z.transparent===!1?z(nn):z(Z.blending,Z.blendEquation,Z.blendSrc,Z.blendDst,Z.blendEquationAlpha,Z.blendSrcAlpha,Z.blendDstAlpha,Z.blendColor,Z.blendAlpha,Z.premultipliedAlpha),o.setFunc(Z.depthFunc),o.setTest(Z.depthTest),o.setMask(Z.depthWrite),r.setMask(Z.colorWrite);let xe=Z.stencilWrite;a.setTest(xe),xe&&(a.setMask(Z.stencilWriteMask),a.setFunc(Z.stencilFunc,Z.stencilRef,Z.stencilFuncMask),a.setOp(Z.stencilFail,Z.stencilZFail,Z.stencilZPass)),Ze(Z.polygonOffset,Z.polygonOffsetFactor,Z.polygonOffsetUnits),Z.alphaToCoverage===!0?q(i.SAMPLE_ALPHA_TO_COVERAGE):ve(i.SAMPLE_ALPHA_TO_COVERAGE)}function _e(Z){y!==Z&&(Z?i.frontFace(i.CW):i.frontFace(i.CCW),y=Z)}function Oe(Z){Z!==Xm?(q(i.CULL_FACE),Z!==E&&(Z===Ff?i.cullFace(i.BACK):Z===Ym?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ve(i.CULL_FACE),E=Z}function Re(Z){Z!==F&&(V&&i.lineWidth(Z),F=Z)}function Ze(Z,re,ae){Z?(q(i.POLYGON_OFFSET_FILL),(U!==re||k!==ae)&&(i.polygonOffset(re,ae),U=re,k=ae)):ve(i.POLYGON_OFFSET_FILL)}function Fe(Z){Z?q(i.SCISSOR_TEST):ve(i.SCISSOR_TEST)}function O(Z){Z===void 0&&(Z=i.TEXTURE0+G-1),j!==Z&&(i.activeTexture(Z),j=Z)}function C(Z,re,ae){ae===void 0&&(j===null?ae=i.TEXTURE0+G-1:ae=j);let xe=P[ae];xe===void 0&&(xe={type:void 0,texture:void 0},P[ae]=xe),(xe.type!==Z||xe.texture!==re)&&(j!==ae&&(i.activeTexture(ae),j=ae),i.bindTexture(Z,re||ne[Z]),xe.type=Z,xe.texture=re)}function J(){let Z=P[j];Z!==void 0&&Z.type!==void 0&&(i.bindTexture(Z.type,null),Z.type=void 0,Z.texture=void 0)}function he(){try{i.compressedTexImage2D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function ge(){try{i.compressedTexImage3D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function ue(){try{i.texSubImage2D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function Ve(){try{i.texSubImage3D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function Ce(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function De(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function nt(){try{i.texStorage2D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function we(){try{i.texStorage3D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function He(){try{i.texImage2D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function Ge(){try{i.texImage3D.apply(i,arguments)}catch(Z){console.error("THREE.WebGLState:",Z)}}function Xe(Z){le.equals(Z)===!1&&(i.scissor(Z.x,Z.y,Z.z,Z.w),le.copy(Z))}function ze(Z){Y.equals(Z)===!1&&(i.viewport(Z.x,Z.y,Z.z,Z.w),Y.copy(Z))}function et(Z,re){let ae=c.get(re);ae===void 0&&(ae=new WeakMap,c.set(re,ae));let xe=ae.get(Z);xe===void 0&&(xe=i.getUniformBlockIndex(re,Z.name),ae.set(Z,xe))}function Ye(Z,re){let xe=c.get(re).get(Z);l.get(re)!==xe&&(i.uniformBlockBinding(re,xe,Z.__bindingPointIndex),l.set(re,xe))}function Qe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},j=null,P={},u={},d=new WeakMap,p=[],x=null,v=!1,g=null,m=null,w=null,S=null,_=null,D=null,I=null,A=new We(0,0,0),T=0,b=!1,y=null,E=null,F=null,U=null,k=null,le.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:q,disable:ve,bindFramebuffer:Ee,drawBuffers:Le,useProgram:Je,setBlending:z,setMaterial:Ne,setFlipSided:_e,setCullFace:Oe,setLineWidth:Re,setPolygonOffset:Ze,setScissorTest:Fe,activeTexture:O,bindTexture:C,unbindTexture:J,compressedTexImage2D:he,compressedTexImage3D:ge,texImage2D:He,texImage3D:Ge,updateUBOMapping:et,uniformBlockBinding:Ye,texStorage2D:nt,texStorage3D:we,texSubImage2D:ue,texSubImage3D:Ve,compressedTexSubImage2D:Ce,compressedTexSubImage3D:De,scissor:Xe,viewport:ze,reset:Qe}}function Fd(i,e,t,n){let s=R_(n);switch(t){case mp:return i*e;case xp:return i*e;case vp:return i*e*2;case ks:return i*e/s.components*s.byteLength;case lu:return i*e/s.components*s.byteLength;case yp:return i*e*2/s.components*s.byteLength;case cu:return i*e*2/s.components*s.byteLength;case gp:return i*e*3/s.components*s.byteLength;case cn:return i*e*4/s.components*s.byteLength;case hu:return i*e*4/s.components*s.byteLength;case Oa:case Fa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ba:case ka:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Gc:case Xc:return Math.max(i,16)*Math.max(e,8)/4;case Vc:case Wc:return Math.max(i,8)*Math.max(e,8)/2;case Yc:case qc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Zc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Kc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case jc:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Jc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Qc:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case $c:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case eh:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case th:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case nh:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case ih:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case sh:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case rh:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case oh:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case ah:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case lh:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case za:case ch:case hh:return Math.ceil(i/4)*Math.ceil(e/4)*16;case _p:case uh:return Math.ceil(i/4)*Math.ceil(e/4)*8;case fh:case dh:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function R_(i){switch(i){case Oi:case fp:return{byteLength:1,components:1};case uo:case dp:case Bt:return{byteLength:2,components:1};case ou:case au:return{byteLength:2,components:4};case Ds:case ru:case Gt:return{byteLength:4,components:1};case pp:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function C_(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new pe,h=new WeakMap,u,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(O,C){return p?new OffscreenCanvas(O,C):fo("canvas")}function v(O,C,J){let he=1,ge=Fe(O);if((ge.width>J||ge.height>J)&&(he=J/Math.max(ge.width,ge.height)),he<1)if(typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&O instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&O instanceof ImageBitmap||typeof VideoFrame<"u"&&O instanceof VideoFrame){let ue=Math.floor(he*ge.width),Ve=Math.floor(he*ge.height);u===void 0&&(u=x(ue,Ve));let Ce=C?x(ue,Ve):u;return Ce.width=ue,Ce.height=Ve,Ce.getContext("2d").drawImage(O,0,0,ue,Ve),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ge.width+"x"+ge.height+") to ("+ue+"x"+Ve+")."),Ce}else return"data"in O&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ge.width+"x"+ge.height+")."),O;return O}function g(O){return O.generateMipmaps}function m(O){i.generateMipmap(O)}function w(O){return O.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:O.isWebGL3DRenderTarget?i.TEXTURE_3D:O.isWebGLArrayRenderTarget||O.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(O,C,J,he,ge=!1){if(O!==null){if(i[O]!==void 0)return i[O];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+O+"'")}let ue=C;if(C===i.RED&&(J===i.FLOAT&&(ue=i.R32F),J===i.HALF_FLOAT&&(ue=i.R16F),J===i.UNSIGNED_BYTE&&(ue=i.R8)),C===i.RED_INTEGER&&(J===i.UNSIGNED_BYTE&&(ue=i.R8UI),J===i.UNSIGNED_SHORT&&(ue=i.R16UI),J===i.UNSIGNED_INT&&(ue=i.R32UI),J===i.BYTE&&(ue=i.R8I),J===i.SHORT&&(ue=i.R16I),J===i.INT&&(ue=i.R32I)),C===i.RG&&(J===i.FLOAT&&(ue=i.RG32F),J===i.HALF_FLOAT&&(ue=i.RG16F),J===i.UNSIGNED_BYTE&&(ue=i.RG8)),C===i.RG_INTEGER&&(J===i.UNSIGNED_BYTE&&(ue=i.RG8UI),J===i.UNSIGNED_SHORT&&(ue=i.RG16UI),J===i.UNSIGNED_INT&&(ue=i.RG32UI),J===i.BYTE&&(ue=i.RG8I),J===i.SHORT&&(ue=i.RG16I),J===i.INT&&(ue=i.RG32I)),C===i.RGB_INTEGER&&(J===i.UNSIGNED_BYTE&&(ue=i.RGB8UI),J===i.UNSIGNED_SHORT&&(ue=i.RGB16UI),J===i.UNSIGNED_INT&&(ue=i.RGB32UI),J===i.BYTE&&(ue=i.RGB8I),J===i.SHORT&&(ue=i.RGB16I),J===i.INT&&(ue=i.RGB32I)),C===i.RGBA_INTEGER&&(J===i.UNSIGNED_BYTE&&(ue=i.RGBA8UI),J===i.UNSIGNED_SHORT&&(ue=i.RGBA16UI),J===i.UNSIGNED_INT&&(ue=i.RGBA32UI),J===i.BYTE&&(ue=i.RGBA8I),J===i.SHORT&&(ue=i.RGBA16I),J===i.INT&&(ue=i.RGBA32I)),C===i.RGB&&J===i.UNSIGNED_INT_5_9_9_9_REV&&(ue=i.RGB9_E5),C===i.RGBA){let Ve=ge?bl:ct.getTransfer(he);J===i.FLOAT&&(ue=i.RGBA32F),J===i.HALF_FLOAT&&(ue=i.RGBA16F),J===i.UNSIGNED_BYTE&&(ue=Ve===Mt?i.SRGB8_ALPHA8:i.RGBA8),J===i.UNSIGNED_SHORT_4_4_4_4&&(ue=i.RGBA4),J===i.UNSIGNED_SHORT_5_5_5_1&&(ue=i.RGB5_A1)}return(ue===i.R16F||ue===i.R32F||ue===i.RG16F||ue===i.RG32F||ue===i.RGBA16F||ue===i.RGBA32F)&&e.get("EXT_color_buffer_float"),ue}function _(O,C){let J;return O?C===null||C===Ds||C===os?J=i.DEPTH24_STENCIL8:C===Gt?J=i.DEPTH32F_STENCIL8:C===uo&&(J=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):C===null||C===Ds||C===os?J=i.DEPTH_COMPONENT24:C===Gt?J=i.DEPTH_COMPONENT32F:C===uo&&(J=i.DEPTH_COMPONENT16),J}function D(O,C){return g(O)===!0||O.isFramebufferTexture&&O.minFilter!==Ut&&O.minFilter!==wt?Math.log2(Math.max(C.width,C.height))+1:O.mipmaps!==void 0&&O.mipmaps.length>0?O.mipmaps.length:O.isCompressedTexture&&Array.isArray(O.image)?C.mipmaps.length:1}function I(O){let C=O.target;C.removeEventListener("dispose",I),T(C),C.isVideoTexture&&h.delete(C)}function A(O){let C=O.target;C.removeEventListener("dispose",A),y(C)}function T(O){let C=n.get(O);if(C.__webglInit===void 0)return;let J=O.source,he=d.get(J);if(he){let ge=he[C.__cacheKey];ge.usedTimes--,ge.usedTimes===0&&b(O),Object.keys(he).length===0&&d.delete(J)}n.remove(O)}function b(O){let C=n.get(O);i.deleteTexture(C.__webglTexture);let J=O.source,he=d.get(J);delete he[C.__cacheKey],o.memory.textures--}function y(O){let C=n.get(O);if(O.depthTexture&&(O.depthTexture.dispose(),n.remove(O.depthTexture)),O.isWebGLCubeRenderTarget)for(let he=0;he<6;he++){if(Array.isArray(C.__webglFramebuffer[he]))for(let ge=0;ge<C.__webglFramebuffer[he].length;ge++)i.deleteFramebuffer(C.__webglFramebuffer[he][ge]);else i.deleteFramebuffer(C.__webglFramebuffer[he]);C.__webglDepthbuffer&&i.deleteRenderbuffer(C.__webglDepthbuffer[he])}else{if(Array.isArray(C.__webglFramebuffer))for(let he=0;he<C.__webglFramebuffer.length;he++)i.deleteFramebuffer(C.__webglFramebuffer[he]);else i.deleteFramebuffer(C.__webglFramebuffer);if(C.__webglDepthbuffer&&i.deleteRenderbuffer(C.__webglDepthbuffer),C.__webglMultisampledFramebuffer&&i.deleteFramebuffer(C.__webglMultisampledFramebuffer),C.__webglColorRenderbuffer)for(let he=0;he<C.__webglColorRenderbuffer.length;he++)C.__webglColorRenderbuffer[he]&&i.deleteRenderbuffer(C.__webglColorRenderbuffer[he]);C.__webglDepthRenderbuffer&&i.deleteRenderbuffer(C.__webglDepthRenderbuffer)}let J=O.textures;for(let he=0,ge=J.length;he<ge;he++){let ue=n.get(J[he]);ue.__webglTexture&&(i.deleteTexture(ue.__webglTexture),o.memory.textures--),n.remove(J[he])}n.remove(O)}let E=0;function F(){E=0}function U(){let O=E;return O>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+O+" texture units while this GPU supports only "+s.maxTextures),E+=1,O}function k(O){let C=[];return C.push(O.wrapS),C.push(O.wrapT),C.push(O.wrapR||0),C.push(O.magFilter),C.push(O.minFilter),C.push(O.anisotropy),C.push(O.internalFormat),C.push(O.format),C.push(O.type),C.push(O.generateMipmaps),C.push(O.premultiplyAlpha),C.push(O.flipY),C.push(O.unpackAlignment),C.push(O.colorSpace),C.join()}function G(O,C){let J=n.get(O);if(O.isVideoTexture&&Re(O),O.isRenderTargetTexture===!1&&O.version>0&&J.__version!==O.version){let he=O.image;if(he===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(he.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(J,O,C);return}}t.bindTexture(i.TEXTURE_2D,J.__webglTexture,i.TEXTURE0+C)}function V(O,C){let J=n.get(O);if(O.version>0&&J.__version!==O.version){Y(J,O,C);return}t.bindTexture(i.TEXTURE_2D_ARRAY,J.__webglTexture,i.TEXTURE0+C)}function $(O,C){let J=n.get(O);if(O.version>0&&J.__version!==O.version){Y(J,O,C);return}t.bindTexture(i.TEXTURE_3D,J.__webglTexture,i.TEXTURE0+C)}function X(O,C){let J=n.get(O);if(O.version>0&&J.__version!==O.version){te(J,O,C);return}t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture,i.TEXTURE0+C)}let j={[Wt]:i.REPEAT,[Pn]:i.CLAMP_TO_EDGE,[Ls]:i.MIRRORED_REPEAT},P={[Ut]:i.NEAREST,[Po]:i.NEAREST_MIPMAP_NEAREST,[is]:i.NEAREST_MIPMAP_LINEAR,[wt]:i.LINEAR,[Ps]:i.LINEAR_MIPMAP_NEAREST,[fn]:i.LINEAR_MIPMAP_LINEAR},W={[mg]:i.NEVER,[Mg]:i.ALWAYS,[gg]:i.LESS,[Sp]:i.LEQUAL,[xg]:i.EQUAL,[_g]:i.GEQUAL,[vg]:i.GREATER,[yg]:i.NOTEQUAL};function ee(O,C){if(C.type===Gt&&e.has("OES_texture_float_linear")===!1&&(C.magFilter===wt||C.magFilter===Ps||C.magFilter===is||C.magFilter===fn||C.minFilter===wt||C.minFilter===Ps||C.minFilter===is||C.minFilter===fn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(O,i.TEXTURE_WRAP_S,j[C.wrapS]),i.texParameteri(O,i.TEXTURE_WRAP_T,j[C.wrapT]),(O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY)&&i.texParameteri(O,i.TEXTURE_WRAP_R,j[C.wrapR]),i.texParameteri(O,i.TEXTURE_MAG_FILTER,P[C.magFilter]),i.texParameteri(O,i.TEXTURE_MIN_FILTER,P[C.minFilter]),C.compareFunction&&(i.texParameteri(O,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(O,i.TEXTURE_COMPARE_FUNC,W[C.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(C.magFilter===Ut||C.minFilter!==is&&C.minFilter!==fn||C.type===Gt&&e.has("OES_texture_float_linear")===!1)return;if(C.anisotropy>1||n.get(C).__currentAnisotropy){let J=e.get("EXT_texture_filter_anisotropic");i.texParameterf(O,J.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(C.anisotropy,s.getMaxAnisotropy())),n.get(C).__currentAnisotropy=C.anisotropy}}}function le(O,C){let J=!1;O.__webglInit===void 0&&(O.__webglInit=!0,C.addEventListener("dispose",I));let he=C.source,ge=d.get(he);ge===void 0&&(ge={},d.set(he,ge));let ue=k(C);if(ue!==O.__cacheKey){ge[ue]===void 0&&(ge[ue]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,J=!0),ge[ue].usedTimes++;let Ve=ge[O.__cacheKey];Ve!==void 0&&(ge[O.__cacheKey].usedTimes--,Ve.usedTimes===0&&b(C)),O.__cacheKey=ue,O.__webglTexture=ge[ue].texture}return J}function Y(O,C,J){let he=i.TEXTURE_2D;(C.isDataArrayTexture||C.isCompressedArrayTexture)&&(he=i.TEXTURE_2D_ARRAY),C.isData3DTexture&&(he=i.TEXTURE_3D);let ge=le(O,C),ue=C.source;t.bindTexture(he,O.__webglTexture,i.TEXTURE0+J);let Ve=n.get(ue);if(ue.version!==Ve.__version||ge===!0){t.activeTexture(i.TEXTURE0+J);let Ce=ct.getPrimaries(ct.workingColorSpace),De=C.colorSpace===On?null:ct.getPrimaries(C.colorSpace),nt=C.colorSpace===On||Ce===De?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,C.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,C.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt);let we=v(C.image,!1,s.maxTextureSize);we=Ze(C,we);let He=r.convert(C.format,C.colorSpace),Ge=r.convert(C.type),Xe=S(C.internalFormat,He,Ge,C.colorSpace,C.isVideoTexture);ee(he,C);let ze,et=C.mipmaps,Ye=C.isVideoTexture!==!0,Qe=Ve.__version===void 0||ge===!0,Z=ue.dataReady,re=D(C,we);if(C.isDepthTexture)Xe=_(C.format===as,C.type),Qe&&(Ye?t.texStorage2D(i.TEXTURE_2D,1,Xe,we.width,we.height):t.texImage2D(i.TEXTURE_2D,0,Xe,we.width,we.height,0,He,Ge,null));else if(C.isDataTexture)if(et.length>0){Ye&&Qe&&t.texStorage2D(i.TEXTURE_2D,re,Xe,et[0].width,et[0].height);for(let ae=0,xe=et.length;ae<xe;ae++)ze=et[ae],Ye?Z&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,ze.width,ze.height,He,Ge,ze.data):t.texImage2D(i.TEXTURE_2D,ae,Xe,ze.width,ze.height,0,He,Ge,ze.data);C.generateMipmaps=!1}else Ye?(Qe&&t.texStorage2D(i.TEXTURE_2D,re,Xe,we.width,we.height),Z&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,we.width,we.height,He,Ge,we.data)):t.texImage2D(i.TEXTURE_2D,0,Xe,we.width,we.height,0,He,Ge,we.data);else if(C.isCompressedTexture)if(C.isCompressedArrayTexture){Ye&&Qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,re,Xe,et[0].width,et[0].height,we.depth);for(let ae=0,xe=et.length;ae<xe;ae++)if(ze=et[ae],C.format!==cn)if(He!==null)if(Ye){if(Z)if(C.layerUpdates.size>0){let ke=Fd(ze.width,ze.height,C.format,C.type);for(let Be of C.layerUpdates){let it=ze.data.subarray(Be*ke/ze.data.BYTES_PER_ELEMENT,(Be+1)*ke/ze.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,Be,ze.width,ze.height,1,He,it)}C.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,ze.width,ze.height,we.depth,He,ze.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ae,Xe,ze.width,ze.height,we.depth,0,ze.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ye?Z&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,ze.width,ze.height,we.depth,He,Ge,ze.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ae,Xe,ze.width,ze.height,we.depth,0,He,Ge,ze.data)}else{Ye&&Qe&&t.texStorage2D(i.TEXTURE_2D,re,Xe,et[0].width,et[0].height);for(let ae=0,xe=et.length;ae<xe;ae++)ze=et[ae],C.format!==cn?He!==null?Ye?Z&&t.compressedTexSubImage2D(i.TEXTURE_2D,ae,0,0,ze.width,ze.height,He,ze.data):t.compressedTexImage2D(i.TEXTURE_2D,ae,Xe,ze.width,ze.height,0,ze.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ye?Z&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,ze.width,ze.height,He,Ge,ze.data):t.texImage2D(i.TEXTURE_2D,ae,Xe,ze.width,ze.height,0,He,Ge,ze.data)}else if(C.isDataArrayTexture)if(Ye){if(Qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,re,Xe,we.width,we.height,we.depth),Z)if(C.layerUpdates.size>0){let ae=Fd(we.width,we.height,C.format,C.type);for(let xe of C.layerUpdates){let ke=we.data.subarray(xe*ae/we.data.BYTES_PER_ELEMENT,(xe+1)*ae/we.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,xe,we.width,we.height,1,He,Ge,ke)}C.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,we.width,we.height,we.depth,He,Ge,we.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Xe,we.width,we.height,we.depth,0,He,Ge,we.data);else if(C.isData3DTexture)Ye?(Qe&&t.texStorage3D(i.TEXTURE_3D,re,Xe,we.width,we.height,we.depth),Z&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,we.width,we.height,we.depth,He,Ge,we.data)):t.texImage3D(i.TEXTURE_3D,0,Xe,we.width,we.height,we.depth,0,He,Ge,we.data);else if(C.isFramebufferTexture){if(Qe)if(Ye)t.texStorage2D(i.TEXTURE_2D,re,Xe,we.width,we.height);else{let ae=we.width,xe=we.height;for(let ke=0;ke<re;ke++)t.texImage2D(i.TEXTURE_2D,ke,Xe,ae,xe,0,He,Ge,null),ae>>=1,xe>>=1}}else if(et.length>0){if(Ye&&Qe){let ae=Fe(et[0]);t.texStorage2D(i.TEXTURE_2D,re,Xe,ae.width,ae.height)}for(let ae=0,xe=et.length;ae<xe;ae++)ze=et[ae],Ye?Z&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,He,Ge,ze):t.texImage2D(i.TEXTURE_2D,ae,Xe,He,Ge,ze);C.generateMipmaps=!1}else if(Ye){if(Qe){let ae=Fe(we);t.texStorage2D(i.TEXTURE_2D,re,Xe,ae.width,ae.height)}Z&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,He,Ge,we)}else t.texImage2D(i.TEXTURE_2D,0,Xe,He,Ge,we);g(C)&&m(he),Ve.__version=ue.version,C.onUpdate&&C.onUpdate(C)}O.__version=C.version}function te(O,C,J){if(C.image.length!==6)return;let he=le(O,C),ge=C.source;t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+J);let ue=n.get(ge);if(ge.version!==ue.__version||he===!0){t.activeTexture(i.TEXTURE0+J);let Ve=ct.getPrimaries(ct.workingColorSpace),Ce=C.colorSpace===On?null:ct.getPrimaries(C.colorSpace),De=C.colorSpace===On||Ve===Ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,C.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,C.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,De);let nt=C.isCompressedTexture||C.image[0].isCompressedTexture,we=C.image[0]&&C.image[0].isDataTexture,He=[];for(let xe=0;xe<6;xe++)!nt&&!we?He[xe]=v(C.image[xe],!0,s.maxCubemapSize):He[xe]=we?C.image[xe].image:C.image[xe],He[xe]=Ze(C,He[xe]);let Ge=He[0],Xe=r.convert(C.format,C.colorSpace),ze=r.convert(C.type),et=S(C.internalFormat,Xe,ze,C.colorSpace),Ye=C.isVideoTexture!==!0,Qe=ue.__version===void 0||he===!0,Z=ge.dataReady,re=D(C,Ge);ee(i.TEXTURE_CUBE_MAP,C);let ae;if(nt){Ye&&Qe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,re,et,Ge.width,Ge.height);for(let xe=0;xe<6;xe++){ae=He[xe].mipmaps;for(let ke=0;ke<ae.length;ke++){let Be=ae[ke];C.format!==cn?Xe!==null?Ye?Z&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,ke,0,0,Be.width,Be.height,Xe,Be.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,ke,et,Be.width,Be.height,0,Be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ye?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,ke,0,0,Be.width,Be.height,Xe,ze,Be.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,ke,et,Be.width,Be.height,0,Xe,ze,Be.data)}}}else{if(ae=C.mipmaps,Ye&&Qe){ae.length>0&&re++;let xe=Fe(He[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,re,et,xe.width,xe.height)}for(let xe=0;xe<6;xe++)if(we){Ye?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,0,0,He[xe].width,He[xe].height,Xe,ze,He[xe].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,et,He[xe].width,He[xe].height,0,Xe,ze,He[xe].data);for(let ke=0;ke<ae.length;ke++){let it=ae[ke].image[xe].image;Ye?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,ke+1,0,0,it.width,it.height,Xe,ze,it.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,ke+1,et,it.width,it.height,0,Xe,ze,it.data)}}else{Ye?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,0,0,Xe,ze,He[xe]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,et,Xe,ze,He[xe]);for(let ke=0;ke<ae.length;ke++){let Be=ae[ke];Ye?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,ke+1,0,0,Xe,ze,Be.image[xe]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,ke+1,et,Xe,ze,Be.image[xe])}}}g(C)&&m(i.TEXTURE_CUBE_MAP),ue.__version=ge.version,C.onUpdate&&C.onUpdate(C)}O.__version=C.version}function ne(O,C,J,he,ge,ue){let Ve=r.convert(J.format,J.colorSpace),Ce=r.convert(J.type),De=S(J.internalFormat,Ve,Ce,J.colorSpace),nt=n.get(C),we=n.get(J);if(we.__renderTarget=C,!nt.__hasExternalTextures){let He=Math.max(1,C.width>>ue),Ge=Math.max(1,C.height>>ue);ge===i.TEXTURE_3D||ge===i.TEXTURE_2D_ARRAY?t.texImage3D(ge,ue,De,He,Ge,C.depth,0,Ve,Ce,null):t.texImage2D(ge,ue,De,He,Ge,0,Ve,Ce,null)}t.bindFramebuffer(i.FRAMEBUFFER,O),Oe(C)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,he,ge,we.__webglTexture,0,_e(C)):(ge===i.TEXTURE_2D||ge>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ge<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,he,ge,we.__webglTexture,ue),t.bindFramebuffer(i.FRAMEBUFFER,null)}function q(O,C,J){if(i.bindRenderbuffer(i.RENDERBUFFER,O),C.depthBuffer){let he=C.depthTexture,ge=he&&he.isDepthTexture?he.type:null,ue=_(C.stencilBuffer,ge),Ve=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ce=_e(C);Oe(C)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ce,ue,C.width,C.height):J?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ce,ue,C.width,C.height):i.renderbufferStorage(i.RENDERBUFFER,ue,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ve,i.RENDERBUFFER,O)}else{let he=C.textures;for(let ge=0;ge<he.length;ge++){let ue=he[ge],Ve=r.convert(ue.format,ue.colorSpace),Ce=r.convert(ue.type),De=S(ue.internalFormat,Ve,Ce,ue.colorSpace),nt=_e(C);J&&Oe(C)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,nt,De,C.width,C.height):Oe(C)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,nt,De,C.width,C.height):i.renderbufferStorage(i.RENDERBUFFER,De,C.width,C.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ve(O,C){if(C&&C.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,O),!(C.depthTexture&&C.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let he=n.get(C.depthTexture);he.__renderTarget=C,(!he.__webglTexture||C.depthTexture.image.width!==C.width||C.depthTexture.image.height!==C.height)&&(C.depthTexture.image.width=C.width,C.depthTexture.image.height=C.height,C.depthTexture.needsUpdate=!0),G(C.depthTexture,0);let ge=he.__webglTexture,ue=_e(C);if(C.depthTexture.format===dr)Oe(C)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ge,0,ue):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ge,0);else if(C.depthTexture.format===as)Oe(C)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ge,0,ue):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ge,0);else throw new Error("Unknown depthTexture format")}function Ee(O){let C=n.get(O),J=O.isWebGLCubeRenderTarget===!0;if(C.__boundDepthTexture!==O.depthTexture){let he=O.depthTexture;if(C.__depthDisposeCallback&&C.__depthDisposeCallback(),he){let ge=()=>{delete C.__boundDepthTexture,delete C.__depthDisposeCallback,he.removeEventListener("dispose",ge)};he.addEventListener("dispose",ge),C.__depthDisposeCallback=ge}C.__boundDepthTexture=he}if(O.depthTexture&&!C.__autoAllocateDepthBuffer){if(J)throw new Error("target.depthTexture not supported in Cube render targets");ve(C.__webglFramebuffer,O)}else if(J){C.__webglDepthbuffer=[];for(let he=0;he<6;he++)if(t.bindFramebuffer(i.FRAMEBUFFER,C.__webglFramebuffer[he]),C.__webglDepthbuffer[he]===void 0)C.__webglDepthbuffer[he]=i.createRenderbuffer(),q(C.__webglDepthbuffer[he],O,!1);else{let ge=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=C.__webglDepthbuffer[he];i.bindRenderbuffer(i.RENDERBUFFER,ue),i.framebufferRenderbuffer(i.FRAMEBUFFER,ge,i.RENDERBUFFER,ue)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,C.__webglFramebuffer),C.__webglDepthbuffer===void 0)C.__webglDepthbuffer=i.createRenderbuffer(),q(C.__webglDepthbuffer,O,!1);else{let he=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ge=C.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ge),i.framebufferRenderbuffer(i.FRAMEBUFFER,he,i.RENDERBUFFER,ge)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Le(O,C,J){let he=n.get(O);C!==void 0&&ne(he.__webglFramebuffer,O,O.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),J!==void 0&&Ee(O)}function Je(O){let C=O.texture,J=n.get(O),he=n.get(C);O.addEventListener("dispose",A);let ge=O.textures,ue=O.isWebGLCubeRenderTarget===!0,Ve=ge.length>1;if(Ve||(he.__webglTexture===void 0&&(he.__webglTexture=i.createTexture()),he.__version=C.version,o.memory.textures++),ue){J.__webglFramebuffer=[];for(let Ce=0;Ce<6;Ce++)if(C.mipmaps&&C.mipmaps.length>0){J.__webglFramebuffer[Ce]=[];for(let De=0;De<C.mipmaps.length;De++)J.__webglFramebuffer[Ce][De]=i.createFramebuffer()}else J.__webglFramebuffer[Ce]=i.createFramebuffer()}else{if(C.mipmaps&&C.mipmaps.length>0){J.__webglFramebuffer=[];for(let Ce=0;Ce<C.mipmaps.length;Ce++)J.__webglFramebuffer[Ce]=i.createFramebuffer()}else J.__webglFramebuffer=i.createFramebuffer();if(Ve)for(let Ce=0,De=ge.length;Ce<De;Ce++){let nt=n.get(ge[Ce]);nt.__webglTexture===void 0&&(nt.__webglTexture=i.createTexture(),o.memory.textures++)}if(O.samples>0&&Oe(O)===!1){J.__webglMultisampledFramebuffer=i.createFramebuffer(),J.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,J.__webglMultisampledFramebuffer);for(let Ce=0;Ce<ge.length;Ce++){let De=ge[Ce];J.__webglColorRenderbuffer[Ce]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,J.__webglColorRenderbuffer[Ce]);let nt=r.convert(De.format,De.colorSpace),we=r.convert(De.type),He=S(De.internalFormat,nt,we,De.colorSpace,O.isXRRenderTarget===!0),Ge=_e(O);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ge,He,O.width,O.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ce,i.RENDERBUFFER,J.__webglColorRenderbuffer[Ce])}i.bindRenderbuffer(i.RENDERBUFFER,null),O.depthBuffer&&(J.__webglDepthRenderbuffer=i.createRenderbuffer(),q(J.__webglDepthRenderbuffer,O,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ue){t.bindTexture(i.TEXTURE_CUBE_MAP,he.__webglTexture),ee(i.TEXTURE_CUBE_MAP,C);for(let Ce=0;Ce<6;Ce++)if(C.mipmaps&&C.mipmaps.length>0)for(let De=0;De<C.mipmaps.length;De++)ne(J.__webglFramebuffer[Ce][De],O,C,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Ce,De);else ne(J.__webglFramebuffer[Ce],O,C,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Ce,0);g(C)&&m(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ve){for(let Ce=0,De=ge.length;Ce<De;Ce++){let nt=ge[Ce],we=n.get(nt);t.bindTexture(i.TEXTURE_2D,we.__webglTexture),ee(i.TEXTURE_2D,nt),ne(J.__webglFramebuffer,O,nt,i.COLOR_ATTACHMENT0+Ce,i.TEXTURE_2D,0),g(nt)&&m(i.TEXTURE_2D)}t.unbindTexture()}else{let Ce=i.TEXTURE_2D;if((O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(Ce=O.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Ce,he.__webglTexture),ee(Ce,C),C.mipmaps&&C.mipmaps.length>0)for(let De=0;De<C.mipmaps.length;De++)ne(J.__webglFramebuffer[De],O,C,i.COLOR_ATTACHMENT0,Ce,De);else ne(J.__webglFramebuffer,O,C,i.COLOR_ATTACHMENT0,Ce,0);g(C)&&m(Ce),t.unbindTexture()}O.depthBuffer&&Ee(O)}function fe(O){let C=O.textures;for(let J=0,he=C.length;J<he;J++){let ge=C[J];if(g(ge)){let ue=w(O),Ve=n.get(ge).__webglTexture;t.bindTexture(ue,Ve),m(ue),t.unbindTexture()}}}let me=[],z=[];function Ne(O){if(O.samples>0){if(Oe(O)===!1){let C=O.textures,J=O.width,he=O.height,ge=i.COLOR_BUFFER_BIT,ue=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ve=n.get(O),Ce=C.length>1;if(Ce)for(let De=0;De<C.length;De++)t.bindFramebuffer(i.FRAMEBUFFER,Ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ve.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ve.__webglFramebuffer);for(let De=0;De<C.length;De++){if(O.resolveDepthBuffer&&(O.depthBuffer&&(ge|=i.DEPTH_BUFFER_BIT),O.stencilBuffer&&O.resolveStencilBuffer&&(ge|=i.STENCIL_BUFFER_BIT)),Ce){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ve.__webglColorRenderbuffer[De]);let nt=n.get(C[De]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,nt,0)}i.blitFramebuffer(0,0,J,he,0,0,J,he,ge,i.NEAREST),l===!0&&(me.length=0,z.length=0,me.push(i.COLOR_ATTACHMENT0+De),O.depthBuffer&&O.resolveDepthBuffer===!1&&(me.push(ue),z.push(ue),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,z)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,me))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Ce)for(let De=0;De<C.length;De++){t.bindFramebuffer(i.FRAMEBUFFER,Ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.RENDERBUFFER,Ve.__webglColorRenderbuffer[De]);let nt=n.get(C[De]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.TEXTURE_2D,nt,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ve.__webglMultisampledFramebuffer)}else if(O.depthBuffer&&O.resolveDepthBuffer===!1&&l){let C=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[C])}}}function _e(O){return Math.min(s.maxSamples,O.samples)}function Oe(O){let C=n.get(O);return O.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&C.__useRenderToTexture!==!1}function Re(O){let C=o.render.frame;h.get(O)!==C&&(h.set(O,C),O.update())}function Ze(O,C){let J=O.colorSpace,he=O.format,ge=O.type;return O.isCompressedTexture===!0||O.isVideoTexture===!0||J!==kt&&J!==On&&(ct.getTransfer(J)===Mt?(he!==cn||ge!==Oi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",J)),C}function Fe(O){return typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement?(c.width=O.naturalWidth||O.width,c.height=O.naturalHeight||O.height):typeof VideoFrame<"u"&&O instanceof VideoFrame?(c.width=O.displayWidth,c.height=O.displayHeight):(c.width=O.width,c.height=O.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=F,this.setTexture2D=G,this.setTexture2DArray=V,this.setTexture3D=$,this.setTextureCube=X,this.rebindTextures=Le,this.setupRenderTarget=Je,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=Ne,this.setupDepthRenderbuffer=Ee,this.setupFrameBufferTexture=ne,this.useMultisampledRTT=Oe}function I_(i,e){function t(n,s=On){let r,o=ct.getTransfer(s);if(n===Oi)return i.UNSIGNED_BYTE;if(n===ou)return i.UNSIGNED_SHORT_4_4_4_4;if(n===au)return i.UNSIGNED_SHORT_5_5_5_1;if(n===pp)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===fp)return i.BYTE;if(n===dp)return i.SHORT;if(n===uo)return i.UNSIGNED_SHORT;if(n===ru)return i.INT;if(n===Ds)return i.UNSIGNED_INT;if(n===Gt)return i.FLOAT;if(n===Bt)return i.HALF_FLOAT;if(n===mp)return i.ALPHA;if(n===gp)return i.RGB;if(n===cn)return i.RGBA;if(n===xp)return i.LUMINANCE;if(n===vp)return i.LUMINANCE_ALPHA;if(n===dr)return i.DEPTH_COMPONENT;if(n===as)return i.DEPTH_STENCIL;if(n===ks)return i.RED;if(n===lu)return i.RED_INTEGER;if(n===yp)return i.RG;if(n===cu)return i.RG_INTEGER;if(n===hu)return i.RGBA_INTEGER;if(n===Oa||n===Fa||n===Ba||n===ka)if(o===Mt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Oa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Fa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ba)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ka)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Oa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Fa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ba)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ka)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Vc||n===Gc||n===Wc||n===Xc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Vc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Gc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Wc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Xc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Yc||n===qc||n===Zc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Yc||n===qc)return o===Mt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Zc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Kc||n===jc||n===Jc||n===Qc||n===$c||n===eh||n===th||n===nh||n===ih||n===sh||n===rh||n===oh||n===ah||n===lh)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Kc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===jc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Jc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Qc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===$c)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===eh)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===th)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===nh)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ih)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===sh)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===rh)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===oh)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ah)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===lh)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===za||n===ch||n===hh)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===za)return o===Mt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ch)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===hh)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===_p||n===uh||n===fh||n===dh)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===za)return r.COMPRESSED_RED_RGTC1_EXT;if(n===uh)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===fh)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===dh)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===os?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Rh=class extends Yt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Ct=class extends At{constructor(){super(),this.isGroup=!0,this.type="Group"}},P_={type:"move"},oo=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ct,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ct,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ct,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let v of e.hand.values()){let g=t.getJointPose(v,n),m=this._getHandJoint(c,v);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,x=.005;c.inputState.pinching&&d>p+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(P_)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ct;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},L_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,D_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Ch=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let s=new Ht,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ft({vertexShader:L_,fragmentShader:D_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new mt(new dn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ih=class extends Fi{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,p=null,x=null,v=new Ch,g=t.getContextAttributes(),m=null,w=null,S=[],_=[],D=new pe,I=null,A=new Yt;A.viewport=new yt;let T=new Yt;T.viewport=new yt;let b=[A,T],y=new Rh,E=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let te=S[Y];return te===void 0&&(te=new oo,S[Y]=te),te.getTargetRaySpace()},this.getControllerGrip=function(Y){let te=S[Y];return te===void 0&&(te=new oo,S[Y]=te),te.getGripSpace()},this.getHand=function(Y){let te=S[Y];return te===void 0&&(te=new oo,S[Y]=te),te.getHandSpace()};function U(Y){let te=_.indexOf(Y.inputSource);if(te===-1)return;let ne=S[te];ne!==void 0&&(ne.update(Y.inputSource,Y.frame,c||o),ne.dispatchEvent({type:Y.type,data:Y.inputSource}))}function k(){s.removeEventListener("select",U),s.removeEventListener("selectstart",U),s.removeEventListener("selectend",U),s.removeEventListener("squeeze",U),s.removeEventListener("squeezestart",U),s.removeEventListener("squeezeend",U),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",G);for(let Y=0;Y<S.length;Y++){let te=_[Y];te!==null&&(_[Y]=null,S[Y].disconnect(te))}E=null,F=null,v.reset(),e.setRenderTarget(m),p=null,d=null,u=null,s=null,w=null,le.stop(),n.isPresenting=!1,e.setPixelRatio(I),e.setSize(D.width,D.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(m=e.getRenderTarget(),s.addEventListener("select",U),s.addEventListener("selectstart",U),s.addEventListener("selectend",U),s.addEventListener("squeeze",U),s.addEventListener("squeezestart",U),s.addEventListener("squeezeend",U),s.addEventListener("end",k),s.addEventListener("inputsourceschange",G),g.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(D),s.renderState.layers===void 0){let te={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,te),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),w=new sn(p.framebufferWidth,p.framebufferHeight,{format:cn,type:Oi,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let te=null,ne=null,q=null;g.depth&&(q=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=g.stencil?as:dr,ne=g.stencil?os:Ds);let ve={colorFormat:t.RGBA8,depthFormat:q,scaleFactor:r};u=new XRWebGLBinding(s,t),d=u.createProjectionLayer(ve),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),w=new sn(d.textureWidth,d.textureHeight,{format:cn,type:Oi,depthTexture:new br(d.textureWidth,d.textureHeight,ne,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),le.setContext(s),le.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function G(Y){for(let te=0;te<Y.removed.length;te++){let ne=Y.removed[te],q=_.indexOf(ne);q>=0&&(_[q]=null,S[q].disconnect(ne))}for(let te=0;te<Y.added.length;te++){let ne=Y.added[te],q=_.indexOf(ne);if(q===-1){for(let Ee=0;Ee<S.length;Ee++)if(Ee>=_.length){_.push(ne),q=Ee;break}else if(_[Ee]===null){_[Ee]=ne,q=Ee;break}if(q===-1)break}let ve=S[q];ve&&ve.connect(ne)}}let V=new B,$=new B;function X(Y,te,ne){V.setFromMatrixPosition(te.matrixWorld),$.setFromMatrixPosition(ne.matrixWorld);let q=V.distanceTo($),ve=te.projectionMatrix.elements,Ee=ne.projectionMatrix.elements,Le=ve[14]/(ve[10]-1),Je=ve[14]/(ve[10]+1),fe=(ve[9]+1)/ve[5],me=(ve[9]-1)/ve[5],z=(ve[8]-1)/ve[0],Ne=(Ee[8]+1)/Ee[0],_e=Le*z,Oe=Le*Ne,Re=q/(-z+Ne),Ze=Re*-z;if(te.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(Ze),Y.translateZ(Re),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),ve[10]===-1)Y.projectionMatrix.copy(te.projectionMatrix),Y.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{let Fe=Le+Re,O=Je+Re,C=_e-Ze,J=Oe+(q-Ze),he=fe*Je/O*Fe,ge=me*Je/O*Fe;Y.projectionMatrix.makePerspective(C,J,he,ge,Fe,O),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function j(Y,te){te===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(te.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let te=Y.near,ne=Y.far;v.texture!==null&&(v.depthNear>0&&(te=v.depthNear),v.depthFar>0&&(ne=v.depthFar)),y.near=T.near=A.near=te,y.far=T.far=A.far=ne,(E!==y.near||F!==y.far)&&(s.updateRenderState({depthNear:y.near,depthFar:y.far}),E=y.near,F=y.far),A.layers.mask=Y.layers.mask|2,T.layers.mask=Y.layers.mask|4,y.layers.mask=A.layers.mask|T.layers.mask;let q=Y.parent,ve=y.cameras;j(y,q);for(let Ee=0;Ee<ve.length;Ee++)j(ve[Ee],q);ve.length===2?X(y,A,T):y.projectionMatrix.copy(A.projectionMatrix),P(Y,y,q)};function P(Y,te,ne){ne===null?Y.matrix.copy(te.matrixWorld):(Y.matrix.copy(ne.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(te.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(te.projectionMatrix),Y.projectionMatrixInverse.copy(te.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=yr*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(Y){l=Y,d!==null&&(d.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(y)};let W=null;function ee(Y,te){if(h=te.getViewerPose(c||o),x=te,h!==null){let ne=h.views;p!==null&&(e.setRenderTargetFramebuffer(w,p.framebuffer),e.setRenderTarget(w));let q=!1;ne.length!==y.cameras.length&&(y.cameras.length=0,q=!0);for(let Ee=0;Ee<ne.length;Ee++){let Le=ne[Ee],Je=null;if(p!==null)Je=p.getViewport(Le);else{let me=u.getViewSubImage(d,Le);Je=me.viewport,Ee===0&&(e.setRenderTargetTextures(w,me.colorTexture,d.ignoreDepthValues?void 0:me.depthStencilTexture),e.setRenderTarget(w))}let fe=b[Ee];fe===void 0&&(fe=new Yt,fe.layers.enable(Ee),fe.viewport=new yt,b[Ee]=fe),fe.matrix.fromArray(Le.transform.matrix),fe.matrix.decompose(fe.position,fe.quaternion,fe.scale),fe.projectionMatrix.fromArray(Le.projectionMatrix),fe.projectionMatrixInverse.copy(fe.projectionMatrix).invert(),fe.viewport.set(Je.x,Je.y,Je.width,Je.height),Ee===0&&(y.matrix.copy(fe.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),q===!0&&y.cameras.push(fe)}let ve=s.enabledFeatures;if(ve&&ve.includes("depth-sensing")){let Ee=u.getDepthInformation(ne[0]);Ee&&Ee.isValid&&Ee.texture&&v.init(e,Ee,s.renderState)}}for(let ne=0;ne<S.length;ne++){let q=_[ne],ve=S[ne];q!==null&&ve!==void 0&&ve.update(q,te,c||o)}W&&W(Y,te),te.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:te}),x=null}let le=new Ap;le.setAnimationLoop(ee),this.setAnimationLoop=function(Y){W=Y},this.dispose=function(){}}},Es=new mi,N_=new je;function U_(i,e){function t(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function n(g,m){m.color.getRGB(g.fogColor.value,Tp(i)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function s(g,m,w,S,_){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(g,m):m.isMeshToonMaterial?(r(g,m),u(g,m)):m.isMeshPhongMaterial?(r(g,m),h(g,m)):m.isMeshStandardMaterial?(r(g,m),d(g,m),m.isMeshPhysicalMaterial&&p(g,m,_)):m.isMeshMatcapMaterial?(r(g,m),x(g,m)):m.isMeshDepthMaterial?r(g,m):m.isMeshDistanceMaterial?(r(g,m),v(g,m)):m.isMeshNormalMaterial?r(g,m):m.isLineBasicMaterial?(o(g,m),m.isLineDashedMaterial&&a(g,m)):m.isPointsMaterial?l(g,m,w,S):m.isSpriteMaterial?c(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,t(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===yn&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,t(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===yn&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,t(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,t(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);let w=e.get(m),S=w.envMap,_=w.envMapRotation;S&&(g.envMap.value=S,Es.copy(_),Es.x*=-1,Es.y*=-1,Es.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(Es.y*=-1,Es.z*=-1),g.envMapRotation.value.setFromMatrix4(N_.makeRotationFromEuler(Es)),g.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,g.aoMapTransform))}function o(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform))}function a(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function l(g,m,w,S){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*w,g.scale.value=S*.5,m.map&&(g.map.value=m.map,t(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function c(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function h(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function u(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function d(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function p(g,m,w){g.ior.value=m.ior,m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===yn&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=w.texture,g.transmissionSamplerSize.value.set(w.width,w.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,g.specularIntensityMapTransform))}function x(g,m){m.matcap&&(g.matcap.value=m.matcap)}function v(g,m){let w=e.get(m).light;g.referencePosition.value.setFromMatrixPosition(w.matrixWorld),g.nearDistance.value=w.shadow.camera.near,g.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function O_(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(w,S){let _=S.program;n.uniformBlockBinding(w,_)}function c(w,S){let _=s[w.id];_===void 0&&(x(w),_=h(w),s[w.id]=_,w.addEventListener("dispose",g));let D=S.program;n.updateUBOMapping(w,D);let I=e.render.frame;r[w.id]!==I&&(d(w),r[w.id]=I)}function h(w){let S=u();w.__bindingPointIndex=S;let _=i.createBuffer(),D=w.__size,I=w.usage;return i.bindBuffer(i.UNIFORM_BUFFER,_),i.bufferData(i.UNIFORM_BUFFER,D,I),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,S,_),_}function u(){for(let w=0;w<a;w++)if(o.indexOf(w)===-1)return o.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(w){let S=s[w.id],_=w.uniforms,D=w.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let I=0,A=_.length;I<A;I++){let T=Array.isArray(_[I])?_[I]:[_[I]];for(let b=0,y=T.length;b<y;b++){let E=T[b];if(p(E,I,b,D)===!0){let F=E.__offset,U=Array.isArray(E.value)?E.value:[E.value],k=0;for(let G=0;G<U.length;G++){let V=U[G],$=v(V);typeof V=="number"||typeof V=="boolean"?(E.__data[0]=V,i.bufferSubData(i.UNIFORM_BUFFER,F+k,E.__data)):V.isMatrix3?(E.__data[0]=V.elements[0],E.__data[1]=V.elements[1],E.__data[2]=V.elements[2],E.__data[3]=0,E.__data[4]=V.elements[3],E.__data[5]=V.elements[4],E.__data[6]=V.elements[5],E.__data[7]=0,E.__data[8]=V.elements[6],E.__data[9]=V.elements[7],E.__data[10]=V.elements[8],E.__data[11]=0):(V.toArray(E.__data,k),k+=$.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,F,E.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(w,S,_,D){let I=w.value,A=S+"_"+_;if(D[A]===void 0)return typeof I=="number"||typeof I=="boolean"?D[A]=I:D[A]=I.clone(),!0;{let T=D[A];if(typeof I=="number"||typeof I=="boolean"){if(T!==I)return D[A]=I,!0}else if(T.equals(I)===!1)return T.copy(I),!0}return!1}function x(w){let S=w.uniforms,_=0,D=16;for(let A=0,T=S.length;A<T;A++){let b=Array.isArray(S[A])?S[A]:[S[A]];for(let y=0,E=b.length;y<E;y++){let F=b[y],U=Array.isArray(F.value)?F.value:[F.value];for(let k=0,G=U.length;k<G;k++){let V=U[k],$=v(V),X=_%D,j=X%$.boundary,P=X+j;_+=j,P!==0&&D-P<$.storage&&(_+=D-P),F.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=_,_+=$.storage}}}let I=_%D;return I>0&&(_+=D-I),w.__size=_,w.__cache={},this}function v(w){let S={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(S.boundary=4,S.storage=4):w.isVector2?(S.boundary=8,S.storage=8):w.isVector3||w.isColor?(S.boundary=16,S.storage=12):w.isVector4?(S.boundary=16,S.storage=16):w.isMatrix3?(S.boundary=48,S.storage=48):w.isMatrix4?(S.boundary=64,S.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),S}function g(w){let S=w.target;S.removeEventListener("dispose",g);let _=o.indexOf(S.__bindingPointIndex);o.splice(_,1),i.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function m(){for(let w in s)i.deleteBuffer(s[w]);o=[],s={},r={}}return{bind:l,update:c,dispose:m}}var qa=class{constructor(e={}){let{canvas:t=Bg(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let x=new Uint32Array(4),v=new Int32Array(4),g=null,m=null,w=[],S=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=pt,this.toneMapping=rs,this.toneMappingExposure=1;let _=this,D=!1,I=0,A=0,T=null,b=-1,y=null,E=new yt,F=new yt,U=null,k=new We(0),G=0,V=t.width,$=t.height,X=1,j=null,P=null,W=new yt(0,0,V,$),ee=new yt(0,0,V,$),le=!1,Y=new mo,te=!1,ne=!1,q=new je,ve=new je,Ee=new B,Le=new yt,Je={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},fe=!1;function me(){return T===null?X:1}let z=n;function Ne(f,M){return t.getContext(f,M)}try{let f={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",xe,!1),t.addEventListener("webglcontextrestored",ke,!1),t.addEventListener("webglcontextcreationerror",Be,!1),z===null){let M="webgl2";if(z=Ne(M,f),z===null)throw Ne(M)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(f){throw console.error("THREE.WebGLRenderer: "+f.message),f}let _e,Oe,Re,Ze,Fe,O,C,J,he,ge,ue,Ve,Ce,De,nt,we,He,Ge,Xe,ze,et,Ye,Qe,Z;function re(){_e=new Qv(z),_e.init(),Ye=new I_(z,_e),Oe=new Yv(z,_e,e,Ye),Re=new E_(z,_e),Oe.reverseDepthBuffer&&d&&Re.buffers.depth.setReversed(!0),Ze=new ty(z),Fe=new p_,O=new C_(z,_e,Re,Fe,Oe,Ye,Ze),C=new Zv(_),J=new Jv(_),he=new l0(z),Qe=new Wv(z,he),ge=new $v(z,he,Ze,Qe),ue=new iy(z,ge,he,Ze),Xe=new ny(z,Oe,O),we=new qv(Fe),Ve=new d_(_,C,J,_e,Oe,Qe,we),Ce=new U_(_,Fe),De=new g_,nt=new S_(_e),Ge=new Gv(_,C,J,Re,ue,p,l),He=new T_(_,ue,Oe),Z=new O_(z,Ze,Oe,Re),ze=new Xv(z,_e,Ze),et=new ey(z,_e,Ze),Ze.programs=Ve.programs,_.capabilities=Oe,_.extensions=_e,_.properties=Fe,_.renderLists=De,_.shadowMap=He,_.state=Re,_.info=Ze}re();let ae=new Ih(_,z);this.xr=ae,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let f=_e.get("WEBGL_lose_context");f&&f.loseContext()},this.forceContextRestore=function(){let f=_e.get("WEBGL_lose_context");f&&f.restoreContext()},this.getPixelRatio=function(){return X},this.setPixelRatio=function(f){f!==void 0&&(X=f,this.setSize(V,$,!1))},this.getSize=function(f){return f.set(V,$)},this.setSize=function(f,M,R=!0){if(ae.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=f,$=M,t.width=Math.floor(f*X),t.height=Math.floor(M*X),R===!0&&(t.style.width=f+"px",t.style.height=M+"px"),this.setViewport(0,0,f,M)},this.getDrawingBufferSize=function(f){return f.set(V*X,$*X).floor()},this.setDrawingBufferSize=function(f,M,R){V=f,$=M,X=R,t.width=Math.floor(f*R),t.height=Math.floor(M*R),this.setViewport(0,0,f,M)},this.getCurrentViewport=function(f){return f.copy(E)},this.getViewport=function(f){return f.copy(W)},this.setViewport=function(f,M,R,L){f.isVector4?W.set(f.x,f.y,f.z,f.w):W.set(f,M,R,L),Re.viewport(E.copy(W).multiplyScalar(X).round())},this.getScissor=function(f){return f.copy(ee)},this.setScissor=function(f,M,R,L){f.isVector4?ee.set(f.x,f.y,f.z,f.w):ee.set(f,M,R,L),Re.scissor(F.copy(ee).multiplyScalar(X).round())},this.getScissorTest=function(){return le},this.setScissorTest=function(f){Re.setScissorTest(le=f)},this.setOpaqueSort=function(f){j=f},this.setTransparentSort=function(f){P=f},this.getClearColor=function(f){return f.copy(Ge.getClearColor())},this.setClearColor=function(){Ge.setClearColor.apply(Ge,arguments)},this.getClearAlpha=function(){return Ge.getClearAlpha()},this.setClearAlpha=function(){Ge.setClearAlpha.apply(Ge,arguments)},this.clear=function(f=!0,M=!0,R=!0){let L=0;if(f){let N=!1;if(T!==null){let H=T.texture.format;N=H===hu||H===cu||H===lu}if(N){let H=T.texture.type,K=H===Oi||H===Ds||H===uo||H===os||H===ou||H===au,oe=Ge.getClearColor(),Q=Ge.getClearAlpha(),ie=oe.r,se=oe.g,ce=oe.b;K?(x[0]=ie,x[1]=se,x[2]=ce,x[3]=Q,z.clearBufferuiv(z.COLOR,0,x)):(v[0]=ie,v[1]=se,v[2]=ce,v[3]=Q,z.clearBufferiv(z.COLOR,0,v))}else L|=z.COLOR_BUFFER_BIT}M&&(L|=z.DEPTH_BUFFER_BIT),R&&(L|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(L)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",xe,!1),t.removeEventListener("webglcontextrestored",ke,!1),t.removeEventListener("webglcontextcreationerror",Be,!1),De.dispose(),nt.dispose(),Fe.dispose(),C.dispose(),J.dispose(),ue.dispose(),Qe.dispose(),Z.dispose(),Ve.dispose(),ae.dispose(),ae.removeEventListener("sessionstart",ta),ae.removeEventListener("sessionend",na),wi.stop()};function xe(f){f.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function ke(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;let f=Ze.autoReset,M=He.enabled,R=He.autoUpdate,L=He.needsUpdate,N=He.type;re(),Ze.autoReset=f,He.enabled=M,He.autoUpdate=R,He.needsUpdate=L,He.type=N}function Be(f){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",f.statusMessage)}function it(f){let M=f.target;M.removeEventListener("dispose",it),Dt(M)}function Dt(f){jt(f),Fe.remove(f)}function jt(f){let M=Fe.get(f).programs;M!==void 0&&(M.forEach(function(R){Ve.releaseProgram(R)}),f.isShaderMaterial&&Ve.releaseShaderCache(f))}this.renderBufferDirect=function(f,M,R,L,N,H){M===null&&(M=Je);let K=N.isMesh&&N.matrixWorld.determinant()<0,oe=jl(f,M,R,L,N);Re.setMaterial(L,K);let Q=R.index,ie=1;if(L.wireframe===!0){if(Q=ge.getWireframeAttribute(R),Q===void 0)return;ie=2}let se=R.drawRange,ce=R.attributes.position,be=se.start*ie,Te=(se.start+se.count)*ie;H!==null&&(be=Math.max(be,H.start*ie),Te=Math.min(Te,(H.start+H.count)*ie)),Q!==null?(be=Math.max(be,0),Te=Math.min(Te,Q.count)):ce!=null&&(be=Math.max(be,0),Te=Math.min(Te,ce.count));let Pe=Te-be;if(Pe<0||Pe===1/0)return;Qe.setup(N,L,oe,R,Q);let Ie,Ae=ze;if(Q!==null&&(Ie=he.get(Q),Ae=et,Ae.setIndex(Ie)),N.isMesh)L.wireframe===!0?(Re.setLineWidth(L.wireframeLinewidth*me()),Ae.setMode(z.LINES)):Ae.setMode(z.TRIANGLES);else if(N.isLine){let Se=L.linewidth;Se===void 0&&(Se=1),Re.setLineWidth(Se*me()),N.isLineSegments?Ae.setMode(z.LINES):N.isLineLoop?Ae.setMode(z.LINE_LOOP):Ae.setMode(z.LINE_STRIP)}else N.isPoints?Ae.setMode(z.POINTS):N.isSprite&&Ae.setMode(z.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)Ae.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(_e.get("WEBGL_multi_draw"))Ae.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{let Se=N._multiDrawStarts,at=N._multiDrawCounts,Ke=N._multiDrawCount,Pt=Q?he.get(Q).bytesPerElement:1,gt=Fe.get(L).currentProgram.getUniforms();for(let $e=0;$e<Ke;$e++)gt.setValue(z,"_gl_DrawID",$e),Ae.render(Se[$e]/Pt,at[$e])}else if(N.isInstancedMesh)Ae.renderInstances(be,Pe,N.count);else if(R.isInstancedBufferGeometry){let Se=R._maxInstanceCount!==void 0?R._maxInstanceCount:1/0,at=Math.min(R.instanceCount,Se);Ae.renderInstances(be,Pe,at)}else Ae.render(be,Pe)};function xt(f,M,R){f.transparent===!0&&f.side===Nt&&f.forceSinglePass===!1?(f.side=yn,f.needsUpdate=!0,Zs(f,M,R),f.side=Bn,f.needsUpdate=!0,Zs(f,M,R),f.side=Nt):Zs(f,M,R)}this.compile=function(f,M,R=null){R===null&&(R=f),m=nt.get(R),m.init(M),S.push(m),R.traverseVisible(function(N){N.isLight&&N.layers.test(M.layers)&&(m.pushLight(N),N.castShadow&&m.pushShadow(N))}),f!==R&&f.traverseVisible(function(N){N.isLight&&N.layers.test(M.layers)&&(m.pushLight(N),N.castShadow&&m.pushShadow(N))}),m.setupLights();let L=new Set;return f.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;let H=N.material;if(H)if(Array.isArray(H))for(let K=0;K<H.length;K++){let oe=H[K];xt(oe,R,N),L.add(oe)}else xt(H,R,N),L.add(H)}),S.pop(),m=null,L},this.compileAsync=function(f,M,R=null){let L=this.compile(f,M,R);return new Promise(N=>{function H(){if(L.forEach(function(K){Fe.get(K).currentProgram.isReady()&&L.delete(K)}),L.size===0){N(f);return}setTimeout(H,10)}_e.get("KHR_parallel_shader_compile")!==null?H():setTimeout(H,10)})};let En=null;function Qn(f){En&&En(f)}function ta(){wi.stop()}function na(){wi.start()}let wi=new Ap;wi.setAnimationLoop(Qn),typeof self<"u"&&wi.setContext(self),this.setAnimationLoop=function(f){En=f,ae.setAnimationLoop(f),f===null?wi.stop():wi.start()},ae.addEventListener("sessionstart",ta),ae.addEventListener("sessionend",na),this.render=function(f,M){if(M!==void 0&&M.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(f.matrixWorldAutoUpdate===!0&&f.updateMatrixWorld(),M.parent===null&&M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),ae.enabled===!0&&ae.isPresenting===!0&&(ae.cameraAutoUpdate===!0&&ae.updateCamera(M),M=ae.getCamera()),f.isScene===!0&&f.onBeforeRender(_,f,M,T),m=nt.get(f,S.length),m.init(M),S.push(m),ve.multiplyMatrices(M.projectionMatrix,M.matrixWorldInverse),Y.setFromProjectionMatrix(ve),ne=this.localClippingEnabled,te=we.init(this.clippingPlanes,ne),g=De.get(f,w.length),g.init(),w.push(g),ae.enabled===!0&&ae.isPresenting===!0){let H=_.xr.getDepthSensingMesh();H!==null&&Wr(H,M,-1/0,_.sortObjects)}Wr(f,M,0,_.sortObjects),g.finish(),_.sortObjects===!0&&g.sort(j,P),fe=ae.enabled===!1||ae.isPresenting===!1||ae.hasDepthSensing()===!1,fe&&Ge.addToRenderList(g,f),this.info.render.frame++,te===!0&&we.beginShadows();let R=m.state.shadowsArray;He.render(R,f,M),te===!0&&we.endShadows(),this.info.autoReset===!0&&this.info.reset();let L=g.opaque,N=g.transmissive;if(m.setupLights(),M.isArrayCamera){let H=M.cameras;if(N.length>0)for(let K=0,oe=H.length;K<oe;K++){let Q=H[K];ia(L,N,f,Q)}fe&&Ge.render(f);for(let K=0,oe=H.length;K<oe;K++){let Q=H[K];Xr(g,f,Q,Q.viewport)}}else N.length>0&&ia(L,N,f,M),fe&&Ge.render(f),Xr(g,f,M);T!==null&&(O.updateMultisampleRenderTarget(T),O.updateRenderTargetMipmap(T)),f.isScene===!0&&f.onAfterRender(_,f,M),Qe.resetDefaultState(),b=-1,y=null,S.pop(),S.length>0?(m=S[S.length-1],te===!0&&we.setGlobalState(_.clippingPlanes,m.state.camera)):m=null,w.pop(),w.length>0?g=w[w.length-1]:g=null};function Wr(f,M,R,L){if(f.visible===!1)return;if(f.layers.test(M.layers)){if(f.isGroup)R=f.renderOrder;else if(f.isLOD)f.autoUpdate===!0&&f.update(M);else if(f.isLight)m.pushLight(f),f.castShadow&&m.pushShadow(f);else if(f.isSprite){if(!f.frustumCulled||Y.intersectsSprite(f)){L&&Le.setFromMatrixPosition(f.matrixWorld).applyMatrix4(ve);let K=ue.update(f),oe=f.material;oe.visible&&g.push(f,K,oe,R,Le.z,null)}}else if((f.isMesh||f.isLine||f.isPoints)&&(!f.frustumCulled||Y.intersectsObject(f))){let K=ue.update(f),oe=f.material;if(L&&(f.boundingSphere!==void 0?(f.boundingSphere===null&&f.computeBoundingSphere(),Le.copy(f.boundingSphere.center)):(K.boundingSphere===null&&K.computeBoundingSphere(),Le.copy(K.boundingSphere.center)),Le.applyMatrix4(f.matrixWorld).applyMatrix4(ve)),Array.isArray(oe)){let Q=K.groups;for(let ie=0,se=Q.length;ie<se;ie++){let ce=Q[ie],be=oe[ce.materialIndex];be&&be.visible&&g.push(f,K,be,R,Le.z,ce)}}else oe.visible&&g.push(f,K,oe,R,Le.z,null)}}let H=f.children;for(let K=0,oe=H.length;K<oe;K++)Wr(H[K],M,R,L)}function Xr(f,M,R,L){let N=f.opaque,H=f.transmissive,K=f.transparent;m.setupLightsView(R),te===!0&&we.setGlobalState(_.clippingPlanes,R),L&&Re.viewport(E.copy(L)),N.length>0&&qs(N,M,R),H.length>0&&qs(H,M,R),K.length>0&&qs(K,M,R),Re.buffers.depth.setTest(!0),Re.buffers.depth.setMask(!0),Re.buffers.color.setMask(!0),Re.setPolygonOffset(!1)}function ia(f,M,R,L){if((R.isScene===!0?R.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[L.id]===void 0&&(m.state.transmissionRenderTarget[L.id]=new sn(1,1,{generateMipmaps:!0,type:_e.has("EXT_color_buffer_half_float")||_e.has("EXT_color_buffer_float")?Bt:Oi,minFilter:fn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ct.workingColorSpace}));let H=m.state.transmissionRenderTarget[L.id],K=L.viewport||E;H.setSize(K.z,K.w);let oe=_.getRenderTarget();_.setRenderTarget(H),_.getClearColor(k),G=_.getClearAlpha(),G<1&&_.setClearColor(16777215,.5),_.clear(),fe&&Ge.render(R);let Q=_.toneMapping;_.toneMapping=rs;let ie=L.viewport;if(L.viewport!==void 0&&(L.viewport=void 0),m.setupLightsView(L),te===!0&&we.setGlobalState(_.clippingPlanes,L),qs(f,R,L),O.updateMultisampleRenderTarget(H),O.updateRenderTargetMipmap(H),_e.has("WEBGL_multisampled_render_to_texture")===!1){let se=!1;for(let ce=0,be=M.length;ce<be;ce++){let Te=M[ce],Pe=Te.object,Ie=Te.geometry,Ae=Te.material,Se=Te.group;if(Ae.side===Nt&&Pe.layers.test(L.layers)){let at=Ae.side;Ae.side=yn,Ae.needsUpdate=!0,sa(Pe,R,L,Ie,Ae,Se),Ae.side=at,Ae.needsUpdate=!0,se=!0}}se===!0&&(O.updateMultisampleRenderTarget(H),O.updateRenderTargetMipmap(H))}_.setRenderTarget(oe),_.setClearColor(k,G),ie!==void 0&&(L.viewport=ie),_.toneMapping=Q}function qs(f,M,R){let L=M.isScene===!0?M.overrideMaterial:null;for(let N=0,H=f.length;N<H;N++){let K=f[N],oe=K.object,Q=K.geometry,ie=L===null?K.material:L,se=K.group;oe.layers.test(R.layers)&&sa(oe,M,R,Q,ie,se)}}function sa(f,M,R,L,N,H){f.onBeforeRender(_,M,R,L,N,H),f.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,f.matrixWorld),f.normalMatrix.getNormalMatrix(f.modelViewMatrix),N.onBeforeRender(_,M,R,L,f,H),N.transparent===!0&&N.side===Nt&&N.forceSinglePass===!1?(N.side=yn,N.needsUpdate=!0,_.renderBufferDirect(R,M,L,N,f,H),N.side=Bn,N.needsUpdate=!0,_.renderBufferDirect(R,M,L,N,f,H),N.side=Nt):_.renderBufferDirect(R,M,L,N,f,H),f.onAfterRender(_,M,R,L,N,H)}function Zs(f,M,R){M.isScene!==!0&&(M=Je);let L=Fe.get(f),N=m.state.lights,H=m.state.shadowsArray,K=N.state.version,oe=Ve.getParameters(f,N.state,H,M,R),Q=Ve.getProgramCacheKey(oe),ie=L.programs;L.environment=f.isMeshStandardMaterial?M.environment:null,L.fog=M.fog,L.envMap=(f.isMeshStandardMaterial?J:C).get(f.envMap||L.environment),L.envMapRotation=L.environment!==null&&f.envMap===null?M.environmentRotation:f.envMapRotation,ie===void 0&&(f.addEventListener("dispose",it),ie=new Map,L.programs=ie);let se=ie.get(Q);if(se!==void 0){if(L.currentProgram===se&&L.lightsStateVersion===K)return qr(f,oe),se}else oe.uniforms=Ve.getUniforms(f),f.onBeforeCompile(oe,_),se=Ve.acquireProgram(oe,Q),ie.set(Q,se),L.uniforms=oe.uniforms;let ce=L.uniforms;return(!f.isShaderMaterial&&!f.isRawShaderMaterial||f.clipping===!0)&&(ce.clippingPlanes=we.uniform),qr(f,oe),L.needsLights=ji(f),L.lightsStateVersion=K,L.needsLights&&(ce.ambientLightColor.value=N.state.ambient,ce.lightProbe.value=N.state.probe,ce.directionalLights.value=N.state.directional,ce.directionalLightShadows.value=N.state.directionalShadow,ce.spotLights.value=N.state.spot,ce.spotLightShadows.value=N.state.spotShadow,ce.rectAreaLights.value=N.state.rectArea,ce.ltc_1.value=N.state.rectAreaLTC1,ce.ltc_2.value=N.state.rectAreaLTC2,ce.pointLights.value=N.state.point,ce.pointLightShadows.value=N.state.pointShadow,ce.hemisphereLights.value=N.state.hemi,ce.directionalShadowMap.value=N.state.directionalShadowMap,ce.directionalShadowMatrix.value=N.state.directionalShadowMatrix,ce.spotShadowMap.value=N.state.spotShadowMap,ce.spotLightMatrix.value=N.state.spotLightMatrix,ce.spotLightMap.value=N.state.spotLightMap,ce.pointShadowMap.value=N.state.pointShadowMap,ce.pointShadowMatrix.value=N.state.pointShadowMatrix),L.currentProgram=se,L.uniformsList=null,se}function Yr(f){if(f.uniformsList===null){let M=f.currentProgram.getUniforms();f.uniformsList=mr.seqWithValue(M.seq,f.uniforms)}return f.uniformsList}function qr(f,M){let R=Fe.get(f);R.outputColorSpace=M.outputColorSpace,R.batching=M.batching,R.batchingColor=M.batchingColor,R.instancing=M.instancing,R.instancingColor=M.instancingColor,R.instancingMorph=M.instancingMorph,R.skinning=M.skinning,R.morphTargets=M.morphTargets,R.morphNormals=M.morphNormals,R.morphColors=M.morphColors,R.morphTargetsCount=M.morphTargetsCount,R.numClippingPlanes=M.numClippingPlanes,R.numIntersection=M.numClipIntersection,R.vertexAlphas=M.vertexAlphas,R.vertexTangents=M.vertexTangents,R.toneMapping=M.toneMapping}function jl(f,M,R,L,N){M.isScene!==!0&&(M=Je),O.resetTextureUnits();let H=M.fog,K=L.isMeshStandardMaterial?M.environment:null,oe=T===null?_.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:kt,Q=(L.isMeshStandardMaterial?J:C).get(L.envMap||K),ie=L.vertexColors===!0&&!!R.attributes.color&&R.attributes.color.itemSize===4,se=!!R.attributes.tangent&&(!!L.normalMap||L.anisotropy>0),ce=!!R.morphAttributes.position,be=!!R.morphAttributes.normal,Te=!!R.morphAttributes.color,Pe=rs;L.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(Pe=_.toneMapping);let Ie=R.morphAttributes.position||R.morphAttributes.normal||R.morphAttributes.color,Ae=Ie!==void 0?Ie.length:0,Se=Fe.get(L),at=m.state.lights;if(te===!0&&(ne===!0||f!==y)){let ot=f===y&&L.id===b;we.setState(L,f,ot)}let Ke=!1;L.version===Se.__version?(Se.needsLights&&Se.lightsStateVersion!==at.state.version||Se.outputColorSpace!==oe||N.isBatchedMesh&&Se.batching===!1||!N.isBatchedMesh&&Se.batching===!0||N.isBatchedMesh&&Se.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Se.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Se.instancing===!1||!N.isInstancedMesh&&Se.instancing===!0||N.isSkinnedMesh&&Se.skinning===!1||!N.isSkinnedMesh&&Se.skinning===!0||N.isInstancedMesh&&Se.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Se.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Se.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Se.instancingMorph===!1&&N.morphTexture!==null||Se.envMap!==Q||L.fog===!0&&Se.fog!==H||Se.numClippingPlanes!==void 0&&(Se.numClippingPlanes!==we.numPlanes||Se.numIntersection!==we.numIntersection)||Se.vertexAlphas!==ie||Se.vertexTangents!==se||Se.morphTargets!==ce||Se.morphNormals!==be||Se.morphColors!==Te||Se.toneMapping!==Pe||Se.morphTargetsCount!==Ae)&&(Ke=!0):(Ke=!0,Se.__version=L.version);let Pt=Se.currentProgram;Ke===!0&&(Pt=Zs(L,M,N));let gt=!1,$e=!1,Lt=!1,lt=Pt.getUniforms(),St=Se.uniforms;if(Re.useProgram(Pt.program)&&(gt=!0,$e=!0,Lt=!0),L.id!==b&&(b=L.id,$e=!0),gt||y!==f){Re.buffers.depth.getReversed()?(q.copy(f.projectionMatrix),zg(q),Hg(q),lt.setValue(z,"projectionMatrix",q)):lt.setValue(z,"projectionMatrix",f.projectionMatrix),lt.setValue(z,"viewMatrix",f.matrixWorldInverse);let Jt=lt.map.cameraPosition;Jt!==void 0&&Jt.setValue(z,Ee.setFromMatrixPosition(f.matrixWorld)),Oe.logarithmicDepthBuffer&&lt.setValue(z,"logDepthBufFC",2/(Math.log(f.far+1)/Math.LN2)),(L.isMeshPhongMaterial||L.isMeshToonMaterial||L.isMeshLambertMaterial||L.isMeshBasicMaterial||L.isMeshStandardMaterial||L.isShaderMaterial)&&lt.setValue(z,"isOrthographic",f.isOrthographicCamera===!0),y!==f&&(y=f,$e=!0,Lt=!0)}if(N.isSkinnedMesh){lt.setOptional(z,N,"bindMatrix"),lt.setOptional(z,N,"bindMatrixInverse");let ot=N.skeleton;ot&&(ot.boneTexture===null&&ot.computeBoneTexture(),lt.setValue(z,"boneTexture",ot.boneTexture,O))}N.isBatchedMesh&&(lt.setOptional(z,N,"batchingTexture"),lt.setValue(z,"batchingTexture",N._matricesTexture,O),lt.setOptional(z,N,"batchingIdTexture"),lt.setValue(z,"batchingIdTexture",N._indirectTexture,O),lt.setOptional(z,N,"batchingColorTexture"),N._colorsTexture!==null&&lt.setValue(z,"batchingColorTexture",N._colorsTexture,O));let dt=R.morphAttributes;if((dt.position!==void 0||dt.normal!==void 0||dt.color!==void 0)&&Xe.update(N,R,Pt),($e||Se.receiveShadow!==N.receiveShadow)&&(Se.receiveShadow=N.receiveShadow,lt.setValue(z,"receiveShadow",N.receiveShadow)),L.isMeshGouraudMaterial&&L.envMap!==null&&(St.envMap.value=Q,St.flipEnvMap.value=Q.isCubeTexture&&Q.isRenderTargetTexture===!1?-1:1),L.isMeshStandardMaterial&&L.envMap===null&&M.environment!==null&&(St.envMapIntensity.value=M.environmentIntensity),$e&&(lt.setValue(z,"toneMappingExposure",_.toneMappingExposure),Se.needsLights&&Ti(St,Lt),H&&L.fog===!0&&Ce.refreshFogUniforms(St,H),Ce.refreshMaterialUniforms(St,L,X,$,m.state.transmissionRenderTarget[f.id]),mr.upload(z,Yr(Se),St,O)),L.isShaderMaterial&&L.uniformsNeedUpdate===!0&&(mr.upload(z,Yr(Se),St,O),L.uniformsNeedUpdate=!1),L.isSpriteMaterial&&lt.setValue(z,"center",N.center),lt.setValue(z,"modelViewMatrix",N.modelViewMatrix),lt.setValue(z,"normalMatrix",N.normalMatrix),lt.setValue(z,"modelMatrix",N.matrixWorld),L.isShaderMaterial||L.isRawShaderMaterial){let ot=L.uniformsGroups;for(let Jt=0,vn=ot.length;Jt<vn;Jt++){let Rn=ot[Jt];Z.update(Rn,Pt),Z.bind(Rn,Pt)}}return Pt}function Ti(f,M){f.ambientLightColor.needsUpdate=M,f.lightProbe.needsUpdate=M,f.directionalLights.needsUpdate=M,f.directionalLightShadows.needsUpdate=M,f.pointLights.needsUpdate=M,f.pointLightShadows.needsUpdate=M,f.spotLights.needsUpdate=M,f.spotLightShadows.needsUpdate=M,f.rectAreaLights.needsUpdate=M,f.hemisphereLights.needsUpdate=M}function ji(f){return f.isMeshLambertMaterial||f.isMeshToonMaterial||f.isMeshPhongMaterial||f.isMeshStandardMaterial||f.isShadowMaterial||f.isShaderMaterial&&f.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(f,M,R){Fe.get(f.texture).__webglTexture=M,Fe.get(f.depthTexture).__webglTexture=R;let L=Fe.get(f);L.__hasExternalTextures=!0,L.__autoAllocateDepthBuffer=R===void 0,L.__autoAllocateDepthBuffer||_e.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),L.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(f,M){let R=Fe.get(f);R.__webglFramebuffer=M,R.__useDefaultFramebuffer=M===void 0},this.setRenderTarget=function(f,M=0,R=0){T=f,I=M,A=R;let L=!0,N=null,H=!1,K=!1;if(f){let Q=Fe.get(f);if(Q.__useDefaultFramebuffer!==void 0)Re.bindFramebuffer(z.FRAMEBUFFER,null),L=!1;else if(Q.__webglFramebuffer===void 0)O.setupRenderTarget(f);else if(Q.__hasExternalTextures)O.rebindTextures(f,Fe.get(f.texture).__webglTexture,Fe.get(f.depthTexture).__webglTexture);else if(f.depthBuffer){let ce=f.depthTexture;if(Q.__boundDepthTexture!==ce){if(ce!==null&&Fe.has(ce)&&(f.width!==ce.image.width||f.height!==ce.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");O.setupDepthRenderbuffer(f)}}let ie=f.texture;(ie.isData3DTexture||ie.isDataArrayTexture||ie.isCompressedArrayTexture)&&(K=!0);let se=Fe.get(f).__webglFramebuffer;f.isWebGLCubeRenderTarget?(Array.isArray(se[M])?N=se[M][R]:N=se[M],H=!0):f.samples>0&&O.useMultisampledRTT(f)===!1?N=Fe.get(f).__webglMultisampledFramebuffer:Array.isArray(se)?N=se[R]:N=se,E.copy(f.viewport),F.copy(f.scissor),U=f.scissorTest}else E.copy(W).multiplyScalar(X).floor(),F.copy(ee).multiplyScalar(X).floor(),U=le;if(Re.bindFramebuffer(z.FRAMEBUFFER,N)&&L&&Re.drawBuffers(f,N),Re.viewport(E),Re.scissor(F),Re.setScissorTest(U),H){let Q=Fe.get(f.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+M,Q.__webglTexture,R)}else if(K){let Q=Fe.get(f.texture),ie=M||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,Q.__webglTexture,R||0,ie)}b=-1},this.readRenderTargetPixels=function(f,M,R,L,N,H,K){if(!(f&&f.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let oe=Fe.get(f).__webglFramebuffer;if(f.isWebGLCubeRenderTarget&&K!==void 0&&(oe=oe[K]),oe){Re.bindFramebuffer(z.FRAMEBUFFER,oe);try{let Q=f.texture,ie=Q.format,se=Q.type;if(!Oe.textureFormatReadable(ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Oe.textureTypeReadable(se)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}M>=0&&M<=f.width-L&&R>=0&&R<=f.height-N&&z.readPixels(M,R,L,N,Ye.convert(ie),Ye.convert(se),H)}finally{let Q=T!==null?Fe.get(T).__webglFramebuffer:null;Re.bindFramebuffer(z.FRAMEBUFFER,Q)}}},this.readRenderTargetPixelsAsync=async function(f,M,R,L,N,H,K){if(!(f&&f.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let oe=Fe.get(f).__webglFramebuffer;if(f.isWebGLCubeRenderTarget&&K!==void 0&&(oe=oe[K]),oe){let Q=f.texture,ie=Q.format,se=Q.type;if(!Oe.textureFormatReadable(ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Oe.textureTypeReadable(se))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(M>=0&&M<=f.width-L&&R>=0&&R<=f.height-N){Re.bindFramebuffer(z.FRAMEBUFFER,oe);let ce=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,ce),z.bufferData(z.PIXEL_PACK_BUFFER,H.byteLength,z.STREAM_READ),z.readPixels(M,R,L,N,Ye.convert(ie),Ye.convert(se),0);let be=T!==null?Fe.get(T).__webglFramebuffer:null;Re.bindFramebuffer(z.FRAMEBUFFER,be);let Te=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await kg(z,Te,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,ce),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,H),z.deleteBuffer(ce),z.deleteSync(Te),H}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(f,M=null,R=0){f.isTexture!==!0&&(no("WebGLRenderer: copyFramebufferToTexture function signature has changed."),M=arguments[0]||null,f=arguments[1]);let L=Math.pow(2,-R),N=Math.floor(f.image.width*L),H=Math.floor(f.image.height*L),K=M!==null?M.x:0,oe=M!==null?M.y:0;O.setTexture2D(f,0),z.copyTexSubImage2D(z.TEXTURE_2D,R,0,0,K,oe,N,H),Re.unbindTexture()},this.copyTextureToTexture=function(f,M,R=null,L=null,N=0){f.isTexture!==!0&&(no("WebGLRenderer: copyTextureToTexture function signature has changed."),L=arguments[0]||null,f=arguments[1],M=arguments[2],N=arguments[3]||0,R=null);let H,K,oe,Q,ie,se,ce,be,Te,Pe=f.isCompressedTexture?f.mipmaps[N]:f.image;R!==null?(H=R.max.x-R.min.x,K=R.max.y-R.min.y,oe=R.isBox3?R.max.z-R.min.z:1,Q=R.min.x,ie=R.min.y,se=R.isBox3?R.min.z:0):(H=Pe.width,K=Pe.height,oe=Pe.depth||1,Q=0,ie=0,se=0),L!==null?(ce=L.x,be=L.y,Te=L.z):(ce=0,be=0,Te=0);let Ie=Ye.convert(M.format),Ae=Ye.convert(M.type),Se;M.isData3DTexture?(O.setTexture3D(M,0),Se=z.TEXTURE_3D):M.isDataArrayTexture||M.isCompressedArrayTexture?(O.setTexture2DArray(M,0),Se=z.TEXTURE_2D_ARRAY):(O.setTexture2D(M,0),Se=z.TEXTURE_2D),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,M.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,M.unpackAlignment);let at=z.getParameter(z.UNPACK_ROW_LENGTH),Ke=z.getParameter(z.UNPACK_IMAGE_HEIGHT),Pt=z.getParameter(z.UNPACK_SKIP_PIXELS),gt=z.getParameter(z.UNPACK_SKIP_ROWS),$e=z.getParameter(z.UNPACK_SKIP_IMAGES);z.pixelStorei(z.UNPACK_ROW_LENGTH,Pe.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Pe.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,Q),z.pixelStorei(z.UNPACK_SKIP_ROWS,ie),z.pixelStorei(z.UNPACK_SKIP_IMAGES,se);let Lt=f.isDataArrayTexture||f.isData3DTexture,lt=M.isDataArrayTexture||M.isData3DTexture;if(f.isRenderTargetTexture||f.isDepthTexture){let St=Fe.get(f),dt=Fe.get(M),ot=Fe.get(St.__renderTarget),Jt=Fe.get(dt.__renderTarget);Re.bindFramebuffer(z.READ_FRAMEBUFFER,ot.__webglFramebuffer),Re.bindFramebuffer(z.DRAW_FRAMEBUFFER,Jt.__webglFramebuffer);for(let vn=0;vn<oe;vn++)Lt&&z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Fe.get(f).__webglTexture,N,se+vn),f.isDepthTexture?(lt&&z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Fe.get(M).__webglTexture,N,Te+vn),z.blitFramebuffer(Q,ie,H,K,ce,be,H,K,z.DEPTH_BUFFER_BIT,z.NEAREST)):lt?z.copyTexSubImage3D(Se,N,ce,be,Te+vn,Q,ie,H,K):z.copyTexSubImage2D(Se,N,ce,be,Te+vn,Q,ie,H,K);Re.bindFramebuffer(z.READ_FRAMEBUFFER,null),Re.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else lt?f.isDataTexture||f.isData3DTexture?z.texSubImage3D(Se,N,ce,be,Te,H,K,oe,Ie,Ae,Pe.data):M.isCompressedArrayTexture?z.compressedTexSubImage3D(Se,N,ce,be,Te,H,K,oe,Ie,Pe.data):z.texSubImage3D(Se,N,ce,be,Te,H,K,oe,Ie,Ae,Pe):f.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,N,ce,be,H,K,Ie,Ae,Pe.data):f.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,N,ce,be,Pe.width,Pe.height,Ie,Pe.data):z.texSubImage2D(z.TEXTURE_2D,N,ce,be,H,K,Ie,Ae,Pe);z.pixelStorei(z.UNPACK_ROW_LENGTH,at),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Ke),z.pixelStorei(z.UNPACK_SKIP_PIXELS,Pt),z.pixelStorei(z.UNPACK_SKIP_ROWS,gt),z.pixelStorei(z.UNPACK_SKIP_IMAGES,$e),N===0&&M.generateMipmaps&&z.generateMipmap(Se),Re.unbindTexture()},this.copyTextureToTexture3D=function(f,M,R=null,L=null,N=0){return f.isTexture!==!0&&(no("WebGLRenderer: copyTextureToTexture3D function signature has changed."),R=arguments[0]||null,L=arguments[1]||null,f=arguments[2],M=arguments[3],N=arguments[4]||0),no('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(f,M,R,L,N)},this.initRenderTarget=function(f){Fe.get(f).__webglFramebuffer===void 0&&O.setupRenderTarget(f)},this.initTexture=function(f){f.isCubeTexture?O.setTextureCube(f,0):f.isData3DTexture?O.setTexture3D(f,0):f.isDataArrayTexture||f.isCompressedArrayTexture?O.setTexture2DArray(f,0):O.setTexture2D(f,0),Re.unbindTexture()},this.resetState=function(){I=0,A=0,T=null,Re.reset(),Qe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ni}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=ct._getDrawingBufferColorSpace(e),t.unpackColorSpace=ct._getUnpackColorSpace()}};var Za=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new We(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ns=class extends At{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new mi,this.environmentIntensity=1,this.environmentRotation=new mi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},go=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ph,this.updateRanges=[],this.version=0,this.uuid=Fn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Fn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Fn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},hn=new B,xo=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.applyMatrix4(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.applyNormalMatrix(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.transformDirection(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=ii(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=bt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ii(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ii(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ii(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ii(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=bt(t,this.array),n=bt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=bt(t,this.array),n=bt(n,this.array),s=bt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=bt(t,this.array),n=bt(n,this.array),s=bt(s,this.array),r=bt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Tt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}};var Bd=new B,kd=new yt,zd=new yt,F_=new B,Hd=new je,Aa=new B,wc=new Ln,Vd=new je,Tc=new Bi,Ka=class extends mt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Hf,this.bindMatrix=new je,this.bindMatrixInverse=new je,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new kn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Aa),this.boundingBox.expandByPoint(Aa)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Ln),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Aa),this.boundingSphere.expandByPoint(Aa)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),wc.copy(this.boundingSphere),wc.applyMatrix4(s),e.ray.intersectsSphere(wc)!==!1&&(Vd.copy(s).invert(),Tc.copy(e.ray).applyMatrix4(Vd),!(this.boundingBox!==null&&Tc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Tc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new yt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Hf?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===hg?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;kd.fromBufferAttribute(s.attributes.skinIndex,e),zd.fromBufferAttribute(s.attributes.skinWeight,e),Bd.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=zd.getComponent(r);if(o!==0){let a=kd.getComponent(r);Hd.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(F_.copy(Bd).applyMatrix4(Hd),o)}}return t.applyMatrix4(this.bindMatrixInverse)}},vo=class extends At{constructor(){super(),this.isBone=!0,this.type="Bone"}},ki=class extends Ht{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Ut,h=Ut,u,d){super(null,o,a,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Gd=new je,B_=new je,ja=class i{constructor(e=[],t=[]){this.uuid=Fn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new je)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new je;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:B_;Gd.multiplyMatrices(a,t[r]),Gd.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new ki(t,e,e,cn,Gt);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new vo),this.bones.push(o),this.boneInverses.push(new je().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}},Us=class extends Tt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},cr=new je,Wd=new je,Ea=[],Xd=new kn,k_=new je,Qr=new mt,$r=new Ln,Hn=class extends mt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Us(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,k_)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new kn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,cr),Xd.copy(e.boundingBox).applyMatrix4(cr),this.boundingBox.union(Xd)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ln),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,cr),$r.copy(e.boundingSphere).applyMatrix4(cr),this.boundingSphere.union($r)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Qr.geometry=this.geometry,Qr.material=this.material,Qr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),$r.copy(this.boundingSphere),$r.applyMatrix4(n),e.ray.intersectsSphere($r)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,cr),Wd.multiplyMatrices(n,cr),Qr.matrixWorld=Wd,Qr.raycast(e,Ea);for(let o=0,a=Ea.length;o<a;o++){let l=Ea[o];l.instanceId=r,l.object=this,t.push(l)}Ea.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Us(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new ki(new Float32Array(s*this.count),s,this.count,ks,Gt));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var yo=class extends _n{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new We(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Ja=new B,Qa=new B,Yd=new je,eo=new Bi,Ra=new Ln,Ac=new B,qd=new B,wr=class extends At{constructor(e=new Et,t=new yo){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Ja.fromBufferAttribute(t,s-1),Qa.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Ja.distanceTo(Qa);e.setAttribute("lineDistance",new rt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ra.copy(n.boundingSphere),Ra.applyMatrix4(s),Ra.radius+=r,e.ray.intersectsSphere(Ra)===!1)return;Yd.copy(s).invert(),eo.copy(e.ray).applyMatrix4(Yd);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let p=Math.max(0,o.start),x=Math.min(h.count,o.start+o.count);for(let v=p,g=x-1;v<g;v+=c){let m=h.getX(v),w=h.getX(v+1),S=Ca(this,e,eo,l,m,w);S&&t.push(S)}if(this.isLineLoop){let v=h.getX(x-1),g=h.getX(p),m=Ca(this,e,eo,l,v,g);m&&t.push(m)}}else{let p=Math.max(0,o.start),x=Math.min(d.count,o.start+o.count);for(let v=p,g=x-1;v<g;v+=c){let m=Ca(this,e,eo,l,v,v+1);m&&t.push(m)}if(this.isLineLoop){let v=Ca(this,e,eo,l,x-1,p);v&&t.push(v)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Ca(i,e,t,n,s,r){let o=i.geometry.attributes.position;if(Ja.fromBufferAttribute(o,s),Qa.fromBufferAttribute(o,r),t.distanceSqToSegment(Ja,Qa,Ac,qd)>n)return;Ac.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(Ac);if(!(l<e.near||l>e.far))return{distance:l,point:qd.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}var Zd=new B,Kd=new B,$a=class extends wr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Zd.fromBufferAttribute(t,s),Kd.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Zd.distanceTo(Kd);e.setAttribute("lineDistance",new rt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},el=class extends wr{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},_o=class extends _n{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new We(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},jd=new je,Ph=new Bi,Ia=new Ln,Pa=new B,tl=class extends At{constructor(e=new Et,t=new _o){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ia.copy(n.boundingSphere),Ia.applyMatrix4(s),Ia.radius+=r,e.ray.intersectsSphere(Ia)===!1)return;jd.copy(s).invert(),Ph.copy(e.ray).applyMatrix4(jd);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,u=n.attributes.position;if(c!==null){let d=Math.max(0,o.start),p=Math.min(c.count,o.start+o.count);for(let x=d,v=p;x<v;x++){let g=c.getX(x);Pa.fromBufferAttribute(u,g),Jd(Pa,g,l,s,e,t,this)}}else{let d=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let x=d,v=p;x<v;x++)Pa.fromBufferAttribute(u,x),Jd(Pa,x,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Jd(i,e,t,n,s,r,o){let a=Ph.distanceSqToPoint(i);if(a<t){let l=new B;Ph.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var Tr=class extends Ht{constructor(e,t,n,s,r,o,a,l,c,h,u,d){super(null,o,a,l,c,h,s,r,u,d),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}};var pn=class extends Ht{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Vn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),s=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let h=n[s],d=n[s+1]-h,p=(o-h)/d;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new pe:new B);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new B,s=[],r=[],o=[],a=new B,l=new je;for(let p=0;p<=e;p++){let x=p/e;s[p]=this.getTangentAt(x,new B)}r[0]=new B,o[0]=new B;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(s[p-1],s[p]),a.length()>Number.EPSILON){a.normalize();let x=Math.acos(Vt(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(a,x))}o[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(Vt(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(p=-p);for(let x=1;x<=e;x++)r[x].applyMatrix4(l.makeRotationAxis(s[x],p*x)),o[x].crossVectors(s[x],r[x])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Mo=class extends Vn{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new pe){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*u+this.aX,c=d*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Lh=class extends Mo{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function pu(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,p=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,p*=h,s(o,a,d,p)},calc:function(r){let o=r*r,a=o*r;return i+e*r+t*o+n*a}}}var La=new B,Ec=new pu,Rc=new pu,Cc=new pu,So=class extends Vn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new B){let n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(La.subVectors(s[0],s[1]).add(s[0]),c=La);let u=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(La.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=La),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,x=Math.pow(c.distanceToSquared(u),p),v=Math.pow(u.distanceToSquared(d),p),g=Math.pow(d.distanceToSquared(h),p);v<1e-4&&(v=1),x<1e-4&&(x=v),g<1e-4&&(g=v),Ec.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,x,v,g),Rc.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,x,v,g),Cc.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,x,v,g)}else this.curveType==="catmullrom"&&(Ec.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Rc.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Cc.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Ec.calc(l),Rc.calc(l),Cc.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new B().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Qd(i,e,t,n,s){let r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function z_(i,e){let t=1-i;return t*t*e}function H_(i,e){return 2*(1-i)*i*e}function V_(i,e){return i*i*e}function ao(i,e,t,n){return z_(i,e)+H_(i,t)+V_(i,n)}function G_(i,e){let t=1-i;return t*t*t*e}function W_(i,e){let t=1-i;return 3*t*t*i*e}function X_(i,e){return 3*(1-i)*i*i*e}function Y_(i,e){return i*i*i*e}function lo(i,e,t,n,s){return G_(i,e)+W_(i,t)+X_(i,n)+Y_(i,s)}var nl=class extends Vn{constructor(e=new pe,t=new pe,n=new pe,s=new pe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new pe){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(lo(e,s.x,r.x,o.x,a.x),lo(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Dh=class extends Vn{constructor(e=new B,t=new B,n=new B,s=new B){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new B){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(lo(e,s.x,r.x,o.x,a.x),lo(e,s.y,r.y,o.y,a.y),lo(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},il=class extends Vn{constructor(e=new pe,t=new pe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new pe){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new pe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Nh=class extends Vn{constructor(e=new B,t=new B){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new B){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new B){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},sl=class extends Vn{constructor(e=new pe,t=new pe,n=new pe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new pe){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(ao(e,s.x,r.x,o.x),ao(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},rl=class extends Vn{constructor(e=new B,t=new B,n=new B){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new B){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(ao(e,s.x,r.x,o.x),ao(e,s.y,r.y,o.y),ao(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ol=class extends Vn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new pe){let n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(Qd(a,l.x,c.x,h.x,u.x),Qd(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new pe().fromArray(s))}return this}},al=Object.freeze({__proto__:null,ArcCurve:Lh,CatmullRomCurve3:So,CubicBezierCurve:nl,CubicBezierCurve3:Dh,EllipseCurve:Mo,LineCurve:il,LineCurve3:Nh,QuadraticBezierCurve:sl,QuadraticBezierCurve3:rl,SplineCurve:ol}),Uh=class extends Vn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new al[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new al[s.type]().fromJSON(s))}return this}},ll=class extends Uh{constructor(e){super(),this.type="Path",this.currentPoint=new pe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new il(this.currentPoint.clone(),new pe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new sl(this.currentPoint.clone(),new pe(e,t),new pe(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){let a=new nl(this.currentPoint.clone(),new pe(e,t),new pe(n,s),new pe(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new ol(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){let c=new Mo(e,t,n,s,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},bo=class i extends Et{constructor(e=[new pe(0,-.5),new pe(.5,0),new pe(0,.5)],t=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:s},t=Math.floor(t),s=Vt(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/t,u=new B,d=new pe,p=new B,x=new B,v=new B,g=0,m=0;for(let w=0;w<=e.length-1;w++)switch(w){case 0:g=e[w+1].x-e[w].x,m=e[w+1].y-e[w].y,p.x=m*1,p.y=-g,p.z=m*0,v.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case e.length-1:l.push(v.x,v.y,v.z);break;default:g=e[w+1].x-e[w].x,m=e[w+1].y-e[w].y,p.x=m*1,p.y=-g,p.z=m*0,x.copy(p),p.x+=v.x,p.y+=v.y,p.z+=v.z,p.normalize(),l.push(p.x,p.y,p.z),v.copy(x)}for(let w=0;w<=t;w++){let S=n+w*h*s,_=Math.sin(S),D=Math.cos(S);for(let I=0;I<=e.length-1;I++){u.x=e[I].x*_,u.y=e[I].y,u.z=e[I].x*D,o.push(u.x,u.y,u.z),d.x=w/t,d.y=I/(e.length-1),a.push(d.x,d.y);let A=l[3*I+0]*_,T=l[3*I+1],b=l[3*I+0]*D;c.push(A,T,b)}}for(let w=0;w<t;w++)for(let S=0;S<e.length-1;S++){let _=S+w*e.length,D=_,I=_+e.length,A=_+e.length+1,T=_+1;r.push(D,I,T),r.push(A,T,I)}this.setIndex(r),this.setAttribute("position",new rt(o,3)),this.setAttribute("uv",new rt(a,2)),this.setAttribute("normal",new rt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var gi=class i extends Et{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],p=[],x=0,v=[],g=n/2,m=0;w(),o===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new rt(u,3)),this.setAttribute("normal",new rt(d,3)),this.setAttribute("uv",new rt(p,2));function w(){let _=new B,D=new B,I=0,A=(t-e)/n;for(let T=0;T<=r;T++){let b=[],y=T/r,E=y*(t-e)+e;for(let F=0;F<=s;F++){let U=F/s,k=U*l+a,G=Math.sin(k),V=Math.cos(k);D.x=E*G,D.y=-y*n+g,D.z=E*V,u.push(D.x,D.y,D.z),_.set(G,A,V).normalize(),d.push(_.x,_.y,_.z),p.push(U,1-y),b.push(x++)}v.push(b)}for(let T=0;T<s;T++)for(let b=0;b<r;b++){let y=v[b][T],E=v[b+1][T],F=v[b+1][T+1],U=v[b][T+1];(e>0||b!==0)&&(h.push(y,E,U),I+=3),(t>0||b!==r-1)&&(h.push(E,F,U),I+=3)}c.addGroup(m,I,0),m+=I}function S(_){let D=x,I=new pe,A=new B,T=0,b=_===!0?e:t,y=_===!0?1:-1;for(let F=1;F<=s;F++)u.push(0,g*y,0),d.push(0,y,0),p.push(.5,.5),x++;let E=x;for(let F=0;F<=s;F++){let k=F/s*l+a,G=Math.cos(k),V=Math.sin(k);A.x=b*V,A.y=g*y,A.z=b*G,u.push(A.x,A.y,A.z),d.push(0,y,0),I.x=G*.5+.5,I.y=V*.5*y+.5,p.push(I.x,I.y),x++}for(let F=0;F<s;F++){let U=D+F,k=E+F;_===!0?h.push(k,k+1,U):h.push(k+1,k,U),T+=3}c.addGroup(m,T,_===!0?1:2),m+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var wo=class extends ll{constructor(e){super(e),this.uuid=Fn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new ll().fromJSON(s))}return this}},q_={triangulate:function(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=Pp(i,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c,h,u,d,p;if(n&&(r=Q_(i,e,r,t)),i.length>80*t){a=c=i[0],l=h=i[1];for(let x=t;x<s;x+=t)u=i[x],d=i[x+1],u<a&&(a=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);p=Math.max(c-a,h-l),p=p!==0?32767/p:0}return To(r,o,t,a,l,p,0),o}};function Pp(i,e,t,n,s){let r,o;if(s===cM(i,e,t,n)>0)for(r=e;r<t;r+=n)o=$d(r,i[r],i[r+1],o);else for(r=t-n;r>=e;r-=n)o=$d(r,i[r],i[r+1],o);return o&&Tl(o,o.next)&&(Eo(o),o=o.next),o}function Os(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Tl(t,t.next)||Ot(t.prev,t,t.next)===0)){if(Eo(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function To(i,e,t,n,s,r,o){if(!i)return;!o&&r&&iM(i,n,s,r);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,r?K_(i,n,s,r):Z_(i)){e.push(l.i/t|0),e.push(i.i/t|0),e.push(c.i/t|0),Eo(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=j_(Os(i),e,t),To(i,e,t,n,s,r,2)):o===2&&J_(i,e,t,n,s,r):To(Os(i),e,t,n,s,r,1);break}}}function Z_(i){let e=i.prev,t=i,n=i.next;if(Ot(e,t,n)>=0)return!1;let s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,h=s<r?s<o?s:o:r<o?r:o,u=a<l?a<c?a:c:l<c?l:c,d=s>r?s>o?s:o:r>o?r:o,p=a>l?a>c?a:c:l>c?l:c,x=n.next;for(;x!==e;){if(x.x>=h&&x.x<=d&&x.y>=u&&x.y<=p&&ur(s,a,r,l,o,c,x.x,x.y)&&Ot(x.prev,x,x.next)>=0)return!1;x=x.next}return!0}function K_(i,e,t,n){let s=i.prev,r=i,o=i.next;if(Ot(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,d=o.y,p=a<l?a<c?a:c:l<c?l:c,x=h<u?h<d?h:d:u<d?u:d,v=a>l?a>c?a:c:l>c?l:c,g=h>u?h>d?h:d:u>d?u:d,m=Oh(p,x,e,t,n),w=Oh(v,g,e,t,n),S=i.prevZ,_=i.nextZ;for(;S&&S.z>=m&&_&&_.z<=w;){if(S.x>=p&&S.x<=v&&S.y>=x&&S.y<=g&&S!==s&&S!==o&&ur(a,h,l,u,c,d,S.x,S.y)&&Ot(S.prev,S,S.next)>=0||(S=S.prevZ,_.x>=p&&_.x<=v&&_.y>=x&&_.y<=g&&_!==s&&_!==o&&ur(a,h,l,u,c,d,_.x,_.y)&&Ot(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;S&&S.z>=m;){if(S.x>=p&&S.x<=v&&S.y>=x&&S.y<=g&&S!==s&&S!==o&&ur(a,h,l,u,c,d,S.x,S.y)&&Ot(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;_&&_.z<=w;){if(_.x>=p&&_.x<=v&&_.y>=x&&_.y<=g&&_!==s&&_!==o&&ur(a,h,l,u,c,d,_.x,_.y)&&Ot(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function j_(i,e,t){let n=i;do{let s=n.prev,r=n.next.next;!Tl(s,r)&&Lp(s,n,n.next,r)&&Ao(s,r)&&Ao(r,s)&&(e.push(s.i/t|0),e.push(n.i/t|0),e.push(r.i/t|0),Eo(n),Eo(n.next),n=i=r),n=n.next}while(n!==i);return Os(n)}function J_(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&oM(o,a)){let l=Dp(o,a);o=Os(o,o.next),l=Os(l,l.next),To(o,e,t,n,s,r,0),To(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Q_(i,e,t,n){let s=[],r,o,a,l,c;for(r=0,o=e.length;r<o;r++)a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=Pp(i,a,l,n,!1),c===c.next&&(c.steiner=!0),s.push(rM(c));for(s.sort($_),r=0;r<s.length;r++)t=eM(s[r],t);return t}function $_(i,e){return i.x-e.x}function eM(i,e){let t=tM(i,e);if(!t)return e;let n=Dp(t,i);return Os(n,n.next),Os(t,t.next)}function tM(i,e){let t=e,n=-1/0,s,r=i.x,o=i.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let d=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=r&&d>n&&(n=d,s=t.x<t.next.x?t:t.next,d===r))return s}t=t.next}while(t!==e);if(!s)return null;let a=s,l=s.x,c=s.y,h=1/0,u;t=s;do r>=t.x&&t.x>=l&&r!==t.x&&ur(o<c?r:n,o,l,c,o<c?n:r,o,t.x,t.y)&&(u=Math.abs(o-t.y)/(r-t.x),Ao(t,i)&&(u<h||u===h&&(t.x>s.x||t.x===s.x&&nM(s,t)))&&(s=t,h=u)),t=t.next;while(t!==a);return s}function nM(i,e){return Ot(i.prev,i,e.prev)<0&&Ot(e.next,i,i.next)<0}function iM(i,e,t,n){let s=i;do s.z===0&&(s.z=Oh(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,sM(s)}function sM(i){let e,t,n,s,r,o,a,l,c=1;do{for(t=i,i=null,r=null,o=0;t;){for(o++,n=t,a=0,e=0;e<c&&(a++,n=n.nextZ,!!n);e++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||t.z<=n.z)?(s=t,t=t.nextZ,a--):(s=n,n=n.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;t=n}r.nextZ=null,c*=2}while(o>1);return i}function Oh(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function rM(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function ur(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function oM(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!aM(i,e)&&(Ao(i,e)&&Ao(e,i)&&lM(i,e)&&(Ot(i.prev,i,e.prev)||Ot(i,e.prev,e))||Tl(i,e)&&Ot(i.prev,i,i.next)>0&&Ot(e.prev,e,e.next)>0)}function Ot(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Tl(i,e){return i.x===e.x&&i.y===e.y}function Lp(i,e,t,n){let s=Na(Ot(i,e,t)),r=Na(Ot(i,e,n)),o=Na(Ot(t,n,i)),a=Na(Ot(t,n,e));return!!(s!==r&&o!==a||s===0&&Da(i,t,e)||r===0&&Da(i,n,e)||o===0&&Da(t,i,n)||a===0&&Da(t,e,n))}function Da(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Na(i){return i>0?1:i<0?-1:0}function aM(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Lp(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Ao(i,e){return Ot(i.prev,i,i.next)<0?Ot(i,e,i.next)>=0&&Ot(i,i.prev,e)>=0:Ot(i,e,i.prev)<0||Ot(i,i.next,e)<0}function lM(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Dp(i,e){let t=new Fh(i.i,i.x,i.y),n=new Fh(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function $d(i,e,t,n){let s=new Fh(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Eo(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Fh(i,e,t){this.i=i,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function cM(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var co=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];ep(e),tp(n,e);let o=e.length;t.forEach(ep);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,tp(n,t[l]);let a=q_.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function ep(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function tp(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var cl=class i extends Et{constructor(e=new wo([new pe(.5,.5),new pe(-.5,.5),new pe(-.5,-.5),new pe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new rt(s,3)),this.setAttribute("uv",new rt(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,p=t.bevelThickness!==void 0?t.bevelThickness:.2,x=t.bevelSize!==void 0?t.bevelSize:p-.1,v=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3,m=t.extrudePath,w=t.UVGenerator!==void 0?t.UVGenerator:hM,S,_=!1,D,I,A,T;m&&(S=m.getSpacedPoints(h),_=!0,d=!1,D=m.computeFrenetFrames(h,!1),I=new B,A=new B,T=new B),d||(g=0,p=0,x=0,v=0);let b=a.extractPoints(c),y=b.shape,E=b.holes;if(!co.isClockWise(y)){y=y.reverse();for(let fe=0,me=E.length;fe<me;fe++){let z=E[fe];co.isClockWise(z)&&(E[fe]=z.reverse())}}let U=co.triangulateShape(y,E),k=y;for(let fe=0,me=E.length;fe<me;fe++){let z=E[fe];y=y.concat(z)}function G(fe,me,z){return me||console.error("THREE.ExtrudeGeometry: vec does not exist"),fe.clone().addScaledVector(me,z)}let V=y.length,$=U.length;function X(fe,me,z){let Ne,_e,Oe,Re=fe.x-me.x,Ze=fe.y-me.y,Fe=z.x-fe.x,O=z.y-fe.y,C=Re*Re+Ze*Ze,J=Re*O-Ze*Fe;if(Math.abs(J)>Number.EPSILON){let he=Math.sqrt(C),ge=Math.sqrt(Fe*Fe+O*O),ue=me.x-Ze/he,Ve=me.y+Re/he,Ce=z.x-O/ge,De=z.y+Fe/ge,nt=((Ce-ue)*O-(De-Ve)*Fe)/(Re*O-Ze*Fe);Ne=ue+Re*nt-fe.x,_e=Ve+Ze*nt-fe.y;let we=Ne*Ne+_e*_e;if(we<=2)return new pe(Ne,_e);Oe=Math.sqrt(we/2)}else{let he=!1;Re>Number.EPSILON?Fe>Number.EPSILON&&(he=!0):Re<-Number.EPSILON?Fe<-Number.EPSILON&&(he=!0):Math.sign(Ze)===Math.sign(O)&&(he=!0),he?(Ne=-Ze,_e=Re,Oe=Math.sqrt(C)):(Ne=Re,_e=Ze,Oe=Math.sqrt(C/2))}return new pe(Ne/Oe,_e/Oe)}let j=[];for(let fe=0,me=k.length,z=me-1,Ne=fe+1;fe<me;fe++,z++,Ne++)z===me&&(z=0),Ne===me&&(Ne=0),j[fe]=X(k[fe],k[z],k[Ne]);let P=[],W,ee=j.concat();for(let fe=0,me=E.length;fe<me;fe++){let z=E[fe];W=[];for(let Ne=0,_e=z.length,Oe=_e-1,Re=Ne+1;Ne<_e;Ne++,Oe++,Re++)Oe===_e&&(Oe=0),Re===_e&&(Re=0),W[Ne]=X(z[Ne],z[Oe],z[Re]);P.push(W),ee=ee.concat(W)}for(let fe=0;fe<g;fe++){let me=fe/g,z=p*Math.cos(me*Math.PI/2),Ne=x*Math.sin(me*Math.PI/2)+v;for(let _e=0,Oe=k.length;_e<Oe;_e++){let Re=G(k[_e],j[_e],Ne);q(Re.x,Re.y,-z)}for(let _e=0,Oe=E.length;_e<Oe;_e++){let Re=E[_e];W=P[_e];for(let Ze=0,Fe=Re.length;Ze<Fe;Ze++){let O=G(Re[Ze],W[Ze],Ne);q(O.x,O.y,-z)}}}let le=x+v;for(let fe=0;fe<V;fe++){let me=d?G(y[fe],ee[fe],le):y[fe];_?(A.copy(D.normals[0]).multiplyScalar(me.x),I.copy(D.binormals[0]).multiplyScalar(me.y),T.copy(S[0]).add(A).add(I),q(T.x,T.y,T.z)):q(me.x,me.y,0)}for(let fe=1;fe<=h;fe++)for(let me=0;me<V;me++){let z=d?G(y[me],ee[me],le):y[me];_?(A.copy(D.normals[fe]).multiplyScalar(z.x),I.copy(D.binormals[fe]).multiplyScalar(z.y),T.copy(S[fe]).add(A).add(I),q(T.x,T.y,T.z)):q(z.x,z.y,u/h*fe)}for(let fe=g-1;fe>=0;fe--){let me=fe/g,z=p*Math.cos(me*Math.PI/2),Ne=x*Math.sin(me*Math.PI/2)+v;for(let _e=0,Oe=k.length;_e<Oe;_e++){let Re=G(k[_e],j[_e],Ne);q(Re.x,Re.y,u+z)}for(let _e=0,Oe=E.length;_e<Oe;_e++){let Re=E[_e];W=P[_e];for(let Ze=0,Fe=Re.length;Ze<Fe;Ze++){let O=G(Re[Ze],W[Ze],Ne);_?q(O.x,O.y+S[h-1].y,S[h-1].x+z):q(O.x,O.y,u+z)}}}Y(),te();function Y(){let fe=s.length/3;if(d){let me=0,z=V*me;for(let Ne=0;Ne<$;Ne++){let _e=U[Ne];ve(_e[2]+z,_e[1]+z,_e[0]+z)}me=h+g*2,z=V*me;for(let Ne=0;Ne<$;Ne++){let _e=U[Ne];ve(_e[0]+z,_e[1]+z,_e[2]+z)}}else{for(let me=0;me<$;me++){let z=U[me];ve(z[2],z[1],z[0])}for(let me=0;me<$;me++){let z=U[me];ve(z[0]+V*h,z[1]+V*h,z[2]+V*h)}}n.addGroup(fe,s.length/3-fe,0)}function te(){let fe=s.length/3,me=0;ne(k,me),me+=k.length;for(let z=0,Ne=E.length;z<Ne;z++){let _e=E[z];ne(_e,me),me+=_e.length}n.addGroup(fe,s.length/3-fe,1)}function ne(fe,me){let z=fe.length;for(;--z>=0;){let Ne=z,_e=z-1;_e<0&&(_e=fe.length-1);for(let Oe=0,Re=h+g*2;Oe<Re;Oe++){let Ze=V*Oe,Fe=V*(Oe+1),O=me+Ne+Ze,C=me+_e+Ze,J=me+_e+Fe,he=me+Ne+Fe;Ee(O,C,J,he)}}}function q(fe,me,z){l.push(fe),l.push(me),l.push(z)}function ve(fe,me,z){Le(fe),Le(me),Le(z);let Ne=s.length/3,_e=w.generateTopUV(n,s,Ne-3,Ne-2,Ne-1);Je(_e[0]),Je(_e[1]),Je(_e[2])}function Ee(fe,me,z,Ne){Le(fe),Le(me),Le(Ne),Le(me),Le(z),Le(Ne);let _e=s.length/3,Oe=w.generateSideWallUV(n,s,_e-6,_e-3,_e-2,_e-1);Je(Oe[0]),Je(Oe[1]),Je(Oe[3]),Je(Oe[1]),Je(Oe[2]),Je(Oe[3])}function Le(fe){s.push(l[fe*3+0]),s.push(l[fe*3+1]),s.push(l[fe*3+2])}function Je(fe){r.push(fe.x),r.push(fe.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return uM(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];n.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new al[s.type]().fromJSON(s)),new i(n,e.options)}},hM={generateTopUV:function(i,e,t,n,s){let r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[s*3],h=e[s*3+1];return[new pe(r,o),new pe(a,l),new pe(c,h)]},generateSideWallUV:function(i,e,t,n,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],u=e[n*3+2],d=e[s*3],p=e[s*3+1],x=e[s*3+2],v=e[r*3],g=e[r*3+1],m=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new pe(o,1-l),new pe(c,1-u),new pe(d,1-x),new pe(v,1-m)]:[new pe(a,1-l),new pe(h,1-u),new pe(p,1-x),new pe(g,1-m)]}};function uM(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var hl=class i extends Et{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);let a=[],l=[],c=[],h=[],u=e,d=(t-e)/s,p=new B,x=new pe;for(let v=0;v<=s;v++){for(let g=0;g<=n;g++){let m=r+g/n*o;p.x=u*Math.cos(m),p.y=u*Math.sin(m),l.push(p.x,p.y,p.z),c.push(0,0,1),x.x=(p.x/t+1)/2,x.y=(p.y/t+1)/2,h.push(x.x,x.y)}u+=d}for(let v=0;v<s;v++){let g=v*(n+1);for(let m=0;m<n;m++){let w=m+g,S=w,_=w+n+1,D=w+n+2,I=w+1;a.push(S,_,I),a.push(_,D,I)}}this.setIndex(a),this.setAttribute("position",new rt(l,3)),this.setAttribute("normal",new rt(c,3)),this.setAttribute("uv",new rt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var ul=class i extends Et{constructor(e=new rl(new B(-1,-1,0),new B(-1,1,0),new B(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new B,l=new B,c=new pe,h=new B,u=[],d=[],p=[],x=[];v(),this.setIndex(x),this.setAttribute("position",new rt(u,3)),this.setAttribute("normal",new rt(d,3)),this.setAttribute("uv",new rt(p,2));function v(){for(let S=0;S<t;S++)g(S);g(r===!1?t:0),w(),m()}function g(S){h=e.getPointAt(S/t,h);let _=o.normals[S],D=o.binormals[S];for(let I=0;I<=s;I++){let A=I/s*Math.PI*2,T=Math.sin(A),b=-Math.cos(A);l.x=b*_.x+T*D.x,l.y=b*_.y+T*D.y,l.z=b*_.z+T*D.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=h.x+n*l.x,a.y=h.y+n*l.y,a.z=h.z+n*l.z,u.push(a.x,a.y,a.z)}}function m(){for(let S=1;S<=t;S++)for(let _=1;_<=s;_++){let D=(s+1)*(S-1)+(_-1),I=(s+1)*S+(_-1),A=(s+1)*S+_,T=(s+1)*(S-1)+_;x.push(D,I,T),x.push(I,A,T)}}function w(){for(let S=0;S<=t;S++)for(let _=0;_<=s;_++)c.x=S/t,c.y=_/s,p.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new al[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var fl=class extends Ft{static get type(){return"RawShaderMaterial"}constructor(e){super(e),this.isRawShaderMaterial=!0}},It=class extends _n{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new We(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new We(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=uu,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new mi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},en=class extends It{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new pe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Vt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new We(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new We(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new We(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var dl=class extends _n{static get type(){return"MeshNormalMaterial"}constructor(e){super(),this.isMeshNormalMaterial=!0,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=uu,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}};function Ua(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function fM(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function dM(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function np(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=i[a+l]}return s}function Np(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}var us=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Bh=class extends us{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Vf,endingEnd:Vf}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Gf:r=e,a=2*t-n;break;case Wf:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Gf:o=e,l=2*n-t;break;case Wf:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,x=(n-t)/(s-t),v=x*x,g=v*x,m=-d*g+2*d*v-d*x,w=(1+d)*g+(-1.5-2*d)*v+(-.5+d)*x+1,S=(-1-p)*g+(1.5+p)*v+.5*x,_=p*g-p*v;for(let D=0;D!==a;++D)r[D]=m*o[h+D]+w*o[c+D]+S*o[l+D]+_*o[u+D];return r}},kh=class extends us{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(s-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}},zh=class extends us{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Gn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ua(t,this.TimeBufferType),this.values=Ua(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ua(e.times,Array),values:Ua(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new zh(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new kh(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Bh(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ls:t=this.InterpolantFactoryMethodDiscrete;break;case cs:t=this.InterpolantFactoryMethodLinear;break;case Jl:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ls;case this.InterpolantFactoryMethodLinear:return cs;case this.InterpolantFactoryMethodSmooth:return Jl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&fM(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Jl,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{let u=a*n,d=u-n,p=u+n;for(let x=0;x!==n;++x){let v=t[u+x];if(v!==t[d+x]||v!==t[p+x]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*n,d=o*n;for(let p=0;p!==n;++p)t[d+p]=t[u+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Gn.prototype.TimeBufferType=Float32Array;Gn.prototype.ValueBufferType=Float32Array;Gn.prototype.DefaultInterpolation=cs;var fs=class extends Gn{constructor(e,t,n){super(e,t,n)}};fs.prototype.ValueTypeName="bool";fs.prototype.ValueBufferType=Array;fs.prototype.DefaultInterpolation=ls;fs.prototype.InterpolantFactoryMethodLinear=void 0;fs.prototype.InterpolantFactoryMethodSmooth=void 0;var pl=class extends Gn{};pl.prototype.ValueTypeName="color";var zi=class extends Gn{};zi.prototype.ValueTypeName="number";var Hh=class extends us{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let h=c+a;c!==h;c+=4)$t.slerpFlat(r,0,o,c-a,o,c,l);return r}},Hi=class extends Gn{InterpolantFactoryMethodLinear(e){return new Hh(this.times,this.values,this.getValueSize(),e)}};Hi.prototype.ValueTypeName="quaternion";Hi.prototype.InterpolantFactoryMethodSmooth=void 0;var ds=class extends Gn{constructor(e,t,n){super(e,t,n)}};ds.prototype.ValueTypeName="string";ds.prototype.ValueBufferType=Array;ds.prototype.DefaultInterpolation=ls;ds.prototype.InterpolantFactoryMethodLinear=void 0;ds.prototype.InterpolantFactoryMethodSmooth=void 0;var Vi=class extends Gn{};Vi.prototype.ValueTypeName="vector";var ml=class{constructor(e="",t=-1,n=[],s=ug){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Fn(),this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(mM(n[o]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=n.length;r!==o;++r)t.push(Gn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);let h=dM(l);l=np(l,1,h),c=np(c,1,h),!s&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new zi(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){let c=e[a],h=c.name.match(r);if(h&&h.length>1){let u=h[1],d=s[u];d||(s[u]=d=[]),d.push(c)}}let o=[];for(let a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(u,d,p,x,v){if(p.length!==0){let g=[],m=[];Np(p,g,m,x),g.length!==0&&v.push(new u(d,g,m))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode,l=e.length||-1,c=e.hierarchy||[];for(let u=0;u<c.length;u++){let d=c[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let p={},x;for(x=0;x<d.length;x++)if(d[x].morphTargets)for(let v=0;v<d[x].morphTargets.length;v++)p[d[x].morphTargets[v]]=-1;for(let v in p){let g=[],m=[];for(let w=0;w!==d[x].morphTargets.length;++w){let S=d[x];g.push(S.time),m.push(S.morphTarget===v?1:0)}s.push(new zi(".morphTargetInfluence["+v+"]",g,m))}l=p.length*o}else{let p=".bones["+t[u].name+"]";n(Vi,p+".position",d,"pos",s),n(Hi,p+".quaternion",d,"rot",s),n(Vi,p+".scale",d,"scl",s)}}return s.length===0?null:new this(r,l,s,a)}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}};function pM(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return zi;case"vector":case"vector2":case"vector3":case"vector4":return Vi;case"color":return pl;case"quaternion":return Hi;case"bool":case"boolean":return fs;case"string":return ds}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function mM(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=pM(i.type);if(i.times===void 0){let t=[],n=[];Np(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}var ss={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},Vh=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let p=c[u],x=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return x}return null}}},gM=new Vh,xi=class{constructor(e){this.manager=e!==void 0?e:gM,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};xi.DEFAULT_MATERIAL_NAME="__DEFAULT";var Pi={},Gh=class extends Error{constructor(e,t){super(e),this.response=t}},Ar=class extends xi{constructor(e){super(e)}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=ss.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Pi[e]!==void 0){Pi[e].push({onLoad:t,onProgress:n,onError:s});return}Pi[e]=[],Pi[e].push({onLoad:t,onProgress:n,onError:s});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let h=Pi[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),p=d?parseInt(d):0,x=p!==0,v=0,g=new ReadableStream({start(m){w();function w(){u.read().then(({done:S,value:_})=>{if(S)m.close();else{v+=_.byteLength;let D=new ProgressEvent("progress",{lengthComputable:x,loaded:v,total:p});for(let I=0,A=h.length;I<A;I++){let T=h[I];T.onProgress&&T.onProgress(D)}m.enqueue(_),w()}},S=>{m.error(S)})}}});return new Response(g)}else throw new Gh(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{let u=/charset="?([^;"\s]*)"?/i.exec(a),d=u&&u[1]?u[1].toLowerCase():void 0,p=new TextDecoder(d);return c.arrayBuffer().then(x=>p.decode(x))}}}).then(c=>{ss.add(e,c);let h=Pi[e];delete Pi[e];for(let u=0,d=h.length;u<d;u++){let p=h[u];p.onLoad&&p.onLoad(c)}}).catch(c=>{let h=Pi[e];if(h===void 0)throw this.manager.itemError(e),c;delete Pi[e];for(let u=0,d=h.length;u<d;u++){let p=h[u];p.onError&&p.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}};var Wh=class extends xi{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=ss.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;let a=fo("img");function l(){h(),ss.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}};var Er=class extends xi{constructor(e){super(e)}load(e,t,n,s){let r=this,o=new ki,a=new Ar(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(r.withCredentials),a.load(e,function(l){let c;try{c=r.parse(l)}catch(h){if(s!==void 0)s(h);else{console.error(h);return}}c.image!==void 0?o.image=c.image:c.data!==void 0&&(o.image.width=c.width,o.image.height=c.height,o.image.data=c.data),o.wrapS=c.wrapS!==void 0?c.wrapS:Pn,o.wrapT=c.wrapT!==void 0?c.wrapT:Pn,o.magFilter=c.magFilter!==void 0?c.magFilter:wt,o.minFilter=c.minFilter!==void 0?c.minFilter:wt,o.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(o.colorSpace=c.colorSpace),c.flipY!==void 0&&(o.flipY=c.flipY),c.format!==void 0&&(o.format=c.format),c.type!==void 0&&(o.type=c.type),c.mipmaps!==void 0&&(o.mipmaps=c.mipmaps,o.minFilter=fn),c.mipmapCount===1&&(o.minFilter=wt),c.generateMipmaps!==void 0&&(o.generateMipmaps=c.generateMipmaps),o.needsUpdate=!0,t&&t(o,c)},n,s),o}},Rr=class extends xi{constructor(e){super(e)}load(e,t,n,s){let r=new Ht,o=new Wh(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Cr=class extends At{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new We(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},gl=class extends Cr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.groundColor=new We(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Ic=new je,ip=new B,sp=new B,Ro=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pe(512,512),this.map=null,this.mapPass=null,this.matrix=new je,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new mo,this._frameExtents=new pe(1,1),this._viewportCount=1,this._viewports=[new yt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;ip.setFromMatrixPosition(e.matrixWorld),t.position.copy(ip),sp.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(sp),t.updateMatrixWorld(),Ic.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ic),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ic)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Xh=class extends Ro{constructor(){super(new Yt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){let t=this.camera,n=yr*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},Ir=class extends Cr{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Xh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},rp=new je,to=new B,Pc=new B,Yh=class extends Ro{constructor(){super(new Yt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new pe(4,2),this._viewportCount=6,this._viewports=[new yt(2,1,1,1),new yt(0,1,1,1),new yt(3,1,1,1),new yt(1,1,1,1),new yt(3,0,1,1),new yt(1,0,1,1)],this._cubeDirections=[new B(1,0,0),new B(-1,0,0),new B(0,0,1),new B(0,0,-1),new B(0,1,0),new B(0,-1,0)],this._cubeUps=[new B(0,1,0),new B(0,1,0),new B(0,1,0),new B(0,1,0),new B(0,0,1),new B(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),to.setFromMatrixPosition(e.matrixWorld),n.position.copy(to),Pc.copy(n.position),Pc.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Pc),n.updateMatrixWorld(),s.makeTranslation(-to.x,-to.y,-to.z),rp.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(rp)}},Pr=class extends Cr{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Yh}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},qh=class extends Ro{constructor(){super(new hs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Lr=class extends Cr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.shadow=new qh}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var ps=class{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,s=e.length;n<s;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var xl=class extends xi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=ss.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),r.manager.itemEnd(e)}).catch(c=>{s&&s(c)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;let l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return ss.add(e,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),ss.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});ss.add(e,l),r.manager.itemStart(e)}};var Dr=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=op(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=op();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};function op(){return performance.now()}var mu="\\[\\]\\.:\\/",xM=new RegExp("["+mu+"]","g"),gu="[^"+mu+"]",vM="[^"+mu.replace("\\.","")+"]",yM=/((?:WC+[\/:])*)/.source.replace("WC",gu),_M=/(WCOD+)?/.source.replace("WCOD",vM),MM=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",gu),SM=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",gu),bM=new RegExp("^"+yM+_M+MM+SM+"$"),wM=["material","materials","bones","map"],Zh=class{constructor(e,t,n){let s=n||vt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},vt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(xM,"")}static parseTrackName(e){let t=bM.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);wM.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};vt.Composite=Zh;vt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};vt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};vt.prototype.GetterByBindingType=[vt.prototype._getValue_direct,vt.prototype._getValue_array,vt.prototype._getValue_arrayElement,vt.prototype._getValue_toArray];vt.prototype.SetterByBindingTypeAndVersioning=[[vt.prototype._setValue_direct,vt.prototype._setValue_direct_setNeedsUpdate,vt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_array,vt.prototype._setValue_array_setNeedsUpdate,vt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_arrayElement,vt.prototype._setValue_arrayElement_setNeedsUpdate,vt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_fromArray,vt.prototype._setValue_fromArray_setNeedsUpdate,vt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var zS=new Float32Array(1);var ap=new je,vl=class{constructor(e,t,n=0,s=1/0){this.ray=new Bi(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new po,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return ap.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ap),this}intersectObject(e,t=!0,n=[]){return Kh(e,this,n,t),n.sort(lp),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Kh(e[s],this,n,t);return n.sort(lp),n}};function lp(i,e){return i.distance-e.distance}function Kh(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Kh(r[o],e,t,!0)}}var Co=class{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Vt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var yl=class extends Fi{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");var Up={type:"change"},vu={type:"start"},Fp={type:"end"},Al=new Bi,Op=new ni,TM=Math.cos(70*Sn.DEG2RAD),Kt=new B,wn=2*Math.PI,Rt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},xu=1e-6,El=class extends yl{constructor(e,t=null){super(e,t),this.state=Rt.NONE,this.enabled=!0,this.target=new B,this.cursor=new B,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Fs.ROTATE,MIDDLE:Fs.DOLLY,RIGHT:Fs.PAN},this.touches={ONE:Bs.ROTATE,TWO:Bs.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new B,this._lastQuaternion=new $t,this._lastTargetPosition=new B,this._quat=new $t().setFromUnitVectors(e.up,new B(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Co,this._sphericalDelta=new Co,this._scale=1,this._panOffset=new B,this._rotateStart=new pe,this._rotateEnd=new pe,this._rotateDelta=new pe,this._panStart=new pe,this._panEnd=new pe,this._panDelta=new pe,this._dollyStart=new pe,this._dollyEnd=new pe,this._dollyDelta=new pe,this._dollyDirection=new B,this._mouse=new pe,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=EM.bind(this),this._onPointerDown=AM.bind(this),this._onPointerUp=RM.bind(this),this._onContextMenu=UM.bind(this),this._onMouseWheel=PM.bind(this),this._onKeyDown=LM.bind(this),this._onTouchStart=DM.bind(this),this._onTouchMove=NM.bind(this),this._onMouseDown=CM.bind(this),this._onMouseMove=IM.bind(this),this._interceptControlDown=OM.bind(this),this._interceptControlUp=FM.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Up),this.update(),this.state=Rt.NONE}update(e=null){let t=this.object.position;Kt.copy(t).sub(this.target),Kt.applyQuaternion(this._quat),this._spherical.setFromVector3(Kt),this.autoRotate&&this.state===Rt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=wn:n>Math.PI&&(n-=wn),s<-Math.PI?s+=wn:s>Math.PI&&(s-=wn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Kt.setFromSpherical(this._spherical),Kt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Kt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Kt.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new B(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new B(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Kt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Al.origin.copy(this.object.position),Al.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Al.direction))<TM?this.object.lookAt(this.target):(Op.setFromNormalAndCoplanarPoint(this.object.up,this.target),Al.intersectPlane(Op,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>xu||8*(1-this._lastQuaternion.dot(this.object.quaternion))>xu||this._lastTargetPosition.distanceToSquared(this.target)>xu?(this.dispatchEvent(Up),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?wn/60*this.autoRotateSpeed*e:wn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Kt.setFromMatrixColumn(t,0),Kt.multiplyScalar(-e),this._panOffset.add(Kt)}_panUp(e,t){this.screenSpacePanning===!0?Kt.setFromMatrixColumn(t,1):(Kt.setFromMatrixColumn(t,0),Kt.crossVectors(this.object.up,Kt)),Kt.multiplyScalar(e),this._panOffset.add(Kt)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Kt.copy(s).sub(this.target);let r=Kt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(wn*this._rotateDelta.x/t.clientHeight),this._rotateUp(wn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(wn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(-wn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(wn*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(-wn*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(wn*this._rotateDelta.x/t.clientHeight),this._rotateUp(wn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new pe,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function AM(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function EM(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function RM(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Fp),this.state=Rt.NONE;break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function CM(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Fs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=Rt.DOLLY;break;case Fs.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Rt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Rt.ROTATE}break;case Fs.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Rt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Rt.PAN}break;default:this.state=Rt.NONE}this.state!==Rt.NONE&&this.dispatchEvent(vu)}function IM(i){switch(this.state){case Rt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case Rt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case Rt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function PM(i){this.enabled===!1||this.enableZoom===!1||this.state!==Rt.NONE||(i.preventDefault(),this.dispatchEvent(vu),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Fp))}function LM(i){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(i)}function DM(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Bs.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=Rt.TOUCH_ROTATE;break;case Bs.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=Rt.TOUCH_PAN;break;default:this.state=Rt.NONE}break;case 2:switch(this.touches.TWO){case Bs.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=Rt.TOUCH_DOLLY_PAN;break;case Bs.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=Rt.TOUCH_DOLLY_ROTATE;break;default:this.state=Rt.NONE}break;default:this.state=Rt.NONE}this.state!==Rt.NONE&&this.dispatchEvent(vu)}function NM(i){switch(this._trackPointer(i),this.state){case Rt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case Rt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case Rt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case Rt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=Rt.NONE}}function UM(i){this.enabled!==!1&&i.preventDefault()}function OM(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function FM(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Rl=class extends Er{constructor(e){super(e),this.type=Bt}parse(e){let o=function(T,b){switch(T){case 1:throw new Error("THREE.RGBELoader: Read Error: "+(b||""));case 2:throw new Error("THREE.RGBELoader: Write Error: "+(b||""));case 3:throw new Error("THREE.RGBELoader: Bad File Format: "+(b||""));default:case 4:throw new Error("THREE.RGBELoader: Memory Error: "+(b||""))}},u=function(T,b,y){b=b||1024;let F=T.pos,U=-1,k=0,G="",V=String.fromCharCode.apply(null,new Uint16Array(T.subarray(F,F+128)));for(;0>(U=V.indexOf(`
`))&&k<b&&F<T.byteLength;)G+=V,k+=V.length,F+=128,V+=String.fromCharCode.apply(null,new Uint16Array(T.subarray(F,F+128)));return-1<U?(y!==!1&&(T.pos+=k+U+1),G+V.slice(0,U)):!1},d=function(T){let b=/^#\?(\S+)/,y=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,E=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,F=/^\s*FORMAT=(\S+)\s*$/,U=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,k={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0},G,V;for((T.pos>=T.byteLength||!(G=u(T)))&&o(1,"no header found"),(V=G.match(b))||o(3,"bad initial token"),k.valid|=1,k.programtype=V[1],k.string+=G+`
`;G=u(T),G!==!1;){if(k.string+=G+`
`,G.charAt(0)==="#"){k.comments+=G+`
`;continue}if((V=G.match(y))&&(k.gamma=parseFloat(V[1])),(V=G.match(E))&&(k.exposure=parseFloat(V[1])),(V=G.match(F))&&(k.valid|=2,k.format=V[1]),(V=G.match(U))&&(k.valid|=4,k.height=parseInt(V[1],10),k.width=parseInt(V[2],10)),k.valid&2&&k.valid&4)break}return k.valid&2||o(3,"missing format specifier"),k.valid&4||o(3,"missing image size specifier"),k},p=function(T,b,y){let E=b;if(E<8||E>32767||T[0]!==2||T[1]!==2||T[2]&128)return new Uint8Array(T);E!==(T[2]<<8|T[3])&&o(3,"wrong scanline width");let F=new Uint8Array(4*b*y);F.length||o(4,"unable to allocate buffer space");let U=0,k=0,G=4*E,V=new Uint8Array(4),$=new Uint8Array(G),X=y;for(;X>0&&k<T.byteLength;){k+4>T.byteLength&&o(1),V[0]=T[k++],V[1]=T[k++],V[2]=T[k++],V[3]=T[k++],(V[0]!=2||V[1]!=2||(V[2]<<8|V[3])!=E)&&o(3,"bad rgbe scanline format");let j=0,P;for(;j<G&&k<T.byteLength;){P=T[k++];let ee=P>128;if(ee&&(P-=128),(P===0||j+P>G)&&o(3,"bad scanline data"),ee){let le=T[k++];for(let Y=0;Y<P;Y++)$[j++]=le}else $.set(T.subarray(k,k+P),j),j+=P,k+=P}let W=E;for(let ee=0;ee<W;ee++){let le=0;F[U]=$[ee+le],le+=E,F[U+1]=$[ee+le],le+=E,F[U+2]=$[ee+le],le+=E,F[U+3]=$[ee+le],U+=4}X--}return F},x=function(T,b,y,E){let F=T[b+3],U=Math.pow(2,F-128)/255;y[E+0]=T[b+0]*U,y[E+1]=T[b+1]*U,y[E+2]=T[b+2]*U,y[E+3]=1},v=function(T,b,y,E){let F=T[b+3],U=Math.pow(2,F-128)/255;y[E+0]=ms.toHalfFloat(Math.min(T[b+0]*U,65504)),y[E+1]=ms.toHalfFloat(Math.min(T[b+1]*U,65504)),y[E+2]=ms.toHalfFloat(Math.min(T[b+2]*U,65504)),y[E+3]=ms.toHalfFloat(1)},g=new Uint8Array(e);g.pos=0;let m=d(g),w=m.width,S=m.height,_=p(g.subarray(g.pos),w,S),D,I,A;switch(this.type){case Gt:A=_.length/4;let T=new Float32Array(A*4);for(let y=0;y<A;y++)x(_,y*4,T,y*4);D=T,I=Gt;break;case Bt:A=_.length/4;let b=new Uint16Array(A*4);for(let y=0;y<A;y++)v(_,y*4,b,y*4);D=b,I=Bt;break;default:throw new Error("THREE.RGBELoader: Unsupported type: "+this.type)}return{width:w,height:S,data:D,header:m.string,gamma:m.gamma,exposure:m.exposure,type:I}}setDataType(e){return this.type=e,this}load(e,t,n,s){function r(o,a){switch(o.type){case Gt:case Bt:o.colorSpace=kt,o.minFilter=wt,o.magFilter=wt,o.generateMipmaps=!1,o.flipY=!0;break}t&&t(o,a)}return super.load(e,r,n,s)}};var Bp={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]},gs=class{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new Su(e)}),this.register(function(e){return new bu(e)}),this.register(function(e){return new Eu(e)}),this.register(function(e){return new Ru(e)}),this.register(function(e){return new Cu(e)}),this.register(function(e){return new Iu(e)}),this.register(function(e){return new wu(e)}),this.register(function(e){return new Tu(e)}),this.register(function(e){return new Au(e)}),this.register(function(e){return new Pu(e)}),this.register(function(e){return new Lu(e)}),this.register(function(e){return new Du(e)}),this.register(function(e){return new Nu(e)}),this.register(function(e){return new Uu(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,n,s){let r=new Mu,o=[];for(let a=0,l=this.pluginCallbacks.length;a<l;a++)o.push(this.pluginCallbacks[a](r));r.setPlugins(o),r.setTextureUtils(this.textureUtils),r.writeAsync(e,t,s).catch(n)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,s,r,t)})}},ut={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},yu="KHR_mesh_quantization",Dn={};Dn[Ut]=ut.NEAREST;Dn[Po]=ut.NEAREST_MIPMAP_NEAREST;Dn[is]=ut.NEAREST_MIPMAP_LINEAR;Dn[wt]=ut.LINEAR;Dn[Ps]=ut.LINEAR_MIPMAP_NEAREST;Dn[fn]=ut.LINEAR_MIPMAP_LINEAR;Dn[Pn]=ut.CLAMP_TO_EDGE;Dn[Wt]=ut.REPEAT;Dn[Ls]=ut.MIRRORED_REPEAT;var kp={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},kM=new We,zp=12,zM=1179937895,HM=2,Hp=8,VM=1313821514,GM=5130562;function Do(i,e){return i.length===e.length&&i.every(function(t,n){return t===e[n]})}function WM(i){return new TextEncoder().encode(i).buffer}function XM(i){return Do(i.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function YM(i,e,t){let n={min:new Array(i.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(i.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let s=e;s<e+t;s++)for(let r=0;r<i.itemSize;r++){let o;i.itemSize>4?o=i.array[s*i.itemSize+r]:(r===0?o=i.getX(s):r===1?o=i.getY(s):r===2?o=i.getZ(s):r===3&&(o=i.getW(s)),i.normalized===!0&&(o=Sn.normalize(o,i.array))),n.min[r]=Math.min(n.min[r],o),n.max[r]=Math.max(n.max[r],o)}return n}function Wp(i){return Math.ceil(i/4)*4}function _u(i,e=0){let t=Wp(i.byteLength);if(t!==i.byteLength){let n=new Uint8Array(t);if(n.set(new Uint8Array(i)),e!==0)for(let s=i.byteLength;s<t;s++)n[s]=e;return n.buffer}return i}function Vp(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function Gp(i,e){if(i.toBlob!==void 0)return new Promise(n=>i.toBlob(n,e));let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),i.convertToBlob({type:e,quality:t})}var Mu=class{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r170"}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,n={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},n),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);let s=this,r=s.buffers,o=s.json;n=s.options;let a=s.extensionsUsed,l=s.extensionsRequired,c=new Blob(r,{type:"application/octet-stream"}),h=Object.keys(a),u=Object.keys(l);if(h.length>0&&(o.extensionsUsed=h),u.length>0&&(o.extensionsRequired=u),o.buffers&&o.buffers.length>0&&(o.buffers[0].byteLength=c.size),n.binary===!0){let d=new FileReader;d.readAsArrayBuffer(c),d.onloadend=function(){let p=_u(d.result),x=new DataView(new ArrayBuffer(Hp));x.setUint32(0,p.byteLength,!0),x.setUint32(4,GM,!0);let v=_u(WM(JSON.stringify(o)),32),g=new DataView(new ArrayBuffer(Hp));g.setUint32(0,v.byteLength,!0),g.setUint32(4,VM,!0);let m=new ArrayBuffer(zp),w=new DataView(m);w.setUint32(0,zM,!0),w.setUint32(4,HM,!0);let S=zp+g.byteLength+v.byteLength+x.byteLength+p.byteLength;w.setUint32(8,S,!0);let _=new Blob([m,g,v,x,p],{type:"application/octet-stream"}),D=new FileReader;D.readAsArrayBuffer(_),D.onloadend=function(){t(D.result)}}}else if(o.buffers&&o.buffers.length>0){let d=new FileReader;d.readAsDataURL(c),d.onloadend=function(){let p=d.result;o.buffers[0].uri=p,t(o)}}else t(o)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;let n=this.options,s=this.extensionsUsed;try{let r=JSON.parse(JSON.stringify(e.userData));if(n.includeCustomExtensions&&r.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(let o in r.gltfExtensions)t.extensions[o]=r.gltfExtensions[o],s[o]=!0;delete r.gltfExtensions}Object.keys(r).length>0&&(t.extras=r)}catch(r){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+r.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){let s=new Map;s.set(!0,this.uid++),s.set(!1,this.uid++),this.uids.set(e,s)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;let n=new B;for(let s=0,r=e.count;s<r;s++)if(Math.abs(n.fromBufferAttribute(e,s).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){let t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);let n=e.clone(),s=new B;for(let r=0,o=n.count;r<o;r++)s.fromBufferAttribute(n,r),s.x===0&&s.y===0&&s.z===0?s.setX(1):s.normalize(),n.setXYZ(r,s.x,s.y,s.z);return t.attributesNormalized.set(e,n),n}applyTextureTransform(e,t){let n=!1,s={};(t.offset.x!==0||t.offset.y!==0)&&(s.offset=t.offset.toArray(),n=!0),t.rotation!==0&&(s.rotation=t.rotation,n=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(s.scale=t.repeat.toArray(),n=!0),n&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=s,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function n(p){return p.colorSpace===pt?function(v){return v<.04045?v*.0773993808:Math.pow(v*.9478672986+.0521327014,2.4)}:function(v){return v}}e instanceof Tr&&(e=await this.decompressTextureAsync(e)),t instanceof Tr&&(t=await this.decompressTextureAsync(t));let s=e?e.image:null,r=t?t.image:null,o=Math.max(s?s.width:0,r?r.width:0),a=Math.max(s?s.height:0,r?r.height:0),l=Vp();l.width=o,l.height=a;let c=l.getContext("2d",{willReadFrequently:!0});c.fillStyle="#00ffff",c.fillRect(0,0,o,a);let h=c.getImageData(0,0,o,a);if(s){c.drawImage(s,0,0,o,a);let p=n(e),x=c.getImageData(0,0,o,a).data;for(let v=2;v<x.length;v+=4)h.data[v]=p(x[v]/256)*256}if(r){c.drawImage(r,0,0,o,a);let p=n(t),x=c.getImageData(0,0,o,a).data;for(let v=1;v<x.length;v+=4)h.data[v]=p(x[v]/256)*256}c.putImageData(h,0,0);let d=(e||t).clone();return d.source=new _r(l),d.colorSpace=On,d.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),d}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){let t=this.json,n=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),n.push(e),0}processBufferView(e,t,n,s,r){let o=this.json;o.bufferViews||(o.bufferViews=[]);let a;switch(t){case ut.BYTE:case ut.UNSIGNED_BYTE:a=1;break;case ut.SHORT:case ut.UNSIGNED_SHORT:a=2;break;default:a=4}let l=e.itemSize*a;r===ut.ARRAY_BUFFER&&(l=Math.ceil(l/4)*4);let c=Wp(s*l),h=new DataView(new ArrayBuffer(c)),u=0;for(let x=n;x<n+s;x++){for(let v=0;v<e.itemSize;v++){let g;e.itemSize>4?g=e.array[x*e.itemSize+v]:(v===0?g=e.getX(x):v===1?g=e.getY(x):v===2?g=e.getZ(x):v===3&&(g=e.getW(x)),e.normalized===!0&&(g=Sn.normalize(g,e.array))),t===ut.FLOAT?h.setFloat32(u,g,!0):t===ut.INT?h.setInt32(u,g,!0):t===ut.UNSIGNED_INT?h.setUint32(u,g,!0):t===ut.SHORT?h.setInt16(u,g,!0):t===ut.UNSIGNED_SHORT?h.setUint16(u,g,!0):t===ut.BYTE?h.setInt8(u,g):t===ut.UNSIGNED_BYTE&&h.setUint8(u,g),u+=a}u%l!==0&&(u+=l-u%l)}let d={buffer:this.processBuffer(h.buffer),byteOffset:this.byteOffset,byteLength:c};return r!==void 0&&(d.target=r),r===ut.ARRAY_BUFFER&&(d.byteStride=l),this.byteOffset+=c,o.bufferViews.push(d),{id:o.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){let t=this,n=t.json;return n.bufferViews||(n.bufferViews=[]),new Promise(function(s){let r=new FileReader;r.readAsArrayBuffer(e),r.onloadend=function(){let o=_u(r.result),a={buffer:t.processBuffer(o),byteOffset:t.byteOffset,byteLength:o.byteLength};t.byteOffset+=o.byteLength,s(n.bufferViews.push(a)-1)}})}processAccessor(e,t,n,s){let r=this.json,o={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"},a;if(e.array.constructor===Float32Array)a=ut.FLOAT;else if(e.array.constructor===Int32Array)a=ut.INT;else if(e.array.constructor===Uint32Array)a=ut.UNSIGNED_INT;else if(e.array.constructor===Int16Array)a=ut.SHORT;else if(e.array.constructor===Uint16Array)a=ut.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)a=ut.BYTE;else if(e.array.constructor===Uint8Array)a=ut.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(n===void 0&&(n=0),(s===void 0||s===1/0)&&(s=e.count),s===0)return null;let l=YM(e,n,s),c;t!==void 0&&(c=e===t.index?ut.ELEMENT_ARRAY_BUFFER:ut.ARRAY_BUFFER);let h=this.processBufferView(e,a,n,s,c),u={bufferView:h.id,byteOffset:h.byteOffset,componentType:a,count:s,max:l.max,min:l.min,type:o[e.itemSize]};return e.normalized===!0&&(u.normalized=!0),r.accessors||(r.accessors=[]),r.accessors.push(u)-1}processImage(e,t,n,s="image/png"){if(e!==null){let r=this,o=r.cache,a=r.json,l=r.options,c=r.pending;o.images.has(e)||o.images.set(e,{});let h=o.images.get(e),u=s+":flipY/"+n.toString();if(h[u]!==void 0)return h[u];a.images||(a.images=[]);let d={mimeType:s},p=Vp();p.width=Math.min(e.width,l.maxTextureSize),p.height=Math.min(e.height,l.maxTextureSize);let x=p.getContext("2d",{willReadFrequently:!0});if(n===!0&&(x.translate(0,p.height),x.scale(1,-1)),e.data!==void 0){t!==cn&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>l.maxTextureSize||e.height>l.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);let g=new Uint8ClampedArray(e.height*e.width*4);for(let m=0;m<g.length;m+=4)g[m+0]=e.data[m+0],g[m+1]=e.data[m+1],g[m+2]=e.data[m+2],g[m+3]=e.data[m+3];x.putImageData(new ImageData(g,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)x.drawImage(e,0,0,p.width,p.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");l.binary===!0?c.push(Gp(p,s).then(g=>r.processBufferViewImage(g)).then(g=>{d.bufferView=g})):p.toDataURL!==void 0?d.uri=p.toDataURL(s):c.push(Gp(p,s).then(g=>new FileReader().readAsDataURL(g)).then(g=>{d.uri=g}));let v=a.images.push(d)-1;return h[u]=v,v}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){let t=this.json;t.samplers||(t.samplers=[]);let n={magFilter:Dn[e.magFilter],minFilter:Dn[e.minFilter],wrapS:Dn[e.wrapS],wrapT:Dn[e.wrapT]};return t.samplers.push(n)-1}async processTextureAsync(e){let n=this.options,s=this.cache,r=this.json;if(s.textures.has(e))return s.textures.get(e);r.textures||(r.textures=[]),e instanceof Tr&&(e=await this.decompressTextureAsync(e,n.maxTextureSize));let o=e.userData.mimeType;o==="image/webp"&&(o="image/png");let a={sampler:this.processSampler(e),source:this.processImage(e.image,e.format,e.flipY,o)};e.name&&(a.name=e.name),await this._invokeAllAsync(async function(c){c.writeTexture&&await c.writeTexture(e,a)});let l=r.textures.push(a)-1;return s.textures.set(e,l),l}async processMaterialAsync(e){let t=this.cache,n=this.json;if(t.materials.has(e))return t.materials.get(e);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;n.materials||(n.materials=[]);let s={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");let r=e.color.toArray().concat([e.opacity]);if(Do(r,[1,1,1,1])||(s.pbrMetallicRoughness.baseColorFactor=r),e.isMeshStandardMaterial?(s.pbrMetallicRoughness.metallicFactor=e.metalness,s.pbrMetallicRoughness.roughnessFactor=e.roughness):(s.pbrMetallicRoughness.metallicFactor=0,s.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){let a=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),l={index:await this.processTextureAsync(a),texCoord:a.channel};this.applyTextureTransform(l,a),s.pbrMetallicRoughness.metallicRoughnessTexture=l}if(e.map){let a={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(a,e.map),s.pbrMetallicRoughness.baseColorTexture=a}if(e.emissive){let a=e.emissive;if(Math.max(a.r,a.g,a.b)>0&&(s.emissiveFactor=e.emissive.toArray()),e.emissiveMap){let c={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(c,e.emissiveMap),s.emissiveTexture=c}}if(e.normalMap){let a={index:await this.processTextureAsync(e.normalMap),texCoord:e.normalMap.channel};e.normalScale&&e.normalScale.x!==1&&(a.scale=e.normalScale.x),this.applyTextureTransform(a,e.normalMap),s.normalTexture=a}if(e.aoMap){let a={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(a.strength=e.aoMapIntensity),this.applyTextureTransform(a,e.aoMap),s.occlusionTexture=a}e.transparent?s.alphaMode="BLEND":e.alphaTest>0&&(s.alphaMode="MASK",s.alphaCutoff=e.alphaTest),e.side===Nt&&(s.doubleSided=!0),e.name!==""&&(s.name=e.name),this.serializeUserData(e,s),await this._invokeAllAsync(async function(a){a.writeMaterialAsync&&await a.writeMaterialAsync(e,s)});let o=n.materials.push(s)-1;return t.materials.set(e,o),o}async processMeshAsync(e){let t=this.cache,n=this.json,s=[e.geometry.uuid];if(Array.isArray(e.material))for(let _=0,D=e.material.length;_<D;_++)s.push(e.material[_].uuid);else s.push(e.material.uuid);let r=s.join(":");if(t.meshes.has(r))return t.meshes.get(r);let o=e.geometry,a;e.isLineSegments?a=ut.LINES:e.isLineLoop?a=ut.LINE_LOOP:e.isLine?a=ut.LINE_STRIP:e.isPoints?a=ut.POINTS:a=e.material.wireframe?ut.LINES:ut.TRIANGLES;let l={},c={},h=[],u=[],d={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},p=o.getAttribute("normal");p!==void 0&&!this.isNormalizedNormalAttribute(p)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),o.setAttribute("normal",this.createNormalizedNormalAttribute(p)));let x=null;for(let _ in o.attributes){if(_.slice(0,5)==="morph")continue;let D=o.attributes[_];if(_=d[_]||_.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(_)||(_="_"+_),t.attributes.has(this.getUID(D))){c[_]=t.attributes.get(this.getUID(D));continue}x=null;let A=D.array;_==="JOINTS_0"&&!(A instanceof Uint16Array)&&!(A instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),x=new Tt(new Uint16Array(A),D.itemSize,D.normalized)):(A instanceof Uint32Array||A instanceof Int32Array)&&!_.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${_}" converted to type FLOAT.`),x=gs.Utils.toFloat32BufferAttribute(D));let T=this.processAccessor(x||D,o);T!==null&&(_.startsWith("_")||this.detectMeshQuantization(_,D),c[_]=T,t.attributes.set(this.getUID(D),T))}if(p!==void 0&&o.setAttribute("normal",p),Object.keys(c).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){let _=[],D=[],I={};if(e.morphTargetDictionary!==void 0)for(let A in e.morphTargetDictionary)I[e.morphTargetDictionary[A]]=A;for(let A=0;A<e.morphTargetInfluences.length;++A){let T={},b=!1;for(let y in o.morphAttributes){if(y!=="position"&&y!=="normal"){b||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),b=!0);continue}let E=o.morphAttributes[y][A],F=y.toUpperCase(),U=o.attributes[y];if(t.attributes.has(this.getUID(E,!0))){T[F]=t.attributes.get(this.getUID(E,!0));continue}let k=E.clone();if(!o.morphTargetsRelative)for(let G=0,V=E.count;G<V;G++)for(let $=0;$<E.itemSize;$++)$===0&&k.setX(G,E.getX(G)-U.getX(G)),$===1&&k.setY(G,E.getY(G)-U.getY(G)),$===2&&k.setZ(G,E.getZ(G)-U.getZ(G)),$===3&&k.setW(G,E.getW(G)-U.getW(G));T[F]=this.processAccessor(k,o),t.attributes.set(this.getUID(U,!0),T[F])}u.push(T),_.push(e.morphTargetInfluences[A]),e.morphTargetDictionary!==void 0&&D.push(I[A])}l.weights=_,D.length>0&&(l.extras={},l.extras.targetNames=D)}let v=Array.isArray(e.material);if(v&&o.groups.length===0)return null;let g=!1;if(v&&o.index===null){let _=[];for(let D=0,I=o.attributes.position.count;D<I;D++)_[D]=D;o.setIndex(_),g=!0}let m=v?e.material:[e.material],w=v?o.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let _=0,D=w.length;_<D;_++){let I={mode:a,attributes:c};if(this.serializeUserData(o,I),u.length>0&&(I.targets=u),o.index!==null){let T=this.getUID(o.index);(w[_].start!==void 0||w[_].count!==void 0)&&(T+=":"+w[_].start+":"+w[_].count),t.attributes.has(T)?I.indices=t.attributes.get(T):(I.indices=this.processAccessor(o.index,o,w[_].start,w[_].count),t.attributes.set(T,I.indices)),I.indices===null&&delete I.indices}let A=await this.processMaterialAsync(m[w[_].materialIndex]);A!==null&&(I.material=A),h.push(I)}g===!0&&o.setIndex(null),l.primitives=h,n.meshes||(n.meshes=[]),await this._invokeAllAsync(function(_){_.writeMesh&&_.writeMesh(e,l)});let S=n.meshes.push(l)-1;return t.meshes.set(r,S),S}detectMeshQuantization(e,t){if(this.extensionsUsed[yu])return;let n;switch(t.array.constructor){case Int8Array:n="byte";break;case Uint8Array:n="unsigned byte";break;case Int16Array:n="short";break;case Uint16Array:n="unsigned short";break;default:return}t.normalized&&(n+=" normalized");let s=e.split("_",1)[0];Bp[s]&&Bp[s].includes(n)&&(this.extensionsUsed[yu]=!0,this.extensionsRequired[yu]=!0)}processCamera(e){let t=this.json;t.cameras||(t.cameras=[]);let n=e.isOrthographicCamera,s={type:n?"orthographic":"perspective"};return n?s.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:s.perspective={aspectRatio:e.aspect,yfov:Sn.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(s.name=e.type),t.cameras.push(s)-1}processAnimation(e,t){let n=this.json,s=this.nodeMap;n.animations||(n.animations=[]),e=gs.Utils.mergeMorphTargetTracks(e.clone(),t);let r=e.tracks,o=[],a=[];for(let l=0;l<r.length;++l){let c=r[l],h=vt.parseTrackName(c.name),u=vt.findNode(t,h.nodeName),d=kp[h.propertyName];if(h.objectName==="bones"&&(u.isSkinnedMesh===!0?u=u.skeleton.getBoneByName(h.objectIndex):u=void 0),!u||!d){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',c.name);continue}let p=1,x=c.values.length/c.times.length;d===kp.morphTargetInfluences&&(x/=u.morphTargetInfluences.length);let v;c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(v="CUBICSPLINE",x/=3):c.getInterpolation()===ls?v="STEP":v="LINEAR",a.push({input:this.processAccessor(new Tt(c.times,p)),output:this.processAccessor(new Tt(c.values,x)),interpolation:v}),o.push({sampler:a.length-1,target:{node:s.get(u),path:d}})}return n.animations.push({name:e.name||"clip_"+n.animations.length,samplers:a,channels:o}),n.animations.length-1}processSkin(e){let t=this.json,n=this.nodeMap,s=t.nodes[n.get(e)],r=e.skeleton;if(r===void 0)return null;let o=e.skeleton.bones[0];if(o===void 0)return null;let a=[],l=new Float32Array(r.bones.length*16),c=new je;for(let u=0;u<r.bones.length;++u)a.push(n.get(r.bones[u])),c.copy(r.boneInverses[u]),c.multiply(e.bindMatrix).toArray(l,u*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new Tt(l,16)),joints:a,skeleton:n.get(o)}),s.skin=t.skins.length-1}async processNodeAsync(e){let t=this.json,n=this.options,s=this.nodeMap;t.nodes||(t.nodes=[]);let r={};if(n.trs){let a=e.quaternion.toArray(),l=e.position.toArray(),c=e.scale.toArray();Do(a,[0,0,0,1])||(r.rotation=a),Do(l,[0,0,0])||(r.translation=l),Do(c,[1,1,1])||(r.scale=c)}else e.matrixAutoUpdate&&e.updateMatrix(),XM(e.matrix)===!1&&(r.matrix=e.matrix.elements);if(e.name!==""&&(r.name=String(e.name)),this.serializeUserData(e,r),e.isMesh||e.isLine||e.isPoints){let a=await this.processMeshAsync(e);a!==null&&(r.mesh=a)}else e.isCamera&&(r.camera=this.processCamera(e));if(e.isSkinnedMesh&&this.skins.push(e),e.children.length>0){let a=[];for(let l=0,c=e.children.length;l<c;l++){let h=e.children[l];if(h.visible||n.onlyVisible===!1){let u=await this.processNodeAsync(h);u!==null&&a.push(u)}}a.length>0&&(r.children=a)}await this._invokeAllAsync(function(a){a.writeNode&&a.writeNode(e,r)});let o=t.nodes.push(r)-1;return s.set(e,o),o}async processSceneAsync(e){let t=this.json,n=this.options;t.scenes||(t.scenes=[],t.scene=0);let s={};e.name!==""&&(s.name=e.name),t.scenes.push(s);let r=[];for(let o=0,a=e.children.length;o<a;o++){let l=e.children[o];if(l.visible||n.onlyVisible===!1){let c=await this.processNodeAsync(l);c!==null&&r.push(c)}}r.length>0&&(s.nodes=r),this.serializeUserData(e,s)}async processObjectsAsync(e){let t=new Ns;t.name="AuxScene";for(let n=0;n<e.length;n++)t.children.push(e[n]);await this.processSceneAsync(t)}async processInputAsync(e){let t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(s){s.beforeParse&&s.beforeParse(e)});let n=[];for(let s=0;s<e.length;s++)e[s]instanceof Ns?await this.processSceneAsync(e[s]):n.push(e[s]);n.length>0&&await this.processObjectsAsync(n);for(let s=0;s<this.skins.length;++s)this.processSkin(this.skins[s]);for(let s=0;s<t.animations.length;++s)this.processAnimation(t.animations[s],e[0]);await this._invokeAllAsync(function(s){s.afterParse&&s.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,n=this.plugins.length;t<n;t++)await e(this.plugins[t])}},Su=class{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}let n=this.writer,s=n.json,r=n.extensionsUsed,o={};e.name&&(o.name=e.name),o.color=e.color.toArray(),o.intensity=e.intensity,e.isDirectionalLight?o.type="directional":e.isPointLight?(o.type="point",e.distance>0&&(o.range=e.distance)):e.isSpotLight&&(o.type="spot",e.distance>0&&(o.range=e.distance),o.spot={},o.spot.innerConeAngle=(1-e.penumbra)*e.angle,o.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),r[this.name]||(s.extensions=s.extensions||{},s.extensions[this.name]={lights:[]},r[this.name]=!0);let a=s.extensions[this.name].lights;a.push(o),t.extensions=t.extensions||{},t.extensions[this.name]={light:a.length-1}}},bu=class{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;let s=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},s[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}},wu=class{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.clearcoatFactor=e.clearcoat,e.clearcoatMap){let o={index:await n.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};n.applyTextureTransform(o,e.clearcoatMap),r.clearcoatTexture=o}if(r.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){let o={index:await n.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};n.applyTextureTransform(o,e.clearcoatRoughnessMap),r.clearcoatRoughnessTexture=o}if(e.clearcoatNormalMap){let o={index:await n.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(o.scale=e.clearcoatNormalScale.x),n.applyTextureTransform(o,e.clearcoatNormalMap),r.clearcoatNormalTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Tu=class{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;let s=this.writer.extensionsUsed,r={};r.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Au=class{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.iridescenceFactor=e.iridescence,e.iridescenceMap){let o={index:await n.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};n.applyTextureTransform(o,e.iridescenceMap),r.iridescenceTexture=o}if(r.iridescenceIor=e.iridescenceIOR,r.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],r.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){let o={index:await n.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};n.applyTextureTransform(o,e.iridescenceThicknessMap),r.iridescenceThicknessTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Eu=class{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.transmissionFactor=e.transmission,e.transmissionMap){let o={index:await n.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};n.applyTextureTransform(o,e.transmissionMap),r.transmissionTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Ru=class{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.thicknessFactor=e.thickness,e.thicknessMap){let o={index:await n.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};n.applyTextureTransform(o,e.thicknessMap),r.thicknessTexture=o}e.attenuationDistance!==1/0&&(r.attenuationDistance=e.attenuationDistance),r.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Cu=class{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;let s=this.writer.extensionsUsed,r={};r.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Iu=class{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(kM)&&!e.specularIntensityMap&&!e.specularColorMap)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.specularIntensityMap){let o={index:await n.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};n.applyTextureTransform(o,e.specularIntensityMap),r.specularTexture=o}if(e.specularColorMap){let o={index:await n.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};n.applyTextureTransform(o,e.specularColorMap),r.specularColorTexture=o}r.specularFactor=e.specularIntensity,r.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Pu=class{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.sheenRoughnessMap){let o={index:await n.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};n.applyTextureTransform(o,e.sheenRoughnessMap),r.sheenRoughnessTexture=o}if(e.sheenColorMap){let o={index:await n.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};n.applyTextureTransform(o,e.sheenColorMap),r.sheenColorTexture=o}r.sheenRoughnessFactor=e.sheenRoughness,r.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Lu=class{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.anisotropyMap){let o={index:await n.processTextureAsync(e.anisotropyMap)};n.applyTextureTransform(o,e.anisotropyMap),r.anisotropyTexture=o}r.anisotropyStrength=e.anisotropy,r.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Du=class{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;let s=this.writer.extensionsUsed,r={};r.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Nu=class{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.bumpMap){let o={index:await n.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};n.applyTextureTransform(o,e.bumpMap),r.bumpTexture=o}r.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Uu=class{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;let n=this.writer,s=e,r=new Float32Array(s.count*3),o=new Float32Array(s.count*4),a=new Float32Array(s.count*3),l=new je,c=new B,h=new $t,u=new B;for(let p=0;p<s.count;p++)s.getMatrixAt(p,l),l.decompose(c,h,u),c.toArray(r,p*3),h.toArray(o,p*4),u.toArray(a,p*3);let d={TRANSLATION:n.processAccessor(new Tt(r,3)),ROTATION:n.processAccessor(new Tt(o,4)),SCALE:n.processAccessor(new Tt(a,3))};s.instanceColor&&(d._COLOR_0=n.processAccessor(s.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:d},n.extensionsUsed[this.name]=!0,n.extensionsRequired[this.name]=!0}};gs.Utils={insertKeyframe:function(i,e){let n=i.getValueSize(),s=new i.TimeBufferType(i.times.length+1),r=new i.ValueBufferType(i.values.length+n),o=i.createInterpolant(new i.ValueBufferType(n)),a;if(i.times.length===0){s[0]=e;for(let l=0;l<n;l++)r[l]=0;a=0}else if(e<i.times[0]){if(Math.abs(i.times[0]-e)<.001)return 0;s[0]=e,s.set(i.times,1),r.set(o.evaluate(e),0),r.set(i.values,n),a=0}else if(e>i.times[i.times.length-1]){if(Math.abs(i.times[i.times.length-1]-e)<.001)return i.times.length-1;s[s.length-1]=e,s.set(i.times,0),r.set(i.values,0),r.set(o.evaluate(e),i.values.length),a=s.length-1}else for(let l=0;l<i.times.length;l++){if(Math.abs(i.times[l]-e)<.001)return l;if(i.times[l]<e&&i.times[l+1]>e){s.set(i.times.slice(0,l+1),0),s[l+1]=e,s.set(i.times.slice(l+1),l+2),r.set(i.values.slice(0,(l+1)*n),0),r.set(o.evaluate(e),(l+1)*n),r.set(i.values.slice((l+1)*n),(l+2)*n),a=l+1;break}}return i.times=s,i.values=r,a},mergeMorphTargetTracks:function(i,e){let t=[],n={},s=i.tracks;for(let r=0;r<s.length;++r){let o=s[r],a=vt.parseTrackName(o.name),l=vt.findNode(e,a.nodeName);if(a.propertyName!=="morphTargetInfluences"||a.propertyIndex===void 0){t.push(o);continue}if(o.createInterpolant!==o.InterpolantFactoryMethodDiscrete&&o.createInterpolant!==o.InterpolantFactoryMethodLinear){if(o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),o=o.clone(),o.setInterpolation(cs)}let c=l.morphTargetInfluences.length,h=l.morphTargetDictionary[a.propertyIndex];if(h===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+a.propertyIndex);let u;if(n[l.uuid]===void 0){u=o.clone();let p=new u.ValueBufferType(c*u.times.length);for(let x=0;x<u.times.length;x++)p[x*c+h]=u.values[x];u.name=(a.nodeName||"")+".morphTargetInfluences",u.values=p,n[l.uuid]=u,t.push(u);continue}let d=o.createInterpolant(new o.ValueBufferType(1));u=n[l.uuid];for(let p=0;p<u.times.length;p++)u.values[p*c+h]=d.evaluate(u.times[p]);for(let p=0;p<o.times.length;p++){let x=this.insertKeyframe(u,o.times[p]);u.values[x*c+h]=o.values[p]}}return i.tracks=t,i},toFloat32BufferAttribute:function(i){let e=new Tt(new Float32Array(i.count*i.itemSize),i.itemSize,!1);if(!i.normalized&&!i.isInterleavedBufferAttribute)return e.array.set(i.array),e;for(let t=0,n=i.count;t<n;t++)for(let s=0;s<i.itemSize;s++)e.setComponent(t,s,i.getComponent(t,s));return e}};var Ur={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var mn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},qM=new hs(-1,1,1,-1,0,1),Ou=class extends Et{constructor(){super(),this.setAttribute("position",new rt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new rt([0,2,0,0,2,0],2))}},ZM=new Ou,vi=class{constructor(e){this._mesh=new mt(ZM,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,qM)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Cl=class extends mn{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof Ft?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=bn.clone(e.uniforms),this.material=new Ft({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new vi(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var No=class extends mn{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Il=class extends mn{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Pl=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new pe);this._width=n.width,this._height=n.height,t=new sn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Bt}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Cl(Ur),this.copyPass.material.blending=nn,this.clock=new Dr}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}No!==void 0&&(o instanceof No?n=!0:o instanceof Il&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new pe);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Ll=class extends mn{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new We}render(e,t,n){let s=e.autoClear;e.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}};var Dl=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(e,t,n){return e[0]*t+e[1]*n}dot3(e,t,n,s){return e[0]*t+e[1]*n+e[2]*s}dot4(e,t,n,s,r){return e[0]*t+e[1]*n+e[2]*s+e[3]*r}noise(e,t){let n,s,r,o=.5*(Math.sqrt(3)-1),a=(e+t)*o,l=Math.floor(e+a),c=Math.floor(t+a),h=(3-Math.sqrt(3))/6,u=(l+c)*h,d=l-u,p=c-u,x=e-d,v=t-p,g,m;x>v?(g=1,m=0):(g=0,m=1);let w=x-g+h,S=v-m+h,_=x-1+2*h,D=v-1+2*h,I=l&255,A=c&255,T=this.perm[I+this.perm[A]]%12,b=this.perm[I+g+this.perm[A+m]]%12,y=this.perm[I+1+this.perm[A+1]]%12,E=.5-x*x-v*v;E<0?n=0:(E*=E,n=E*E*this.dot(this.grad3[T],x,v));let F=.5-w*w-S*S;F<0?s=0:(F*=F,s=F*F*this.dot(this.grad3[b],w,S));let U=.5-_*_-D*D;return U<0?r=0:(U*=U,r=U*U*this.dot(this.grad3[y],_,D)),70*(n+s+r)}noise3d(e,t,n){let s,r,o,a,c=(e+t+n)*.3333333333333333,h=Math.floor(e+c),u=Math.floor(t+c),d=Math.floor(n+c),p=1/6,x=(h+u+d)*p,v=h-x,g=u-x,m=d-x,w=e-v,S=t-g,_=n-m,D,I,A,T,b,y;w>=S?S>=_?(D=1,I=0,A=0,T=1,b=1,y=0):w>=_?(D=1,I=0,A=0,T=1,b=0,y=1):(D=0,I=0,A=1,T=1,b=0,y=1):S<_?(D=0,I=0,A=1,T=0,b=1,y=1):w<_?(D=0,I=1,A=0,T=0,b=1,y=1):(D=0,I=1,A=0,T=1,b=1,y=0);let E=w-D+p,F=S-I+p,U=_-A+p,k=w-T+2*p,G=S-b+2*p,V=_-y+2*p,$=w-1+3*p,X=S-1+3*p,j=_-1+3*p,P=h&255,W=u&255,ee=d&255,le=this.perm[P+this.perm[W+this.perm[ee]]]%12,Y=this.perm[P+D+this.perm[W+I+this.perm[ee+A]]]%12,te=this.perm[P+T+this.perm[W+b+this.perm[ee+y]]]%12,ne=this.perm[P+1+this.perm[W+1+this.perm[ee+1]]]%12,q=.6-w*w-S*S-_*_;q<0?s=0:(q*=q,s=q*q*this.dot3(this.grad3[le],w,S,_));let ve=.6-E*E-F*F-U*U;ve<0?r=0:(ve*=ve,r=ve*ve*this.dot3(this.grad3[Y],E,F,U));let Ee=.6-k*k-G*G-V*V;Ee<0?o=0:(Ee*=Ee,o=Ee*Ee*this.dot3(this.grad3[te],k,G,V));let Le=.6-$*$-X*X-j*j;return Le<0?a=0:(Le*=Le,a=Le*Le*this.dot3(this.grad3[ne],$,X,j)),32*(s+r+o+a)}noise4d(e,t,n,s){let r=this.grad4,o=this.simplex,a=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,h,u,d,p,x,v=(e+t+n+s)*l,g=Math.floor(e+v),m=Math.floor(t+v),w=Math.floor(n+v),S=Math.floor(s+v),_=(g+m+w+S)*c,D=g-_,I=m-_,A=w-_,T=S-_,b=e-D,y=t-I,E=n-A,F=s-T,U=b>y?32:0,k=b>E?16:0,G=y>E?8:0,V=b>F?4:0,$=y>F?2:0,X=E>F?1:0,j=U+k+G+V+$+X,P=o[j][0]>=3?1:0,W=o[j][1]>=3?1:0,ee=o[j][2]>=3?1:0,le=o[j][3]>=3?1:0,Y=o[j][0]>=2?1:0,te=o[j][1]>=2?1:0,ne=o[j][2]>=2?1:0,q=o[j][3]>=2?1:0,ve=o[j][0]>=1?1:0,Ee=o[j][1]>=1?1:0,Le=o[j][2]>=1?1:0,Je=o[j][3]>=1?1:0,fe=b-P+c,me=y-W+c,z=E-ee+c,Ne=F-le+c,_e=b-Y+2*c,Oe=y-te+2*c,Re=E-ne+2*c,Ze=F-q+2*c,Fe=b-ve+3*c,O=y-Ee+3*c,C=E-Le+3*c,J=F-Je+3*c,he=b-1+4*c,ge=y-1+4*c,ue=E-1+4*c,Ve=F-1+4*c,Ce=g&255,De=m&255,nt=w&255,we=S&255,He=a[Ce+a[De+a[nt+a[we]]]]%32,Ge=a[Ce+P+a[De+W+a[nt+ee+a[we+le]]]]%32,Xe=a[Ce+Y+a[De+te+a[nt+ne+a[we+q]]]]%32,ze=a[Ce+ve+a[De+Ee+a[nt+Le+a[we+Je]]]]%32,et=a[Ce+1+a[De+1+a[nt+1+a[we+1]]]]%32,Ye=.6-b*b-y*y-E*E-F*F;Ye<0?h=0:(Ye*=Ye,h=Ye*Ye*this.dot4(r[He],b,y,E,F));let Qe=.6-fe*fe-me*me-z*z-Ne*Ne;Qe<0?u=0:(Qe*=Qe,u=Qe*Qe*this.dot4(r[Ge],fe,me,z,Ne));let Z=.6-_e*_e-Oe*Oe-Re*Re-Ze*Ze;Z<0?d=0:(Z*=Z,d=Z*Z*this.dot4(r[Xe],_e,Oe,Re,Ze));let re=.6-Fe*Fe-O*O-C*C-J*J;re<0?p=0:(re*=re,p=re*re*this.dot4(r[ze],Fe,O,C,J));let ae=.6-he*he-ge*ge-ue*ue-Ve*Ve;return ae<0?x=0:(ae*=ae,x=ae*ae*this.dot4(r[et],he,ge,ue,Ve)),27*(h+u+d+p+x)}};var Uo={name:"SSAOShader",defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:32},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},kernel:{value:null},cameraNear:{value:null},cameraFar:{value:null},resolution:{value:new pe},cameraProjectionMatrix:{value:new je},cameraInverseProjectionMatrix:{value:new je},kernelRadius:{value:8},minDistance:{value:.005},maxDistance:{value:.05}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;

		uniform vec3 kernel[ KERNEL_SIZE ];

		uniform vec2 resolution;

		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;

		uniform float kernelRadius;
		uniform float minDistance; // avoid artifacts caused by neighbour fragments with minimal depth difference
		uniform float maxDistance; // avoid the influence of fragments which are too far away

		varying vec2 vUv;

		#include <packing>

		float getDepth( const in vec2 screenPosition ) {

			return texture2D( tDepth, screenPosition ).x;

		}

		float getLinearDepth( const in vec2 screenPosition ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, screenPosition ).x;

			#endif

		}

		float getViewZ( const in float depth ) {

			#if PERSPECTIVE_CAMERA == 1

				return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );

			#else

				return orthographicDepthToViewZ( depth, cameraNear, cameraFar );

			#endif

		}

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {

			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];

			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );

			clipPosition *= clipW; // unprojection.

			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;

		}

		vec3 getViewNormal( const in vec2 screenPosition ) {

			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );

		}

		void main() {

			float depth = getDepth( vUv );

			if ( depth == 1.0 ) {

				gl_FragColor = vec4( 1.0 ); // don't influence background
				
			} else {

				float viewZ = getViewZ( depth );

				vec3 viewPosition = getViewPosition( vUv, depth, viewZ );
				vec3 viewNormal = getViewNormal( vUv );

				vec2 noiseScale = vec2( resolution.x / 4.0, resolution.y / 4.0 );
				vec3 random = vec3( texture2D( tNoise, vUv * noiseScale ).r );

				// compute matrix used to reorient a kernel vector

				vec3 tangent = normalize( random - viewNormal * dot( random, viewNormal ) );
				vec3 bitangent = cross( viewNormal, tangent );
				mat3 kernelMatrix = mat3( tangent, bitangent, viewNormal );

				float occlusion = 0.0;

				for ( int i = 0; i < KERNEL_SIZE; i ++ ) {

					vec3 sampleVector = kernelMatrix * kernel[ i ]; // reorient sample vector in view space
					vec3 samplePoint = viewPosition + ( sampleVector * kernelRadius ); // calculate sample point

					vec4 samplePointNDC = cameraProjectionMatrix * vec4( samplePoint, 1.0 ); // project point and calculate NDC
					samplePointNDC /= samplePointNDC.w;

					vec2 samplePointUv = samplePointNDC.xy * 0.5 + 0.5; // compute uv coordinates

					float realDepth = getLinearDepth( samplePointUv ); // get linear depth from depth texture
					float sampleDepth = viewZToOrthographicDepth( samplePoint.z, cameraNear, cameraFar ); // compute linear depth of the sample view Z value
					float delta = sampleDepth - realDepth;

					if ( delta > minDistance && delta < maxDistance ) { // if fragment is before sample point, increase occlusion

						occlusion += 1.0;

					}

				}

				occlusion = clamp( occlusion / float( KERNEL_SIZE ), 0.0, 1.0 );

				gl_FragColor = vec4( vec3( 1.0 - occlusion ), 1.0 );

			}

		}`},Oo={name:"SSAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`uniform sampler2D tDepth;

		uniform float cameraNear;
		uniform float cameraFar;

		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, screenPosition ).x;

			#endif

		}

		void main() {

			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Fo={name:"SSAOBlurShader",uniforms:{tDiffuse:{value:null},resolution:{value:new pe}},vertexShader:`varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`uniform sampler2D tDiffuse;

		uniform vec2 resolution;

		varying vec2 vUv;

		void main() {

			vec2 texelSize = ( 1.0 / resolution );
			float result = 0.0;

			for ( int i = - 2; i <= 2; i ++ ) {

				for ( int j = - 2; j <= 2; j ++ ) {

					vec2 offset = ( vec2( float( i ), float( j ) ) ) * texelSize;
					result += texture2D( tDiffuse, vUv + offset ).r;

				}

			}

			gl_FragColor = vec4( vec3( result / ( 5.0 * 5.0 ) ), 1.0 );

		}`};var Bo=class i extends mn{constructor(e,t,n,s,r=32){super(),this.width=n!==void 0?n:512,this.height=s!==void 0?s:512,this.clear=!0,this.needsSwap=!1,this.camera=t,this.scene=e,this.kernelRadius=8,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this._visibilityCache=new Map,this.generateSampleKernel(r),this.generateRandomKernelRotations();let o=new br;o.format=as,o.type=os,this.normalRenderTarget=new sn(this.width,this.height,{minFilter:Ut,magFilter:Ut,type:Bt,depthTexture:o}),this.ssaoRenderTarget=new sn(this.width,this.height,{type:Bt}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),this.ssaoMaterial=new Ft({defines:Object.assign({},Uo.defines),uniforms:bn.clone(Uo.uniforms),vertexShader:Uo.vertexShader,fragmentShader:Uo.fragmentShader,blending:nn}),this.ssaoMaterial.defines.KERNEL_SIZE=r,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.normalMaterial=new dl,this.normalMaterial.blending=nn,this.blurMaterial=new Ft({defines:Object.assign({},Fo.defines),uniforms:bn.clone(Fo.uniforms),vertexShader:Fo.vertexShader,fragmentShader:Fo.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new Ft({defines:Object.assign({},Oo.defines),uniforms:bn.clone(Oo.uniforms),vertexShader:Oo.vertexShader,fragmentShader:Oo.fragmentShader,blending:nn}),this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new Ft({uniforms:bn.clone(Ur.uniforms),vertexShader:Ur.vertexShader,fragmentShader:Ur.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:$h,blendDst:_l,blendEquation:pi,blendSrcAlpha:Qh,blendDstAlpha:_l,blendEquationAlpha:pi}),this.fsQuad=new vi(null),this.originalClearColor=new We}dispose(){this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}render(e,t,n){switch(this.overrideVisibility(),this.renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility(),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this.renderPass(e,this.ssaoMaterial,this.ssaoRenderTarget),this.renderPass(e,this.blurMaterial,this.blurRenderTarget),this.output){case i.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=nn,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:n);break;case i.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=nn,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:n);break;case i.OUTPUT.Depth:this.renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:n);break;case i.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=nn,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:n);break;case i.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=Jh,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:n);break;default:console.warn("THREE.SSAOPass: Unknown output type.")}}renderPass(e,t,n,s,r){e.getClearColor(this.originalClearColor);let o=e.getClearAlpha(),a=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,s!=null&&(e.setClearColor(s),e.setClearAlpha(r||0),e.clear()),this.fsQuad.material=t,this.fsQuad.render(e),e.autoClear=a,e.setClearColor(this.originalClearColor),e.setClearAlpha(o)}renderOverride(e,t,n,s,r){e.getClearColor(this.originalClearColor);let o=e.getClearAlpha(),a=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,s=t.clearColor||s,r=t.clearAlpha||r,s!=null&&(e.setClearColor(s),e.setClearAlpha(r||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=a,e.setClearColor(this.originalClearColor),e.setClearAlpha(o)}setSize(e,t){this.width=e,this.height=t,this.ssaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.blurRenderTarget.setSize(e,t),this.ssaoMaterial.uniforms.resolution.value.set(e,t),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.blurMaterial.uniforms.resolution.value.set(e,t)}generateSampleKernel(e){let t=this.kernel;for(let n=0;n<e;n++){let s=new B;s.x=Math.random()*2-1,s.y=Math.random()*2-1,s.z=Math.random(),s.normalize();let r=n/e;r=Sn.lerp(.1,1,r*r),s.multiplyScalar(r),t.push(s)}}generateRandomKernelRotations(){let n=new Dl,s=16,r=new Float32Array(s);for(let o=0;o<s;o++){let a=Math.random()*2-1,l=Math.random()*2-1,c=0;r[o]=n.noise3d(a,l,c)}this.noiseTexture=new ki(r,4,4,ks,Gt),this.noiseTexture.wrapS=Wt,this.noiseTexture.wrapT=Wt,this.noiseTexture.needsUpdate=!0}overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(n){t.set(n,n.visible),(n.isPoints||n.isLine)&&(n.visible=!1)})}restoreVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(n){let s=t.get(n);n.visible=s}),t.clear()}};Bo.OUTPUT={Default:0,SSAO:1,Blur:2,Depth:3,Normal:4};var Xp={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var Nl=class extends mn{constructor(){super();let e=Xp;this.uniforms=bn.clone(e.uniforms),this.material=new fl({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new vi(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ct.getTransfer(this._outputColorSpace)===Mt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===eu?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===tu?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===nu?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Io?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===iu?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===su&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var ko={name:"SMAAEdgesShader",defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new pe(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},zo={name:"SMAAWeightsShader",defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new pe(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},Ul={name:"SMAABlendShader",uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new pe(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`};var Ol=class extends mn{constructor(e,t){super(),this.edgesRT=new sn(e,t,{depthBuffer:!1,type:Bt}),this.edgesRT.texture.name="SMAAPass.edges",this.weightsRT=new sn(e,t,{depthBuffer:!1,type:Bt}),this.weightsRT.texture.name="SMAAPass.weights";let n=this,s=new Image;s.src=this.getAreaTexture(),s.onload=function(){n.areaTexture.needsUpdate=!0},this.areaTexture=new Ht,this.areaTexture.name="SMAAPass.area",this.areaTexture.image=s,this.areaTexture.minFilter=wt,this.areaTexture.generateMipmaps=!1,this.areaTexture.flipY=!1;let r=new Image;r.src=this.getSearchTexture(),r.onload=function(){n.searchTexture.needsUpdate=!0},this.searchTexture=new Ht,this.searchTexture.name="SMAAPass.search",this.searchTexture.image=r,this.searchTexture.magFilter=Ut,this.searchTexture.minFilter=Ut,this.searchTexture.generateMipmaps=!1,this.searchTexture.flipY=!1,this.uniformsEdges=bn.clone(ko.uniforms),this.uniformsEdges.resolution.value.set(1/e,1/t),this.materialEdges=new Ft({defines:Object.assign({},ko.defines),uniforms:this.uniformsEdges,vertexShader:ko.vertexShader,fragmentShader:ko.fragmentShader}),this.uniformsWeights=bn.clone(zo.uniforms),this.uniformsWeights.resolution.value.set(1/e,1/t),this.uniformsWeights.tDiffuse.value=this.edgesRT.texture,this.uniformsWeights.tArea.value=this.areaTexture,this.uniformsWeights.tSearch.value=this.searchTexture,this.materialWeights=new Ft({defines:Object.assign({},zo.defines),uniforms:this.uniformsWeights,vertexShader:zo.vertexShader,fragmentShader:zo.fragmentShader}),this.uniformsBlend=bn.clone(Ul.uniforms),this.uniformsBlend.resolution.value.set(1/e,1/t),this.uniformsBlend.tDiffuse.value=this.weightsRT.texture,this.materialBlend=new Ft({uniforms:this.uniformsBlend,vertexShader:Ul.vertexShader,fragmentShader:Ul.fragmentShader}),this.fsQuad=new vi(null)}render(e,t,n){this.uniformsEdges.tDiffuse.value=n.texture,this.fsQuad.material=this.materialEdges,e.setRenderTarget(this.edgesRT),this.clear&&e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.materialWeights,e.setRenderTarget(this.weightsRT),this.clear&&e.clear(),this.fsQuad.render(e),this.uniformsBlend.tColor.value=n.texture,this.fsQuad.material=this.materialBlend,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(),this.fsQuad.render(e))}setSize(e,t){this.edgesRT.setSize(e,t),this.weightsRT.setSize(e,t),this.materialEdges.uniforms.resolution.value.set(1/e,1/t),this.materialWeights.uniforms.resolution.value.set(1/e,1/t),this.materialBlend.uniforms.resolution.value.set(1/e,1/t)}getAreaTexture(){return"data:image/png;base64,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"}getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}dispose(){this.edgesRT.dispose(),this.weightsRT.dispose(),this.areaTexture.dispose(),this.searchTexture.dispose(),this.materialEdges.dispose(),this.materialWeights.dispose(),this.materialBlend.dispose(),this.fsQuad.dispose()}};var Fu=class extends Bo{setSize(e,t){super.setSize(Math.max(1,Math.round(e*(this.scale??.5))),Math.max(1,Math.round(t*(this.scale??.5))))}};function Yp(i,e,t){let n=new qa({canvas:i,antialias:!1,powerPreference:"high-performance"});n.outputColorSpace=pt,n.toneMapping=Io,n.toneMappingExposure=1,n.shadowMap.enabled=!0,n.shadowMap.type=jh,n.shadowMap.autoUpdate=!1,n.info.autoReset=!1;let s=new Pl(n),r=new Fu(e,t,innerWidth,innerHeight,10);r.kernelRadius=.35,r.minDistance=.001,r.maxDistance=.07,s.addPass(new Ll(e,t)),s.addPass(r),s.addPass(new Ol(innerWidth,innerHeight)),s.addPass(new Nl);let o="auto",a=1,l=0,c=0,h=0,u=0,d=[];try{let w=localStorage.getItem("xuewuyou-library-quality");["auto","fluid","high"].includes(w)&&(o=w)}catch{}function p(){let w=Math.sqrt(2e6/(innerWidth*innerHeight)),S=Math.max(.65,Math.min(devicePixelRatio,a,w));n.setPixelRatio(S),n.setSize(innerWidth,innerHeight),s.setPixelRatio(S),s.setSize(innerWidth,innerHeight),h=performance.now()}function x(w,S=!0){if(o=["auto","fluid","high"].includes(w)?w:"auto",a=o==="high"?1.3:o==="fluid"?.85:1,r.enabled=o!=="fluid",r.scale=o==="high"?.65:.45,l=0,d.length=0,p(),S)try{localStorage.setItem("xuewuyou-library-quality",o)}catch{}}function v(w,S=!0){S&&w>0&&(d.push(w),d.length>240&&d.shift()),!(o!=="auto"||!S||performance.now()-h<1800)&&(l=w>30?l+w:Math.max(0,l-w),l>1600&&(r.enabled?(r.enabled=!1,a=.85):a=Math.max(.65,a-.1),l=0,p()))}function g(){let w=performance.now();n.info.reset(),s.render(),u=performance.now()-w}function m(){let w=d.slice().sort((_,D)=>_-D),S=w.length?w.reduce((_,D)=>_+D,0)/w.length:0;return{quality:o,exposure:n.toneMappingExposure,pixelRatio:n.getPixelRatio(),ambientOcclusion:r.enabled,buffer:[i.width,i.height],samples:w.length,fps:S?Math.round(1e4/S)/10:0,mean_ms:S,p95_ms:w[Math.min(w.length-1,Math.floor(w.length*.95))]||0,max_ms:w.at(-1)||0,drawCalls:n.info.render.calls,triangles:n.info.render.triangles,shadowUpdates:c,submit_ms:u}}return x(o,!1),{renderer:n,composer:s,resize:p,quality:x,frameTime:v,render:g,stats:m,shadow:()=>n.shadowMap.needsUpdate=!0,watchSun:w=>{let S=w.shadow.updateMatrices.bind(w.shadow);w.shadow.updateMatrices=(..._)=>(c++,S(..._))}}}var Ho=new B;function Wn(i,e,t,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),l=Math.PI/4;Ho.copy(e),Ho[n]=0,Ho.normalize();let c=.5*o/(o+a),h=1-Ho.angleTo(i)/l;return Math.sign(Ho[t])===1?h*c:a/(o+a)+c+c*(1-h)}var Or=class extends Mn{constructor(e=1,t=1,n=1,s=2,r=.1){if(s=s*2+1,r=Math.min(e/2,t/2,n/2,r),super(1,1,1,s,s,s),s===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new B,l=new B,c=new B(e,t,n).divideScalar(2).subScalar(r),h=this.attributes.position.array,u=this.attributes.normal.array,d=this.attributes.uv.array,p=h.length/6,x=new B,v=.5/s;for(let g=0,m=0;g<h.length;g+=3,m+=2)switch(a.fromArray(h,g),l.copy(a),l.x-=Math.sign(l.x)*v,l.y-=Math.sign(l.y)*v,l.z-=Math.sign(l.z)*v,l.normalize(),h[g+0]=c.x*Math.sign(a.x)+l.x*r,h[g+1]=c.y*Math.sign(a.y)+l.y*r,h[g+2]=c.z*Math.sign(a.z)+l.z*r,u[g+0]=l.x,u[g+1]=l.y,u[g+2]=l.z,Math.floor(g/p)){case 0:x.set(1,0,0),d[m+0]=Wn(x,l,"z","y",r,n),d[m+1]=1-Wn(x,l,"y","z",r,t);break;case 1:x.set(-1,0,0),d[m+0]=1-Wn(x,l,"z","y",r,n),d[m+1]=1-Wn(x,l,"y","z",r,t);break;case 2:x.set(0,1,0),d[m+0]=1-Wn(x,l,"x","z",r,e),d[m+1]=Wn(x,l,"z","x",r,n);break;case 3:x.set(0,-1,0),d[m+0]=1-Wn(x,l,"x","z",r,e),d[m+1]=1-Wn(x,l,"z","x",r,n);break;case 4:x.set(0,0,1),d[m+0]=1-Wn(x,l,"x","y",r,e),d[m+1]=1-Wn(x,l,"y","x",r,t);break;case 5:x.set(0,0,-1),d[m+0]=Wn(x,l,"x","y",r,e),d[m+1]=1-Wn(x,l,"y","x",r,t);break}}};function Tn(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,l=new Et,c=0;for(let h=0;h<i.length;++h){let u=i[h],d=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in u.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;r[p]===void 0&&(r[p]=[]),r[p].push(u.attributes[p]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in u.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[p]===void 0&&(o[p]=[]),o[p].push(u.morphAttributes[p])}if(e){let p;if(t)p=u.index.count;else if(u.attributes.position!==void 0)p=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,h),c+=p}}if(t){let h=0,u=[];for(let d=0;d<i.length;++d){let p=i[d].index;for(let x=0;x<p.count;++x)u.push(p.getX(x)+h);h+=i[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=qp(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let p=[];for(let v=0;v<o[h].length;++v)p.push(o[h][v][d]);let x=qp(p);if(!x)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(x)}}return l}function qp(i){let e,t,n,s=-1,r=0;for(let c=0;c<i.length;++c){let h=i[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}let o=new e(r),a=new Tt(o,t,n),l=0;for(let c=0;c<i.length;++c){let h=i[c];if(h.isInterleavedBufferAttribute){let u=l/t;for(let d=0,p=h.count;d<p;d++)for(let x=0;x<t;x++){let v=h.getComponent(d,x);a.setComponent(d+u,x,v)}}else o.set(h.array,l);l+=h.count*t}return s!==void 0&&(a.gpuType=s),a}function Bu(i,e){if(e===Mp)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Lo||e===Sl){let t=i.getIndex();if(t===null){let o=[],a=i.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);i.setIndex(o),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===Lo)for(let o=1;o<=n;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=i.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}var An,KM=new B(16,4.2,-4);function Wi(){return An?{policy:An.policy,level:An.level,nearLeaves:4480,farLeaves:2240,nearLeafTriangles:17920,farLeafTriangles:4480,farAfterMetres:30,nearBeforeMetres:26}:null}function Kp(i){let e=An;e&&(e.level=i,e.inst.geometry=i==="far"?e.far:e.near,e.inst.count=i==="far"?2240:4480,e.inst.computeBoundingSphere(),e.root.userData.foliageInstances=3356+e.inst.count,e.root.userData.allocatedFoliageInstances=7836,e.root.userData.sample.detail=Wi())}function Fl(i="auto"){return!An||!["auto","near","far"].includes(i)?!1:(An.policy=i,i!=="auto"?Kp(i):An.root.userData.sample.detail=Wi(),Wi())}function jp(i){let e=An;if(e){if(e.policy==="auto"){let t=i.position.distanceTo(KM),n=e.level==="near"?t>30?"far":"near":t<26?"near":"far";n!==e.level&&Kp(n)}return Wi()}}function Jp(i="near"){if(!An||!["near","far"].includes(i))return null;let e=An,t=new Ct;t.name="Tree 623 "+i+" editable variant",t.userData={...Wi(),variant:i},t.add(e.trunk.clone(!0));let n=e.inst.clone();return n.geometry=i==="far"?e.far:e.near,n.count=i==="far"?2240:4480,t.add(n),t}function Qp(){if(An){let i=An;(i.inst.geometry===i.near?i.far:i.near).dispose(),An=null}}function Zp(i){return()=>(i=Math.imul(i,1664525)+1013904223|0,(i>>>0)/4294967296)}function jM(){let i=document.createElement("canvas");i.width=128,i.height=256;let e=i.getContext("2d");e.fillStyle="#c1cba8",e.beginPath(),e.moveTo(64,12),e.bezierCurveTo(120,66,116,169,64,242),e.bezierCurveTo(12,169,8,66,64,12),e.fill(),e.strokeStyle="#7e9169",e.lineWidth=3,e.beginPath(),e.moveTo(64,25),e.lineTo(64,234),e.stroke(),e.lineWidth=1;for(let n=0;n<9;n++){let s=50+n*18;e.beginPath(),e.moveTo(64,s+13),e.lineTo(32,s-5),e.moveTo(64,s+13),e.lineTo(96,s-5),e.stroke()}let t=new pn(i);return t.colorSpace=pt,t.anisotropy=4,t}function JM(){let i=new Et;return i.setAttribute("position",new rt([0,-.12,0,-.045,0,-.012,0,0,.018,.045,0,-.012,0,.12,-.02],3)),i.setAttribute("uv",new rt([.5,0,0,.5,.5,.5,1,.5,.5,1],2)),i.setIndex([0,1,2,0,2,3,1,4,2,2,4,3]),i.computeVertexNormals(),i}function $p(i,e,t){let n=new Ct;n.name="Library landscape trees and planted beds",i.add(n);let s=new dn(.28,.5),r=s.clone().rotateY(Math.PI/2),o=Tn([s,r]);s.dispose(),r.dispose();let a=[],l=[],c=new It({name:"Tree bark",color:6576456,roughness:.98,map:e.map,normalMap:e.normalMap,normalScale:new pe(.2,.2)});function h(w,S,_,D,I){let A=_.clone().sub(S),T=new gi(I,D,A.length(),8,1),b=new mt(T,c);b.position.copy(S).add(_).multiplyScalar(.5),b.quaternion.setFromUnitVectors(new B(0,1,0),A.normalize()),b.updateMatrix(),w.push(T.applyMatrix4(b.matrix))}function u(w,S,_,D,I){let A=(y,E,F)=>new B(y,E,F),T=A(.16,I*.87,-.09);h(w,A(0,0,0),A(.1,2.7,-.05),.16,.1),h(w,A(.1,2.7,-.05),T,.1,.018);function b(y,E,F,U){for(let k=0;k<6;k++){let G=k*2.399963,V=y.clone().add(A(Math.cos(G)*E*.85,(k%3-1)*F*.75,Math.sin(G)*U*.85));h(w,y,V,.0045,.0012)}for(let k=0;k<160;k++){let G=S()*Math.PI*2,V=S()*2-1,$=Math.cbrt(S()),X=Math.sqrt(1-V*V);l.push({x:_+y.x+Math.cos(G)*X*$*E,y:-.3+y.y+V*$*F,z:D+y.z+Math.sin(G)*X*$*U,angle:S()*Math.PI*2,tilt:.4+S()*2.4,roll:S()*Math.PI*2,scale:.72+S()*.48,tint:S()})}}for(let y=0;y<8;y++){let E=y*2.399963+.35+S()*.35,F=1.65+S()*.5,U=A(.1,2.6+y*.25,-.05),k=A(Math.cos(E)*F*.58,3.35+y*.28,Math.sin(E)*F*.58),G=A(Math.cos(E)*F,3.9+y*.29,Math.sin(E)*F);h(w,U,k,.065-y*.004,.032),h(w,k,G,.032,.012);for(let V=0;V<3;V++){let $=E+(V-1)*.68,X=G.clone().add(A(Math.cos($)*.44,(V===1?.55:.15)+S()*.25,Math.sin($)*.44));h(w,G,X,.012,.003),b(X,.72+S()*.13,.52+S()*.12,.72+S()*.13)}}for(let y=0;y<4;y++){let E=A(Math.sin(y*2.4)*.65,4.35+y*.7,Math.cos(y*2.4)*.65),F=A(.13,E.y-.35,-.07);h(w,F,E,.02,.005),b(E,.9,.68,.9)}}for(let[w,S,_,D]of[[-16,-3,7.2,142],[16,-4,7.5,623],[-16,13,6.6,318]]){let I=Zp(D),A=[],T=new Ct;if(T.name="Library tree "+D,T.position.set(w,-.3,S),n.add(T),D===623)u(A,I,w,S,_);else{h(A,new B(0,0,0),new B(.16,_*.69,-.09),.16,.045);for(let E=0;E<11;E++){let F=E*2.399963+D,U=new B(.1,_*(.32+E*.027),-.05),k=1.8+(E<6?.6:0)+I()*.4,G=new B(Math.cos(F)*k,_*(.56+E*.029),Math.sin(F)*k);h(A,U,G,.055-E*.002,.012);for(let V=0;V<3;V++){let $=F+(V-1)*.65,X=G.clone().add(new B(Math.cos($)*.65,.4+I()*.4,Math.sin($)*.65));h(A,G,X,.013,.004);for(let j=0;j<46;j++){let P=I()*Math.PI*2,W=I()*2-1,ee=Math.cbrt(I())*.94,le=Math.sqrt(1-W*W);a.push({x:w+X.x+Math.cos(P)*le*ee,y:-.3+X.y+W*ee*.6,z:S+X.z+Math.sin(P)*le*ee,angle:I()*Math.PI*2,tilt:I()*.9-.45,scale:.65+I()*.7,tint:I()})}}}}let b=Tn(A);A.forEach(E=>E.dispose());let y=new mt(b,c);y.name="Connected trunk and branches",y.castShadow=!0,y.receiveShadow=!0,T.add(y),t(w,S,.42,.42,"tree")}for(let w of[-9,9]){let S=Zp(w<0?29:92);for(let _=0;_<160;_++)a.push({x:w+(S()-.5)*2.25,y:.58+S()*.28,z:12.5+(S()-.5)*.82,angle:S()*Math.PI*2,tilt:S()*1.3-.65,scale:.7+S()*.5,tint:S()})}let d=new It({name:"Botanical leaf cutouts",map:jM(),color:16777215,alphaTest:.45,side:Nt,roughness:.93,metalness:0}),p=new Hn(o,d,a.length),x=new At;p.name="Instanced tree and planter foliage",p.castShadow=!0,p.receiveShadow=!0;let v=new We(6388552),g=new We(10329956);a.forEach((w,S)=>{x.position.set(w.x,w.y,w.z),x.rotation.set(w.tilt,w.angle,w.tilt*.5),x.scale.setScalar(w.scale),x.updateMatrix(),p.setMatrixAt(S,x.matrix),p.setColorAt(S,v.clone().lerp(g,w.tint*.55))}),p.computeBoundingSphere(),n.add(p);let m=new Hn(JM(),d,l.length);m.name="East window sample cupped foliage",m.castShadow=!0,m.receiveShadow=!0;for(let w=0;w<l.length;w++){let S=l[w%28*160+Math.floor(w/28)];x.position.set(S.x,S.y,S.z),x.rotation.set(S.tilt,S.angle,S.roll),x.scale.setScalar(S.scale),x.updateMatrix(),m.setMatrixAt(w,x.matrix),m.setColorAt(w,v.clone().lerp(g,S.tint*.55))}return m.computeBoundingSphere(),n.add(m),n.userData={trees:3,foliageInstances:a.length+l.length,sample:{tree:623,leaves:l.length,bladeMetres:[.09,.24],clusters:28},source:"Procedural branches and leaf alpha, no external image dependency"},An={root:n,inst:m,near:m.geometry,far:new dn(.09*Math.SQRT2,.24*Math.SQRT2),trunk:n.children.find(w=>w.name==="Library tree 623"),policy:"auto",level:"near"},n.userData.sample.detail=Wi(),n}function em(i,e,t,n){function s(w,S,_){let D=new wo,I=-w/2,A=-S/2;return D.moveTo(I+_,A),D.lineTo(I+w-_,A),D.quadraticCurveTo(I+w,A,I+w,A+_),D.lineTo(I+w,A+S-_),D.quadraticCurveTo(I+w,A+S,I+w-_,A+S),D.lineTo(I+_,A+S),D.quadraticCurveTo(I,A+S,I,A+S-_),D.lineTo(I,A+_),D.quadraticCurveTo(I,A,I+_,A),D}function r(w,S,_,D){return new cl(s(w,S,D),{depth:_-.004,steps:1,bevelEnabled:!0,bevelThickness:.002,bevelSize:.002,bevelSegments:2,curveSegments:5}).translate(0,0,-_/2+.002)}function o(w){let S=w.attributes.position,_=w.attributes.uv;for(let D=0;D<S.count;D++)_.setXY(D,S.getX(D)/1.6,S.getY(D)/1.6)}function a(){let w=[],S=[],_=[];function T(U,k,G,V,$,X){let j=(U/20-.5)*G,P=Math.max(0,Math.abs(j)-(G/2-$)),W=V/2-$+Math.sqrt(Math.max(0,$*$-P*P)),ee=.673+(k/6*2-1)*W,le=.226+.48*(Math.sqrt(1-(j/.48)**2)-1)+(ee-.548)*.18+X;return w.push(j,ee,le),S.push(j/1.6,ee/1.6),w.length/3-1}let b=[];for(let U of[1,-1]){let k=[];for(let G=0;G<=20;G++)for(let V=0;V<=6;V++)k.push(T(G,V,.506,.246,.04,U*.006));b.push(k);for(let G=0;G<20;G++)for(let V=0;V<6;V++){let $=k[G*7+V],X=k[(G+1)*7+V],j=k[G*7+V+1],P=k[(G+1)*7+V+1];_.push(...U===1?[$,X,j,X,P,j]:[$,j,X,X,j,P])}}let y=[];for(let U=0;U<=20;U++)y.push([U,0]);for(let U=1;U<=6;U++)y.push([20,U]);for(let U=19;U>=0;U--)y.push([U,6]);for(let U=5;U>0;U--)y.push([0,U]);let E=[];for(let U of[1,-1])E.push(y.map(([k,G])=>T(k,G,.51,.25,.042,U*.004)));for(let U=0;U<y.length;U++){let k=(U+1)%y.length,[G,V]=y[U],[$,X]=y[k];for(let le of[0,1]){let Y=b[le][G*7+V],te=b[le][$*7+X],ne=E[le][U],q=E[le][k];_.push(...le===0?[Y,ne,te,te,ne,q]:[Y,te,ne,te,q,ne])}let j=E[0][U],P=E[0][k],W=E[1][U],ee=E[1][k];_.push(j,W,P,P,W,ee)}let F=new Et;return F.setAttribute("position",new rt(w,3)),F.setAttribute("uv",new rt(S,2)),F.setIndex(_),F.computeVertexNormals(),F}let l=a(),c=r(.48,.45,.012,.065);o(c),c.rotateX(-Math.PI/2).translate(0,.426,0);let h=r(.474,.444,.028,.063).rotateX(-Math.PI/2).translate(0,.446,0),u=[];for(let w of[-.18,.18])for(let S of[-.16,.16]){let _=new B(w,.425,S),D=new B(Math.sign(w)*.232,.012,Math.sign(S)*.205),I=_.clone().sub(D),A=new gi(.01,.012,I.length(),10,1),T=new je().compose(_.clone().add(D).multiplyScalar(.5),new $t().setFromUnitVectors(new B(0,1,0),I.normalize()),new B(1,1,1));u.push(A.applyMatrix4(T))}let d=Tn(u);u.forEach(w=>w.dispose());let p=[];for(let w of[-.19,.19]){let S=.226+.48*(Math.sqrt(1-(w/.48)**2)-1)+.020159999999999997,_=new So([new B(w,.423,.1),new B(w,.47,.176),new B(w,.57,S-.012),new B(w,.66,S-.004)]);p.push(new ul(_,9,.0105,8,!1))}let x=Tn(p);p.forEach(w=>w.dispose());let v=[];for(let w of[-.232,.232])for(let S of[-.205,.205])v.push(new gi(.014,.014,.014,10).translate(w,.007,S));let g=Tn(v);v.forEach(w=>w.dispose());let m=new Ct;m.name="Reusable bent oak reading chair",m.userData={design:"Curved plywood back, separate seat shell and thin pad, continuous brackets and splayed legs",seatTopMetres:.46,backTopMetres:.8,nominalWidthMetres:.51,seatDepthMetres:.45};for(let[w,S,_]of[["Curved oak backrest",l,i],["Rounded oak seat shell",c,i],["Thin sage seat pad",h,e],["Connected curved back brackets",x,t],["Four splayed metal legs",d,t],["Chair foot protectors",g,n]]){let D=new mt(S,_);D.name=w,D.castShadow=D.receiveShadow=!0,m.add(D)}return()=>m.clone(!0)}function tm(){let i=new Map;function e(A,T,b,y){let E=[A,T,b,y].join();return i.has(E)||i.set(E,new Or(A,T,b,1,y)),i.get(E)}function t(A,T,b,y=!0){let E=document.createElement("canvas");E.width=A,E.height=T,b(E.getContext("2d"),A,T);let F=new pn(E);return y&&(F.colorSpace=pt),F.anisotropy=8,F}let n=t(128,128,(A,T,b)=>{A.fillStyle="#888",A.fillRect(0,0,T,b);for(let y=0;y<b;y+=2)for(let E=0;E<T;E+=2){let F=112+(E*17+y*29)%33;A.fillStyle=`rgb(${F},${F},${F})`,A.fillRect(E,y,1,1)}},!1);n.wrapS=n.wrapT=Wt,n.repeat.set(18,24);let s=t(512,128,(A,T,b)=>{A.fillStyle="#e4dece",A.fillRect(0,0,T,b);for(let y=2;y<b;y+=2+y%3)A.fillStyle=y%3?"rgba(112,99,73,.15)":"rgba(255,253,239,.6)",A.fillRect(0,y,T,1);for(let y=0;y<1800;y++)A.fillStyle=y%2?"#f0eadd33":"#9d917711",A.fillRect(y*73%T,y*19%b,2,1)}),r=new It({name:"Book uncoated paper faces",color:15262420,roughness:.94}),o=new It({name:"Book layered paper edges",map:s,bumpMap:s,bumpScale:12e-5,roughness:.94}),a=[5467492,6584194,9601635,8474439,10657938,4083792],l=new It({name:"Clothbound book covers",bumpMap:n,bumpScale:18e-5,roughness:.86}),c=["\u8003\u7814\u771F\u9898","\u9AD8\u7B49\u6570\u5B66","\u6570\u5B66\u5206\u6790","\u9AD8\u7B49\u4EE3\u6570","\u6559\u6750\u4E60\u9898","\u7EBF\u6027\u4EE3\u6570","\u6982\u7387\u8BBA","\u5FAE\u79EF\u5206","\u96C5\u601D\u9605\u8BFB","\u96C5\u601D\u5199\u4F5C","\u8BCD\u6C47\u7B14\u8BB0","\u5907\u8003\u8D44\u6599","\u4E13\u9898\u9605\u8BFB","\u5B66\u4E60\u672D\u8BB0","\u65B9\u6CD5\u4E0E\u601D\u8003","\u77E5\u8BC6\u7D22\u5F15"],h=t(512,2048,A=>{A.textAlign="center",A.textBaseline="middle";for(let T=0;T<16;T++){let b=T%4*128,y=Math.floor(T/4)*512;A.fillStyle="#ded2b0",A.fillRect(b+16,y+42,96,3),A.fillRect(b+16,y+54,96,1),A.fillRect(b+16,y+438,96,2),A.font='36px "Noto Serif SC","SimSun",serif',[...c[T]].forEach((E,F)=>A.fillText(E,b+64,y+132+F*54)),A.font="23px serif",A.fillText("\xB7",b+64,y+388)}}),u=new It({name:"Book spine lettering atlas",map:h,alphaTest:.35,metalness:.12,roughness:.66}),d=[new Mn(.035,1,1).translate(-.4825,0,0),new Mn(.035,1,1).translate(.4825,0,0),new Mn(.93,1,.07).translate(0,0,.465)],p=Tn(d);d.forEach(A=>A.dispose());let x=new Mn(.925,.955,.91).translate(0,0,-.02);function v(A,T,b,y,E=0,F=0,U=0){let k=new mt(b,y);return k.name=T,k.position.set(E,F,U),k.castShadow=!0,k.receiveShadow=!0,A.add(k),k}function g(A,T,b,y){let F=new Hn(p,l,116),U=new Hn(x,r,116),k=[],G=new At;F.name="Instanced book covers "+T,U.name="Instanced book paper "+T,F.castShadow=U.castShadow=!0,F.receiveShadow=U.receiveShadow=!0;let V={exam:0,book:4,ielts:8,topic:12}[T]||0;for(let j=0;j<116;j++){let P=Math.floor(j/29),W=j%29,ee=(j*37+T.length*17)%97,le=.27+ee/97*.14;G.position.set(b-1.43+W*.101,.13+P*.48+le/2,y+.025),G.rotation.z=j%13===0?.06:0,G.scale.set(.07+ee/97*.025,le,.3+ee/97*.07),G.updateMatrix(),F.setMatrixAt(j,G.matrix),F.setColorAt(j,new We(a[j%a.length])),U.setMatrixAt(j,G.matrix);let Y=new dn(.82,.9),te=Y.attributes.uv,ne=V+j%4;for(let q=0;q<te.count;q++)te.setXY(q,(ne%4+te.getX(q))/4,(3-Math.floor(ne/4)+te.getY(q))/4);Y.translate(0,0,.501).applyMatrix4(G.matrix),k.push(Y)}A.add(F,U);let $=Tn(k);k.forEach(j=>j.dispose());let X=v(A,"Book spine titles "+T,$,u);X.castShadow=!1,A.userData.books={count:116,details:"separate cloth cases, inset paper and shared spine lettering atlas",titles:"collection subjects; not a one-to-one catalogue inventory"}}let m=[2640706,3361111],w=m.map((A,T)=>new It({name:"Guide "+(T+1)+" cloth binding",color:A,bumpMap:n,bumpScale:18e-5,roughness:.8})),S=new It({name:"Book recessed binding joint",color:2243123,roughness:.92}),_=new It({name:"Woven ochre reading ribbon",color:11834966,bumpMap:n,bumpScale:1e-4,roughness:.9,side:Nt}),D=[0,1].map(A=>new It({name:"Guide "+(A+1)+" cover lettering",map:t(512,768,T=>{T.strokeStyle="#c8b782",T.lineWidth=2,T.strokeRect(34,32,444,704),T.lineWidth=1,T.strokeRect(43,41,426,686),T.fillStyle="#e1d4ac",T.textAlign="center",T.font='29px "Microsoft YaHei",sans-serif',T.fillText("\u77E5\u8BC6\u56FE\u4E66\u9986",256,128),T.font='72px "Noto Serif SC","SimSun",serif',[...A?"\u9605\u8BFB\u4E0E\u601D\u8003":"\u9986\u85CF\u5BFC\u8BFB"].forEach((y,E)=>T.fillText(y,256,270+E*88)),T.font='22px "Microsoft YaHei",sans-serif',T.fillText(A?"\u7FFB\u5F00\u4E00\u4EFD\uFF0C\u5F00\u59CB\u9605\u8BFB":"\u771F\u9898  /  \u6559\u6750  /  \u4E13\u9898",256,650),T.font='24px "SimSun",serif',T.fillText("\u5B66 \u65E0 \u5FE7",256,700)}),alphaTest:.35,metalness:.3,roughness:.57}));function I(A,T,b,y){let E=new Ct;E.name="Detailed reading guide R"+T,E.position.set(b,.7785,y),E.userData={bookGuide:T,units:"metres",caseSize:[.25,.0335,.33],ribbonExtension:.04,lighting:"Real-time PBR; existing R1 GI context retained, no new lightmap"},A.add(E);let F=w[T-1];v(E,"Hardcover lower board",e(.25,.003,.33,.001),F,0,.0015),v(E,"Inset paper block",e(.235,.0275,.315,.001),[o,o,r,r,o,o],.001,.01675),v(E,"Hardcover upper board",e(.25,.003,.33,.001),F,0,.032),v(E,"Rounded cloth spine",e(.007,.032,.33,.0018),F,-.1215,.01675),v(E,"Recessed front hinge",e(.0012,4e-4,.318,1e-4),S,-.109,.0335);let U=v(E,"Printed cover and fine border",new dn(.249,.329),D[T-1],0,.0337);U.rotation.x=-Math.PI/2,U.castShadow=!1;for(let X of[-1,1])v(E,"Binding headband",e(.012,.002,.006,7e-4),_,-.113,.0295,X*.154);let k=new Et,G=[],V=[];for(let X=0;X<=4;X++){let j=.145+X*.015,P=.018-Math.max(0,j-.165)*.34;G.push(.035,P,j,.044,P,j),V.push(0,X/4,1,X/4)}k.setAttribute("position",new rt(G,3)),k.setAttribute("uv",new rt(V,2));let $=[];for(let X=0;X<4;X++){let j=X*2;$.push(j,j+1,j+2,j+1,j+3,j+2)}return k.setIndex($),k.computeVertexNormals(),v(E,"Ribbon bookmark",k,_),E}return{shelf:g,guide:I}}var nm=[{id:"theme-display",label:"\u4E3B\u9898\u9009\u8BFB\u9648\u5217\u67DC",short:"\u4E3B\u9898\u9009\u8BFB",description:"\u4ECE\u73B0\u6709\u672C\u5730\u9986\u85CF\u6311\u9009\u6B63\u6587\u9605\u8BFB",action:"\u7FFB\u5F00\u4E3B\u9898\u9009\u8BFB",anchor:[6.6,1.48,6.05],approach:{x:6.6,z:7.2},range:1.25},{id:"topic-display",label:"\u4E13\u9898\u9605\u89C8\u5C55\u67B6",short:"\u4E13\u9898\u9605\u89C8",description:"\u67E5\u770B\u771F\u5B9E\u4E13\u9898\u4E0E\u5FC3\u5F97\u5206\u7C7B",action:"\u67E5\u9605\u4E13\u9898\u4E0E\u5FC3\u5F97",category:"topic",anchor:[0,1.4,-7.85],approach:{x:0,z:-6.75},range:1.25}];function im({parent:i,materials:e,box:t,sign:n,obstacle:s}){let r=new Ct;r.name="Library facilities: displays, enquiry equipment and entry amenities",r.userData={units:"metres",lighting:"Real-time PBR; no new bake receivers",static:!0,mainAisleWidth:3,source:"Procedural geometry and local canvas lettering; no external assets"},i.add(r);let o=(P,W=0,ee=0)=>{let le=new Ct;return le.name=P,le.position.set(W,0,ee),r.add(le),le},a=(P,W,ee={})=>new It({name:P,color:W,roughness:.78,...ee}),l=a("Facility graphite polymer",2635316,{roughness:.68}),c=a("Facility warm enamel",14737363,{roughness:.56,metalness:.08}),h=a("Facility cork notice backing",10193255,{roughness:.98}),u=a("Indoor plant soil",4471851,{roughness:1}),d=a("Indoor plant stems",6977105,{roughness:.88}),p=a("Indoor plant satin leaves",16777215,{roughness:.65,side:Nt}),x=[3430734,4348786,10125136,8016720].map((P,W)=>a("Display cloth cover "+W,P));function v(P,W,ee,le,Y,te,ne){let q=new mt(ee,le);return q.name=W,q.position.set(Y,te,ne),q.castShadow=!0,q.receiveShadow=!0,P.add(q),q}function g(P,W,ee,le,Y,te,ne,q,ve=ee){return v(P,W,new gi(ee,ve,le,20),Y,te,ne,q)}function m(P,W,ee,le,Y,te){let ne=new B(...ee),q=new B(...le),ve=q.clone().sub(ne),Ee=v(P,W,new gi(Y,Y,ve.length(),8),te,...ne.add(q).multiplyScalar(.5).toArray());return Ee.quaternion.setFromUnitVectors(new B(0,1,0),ve.normalize()),Ee}function w(P,W,ee){let le=document.createElement("canvas");le.width=P,le.height=W,ee(le.getContext("2d"),P,W);let Y=new pn(le);return Y.colorSpace=pt,Y.anisotropy=8,Y}let S=w(1024,1024,P=>{let W=["#34594e","#425b72","#9a7f50","#7a5350"],ee=["\u6570\u5B66","\u8BED\u8A00","\u4E13\u9898","\u65B9\u6CD5"];for(let le=0;le<4;le++){let Y=le%2*512,te=Math.floor(le/2)*512;P.fillStyle=W[le],P.fillRect(Y,te,512,512),P.strokeStyle="#e1d4b1",P.lineWidth=2,P.strokeRect(Y+28,te+28,456,456),P.fillStyle="#eee6d2",P.textAlign="left",P.font='24px "Microsoft YaHei",sans-serif',P.fillText("\u9986\u85CF\u4E3B\u9898\u5BFC\u89C8",Y+52,te+85),P.font='68px "SimSun",serif',P.fillText(ee[le],Y+52,te+197),P.lineWidth=1.5;for(let ne=0;ne<5;ne++)P.beginPath(),P.arc(Y+340,te+310,58+ne*15,0,Math.PI*1.5),P.stroke();P.font='21px "Microsoft YaHei",sans-serif',P.fillText("\u9605\u8BFB \xB7 \u53D1\u73B0 \xB7 \u601D\u8003",Y+52,te+452)}}),_=a("Facility themed cover atlas",16777215,{map:S,roughness:.85}),D=[];for(let P=0;P<4;P++){let W=new dn(.242,.316),ee=W.attributes.uv;for(let le=0;le<ee.count;le++)ee.setXY(le,(P%2+ee.getX(le))/2,(1-Math.floor(P/2)+ee.getY(le))/2);D.push(W)}function I(P,W,ee,le,Y,te=-.28){let ne=new Ct;ne.name="Thematic collection booklet",ne.position.set(ee,le,Y),ne.rotation.x=te,P.add(ne),t(ne,"Booklet inset paper",0,0,0,.232,.305,.014,e.paper,.001);for(let q of[-1,1])t(ne,"Booklet cloth board",0,0,q*.009,.248,.322,.003,x[W%4],.001);t(ne,"Booklet binding",-.122,0,0,.005,.322,.021,x[W%4],.001),v(ne,"Printed thematic cover",D[W%4],_,0,0,.0106).castShadow=!1}let A=o("Theme reading display",6.6,5.95);for(let P of[-1.68,1.68])t(A,"Display oak side",P,.66,0,.055,1.23,.68,e.wood);t(A,"Display inset backing",0,.66,-.31,3.34,1.22,.035,e.wood),t(A,"Display recessed plinth",0,.065,-.02,3.15,.13,.55,l);for(let P of[.16,.55])t(A,"Display storage shelf",0,P,0,3.35,.035,.66,e.wood);for(let P of[-.56,.56])t(A,"Storage vertical divider",P,.35,0,.028,.37,.64,e.wood);for(let P of[.68,1.07]){let W=t(A,"Inclined display oak board",0,P,-.04,3.35,.027,.54,e.wood);W.rotation.x=-.28,t(A,"Rounded display retaining lip",0,P+.09,.225,3.35,.06,.028,e.wood,.01)}for(let P=0;P<2;P++)for(let W=0;W<4;W++)I(A,(W+P)%4,(W-1.5)*.72,.925+P*.39,.15);for(let P of[-1.32,-.2,1.06])for(let W=0;W<3;W++){let ee=t(A,"Stored guide cloth cover",P,.193+W*.027,.04,.36,.006,.29,x[(W+1)%4]);ee.rotation.y=.04*(W-1),t(A,"Stored guide paper edge",P,.202+W*.027,.04,.348,.014,.275,e.paper,.001)}t(A,"Display solid oak header",0,1.53,-.29,3.42,.27,.045,e.wood);for(let P of[-1.4,1.4])t(A,"Header connected mounting post",P,1.33,-.29,.025,.55,.025,e.metal);n(A,"\u4E3B \u9898 \u9009 \u8BFB",0,1.53,-.262,3.15,.23),s(6.6,5.95,3.44,.76,"facility theme display");let T=o("Topic publication sideboard",0,-8.22);for(let P of[-2.05,2.05])t(T,"Sideboard end panel",P,.55,0,.055,.96,.64,e.wood);t(T,"Sideboard back",0,.55,-.29,4.1,.96,.03,e.wood),t(T,"Sideboard top slab",0,1.05,0,4.22,.045,.7,e.wood,.012),t(T,"Sideboard lower shelf",0,.17,0,4.1,.035,.62,e.wood),t(T,"Sideboard recessed toe",0,.07,-.04,3.96,.14,.51,l);for(let P=0;P<4;P++){let W=(P-1.5)*1.02;t(T,"Inset cabinet door",W,.59,.287,.992,.77,.028,e.wood,.004),t(T,"Recessed cabinet finger pull",W,.895,.306,.22,.012,.009,e.metal,.003)}for(let P=0;P<6;P++){let W=(P-2.5)*.58,ee=t(T,"Angled publication support",W,1.24,-.05,.36,.37,.018,c);ee.rotation.x=-.2,t(T,"Publication retaining ledge",W,1.08,.04,.38,.027,.09,e.metal),I(T,P%4,W,1.255,-.005,-.2)}n(T,"\u4E13\u9898\u9605\u89C8",0,1.68,-.12,1.4,.22);for(let P of[-.62,.62])t(T,"Topic sign bracket",P,1.49,-.14,.016,.29,.025,e.metal);s(0,-8.22,4.25,.76,"facility topic sideboard");let b=o("Catalogue desk equipment",-7,6.3),y=w(768,512,P=>{P.fillStyle="#e9ece3",P.fillRect(0,0,768,512),P.fillStyle="#2b5146",P.fillRect(0,0,768,100),P.fillStyle="#f6f3e8",P.font='42px "Microsoft YaHei",sans-serif',P.fillText("\u77E5\u8BC6\u56FE\u4E66\u9986",38,67),P.fillStyle="#243c34",P.font='36px "Microsoft YaHei",sans-serif',P.fillText("\u9986\u85CF\u68C0\u7D22",38,176),P.strokeStyle="#95a499",P.lineWidth=2,P.strokeRect(38,213,692,61),P.fillStyle="#64756b",P.font='25px "Microsoft YaHei",sans-serif',P.fillText("\u8D44\u6599\u540D\u79F0 / \u9662\u6821 / \u5E74\u4EFD",58,254),P.fillText("\u8003\u7814\u771F\u9898    \u6559\u6750\u4E60\u9898",38,335),P.fillText("\u96C5\u601D\u5907\u8003    \u4E13\u9898\u5FC3\u5F97",38,385),P.fillStyle="#2b5146",P.font='26px "Microsoft YaHei",sans-serif',P.fillText("\u8D70\u8FD1\u68C0\u7D22\u53F0\uFF0C\u6309 E \u67E5\u9605",38,468)}),E=a("Catalogue terminal printed interface",16777215,{map:y,roughness:.4,emissive:16777215,emissiveMap:y,emissiveIntensity:.12});t(b,"Monitor weighted base",.9,1.102,0,.38,.035,.26,e.metal),t(b,"Monitor support neck",.9,1.24,-.035,.04,.26,.045,e.metal),t(b,"Monitor bezel",.9,1.5,-.045,.64,.445,.045,l,.012),v(b,"Catalogue terminal display",new dn(.595,.397),E,.9,1.5,-.0205).castShadow=!1,g(b,"Display camera dot",.004,.003,l,.9,1.705,-.019).rotation.x=Math.PI/2,t(b,"Keyboard frame",.87,1.104,.265,.48,.025,.135,l,.008);for(let P=0;P<3;P++)for(let W=0;W<12;W++)t(b,"Keyboard keycap",.664+W*.037,1.12,.226+P*.035,.03,.005,.024,c,.002);t(b,"Keyboard space bar",.87,1.122,.32,.18,.004,.018,c,.002),g(b,"Recessed cable grommet",.025,.004,l,1.3,1.083,-.15),m(b,"Screen cable to grommet",[.9,1.15,-.06],[1.3,1.084,-.15],.004,l),t(b,"Enquiry document tray base",-.9,1.1,.1,.42,.025,.32,e.metal);for(let P of[-1.105,-.695])t(b,"Document tray side",P,1.137,.1,.012,.07,.32,e.metal);t(b,"Document tray back",-.9,1.137,-.055,.42,.07,.012,e.metal);for(let P=0;P<4;P++)t(b,"Stacked enquiry forms",-.9+P*.002,1.116+P*.002,.09,.35,.001,.26,e.paper,2e-4);g(b,"Pen holder base",.037,.012,e.metal,-.49,1.094,.08);let F=[[.034,0],[.034,.09],[.031,.09],[.031,.007]].map(P=>new pe(...P));v(b,"Hollow pen holder",new bo(F,16),e.metal,-.49,1.1,.08);for(let P=0;P<3;P++)m(b,"Desk pencil",[-.506+P*.015,1.112,.075],[-.511+P*.018,1.265,.065+P*.008],.0038,x[P]);let U=o("Parked reading trolley",-10.6,5.85);for(let P of[-.33,.33])for(let W of[-.22,.22]){t(U,"Castor fork",P,.095,W,.046,.065,.028,e.metal);let ee=g(U,"Rubber castor wheel",.042,.025,l,P,.043,W);ee.rotation.z=Math.PI/2,m(U,"Castor axle",[P-.025,.043,W],[P+.025,.043,W],.007,e.metal),t(U,"Trolley upright",P,.54,W,.026,.89,.026,e.metal)}for(let P of[.22,.58,.94]){t(U,"Trolley oak shelf",0,P,0,.72,.028,.51,e.wood);for(let W of[-.25,.25])t(U,"Trolley retaining rail",0,P+.04,W,.73,.06,.018,e.metal)}m(U,"Trolley push handle",[-.33,1.09,-.22],[.33,1.09,-.22],.016,e.metal);for(let P of[-.33,.33])m(U,"Handle connected support",[P,.94,-.22],[P,1.09,-.22],.013,e.metal);for(let P=0;P<5;P++)t(U,"Sorted books in trolley",(P-2)*.1,.375,.015,.065,.27,.28,x[P%4]);n(U,"\u9605\u540E\u5F52\u4F4D",0,.82,.265,.58,.12),s(-10.6,5.85,.83,.66,"facility parked trolley");let k=o("Entry library notice",-3.3,6.5);for(let P of[-.43,.43])t(k,"Notice stand connected leg",P,.83,0,.026,1.56,.026,e.metal);for(let P of[-.43,.43])t(k,"Notice stand stabilising foot",P,.035,0,.13,.055,.53,e.metal);t(k,"Notice oak frame",0,1.3,0,1.05,.82,.045,e.wood),t(k,"Notice inset cork",0,1.3,.025,.98,.75,.012,h),n(k,"\u8F7B\u58F0\u9605\u8BFB \xB7 \u7269\u54C1\u968F\u8EAB",0,1.43,.033,.88,.17),n(k,"\u4E66\u67B6\u67E5\u9605    \u7A97\u8FB9\u5165\u5EA7",0,1.22,.034,.88,.15),n(k,"\u9605\u8BFB\u540E\u8BF7\u5C06\u8D44\u6599\u5F52\u4F4D",0,1.04,.034,.88,.12),s(-3.3,6.5,1.1,.56,"facility notice stand");let G=new Et,V=[],$=[],X=[];for(let P=0;P<=8;P++){let W=P/8,ee=Math.sin(Math.PI*W)**.8*.085,le=Math.sin(Math.PI*W)*.035;for(let Y of[-1,0,1])V.push(Y*ee,W*.34,le+(Y===0?.012:0)),$.push((Y+1)/2,W);if(P<8)for(let Y=0;Y<2;Y++){let te=P*3+Y;X.push(te,te+1,te+3,te+1,te+4,te+3)}}G.setAttribute("position",new rt(V,3)),G.setAttribute("uv",new rt($,2)),G.setIndex(X),G.computeVertexNormals();let j=[[-10.7,-7.75,1.85],[10.6,-1.05,1.9],[-10.65,3.4,1.65]];for(let[P,W,ee]of j){let le=o("Indoor botanical planter",P,W),Y=[[.23,.025],[.255,.05],[.3,.43],[.3,.46],[.275,.46],[.27,.41],[.235,.07]].map(ve=>new pe(...ve));v(le,"Ceramic planter with rolled rim",new bo(Y,24),c,0,0,0),g(le,"Inset potting soil",.271,.025,u,0,.405,0),g(le,"Planter foot ring",.2,.025,l,0,.018,0);let te=42,ne=new Hn(G,p,te),q=new At;ne.name="Curved botanical leaf instances",ne.castShadow=ne.receiveShadow=!0;for(let ve=0;ve<3;ve++){let Ee=ve*2.1,Le=ee-ve*.12,Je=Math.cos(Ee)*.08,fe=Math.sin(Ee)*.08;m(le,"Connected plant stem",[Je*.5,.41,fe*.5],[Je,Le,fe],.009,d);for(let me=0;me<14;me++){let z=me*2.4+Ee,Ne=.68+(Le-.72)*me/14,_e=.1+me%3*.018,Oe=Je+Math.cos(z)*_e,Re=fe+Math.sin(z)*_e;m(le,"Leaf petiole",[Je,Ne,fe],[Oe,Ne+.06,Re],.0035,d),q.position.set(Oe,Ne+.06,Re),q.quaternion.setFromUnitVectors(new B(0,1,0),new B(Math.cos(z)*.92,.38+Math.sin(me)*.15,Math.sin(z)*.92).normalize()),q.scale.setScalar(.72+me*7%11/30),q.updateMatrix(),ne.setMatrixAt(ve*14+me,q.matrix),ne.setColorAt(ve*14+me,new We().setHSL(.24+me%4*.009,.28,.19+me%5*.025))}}le.add(ne),s(P,W,.72,.72,"facility indoor planter")}r.userData.facilities=["theme-display","topic-sideboard","catalogue-terminal","reading-trolley","entry-notice","indoor-planters"],r.updateMatrixWorld(!0);for(let P of r.children){let W=new Map,ee=P.matrixWorld.clone().invert();P.traverse(le=>{if(!le.isMesh||le.isInstancedMesh||Array.isArray(le.material))return;let Y=W.get(le.material)||[];Y.push(le),W.set(le.material,Y)});for(let[le,Y]of W){if(Y.length<2)continue;let te=Y.map(ve=>{let Ee=ve.geometry.clone().applyMatrix4(new je().multiplyMatrices(ee,ve.matrixWorld));if(Ee.index){let Le=Ee.toNonIndexed();Ee.dispose(),Ee=Le}return Ee}),ne=Tn(te);if(te.forEach(ve=>ve.dispose()),!ne)throw Error("Unable to batch facility "+P.name);let q=v(P,P.name+" / "+le.name,ne,le,0,0,0);q.userData.components=Y.map(ve=>ve.name),Y.forEach(ve=>ve.removeFromParent())}}return r}var zu={width:24,depth:18,clearHeight:4.4,doorWidth:2.8,mainAisle:3,units:"metres"},Vo=[],Go=[],Wo=[],gn=new Ct;gn.name="Wenku_Editable_Library";gn.userData={...zu,lighting:"New library geometry; realtime sun + environment + screen space ambient occlusion. No classroom lightmap."};var ye={},zs,sm,Xi={},am=tm();function lm(){return{textures:Object.values(Xi),materials:[ye.previousSampleGlass].filter(Boolean)}}function Hu(i="final"){return["baseline","contact","final"].includes(i)?(ye.sampleWood.map=i==="final"?Xi.tableFinal:Xi.tableBaseline,ye.chairWood.map=i==="final"?Xi.chairFinal:Xi.chairBaseline,{mode:i,localFillCandela:i==="baseline"?0:26,contactShadowMap:1024,globalExposure:1}):!1}function cm(i="clear"){return!zs||!["none","previous","clear"].includes(i)?!1:(zs.visible=i!=="none",zs.material=i==="previous"?ye.previousSampleGlass:ye.sampleGlass,{mode:i,geometryThicknessMetres:.012,materialThickness:zs.material.thickness,roughness:zs.material.roughness,transmission:zs.material.transmission})}var QM=new URL("../campus-3d-v5/assets/",document.baseURI),rm=new Map;function si(i,e=gn){let t=new Ct;return t.name=i,e.add(t),t}function Xn(i,e,t,n,s){let r={x:i,z:e,w:t,d:n,id:s,minX:i-t/2,maxX:i+t/2,minZ:e-n/2,maxZ:e+n/2};return Vo.push(r),r}async function hm({assetRoot:i=QM}={}){let e=new Rr;async function t(T,b=!1){let y=await e.loadAsync(new URL(T+".jpg",i).href);return y.wrapS=y.wrapT=Wt,y.anisotropy=4,b&&(y.colorSpace=pt),y}let[n,s,r,o,a,l,c,h]=await Promise.all([t("wood-color",!0),t("wood-normal"),t("wood-roughness"),t("stone-normal"),t("stone-roughness"),t("brick-color",!0),t("brick-normal"),t("brick-roughness")]),u=(T,b,y={})=>new It({name:T,color:b,roughness:.8,...y});function d(T){let b=document.createElement("canvas");b.width=b.height=1024;let y=b.getContext("2d"),E=T==="stone"?["#d0cbbd","#cdc8b9","#cecabc","#d2cdbf"]:["#c0c3bd","#c5c7c0","#c2c5be","#c4c6c0"];y.fillStyle=T==="stone"?"#b6b2a7":"#9fa69d",y.fillRect(0,0,1024,1024);for(let U=0;U<2;U++)for(let k=0;k<2;k++)y.fillStyle=E[U*2+k],y.fillRect(k*512+1,U*512+1,510,510);for(let U=0;U<14e3;U++)y.fillStyle=U%2?"rgba(255,255,249,.07)":"rgba(78,84,73,.035)",y.fillRect(U*61%1024,U*131%1024,T==="stone"?3:2,1);let F=new pn(b);return F.colorSpace=pt,F.wrapS=F.wrapT=Wt,F.anisotropy=8,F}ye.stone=u("Cream limestone",16777215,{map:d("stone"),normalMap:o,normalScale:new pe(.025,.025),roughnessMap:a,roughness:.8}),ye.floor=u("Honed grey stone",16777215,{map:d("floor"),normalMap:o,normalScale:new pe(.008,.008),roughness:.54}),ye.grout=u("Stone floor joints",9279633,{roughness:.9}),ye.brick=u("Grey brick",13027781,{map:l,normalMap:c,normalScale:new pe(.14,.14),roughnessMap:h}),ye.wood=u("White oak veneer",16772822,{map:n,normalMap:s,normalScale:new pe(.08,.08),roughnessMap:r,roughness:.7}),ye.metal=u("Dark bronze powder coating",3490367,{metalness:.32,roughness:.43}),ye.roof=u("Blue grey standing seam roof",6518659,{metalness:.66,roughness:.46}),ye.plaster=u("Mineral plaster and acoustic ceiling",15329246);let p=document.createElement("canvas");p.width=p.height=64;let x=p.getContext("2d");x.fillStyle="#a7afa0",x.fillRect(0,0,64,64),x.fillStyle="#778573";for(let T=0;T<64;T+=4)x.fillRect(T,0,1,64),x.fillRect(0,T,64,1);let v=new pn(p);v.wrapS=v.wrapT=Wt,v.repeat.set(24,24),v.anisotropy=4,ye.fabric=u("Sage woven upholstery",8160627,{bumpMap:v,bumpScale:.003,roughness:.91}),ye.paper=u("Paper edges",15591901,{roughness:.95}),ye.light=u("Linear LED diffuser",16774109,{emissive:16772039,emissiveIntensity:1.4}),ye.glass=new en({name:"Clear architectural glass",color:13952999,transparent:!0,opacity:.14,roughness:.09,metalness:.1,depthWrite:!1,side:Nt}),ye.sampleWood=ye.wood.clone(),ye.sampleWood.name="Sample R1 longitudinal white oak",ye.sampleWood.roughness=.76;for(let T of["map","normalMap","roughnessMap"]){let b=ye.wood[T].clone();b.center.set(.5,.5),b.rotation=Math.PI/2,b.needsUpdate=!0,ye.sampleWood[T]=b}let g=document.createElement("canvas");g.width=g.height=64;let m=g.getContext("2d"),w=m.createImageData(64,64);for(let T=0;T<64;T++)for(let b=0;b<64;b++){let y=(T*64+b)*4;w.data[y]=128+Math.round(Math.sin(b*Math.PI/2)*18),w.data[y+1]=128+Math.round(Math.sin(T*Math.PI/2)*18),w.data[y+2]=254,w.data[y+3]=255}m.putImageData(w,0,0);let S=new pn(g);S.wrapS=S.wrapT=Wt,S.repeat.set(48,48),S.anisotropy=4,ye.sampleFabric=u("Sample R1 sage fine woven upholstery",8160627,{normalMap:S,normalScale:new pe(.16,.16),roughness:.95}),ye.sampleGlass=new en({name:"Sample east pane 12mm clear glass",color:16777215,transmission:.96,thickness:.012,ior:1.5,roughness:.008,metalness:0,attenuationColor:new We(15266025),attenuationDistance:6,depthWrite:!1,side:Nt}),ye.previousSampleGlass=ye.sampleGlass.clone(),ye.previousSampleGlass.name="Previous sample glass diagnostic",ye.sampleGlass.side=Bn,ye.sampleGlass.onBeforeCompile=T=>{T.fragmentShader=T.fragmentShader.replace("#include <transmission_pars_fragment>",tt.transmission_pars_fragment.replace("return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );",`if ( lod < 0.75 ) return textureLod( transmissionSamplerMap, fragCoord.xy, 0.0 );
 return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );`))},ye.sampleGlass.customProgramCacheKey=()=>"library-polished-pane-r170-base-level-v1",ye.sampleGlass.userData={geometryThicknessMetres:.012,opticalThicknessMetres:.012,runtimeSampling:"r170 polished-pane base LOD below .75; standard physical glTF fallback"},ye.chairWood=ye.sampleWood.clone(),ye.chairWood.name="Pale bent oak chair veneer",ye.chairWood.roughness=.78,ye.chairWood.normalScale.set(.045,.045);let _=document.createElement("canvas");_.width=n.image.width,_.height=n.image.height;let D=_.getContext("2d");D.drawImage(n.image,0,0),D.fillStyle="rgba(234,220,197,.28)",D.fillRect(0,0,_.width,_.height);let I=new pn(_);I.colorSpace=pt,I.wrapS=I.wrapT=Wt,I.center.set(.5,.5),I.rotation=Math.PI/2,I.anisotropy=4,ye.chairWood.map=I;function A(T){let b=document.createElement("canvas");b.width=n.image.width,b.height=n.image.height;let y=b.getContext("2d");y.drawImage(n.image,0,0),y.fillStyle=`rgba(234,220,197,${T})`,y.fillRect(0,0,b.width,b.height);let E=new pn(b);return E.colorSpace=pt,E.wrapS=E.wrapT=Wt,E.center.set(.5,.5),E.rotation=Math.PI/2,E.anisotropy=4,E}return Xi.tableBaseline=ye.sampleWood.map,Xi.chairBaseline=ye.chairWood.map,Xi.tableFinal=A(.18),Xi.chairFinal=A(.4),Hu("final"),ye}function qe(i,e,t,n,s,r,o,a,l,c=.008){let h=[r,o,a,c].join(","),u=rm.get(h);if(!u){u=c?new Or(r,o,a,1,Math.min(c,r/4,o/4,a/4)):new Mn(r,o,a);let p=u.attributes.position,x=u.attributes.normal,v=u.attributes.uv;for(let g=0;g<p.count;g++){let m=Math.abs(x.getX(g)),w=Math.abs(x.getY(g)),S=Math.abs(x.getZ(g));v.setXY(g,(m>w&&m>S?p.getZ(g):p.getX(g))/1.6,(w>m&&w>S?p.getZ(g):p.getY(g))/1.6)}rm.set(h,u)}let d=new mt(u,l);return d.name=e,d.position.set(t,n,s),d.castShadow=!l.transparent&&!l.transmission,d.receiveShadow=!0,i.add(d),d}function Hs(i,e,t,n,s,r,o,a=0){let l=document.createElement("canvas");l.width=1024,l.height=256;let c=l.getContext("2d");c.fillStyle="#edece3",c.fillRect(0,0,1024,256),c.fillStyle="#172e26",c.textAlign="center",c.textBaseline="middle",c.font='700 104px "Microsoft YaHei",sans-serif',c.fillText(e,512,128,970);let h=new pn(l);h.colorSpace=pt;let u=new mt(new dn(r,o),new It({name:"Wayfinding: "+e,map:h,roughness:.85}));return u.name="Sign "+e,u.position.set(t,n,s),u.rotation.y=a,i.add(u),u}function ku(i,e,t,n,s,r){let o=[n,s,...r.flatMap(l=>[l.u-l.w/2,l.u+l.w/2])].sort((l,c)=>l-c);function a(l,c,h,u){if(c-l<.001||u-h<.001)return;let d=e==="x"?(l+c)/2:t,p=e==="x"?t:(l+c)/2,x=e==="x"?c-l:.34,v=e==="x"?.34:c-l;qe(i,"Wall with real opening",d,(h+u)/2,p,x,u-h,v,ye.stone),h<1.85&&Xn(d,p,x,v,"wall")}for(let l=0;l<o.length-1;l++){let c=o[l],h=o[l+1],u=r.find(d=>(c+h)/2>d.u-d.w/2&&(c+h)/2<d.u+d.w/2);u?(a(c,h,0,u.bottom),a(c,h,u.top,4.5)):a(c,h,0,4.5)}for(let l of r){let d=function(x,v,g,m,w,S=ye.metal){return e==="x"?qe(i,"Window frame and glazing",l.u+x,u+v,t,g,m,w,S):qe(i,"Window frame and glazing",t,u+v,l.u+x,w,m,g,S)};if(l.door)continue;let c=l.w,h=l.top-l.bottom,u=(l.top+l.bottom)/2;for(let x of[-c/2,0,c/2])d(x,0,.055,h,.13);for(let x of[-h/2,h/2,h/2-.65])d(0,x,c,.055,.13);let p=d(0,0,c-.07,h-.06,.012,e==="z"&&t===12&&l.u===-5.8?ye.sampleGlass:ye.glass);p.material===ye.sampleGlass&&(zs=p),d(0,-h/2-.05,c+.14,.1,.52,ye.stone),Xn(e==="x"?l.u:t,e==="x"?t:l.u,e==="x"?c:.34,e==="x"?.34:c,"window sill")}}function $M(i){let e=si("Operable entrance sliding doors",i),t=[];for(let s of[-1,1]){let r=si(s<0?"Left door":"Right door",e);r.position.set(s*.7,0,9.01);for(let o of[-.69,.69])qe(r,"Door bronze stile",o,1.55,0,.055,3.1,.1,ye.metal);for(let o of[.04,3.08])qe(r,"Door bronze rail",0,o,0,1.4,.06,.1,ye.metal);qe(r,"Door glass",0,1.55,0,1.31,3.02,.016,ye.glass),qe(r,"Pull handle",-s*.48,1.23,.09,.022,.5,.035,ye.metal),t.push({leaf:r,s})}qe(e,"Entrance transom",0,3.55,9,2.8,.8,.015,ye.glass),qe(e,"Door track",0,3.15,9,5.8,.1,.16,ye.metal);let n=Xn(0,9,2.8,.22,"door");return{root:e,leaves:t,collider:n,open:0,target:0}}function eS(i,e,t,n,s){let r=si("Bookshelf "+e,i);r.userData={category:e,label:t};let o=3.2,a=2.2,l=.48;for(let c of[-o/2,o/2])qe(r,"Oak side panel",n+c,a/2,s,.055,a,l,ye.wood);qe(r,"Oak backing",n,a/2,s-.22,o,a,.035,ye.wood);for(let c of[.1,.58,1.06,1.54,2.05,2.2])qe(r,"Adjustable oak shelf",n,c,s,o,.035,l,ye.wood);qe(r,"Recessed metal plinth",n,.045,s,o-.12,.09,l-.08,ye.metal);for(let c of[-1.2,1.2])qe(r,"Sign mounting post",n+c,2.33,s-.03,.018,.26,.025,ye.metal);qe(r,"Oak category sign backing",n,2.48,s,3.02,.4,.04,ye.wood),Hs(r,t,n,2.48,s+.03,2.95,.36),Xn(n,s,o+.06,l,"shelf "+e),Go.push({id:e,label:t,x:n,z:s,approach:{x:n,z:s+1.05}}),am.shelf(r,e,n,s)}function om(i,e,t,n){let s=e===1?ye.sampleWood:ye.wood,r=e===1?ye.sampleFabric:ye.fabric,o=si("Reading table "+e,i);qe(o,"Solid oak desktop",t,.75,n,3.8,.055,1.2,s,.015),qe(o,"Oak centre divider",t,.93,n,3.78,.28,.045,s);for(let a of[-1.65,1.65])for(let l of[-.43,.43])qe(o,"Bronze table leg",t+a,.36,n+l,.045,.72,.045,ye.metal);qe(o,"Undertable apron",t,.64,n,3.4,.15,.06,s),Xn(t,n,3.8,1.2,"table");for(let a of[-1,1])for(let l of[-.98,.98]){let c=t+l,h=n+a*1.13,u=`R${e}-${a<0?"N":"S"}${l<0?1:2}`,d=si("Chair "+u,i);if(e===1){sm??=em(ye.chairWood,r,ye.metal,ye.fabric);let p=sm();p.position.set(c,0,h),p.rotation.y=a<0?Math.PI:0,d.add(p)}else{qe(d,"Upholstered seat",c,.46,h,.5,.075,.48,r,.025),qe(d,"Upholstered back",c,.76,h+a*.21,.49,.44,.065,r,.025),qe(d,"Oak seat support shell",c,.405,h,.49,.035,.47,s,.015);for(let p of[-.205,.205])qe(d,"Connected back support",c+p,.65,h+a*.215,.023,.55,.025,ye.metal);for(let p of[-.21,.21])for(let x of[-.19,.19])qe(d,"Chair steel leg",c+p,.225,h+x,.023,.45,.023,ye.metal);for(let p of[-.21,.21])for(let x of[-.19,.19])qe(d,"Chair foot protector",c+p,.015,h+x,.029,.03,.029,ye.fabric,.004)}Xn(c,h,.54,e===1?.6:.55,"chair "+u),Wo.push({id:u,label:"\u9605\u89C8\u4F4D "+u,x:c,z:h,yaw:a===1?0:Math.PI,approach:{x:c,z:h+a*.85}}),qe(o,"Recessed desktop power outlet",c,.782,n+a*.12,.22,.007,.07,ye.metal)}am.guide(o,e,t+.55,n+.35)}function um(i){if(i.userData.bookGuide)return;for(let t of[...i.children])t.isGroup&&um(t);let e=new Map;for(let t of i.children){if(!t.isMesh||t.isInstancedMesh||Array.isArray(t.material))continue;let n=t.material.uuid,s=e.get(n)||[];s.push(t),e.set(n,s)}for(let t of e.values()){if(t.length<3)continue;let n=t.map(o=>(o.updateMatrix(),o.geometry.clone().applyMatrix4(o.matrix))),s=Tn(n);if(n.forEach(o=>o.dispose()),!s)continue;let r=new mt(s,t[0].material);r.name=t[0].material.name+" construction",r.castShadow=!r.material.transparent,r.receiveShadow=!0,r.userData.components=t.map(o=>o.name),t.forEach(o=>i.remove(o)),i.add(r)}}function fm({sharedSite:i=!1}={}){let e=si("Structure stone and real window openings"),t=si("Furniture bookcases and reading desks"),n=si("Roof editable zinc and clerestory"),s=si("Library forecourt");qe(e,"Continuous accessible floor",0,-.14,0,24.4,.28,18.4,ye.floor),ku(e,"x",9,-12,12,[{u:-7.2,w:5.2,bottom:.65,top:3.65},{u:0,w:2.8,bottom:0,top:4,door:!0},{u:7.2,w:5.2,bottom:.65,top:3.65}]),ku(e,"x",-9,-12,12,[-7,7].map(h=>({u:h,w:4.8,bottom:.7,top:3.7})));for(let h of[-12,12])ku(e,"z",h,-9,9,[-5.8,0,5.8].map(u=>({u,w:4.3,bottom:.65,top:3.7})));for(let h of[-11.8,11.8])for(let u of[-8.8,8.8])qe(e,"Stone corner pier",h,2.2,u,.5,4.4,.5,ye.stone);for(let h of[-11.8,11.8])qe(e,"Internal stone skirting",h,.065,0,.08,.13,17.5,ye.grout);qe(e,"Rear stone skirting",0,.065,-8.8,23.5,.13,.08,ye.grout);for(let h of[-6.7,6.7])qe(e,"Entrance stone skirting",h,.065,8.8,10.4,.13,.08,ye.grout);for(let h of[-7.6,7.6])qe(n,"Wing acoustic ceiling",h,4.47,0,8.8,.16,18.7,ye.plaster),qe(n,"Wing zinc roof",h,4.61,0,9,.12,19,ye.roof);qe(n,"Raised central ceiling",0,5.75,0,6.5,.18,19.2,ye.plaster),qe(n,"Raised central zinc roof",0,5.89,0,6.7,.12,19.5,ye.roof);for(let h of[-3.3,3.3]){qe(n,"Clerestory glass",h,5.12,0,.016,1.15,18.8,ye.glass);for(let u=-9;u<=9;u+=1.5)qe(n,"Clerestory mullion",h,5.12,u,.065,1.28,.065,ye.metal);for(let u of[4.52,5.7])qe(n,"Clerestory rail",h,u,0,.075,.075,19,ye.metal)}for(let h=-11.7;h<12;h+=.65){let u=Math.abs(h)<3.3;qe(n,"Standing seam",h,u?5.97:4.69,0,.025,.035,u?19.5:19,ye.roof)}for(let h of[-9.1,9.1])qe(n,"Clerestory stone end fascia",0,5.12,h,6.6,1.25,.22,ye.stone);qe(n,"Stone entrance canopy",0,3.95,10.1,7,.2,2.6,ye.stone),qe(n,"Canopy bronze soffit",0,3.83,10.1,6.75,.035,2.4,ye.metal);for(let h of[-3.3,3.3])qe(e,"Canopy stone column",h,1.91,10.7,.24,3.82,.24,ye.stone),Xn(h,10.7,.24,.24,"canopy column");Hs(e,"\u77E5 \u8BC6 \u56FE \u4E66 \u9986",0,5.12,9.22,5.4,.75),Hs(e,"\u9986\u85CF\u4E66\u67B6",-5.4,3.4,5.4,3.4,.46),Hs(e,"\u5B89\u9759\u9605\u89C8",6.4,3.4,5.4,3.4,.46);for(let h of[-9,-5.1,5.4,9])for(let u of[-5,1.3,6]){qe(e,"Suspended linear light housing",h,4.25,u,2.74,.07,.09,ye.metal),qe(e,"Suspended linear light",h,4.21,u,2.7,.015,.075,ye.light);for(let d of[-1.12,1.12])qe(e,"Light suspension rod",h+d,4.36,u,.008,.23,.008,ye.metal,.002)}for(let[h,u,d,p]of[["exam","\u8003\u7814\u771F\u9898\u5377",-8.1,-4.8],["book","\u6559\u6750\u4E60\u9898\u96C6",-3.6,-4.8],["ielts","\u96C5\u601D\u5907\u8003\u5E93",-8.1,.2],["topic","\u4E13\u9898\u4E0E\u5FC3\u5F97",-3.6,.2]])eS(t,h,u,d,p);om(t,1,6.6,-4.5),om(t,2,6.6,1.3);let o=si("Welcome and catalogue desk",t);qe(o,"Oak enquiry desk",-7,.5,6.3,3.7,1,.8,ye.wood),qe(o,"Stone enquiry counter",-7,1.04,6.3,3.85,.08,.9,ye.stone);for(let h of[-8.2,-5.8])qe(o,"Catalogue header mounting post",h,1.5,6.1,.022,.85,.025,ye.metal);if(qe(o,"Catalogue header oak backing",-7,2.05,6.1,2.65,.32,.045,ye.wood),Hs(o,"\u9986 \u85CF \u68C0 \u7D22",-7,2.05,6.126,2.5,.28),Xn(-7,6.3,3.85,.9,"welcome desk"),qe(e,"Rear grey brick accent",0,2.15,-8.79,5.2,4.3,.07,ye.brick),Hs(e,"\u5B66 \u65E0 \u5FE7  \xB7  \u9605 \u8BFB \u4E0E \u601D \u8003",0,2.5,-8.73,4.5,.52),!i){qe(s,"Accessible forecourt",0,-.16,16,40,.28,14.1,ye.floor),qe(s,"Site ground",0,-.37,0,100,.12,80,new It({name:"Landscape ground",color:9346179,roughness:1}));for(let h of[-9,9]){qe(s,"Courtyard planter",h,.28,12.5,2.6,.56,1.1,ye.brick),qe(s,"Planter soil",h,.57,12.5,2.4,.025,.95,new It({name:"Planting soil",color:5328189,roughness:1})),Xn(h,12.5,2.6,1.1,"planter");for(let u=0;u<5;u++)qe(s,"Forecourt bench timber slat",h,.45,16.2+(u-2)*.1,3,.07,.085,ye.wood);for(let u of[-1.2,1.2])qe(s,"Bench leg",h+u,.21,16.2,.08,.42,.4,ye.metal);Xn(h,16.2,3,.5,"bench")}for(let h of[-19.95,19.95])qe(s,"Courtyard stone edge",h,-.065,16,.1,.11,14.1,ye.stone);$p(s,ye.wood,Xn)}let a=$M(e);im({parent:gn,materials:ye,box:qe,sign:Hs,obstacle:Xn}),um(gn);let l=si("R1 bounded daylight fill"),c=new Ir(15397106,26,8,.86,.95,2);return c.name="R1 window sky approximation",c.position.set(11.35,2.4,-6.1),c.lookAt(6.6,.4,-4.5),c.target.position.set(0,0,-1),c.add(c.target),c.castShadow=!0,c.shadow.mapSize.set(1024,1024),c.shadow.camera.near=.12,c.shadow.bias=-2e-5,c.shadow.normalBias=.001,l.add(c),l.userData={purpose:"Local real-time window-sky approximation and contact shadow; no baked indirect light",rangeMetres:8,globalExposureUnchanged:!0},{building:gn,door:a,r1Light:c}}var xs=.24,Fr=2,Bl=new Map;function dm(){Bl.clear();for(let i of Vo)for(let e=Math.floor((i.minX-xs)/Fr);e<=Math.floor((i.maxX+xs)/Fr);e++)for(let t=Math.floor((i.minZ-xs)/Fr);t<=Math.floor((i.maxZ+xs)/Fr);t++){let n=e+","+t,s=Bl.get(n)||[];s.push(i),Bl.set(n,s)}}function Vs(i,e){return i<-18||i>18||e<-13||e>22?!0:(Bl.get(Math.floor(i/Fr)+","+Math.floor(e/Fr))||[]).some(t=>!t.disabled&&i>t.minX-xs&&i<t.maxX+xs&&e>t.minZ-xs&&e<t.maxZ+xs)}function Vu(i,e,t){let n=Math.max(1,Math.ceil(Math.hypot(e,t)/.1));for(let s=0;s<n;s++)Vs(i.x+e/n,i.z)||(i.x+=e/n),Vs(i.x,i.z+t/n)||(i.z+=t/n)}var Me=i=>document.getElementById(i),Gs=window.WG_API,Gu=new URL("../../",document.baseURI),tS={queued:"\u6392\u961F\u4E2D",parsing:"\u89E3\u6790\u4E2D",parsed:"\u5DF2\u89E3\u6790\uFF0C\u68C0\u7D22\u672A\u914D\u7F6E",indexing:"\u7D22\u5F15\u4E2D",ready:"\u53EF\u9605\u8BFB\u4E0E\u68C0\u7D22",failed:"\u5904\u7406\u5931\u8D25"},yi="exam",ri=0,Yi=[],pm={},Xo=[],Hl=0,xn=0,oi=null,Vl=null,Yo=null,ai=1,Ws=!1,_i=0,Yu=()=>{},Wu=()=>{},qu=()=>{},mm=()=>{},kr=null,gm=!1,Zu=1,vs=Me("library-dialog"),qi=Me("reader-dialog");function ys(i,e,t){let n=document.createElement(i);return e!==void 0&&(n.textContent=e),t&&(n.className=t),n}function xm(i,e,t,n){let s=ys("article",void 0,"result"),r=ys("div");r.append(ys("h3",i),ys("p",e));let o=ys("button",t);return o.onclick=n,s.append(r,o),s}function nS(i){let e=new URL(i,Gu);if(!["https:","http:"].includes(e.protocol)||e.username||e.password)throw Error("\u8D44\u6599\u94FE\u63A5\u683C\u5F0F\u4E0D\u53D7\u652F\u6301");if(e.origin===Gu.origin&&!e.pathname.startsWith(new URL("data/pdf/",Gu).pathname))throw Error("\u8D44\u6599\u8DEF\u5F84\u4E0D\u5728\u516C\u5F00\u9986\u85CF\u5185");return e}function Br(i){return!!pm[i.raw.link]?.available}function iS(){let i=Me("subject");i.replaceChildren(new Option("\u5168\u90E8\u5B66\u79D1",""));for(let e of WG_WenkuCat.facetsOf(yi).subjects)i.add(new Option(e.key+"\uFF08"+e.n+"\uFF09",e.key))}function Xu(i){yi=i,ri=0;for(let e of Me("categories").children)e.setAttribute("aria-pressed",String(e.dataset.id===yi));Me("public-catalog").hidden=yi==="private",Me("private-catalog").hidden=yi!=="private",yi==="private"?Ko():(iS(),kl())}function kl(){if(yi==="private")return;Yi=WG_WenkuCat.query({cat:yi,subject:Me("subject").value,kw:Me("search").value.trim()}),Me("local-only").checked&&(Yi=Yi.filter(Br));let i=Math.max(1,Math.ceil(Yi.length/10));ri=Math.min(ri,i-1),Me("result-status").textContent=Yi.length?`\u627E\u5230 ${Yi.length} \u4EFD\u8D44\u6599\uFF0C\u5176\u4E2D ${Yi.filter(Br).length} \u4EFD\u672C\u5730\u6587\u4EF6\u5DF2\u6838\u9A8C\uFF1B\u6253\u5F00\u65F6\u4F1A\u518D\u6B21\u68C0\u67E5\u3002`:"\u6CA1\u6709\u5339\u914D\u8D44\u6599\uFF0C\u8BF7\u66F4\u6362\u5173\u952E\u8BCD\u6216\u6E05\u9664\u7B5B\u9009\u3002";let e=Me("results");e.replaceChildren();for(let t of Yi.slice(ri*10,ri*10+10)){let n=Br(t)?"\u672C\u5730\u6587\u4EF6":t.local?"\u76EE\u5F55\u5DF2\u6536\u5F55\uFF0C\u6587\u4EF6\u672A\u968F\u4ED3\u5E93\u63D0\u4F9B":"\u5916\u7AD9\u8D44\u6599\uFF0C\u9700\u524D\u5F80\u6765\u6E90\u67E5\u770B",s=(t.raw.link||"").split(".").pop().toUpperCase();e.append(xm(t.raw.title,[t.subject,t.year,t.school,n,Br(t)?s:""].filter(Boolean).join(" \xB7 "),"\u67E5\u770B\u8D44\u6599",()=>ym(t)))}Me("page-number").textContent=`${ri+1} / ${i}`,Me("prev").disabled=ri===0,Me("next").disabled=ri>=i-1}function Zo(i=!1){gm=i;for(let e of["reader-bookmark","reader-notes"])Me(e).hidden=!kr||!i,Me(e).disabled=!i}function vm(i){Me("reader-save-status").hidden=!0,Me("reader-save-status").textContent="",kr=null,Zo(),Yu(),qi.open||qi.showModal(),Me("reader-title").textContent=i,Me("reader-status").textContent="\u6B63\u5728\u68C0\u67E5\u8D44\u6599\u6587\u4EF6\u2026",Me("reader-tools").hidden=!0,Me("pdf-canvas").hidden=!0,Me("document-text").hidden=!0,Me("document-text").textContent="",Me("reader-content").querySelectorAll("a").forEach(e=>e.remove()),Me("reader-content").scrollTop=0,Me("reader-content").scrollLeft=0,Me("pdf-zoom").value="1",Me("zoom-label").hidden=!1}async function Gl(){kr=null,Zo();let i=++xn;Yo?.cancel(),Yo=null;let e=Vl;return Vl=null,oi=null,Ws=!1,e&&await e.destroy().catch(()=>{}),i===xn&&(Me("pdf-canvas").width=1,Me("pdf-canvas").height=1),i}async function ym(i,e=1){let t=await Gl();if(t===xn){vm(i.raw.title);try{let n=nS(i.raw.link||"");if(kr=i,!i.local){Me("reader-status").textContent="\u6B64\u6761\u76EE\u7531\u5916\u7AD9\u6258\u7BA1\uFF0C\u672C\u9986\u6CA1\u6709\u672C\u5730\u5168\u6587\uFF0C\u53EF\u80FD\u9700\u8981\u5728\u539F\u7AD9\u767B\u5F55\u3002";let a=ys("a","\u524D\u5F80\u8D44\u6599\u6765\u6E90");a.href=n.href,a.target="_blank",a.rel="noopener",a.style.cssText="display:inline-block;padding:24px",Me("reader-content").append(a);return}let s=await fetch(n,{method:"HEAD",signal:AbortSignal.timeout(2e4)});if(t!==xn)return;if(!s.ok)throw Error(s.status===404?"\u76EE\u5F55\u5DF2\u6536\u5F55\uFF0C\u4F46\u5B9E\u9645\u6587\u4EF6\u4E0D\u5B58\u5728\uFF08404\uFF09\u3002\u8BF7\u8FD4\u56DE\u9009\u62E9\u5176\u4ED6\u8D44\u6599\u3002":`\u8D44\u6599\u670D\u52A1\u8FD4\u56DE ${s.status}\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002`);let r=s.headers.get("content-type")||"",o=n.pathname.toLowerCase();if(Me("download").href=n.href,Me("download").removeAttribute("download"),o.endsWith(".pdf")){if(!r.includes("application/pdf"))throw Error("\u670D\u52A1\u5668\u672A\u8FD4\u56DE PDF \u6587\u4EF6\uFF0C\u5DF2\u505C\u6B62\u9884\u89C8\u3002");if(!window.pdfjsLib)throw Error("\u9605\u8BFB\u5668\u672A\u52A0\u8F7D\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5\u3002");pdfjsLib.GlobalWorkerOptions.workerSrc=new URL("vendor/pdfjs/pdf.worker.min.js",document.baseURI).href,Me("reader-status").textContent="\u6B63\u5728\u52A0\u8F7D PDF\u2026",Vl=pdfjsLib.getDocument({url:n.href,isEvalSupported:!1});let a=await Vl.promise;if(t!==xn){await a.destroy();return}oi=a,ai=Math.max(1,Math.min(oi.numPages,Math.trunc(e)||1)),Me("reader-tools").hidden=!1,await zl()}else if(o.endsWith(".html")){let a=await fetch(n,{signal:AbortSignal.timeout(2e4)});if(!a.ok)throw Error("\u8D44\u6599\u8BFB\u53D6\u5931\u8D25");let l=await a.text();if(t!==xn)return;Me("document-text").textContent=new DOMParser().parseFromString(l,"text/html").body.textContent,Me("document-text").hidden=!1,Me("reader-status").textContent="\u5DF2\u8BFB\u53D6\u8D44\u6599\u6B63\u6587\u3002",Me("reader-tools").hidden=!1,Me("pdf-prev").hidden=Me("pdf-next").hidden=!0,Me("zoom-label").hidden=!0,Me("pdf-page").textContent="\u6587\u672C\u8D44\u6599",Zu=1,Zo(!0)}else{Me("reader-status").textContent="\u6587\u4EF6\u5DF2\u6838\u9A8C\u3002\u6B64\u683C\u5F0F\u9700\u8981\u4F7F\u7528 Word / Excel \u7B49\u5E94\u7528\u6253\u5F00\uFF0C\u4E0D\u63D0\u4F9B\u865A\u5047\u7684\u9875\u5185\u9884\u89C8\u3002";let a=ys("a","\u4E0B\u8F7D\u6587\u4EF6");a.href=n.href,a.download="",a.style.cssText="display:inline-block;padding:24px",Me("reader-content").append(a)}}catch(n){t===xn&&(Me("reader-status").textContent=n.message||"\u8D44\u6599\u6253\u5F00\u5931\u8D25\uFF0C\u8BF7\u8FD4\u56DE\u540E\u91CD\u8BD5",qu("\u8D44\u6599\u672A\u6253\u5F00\uFF1A"+Me("reader-status").textContent))}}}async function zl(){if(!oi||Ws)return;Ws=!0,Zo();let i=xn;Me("pdf-prev").hidden=Me("pdf-next").hidden=!1,Me("pdf-prev").disabled=Me("pdf-next").disabled=!0,Me("pdf-zoom").disabled=!0;try{let e=await oi.getPage(ai);if(i!==xn)return;let t=e.getViewport({scale:1}),n=Number(Me("pdf-zoom").value),s=Math.min(1e3,Math.max(220,Me("reader-content").clientWidth-32))*n,r=s/t.width*Math.min(devicePixelRatio,1.5),o=e.getViewport({scale:r}),a=Me("pdf-canvas");if(a.width=Math.ceil(o.width),a.height=Math.ceil(o.height),a.style.width=s+"px",a.style.maxWidth=n>1?"none":"calc(100% - 16px)",a.hidden=!1,Yo=e.render({canvasContext:a.getContext("2d"),viewport:o}),await Yo.promise,i!==xn)return;Yo=null,Me("pdf-page").textContent=`\u7B2C ${ai} / ${oi.numPages} \u9875`,Me("reader-status").textContent="\u5DF2\u663E\u793A\u5B9E\u9645 PDF \u9875\u9762\u3002\u53EF\u7FFB\u9875\u6216\u6253\u5F00\u539F\u6587\u4EF6\u3002",Zu=ai,Zo(!0)}catch(e){i===xn&&e.name!=="RenderingCancelledException"&&(Me("reader-status").textContent="\u9875\u9762\u6E32\u67D3\u5931\u8D25\uFF1A"+e.message)}finally{i===xn&&(Ws=!1,Me("pdf-zoom").disabled=!1,Me("pdf-prev").disabled=ai<=1,Me("pdf-next").disabled=!oi||ai>=oi.numPages)}}async function qo(i,e,t){if(!Gs?.isCloudSession())throw Error("\u8BF7\u5728\u540C\u4E00\u7F51\u5740\u7684\u4E3B\u7AD9\u767B\u5F55\u4E91\u7AEF\u8D26\u53F7\uFF0C\u518D\u8FD4\u56DE\u56FE\u4E66\u9986\u3002");let n=Gs.getToken();try{return await Gs.req(i,e,t,{noRetry:!0})}finally{n!==Gs.getToken()&&mm()}}async function Ko(){let i=++Hl,e=_i;if(Me("private-results").replaceChildren(),Me("service-status").textContent="",!Gs?.isCloudSession()){Me("cloud-status").textContent="\u5C1A\u672A\u767B\u5F55\u4E91\u7AEF\u8D26\u53F7\u3002\u9986\u85CF\u9605\u8BFB\u53EF\u76F4\u63A5\u4F7F\u7528\uFF1B\u6211\u7684\u8D44\u6599\u9700\u8981\u5728\u4E3B\u7AD9\u767B\u5F55\u3002",Me("upload").disabled=!0;return}Me("cloud-status").textContent="\u6B63\u5728\u8BFB\u53D6\u5F53\u524D\u8D26\u53F7\u8D44\u6599\u4E0E\u670D\u52A1\u914D\u7F6E\u2026",Me("upload").disabled=!0;let t=await Promise.allSettled([qo("GET","/api/integrations/status"),qo("GET","/api/knowledge/documents")]);if(i!==Hl||e!==_i)return;let[n,s]=t;if(n.status==="fulfilled"){let r=n.value;Me("service-status").textContent=`\u6587\u6863\u89E3\u6790\uFF1A${r.mineru?"\u5DF2\u914D\u7F6E":"\u672A\u914D\u7F6E"}\uFF1B\u8D44\u6599\u68C0\u7D22\uFF1A${r.ragflow?"\u5DF2\u914D\u7F6E":"\u672A\u914D\u7F6E"}\uFF1BAI \u56DE\u7B54\uFF1A${r.ai?"\u5DF2\u914D\u7F6E":"\u672A\u914D\u7F6E"}\u3002`}else Me("service-status").textContent="\u65E0\u6CD5\u8BFB\u53D6\u670D\u52A1\u914D\u7F6E\uFF1A"+n.reason.message;if(Me("upload").disabled=!1,s.status==="rejected"){Me("cloud-status").textContent=s.reason.message;return}Xo=s.value.documents||[],Me("cloud-status").textContent=Xo.length?`\u5F53\u524D\u8D26\u53F7\u5171 ${Xo.length} \u4EFD\u8D44\u6599\u3002\u5904\u7406\u72B6\u6001\u6765\u81EA\u670D\u52A1\u5668\uFF0C\u8BF7\u6309\u9700\u5237\u65B0\u3002`:"\u5F53\u524D\u8D26\u53F7\u6682\u65E0\u8D44\u6599\uFF0C\u53EF\u4EE5\u4E0A\u4F20 UTF-8 \u6587\u672C\u6216\u8BB2\u4E49\u3002";for(let r of Xo){let o=xm(r.filename,[tS[r.status]||r.status,r.error||""].filter(Boolean).join(" \xB7 "),r.hasText?"\u9605\u8BFB\u6B63\u6587":"\u5237\u65B0\u72B6\u6001",async()=>{if(r.hasText)return sS(r);let a=o.querySelector("button");a.disabled=!0;try{await qo("POST","/api/knowledge/refresh",{id:r.id}),await Ko()}catch(l){Me("cloud-status").textContent=l.message}finally{a.disabled=!1}});Me("private-results").append(o)}}async function sS(i){let e=await Gl();if(e!==xn)return;vm(i.filename);let t=_i;try{let n=await qo("GET","/api/knowledge/text?id="+encodeURIComponent(i.id));if(e!==xn||t!==_i)return;if(!n.markdown)throw Error("\u670D\u52A1\u5668\u5C1A\u672A\u63D0\u4F9B\u6B63\u6587\uFF0C\u8BF7\u8FD4\u56DE\u5237\u65B0\u5904\u7406\u72B6\u6001\u3002");Me("document-text").textContent=n.markdown,Me("document-text").hidden=!1,Me("reader-status").textContent="\u5DF2\u8BFB\u53D6\u670D\u52A1\u5668\u89E3\u6790\u6B63\u6587\u3002"}catch(n){e===xn&&(Me("reader-status").textContent=n.message)}}async function rS(){let i=Me("upload"),e=i.files[0];if(!e)return;if(e.size<1||e.size>8*1024*1024){Me("cloud-status").textContent="\u8BF7\u9009\u62E9 1 \u5B57\u8282\u5230 8 MB \u7684\u6587\u4EF6\u3002",i.value="";return}let t=_i;i.disabled=!0,Me("cloud-status").textContent="\u6B63\u5728\u4E0A\u4F20\uFF0C\u8BF7\u4FDD\u6301\u9875\u9762\u6253\u5F00\u2026";try{let n=await new Promise((s,r)=>{let o=new FileReader;o.onerror=()=>r(Error("\u6587\u4EF6\u8BFB\u53D6\u5931\u8D25")),o.onload=()=>s(String(o.result).split(",")[1]),o.readAsDataURL(e)});if(t!==_i||(await qo("POST","/api/knowledge/upload",{filename:e.name,base64:n}),t!==_i))return;await Ko()}catch(n){t===_i&&(Me("cloud-status").textContent=n.message)}finally{i.disabled=!1,i.value=""}}async function _m(i){({pause:Yu,resume:Wu,report:qu}=i);try{let t=await fetch("assets/catalog-availability.json",{signal:AbortSignal.timeout(5e3)});if(!t.ok)throw Error();pm=(await t.json()).files}catch{qu("\u6587\u4EF6\u6E05\u5355\u672A\u52A0\u8F7D\uFF1B\u6253\u5F00\u8D44\u6599\u65F6\u4ECD\u4F1A\u68C0\u67E5\u5B9E\u9645\u6587\u4EF6\u3002")}for(let t of[...WG_WenkuCat.CATS,{id:"private",name:"\u6211\u7684\u8D44\u6599"}]){let n=ys("button",t.name);n.dataset.id=t.id,n.onclick=()=>Xu(t.id),Me("categories").append(n)}Me("search").oninput=Me("subject").onchange=Me("local-only").onchange=()=>{ri=0,kl()},Me("prev").onclick=()=>{ri--,kl()},Me("next").onclick=()=>{ri++,kl()},Me("close-catalog").onclick=()=>vs.close(),Me("close-reader").onclick=()=>qi.close(),vs.addEventListener("close",()=>{qi.open||Wu()}),qi.addEventListener("close",()=>{Gl(),vs.open?Me("search").focus():Wu()}),Me("pdf-prev").onclick=()=>{!Ws&&ai>1&&(ai--,zl())},Me("pdf-next").onclick=()=>{!Ws&&oi&&ai<oi.numPages&&(ai++,zl())},Me("refresh-private").onclick=Ko,Me("upload").onchange=rS,Me("pdf-zoom").onchange=()=>{Ws||zl()},Gs?.onStatus((t,n)=>(n&&(Me("cloud-status").textContent=n),!0));function e(){_i++,Hl++,Xo=[],Me("private-results").replaceChildren(),qi.open&&(qi.close(),Me("document-text").textContent=""),yi==="private"&&vs.open&&Ko()}return mm=e,Gs?.onAuthChange(e),addEventListener("storage",t=>{(t.key==="xwy_token"||t.key==="xwy_user")&&e()}),Xu("exam"),{open(t){Yu(),vs.open||vs.showModal(),t&&Xu(t),Me("search").focus()},recommendations(){return WG_WenkuCat.CATS.flatMap(t=>WG_WenkuCat.query({cat:t.id}).filter(n=>Br(n)&&/\.(pdf|html)$/i.test(n.raw.link)).slice(0,2).map(n=>({...n,category:t.name}))).slice(0,6)},readableItems(){return WG_WenkuCat.query({}).filter(t=>Br(t)&&/\.(pdf|html)$/i.test(t.raw.link))},findPublic(t){return WG_WenkuCat.query({}).find(n=>n.local&&n.raw.link===t&&/\.(pdf|html)$/i.test(n.raw.link))},currentPublic(){return kr&&gm?{link:kr.raw.link,page:Zu}:null},read(t,n=1){let s=WG_WenkuCat.query({}).find(r=>r.raw.link===t.raw.link);if(s)return ym(s,n)},close(){qi.close(),vs.close()},snapshot:()=>({category:yi,results:Yi.length,reader:qi.open,catalog:vs.open,pdfPages:oi?.numPages||0,pdfPage:ai}),dispose(){Gl(),Hl++,_i++}}}var Wl=class extends xi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new tf(t)}),this.register(function(t){return new nf(t)}),this.register(function(t){return new ff(t)}),this.register(function(t){return new df(t)}),this.register(function(t){return new pf(t)}),this.register(function(t){return new rf(t)}),this.register(function(t){return new of(t)}),this.register(function(t){return new af(t)}),this.register(function(t){return new lf(t)}),this.register(function(t){return new ef(t)}),this.register(function(t){return new cf(t)}),this.register(function(t){return new sf(t)}),this.register(function(t){return new uf(t)}),this.register(function(t){return new hf(t)}),this.register(function(t){return new Qu(t)}),this.register(function(t){return new mf(t)}),this.register(function(t){return new gf(t)})}load(e,t,n,s){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let c=ps.extractUrlBase(e);o=ps.resolveURL(c,this.path)}else o=ps.extractUrlBase(e);this.manager.itemStart(e);let a=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Ar(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(h){t(h),r.manager.itemEnd(e)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Tm){try{o[ft.KHR_BINARY_GLTF]=new xf(e)}catch(u){s&&s(u);return}r=JSON.parse(o[ft.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new wf(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){let u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case ft.KHR_MATERIALS_UNLIT:o[u]=new $u;break;case ft.KHR_DRACO_MESH_COMPRESSION:o[u]=new vf(r,this.dracoLoader);break;case ft.KHR_TEXTURE_TRANSFORM:o[u]=new yf;break;case ft.KHR_MESH_QUANTIZATION:o[u]=new _f;break;default:d.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function oS(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}var ft={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Qu=class{constructor(e){this.parser=e,this.name=ft.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,h=new We(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],kt);let u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Lr(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Pr(h),c.distance=u;break;case"spot":c=new Ir(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,Zi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}},$u=class{constructor(){this.name=ft.KHR_MATERIALS_UNLIT}getMaterialType(){return zn}extendParams(e,t,n){let s=[];e.color=new We(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],kt),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,pt))}return Promise.all(s)}},ef=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},tf=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){let a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new pe(a,a)}return Promise.all(r)}},nf=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},sf=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}},rf=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new We(0,0,0),t.sheenRoughness=0,t.sheen=1;let o=s.extensions[this.name];if(o.sheenColorFactor!==void 0){let a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],kt)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,pt)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}},of=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}},af=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;let a=o.attenuationColor||[1,1,1];return t.attenuationColor=new We().setRGB(a[0],a[1],a[2],kt),Promise.all(r)}},lf=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},cf=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));let a=o.specularColorFactor||[1,1,1];return t.specularColor=new We().setRGB(a[0],a[1],a[2],kt),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,pt)),Promise.all(r)}},hf=class{constructor(e){this.parser=e,this.name=ft.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}},uf=class{constructor(e){this.parser=e,this.name=ft.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:en}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}},ff=class{constructor(e){this.parser=e,this.name=ft.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},df=class{constructor(e){this.parser=e,this.name=ft.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},pf=class{constructor(e){this.parser=e,this.name=ft.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},mf=class{constructor(e){this.name=ft.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let l=s.byteOffset||0,c=s.byteLength||0,h=s.count,u=s.byteStride,d=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,u,d,s.mode,s.filter).then(function(p){return p.buffer}):o.ready.then(function(){let p=new ArrayBuffer(h*u);return o.decodeGltfBuffer(new Uint8Array(p),h,u,d,s.mode,s.filter),p})})}else return null}},gf=class{constructor(e){this.name=ft.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let c of s.primitives)if(c.mode!==Yn.TRIANGLES&&c.mode!==Yn.TRIANGLE_STRIP&&c.mode!==Yn.TRIANGLE_FAN&&c.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],l={};for(let c in o)a.push(this.parser.getDependency("accessor",o[c]).then(h=>(l[c]=h,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{let h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,p=[];for(let x of u){let v=new je,g=new B,m=new $t,w=new B(1,1,1),S=new Hn(x.geometry,x.material,d);for(let _=0;_<d;_++)l.TRANSLATION&&g.fromBufferAttribute(l.TRANSLATION,_),l.ROTATION&&m.fromBufferAttribute(l.ROTATION,_),l.SCALE&&w.fromBufferAttribute(l.SCALE,_),S.setMatrixAt(_,v.compose(g,m,w));for(let _ in l)if(_==="_COLOR_0"){let D=l[_];S.instanceColor=new Us(D.array,D.itemSize,D.normalized)}else _!=="TRANSLATION"&&_!=="ROTATION"&&_!=="SCALE"&&x.geometry.setAttribute(_,l[_]);At.prototype.copy.call(S,x),this.parser.assignFinalMaterial(S),p.push(S)}return h.isGroup?(h.clear(),h.add(...p),h):p[0]}))}},Tm="glTF",jo=12,Mm={JSON:1313821514,BIN:5130562},xf=class{constructor(e){this.name=ft.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,jo),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Tm)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-jo,r=new DataView(e,jo),o=0;for(;o<s;){let a=r.getUint32(o,!0);o+=4;let l=r.getUint32(o,!0);if(o+=4,l===Mm.JSON){let c=new Uint8Array(e,jo+o,a);this.content=n.decode(c)}else if(l===Mm.BIN){let c=jo+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},vf=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=ft.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(let h in o){let u=Sf[h]||h.toLowerCase();a[u]=o[h]}for(let h in e.attributes){let u=Sf[h]||h.toLowerCase();if(o[h]!==void 0){let d=n.accessors[e.attributes[h]],p=zr[d.componentType];c[u]=p.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){s.decodeDracoFile(h,function(p){for(let x in p.attributes){let v=p.attributes[x],g=l[x];g!==void 0&&(v.normalized=g)}u(p)},a,c,kt,d)})})}},yf=class{constructor(){this.name=ft.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},_f=class{constructor(){this.name=ft.KHR_MESH_QUANTIZATION}},Xl=class extends us{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,h=s-t,u=(n-t)/h,d=u*u,p=d*u,x=e*c,v=x-c,g=-2*p+3*d,m=p-d,w=1-g,S=m-d+u;for(let _=0;_!==a;_++){let D=o[v+_+a],I=o[v+_+l]*h,A=o[x+_+a],T=o[x+_]*h;r[_]=w*D+S*I+g*A+m*T}return r}},aS=new $t,Mf=class extends Xl{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return aS.fromArray(r).normalize().toArray(r),r}},Yn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},zr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Sm={9728:Ut,9729:wt,9984:Po,9985:Ps,9986:is,9987:fn},bm={33071:Pn,33648:Ls,10497:Wt},Ku={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Sf={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},_s={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},lS={CUBICSPLINE:void 0,LINEAR:cs,STEP:ls},ju={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function cS(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new It({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Bn})),i.DefaultMaterial}function Xs(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Zi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function hS(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,h=e.length;c<h;c++){let u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(s=!0),u.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let o=[],a=[],l=[];for(let c=0,h=e.length;c<h;c++){let u=e[c];if(n){let d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):i.attributes.position;o.push(d)}if(s){let d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):i.attributes.normal;a.push(d)}if(r){let d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):i.attributes.color;l.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],d=c[2];return n&&(i.morphAttributes.position=h),s&&(i.morphAttributes.normal=u),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function uS(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function fS(i){let e,t=i.extensions&&i.extensions[ft.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Ju(t.attributes):e=i.indices+":"+Ju(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Ju(i.targets[n]);return e}function Ju(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function bf(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function dS(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var pS=new je,wf=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new oS,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,o=-1;if(typeof navigator<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let l=a.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&o<98?this.textureLoader=new Rr(this.options.manager):this.textureLoader=new xl(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Ar(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:n,userData:{}};return Xs(r,a,s),Zi(a,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(let l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let o=t[s].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(o,a)=>{let l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(let[c,h]of o.children.entries())r(h,a.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[ft.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,o){n.load(ps.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let o=Ku[s.type],a=zr[s.componentType],l=s.normalized===!0,c=new a(s.count*o);return Promise.resolve(new Tt(c,o,l))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],l=Ku[s.type],c=zr[s.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=s.byteOffset||0,p=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,x=s.normalized===!0,v,g;if(p&&p!==u){let m=Math.floor(d/p),w="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+m+":"+s.count,S=t.cache.get(w);S||(v=new c(a,m*p,s.count*p/h),S=new go(v,p/h),t.cache.add(w,S)),g=new xo(S,l,d%p/h,x)}else a===null?v=new c(s.count*l):v=new c(a,d,s.count*l),g=new Tt(v,l,x);if(s.sparse!==void 0){let m=Ku.SCALAR,w=zr[s.sparse.indices.componentType],S=s.sparse.indices.byteOffset||0,_=s.sparse.values.byteOffset||0,D=new w(o[1],S,s.sparse.count*m),I=new c(o[2],_,s.sparse.count*l);a!==null&&(g=new Tt(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let A=0,T=D.length;A<T;A++){let b=D[A];if(g.setX(b,I[A*l]),l>=2&&g.setY(b,I[A*l+1]),l>=3&&g.setZ(b,I[A*l+2]),l>=4&&g.setW(b,I[A*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=x}return g})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let s=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);let d=(r.samplers||{})[o.sampler]||{};return h.magFilter=Sm[d.magFilter]||wt,h.minFilter=Sm[d.minFilter]||fn,h.wrapS=bm[d.wrapS]||Wt,h.wrapT=bm[d.wrapT]||Wt,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Ut&&h.minFilter!==wt,s.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());let o=s.images[e],a=self.URL||self.webkitURL,l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(u){c=!0;let d=new Blob([u],{type:o.mimeType});return l=a.createObjectURL(d),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let h=Promise.resolve(l).then(function(u){return new Promise(function(d,p){let x=d;t.isImageBitmapLoader===!0&&(x=function(v){let g=new Ht(v);g.needsUpdate=!0,d(g)}),t.load(ps.resolveURL(u,r.path),x,void 0,p)})}).then(function(u){return c===!0&&a.revokeObjectURL(l),Zi(u,o),u.userData.mimeType=o.mimeType||dS(o.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[ft.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[ft.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let l=r.associations.get(o);o=r.extensions[ft.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new _o,_n.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new yo,_n.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(s||r||o){let a="ClonedMaterial:"+n.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return It}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],o,a={},l=r.extensions||{},c=[];if(l[ft.KHR_MATERIALS_UNLIT]){let u=s[ft.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),c.push(u.extendParams(a,r,t))}else{let u=r.pbrMetallicRoughness||{};if(a.color=new We(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){let d=u.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],kt),a.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",u.baseColorTexture,pt)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Nt);let h=r.alphaMode||ju.OPAQUE;if(h===ju.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===ju.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==zn&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new pe(1,1),r.normalTexture.scale!==void 0)){let u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==zn&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==zn){let u=r.emissiveFactor;a.emissive=new We().setRGB(u[0],u[1],u[2],kt)}return r.emissiveTexture!==void 0&&o!==zn&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,pt)),Promise.all(c).then(function(){let u=new o(a);return r.name&&(u.name=r.name),Zi(u,r),t.associations.set(u,{materials:e}),r.extensions&&Xs(s,u,r),u})}createUniqueName(e){let t=vt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(a){return n[ft.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return wm(l,a,t)})}let o=[];for(let a=0,l=e.length;a<l;a++){let c=e[a],h=fS(c),u=s[h];if(u)o.push(u.promise);else{let d;c.extensions&&c.extensions[ft.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=wm(new Et,c,t),s[h]={primitive:c,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){let h=o[l].material===void 0?cS(this.cache):this.getDependency("material",o[l].material);a.push(h)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){let c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let p=0,x=h.length;p<x;p++){let v=h[p],g=o[p],m,w=c[p];if(g.mode===Yn.TRIANGLES||g.mode===Yn.TRIANGLE_STRIP||g.mode===Yn.TRIANGLE_FAN||g.mode===void 0)m=r.isSkinnedMesh===!0?new Ka(v,w):new mt(v,w),m.isSkinnedMesh===!0&&m.normalizeSkinWeights(),g.mode===Yn.TRIANGLE_STRIP?m.geometry=Bu(m.geometry,Sl):g.mode===Yn.TRIANGLE_FAN&&(m.geometry=Bu(m.geometry,Lo));else if(g.mode===Yn.LINES)m=new $a(v,w);else if(g.mode===Yn.LINE_STRIP)m=new wr(v,w);else if(g.mode===Yn.LINE_LOOP)m=new el(v,w);else if(g.mode===Yn.POINTS)m=new tl(v,w);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(m.geometry.morphAttributes).length>0&&uS(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),Zi(m,r),g.extensions&&Xs(s,m,g),t.assignFinalMaterial(m),u.push(m)}for(let p=0,x=u.length;p<x;p++)t.associations.set(u[p],{meshes:e,primitives:p});if(u.length===1)return r.extensions&&Xs(s,u[0],r),u[0];let d=new Ct;r.extensions&&Xs(s,d,r),t.associations.set(d,{meshes:e});for(let p=0,x=u.length;p<x;p++)d.add(u[p]);return d})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Yt(Sn.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new hs(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Zi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),o=s,a=[],l=[];for(let c=0,h=o.length;c<h;c++){let u=o[c];if(u){a.push(u);let d=new je;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new ja(a,l)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],l=[],c=[],h=[];for(let u=0,d=s.channels.length;u<d;u++){let p=s.channels[u],x=s.samplers[p.sampler],v=p.target,g=v.node,m=s.parameters!==void 0?s.parameters[x.input]:x.input,w=s.parameters!==void 0?s.parameters[x.output]:x.output;v.node!==void 0&&(o.push(this.getDependency("node",g)),a.push(this.getDependency("accessor",m)),l.push(this.getDependency("accessor",w)),c.push(x),h.push(v))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){let d=u[0],p=u[1],x=u[2],v=u[3],g=u[4],m=[];for(let w=0,S=d.length;w<S;w++){let _=d[w],D=p[w],I=x[w],A=v[w],T=g[w];if(_===void 0)continue;_.updateMatrix&&_.updateMatrix();let b=n._createAnimationTracks(_,D,I,A,T);if(b)for(let y=0;y<b.length;y++)m.push(b[y])}return new ml(r,void 0,m)})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=s.weights.length;l<c;l++)a.morphTargetInfluences[l]=s.weights[l]}),o})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=s.children||[];for(let c=0,h=a.length;c<h;c++)o.push(n.getDependency("node",a[c]));let l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){let h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(p){p.isSkinnedMesh&&p.bind(d,pS)});for(let p=0,x=u.length;p<x;p++)h.add(u[p]);return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let h;if(r.isBone===!0?h=new vo:c.length>1?h=new Ct:c.length===1?h=c[0]:h=new At,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=o),Zi(h,r),r.extensions&&Xs(n,h,r),r.matrix!==void 0){let u=new je;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);return s.associations.has(h)||s.associations.set(h,{}),s.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new Ct;n.name&&(r.name=s.createUniqueName(n.name)),Zi(r,n),n.extensions&&Xs(t,r,n);let o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(s.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let h=0,u=l.length;h<u;h++)r.add(l[h]);let c=h=>{let u=new Map;for(let[d,p]of s.associations)(d instanceof _n||d instanceof Ht)&&u.set(d,p);return h.traverse(d=>{let p=s.associations.get(d);p!=null&&u.set(d,p)}),u};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){let o=[],a=e.name?e.name:e.uuid,l=[];_s[r.path]===_s.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(a);let c;switch(_s[r.path]){case _s.weights:c=zi;break;case _s.rotation:c=Hi;break;case _s.position:case _s.scale:c=Vi;break;default:n.itemSize===1?c=zi:c=Vi;break}let h=s.interpolation!==void 0?lS[s.interpolation]:cs,u=this._getArrayFromAccessor(n);for(let d=0,p=l.length;d<p;d++){let x=new c(l[d]+"."+_s[r.path],t.array,u,h);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(x),o.push(x)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=bf(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof Hi?Mf:Xl;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function mS(i,e,t){let n=e.attributes,s=new kn;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(s.set(new B(l[0],l[1],l[2]),new B(c[0],c[1],c[2])),a.normalized){let h=bf(zr[a.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new B,l=new B;for(let c=0,h=r.length;c<h;c++){let u=r[c];if(u.POSITION!==void 0){let d=t.json.accessors[u.POSITION],p=d.min,x=d.max;if(p!==void 0&&x!==void 0){if(l.setX(Math.max(Math.abs(p[0]),Math.abs(x[0]))),l.setY(Math.max(Math.abs(p[1]),Math.abs(x[1]))),l.setZ(Math.max(Math.abs(p[2]),Math.abs(x[2]))),d.normalized){let v=bf(zr[d.componentType]);l.multiplyScalar(v)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}i.boundingBox=s;let o=new Ln;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=o}function wm(i,e,t){let n=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){i.setAttribute(a,l)})}for(let o in n){let a=Sf[o]||o.toLowerCase();a in i.attributes||s.push(r(n[o],a))}if(e.indices!==void 0&&!i.index){let o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});s.push(o)}return ct.workingColorSpace!==kt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ct.workingColorSpace}" not supported.`),Zi(i,e),mS(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?hS(i,e.targets,t):i})}var qn=Uint8Array,Hr=Uint16Array,gS=Int32Array,Am=new qn([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Em=new qn([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),xS=new qn([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Rm=function(i,e){for(var t=new Hr(31),n=0;n<31;++n)t[n]=e+=1<<i[n-1];for(var s=new gS(t[30]),n=1;n<30;++n)for(var r=t[n];r<t[n+1];++r)s[r]=r-t[n]<<5|n;return{b:t,r:s}},Cm=Rm(Am,2),Im=Cm.b,vS=Cm.r;Im[28]=258,vS[258]=28;var Pm=Rm(Em,0),yS=Pm.b,fb=Pm.r,Ef=new Hr(32768);for(_t=0;_t<32768;++_t)Ki=(_t&43690)>>1|(_t&21845)<<1,Ki=(Ki&52428)>>2|(Ki&13107)<<2,Ki=(Ki&61680)>>4|(Ki&3855)<<4,Ef[_t]=((Ki&65280)>>8|(Ki&255)<<8)>>1;var Ki,_t,Jo=(function(i,e,t){for(var n=i.length,s=0,r=new Hr(e);s<n;++s)i[s]&&++r[i[s]-1];var o=new Hr(e);for(s=1;s<e;++s)o[s]=o[s-1]+r[s-1]<<1;var a;if(t){a=new Hr(1<<e);var l=15-e;for(s=0;s<n;++s)if(i[s])for(var c=s<<4|i[s],h=e-i[s],u=o[i[s]-1]++<<h,d=u|(1<<h)-1;u<=d;++u)a[Ef[u]>>l]=c}else for(a=new Hr(n),s=0;s<n;++s)i[s]&&(a[s]=Ef[o[i[s]-1]++]>>15-i[s]);return a}),Qo=new qn(288);for(_t=0;_t<144;++_t)Qo[_t]=8;var _t;for(_t=144;_t<256;++_t)Qo[_t]=9;var _t;for(_t=256;_t<280;++_t)Qo[_t]=7;var _t;for(_t=280;_t<288;++_t)Qo[_t]=8;var _t,Lm=new qn(32);for(_t=0;_t<32;++_t)Lm[_t]=5;var _t;var _S=Jo(Qo,9,1);var MS=Jo(Lm,5,1),Tf=function(i){for(var e=i[0],t=1;t<i.length;++t)i[t]>e&&(e=i[t]);return e},li=function(i,e,t){var n=e/8|0;return(i[n]|i[n+1]<<8)>>(e&7)&t},Af=function(i,e){var t=e/8|0;return(i[t]|i[t+1]<<8|i[t+2]<<16)>>(e&7)},SS=function(i){return(i+7)/8|0},bS=function(i,e,t){return(e==null||e<0)&&(e=0),(t==null||t>i.length)&&(t=i.length),new qn(i.subarray(e,t))};var wS=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],ci=function(i,e,t){var n=new Error(e||wS[i]);if(n.code=i,Error.captureStackTrace&&Error.captureStackTrace(n,ci),!t)throw n;return n},TS=function(i,e,t,n){var s=i.length,r=n?n.length:0;if(!s||e.f&&!e.l)return t||new qn(0);var o=!t,a=o||e.i!=2,l=e.i;o&&(t=new qn(s*3));var c=function(Je){var fe=t.length;if(Je>fe){var me=new qn(Math.max(fe*2,Je));me.set(t),t=me}},h=e.f||0,u=e.p||0,d=e.b||0,p=e.l,x=e.d,v=e.m,g=e.n,m=s*8;do{if(!p){h=li(i,u,1);var w=li(i,u+1,3);if(u+=3,w)if(w==1)p=_S,x=MS,v=9,g=5;else if(w==2){var I=li(i,u,31)+257,A=li(i,u+10,15)+4,T=I+li(i,u+5,31)+1;u+=14;for(var b=new qn(T),y=new qn(19),E=0;E<A;++E)y[xS[E]]=li(i,u+E*3,7);u+=A*3;for(var F=Tf(y),U=(1<<F)-1,k=Jo(y,F,1),E=0;E<T;){var G=k[li(i,u,U)];u+=G&15;var S=G>>4;if(S<16)b[E++]=S;else{var V=0,$=0;for(S==16?($=3+li(i,u,3),u+=2,V=b[E-1]):S==17?($=3+li(i,u,7),u+=3):S==18&&($=11+li(i,u,127),u+=7);$--;)b[E++]=V}}var X=b.subarray(0,I),j=b.subarray(I);v=Tf(X),g=Tf(j),p=Jo(X,v,1),x=Jo(j,g,1)}else ci(1);else{var S=SS(u)+4,_=i[S-4]|i[S-3]<<8,D=S+_;if(D>s){l&&ci(0);break}a&&c(d+_),t.set(i.subarray(S,D),d),e.b=d+=_,e.p=u=D*8,e.f=h;continue}if(u>m){l&&ci(0);break}}a&&c(d+131072);for(var P=(1<<v)-1,W=(1<<g)-1,ee=u;;ee=u){var V=p[Af(i,u)&P],le=V>>4;if(u+=V&15,u>m){l&&ci(0);break}if(V||ci(2),le<256)t[d++]=le;else if(le==256){ee=u,p=null;break}else{var Y=le-254;if(le>264){var E=le-257,te=Am[E];Y=li(i,u,(1<<te)-1)+Im[E],u+=te}var ne=x[Af(i,u)&W],q=ne>>4;ne||ci(3),u+=ne&15;var j=yS[q];if(q>3){var te=Em[q];j+=Af(i,u)&(1<<te)-1,u+=te}if(u>m){l&&ci(0);break}a&&c(d+131072);var ve=d+Y;if(d<j){var Ee=r-j,Le=Math.min(j,ve);for(Ee+d<0&&ci(3);d<Le;++d)t[d]=n[Ee+d]}for(;d<ve;++d)t[d]=t[d-j]}}e.l=p,e.p=ee,e.b=d,e.f=h,p&&(h=1,e.m=v,e.d=x,e.n=g)}while(!h);return d!=t.length&&o?bS(t,0,d):t.subarray(0,d)};var AS=new qn(0);var ES=function(i,e){return((i[0]&15)!=8||i[0]>>4>7||(i[0]<<8|i[1])%31)&&ci(6,"invalid zlib data"),(i[1]>>5&1)==+!e&&ci(6,"invalid zlib data: "+(i[1]&32?"need":"unexpected")+" dictionary"),(i[1]>>3&4)+2};function $o(i,e){return TS(i.subarray(ES(i,e&&e.dictionary),-4),{i:2},e&&e.out,e&&e.dictionary)}var RS=typeof TextDecoder<"u"&&new TextDecoder,CS=0;try{RS.decode(AS,{stream:!0}),CS=1}catch{}var Yl=class extends Er{constructor(e){super(e),this.type=Bt}parse(e){let b=Math.pow(2.7182818,2.2);function y(f,M){let R=0;for(let N=0;N<65536;++N)(N==0||f[N>>3]&1<<(N&7))&&(M[R++]=N);let L=R-1;for(;R<65536;)M[R++]=0;return L}function E(f){for(let M=0;M<16384;M++)f[M]={},f[M].len=0,f[M].lit=0,f[M].p=null}let F={l:0,c:0,lc:0};function U(f,M,R,L,N){for(;R<f;)M=M<<8|ze(L,N),R+=8;R-=f,F.l=M>>R&(1<<f)-1,F.c=M,F.lc=R}let k=new Array(59);function G(f){for(let R=0;R<=58;++R)k[R]=0;for(let R=0;R<65537;++R)k[f[R]]+=1;let M=0;for(let R=58;R>0;--R){let L=M+k[R]>>1;k[R]=M,M=L}for(let R=0;R<65537;++R){let L=f[R];L>0&&(f[R]=L|k[L]++<<6)}}function V(f,M,R,L,N,H){let K=M,oe=0,Q=0;for(;L<=N;L++){if(K.value-M.value>R)return!1;U(6,oe,Q,f,K);let ie=F.l;if(oe=F.c,Q=F.lc,H[L]=ie,ie==63){if(K.value-M.value>R)throw new Error("Something wrong with hufUnpackEncTable");U(8,oe,Q,f,K);let se=F.l+6;if(oe=F.c,Q=F.lc,L+se>N+1)throw new Error("Something wrong with hufUnpackEncTable");for(;se--;)H[L++]=0;L--}else if(ie>=59){let se=ie-59+2;if(L+se>N+1)throw new Error("Something wrong with hufUnpackEncTable");for(;se--;)H[L++]=0;L--}}G(H)}function $(f){return f&63}function X(f){return f>>6}function j(f,M,R,L){for(;M<=R;M++){let N=X(f[M]),H=$(f[M]);if(N>>H)throw new Error("Invalid table entry");if(H>14){let K=L[N>>H-14];if(K.len)throw new Error("Invalid table entry");if(K.lit++,K.p){let oe=K.p;K.p=new Array(K.lit);for(let Q=0;Q<K.lit-1;++Q)K.p[Q]=oe[Q]}else K.p=new Array(1);K.p[K.lit-1]=M}else if(H){let K=0;for(let oe=1<<14-H;oe>0;oe--){let Q=L[(N<<14-H)+K];if(Q.len||Q.p)throw new Error("Invalid table entry");Q.len=H,Q.lit=M,K++}}}return!0}let P={c:0,lc:0};function W(f,M,R,L){f=f<<8|ze(R,L),M+=8,P.c=f,P.lc=M}let ee={c:0,lc:0};function le(f,M,R,L,N,H,K,oe,Q){if(f==M){L<8&&(W(R,L,N,H),R=P.c,L=P.lc),L-=8;let ie=R>>L;if(ie=new Uint8Array([ie])[0],oe.value+ie>Q)return!1;let se=K[oe.value-1];for(;ie-- >0;)K[oe.value++]=se}else if(oe.value<Q)K[oe.value++]=f;else return!1;ee.c=R,ee.lc=L}function Y(f){return f&65535}function te(f){let M=Y(f);return M>32767?M-65536:M}let ne={a:0,b:0};function q(f,M){let R=te(f),N=te(M),H=R+(N&1)+(N>>1),K=H,oe=H-N;ne.a=K,ne.b=oe}function ve(f,M){let R=Y(f),L=Y(M),N=R-(L>>1)&65535,H=L+N-32768&65535;ne.a=H,ne.b=N}function Ee(f,M,R,L,N,H,K){let oe=K<16384,Q=R>N?N:R,ie=1,se,ce;for(;ie<=Q;)ie<<=1;for(ie>>=1,se=ie,ie>>=1;ie>=1;){ce=0;let be=ce+H*(N-se),Te=H*ie,Pe=H*se,Ie=L*ie,Ae=L*se,Se,at,Ke,Pt;for(;ce<=be;ce+=Pe){let gt=ce,$e=ce+L*(R-se);for(;gt<=$e;gt+=Ae){let Lt=gt+Ie,lt=gt+Te,St=lt+Ie;oe?(q(f[gt+M],f[lt+M]),Se=ne.a,Ke=ne.b,q(f[Lt+M],f[St+M]),at=ne.a,Pt=ne.b,q(Se,at),f[gt+M]=ne.a,f[Lt+M]=ne.b,q(Ke,Pt),f[lt+M]=ne.a,f[St+M]=ne.b):(ve(f[gt+M],f[lt+M]),Se=ne.a,Ke=ne.b,ve(f[Lt+M],f[St+M]),at=ne.a,Pt=ne.b,ve(Se,at),f[gt+M]=ne.a,f[Lt+M]=ne.b,ve(Ke,Pt),f[lt+M]=ne.a,f[St+M]=ne.b)}if(R&ie){let Lt=gt+Te;oe?q(f[gt+M],f[Lt+M]):ve(f[gt+M],f[Lt+M]),Se=ne.a,f[Lt+M]=ne.b,f[gt+M]=Se}}if(N&ie){let gt=ce,$e=ce+L*(R-se);for(;gt<=$e;gt+=Ae){let Lt=gt+Ie;oe?q(f[gt+M],f[Lt+M]):ve(f[gt+M],f[Lt+M]),Se=ne.a,f[Lt+M]=ne.b,f[gt+M]=Se}}se=ie,ie>>=1}return ce}function Le(f,M,R,L,N,H,K,oe,Q){let ie=0,se=0,ce=K,be=Math.trunc(L.value+(N+7)/8);for(;L.value<be;)for(W(ie,se,R,L),ie=P.c,se=P.lc;se>=14;){let Pe=ie>>se-14&16383,Ie=M[Pe];if(Ie.len)se-=Ie.len,le(Ie.lit,H,ie,se,R,L,oe,Q,ce),ie=ee.c,se=ee.lc;else{if(!Ie.p)throw new Error("hufDecode issues");let Ae;for(Ae=0;Ae<Ie.lit;Ae++){let Se=$(f[Ie.p[Ae]]);for(;se<Se&&L.value<be;)W(ie,se,R,L),ie=P.c,se=P.lc;if(se>=Se&&X(f[Ie.p[Ae]])==(ie>>se-Se&(1<<Se)-1)){se-=Se,le(Ie.p[Ae],H,ie,se,R,L,oe,Q,ce),ie=ee.c,se=ee.lc;break}}if(Ae==Ie.lit)throw new Error("hufDecode issues")}}let Te=8-N&7;for(ie>>=Te,se-=Te;se>0;){let Pe=M[ie<<14-se&16383];if(Pe.len)se-=Pe.len,le(Pe.lit,H,ie,se,R,L,oe,Q,ce),ie=ee.c,se=ee.lc;else throw new Error("hufDecode issues")}return!0}function Je(f,M,R,L,N,H){let K={value:0},oe=R.value,Q=Xe(M,R),ie=Xe(M,R);R.value+=4;let se=Xe(M,R);if(R.value+=4,Q<0||Q>=65537||ie<0||ie>=65537)throw new Error("Something wrong with HUF_ENCSIZE");let ce=new Array(65537),be=new Array(16384);E(be);let Te=L-(R.value-oe);if(V(f,R,Te,Q,ie,ce),se>8*(L-(R.value-oe)))throw new Error("Something wrong with hufUncompress");j(ce,Q,ie,be),Le(ce,be,f,R,se,ie,H,N,K)}function fe(f,M,R){for(let L=0;L<R;++L)M[L]=f[M[L]]}function me(f){for(let M=1;M<f.length;M++){let R=f[M-1]+f[M]-128;f[M]=R}}function z(f,M){let R=0,L=Math.floor((f.length+1)/2),N=0,H=f.length-1;for(;!(N>H||(M[N++]=f[R++],N>H));)M[N++]=f[L++]}function Ne(f){let M=f.byteLength,R=new Array,L=0,N=new DataView(f);for(;M>0;){let H=N.getInt8(L++);if(H<0){let K=-H;M-=K+1;for(let oe=0;oe<K;oe++)R.push(N.getUint8(L++))}else{let K=H;M-=2;let oe=N.getUint8(L++);for(let Q=0;Q<K+1;Q++)R.push(oe)}}return R}function _e(f,M,R,L,N,H){let K=new DataView(H.buffer),oe=R[f.idx[0]].width,Q=R[f.idx[0]].height,ie=3,se=Math.floor(oe/8),ce=Math.ceil(oe/8),be=Math.ceil(Q/8),Te=oe-(ce-1)*8,Pe=Q-(be-1)*8,Ie={value:0},Ae=new Array(ie),Se=new Array(ie),at=new Array(ie),Ke=new Array(ie),Pt=new Array(ie);for(let $e=0;$e<ie;++$e)Pt[$e]=M[f.idx[$e]],Ae[$e]=$e<1?0:Ae[$e-1]+ce*be,Se[$e]=new Float32Array(64),at[$e]=new Uint16Array(64),Ke[$e]=new Uint16Array(ce*64);for(let $e=0;$e<be;++$e){let Lt=8;$e==be-1&&(Lt=Pe);let lt=8;for(let dt=0;dt<ce;++dt){dt==ce-1&&(lt=Te);for(let ot=0;ot<ie;++ot)at[ot].fill(0),at[ot][0]=N[Ae[ot]++],Oe(Ie,L,at[ot]),Re(at[ot],Se[ot]),Ze(Se[ot]);ie==3&&Fe(Se);for(let ot=0;ot<ie;++ot)O(Se[ot],Ke[ot],dt*64)}let St=0;for(let dt=0;dt<ie;++dt){let ot=R[f.idx[dt]].type;for(let Jt=8*$e;Jt<8*$e+Lt;++Jt){St=Pt[dt][Jt];for(let vn=0;vn<se;++vn){let Rn=vn*64+(Jt&7)*8;K.setUint16(St+0*ot,Ke[dt][Rn+0],!0),K.setUint16(St+2*ot,Ke[dt][Rn+1],!0),K.setUint16(St+4*ot,Ke[dt][Rn+2],!0),K.setUint16(St+6*ot,Ke[dt][Rn+3],!0),K.setUint16(St+8*ot,Ke[dt][Rn+4],!0),K.setUint16(St+10*ot,Ke[dt][Rn+5],!0),K.setUint16(St+12*ot,Ke[dt][Rn+6],!0),K.setUint16(St+14*ot,Ke[dt][Rn+7],!0),St+=16*ot}}if(se!=ce)for(let Jt=8*$e;Jt<8*$e+Lt;++Jt){let vn=Pt[dt][Jt]+8*se*2*ot,Rn=se*64+(Jt&7)*8;for(let ra=0;ra<lt;++ra)K.setUint16(vn+ra*2*ot,Ke[dt][Rn+ra],!0)}}}let gt=new Uint16Array(oe);K=new DataView(H.buffer);for(let $e=0;$e<ie;++$e){R[f.idx[$e]].decoded=!0;let Lt=R[f.idx[$e]].type;if(R[$e].type==2)for(let lt=0;lt<Q;++lt){let St=Pt[$e][lt];for(let dt=0;dt<oe;++dt)gt[dt]=K.getUint16(St+dt*2*Lt,!0);for(let dt=0;dt<oe;++dt)K.setFloat32(St+dt*2*Lt,re(gt[dt]),!0)}}}function Oe(f,M,R){let L,N=1;for(;N<64;)L=M[f.value],L==65280?N=64:L>>8==255?N+=L&255:(R[N]=L,N++),f.value++}function Re(f,M){M[0]=re(f[0]),M[1]=re(f[1]),M[2]=re(f[5]),M[3]=re(f[6]),M[4]=re(f[14]),M[5]=re(f[15]),M[6]=re(f[27]),M[7]=re(f[28]),M[8]=re(f[2]),M[9]=re(f[4]),M[10]=re(f[7]),M[11]=re(f[13]),M[12]=re(f[16]),M[13]=re(f[26]),M[14]=re(f[29]),M[15]=re(f[42]),M[16]=re(f[3]),M[17]=re(f[8]),M[18]=re(f[12]),M[19]=re(f[17]),M[20]=re(f[25]),M[21]=re(f[30]),M[22]=re(f[41]),M[23]=re(f[43]),M[24]=re(f[9]),M[25]=re(f[11]),M[26]=re(f[18]),M[27]=re(f[24]),M[28]=re(f[31]),M[29]=re(f[40]),M[30]=re(f[44]),M[31]=re(f[53]),M[32]=re(f[10]),M[33]=re(f[19]),M[34]=re(f[23]),M[35]=re(f[32]),M[36]=re(f[39]),M[37]=re(f[45]),M[38]=re(f[52]),M[39]=re(f[54]),M[40]=re(f[20]),M[41]=re(f[22]),M[42]=re(f[33]),M[43]=re(f[38]),M[44]=re(f[46]),M[45]=re(f[51]),M[46]=re(f[55]),M[47]=re(f[60]),M[48]=re(f[21]),M[49]=re(f[34]),M[50]=re(f[37]),M[51]=re(f[47]),M[52]=re(f[50]),M[53]=re(f[56]),M[54]=re(f[59]),M[55]=re(f[61]),M[56]=re(f[35]),M[57]=re(f[36]),M[58]=re(f[48]),M[59]=re(f[49]),M[60]=re(f[57]),M[61]=re(f[58]),M[62]=re(f[62]),M[63]=re(f[63])}function Ze(f){let M=.5*Math.cos(.7853975),R=.5*Math.cos(3.14159/16),L=.5*Math.cos(3.14159/8),N=.5*Math.cos(3*3.14159/16),H=.5*Math.cos(5*3.14159/16),K=.5*Math.cos(3*3.14159/8),oe=.5*Math.cos(7*3.14159/16),Q=new Array(4),ie=new Array(4),se=new Array(4),ce=new Array(4);for(let be=0;be<8;++be){let Te=be*8;Q[0]=L*f[Te+2],Q[1]=K*f[Te+2],Q[2]=L*f[Te+6],Q[3]=K*f[Te+6],ie[0]=R*f[Te+1]+N*f[Te+3]+H*f[Te+5]+oe*f[Te+7],ie[1]=N*f[Te+1]-oe*f[Te+3]-R*f[Te+5]-H*f[Te+7],ie[2]=H*f[Te+1]-R*f[Te+3]+oe*f[Te+5]+N*f[Te+7],ie[3]=oe*f[Te+1]-H*f[Te+3]+N*f[Te+5]-R*f[Te+7],se[0]=M*(f[Te+0]+f[Te+4]),se[3]=M*(f[Te+0]-f[Te+4]),se[1]=Q[0]+Q[3],se[2]=Q[1]-Q[2],ce[0]=se[0]+se[1],ce[1]=se[3]+se[2],ce[2]=se[3]-se[2],ce[3]=se[0]-se[1],f[Te+0]=ce[0]+ie[0],f[Te+1]=ce[1]+ie[1],f[Te+2]=ce[2]+ie[2],f[Te+3]=ce[3]+ie[3],f[Te+4]=ce[3]-ie[3],f[Te+5]=ce[2]-ie[2],f[Te+6]=ce[1]-ie[1],f[Te+7]=ce[0]-ie[0]}for(let be=0;be<8;++be)Q[0]=L*f[16+be],Q[1]=K*f[16+be],Q[2]=L*f[48+be],Q[3]=K*f[48+be],ie[0]=R*f[8+be]+N*f[24+be]+H*f[40+be]+oe*f[56+be],ie[1]=N*f[8+be]-oe*f[24+be]-R*f[40+be]-H*f[56+be],ie[2]=H*f[8+be]-R*f[24+be]+oe*f[40+be]+N*f[56+be],ie[3]=oe*f[8+be]-H*f[24+be]+N*f[40+be]-R*f[56+be],se[0]=M*(f[be]+f[32+be]),se[3]=M*(f[be]-f[32+be]),se[1]=Q[0]+Q[3],se[2]=Q[1]-Q[2],ce[0]=se[0]+se[1],ce[1]=se[3]+se[2],ce[2]=se[3]-se[2],ce[3]=se[0]-se[1],f[0+be]=ce[0]+ie[0],f[8+be]=ce[1]+ie[1],f[16+be]=ce[2]+ie[2],f[24+be]=ce[3]+ie[3],f[32+be]=ce[3]-ie[3],f[40+be]=ce[2]-ie[2],f[48+be]=ce[1]-ie[1],f[56+be]=ce[0]-ie[0]}function Fe(f){for(let M=0;M<64;++M){let R=f[0][M],L=f[1][M],N=f[2][M];f[0][M]=R+1.5747*N,f[1][M]=R-.1873*L-.4682*N,f[2][M]=R+1.8556*L}}function O(f,M,R){for(let L=0;L<64;++L)M[R+L]=ms.toHalfFloat(C(f[L]))}function C(f){return f<=1?Math.sign(f)*Math.pow(Math.abs(f),2.2):Math.sign(f)*Math.pow(b,Math.abs(f)-1)}function J(f){return new DataView(f.array.buffer,f.offset.value,f.size)}function he(f){let M=f.viewer.buffer.slice(f.offset.value,f.offset.value+f.size),R=new Uint8Array(Ne(M)),L=new Uint8Array(R.length);return me(R),z(R,L),new DataView(L.buffer)}function ge(f){let M=f.array.slice(f.offset.value,f.offset.value+f.size),R=$o(M),L=new Uint8Array(R.length);return me(R),z(R,L),new DataView(L.buffer)}function ue(f){let M=f.viewer,R={value:f.offset.value},L=new Uint16Array(f.columns*f.lines*(f.inputChannels.length*f.type)),N=new Uint8Array(8192),H=0,K=new Array(f.inputChannels.length);for(let Pe=0,Ie=f.inputChannels.length;Pe<Ie;Pe++)K[Pe]={},K[Pe].start=H,K[Pe].end=K[Pe].start,K[Pe].nx=f.columns,K[Pe].ny=f.lines,K[Pe].size=f.type,H+=K[Pe].nx*K[Pe].ny*K[Pe].size;let oe=ae(M,R),Q=ae(M,R);if(Q>=8192)throw new Error("Something is wrong with PIZ_COMPRESSION BITMAP_SIZE");if(oe<=Q)for(let Pe=0;Pe<Q-oe+1;Pe++)N[Pe+oe]=et(M,R);let ie=new Uint16Array(65536),se=y(N,ie),ce=Xe(M,R);Je(f.array,M,R,ce,L,H);for(let Pe=0;Pe<f.inputChannels.length;++Pe){let Ie=K[Pe];for(let Ae=0;Ae<K[Pe].size;++Ae)Ee(L,Ie.start+Ae,Ie.nx,Ie.size,Ie.ny,Ie.nx*Ie.size,se)}fe(ie,L,H);let be=0,Te=new Uint8Array(L.buffer.byteLength);for(let Pe=0;Pe<f.lines;Pe++)for(let Ie=0;Ie<f.inputChannels.length;Ie++){let Ae=K[Ie],Se=Ae.nx*Ae.size,at=new Uint8Array(L.buffer,Ae.end*2,Se*2);Te.set(at,be),be+=Se*2,Ae.end+=Se}return new DataView(Te.buffer)}function Ve(f){let M=f.array.slice(f.offset.value,f.offset.value+f.size),R=$o(M),L=f.inputChannels.length*f.lines*f.columns*f.totalBytes,N=new ArrayBuffer(L),H=new DataView(N),K=0,oe=0,Q=new Array(4);for(let ie=0;ie<f.lines;ie++)for(let se=0;se<f.inputChannels.length;se++){let ce=0;switch(f.inputChannels[se].pixelType){case 1:Q[0]=K,Q[1]=Q[0]+f.columns,K=Q[1]+f.columns;for(let Te=0;Te<f.columns;++Te){let Pe=R[Q[0]++]<<8|R[Q[1]++];ce+=Pe,H.setUint16(oe,ce,!0),oe+=2}break;case 2:Q[0]=K,Q[1]=Q[0]+f.columns,Q[2]=Q[1]+f.columns,K=Q[2]+f.columns;for(let Te=0;Te<f.columns;++Te){let Pe=R[Q[0]++]<<24|R[Q[1]++]<<16|R[Q[2]++]<<8;ce+=Pe,H.setUint32(oe,ce,!0),oe+=4}break}}return H}function Ce(f){let M=f.viewer,R={value:f.offset.value},L=new Uint8Array(f.columns*f.lines*(f.inputChannels.length*f.type*2)),N={version:Ye(M,R),unknownUncompressedSize:Ye(M,R),unknownCompressedSize:Ye(M,R),acCompressedSize:Ye(M,R),dcCompressedSize:Ye(M,R),rleCompressedSize:Ye(M,R),rleUncompressedSize:Ye(M,R),rleRawSize:Ye(M,R),totalAcUncompressedCount:Ye(M,R),totalDcUncompressedCount:Ye(M,R),acCompression:Ye(M,R)};if(N.version<2)throw new Error("EXRLoader.parse: "+Ti.compression+" version "+N.version+" is unsupported");let H=new Array,K=ae(M,R)-2;for(;K>0;){let Ie=De(M.buffer,R),Ae=et(M,R),Se=Ae>>2&3,at=(Ae>>4)-1,Ke=new Int8Array([at])[0],Pt=et(M,R);H.push({name:Ie,index:Ke,type:Pt,compression:Se}),K-=Ie.length+3}let oe=Ti.channels,Q=new Array(f.inputChannels.length);for(let Ie=0;Ie<f.inputChannels.length;++Ie){let Ae=Q[Ie]={},Se=oe[Ie];Ae.name=Se.name,Ae.compression=0,Ae.decoded=!1,Ae.type=Se.pixelType,Ae.pLinear=Se.pLinear,Ae.width=f.columns,Ae.height=f.lines}let ie={idx:new Array(3)};for(let Ie=0;Ie<f.inputChannels.length;++Ie){let Ae=Q[Ie];for(let Se=0;Se<H.length;++Se){let at=H[Se];Ae.name==at.name&&(Ae.compression=at.compression,at.index>=0&&(ie.idx[at.index]=Ie),Ae.offset=Ie)}}let se,ce,be;if(N.acCompressedSize>0)switch(N.acCompression){case 0:se=new Uint16Array(N.totalAcUncompressedCount),Je(f.array,M,R,N.acCompressedSize,se,N.totalAcUncompressedCount);break;case 1:let Ie=f.array.slice(R.value,R.value+N.totalAcUncompressedCount),Ae=$o(Ie);se=new Uint16Array(Ae.buffer),R.value+=N.totalAcUncompressedCount;break}if(N.dcCompressedSize>0){let Ie={array:f.array,offset:R,size:N.dcCompressedSize};ce=new Uint16Array(ge(Ie).buffer),R.value+=N.dcCompressedSize}if(N.rleRawSize>0){let Ie=f.array.slice(R.value,R.value+N.rleCompressedSize),Ae=$o(Ie);be=Ne(Ae.buffer),R.value+=N.rleCompressedSize}let Te=0,Pe=new Array(Q.length);for(let Ie=0;Ie<Pe.length;++Ie)Pe[Ie]=new Array;for(let Ie=0;Ie<f.lines;++Ie)for(let Ae=0;Ae<Q.length;++Ae)Pe[Ae].push(Te),Te+=Q[Ae].width*f.type*2;_e(ie,Pe,Q,se,ce,L);for(let Ie=0;Ie<Q.length;++Ie){let Ae=Q[Ie];if(!Ae.decoded)switch(Ae.compression){case 2:let Se=0,at=0;for(let Ke=0;Ke<f.lines;++Ke){let Pt=Pe[Ie][Se];for(let gt=0;gt<Ae.width;++gt){for(let $e=0;$e<2*Ae.type;++$e)L[Pt++]=be[at+$e*Ae.width*Ae.height];at++}Se++}break;default:throw new Error("EXRLoader.parse: unsupported channel compression")}}return new DataView(L.buffer)}function De(f,M){let R=new Uint8Array(f),L=0;for(;R[M.value+L]!=0;)L+=1;let N=new TextDecoder().decode(R.slice(M.value,M.value+L));return M.value=M.value+L+1,N}function nt(f,M,R){let L=new TextDecoder().decode(new Uint8Array(f).slice(M.value,M.value+R));return M.value=M.value+R,L}function we(f,M){let R=Ge(f,M),L=Xe(f,M);return[R,L]}function He(f,M){let R=Xe(f,M),L=Xe(f,M);return[R,L]}function Ge(f,M){let R=f.getInt32(M.value,!0);return M.value=M.value+4,R}function Xe(f,M){let R=f.getUint32(M.value,!0);return M.value=M.value+4,R}function ze(f,M){let R=f[M.value];return M.value=M.value+1,R}function et(f,M){let R=f.getUint8(M.value);return M.value=M.value+1,R}let Ye=function(f,M){let R;return"getBigInt64"in DataView.prototype?R=Number(f.getBigInt64(M.value,!0)):R=f.getUint32(M.value+4,!0)+Number(f.getUint32(M.value,!0)<<32),M.value+=8,R};function Qe(f,M){let R=f.getFloat32(M.value,!0);return M.value+=4,R}function Z(f,M){return ms.toHalfFloat(Qe(f,M))}function re(f){let M=(f&31744)>>10,R=f&1023;return(f>>15?-1:1)*(M?M===31?R?NaN:1/0:Math.pow(2,M-15)*(1+R/1024):6103515625e-14*(R/1024))}function ae(f,M){let R=f.getUint16(M.value,!0);return M.value+=2,R}function xe(f,M){return re(ae(f,M))}function ke(f,M,R,L){let N=R.value,H=[];for(;R.value<N+L-1;){let K=De(M,R),oe=Ge(f,R),Q=et(f,R);R.value+=3;let ie=Ge(f,R),se=Ge(f,R);H.push({name:K,pixelType:oe,pLinear:Q,xSampling:ie,ySampling:se})}return R.value+=1,H}function Be(f,M){let R=Qe(f,M),L=Qe(f,M),N=Qe(f,M),H=Qe(f,M),K=Qe(f,M),oe=Qe(f,M),Q=Qe(f,M),ie=Qe(f,M);return{redX:R,redY:L,greenX:N,greenY:H,blueX:K,blueY:oe,whiteX:Q,whiteY:ie}}function it(f,M){let R=["NO_COMPRESSION","RLE_COMPRESSION","ZIPS_COMPRESSION","ZIP_COMPRESSION","PIZ_COMPRESSION","PXR24_COMPRESSION","B44_COMPRESSION","B44A_COMPRESSION","DWAA_COMPRESSION","DWAB_COMPRESSION"],L=et(f,M);return R[L]}function Dt(f,M){let R=Ge(f,M),L=Ge(f,M),N=Ge(f,M),H=Ge(f,M);return{xMin:R,yMin:L,xMax:N,yMax:H}}function jt(f,M){let R=["INCREASING_Y","DECREASING_Y","RANDOM_Y"],L=et(f,M);return R[L]}function xt(f,M){let R=["ENVMAP_LATLONG","ENVMAP_CUBE"],L=et(f,M);return R[L]}function En(f,M){let R=["ONE_LEVEL","MIPMAP_LEVELS","RIPMAP_LEVELS"],L=["ROUND_DOWN","ROUND_UP"],N=Xe(f,M),H=Xe(f,M),K=et(f,M);return{xSize:N,ySize:H,levelMode:R[K&15],roundingMode:L[K>>4]}}function Qn(f,M){let R=Qe(f,M),L=Qe(f,M);return[R,L]}function ta(f,M){let R=Qe(f,M),L=Qe(f,M),N=Qe(f,M);return[R,L,N]}function na(f,M,R,L,N){if(L==="string"||L==="stringvector"||L==="iccProfile")return nt(M,R,N);if(L==="chlist")return ke(f,M,R,N);if(L==="chromaticities")return Be(f,R);if(L==="compression")return it(f,R);if(L==="box2i")return Dt(f,R);if(L==="envmap")return xt(f,R);if(L==="tiledesc")return En(f,R);if(L==="lineOrder")return jt(f,R);if(L==="float")return Qe(f,R);if(L==="v2f")return Qn(f,R);if(L==="v3f")return ta(f,R);if(L==="int")return Ge(f,R);if(L==="rational")return we(f,R);if(L==="timecode")return He(f,R);if(L==="preview")return R.value+=N,"skipped";R.value+=N}function wi(f,M){let R=Math.log2(f);return M=="ROUND_DOWN"?Math.floor(R):Math.ceil(R)}function Wr(f,M,R){let L=0;switch(f.levelMode){case"ONE_LEVEL":L=1;break;case"MIPMAP_LEVELS":L=wi(Math.max(M,R),f.roundingMode)+1;break;case"RIPMAP_LEVELS":throw new Error("THREE.EXRLoader: RIPMAP_LEVELS tiles currently unsupported.")}return L}function Xr(f,M,R,L){let N=new Array(f);for(let H=0;H<f;H++){let K=1<<H,oe=M/K|0;L=="ROUND_UP"&&oe*K<M&&(oe+=1);let Q=Math.max(oe,1);N[H]=(Q+R-1)/R|0}return N}function ia(){let f=this,M=f.offset,R={value:0};for(let L=0;L<f.tileCount;L++){let N=Ge(f.viewer,M),H=Ge(f.viewer,M);M.value+=8,f.size=Xe(f.viewer,M);let K=N*f.blockWidth,oe=H*f.blockHeight;f.columns=K+f.blockWidth>f.width?f.width-K:f.blockWidth,f.lines=oe+f.blockHeight>f.height?f.height-oe:f.blockHeight;let Q=f.columns*f.totalBytes,se=f.size<f.lines*Q?f.uncompress(f):J(f);M.value+=f.size;for(let ce=0;ce<f.lines;ce++){let be=ce*f.columns*f.totalBytes;for(let Te=0;Te<f.inputChannels.length;Te++){let Pe=Ti.channels[Te].name,Ie=f.channelByteOffsets[Pe]*f.columns,Ae=f.decodeChannels[Pe];if(Ae===void 0)continue;R.value=be+Ie;let Se=(f.height-(1+oe+ce))*f.outLineWidth;for(let at=0;at<f.columns;at++){let Ke=Se+(at+K)*f.outputChannels+Ae;f.byteArray[Ke]=f.getter(se,R)}}}}}function qs(){let f=this,M=f.offset,R={value:0};for(let L=0;L<f.height/f.blockHeight;L++){let N=Ge(f.viewer,M)-Ti.dataWindow.yMin;f.size=Xe(f.viewer,M),f.lines=N+f.blockHeight>f.height?f.height-N:f.blockHeight;let H=f.columns*f.totalBytes,oe=f.size<f.lines*H?f.uncompress(f):J(f);M.value+=f.size;for(let Q=0;Q<f.blockHeight;Q++){let ie=L*f.blockHeight,se=Q+f.scanOrder(ie);if(se>=f.height)continue;let ce=Q*H,be=(f.height-1-se)*f.outLineWidth;for(let Te=0;Te<f.inputChannels.length;Te++){let Pe=Ti.channels[Te].name,Ie=f.channelByteOffsets[Pe]*f.columns,Ae=f.decodeChannels[Pe];if(Ae!==void 0){R.value=ce+Ie;for(let Se=0;Se<f.columns;Se++){let at=be+Se*f.outputChannels+Ae;f.byteArray[at]=f.getter(oe,R)}}}}}}function sa(f,M,R){let L={};if(f.getUint32(0,!0)!=20000630)throw new Error("THREE.EXRLoader: Provided file doesn't appear to be in OpenEXR format.");L.version=f.getUint8(4);let N=f.getUint8(5);L.spec={singleTile:!!(N&2),longName:!!(N&4),deepFormat:!!(N&8),multiPart:!!(N&16)},R.value=8;let H=!0;for(;H;){let K=De(M,R);if(K==0)H=!1;else{let oe=De(M,R),Q=Xe(f,R),ie=na(f,M,R,oe,Q);ie===void 0?console.warn(`THREE.EXRLoader: Skipped unknown header attribute type '${oe}'.`):L[K]=ie}}if((N&-7)!=0)throw console.error("THREE.EXRHeader:",L),new Error("THREE.EXRLoader: Provided file is currently unsupported.");return L}function Zs(f,M,R,L,N){let H={size:0,viewer:M,array:R,offset:L,width:f.dataWindow.xMax-f.dataWindow.xMin+1,height:f.dataWindow.yMax-f.dataWindow.yMin+1,inputChannels:f.channels,channelByteOffsets:{},scanOrder:null,totalBytes:null,columns:null,lines:null,type:null,uncompress:null,getter:null,format:null,colorSpace:kt};switch(f.compression){case"NO_COMPRESSION":H.blockHeight=1,H.uncompress=J;break;case"RLE_COMPRESSION":H.blockHeight=1,H.uncompress=he;break;case"ZIPS_COMPRESSION":H.blockHeight=1,H.uncompress=ge;break;case"ZIP_COMPRESSION":H.blockHeight=16,H.uncompress=ge;break;case"PIZ_COMPRESSION":H.blockHeight=32,H.uncompress=ue;break;case"PXR24_COMPRESSION":H.blockHeight=16,H.uncompress=Ve;break;case"DWAA_COMPRESSION":H.blockHeight=32,H.uncompress=Ce;break;case"DWAB_COMPRESSION":H.blockHeight=256,H.uncompress=Ce;break;default:throw new Error("EXRLoader.parse: "+f.compression+" is unsupported")}let K={};for(let se of f.channels)switch(se.name){case"Y":case"R":case"G":case"B":case"A":K[se.name]=!0,H.type=se.pixelType}let oe=!1;if(K.R&&K.G&&K.B)oe=!K.A,H.outputChannels=4,H.decodeChannels={R:0,G:1,B:2,A:3};else if(K.Y)H.outputChannels=1,H.decodeChannels={Y:0};else throw new Error("EXRLoader.parse: file contains unsupported data channels.");if(H.type==1)switch(N){case Gt:H.getter=xe;break;case Bt:H.getter=ae;break}else if(H.type==2)switch(N){case Gt:H.getter=Qe;break;case Bt:H.getter=Z}else throw new Error("EXRLoader.parse: unsupported pixelType "+H.type+" for "+f.compression+".");H.columns=H.width;let Q=H.width*H.height*H.outputChannels;switch(N){case Gt:H.byteArray=new Float32Array(Q),oe&&H.byteArray.fill(1,0,Q);break;case Bt:H.byteArray=new Uint16Array(Q),oe&&H.byteArray.fill(15360,0,Q);break;default:console.error("THREE.EXRLoader: unsupported type: ",N);break}let ie=0;for(let se of f.channels)H.decodeChannels[se.name]!==void 0&&(H.channelByteOffsets[se.name]=ie),ie+=se.pixelType*2;if(H.totalBytes=ie,H.outLineWidth=H.width*H.outputChannels,f.lineOrder==="INCREASING_Y"?H.scanOrder=se=>se:H.scanOrder=se=>H.height-1-se,H.outputChannels==4?(H.format=cn,H.colorSpace=kt):(H.format=ks,H.colorSpace=On),f.spec.singleTile){H.blockHeight=f.tiles.ySize,H.blockWidth=f.tiles.xSize;let se=Wr(f.tiles,H.width,H.height),ce=Xr(se,H.width,f.tiles.xSize,f.tiles.roundingMode),be=Xr(se,H.height,f.tiles.ySize,f.tiles.roundingMode);H.tileCount=ce[0]*be[0];for(let Te=0;Te<se;Te++)for(let Pe=0;Pe<be[Te];Pe++)for(let Ie=0;Ie<ce[Te];Ie++)Ye(M,L);H.decode=ia.bind(H)}else{H.blockWidth=H.width;let se=Math.ceil(H.height/H.blockHeight);for(let ce=0;ce<se;ce++)Ye(M,L);H.decode=qs.bind(H)}return H}let Yr={value:0},qr=new DataView(e),jl=new Uint8Array(e),Ti=sa(qr,e,Yr),ji=Zs(Ti,qr,jl,Yr,this.type);return ji.decode(),{header:Ti,width:ji.width,height:ji.height,data:ji.byteArray,format:ji.format,colorSpace:ji.colorSpace,type:this.type}}setDataType(e){return this.type=e,this}load(e,t,n,s){function r(o,a){o.colorSpace=a.colorSpace,o.minFilter=wt,o.magFilter=wt,o.generateMipmaps=!1,o.flipY=!1,t&&t(o,a)}return super.load(e,r,n,s)}};var PS=new URL("./assets/r1-lighting/",document.baseURI);function Dm({building:i,materials:e,renderer:t,shadow:n}){let s=new AbortController,r=new Ct;r.name="R1 baked diffuse sky and bounce";let o=new Set,a=new Set,l=new Set,c=[],h,u=!1,d=!1,p=!1,x=null,v=null,g={geometries:0,materials:0,textures:0};async function m(E,F=!1){let U=await fetch(new URL(E,PS),{signal:s.signal,cache:F?"no-cache":"default"});if(!U.ok)throw Error(`R1 asset ${U.status}: ${E}`);return F?U.json():U.arrayBuffer()}function w(E){if(u){E.dispose();return}o.add(E)}function S(E){if(u){E.dispose();return}a.add(E)}function _(E){if(u||!d)return!1;p=!!E,r.visible=p;for(let F of c)F.object.visible=p?!1:F.visible;return n(),D()}function D(){return{ready:d,enabled:p,disposed:u,error:x,receivers:v?.receivers||0,meshes:o.size,materials:a.size,atlasSize:h?[h.image.width,h.image.height]:null,atlasChannel:h?.channel,irradianceScale:v?.irradianceScale,encoding:v?.encoding,released:{...g}}}function I(E){if(!["Sample R1 longitudinal white oak","Pale bent oak chair veneer","Sample R1 sage fine woven upholstery"].includes(E.name))return E.clone();let F=new en;return It.prototype.copy.call(F,E),F.defines={STANDARD:"",PHYSICAL:""},E.name.includes("upholstery")?(F.sheen=.65,F.sheenRoughness=.85,F.sheenColor.setHex(10265745),F.normalScale.set(.11,.11)):(F.roughness=.74,F.clearcoat=E.name.startsWith("Sample")?.06:.04,F.clearcoatRoughness=.6,F.ior=1.47),F}function A(E,F,U){E.lightMap=h,E.lightMapIntensity=v.irradianceScale,E.onBeforeCompile=k=>{let G=`varying vec3 vR1WorldPosition;
float r1Weight(){${F?"vec2 d=min(vR1WorldPosition.xz-vec2(4.2,-6.6),vec2(9.4,-2.4)-vR1WorldPosition.xz);return smoothstep(0.0,0.5,min(d.x,d.y));":U?"return smoothstep(0.0,0.8,min(vR1WorldPosition.z+8.7,-2.6-vR1WorldPosition.z));":"return 1.0;"}}
`;k.vertexShader=`varying vec3 vR1WorldPosition;
`+k.vertexShader.replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
vR1WorldPosition=(modelMatrix*vec4(transformed,1.0)).xyz;`),k.fragmentShader=k.fragmentShader.replace("#include <common>",`#include <common>
`+G);let V=tt.lights_fragment_begin,$=V.indexOf("#if ( NUM_DIR_LIGHTS > 0 )"),X="RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );";if($<0||!V.slice(0,$).includes(X))throw Error("Unsupported Three lighting chunk");let j=V.slice(0,$).replaceAll(X,`{vec3 beforeR1Diffuse=reflectedLight.directDiffuse;${X}reflectedLight.directDiffuse=mix(reflectedLight.directDiffuse,beforeR1Diffuse,r1Weight());}`)+V.slice($);k.fragmentShader=k.fragmentShader.replace("#include <lights_fragment_begin>",j);let P=tt.lights_fragment_maps.replace("irradiance += lightMapIrradiance;","irradiance = mix(irradiance,lightMapIrradiance,r1Weight());").replace("iblIrradiance += getIBLIrradiance( geometryNormal );","iblIrradiance += (1.0-r1Weight())*getIBLIrradiance( geometryNormal );");k.fragmentShader=k.fragmentShader.replace("#include <lights_fragment_maps>",P)},E.customProgramCacheKey=()=>`library-r1-indirect-r170-${F?"floor":U?"wall":"fixed"}-v1`}async function T(){try{if(v=await m("r1-bake.json",!0),v.receivers!==47||v.encoding!=="linear-srgb-white-diffuse-radiance"||v.geometrySource!=="c75a5e2")throw Error("Unsupported R1 bake");let[E,F]=await Promise.all([m(v.geometry),m(v.atlas)]);if(u)return D();let U=new Yl().parse(F),k=U.data.length/(U.width*U.height),G=new U.data.constructor(U.data.length),V=U.width*k;for(let q=0;q<U.height;q++)G.set(U.data.subarray((U.height-1-q)*V,(U.height-q)*V),q*V);h=new ki(G,U.width,U.height,U.format,U.type),h.colorSpace=kt,h.flipY=!1,h.channel=1,h.generateMipmaps=!0,h.minFilter=fn,h.magFilter=wt,h.anisotropy=4,h.needsUpdate=!0,t.initTexture(h);let $=await new Wl().parseAsync(E,"");if($.scene.traverse(q=>{q.isMesh&&(w(q.geometry),l.add(q.material))}),u)return l.forEach(q=>q.dispose()),l.clear(),h?.dispose(),h=null,D();let X=i.getObjectByName("Furniture bookcases and reading desks"),j=X?.getObjectByName("Reading table 1"),P=X?.children.filter(q=>/^Chair R1-/.test(q.name))||[],W=i.getObjectByName("Continuous accessible floor"),ee=j?.children.filter(q=>q.isMesh&&(q.material===e.sampleWood||q.material===e.metal))||[],Y=i.getObjectByName("Structure stone and real window openings")?.children.filter(q=>q.isMesh&&["Cream limestone construction","Dark bronze powder coating construction"].includes(q.name))||[];if(P.length!==4||ee.length!==2||!W||Y.length!==2||o.size!==50)throw Error("R1 receiver/source mismatch");[...P,...ee,W,...Y].forEach(q=>c.push({object:q,visible:q.visible}));let te=new Map,ne=0;if($.scene.traverse(q=>{if(!q.isMesh)return;let ve=Object.values(e).find(Ee=>Ee?.isMaterial&&Ee.name===q.userData.sourceMaterial);if(!ve)throw Error("Unknown R1 material "+q.userData.sourceMaterial);if(!q.userData.bakeReceiver)q.material=ve;else{if(!q.geometry.getAttribute("uv1"))throw Error("Missing R1 UV1");let Ee=ve.name+(q.userData.floorFeather?" floor":q.userData.wallFeather?" wall":"");if(!te.has(Ee)){let Le=I(ve);Le.name=ve.name+" [R1 indirect]",A(Le,!!q.userData.floorFeather,!!q.userData.wallFeather),S(Le),te.set(Ee,Le)}q.material=te.get(Ee),ne++}q.castShadow=!0,q.receiveShadow=!0}),l.forEach(q=>q.dispose()),l.clear(),ne!==47)throw Error("Wrong R1 receiver count");r.userData.r1Lighting={...v,note:"GLB standard PBR does not reproduce the scoped irradiance shader; use the companion atlas and loader."},r.add($.scene),i.add(r),d=!0,_(!0)}catch(E){u||(x=E.message,b()),E.name!=="AbortError"&&!u&&console.warn("R1 lighting fallback:",E.message)}return D()}function b(){r.removeFromParent(),r.clear();for(let E of c)E.object.visible=E.visible;c.length=0;for(let E of o)E.dispose(),g.geometries++;o.clear();for(let E of a)E.dispose(),g.materials++;a.clear(),l.forEach(E=>E.dispose()),l.clear(),h&&(h.dispose(),g.textures++,h=null),p=!1,d=!1}function y(){u||(u=!0,s.abort(),b())}return{load:T,setEnabled:_,snapshot:D,dispose:y}}function Nm({scene:i,camera:e,building:t,targets:n,getState:s,activate:r,report:o}){let a=document.getElementById("interaction-markers"),l=document.getElementById("hint-toggle"),c=document.getElementById("explore-dialog"),h=document.getElementById("explore-list"),u=document.getElementById("destination"),d=document.getElementById("destination-text"),p=new B,x=new B,v=new vl,g=new mt(new hl(.38,.43,48),new zn({color:14265684,transparent:!0,opacity:.85,side:Nt,depthWrite:!1,toneMapped:!1}));g.name="Interaction location hint",g.rotation.x=-Math.PI/2,g.visible=!1,i.add(g);let m=new Map,w=!1,S=null,_=-1/0,D=!1,I=[],A=[],T={door:"\u95E8",shelf:"\u4E66",seat:"\u5EA7",book:"\u8BFB",desk:"\u8BE2",display:"\u9605"};for(let P of n){let W=document.createElement("button");W.className="world-marker",W.dataset.target=P.id,W.hidden=!0;let ee=document.createElement("span");ee.className="marker-icon",ee.textContent=T[P.kind],ee.setAttribute("aria-hidden","true");let le=document.createElement("span");le.className="marker-label",W.append(ee,le),W.onclick=()=>y(P),a.append(W),m.set(P.id,{button:W,label:le,target:P});let Y=document.createElement("button");Y.className="explore-item",Y.dataset.destination=P.id;let te=document.createElement("strong"),ne=document.createElement("span");te.textContent=P.label,ne.textContent=P.description,Y.append(te,ne),Y.onclick=()=>{c.close(),b(P),o("\u5DF2\u6807\u8BB0 "+P.label+"\u3002"+(s().seated?"\u5148\u7AD9\u8D77\uFF0C\u518D\u8DDF\u968F\u65B9\u5411\u8D70\u8FD1\u3002":"\u8FDB\u5165\u6F2B\u6E38\u540E\uFF0C\u8DDF\u968F\u65B9\u5411\u63D0\u793A\u8D70\u8FD1\u3002"))},h.append(Y)}function b(P){S=P,u.hidden=!1,F()}function y(P){let W=s();if(!(W.modal||!W.ready)){if(W.mode==="walk"&&!E(P,W)){b(P),o("\u5DF2\u6807\u8BB0 "+P.label+"\uFF0C\u8D70\u8FD1\u540E\u6309 E \u6216\u70B9\u51FB\u6807\u8BB0\u3002");return}r(P)}}function E(P,W){return P.kind==="book"&&W.seated?P.id==="book-"+W.seated.id.split("-")[0]:Math.hypot(W.pos.x-P.approach.x,W.pos.z-P.approach.z)<P.range}function F(){if(!S)return;let P=s(),W=P.pos.z>9.5&&S.kind!=="door",ee=W?{x:0,z:11}:S.approach,le=Math.hypot(P.pos.x-ee.x,P.pos.z-ee.z),Y=Math.atan2(-(ee.x-P.pos.x),-(ee.z-P.pos.z))-P.yaw;document.getElementById("destination-arrow").style.transform=`rotate(${-Y}rad)`,d.textContent=P.mode==="inspect"?S.label+" \xB7 \u8FDB\u5165\u6F2B\u6E38\u540E\u8DDF\u968F\u65B9\u5411":W?"\u5148\u4ECE\u5165\u53E3\u73BB\u7483\u95E8\u8FDB\u5165":E(S,P)?S.label+" \xB7 \u5DF2\u5230\u8FBE\uFF0C\u53EF\u6309 E \u4E92\u52A8":S.label+" \xB7 "+le.toFixed(1)+" \u7C73"}let U=[];t.traverse(P=>{if(!P.isMesh||P.isInstancedMesh)return;let W=P.userData.sourceMaterial||P.material?.name||"";/Cream limestone|Honed grey stone|Grey brick|Mineral plaster/.test(W)&&U.push(P)});function k(P){for(let W=P;W;W=W.parent)if(!W.visible)return!1;return!0}function G(P){x.copy(P).sub(e.position);let W=x.length();return v.set(e.position,x.normalize()),v.far=Math.max(0,W-.12),v.intersectObjects(U.filter(k),!1).length>0}function V(P,W,ee=7){return P.left<W.right+ee&&P.right>W.left-ee&&P.top<W.bottom+ee&&P.bottom>W.top-ee}function $(){A=[...document.querySelectorAll(".topbar,.guide,.bottom,#touch,#focus-panel,#destination,#interact,#toast")].filter(P=>!P.hidden).map(P=>P.getBoundingClientRect())}function X(){for(let{button:P}of m.values())P.hidden=!0;I=[],g.visible=!1}function j(P=performance.now(),W=!1){if(D)return;let ee=s();if(!ee.ready||ee.modal||document.hidden){X(),u.hidden=!0;return}if(u.hidden=!S||!!ee.seated,F(),!w){X();return}if(!W&&P-_<120)return;_=P,$(),X();let le=[];e.updateMatrixWorld();for(let ne of m.values()){let q=ne.target;if(ee.seated&&(q.kind!=="book"||!E(q,ee)))continue;let ve=e.position.distanceTo(q.anchor);if(ve>(q.kind==="door"?55:31)||(p.copy(q.anchor).project(e),p.z<-1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1))continue;let Ee=(p.x*.5+.5)*innerWidth,Le=(-p.y*.5+.5)*innerHeight,Je=innerWidth<640,fe=Je?q.short:q.label,me=Je?142:190,Ne={left:Ee-me/2,right:Ee+me/2,top:Le-48,bottom:Le};Ne.left<10||Ne.right>innerWidth-10||Ne.top<8||Ne.bottom>innerHeight-12||A.some(_e=>V(Ne,_e))||le.push({entry:ne,rect:Ne,x:Ee,y:Le,label:fe,dist:ve,priority:(S===q?-100:0)+(ee.nearest?.targetId===q.id?-80:0)+(q.kind==="seat"?4:0)+ve})}le.sort((ne,q)=>ne.priority-q.priority);let Y=[];for(let ne of le){if(Y.length>=(innerWidth<640?3:6)||Y.some(Je=>V(ne.rect,Je,10))||G(ne.entry.target.anchor))continue;let{button:q,label:ve,target:Ee}=ne.entry,Le=ee.mode==="walk"&&E(Ee,ee);ve.textContent=ne.label,q.dataset.near=String(Le),q.dataset.selected=String(S===Ee),q.title=ee.mode==="inspect"||Le?Ee.action:"\u6807\u8BB0\u65B9\u5411\uFF0C\u8D70\u8FD1\u4E92\u52A8",q.setAttribute("aria-label",Ee.label+"\uFF0C"+q.title),q.style.transform=`translate(${Math.round(ne.x)}px,${Math.round(ne.y)}px) translate(-50%,-100%)`,q.hidden=!1,Y.push(ne.rect),I.push(Ee.id)}let te=n.find(ne=>ne.id===ee.nearest?.targetId);te&&ee.mode==="walk"&&!ee.seated&&(g.position.set(te.anchor.x,te.kind==="book"?.823:.022,te.anchor.z),g.scale.setScalar(te.kind==="book"?.45:te.kind==="door"?1.5:1),g.visible=!0)}return l.onclick=()=>{w=!w,l.setAttribute("aria-pressed",String(w)),l.textContent=w?"\u4E92\u52A8\u6807\u8BB0\uFF1A\u5F00":"\u4E92\u52A8\u6807\u8BB0\uFF1A\u5173",j(performance.now(),!0)},document.getElementById("destination-clear").onclick=()=>{S=null,u.hidden=!0},{update:j,select:b,clear(){S=null,u.hidden=!0},isReachable:E,get selectedId(){return S?.id||null},snapshot:()=>({shown:w,disposed:D,selected:S?.id||null,visible:[...I],targets:n.length}),dispose(){D||(D=!0,X(),u.hidden=!0,l.onclick=null,document.getElementById("destination-clear").onclick=null,g.removeFromParent(),g.geometry.dispose(),g.material.dispose(),a.replaceChildren(),h.replaceChildren())}}}function Um({catalog:i,getState:e,pause:t,resume:n,report:s}){let r=D=>document.getElementById(D),o=r("reading-book-dialog"),a=r("explore-dialog"),l=!1,c=0,h=10*6e4,u=performance.now(),d=!document.hidden,p=!1,x="",v=new Set,g=null;function m(){if(p)return;let D=performance.now(),I=e();l&&d&&I.seated&&(c=Math.min(h,c+Math.max(0,D-u))),u=D,d=!document.hidden,l&&!I.seated&&(l=!1,s("\u5DF2\u79BB\u5F00\u5EA7\u4F4D\uFF0C\u9605\u8BFB\u8BA1\u65F6\u6682\u505C\u3002")),l&&c>=h&&(l=!1,s("\u672C\u6B21\u9605\u8BFB\u65F6\u95F4\u5DF2\u5B8C\u6210\uFF0C\u53EF\u4EE5\u7EE7\u7EED\u9605\u8BFB\u6216\u4F11\u606F\u4E00\u4E0B\u3002"));let A=Math.max(0,Math.ceil((h-c)/1e3)),T=Math.floor(A/60).toString().padStart(2,"0")+":"+(A%60).toString().padStart(2,"0"),b=[!!I.seated,I.modal,l,T,document.hidden].join("|");b!==x&&(x=b,document.body.dataset.seated=String(!!I.seated),r("focus-panel").hidden=!I.seated||I.modal,r("focus-clock").textContent=T,r("focus-state").textContent=c>=h?"\u672C\u6B21\u9605\u8BFB\u5DF2\u5B8C\u6210":l?"\u9605\u8BFB\u4E2D\uFF0C\u79BB\u5F00\u9875\u9762\u81EA\u52A8\u6682\u505C":c?"\u5DF2\u6682\u505C\uFF0C\u53EF\u4EE5\u7EE7\u7EED":"\u7ED9\u81EA\u5DF1\u4E00\u6BB5\u5B89\u9759\u9605\u8BFB\u7684\u65F6\u95F4",r("focus-start").textContent=l?"\u6682\u505C":c&&c<h?"\u7EE7\u7EED\u8BA1\u65F6":"\u5F00\u59CB\u8BA1\u65F6",r("focus-duration").disabled=l||c>0,r("focus-read").textContent="\u9009\u4E00\u4EFD\u8D44\u6599")}r("focus-start").onclick=()=>{m(),e().seated&&(c>=h&&(c=0),l=!l,u=performance.now(),x="",m())},r("focus-reset").onclick=()=>{l=!1,c=0,h=Number(r("focus-duration").value)*6e4,x="",m()},r("focus-duration").onchange=()=>{h=Number(r("focus-duration").value)*6e4,x="",m()},r("focus-read").onclick=()=>i.open(),r("explore-open").onclick=()=>{e().ready&&(t(),a.showModal())},r("explore-close").onclick=()=>a.close(),a.addEventListener("close",n),r("reading-book-close").onclick=()=>o.close(),o.addEventListener("close",n);function w(D){r("reading-recommendations").replaceChildren();for(let I of D){let A=document.createElement("article");A.className="reading-recommendation";let T=document.createElement("h3"),b=document.createElement("p"),y=document.createElement("button");T.textContent=I.raw.title,b.textContent=[I.category,I.subject,I.year,"\u672C\u5730\u5168\u6587"].filter(Boolean).join(" \xB7 "),y.textContent="\u6253\u5F00\u9605\u8BFB",y.onclick=()=>{o.close(),i.read(I)},A.append(T,b,y),r("reading-recommendations").append(A)}}function S(){t();let D=i.recommendations();r("reading-book-status").textContent=D.length?"\u4ECE\u672C\u5730\u53EF\u8BFB\u9986\u85CF\u6311\u9009\uFF0C\u70B9\u51FB\u5373\u53EF\u6253\u5F00\u5B9E\u9645\u6B63\u6587\u3002":"\u6682\u65F6\u6CA1\u6709\u53EF\u76F4\u63A5\u9884\u89C8\u7684\u672C\u5730\u8D44\u6599\uFF0C\u8BF7\u524D\u5F80\u9986\u85CF\u76EE\u5F55\u67E5\u627E\u3002",r("reading-book-draw").textContent="\u968F\u673A\u62BD\u4E00\u672C",r("reading-book-draw").disabled=!i.readableItems().length,w(D),o.showModal()}r("reading-book-draw").onclick=()=>{let D=i.readableItems();if(!D.length)return;let I=D.filter(T=>!v.has(T.raw.link));I.length||(v.clear(),I=D.filter(T=>T.raw.link!==g),I.length||(I=D));let A=I[Math.floor(Math.random()*I.length)];v.add(A.raw.link),g=A.raw.link,w([A]),r("reading-book-draw").textContent="\u518D\u62BD\u4E00\u672C",r("reading-book-status").textContent="\u4ECE "+D.length+" \u4EFD\u672C\u5730\u53EF\u8BFB\u8D44\u6599\u4E2D\u62BD\u5230\u8FD9\u4E00\u4EFD\u3002\u53EF\u4EE5\u76F4\u63A5\u9605\u8BFB\uFF0C\u6216\u518D\u6362\u4E00\u672C\u3002"},r("reading-book-catalog").onclick=()=>{o.close(),i.open()};let _=setInterval(m,250);return document.addEventListener("visibilitychange",m),{openBook:S,sync(){x="",m()},snapshot:()=>({running:l,elapsedMs:Math.round(c),durationMs:h,book:o.open,lastDraw:g}),dispose(){if(!p){m(),p=!0,l=!1,clearInterval(_),document.removeEventListener("visibilitychange",m),a.removeEventListener("close",n),o.removeEventListener("close",n),r("focus-panel").hidden=!0,v.clear();for(let D of["focus-start","focus-reset","focus-read","explore-open","explore-close","reading-book-close","reading-book-catalog","reading-book-draw"])r(D).onclick=null;r("focus-duration").onchange=null}}}}var Om="xwy.library.public-shelf.v1";function Fm({catalog:i,pause:e,resume:t,report:n,getState:s}){let r=A=>document.getElementById(A),o=r("bookshelf-dialog"),a=r("bookshelf-list"),l=r("bookshelf-status"),c=!1,h=null,u,d=null,p=null,x="",v=new Map;function g(){x="";let A;try{let y=localStorage.getItem(Om);A=y?JSON.parse(y):{version:1,entries:[]}}catch{return x="\u65E0\u6CD5\u8BFB\u53D6\u672C\u673A\u4E66\u7B7E\u3002\u5F53\u524D\u9605\u8BFB\u4ECD\u53EF\u7EE7\u7EED\u3002",[]}if(A?.version!==1||!Array.isArray(A.entries))return x="\u672C\u673A\u4E66\u7B7E\u683C\u5F0F\u4E0D\u53D7\u652F\u6301\uFF0C\u539F\u6570\u636E\u672A\u8986\u76D6\u3002",[];let T=new Set,b=[];for(let y of A.entries)if(!(!y||typeof y.link!="string"||T.has(y.link)||!i.findPublic(y.link))&&(T.add(y.link),b.push({link:y.link,page:Number.isInteger(y.page)&&y.page>0?Math.min(y.page,1e5):1,note:typeof y.note=="string"?y.note.slice(0,4e3):"",updated:Number.isFinite(y.updated)?y.updated:0}),b.length===30))break;return b}function m(A,T){if(x)return l.textContent=x,n(x),!1;try{return localStorage.setItem(Om,JSON.stringify({version:1,entries:A})),l.textContent=T,!0}catch{return l.textContent="\u4FDD\u5B58\u5931\u8D25\uFF1A\u6B64\u6D4F\u89C8\u5668\u672A\u5141\u8BB8\u672C\u5730\u5B58\u50A8\uFF0C\u6216\u7A7A\u95F4\u4E0D\u8DB3\u3002\u8349\u7A3F\u4ECD\u7559\u5728\u5F53\u524D\u8F93\u5165\u6846\uFF0C\u53EF\u590D\u5236\u540E\u4FDD\u7559\u3002",n(l.textContent),!1}}function w(A){r("reader-dialog").open&&(r("reader-save-status").textContent=A,r("reader-save-status").hidden=!1),n(A)}function S(){if(c)return!1;let A=i.currentPublic();if(!A)return!1;let T=g(),b=T.find(F=>F.link===A.link);if(!b&&T.length>=30)return w("\u6700\u591A\u4FDD\u5B58 30 \u6761\u4E66\u7B7E\uFF0C\u8BF7\u5148\u5220\u9664\u4E0D\u9700\u8981\u7684\u6761\u76EE\u3002"),!1;let y={...A,note:b?.note||"",updated:Date.now()},E=[y,...T.filter(F=>F.link!==y.link)];return m(E,"\u5DF2\u8BB0\u4F4F\u5F53\u524D\u9875\u7801\u3002")?(w("\u5DF2\u8BB0\u4F4F\u7B2C "+A.page+" \u9875\uFF0C\u53EF\u5728\u201C\u4E66\u7B7E\u4E0E\u6458\u8BB0\u201D\u4E2D\u7EED\u8BFB\u3002"),o.open&&_(),!0):(w(l.textContent),!1)}function _(){let A=g();a.replaceChildren(),l.textContent=x||(A.length?"\u5171 "+A.length+" \u6761\u516C\u5F00\u9986\u85CF\u4E66\u7B7E\u3002":"\u8FD8\u6CA1\u6709\u4E66\u7B7E\u3002\u6253\u5F00\u8D44\u6599\u540E\uFF0C\u70B9\u51FB\u201C\u8BB0\u4F4F\u8FD9\u4E00\u9875\u201D\u5373\u53EF\u4FDD\u5B58\u3002"),r("bookshelf-export").disabled=!A.length,r("bookshelf-undo").hidden=!h;for(let T of A){let b=i.findPublic(T.link),y=document.createElement("article");y.className="bookshelf-entry",y.dataset.link=T.link;let E=document.createElement("h3"),F=document.createElement("p"),U=document.createElement("div");U.className="bookshelf-actions",E.textContent=b.raw.title,F.textContent=(/\.pdf$/i.test(T.link)?"\u4E66\u7B7E\u5728\u7B2C "+T.page+" \u9875":"\u6587\u672C\u8D44\u6599")+" \xB7 "+[b.subject,b.year].filter(Boolean).join(" \xB7 ");let k=document.createElement("button");k.textContent=/\.pdf$/i.test(T.link)?"\u4ECE\u7B2C "+T.page+" \u9875\u7EED\u8BFB":"\u7EE7\u7EED\u9605\u8BFB",k.onclick=()=>{o.close(),i.read(b,T.page)};let G=document.createElement("button");G.textContent="\u5220\u9664\u6B64\u6761",G.onclick=()=>{let ee=g();if(x){l.textContent=x;return}let le=ee.find(Y=>Y.link===T.link);le&&m(ee.filter(Y=>Y.link!==T.link),"\u5DF2\u5220\u9664\u4E66\u7B7E\u4E0E\u6458\u8BB0\uFF0C\u53EF\u64A4\u9500\u3002")&&(h=le,u=v.get(T.link),v.delete(T.link),_(),l.textContent="\u5DF2\u5220\u9664\u4E66\u7B7E\u4E0E\u6458\u8BB0\uFF0C\u53EF\u64A4\u9500\u3002")},U.append(k,G);let V=document.createElement("details"),$=document.createElement("summary"),X=document.createElement("label"),j=document.createElement("textarea"),P=document.createElement("button"),W=document.createElement("p");$.textContent=T.note?"\u67E5\u770B\u6216\u4FEE\u6539\u6458\u8BB0":"\u5199\u4E00\u6761\u9605\u8BFB\u6458\u8BB0",V.open=v.has(T.link),j.maxLength=4e3,j.rows=5,j.value=v.get(T.link)??T.note,X.append(document.createTextNode("\u9605\u8BFB\u6458\u8BB0\uFF08\u6700\u591A 4000 \u5B57\uFF09"),j),j.oninput=()=>{v.set(T.link,j.value),W.textContent="\u8349\u7A3F\u5C1A\u672A\u4FDD\u5B58"},P.textContent="\u4FDD\u5B58\u6458\u8BB0",W.className="note-feedback",W.setAttribute("role","status"),P.onclick=()=>{let ee=g();if(x){W.textContent=x;return}if(!ee.find(te=>te.link===T.link)){W.textContent="\u6B64\u6761\u4E66\u7B7E\u5DF2\u88AB\u5176\u4ED6\u9875\u9762\u5220\u9664\uFF0C\u8BF7\u91CD\u65B0\u6DFB\u52A0\u540E\u4FDD\u5B58\u3002";return}let Y=ee.map(te=>te.link===T.link?{...te,note:j.value.slice(0,4e3),updated:Date.now()}:te);m(Y,"\u6458\u8BB0\u5DF2\u4FDD\u5B58\u5728\u6B64\u6D4F\u89C8\u5668\u3002")?(v.delete(T.link),$.textContent=j.value?"\u67E5\u770B\u6216\u4FEE\u6539\u6458\u8BB0":"\u5199\u4E00\u6761\u9605\u8BFB\u6458\u8BB0",W.textContent="\u5DF2\u4FDD\u5B58\u5230\u6B64\u6D4F\u89C8\u5668"):W.textContent=l.textContent},V.append($,X,P,W),y.append(E,F,U,V),a.append(y)}}function D(A){if(!(c||!s().ready)&&(e(),_(),o.open||o.showModal(),typeof A=="string")){let T=[...a.children].find(b=>b.dataset.link===A);T&&(T.querySelector("details").open=!0,T.querySelector("textarea").focus())}}r("bookshelf-open").onclick=()=>D(),r("reader-bookmark").onclick=S,r("reader-notes").onclick=()=>{let A=i.currentPublic();A&&S()&&D(A.link)},r("bookshelf-close").onclick=()=>o.close(),o.addEventListener("close",t),r("bookshelf-undo").onclick=()=>{if(!h)return;let A=g();if(A.some(T=>T.link===h.link)){h=null,u=void 0,_(),l.textContent="\u8BE5\u4E66\u7B7E\u5DF2\u91CD\u65B0\u6DFB\u52A0\uFF0C\u4FDD\u7559\u73B0\u6709\u5185\u5BB9\u3002";return}if(A.length>=30){l.textContent="\u4E66\u7B7E\u5DF2\u6EE1\uFF0C\u65E0\u6CD5\u64A4\u9500\u5220\u9664\u3002";return}m([h,...A.filter(T=>T.link!==h.link)],"\u5DF2\u6062\u590D\u4E66\u7B7E\u4E0E\u6458\u8BB0\u3002")&&(u!==void 0&&v.set(h.link,u),h=null,u=void 0,_(),l.textContent="\u5DF2\u6062\u590D\u4E66\u7B7E\u4E0E\u6458\u8BB0\u3002")};function I(){clearTimeout(d),p&&URL.revokeObjectURL(p),p=null}return r("bookshelf-export").onclick=()=>{let A=g();if(x||!A.length){l.textContent=x||"\u6682\u65E0\u53EF\u5BFC\u51FA\u7684\u4E66\u7B7E\u3002";return}let T=["# \u6211\u7684\u56FE\u4E66\u9986\u4E66\u7B7E\u4E0E\u6458\u8BB0","",...A.flatMap(y=>["## "+i.findPublic(y.link).raw.title,"","\u9875\u7801\uFF1A"+y.page,"\u9986\u85CF\u8DEF\u5F84\uFF1A"+y.link,"",v.get(y.link)??y.note,""])].join(`
`);I(),p=URL.createObjectURL(new Blob([T],{type:"text/markdown;charset=utf-8"}));let b=document.createElement("a");b.href=p,b.download="\u56FE\u4E66\u9986\u4E66\u7B7E\u4E0E\u6458\u8BB0.md",b.click(),d=setTimeout(I,1500),l.textContent="\u5DF2\u5BFC\u51FA\u4E66\u7B7E\u4E0E\u6458\u8BB0\uFF08\u5305\u542B\u5F53\u524D\u672A\u4FDD\u5B58\u8349\u7A3F\uFF09\u3002"},{open:D,saveCurrent:S,snapshot:()=>({entries:g().length,open:o.open,storageError:x,disposed:c}),dispose(){if(!c){c=!0,I(),v.clear(),h=null,u=void 0,a.replaceChildren(),o.removeEventListener("close",t);for(let A of["bookshelf-open","reader-bookmark","reader-notes","bookshelf-close","bookshelf-undo","bookshelf-export"])r(A).onclick=null}}}}var ht=i=>document.getElementById(i),ui=ht("world"),rn=new Ns,jn=new Yt(55,innerWidth/innerHeight,.08,180),tn=Yp(ui,rn,jn),{renderer:hi}=tn,Nn=new El(jn,ui);Nn.enableDamping=!0;Nn.minDistance=1;Nn.maxDistance=75;Nn.maxPolarAngle=Math.PI*.91;var de={ready:!1,mode:"inspect",view:"exterior",pos:new B(0,0,14),yaw:0,pitch:0,seated:null,seatReturn:null,modal:!1,nearest:null,frames:0},on=new Set,zt,zm,Ms,Si,fi,bi,Nf,Pf=[],Mi=null,Lf,Bm=0,Rf=!1,Zn=!1,ea={exterior:{eye:[25,10.5,30],target:[0,2.2,1]},hall:{eye:[1.7,1.78,6.7],target:[-3.6,1.5,-3.6]},reading:{eye:[2.1,1.78,6.6],target:[7.8,1.3,-2.5]},sample:{eye:[2.7,1.7,-5.2],target:[9,1.25,-4.6]},book:{eye:[7.55,1.48,-3.5],target:[7.15,.805,-4.15]},bookEdge:{eye:[7.72,1.08,-3.35],target:[7.15,.8,-4.15]},shelfDetail:{eye:[-3.8,1.5,-1.8],target:[-3.6,1.15,-4.2]},sampleTree:{eye:[23,3,4],target:[16,3.6,-4]},chair:{eye:[4.55,1,-7.1],target:[5.62,.48,-5.63]},treeFar:{eye:[39,4.5,22],target:[16,3.7,-4]}};Object.assign(ea,{facilities:{eye:[1.8,2.35,8.05],target:[6.4,1,3.45]},display:{eye:[3.9,1.9,8.25],target:[6.6,.95,5.95]},topics:{eye:[3.3,1.9,-4.9],target:[0,1,-8.22]},enquiry:{eye:[-4.8,1.85,8.15],target:[-7,1.16,6.3]}});function Kn(i){ht("toast").textContent=i,ht("toast").hidden=!1,clearTimeout(Lf),Lf=setTimeout(()=>ht("toast").hidden=!0,4200)}function Jn(){on.clear(),Mi=null}function Cf(){de.modal=!0,Jn(),Nn.enabled=!1,ht("interact").hidden=!0,fi?.update(performance.now(),!0),bi?.sync()}function If(){Zn||document.querySelector("dialog[open]")||(de.modal=!1,Jn(),Nn.enabled=de.mode==="inspect",de.mode==="walk"&&ui.focus(),Zl(),bi?.sync(),fi?.update(performance.now(),!0))}function LS(){return de.seated?de.seated.label:de.pos.z>9?"\u56FE\u4E66\u9986\u524D\u5EAD":de.pos.z>4.5?"\u5165\u53E3\u95E8\u5385":de.pos.x<-.8?"\u9986\u85CF\u4E66\u67B6\u533A":de.pos.x>2.5?"\u7A97\u8FB9\u9605\u89C8\u533A":"\u4E2D\u592E\u901A\u9053"}function Gr(){jn.position.set(de.pos.x,de.seated?1.18:1.65,de.pos.z),jn.rotation.order="YXZ",jn.rotation.set(de.pitch,de.yaw,0)}function Vr(){if(!de.seated)return;bi?.sync();let i=de.seated.approach,e=de.seatReturn&&!Vs(de.seatReturn.x,de.seatReturn.z)?de.seatReturn:i;de.pos.set(e.x,0,e.z),de.seated=null,de.seatReturn=null,ht("touch").hidden=!(matchMedia("(pointer:coarse)").matches||innerWidth<700),ht("stand").hidden=!0,ht("seat-status").textContent="\u5F00\u653E\u9605\u89C8",Jn(),Gr(),bi?.sync(),Kn("\u5DF2\u7AD9\u8D77\uFF0C\u53EF\u4EE5\u7EE7\u7EED\u6F2B\u6E38")}function Ys(i){de.modal||!ea[i]||(Vr(),de.mode="inspect",document.body.dataset.mode="inspect",de.nearest=null,de.view=i,Jn(),Nn.enabled=!0,jn.position.fromArray(ea[i].eye),Nn.target.fromArray(ea[i].target),Nn.update(),ht("walk").textContent="\u8FDB\u5165\u6F2B\u6E38",ht("crosshair").hidden=!0,ht("touch").hidden=!0,ht("interact").hidden=!0,ht("help").textContent="\u62D6\u52A8\u65CB\u8F6C \xB7 \u6EDA\u8F6E\u7F29\u653E \xB7 \u63A2\u7D22\u6E05\u5355\u53EF\u67E5\u4E92\u52A8",ht("location").textContent={exterior:"\u56FE\u4E66\u9986\u524D\u5EAD",hall:"\u9986\u85CF\u4E66\u67B6\u533A",reading:"\u7A97\u8FB9\u9605\u89C8\u533A",sample:"\u7A97\u8FB9\u9605\u89C8\u533A",book:"\u7A97\u8FB9\u5BFC\u8BFB\u4E66",bookEdge:"\u7A97\u8FB9\u5BFC\u8BFB\u4E66",shelfDetail:"\u9986\u85CF\u4E66\u810A\u7EC6\u8282",sampleTree:"\u56FE\u4E66\u9986\u4FA7\u5EAD",chair:"\u7A97\u8FB9\u9605\u89C8\u533A",treeFar:"\u56FE\u4E66\u9986\u4FA7\u5EAD",facilities:"\u9986\u5185\u8BBE\u65BD",display:"\u4E3B\u9898\u9009\u8BFB",topics:"\u4E13\u9898\u9605\u89C8",enquiry:"\u9986\u85CF\u68C0\u7D22\u53F0"}[i],document.querySelectorAll("[data-view]").forEach(e=>e.setAttribute("aria-pressed",String(e.dataset.view===i))))}function Uf(){if(!(!de.ready||de.modal)){if(de.mode==="walk"){Ys("exterior");return}de.mode="walk",document.body.dataset.mode="walk",Nn.enabled=!1,Jn(),de.seated=null,de.pos.set(de.view!=="exterior"?1.7:0,0,de.view!=="exterior"?6.7:14),de.yaw=0,de.pitch=0,ht("walk").textContent="\u7ED3\u675F\u6F2B\u6E38",ht("crosshair").hidden=!1,ht("touch").hidden=!(matchMedia("(pointer:coarse)").matches||innerWidth<700),ht("help").textContent="WASD / \u65B9\u5411\u952E\u79FB\u52A8 \xB7 \u62D6\u52A8\u770B\u5411 \xB7 J/L \u8F6C\u5411 \xB7 E \u64CD\u4F5C \xB7 Esc \u7AD9\u8D77",document.querySelectorAll("[data-view]").forEach(i=>i.setAttribute("aria-pressed","false")),ui.focus(),Gr(),Kn("\u8D70\u8FD1\u95E8\u3001\u4E66\u67B6\u6216\u5EA7\u4F4D\u6309 E\u3002\u9700\u8981\u4F4D\u7F6E\u63D0\u793A\u53EF\u5F00\u542F\u4E92\u52A8\u6807\u8BB0\u3002")}}function DS(){let i=(e,t,n)=>new B(e,t,n);return[...nm.map(e=>({...e,kind:"display",anchor:i(...e.anchor)})),{id:"door",kind:"door",label:"\u5165\u53E3\u73BB\u7483\u95E8",short:"\u5165\u53E3 \xB7 \u5F00\u5173\u95E8",description:"\u8D70\u8FD1\u6309 E \u5F00\u95E8\u6216\u5173\u95E8",action:"\u5F00\u5173\u73BB\u7483\u95E8",anchor:i(0,1.4,10.9),approach:{x:0,z:9},range:2.5},...Go.map(e=>({id:"shelf-"+e.id,kind:"shelf",shelf:e,label:e.label,short:e.label,description:"\u67E5\u770B\u5BF9\u5E94\u5206\u7C7B\u7684\u771F\u5B9E\u8D44\u6599",action:"\u67E5\u770B "+e.label,anchor:i(e.x,1.65,e.z+.32),approach:e.approach,range:1.55})),...Wo.map(e=>({id:"seat-"+e.id,kind:"seat",seat:e,label:e.label,short:"\u5750\u4E0B \xB7 "+e.id,description:"\u5750\u4E0B\u9009\u8D44\u6599\uFF0C\u4E5F\u53EF\u5F00\u542F\u9605\u8BFB\u8BA1\u65F6",action:"\u5750\u4E0B \xB7 "+e.label,anchor:i(e.x,.95,e.z),approach:e.approach,range:1.12})),...[-4.5,1.3].map((e,t)=>({id:"book-R"+(t+1),kind:"book",label:"\u684C\u4E0A\u5BFC\u8BFB\u4E66 \xB7 R"+(t+1),short:"\u7FFB\u5F00\u5BFC\u8BFB\u4E66",description:"\u4ECE\u672C\u5730\u9986\u85CF\u6311\u4E00\u4EFD\u8D44\u6599\u6253\u5F00\u9605\u8BFB",action:"\u7FFB\u5F00\u684C\u4E0A\u5BFC\u8BFB\u4E66",anchor:i(7.15,.95,e+.35),approach:{x:7.15,z:e+2.18},range:1.35})),{id:"desk",kind:"desk",label:"\u9986\u85CF\u68C0\u7D22\u53F0",short:"\u9986\u85CF\u68C0\u7D22\u53F0",description:"\u6309\u5206\u7C7B\u3001\u5B66\u79D1\u548C\u5173\u952E\u8BCD\u67E5\u627E\u8D44\u6599",action:"\u4F7F\u7528\u9986\u85CF\u68C0\u7D22\u53F0",anchor:i(-7,1.5,6.8),approach:{x:-7,z:7.25},range:1.55}]}function NS(i){if(!(Zn||!de.ready||de.modal)){if(de.mode==="walk"&&!fi.isReachable(i,de)){fi.select(i),Kn("\u8D70\u8FD1 "+i.label+" \u540E\u518D\u4E92\u52A8");return}if(i.kind==="seat"&&de.mode==="inspect"){if(Vs(i.approach.x,i.approach.z)){Kn("\u8FD9\u4E2A\u5EA7\u4F4D\u7684\u901A\u9053\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6\u5EA7\u4F4D");return}Uf(),de.pos.set(i.approach.x,0,i.approach.z),Gr()}fi.clear(),Kl({...i,label:i.action,targetId:i.id})}}function Zl(){if(de.mode!=="walk"||de.modal){de.nearest=null,ht("interact").hidden=!0;return}if(de.seated)de.nearest={kind:"read",label:"\u67E5\u627E\u8D44\u6599\u5F00\u59CB\u9605\u8BFB",distance:0};else{let i=[];for(let t of Pf){let n=Math.hypot(de.pos.x-t.approach.x,de.pos.z-t.approach.z);n<t.range&&i.push({...t,label:t.kind==="door"?(zt.target?"\u5173\u95ED":"\u6253\u5F00")+"\u5165\u53E3\u73BB\u7483\u95E8":t.action,targetId:t.id,distance:n})}let e=fi?.selectedId;i.sort((t,n)=>+(n.targetId===e)-+(t.targetId===e)||t.distance-n.distance),de.nearest=i[0]||null}ht("interact").hidden=!de.nearest||!!de.seated,de.nearest&&(ht("interact").textContent="E \xB7 "+de.nearest.label)}function Kl(i){if(!de.ready||de.modal)return;let e=i||de.nearest;if(e){if(e.kind==="door"){if(zt.target&&Math.abs(de.pos.x)<1.8&&Math.abs(de.pos.z-9)<.7){Kn("\u8BF7\u5148\u79BB\u5F00\u95E8\u53E3\uFF0C\u518D\u5173\u95ED\u5165\u53E3");return}zt.target=zt.target?0:1}e.kind==="shelf"&&Si.open(e.shelf.id),e.kind==="read"&&Si.open(),e.kind==="desk"&&Si.open(),e.kind==="book"&&bi.openBook(),e.kind==="display"&&(e.category?Si.open(e.category):bi.openBook()),e.kind==="seat"&&(de.seatReturn={x:de.pos.x,z:de.pos.z},de.seated=e.seat,de.pos.set(e.seat.x,0,e.seat.z),de.yaw=e.seat.yaw,de.pitch=-.1,Jn(),ht("stand").hidden=!1,ht("touch").hidden=!0,ht("seat-status").textContent=e.seat.label+" \xB7 \u5DF2\u5165\u5EA7",Gr(),Kn("\u5DF2\u5750\u4E0B\u3002\u6309 E \u67E5\u627E\u8D44\u6599\uFF0CEsc \u6216\u300C\u7AD9\u8D77\u300D\u79BB\u5EA7\u3002")),Zl(),bi?.sync(),fi?.update(performance.now(),!0)}}async function Hm(){let i=Wi().policy;Fl("near");try{return gn.updateMatrixWorld(!0),await new gs().parseAsync(gn,{binary:!0,onlyVisible:!0,trs:!1})}finally{Fl(i)}}async function US(i="far"){let e=Jp(i);if(!e)throw Error("Unknown tree variant");return new gs().parseAsync(e,{binary:!0,onlyVisible:!0,trs:!1})}async function Vm(){let i=ht("export");i.disabled=!0;try{let e=await Hm(),t=URL.createObjectURL(new Blob([e],{type:"model/gltf-binary"})),n=document.createElement("a");n.href=t,n.download="wenku-library.glb",n.click(),setTimeout(()=>URL.revokeObjectURL(t),1e3),Kn(Ms?.snapshot().enabled?"\u5DF2\u5BFC\u51FA\u51E0\u4F55\u4E0E\u6750\u8D28\uFF0C\u7A97\u8FB9\u70D8\u7119\u56FE\u9700\u914D\u5957\u4FDD\u7559":"\u5DF2\u5BFC\u51FA\u53EF\u7F16\u8F91 GLB\uFF0C\u5305\u542B\u5206\u7EC4\u51E0\u4F55\u4E0E\u5185\u5D4C\u6750\u8D28")}catch(e){Kn("\u6A21\u578B\u5BFC\u51FA\u5931\u8D25\uFF1A"+e.message)}finally{i.disabled=!1}}ht("walk").onclick=Uf;ht("catalog").onclick=()=>Si?.open();ht("interact").onclick=()=>Kl();ht("stand").onclick=Vr;ht("export").onclick=Vm;ht("quality").onchange=()=>tn.quality(ht("quality").value);document.querySelectorAll("[data-view]").forEach(i=>i.onclick=()=>Ys(i.dataset.view));var OS=i=>!!i.target.closest?.("dialog,input,textarea,select,button,a"),ql=!1;addEventListener("keydown",i=>{if(i.code==="KeyE"&&ql){i.preventDefault();return}if(!(de.modal||i.isComposing||i.ctrlKey||i.metaKey||i.altKey)){if(i.code==="Escape"&&de.seated&&!i.target.closest?.("input,textarea,select")){i.preventDefault(),Vr(),Jn(),ui.focus();return}if(!OS(i)){if(i.code==="KeyE"){i.preventDefault(),i.repeat||(ql=!0,Kl());return}["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","KeyJ","KeyL","KeyI","KeyK","Space"].includes(i.code)&&de.mode==="walk"&&(i.preventDefault(),on.add(i.code)),!i.repeat&&(i.code==="Escape"&&(Vr(),Jn()),i.code==="KeyV"&&Ys("exterior"))}}});addEventListener("keyup",i=>{on.delete(i.code),i.code==="KeyE"&&(ql=!1)});addEventListener("blur",()=>{ql=!1,Jn()});ui.addEventListener("pointerdown",i=>{de.mode!=="walk"||de.modal||(ui.focus(),ui.setPointerCapture(i.pointerId),Mi={id:i.pointerId,x:i.clientX,y:i.clientY})});ui.addEventListener("pointermove",i=>{!Mi||Mi.id!==i.pointerId||de.modal||(de.yaw-=(i.clientX-Mi.x)*.004,de.pitch=Sn.clamp(de.pitch-(i.clientY-Mi.y)*.003,-1.05,1.05),Mi.x=i.clientX,Mi.y=i.clientY)});ui.addEventListener("pointerup",()=>Mi=null);ui.addEventListener("pointercancel",()=>Mi=null);for(let i of document.querySelectorAll("[data-key]"))i.onpointerdown=e=>{de.modal||(e.preventDefault(),i.setPointerCapture(e.pointerId),on.add(i.dataset.key))},i.onpointerup=i.onpointercancel=i.onlostpointercapture=()=>on.delete(i.dataset.key);var Df;addEventListener("resize",()=>{clearTimeout(Df),Df=setTimeout(()=>{jn.aspect=innerWidth/innerHeight,jn.updateProjectionMatrix(),tn.resize(),de.mode==="walk"&&(ht("touch").hidden=!!de.seated||!(matchMedia("(pointer:coarse)").matches||innerWidth<700))},120)});var Gm=new Dr;function Of(){let i=Gm.getDelta(),e=Math.min(i,.06);if(tn.frameTime(i*1e3,!document.hidden&&!de.modal),!de.modal&&de.mode==="walk"){if(!de.seated){let t=Number(on.has("KeyW")||on.has("ArrowUp"))-Number(on.has("KeyS")||on.has("ArrowDown")),n=Number(on.has("KeyD")||on.has("ArrowRight"))-Number(on.has("KeyA")||on.has("ArrowLeft")),s=2.8*e/Math.max(1,Math.hypot(t,n));Vu(de.pos,(-Math.sin(de.yaw)*t+Math.cos(de.yaw)*n)*s,(-Math.cos(de.yaw)*t-Math.sin(de.yaw)*n)*s)}de.yaw+=((on.has("KeyJ")?1:0)-(on.has("KeyL")?1:0))*e*1.2,de.pitch=Sn.clamp(de.pitch+((on.has("KeyI")?1:0)-(on.has("KeyK")?1:0))*e*.8,-1.05,1.05),Gr(),ht("location").textContent=LS(),Zl()}else de.mode==="inspect"&&!de.modal&&Nn.update();if(zt){let t=Math.abs(zt.open-zt.target)>.001;if(t){zt.open=Sn.damp(zt.open,zt.target,6,e),Math.abs(zt.open-zt.target)<.001&&(zt.open=zt.target);for(let{leaf:n,s}of zt.leaves)n.position.x=s*(.7+zt.open*1.38);zt.collider.disabled=zt.open>.94,performance.now()-Bm>120&&(tn.shadow(),Bm=performance.now())}!t&&Rf&&tn.shadow(),Rf=t}(!de.modal||Rf)&&(jp(jn),tn.render()),fi?.update(),de.frames++}function FS(){let i=0,e=0,t=0,n=null,s=new Set;return gn.traverse(r=>{if(r.userData.foliageInstances&&(n=r.userData),r.isMesh){for(let o=r;o;o=o.parent)if(!o.visible)return;i++,e+=(r.geometry.index?.count||r.geometry.attributes.position.count)/3*(r.isInstancedMesh?r.count:1),r.isInstancedMesh&&(t+=r.count);for(let o of Array.isArray(r.material)?r.material:[r.material])o&&s.add(o.name)}}),{meshes:i,triangles:e,instances:t,materials:[...s],groups:gn.children.map(r=>r.name),dimensions:zu,colliders:Vo.length,shelves:Go.length,seats:Wo.length,landscape:n}}function Wm(){if(Zn)return;Zn=!0,hi.setAnimationLoop(null),fi?.dispose(),bi?.dispose(),Nf?.dispose(),Ms?.dispose(),Si?.dispose(),Jn(),clearTimeout(Lf),clearTimeout(Df),Nn.dispose();let i=new Set,e=new Set,t=new Set;gn.traverse(s=>{if(s.isMesh){i.add(s.geometry);for(let r of Array.isArray(s.material)?s.material:[s.material]){e.add(r);for(let o of Object.values(r))o?.isTexture&&t.add(o)}}});let n=lm();n.textures.forEach(s=>t.add(s)),n.materials.forEach(s=>e.add(s)),rn.traverse(s=>s.shadow?.dispose()),i.forEach(s=>s.dispose()),e.forEach(s=>s.dispose()),t.forEach(s=>s.dispose()),Qp(),rn.environment?.dispose(),rn.background?.dispose(),tn.composer.passes.forEach(s=>s.dispose?.()),tn.composer.dispose(),hi.dispose()}document.addEventListener("visibilitychange",()=>{Jn(),Gm.getDelta(),de.ready&&!Zn&&hi.setAnimationLoop(document.hidden?null:Of)});addEventListener("pagehide",i=>{i.persisted?hi.setAnimationLoop(null):Wm()});addEventListener("pageshow",()=>{de.ready&&!Zn&&hi.setAnimationLoop(Of)});async function km(){let i=hi.getContext();if(!i.fenceSync)return;let e=i.fenceSync(i.SYNC_GPU_COMMANDS_COMPLETE,0);i.flush();try{let t=performance.now();for(;!Zn&&performance.now()-t<15e3&&i.clientWaitSync(e,0,0)===i.TIMEOUT_EXPIRED;)await new Promise(s=>setTimeout(s,16))}finally{i.deleteSync(e)}}async function BS(){try{await hm(),rn.add(gn),{door:zt,r1Light:zm}=fm(),dm();let i=await new Rl().loadAsync(new URL("../campus-3d-v5/assets/sky.hdr",document.baseURI).href);i.mapping=ho,rn.background=i,rn.backgroundIntensity=.9;let e=new Sr(hi);rn.environment=e.fromEquirectangular(i).texture,rn.environmentIntensity=.4,e.dispose(),rn.add(new gl(14740464,11050370,.38)),rn.fog=new Za(14475998,65,135);let t=new Lr(16773596,2.65);t.position.set(18,23,17),t.target.position.set(0,0,0),rn.add(t.target),t.castShadow=!0,t.shadow.mapSize.set(2048,2048),Object.assign(t.shadow.camera,{left:-27,right:27,top:24,bottom:-22,near:1,far:90}),t.shadow.normalBias=.025,t.shadow.bias=-16e-5,rn.add(t),tn.watchSun(t);for(let r of[-4,3]){let o=new Pr(16773335,16,15,2);o.position.set(5,3.5,r),rn.add(o)}if(Ms=Dm({building:gn,materials:ye,renderer:hi,shadow:()=>tn.shadow()}),await Ms.load(),Zn)return;Si=await _m({pause:Cf,resume:If,report:Kn}),Pf=DS(),fi=Nm({scene:rn,camera:jn,building:gn,targets:Pf,getState:()=>de,activate:NS,report:Kn}),bi=Um({catalog:Si,getState:()=>de,pause:Cf,resume:If,report:Kn}),Nf=Fm({catalog:Si,getState:()=>de,pause:Cf,resume:If,report:Kn});let n=new URLSearchParams(location.search).get("view");Ys(Object.hasOwn(ea,n)?n:"exterior"),ht("quality").value=tn.stats().quality;let s=de.view;if(Ms.snapshot().enabled){if(Ys("sample"),await hi.compileAsync(rn,jn),Zn||(tn.shadow(),tn.render(),await km(),Zn))return;Ys(s)}if(await hi.compileAsync(rn,jn),Zn||(tn.shadow(),tn.render(),await km(),Zn))return;de.ready=!0,ht("loading").hidden=!0,hi.setAnimationLoop(Of)}catch(i){console.error(i),ht("loading").querySelector("h2").textContent="\u56FE\u4E66\u9986\u52A0\u8F7D\u5931\u8D25",ht("loading").querySelector("p").textContent=i.message+"\u3002\u8BF7\u4F7F\u7528 node server.mjs \u542F\u52A8\u540E\u5237\u65B0\u3002"}}window.__library={snapshot:()=>({ready:de.ready,mode:de.mode,pos:de.pos.toArray(),yaw:de.yaw,seated:de.seated?.id||null,modal:de.modal,nearest:de.nearest?.kind||null,door:zt?{open:zt.open,target:zt.target,blocked:!zt.collider.disabled}:null,frames:de.frames,catalog:Si?.snapshot()}),performance:()=>tn.stats(),modelStats:FS,reviewGlass:cm,reviewR1:i=>{let e=Hu(i);return e&&(zm.intensity=e.localFillCandela,tn.shadow()),e},treeDetail:Wi,setTreeDetail:Fl,treeModelBuffer:US,setView:Ys,walk:Uf,interact:Kl,stand:Vr,blocked:Vs,move:(i,e)=>{!de.modal&&!de.seated&&Vu(de.pos,i,e)},setPose:(i,e,t=0)=>de.modal||Vs(i,e)?!1:(Vr(),de.mode="walk",document.body.dataset.mode="walk",Nn.enabled=!1,de.pos.set(i,0,e),de.yaw=t,de.pitch=0,Jn(),Gr(),Zl(),!0),shelves:()=>Go,seats:()=>Wo,exportModel:Vm,modelBuffer:Hm,dispose:Wm};var kS=window.__library.reviewR1;window.__library.reviewR1=i=>(Ms?.setEnabled(!1),kS(i));window.__library.reviewBake=i=>Ms?.setEnabled(i);window.__library.bake=()=>Ms?.snapshot();window.__library.interactions=()=>fi?.snapshot();window.__library.activities=()=>bi?.snapshot();window.__library.readingShelf=()=>Nf?.snapshot();BS();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)

three/examples/jsm/libs/fflate.module.js:
  (*!
  fflate - fast JavaScript compression/decompression
  <https://101arrowz.github.io/fflate>
  Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
  version 0.8.2
  *)
*/
