#!/usr/bin/env bash
# Sube el sitio a https://github.com/fabricioagguero-dev/odontologia
# Uso (en Git Bash, dentro de esta carpeta):  bash subir-a-github.sh
set -e
cd "$(dirname "$0")"

REPO="https://github.com/fabricioagguero-dev/odontologia.git"
MENSAJE="${1:-Sitio institucional Jimena Teruel, odontóloga en Escobar}"

if [ ! -d .git ]; then
  git init
  git checkout -b main
fi

git add -A
git commit -m "$MENSAJE" || echo "· No hay cambios nuevos para commitear"

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO"
fi

# El repo de GitHub ya tiene un README inicial: se une el historial
# y, si hay conflicto, se queda la versión de esta carpeta.
git fetch origin
if git rev-parse --verify -q origin/main >/dev/null; then
  git merge origin/main --allow-unrelated-histories -X ours --no-edit
fi

git push -u origin main
echo "✔ Listo: https://github.com/fabricioagguero-dev/odontologia"
