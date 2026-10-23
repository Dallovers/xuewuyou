"""Reuse existing Blender to audit the approved file and prepare ONLY the extracted R1.
blender --background --factory-startup --python-exit-code 1 --python this.py --
  approved.blend r1-local.glb output.blend
No render engine installation, UV unwrap, bake, or original-file save.
"""
import hashlib
import json
import math
import struct
import sys
from pathlib import Path
import bpy
from mathutils import Vector

approved, source, target = [Path(x).resolve() for x in sys.argv[sys.argv.index('--')+1:]]
assert hashlib.sha256(approved.read_bytes()).hexdigest() == 'bb10a6b0029285bd7c37142dbfa15e929acc2d06222790d38250227618f55093'
bpy.ops.wm.open_mainfile(filepath=str(approved))
old = {'sha256': hashlib.sha256(approved.read_bytes()).hexdigest(),
       'objects': len(bpy.context.scene.objects),
       'packedImages': sum(bool(i.packed_file) for i in bpy.data.images),
       'unpackedImages': [i.name for i in bpy.data.images if i.type != 'RENDER_RESULT' and not i.packed_file],
       'cameras': [o.name for o in bpy.context.scene.objects if o.type == 'CAMERA'],
       'localSpotlights': [o.name for o in bpy.context.scene.objects if o.type == 'LIGHT' and o.data.type == 'SPOT']}
print('APPROVED_FILE_AUDIT '+json.dumps(old,ensure_ascii=False))
assert old['packedImages'] == 28 and len(old['cameras']) == 5 and old['localSpotlights']
assert not old['unpackedImages']
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.import_scene.gltf(filepath=str(source))
target.parent.mkdir(parents=True, exist_ok=True)
# Blender 4.5's importer skips EXT_materials_bump. Restore its existing height texture,
# rather than silently dropping the approved foot-pad/book-cover weave.
raw = source.read_bytes()
json_size = struct.unpack_from('<I', raw, 12)[0]
gltf = json.loads(raw[20:20+json_size])
binary = raw[28+json_size:]
restored_bumps = []
for definition in gltf['materials']:
    extension = definition.get('extensions', {}).get('EXT_materials_bump')
    if not extension:
        continue
    info = extension['bumpTexture']
    assert info.get('texCoord', 0) == 0
    image_index = gltf['textures'][info['index']]['source']
    view = gltf['bufferViews'][gltf['images'][image_index]['bufferView']]
    start = view.get('byteOffset', 0)
    image_data = binary[start:start+view['byteLength']]
    image_path = target.parent/'weave-bump-source.png'
    image_path.write_bytes(image_data)
    image = bpy.data.images.load(str(image_path), check_existing=False)
    image.name = 'Approved sage weave height (EXT_materials_bump)'
    image.colorspace_settings.name = 'Non-Color'
    image.pack()
    material = bpy.data.materials[definition['name']]
    tree = material.node_tree
    shader = next(n for n in tree.nodes if n.type == 'BSDF_PRINCIPLED')
    assert not shader.inputs['Normal'].is_linked
    coordinates = tree.nodes.new('ShaderNodeTexCoord')
    mapping = tree.nodes.new('ShaderNodeMapping')
    transform = info.get('extensions', {}).get('KHR_texture_transform', {})
    scale = transform.get('scale', [1, 1])
    mapping.inputs['Scale'].default_value = (*scale, 1)
    mapping.inputs['Rotation'].default_value[2] = transform.get('rotation', 0)
    mapping.inputs['Location'].default_value = (*transform.get('offset', [0, 0]), 0)
    texture = tree.nodes.new('ShaderNodeTexImage')
    texture.image = image
    bump = tree.nodes.new('ShaderNodeBump')
    bump.inputs['Distance'].default_value = extension['bumpFactor']
    tree.links.new(coordinates.outputs['UV'], mapping.inputs['Vector'])
    tree.links.new(mapping.outputs['Vector'], texture.inputs['Vector'])
    tree.links.new(texture.outputs['Color'], bump.inputs['Height'])
    tree.links.new(bump.outputs['Normal'], shader.inputs['Normal'])
    restored_bumps.append({'material': definition['name'], 'heightSHA256': hashlib.sha256(image_data).hexdigest(),
                           'factor': extension['bumpFactor'], 'uvScale': scale,
                           'note': 'Existing extension restored as Blender Bump; shading is not asserted pixel-identical to Three.'})
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1
scene['source_glb_sha256'] = hashlib.sha256(source.read_bytes()).hexdigest()
scene['source_runtime_commit'] = 'ed40ec23998352bd6060f797cc834afe2944efc2'
scene['coordinate_conversion'] = 'Three/GLB (X,Y,Z) -> Blender (X,-Z,Y); no recenter or scaling'
scene['preparation_only'] = 'NO LIGHTMAP UV, NO BAKE. West cut open. Local context not complete whole-library GI.'
scene['lights'] = 'Intentionally no converted inspection rig. See lighting-and-cameras.json for actual runtime values.'
collections = {}
for name in ['R1_FIXED_RECEIVERS', 'R1_FIXED_POSE_CHAIRS', 'CONTEXT_OCCLUDERS',
             'GLASS_REVIEW_TRANSMISSION', 'EMISSIVE_REVIEW_EXCLUDE_FROM_FIRST_BAKE',
             'MOVABLE_PROPS_REFERENCE_EXCLUDE', 'TREE623_SHADOW_REFERENCE', 'FIXED_CAMERAS']:
    coll = bpy.data.collections.new(name)
    scene.collection.children.link(coll)
    collections[name] = coll
