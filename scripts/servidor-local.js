#!/usr/bin/env node
/**
 * servidor-local.js — Vista previa local, igual que en Vercel
 * (URLs limpias, 404 propio y compresión gzip).
 *   npm run dev   →  http://localhost:3000
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const RAIZ = path.join(__dirname, '..', 'public');
const PUERTO = Number(process.env.PORT) || 3000;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};
const COMPRIMIBLE = /\.(html|css|js|json|svg|xml|txt|webmanifest)$/;

// Aplica las mismas cabeceras (CSP, caché, seguridad) que define vercel.json
const VERCEL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
const REGLAS = (VERCEL.headers || []).map((h) => ({
  re: new RegExp('^' + h.source.replace(/\(\.\*\)/g, '.*') + '$'),
  headers: h.headers,
}));
const REDIRECCIONES = VERCEL.redirects || [];

function resolver(url) {
  const limpio = decodeURIComponent(url.split('?')[0]);
  let archivo = path.normalize(path.join(RAIZ, limpio));
  if (!archivo.startsWith(RAIZ)) return null;
  if (fs.existsSync(archivo) && fs.statSync(archivo).isDirectory()) archivo = path.join(archivo, 'index.html');
  return fs.existsSync(archivo) ? archivo : null;
}

http
  .createServer((req, res) => {
    const ruta = req.url.split('?')[0];
    const red = REDIRECCIONES.find((r) => r.source === ruta || r.source + '/' === ruta);
    if (red) {
      res.writeHead(308, { Location: red.destination });
      return res.end();
    }
    // Igual que trailingSlash: true en Vercel
    if (!/\.[a-z0-9]+$/i.test(req.url.split('?')[0]) && !req.url.split('?')[0].endsWith('/')) {
      res.writeHead(308, { Location: req.url.replace(/(\?|$)/, '/$1') });
      return res.end();
    }
    let archivo = resolver(req.url);
    let estado = 200;
    if (!archivo) {
      archivo = path.join(RAIZ, '404.html');
      estado = 404;
    }
    const ext = path.extname(archivo);
    const cabeceras = { 'Content-Type': TIPOS[ext] || 'application/octet-stream' };
    REGLAS.forEach((r) => {
      if (r.re.test(ruta)) r.headers.forEach((h) => { if (h.key !== 'Strict-Transport-Security') cabeceras[h.key] = h.value; });
    });
    // upgrade-insecure-requests rompería http://localhost
    if (cabeceras['Content-Security-Policy']) cabeceras['Content-Security-Policy'] = cabeceras['Content-Security-Policy'].replace('; upgrade-insecure-requests', '');
    let cuerpo = fs.readFileSync(archivo);
    if (COMPRIMIBLE.test(archivo) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      cuerpo = zlib.gzipSync(cuerpo);
      cabeceras['Content-Encoding'] = 'gzip';
    }
    res.writeHead(estado, cabeceras);
    res.end(cuerpo);
  })
  .listen(PUERTO, () => console.log(`Vista previa en http://localhost:${PUERTO}`));
