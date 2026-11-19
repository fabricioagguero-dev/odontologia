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

// Fotos: se cargan desde el panel (contenido/sitio.json → fotos).
// Si no hay nada cargado ahí, se usan las que estén en las carpetas:
//  · /public/img/jimena.webp            → reemplaza el logo en el retrato
//  · /public/img/consultorio/*.webp|jpg → galería "Así es el consultorio" en Sobre mí
const FOTO = D.fotos.retrato || (fs.existsSync(path.join(PUBLIC, 'img', 'jimena.webp')) ? '/img/jimena.webp' : '');
const DIR_CONS = path.join(PUBLIC, 'img', 'consultorio');
const FOTOS_CONSULTORIO = D.fotos.consultorio.length
  ? D.fotos.consultorio
  : fs.existsSync(DIR_CONS)
    ? fs
        .readdirSync(DIR_CONS)
        .filter((f) => /\.(webp|jpe?g|png|avif)$/i.test(f))
        .sort()
        .map((f) => ({ src: `/img/consultorio/${f}`, alt: `Consultorio odontológico de Jimena Teruel en ${N.direccion.localidad}` }))
    : [];

// Si el consultorio se muda a otra localidad, los textos fijos que nombran
// "Belén de Escobar" / "Escobar" se adaptan solos a la dirección nueva.
const ORIGEN = { localidad: 'Belén de Escobar', partido: 'Escobar' };
function localizar(txt) {
  const { localidad, partido } = N.direccion;
  if (localidad === ORIGEN.localidad && partido === ORIGEN.partido) return txt;
  return txt
    .split(ORIGEN.localidad)
    .map((t) => t.split(ORIGEN.partido).join(partido))
    .join(localidad);
}

// ---------- versionado de assets ----------
const hash = (f) => crypto.createHash('sha1').update(fs.readFileSync(path.join(PUBLIC, f))).digest('hex').slice(0, 8);
B.assets.css = hash('css/main.css');
B.assets.js = hash('js/main.js');
B.assets.adminCss = hash('css/admin.css');
B.assets.adminJs = hash('js/admin.js');

// ---------- minificado liviano y seguro ----------
const min = (html) =>
  html
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');

function escribir(rel, contenido) {
  const destino = path.join(PUBLIC, rel);
  if (/\.(html|txt|webmanifest)$/.test(rel) && !rel.startsWith('admin')) contenido = localizar(contenido);
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
  generadas.push(escribir(rel, min(fn({ foto: FOTO, fotosConsultorio: FOTOS_CONSULTORIO }))));
}
generadas.push(escribir('404.html', min(require('./paginas/404')())));
generadas.push(escribir('admin/index.html', min(require('./paginas/admin')())));

// ---------- version.json ----------
// El panel lo consulta para saber cuándo el sitio ya se actualizó con un cambio.
// "contenido" es el SHA de Git del archivo contenido/sitio.json (el mismo que devuelve GitHub).
const bytesContenido = fs.readFileSync(D.archivoContenido);
const shaContenido = crypto.createHash('sha1').update(`blob ${bytesContenido.length}\0`).update(bytesContenido).digest('hex');
generadas.push(escribir('version.json', JSON.stringify({ contenido: shaContenido, generado: new Date().toISOString() })));

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
Disallow: /admin/
Disallow: /api/

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

Formación: odontóloga de la ${N.formacion.universidad} (${N.formacion.universidadCorta}), especialista en Endodoncia (${N.formacion.universidadCorta}${N.formacion.anioEspecialidad ? ', ' + N.formacion.anioEspecialidad : ''}).
Tratamientos: ${D.tratamientos.map((t) => t.nombre.toLowerCase()).join(', ')} y urgencias odontológicas. Ortodoncia con ortodoncista que atiende en el consultorio.\nHorarios: ${N.horariosTexto}.${D.aviso.activo && D.aviso.texto ? `\nAviso: ${D.aviso.texto}` : ''}
${N.redes.instagram ? 'Instagram: ' + N.redes.instagram : ''}
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
