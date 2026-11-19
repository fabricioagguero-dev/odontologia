/**
 * ia.js — El asistente que entiende lo que pide Jimena y lo convierte en cambios.
 *
 * Proveedor por defecto: Gemini (Google), que tiene un nivel GRATUITO.
 *   GEMINI_API_KEY   clave gratuita de https://aistudio.google.com/apikey
 *   GEMINI_MODEL     opcional: modelo a usar primero (si falla se prueban otros gratuitos)
 * Opcional, pago: Claude (Anthropic)
 *   IA_PROVEEDOR=claude, ANTHROPIC_API_KEY, CLAUDE_MODEL
 */
const { ErrorPanel } = require('./http');

// ---------- Formato de respuesta que tiene que devolver la IA ----------
const ESQUEMA_RESPUESTA = {
  type: 'object',
  properties: {
    respuesta: {
      type: 'string',
      description: 'Lo que le decís a Jimena: español rioplatense con voseo, cálido, claro y breve. Sin tecnicismos.',
    },
    titulo: {
      type: 'string',
      description: 'Título corto de la propuesta (máx. 60 caracteres), ej. "Nueva dirección del consultorio". Vacío si no proponés cambios.',
    },
    cambios: {
      type: 'array',
      description: 'Cambios concretos al contenido. Vacío si solo respondés o preguntás algo.',
      items: {
        type: 'object',
        properties: {
          accion: { type: 'string', enum: ['cambiar', 'agregar', 'quitar'] },
          campo: { type: 'string', description: 'Ruta con puntos e índices desde 0, ej. negocio.direccion.calle o faq.general.2.r' },
          valor_json: { type: 'string', description: 'Valor nuevo escrito como JSON, ej. "\\"texto\\"", "true", "{...}". Vacío para quitar.' },
          posicion: { type: 'integer', description: 'Solo para agregar en un lugar específico de la lista (0 = al principio).' },
        },
        required: ['accion', 'campo'],
      },
    },
    pedido_desarrollador: {
      type: 'string',
      description: 'Si Jimena pide algo que no se puede cambiar desde el panel: el pedido redactado claro y completo para Fabricio, el desarrollador. Si no, vacío.',
    },
  },
  required: ['respuesta', 'cambios'],
};

