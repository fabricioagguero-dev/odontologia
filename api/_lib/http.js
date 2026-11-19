/**
 * http.js — Utilidades mínimas para las funciones del panel (sin dependencias).
 */
const crypto = require('crypto');

const LIMITE_CUERPO = 4.2 * 1024 * 1024; // Vercel acepta hasta 4,5 MB por pedido

async function leerCuerpo(req) {
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  let texto = '';
  if (typeof req.body === 'string') texto = req.body;
  else if (Buffer.isBuffer(req.body)) texto = req.body.toString('utf8');
  else {
    const partes = [];
    let total = 0;
    for await (const c of req) {
      total += c.length;
      if (total > LIMITE_CUERPO) throw new ErrorPanel(413, 'El pedido es demasiado grande. Probá con menos fotos.');
      partes.push(c);
    }
    texto = Buffer.concat(partes).toString('utf8');
  }
  if (!texto) return {};
  try {
    return JSON.parse(texto);
  } catch {
    throw new ErrorPanel(400, 'El pedido no tiene un formato válido.');
  }
}

class ErrorPanel extends Error {
  constructor(estado, mensaje, extra = {}) {
    super(mensaje);
    this.estado = estado;
    this.extra = extra;
  }
}

function responder(res, estado, datos, cabeceras = {}) {
  res.statusCode = estado;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  for (const [k, v] of Object.entries(cabeceras)) res.setHeader(k, v);
  res.end(JSON.stringify(datos));
}

function leerCookies(req) {
  const out = {};
  for (const par of String(req.headers.cookie || '').split(';')) {
    const i = par.indexOf('=');
    if (i > 0) out[par.slice(0, i).trim()] = decodeURIComponent(par.slice(i + 1).trim());
  }
  return out;
}

/** Bloquea pedidos que vienen de otro sitio (además de la cookie SameSite=Strict). */
function mismoOrigen(req) {
  const origen = req.headers.origin;
  if (!origen) return true;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try {
    return new URL(origen).host === host;
  } catch {
    return false;
  }
}

const igualesSeguro = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { leerCuerpo, responder, leerCookies, mismoOrigen, igualesSeguro, esperar, ErrorPanel };
