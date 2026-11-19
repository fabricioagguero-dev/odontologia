/**
 * /api/panel/:accion/ — Panel de administración del sitio.
 *
 *   GET    sesion      ¿hay sesión? + qué falta configurar
 *   POST   sesion      ingresar con la contraseña
 *   DELETE sesion      salir
 *   GET    contenido   cómo está el sitio hoy
 *   POST   chat        la IA interpreta el pedido y arma una propuesta
 *   POST   publicar    aplica la propuesta (commit en GitHub → Vercel actualiza el sitio)
 *   GET    historial   últimos cambios
 *   POST   deshacer    vuelve atrás el último cambio hecho desde el panel
 */
const crypto = require('crypto');
const R = require('../scripts/contenido');
const H = require('./_lib/http');
const S = require('./_lib/sesion');
const G = require('./_lib/github');
const IA = require('./_lib/ia');
const GEO = require('./_lib/geo');

const { ErrorPanel } = H;
const FOTO_ID = /^foto:\d{1,2}$/;

// ---------- utilidades ----------
function accionDe(req) {
  if (req.query && req.query.accion) return String(req.query.accion);
  const url = new URL(req.url, 'http://x');
  return url.searchParams.get('accion') || (url.pathname.match(/\/api\/panel\/([a-z]+)/) || [])[1] || '';
}

function exigirSesion(req) {
  if (!S.autenticada(req)) throw new ErrorPanel(401, 'Tu sesión terminó. Volvé a ingresar con tu contraseña.');
}

/** Junta todas las referencias "foto:N" que aparecen en un valor. */
function referenciasFoto(valor, out = new Set()) {
  if (typeof valor === 'string') {
    if (FOTO_ID.test(valor)) out.add(valor);
  } else if (Array.isArray(valor)) valor.forEach((v) => referenciasFoto(v, out));
  else if (valor && typeof valor === 'object') Object.values(valor).forEach((v) => referenciasFoto(v, out));
  return out;
}

function reemplazarFotos(valor, mapa) {
  if (typeof valor === 'string') return mapa[valor] ? mapa[valor].src : valor;
  if (Array.isArray(valor)) return valor.map((v) => reemplazarFotos(v, mapa));
  if (valor && typeof valor === 'object') {
    const o = Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, reemplazarFotos(v, mapa)]));
    if (typeof valor.src === 'string' && mapa[valor.src]) {
      const f = mapa[valor.src];
      if (f.ancho && f.alto) Object.assign(o, { ancho: f.ancho, alto: f.alto });
    }
    return o;
  }
  return valor;
}

const soloDigitos = (s) => String(s || '').replace(/\D/g, '');
const cambioDireccion = (a, b) => ['calle', 'localidad', 'partido', 'provincia'].some((k) => (a.negocio.direccion[k] || '') !== (b.negocio.direccion[k] || ''));

/**
 * Revisa una propuesta de la IA.
 * duros: impiden publicarla. blandos: detalles que conviene que la IA corrija.
 */
function revisar(actual, cambios, fotosIds) {
  const duros = [];
  const blandos = [];
  let nuevo = null;
  if (cambios.length > 40) duros.push('Demasiados cambios juntos (máximo 40).');
  try {
    nuevo = R.aplicarCambios(actual, cambios);
  } catch (e) {
    duros.push(e.message);
    return { duros, blandos, nuevo };
  }
  duros.push(...R.validar(nuevo, { modo: 'propuesta' }));
  for (const ref of referenciasFoto(nuevo)) {
    if (!fotosIds.includes(ref)) duros.push(`${ref}: esa foto no existe. Fotos adjuntadas: ${fotosIds.join(', ') || 'ninguna'}.`);
  }
  if (duros.length) return { duros, blandos, nuevo };

  const Na = actual.negocio;
  const Nn = nuevo.negocio;
  // ¿Quedaron textos con la dirección o el teléfono viejos?
  const excluir = (rutas, ...prefijos) => rutas.filter((r) => !prefijos.some((p) => r === p || r.startsWith(p + '.')));
  if (Na.direccion.calle !== Nn.direccion.calle) {
    const viejas = excluir(R.buscarMenciones(nuevo, Na.direccion.calle), 'negocio.direccion', 'negocio.mapsQuery');
    if (viejas.length) blandos.push(`Todavía aparece la dirección vieja "${Na.direccion.calle}" en: ${viejas.join(', ')}. Actualizalo (podés usar el marcador {direccion}).`);
    if (!Nn.mapsQuery.includes(Nn.direccion.calle)) blandos.push('negocio.mapsQuery tiene que tener la dirección nueva.');
  }
  if (Na.telefonoVisible && Na.telefonoVisible !== Nn.telefonoVisible) {
    const viejas = excluir(R.buscarMenciones(nuevo, Na.telefonoVisible), 'negocio.telefonoVisible');
    if (viejas.length) blandos.push(`Todavía aparece el teléfono viejo en: ${viejas.join(', ')}. Usá el marcador {telefono}.`);
  }
  if (Na.whatsapp !== Nn.whatsapp || Na.telefonoVisible !== Nn.telefonoVisible) {
    const visible = soloDigitos(Nn.telefonoVisible);
    if (visible && visible !== Nn.whatsapp) blandos.push(`negocio.whatsapp (${Nn.whatsapp}) y negocio.telefonoVisible (${Nn.telefonoVisible}) tienen que ser el mismo número.`);
  }
  if (nuevo.aviso.activo && nuevo.aviso.hasta && nuevo.aviso.hasta < IA.calendario().hoyIso) {
    blandos.push('El aviso tiene una fecha "hasta" que ya pasó: no se mostraría.');
  }
  return { duros, blandos, nuevo };
}

