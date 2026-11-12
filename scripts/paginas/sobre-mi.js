const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { UI } = require('../plantillas/svg');
const { N, abs } = B;

module.exports = function sobreMi({ foto = false } = {}) {
  const id = 'sobre-mi';

  const cuerpo = `
<section class="pag-hero pag-hero--perfil">
  <div class="contenedor pag-hero__in">
    <div class="pag-hero__txt">
      ${B.migas(id)}
      <h1>Jimena Teruel, odontóloga especialista en Endodoncia</h1>
      <p class="lead">Atiendo en mi consultorio de Belén de Escobar: endodoncia, odontología general y, junto a una colega ortodoncista, ortodoncia.</p>
      <ul class="credenciales">
        <li>${UI.escudo}<span><strong>Matrícula Provincial ${N.matriculaNumero}</strong>Provincia de Buenos Aires</span></li>
        <li>${UI.persona}<span><strong>Especialista en Endodoncia</strong>Tratamientos y retratamientos de conducto</span></li>
      </ul>
    </div>
    ${C.retrato({ foto, clase: 'retrato--hero' })}
  </div>
</section>

<div class="contenedor articulo">
  <div class="prosa">
    <section id="forma-de-trabajar">
      <h2>Mi forma de trabajar</h2>
      <p class="prosa__lead">Me gusta que cada persona salga del consultorio entendiendo qué tiene, qué opciones hay y por qué le recomiendo una.</p>
      <div class="valores">
        <div class="valor"><h3>Siempre te atiendo yo</h3><p>Trabajo sola en el consultorio. Conozco tu historia y sigo cada tratamiento de principio a fin.</p></div>
        <div class="valor"><h3>Tiempo para explicar</h3><p>Antes de empezar sabés qué vamos a hacer, cuántas sesiones lleva y cuánto cuesta.</p></div>
        <div class="valor"><h3>Conservar lo natural</h3><p>Mi especialidad existe para salvar dientes. Sacar una pieza es siempre la última opción.</p></div>
      </div>
    </section>

    <section id="especialidad">
      <h2>Especialidad en Endodoncia</h2>
      <p>La Endodoncia es la especialidad que trata el interior del diente: la pulpa, o nervio, y los conductos de la raíz. Me formé específicamente en esta área porque es la que permite conservar dientes que de otra manera se perderían, con tratamientos precisos y pensados para durar.</p>
      <p>Además de mi especialidad, atiendo odontología general: controles, limpiezas, arreglos y extracciones. Así, la mayoría de tus tratamientos se resuelven en un solo lugar.</p>
    </section>

    <section id="ortodoncista">
      <h2>Una ortodoncista en el consultorio</h2>
      <p>Para ortodoncia trabajo con una colega ortodoncista que viene al consultorio a atender a mis pacientes. Coordinamos entre las dos: antes de colocar aparatos me ocupo de que tu boca esté sana, y durante el tratamiento seguimos tu evolución en conjunto.</p>
    </section>

    <section id="consultorio">
      <h2>El consultorio</h2>
      <p>Estoy en <strong>${N.direccion.calle}, ${N.direccion.detalle.toLowerCase()}</strong>, en el centro de ${N.direccion.localidad}. Atiendo con turno previo, que podés pedir por WhatsApp.</p>
    </section>
  </div>
  ${C.lateral([['forma-de-trabajar', 'Mi forma de trabajar'], ['especialidad', 'Especialidad en Endodoncia'], ['ortodoncista', 'Ortodoncista en el consultorio'], ['consultorio', 'El consultorio']])}
</div>

${C.ubicacion({ titulo: 'Dónde atiendo' })}

${B.ctaFinal({ titulo: '¿Querés que nos conozcamos?', texto: 'Escribime por WhatsApp y coordinamos tu primera consulta.' })}
`;

  const schema = [
    ...B.nodosBase(),
    B.paginaSchema(id, { tipo: 'ProfilePage', about: { '@id': B.ID.persona }, extra: { mainEntity: { '@id': B.ID.persona } } }),
    B.migasSchema(id),
  ];
  return B.documento(id, { cuerpo, schema });
};
