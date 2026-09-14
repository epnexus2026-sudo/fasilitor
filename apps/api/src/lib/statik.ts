/** Basit statik dosya sunumu (apps/web ve docs için). */
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const TURLER: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2',
};

export function statikSunucu(kok: string, onek = '/') {
  const kokMutlak = resolve(kok);

  return (istek: IncomingMessage, yanit: ServerResponse): boolean => {
    if (istek.method !== 'GET' && istek.method !== 'HEAD') return false;

    const url = new URL(istek.url ?? '/', 'http://localhost');
    if (!url.pathname.startsWith(onek)) return false;

    let gorece = decodeURIComponent(url.pathname.slice(onek.length)) || 'index.html';
    if (gorece.endsWith('/')) gorece += 'index.html';

    // Dizin dışına çıkış denemelerini engelle.
    const hedef = resolve(join(kokMutlak, normalize(gorece)));
    if (hedef !== kokMutlak && !hedef.startsWith(kokMutlak + sep)) {
      yanit.writeHead(403).end('Erişim reddedildi.');
      return true;
    }

    let bilgi;
    try {
      bilgi = statSync(hedef);
    } catch {
      return false;
    }
    if (bilgi.isDirectory()) return false;

    yanit.writeHead(200, {
      'content-type': TURLER[extname(hedef).toLowerCase()] ?? 'application/octet-stream',
      'content-length': bilgi.size,
      'cache-control': 'public, max-age=300',
      'x-content-type-options': 'nosniff',
    });
    if (istek.method === 'HEAD') {
      yanit.end();
      return true;
    }
    createReadStream(hedef).pipe(yanit);
    return true;
  };
}
