"""Wrap a self-contained single-buffer glTF as GLB without changing scene data."""
import base64
import json
import struct


def pack_embedded_gltf(source):
    document = json.loads(source)
    buffers = document.get('buffers', [])
    if len(buffers) != 1:
        raise ValueError('Expected one buffer')
    uri = buffers[0].get('uri', '')
    if not uri.startswith('data:application/octet-stream;base64,'):
        raise ValueError('Expected an embedded base64 buffer')
    if any('uri' in image for image in document.get('images', [])):
        raise ValueError('Expected embedded bufferView images')
    binary = base64.b64decode(uri.split(',', 1)[1], validate=True)
    if len(binary) != buffers[0]['byteLength']:
        raise ValueError('Buffer length mismatch')
    del buffers[0]['uri']
    encoded = json.dumps(document, separators=(',', ':'), ensure_ascii=False).encode('utf8')
    encoded += b' ' * (-len(encoded) % 4)
    padded_binary = binary + b'\0' * (-len(binary) % 4)
    glb = struct.pack('<III', 0x46546C67, 2, 28 + len(encoded) + len(padded_binary))
    glb += struct.pack('<II', len(encoded), 0x4E4F534A) + encoded
    glb += struct.pack('<II', len(padded_binary), 0x004E4942) + padded_binary
    # Verify the complete scene/skin/animation JSON and exact original buffer.
    roundtrip = json.loads(glb[20:20 + len(encoded)])
    original = json.loads(source)
    del original['buffers'][0]['uri']
    if roundtrip != original or glb[28 + len(encoded):28 + len(encoded) + len(binary)] != binary:
        raise ValueError('Lossless packaging check failed')
    return glb
