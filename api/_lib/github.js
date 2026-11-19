/**
 * github.js — Lee y guarda el contenido del sitio en el repositorio de GitHub.
 * Cada cambio publicado es un commit: Vercel lo detecta y vuelve a generar el sitio.
 *
 * Variables:
 *   GITHUB_TOKEN   token "fine-grained" con permiso Contents: Read and write SOLO sobre el repo
 *   GITHUB_REPO    dueño/repo  (por defecto fabricioagguero-dev/odontologia)
 *   GITHUB_BRANCH  rama        (por defecto main)
 */
const { ErrorPanel } = require('./http');

const RUTA_CONTENIDO = 'contenido/sitio.json';
const API = 'https://api.github.com';

const repo = () => process.env.GITHUB_REPO || 'fabricioagguero-dev/odontologia';
const rama = () => process.env.GITHUB_BRANCH || 'main';
const configurado = () => !!process.env.GITHUB_TOKEN;

async function gh(metodo, ruta, cuerpo) {
  if (!configurado()) throw new ErrorPanel(503, 'Falta configurar la conexión con GitHub (GITHUB_TOKEN).');
  const r = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'panel-jimena-teruel',
      ...(cuerpo ? { 'Content-Type': 'application/json' } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const texto = await r.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = { message: texto };
  }
  if (!r.ok) {
    const msg = (datos && datos.message) || r.statusText;
    console.error(`[github] ${metodo} ${ruta} → ${r.status}: ${msg}`);
    if (r.status === 401) throw new ErrorPanel(503, 'El token de GitHub no es válido o venció. Hay que generar uno nuevo.');
    if (r.status === 403 || r.status === 404) throw new ErrorPanel(503, 'El token de GitHub no tiene permiso para escribir en el repositorio.');
    if (r.status === 409 || r.status === 422) throw new ErrorPanel(409, 'Justo hubo otro cambio al mismo tiempo. Probá publicar de nuevo.');
    throw new ErrorPanel(502, 'GitHub no respondió bien. Probá de nuevo en un minuto.');
  }
  return datos;
}

/** Contenido actual (o en un commit puntual) + SHA del archivo. */
async function leerContenido(ref = rama()) {
  const d = await gh('GET', `/repos/${repo()}/contents/${RUTA_CONTENIDO}?ref=${encodeURIComponent(ref)}`);
  const texto = Buffer.from(d.content, 'base64').toString('utf8');
  return { contenido: JSON.parse(texto), sha: d.sha };
}

const formatear = (doc) => JSON.stringify(doc, null, 2) + '\n';

/**
 * Crea un commit con el contenido nuevo y, si hay, las fotos.
 * archivos: [{ ruta, base64 }]  (fotos ya validadas)
 */
async function publicar({ contenido, archivos = [], mensaje }) {
  const R = `/repos/${repo()}`;
  const ref = await gh('GET', `${R}/git/ref/heads/${rama()}`);
  const padre = ref.object.sha;
  const commitPadre = await gh('GET', `${R}/git/commits/${padre}`);

  const blobs = [];
  for (const a of archivos) {
    const b = await gh('POST', `${R}/git/blobs`, { content: a.base64, encoding: 'base64' });
    blobs.push({ path: a.ruta, mode: '100644', type: 'blob', sha: b.sha });
  }
  const json = await gh('POST', `${R}/git/blobs`, { content: formatear(contenido), encoding: 'utf-8' });
  blobs.push({ path: RUTA_CONTENIDO, mode: '100644', type: 'blob', sha: json.sha });

  const arbol = await gh('POST', `${R}/git/trees`, { base_tree: commitPadre.tree.sha, tree: blobs });
  // Sin "author" propio: el commit queda a nombre del dueño del token, así Vercel lo despliega.
  const commit = await gh('POST', `${R}/git/commits`, { message: mensaje, tree: arbol.sha, parents: [padre] });
  await gh('PATCH', `${R}/git/refs/heads/${rama()}`, { sha: commit.sha, force: false });
  return { commit: commit.sha, contenido: json.sha };
}

/** Últimos cambios hechos al contenido. */
async function historial(cantidad = 15) {
  const lista = await gh('GET', `/repos/${repo()}/commits?sha=${rama()}&path=${RUTA_CONTENIDO}&per_page=${cantidad}`);
  return lista.map((c) => ({
    sha: c.sha,
    padre: c.parents && c.parents[0] ? c.parents[0].sha : null,
    mensaje: c.commit.message,
    fecha: c.commit.committer && c.commit.committer.date,
  }));
}

module.exports = { configurado, leerContenido, publicar, historial, formatear, RUTA_CONTENIDO };
