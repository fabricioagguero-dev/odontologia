const B = require('../plantillas/base');
const C = require('../plantillas/componentes');
const { UI } = require('../plantillas/svg');
const { N, esc, mapsComoLlegar } = B;

module.exports = function contacto() {
  const id = 'contacto';
  const motivos = ['Control o limpieza', 'Me duele un diente', 'Endodoncia (tratamiento de conducto)', 'Arreglo de caries', 'Ortodoncia', 'Otro motivo'];

  const cuerpo = `
<section class="pag-hero pag-hero--contacto">
  <div class="contenedor pag-hero__in">
    <div class="pag-hero__txt">
      ${B.migas(id)}
      <h1>Turnos y contacto</h1>
      <p class="lead">La forma más rápida de pedir un turno es por WhatsApp. Completá estos datos y se abre el chat con el mensaje listo para enviar.</p>
    </div>
  </div>
</section>

<section class="contacto" aria-label="Pedir turno">
  <div class="contenedor contacto__in">
    <form class="form" action="https://wa.me/${N.whatsapp}" method="get" target="_blank" data-form-wa novalidate>
      <div class="campo">
        <label for="f-nombre">Tu nombre</label>
        <input id="f-nombre" name="nombre" type="text" autocomplete="name" required placeholder="Nombre y apellido">
        <p class="campo__error" data-error-nombre hidden>Escribí tu nombre para que sepamos quién nos escribe.</p>
      </div>
      <div class="campo">
        <label for="f-motivo">Motivo de la consulta</label>
        <select id="f-motivo" name="motivo">${motivos.map((m) => `<option>${m}</option>`).join('')}</select>
      </div>
      <fieldset class="campo">
        <legend>¿Qué horario te queda mejor?</legend>
        <div class="opciones">
          <label class="opcion"><input type="radio" name="horario" value="por la mañana"><span>Mañana</span></label>
          <label class="opcion"><input type="radio" name="horario" value="por la tarde"><span>Tarde</span></label>
          <label class="opcion"><input type="radio" name="horario" value="en cualquier horario" checked><span>Me da igual</span></label>
        </div>
      </fieldset>
      <div class="campo">
        <label for="f-msj">Contanos algo más <span class="campo__opc">(opcional)</span></label>
        <textarea id="f-msj" name="text" rows="4" placeholder="Por ejemplo: me duele una muela de abajo desde hace dos días."></textarea>
      </div>
      <button class="btn btn--wa btn--grande btn--bloque" type="submit">${UI.whatsapp}Abrir WhatsApp con mi mensaje</button>
      <p class="form__nota">No guardamos tus datos: el mensaje se arma en tu teléfono y lo enviás vos desde WhatsApp.</p>
    </form>

    <div class="contacto__info">
      <div class="dato">
        ${UI.pin}
        <div>
          <p class="dato__t">Dirección</p>
          <address>${esc(N.direccion.calle)}<br>${esc(N.direccion.detalle)}<br>${esc(N.direccion.localidad)}, ${esc(N.direccion.provincia)}</address>
          <a class="enlace" href="${mapsComoLlegar}" target="_blank" rel="noopener">Cómo llegar</a>
        </div>
      </div>
      <div class="dato">
        ${UI.reloj}
        <div><p class="dato__t">Horarios</p><p>Atención con turno previo. Consultá disponibilidad por WhatsApp.</p></div>
      </div>
      <div class="dato">
        ${UI.whatsapp}
        <div><p class="dato__t">WhatsApp</p><p><a class="enlace" href="${B.wa()}" target="_blank" rel="noopener">${esc(B.telefonoTxt === 'WhatsApp' ? 'Escribinos directamente' : B.telefonoTxt)}</a></p></div>
      </div>
      ${C.mapa()}
    </div>
  </div>
</section>
`;

  const schema = [
    ...B.nodosBase(),
    B.paginaSchema(id, { tipo: 'ContactPage' }),
    B.migasSchema(id),
  ];
  return B.documento(id, { cuerpo, schema });
};
