#!/bin/bash

# Script de instalación unificado para Emprendedores Unidos
echo "🚀 Instalando dependencias para todo el proyecto..."

# Función para verificar si un directorio existe
check_directory() {
    if [ ! -d "$1" ]; then
        echo "❌ Error: El directorio $1 no existe"
        return 1
    fi
    return 0
}

# Función para instalar dependencias en un directorio
install_dependencies() {
    local dir=$1
    local name=$2
    
    echo ""
    echo "📦 Instalando dependencias para $name..."
    echo "Directorio: $dir"
    
    if check_directory "$dir"; then
        cd "$dir"
        if [ -f "package.json" ]; then
            npm install
            if [ $? -eq 0 ]; then
                echo "✅ Dependencias instaladas correctamente en $name"
            else
                echo "❌ Error al instalar dependencias en $name"
                exit 1
            fi
        else
            echo "⚠️  No se encontró package.json en $dir"
        fi
        cd - > /dev/null
    else
        echo "❌ No se pudo acceder al directorio $dir"
        exit 1
    fi
}

# Verificar que Node.js y npm estén instalados
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Directorio base del proyecto
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Instalar dependencias del backend
install_dependencies "$BASE_DIR/backend" "Backend (Express.js)"

# Instalar dependencias del frontend principal
install_dependencies "$BASE_DIR/frontend" "Frontend (React + Vite)"

# Verificar si existe el frontend dentro de backend (parece duplicado)
if [ -d "$BASE_DIR/backend/frontend" ]; then
    echo ""
    echo "⚠️  Se detectó un frontend adicional en backend/frontend"
    read -p "¿Deseas instalar sus dependencias también? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_dependencies "$BASE_DIR/backend/frontend" "Frontend adicional (backend/frontend)"
    fi
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "Para ejecutar el proyecto:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Para desarrollo (en terminales separadas):"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"