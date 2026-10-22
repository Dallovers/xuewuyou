"""Extract the approved R1 and an east-wing context, without re-exporting the library.

Uses existing NumPy. No UV unwrap, bake, remesh, material adjustment, or added closure walls.
python extract-r1.py --source ../../assets/wenku-library.glb --output .
"""
import argparse
import copy
import hashlib
import json
import struct
from pathlib import Path
import numpy as np

APPROVED_SHA = '9bbcd6676913ec6e43a5d02dfc99dde332664624a49e41b3432bbfd8c7ba73e1'
SOURCE_COMMIT = 'ed40ec23998352bd6060f797cc834afe2944efc2'
CONTEXT_MIN = np.array([3.2, -.28, -9.2])
CONTEXT_MAX = np.array([12.2, 6.1, 9.2])
DTYPES = {5121: '<u1', 5123: '<u2', 5125: '<u4', 5126: '<f4'}
WIDTHS = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def read_glb(path):
    raw = path.read_bytes()
    assert struct.unpack_from('<III', raw) == (0x46546c67, 2, len(raw))
    length, kind = struct.unpack_from('<II', raw, 12)
    assert kind == 0x4e4f534a
    doc = json.loads(raw[20:20 + length])
    n, kind = struct.unpack_from('<II', raw, 20 + length)
    assert kind == 0x004e4942
    return doc, raw[28 + length:28 + length + n], hashlib.sha256(raw).hexdigest()


