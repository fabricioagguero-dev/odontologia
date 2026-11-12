/**
 * componentes.js — Bloques reutilizables entre páginas.
 */
const { esc, wa, mapsEmbed, mapsComoLlegar, N } = require('./base');
const { icono, UI, corteDiente, emblema } = require('./svg');

// ---------- Explorador de endodoncia (interactivo) ----------
const PASOS = [
  {
    t: 'Diagnóstico',
    d: 'Revisamos el diente, escuchamos tus síntomas y analizamos la radiografía. Así confirmamos si la pulpa (el nervio) está inflamada o infectada y si el diente se puede conservar.',
  },
  {
    t: 'Anestesia y aislamiento',
    d: 'Anestesiamos la zona para que no sientas dolor durante el tratamiento y aislamos el diente con una goma especial, para trabajar en un campo limpio y seco.',
  },
  {
    t: 'Limpieza y desinfección',
    d: 'Abrimos un pequeño acceso, retiramos el tejido dañado y limpiamos y damos forma a cada conducto con instrumental específico y líquidos desinfectantes.',
  },
  {
    t: 'Sellado de los conductos',
    d: 'Rellenamos los conductos con un material biocompatible, la gutapercha, que los sella por completo para que las bacterias no vuelvan a entrar.',
  },
  {
    t: 'Restauración',
    d: 'Cerramos el acceso con una restauración. Si al diente le queda poca estructura, puede indicarse un perno o una corona para protegerlo. El diente sigue siendo tuyo y vuelve a cumplir su función.',
  },
];

