# Jimena Teruel · Odontóloga en Escobar

Sitio institucional de la Od. Jimena Teruel, especialista en Endodoncia (M.P. 51019).
Hipólito Yrigoyen 589, piso 1, oficina 3, Belén de Escobar.

Sitio estático, sin frameworks ni dependencias: HTML + CSS + JS vanilla, generado con un script de Node.
Listo para GitHub + Vercel.

---

## Antes de publicar (pendientes)

Todo se edita en **`scripts/datos.js`** y después se corre `npm run build`.

| Pendiente | Dónde | Estado |
|---|---|---|
| Número de WhatsApp | `negocio.whatsapp` (formato `549XXXXXXXXXX`) | ⚠️ placeholder `5491100000000` |
| Teléfono visible | `negocio.telefonoVisible` | vacío → muestra "WhatsApp" |
| Dominio definitivo | `sitio.url` (canonical, sitemap, schema, OG) | ⚠️ placeholder `jimenateruel.com.ar` |
| Horarios | `negocio.horarios` (también van al schema) | vacío → "Atención con turno previo" |
| Instagram / Google Maps | `negocio.redes` (van a `sameAs`) | vacío |
| Foto de Jimena | `public/img/jimena.webp` (800×1000) — se detecta sola | sin foto → usa el emblema |
| Link de la firma Nexora | `sitio.creditos.url` | sin link |
| Confirmar tratamientos | textos de `scripts/paginas/*.js` | revisar con Jimena |

## Comandos

```bash
npm run build   # genera /public
npm run dev     # genera + vista previa en http://localhost:3000 (con las mismas cabeceras que Vercel)
```

No hay `npm install`: no usa dependencias.

## Estructura

```
jimena-odontologa/
├── public/                    ← lo que sirve Vercel (generado + assets)
│   ├── index.html             ← /
│   ├── endodoncia/            ← /endodoncia/
│   ├── odontologia-general/
│   ├── ortodoncia/
│   ├── urgencias/
│   ├── sobre-mi/
│   ├── preguntas-frecuentes/
│   ├── contacto/
│   ├── 404.html
│   ├── css/main.css
│   ├── js/main.js
│   ├── fonts/                 ← Marcellus + Figtree (self-hosted, OFL)
│   ├── img/                   ← logo, íconos PWA
│   ├── favicon.svg / .ico, apple-touch-icon.png, og-image.png
│   ├── sitemap.xml, robots.txt, site.webmanifest, llms.txt
├── scripts/
│   ├── datos.js               ← negocio, SEO por página, preguntas frecuentes
│   ├── construir.js           ← generador
│   ├── servidor-local.js      ← vista previa local
│   ├── plantillas/            ← head SEO, cabecera, pie, JSON-LD, componentes, SVG
│   └── paginas/               ← contenido de cada página
├── vercel.json                ← build, URLs limpias, redirecciones, CSP y caché
└── package.json
```

> Los HTML de `public/` se regeneran en cada build: editá `scripts/`, no `public/*.html`.

## Deploy en Vercel

1. Subí el repo a GitHub:
   ```bash
   git init && git add . && git commit -m "Sitio Jimena Teruel"
   git branch -M main
   git remote add origin https://github.com/<usuario>/jimena-odontologa.git
   git push -u origin main
   ```
2. En Vercel: **Add New → Project →** importar el repo. No hace falta tocar nada: `vercel.json` ya define
   `buildCommand`, `outputDirectory: public`, `cleanUrls` y `trailingSlash`.
3. **Settings → Domains**: agregar el dominio y actualizar `sitio.url` en `datos.js`.

### Dentro del repo de Nexora

Si el sitio se sirve desde el router multi-cliente de Nexora, copiá el **contenido** de `public/` a
`sitios/institucional/jimena-teruel/` y registrá el cliente en `clientes/` con su `_plantilla.json`.
Todas las rutas del sitio son absolutas desde la raíz (`/css/...`, `/endodoncia/`), así que el router
tiene que servir la carpeta del cliente como raíz del dominio. El pie incluye el comentario
`<!-- firma-nexora -->` por si el script de firma lo usa como marcador.

## SEO incluido

- **Por página**: `title` y `description` únicos con palabra clave local, `keywords`, `canonical`,
  `hreflang es-AR`, Open Graph + Twitter Card, `geo.region` / `geo.placename`.
- **Datos estructurados (JSON-LD, `@graph` enlazado)**: `Dentist` + `MedicalClinic` (dirección,
  zonas atendidas, catálogo de tratamientos), `Person` con matrícula, `WebSite`, `MedicalWebPage`,
  `MedicalProcedure` (endodoncia paso a paso), `Service`, `ProfilePage`, `ContactPage`,
  `BreadcrumbList` y `FAQPage` en cada página con preguntas.
- **Contenido**: páginas por intención de búsqueda (endodoncia, tratamiento de conducto, dentista,
  urgencias, dolor de muela, ortodoncia), menciones naturales de Escobar, Garín, Maschwitz, Matheu y
  alrededores, índice con anclas, enlazado interno y migas de pan.
- **Técnico**: `sitemap.xml`, `robots.txt`, `llms.txt`, 404 con `noindex`, URLs limpias,
  redirecciones 308 de variantes (`/turnos`, `/endodoncista`, `/tratamiento-de-conducto`).
- **Rendimiento** (Lighthouse móvil): Performance 100 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100.
  ~85 KB totales por página, fuentes precargadas, cero dependencias, mapa de Google que se carga
  sólo cuando se pide.

### Después de publicar

1. **Perfil de Empresa de Google** (lo más importante: los pacientes llegan googleando). Misma
   dirección exacta, categoría "Endodoncista" + "Dentista", link al sitio y al WhatsApp.
2. **Google Search Console**: verificar el dominio y enviar `/sitemap.xml`.
3. Cargar la URL del perfil de Google en `negocio.redes.googleMaps` y rebuild.

## Interacciones

- Hero: el emblema se dibuja (diente → tallo → hojas → magnolia), título palabra por palabra, parallax
  suave con el mouse, pétalos que se pausan fuera de pantalla.
- Explorador de endodoncia: corte de muela con 5 pasos (tabs accesibles con teclado).
- Chequeo de síntomas: orientativo, arma el mensaje de WhatsApp con los síntomas marcados.
- Formulario de contacto → abre WhatsApp con nombre, motivo y horario (no guarda datos).
- Respeta `prefers-reduced-motion`; funciona sin JavaScript.
