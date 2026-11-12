/**
 * svg.js — Ilustraciones e íconos en línea (SVG inline = 0 requests extra).
 * El emblema está redibujado a partir del logo (diente + magnolia + arco).
 */

// Emblema. prefijo: evita ids de gradientes duplicados en la misma página.
function emblema({ prefijo = 'e', clase = '', titulo = '', animado = false } = {}) {
  const pl = animado ? ' pathLength="1"' : '';
  const a11y = titulo
    ? `role="img" aria-labelledby="${prefijo}-t"><title id="${prefijo}-t">${titulo}</title`
    : 'aria-hidden="true" focusable="false"';
  return `<svg class="emblema ${clase}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" ${a11y}>
  <defs>
    <linearGradient id="${prefijo}-pf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#D99C82"/><stop offset="1" stop-color="#F4D9C8"/></linearGradient>
    <linearGradient id="${prefijo}-pb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#E7B59C"/><stop offset="1" stop-color="#F8E6DA"/></linearGradient>
    <linearGradient id="${prefijo}-ar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9B79F"/><stop offset=".35" stop-color="#9AA588"/><stop offset="1" stop-color="#7E8B6C"/></linearGradient>
  </defs>
  <path class="em-arco" d="M132 18 A88 88 0 1 0 186 120" fill="none" stroke="url(#${prefijo}-ar)" stroke-width="2.4" stroke-linecap="round"${pl}/>
  <g class="em-diente" fill="none" stroke="#7E8B6C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M117 46C110 41 104 44 99 49C93 42 84 38 73 41C56 45 48 62 51 84C54 104 60 122 64 146C66 160 76 163 80 150C84 136 86 122 96 118"${pl}/>
    <path d="M110 120C116 124 118 138 121 150C124 162 133 160 135 147C138 128 143 110 147 90C149 80 148 72 144 66"${pl}/>
  </g>
  <path class="em-tallo" d="M103 150C101 128 104 104 114 86C119 77 124 70 128 64" fill="none" stroke="#7E8B6C" stroke-width="3" stroke-linecap="round"${pl}/>
  <g class="em-hojas">
    <path class="em-hoja h1" d="M104 116C92 112 84 104 82 94C94 95 102 103 104 116Z" fill="#8F9C7C"/>
    <path class="em-hoja h2" d="M110 98C120 92 132 92 140 98C130 106 118 106 110 98Z" fill="#7E8B6C"/>
    <path class="em-hoja h3" d="M107 132C118 128 128 130 134 136C124 142 114 140 107 132Z" fill="#A3AE91"/>
  </g>
  <g transform="translate(129 63) rotate(16)">
    <g class="em-flor">
      <path class="em-petalo p1" d="M0 0C-17-6-27-22-23-42C-8-38 3-20 0 0Z" fill="url(#${prefijo}-pb)"/>
      <path class="em-petalo p2" d="M0 0C17-6 27-22 23-42C8-38-3-20 0 0Z" fill="url(#${prefijo}-pb)"/>
      <path class="em-petalo p3" d="M0 0C-22 2-38-8-44-24C-26-28-9-16 0 0Z" fill="url(#${prefijo}-pf)"/>
      <path class="em-petalo p4" d="M0 0C22 2 38-8 44-24C26-28 9-16 0 0Z" fill="url(#${prefijo}-pf)"/>
      <path class="em-petalo p5" d="M0 0C-14-12-15-34 0-50C15-34 14-12 0 0Z" fill="url(#${prefijo}-pf)"/>
    </g>
  </g>
</svg>`;
}

// Pétalo suelto (para la animación de pétalos flotando en el hero)
const petalo = (clase) =>
  `<svg class="petalo-suelto ${clase}" viewBox="-12 -26 24 28" aria-hidden="true" focusable="false"><path d="M0 0C-9-6-10-18 0-26C10-18 9-6 0 0Z" fill="#EBC3AD"/></svg>`;

