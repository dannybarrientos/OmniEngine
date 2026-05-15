#!/bin/bash

# 1. Crear la estructura Gold Standard
echo "🏗️ Creando estructura de producción..."
mkdir -p src/memory src/agents src/core docs/architecture specs

# 2. Migrar la lógica útil (El Corazón)
if [ -f "memory_orchestrator.js" ]; then
    echo "🫀 Migrando memory_orchestrator.js a src/memory/..."
    mv memory_orchestrator.js src/memory/
elif [ -f "memory/memory_orchestrator.js" ]; then
    echo "🫀 Moviendo memory_orchestrator.js a su nueva casa..."
    mv memory/memory_orchestrator.js src/memory/
fi

# 3. Mover el punto de entrada
if [ -f "index.js" ]; then
    mv index.js src/
    echo "🚀 Punto de entrada movido a src/index.js"
fi

# 4. Extirpar Basura (Pruga Manual de carpetas conocidas)
echo "🪓 Eliminando archivos basura identificados..."
rm -rf bin/
rm -rf venv/
rm -rf .venv/
rm -rf __pycache__/
rm -rf .pytest_cache/
rm -rf notebooks/
rm -rf test-results/
rm -rf playwright-report/
find . -name "*.ipynb" -type f -delete
find . -name ".DS_Store" -type f -delete

# 5. EL NUKE (Git Clean)
# Esto borra todo lo que esté en el .gitignore pero siga físicamente en disco
echo "☢️ Ejecutando limpieza radical de Git (The Nuke)..."
git clean -fdX

echo "✅ Operación Quirúrgica Completa."
echo "Estructura actual:"
ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/   /'