by_role = {'receiver-fixed': 'R1_FIXED_RECEIVERS',
           'chair-fixed-runtime-pose': 'R1_FIXED_POSE_CHAIRS',
           'context-occluder': 'CONTEXT_OCCLUDERS',
           'glass-reference': 'GLASS_REVIEW_TRANSMISSION',
           'emissive-reference': 'EMISSIVE_REVIEW_EXCLUDE_FROM_FIRST_BAKE',
           'movable-prop-reference': 'MOVABLE_PROPS_REFERENCE_EXCLUDE',
           'tree623-shadow-reference': 'TREE623_SHADOW_REFERENCE'}
records = []
for obj in list(scene.objects):
    if obj.type != 'MESH':
        continue
    metadata = obj
    while not metadata.get('role') and metadata.parent:
        metadata = metadata.parent
    assert metadata.get('id') and metadata.get('role') in by_role
    role = metadata['role']
    collection = collections[by_role[role]]
    for owner in list(obj.users_collection):
        owner.objects.unlink(obj)
    collection.objects.link(obj)
    assert len(obj.data.uv_layers) == 1
    points = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
    records.append({'id': metadata['id'], 'name': obj.name, 'role': role,
                    'boundsBlender': {'min': [min(v[i] for v in points) for i in range(3)],
                                      'max': [max(v[i] for v in points) for i in range(3)]},
                    'uvLayers': [u.name for u in obj.data.uv_layers]})
# References remain editable and visible in the viewport, but are excluded from an initial bake/render.
# Glass stays enabled for the planner to decide shadow/transmission behavior, never treated as opaque.
collections['MOVABLE_PROPS_REFERENCE_EXCLUDE'].hide_render = True
collections['EMISSIVE_REVIEW_EXCLUDE_FROM_FIRST_BAKE'].hide_render = True
camera_specs = [('overall', [2.7,1.7,-5.2], [9,1.25,-4.6]),
                ('chair-close', [4.55,1,-7.1], [5.62,.48,-5.63]),
                ('backlit', [4.2,1.65,-3.1], [8.2,.9,-4.5])]
for name, eye, aim in camera_specs:
    data = bpy.data.cameras.new('R1 '+name)
    data.sensor_fit = 'VERTICAL'
    data.angle = math.radians(55)
    data.clip_start, data.clip_end = .08, 180
    obj = bpy.data.objects.new(data.name, data)
    collections['FIXED_CAMERAS'].objects.link(obj)
    obj.location = (eye[0], -eye[2], eye[1])
    aim = Vector((aim[0], -aim[2], aim[1]))
    obj.rotation_euler = (aim - obj.location).to_track_quat('-Z','Y').to_euler()
    if name == 'overall':
        scene.camera = obj
scene.render.resolution_x, scene.render.resolution_y = 1440, 960
scene.render.resolution_percentage = 100
scene.world = None
bpy.ops.file.pack_all()
target.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(target), compress=True)
stats = {'blender': bpy.app.version_string, 'approvedFileAudit': old,
         'subsetSourceSHA256': scene['source_glb_sha256'],
         'meshObjects': len(records), 'materials': len(bpy.data.materials),
         'packedImages': sum(bool(i.packed_file) for i in bpy.data.images),
         'unpackedImages': [i.name for i in bpy.data.images if i.type != 'RENDER_RESULT' and not i.packed_file],
         'cameraCount': sum(o.type == 'CAMERA' for o in scene.objects),
         'lights': sum(o.type == 'LIGHT' for o in scene.objects),
         'lightmapUV': False, 'baked': False, 'outputSHA256': hashlib.sha256(target.read_bytes()).hexdigest(),
         'outputBytes': target.stat().st_size, 'objects': records}
stats['packedImageFiles'] = [{'name': i.name, 'sha256': hashlib.sha256(bytes(i.packed_file.data)).hexdigest()}
                             for i in bpy.data.images if i.packed_file]
stats['restoredBumpExtensions'] = restored_bumps
print('SUBSET_FILE_AUDIT '+json.dumps({k:v for k,v in stats.items() if k != 'objects'},ensure_ascii=False))
expected_images = json.loads(source.with_name('objects-and-materials.json').read_text(encoding='utf-8'))['images']
assert {i['sha256'] for i in expected_images} == {i['sha256'] for i in stats['packedImageFiles']}
assert stats['meshObjects'] == 4645 and not stats['unpackedImages']
target.with_suffix('.validation.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
# Reopen the saved subset, rather than claiming the save alone proves a portable file.
bpy.ops.wm.open_mainfile(filepath=str(target))
assert sum(o.type == 'MESH' for o in bpy.context.scene.objects) == stats['meshObjects']
assert all(i.packed_file for i in bpy.data.images if i.type != 'RENDER_RESULT')
print(json.dumps({k:v for k,v in stats.items() if k != 'objects'},ensure_ascii=False))
