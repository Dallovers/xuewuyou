import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require=createRequire(new URL('../../js/features/campus-hub/package.json',import.meta.url));
const {NodeIO,Logger}=require('@gltf-transform/core'),sharp=require('sharp');
const root=fileURLToPath(new URL('../../',import.meta.url));
const rows=JSON.parse(await readFile(path.join(root,'docs/characters/sources.json'),'utf8'));
const io=new NodeIO().registerExtensions(require('@gltf-transform/extensions').ALL_EXTENSIONS);const results=[],parseWarnings=[];const logger=new Logger();logger.warn=message=>parseWarnings.push(String(message));io.setLogger(logger);
for(const row of rows){
 parseWarnings.length=0;
 const file=path.join(root,row.modelPath),binary=await readFile(file);
 if(binary.toString('ascii',0,4)!=='glTF'||binary.readUInt32LE(4)!==2||binary.readUInt32LE(8)!==binary.length)throw Error('GLB header '+row.id);
 const json=JSON.parse(binary.toString('utf8',20,20+binary.readUInt32LE(12)));
 const doc=await io.read(file),r=doc.getRoot();
 let triangles=0,vertices=0,primitives=0;
 for(const mesh of r.listMeshes())for(const p of mesh.listPrimitives()){if(p.getMode()!==4)throw Error('Non-triangle '+row.id);primitives++;vertices+=p.getAttribute('POSITION').getCount();triangles+=(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3;}
 for(const a of r.listAccessors()){const arr=a.getArray();if(arr&&!arr.every(Number.isFinite))throw Error('Non-finite accessor '+row.id);}
 const textures=[];for(const t of r.listTextures()){const bytes=t.getImage();const m=await sharp(bytes).metadata();await sharp(bytes).raw().toBuffer();textures.push({name:t.getName(),uri:t.getURI()||'embedded GLB bufferView',mimeType:t.getMimeType(),bytes:bytes.byteLength,width:m.width,height:m.height,sha256:createHash('sha256').update(bytes).digest('hex')});}
 const files=[{path:row.modelPath,bytes:binary.length,sha256:createHash('sha256').update(binary).digest('hex')}];
 for(const x of [...(json.buffers||[]),...(json.images||[])])if(x.uri&&!x.uri.startsWith('data:')){const p=path.resolve(path.dirname(file),x.uri);if(!p.startsWith(path.dirname(file)+path.sep))throw Error('Unsafe dependency');const b=await readFile(p);files.push({path:path.relative(root,p).replaceAll('\\','/'),bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}
 for(const file of files){const expected=row.files.find(f=>f.path===file.path);if(!expected||expected.bytes!==file.bytes||expected.sha256!==file.sha256)throw Error('Manifest file integrity '+file.path);}
 if(files.length!==row.files.length)throw Error('Manifest dependency count '+row.id);
 const licenseFiles=row.licenseFiles||(row.licenseFile?[row.licenseFile]:[]);
 for(const expected of licenseFiles){const license=await readFile(path.join(root,expected.path));if(createHash('sha256').update(license).digest('hex')!==expected.sha256)throw Error('License integrity '+row.id);}
 const vrm=json.extensions?.VRM;
 if(row.format?.startsWith('VRM')){if(!vrm||vrm.meta.licenseName!=='CC0'||vrm.meta.allowedUserName!=='Everyone'||vrm.meta.commercialUssageName!=='Allow')throw Error('VRM embedded permission mismatch '+row.id);for(const bone of vrm.humanoid.humanBones)if(!json.nodes[bone.node])throw Error('VRM human bone missing '+row.id);}
 const result={id:row.id,parseWarnings:[...parseWarnings],status:'可解析',totalBytes:files.reduce((n,f)=>n+f.bytes,0),files,triangles,vertices,primitives,meshes:r.listMeshes().length,materialCount:r.listMaterials().length,materials:r.listMaterials().map(m=>({name:m.getName(),baseColorFactor:m.getBaseColorFactor(),baseColorTexture:m.getBaseColorTexture()?.getName()||null,doubleSided:m.getDoubleSided()})),textures,skins:r.listSkins().map(s=>({name:s.getName(),joints:s.listJoints().map(j=>j.getName())})),animations:json.animations?.map(a=>({name:a.name,channels:a.channels.length,targetNodes:[...new Set(a.channels.map(c=>json.nodes[c.target.node]?.name||String(c.target.node)))]}))||[],extensionsUsed:json.extensionsUsed||[],extensionsRequired:json.extensionsRequired||[],accessorsFinite:true,textureDecodeVerified:true,manifestIntegrityVerified:true,licenseIntegrityVerified:licenseFiles.length>0,vrmMetadataVerified:!!vrm,vrmHumanBoneCount:vrm?.humanoid.humanBones.length||0};
 results.push(result);console.log(row.id,triangles,'triangles',result.totalBytes,'bytes',textures.length,'textures',result.skins.length,'skins');
}
await mkdir(path.join(root,'docs/characters/validation'),{recursive:true});await writeFile(path.join(root,'docs/characters/validation/structure.json'),JSON.stringify({date:'2026-10-24',passed:true,tools:['@gltf-transform/core NodeIO 4.5.1','sharp 0.35.5'],note:'Not the Khronos glTF Validator; header, parse, finite accessors and full texture decode checks.',rows:results},null,2));
