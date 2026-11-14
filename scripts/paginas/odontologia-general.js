const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { icono } = require('../plantillas/svg');
const { D, abs, N } = B;

module.exports = function odontologiaGeneral() {
  const id = 'odontologia-general';
  const faqs = D.faq.general;

  const servicios = [
    ['limpiezas', 'prevencion', 'Limpiezas', 'Eliminación de sarro y placa, pulido y consejos de cepillado. Es la base para tener encías sanas y prevenir caries.'],
    ['operatoria', 'restauracion', 'Operatoria dental', 'Arreglos de caries y restauraciones con resinas del color del diente, que se adhieren a la pieza y quedan naturales.'],
    ['protesis', 'protesis', 'Prótesis fija y removible', 'Coronas y puentes fijos o prótesis removibles para reemplazar dientes perdidos y recuperar la forma de masticar y la estética.'],
    ['implantes', 'implantes', 'Implantología oral', 'Un implante es una raíz artificial de titanio sobre la que se coloca una corona fija. Es la forma más parecida a tener un diente propio.'],
    ['postes', 'postes', 'Postes de fibra de vidrio', 'Refuerzan desde adentro los dientes con tratamiento de conducto que perdieron estructura, para que la reconstrucción o la corona quede firme.'],
    ['blanqueamientos', 'blanqueamiento', 'Blanqueamientos', 'Aclarado del color de los dientes de forma segura, con productos profesionales y bajo control de la odontóloga.'],
  ];

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
      <h3>${t}</h3>
      <p>${d}</p>
      <a class="enlace" href="${B.wa(`Hola Jimena, quisiera consultar por ${t.toLowerCase()}.`)}" target="_blank" rel="noopener">Consultar por ${t.toLowerCase()}</a>
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
