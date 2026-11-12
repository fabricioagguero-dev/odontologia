const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { D, abs, N } = B;

module.exports = function ortodoncia() {
  const id = 'ortodoncia';
  const faqs = D.faq.ortodoncia;

  const cuerpo = `
${C.heroInterno({
  migasHTML: B.migas(id),
  h1: 'Ortodoncia en Escobar, en el mismo consultorio',
  lead: 'Una ortodoncista viene al consultorio para atender a los pacientes. Hacés la evaluación, el tratamiento y los controles en el lugar donde ya te atendés.',
  iconoNombre: 'ortodoncia',
  mensaje: 'Hola Jimena, quisiera un turno para una evaluación de ortodoncia.',
})}

<div class="contenedor articulo">
  <div class="prosa">
    <section id="que-corrige">
      <h2>¿Qué corrige la ortodoncia?</h2>
      <p>La ortodoncia mueve los dientes y guía el crecimiento de los maxilares para que la mordida funcione bien. No es solo estética: una mordida correcta reparte mejor las fuerzas al masticar y hace más fácil la higiene.</p>
      <ul class="lista-check">
        <li>Dientes apiñados, torcidos o encimados.</li>
        <li>Espacios entre los dientes.</li>
        <li>Mordida cruzada, abierta o profunda.</li>
        <li>Dientes que sobresalen hacia adelante.</li>
      </ul>
    </section>

    <section id="mismo-consultorio">
      <h2>Por qué conviene hacerla en el mismo consultorio</h2>
      <p>Antes de colocar cualquier aparato, la boca tiene que estar sana: sin caries ni inflamación de encías. Como la ortodoncista atiende en el consultorio de Jimena, los controles generales y la ortodoncia se coordinan entre ellas, y vos no tenés que andar yendo de un lugar a otro.</p>
      <p>Durante el tratamiento, si aparece una caries o necesitás una limpieza, se resuelve ahí mismo.</p>
    </section>

    <section id="como-empieza">
      <h2>Cómo empieza un tratamiento de ortodoncia</h2>
      <ol class="lista-pasos">
        <li><strong>Evaluación con la ortodoncista.</strong> Revisa tu mordida y te cuenta si hace falta tratamiento y en qué momento conviene empezar.</li>
        <li><strong>Estudios.</strong> Radiografías y fotos para planificar los movimientos con precisión.</li>
        <li><strong>Plan y presupuesto.</strong> Te explica las opciones de aparatología, fija (brackets) o removible según el caso, y cuánto dura el tratamiento.</li>
        <li><strong>Colocación y controles.</strong> Los ajustes se hacen en el consultorio, en visitas periódicas.</li>
      </ol>
    </section>

    <section id="faq">
      <h2>Preguntas frecuentes sobre ortodoncia</h2>
      ${B.faqHTML(faqs, { abierta: 0 })}
    </section>
  </div>
  ${C.lateral([['que-corrige', 'Qué corrige'], ['mismo-consultorio', 'En el mismo consultorio'], ['como-empieza', 'Cómo empieza'], ['faq', 'Preguntas frecuentes']])}
</div>

${C.relacionados(['general', 'endodoncia'])}

${B.ctaFinal({
  titulo: '¿Querés saber si necesitás ortodoncia?',
  texto: 'Escribinos por WhatsApp y coordinamos un turno de evaluación con la ortodoncista.',
  mensaje: 'Hola Jimena, quisiera un turno para una evaluación de ortodoncia.',
})}
`;

  const servicio = {
    '@type': 'Service',
    '@id': abs('/ortodoncia/#servicio'),
    name: 'Ortodoncia',
    serviceType: 'Ortodoncia',
    url: abs('/ortodoncia/'),
    description: 'Evaluación y tratamiento de ortodoncia con ortodoncista que atiende en el consultorio de Belén de Escobar.',
    provider: { '@id': B.ID.consultorio },
    areaServed: N.zonas.map((z) => ({ '@type': 'City', name: z })),
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
