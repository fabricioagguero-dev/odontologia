/**
 * contenido.js — Reglas del contenido editable (contenido/sitio.json).
 *
 * Lo usan el generador del sitio y el panel de administración:
 *  · validar(doc)            → lista de errores (vacía si está todo bien)
 *  · aplicarCambios(doc, c)  → copia del contenido con los cambios aplicados
 *  · describirCambio(...)    → texto "antes → después" para mostrar en el panel
 *  · textoHorarios(h)        → "Lunes a viernes de 10:30 a 19:30"
 *  · rellenar(txt, doc)      → reemplaza {direccion}, {horarios}, etc.
 *
 * Sin dependencias: corre igual en Node local y en las funciones de Vercel.
 */

// ---------- Días ----------
const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DIAS_NOMBRE = { lunes: 'lunes', martes: 'martes', miercoles: 'miércoles', jueves: 'jueves', viernes: 'viernes', sabado: 'sábado', domingo: 'domingo' };
const DIAS_PLURAL = { lunes: 'lunes', martes: 'martes', miercoles: 'miércoles', jueves: 'jueves', viernes: 'viernes', sabado: 'sábados', domingo: 'domingos' };
const DIAS_SCHEMA = { lunes: 'Monday', martes: 'Tuesday', miercoles: 'Wednesday', jueves: 'Thursday', viernes: 'Friday', sabado: 'Saturday', domingo: 'Sunday' };

const may = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const hora = (h) => {
  const [hh, mm] = String(h).split(':');
  const n = String(Number(hh));
  return mm === '00' ? n : `${n}:${mm}`;
};
const unir = (lista, y = 'y') => (lista.length < 2 ? lista.join('') : `${lista.slice(0, -1).join(', ')} ${y} ${lista[lista.length - 1]}`);

function textoDias(dias) {
  const orden = [...new Set(dias)].sort((a, b) => DIAS.indexOf(a) - DIAS.indexOf(b));
  const idx = orden.map((d) => DIAS.indexOf(d));
  const seguidos = idx.every((n, i) => i === 0 || n === idx[i - 1] + 1);
  if (orden.length >= 3 && seguidos) return `${DIAS_NOMBRE[orden[0]]} a ${DIAS_NOMBRE[orden[orden.length - 1]]}`;
  return unir(orden.map((d) => (orden.length === 1 ? DIAS_PLURAL[d] : DIAS_NOMBRE[d])));
}

/** "Lunes a viernes de 10:30 a 19:30; sábados de 9 a 13" */
function textoHorarios(horarios = []) {
  const grupos = [];
  for (const h of horarios) {
    const clave = [...new Set(h.dias)].sort().join(',');
    let g = grupos.find((x) => x.clave === clave);
    if (!g) grupos.push((g = { clave, dias: h.dias, franjas: [] }));
    g.franjas.push(h);
  }
  return may(
    grupos
      .map((g) => {
        const franjas = g.franjas
          .sort((a, b) => a.abre.localeCompare(b.abre))
          .map((f) => `de ${hora(f.abre)} a ${hora(f.cierra)}`);
        return `${textoDias(g.dias)} ${unir(franjas)}`;
      })
      .join('; ')
  );
}

// ---------- Marcadores dentro de los textos ----------
function marcadores(doc) {
  const N = doc.negocio;
  const d = N.direccion;
  const zonas = N.zonas || [];
  return {
    direccion: [d.calle, d.detalle ? d.detalle.toLowerCase() : ''].filter(Boolean).join(', '),
    calle: d.calle,
    localidad: d.localidad,
    partido: d.partido,
    horarios: textoHorarios(N.horarios || []),
    telefono: N.telefonoVisible || 'WhatsApp',
    zonas: zonas.join(', '),
    instagram: N.instagramUsuario || '',
  };
}
function rellenar(txt, doc, m = marcadores(doc)) {
  if (typeof txt !== 'string') return txt;
  return txt.replace(/\{(direccion|calle|localidad|partido|horarios|telefono|zonas|instagram)\}/g, (_, k) => m[k]);
}
/** Recorre un valor (texto, lista u objeto) y rellena todos los marcadores. */
function rellenarTodo(valor, doc, m = marcadores(doc)) {
  if (typeof valor === 'string') return rellenar(valor, doc, m);
  if (Array.isArray(valor)) return valor.map((v) => rellenarTodo(v, doc, m));
  if (valor && typeof valor === 'object') return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, rellenarTodo(v, doc, m)]));
  return valor;
}

