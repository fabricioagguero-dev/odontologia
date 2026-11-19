/* Panel de tu sitio — Jimena Teruel (vanilla, sin dependencias) · Desarrollado por NexoraSaaS */
(function () {
  'use strict';

  var API = '/api/panel/';
  var CLAVE_CHATS = 'panel-jimena-chats-v2';
  var CLAVE_VIEJA = 'panel-jimena-v1';
  var MAX_CHATS = 60;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var tactil = window.matchMedia('(pointer: coarse)').matches;

  var EJEMPLOS = [
    'Me mudé de consultorio',
    'Me voy de vacaciones',
    'Cambiaron mis horarios',
    'Quiero agregar una opinión de Google',
    'Quiero subir una foto mía',
    'Quiero agregar una pregunta frecuente',
  ];

  var ICO_BORRAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';

  var estado = {
    chats: [], // [{ id, titulo, creado, actualizado, sigFoto, mensajes: [{ rol, texto, fotos?, minis?, propuesta?, pedido?, tipo? }] }]
    activo: null, // id del chat abierto
    fotos: {}, // chatId → { 'foto:1': { url, mini, full, thumb } } (solo en memoria)
    previas: [], // fotos adjuntadas todavía sin enviar (del chat activo)
    ocupado: null, // id del chat que está esperando a la IA
    confirmarBorrado: null, // id del chat con la confirmación abierta
    soporte: '',
  };

  // ---------- utilidades ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nuevoId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function api(accion, opciones) {
    opciones = opciones || {};
    var init = { method: opciones.metodo || 'GET', credentials: 'same-origin', headers: {} };
    if (opciones.datos !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opciones.datos);
    }
    return fetch(API + accion + '/', init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && accion !== 'sesion') {
          mostrarIngreso();
          throw new Error(j.error || 'Tu sesión terminó.');
        }
        if (!r.ok) {
          if (j.error) throw new Error(j.error);
          if (r.status === 504) throw new Error('La IA tardó demasiado en responder. Probá de nuevo en un momento.');
          throw new Error('No se pudo conectar con el panel. Revisá tu conexión y probá de nuevo.');
        }
        return j;
      });
    });
  }

  // ---------- chats guardados en este dispositivo ----------
  function chatPorId(id) {
    for (var i = 0; i < estado.chats.length; i++) if (estado.chats[i].id === id) return estado.chats[i];
    return null;
  }
  function chatActivo() { return chatPorId(estado.activo); }
  function fotosDe(chat) {
    if (!estado.fotos[chat.id]) estado.fotos[chat.id] = {};
    return estado.fotos[chat.id];
  }

  function guardar() {
    var datos = estado.chats
      .filter(function (c) { return c.mensajes.length; })
      .sort(function (a, b) { return b.actualizado - a.actualizado; })
      .slice(0, MAX_CHATS)
      .map(function (c) {
        return {
          id: c.id, titulo: c.titulo, creado: c.creado, actualizado: c.actualizado, sigFoto: c.sigFoto,
          mensajes: c.mensajes.filter(function (m) { return m.tipo !== 'pensando'; }).slice(-120),
        };
      });
    try {
      localStorage.setItem(CLAVE_CHATS, JSON.stringify({ chats: datos, activo: estado.activo }));
    } catch (e) {
      // Sin lugar: se sacan las miniaturas de las fotos de los chats más viejos y se reintenta.
      try {
        datos = JSON.parse(JSON.stringify(datos));
        datos.slice(Math.ceil(datos.length / 3)).forEach(function (c) { c.mensajes.forEach(function (m) { delete m.minis; }); });
        localStorage.setItem(CLAVE_CHATS, JSON.stringify({ chats: datos, activo: estado.activo }));
      } catch (e2) { /* sin almacenamiento: los chats duran mientras la página esté abierta */ }
    }
  }

  function cargarChats() {
    var guardado = null;
    try { guardado = JSON.parse(localStorage.getItem(CLAVE_CHATS) || 'null'); } catch (e) { guardado = null; }
    estado.chats = guardado && Array.isArray(guardado.chats) ? guardado.chats : [];
    // La versión anterior del panel guardaba una sola conversación.
    try {
      var viejo = JSON.parse(sessionStorage.getItem(CLAVE_VIEJA) || 'null');
      if (Array.isArray(viejo) && viejo.length) {
        var primero = viejo.filter(function (m) { return m.rol === 'usuario'; })[0];
        estado.chats.unshift({ id: nuevoId(), titulo: titular(primero ? primero.texto : 'Chat anterior'), creado: Date.now(), actualizado: Date.now(), sigFoto: 1, mensajes: viejo });
      }
      sessionStorage.removeItem(CLAVE_VIEJA);
    } catch (e) { /* nada */ }
    // Si se recargó mientras se publicaba, ya no podemos seguir el progreso.
    estado.chats.forEach(function (c) {
      c.mensajes = (c.mensajes || []).filter(function (m) { return m.tipo !== 'pensando'; });
      c.mensajes.forEach(function (m) {
        if (m.propuesta && (m.propuesta.estado === 'publicando' || m.propuesta.estado === 'actualizando')) m.propuesta.estado = 'enviada';
      });
    });
    estado.activo = null;
    if (guardado && guardado.activo && chatPorId(guardado.activo)) estado.activo = guardado.activo;
    if (!estado.activo) crearChat();
  }

  function titular(texto) {
    var t = String(texto || '').replace(/\s+/g, ' ').trim();
    if (!t) return 'Nuevo chat';
    return t.length > 46 ? t.slice(0, 45).trimEnd() + '…' : t;
  }

  function crearChat() {
    var actual = chatActivo();
    if (actual && !actual.mensajes.length) return actual; // ya hay uno vacío abierto
    var c = { id: nuevoId(), titulo: 'Nuevo chat', creado: Date.now(), actualizado: Date.now(), sigFoto: 1, mensajes: [] };
    estado.chats.unshift(c);
    estado.activo = c.id;
    return c;
  }

  function abrirChat(id) {
    if (!chatPorId(id)) return;
    estado.activo = id;
    estado.previas = [];
    estado.confirmarBorrado = null;
    pintarPrevias();
    pintar();
    pintarChats();
    cerrarChats();
    guardar();
  }

  function borrarChat(id) {
    estado.chats = estado.chats.filter(function (c) { return c.id !== id; });
    delete estado.fotos[id];
    estado.confirmarBorrado = null;
    if (estado.activo === id) {
      estado.activo = null;
      var siguiente = estado.chats
        .filter(function (c) { return c.mensajes.length; })
        .sort(function (a, b) { return b.actualizado - a.actualizado; })[0];
      if (siguiente) estado.activo = siguiente.id;
      else crearChat();
      estado.previas = [];
      pintarPrevias();
      pintar();
    }
    pintarChats();
    guardar();
  }

  // ---------- lista de chats ----------
  function grupoDe(ms) {
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var dia = 864e5;
    if (ms >= hoy.getTime()) return 'Hoy';
    if (ms >= hoy.getTime() - dia) return 'Ayer';
    if (ms >= hoy.getTime() - 6 * dia) return 'Últimos 7 días';
    if (ms >= hoy.getTime() - 29 * dia) return 'Últimos 30 días';
    return 'Anteriores';
  }

  function pintarChats() {
    var nav = $('[data-lista-chats]');
    var conMensajes = estado.chats
      .filter(function (c) { return c.mensajes.length; })
      .sort(function (a, b) { return b.actualizado - a.actualizado; });
    if (!conMensajes.length) {
      nav.innerHTML = '<p class="chats__vacio">Acá van a aparecer tus chats.</p>';
      return;
    }
    var grupos = [];
    conMensajes.forEach(function (c) {
      var g = grupoDe(c.actualizado);
      var ultimo = grupos[grupos.length - 1];
      if (!ultimo || ultimo.nombre !== g) grupos.push((ultimo = { nombre: g, chats: [] }));
      ultimo.chats.push(c);
    });
    nav.innerHTML = grupos.map(function (g) {
      return '<section class="chats__grupo"><h2 class="chats__grupo-t">' + esc(g.nombre) + '</h2><ul>' +
        g.chats.map(function (c) {
          if (estado.confirmarBorrado === c.id) {
            return '<li class="chat-item chat-item--confirmar"><p>¿Eliminar «' + esc(c.titulo) + '»? Los cambios ya publicados en tu sitio no se borran.</p>' +
              '<div><button type="button" class="boton boton--peligro" data-borrar-si="' + c.id + '">Eliminar</button>' +
              '<button type="button" class="boton boton--texto" data-borrar-no>Cancelar</button></div></li>';
          }
          return '<li class="chat-item"' + (c.id === estado.activo ? ' aria-current="true"' : '') + '>' +
            '<button type="button" class="chat-item__abrir" data-abrir-chat="' + c.id + '" title="' + esc(c.titulo) + '">' + esc(c.titulo) + '</button>' +
            '<button type="button" class="chat-item__borrar" data-borrar-chat="' + c.id + '" aria-label="Eliminar el chat ' + esc(c.titulo) + '">' + ICO_BORRAR + '</button></li>';
        }).join('') + '</ul></section>';
    }).join('');
  }

  $('[data-lista-chats]').addEventListener('click', function (e) {
    var t = e.target;
    var abrir = t.closest('[data-abrir-chat]');
    if (abrir) return abrirChat(abrir.getAttribute('data-abrir-chat'));
    var borrar = t.closest('[data-borrar-chat]');
    if (borrar) {
      estado.confirmarBorrado = borrar.getAttribute('data-borrar-chat');
      pintarChats();
      var si = $('[data-borrar-si]');
      if (si) si.focus();
      return;
    }
    var si2 = t.closest('[data-borrar-si]');
    if (si2) return borrarChat(si2.getAttribute('data-borrar-si'));
    if (t.closest('[data-borrar-no]')) {
      estado.confirmarBorrado = null;
      pintarChats();
    }
  });

  var panelChats = $('[data-chats]');
  function cerrarChats() { panelChats.removeAttribute('data-abierto'); }

  $('[data-nuevo-chat]').addEventListener('click', function () {
    crearChat();
    estado.previas = [];
    estado.confirmarBorrado = null;
    pintarPrevias();
    pintar();
    pintarChats();
    cerrarChats();
    guardar();
    if (!tactil) area.focus();
  });
  $('[data-abrir-chats]').addEventListener('click', function () {
    pintarChats();
    panelChats.setAttribute('data-abierto', '');
  });
  panelChats.addEventListener('click', function (e) {
    if (e.target.closest('[data-cerrar-chats]')) cerrarChats();
  });

  // ---------- fechas ----------
  var fechaRel = (function () {
    var rtf = 'Intl' in window && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' }) : null;
    return function (iso) {
      var d = new Date(iso);
      var seg = (d.getTime() - Date.now()) / 1000;
      if (!rtf) return d.toLocaleString('es-AR');
      var tabla = [[60, 'second'], [3600, 'minute', 60], [86400, 'hour', 3600], [604800, 'day', 86400]];
      for (var i = 0; i < tabla.length; i++) {
        if (Math.abs(seg) < tabla[i][0]) return i === 0 ? 'recién' : rtf.format(Math.round(seg / tabla[i][2]), tabla[i][1]);
      }
      return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    };
  })();

  // ---------- pantallas ----------
  function ocultarCarga() { $('[data-cargando]').hidden = true; }

  function mostrarIngreso(listo) {
    ocultarCarga();
    $('[data-app]').hidden = true;
    $('[data-ingreso]').hidden = false;
    var cfg = $('[data-config]');
    if (listo) {
      var faltan = [];
      if (!listo.clave) faltan.push('ADMIN_PASSWORD (la contraseña del panel, mínimo 8 caracteres)');
      if (!listo.ia) faltan.push('GEMINI_API_KEY (la clave gratuita de la IA)');
      if (!listo.github) faltan.push('GITHUB_TOKEN (para poder publicar los cambios)');
      cfg.hidden = !faltan.length;
      cfg.innerHTML = faltan.length
        ? '<strong>Falta configurar el panel en Vercel:</strong><ul>' + faltan.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>'
        : '';
    }
    setTimeout(function () { $('#clave').focus(); }, 50);
  }

  function abrirApp() {
    ocultarCarga();
    $('[data-ingreso]').hidden = true;
    $('[data-app]').hidden = false;
    cargarChats();
    pintar();
    pintarChats();
    cargarHoy();
    cargarHistorial();
    if (!tactil) area.focus();
  }

  // ---------- ingreso ----------
  $('[data-form-ingreso]').addEventListener('submit', function (e) {
    e.preventDefault();
    var boton = $('button[type=submit]', e.target);
    var error = $('[data-error-ingreso]');
    error.hidden = true;
    boton.disabled = true;
    boton.textContent = 'Entrando…';
    api('sesion', { metodo: 'POST', datos: { clave: $('#clave').value } })
      .then(function () {
        $('#clave').value = '';
        abrirApp();
      })
      .catch(function (err) {
        error.textContent = err.message;
        error.hidden = false;
      })
      .then(function () {
        boton.disabled = false;
        boton.textContent = 'Entrar';
      });
  });

  $('[data-salir]').addEventListener('click', function () {
    api('sesion', { metodo: 'DELETE' }).catch(function () {}).then(function () {
      mostrarIngreso();
    });
  });

  // ---------- conversación ----------
  var lista = $('[data-lista]');
  var chat = $('.chat');
  var form = $('[data-redactor]');
  var area = $('[data-texto]');
  var botonEnviar = $('[data-enviar]');

  function bajar() {
    requestAnimationFrame(function () { chat.scrollTop = chat.scrollHeight; });
  }

  function firmaNexora() {
    var f = $('.chats__pie .nx-firma');
    return f ? '<div class="bienvenida__firma">' + f.outerHTML + '</div>' : '';
  }

  function bienvenidaHTML() {
    return '<li class="bienvenida">' +
      '<img src="/img/logo/emblema-128.webp" width="58" height="58" alt="">' +
      '<h1>Hola, Jimena.</h1>' +
      '<p>Contame qué querés cambiar en tu sitio, como se lo dirías a una persona. Yo preparo los cambios y vos los revisás antes de publicarlos.</p>' +
      '<ul class="ejemplos">' + EJEMPLOS.map(function (x) { return '<li><button type="button" data-ejemplo>' + esc(x) + '</button></li>'; }).join('') + '</ul>' +
      firmaNexora() +
      '</li>';
  }

  // URL para mostrar una foto: la de esta sesión o la miniatura guardada.
  function urlFoto(c, id) {
    var f = fotosDe(c)[id];
    if (f && f.url) return f.url;
    for (var i = 0; i < c.mensajes.length; i++) {
      var m = c.mensajes[i];
      if (m.minis && m.minis[id]) return m.minis[id];
    }
    return '';
  }

  function fotosHTML(c, m) {
    if (!m.fotos || !m.fotos.length) return '';
    return '<ul class="msg__fotos">' + m.fotos.map(function (id) {
      var u = urlFoto(c, id);
      return u ? '<li><img src="' + esc(u) + '" alt="Foto adjuntada (' + esc(id) + ')"></li>' : '';
    }).join('') + '</ul>';
  }

  function filaHTML(c, f) {
    var marca = f.automatico ? '<span class="fila__marca">Se calcula solo</span>'
      : f.tipo === 'agregar' ? '<span class="fila__marca">Nuevo</span>'
      : f.tipo === 'quitar' ? '<span class="fila__marca fila__marca--quitar">Se quita</span>' : '';
    var u = f.foto ? urlFoto(c, f.foto) : '';
    var foto = u ? '<img class="fila__foto" src="' + esc(u) + '" alt="">' : '';
    var mapa = f.mapa ? '<a class="fila__mapa" href="https://www.google.com/maps?q=' + f.mapa.lat + ',' + f.mapa.lng + '" target="_blank" rel="noopener">Ver el punto en el mapa</a>' : '';
    var despues = f.foto ? '' : f.despues;
    return '<li class="fila fila--' + esc(f.tipo) + '">' +
      '<span class="fila__etiqueta">' + esc(f.etiqueta) + marca + '</span>' +
      (f.antes !== undefined && f.antes !== '(vacío)' && f.tipo !== 'agregar' && !f.automatico ? '<p class="fila__antes">' + esc(f.antes) + '</p>' : '') +
      (f.tipo !== 'quitar' && despues ? '<p class="fila__despues">' + esc(despues) + '</p>' : '') +
      foto + mapa +
      '</li>';
  }

  var PASOS = [
    ['guardado', 'Cambios guardados'],
    ['actualizando', 'Actualizando tu sitio (tarda 1 o 2 minutos)'],
    ['listo', 'Listo, ya se ve en tu sitio'],
  ];

  function progresoHTML(p) {
    var orden = { publicando: 0, actualizando: 1, listo: 2, demora: 1, error: 0 };
    var n = orden[p.estado];
    var items = PASOS.map(function (paso, i) {
      var valor = i < n || p.estado === 'listo' ? 'hecho' : i === n ? (p.estado === 'error' ? 'error' : 'activo') : '';
      var texto = paso[1];
      if (i === 0 && p.estado === 'publicando') texto = 'Guardando los cambios…';
      if (i === 0 && p.estado === 'error') texto = p.error || 'No se pudo publicar.';
      return '<li' + (valor ? ' data-paso="' + valor + '"' : '') + '>' + esc(texto) + '</li>';
    }).join('');
    var final = '';
    if (p.estado === 'listo') final = '<div class="progreso__final"><a class="boton boton--linea" href="/?v=' + Date.now() + '" target="_blank" rel="noopener">Ver mi sitio</a></div>';
    if (p.estado === 'demora') final = '<p class="vacio">Está tardando más de lo normal. Revisá tu sitio en unos minutos; si no ves el cambio, avisale a Fabricio.</p>';
    if (p.estado === 'error') final = '<div class="progreso__final"><button type="button" class="boton boton--primario" data-publicar>Intentar de nuevo</button></div>';
    return '<ol class="progreso">' + items + '</ol>' + final;
  }

  function propuestaHTML(c, p, i) {
    var cerrada = p.estado === 'descartada' || p.estado === 'reemplazada';
    var pie;
    if (p.estado === 'pendiente') {
      pie = '<button type="button" class="boton boton--primario" data-publicar>Publicar cambios</button>' +
        '<button type="button" class="boton boton--texto" data-descartar>Descartar</button>';
    } else if (p.estado === 'descartada') {
      pie = '<p class="vacio">Descartaste esta propuesta.</p>';
    } else if (p.estado === 'reemplazada') {
      pie = '<p class="vacio">Reemplazada por la propuesta nueva.</p>';
    } else if (p.estado === 'enviada') {
      pie = '<p class="vacio">Publicada. Si no ves el cambio, revisá "Cambios publicados".</p>';
    } else {
      pie = progresoHTML(p);
    }
    return '<section class="propuesta' + (cerrada ? ' propuesta--cerrada' : '') + '" data-propuesta="' + i + '" aria-label="Propuesta de cambios">' +
      '<div class="propuesta__cab"><small>Propuesta de cambios</small><h3>' + esc(p.titulo) + '</h3></div>' +
      '<ul class="propuesta__filas">' + p.filas.filter(function (f) { return !f.oculto; }).map(function (f) { return filaHTML(c, f); }).join('') + '</ul>' +
      (p.avisos && p.avisos.length ? '<ul class="propuesta__avisos">' + p.avisos.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="propuesta__pie">' + pie + '</div>' +
      '</section>';
  }

  function pedidoHTML(texto) {
    var destino = 'https://wa.me/' + (estado.soporte ? estado.soporte.replace(/\D/g, '') : '') + '?text=' + encodeURIComponent('Hola Fabri, desde el panel de mi sitio: ' + texto);
    return '<div class="pedido"><h3>Esto lo hace Fabricio</h3><p>' + esc(texto) + '</p>' +
      '<div class="pedido__acciones"><a class="boton boton--wa" href="' + esc(destino) + '" target="_blank" rel="noopener">Enviárselo por WhatsApp</a>' +
      '<button type="button" class="boton boton--linea" data-copiar="' + esc(texto) + '">Copiar</button></div></div>';
  }

  function mensajeHTML(c, m, i) {
    if (m.rol === 'usuario') {
      return '<li class="msg msg--usuario"><div class="msg__burbuja">' + fotosHTML(c, m) +
        (m.texto ? '<p class="msg__texto">' + esc(m.texto) + '</p>' : '') + '</div></li>';
    }
    if (m.tipo === 'sistema') return '<li class="msg msg--sistema"><p class="msg__texto">' + esc(m.texto) + '</p></li>';
    if (m.tipo === 'pensando') {
      return '<li class="msg msg--asistente"><img class="msg__avatar" src="/img/logo/emblema-128.webp" alt=""><div class="msg__cuerpo"><span class="pensando" aria-label="Pensando"><span></span><span></span><span></span></span></div></li>';
    }
    return '<li class="msg msg--asistente' + (m.tipo === 'error' ? ' msg--error' : '') + '">' +
      '<img class="msg__avatar" src="/img/logo/emblema-128.webp" alt="">' +
      '<div class="msg__cuerpo">' +
      (m.texto ? '<p class="msg__texto">' + esc(m.texto) + '</p>' : '') +
      (m.propuesta ? propuestaHTML(c, m.propuesta, i) : '') +
      (m.pedido ? pedidoHTML(m.pedido) : '') +
      '</div></li>';
  }

  function pintar() {
    var c = chatActivo();
    $('[data-titulo-chat]').textContent = c && c.mensajes.length ? c.titulo : 'Nuevo chat';
    var html = !c || !c.mensajes.length ? bienvenidaHTML() : '';
    if (c) html += c.mensajes.map(function (m, i) { return mensajeHTML(c, m, i); }).join('');
    lista.innerHTML = html;
    actualizarBoton();
    bajar();
  }

  function pintarPropuesta(c, i) {
    if (c.id !== estado.activo) return;
    var nodo = $('[data-propuesta="' + i + '"]');
    var m = c.mensajes[i];
    if (!nodo || !m || !m.propuesta) return pintar();
    var tmp = document.createElement('div');
    tmp.innerHTML = propuestaHTML(c, m.propuesta, i);
    nodo.replaceWith(tmp.firstChild);
  }

  function propuestaPendiente(c) {
    for (var i = c.mensajes.length - 1; i >= 0; i--) {
      var p = c.mensajes[i].propuesta;
      if (p && p.estado === 'pendiente') return { i: i, p: p };
    }
    return null;
  }

  function tocar(c) { c.actualizado = Date.now(); }

  // ---------- enviar un pedido a la IA ----------
  function enviar(texto) {
    texto = (texto || '').trim();
    var c = chatActivo();
    if (!c || estado.ocupado || (!texto && !estado.previas.length)) return;
    var mapaFotos = fotosDe(c);
    if (estado.previas.some(function (id) { return !mapaFotos[id] || !mapaFotos[id].full; })) return; // fotos todavía procesándose

    var nuevas = estado.previas.slice();
    estado.previas = [];
    pintarPrevias();
    var minis = {};
    nuevas.forEach(function (id) { if (mapaFotos[id].mini) minis[id] = mapaFotos[id].mini; });
    var textoFinal = texto || (nuevas.length > 1 ? 'Te mando estas fotos.' : 'Te mando esta foto.');
    if (!c.mensajes.length) c.titulo = titular(texto || 'Fotos para el sitio');
    c.mensajes.push({ rol: 'usuario', texto: textoFinal, fotos: nuevas, minis: minis });
    c.mensajes.push({ rol: 'asistente', tipo: 'pensando' });
    tocar(c);
    estado.ocupado = c.id;
    guardar();
    pintar();
    pintarChats();

    var pend = propuestaPendiente(c);
    var historial = c.mensajes
      .filter(function (m) { return (m.rol === 'usuario' || m.rol === 'asistente') && m.tipo !== 'pensando' && m.tipo !== 'error'; })
      .map(function (m) {
        var t = m.texto || '';
        if (m.rol === 'usuario' && m.fotos && m.fotos.length) t += '\n[Adjunté: ' + m.fotos.join(', ') + ']';
        if (m.propuesta) t += '\n[Propuesta: ' + m.propuesta.titulo + ' — ' + ({ pendiente: 'pendiente de publicar', descartada: 'descartada', reemplazada: 'reemplazada', listo: 'publicada', enviada: 'publicada', actualizando: 'publicada', publicando: 'publicándose', demora: 'publicada', error: 'falló al publicar' }[m.propuesta.estado] || '') + ']';
        return { rol: m.tipo === 'sistema' ? 'asistente' : m.rol, texto: t };
      });
    var fotos = Object.keys(mapaFotos).filter(function (id) { return mapaFotos[id].full; }).map(function (id) {
      var f = mapaFotos[id];
      return { id: id, mime: f.thumb.mime, datos: nuevas.indexOf(id) >= 0 ? f.thumb.datos : '' };
    });

    api('chat', {
      metodo: 'POST',
      datos: { mensajes: historial, fotos: fotos, pendiente: pend ? { titulo: pend.p.titulo, cambios: pend.p.cambios } : null },
    })
      .then(function (r) {
        sacarPensando(c);
        if (r.propuesta && pend) pend.p.estado = 'reemplazada';
        var m = { rol: 'asistente', texto: r.respuesta || '' };
        if (r.propuesta) {
          m.propuesta = r.propuesta;
          m.propuesta.estado = 'pendiente';
        }
        if (r.pedido) m.pedido = r.pedido;
        c.mensajes.push(m);
      })
      .catch(function (err) {
        sacarPensando(c);
        c.mensajes.push({ rol: 'asistente', tipo: 'error', texto: err.message });
      })
      .then(function () {
        estado.ocupado = null;
        tocar(c);
        guardar();
        if (c.id === estado.activo) pintar();
        else actualizarBoton();
        pintarChats();
      });
  }

  function sacarPensando(c) {
    c.mensajes = c.mensajes.filter(function (m) { return m.tipo !== 'pensando'; });
  }

  // ---------- publicar ----------
  function referencias(valor, out) {
    out = out || [];
    if (typeof valor === 'string') {
      if (/^foto:\d{1,2}$/.test(valor) && out.indexOf(valor) < 0) out.push(valor);
    } else if (valor && typeof valor === 'object') {
      Object.keys(valor).forEach(function (k) { referencias(valor[k], out); });
    }
    return out;
  }

  function publicar(c, i) {
    var m = c.mensajes[i];
    var p = m && m.propuesta;
    if (!p) return;
    var refs = [];
    p.cambios.forEach(function (x) {
      try { referencias(JSON.parse(x.valor_json || 'null'), refs); } catch (e) { referencias(x.valor_json, refs); }
    });
    var mapaFotos = fotosDe(c);
    var fotos = {};
    var faltante = null;
    var peso = 0;
    refs.forEach(function (id) {
      var f = mapaFotos[id];
      if (!f || !f.full) { faltante = id; return; }
      fotos[id] = f.full;
      peso += f.full.datos.length;
    });
    if (faltante) {
      p.estado = 'error';
      p.error = 'La foto ' + faltante + ' ya no está (se cerró o recargó la página). Adjuntala de nuevo y pedile el cambio otra vez.';
      return pintarPropuesta(c, i);
    }
    if (peso > 3.9e6) {
      p.estado = 'error';
      p.error = 'Las fotos son muy pesadas para publicarlas juntas. Probá de a una.';
      return pintarPropuesta(c, i);
    }
    p.estado = 'publicando';
    pintarPropuesta(c, i);
    api('publicar', { metodo: 'POST', datos: { titulo: p.titulo, cambios: p.cambios, fotos: fotos } })
      .then(function (r) {
        if (r.sinCambios) {
          p.estado = 'listo';
          pintarPropuesta(c, i);
          return;
        }
        p.estado = 'actualizando';
        p.commit = r.commit;
        tocar(c);
        guardar();
        pintarPropuesta(c, i);
        esperarSitio(r.contenido, function (ok) {
          p.estado = ok ? 'listo' : 'demora';
          if (ok) c.mensajes.push({ rol: 'asistente', tipo: 'sistema', texto: 'Publicado: ' + p.titulo });
          guardar();
          if (c.id === estado.activo) pintar();
          cargarHoy();
          cargarHistorial();
        });
      })
      .catch(function (err) {
        p.estado = 'error';
        p.error = err.message;
        pintarPropuesta(c, i);
      });
  }

  /** Espera a que Vercel termine de generar el sitio con el contenido nuevo. */
  function esperarSitio(sha, listo) {
    var inicio = Date.now();
    (function consultar() {
      fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : {}; })
        .catch(function () { return {}; })
        .then(function (v) {
          if (v.contenido === sha) return listo(true);
          if (Date.now() - inicio > 6 * 60 * 1000) return listo(false);
          setTimeout(consultar, 5000);
        });
    })();
  }

  // ---------- clics dentro de la conversación ----------
  lista.addEventListener('click', function (e) {
    var t = e.target;
    var ej = t.closest('[data-ejemplo]');
    if (ej) {
      area.value = ej.textContent;
      ajustar();
      actualizarBoton();
      area.focus();
      return;
    }
    var c = chatActivo();
    var caja = t.closest('[data-propuesta]');
    if (c && caja && t.closest('[data-publicar]')) return publicar(c, Number(caja.getAttribute('data-propuesta')));
    if (c && caja && t.closest('[data-descartar]')) {
      var i = Number(caja.getAttribute('data-propuesta'));
      c.mensajes[i].propuesta.estado = 'descartada';
      guardar();
      return pintarPropuesta(c, i);
    }
    var copiar = t.closest('[data-copiar]');
    if (copiar && navigator.clipboard) {
      navigator.clipboard.writeText(copiar.getAttribute('data-copiar')).then(function () {
        copiar.textContent = 'Copiado';
        setTimeout(function () { copiar.textContent = 'Copiar'; }, 1800);
      });
    }
  });

  // ---------- redactor ----------
  function ajustar() {
    area.style.height = 'auto';
    area.style.height = Math.min(area.scrollHeight, window.innerHeight * 0.4) + 'px';
  }
  function actualizarBoton() {
    botonEnviar.disabled = !!estado.ocupado || (!area.value.trim() && !estado.previas.length);
  }
  area.addEventListener('input', function () { ajustar(); actualizarBoton(); });
  area.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !tactil && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (estado.ocupado) return;
    var texto = area.value;
    area.value = '';
    ajustar();
    enviar(texto);
  });
  actualizarBoton();

  // ---------- fotos ----------
  function cargarImagen(url) {
    return new Promise(function (ok, mal) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { mal(new Error('No pude abrir esa imagen. Probá con una foto JPG o PNG.')); };
      img.src = url;
    });
  }
  function aBase64(blob) {
    return new Promise(function (ok) {
      var r = new FileReader();
      r.onload = function () { ok(String(r.result).split(',')[1]); };
      r.readAsDataURL(blob);
    });
  }
  function redimensionar(img, max, tipo, calidad) {
    var escala = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    var c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * escala);
    c.height = Math.round(img.naturalHeight * escala);
    var ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return new Promise(function (ok) {
      c.toBlob(function (b) {
        if (b && b.type === tipo) return ok({ blob: b, ancho: c.width, alto: c.height });
        c.toBlob(function (j) { ok({ blob: j, ancho: c.width, alto: c.height }); }, 'image/jpeg', 0.85);
      }, tipo, calidad);
    });
  }

  function procesar(archivo) {
    var c = chatActivo();
    if (!c) return;
    var mapaFotos = fotosDe(c);
    var id = 'foto:' + (c.sigFoto || 1);
    c.sigFoto = (c.sigFoto || 1) + 1;
    var url = URL.createObjectURL(archivo);
    mapaFotos[id] = { url: url };
    estado.previas.push(id);
    pintarPrevias();
    return cargarImagen(url)
      .then(function (img) {
        return Promise.all([
          redimensionar(img, 1600, 'image/webp', 0.84),
          redimensionar(img, 768, 'image/jpeg', 0.72),
          redimensionar(img, 180, 'image/jpeg', 0.6),
        ]);
      })
      .then(function (res) {
        return Promise.all([aBase64(res[0].blob), aBase64(res[1].blob), aBase64(res[2].blob)]).then(function (b64) {
          mapaFotos[id].full = { datos: b64[0], mime: res[0].blob.type, ancho: res[0].ancho, alto: res[0].alto };
          mapaFotos[id].thumb = { datos: b64[1], mime: res[1].blob.type };
          mapaFotos[id].mini = 'data:' + res[2].blob.type + ';base64,' + b64[2];
        });
      })
      .catch(function (err) {
        delete mapaFotos[id];
        estado.previas = estado.previas.filter(function (x) { return x !== id; });
        c.mensajes.push({ rol: 'asistente', tipo: 'error', texto: err.message });
        pintar();
      })
      .then(function () {
        pintarPrevias();
        actualizarBoton();
      });
  }

  function pintarPrevias() {
    var ul = $('[data-previas]');
    var c = chatActivo();
    var mapaFotos = c ? fotosDe(c) : {};
    ul.hidden = !estado.previas.length;
    ul.innerHTML = estado.previas.map(function (id) {
      var f = mapaFotos[id];
      return '<li class="' + (f && f.full ? '' : 'procesando') + '"><img src="' + (f ? esc(f.url) : '') + '" alt="Foto para enviar">' +
        '<button type="button" data-quitar-foto="' + id + '" aria-label="Quitar foto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>';
    }).join('');
  }

  $('[data-archivo]').addEventListener('change', function (e) {
    var archivos = Array.prototype.slice.call(e.target.files || []).filter(function (f) { return /^image\//.test(f.type) || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name); });
    var lugar = Math.max(0, 4 - estado.previas.length);
    archivos.slice(0, lugar).forEach(procesar);
    if (archivos.length > lugar) {
      var c = chatActivo();
      if (c) c.mensajes.push({ rol: 'asistente', tipo: 'sistema', texto: 'Podés mandar hasta 4 fotos por mensaje.' });
      pintar();
    }
    e.target.value = '';
  });
  $('[data-previas]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-quitar-foto]');
    if (!b) return;
    var id = b.getAttribute('data-quitar-foto');
    estado.previas = estado.previas.filter(function (x) { return x !== id; });
    pintarPrevias();
    actualizarBoton();
  });

  // ---------- datos de hoy ----------
  function cargarHoy() {
    var dl = $('[data-hoy]');
    api('contenido')
      .then(function (r) {
        var h = r.resumen;
        var filas = [
          ['Dirección', h.direccion + (h.localidad ? ', ' + h.localidad : '')],
          ['Horarios', h.horarios],
          ['Teléfono y WhatsApp', h.telefono],
        ];
        if (h.instagram) filas.push(['Instagram', h.instagram]);
        var html = '';
        if (h.aviso) {
          var rango = h.aviso.hasta ? ' (hasta el ' + h.aviso.hasta.split('-').reverse().join('/') + ')' : '';
          html += '<div class="hoy__aviso"><dt>Aviso publicado</dt><dd>' + esc(h.aviso.texto + rango) + '</dd></div>';
        }
        html += filas.map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1] || '—') + '</dd></div>'; }).join('');
        html += '<div><dt>Tratamientos</dt><dd>' + esc(h.tratamientos.join(', ')) + '</dd></div>';
        html += '<div><dt>En el sitio también</dt><dd>' + h.preguntas + ' preguntas frecuentes, ' + h.opiniones + ' opiniones de Google' +
          (h.retrato ? ', tu foto' : '') + (h.fotosConsultorio ? ' y ' + h.fotosConsultorio + ' fotos del consultorio' : '') + '</dd></div>';
        dl.innerHTML = html;
      })
      .catch(function (err) {
        dl.innerHTML = '<div><dd class="vacio">' + esc(err.message) + '</dd></div>';
      });
  }

  // ---------- cambios publicados ----------
  var historialDatos = [];
  function cargarHistorial() {
    var ol = $('[data-historial]');
    api('historial')
      .then(function (r) {
        historialDatos = r.cambios || [];
        pintarHistorial();
      })
      .catch(function (err) {
        ol.innerHTML = '<li><p class="vacio">' + esc(err.message) + '</p></li>';
      });
  }
  function pintarHistorial(confirmar, progreso) {
    var ol = $('[data-historial]');
    if (!historialDatos.length) {
      ol.innerHTML = '<li><p class="vacio">Todavía no hay cambios.</p></li>';
      return;
    }
    ol.innerHTML = historialDatos.map(function (c) {
      var acciones = '';
      if (c.deshacible) {
        if (progreso && progreso.sha === c.sha) acciones = '<div class="historial__acciones"><p>' + esc(progreso.texto) + '</p></div>';
        else if (confirmar === c.sha) {
          acciones = '<div class="historial__acciones"><p>¿Volver el sitio a como estaba antes de este cambio?</p>' +
            '<button type="button" class="boton boton--primario" data-deshacer-si="' + c.sha + '">Sí, deshacer</button>' +
            '<button type="button" class="boton boton--texto" data-deshacer-no>No</button></div>';
        } else acciones = '<div class="historial__acciones"><button type="button" class="boton boton--linea" data-deshacer="' + c.sha + '">Deshacer</button></div>';
      }
      return '<li><p class="historial__titulo">' + esc(c.titulo) + '</p>' +
        '<p class="historial__fecha">' + esc(fechaRel(c.fecha)) + '</p>' +
        (c.detalle && c.detalle.length ? '<details><summary>Ver detalle</summary><ul>' + c.detalle.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></details>' : '') +
        acciones + '</li>';
    }).join('');
  }
  $('[data-historial]').addEventListener('click', function (e) {
    var t = e.target;
    var d = t.closest('[data-deshacer]');
    if (d) return pintarHistorial(d.getAttribute('data-deshacer'));
    if (t.closest('[data-deshacer-no]')) return pintarHistorial();
    var si = t.closest('[data-deshacer-si]');
    if (!si) return;
    var sha = si.getAttribute('data-deshacer-si');
    var c = chatActivo();
    pintarHistorial(null, { sha: sha, texto: 'Deshaciendo…' });
    api('deshacer', { metodo: 'POST', datos: { sha: sha } })
      .then(function (r) {
        pintarHistorial(null, { sha: sha, texto: 'Actualizando tu sitio (tarda 1 o 2 minutos)…' });
        if (c) {
          c.mensajes.push({ rol: 'asistente', tipo: 'sistema', texto: 'Deshaciendo el último cambio…' });
          tocar(c);
          guardar();
          pintar();
          pintarChats();
        }
        esperarSitio(r.contenido, function (ok) {
          if (c) c.mensajes.push({ rol: 'asistente', tipo: 'sistema', texto: ok ? 'Listo: el último cambio se deshizo.' : 'El cambio se deshizo y el sitio se está actualizando.' });
          guardar();
          if (c && c.id === estado.activo) pintar();
          cargarHoy();
          cargarHistorial();
        });
      })
      .catch(function (err) {
        pintarHistorial(null, { sha: sha, texto: err.message });
      });
  });

  // ---------- paneles laterales en pantallas chicas ----------
  var lateral = $('[data-lateral]');
  $$('[data-abrir]').forEach(function (b) {
    b.addEventListener('click', function () {
      lateral.setAttribute('data-abierto', b.getAttribute('data-abrir'));
      if (b.getAttribute('data-abrir') === 'historial') cargarHistorial();
    });
  });
  lateral.addEventListener('click', function (e) {
    if (e.target.closest('[data-cerrar-lateral]')) lateral.removeAttribute('data-abierto');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    lateral.removeAttribute('data-abierto');
    cerrarChats();
    if (estado.confirmarBorrado) {
      estado.confirmarBorrado = null;
      pintarChats();
    }
  });

  // ---------- inicio ----------
  api('sesion')
    .then(function (r) {
      estado.soporte = r.soporte || '';
      if (r.autenticada) abrirApp();
      else mostrarIngreso(r.listo);
    })
    .catch(function () { mostrarIngreso(); });
})();