function explorador({ id = 'como-es-una-endodoncia', nivel = 'h2' } = {}) {
  const tabs = PASOS.map(
    (p, i) =>
      `<li role="presentation"><button type="button" role="tab" id="paso-${i + 1}" aria-controls="paso-panel-${i + 1}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-paso="${i + 1}"><span class="pasos__n">${i + 1}</span><span class="pasos__t">${p.t}</span></button></li>`
  ).join('');
  const panels = PASOS.map(
    (p, i) =>
      `<div class="explorador__desc" role="tabpanel" id="paso-panel-${i + 1}" aria-labelledby="paso-${i + 1}" data-panel="${i + 1}"${i === 0 ? '' : ' data-oculto'}><h3>${i + 1}. ${p.t}</h3><p>${p.d}</p></div>`
  ).join('');
  return `<section class="explorador" id="${id}" aria-labelledby="${id}-t">
  <div class="contenedor">
    <div class="explorador__cab">
      <${nivel} id="${id}-t">Así es un tratamiento de conducto, paso a paso</${nivel}>
      <p>Si te indicaron una endodoncia es normal tener dudas. Tocá cada paso y mirá qué pasa adentro del diente.</p>
    </div>
    <div class="explorador__grid" data-explorador>
      <div class="explorador__visual">${corteDiente()}</div>
      <div class="explorador__panel">
        <ol class="pasos" role="tablist" aria-label="Pasos del tratamiento de conducto">${tabs}</ol>
        <div class="explorador__paneles">${panels}</div>
        <div class="explorador__nav">
          <button type="button" class="btn btn--fantasma" data-prev disabled>Anterior</button>
          <span class="explorador__contador" data-contador>Paso 1 de ${PASOS.length}</span>
          <button type="button" class="btn btn--claro" data-next>Siguiente paso</button>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

// ---------- Chequeo de síntomas (interactivo) ----------
const SINTOMAS = [
  ['Me duele solo, sin que toque nada', 2],
  ['El frío o el calor me duelen y el dolor sigue unos segundos', 2],
  ['Me duele al masticar o al tocar el diente', 2],
  ['El dolor me despierta a la noche', 2],
  ['Se me hinchó la encía o tengo un granito cerca del diente', 3],
  ['Me dolía mucho y de golpe dejó de doler', 2],
  ['El diente se oscureció', 1],
  ['Siento una puntada breve con el frío que se va enseguida', 0.5],
];

function chequeo({ titulo = '¿Puede ser el nervio? Revisá tus síntomas' } = {}) {
  const items = SINTOMAS.map(
    ([t, w], i) =>
      `<label class="sintoma"><input type="checkbox" name="sintoma" value="${esc(t)}" data-peso="${w}"><span class="sintoma__caja" aria-hidden="true"></span><span class="sintoma__t">${t}</span></label>`
  ).join('');
  return `<section class="chequeo" aria-labelledby="chequeo-t">
  <div class="contenedor chequeo__in">
    <div class="chequeo__cab">
      <h2 id="chequeo-t">${titulo}</h2>
      <p>Marcá lo que te está pasando. Es una guía orientativa: el diagnóstico lo confirma la evaluación en el consultorio.</p>
    </div>
    <form class="chequeo__form" data-chequeo>
      <fieldset class="chequeo__lista">
        <legend class="sr">Síntomas</legend>
        ${items}
      </fieldset>
      <div class="chequeo__resultado" data-resultado data-nivel="0">
        <div class="chequeo__medidor" aria-hidden="true"><span data-medidor></span></div>
        <p class="chequeo__titulo" data-res-titulo aria-live="polite">Marcá uno o más síntomas</p>
        <p class="chequeo__texto" data-res-texto>Según lo que elijas, te decimos qué tan pronto conviene que te vea.</p>
        <a class="btn btn--wa" href="${wa('Hola Jimena, quisiera consultar por un dolor en un diente.')}" target="_blank" rel="noopener" data-res-wa>${UI.whatsapp}Consultar por WhatsApp</a>
      </div>
    </form>
  </div>
</section>`;
}

// ---------- Mapa liviano: se carga recién cuando la persona lo pide ----------
function mapa() {
  return `<div class="mapa" data-mapa data-src="${mapsEmbed}">
  <div class="mapa__fondo" aria-hidden="true"><span class="mapa__pin">${UI.pin}</span></div>
  <button class="btn btn--blanco mapa__btn" type="button" data-mapa-btn>${UI.mapa}Ver el mapa</button>
  <p class="mapa__nota">El mapa se carga desde Google Maps al tocar el botón.</p>
</div>`;
}

function ubicacion({ titulo = 'Consultorio en el centro de Escobar', nivel = 'h2' } = {}) {
  return `<section class="ubicacion" id="ubicacion" aria-labelledby="ubicacion-t">
  <div class="contenedor ubicacion__in">
    <div class="ubicacion__txt">
      <${nivel} id="ubicacion-t">${titulo}</${nivel}>
      <address class="ubicacion__dir">
        <span class="ubicacion__calle">${esc(N.direccion.calle)}</span>
        <span>${esc(N.direccion.detalle)}</span>
        <span>${esc(N.direccion.localidad)}, ${esc(N.direccion.provincia)}</span>
      </address>
      <ul class="ubicacion__datos">
        <li>${UI.reloj}<span>${N.horarios.length ? 'Lunes a viernes, con turno' : 'Atención con turno previo'}</span></li>
        <li>${UI.whatsapp}<span>Turnos por WhatsApp</span></li>
      </ul>
      <p class="ubicacion__zonas">Atendemos pacientes de ${N.zonas.slice(0, -2).join(', ')} y alrededores.</p>
      <div class="acciones">
        <a class="btn btn--primario" href="${mapsComoLlegar}" target="_blank" rel="noopener">${UI.pin}Cómo llegar</a>
        <a class="btn btn--linea" href="${wa()}" target="_blank" rel="noopener">${UI.whatsapp}Pedir turno</a>
      </div>
    </div>
    ${mapa()}
  </div>
</section>`;
}

// ---------- Tratamientos (lista editorial) ----------
const TRATAMIENTOS = [
  {
    id: 'endodoncia',
    ruta: '/endodoncia/',
    t: 'Endodoncia',
    d: 'Tratamiento de conducto para eliminar la infección del nervio y conservar tu diente natural. También retratamientos de conductos hechos antes.',
    link: 'Cómo es una endodoncia',
    destacado: 'Especialidad',
  },
  {
    id: 'general',
    ruta: '/odontologia-general/',
    t: 'Odontología general',
    d: 'Controles, limpieza, arreglos de caries del color del diente y extracciones. Lo de todos los días, bien hecho.',
    link: 'Ver odontología general',
  },
  {
    id: 'ortodoncia',
    ruta: '/ortodoncia/',
    t: 'Ortodoncia',
    d: 'Una ortodoncista atiende en el consultorio: evaluación, aparatos y controles sin ir a otro lugar.',
    link: 'Ver ortodoncia',
  },
  {
    id: 'urgencias',
    ruta: '/urgencias/',
    t: 'Urgencias',
    d: 'Dolor de muela, flemón o un diente roto. Escribinos y buscamos el turno más próximo disponible.',
    link: 'Qué hacer en una urgencia',
  },
];

function tratamientos() {
  const ico = { endodoncia: 'endodoncia', general: 'general', ortodoncia: 'ortodoncia', urgencias: 'urgencias' };
  const filas = TRATAMIENTOS.map(
    (x) => `<li class="trat${x.destacado ? ' trat--destacado' : ''}">
    <a class="trat__link" href="${x.ruta}">
      ${icono(ico[x.id], 'trat__icono dibujar')}
      <span class="trat__cuerpo">
        <span class="trat__tit">${x.t}${x.destacado ? `<span class="sello">${x.destacado}</span>` : ''}</span>
        <span class="trat__d">${x.d}</span>
        <span class="trat__mas">${x.link}</span>
      </span>
    </a>
  </li>`
  ).join('');
  return `<section class="tratamientos" id="tratamientos" aria-labelledby="tratamientos-t">
  <div class="contenedor tratamientos__in">
    <div class="tratamientos__cab">
      <h2 id="tratamientos-t">Tratamientos en el consultorio</h2>
      <p>Desde un control de rutina hasta salvar una muela que parecía perdida. Todo en el mismo lugar y con la misma profesional.</p>
      <a class="btn btn--linea" href="/contacto/">Consultar por un tratamiento</a>
    </div>
    <ul class="tratamientos__lista">${filas}</ul>
  </div>
</section>`;
}

// ---------- Primera consulta (secuencia real de 3 pasos) ----------
function primeraConsulta() {
  const pasos = [
    ['Escribís por WhatsApp', 'Contanos el motivo de la consulta y qué días te quedan cómodos. Te respondemos con los turnos disponibles.'],
    ['Evaluamos tu caso', 'Revisamos dientes y encías, escuchamos lo que te pasa y, si hace falta, pedimos estudios.'],
    ['Te explico el plan', 'Antes de empezar sabés qué tratamiento necesitás, cuántas sesiones lleva y cuánto cuesta.'],
  ];
  return `<section class="primera" aria-labelledby="primera-t">
  <div class="contenedor">
    <h2 id="primera-t">Cómo es tu primera consulta</h2>
    <ol class="primera__pasos">${pasos
      .map(([t, d], i) => `<li class="primera__paso"><span class="primera__n" aria-hidden="true">${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`)
      .join('')}</ol>
  </div>
</section>`;
}

// ---------- Retrato (espacio para la foto de Jimena) ----------
// Para usar una foto real: guardá /public/img/jimena.webp (800x1000) y cambiá FOTO a true en construir.js
function retrato({ foto = false, clase = '' } = {}) {
  const interior = foto
    ? `<img src="/img/jimena.webp" width="800" height="1000" alt="Jimena Teruel, odontóloga, en su consultorio de Escobar" loading="lazy" decoding="async">`
    : `<div class="retrato__arte">${emblema({ prefijo: 'rt', clase: 'retrato__emblema' })}</div>`;
  return `<figure class="retrato ${clase}">
  <div class="retrato__marco">${interior}</div>
  <figcaption><strong>Jimena Teruel</strong><span>Odontóloga, especialista en Endodoncia. M.P. ${N.matriculaNumero}</span></figcaption>
</figure>`;
}

// ---------- Hero de páginas internas ----------
function heroInterno({ migasHTML, h1, lead, iconoNombre, cta = true, mensaje, ctaSecundario }) {
  return `<section class="pag-hero">
  <div class="contenedor pag-hero__in">
    <div class="pag-hero__txt">
      ${migasHTML}
      <h1>${h1}</h1>
      <p class="lead">${lead}</p>
      ${cta ? `<div class="acciones">
        <a class="btn btn--wa" href="${wa(mensaje)}" target="_blank" rel="noopener">${UI.whatsapp}Pedir turno por WhatsApp</a>
        ${ctaSecundario || ''}
      </div>` : ''}
    </div>
    <div class="pag-hero__arte" aria-hidden="true">
      <div class="pag-hero__disco"></div>
      ${icono(iconoNombre, 'icono--xl dibujar dibujar--ya')}
    </div>
  </div>
</section>`;
}

// ---------- Índice lateral + tarjeta de turno ----------
function lateral(indice = []) {
  return `<aside class="lateral">
  ${indice.length ? `<nav class="indice" aria-label="En esta página"><p class="indice__t">En esta página</p><ol>${indice
    .map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`)
    .join('')}</ol></nav>` : ''}
  <div class="turno-mini">
    <p class="turno-mini__t">¿Querés que lo veamos?</p>
    <p>Escribinos por WhatsApp y coordinamos un turno.</p>
    <a class="btn btn--wa btn--bloque" href="${wa()}" target="_blank" rel="noopener">${UI.whatsapp}Pedir turno</a>
    <p class="turno-mini__dir">${UI.pin}<span>${esc(N.direccion.calle)}, ${esc(N.direccion.detalle.toLowerCase())}</span></p>
  </div>
</aside>`;
}

// ---------- Enlaces relacionados ----------
function relacionados(ids) {
  const items = TRATAMIENTOS.filter((x) => ids.includes(x.id));
  const ico = { endodoncia: 'endodoncia', general: 'general', ortodoncia: 'ortodoncia', urgencias: 'urgencias' };
  return `<section class="relacionados" aria-labelledby="rel-t">
  <div class="contenedor">
    <h2 id="rel-t">También te puede interesar</h2>
    <ul class="relacionados__lista">${items
      .map((x) => `<li><a href="${x.ruta}">${icono(ico[x.id], 'dibujar')}<span><strong>${x.t}</strong><span>${x.d}</span></span></a></li>`)
      .join('')}</ul>
  </div>
</section>`;
}

module.exports = {
  explorador, chequeo, mapa, ubicacion, tratamientos, primeraConsulta, retrato, heroInterno, lateral, relacionados, PASOS,
};
