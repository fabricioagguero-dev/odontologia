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

module.exports = function inicio() {
  const faqs = [D.faq.endodoncia[0], D.faq.endodoncia[1], D.faq.endodoncia[3], D.faq.general[2], D.faq.consultorio[1]];

  const cuerpo = `
<section class="hero" aria-labelledby="hero-t">
  <div class="contenedor hero__in">
    <div class="hero__texto">
      <h1 id="hero-t" class="hero__titulo">${palabras('Odontóloga en Escobar, especialista en endodoncia.')}</h1>
      <p class="hero__lead">Tratamientos de conducto, odontología general y ortodoncia en un consultorio tranquilo del centro de Escobar. En cada consulta te atiende la misma profesional, de principio a fin.</p>
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
      <div class="hero__emblema" data-capa="1">${emblema({ prefijo: 'hero', clase: 'emblema--hero', animado: true })}</div>
      <div class="hero__petalos" data-capa="1.8">${petalo('ps1')}${petalo('ps2')}${petalo('ps3')}${petalo('ps4')}</div>
    </div>
  </div>
</section>

<section class="porque" id="por-que" aria-label="Por qué atenderte en el consultorio">
  <ul class="contenedor porque__lista">
    <li>${UI.persona}<div><h2 class="porque__t">Te atiende siempre Jimena</h2><p>Trabaja sola: conoce tu historia y sigue cada tratamiento de cerca.</p></div></li>
    <li>${UI.escudo}<div><h2 class="porque__t">Especialista en Endodoncia</h2><p>Formación dedicada a salvar dientes que parecían perdidos.</p></div></li>
    <li>${UI.dos}<div><h2 class="porque__t">Ortodoncista en el consultorio</h2><p>Hacés tu ortodoncia en el mismo lugar, sin derivaciones.</p></div></li>
  </ul>
</section>

${C.tratamientos()}

${C.explorador()}

${C.chequeo()}

<section class="sobre" aria-labelledby="sobre-t">
  <div class="contenedor sobre__in">
    ${C.retrato()}
    <div class="sobre__txt">
      <h2 id="sobre-t">Jimena Teruel, tu odontóloga en Escobar</h2>
      <p class="sobre__lead">Soy odontóloga y me especialicé en Endodoncia, la rama de la odontología que trata el interior del diente: el nervio y los conductos.</p>
      <p>Además atiendo odontología general, así que la mayoría de tus tratamientos los podés resolver en un solo lugar. Trabajo sola en el consultorio: en cada turno te atiendo yo, sé qué hicimos la vez anterior y qué sigue.</p>
      <p>Para ortodoncia, una colega ortodoncista viene al consultorio a atender a mis pacientes. Así coordinamos entre las dos y vos no tenés que ir de un lado a otro.</p>
      <a class="enlace" href="/sobre-mi/">Conocé más sobre mí y el consultorio</a>
    </div>
  </div>
</section>

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
  return B.documento('inicio', { cuerpo, schema, claseBody: 'es-inicio' });
};
