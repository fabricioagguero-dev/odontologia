const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { D, abs, wa } = B;

module.exports = function endodoncia() {
  const id = 'endodoncia';
  const faqs = D.faq.endodoncia;
  const indice = [
    ['que-es', '¿Qué es una endodoncia?'],
    ['sintomas', 'Señales de que la necesitás'],
    ['como-es-una-endodoncia', 'Paso a paso'],
    ['retratamiento', 'Retratamiento de conducto'],
    ['especialista', '¿Por qué con una especialista?'],
    ['despues', 'Después del tratamiento'],
    ['costo', '¿Cuánto cuesta?'],
    ['faq', 'Preguntas frecuentes'],
  ];

  const cuerpo = `
${C.heroInterno({
  migasHTML: B.migas(id),
  h1: 'Endodoncia en Escobar: tratamiento de conducto con especialista',
  lead: 'La endodoncia permite salvar un diente con el nervio inflamado o infectado. Soy odontóloga especialista en Endodoncia y hago tratamientos y retratamientos de conducto en mi consultorio de Belén de Escobar.',
  iconoNombre: 'endodoncia',
  mensaje: 'Hola Jimena, quisiera un turno para consultar por una endodoncia.',
  ctaSecundario: '<a class="btn btn--linea" href="#como-es-una-endodoncia">Ver el paso a paso</a>',
})}

<div class="contenedor articulo">
  <div class="prosa">
    <section id="que-es">
      <h2>¿Qué es una endodoncia?</h2>
      <p>Dentro de cada diente hay un tejido blando, la <strong>pulpa</strong>, formado por nervios y vasos sanguíneos, que recorre la corona y los conductos de la raíz. Cuando una caries profunda, una fractura o un golpe llegan hasta ella, la pulpa se inflama o se infecta y ya no se recupera sola.</p>
      <p>La endodoncia, también llamada <strong>tratamiento de conducto</strong>, consiste en retirar ese tejido dañado, limpiar y desinfectar los conductos y sellarlos. El diente sigue en tu boca, cumpliendo su función, sin dolor ni infección.</p>
    </section>

    <section id="sintomas">
      <h2>Señales de que podrías necesitar un tratamiento de conducto</h2>
      <ul class="lista-check">
        <li>Dolor intenso que aparece solo o que te despierta a la noche.</li>
        <li>Sensibilidad al frío o al calor que dura varios segundos después del estímulo.</li>
        <li>Dolor al masticar o al tocar el diente.</li>
        <li>Encía hinchada o un granito (fístula) cerca del diente.</li>
        <li>Un diente que se oscureció, muchas veces después de un golpe.</li>
      </ul>
      <p>A veces no hay ningún síntoma y la infección aparece en una radiografía de control. Por eso la evaluación profesional es lo que define si hace falta el tratamiento.</p>
    </section>
  </div>
  ${C.lateral(indice)}
</div>

${C.explorador()}

<div class="contenedor articulo">
  <div class="prosa">
    <section id="retratamiento">
      <h2>Retratamiento de conducto</h2>
      <p>Un diente que ya tuvo una endodoncia puede volver a infectarse años después: por una filtración en la restauración, una caries nueva o conductos que no se trataron por completo. En esos casos hacemos un <strong>retratamiento endodóntico</strong>: retiramos el material anterior, volvemos a limpiar y desinfectar cada conducto y lo sellamos de nuevo.</p>
      <p>Es una de las situaciones donde más pesa la formación de especialidad, porque cada caso es distinto y requiere conocer muy bien la anatomía interna del diente.</p>
    </section>

    <section id="especialista">
      <h2>¿Por qué hacer la endodoncia con una especialista?</h2>
      <p>Cada diente tiene una anatomía propia: conductos curvos, muy finos o ramificados que no se ven a simple vista. La especialidad en Endodoncia está dedicada justamente a eso: encontrar, limpiar y sellar cada conducto para que el tratamiento dure.</p>
      <p>El objetivo es siempre el mismo: <strong>conservar tu diente natural</strong>. Un diente propio bien tratado mastica, se siente y se cuida como cualquier otro, y evita tener que reemplazarlo con un implante o una prótesis.</p>
    </section>

    <section id="despues">
      <h2>Después del tratamiento</h2>
      <ul class="lista-check">
        <li>Puede quedar una molestia leve por unos días. Se controla con la medicación que te indico.</li>
        <li>Hasta la restauración definitiva, evitá morder cosas duras de ese lado.</li>
        <li>Si te indico un perno o una corona, conviene no demorarlo: protege al diente de fracturas.</li>
        <li>Seguí con tus controles. Una radiografía a los meses confirma que todo cicatrizó bien.</li>
      </ul>
    </section>

    <section id="costo">
      <h2>¿Cuánto cuesta una endodoncia?</h2>
      <p>El valor depende del diente (no es lo mismo un incisivo con un conducto que una muela con tres o cuatro), de si es un primer tratamiento o un retratamiento y de la restauración que necesite después. En la primera consulta evaluamos tu caso y te paso un presupuesto claro antes de empezar.</p>
      <p><a class="enlace" href="${wa('Hola Jimena, quisiera consultar el presupuesto de una endodoncia.')}" target="_blank" rel="noopener">Consultar presupuesto por WhatsApp</a></p>
    </section>

    <section id="faq">
      <h2>Preguntas frecuentes sobre endodoncia</h2>
      ${B.faqHTML(faqs, { abierta: 0 })}
    </section>
  </div>
  <div class="lateral lateral--vacio" aria-hidden="true"></div>
</div>

${C.relacionados(['urgencias', 'general'])}

${B.ctaFinal({
  titulo: '¿Te indicaron una endodoncia o te duele una muela?',
  texto: 'Escribinos por WhatsApp. Evaluamos el diente y te explico las opciones antes de empezar.',
  mensaje: 'Hola Jimena, quisiera un turno para consultar por una endodoncia.',
})}
`;

  const procedimiento = {
    '@type': 'MedicalProcedure',
    '@id': abs('/endodoncia/#procedimiento'),
    name: 'Endodoncia (tratamiento de conducto)',
    alternateName: ['Tratamiento de conducto', 'Tratamiento endodóntico', 'Retratamiento de conducto'],
    url: abs('/endodoncia/'),
    description: 'Tratamiento que elimina la pulpa inflamada o infectada, limpia, desinfecta y sella los conductos radiculares para conservar el diente natural.',
    procedureType: 'https://schema.org/TherapeuticProcedure',
    bodyLocation: 'Pulpa dental y conductos radiculares',
    preparation: 'Evaluación clínica y radiográfica del diente.',
    howPerformed: C.PASOS.map((p, i) => `${i + 1}. ${p.t}: ${p.d}`).join(' '),
    followup: 'Restauración definitiva del diente y control radiográfico.',
    relevantSpecialty: 'https://schema.org/Dentistry',
  };

  const schema = [
    ...B.nodosBase(),
    B.paginaSchema(id, { tipo: 'MedicalWebPage', about: { '@id': procedimiento['@id'] }, extra: { specialty: 'https://schema.org/Dentistry', mainEntity: { '@id': procedimiento['@id'] } } }),
    procedimiento,
    B.migasSchema(id),
    B.faqSchema(id, faqs),
  ];
  return B.documento(id, { cuerpo, schema });
};