// ---------- Fecha en Argentina ----------
function calendario() {
  const tz = 'America/Argentina/Buenos_Aires';
  const ahora = new Date();
  const fmtLargo = new Intl.DateTimeFormat('es-AR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtIso = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const fmtCorto = new Intl.DateTimeFormat('es-AR', { timeZone: tz, weekday: 'short', day: '2-digit', month: '2-digit' });
  const proximos = [];
  for (let i = 1; i <= 45; i++) {
    const d = new Date(ahora.getTime() + i * 864e5);
    proximos.push(`${fmtCorto.format(d)}=${fmtIso.format(d)}`);
  }
  return { hoyLargo: fmtLargo.format(ahora), hoyIso: fmtIso.format(ahora), proximos: proximos.join(', ') };
}

// ---------- Instrucciones ----------
function instrucciones({ contenido, pendiente, fotos = [] }) {
  const cal = calendario();
  return `Sos el asistente del panel de administración del sitio web de la Dra. Jimena Teruel, odontóloga especialista en Endodoncia (consultorio en Belén de Escobar, provincia de Buenos Aires). Hablás directamente con Jimena, que no es técnica. Tu trabajo es entender lo que quiere cambiar en su sitio —aunque lo diga de forma informal, incompleta, con errores de tipeo o por audio transcripto— y traducirlo a cambios concretos sobre el contenido.

HOY: ${cal.hoyLargo} (${cal.hoyIso}). Próximos días: ${cal.proximos}.

CÓMO RESPONDÉS
- Español rioplatense con voseo, cálido, profesional y breve (1 a 4 oraciones). Nunca menciones JSON, campos, rutas, código ni términos técnicos: hablá de "tu dirección", "los horarios", "el aviso", "tus preguntas frecuentes".
- Si el pedido es claro, proponé los cambios directamente en "cambios" y explicale en "respuesta" qué va a cambiar. Ella revisa la propuesta y toca "Publicar", así que no preguntes "¿querés que lo haga?": hacelo.
- Si falta un dato imprescindible, preguntá solo eso (una pregunta concreta) y dejá "cambios" vacío. Ejemplos: dice que se mudó pero no dice adónde; pide un aviso de vacaciones sin fechas; quiere cambiar el teléfono sin decir el número.
- No inventes datos: direcciones, números, años, títulos, precios, opiniones ni nombres. Usá solo lo que ella dice o lo que ya está en el contenido. Sí podés redactar y mejorar textos a partir de lo que ella cuenta.
- Si dice algo ambiguo pero hay una interpretación claramente más probable, usala y aclará en la respuesta lo que asumiste.
- Si pide algo que no tiene que ver con su sitio, contestá amablemente que acá solo podés ayudarla con el sitio.

PENSÁ EN TODO LO QUE AFECTA EL PEDIDO, NO SOLO EN LO LITERAL
- Mudanza: cambiá negocio.direccion (calle con número, detalle con piso/oficina/local o vacío si no hay, localidad, partido, cp si lo sabés con seguridad; si no, dejalo como está o vacío) y negocio.mapsQuery ("Odontología Integral Jimena Teruel, <calle>, <localidad>, Buenos Aires"). Buscá en todo el contenido textos que mencionen la dirección vieja y actualizalos (mejor usando los marcadores {direccion} y {localidad}). Si se muda a otra localidad, revisá también negocio.zonas (localidades cercanas a la nueva, la nueva primero). Recordale en la respuesta que también cambie la dirección en su perfil de Google Maps. La ubicación del pin del mapa (negocio.geo) se calcula sola: no la toques.
- Teléfono: cambiá negocio.whatsapp (formato 549 + código de área sin 0 + número sin 15; ej. 011 15 5949-7352 → 5491159497352) y negocio.telefonoVisible (ej. "+54 9 11 5949-7352").
- Horarios: reemplazá negocio.horarios completo. El texto de horarios del sitio se arma solo a partir de esa lista. Si un texto menciona horarios fijos, usá el marcador {horarios}.
- Vacaciones, feriados, cierres o avisos temporales: usá el aviso (no cambies los horarios). Poné "desde" = hoy (o el día que ella diga que empiece a mostrarse) y "hasta" = el último día del cierre; el aviso desaparece solo después de esa fecha.
- Nuevo tratamiento: agregalo a tratamientos con id nuevo; si corresponde, sumá alguna pregunta frecuente útil.

CONTENIDO EDITABLE (sección por sección)
- aviso {activo, texto (máx. 220), desde, hasta (AAAA-MM-DD o "")}: cartel que aparece arriba en todas las páginas. Para sacarlo: activo false. Texto amable y concreto, ej.: "El consultorio permanece cerrado del 2 al 16 de enero por vacaciones. Podés escribirme por WhatsApp y te respondo a la vuelta."
- negocio.direccion {calle, detalle, localidad, partido, provincia, region, cp, pais}; negocio.mapsQuery.
- negocio.whatsapp, negocio.telefonoVisible, negocio.email.
- negocio.redes {instagram, facebook, googleMaps} (links completos con https://), negocio.instagramUsuario ("@usuario").
- negocio.horarios: lista de bloques {dias: ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"] (sin tildes), abre: "HH:MM", cierra: "HH:MM"} en 24 h. Horario cortado = dos bloques con los mismos días. negocio.horariosNota: aclaración opcional (ej. "Sábados solo urgencias con turno previo").
- negocio.zonas: localidades que atiende (para Google).
- negocio.formacion {universidad, universidadCorta, anioTitulo, anioEspecialidad, consultorioDesde} (años de 4 cifras o "").
- negocio.nombre, profesional, titulo, especialidad, matricula, matriculaNumero: datos profesionales; cambialos solo si ella lo pide explícitamente.
- google {perfil, resena, calificacion ("5,0"), total, opiniones: [{autor, estrellas 1-5, fecha ("Hace 2 semanas"), texto}]}: opiniones reales de su perfil de Google. Solo agregá las que ella pegue o dicte, sin inventar ni reescribir el texto (podés corregir solo el formato). Autor: nombre + inicial del apellido ("Laura G."). Las nuevas van al principio (posicion 0). Si da el nuevo total o calificación, actualizalos.
- fotos {retrato: la foto de Jimena (o ""), consultorio: [{src, alt}]}: las fotos que adjunta en el chat se llaman foto:1, foto:2, etc. Para usarlas poné ese nombre como valor (cambiar fotos.retrato con "\\"foto:1\\"", o agregar a fotos.consultorio {"src":"foto:2","alt":"..."}). Mirá cada imagen: el alt describe en pocas palabras lo que se ve. Si no queda claro si es su foto o del consultorio, preguntá. Para sacar una foto: quitá el elemento o poné retrato en "".
- textos {heroTitulo (título grande del inicio, máx. 90; conviene que diga "Escobar" y "endodoncia" porque ayuda a Google), heroBajada (texto debajo), destacados [3 × {titulo, texto}], presentacion [párrafos de "Sobre mí" en el inicio; el primero es el destacado], sobreMiBajada, sobreMiCompromiso}.
- tratamientos [{id (minúsculas-con-guiones), nombre, resumen (tarjeta del inicio, máx. 220), detalle (página Odontología general, máx. 450)}]: el orden de la lista es el orden en el sitio. "endodoncia" y "ortodoncia" tienen página propia.
- faq {endodoncia, general, ortodoncia, urgencias, consultorio}: preguntas frecuentes [{p, r}].
- Marcadores: los textos pueden usar {direccion}, {localidad}, {partido}, {horarios}, {telefono}, {zonas}, {instagram}; se completan solos con los datos actuales. Mantenelos y usalos cuando un texto nombre esos datos.

LO QUE NO SE PUEDE CAMBIAR DESDE EL PANEL
Diseño, colores, tipografías, logo, animaciones, el menú, crear o borrar páginas, los textos largos de las páginas de Endodoncia, Urgencias, Ortodoncia y Contacto, y el posicionamiento en Google (títulos y descripciones SEO). Si pide algo de esto: explicale con amabilidad que eso lo hace Fabricio, el desarrollador, dejá "cambios" vacío (o proponé solo la parte que sí se puede) y escribí en "pedido_desarrollador" el pedido completo y claro para él.

CÓMO ESCRIBIR LOS CAMBIOS
Cada cambio: {"accion", "campo", "valor_json", "posicion"?}
- "cambiar": reemplaza el valor de un campo. Puede ser un texto, un número, true/false, un objeto o una lista entera.
- "agregar": agrega un elemento a una lista ("campo" es la lista, ej. "faq.general").
- "quitar": elimina un elemento de una lista ("campo" es el elemento, ej. "google.opiniones.3"); sin valor.
- "valor_json" es el valor escrito como JSON: textos entre comillas ("\\"Lunes a viernes\\""), objetos y listas completos.
- Los índices empiezan en 0 y se refieren al contenido actual, antes de aplicar tus cambios.
- No agregues campos que no existen. Respetá los largos máximos.
- "titulo": nombre corto de la propuesta para el historial.

${pendiente && pendiente.cambios && pendiente.cambios.length ? `PROPUESTA PENDIENTE (todavía no publicada)
Título: ${pendiente.titulo || ''}
Cambios: ${JSON.stringify(pendiente.cambios.map(({ accion, campo, valor_json, posicion }) => ({ accion, campo, valor_json, posicion })))}
Si Jimena pide ajustarla o sumar algo, devolvé la propuesta COMPLETA (lo anterior que siga valiendo + lo nuevo), porque tu nueva propuesta reemplaza a esta. Si cambia de tema por completo o la descarta, no la repitas.

` : ''}${fotos.length ? `FOTOS ADJUNTADAS EN ESTA CONVERSACIÓN: ${fotos.map((f) => f.id).join(', ')}.

` : ''}CONTENIDO ACTUAL DEL SITIO
${JSON.stringify(contenido)}`;
}

// ---------- Utilidades ----------
function extraerJSON(texto) {
  if (!texto) throw new Error('respuesta vacía');
  let t = String(texto).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(t);
  } catch {
    const a = t.indexOf('{');
    const b = t.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
    throw new Error('la respuesta no es JSON');
  }
}

