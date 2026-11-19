/**
 * Nexora Sentinel — conector para sitios en Vercel.
 *
 * Copiá este archivo TAL CUAL a la raíz del proyecto (al lado de vercel.json) y
 * cargá en el proyecto la variable SENTINEL_CLAVE de Vercel (la misma clave en
 * todos los sitios y en Nexora). Nada más: no hace falta instalar nada.
 *
 * Qué hace: antes de mostrar cada página, le pregunta a Nexora Sentinel
 * (https://www.nexorasaas.com/api/sentinel) si la visita es segura.
 *   · Visita normal  → el sitio se muestra como siempre.
 *   · Ataque         → Sentinel responde con el bloqueo o el desafío invisible.
 * Todo queda registrado en el Nexora Panel (visitas, ataques, IPs bloqueadas) y
 * una IP bloqueada en cualquier sitio de la red queda bloqueada en todos.
 *
 * Si Sentinel no responde a tiempo o falta la clave, el sitio sigue andando
 * normalmente: nunca se rompe por culpa del conector.
 *
 * Versión del conector: 1.0 — Desarrollado por NexoraSaaS
 */

// Las imágenes, estilos, scripts y fuentes no pasan por Sentinel (más rápido).
// Tampoco /api/: las funciones del sitio tienen sus propias defensas y así no se
// limita el tamaño de lo que reciben (Vercel corta en 4 MB lo que pasa por acá).
// Las rutas internas de Sentinel (/__sentinel/...) sí pasan, porque son el desafío.
export const config = {
  runtime: 'nodejs',
  matcher: [
    '/__sentinel/:path*',
    '/((?!api/|.+\\.(?:css|js|mjs|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp4|webm)$).*)',
  ],
};

const ENV: Record<string, string | undefined> = ((globalThis as any).process && (globalThis as any).process.env) || {};
const CENTRAL: string = ENV.SENTINEL_URL || 'https://www.nexorasaas.com/api/sentinel';
const CLAVE: string = ENV.SENTINEL_CLAVE || '';
const PLAZO_MS = 1500; // espera máxima por la respuesta de Sentinel en una visita normal
const PLAZO_INTERNO_MS = 6000; // las rutas del desafío esperan un poco más
const RECORDAR_MS = 30000; // un visitante que pasó limpio no espera por 30 s
const MAX_SIN_ESPERA = 60; // más de 60 pedidos por minuto: se lo revisa siempre

const limpios: Map<string, number> = new Map();
let sinRespuestaHasta = 0; // si Sentinel no contesta, por 30 s no se hace esperar a nadie
const conteo: Map<string, { desde: number; n: number }> = new Map();

type Contexto = { waitUntil?: (p: Promise<unknown>) => void };

export default async function middleware(request: Request, contexto?: Contexto) {
  if (!CLAVE) return; // sin clave el sitio funciona igual, sin Sentinel
  const url = new URL(request.url);
  const h = request.headers;
  const ip = (h.get('x-real-ip') || (h.get('x-forwarded-for') || '').split(',')[0] || '').trim();
  const ua = h.get('user-agent') || '';
  const interno = url.pathname.startsWith('/__sentinel/');

  const datos: Record<string, unknown> = {
    host: (h.get('x-forwarded-host') || h.get('host') || url.host).toLowerCase(),
    ip,
    ua,
    metodo: request.method,
    ruta: url.pathname,
    query: url.search.slice(1),
    pais: h.get('x-vercel-ip-country') || '',
    cookie: h.get('cookie') || '',
    pagina: esPagina(request, url),
    conector: '1.0',
  };
  if (interno && request.method === 'POST') {
    try {
      datos.cuerpo = await request.clone().json();
    } catch {
      datos.cuerpo = {};
    }
  }

  // Visitante que pasó limpio hace poco: no lo hacemos esperar, pero Sentinel
  // igual se entera de la visita (cuenta frecuencia, registra, aprende).
  const quien = ip + '|' + ua;
  const recordado = (limpios.get(quien) || 0) > Date.now() && contar(ip) <= MAX_SIN_ESPERA;
  if (!interno && (recordado || sinRespuestaHasta > Date.now())) {
    const aviso = consultar(datos, PLAZO_MS * 4)
      .then((r) => {
        if (r && r.accion !== 'permitir') limpios.delete(quien);
      })
      .catch(() => {});
    if (contexto && typeof contexto.waitUntil === 'function') contexto.waitUntil(aviso);
    return;
  }

  const r = await consultar(datos, interno ? PLAZO_INTERNO_MS : PLAZO_MS).catch(() => null);
  if (!r) sinRespuestaHasta = Date.now() + 30000;
  if (!r) {
    if (interno) return new Response('{"ok":false}', { status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    return; // Sentinel no respondió: el sitio sigue andando
  }
  if (r.accion === 'permitir') {
    recordar(quien);
    return;
  }
  return new Response(typeof r.cuerpo === 'string' ? r.cuerpo : '', {
    status: Number(r.estado) || 403,
    headers: Array.isArray(r.cabeceras) ? r.cabeceras : [],
  });
}

async function consultar(datos: Record<string, unknown>, plazo: number): Promise<any> {
  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), plazo);
  try {
    const r = await fetch(CENTRAL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + CLAVE },
      body: JSON.stringify(datos),
      signal: control.signal,
    });
    if (!r.ok) return null;
    const j = await r.json();
    sinRespuestaHasta = 0;
    return j;
  } finally {
    clearTimeout(corte);
  }
}

// Una "página" es lo que el visitante abre en el navegador (no un archivo ni una API).
function esPagina(request: Request, url: URL): boolean {
  if (request.method !== 'GET') return false;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/__sentinel/')) return false;
  const acepta = request.headers.get('accept') || '';
  return acepta.includes('text/html');
}

function contar(ip: string): number {
  const ahora = Date.now();
  let e = conteo.get(ip);
  if (!e || ahora - e.desde > 60000) {
    e = { desde: ahora, n: 0 };
    conteo.set(ip, e);
  }
  e.n += 1;
  if (conteo.size > 5000) conteo.clear();
  return e.n;
}

function recordar(quien: string) {
  limpios.set(quien, Date.now() + RECORDAR_MS);
  if (limpios.size > 5000) limpios.clear();
}
