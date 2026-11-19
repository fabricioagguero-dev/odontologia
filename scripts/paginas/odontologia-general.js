const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { icono } = require('../plantillas/svg');
const { D, abs, N, esc } = B;

module.exports = function odontologiaGeneral() {
  const id = 'odontologia-general';
  const faqs = D.faq.general;

  // Todos los tratamientos que no tienen página propia (se editan desde el panel).
  const servicios = C.TRATAMIENTOS.filter((x) => !x.conPagina).map((x) => [x.id, x.icono, x.t, x.detalle]);

  const cuerpo = `
${C.heroInterno({
  migasHTML: B.migas(id),
  h1: 'Odontología general en Escobar',
  lead: 'Limpiezas, operatoria dental, prótesis, implantes, postes de fibra de vidrio y blanqueamientos, con la misma odontóloga que conoce tu historia. En el centro de Belén de Escobar.',
  iconoNombre: 'general',
  mensaje: 'Hola Jimena, quisiera pedir un turno para un control.',
})}

<section class="servicios" aria-labelledby="servicios-t">
  <div class="contenedor">
    <h2 id="servicios-t" class="servicios__t">Tratamientos que hacemos en el consultorio</h2>
    <ul class="servicios__lista">${servicios
      .map(
        ([ancla, ico, t, d]) => `<li class="servicio" id="${ancla}">
      ${icono(ico, 'servicio__icono dibujar')}
      <h3>${esc(t)}</h3>
      <p>${esc(d)}</p>
      <a class="enlace" href="${B.wa(`Hola Jimena, quisiera consultar por ${t.toLowerCase()}.`)}" target="_blank" rel="noopener">Consultar por ${esc(t.toLowerCase())}</a>
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
      itemListElement: servicios.map(([, , t, d]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t, description: d } })),
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