function normalizarSalida(x) {
  const salida = {
    respuesta: typeof x.respuesta === 'string' ? x.respuesta.trim() : '',
    titulo: typeof x.titulo === 'string' ? x.titulo.trim().slice(0, 80) : '',
    cambios: Array.isArray(x.cambios) ? x.cambios.filter((c) => c && typeof c.campo === 'string' && typeof c.accion === 'string') : [],
    pedido_desarrollador: typeof x.pedido_desarrollador === 'string' ? x.pedido_desarrollador.trim() : '',
  };
  salida.cambios = salida.cambios.map((c) => ({
    accion: c.accion.trim().toLowerCase(),
    campo: c.campo.trim(),
    ...(c.valor_json !== undefined && c.valor_json !== null && c.valor_json !== '' ? { valor_json: typeof c.valor_json === 'string' ? c.valor_json : JSON.stringify(c.valor_json) } : {}),
    ...(c.valor !== undefined ? { valor_json: JSON.stringify(c.valor) } : {}),
    ...(Number.isInteger(c.posicion) ? { posicion: c.posicion } : {}),
  }));
  return salida;
}

const conTiempo = (ms) => {
  const control = new AbortController();
  const t = setTimeout(() => control.abort(), ms);
  return { signal: control.signal, listo: () => clearTimeout(t) };
};

