/**
 * base.js — Layout común: <head> con SEO completo, cabecera, pie y JSON-LD.
 */
const D = require('../datos');
const { emblema, UI } = require('./svg');

const S = D.sitio;
const N = D.negocio;
const AÑO = new Date().getFullYear();

// ---------- utilidades ----------
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const abs = (ruta = '/') => S.url + ruta;

const wa = (texto = 'Hola Jimena, quisiera pedir un turno.') =>
  `https://wa.me/${N.whatsapp}?text=${encodeURIComponent(texto)}`;

const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(N.mapsQuery)}`;
const mapsComoLlegar = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(N.mapsQuery)}`;
const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(N.mapsQuery)}&output=embed`;

const direccionCorta = `${N.direccion.calle}, ${N.direccion.localidad}`;
const telefonoTxt = N.telefonoVisible || 'WhatsApp';

// Versionado de assets (lo completa construir.js con un hash del contenido)
const assets = { css: '1', js: '1' };

// ---------- JSON-LD ----------
const ID = {
  consultorio: abs('/#consultorio'),
  persona: abs('/#jimena-teruel'),
  web: abs('/#sitio'),
  logo: abs('/#logo'),
};

function sameAs() {
  return Object.values(N.redes).filter(Boolean);
}

function horariosSchema() {
  return N.horarios.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.dias.map((d) => `https://schema.org/${d}`),
    opens: h.abre,
    closes: h.cierra,
  }));
}

