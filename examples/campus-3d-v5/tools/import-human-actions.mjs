// Offline extraction of the CC0 Universal Animation Library Standard subset.
// Usage: node tools/import-human-actions.mjs <path-to-gltf-universal-animation-library>
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const source=process.argv[2];if(!source)throw Error('Pass the UAL source repository directory');
const json=JSON.parse(await readFile(path.join(source,'glTF/AnimationLibrary_Godot_Standard.gltf'),'utf8'));
const binary=await readFile(path.join(source,'glTF',json.buffers[0].uri));
const names=['A_TPose','Idle_Loop','Sprint_Loop','Jump_Start','Jump_Loop','Jump_Land','Punch_Enter','Punch_Jab'];
json.animations=json.animations.filter(a=>names.includes(a.name));
if(json.animations.length!==names.length)throw Error('Incomplete UAL source');
const accessors=[],views=[],chunks=[],accessorMap=new Map(),viewMap=new Map();let offset=0;
function view(index){
 if(viewMap.has(index))return viewMap.get(index);
 const original=json.bufferViews[index],start=original.byteOffset||0,data=binary.subarray(start,start+original.byteLength);
 const result=views.length;views.push({...original,buffer:0,byteOffset:offset});chunks.push(data);offset+=data.length;
 const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}
 viewMap.set(index,result);return result;
}
function accessor(index){if(accessorMap.has(index))return accessorMap.get(index);const result=accessors.length,a=json.accessors[index];if(a.sparse)throw Error('Sparse source accessor needs explicit handling');accessors.push({...a,bufferView:view(a.bufferView)});accessorMap.set(index,result);return result;}
for(const animation of json.animations)for(const sampler of animation.samplers){sampler.input=accessor(sampler.input);sampler.output=accessor(sampler.output);}
for(const key of ['meshes','skins','materials','textures','images'])delete json[key];
for(const node of json.nodes){delete node.mesh;delete node.skin;}
json.asset.extras={source:'Quaternius Universal Animation Library Standard; CC0',mirror:'J-Ponzo/gltf-universal-animation-library',revision:'e24c23cf2a1323488a3faa226ea7ea21f644b73e',changes:'Selected humanoid skeleton and eight clips only; original motion samples preserved'};
json.accessors=accessors;json.bufferViews=views;json.buffers=[{byteLength:offset}];
const raw=Buffer.from(JSON.stringify(json)),paddedJson=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,0x20)]),bin=Buffer.concat(chunks);
const head=Buffer.alloc(12),jsonHead=Buffer.alloc(8),binHead=Buffer.alloc(8);
head.writeUInt32LE(0x46546c67);head.writeUInt32LE(2,4);head.writeUInt32LE(28+paddedJson.length+bin.length,8);
jsonHead.writeUInt32LE(paddedJson.length);jsonHead.writeUInt32LE(0x4e4f534a,4);binHead.writeUInt32LE(bin.length);binHead.writeUInt32LE(0x004e4942,4);
const output=new URL('sources/quaternius-human-actions.glb',import.meta.url);await mkdir(new URL('sources/',import.meta.url),{recursive:true});await writeFile(output,Buffer.concat([head,jsonHead,paddedJson,binHead,bin]));
console.log(`Extracted ${names.join(', ')} (${head.readUInt32LE(8)} bytes)`);
