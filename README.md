# Jimena Teruel · Odontóloga en Escobar

Sitio institucional de la Od. Jimena Teruel, especialista en Endodoncia (M.P. 51019).
Belén de Escobar · https://www.odontologajimenateruel.com.ar

Sitio estático, sin frameworks ni dependencias: HTML + CSS + JS vanilla, generado con un script de Node.
Listo para GitHub + Vercel.

---

## Panel de administración con IA (`/admin/`)

Jimena entra a **https://www.odontologajimenateruel.com.ar/admin/** con su contraseña y le escribe
a la IA lo que quiere cambiar, como se lo diría a una persona ("me mudé a Mitre 950, planta baja",
"me voy de vacaciones del 2 al 16 de enero", "agregá esta opinión de Google", o le manda una foto).
La IA arma una **propuesta con el antes y el después**; Jimena toca **Publicar** y en 1 o 2 minutos
el sitio se actualiza solo. Cada cambio queda en el **historial** y el último se puede **deshacer**.

**Qué puede cambiar:** dirección (y el pin del mapa, que se calcula solo), teléfono/WhatsApp,
horarios, aviso temporal arriba de todo el sitio (vacaciones, feriados), Instagram, email, zonas,
formación y años, opiniones de Google, su foto y fotos del consultorio, textos del inicio y de
"Sobre mí", tratamientos y preguntas frecuentes. Si se muda a otra localidad, los textos y el SEO
que nombran "Escobar" se adaptan solos.
**Qué no:** diseño, colores, logo, menú, páginas nuevas y SEO. Para eso la IA le redacta el pedido
y se lo puede mandar a Fabricio por WhatsApp con un botón.

### Cómo funciona

```
Jimena escribe ─► /api/panel/chat ─► IA (Gemini, gratis) ─► propuesta validada ─► Publicar
                                                                          │
     sitio actualizado ◄── Vercel genera el sitio ◄── commit en GitHub ◄──┘
```

- Todo lo editable vive en **`contenido/sitio.json`**. La IA no toca código: solo propone cambios
  sobre ese archivo, que se **validan** (tipos, largos, formatos, sin HTML/código) antes de mostrarse
  y otra vez antes de publicarse. Si la IA se equivoca, el sistema le marca el error y lo corrige sola.
- Publicar = un commit en GitHub (`Panel: …`) → Vercel lo despliega como cualquier otro push.
  `public/version.json` le avisa al panel cuándo el sitio ya está actualizado.
- Las fotos se achican en el celular antes de subirse (WebP, máx. 1600 px) y se guardan en
  `public/img/subidas/`.
- Seguridad: contraseña + cookie firmada (`HttpOnly`, `SameSite=Strict`, 30 días), límite de intentos,
  bloqueo de pedidos de otros sitios, `noindex`, el token de GitHub solo puede escribir en este repo.

### Configuración (una sola vez, todo gratis)

1. **Clave de la IA (Gemini, gratis):** entrá a https://aistudio.google.com/apikey con una cuenta de
   Google → *Create API key*. No pide tarjeta. *(En el nivel gratuito Google puede usar lo que se
   envía para mejorar sus productos: al panel solo va información pública del sitio. Jimena no debe
   escribir datos de pacientes.)*
2. **Token de GitHub:** https://github.com/settings/personal-access-tokens/new →
   *Fine-grained token* · *Repository access: Only select repositories* → `odontologia` ·
   *Permissions → Repository → Contents: Read and write* · expiración lo más larga posible
   (anotá la fecha para renovarlo).
3. **Vercel → proyecto → Settings → Environment Variables** (Production):

   | Variable | Valor |
   |---|---|
   | `ADMIN_PASSWORD` | la contraseña de Jimena (mínimo 8 caracteres) |
   | `GEMINI_API_KEY` | la clave del paso 1 |
   | `GITHUB_TOKEN` | el token del paso 2 |
   | `CONTACTO_SOPORTE` | *(opcional)* tu WhatsApp, ej. `5491100000000`, para el botón "Enviárselo a Fabricio" |
   | `GITHUB_REPO` / `GITHUB_BRANCH` | *(opcional)* por defecto `fabricioagguero-dev/odontologia` / `main` |
   | `IA_PROVEEDOR`, `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` | *(opcional, pago)* para usar Claude en vez de Gemini |

4. **Deployments → Redeploy** para que tome las variables. Listo: `/admin/`.
   Si falta alguna variable, la pantalla de ingreso dice cuál.

> **Para Fabricio:** como Jimena publica desde el panel, GitHub puede tener cambios que tu carpeta no.
> `subir-a-github.sh` ya los trae antes de subir lo tuyo, así nunca se pisan.

### Probar el panel en tu compu

Creá `.env.local` (no se sube a GitHub) con las mismas variables y corré `npm run dev` →
http://localhost:3000/admin/. Ojo: publicar desde ahí también hace un commit real en GitHub.

## Pendientes

| Pendiente | Dónde |
|---|---|
| Foto de Jimena y del consultorio | desde el panel (o `public/img/jimena.webp` y `public/img/consultorio/`) |
| Año de recibida y "en el consultorio desde" | desde el panel (`negocio.formacion`) |
| Link de la firma Nexora | `sitio.creditos.url` en `scripts/datos.js` |
| Renovar el dominio en NIC.ar | vence el 09/04/2027 |

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
│   ├── admin/                 ← panel de administración (noindex)
│   ├── css/main.css, css/admin.css
│   ├── js/main.js, js/admin.js
│   ├── version.json           ← versión del contenido publicado (la usa el panel)
│   ├── fonts/                 ← Marcellus + Figtree (self-hosted, OFL)
│   ├── img/                   ← logo, íconos PWA
│   ├── favicon.svg / .ico, apple-touch-icon.png, og-image.png
│   ├── sitemap.xml, robots.txt, site.webmanifest, llms.txt
├── contenido/
│   └── sitio.json             ← TODO lo editable (lo cambia el panel o a mano)
├── api/
│   ├── panel.js               ← funciones del panel (Vercel Functions)
│   └── _lib/                  ← sesión, GitHub, IA, mapa
├── scripts/
│   ├── datos.js               ← lee contenido/sitio.json + dominio, menú y SEO por página
│   ├── contenido.js           ← reglas del contenido: validación, cambios, horarios
│   ├── construir.js           ← generador
│   ├── servidor-local.js      ← vista previa local
│   ├── plantillas/            ← head SEO, cabecera, pie, JSON-LD, componentes, SVG
│   └── paginas/               ← contenido de cada página
├── vercel.json                ← build, URLs limpias, redirecciones, CSP y caché
└── package.json
```

> Los HTML de `public/` se regeneran en cada build: editá `contenido/sitio.json` o `scripts/`, no `public/*.html`.

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
3. Si cambia el perfil de Google, se actualiza desde el panel.

## Interacciones

- Hero: el emblema se dibuja (diente → tallo → hojas → magnolia), título palabra por palabra, parallax
  suave con el mouse, pétalos que se pausan fuera de pantalla.
- Explorador de endodoncia: corte de muela con 5 pasos (tabs accesibles con teclado).
- Chequeo de síntomas: orientativo, arma el mensaje de WhatsApp con los síntomas marcados.
- Formulario de contacto → abre WhatsApp con nombre, motivo y horario (no guarda datos).
- Respeta `prefers-reduced-motion`; funciona sin JavaScript.