function nodosBase() {
  const consultorio = {
    '@type': ['Dentist', 'MedicalClinic'],
    '@id': ID.consultorio,
    name: N.nombre,
    alternateName: `${N.titulo} ${N.profesional}`,
    description:
      'Consultorio odontológico en Belén de Escobar. Endodoncia, prótesis fija y removible, implantes, limpiezas, operatoria dental, postes de fibra de vidrio, blanqueamientos y ortodoncia.',
    url: abs('/'),
    logo: { '@type': 'ImageObject', '@id': ID.logo, url: abs('/img/logo-512.png'), width: 512, height: 512 },
    image: abs('/og-image.png'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${N.direccion.calle}, ${N.direccion.detalle}`,
      addressLocality: N.direccion.localidad,
      addressRegion: N.direccion.provincia,
      postalCode: N.direccion.cp,
      addressCountry: N.direccion.pais,
    },
    hasMap: N.redes.googleMaps || mapsLink,
    ...(N.geo ? { geo: { '@type': 'GeoCoordinates', latitude: N.geo.lat, longitude: N.geo.lng } } : {}),
    areaServed: N.zonas.map((z) => ({ '@type': 'City', name: z })),
    medicalSpecialty: 'https://schema.org/Dentistry',
    isAcceptingNewPatients: true,
    founder: { '@id': ID.persona },
    employee: { '@id': ID.persona },
    availableService: { '@id': abs('/endodoncia/#procedimiento') },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tratamientos odontológicos',
      itemListElement: [
        ['Endodoncia (tratamiento de conducto)', '/endodoncia/'],
        ['Retratamiento de conducto', '/endodoncia/#retratamiento'],
        ['Prótesis fija y removible', '/odontologia-general/#protesis'],
        ['Limpiezas dentales', '/odontologia-general/#limpiezas'],
        ['Implantología oral', '/odontologia-general/#implantes'],
        ['Operatoria dental', '/odontologia-general/#operatoria'],
        ['Postes de fibra de vidrio', '/odontologia-general/#postes'],
        ['Blanqueamientos dentales', '/odontologia-general/#blanqueamientos'],
        ['Ortodoncia', '/ortodoncia/'],
        ['Urgencias odontológicas', '/urgencias/'],
      ].map(([name, ruta]) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name, url: abs(ruta), areaServed: N.direccion.partido },
      })),
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Turnos',
      url: wa(),
      availableLanguage: 'es',
      ...(N.telefonoVisible ? { telephone: `+${N.whatsapp}` } : {}),
    },
  };
  if (N.telefonoVisible) consultorio.telephone = `+${N.whatsapp}`;
  if (N.email) consultorio.email = N.email;
  if (N.horarios.length) consultorio.openingHoursSpecification = horariosSchema();
  if (sameAs().length) consultorio.sameAs = sameAs();

  const persona = {
    '@type': 'Person',
    '@id': ID.persona,
    name: N.profesional,
    jobTitle: `${N.titulo}, ${N.especialidad}`,
    honorificPrefix: 'Od.',
    knowsAbout: ['Endodoncia', 'Tratamiento de conducto', 'Retratamiento endodóntico', 'Prótesis dental', 'Implantología oral', 'Blanqueamiento dental', 'Odontología general'],
    alumniOf: { '@type': 'CollegeOrUniversity', name: N.formacion.universidad, sameAs: 'https://www.uba.ar' },
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Matrícula profesional',
        name: `Matrícula Provincial ${N.matriculaNumero}`,
        recognizedBy: { '@type': 'Organization', name: 'Provincia de Buenos Aires' },
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Especialización',
        name: 'Especialista en Endodoncia',
        recognizedBy: { '@type': 'CollegeOrUniversity', name: N.formacion.universidad },
        ...(N.formacion.anioEspecialidad ? { dateCreated: N.formacion.anioEspecialidad } : {}),
      },
    ],
    worksFor: { '@id': ID.consultorio },
    workLocation: { '@id': ID.consultorio },
    url: abs('/sobre-mi/'),
  };

  const web = {
    '@type': 'WebSite',
    '@id': ID.web,
    url: abs('/'),
    name: S.nombre,
    inLanguage: S.idioma,
    publisher: { '@id': ID.consultorio },
  };

  return [consultorio, persona, web];
}

function migasSchema(id) {
  const p = D.paginas[id];
  const items = [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: abs('/') }];
  if (id !== 'inicio') items.push({ '@type': 'ListItem', position: 2, name: p.migas, item: abs(p.ruta) });
  return { '@type': 'BreadcrumbList', '@id': abs(p.ruta) + '#migas', itemListElement: items };
}

function paginaSchema(id, { tipo = 'WebPage', about, extra = {} } = {}) {
  const p = D.paginas[id];
  return {
    '@type': tipo,
    '@id': abs(p.ruta) + '#pagina',
    url: abs(p.ruta),
    name: p.titulo,
    description: p.descripcion,
    inLanguage: S.idioma,
    isPartOf: { '@id': ID.web },
    breadcrumb: { '@id': abs(p.ruta) + '#migas' },
    primaryImageOfPage: { '@type': 'ImageObject', url: abs('/og-image.png') },
    about: about || { '@id': ID.consultorio },
    ...(tipo === 'MedicalWebPage' ? { lastReviewed: new Date().toISOString().slice(0, 10), reviewedBy: { '@id': ID.persona } } : {}),
    ...extra,
  };
}

function faqSchema(id, lista) {
  return {
    '@type': 'FAQPage',
    '@id': abs(D.paginas[id].ruta) + '#faq',
    mainEntity: lista.map((f) => ({
      '@type': 'Question',
      name: f.p,
      acceptedAnswer: { '@type': 'Answer', text: f.r },
    })),
  };
}

function jsonld(nodos) {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': nodos }).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

// ---------- <head> ----------
function head(id, { schema = [], indexar = true, precargarHero = false } = {}) {
  const precarga = precargarHero
    ? `<link rel="preload" href="/img/logo/emblema-estructura.webp" as="image" type="image/webp" fetchpriority="high">
<link rel="preload" href="/img/logo/emblema-flor.webp" as="image" type="image/webp">`
    : '';
  const p = D.paginas[id] || { ruta: '/404.html', titulo: 'Página no encontrada | Jimena Teruel', descripcion: '', keywords: [] };
  const url = abs(p.ruta);
  const og = abs('/og-image.png');
  return `<!doctype html>
<html lang="${S.idioma}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.titulo)}</title>
${p.descripcion ? `<meta name="description" content="${esc(p.descripcion)}">` : ''}
${p.keywords.length ? `<meta name="keywords" content="${esc(p.keywords.join(', '))}">` : ''}
<meta name="robots" content="${indexar ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, follow'}">
<meta name="author" content="${esc(N.profesional)}">
${indexar ? `<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="es-AR" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">` : ''}
<meta name="geo.region" content="${N.direccion.region}">
<meta name="geo.placename" content="${esc(N.direccion.localidad)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${S.locale}">
<meta property="og:site_name" content="${esc(S.nombre)}">
<meta property="og:title" content="${esc(p.titulo)}">
<meta property="og:description" content="${esc(p.descripcion)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Jimena Teruel, odontóloga en Escobar, especialista en Endodoncia">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.titulo)}">
<meta name="twitter:description" content="${esc(p.descripcion)}">
<meta name="twitter:image" content="${og}">
<meta name="theme-color" content="${S.colorTema}">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/marcellus.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/figtree-var.woff2" as="font" type="font/woff2" crossorigin>
${precarga}
<link rel="stylesheet" href="/css/main.css?v=${assets.css}">
<script src="/js/main.js?v=${assets.js}" defer></script>
${schema.length ? jsonld(schema) : ''}
</head>`;
}

// ---------- cabecera ----------
function cabecera(activa) {
  const links = D.nav
    .map((n) => {
      const r = D.paginas[n.id].ruta;
      const cur = n.id === activa ? ' aria-current="page"' : '';
      return `<li><a href="${r}"${cur}>${n.texto}</a></li>`;
    })
    .join('');
  return `<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cabecera" data-cabecera>
  <div class="cabecera__in">
    <a class="marca" href="/">
      ${emblema({ clase: 'marca__emblema' })}
      <span class="marca__txt"><span class="marca__pre">Odontóloga</span><span class="marca__nombre">Jimena Teruel</span></span>
    </a>
    <nav class="nav" aria-label="Principal"><ul>${links}</ul></nav>
    <a class="btn btn--primario btn--chico cabecera__cta" href="/contacto/"${activa === 'contacto' ? ' aria-current="page"' : ''}>Pedir turno</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu-movil" data-menu-btn>
      <span class="menu-btn__abrir">${UI.menu}</span><span class="menu-btn__cerrar">${UI.cerrar}</span><span class="sr">Menú</span>
    </button>
  </div>
</header>
  <div class="menu-movil" id="menu-movil" data-menu>
  <nav aria-label="Menú móvil"><ul>
    <li><a href="/"${activa === 'inicio' ? ' aria-current="page"' : ''}>Inicio</a></li>
    ${links}
    <li><a href="/contacto/"${activa === 'contacto' ? ' aria-current="page"' : ''}>Contacto</a></li>
  </ul></nav>
  <a class="btn btn--wa" href="${wa()}" target="_blank" rel="noopener">${UI.whatsapp}Pedir turno por WhatsApp</a>
  ${N.redes.instagram ? `<a class="menu-movil__ig" href="${N.redes.instagram}" target="_blank" rel="noopener">${UI.instagram}${esc(N.instagramUsuario)}</a>` : ''}
  <p class="menu-movil__dir">${UI.pin}${esc(N.direccion.calle)}, ${esc(N.direccion.detalle.toLowerCase())}. ${esc(N.direccion.localidad)}</p>
</div>
`;
}

// ---------- migas visibles ----------
function migas(id) {
  const p = D.paginas[id];
  return `<nav class="migas" aria-label="Ruta de navegación"><ol><li><a href="/">Inicio</a></li><li aria-current="page">${p.migas}</li></ol></nav>`;
}

// ---------- pie ----------
function pie() {
  const firma = S.creditos.url
    ? `<a href="${S.creditos.url}" target="_blank" rel="noopener">${S.creditos.texto}</a>`
    : S.creditos.texto;
  return `<footer class="pie">
  <div class="contenedor pie__in">
    <div class="pie__marca">
      ${emblema({ clase: 'pie__emblema' })}
      <p class="pie__pre">Odontóloga</p>
      <p class="pie__nombre">Jimena Teruel</p>
      <p>Especialista en Endodoncia (UBA)<br>Matrícula Provincial ${N.matriculaNumero}</p>
    </div>
    <nav class="pie__col" aria-label="Tratamientos">
      <p class="pie__tit">Tratamientos</p>
      <ul>
        <li><a href="/endodoncia/">Endodoncia en Escobar</a></li>
        <li><a href="/odontologia-general/">Odontología general</a></li>
        <li><a href="/ortodoncia/">Ortodoncia</a></li>
        <li><a href="/urgencias/">Urgencias odontológicas</a></li>
      </ul>
    </nav>
    <nav class="pie__col" aria-label="Consultorio">
      <p class="pie__tit">Consultorio</p>
      <ul>
        <li><a href="/sobre-mi/">Sobre mí</a></li>
        <li><a href="/preguntas-frecuentes/">Preguntas frecuentes</a></li>
        <li><a href="/contacto/">Turnos y contacto</a></li>
      </ul>
    </nav>
    <div class="pie__col">
      <p class="pie__tit">Dónde estamos</p>
      <address>
        ${esc(N.direccion.calle)}<br>${esc(N.direccion.detalle)}<br>${esc(N.direccion.localidad)}, ${esc(N.direccion.provincia)}
      </address>
      <p><a href="${mapsComoLlegar}" target="_blank" rel="noopener">Cómo llegar</a></p>
      <p><a class="pie__wa" href="${wa()}" target="_blank" rel="noopener">${UI.whatsapp}${esc(telefonoTxt)}</a></p>
      ${N.redes.instagram ? `<p><a class="pie__ig" href="${N.redes.instagram}" target="_blank" rel="noopener">${UI.instagram}${esc(N.instagramUsuario)}</a></p>` : ''}
    </div>
  </div>
  <div class="contenedor pie__base">
    <p>© ${AÑO} ${esc(N.nombre)}. La información de este sitio es orientativa y no reemplaza la consulta profesional.</p>
    <p class="pie__firma"><!-- firma-nexora -->${firma}</p>
  </div>
</footer>
<a class="wa-flotante" href="${wa()}" target="_blank" rel="noopener" aria-label="Pedir turno por WhatsApp" data-wa-flotante>${UI.whatsapp}<span>Pedir turno</span></a>`;
}

// ---------- bloque CTA final reutilizable ----------
function ctaFinal({ titulo = '¿Hace mucho que no te hacés un control, o algo te está molestando?', texto = 'Escribinos por WhatsApp contando qué te pasa. Te respondemos con los turnos disponibles.', mensaje } = {}) {
  return `<section class="cta-final" aria-labelledby="cta-final-t">
  <div class="contenedor cta-final__in">
    <h2 id="cta-final-t">${titulo}</h2>
    <p>${texto}</p>
    <div class="acciones">
      <a class="btn btn--wa" href="${wa(mensaje)}" target="_blank" rel="noopener">${UI.whatsapp}Pedir turno por WhatsApp</a>
      <a class="btn btn--linea" href="${mapsComoLlegar}" target="_blank" rel="noopener">${UI.pin}Cómo llegar</a>
    </div>
  </div>
</section>`;
}

// ---------- FAQ visible (details/summary nativo, accesible y sin JS) ----------
function faqHTML(lista, { abierta = -1 } = {}) {
  return `<div class="faq">${lista
    .map(
      (f, i) => `<details class="faq__item"${i === abierta ? ' open' : ''}>
  <summary><span>${esc(f.p)}</span>${UI.mas}</summary>
  <div class="faq__r"><p>${esc(f.r)}</p></div>
</details>`
    )
    .join('')}</div>`;
}

// ---------- documento completo ----------
function documento(id, { cuerpo, schema = [], indexar = true, claseBody = '', precargarHero = false }) {
  return `${head(id, { schema, indexar, precargarHero })}
<body class="${claseBody}">
${cabecera(id)}
<main id="contenido">
${cuerpo}
</main>
${pie()}
</body>
</html>
`;
}

module.exports = {
  D, N, S, esc, abs, wa, mapsLink, mapsComoLlegar, mapsEmbed, direccionCorta, telefonoTxt,
  assets, nodosBase, migasSchema, paginaSchema, faqSchema, documento, migas, ctaFinal, faqHTML, ID,
};
