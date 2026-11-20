// Tiny static server that mirrors GitHub Pages: the repo root is served at /portfolio/.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.txt': 'text/plain', '.xml': 'application/xml'
};

export function startServer(port = 4173) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (!p.startsWith('/portfolio')) { res.writeHead(404).end(); return; }
      p = p.slice('/portfolio'.length) || '/';
      let file = normalize(join(ROOT, p));
      if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
      let s = await stat(file).catch(() => null);
      if (s && s.isDirectory()) {
        if (!p.endsWith('/')) { res.writeHead(301, { Location: req.url.replace(/(\?|$)/, '/$1') }).end(); return; }
        file = join(file, 'index.html');
        s = await stat(file).catch(() => null);
      }
      if (!s) { res.writeHead(404).end('not found'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch (e) { res.writeHead(500).end(String(e)); }
  });
  return new Promise(r => server.listen(port, () => r(server)));
}

if (process.argv[1] && process.argv[1].endsWith('serve.mjs')) {
  const port = +(process.argv[2] || 4173);
  startServer(port).then(() => console.log(`Serving at http://localhost:${port}/portfolio/`));
}
