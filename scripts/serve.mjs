import http from 'node:http';
import {stat,readFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.replace(/\/$/,'')==='/api/social'){res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({status:'unconfigured',items:[]}));}
  let route=decodeURIComponent(url.pathname);if(route.endsWith('/'))route+='index.html';
  let file=path.resolve(root,'.'+route);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(route.includes('/.')||/^\/(scripts|docs|api|dist)\//.test(route)||['/site.config.json','/package.json','/package-lock.json','/vercel.json'].includes(url.pathname)){res.writeHead(404);return res.end();}
  let info;try{info=await stat(file);if(info.isDirectory()){res.writeHead(308,{Location:url.pathname+'/'+url.search});return res.end();}}catch{file=path.join(root,'404.html');info=await stat(file);res.statusCode=404;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(path.extname(file)==='.mp4'&&req.headers.range){
   const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416);return res.end();}
   const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),info.size-1):info.size-1;
   if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
   res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${info.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});if(req.method==='HEAD')return res.end();return createReadStream(file,{start,end}).pipe(res);
  }
  res.setHeader('Content-Length',info.size);if(req.method==='HEAD')return res.end();createReadStream(file).pipe(res);
 }catch{res.writeHead(500);res.end('Não foi possível abrir a página.');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