// Íconos de línea 48x48 (stroke = currentColor). pathLength para animar el trazo.
const ICONOS = {
  endodoncia: `<path d="M16 6C11 6 8 10 8 16C8 24 11 30 12 38C12.5 42 15 43 16.5 40C18 36 19 30 24 30C29 30 30 36 31.5 40C33 43 35.5 42 36 38C37 30 40 24 40 16C40 10 37 6 32 6C29 6 27 8 24 8C21 8 19 6 16 6Z" pathLength="1"/><path d="M19 18C21 15 27 15 29 18M19 18C18 26 16.5 33 15.5 38M29 18C30 26 31.5 33 32.5 38" pathLength="1" class="acento"/>`,
  general: `<path d="M16 8C11 8 8 12 8 18C8 26 11 31 12 38C12.5 42 15 43 16.5 40C18 36 19 32 24 32C29 32 30 36 31.5 40C33 43 35.5 42 36 38C37 31 40 26 40 18C40 12 37 8 32 8C29 8 27 10 24 10C21 10 19 8 16 8Z" pathLength="1"/><path d="M41 3V9M38 6H44M14 16C15 13 17 12 20 12" pathLength="1" class="acento"/>`,
  ortodoncia: `<path d="M6 14C6 11 8 9 11 9C14 9 16 11 16 14V30C16 34 14 37 11 37C8 37 6 34 6 30ZM19 12C19 9 21 8 24 8C27 8 29 9 29 12V31C29 35 27 38 24 38C21 38 19 35 19 31ZM32 14C32 11 34 9 37 9C40 9 42 11 42 14V30C42 34 40 37 37 37C34 37 32 34 32 30Z" pathLength="1"/><path d="M3 22H45M9 20H13V24H9ZM22 20H26V24H22ZM35 20H39V24H35Z" pathLength="1" class="acento"/>`,
  urgencias: `<path d="M16 6C11 6 8 10 8 16C8 24 11 30 12 38C12.5 42 15 43 16.5 40C18 36 19 30 24 30C29 30 30 36 31.5 40C33 43 35.5 42 36 38C37 30 40 24 40 16C40 10 37 6 32 6C29 6 27 8 24 8C21 8 19 6 16 6Z" pathLength="1"/><path d="M26 11L20 20H27L21 28" pathLength="1" class="acento"/>`,
  prevencion: `<path d="M8 40L30 18M30 18L34 14C36 12 39 12 41 14C43 16 43 19 41 21L37 25C35 27 32 27 30 25L23 18" pathLength="1"/><path d="M33 9V13M37 7V12M41 6V10M45 8V12" pathLength="1" class="acento"/>`,
  restauracion: `<path d="M16 6C11 6 8 10 8 16C8 24 11 30 12 38C12.5 42 15 43 16.5 40C18 36 19 30 24 30C29 30 30 36 31.5 40C33 43 35.5 42 36 38C37 30 40 24 40 16C40 10 37 6 32 6C29 6 27 8 24 8C21 8 19 6 16 6Z" pathLength="1"/><path d="M18 14C20 18 28 18 30 14" pathLength="1" class="acento"/>`,
  extraccion: `<path d="M16 14C12 14 10 17 10 21C10 27 12 31 13 36C13.5 39 15.5 40 16.5 37.5C17.5 34 19 31 22 31C25 31 26.5 34 27.5 37.5C28.5 40 30.5 39 31 36C32 31 34 27 34 21C34 17 32 14 28 14C26 14 24.5 15.5 22 15.5C19.5 15.5 18 14 16 14Z" pathLength="1"/><path d="M38 4V12M34 8L38 4L42 8" pathLength="1" class="acento"/>`,
  consulta: `<circle cx="32" cy="14" r="8" pathLength="1"/><path d="M26 20L8 42" pathLength="1"/><path d="M29 11C30 10 32 10 34 11" pathLength="1" class="acento"/>`,
};

function icono(nombre, clase = '') {
  return `<svg class="icono ${clase}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONOS[nombre]}</svg>`;
}

// Íconos utilitarios (16–24px)
const UI = {
  whatsapp: `<svg class="ui-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.29Z"/></svg>`,
  pin: `<svg class="ui-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
  reloj: `<svg class="ui-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  persona: `<svg class="ui-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>`,
  dos: `<svg class="ui-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="8.5" cy="8" r="3.2"/><circle cx="16.5" cy="9" r="2.6"/><path d="M2.5 20c1-3.4 3.3-5.2 6-5.2s5 1.8 6 5.2M15 14.6c2.6-.3 5 1.2 6.2 4.4"/></svg>`,
  escudo: `<svg class="ui-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  menu: `<svg class="ui-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 8h16M4 16h16"/></svg>`,
  cerrar: `<svg class="ui-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  mas: `<svg class="ui-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"/></svg>`,
  mapa: `<svg class="ui-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>`,
};

