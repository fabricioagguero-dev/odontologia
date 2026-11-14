const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { UI } = require('../plantillas/svg');
const { N } = B;

module.exports = function sobreMi({ foto = false, fotosConsultorio = [] } = {}) {
  const id = 'sobre-mi';
  const F = N.formacion;
  const titulo = F.anioTitulo ? ` en ${F.anioTitulo}` : '';
  const especialidad = F.anioEspecialidad ? ` en ${F.anioEspecialidad}` : '';
  const desde = F.consultorioDesde ? ` desde ${F.consultorioDesde}` : '';

  const cuerpo = `
<section class="pag-hero pag-hero--perfil">
  <div class="contenedor pag-hero__in">
    <div class="pag-hero__txt">
      ${B.migas(id)}
      <h1>Jimena Teruel, odontóloga especialista en Endodoncia</h1>
      <p class="lead">Atiendo en mi consultorio de Belén de Escobar: endodoncia, prótesis, implantes, limpiezas, operatoria dental, blanqueamientos y, junto a una colega ortodoncista, ortodoncia.</p>
      <ul class="credenciales">
        <li>${UI.persona}<span><strong>Odontóloga</strong>${F.universidad} (${F.universidadCorta})</span></li>
        <li>${UI.escudo}<span><strong>Especialista en Endodoncia</strong>${F.universidadCorta}${F.anioEspecialidad ? `, ${F.anioEspecialidad}` : ''}</span></li>
        <li>${UI.escudo}<span><strong>Matrícula Provincial ${N.matriculaNumero}</strong>Provincia de Buenos Aires</span></li>
      </ul>
    </div>
    ${C.retrato({ foto, clase: 'retrato--hero' })}
  </div>
</section>

<div class="contenedor articulo">
  <div class="prosa">
    <section id="formacion">
      <h2>Mi formación</h2>
      <p class="prosa__lead">Soy odontóloga recibida en la ${F.universidad} (${F.universidadCorta})${titulo}. Me especialicé en Endodoncia, también en la ${F.universidadCorta},${especialidad} y trabajo en mi consultorio de Escobar${desde}.</p>
      <p>Brindo atención integral y personalizada, con un enfoque en tratamientos seguros, eficaces y de alta calidad. Estoy comprometida con la actualización constante para ofrecer siempre las mejores soluciones a mis pacientes.</p>
    </section>

    <section id="forma-de-trabajar">
      <h2>Mi forma de trabajar</h2>
      <div class="valores">
        <div class="valor"><h3>Atención integral y personalizada</h3><p>Trabajo sola en el consultorio: en cada turno te atiendo yo y vemos tu boca como un todo, no solo el diente que molesta.</p></div>
        <div class="valor"><h3>Tratamientos seguros y eficaces</h3><p>Antes de empezar sabés qué vamos a hacer, cuántas sesiones lleva y cuánto cuesta. Buscamos resultados que duren.</p></div>
        <div class="valor"><h3>Actualización constante</h3><p>Me sigo formando para ofrecerte siempre las mejores soluciones y técnicas para cada caso.</p></div>
      </div>
    </section>

    <section id="especialidad">
      <h2>Especialidad en Endodoncia</h2>
      <p>La Endodoncia es la especialidad que trata el interior del diente: la pulpa, o nervio, y los conductos de la raíz. Es la que permite conservar dientes que de otra manera se perderían, con tratamientos precisos y pensados para durar.</p>
      <p>Además de mi especialidad hago prótesis fija y removible, implantología oral, limpiezas, operatoria dental, postes de fibra de vidrio y blanqueamientos. Así, la mayoría de tus tratamientos se resuelven en un solo lugar.</p>
    </section>

    <section id="ortodoncista">
      <h2>Una ortodoncista en el consultorio</h2>
      <p>Para ortodoncia trabajo con una colega ortodoncista que viene al consultorio a atender a mis pacientes. Coordinamos entre las dos: antes de colocar aparatos me ocupo de que tu boca esté sana, y durante el tratamiento seguimos tu evolución en conjunto.</p>
    </section>

    <section id="consultorio">
      <h2>El consultorio</h2>
      <p>Estoy en <strong>${N.direccion.calle}, ${N.direccion.detalle.toLowerCase()}</strong>, en el centro de ${N.direccion.localidad}. Atiendo con turno previo, que podés pedir por WhatsApp.</p>
      ${N.redes.instagram ? `<p><a class="enlace enlace--ig" href="${N.redes.instagram}" target="_blank" rel="noopener">${UI.instagram}Seguime en Instagram: ${N.instagramUsuario}</a></p>` : ''}
    </section>
  </div>
  ${C.lateral([['formacion', 'Mi formación'], ['forma-de-trabajar', 'Mi forma de trabajar'], ['especialidad', 'Especialidad en Endodoncia'], ['ortodoncista', 'Ortodoncista en el consultorio'], ['consultorio', 'El consultorio']])}
</div>

${C.galeria(fotosConsultorio, { titulo: 'Así es el consultorio', id: 'fotos-consultorio' })}

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