// ---------- Esquema ----------
// Mini‑lenguaje de validación: cada nodo describe el tipo esperado.
const str = (max, o = {}) => ({ t: 'str', max, ...o });
const num = (min, max, o = {}) => ({ t: 'num', min, max, ...o });
const int = (min, max, o = {}) => ({ t: 'num', min, max, entero: true, ...o });
const bool = (o = {}) => ({ t: 'bool', ...o });
const obj = (props, o = {}) => ({ t: 'obj', props, ...o });
const arr = (item, max, o = {}) => ({ t: 'arr', item, max, ...o });
const uno = (valores, o = {}) => ({ t: 'enum', valores, ...o });

const URL_O_VACIO = { patron: /^(https:\/\/[^\s"<>]+)?$/, msg: 'tiene que ser un link que empiece con https:// (o quedar vacío)' };
const FECHA_O_VACIA = { patron: /^(\d{4}-\d{2}-\d{2})?$/, msg: 'tiene que tener formato AAAA-MM-DD (o quedar vacío)' };
const ANIO_O_VACIO = { patron: /^((19[5-9]\d|20\d\d))?$/, msg: 'tiene que ser un año de 4 cifras (o quedar vacío)' };
const HORA = { patron: /^([01]\d|2[0-3]):[0-5]\d$/, msg: 'tiene que tener formato HH:MM de 24 horas (ej. 09:00, 19:30)' };
const IMG_FINAL = /^\/img\/[a-z0-9][a-z0-9\-_/]*\.(webp|jpe?g|png|avif)$/;
const IMG_PROPUESTA = /^(\/img\/[a-z0-9][a-z0-9\-_/]*\.(webp|jpe?g|png|avif)|foto:\d{1,2})$/;
const IMG = { imagen: true, msg: 'tiene que ser una foto adjuntada (foto:1, foto:2…) o una imagen del sitio' };

const PREGUNTA = obj({ p: str(170, { min: 5 }), r: str(1000, { min: 5 }) });

const ESQUEMA = obj({
  aviso: obj({
    activo: bool(),
    texto: str(220),
    desde: str(10, FECHA_O_VACIA),
    hasta: str(10, FECHA_O_VACIA),
  }),
  negocio: obj({
    nombre: str(90, { min: 3 }),
    profesional: str(60, { min: 3 }),
    titulo: str(60, { min: 3 }),
    especialidad: str(90),
    matricula: str(30, { min: 3 }),
    matriculaNumero: str(12, { patron: /^\d{3,10}$/, msg: 'tiene que ser solo el número de matrícula' }),
    direccion: obj({
      calle: str(80, { min: 3 }),
      detalle: str(60),
      localidad: str(60, { min: 2 }),
      partido: str(60, { min: 2 }),
      provincia: str(60, { min: 2 }),
      region: str(10),
      cp: str(10),
      pais: str(2, { min: 2 }),
    }),
    geo: obj({ lat: num(-56, -21), lng: num(-74, -53) }, { nulo: true }),
    mapsQuery: str(200, { min: 5 }),
    whatsapp: str(15, { patron: /^549\d{10}$/, msg: 'tiene que tener el formato 549 + código de área sin 0 + número sin 15 (ej. 5491159497352)' }),
    telefonoVisible: str(30),
    email: str(80, { patron: /^([^\s@]+@[^\s@]+\.[^\s@]+)?$/, msg: 'no es un email válido' }),
    redes: obj({ instagram: str(200, URL_O_VACIO), facebook: str(200, URL_O_VACIO), googleMaps: str(200, URL_O_VACIO) }),
    instagramUsuario: str(40),
    horarios: arr(obj({ dias: arr(uno(DIAS), 7, { min: 1 }), abre: str(5, HORA), cierra: str(5, HORA) }), 14),
    horariosNota: str(160),
    zonas: arr(str(40, { min: 2 }), 15, { min: 1 }),
    formacion: obj({
      universidad: str(100),
      universidadCorta: str(20),
      anioTitulo: str(4, ANIO_O_VACIO),
      anioEspecialidad: str(4, ANIO_O_VACIO),
      consultorioDesde: str(4, ANIO_O_VACIO),
    }),
  }),
  google: obj({
    perfil: str(200, URL_O_VACIO),
    resena: str(200, URL_O_VACIO),
    calificacion: str(3, { patron: /^([1-5](,\d)?)?$/, msg: 'tiene que ser como 5,0 o 4,8' }),
    total: int(0, 100000),
    opiniones: arr(
      obj({ autor: str(40, { min: 2 }), estrellas: int(1, 5), fecha: str(30), texto: str(1500, { min: 3 }) }),
      30
    ),
  }),
  fotos: obj({
    retrato: str(120, { ...IMG, vacio: true }),
    consultorio: arr(
      obj({ src: str(120, IMG), alt: str(150, { min: 3 }), ancho: int(100, 4000, { opcional: true }), alto: int(100, 4000, { opcional: true }) }),
      12
    ),
  }),
  textos: obj({
    heroTitulo: str(90, { min: 10 }),
    heroBajada: str(280, { min: 20 }),
    destacados: arr(obj({ titulo: str(50, { min: 3 }), texto: str(150, { min: 5 }) }), 4, { min: 1 }),
    presentacion: arr(str(600, { min: 10 }), 5, { min: 1 }),
    sobreMiBajada: str(320, { min: 10 }),
    sobreMiCompromiso: str(600, { min: 10 }),
  }),
  tratamientos: arr(
    obj({
      id: str(40, { patron: /^[a-z0-9]+(-[a-z0-9]+)*$/, msg: 'tiene que estar en minúsculas, sin tildes y con guiones (ej. placas-de-relajacion)' }),
      nombre: str(50, { min: 3 }),
      resumen: str(220, { min: 10 }),
      detalle: str(450),
    }),
    14,
    { min: 1 }
  ),
  faq: obj({
    endodoncia: arr(PREGUNTA, 15),
    general: arr(PREGUNTA, 15),
    ortodoncia: arr(PREGUNTA, 15),
    urgencias: arr(PREGUNTA, 15),
    consultorio: arr(PREGUNTA, 15),
  }),
});

const PELIGROSO = /<\s*\/?\s*(script|iframe|style|object|embed|link|meta)\b|javascript:|on\w+\s*=/i;

function validarNodo(v, s, ruta, errores, modo) {
  const donde = ruta || 'contenido';
  if (s.t === 'obj') {
    if (v === null && s.nulo) return;
    if (!v || typeof v !== 'object' || Array.isArray(v)) return errores.push(`${donde}: tiene que ser un objeto`);
    for (const k of Object.keys(v)) if (!s.props[k]) errores.push(`${ruta ? ruta + '.' : ''}${k}: ese campo no existe`);
    for (const [k, sk] of Object.entries(s.props)) {
      const rk = ruta ? `${ruta}.${k}` : k;
      if (v[k] === undefined) {
        if (!sk.opcional) errores.push(`${rk}: falta`);
        continue;
      }
      validarNodo(v[k], sk, rk, errores, modo);
    }
    return;
  }
  if (s.t === 'arr') {
    if (!Array.isArray(v)) return errores.push(`${donde}: tiene que ser una lista`);
    if (v.length > s.max) errores.push(`${donde}: puede tener como máximo ${s.max} elementos`);
    if (s.min && v.length < s.min) errores.push(`${donde}: tiene que tener al menos ${s.min} elemento(s)`);
    v.forEach((x, i) => validarNodo(x, s.item, `${donde}.${i}`, errores, modo));
    return;
  }
  if (s.t === 'str') {
    if (typeof v !== 'string') return errores.push(`${donde}: tiene que ser un texto`);
    if (v.length > s.max) errores.push(`${donde}: es demasiado largo (máximo ${s.max} caracteres, tiene ${v.length})`);
    if (s.min && v.trim().length < s.min && !(s.vacio && v === '')) errores.push(`${donde}: es demasiado corto o está vacío`);
    if (s.patron && !s.patron.test(v)) errores.push(`${donde}: ${s.msg}`);
    if (s.imagen && !(s.vacio && v === '') && !(modo === 'propuesta' ? IMG_PROPUESTA : IMG_FINAL).test(v)) errores.push(`${donde}: ${s.msg}`);
    if (PELIGROSO.test(v)) errores.push(`${donde}: no puede contener código`);
    return;
  }
  if (s.t === 'num') {
    if (typeof v !== 'number' || !Number.isFinite(v)) return errores.push(`${donde}: tiene que ser un número`);
    if (s.entero && !Number.isInteger(v)) errores.push(`${donde}: tiene que ser un número entero`);
    if (v < s.min || v > s.max) errores.push(`${donde}: tiene que estar entre ${s.min} y ${s.max}`);
    return;
  }
  if (s.t === 'bool') {
    if (typeof v !== 'boolean') errores.push(`${donde}: tiene que ser true o false`);
    return;
  }
  if (s.t === 'enum') {
    if (!s.valores.includes(v)) errores.push(`${donde}: tiene que ser uno de: ${s.valores.join(', ')}`);
  }
}

/**
 * Valida todo el contenido. modo 'propuesta' acepta fotos todavía no subidas ("foto:1").
 */
function validar(doc, { modo = 'final' } = {}) {
  const errores = [];
  validarNodo(doc, ESQUEMA, '', errores, modo);
  if (errores.length) return errores;
  // Reglas que cruzan campos
  doc.negocio.horarios.forEach((h, i) => {
    if (h.abre >= h.cierra) errores.push(`negocio.horarios.${i}: la hora de apertura tiene que ser anterior a la de cierre`);
  });
  const a = doc.aviso;
  if (a.activo && a.texto.trim().length < 5) errores.push('aviso.texto: falta el texto del aviso');
  if (a.desde && a.hasta && a.desde > a.hasta) errores.push('aviso: la fecha "desde" tiene que ser anterior a "hasta"');
  const ids = doc.tratamientos.map((t) => t.id);
  ids.forEach((id, i) => ids.indexOf(id) !== i && errores.push(`tratamientos.${i}.id: "${id}" está repetido`));
  return errores;
}

// ---------- Rutas tipo "faq.general.2.r" ----------
function partirRuta(campo) {
  if (typeof campo !== 'string' || !campo.trim()) throw new Error('falta el campo');
  return campo
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((p) => (/^\d+$/.test(p) ? Number(p) : p));
}
const PROHIBIDAS = new Set(['__proto__', 'prototype', 'constructor']);

function leer(doc, campo) {
  let x = doc;
  for (const p of partirRuta(campo)) {
    if (x == null) return undefined;
    x = x[p];
  }
  return x;
}

function padreDe(doc, partes, campo) {
  let x = doc;
  for (const p of partes.slice(0, -1)) {
    if (PROHIBIDAS.has(p)) throw new Error(`${campo}: ruta inválida`);
    if (x == null || typeof x !== 'object' || !(p in x)) throw new Error(`${campo}: no existe`);
    x = x[p];
  }
  const ultima = partes[partes.length - 1];
  if (PROHIBIDAS.has(ultima)) throw new Error(`${campo}: ruta inválida`);
  return [x, ultima];
}

/** Interpreta valor_json: si no es JSON válido, se toma como texto. */
function leerValor(c) {
  if (c.valor !== undefined) return c.valor;
  if (c.valor_json === undefined || c.valor_json === null || c.valor_json === '') return undefined;
  try {
    return JSON.parse(c.valor_json);
  } catch {
    return String(c.valor_json);
  }
}

/**
 * Aplica una lista de cambios sobre una copia del contenido.
 * Los índices se refieren al contenido ORIGINAL: primero se cambian valores,
 * después se quitan elementos (de atrás hacia adelante) y al final se agregan.
 */
function aplicarCambios(original, cambios = []) {
  const doc = JSON.parse(JSON.stringify(original));
  const normalizados = cambios.map((c) => ({ ...c, valor: leerValor(c), partes: partirRuta(c.campo) }));
  const orden = { cambiar: 0, quitar: 1, agregar: 2 };
  for (const c of normalizados) if (!(c.accion in orden)) throw new Error(`${c.campo}: acción desconocida "${c.accion}"`);

  for (const c of normalizados.filter((x) => x.accion === 'cambiar')) {
    const [padre, k] = padreDe(doc, c.partes, c.campo);
    if (c.valor === undefined) throw new Error(`${c.campo}: falta el valor nuevo`);
    if (Array.isArray(padre)) {
      if (typeof k !== 'number' || k < 0 || k >= padre.length) throw new Error(`${c.campo}: ese elemento no existe`);
    } else if (padre === null || typeof padre !== 'object') {
      throw new Error(`${c.campo}: no existe`);
    }
    padre[k] = c.valor;
  }

  const quitar = normalizados
    .filter((x) => x.accion === 'quitar')
    .sort((a, b) => (b.partes[b.partes.length - 1] ?? 0) - (a.partes[a.partes.length - 1] ?? 0));
  for (const c of quitar) {
    const [padre, k] = padreDe(doc, c.partes, c.campo);
    if (!Array.isArray(padre) || typeof k !== 'number' || k < 0 || k >= padre.length) throw new Error(`${c.campo}: para quitar hay que indicar un elemento de una lista`);
    padre.splice(k, 1);
  }

  for (const c of normalizados.filter((x) => x.accion === 'agregar')) {
    const [padre, k] = padreDe(doc, c.partes, c.campo);
    const lista = padre ? padre[k] : undefined;
    if (!Array.isArray(lista)) throw new Error(`${c.campo}: solo se puede agregar a una lista`);
    if (c.valor === undefined) throw new Error(`${c.campo}: falta lo que hay que agregar`);
    const pos = Number.isInteger(c.posicion) ? Math.max(0, Math.min(c.posicion, lista.length)) : lista.length;
    lista.splice(pos, 0, c.valor);
  }
  return doc;
}

// ---------- Nombres legibles para el panel ----------
const CATEGORIAS_FAQ = { endodoncia: 'Endodoncia', general: 'Odontología general', ortodoncia: 'Ortodoncia', urgencias: 'Urgencias', consultorio: 'Turnos y consultorio' };
const ETIQUETAS = [
  [/^aviso$/, 'Aviso en el sitio'],
  [/^aviso\.activo$/, 'Aviso en el sitio'],
  [/^aviso\.texto$/, 'Texto del aviso'],
  [/^aviso\.desde$/, 'Aviso visible desde'],
  [/^aviso\.hasta$/, 'Aviso visible hasta'],
  [/^negocio\.direccion$/, 'Dirección completa'],
  [/^negocio\.direccion\.calle$/, 'Dirección'],
  [/^negocio\.direccion\.detalle$/, 'Piso / oficina'],
  [/^negocio\.direccion\.localidad$/, 'Localidad'],
  [/^negocio\.direccion\.partido$/, 'Partido'],
  [/^negocio\.direccion\.provincia$/, 'Provincia'],
  [/^negocio\.direccion\.cp$/, 'Código postal'],
  [/^negocio\.geo$/, 'Ubicación en el mapa'],
  [/^negocio\.mapsQuery$/, 'Búsqueda en Google Maps'],
  [/^negocio\.whatsapp$/, 'Número de WhatsApp (botones)'],
  [/^negocio\.telefonoVisible$/, 'Teléfono que se muestra'],
  [/^negocio\.email$/, 'Email'],
  [/^negocio\.redes\.instagram$/, 'Instagram (link)'],
  [/^negocio\.instagramUsuario$/, 'Instagram (usuario)'],
  [/^negocio\.redes\.facebook$/, 'Facebook'],
  [/^negocio\.redes\.googleMaps$/, 'Perfil de Google Maps'],
  [/^negocio\.horarios/, 'Horarios'],
  [/^negocio\.horariosNota$/, 'Aclaración de horarios'],
  [/^negocio\.zonas/, 'Zonas que atendés'],
  [/^negocio\.formacion\.anioTitulo$/, 'Año de recibida'],
  [/^negocio\.formacion\.anioEspecialidad$/, 'Año de la especialidad'],
  [/^negocio\.formacion\.consultorioDesde$/, 'En el consultorio desde'],
  [/^negocio\.formacion\.universidad$/, 'Universidad'],
  [/^negocio\.formacion/, 'Formación'],
  [/^negocio\.nombre$/, 'Nombre del consultorio'],
  [/^negocio\.profesional$/, 'Nombre profesional'],
  [/^negocio\.titulo$/, 'Título'],
  [/^negocio\.especialidad$/, 'Especialidad'],
  [/^negocio\.matricula/, 'Matrícula'],
  [/^google\.opiniones$/, 'Opiniones de Google'],
  [/^google\.opiniones\.\d+/, 'Opinión de Google'],
  [/^google\.total$/, 'Cantidad de opiniones en Google'],
  [/^google\.calificacion$/, 'Calificación en Google'],
  [/^google\./, 'Google'],
  [/^fotos\.retrato$/, 'Tu foto'],
  [/^fotos\.consultorio/, 'Fotos del consultorio'],
  [/^textos\.heroTitulo$/, 'Título principal del inicio'],
  [/^textos\.heroBajada$/, 'Texto debajo del título'],
  [/^textos\.destacados/, 'Destacados del inicio'],
  [/^textos\.presentacion/, 'Presentación en el inicio'],
  [/^textos\.sobreMiBajada$/, 'Introducción de "Sobre mí"'],
  [/^textos\.sobreMiCompromiso$/, 'Texto de "Mi formación"'],
  [/^tratamientos$/, 'Tratamientos'],
  [/^tratamientos\.\d+\.nombre$/, 'Nombre del tratamiento'],
  [/^tratamientos\.\d+\.resumen$/, 'Texto corto del tratamiento'],
  [/^tratamientos\.\d+\.detalle$/, 'Texto largo del tratamiento'],
  [/^tratamientos/, 'Tratamiento'],
];

function etiqueta(campo, doc) {
  const partes = partirRuta(campo);
  const ruta = partes.join('.');
  if (partes[0] === 'faq') {
    const cat = CATEGORIAS_FAQ[partes[1]] || partes[1];
    if (partes.length === 2) return `Preguntas frecuentes · ${cat}`;
    if (partes[3] === 'r') return `Respuesta · ${cat}`;
    if (partes[3] === 'p') return `Pregunta · ${cat}`;
    return `Pregunta frecuente · ${cat}`;
  }
  let e = (ETIQUETAS.find(([re]) => re.test(ruta)) || [null, ruta])[1];
  if (partes[0] === 'tratamientos' && typeof partes[1] === 'number' && doc) {
    const t = doc.tratamientos && doc.tratamientos[partes[1]];
    if (t && partes.length > 2) e += ` · ${t.nombre}`;
  }
  return e;
}

const fechaAR = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso);
const corto = (s, n = 140) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

/** Convierte cualquier valor del contenido en un texto corto para leer. */
function resumir(valor, campo = '') {
  if (valor === undefined) return '';
  if (valor === null) return '(sin dato)';
  const ruta = campo ? partirRuta(campo).join('.') : '';
  if (typeof valor === 'boolean') return /^aviso(\.activo)?$/.test(ruta) ? (valor ? 'Visible' : 'Oculto') : valor ? 'Sí' : 'No';
  if (typeof valor === 'string') return valor === '' ? '(vacío)' : /^foto:\d+$/.test(valor) ? `[${valor}]` : /^aviso\.(desde|hasta)$/.test(ruta) ? fechaAR(valor) : corto(valor, 400);
  if (typeof valor === 'number') return String(valor);
  if (/^negocio\.horarios$/.test(ruta) && Array.isArray(valor)) return valor.length ? textoHorarios(valor) : '(sin horarios)';
  if (/^negocio\.horarios\.\d+$/.test(ruta)) return textoHorarios([valor]);
  if (ruta === 'negocio.geo' && valor.lat !== undefined) return `${valor.lat.toFixed(5)}, ${valor.lng.toFixed(5)}`;
  if (ruta === 'aviso' && typeof valor === 'object') {
    if (!valor.activo) return 'Oculto';
    const rango = [valor.desde && `desde el ${fechaAR(valor.desde)}`, valor.hasta && `hasta el ${fechaAR(valor.hasta)}`].filter(Boolean).join(' ');
    return `${valor.texto}${rango ? ` (visible ${rango})` : ''}`;
  }
  if (Array.isArray(valor)) {
    if (valor.every((x) => typeof x === 'string')) return corto(valor.join(' · '), 400);
    return `${valor.length} elementos: ` + valor.map((x) => resumir(x)).join(' | ');
  }
  if (typeof valor === 'object') {
    if ('p' in valor && 'r' in valor) return `${valor.p} — ${corto(valor.r, 220)}`;
    if ('autor' in valor && 'texto' in valor) return `${'★'.repeat(valor.estrellas || 5)} ${valor.autor}: “${corto(valor.texto, 220)}”`;
    if ('src' in valor) return `${/^foto:/.test(valor.src) ? `[${valor.src}]` : valor.src} — ${valor.alt || ''}`;
    if ('nombre' in valor && 'resumen' in valor) return `${valor.nombre}: ${corto(valor.resumen, 160)}`;
    if ('titulo' in valor && 'texto' in valor) return `${valor.titulo}: ${valor.texto}`;
    if ('calle' in valor) return [valor.calle, valor.detalle, valor.localidad].filter(Boolean).join(', ');
    return corto(
      Object.entries(valor)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(' · '),
      400
    );
  }
  return String(valor);
}

/** { tipo, etiqueta, antes, despues, foto? } para mostrar cada cambio en el panel. */
function describirCambio(doc, c) {
  const valor = leerValor(c);
  const base = { tipo: c.accion, etiqueta: etiqueta(c.campo, doc), campo: c.campo };
  const foto = (v) => {
    if (typeof v === 'string' && /^foto:\d+$/.test(v)) return v;
    if (v && typeof v === 'object' && typeof v.src === 'string' && /^foto:\d+$/.test(v.src)) return v.src;
    return undefined;
  };
  const ruta = partirRuta(c.campo).join('.');
  // Datos internos que se ajustan junto con la dirección: no hace falta mostrarlos.
  if (ruta === 'negocio.mapsQuery' || ruta === 'negocio.direccion.region' || ruta === 'negocio.direccion.pais') return { ...base, oculto: true };
  if (ruta === 'negocio.geo') {
    return { ...base, automatico: true, despues: valor ? 'El pin del mapa se mueve a la dirección nueva' : 'El mapa va a buscar la dirección por el texto', mapa: valor || undefined };
  }
  if (ruta === 'fotos.retrato') {
    const antes = leer(doc, c.campo);
    return { ...base, antes: antes ? 'Se reemplaza tu foto actual' : 'Sin foto (se ve el logo)', despues: valor ? resumir(valor, c.campo) : 'Sin foto (vuelve el logo)', foto: foto(valor) };
  }
  if (c.accion === 'cambiar') return { ...base, antes: resumir(leer(doc, c.campo), c.campo), despues: resumir(valor, c.campo), foto: foto(valor), automatico: !!c.automatico };
  if (c.accion === 'agregar') return { ...base, etiqueta: base.etiqueta.replace(/^Opiniones/, 'Opinión').replace(/^Fotos del consultorio/, 'Foto del consultorio'), despues: resumir(valor, `${c.campo}.0`), foto: foto(valor) };
  if (c.accion === 'quitar') return { ...base, antes: resumir(leer(doc, c.campo), c.campo) };
  return base;
}

/** Busca rutas de texto que todavía mencionan algo (por ejemplo la dirección vieja). */
function buscarMenciones(doc, aguja, ruta = '', hallados = []) {
  if (!aguja) return hallados;
  if (typeof doc === 'string') {
    if (doc.toLowerCase().includes(aguja.toLowerCase())) hallados.push(ruta);
  } else if (Array.isArray(doc)) doc.forEach((x, i) => buscarMenciones(x, aguja, ruta ? `${ruta}.${i}` : String(i), hallados));
  else if (doc && typeof doc === 'object') for (const [k, v] of Object.entries(doc)) buscarMenciones(v, aguja, ruta ? `${ruta}.${k}` : k, hallados);
  return hallados;
}

module.exports = {
  DIAS, DIAS_SCHEMA, ESQUEMA, CATEGORIAS_FAQ,
  validar, aplicarCambios, describirCambio, etiqueta, resumir, leer, leerValor, partirRuta,
  textoHorarios, marcadores, rellenar, rellenarTodo, buscarMenciones,
};