// ---------- Gemini (gratis) ----------
const MODELOS_GEMINI = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'];
let formatoGemini = 0; // 0: responseFormat (actual) · 1: responseJsonSchema · 2: solo JSON

function cuerpoGemini({ sistema, turnos, formato }) {
  const contents = [];
  for (const t of turnos) {
    const role = t.rol === 'asistente' ? 'model' : 'user';
    const parts = [
      ...(t.imagenes || []).flatMap((im) => [{ text: `Imagen ${im.id}:` }, { inlineData: { mimeType: im.mime, data: im.datos } }]),
      { text: t.texto || '(sin texto)' },
    ];
    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) prev.parts.push(...parts);
    else contents.push({ role, parts });
  }
  while (contents.length && contents[0].role !== 'user') contents.shift();
  const generationConfig = {};
  if (formato === 0) generationConfig.responseFormat = { text: { mimeType: 'application/json', schema: ESQUEMA_RESPUESTA } };
  else if (formato === 1) Object.assign(generationConfig, { responseMimeType: 'application/json', responseJsonSchema: ESQUEMA_RESPUESTA });
  else generationConfig.responseMimeType = 'application/json';
  return { systemInstruction: { parts: [{ text: sistema }] }, contents, generationConfig };
}

async function gemini({ sistema, turnos }) {
  const clave = process.env.GEMINI_API_KEY;
  if (!clave) throw new ErrorPanel(503, 'Falta configurar la clave de la IA (GEMINI_API_KEY).');
  const modelos = [...new Set([process.env.GEMINI_MODEL, ...MODELOS_GEMINI].filter(Boolean))];
  let ultimo = null;
  let limite = false;
  for (const modelo of modelos) {
    for (let intento = 0; intento < 3; intento++) {
      const formato = formatoGemini;
      const t = conTiempo(40000);
      let r;
      try {
        r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
          body: JSON.stringify(cuerpoGemini({ sistema, turnos, formato })),
          signal: t.signal,
        });
      } catch (e) {
        t.listo();
        ultimo = e;
        break; // probar otro modelo
      }
      t.listo();
      const texto = await r.text();
      if (r.ok) {
        const d = JSON.parse(texto);
        const cand = d.candidates && d.candidates[0];
        const partes = (cand && cand.content && cand.content.parts) || [];
        const salida = partes.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('');
        if (!salida) {
          ultimo = new Error(`sin texto (${cand && cand.finishReason})`);
          break;
        }
        return { ...normalizarSalida(extraerJSON(salida)), modelo };
      }
      console.error(`[ia] ${modelo} (formato ${formato}) → ${r.status}: ${texto.slice(0, 300)}`);
      // Si el formato de respuesta estructurada no es aceptado, probar el siguiente formato.
      if (r.status === 400 && formato < 2 && /responseFormat|responseJsonSchema|Unknown name|Invalid JSON payload|schema/i.test(texto)) {
        formatoGemini = formato + 1;
        continue;
      }
      if (r.status === 400 && /API key|API_KEY/i.test(texto)) throw new ErrorPanel(503, 'La clave de la IA (GEMINI_API_KEY) no es válida.');
      if (r.status === 403) throw new ErrorPanel(503, 'La clave de la IA no tiene permiso. Revisá GEMINI_API_KEY.');
      if (r.status === 429) limite = true;
      ultimo = new Error(`${r.status}`);
      break; // 404 (modelo no disponible), 429 (límite), 5xx → siguiente modelo
    }
  }
  if (limite) throw new ErrorPanel(429, 'La IA gratuita llegó a su límite por ahora. Probá de nuevo en unos minutos.');
  throw new ErrorPanel(502, 'La IA no respondió. Probá de nuevo en un momento.', { detalle: ultimo && ultimo.message });
}

