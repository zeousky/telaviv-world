import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.mp4':'video/mp4'};
const routes=new Map(['/index.html','/chaos.css','/chaos.js','/assets/corner-chaos.mp4','/assets/corner-poster.jpg','/assets/bibi-portrait.jpg','/assets/bibi-throwback.jpg'].map(path=>[path,fileURLToPath(new URL('.'+path,import.meta.url))]));
export const server=createServer(async(req,res)=>{
 try{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/health'){res.writeHead(200,{'Content-Type':'text/plain'}).end('ok');return;}
  const route=pathname==='/'?'/index.html':pathname;
  const file=routes.get(route);if(!file){res.writeHead(404).end('Not found');return;}
  const {size}=await stat(file),ext=route.slice(route.lastIndexOf('.'));
  const headers={'Content-Type':types[ext]||'application/octet-stream','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Cache-Control':route.startsWith('/assets/')?'public, max-age=3600':'no-cache'};
  let start=0,end=size-1,code=200;
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
   if(!match[1]){start=Math.max(0,size-Number(match[2]));}else{start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;}
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
   code=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length']=String(end-start+1);res.writeHead(code,headers);
  if(req.method==='HEAD'){res.end();return;}
  const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 }catch{if(!res.headersSent)res.writeHead(500).end('Unable to serve file');else res.destroy();}
});
server.listen(Number(process.env.PORT||8765),'0.0.0.0',()=>console.log(`Site ready on port ${server.address().port}`));