def matrix(node):
    if 'matrix' in node:
        return np.array(node['matrix']).reshape((4, 4), order='F')
    x, y, z, w = node.get('rotation', [0, 0, 0, 1])
    m = np.eye(4)
    m[:3, :3] = [[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                 [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                 [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]]
    m[:3, :3] = m[:3, :3] @ np.diag(node.get('scale', [1, 1, 1]))
    m[:3, 3] = node.get('translation', [0, 0, 0])
    return m


def texture_infos(value):
    if isinstance(value, dict):
        for key, child in value.items():
            if key.endswith('Texture') and isinstance(child, dict) and 'index' in child:
                yield child
            else:
                yield from texture_infos(child)
    elif isinstance(value, list):
        for child in value:
            yield from texture_infos(child)


def extract(source, output):
    doc, binary, source_sha = read_glb(source)
    assert source_sha == APPROVED_SHA, 'Unexpected source: review before changing the version lock'
    output.mkdir(parents=True, exist_ok=True)
    nodes = doc['nodes']
    worlds, paths = {}, {}

    def walk(i, parent, path):
        node = nodes[i]
        worlds[i] = parent @ matrix(node)
        paths[i] = path + [node.get('name', str(i))]
        for child in node.get('children', []):
            walk(child, worlds[i], paths[i])
    for root in doc['scenes'][doc.get('scene', 0)]['nodes']:
        walk(root, np.eye(4), [])

    def accessor(index):
        acc = doc['accessors'][index]
        assert 'sparse' not in acc and not acc.get('normalized')
        view = doc['bufferViews'][acc['bufferView']]
        dtype = np.dtype(DTYPES[acc['componentType']])
        width = WIDTHS[acc['type']]
        offset = view.get('byteOffset', 0) + acc.get('byteOffset', 0)
        stride = view.get('byteStride', dtype.itemsize * width)
        return np.ndarray((acc['count'], width), dtype, binary, offset,
                          strides=(stride, dtype.itemsize)).copy()

    def world_positions(values, transform):
        return values @ transform[:3, :3].T + transform[:3, 3]

    def clipped(attributes, transform):
        # Clip every triangle with interpolated original attributes. No new cap faces.
        keys = list(attributes)
        widths = [attributes[k].shape[1] for k in keys]
        packed = np.concatenate([attributes[k] for k in keys], axis=1).astype(np.float64)
        position_slice = slice(sum(widths[:keys.index('POSITION')]),
                               sum(widths[:keys.index('POSITION') + 1]))
        triangles = []
        for triangle in packed.reshape(-1, 3, packed.shape[1]):
            polygon = list(triangle)
            for axis in range(3):
                for bound, sign in [(CONTEXT_MIN[axis], 1), (CONTEXT_MAX[axis], -1)]:
                    result = []
                    for prev, cur in zip(polygon[-1:] + polygon[:-1], polygon):
                        a = sign * (world_positions(prev[position_slice][None], transform)[0, axis] - bound)
                        b = sign * (world_positions(cur[position_slice][None], transform)[0, axis] - bound)
                        if (a >= -1e-9) != (b >= -1e-9):
                            result.append(prev + (cur - prev) * (a / (a - b)))
                        if b >= -1e-9:
                            result.append(cur)
                    polygon = result
                    if not polygon:
                        break
                if not polygon:
                    break
            for i in range(1, len(polygon)-1):
                tri = np.array([polygon[0], polygon[i], polygon[i+1]])
                p = world_positions(tri[:, position_slice], transform)
                if np.linalg.norm(np.cross(p[1]-p[0], p[2]-p[0])) > 1e-12:
                    triangles.extend(tri)
        if not triangles:
            return None
        values = np.array(triangles, dtype='<f4')
        cuts = np.cumsum([0] + widths)
        return {k: values[:, cuts[i]:cuts[i+1]] for i, k in enumerate(keys)}

    selected, material_ids, image_records, instance_data = [], set(), [], {}
    for index, node in enumerate(nodes):
        if 'mesh' not in node:
            continue
        path = paths[index]
        furniture = 'Reading table 1' in path or any(p.startswith('Chair R1-') for p in path)
        tree = 'Library tree 623' in path or node.get('name') == 'East window sample cupped foliage'
        context = ('Structure stone and real window openings' in path or
                   'Roof editable zinc and clerestory' in path)
        if not (furniture or context or tree) or 'Operable entrance sliding doors' in path:
            continue
        primitive, = doc['meshes'][node['mesh']]['primitives']
        assert primitive.get('mode', 4) == 4 and not primitive.get('targets')
        attributes = {k: accessor(v) for k, v in primitive['attributes'].items()}
        if 'EXT_mesh_gpu_instancing' in node.get('extensions', {}):
            instance_data[index] = {k: accessor(v) for k,v in node['extensions']['EXT_mesh_gpu_instancing']['attributes'].items()}
        names = node.get('extras', {}).get('components')
        if names:
            # In this locked source batchStatic concatenates 324-vertex rounded boxes.
            assert 'indices' not in primitive
            assert all(len(v) == 324 * len(names) for v in attributes.values())
            pieces = [(i, name, {k: a[i*324:(i+1)*324].copy() for k, a in attributes.items()}, None)
                      for i, name in enumerate(names)]
        else:
            pieces = [(None, node['name'], attributes,
                       accessor(primitive['indices']) if 'indices' in primitive else None)]
        for part, name, attrs, indices in pieces:
            transform = worlds[index]
            positions = world_positions(attrs['POSITION'], transform)
            if index in instance_data:
                instances = instance_data[index]
                assert len(instances['TRANSLATION']) == 4480
                positions = np.concatenate([world_positions(attrs['POSITION'], transform @ matrix({
                    'translation': t, 'rotation': r, 'scale': s}))
                    for t,r,s in zip(instances['TRANSLATION'],instances['ROTATION'],instances['SCALE'])])
            if context and (np.any(positions.max(0) < CONTEXT_MIN-1e-6) or
                            np.any(positions.min(0) > CONTEXT_MAX+1e-6)):
                continue
            was_clipped = context and (np.any(positions.min(0) < CONTEXT_MIN-1e-6) or
                                       np.any(positions.max(0) > CONTEXT_MAX+1e-6))
            if was_clipped:
                if indices is not None:
                    attrs = {k: a[indices.ravel()] for k, a in attrs.items()}
                attrs = clipped(attrs, transform)
                indices = None
                if attrs is None:
                    continue
                positions = world_positions(attrs['POSITION'], transform)
                if 'NORMAL' in attrs:
                    attrs['NORMAL'] /= np.maximum(np.linalg.norm(attrs['NORMAL'], axis=1, keepdims=True), 1e-10)
            material = primitive['material']
            mat = doc['materials'][material]
            is_glass = 'glass' in mat['name'].lower()
            role = 'context-occluder'
            if tree:
                role = 'tree623-shadow-reference'
            if furniture:
                role = 'receiver-fixed'
                if any(p.startswith('Chair R1-') for p in path):
                    role = 'chair-fixed-runtime-pose'
                if name.startswith('Reading book'):
                    role = 'movable-prop-reference'
            if is_glass:
                role = 'glass-reference'
            if any(mat.get('emissiveFactor', [0, 0, 0])):
                role = 'emissive-reference'
            record = {'id': f'r1-n{index}' + (f'-p{part}' if part is not None else ''),
                      'sourceNode': index, 'sourceComponent': part, 'sourcePath': '/'.join(path),
                      'name': name, 'role': role, 'material': mat['name'],
                      'worldMatrix': transform.flatten(order='F').tolist(),
                      'bounds': {'min': positions.min(0).tolist(), 'max': positions.max(0).tolist()},
                      'contextClipped': bool(was_clipped),
                      'triangles': len(indices)//3 if indices is not None else len(attrs['POSITION'])//3,
                      'hasLightmapUV': False}
            record['instances'] = len(instance_data[index]['TRANSLATION']) if index in instance_data else 1
            assert 'TEXCOORD_1' not in attrs, 'Reassess UV classification if source changes'
            uv = attrs.get('TEXCOORD_0')
            record['uv0Range'] = {'min': uv.min(0).tolist(), 'max': uv.max(0).tolist()} if uv is not None else None
            selected.append((record, attrs, indices, material))
            material_ids.add(material)

    assert len([r for r, *_ in selected if r['name'] == 'Solid oak desktop']) == 1
    assert len({p for r, *_ in selected for p in r['sourcePath'].split('/') if p.startswith('Chair R1-')}) == 4
    assert any(r['material'] == 'Sample east pane 12mm clear glass' for r, *_ in selected)
    result = {'asset': {'version': '2.0', 'generator': 'R1 approved-GLB subset; no bake'},
              'scene': 0, 'scenes': [{'nodes': [0]}],
              'nodes': [{'name': 'R1 bake preparation Y-up metres', 'children': []}],
              'meshes': [], 'accessors': [], 'bufferViews': [], 'buffers': [],
              'materials': [], 'textures': [], 'images': [],
              'samplers': copy.deepcopy(doc.get('samplers', []))}
    buffer = bytearray()

    def view(data, target=None):
        buffer.extend(b'\0' * (-len(buffer) % 4))
        obj = {'buffer': 0, 'byteOffset': len(buffer), 'byteLength': len(data)}
        if target:
            obj['target'] = target
        buffer.extend(data)
        result['bufferViews'].append(obj)
        return len(result['bufferViews'])-1

    def add_accessor(values, semantic=None):
        values = np.ascontiguousarray(values)
        dtype = next(k for k, v in DTYPES.items() if np.dtype(v) == values.dtype)
        acc = {'bufferView': view(values.tobytes(), 34963 if semantic == 'indices' else 34962),
               'componentType': dtype, 'count': len(values),
               'type': next(k for k, v in WIDTHS.items() if v == values.shape[1])}
        if semantic == 'POSITION':
            acc.update(min=values.min(0).tolist(), max=values.max(0).tolist())
        result['accessors'].append(acc)
        return len(result['accessors'])-1

    material_map = {old: i for i, old in enumerate(sorted(material_ids))}
    result['materials'] = [copy.deepcopy(doc['materials'][i]) for i in sorted(material_ids)]
    used_textures = sorted({info['index'] for m in result['materials'] for info in texture_infos(m)})
    texture_map = {old: i for i, old in enumerate(used_textures)}
    used_images = sorted({doc['textures'][i]['source'] for i in used_textures})
    image_map = {old: i for i, old in enumerate(used_images)}
    for old in used_images:
        image = copy.deepcopy(doc['images'][old])
        assert 'uri' not in image
        source_view = doc['bufferViews'][image['bufferView']]
        start = source_view.get('byteOffset', 0)
        data = binary[start:start+source_view['byteLength']]
        image_records.append({'sourceImage': old, 'name': image.get('name'),
                              'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        image['bufferView'] = view(data)
        result['images'].append(image)
    for old in used_textures:
        texture = copy.deepcopy(doc['textures'][old])
        texture['source'] = image_map[texture['source']]
        result['textures'].append(texture)
    for material in result['materials']:
        for info in texture_infos(material):
            info['index'] = texture_map[info['index']]

    for record, attrs, indices, material in selected:
        primitive = {'attributes': {k: add_accessor(v, k) for k, v in attrs.items()},
                     'material': material_map[material], 'mode': 4}
        if indices is not None:
            primitive['indices'] = add_accessor(indices, 'indices')
        mesh_index = len(result['meshes'])
        result['meshes'].append({'name': record['id'], 'primitives': [primitive]})
        result['nodes'][0]['children'].append(len(result['nodes']))
        node = {'name': record['id'] + ' ' + record['name'], 'mesh': mesh_index,
                'matrix': record['worldMatrix'], 'extras': record}
        if record['sourceNode'] in instance_data:
            node['extensions'] = {'EXT_mesh_gpu_instancing': {'attributes': {
                k: add_accessor(v,k) for k,v in instance_data[record['sourceNode']].items()}}}
        result['nodes'].append(node)

    # Preserve only extensions actually referenced by the subset, not instancing or source lights.
    def extensions(value):
        found = set()
        if isinstance(value, dict):
            found.update(value.get('extensions', {}))
            for child in value.values():
                found.update(extensions(child))
        elif isinstance(value, list):
            for child in value:
                found.update(extensions(child))
        return found
    result['extensionsUsed'] = sorted(extensions(result))
    result['buffers'] = [{'byteLength': len(buffer)}]
    json_chunk = json.dumps(result, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    json_chunk += b' ' * (-len(json_chunk) % 4)
    buffer.extend(b'\0' * (-len(buffer) % 4))
    raw = struct.pack('<III', 0x46546c67, 2, 28+len(json_chunk)+len(buffer))
    raw += struct.pack('<II', len(json_chunk), 0x4e4f534a) + json_chunk
    raw += struct.pack('<II', len(buffer), 0x004e4942) + buffer
    target = output/'r1-local.glb'
    target.write_bytes(raw)
    mins = np.min([r['bounds']['min'] for r, *_ in selected], axis=0)
    maxs = np.max([r['bounds']['max'] for r, *_ in selected], axis=0)
    manifest = {'sourceCommit': SOURCE_COMMIT, 'sourceGLBSha256': source_sha,
                'subset': target.name, 'subsetSha256': hashlib.sha256(raw).hexdigest(),
                'subsetBytes': len(raw), 'units': 'metres', 'up': '+Y',
                'contextCrop': {'min': CONTEXT_MIN.tolist(), 'max': CONTEXT_MAX.tolist()},
                'actualBounds': {'min': mins.tolist(), 'max': maxs.tolist(), 'size': (maxs-mins).tolist()},
                'boundaryNote': 'Open west cut at X=3.2; no invented wall. Only tree 623 is retained outside, at approved near LOD, for window shadows. No remote west wing, R2, bookshelves, entrance doors or site ground. This is a local preparation domain, not proven complete GI context.',
                'materials': [{'sourceMaterial': old, 'name': doc['materials'][old]['name'],
                               'definition': doc['materials'][old]} for old in sorted(material_ids)],
                'images': image_records, 'objects': [r for r, *_ in selected],
                'lightmapUV': False, 'baked': False, 'externalResourceURIs': []}
    (output/'objects-and-materials.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'objects': len(selected), 'materials': len(material_ids), 'images': len(image_records),
                      'bytes': len(raw), 'bounds': manifest['actualBounds']}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    extract(args.source.resolve(), args.output.resolve())
