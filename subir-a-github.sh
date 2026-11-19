#!/usr/bin/env bash
# Sube el sitio a https://github.com/fabricioagguero-dev/odontologia
# Uso (en Git Bash, dentro de esta carpeta):  bash subir-a-github.sh "mensaje opcional"
#
# Importante: Jimena también publica cambios desde el panel /admin/ (se guardan en
# contenido/sitio.json y public/img/subidas/). Este script primero trae esos cambios
# a tu carpeta, para no pisarlos, y después sube lo tuyo.
set -e
cd "$(dirname "$0")"

REPO="https://github.com/fabricioagguero-dev/odontologia.git"
MENSAJE="${1:-Actualización del sitio}"

if [ ! -d .git ]; then
  git init
  git checkout -b main
fi
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO"
fi

git fetch origin

# 1) Traer lo que Jimena cambió desde el panel (si cambió algo desde la última vez)
if git rev-parse --verify -q origin/main >/dev/null && git rev-parse --verify -q HEAD >/dev/null; then
  BASE=$(git merge-base HEAD origin/main 2>/dev/null || true)
  if [ -n "$BASE" ] && ! git diff --quiet "$BASE" origin/main -- contenido public/img/subidas 2>/dev/null; then
    echo "· Trayendo los cambios que Jimena hizo desde el panel…"
    git checkout origin/main -- contenido 2>/dev/null || true
    git checkout origin/main -- public/img/subidas 2>/dev/null || true
  fi
fi

# 2) Guardar lo tuyo
git add -A
git commit -m "$MENSAJE" || echo "· No hay cambios nuevos para commitear"

# 3) Unir con GitHub. Si hay conflicto en el código, se queda tu versión
#    (el contenido del panel ya quedó igual al de GitHub en el paso 1).
if git rev-parse --verify -q origin/main >/dev/null; then
  git merge origin/main --allow-unrelated-histories -X ours --no-edit
fi

git push -u origin main
echo "✔ Listo: https://github.com/fabricioagguero-dev/odontologia"
