"""Real Cycles R1 atlas. Original files are read-only; output must be a new directory.
blender -b --factory-startup --python-exit-code 1 --python bake-r1.py -- REPO OUTPUT [SIZE=2048] [SAMPLES=128]
Sky diffuse (direct+indirect) and sun indirect are baked separately. No direct sun is baked.
"""
import bpy
import sys
import json
import struct
import math
import hashlib
import time
from pathlib import Path
import numpy as np
from mathutils import Matrix, Vector

args=sys.argv[sys.argv.index('--')+1:]
repo,out=map(lambda p:Path(p).resolve(),args[:2])
size=int(args[2]) if len(args)>2 else 2048
samples=int(args[3]) if len(args)>3 else 128
WALL_PARTS={16:[33,34,35,36,43],17:[42,43,44,45,46,47]}
assert out!=repo and not str(out).startswith(str(repo/'examples/library-3d/assets'))
out.mkdir(parents=True,exist_ok=True)
started=time.time()
base=repo/'examples/library-3d'
source=base/'bake-prep/r1/r1-local.glb'
assert hashlib.sha256(source.read_bytes()).hexdigest()=='e00a490b0db716f678bfea01b4162bbed65982e01dabfa276dd0c240045d9c42'
assert hashlib.sha256((base/'Library_Editable.blend').read_bytes()).hexdigest()=='bb10a6b0029285bd7c37142dbfa15e929acc2d06222790d38250227618f55093'

def glb(p):
 raw=p.read_bytes();n=struct.unpack_from('<I',raw,12)[0]
 return json.loads(raw[20:20+n]),raw[28+n:]

