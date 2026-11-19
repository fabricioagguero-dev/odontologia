/**
 * sesion.js — Ingreso al panel con contraseña y cookie firmada (HMAC).
 * Variables: ADMIN_PASSWORD (obligatoria) y SESSION_SECRET (opcional).
 * Si se cambia la contraseña, todas las sesiones abiertas se cierran solas.
 */
const crypto = require('crypto');
const { leerCookies, igualesSeguro } = require('./http');

const COOKIE = 'jt_panel';
const DURACION = 30 * 24 * 60 * 60; // 30 días

function secreto() {
  const base = process.env.SESSION_SECRET || process.env.GITHUB_TOKEN || 'panel';
  return crypto.createHash('sha256').update(`${base}::${process.env.ADMIN_PASSWORD || ''}`).digest();
}
const firmar = (texto) => crypto.createHmac('sha256', secreto()).update(texto).digest('base64url');

function claveConfigurada() {
  return typeof process.env.ADMIN_PASSWORD === 'string' && process.env.ADMIN_PASSWORD.length >= 8;
}

function claveCorrecta(clave) {
  if (!claveConfigurada() || typeof clave !== 'string') return false;
  return igualesSeguro(clave, process.env.ADMIN_PASSWORD);
}

function cookieSesion(req) {
  const vence = Math.floor(Date.now() / 1000) + DURACION;
  const valor = `${vence}.${firmar(String(vence))}`;
  return `${COOKIE}=${valor}; Path=/api/panel; Max-Age=${DURACION}; HttpOnly; SameSite=Strict${esLocal(req) ? '' : '; Secure'}`;
}

function cookieCerrar(req) {
  return `${COOKIE}=; Path=/api/panel; Max-Age=0; HttpOnly; SameSite=Strict${esLocal(req) ? '' : '; Secure'}`;
}

function autenticada(req) {
  if (!claveConfigurada()) return false;
  const valor = leerCookies(req)[COOKIE];
  if (!valor) return false;
  const [vence, firma] = valor.split('.');
  if (!vence || !firma || Number(vence) < Date.now() / 1000) return false;
  return igualesSeguro(firma, firmar(vence));
}

function esLocal(req) {
  const host = String(req.headers.host || '');
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

// Freno simple a los intentos repetidos (por instancia de la función).
const intentos = new Map();
function puedeIntentar(ip) {
  const ahora = Date.now();
  const x = intentos.get(ip) || { n: 0, desde: ahora };
  if (ahora - x.desde > 15 * 60 * 1000) {
    intentos.set(ip, { n: 0, desde: ahora });
    return true;
  }
  return x.n < 8;
}
function registrarFallo(ip) {
  const x = intentos.get(ip) || { n: 0, desde: Date.now() };
  x.n += 1;
  intentos.set(ip, x);
}

module.exports = { claveConfigurada, claveCorrecta, cookieSesion, cookieCerrar, autenticada, puedeIntentar, registrarFallo };
