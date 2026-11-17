import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';

const publicRoot = new URL('./record-public/', import.meta.url);
const pages = new Set(['/', '/netanyahu/', '/trump/', '/putin/', '/timeline/', '/sources/']);
const assetTypes = {
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  png: 'image/png',
  txt: 'text/plain; charset=utf-8',
  webp: 'image/webp',
  woff2: 'font/woff2',
};

const server = createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }

    const { pathname, search } = new URL(request.url, 'http://localhost');
    if (pathname === '/health') {
      response.writeHead(200, { 'Content-Type': 'text/plain' }).end(
        request.method === 'HEAD' ? undefined : 'ok',
      );
      return;
    }
    if (!pathname.endsWith('/') && pages.has(pathname + '/')) {
      response.writeHead(308, { Location: pathname + '/' + search }).end();
      return;
    }

    const asset = /^\/record\/[a-z-]+\.(css|js|png|txt|webp|woff2)$/.exec(pathname);
    const page = pages.has(pathname) || pathname === '/index.html';
    if (!asset && !page) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }

    const file = new URL(pathname.slice(1) + (pages.has(pathname) ? 'index.html' : ''), publicRoot);
    const { size } = await stat(file);
    const headers = {
      'Content-Type': asset ? assetTypes[asset[1]] : 'text/html; charset=utf-8',
      'Content-Length': size,
      'Cache-Control': asset ? 'public, max-age=3600' : 'no-cache',
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
