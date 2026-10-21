import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));
const url=new URL(config.siteUrl);if(url.protocol!=='https:')throw new Error('siteUrl deve usar HTTPS.');
const production=process.env.VERCEL_ENV==='production'||(!process.env.VERCEL_ENV&&process.env.NODE_ENV==='production');
const indexable=production&&config.indexable===true;
const publicRoot=path.join(root,'dist');await mkdir(publicRoot,{recursive:true});
const pages=['index.html','solucoes/index.html','a-unida/index.html','contato/index.html','privacidade/index.html','404.html'];
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const file of pages){let html=await readFile(path.join(root,file),'utf8');
 html=html.replace(/<meta name="robots" content="[^"]*">/g,`<meta name="robots" content="${indexable&&file!=='404.html'?'index,follow,max-image-preview:large':'noindex,follow'}">`);
 // Replace the configured production origin in generated head data, never the verified content links.
 html=html.replace(/<head>[\s\S]*?<\/head>/,head=>head.replace(/https:\/\/unidasolucoes\.com\.br/g,url.origin));
 html=html.replace(/<meta name="google-site-verification" content="[^"]*">/g,'');
 if(config.searchConsoleVerification)html=html.replace('</head>',`<meta name="google-site-verification" content="${escape(config.searchConsoleVerification)}"></head>`);
 if(!config.showPrototypeNotice)html=html.replace(/<div class="prototype-bar">[\s\S]*?<\/div>/,'');
 const destination=path.join(publicRoot,file);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,html);
}
for(const file of ['styles.css','app.js'])await cp(path.join(root,file),path.join(publicRoot,file));
await cp(path.join(root,'assets'),path.join(publicRoot,'assets'),{recursive:true});
const ga=production?config.ga4MeasurementId:'';if(ga&&!/^G-[A-Z0-9]+$/.test(ga))throw new Error('Identificador GA4 inválido.');
await writeFile(path.join(publicRoot,'config.js'),'// Configuração pública: não contém credenciais.\nwindow.UNIDA_CONFIG = Object.freeze('+JSON.stringify({ga4MeasurementId:ga||'',socialEndpoint:typeof config.socialEndpoint==='string'?config.socialEndpoint:''})+');\n');
await writeFile(path.join(publicRoot,'robots.txt'),`User-agent: *\n${indexable?'Allow: /':'Disallow: /'}\nSitemap: ${url.origin}/sitemap.xml\n`);
await writeFile(path.join(publicRoot,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','solucoes/','a-unida/','contato/'].map(p=>`<url><loc>${url.origin}/${p}</loc></url>`).join('')}</urlset>\n`);
console.log(`Build estático em dist/. Indexação: ${indexable?'liberada':'desativada (prévia)'}. Analytics: ${ga?'configurado, sujeito ao consentimento':'desativado'}.`);