function resumen(doc) {
  const N = doc.negocio;
  const d = N.direccion;
  return {
    direccion: [d.calle, d.detalle].filter(Boolean).join(', '),
    localidad: [d.localidad, d.provincia].filter(Boolean).join(', '),
    horarios: R.textoHorarios(N.horarios) + (N.horariosNota ? `. ${N.horariosNota}` : ''),
    telefono: N.telefonoVisible,
    instagram: N.instagramUsuario,
    aviso: doc.aviso.activo ? { texto: doc.aviso.texto, desde: doc.aviso.desde, hasta: doc.aviso.hasta } : null,
    retrato: doc.fotos.retrato,
    fotosConsultorio: doc.fotos.consultorio.length,
    opiniones: doc.google.opiniones.length,
    tratamientos: doc.tratamientos.map((t) => t.nombre),
    preguntas: Object.values(doc.faq).reduce((n, l) => n + l.length, 0),
  };
}

// ---------- acciones ----------
async function sesion(req, res) {
  if (req.method === 'GET') {
    return H.responder(res, 200, {
      autenticada: S.autenticada(req),
      listo: { clave: S.claveConfigurada(), ia: IA.proveedor(), github: G.configurado() },
      soporte: process.env.CONTACTO_SOPORTE || '',
    });
  }
  if (req.method === 'DELETE') return H.responder(res, 200, { ok: true }, { 'Set-Cookie': S.cookieCerrar(req) });
  if (req.method !== 'POST') throw new ErrorPanel(405, 'Método no permitido.');
  if (!S.claveConfigurada()) throw new ErrorPanel(503, 'Falta configurar la contraseña del panel (ADMIN_PASSWORD, mínimo 8 caracteres).');
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  if (!S.puedeIntentar(ip)) throw new ErrorPanel(429, 'Demasiados intentos. Esperá unos minutos y probá de nuevo.');
  const { clave } = await H.leerCuerpo(req);
  if (!S.claveCorrecta(clave)) {
    S.registrarFallo(ip);
    await H.esperar(700);
    throw new ErrorPanel(401, 'La contraseña no es correcta.');
  }
  return H.responder(res, 200, { ok: true }, { 'Set-Cookie': S.cookieSesion(req) });
}

async function contenido(req, res) {
  exigirSesion(req);
  const { contenido: doc, sha } = await G.leerContenido();
  return H.responder(res, 200, { sha, resumen: resumen(doc) });
}

