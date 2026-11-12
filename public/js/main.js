/* Jimena Teruel · Odontóloga — interacciones (vanilla, sin dependencias) */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.remove('no-js');
  doc.classList.add('js');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var punteroFino = window.matchMedia('(pointer: fine)').matches;
  var waBase = (function () {
    var a = $('a[href^="https://wa.me/"]');
    return a ? a.getAttribute('href').split('?')[0] : null;
  })();
  var waLink = function (texto) { return waBase + '?text=' + encodeURIComponent(texto); };

  /* ---------- cabecera + botón flotante según scroll ---------- */
  var cabecera = $('[data-cabecera]');
  var flotante = $('[data-wa-flotante]');
  var pie = $('.pie');
  var hero = $('.hero') || $('.pag-hero');
  var tick = false;

  function alScroll() {
    var y = window.scrollY;
    if (cabecera) cabecera.classList.toggle('is-scrolled', y > 24);
    if (flotante) {
      var umbral = hero ? hero.offsetHeight * 0.6 : 300;
      var cercaPie = pie ? pie.getBoundingClientRect().top < window.innerHeight - 40 : false;
      flotante.classList.toggle('is-visible', y > umbral && !cercaPie);
    }
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (!tick) { tick = true; requestAnimationFrame(alScroll); }
  }, { passive: true });
  alScroll();

  /* ---------- menú móvil ---------- */
  var menuBtn = $('[data-menu-btn]');
  function cerrarMenu() {
    doc.classList.remove('menu-abierto');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var abierto = doc.classList.toggle('menu-abierto');
      menuBtn.setAttribute('aria-expanded', String(abierto));
    });
    $$('[data-menu] a').forEach(function (a) { a.addEventListener('click', cerrarMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', function (m) { if (m.matches) cerrarMenu(); });
  }

  /* ---------- íconos de línea que se dibujan al entrar en pantalla ---------- */
  var dibujables = $$('.dibujar:not(.dibujar--ya)');
  if ('IntersectionObserver' in window && !reducido) {
    var ioDibujo = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visto'); ioDibujo.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    dibujables.forEach(function (el) { ioDibujo.observe(el); });
  } else {
    dibujables.forEach(function (el) { el.classList.add('visto'); });
  }

  /* ---------- hero: parallax suave con el mouse + pausa fuera de pantalla ---------- */
  var arte = $('[data-parallax]');
  if (arte) {
    var heroSec = arte.closest('.hero');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        heroSec.classList.toggle('pausado', !en[0].isIntersecting);
      }).observe(heroSec);
    }
    if (punteroFino && !reducido) {
      var capas = $$('[data-capa]', arte);
      var objetivo = { x: 0, y: 0 }, actual = { x: 0, y: 0 }, animando = false;
      var mover = function () {
        actual.x += (objetivo.x - actual.x) * 0.08;
        actual.y += (objetivo.y - actual.y) * 0.08;
        capas.forEach(function (c) {
          var k = parseFloat(c.getAttribute('data-capa')) * 14;
          c.style.transform = 'translate3d(' + (actual.x * k).toFixed(2) + 'px,' + (actual.y * k).toFixed(2) + 'px,0)';
        });
        if (Math.abs(objetivo.x - actual.x) > 0.001 || Math.abs(objetivo.y - actual.y) > 0.001) {
          requestAnimationFrame(mover);
        } else { animando = false; }
      };
      heroSec.addEventListener('pointermove', function (e) {
        var r = heroSec.getBoundingClientRect();
        objetivo.x = (e.clientX - r.left) / r.width - 0.5;
        objetivo.y = (e.clientY - r.top) / r.height - 0.5;
        if (!animando) { animando = true; requestAnimationFrame(mover); }
      });
      heroSec.addEventListener('pointerleave', function () {
        objetivo.x = 0; objetivo.y = 0;
        if (!animando) { animando = true; requestAnimationFrame(mover); }
      });
    }
  }

  /* ---------- explorador de endodoncia (tabs accesibles) ---------- */
  $$('[data-explorador]').forEach(function (exp) {
    var tabs = $$('[role="tab"]', exp);
    var paneles = $$('[data-panel]', exp);
    var svg = $('.corte', exp);
    var prev = $('[data-prev]', exp);
    var next = $('[data-next]', exp);
    var contador = $('[data-contador]', exp);
    var total = tabs.length;
    var actual = 1;

    function ir(n, foco) {
      n = Math.max(1, Math.min(total, n));
      if (n === actual && !foco) return;
      actual = n;
      tabs.forEach(function (t, i) {
        var sel = i + 1 === n;
        t.setAttribute('aria-selected', String(sel));
        t.tabIndex = sel ? 0 : -1;
        if (sel && foco) t.focus();
      });
      paneles.forEach(function (p, i) {
        var vis = i + 1 === n;
        if (vis) {
          p.removeAttribute('data-oculto');
          p.classList.remove('is-entrando');
          void p.offsetWidth;
          p.classList.add('is-entrando');
        } else {
          p.setAttribute('data-oculto', '');
        }
      });
      if (svg) svg.setAttribute('data-paso', String(n));
      if (contador) contador.textContent = 'Paso ' + n + ' de ' + total;
      if (prev) prev.disabled = n === 1;
      if (next) next.textContent = n === total ? 'Volver a empezar' : 'Siguiente paso';
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { ir(i + 1); });
      t.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); ir(actual === total ? 1 : actual + 1, true); }
        if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); ir(actual === 1 ? total : actual - 1, true); }
        if (k === 'Home') { e.preventDefault(); ir(1, true); }
        if (k === 'End') { e.preventDefault(); ir(total, true); }
      });
    });
    if (prev) prev.addEventListener('click', function () { ir(actual - 1); });
    if (next) next.addEventListener('click', function () { ir(actual === total ? 1 : actual + 1); });
  });

  /* ---------- chequeo de síntomas ---------- */
  $$('[data-chequeo]').forEach(function (form) {
    var res = $('[data-resultado]', form);
    var tit = $('[data-res-titulo]', form);
    var txt = $('[data-res-texto]', form);
    var wa = $('[data-res-wa]', form);
    var medidor = $('[data-medidor]', form);
    var NIVELES = [
      ['Marcá uno o más síntomas', 'Según lo que elijas, te decimos qué tan pronto conviene que te vea.'],
      ['Puede ser sensibilidad', 'Una puntada breve que se va enseguida suele tener una solución simple. Igual conviene revisarlo en tu próximo control.'],
      ['Conviene una evaluación pronto', 'Algunas de estas señales pueden indicar que el nervio está inflamado. Cuanto antes se revise, más simple suele ser el tratamiento.'],
      ['Pedí un turno lo antes posible', 'Estas señales son compatibles con una infección del nervio. Escribinos y buscamos el turno más próximo. Si la hinchazón avanza hacia el ojo o el cuello, o tenés fiebre, andá a una guardia.'],
    ];

    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('change', function () {
      var marcados = $$('input:checked', form);
      var puntos = marcados.reduce(function (s, i) { return s + parseFloat(i.getAttribute('data-peso')); }, 0);
      var hinchazon = marcados.some(function (i) { return i.getAttribute('data-peso') === '3'; });
      var nivel = !marcados.length ? 0 : puntos < 2 ? 1 : (puntos >= 5 || hinchazon) ? 3 : 2;

      res.setAttribute('data-nivel', String(nivel));
      tit.textContent = NIVELES[nivel][0];
      txt.textContent = NIVELES[nivel][1];
      medidor.style.width = (nivel === 0 ? 0 : Math.min(100, 18 + puntos * 12)) + '%';
      res.classList.remove('is-cambio'); void res.offsetWidth; res.classList.add('is-cambio');

      if (waBase) {
        var lista = marcados.map(function (i) { return '- ' + i.value; }).join('\n');
        wa.href = waLink(marcados.length
          ? 'Hola Jimena, quisiera pedir un turno. Tengo estos síntomas:\n' + lista
          : 'Hola Jimena, quisiera consultar por un dolor en un diente.');
      }
    });
  });

  /* ---------- mapa: se carga sólo si la persona lo pide ---------- */
  $$('[data-mapa]').forEach(function (m) {
    var btn = $('[data-mapa-btn]', m);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = m.getAttribute('data-src');
      f.title = 'Mapa del consultorio en Hipólito Yrigoyen 589, Escobar';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      m.appendChild(f);
      m.classList.add('is-cargado');
      f.focus();
    });
  });

  /* ---------- formulario de contacto → WhatsApp ---------- */
  var form = $('[data-form-wa]');
  if (form && waBase) {
    var nombre = $('#f-nombre', form);
    var error = $('[data-error-nombre]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = nombre.value.trim();
      if (!n) {
        nombre.setAttribute('aria-invalid', 'true');
        error.hidden = false;
        nombre.focus();
        return;
      }
      nombre.removeAttribute('aria-invalid');
      error.hidden = true;
      var motivo = $('#f-motivo', form).value;
      var horario = ($('input[name="horario"]:checked', form) || {}).value || 'en cualquier horario';
      var extra = $('#f-msj', form).value.trim();
      var msj = 'Hola Jimena, soy ' + n + '. Quisiera pedir un turno.\n' +
        'Motivo: ' + motivo + '.\n' +
        'Me queda mejor ' + horario + '.' +
        (extra ? '\n' + extra : '');
      window.open(waLink(msj), '_blank', 'noopener');
    });
    nombre.addEventListener('input', function () {
      if (nombre.value.trim()) { nombre.removeAttribute('aria-invalid'); error.hidden = true; }
    });
  }

  /* ---------- índice lateral: resalta la sección visible ---------- */
  var enlacesIndice = $$('.indice a');
  if (enlacesIndice.length && 'IntersectionObserver' in window) {
    var mapaIndice = {};
    enlacesIndice.forEach(function (a) { mapaIndice[a.getAttribute('href').slice(1)] = a; });
    var ioIndice = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          enlacesIndice.forEach(function (a) { a.classList.remove('is-activo'); });
          var a = mapaIndice[en.target.id];
          if (a) a.classList.add('is-activo');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(mapaIndice).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) ioIndice.observe(s);
    });
  }
})();
