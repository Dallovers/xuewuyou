import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),require=createRequire(new URL('js/features/campus-hub/package.json',root)),sharp=require('sharp');
const sources=JSON.parse(await readFile(new URL('docs/characters/sources.json',root),'utf8'));
const reports=[];
for(const source of sources.filter(s=>s.id.startsWith('vroid-'))){
 const input=await readFile(new URL(source.modelPath,root));
 const jsonLength=input.readUInt32LE(12),doc=JSON.parse(input.subarray(20,20+jsonLength).toString()),bin=input.subarray(28+jsonLength);
 const replacements=new Map();let pixelsBefore=0,pixelsAfter=0;
 for(const image of doc.images||[]){
  if(image.bufferView===undefined)throw Error('Expected embedded images');
  const view=doc.bufferViews[image.bufferView],raw=bin.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength),meta=await sharp(raw).metadata();
  pixelsBefore+=meta.width*meta.height;
  const cap=/face|eye/i.test(image.name||'')?1024:512;
  const {data,info}=await sharp(raw).resize({width:cap,height:cap,fit:'inside',withoutEnlargement:true}).webp({quality:88,alphaQuality:100}).toBuffer({resolveWithObject:true});
  pixelsAfter+=info.width*info.height;replacements.set(image.bufferView,data);image.mimeType='image/webp';
 }
 for(const accessor of doc.accessors||[])if(replacements.has(accessor.bufferView))throw Error('Image aliases vertex data');
 let offset=0;const chunks=[];
 for(let i=0;i<doc.bufferViews.length;i++){
  const view=doc.bufferViews[i],raw=replacements.get(i)||bin.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
  view.byteOffset=offset;view.byteLength=raw.length;view.buffer=0;chunks.push(raw);offset+=raw.length;
  const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}
 }
 doc.buffers=[{byteLength:offset}];
 for(const texture of doc.textures||[]){texture.extensions={...texture.extensions,EXT_texture_webp:{source:texture.source}};delete texture.source;}
 doc.extensionsUsed=[...new Set([...(doc.extensionsUsed||[]),'EXT_texture_webp'])];doc.extensionsRequired=[...new Set([...(doc.extensionsRequired||[]),'EXT_texture_webp'])];
 const json=Buffer.from(JSON.stringify(doc)),padded=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]),binary=Buffer.concat(chunks),out=Buffer.alloc(28+padded.length+binary.length);
 out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(padded.length,12);out.writeUInt32LE(0x4e4f534a,16);padded.copy(out,20);out.writeUInt32LE(binary.length,20+padded.length);out.writeUInt32LE(0x004e4942,24+padded.length);binary.copy(out,28+padded.length);
 const output=source.modelPath.replace(/model\.vrm$/,'runtime.vrm');await writeFile(new URL(output,root),out);
 reports.push({id:source.id,input:source.modelPath,inputSha256:createHash('sha256').update(input).digest('hex'),output,outputSha256:createHash('sha256').update(out).digest('hex'),originalBytes:input.length,runtimeBytes:out.length,pixelsBefore,pixelsAfter});
 console.log(source.id,Math.round(input.length/1024)+' KB -> '+Math.round(out.length/1024)+' KB');
}
await writeFile(new URL('docs/characters/runtime-optimization.json',root),JSON.stringify(reports,null,2)+'\n');
