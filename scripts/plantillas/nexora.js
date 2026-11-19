/**
 * nexora.js — Firma "Desarrollado por NexoraSaaS" con el logo de la agencia.
 * Mismo logo y texto que usa scripts/firma-nexora.js en el repo de Nexora.
 * Los estilos están en main.css (sitio) y admin.css (panel), porque la CSP no permite <style> en línea.
 */
const URL_NEXORA = 'https://nexorasaas.com/';

function logoNexora({ tamano = 18, clase = 'nx-logo' } = {}) {
  return `<svg class="${clase}" viewBox="0 0 100 100" width="${tamano}" height="${tamano}" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="50" fill="#5046E5"/><path d="M29.3 29.3V70.7M29.3 29.3 70.7 70.7M70.7 36V70.7" stroke="#fff" stroke-width="7.4" stroke-linecap="round" fill="none"/><circle cx="29.3" cy="29.3" r="7.4" fill="#fff"/><circle cx="29.3" cy="70.7" r="7.4" fill="#fff"/><circle cx="70.7" cy="70.7" r="7.4" fill="#fff"/><circle cx="70.7" cy="29.3" r="7.2" fill="#30D3C2"/></svg>`;
}

function firmaNexora({ clase = 'nx-firma', tamano = 18 } = {}) {
  return `<a class="${clase}" href="${URL_NEXORA}" target="_blank" rel="noopener" title="Diseño de páginas web: NexoraSaaS">${logoNexora({ tamano })}<span>Desarrollado por <b>NexoraSaaS</b></span></a>`;
}

module.exports = { logoNexora, firmaNexora, URL_NEXORA };