// ---------- Claude (opcional, pago por uso) ----------
async function claude({ sistema, turnos }) {
  const clave = process.env.ANTHROPIC_API_KEY;
  if (!clave) throw new ErrorPanel(503, 'Falta configurar ANTHROPIC_API_KEY.');
  // La API exige que la conversación empiece con el usuario y alterne turnos.
  const mensajes = [];
  for (const t of turnos) {
    const rol = t.rol === 'asistente' ? 'assistant' : 'user';
    const content = [
      ...(t.imagenes || []).flatMap((im) => [
        { type: 'text', text: `Imagen ${im.id}:` },
        { type: 'image', source: { type: 'base64', media_type: im.mime, data: im.datos } },
      ]),
      { type: 'text', text: t.texto || '(sin texto)' },
    ];
    const prev = mensajes[mensajes.length - 1];
    if (prev && prev.role === rol) prev.content.push(...content);
    else mensajes.push({ role: rol, content });
  }
  while (mensajes.length && mensajes[0].role !== 'user') mensajes.shift();
  const t = conTiempo(50000);
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': clave, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5',
      max_tokens: 4096,
      system: sistema,
      messages: mensajes,
      tools: [{ name: 'responder', description: 'Respuesta para Jimena y cambios propuestos al sitio.', input_schema: ESQUEMA_RESPUESTA }],
      tool_choice: { type: 'tool', name: 'responder' },
    }),
    signal: t.signal,
  }).finally(t.listo);
  const texto = await r.text();
  if (!r.ok) {
    console.error(`[ia] claude → ${r.status}: ${texto.slice(0, 300)}`);
    if (r.status === 401) throw new ErrorPanel(503, 'La clave de Claude (ANTHROPIC_API_KEY) no es válida.');
    if (r.status === 429) throw new ErrorPanel(429, 'La IA está muy solicitada. Probá de nuevo en unos minutos.');
    throw new ErrorPanel(502, 'La IA no respondió. Probá de nuevo en un momento.');
  }
  const d = JSON.parse(texto);
  const uso = (d.content || []).find((b) => b.type === 'tool_use');
  if (!uso) throw new ErrorPanel(502, 'La IA no devolvió una respuesta válida.');
  return { ...normalizarSalida(uso.input), modelo: d.model };
}

function proveedor() {
  const elegido = (process.env.IA_PROVEEDOR || '').toLowerCase();
  if (elegido === 'claude' || (!process.env.GEMINI_API_KEY && process.env.ANTHROPIC_API_KEY)) return 'claude';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return null;
}

/**
 * turnos: [{ rol: 'usuario'|'asistente', texto, imagenes?: [{id, mime, datos}] }]
 */
async function generar({ sistema, turnos }) {
  const p = proveedor();
  if (!p) throw new ErrorPanel(503, 'Falta configurar la IA (GEMINI_API_KEY).');
  return p === 'claude' ? claude({ sistema, turnos }) : gemini({ sistema, turnos });
}

module.exports = { generar, instrucciones, proveedor, ESQUEMA_RESPUESTA, extraerJSON, normalizarSalida, cuerpoGemini, calendario };
