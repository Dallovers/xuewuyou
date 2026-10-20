"""Compare delivered models: keep geometry and all non-R1 material semantics."""
import importlib.util
import hashlib
import json
import sys
from pathlib import Path
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('sample_audit', Path(__file__).with_name('audit-sample-model.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
before, after = map(module.Model, sys.argv[1:3])
groups = ['Structure stone and real window openings', 'Furniture bookcases and reading desks',
          'Roof editable zinc and clerestory', 'Library forecourt']
for name in groups:
    assert before.subtree(before.node(name)) == after.subtree(after.node(name)), name
instances = 0
instanced_names = [n['name'] for n in before.g['nodes'] if 'EXT_mesh_gpu_instancing' in n.get('extensions', {})]
for name in instanced_names:
    old_attributes = before.node(name)['extensions']['EXT_mesh_gpu_instancing']['attributes']
    new_attributes = after.node(name)['extensions']['EXT_mesh_gpu_instancing']['attributes']
    assert old_attributes.keys() == new_attributes.keys()
    for key in old_attributes:
        assert before.accessor(old_attributes[key]) == after.accessor(new_attributes[key]), (name, key)
    instances += len(after.accessor(new_attributes['TRANSLATION']))

def texture(model, index):
    g = model.g
    t = g['textures'][index]
    image = g['images'][t['source']]
    view = g['bufferViews'][image['bufferView']]
    offset = view.get('byteOffset', 0)
    return {'image': hashlib.sha256(model.binary[offset:offset + view['byteLength']]).hexdigest(),
            'sampler': g.get('samplers', [])[t['sampler']] if 'sampler' in t else None}

def material(model, value, key=''):
    if isinstance(value, list):
        return [material(model, v) for v in value]
    if not isinstance(value, dict):
        return value
    return {k: texture(model, v) if k == 'index' and key.endswith('Texture') else material(model, v, k)
            for k, v in value.items()}

old = {m['name']: material(before, m) for m in before.g['materials']}
new = {m['name']: material(after, m) for m in after.g['materials']}
assert old.keys() == new.keys()
changed = [name for name in old if old[name] != new[name]]
assert set(changed) == {'Sample R1 longitudinal white oak', 'Pale bent oak chair veneer'}, changed
lights = after.g['extensions']['KHR_lights_punctual']['lights']
assert len(lights) == 1
light = lights[0]
assert light['type'] == 'spot' and light['intensity'] == 26 and light['range'] == 8
report = {'passed': True, 'before': Path(sys.argv[1]).name, 'after': Path(sys.argv[2]).name,
          'unchangedGeometryTransformsMaterialAssignments': groups,
          'changedMaterialSemantics': changed, 'unchangedMaterialSemantics': len(old) - len(changed),
          'unchangedInstanceTransformsAndColours': instances,
          'additionalLight': light, 'note': 'Material comparison resolves texture indices to embedded image bytes and sampler values; it does not compare rendered illumination.'}
Path(sys.argv[3]).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