/**
 * Corte transversal de una muela para el explorador de endodoncia.
 * Las capas se muestran/ocultan con CSS según data-paso="1..5".
 */
function corteDiente() {
  return `<svg class="corte" viewBox="0 0 320 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="corte-t corte-d" data-paso="1">
  <title id="corte-t">Corte de una muela durante un tratamiento de conducto</title>
  <desc id="corte-d">Ilustración que muestra el esmalte, la dentina, la pulpa y los conductos de una muela, y cómo cambian en cada paso del tratamiento.</desc>
  <defs>
    <radialGradient id="cx-lesion"><stop offset="0" stop-color="#9C3B2A" stop-opacity=".55"/><stop offset="1" stop-color="#9C3B2A" stop-opacity="0"/></radialGradient>
    <radialGradient id="cx-halo"><stop offset=".4" stop-color="#B7C7A6" stop-opacity=".55"/><stop offset="1" stop-color="#B7C7A6" stop-opacity="0"/></radialGradient>
    <linearGradient id="cx-hueso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDE3D3"/><stop offset="1" stop-color="#E3D6C1"/></linearGradient>
    <radialGradient id="cx-fadeg" cx=".5" cy=".6" r=".62"><stop offset=".62" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
    <mask id="cx-fade"><rect width="320" height="420" fill="url(#cx-fadeg)"/></mask>
    <linearGradient id="cx-scang" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E8B6C" stop-opacity="0"/><stop offset=".5" stop-color="#7E8B6C" stop-opacity=".55"/><stop offset="1" stop-color="#7E8B6C" stop-opacity="0"/></linearGradient>
    <clipPath id="cx-clip"><path d="M95 70C110 52 140 55 160 66C180 55 210 52 225 70C245 92 248 130 240 165C236 200 232 250 226 300C222 340 214 368 202 370C190 372 186 350 184 320C181 280 176 240 160 236C144 240 139 280 136 320C134 350 130 372 118 370C106 368 98 340 94 300C88 250 84 200 80 165C72 130 75 92 95 70Z"/></clipPath>
  </defs>
  <g mask="url(#cx-fade)">
  <path class="cx-encia" d="M0 168C50 158 72 166 86 176H234C248 166 270 158 320 168V214H0Z" fill="#E8B4A2"/>
  <path class="cx-hueso" d="M0 204C60 196 100 200 160 206C220 200 260 196 320 204V420H0Z" fill="url(#cx-hueso)"/>
  <g class="cx-trabeculas" fill="#D8C9B1">
    <circle cx="40" cy="250" r="3"/><circle cx="62" cy="300" r="2"/><circle cx="30" cy="350" r="2.5"/><circle cx="70" cy="390" r="3"/><circle cx="280" cy="240" r="2.5"/><circle cx="258" cy="310" r="3"/><circle cx="290" cy="360" r="2"/><circle cx="250" cy="395" r="2.5"/><circle cx="160" cy="300" r="2.5"/><circle cx="160" cy="370" r="2"/>
  </g>
  </g>
  <circle class="cx-halo" cx="160" cy="250" r="150" fill="url(#cx-halo)"/>
  <g class="cx-lesion"><circle cx="119" cy="366" r="22" fill="url(#cx-lesion)"/><circle cx="201" cy="366" r="18" fill="url(#cx-lesion)"/></g>
  <path class="cx-esmalte" d="M95 70C110 52 140 55 160 66C180 55 210 52 225 70C245 92 248 130 240 165C236 200 232 250 226 300C222 340 214 368 202 370C190 372 186 350 184 320C181 280 176 240 160 236C144 240 139 280 136 320C134 350 130 372 118 370C106 368 98 340 94 300C88 250 84 200 80 165C72 130 75 92 95 70Z" fill="#FFFFFF" stroke="#7E8B6C" stroke-width="2"/>
  <path class="cx-dentina" d="M103 80C116 66 140 68 160 78C180 68 204 66 217 80C234 100 236 132 230 165C227 200 224 250 219 300C216 336 210 360 202 362C194 363 192 345 190 318C187 278 180 232 160 228C140 232 133 278 130 318C128 345 126 363 118 362C110 360 104 336 101 300C96 250 93 200 90 165C84 132 86 100 103 80Z" fill="#F4EBDD"/>
  <path class="cx-pulpa" d="M126 128C130 114 142 116 148 124C154 120 166 120 172 124C178 116 190 114 194 128C198 145 194 162 188 172C196 200 205 280 203 352C202 357 199 357 198 352C193 290 184 210 176 180C168 176 152 176 144 180C136 210 127 290 122 352C121 357 118 357 117 352C115 280 124 200 132 172C126 162 122 145 126 128Z"/>
  <g class="cx-limpio" fill="none" stroke="#7E8B6C" stroke-width="1.4" stroke-dasharray="3 4">
    <path d="M138 176C130 220 122 290 119.5 352"/><path d="M182 176C190 220 198 290 200.5 352"/>
  </g>
  <g class="cx-gutapercha" fill="none" stroke="#E0906C" stroke-width="7" stroke-linecap="round">
    <path d="M119.5 350C122 290 130 220 138 178" pathLength="1"/><path d="M200.5 350C198 290 190 220 182 178" pathLength="1"/>
  </g>
  <path class="cx-camara-sellada" d="M128 132C132 122 142 124 148 130C154 127 166 127 172 130C178 124 188 122 192 132C195 146 191 160 186 170C176 174 144 174 134 170C129 160 125 146 128 132Z" fill="#E7A584"/>
  <path class="cx-acceso" d="M146 64L174 64L168 128L152 128Z" fill="#5B463B"/>
  <path class="cx-restauracion" d="M146 63C152 61 168 61 174 63L168 128L152 128Z" fill="#FBF7F0" stroke="#7E8B6C" stroke-width="1.6"/>
  <g class="cx-lima">
    <rect x="132" y="-6" width="12" height="26" rx="4" fill="#E0906C"/>
    <path d="M138 20C137 70 137 120 136 176C134 200 131 230 128 262" fill="none" stroke="#9AA588" stroke-width="2.2" stroke-dasharray="2 2"/>
  </g>
  <g class="cx-gotas" fill="#B7D0D6">
    <circle cx="156" cy="100" r="3"/><circle cx="165" cy="112" r="2.4"/><circle cx="150" cy="140" r="2.6"/><circle cx="172" cy="150" r="2"/>
  </g>
  <g class="cx-dique" fill="#9AA588" fill-opacity=".55">
    <path d="M6 150C30 144 58 144 82 150V162C58 156 30 156 6 162Z"/><path d="M238 150C262 144 290 144 314 150V162C290 156 262 156 238 162Z"/>
    <path d="M84 142C82 126 92 112 104 110M236 142C238 126 228 112 216 110" fill="none" stroke="#6B7A5C" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="cx-brillo" fill="#E0906C">
    <path d="M250 70L253 79L262 82L253 85L250 94L247 85L238 82L247 79Z"/><path d="M70 96L72 101L77 103L72 105L70 110L68 105L63 103L68 101Z"/>
  </g>
  <g clip-path="url(#cx-clip)"><rect class="cx-scan" x="40" y="40" width="240" height="26" fill="url(#cx-scang)"/></g>
  <g class="cx-etiquetas" font-family="Figtree, system-ui, sans-serif" font-size="11" fill="#5D6A55">
    <text x="252" y="120">Esmalte</text><path d="M249 116H238" stroke="#9AA588"/>
    <text x="250" y="232">Dentina</text><path d="M247 228H224" stroke="#9AA588"/>
    <text x="14" y="128">Pulpa</text><path d="M48 124H128" stroke="#9AA588"/>
    <text x="14" y="300">Conducto</text><path d="M66 296H124" stroke="#9AA588"/>
  </g>
</svg>`;
}

module.exports = { emblema, petalo, icono, UI, corteDiente };
