/**
 * datos.js — Datos del sitio.
 *
 * El contenido que se puede editar (dirección, horarios, teléfono, aviso, textos,
 * tratamientos, preguntas frecuentes, opiniones y fotos) está en
 * contenido/sitio.json. Se edita desde el panel /admin/ o a mano, y después:
 *     npm run build
 * Acá queda lo que no cambia seguido: dominio, menú y SEO de cada página.
 */
const fs = require('fs');
const path = require('path');
const R = require('./contenido');

const ARCHIVO = path.join(__dirname, '..', 'contenido', 'sitio.json');
const crudo = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
const errores = R.validar(crudo);
if (errores.length) {
  console.error('\n✗ contenido/sitio.json tiene errores:\n  · ' + errores.join('\n  · ') + '\n');
  process.exit(1);
}
// Los textos pueden usar {direccion}, {localidad}, {horarios}, {telefono}, {zonas}.
const C = R.rellenarTodo(crudo, crudo);
const horariosTexto = R.textoHorarios(C.negocio.horarios);

module.exports = {
  sitio: {
    // TODO: reemplazar por el dominio definitivo (sin barra final)
    url: 'https://www.odontologajimenateruel.com.ar',
    nombre: 'Jimena Teruel · Odontóloga',
    idioma: 'es-AR',
    locale: 'es_AR',
    colorTema: '#F7F8F4',
    colorMarca: '#7E8B6C',
    creditos: { texto: 'Desarrollado por NexoraSaaS', url: 'https://nexorasaas.com/' },
  },

  negocio: {
    id: 'consultorio',
    ...C.negocio,
    // Para el schema de Google (días en inglés)
    horarios: C.negocio.horarios.map((h) => ({ dias: h.dias.map((d) => R.DIAS_SCHEMA[d]), abre: h.abre, cierra: h.cierra })),
    horariosTexto: horariosTexto + (C.negocio.horariosNota ? `. ${C.negocio.horariosNota}` : ''),
    google: C.google,
  },

  aviso: C.aviso,
  fotos: C.fotos,
  textos: C.textos,
  tratamientos: C.tratamientos,
  // Preguntas frecuentes (se reutilizan en páginas y en el schema FAQPage)
  faq: C.faq,
  // Contenido tal cual está en el archivo (para el versionado)
  archivoContenido: ARCHIVO,

  // Navegación principal (orden del menú)
  nav: [
    { id: 'endodoncia', texto: 'Endodoncia' },
    { id: 'odontologia-general', texto: 'Odontología general' },
    { id: 'ortodoncia', texto: 'Ortodoncia' },
    { id: 'urgencias', texto: 'Urgencias' },
    { id: 'sobre-mi', texto: 'Sobre mí' },
    { id: 'preguntas-frecuentes', texto: 'Preguntas' },
  ],

  /**
   * SEO por página.
   * titulo: <title> (ideal 50–62 caracteres)
   * descripcion: meta description (ideal 140–160 caracteres)
   * keywords: palabra clave principal primero
   */
  paginas: {
    inicio: {
      ruta: '/',
      prioridad: '1.0',
      frecuencia: 'monthly',
      titulo: 'Odontóloga en Escobar, especialista en Endodoncia | Jimena Teruel',
      descripcion:
        'Consultorio odontológico en Escobar: endodoncia, prótesis, implantes, blanqueamientos, limpiezas y ortodoncia. Pedí tu turno por WhatsApp.',
      keywords: [
        'odontóloga en Escobar',
        'dentista en Escobar',
        'endodoncista en Escobar',
        'consultorio odontológico Escobar',
        'odontología Belén de Escobar',
        'tratamiento de conducto Escobar',
        'ortodoncia Escobar',
        'implantes dentales Escobar',
        'blanqueamiento dental Escobar',
        'prótesis dental Escobar',
        'dentista Garín',
        'dentista Maschwitz',
      ],
      migas: 'Inicio',
    },
    endodoncia: {
      ruta: '/endodoncia/',
      prioridad: '0.9',
      frecuencia: 'monthly',
      titulo: 'Endodoncia en Escobar: tratamiento de conducto | Jimena Teruel',
      descripcion:
        'Tratamiento de conducto con odontóloga especialista en Endodoncia en Belén de Escobar. Conservá tu diente natural. Diagnóstico, retratamientos y urgencias.',
      keywords: [
        'endodoncia en Escobar',
        'tratamiento de conducto Escobar',
        'endodoncista Escobar',
        'especialista en endodoncia',
        'retratamiento endodóntico',
        'conducto dental precio',
        'dolor de muela nervio',
        'endodoncia Garín',
        'endodoncia Maschwitz',
      ],
      migas: 'Endodoncia',
    },
    'odontologia-general': {
      ruta: '/odontologia-general/',
      prioridad: '0.9',
      frecuencia: 'monthly',
      titulo: 'Odontología en Escobar: prótesis, implantes, limpiezas y blanqueamiento',
      descripcion:
        'Limpiezas, operatoria dental, prótesis fija y removible, implantes, postes de fibra de vidrio y blanqueamientos en Belén de Escobar. Pedí tu turno.',
      keywords: [
        'dentista en Escobar',
        'odontología general Escobar',
        'limpieza dental Escobar',
        'arreglo de caries',
        'restauraciones estéticas',
        'prótesis dental Escobar',
        'prótesis removible',
        'coronas y puentes',
        'implantes dentales Escobar',
        'blanqueamiento dental Escobar',
        'postes de fibra de vidrio',
        'operatoria dental',
        'odontólogo Belén de Escobar',
      ],
      migas: 'Odontología general',
    },
    ortodoncia: {
      ruta: '/ortodoncia/',
      prioridad: '0.8',
      frecuencia: 'monthly',
      titulo: 'Ortodoncia en Escobar: ortodoncista en el consultorio',
      descripcion:
        'Ortodoncia en Belén de Escobar con ortodoncista que atiende en el mismo consultorio. Evaluación, brackets y seguimiento para corregir dientes y mordida.',
      keywords: [
        'ortodoncia en Escobar',
        'ortodoncista Escobar',
        'brackets Escobar',
        'dientes torcidos',
        'corrección de mordida',
        'ortodoncia adultos',
        'ortodoncia niños Escobar',
      ],
      migas: 'Ortodoncia',
    },
    urgencias: {
      ruta: '/urgencias/',
      prioridad: '0.8',
      frecuencia: 'monthly',
      titulo: 'Urgencias odontológicas en Escobar | Dolor de muela, flemón',
      descripcion:
        '¿Te duele una muela, se te hinchó la cara o se rompió un diente? Qué hacer mientras tanto y cómo pedir el turno más próximo en Belén de Escobar.',
      keywords: [
        'urgencia odontológica Escobar',
        'dentista de urgencia Escobar',
        'dolor de muela Escobar',
        'flemón dental',
        'absceso dental',
        'diente roto',
        'qué hacer si me duele una muela',
      ],
      migas: 'Urgencias',
    },
    'sobre-mi': {
      ruta: '/sobre-mi/',
      prioridad: '0.7',
      frecuencia: 'yearly',
      titulo: 'Jimena Teruel, odontóloga en Escobar | Endodoncia, M.P. 51019',
      descripcion:
        'Jimena Teruel, odontóloga de la UBA y especialista en Endodoncia (UBA). Matrícula provincial 51019. Atención integral y personalizada en Escobar.',
      keywords: [
        'Jimena Teruel odontóloga',
        'Jimena Teruel endodoncia',
        'odontóloga UBA Escobar',
        'odontóloga Escobar',
        'especialista en endodoncia Escobar',
        'M.P. 51019',
      ],
      migas: 'Sobre mí',
    },
    'preguntas-frecuentes': {
      ruta: '/preguntas-frecuentes/',
      prioridad: '0.7',
      frecuencia: 'monthly',
      titulo: 'Preguntas frecuentes sobre endodoncia y tratamientos dentales',
      descripcion:
        '¿Duele un tratamiento de conducto? ¿Cuántas sesiones lleva? ¿Conviene sacar el diente? Respuestas claras de una odontóloga especialista en Escobar.',
      keywords: [
        'duele la endodoncia',
        'cuántas sesiones tratamiento de conducto',
        'endodoncia o extracción',
        'corona después de endodoncia',
        'preguntas dentista',
        'odontóloga Escobar',
      ],
      migas: 'Preguntas frecuentes',
    },
    contacto: {
      ruta: '/contacto/',
      prioridad: '0.8',
      frecuencia: 'yearly',
      titulo: 'Turnos y contacto | Consultorio odontológico en Escobar',
      descripcion:
        'Pedí tu turno por WhatsApp. Consultorio en Hipólito Yrigoyen 589, piso 1, oficina 3, Belén de Escobar. Cómo llegar, mapa y datos de contacto.',
      keywords: [
        'turno dentista Escobar',
        'consultorio odontológico Hipólito Yrigoyen Escobar',
        'odontóloga Escobar contacto',
        'dentista cerca de mí Escobar',
      ],
      migas: 'Contacto',
    },
  },
};