async function chat(req, res) {
  exigirSesion(req);
  if (req.method !== 'POST') throw new ErrorPanel(405, 'Método no permitido.');
  const inicio = Date.now();
  const cuerpo = await H.leerCuerpo(req);

  const mensajes = (Array.isArray(cuerpo.mensajes) ? cuerpo.mensajes : [])
    .filter((m) => m && (m.rol === 'usuario' || m.rol === 'asistente') && typeof m.texto === 'string')
    .slice(-16)
    .map((m) => ({ rol: m.rol, texto: m.texto.slice(0, 5000) }));
  if (!mensajes.length || mensajes[mensajes.length - 1].rol !== 'usuario') throw new ErrorPanel(400, 'Escribí qué querés cambiar.');

  const fotos = (Array.isArray(cuerpo.fotos) ? cuerpo.fotos : [])
    .filter((f) => f && FOTO_ID.test(f.id))
    .slice(0, 12)
    .map((f) => ({
      id: f.id,
      mime: ['image/jpeg', 'image/png', 'image/webp'].includes(f.mime) ? f.mime : 'image/jpeg',
      datos: typeof f.datos === 'string' && f.datos.length < 1.6e6 ? f.datos : '',
    }));
  const pendiente = cuerpo.pendiente && Array.isArray(cuerpo.pendiente.cambios)
    ? { titulo: String(cuerpo.pendiente.titulo || '').slice(0, 80), cambios: cuerpo.pendiente.cambios.slice(0, 40).filter((c) => !c.automatico) }
    : null;

  const { contenido: actual } = await G.leerContenido();
  const sistema = IA.instrucciones({ contenido: actual, pendiente, fotos });
  const turnos = mensajes.map((m) => ({ ...m }));
  const conImagen = fotos.filter((f) => f.datos);
  if (conImagen.length) turnos[turnos.length - 1].imagenes = conImagen;
  const fotosIds = fotos.map((f) => f.id);

  let salida = null;
  let revision = { duros: [], blandos: [] };
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    salida = await IA.generar({ sistema, turnos });
    // El pin del mapa lo calcula el sistema, no la IA.
    salida.cambios = salida.cambios.filter((c) => !/^negocio\.geo/.test(c.campo));
    if (!salida.cambios.length) break;
    revision = revisar(actual, salida.cambios, fotosIds);
    const hayQueCorregir = revision.duros.length || (revision.blandos.length && vuelta === 0);
    if (!hayQueCorregir || vuelta === 2 || Date.now() - inicio > 32000) break;
    const { modelo, ...sinModelo } = salida;
    turnos.push({ rol: 'asistente', texto: JSON.stringify(sinModelo) });
    turnos.push({
      rol: 'usuario',
      texto: `[Revisión automática del sistema; esto no lo escribió Jimena] Tu propuesta tiene estos problemas:\n- ${[...revision.duros, ...revision.blandos].join('\n- ')}\nCorregilos y devolvé la respuesta completa de nuevo (respuesta para Jimena, titulo y TODOS los cambios).`,
    });
  }

  const base = { respuesta: salida.respuesta, pedido: salida.pedido_desarrollador || '', modelo: salida.modelo };
  if (!salida.cambios.length) return H.responder(res, 200, { ...base, propuesta: null });
  if (revision.duros.length) {
    console.error('[panel] propuesta inválida:', revision.duros);
    return H.responder(res, 200, {
      ...base,
      respuesta: 'Entendí lo que querés, pero no pude armar bien el cambio. ¿Me lo contás de nuevo, con un poco más de detalle?',
      propuesta: null,
    });
  }

  const cambios = [...salida.cambios];
  const avisos = [];
  if (cambioDireccion(actual, revision.nuevo)) {
    const geo = await GEO.geocodificar(revision.nuevo.negocio.direccion);
    if (geo) {
      cambios.push({ accion: 'cambiar', campo: 'negocio.geo', valor_json: JSON.stringify({ lat: geo.lat, lng: geo.lng }), automatico: true });
      if (!geo.exacto) avisos.push('Ubiqué la calle en el mapa, pero no el número exacto. Después de publicar, fijate que el pin quede bien.');
    } else {
      cambios.push({ accion: 'cambiar', campo: 'negocio.geo', valor_json: 'null', automatico: true });
      avisos.push('No encontré la dirección exacta en el mapa: el mapa del sitio la va a buscar por el texto de la dirección.');
    }
  }
  return H.responder(res, 200, {
    ...base,
    propuesta: {
      id: crypto.randomUUID(),
      titulo: salida.titulo || 'Cambios en el sitio',
      cambios,
      filas: cambios.map((c) => R.describirCambio(actual, c)),
      avisos,
    },
  });
}

/** Revisa que los datos recibidos sean de verdad una imagen y devuelve su extensión. */
function tipoImagen(buf) {
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.toString('hex', 0, 8) === '89504e470d0a1a0a') return 'png';
  return null;
}

