import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(root, 'dist');
const port = Number.parseInt(process.env.PORT ?? '3000', 10) || 3000;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const safeDistPath = (requestPath) => {
  const decodedPath = decodeURIComponent(requestPath.split('?')[0]);
  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const candidate = normalize(join(distDir, relativePath));
  return candidate === distDir || candidate.startsWith(`${distDir}${sep}`) ? candidate : null;
};

const sendFile = async (response, pathname, { fallback = false } = {}) => {
  const filePath = safeDistPath(pathname);
  if (!filePath) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) throw new Error('Not a file');
    const extension = extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      'Content-Type': contentTypes[extension] ?? 'application/octet-stream',
    });
    response.end(await readFile(filePath));
  } catch {
    if (fallback) {
      await sendFile(response, '/index.html');
      return;
    }
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
};

const server = createServer(async (request, response) => {
  const pathname = request.url ?? '/';

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  if (pathname.split('?')[0] === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ ok: true, service: 'quizblitz' }));
    return;
  }

  if (request.method === 'HEAD') {
    response.writeHead(200);
    response.end();
    return;
  }

  await sendFile(response, pathname, { fallback: !extname(pathname.split('?')[0]) });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`QuizBlitz production server listening on port ${port}`);
});
