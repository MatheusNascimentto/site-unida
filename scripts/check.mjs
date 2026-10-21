import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['index.html','solucoes/index.html','a-unida/index.html','contato/index.html','privacidade/index.html'];
const errors=[],titles=new Set(),descriptions=new Set();
for(const name of files){const html=await readFile(path.join(root,name),'utf8');
 const assert=(ok,reason)=>{if(!ok)errors.push(`${name}: ${reason}`);};
 assert((html.match(/<h1\b/g)||[]).length===1,'precisa de exatamente um h1');
 assert(html.includes('lang="pt-BR"'),'idioma ausente');assert(html.includes('name="viewport"'),'viewport ausente');
 const title=html.match(/<title>(.*?)<\/title>/)?.[1];assert(title&&!titles.has(title),'título ausente ou duplicado');titles.add(title);
 const description=html.match(/<meta name="description" content="([^"]*)"/)?.[1];assert(description&&!descriptions.has(description),'descrição ausente ou duplicada');descriptions.add(description);
 assert(/rel="canonical" href="https:\/\//.test(html),'canonical absoluto ausente');
 assert(html.includes('property="og:image"'),'imagem de compartilhamento ausente');
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{const data=JSON.parse(match[1]);assert(data['@graph']?.some(item=>item['@type']==='AccountingService'),'empresa estruturada ausente');assert(!JSON.stringify(data).includes('aggregateRating'),'não adicionar estrelas de avaliações próprias ao schema');}catch{assert(false,'JSON-LD inválido');}}
 for(const match of html.matchAll(/<img\b[^>]*>/g)){assert(/\balt="[^"]*"/.test(match[0]),'imagem sem alt');assert(/\bwidth="/.test(match[0])&&/\bheight="/.test(match[0]),'imagem sem dimensões');}
 for(const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){let url=match[1];if(url.startsWith('/api/'))continue;const file=url.endsWith('/')?url+'index.html':url;try{await access(path.join(root,file));}catch{errors.push(`${name}: caminho interno ausente ${url}`);}}
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert(new Set(ids).size===ids.length,'IDs duplicados');
}
for(const file of ['app.js','config.js']){try{new vm.Script(await readFile(path.join(root,file),'utf8'));}catch(error){errors.push(`${file}: ${error.message}`);}}
const cfg=JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));if(!/^https:\/\//.test(cfg.siteUrl))errors.push('siteUrl precisa de HTTPS');
const vercel=JSON.parse(await readFile(path.join(root,'vercel.json'),'utf8'));if(vercel.outputDirectory!=='dist')errors.push('outputDirectory incorreto');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('OK: cinco páginas, links locais, metadados, schema, imagens e sintaxe JS.');
