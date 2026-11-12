const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { D } = B;

module.exports = function preguntas() {
  const id = 'preguntas-frecuentes';
  const grupos = [
    ['endodoncia', 'Endodoncia y tratamiento de conducto', D.faq.endodoncia, '/endodoncia/'],
    ['general', 'Odontología general', D.faq.general, '/odontologia-general/'],
    ['ortodoncia', 'Ortodoncia', D.faq.ortodoncia, '/ortodoncia/'],
    ['urgencias', 'Urgencias', D.faq.urgencias, '/urgencias/'],
    ['turnos', 'Turnos y consultorio', D.faq.consultorio, '/contacto/'],
  ];
  const todas = grupos.flatMap((g) => g[2]);

  const cuerpo = `
${C.heroInterno({
  migasHTML: B.migas(id),
  h1: 'Preguntas frecuentes',
  lead: 'Respuestas claras a lo que más nos consultan sobre endodoncia, tratamientos y turnos. Si tu duda no está acá, escribinos.',
  iconoNombre: 'consulta',
  mensaje: 'Hola Jimena, tengo una consulta: ',
})}

<div class="contenedor articulo">
  <div class="prosa">
    ${grupos
      .map(
        ([ancla, t, lista, ruta]) => `<section id="${ancla}" class="faq-grupo">
      <h2>${t}</h2>
      ${B.faqHTML(lista)}
      <p class="faq-grupo__mas"><a class="enlace" href="${ruta}">${ruta === '/contacto/' ? 'Ver datos de contacto' : `Más sobre ${t.split(' ')[0].toLowerCase()}`}</a></p>
    </section>`
      )
      .join('')}
  </div>
  ${C.lateral(grupos.map(([a, t]) => [a, t]))}
</div>

${B.ctaFinal({ titulo: '¿No encontraste tu respuesta?', texto: 'Escribinos por WhatsApp con tu pregunta y te respondemos.', mensaje: 'Hola Jimena, tengo una consulta: ' })}
`;

  const schema = [...B.nodosBase(), B.paginaSchema(id), B.migasSchema(id), B.faqSchema(id, todas)];
  return B.documento(id, { cuerpo, schema });
};
