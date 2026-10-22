"""Audit the delivered subset against the approved file, not against regenerated output.
python audit-r1.py --source ../../assets/wenku-library.glb --subset r1-local.glb --output asset-audit.json
"""
import argparse
import copy
import hashlib
import json
import struct
from pathlib import Path
import numpy as np


def read(path):
    raw=path.read_bytes()
    assert struct.unpack_from('<III',raw)==(0x46546c67,2,len(raw))
    length,kind=struct.unpack_from('<II',raw,12)
    assert kind==0x4e4f534a
    size,kind=struct.unpack_from('<II',raw,20+length)
    assert kind==0x004e4942
    return json.loads(raw[20:20+length]),raw[28+length:28+length+size]


def accessor(doc,binary,index):
    a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']]
    dtype=np.dtype({5121:'<u1',5123:'<u2',5125:'<u4',5126:'<f4'}[a['componentType']])
    width={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
    assert 'sparse' not in a and not a.get('normalized')
    return np.ndarray((a['count'],width),dtype,binary,v.get('byteOffset',0)+a.get('byteOffset',0),
                      strides=(v.get('byteStride',dtype.itemsize*width),dtype.itemsize)).copy()


def material_semantics(doc,binary,index):
    def resolve(value):
        if isinstance(value,dict):
            result={}
            for key,child in value.items():
                if key.endswith('Texture') and isinstance(child,dict) and 'index' in child:
                    texture=doc['textures'][child['index']]
                    image=doc['images'][texture['source']]
                    assert 'uri' not in image
                    view=doc['bufferViews'][image['bufferView']];start=view.get('byteOffset',0)
                    data=binary[start:start+view['byteLength']]
                    result[key]={**{k:v for k,v in child.items() if k!='index'},
                                 'imageSHA256':hashlib.sha256(data).hexdigest(),
                                 'sampler':doc['samplers'][texture['sampler']]}
                else:result[key]=resolve(child)
            return result
        if isinstance(value,list):return [resolve(v) for v in value]
        return value
    return resolve(copy.deepcopy(doc['materials'][index]))


def audit(source,subset,output):
    src,sbin=read(source);dst,dbin=read(subset)
    manifest=json.loads(subset.with_name('objects-and-materials.json').read_text(encoding='utf-8'))
    assert hashlib.sha256(source.read_bytes()).hexdigest()==manifest['sourceGLBSha256']
    assert hashlib.sha256(subset.read_bytes()).hexdigest()==manifest['subsetSha256']
    records={o['id']:o for o in manifest['objects']}
    assert not any('uri' in x for key in ['buffers','images'] for x in dst[key])
    checked=[];clipped=[];roles={};instances=0
    for node in dst['nodes']:
        if 'mesh' not in node:continue
        info=node['extras'];assert info==records[info['id']]
        assert np.array_equal(np.array(node['matrix']),np.array(info['worldMatrix']))
        primitive,=dst['meshes'][node['mesh']]['primitives']
        original,=src['meshes'][src['nodes'][info['sourceNode']]['mesh']]['primitives']
        assert material_semantics(dst,dbin,primitive['material'])==material_semantics(src,sbin,original['material'])
        assert 'TEXCOORD_1' not in primitive['attributes']
        assert set(primitive['attributes'])==set(original['attributes'])
        if not info['contextClipped']:
            for name,index in primitive['attributes'].items():
                actual=accessor(dst,dbin,index)
                expected=accessor(src,sbin,original['attributes'][name])
                if info['sourceComponent'] is not None:
                    start=info['sourceComponent']*324;expected=expected[start:start+324]
                assert np.array_equal(actual,expected),(info['id'],name)
            if 'indices' in original:
                assert np.array_equal(accessor(src,sbin,original['indices']),accessor(dst,dbin,primitive['indices']))
            checked.append(info['id'])
        else:
            # Topology changes only at the explicit context crop; no furniture is clipped.
            assert info['role'] in ['context-occluder','glass-reference']
            positions=accessor(dst,dbin,primitive['attributes']['POSITION'])
            m=np.array(node['matrix']).reshape(4,4,order='F')
            world=positions@m[:3,:3].T+m[:3,3]
            assert np.all(world>=np.array(manifest['contextCrop']['min'])-1e-5)
            assert np.all(world<=np.array(manifest['contextCrop']['max'])+1e-5)
            normals=accessor(dst,dbin,primitive['attributes']['NORMAL'])
            assert np.allclose(np.linalg.norm(normals,axis=1),1,atol=2e-5)
            clipped.append(info['id'])
        if info['instances']>1:
            actual=node['extensions']['EXT_mesh_gpu_instancing']['attributes']
            expected=src['nodes'][info['sourceNode']]['extensions']['EXT_mesh_gpu_instancing']['attributes']
            assert actual.keys()==expected.keys()
            for name in actual:
                assert np.array_equal(accessor(dst,dbin,actual[name]),accessor(src,sbin,expected[name]))
            instances+=info['instances']
        roles[info['role']]=roles.get(info['role'],0)+1
        assert all(x not in info['sourcePath'] for x in ['Reading table 2','Chair R2','Bookshelf','Site ground','Operable entrance'])
    assert len(checked)+len(clipped)==166 and instances==4480
    result={'passed':True,'sourceSHA256':manifest['sourceGLBSha256'],'subsetSHA256':manifest['subsetSha256'],
            'unchangedAttributeAndIndexObjects':checked,'contextOnlyClippedObjects':clipped,
            'all166MaterialSemanticsIdentical':True,'roles':roles,'unchangedTreeInstancesIncludingColours':instances,
            'externalURIs':[],'lightmapUV':False,'baked':False,
            'scopeNote':'Clipped surfaces verified for crop bounds/unit normals; this is not a proof of whole-library GI completeness.'}
    output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if not isinstance(v,list)},ensure_ascii=False))


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source',type=Path,required=True);p.add_argument('--subset',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True);a=p.parse_args();audit(a.source,a.subset,a.output)
