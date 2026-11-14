/**
 * datos.js — Fuente única de verdad del sitio.
 * Todo lo que cambie del negocio (teléfono, dominio, horarios, redes)
 * se edita SOLO acá y después se corre:  npm run build
 */

module.exports = {
  sitio: {
    // TODO: reemplazar por el dominio definitivo (sin barra final)
    url: 'https://www.odontologajimenateruel.com.ar',
    nombre: 'Jimena Teruel · Odontóloga',
    idioma: 'es-AR',
    locale: 'es_AR',
    colorTema: '#F7F8F4',
    colorMarca: '#7E8B6C',
    creditos: { texto: 'Sitio web por Nexora', url: '' },
  },

  negocio: {
    id: 'consultorio',
    // Mismo nombre que el perfil de Google (ayuda al SEO local)
    nombre: 'Odontología Integral Jimena Teruel',
    profesional: 'Jimena Teruel',
    titulo: 'Odontóloga',
    especialidad: 'Especialista en Endodoncia',
    matricula: 'M.P. 51019',
    matriculaNumero: '51019',
    direccion: {
      calle: 'Hipólito Yrigoyen 589',
      detalle: 'Piso 1, oficina 3',
      localidad: 'Belén de Escobar',
      partido: 'Escobar',
      provincia: 'Buenos Aires',
      region: 'AR-B',
      cp: 'B1625',
      pais: 'AR',
    },
    // TODO: número de WhatsApp en formato internacional sin "+" ni espacios (ej: 5493484123456)
    whatsapp: '5491159497352',
    // TODO: teléfono como se muestra en pantalla (ej: "+54 9 348 412-3456"). Si queda vacío se muestra "WhatsApp".
    telefonoVisible: '+54 9 11 5949-7352',
    email: '',
    // TODO: completar si tiene Instagram / Facebook / perfil de Google (se agregan al schema "sameAs")
    redes: {
      instagram: 'https://www.instagram.com/odontologa.jimenateruel/',
      facebook: '',
      googleMaps: 'https://www.google.com/maps?cid=18103305016400364031',
    },
    // Instagram como se muestra en pantalla
    instagramUsuario: '@odontologa.jimenateruel',
    // Formación (aparece en "Sobre mí" y en los datos para Google).
    // TODO: confirmar con Jimena el año de recibida y desde qué año está en el consultorio.
    formacion: {
      universidad: 'Universidad de Buenos Aires',
      universidadCorta: 'UBA',
      anioTitulo: '',
      anioEspecialidad: '2012',
      consultorioDesde: '',
    },
    // Opiniones de Google. Se muestran solas cuando hay datos cargados.
    // perfil: link al perfil de Google Maps. resena: link directo para dejar una opinión.
    // opiniones: [{ autor: 'Nombre', estrellas: 5, texto: '...', fecha: 'hace 2 semanas' }]
    // Opiniones copiadas del perfil de Google (14/11/2026). Nombre + inicial del apellido.
    google: {
      perfil: 'https://www.google.com/maps?cid=18103305016400364031',
      resena: 'https://www.google.com/maps?cid=18103305016400364031',
      calificacion: '5,0',
      total: 35,
      opiniones: [
        { autor: 'Ramona M.', estrellas: 5, fecha: "Hace un mes", texto: "Jimena es muy amorosa y una excelente profesional. Su atención es personalizada y está siempre a disposición de sus pacientes. La recomiendo mucho!" },
        { autor: 'Leandro T.', estrellas: 5, fecha: "Hace 4 años", texto: "Una genia!!!!, me hice un conducto y salio todo super bien. Mucha paciencia y buena predisposición para con el paciente. La super recomiendo!!!!" },
        { autor: 'Eliana W.', estrellas: 5, fecha: "Hace 6 meses", texto: "Jime la mejor!!! Llegué a ella hace más de 20 años, con miedo al dentista por un trabajo mal realizado.. después de la primer consulta le dije: \"no te cambio más\"... y así fue!!!" },
        { autor: 'Bárbara F.', estrellas: 5, fecha: "Hace 7 meses", texto: "Quiero agradecer a la Dra. Jimena por su excelente atención. La consulté de urgencia, a tan solo 10 minutos de cerrar, para que me sacara los puntos de una extracción de muela de juicio. Lo que no esperábamos era que, al revisar, estaba con alveolitis. Había estado atravesando una situación estresante y ella estuvo ahí para calmarme, con mucha templanza y empatía. Su profesionalismo y disposición fueron increíbles. Gracias, Jime, de corazón. ¡Altamente recomendable! Una gran profesional :)" },
        { autor: 'Débora C.', estrellas: 5, fecha: "Hace 6 meses", texto: "Excelente odontóloga. La conocí por recomendación, y no me arrepiento. Muy paciente y los trabajos, impecables." },
        { autor: 'Pamela S.', estrellas: 5, fecha: "Hace un año", texto: "Muy buena atención, Jimena tiene una mano impresionante, no duele nada de lo que me hace." },
        { autor: 'Andrea S.', estrellas: 5, fecha: "Hace 2 años", texto: "Excelente profesional, fui a ella por un comentario de un paciente, donde perdía el miedo al odontologo, y lo comprobé, Jimena es muy prudente, atenta a nosotros, transmite tranquilidad, y su trabajo es impecable, volví a sonreír." },
        { autor: 'Gladys A.', estrellas: 5, fecha: "Hace 4 años", texto: "Excelente atención! Soy de esas personas que nunca van al dentista por temor o desgano, pero Jimena ha tenido conmigo una paciencia y un amor para atender poco vista en muchos profesionales. Se los recomiendo 100%." },
        { autor: 'Víctor N.', estrellas: 5, fecha: "Hace un año", texto: "Para mi LA MEJOR, paciencia y sobre todo no te hace doler nada. Super recomendable una genia" },
        { autor: 'Paula V.', estrellas: 5, fecha: "Hace 4 años", texto: "Exelente profesional y persona. Su atención súper cálida, el consultorio muy prolijo, limpio, y el compromiso con el trabajo es de primera. Gracias por todo Doctora!!!" },
      ],
    },
    // Horarios para el schema. Formato: { dias: ['Monday','Tuesday'], abre: '09:00', cierra: '18:00' }
    // Mientras esté vacío, el sitio muestra "Atención con turno".
    horarios: [{ dias: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], abre: '10:30', cierra: '19:30' }],
    horariosTexto: 'Lunes a viernes de 10:30 a 19:30',
    // Ubicación exacta (del perfil de Google)
    geo: { lat: -34.3461669, lng: -58.7931861 },
    // Localidades que se nombran en el contenido y en areaServed
    zonas: [
      'Belén de Escobar',
      'Garín',
      'Ingeniero Maschwitz',
      'Maquinista Savio',
      'Matheu',
      'Loma Verde',
      'El Cazador',
      'Campana',
      'Pilar',
    ],
    mapsQuery: 'Odontología Integral Jimena Teruel, Hipólito Yrigoyen 589, Belén de Escobar, Buenos Aires',
  },

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

  // Preguntas frecuentes (se reutilizan en páginas y en el schema FAQPage)
  faq: {
    endodoncia: [
      {
        p: '¿Duele hacerse una endodoncia?',
        r: 'El tratamiento se hace con anestesia local, así que durante la sesión no deberías sentir dolor: la sensación es parecida a la de un arreglo común. Después puede quedar una molestia leve por unos días, que se controla con la medicación que te indico.',
      },
      {
        p: '¿Cuántas sesiones lleva un tratamiento de conducto?',
        r: 'Muchos tratamientos se resuelven en una o dos sesiones. Depende del diente, de cuántos conductos tenga, de su forma y de si hay una infección que conviene tratar antes de sellar.',
      },
      {
        p: '¿Qué pasa si no me hago la endodoncia que me indicaron?',
        r: 'Un nervio dañado no se recupera solo. El problema puede avanzar al hueso, formar un absceso (flemón) y terminar en la pérdida del diente. Aunque el dolor desaparezca, eso a veces significa que el nervio murió, no que el problema se resolvió.',
      },
      {
        p: '¿Es mejor sacar el diente que hacer un tratamiento de conducto?',
        r: 'Siempre que se pueda, conservar el diente natural es la mejor opción: mantiene tu mordida, evita que los dientes vecinos se muevan y suele ser más simple y económico que reemplazarlo con un implante o una prótesis.',
      },
      {
        p: '¿Después de la endodoncia necesito una corona?',
        r: 'Depende de cuánta estructura sana le quede al diente. En muelas con mucha pérdida de tejido se suele indicar una corona o un perno para evitar que se fracturen. Lo vemos en cada caso y te lo explico antes de empezar.',
      },
      {
        p: '¿Qué es un retratamiento de conducto?',
        r: 'Es volver a tratar un diente que ya tuvo una endodoncia y que volvió a infectarse o a doler. Se retira el material anterior, se vuelve a limpiar y desinfectar cada conducto y se sella de nuevo.',
      },
    ],
    general: [
      {
        p: '¿Cada cuánto tengo que hacerme un control?',
        r: 'En general, un control con limpieza cada seis meses. Si tenés tendencia a las caries o problemas de encías, puede convenir que sea más seguido.',
      },
      {
        p: '¿Los arreglos de caries son del color del diente?',
        r: 'Sí. Las restauraciones se hacen con resinas del color del diente, que se adhieren a la pieza y quedan prácticamente invisibles.',
      },
      {
        p: '¿Hacen implantes dentales?',
        r: 'Sí. La implantología oral permite reemplazar un diente perdido con una raíz artificial de titanio sobre la que se coloca una corona fija. En la consulta evaluamos el hueso y tu salud general para saber si es la mejor opción para vos.',
      },
      {
        p: '¿El blanqueamiento daña los dientes?',
        r: 'Hecho por una profesional y con los productos indicados, no daña el esmalte. Puede dar algo de sensibilidad por unos días. Antes de blanquear conviene hacer una limpieza y revisar que no haya caries.',
      },
      {
        p: '¿Qué es un poste de fibra de vidrio?',
        r: 'Es un perno que se coloca dentro de la raíz de un diente con tratamiento de conducto para darle soporte a la reconstrucción o a la corona. La fibra de vidrio es estética y tiene una flexibilidad parecida a la del diente.',
      },
      {
        p: '¿Atienden obras sociales y prepagas?',
        r: 'Escribinos por WhatsApp con el nombre de tu obra social o prepaga y te confirmamos la cobertura y las formas de pago antes de la consulta.',
      },
      {
        p: '¿Por qué me sangran las encías al cepillarme?',
        r: 'Suele ser una señal de inflamación de las encías (gingivitis), muchas veces por acumulación de sarro. Una limpieza profesional y una buena técnica de cepillado suelen revertirlo. Si no se trata, puede avanzar y afectar el soporte de los dientes.',
      },
    ],
    ortodoncia: [
      {
        p: '¿La ortodoncista atiende en el mismo consultorio?',
        r: 'Sí. Una ortodoncista viene al consultorio para atender a los pacientes, así hacés la evaluación y el seguimiento en el mismo lugar donde te atendés siempre.',
      },
      {
        p: '¿A qué edad conviene la primera consulta de ortodoncia?',
        r: 'Se recomienda una primera evaluación alrededor de los 7 años, cuando ya se puede ver cómo se están desarrollando la mordida y los maxilares. Eso no significa que haya que empezar un tratamiento en ese momento.',
      },
      {
        p: '¿Los adultos también pueden hacer ortodoncia?',
        r: 'Sí. No hay una edad límite: si las encías y el hueso están sanos, se pueden alinear los dientes y corregir la mordida a cualquier edad.',
      },
    ],
    urgencias: [
      {
        p: '¿Qué hago si me duele mucho una muela y no tengo turno?',
        r: 'Escribinos por WhatsApp contando qué te pasa y desde cuándo, y buscamos el turno más próximo disponible. Mientras tanto, evitá masticar de ese lado y no te coloques aspirinas ni otros medicamentos sobre la encía.',
      },
      {
        p: '¿Cuándo tengo que ir directamente a una guardia?',
        r: 'Si tenés la cara muy hinchada y la hinchazón avanza hacia el ojo o el cuello, fiebre, dificultad para tragar o para respirar, o un golpe fuerte en la cara, andá a la guardia de un hospital sin esperar.',
      },
      {
        p: '¿Puedo tomar un antibiótico por mi cuenta?',
        r: 'No es recomendable. El antibiótico no resuelve la causa del dolor dental y tomarlo sin indicación puede enmascarar el cuadro. Lo que soluciona el problema es tratar el diente.',
      },
    ],
    consultorio: [
      {
        p: '¿Dónde queda el consultorio?',
        r: 'En Hipólito Yrigoyen 589, piso 1, oficina 3, en Belén de Escobar. Atendemos pacientes de Escobar, Garín, Ingeniero Maschwitz, Matheu, Maquinista Savio y alrededores.',
      },
      {
        p: '¿Cómo pido un turno?',
        r: 'Por WhatsApp. Contanos tu nombre, el motivo de la consulta y qué días u horarios te quedan mejor, y te respondemos con las opciones disponibles.',
      },
      {
        p: '¿Me atiende siempre la misma profesional?',
        r: 'Sí. Jimena trabaja sola en el consultorio, así que en cada consulta te atiende ella. Para ortodoncia, la evaluación y los controles los hace una ortodoncista que viene al consultorio.',
      },
    ],
  },
};
