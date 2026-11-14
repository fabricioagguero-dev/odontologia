const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { UI } = require('../plantillas/svg');
const { D, wa } = B;

module.exports = function urgencias() {
  const id = 'urgencias';
  const faqs = D.faq.urgencias;

  const casos = [
    ['dolor', 'Dolor de muela intenso', 'Puede ser el nervio inflamado. Evitá masticar de ese lado y los cambios bruscos de temperatura. No te pongas aspirina ni otros medicamentos sobre la encía: lastiman el tejido.'],
    ['flemon', 'Encía o cara hinchada (flemón)', 'Es una señal de infección. Podés aplicar frío por fuera, sobre la mejilla, en intervalos cortos. No pongas calor. Si la hinchazón avanza hacia el ojo o el cuello, o tenés fiebre, andá a una guardia.'],
    ['roto', 'Diente roto o fisurado', 'Guardá el fragmento si lo tenés y evitá morder con ese diente hasta que lo veamos.'],
    ['arreglo', 'Se salió un arreglo o una corona', 'Guardá la corona y no intentes pegarla con adhesivos caseros. Evitá alimentos muy duros o pegajosos de ese lado.'],
    ['golpe', 'Un golpe sacó un diente entero', 'Si es un diente permanente, tomalo de la corona y no de la raíz, no lo frotes y conservalo en leche o dentro de la boca. Es una urgencia real: atendete cuanto antes, idealmente dentro de la primera hora.'],
  ];

  const mensaje = 'Hola Jimena, tengo una urgencia: ';

  const cuerpo = `
${C.heroInterno({
  migasHTML: B.migas(id),
  h1: 'Urgencias odontológicas en Escobar',
  lead: 'Si te duele una muela, se te hinchó la cara o se te rompió un diente, escribinos por WhatsApp contando qué te pasa y desde cuándo. Buscamos el turno más próximo disponible.',
  iconoNombre: 'urgencias',
  mensaje,
})}

<section class="casos" aria-labelledby="casos-t">
  <div class="contenedor">
    <h2 id="casos-t">Qué hacer mientras tanto, según lo que te pase</h2>
    <div class="casos__lista">${casos
      .map(
        ([ancla, t, d]) => `<details class="caso" id="${ancla}"${ancla === 'dolor' ? ' open' : ''}>
      <summary><span>${t}</span>${UI.mas}</summary>
      <div class="caso__r"><p>${d}</p><a class="enlace" href="${wa(mensaje + t.toLowerCase())}" target="_blank" rel="noopener">Avisar por WhatsApp</a></div>
    </details>`
      )
      .join('')}</div>
    <aside class="alerta" aria-labelledby="alerta-t">
      <p class="alerta__t" id="alerta-t">Cuándo ir directamente a una guardia</p>
      <p>Si tenés la cara muy hinchada y la hinchazón avanza hacia el ojo o el cuello, fiebre, dificultad para tragar o respirar, o un golpe fuerte en la cara o la cabeza, andá a la guardia de un hospital sin esperar un turno.</p>
    </aside>
  </div>
</section>

${C.chequeo({ titulo: '¿Qué tan urgente es? Revisá tus síntomas' })}

<div class="contenedor articulo">
  <div class="prosa">
    <section id="faq">
      <h2>Preguntas frecuentes sobre urgencias</h2>
      ${B.faqHTML(faqs, { abierta: 0 })}
    </section>
  </div>
  ${C.lateral()}
</div>

${C.relacionados(['endodoncia', 'general'])}

${B.ctaFinal({
  titulo: '¿Te duele ahora?',
  texto: 'Escribinos por WhatsApp contando qué te pasa. Cuanto antes se trata, más simple suele ser la solución.',
  mensaje,
})}
`;

  const schema = [
    ...B.nodosBase(),
    B.paginaSchema(id, { tipo: 'MedicalWebPage', extra: { specialty: 'https://schema.org/Dentistry' } }),
    B.migasSchema(id),
    B.faqSchema(id, faqs),
  ];
  return B.documento(id, { cuerpo, schema });
};
