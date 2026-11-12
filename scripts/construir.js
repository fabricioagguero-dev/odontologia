#!/usr/bin/env node
/**
 * construir.js — Genera el sitio estático en /public.
 *   node scripts/construir.js        (o: npm run build)
 *
 * Genera: páginas HTML (una carpeta por ruta → URLs limpias), sitemap.xml,
 * robots.txt, site.webmanifest y llms.txt. Los CSS/JS se versionan con hash
 * para poder cachearlos un año sin problemas.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.join(__dirname, '..');
const PUBLIC = path.join(RAIZ, 'public');

const B = require('./plantillas/base');
const { D, S, N, abs } = B;

// Cambiá a true cuando subas /public/img/jimena.webp
const FOTO = fs.existsSync(path.join(PUBLIC, 'img', 'jimena.webp'));

// ---------- versionado de assets ----------
const hash = (f) => crypto.createHash('sha1').update(fs.readFileSync(path.join(PUBLIC, f))).digest('hex').slice(0, 8);
B.assets.css = hash('css/main.css');
B.assets.js = hash('js/main.js');

// ---------- minificado liviano y seguro ----------
const min = (html) =>
  html
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');

function escribir(rel, contenido) {
  const destino = path.join(PUBLIC, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, contenido);
  return rel;
}

// ---------- páginas ----------
const PAGINAS = {
  inicio: require('./paginas/inicio'),
  endodoncia: require('./paginas/endodoncia'),
  'odontologia-general': require('./paginas/odontologia-general'),
  ortodoncia: require('./paginas/ortodoncia'),
  urgencias: require('./paginas/urgencias'),
  'sobre-mi': require('./paginas/sobre-mi'),
  'preguntas-frecuentes': require('./paginas/preguntas-frecuentes'),
  contacto: require('./paginas/contacto'),
};

const generadas = [];
for (const [id, fn] of Object.entries(PAGINAS)) {
  const ruta = D.paginas[id].ruta;
  const rel = ruta === '/' ? 'index.html' : path.join(ruta.replace(/^\/|\/$/g, ''), 'index.html');
  generadas.push(escribir(rel, min(fn({ foto: FOTO }))));
}
generadas.push(escribir('404.html', min(require('./paginas/404')())));

// ---------- sitemap.xml ----------
const hoy = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${Object.keys(PAGINAS)
  .map((id) => {
    const p = D.paginas[id];
    return `  <url>
    <loc>${abs(p.ruta)}</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>${p.frecuencia}</changefreq>
    <priority>${p.prioridad}</priority>${id === 'inicio' ? `
    <image:image><image:loc>${abs('/og-image.png')}</image:loc></image:image>` : ''}
  </url>`;
  })
  .join('\n')}
</urlset>
`;
generadas.push(escribir('sitemap.xml', sitemap));

// ---------- robots.txt ----------
generadas.push(
  escribir(
    'robots.txt',
    `User-agent: *
Allow: /

Sitemap: ${abs('/sitemap.xml')}
`
  )
);

// ---------- site.webmanifest ----------
generadas.push(
  escribir(
    'site.webmanifest',
    JSON.stringify(
      {
        name: 'Jimena Teruel, Odontóloga en Escobar',
        short_name: 'Jimena Teruel',
        description: D.paginas.inicio.descripcion,
        lang: S.idioma,
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: S.colorTema,
        theme_color: S.colorTema,
        icons: [
          { src: '/img/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/img/logo-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/img/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      null,
      2
    )
  )
);

// ---------- llms.txt (resumen para buscadores con IA) ----------
generadas.push(
  escribir(
    'llms.txt',
    `# ${N.nombre}

> ${N.titulo} ${N.profesional}, ${N.especialidad.toLowerCase()} (${N.matricula}). Consultorio odontológico en ${N.direccion.calle}, ${N.direccion.detalle.toLowerCase()}, ${N.direccion.localidad}, provincia de ${N.direccion.provincia}, Argentina. Turnos por WhatsApp.

Tratamientos: endodoncia (tratamiento de conducto y retratamiento), odontología general (controles, limpieza, arreglos de caries, extracciones), ortodoncia con ortodoncista que atiende en el consultorio y urgencias odontológicas.
Zonas: ${N.zonas.join(', ')}.

## Páginas
${Object.keys(PAGINAS)
  .map((id) => `- [${D.paginas[id].migas}](${abs(D.paginas[id].ruta)}): ${D.paginas[id].descripcion}`)
  .join('\n')}
`
  )
);

console.log(`✔ Sitio generado en /public (${generadas.length} archivos)`);
generadas.forEach((g) => console.log('  ·', g));
