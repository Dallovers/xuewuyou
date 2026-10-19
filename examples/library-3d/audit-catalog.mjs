import vm from 'node:vm';
import {readFile,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),ctx=vm.createContext({});
for(const file of ['js/wenku.js','js/wenku_cat.js'])vm.runInContext(await readFile(path.join(root,file),'utf8'),ctx);
const files={};
for(const item of ctx.WG_WenkuCat.all())if(item.local&&!files[item.raw.link]){try{const p=path.resolve(root,item.raw.link);if(!p.startsWith(path.join(root,'data','pdf')+path.sep))throw Error('outside');const info=await stat(p);files[item.raw.link]={available:info.isFile(),bytes:info.size};}catch{files[item.raw.link]={available:false};}}
const result={generatedAt:new Date().toISOString(),source:'Existing js/wenku.js and js/wenku_cat.js, filesystem checks only; no demonstration entries.',totalEntries:ctx.WG_WenkuCat.all().length,localReferences:Object.keys(files).length,availableFiles:Object.values(files).filter(f=>f.available).length,files};
await writeFile(new URL('./assets/catalog-availability.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({entries:result.totalEntries,localReferences:result.localReferences,available:result.availableFiles}));
