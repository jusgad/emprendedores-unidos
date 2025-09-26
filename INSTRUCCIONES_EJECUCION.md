# 🚀 Instrucciones de Ejecución - Emprendedores Unidos

## ⚠️ Nota Importante sobre Node.js

**Este proyecto requiere Node.js versión 20.19+ o 22.12+ para el frontend.** La versión actual detectada (18.19.1) no es compatible con Vite 4+.

### Soluciones para la Incompatibilidad de Node.js:

#### Opción 1: Actualizar Node.js (Recomendado)
```bash
# Usando nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verificar versión
node --version  # Debe mostrar v20.x.x
```

#### Opción 2: Usar el Backend Solamente
Si no puedes actualizar Node.js, puedes probar el backend independientemente:

```bash
cd backend
npm run dev
```

El backend estará disponible en `http://localhost:3001` y puedes probar las APIs directamente.

## 📋 Pasos de Ejecución Completa

### 1. Preparar el Entorno

```bash
# Clonar o navegar al proyecto
cd emprendedores-unidos

# Configurar variables de entorno (opcional)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend (requiere Node.js 20+)
cd ../frontend
npm install
```

### 3. Ejecutar el Backend

```bash
cd backend
npm run dev
```

**Salida esperada:**
```
> backend@1.0.0 dev
> nodemon server.js

[nodemon] starting `node server.js`
Servidor corriendo en puerto 3001
```

### 4. Ejecutar el Frontend (Node.js 20+ requerido)

```bash
cd frontend
npm run dev
```

**Salida esperada:**
```
> frontend@0.0.0 dev
> vite --host 0.0.0.0 --port 5173

  VITE v4.4.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://0.0.0.0:5173/
```

## 🧪 Verificar que Funciona

### Backend APIs
```bash
# Salud de la API
curl http://localhost:3001/api/health

# Productos
curl http://localhost:3001/api/productos

# Posts sociales
curl http://localhost:3001/api/social/posts

# Like a un post
curl -X POST http://localhost:3001/api/social/posts/1/like
```

### Frontend
Abrir en navegador: `http://localhost:5173`

**Páginas disponibles:**
- `/` - Página de inicio
- `/marketplace` - Catálogo de productos
- `/comunidad` - Feed social

## 🔧 Scripts Disponibles

### Backend
```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
npm run dev:basic  # Desarrollo básico
npm run health     # Verificar estado de la API
```

### Frontend
```bash
npm run dev        # Desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build
npm run lint       # Linter
npm run lint:fix   # Arreglar problemas de linting
npm run clean      # Limpiar cache
```

## 📊 Estado de Testing Realizado

### ✅ Backend - Completamente Funcional
- [x] Servidor Express iniciado correctamente
- [x] API de salud respondiendo
- [x] Endpoint de productos funcionando
- [x] Endpoint de posts sociales funcionando
- [x] Funcionalidad de likes operativa
- [x] CORS configurado correctamente
- [x] Variables de entorno cargadas

### ⚠️ Frontend - Requiere Node.js 20+
- [x] Proyecto React/Vite configurado
- [x] Tailwind CSS instalado
- [x] React Router configurado
- [x] Componentes creados
- [x] Custom hooks implementados
- [ ] **Servidor de desarrollo (requiere Node.js 20+)**

## 🐛 Solución de Problemas

### Error: "Vite requires Node.js version 20.19+"
**Solución:** Actualizar Node.js a versión 20+ o usar herramientas como nvm.

### Error: "EADDRINUSE: address already in use"
```bash
# Encontrar proceso usando el puerto
lsof -ti:3001

# Terminar proceso
kill -9 <PID>
```

### Error: "Cannot GET /api/*"
**Problema:** Backend no está ejecutándose.
**Solución:** Iniciar el backend con `npm run dev` en la carpeta `backend`.

### Error de CORS
**Problema:** Frontend no puede conectarse al backend.
**Solución:** Verificar que el backend esté corriendo en puerto 3001 y que CORS esté configurado.

## 🎯 URLs de Desarrollo

| Servicio | URL | Estado |
|----------|-----|--------|
| Backend API | http://localhost:3001 | ✅ Funcionando |
| Frontend | http://localhost:5173 | ⚠️ Requiere Node.js 20+ |
| API Health | http://localhost:3001/api/health | ✅ Funcionando |
| API Productos | http://localhost:3001/api/productos | ✅ Funcionando |
| API Posts | http://localhost:3001/api/social/posts | ✅ Funcionando |

## 📞 Próximos Pasos

1. **Actualizar Node.js** a versión 20+ para usar el frontend completo
2. **Probar la aplicación completa** con ambos servicios corriendo
3. **Explorar las funcionalidades** del Marketplace y Red Social
4. **Revisar el código** para entender la arquitectura
5. **Implementar nuevas características** siguiendo los patrones establecidos

## 💡 Características Implementadas

### Marketplace
- Catálogo de productos con filtros por categoría
- Tarjetas de productos con información detallada
- Precios formateados en pesos colombianos
- Estados de loading y error

### Red Social
- Feed de publicaciones con imágenes
- Sistema de likes interactivo
- Formato de fechas legible
- Interfaz para nuevas publicaciones

### Arquitectura
- Separación clara frontend/backend
- APIs REST bien estructuradas
- Manejo de errores robusto
- Componentes reutilizables
- Configuración con variables de entorno

**¡El MVP está listo para desarrollo y demostración!** 🎉