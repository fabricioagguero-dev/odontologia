const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { icono } = require('../plantillas/svg');
const { D, abs, N } = B;

module.exports = function odontologiaGeneral() {
  const id = 'odontologia-general';
  const faqs = D.faq.general;

  const servicios = [
    ['consulta', 'consulta', 'Consulta y diagnóstico', 'Revisión completa de dientes y encías. Te explico qué encontré y armamos un plan con prioridades claras.'],
    ['limpieza', 'prevencion', 'Limpieza y prevención', 'Eliminación de sarro y placa, pulido y consejos de cepillado para cuidar tus encías y prevenir caries.'],
    ['arreglos', 'restauracion', 'Arreglos de caries', 'Restauraciones con resinas del color del diente, que se adhieren a la pieza y quedan naturales.'],
    ['extracciones', 'extraccion', 'Extracciones', 'Cuando un diente no se puede conservar, lo extraemos de forma cuidada y te explico las opciones para reemplazarlo.'],
    ['conducto', 'endodoncia', 'Tratamiento de conducto', 'Mi especialidad. Si el nervio está comprometido, hacemos la endodoncia en el mismo consultorio.', '/endodoncia/'],
    ['urgencia', 'urgencias', 'Urgencias', 'Dolor, flemón o un diente roto. Escribinos y buscamos el turno más próximo disponible.', '/urgencias/'],
  ];

  const cuerpo = `
${C.heroInterno({
  migasHTML: B.migas(id),
  h1: 'Odontología general en Escobar',
  lead: 'Controles, limpieza, arreglos y extracciones con la misma odontóloga que conoce tu historia. Un consultorio tranquilo en el centro de Belén de Escobar.',
  iconoNombre: 'general',
  mensaje: 'Hola Jimena, quisiera pedir un turno para un control.',
})}

<section class="servicios" aria-labelledby="servicios-t">
  <div class="contenedor">
    <h2 id="servicios-t" class="servicios__t">Qué hacemos en el consultorio</h2>
    <ul class="servicios__lista">${servicios
      .map(
        ([ancla, ico, t, d, link]) => `<li class="servicio" id="${ancla}">
      ${icono(ico, 'servicio__icono dibujar')}
      <h3>${t}</h3>
      <p>${d}</p>
      ${link ? `<a class="enlace" href="${link}">Ver ${t.toLowerCase()}</a>` : ''}
    </li>`
      )
      .join('')}</ul>
  </div>
</section>

<div class="contenedor articulo">
  <div class="prosa">
    <section id="prevenir">
      <h2>Prevenir siempre es más simple</h2>
      <p>Una caries detectada a tiempo se resuelve con un arreglo pequeño, en una sola sesión. La misma caries, si avanza hasta el nervio, puede necesitar un tratamiento de conducto. Por eso los controles periódicos son la forma más fácil y económica de cuidar tus dientes.</p>
      <p>En general recomendamos un control con limpieza <strong>cada seis meses</strong>. Si tenés tendencia a las caries, encías que sangran o usás aparatos de ortodoncia, puede convenir que sea más seguido.</p>
    </section>
    <section id="misma-profesional">
      <h2>La misma profesional en cada turno</h2>
      <p>Jimena trabaja sola en el consultorio. Eso hace una diferencia: conoce tu historia clínica, recuerda qué tratamientos hicieron y puede seguir tu evolución de un control al siguiente, sin empezar de cero cada vez.</p>
    </section>
    <section id="faq">
      <h2>Preguntas frecuentes</h2>
      ${B.faqHTML(faqs, { abierta: 0 })}
    </section>
  </div>
  ${C.lateral([['servicios-t', 'Qué hacemos'], ['prevenir', 'Prevenir es más simple'], ['misma-profesional', 'La misma profesional'], ['faq', 'Preguntas frecuentes']])}
</div>

${C.relacionados(['endodoncia', 'ortodoncia'])}

${B.ctaFinal({ mensaje: 'Hola Jimena, quisiera pedir un turno para un control.' })}
`;

  const servicio = {
    '@type': 'Service',
    '@id': abs('/odontologia-general/#servicio'),
    name: 'Odontología general',
    serviceType: 'Odontología general',
    url: abs('/odontologia-general/'),
    provider: { '@id': B.ID.consultorio },
    areaServed: N.zonas.map((z) => ({ '@type': 'City', name: z })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Odontología general',
      itemListElement: servicios.slice(0, 4).map(([, , t, d]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t, description: d } })),
    },
  };

  const schema = [
    ...B.nodosBase(),
    B.paginaSchema(id, { tipo: 'MedicalWebPage', about: { '@id': servicio['@id'] }, extra: { specialty: 'https://schema.org/Dentistry' } }),
    servicio,
    B.migasSchema(id),
    B.faqSchema(id, faqs),
  ];
  return B.documento(id, { cuerpo, schema });
};
