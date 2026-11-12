const B = require('../plantillas/base');
const { emblema } = require('../plantillas/svg');

module.exports = function noEncontrada() {
  const cuerpo = `
<section class="error404">
  <div class="contenedor error404__in">
    ${emblema({ prefijo: 'nf', clase: 'error404__emblema' })}
    <h1>No encontramos esta página</h1>
    <p>Puede que la dirección esté mal escrita o que la página haya cambiado de lugar. Desde acá podés seguir:</p>
    <ul class="error404__links">
      <li><a class="btn btn--primario" href="/">Ir al inicio</a></li>
      <li><a class="btn btn--linea" href="/endodoncia/">Endodoncia</a></li>
      <li><a class="btn btn--linea" href="/contacto/">Pedir turno</a></li>
    </ul>
  </div>
</section>`;
  return B.documento('404', { cuerpo, indexar: false });
};
