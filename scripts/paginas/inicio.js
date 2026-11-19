const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { emblema, petalo, UI } = require('../plantillas/svg');
const { D, N, wa, esc } = B;

// Divide el título en palabras para la animación de entrada (CSS puro, sin esperar JS).
function palabras(txt) {
  return txt
    .split(' ')
    .map((w) => `<span class="w"><span>${w}</span></span>`)
    .join(' ');
}

module.exports = function inicio({ foto = '' } = {}) {
  const T = D.textos;
  // Preguntas del inicio: si alguna se borra desde el panel, se completa con otras.
  const elegidas = [D.faq.endodoncia[0], D.faq.endodoncia[1], D.faq.endodoncia[3], D.faq.general[2], D.faq.consultorio[1]].filter(Boolean);
  const resto = Object.values(D.faq).flat().filter((q) => !elegidas.includes(q));
  const faqs = [...elegidas, ...resto].slice(0, 5);
  const iconosDestacados = [UI.persona, UI.escudo, UI.dos, UI.escudo];

  const cuerpo = `
<section class="hero" aria-labelledby="hero-t">
  <div class="contenedor hero__in">
    <div class="hero__texto">
      <h1 id="hero-t" class="hero__titulo">${palabras(esc(T.heroTitulo))}</h1>
      <p class="hero__lead">${esc(T.heroBajada)}</p>
      <div class="acciones hero__acciones">
        <a class="btn btn--wa btn--grande" href="${wa()}" target="_blank" rel="noopener">${UI.whatsapp}Pedir turno por WhatsApp</a>
        <a class="btn btn--linea btn--grande" href="#tratamientos">Ver tratamientos</a>
      </div>
      <ul class="hero__datos">
        <li>${UI.pin}<span>${esc(N.direccion.calle)}, ${esc(N.direccion.detalle.toLowerCase())}</span></li>
        <li>${UI.escudo}<span>Matrícula Provincial ${N.matriculaNumero}</span></li>
      </ul>
    </div>
    <div class="hero__arte" data-parallax aria-hidden="true">
      <div class="hero__disco" data-capa="0.3"></div>
      <div class="hero__emblema" data-capa="1">${emblema({ animado: true, prioridad: true })}</div>
      <div class="hero__petalos" data-capa="1.8">${petalo('ps1')}${petalo('ps2')}${petalo('ps3')}${petalo('ps4')}</div>
    </div>
  </div>
</section>

<section class="porque" id="por-que" aria-label="Por qué atenderte en el consultorio">
  <ul class="contenedor porque__lista">
    ${T.destacados.map((x, i) => `<li>${iconosDestacados[i] || UI.escudo}<div><h2 class="porque__t">${esc(x.titulo)}</h2><p>${esc(x.texto)}</p></div></li>`).join('\n    ')}
  </ul>
</section>

${C.tratamientos()}

${C.explorador()}

${C.chequeo()}

<section class="sobre" aria-labelledby="sobre-t">
  <div class="contenedor sobre__in">
    ${C.retrato({ foto })}
    <div class="sobre__txt">
      <h2 id="sobre-t">Jimena Teruel, tu odontóloga en ${esc(N.direccion.partido)}</h2>
      ${T.presentacion.map((p, i) => `<p${i === 0 ? ' class="sobre__lead"' : ''}>${esc(p)}</p>`).join('\n      ')}
      <a class="enlace" href="/sobre-mi/">Conocé más sobre mí y el consultorio</a>
    </div>
  </div>
</section>

${C.opiniones()}

${C.primeraConsulta()}

<section class="preguntas" aria-labelledby="preguntas-t">
  <div class="contenedor preguntas__in">
    <div class="preguntas__cab">
      <h2 id="preguntas-t">Preguntas frecuentes</h2>
      <p>Lo que más nos consultan antes de pedir un turno.</p>
      <a class="enlace" href="/preguntas-frecuentes/">Ver todas las preguntas</a>
    </div>
    ${B.faqHTML(faqs, { abierta: 0 })}
  </div>
</section>

${C.ubicacion()}

${B.ctaFinal()}
`;

  const schema = [...B.nodosBase(), B.paginaSchema('inicio'), B.migasSchema('inicio'), B.faqSchema('inicio', faqs)];
  return B.documento('inicio', { cuerpo, schema, claseBody: 'es-inicio', precargarHero: true });
};
