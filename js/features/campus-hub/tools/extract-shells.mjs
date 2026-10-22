// Keep the original authored shell geometry; compact all referenced GLB buffers.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../../../',import.meta.url),report=[];
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const [id,file,groups] of [
 ['academy','examples/campus-3d-v5/course_academy_v5.glb',['Floors and foundations','South teaching facade','East west and north facades','Independent roof and drainage','Upper storey visible interior structure']],
 ['library','examples/library-3d/assets/wenku-library.glb',['Structure stone and real window openings','Roof editable zinc and clerestory']]
]){
 const bytes=await readFile(new URL(file,root)),length=bytes.readUInt32LE(12),source=JSON.parse(bytes.subarray(20,20+length)),binary=bytes.subarray(28+length);
 const out={asset:{version:'2.0',generator:'Xuewuyou authored exterior extraction'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],textures:[],samplers:[],images:[],accessors:[],bufferViews:[],buffers:[]};
 if(source.extensionsUsed)out.extensionsUsed=source.extensionsUsed.filter(e=>e!=='KHR_lights_punctual');
 const maps={},chunks=[];let offset=0;
 function map(kind,index,fn){const cache=maps[kind]??=new Map();if(cache.has(index))return cache.get(index);const dest=out[kind].length;cache.set(index,dest);out[kind].push(null);out[kind][dest]=fn(structuredClone(source[kind][index]));return dest;}
 function view(index){return map('bufferViews',index,v=>{const b=binary.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);const start=offset;chunks.push(b);offset+=b.length;const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}return{...v,buffer:0,byteOffset:start};});}
 function accessor(index){return map('accessors',index,a=>{if(a.sparse)throw Error('Sparse architectural accessor');if(a.bufferView!==undefined)a.bufferView=view(a.bufferView);return a;});}
 function texture(index){return map('textures',index,t=>{if(t.sampler!==undefined)t.sampler=map('samplers',t.sampler,s=>s);t.source=map('images',t.source,i=>{if(i.bufferView!==undefined)i.bufferView=view(i.bufferView);return i;});return t;});}
 function material(index){return map('materials',index,m=>{function walk(o){for(const [k,v]of Object.entries(o)){if(v&&typeof v==='object'){if(k.endsWith('Texture')&&v.index!==undefined)v.index=texture(v.index);else walk(v);}}}walk(m);return m;});}
 function mesh(index){return map('meshes',index,m=>{for(const p of m.primitives){for(const k of Object.keys(p.attributes))p.attributes[k]=accessor(p.attributes[k]);if(p.indices!==undefined)p.indices=accessor(p.indices);if(p.material!==undefined)p.material=material(p.material);if(p.targets)throw Error('Unexpected morph shell');}return m;});}
 function node(index){return map('nodes',index,n=>{if(n.mesh!==undefined)n.mesh=mesh(n.mesh);if(n.children)n.children=n.children.map(node);delete n.extensions;delete n.skin;return n;});}
 const originalRoot=source.nodes[source.scenes[source.scene||0].nodes[0]],kept=originalRoot.children.filter(i=>groups.includes(source.nodes[i].name));
 if(kept.length!==groups.length)throw Error('Missing original shell group');
 const children=kept.map(node),rootNode=out.nodes.length;out.nodes.push({...originalRoot,children});out.scenes[0].nodes=[rootNode];out.buffers=[{byteLength:offset}];
 for(const k of ['samplers','textures','images','materials'])if(!out[k].length)delete out[k];
 const raw=Buffer.from(JSON.stringify(out)),json=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]),bin=Buffer.concat(chunks),header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
 header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
 const output=Buffer.concat([header,jh,json,bh,bin]);await writeFile(new URL('../assets/'+id+'-shell.glb',import.meta.url),output);
 report.push({id,source:file,sourceHash:hash(bytes),groups,bytes:output.length,sha256:hash(output)});console.log(id,output.length,'bytes');
}
await writeFile(new URL('../assets/shell-sources.json',import.meta.url),JSON.stringify(report,null,2));