def read_acc(doc,bin,index):
 a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']]
 width={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
 dtype=np.dtype({5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']])
 return np.ndarray((a['count'],width),dtype,bin,v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',width*dtype.itemsize),dtype.itemsize)).copy()

C=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
def make_mesh(name,attrs,indices,matrix,material,metadata):
 positions=attrs['POSITION'];normals=attrs['NORMAL'];uv=attrs['TEXCOORD_0']
 original_verts=[(float(p[0]),float(-p[2]),float(p[1])) for p in positions]
 original_normals=[(float(n[0]),float(-n[2]),float(n[1])) for n in normals]
 order=indices.ravel().tolist() if indices is not None else list(range(len(original_verts)))
 # The exporter stores rounded boxes as disconnected triangles. Weld equal position/normal
 # vertices for meaningful UV islands; UV0 remains per original corner, not averaged.
 unique={};verts=[];vertex_normals=[];remap=[]
 for p,n in zip(original_verts,original_normals):
  key=tuple(round(v,7) for v in (*p,*n))
  if key not in unique:
   unique[key]=len(verts);verts.append(p);vertex_normals.append(n)
  remap.append(unique[key])
 faces=[[remap[v] for v in order[i:i+3]] for i in range(0,len(order),3)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
 layer=mesh.uv_layers.new(name='UV0')
 for loop in mesh.loops:
  u=uv[order[loop.index]];layer.data[loop.index].uv=(float(u[0]),float(1-u[1]))
 mesh.normals_split_custom_set_from_vertices(vertex_normals)
 mesh.materials.append(material)
 obj=bpy.data.objects.new(name,mesh);bpy.context.scene.collection.objects.link(obj)
 obj.matrix_world=C@Matrix(np.array(matrix).reshape(4,4,order='F').tolist())@C.inverted()
 for key,value in metadata.items():obj[key]=value
 return obj

def clip(attrs,matrix,lo,hi):
 # Floor only: interpolate the original world-scale UV0 and custom normals.
 keys=['POSITION','NORMAL','TEXCOORD_0'];packed=np.concatenate([attrs[k] for k in keys],axis=1).astype('float64')
 m=np.array(matrix).reshape(4,4,order='F');result=[]
 def world(p):return m[:3,:3]@p[:3]+m[:3,3]
 for tri in packed.reshape(-1,3,8):
  poly=list(tri)
  for axis in range(3):
   for bound,sign in [(lo[axis],1),(hi[axis],-1)]:
    nxt=[]
    for a,b in zip(poly[-1:]+poly[:-1],poly):
     da,db=sign*(world(a)[axis]-bound),sign*(world(b)[axis]-bound)
     if (da>=-1e-9)!=(db>=-1e-9):nxt.append(a+(b-a)*da/(da-db))
     if db>=-1e-9:nxt.append(b)
    poly=nxt
    if not poly:break
   if not poly:break
  for i in range(1,len(poly)-1):
   p=np.array([poly[0],poly[i],poly[i+1]])
   if np.linalg.norm(np.cross(p[1,:3]-p[0,:3],p[2,:3]-p[0,:3]))>1e-12:result.extend(p)
 if not result:return None
 a=np.array(result,dtype='<f4');a[:,3:6]/=np.maximum(np.linalg.norm(a[:,3:6],axis=1,keepdims=True),1e-10)
 return dict(POSITION=a[:,:3],NORMAL=a[:,3:6],TEXCOORD_0=a[:,6:8])

bpy.ops.wm.open_mainfile(filepath=str(base/'Library_Editable.blend'))
scene=bpy.context.scene
scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
bpy.context.preferences.filepaths.save_version=0
# Keep the entire approved shell / surrounding occlusion for the solve, but export only receivers.
def ancestors(o):
 while o:
  yield o.name;o=o.parent
for obj in list(scene.objects):
 names=list(ancestors(obj))
 if obj.type=='LIGHT':bpy.data.objects.remove(obj,do_unlink=True);continue
 if any(n.startswith('Left door') or n.startswith('Right door') for n in names):obj.hide_render=True
 chair=any(n.startswith('Chair R1-') for n in names)
 table=any(n.startswith('Reading table 1') for n in names)
 if obj.type=='MESH' and (chair or table):
  if obj.name.startswith('Reading book'):obj.hide_render=True
  else:
   bpy.data.objects.remove(obj,do_unlink=True)
   continue
 if obj.type=='MESH' and obj.name.startswith('Continuous accessible floor'):
  bpy.data.objects.remove(obj,do_unlink=True)
for mat in bpy.data.materials:
 if mat.name.startswith('Linear LED') and mat.use_nodes:
  for node in mat.node_tree.nodes:
   if node.type=='BSDF_PRINCIPLED':node.inputs['Emission Strength'].default_value=0

doc,binary=glb(source);receivers=[]
for node in doc['nodes']:
 info=node.get('extras',{})
 if info.get('role') not in ['receiver-fixed','chair-fixed-runtime-pose']:continue
 primitive,=doc['meshes'][node['mesh']]['primitives']
 attrs={k:read_acc(doc,binary,v) for k,v in primitive['attributes'].items()}
 indices=read_acc(doc,binary,primitive['indices']) if 'indices' in primitive else None
 obj=make_mesh(info['id'],attrs,indices,node['matrix'],bpy.data.materials[info['material']],
               {'sourceId':info['id'],'sourceMaterial':info['material'],'sourcePath':info['sourcePath'],'bakeReceiver':True})
 receivers.append(obj)
assert len(receivers)==35

full,fbin=glb(base/'assets/wenku-library.glb')
# Restore the original full components, including the uncut sill outside the preparation crop.
# Remove only these ranges from their old static batches; retain every other wall/frame vertex.
context_remainders=[]
for node_id,parts in WALL_PARTS.items():
 source_node=full['nodes'][node_id];primitive,=full['meshes'][source_node['mesh']]['primitives']
 arrays={k:read_acc(full,fbin,v) for k,v in primitive['attributes'].items()}
 material_name=full['materials'][primitive['material']]['name'];names=source_node['extras']['components']
 assert len(arrays['POSITION'])==len(names)*324
 old=[o for o in list(scene.objects) if o.type=='MESH' and o.name.startswith(material_name+' construction') and o.parent and o.parent.name.startswith('Structure stone and real window openings')]
 assert len(old)==1,(material_name,[o.name for o in old])
 bpy.data.objects.remove(old[0],do_unlink=True)
 transform=source_node.get('matrix',list(np.eye(4).flatten(order='F')))
 for part in parts:
  attrs={k:a[part*324:(part+1)*324] for k,a in arrays.items()}
  obj=make_mesh(f'r1-n{node_id}-p{part}',attrs,None,transform,bpy.data.materials[material_name],
                {'sourceId':f'r1-n{node_id}-p{part}','sourceMaterial':material_name,'bakeReceiver':True,'wallFeather':True})
  receivers.append(obj)
 remainder={k:np.concatenate([a[i*324:(i+1)*324] for i in range(len(names)) if i not in parts]) for k,a in arrays.items()}
 context_remainders.append(make_mesh(f'R1 context remainder {node_id}',remainder,None,transform,bpy.data.materials[material_name],
                                    {'sourceId':f'r1-context-remainder-{node_id}','sourceMaterial':material_name,'bakeReceiver':False}))
floor=next(n for n in full['nodes'] if n.get('name')=='Continuous accessible floor')
primitive,=full['meshes'][floor['mesh']]['primitives'];assert 'indices' not in primitive
attrs={k:read_acc(full,fbin,v) for k,v in primitive['attributes'].items()}
fm=floor['matrix'];xmin,xmax,zmin,zmax=4.2,9.4,-6.6,-2.4
patch=clip(attrs,fm,[xmin,-.001,zmin],[xmax,.001,zmax])
floor_patch=make_mesh('R1 floor receiver',patch,None,fm,bpy.data.materials['Honed grey stone'],
                     {'sourceId':'r1-floor-patch','sourceMaterial':'Honed grey stone','bakeReceiver':True,'floorFeather':True})
receivers.append(floor_patch)
pieces=[]
for lo,hi in [([-20,-1,-20],[xmin,1,20]),([xmax,-1,-20],[20,1,20]),
              ([xmin,-1,-20],[xmax,1,zmin]),([xmin,-1,zmax],[xmax,1,20]),
              ([xmin,-1,zmin],[xmax,-.002,zmax])]:
 p=clip(attrs,fm,lo,hi)
 if p:pieces.append(p)
remainder={k:np.concatenate([p[k] for p in pieces]) for k in attrs}
rest=make_mesh('R1 floor remainder',remainder,None,fm,bpy.data.materials['Honed grey stone'],
                {'sourceId':'r1-floor-remainder','sourceMaterial':'Honed grey stone','bakeReceiver':False})

bpy.ops.object.select_all(action='DESELECT')
for obj in receivers:
 obj.select_set(True);obj.data.uv_layers.new(name='LightmapUV');obj.data.uv_layers.active_index=1
 obj.data.uv_layers[0].active_render=True;obj.data.uv_layers.active_index=1
bpy.context.view_layer.objects.active=receivers[0]
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.004,margin_method='FRACTION',correct_aspect=True,scale_to_bounds=True)
bpy.ops.uv.pack_islands(rotate=True,scale=True,margin=.008,margin_method='FRACTION')
bpy.ops.object.mode_set(mode='OBJECT')
for obj in receivers:
 obj.data.uv_layers[0].active_render=True;obj.data.uv_layers[1].active_render=False

def export_geometry(objects):
 d={'asset':{'version':'2.0','generator':'R1 Cycles bake receivers; UV0+UV1; no material duplication'},'scene':0,'scenes':[{'nodes':[]}],
    'nodes':[],'meshes':[],'accessors':[],'bufferViews':[],'buffers':[]};blob=bytearray();uv_info=[]
 def acc(values,width):
  a=np.asarray(values,dtype='<f4').reshape(-1,width);blob.extend(b'\0'*(-len(blob)%4));offset=len(blob);blob.extend(a.tobytes())
  d['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':a.nbytes,'target':34962})
  d['accessors'].append({'bufferView':len(d['bufferViews'])-1,'componentType':5126,'count':len(a),'type':{2:'VEC2',3:'VEC3'}[width],
                         'min':a.min(0).tolist(),'max':a.max(0).tolist()})
  return len(d['accessors'])-1
 for obj in objects:
  mesh=obj.data;mesh.calc_loop_triangles();positions=[];normals=[];uv0=[];uv1=[]
  for tri in mesh.loop_triangles:
   for li in tri.loops:
    loop=mesh.loops[li];p=mesh.vertices[loop.vertex_index].co;n=mesh.corner_normals[li].vector
    positions.append((p.x,p.z,-p.y));normals.append((n.x,n.z,-n.y))
    u=mesh.uv_layers[0].data[li].uv;uv0.append((u.x,1-u.y))
    if obj['bakeReceiver']:
     u=mesh.uv_layers[1].data[li].uv;uv1.append((u.x,1-u.y))
  attrs={'POSITION':acc(positions,3),'NORMAL':acc(normals,3),'TEXCOORD_0':acc(uv0,2)}
  if uv1:attrs['TEXCOORD_1']=acc(uv1,2)
  matrix=C.inverted()@obj.matrix_world@C;mi=len(d['meshes']);ni=len(d['nodes'])
  extras={k:obj[k] for k in ['sourceId','sourceMaterial','bakeReceiver']}
  if 'floorFeather' in obj:extras['floorFeather']=True
  if 'wallFeather' in obj:extras['wallFeather']=True
  d['meshes'].append({'name':obj.name,'primitives':[{'attributes':attrs,'mode':4}]})
  d['nodes'].append({'name':obj.name,'mesh':mi,'matrix':[matrix[r][c] for c in range(4) for r in range(4)],'extras':extras})
  d['scenes'][0]['nodes'].append(ni)
  if uv1:
   a=np.asarray(uv1);assert np.all(a>=-1e-6) and np.all(a<=1+1e-6),(obj.name,a.min(0),a.max(0),obj.data.uv_layers.active_index)
   uv_info.append({'id':obj['sourceId'],'triangles':len(uv1)//3,'min':a.min(0).tolist(),'max':a.max(0).tolist()})
 d['buffers']=[{'byteLength':len(blob)}];j=json.dumps(d,separators=(',',':')).encode();j+=b' '*(-len(j)%4);blob.extend(b'\0'*(-len(blob)%4))
 target=out/'r1-receivers.glb'
 target.write_bytes(struct.pack('<III',0x46546c67,2,28+len(j)+len(blob))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(blob),0x004e4942)+blob)
 return uv_info
uv_info=export_geometry(receivers+[rest]+context_remainders)

scene.render.engine='CYCLES';scene.cycles.samples=samples;scene.cycles.use_denoising=True
scene.cycles.max_bounces=8;scene.cycles.diffuse_bounces=5;scene.cycles.transmission_bounces=8
scene.cycles.transparent_max_bounces=16
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for device in prefs.devices:device.use=device.type=='OPTIX'
scene.cycles.device='GPU'
world=bpy.data.worlds.new('R1 diffuse sky');world.use_nodes=True;scene.world=world
# Unit radiance sky. The final combination records the calibrated sky multiplier explicitly.
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.78,.86,1,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=1
sun_data=bpy.data.lights.new('R1 bounce source sun','SUN');sun_data.energy=2.65
def linear(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
sun_data.color=tuple(linear(v/255) for v in [255,241,220]);sun_data.angle=.009
sun=bpy.data.objects.new(sun_data.name,sun_data);scene.collection.objects.link(sun)
sun.location=(18,-17,23);sun.rotation_euler=(Vector((0,0,0))-sun.location).to_track_quat('-Z','Y').to_euler()
atlas=bpy.data.images.new('R1 linear irradiance preparation',width=size,height=size,float_buffer=True,alpha=True)
atlas.colorspace_settings.name='Non-Color'
for mat in {m for obj in receivers for m in obj.data.materials}:
 node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.name='R1 bake target (unconnected)';node.image=atlas;mat.node_tree.nodes.active=node
scene.render.bake.use_pass_color=False;scene.render.bake.use_selected_to_active=False
scene.render.bake.margin=8;scene.render.bake.use_clear=False
def save_exr(image,name):
 settings=scene.render.image_settings;settings.file_format='OPEN_EXR';settings.color_mode='RGB';settings.color_depth='16';settings.exr_codec='ZIP'
 image.save_render(str(out/name),scene=scene)

passes={}
for name,sky,direct,energy in [('sky',1,True,0),('sun-bounce',0,False,2.65)]:
 print('R1_BAKE_START '+name,flush=True)
 world.node_tree.nodes['Background'].inputs['Strength'].default_value=sky;sun_data.energy=energy
 atlas.pixels.foreach_set(np.zeros(size*size*4,dtype='float32'));atlas.update()
 scene.render.bake.use_pass_direct=direct;scene.render.bake.use_pass_indirect=True
 bpy.ops.object.bake(type='DIFFUSE',use_clear=False,uv_layer='LightmapUV',margin=8)
 values=np.empty(size*size*4,dtype='float32');atlas.pixels.foreach_get(values)
 assert np.all(np.isfinite(values)) and np.max(values)>0
 passes[name]=values;save_exr(atlas,'r1-'+name+'.exr')
 print('R1_BAKE_FINISH '+name+' '+str(time.time()-started),flush=True)

sky_gain=2.0
combined=passes['sky']*sky_gain+passes['sun-bounce'];combined[3::4]=1
atlas.pixels.foreach_set(combined);atlas.update();save_exr(atlas,'r1-indirect.exr')
scene['r1_bake_note']='Sky diffuse + sun indirect only. Realtime sun direct remains. No UV0 changes. Source shell/props outside receivers are solve context only.'
scene['sky_gain']=sky_gain;scene['lightmap_to_irradiance_scale']=math.pi
scene['r1_source_commit']='c75a5e2ce1f3313e4965f890c58a407ea6675233'
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(out/'R1_Baked_Working.blend'),compress=True)
report={'size':size,'samples':samples,'device':'OPTIX','seconds':time.time()-started,'receivers':len(receivers),
        'exportedMeshes':len(receivers)+1+len(context_remainders),'uvLayers':['UV0','LightmapUV'],'uvInfo':uv_info,'uv0Preserved':True,
        'passes':{'sky':'direct+indirect, unit diffuse sky (.78,.86,1)','sun':'indirect only, intensity 2.65'},
        'skyGain':sky_gain,'runtimeIrradianceScale':math.pi,'floorPatch':[xmin,xmax,zmin,zmax],
        'runtimeDirectSunBaked':False,'fullShellUsedForOcclusion':True,
        'files':[{'name':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
                 for p in [out/'r1-receivers.glb',out/'r1-indirect.exr',out/'r1-sky.exr',out/'r1-sun-bounce.exr']]}
(out/'bake-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('R1_BAKE_COMPLETE '+json.dumps({k:v for k,v in report.items() if k!='uvInfo'}),flush=True)