async function publicar(req, res) {
  exigirSesion(req);
  if (req.method !== 'POST') throw new ErrorPanel(405, 'Método no permitido.');
  const cuerpo = await H.leerCuerpo(req);
  const cambios = Array.isArray(cuerpo.cambios) ? cuerpo.cambios.slice(0, 41) : [];
  if (!cambios.length) throw new ErrorPanel(400, 'No hay cambios para publicar.');
  const titulo = String(cuerpo.titulo || 'Cambios en el sitio').replace(/\s+/g, ' ').slice(0, 80);

  const { contenido: actual } = await G.leerContenido();
  let nuevo;
  try {
    nuevo = R.aplicarCambios(actual, cambios);
  } catch (e) {
    throw new ErrorPanel(422, 'Esta propuesta ya no se puede aplicar (el sitio cambió mientras tanto). Pedile a la IA que la arme de nuevo.', { detalle: e.message });
  }

  // Fotos: se guardan en /public/img/subidas/ con un nombre único.
  const recibidas = cuerpo.fotos && typeof cuerpo.fotos === 'object' ? cuerpo.fotos : {};
  const archivos = [];
  const mapa = {};
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  for (const ref of referenciasFoto(nuevo)) {
    const f = recibidas[ref];
    if (!f || typeof f.datos !== 'string') throw new ErrorPanel(400, `Falta la foto ${ref}. Volvé a adjuntarla.`);
    const buf = Buffer.from(f.datos, 'base64');
    const ext = tipoImagen(buf);
    if (!ext) throw new ErrorPanel(400, `El archivo ${ref} no es una imagen válida.`);
    if (buf.length > 3 * 1024 * 1024) throw new ErrorPanel(413, `La foto ${ref} es demasiado pesada.`);
    const nombre = `${fecha}-${crypto.createHash('sha1').update(buf).digest('hex').slice(0, 10)}.${ext}`;
    archivos.push({ ruta: `public/img/subidas/${nombre}`, base64: buf.toString('base64') });
    const entero = (n) => (Number.isInteger(n) && n >= 100 && n <= 4000 ? n : undefined);
    mapa[ref] = { src: `/img/subidas/${nombre}`, ancho: entero(f.ancho), alto: entero(f.alto) };
  }
  nuevo = reemplazarFotos(nuevo, mapa);

  const errores = R.validar(nuevo);
  if (errores.length) throw new ErrorPanel(422, 'La propuesta tiene datos que no son válidos. Pedile a la IA que la revise.', { errores });
  if (JSON.stringify(nuevo) === JSON.stringify(actual)) return H.responder(res, 200, { ok: true, sinCambios: true });

  const filas = cambios.map((c) => R.describirCambio(actual, c));
  const detalle = filas
    .map((f) => `- ${f.etiqueta}: ${f.tipo === 'quitar' ? `se quita "${(f.antes || '').slice(0, 90)}"` : (f.despues || '').slice(0, 120)}`)
    .join('\n');
  const mensaje = `Panel: ${titulo}\n\n${detalle}\n\nPublicado desde el panel de administración.`;
  const r = await G.publicar({ contenido: nuevo, archivos, mensaje });
  return H.responder(res, 200, { ok: true, ...r });
}

async function historial(req, res) {
  exigirSesion(req);
  const lista = await G.historial(15);
  return H.responder(res, 200, {
    cambios: lista.map((c, i) => {
      const primera = c.mensaje.split('\n')[0];
      const delPanel = primera.startsWith('Panel: ');
      return {
        sha: c.sha,
        titulo: delPanel ? primera.slice(7) : 'Actualización del sitio (Fabricio)',
        detalle: delPanel ? c.mensaje.split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2)) : [],
        fecha: c.fecha,
        delPanel,
        deshacible: i === 0 && delPanel && !!c.padre,
      };
    }),
  });
}

async function deshacer(req, res) {
  exigirSesion(req);
  if (req.method !== 'POST') throw new ErrorPanel(405, 'Método no permitido.');
  const { sha } = await H.leerCuerpo(req);
  const [ultimo] = await G.historial(1);
  if (!ultimo || ultimo.sha !== sha) throw new ErrorPanel(409, 'Solo se puede deshacer el último cambio. Actualizá el historial y probá de nuevo.');
  const primera = ultimo.mensaje.split('\n')[0];
  if (!primera.startsWith('Panel: ') || !ultimo.padre) throw new ErrorPanel(403, 'Ese cambio no se hizo desde el panel, así que no se puede deshacer desde acá.');
  const { contenido: anterior } = await G.leerContenido(ultimo.padre);
  const errores = R.validar(anterior);
  if (errores.length) throw new ErrorPanel(422, 'La versión anterior no se puede restaurar automáticamente.', { errores });
  const titulo = primera.slice(7).replace(/^deshacer «(.*)»$/, '$1');
  const mensaje = primera.startsWith('Panel: deshacer «')
    ? `Panel: ${titulo}\n\n- Se volvió a aplicar el cambio deshecho.\n\nPublicado desde el panel de administración.`
    : `Panel: deshacer «${titulo}»\n\n- Se restauró el contenido anterior a este cambio.\n\nPublicado desde el panel de administración.`;
  const r = await G.publicar({ contenido: anterior, mensaje });
  return H.responder(res, 200, { ok: true, ...r });
}

const ACCIONES = { sesion, contenido, chat, publicar, historial, deshacer };

module.exports = async function panel(req, res) {
  try {
    if (req.method !== 'GET' && !H.mismoOrigen(req)) throw new ErrorPanel(403, 'Pedido no permitido.');
    const fn = ACCIONES[accionDe(req)];
    if (!fn) throw new ErrorPanel(404, 'No existe.');
    await fn(req, res);
  } catch (e) {
    if (e instanceof ErrorPanel) return H.responder(res, e.estado, { error: e.message, ...e.extra });
    console.error('[panel]', e);
    return H.responder(res, 500, { error: 'Algo salió mal. Probá de nuevo en un momento.' });
  }
};

// Para pruebas
module.exports.revisar = revisar;
module.exports.resumen = resumen;
