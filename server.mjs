import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';

const publicRoot = new URL('./lunar/', import.meta.url);
const publicAssets = new Map([
  ['/survey.css', 'text/css; charset=utf-8'],
  ...['moon', 'apollo-11', 'apollo-12', 'apollo-14', 'apollo-15', 'apollo-16', 'apollo-17']
    .map((photo) => ['/plates/' + photo + '.jpg', 'image/jpeg']),
]);

const server = createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }

    const { pathname } = new URL(request.url, 'http://localhost');
    if (pathname === '/health') {
      response.writeHead(200, { 'Content-Type': 'text/plain' }).end(
        request.method === 'HEAD' ? undefined : 'ok',
      );
      return;
    }
    const assetType = publicAssets.get(pathname);
    const page = pathname === '/' || pathname === '/index.html';
    if (!assetType && !page) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }

    const file = new URL(page ? 'index.html' : pathname.slice(1), publicRoot);
    const { size } = await stat(file);
    const headers = {
      'Content-Type': assetType || 'text/html; charset=utf-8',
      'Content-Length': size,
      'Cache-Control': assetType ? 'public, max-age=3600' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    };
    if (page) {
      headers['Content-Security-Policy'] = "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'";
    }

    response.writeHead(200, headers);
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    const stream = createReadStream(file);
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch (error) {
    if (response.headersSent) {
      response.destroy();
      return;
    }
    const missing = error.code === 'ENOENT';
    response.writeHead(missing ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' })
      .end(missing ? 'Not found' : 'Unable to serve file');
  }
});

server.listen(Number(process.env.PORT || 8765), '0.0.0.0', () => {
  console.log('Site ready on port ' + server.address().port);
});
