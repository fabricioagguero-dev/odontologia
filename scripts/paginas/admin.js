/**
 * /admin/ — Panel para que Jimena edite su sitio hablando con la IA.
 * Página privada: no se indexa y no aparece en el menú ni en el sitemap.
 */
const B = require('../plantillas/base');
const { firmaNexora } = require('../plantillas/nexora');
const { S, assets } = B;

const ICO = {
  foto: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8.5 5l1.4-2h4.2l1.4 2"/></svg>`,
  enviar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>`,
  cerrar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>`,
  nuevo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h8M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
};

module.exports = function admin() {
  return `<!DOCTYPE html>
<html lang="${S.idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title>Panel de tu sitio · Jimena Teruel</title>
<meta name="robots" content="noindex, nofollow">
<meta name="author" content="NexoraSaaS">
<meta name="theme-color" content="${S.colorTema}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/figtree-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/admin.css?v=${assets.adminCss}">
<script src="/js/admin.js?v=${assets.adminJs}" defer></script>
</head>
<body>
<div class="cargando" data-cargando><img src="/img/logo/emblema-128.webp" width="64" height="64" alt=""></div>

<main class="ingreso" data-ingreso hidden>
  <form class="ingreso__caja" data-form-ingreso>
    <img class="ingreso__emblema" src="/img/logo/emblema-128.webp" width="72" height="72" alt="">
    <h1>Tu sitio</h1>
    <p class="ingreso__bajada">Ingresá para hacer cambios en odontologajimenateruel.com.ar</p>
    <label for="clave">Contraseña</label>
    <input id="clave" name="clave" type="password" autocomplete="current-password" required>
    <p class="ingreso__error" data-error-ingreso role="alert" hidden></p>
    <button class="boton boton--primario" type="submit">Entrar</button>
    <div class="ingreso__config" data-config hidden></div>
  </form>
  <div class="ingreso__firma">${firmaNexora({ tamano: 20 })}</div>
</main>

<div class="app" data-app hidden>
  <aside class="chats" data-chats aria-label="Tus chats">
    <div class="chats__fondo" data-cerrar-chats></div>
    <div class="chats__hoja">
      <div class="chats__cab">
        <a class="chats__marca" href="/" target="_blank" rel="noopener" title="Ver mi sitio">
          <img src="/img/logo/emblema-128.webp" width="32" height="32" alt="">
          <span>Tu sitio</span>
        </a>
        <button type="button" class="icono-boton chats__cerrar" data-cerrar-chats aria-label="Cerrar">${ICO.cerrar}</button>
      </div>
      <button type="button" class="chats__nuevo" data-nuevo-chat>${ICO.nuevo}<span>Nuevo chat</span></button>
      <nav class="chats__lista" data-lista-chats aria-label="Chats anteriores"></nav>
      <div class="chats__pie">${firmaNexora()}</div>
    </div>
  </aside>

  <header class="barra">
    <button type="button" class="icono-boton barra__menu" data-abrir-chats aria-label="Ver mis chats">${ICO.menu}</button>
    <p class="barra__titulo" data-titulo-chat>Nuevo chat</p>
    <nav class="barra__acciones" aria-label="Panel">
      <button type="button" class="barra__boton barra__boton--lateral" data-abrir="hoy">Datos</button>
      <button type="button" class="barra__boton barra__boton--lateral" data-abrir="historial">Cambios</button>
      <a class="barra__boton barra__boton--sitio" href="/" target="_blank" rel="noopener">Ver sitio</a>
      <button type="button" class="barra__boton" data-salir>Salir</button>
    </nav>
  </header>

  <div class="app__cuerpo">
    <section class="chat" aria-label="Conversación con el asistente">
      <ol class="chat__lista" data-lista aria-live="polite"></ol>
    </section>

    <aside class="lateral" data-lateral aria-label="Datos y cambios publicados">
      <div class="lateral__fondo" data-cerrar-lateral></div>
      <div class="lateral__hoja">
        <section class="tarjeta hoy" data-seccion="hoy">
          <div class="tarjeta__cab"><h2>Así está hoy</h2><button type="button" class="icono-boton" data-cerrar-lateral aria-label="Cerrar">${ICO.cerrar}</button></div>
          <dl class="hoy__datos" data-hoy><div><dt>Cargando…</dt></div></dl>
        </section>
        <section class="tarjeta historial" data-seccion="historial">
          <div class="tarjeta__cab"><h2>Cambios publicados</h2><button type="button" class="icono-boton" data-cerrar-lateral aria-label="Cerrar">${ICO.cerrar}</button></div>
          <ol class="historial__lista" data-historial></ol>
        </section>
      </div>
    </aside>
  </div>

  <form class="redactor" data-redactor>
    <ul class="redactor__fotos" data-previas hidden></ul>
    <div class="redactor__fila">
      <label class="redactor__adjuntar" title="Adjuntar fotos">
        <input type="file" accept="image/*" multiple data-archivo>
        ${ICO.foto}<span class="sr">Adjuntar fotos</span>
      </label>
      <label class="sr" for="texto">Qué querés cambiar</label>
      <textarea id="texto" rows="1" placeholder="Escribí qué querés cambiar…" data-texto enterkeyhint="send"></textarea>
      <button type="submit" class="redactor__enviar" data-enviar aria-label="Enviar">${ICO.enviar}</button>
    </div>
  </form>
</div>
<noscript><p class="sin-js">Para usar el panel necesitás tener JavaScript activado.</p></noscript>
</body>
</html>
`;
};
