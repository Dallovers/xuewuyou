"""Audit receiver UV0/geometry against the original approved GLB and raster-check atlas UV1. Requires NumPy."""
from pathlib import Path
import json,struct,numpy as np,hashlib,shutil
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--repo',type=Path,default=Path.cwd());parser.add_argument('--output',type=Path,required=True);args=parser.parse_args();repo=args.repo.resolve();out=args.output.resolve();out.mkdir(parents=True,exist_ok=True);config=json.loads((repo/'examples/library-3d/assets/r1-lighting/r1-bake.json').read_text(encoding='utf-8'));p=repo/'examples/library-3d/assets/r1-lighting'/config['geometry']
def read(p):
 r=p.read_bytes();n=struct.unpack_from('<I',r,12)[0];return json.loads(r[20:20+n]),r[28+n:]
def acc(d,b,i):
 a=d['accessors'][i];v=d['bufferViews'][a['bufferView']];w={'VEC2':2,'VEC3':3,'SCALAR':1}[a['type']];dtype={5126:'<f4',5123:'<u2',5125:'<u4'}[a['componentType']]
 return np.frombuffer(b,dtype,a['count']*w,v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,w)
d,b=read(p);s,sb=read(repo/'examples/library-3d/assets/wenku-library.glb');import re
source={}
occ=np.zeros((1024,1024),dtype=np.uint16);maxdiff={k:0. for k in ['POSITION','NORMAL','TEXCOORD_0']}
for n in d['nodes']:
 pr=d['meshes'][n['mesh']]['primitives'][0];i=n['extras']['sourceId']
 match=re.fullmatch(r'r1-n(\d+)(?:-p(\d+))?',i)
 if match:
  sn=int(match[1]);part=int(match[2]) if match[2] else None
  old=s['meshes'][s['nodes'][sn]['mesh']]['primitives'][0];ix=acc(s,sb,old['indices']).ravel() if 'indices' in old else None
  for k in maxdiff:
   a=acc(d,b,pr['attributes'][k]);v=acc(s,sb,old['attributes'][k]);v=v[part*324:(part+1)*324] if part is not None else (v[ix] if ix is not None else v)
   assert a.shape==v.shape,(i,k,a.shape,v.shape)
   diff=float(np.max(abs(a-v)));maxdiff[k]=max(maxdiff[k],diff)
   assert diff<(0.001 if k=='NORMAL' else 0.00001),(i,k,diff)
 if not n['extras']['bakeReceiver']:continue
 raw_uv=acc(d,b,pr['attributes']['TEXCOORD_1']);assert np.all(raw_uv>=-1e-6) and np.all(raw_uv<=1+1e-6)
 uv=raw_uv.reshape(-1,3,2)*1024
 for t in uv:
  lo=np.maximum(np.floor(t.min(0)).astype(int),0);hi=np.minimum(np.ceil(t.max(0)).astype(int),1024)
  if np.any(hi<=lo):continue
  yy,xx=np.mgrid[lo[1]:hi[1],lo[0]:hi[0]];px=xx+.5;py=yy+.5
  a,c,e=t;den=(c[1]-e[1])*(a[0]-e[0])+(e[0]-c[0])*(a[1]-e[1])
  if abs(den)<1e-9:continue
  w1=((c[1]-e[1])*(px-e[0])+(e[0]-c[0])*(py-e[1]))/den
  w2=((e[1]-a[1])*(px-e[0])+(a[0]-e[0])*(py-e[1]))/den
  inside=(w1>1e-5)&(w2>1e-5)&((1-w1-w2)>1e-5)
  occ[lo[1]:hi[1],lo[0]:hi[0]]+=inside
def area(positions):
 triangles=positions.reshape(-1,3,3).astype('float64');return float(np.linalg.norm(np.cross(triangles[:,1]-triangles[:,0],triangles[:,2]-triangles[:,0]),axis=1).sum()/2)
source_floor=next(n for n in s['nodes'] if n.get('name')=='Continuous accessible floor');sf=s['meshes'][source_floor['mesh']]['primitives'][0]
floor_before=area(acc(s,sb,sf['attributes']['POSITION']));floor_after=0
for node in d['nodes']:
 if node['extras']['sourceId'] not in ['r1-floor-patch','r1-floor-remainder']:continue
 primitive=d['meshes'][node['mesh']]['primitives'][0];floor_after+=area(acc(d,b,primitive['attributes']['POSITION']))
assert abs(floor_after-floor_before)<.001
result={'receiverCount':config['receivers'],'uvRasterSize':1024,'coveredPixels':int(np.count_nonzero(occ)),'overlapPixels':int(np.count_nonzero(occ>1)),'maxCoverage':int(occ.max()),'uv0AndGeometryMaxError':maxdiff,'floorSurfaceAreaBefore':floor_before,'floorSurfaceAreaAfter':floor_after,'normalNote':'Blender split-normal encoding introduces small quantization; positions and UV0 checked separately.'}
print(json.dumps(result));(out/'uv-audit.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');assert result['overlapPixels']==0
