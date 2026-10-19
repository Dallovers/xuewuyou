import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
const {build}=process.env.LIBRARY_NODE_MODULES ? createRequire(path.join(process.env.LIBRARY_NODE_MODULES,'../package.json'))('esbuild') : require('esbuild');
await build({absWorkingDir:root,entryPoints:['src/app.js'],bundle:true,minify:true,outfile:'app.bundle.js',format:'esm',target:'es2022',legalComments:'eof',nodePaths:process.env.LIBRARY_NODE_MODULES?[process.env.LIBRARY_NODE_MODULES]:[]});
console.log('Library built (Three.js 0.170.0)');
