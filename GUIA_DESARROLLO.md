# 📋 Guía de Desarrollo - Emprendedores Unidos

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ instalado
- npm o yarn
- Editor de código (VS Code recomendado)

### Configuración del Entorno

1. **Clonar el proyecto:**
```bash
git clone <repository-url>
cd emprendedores-unidos
```

2. **Configurar Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configurar variables de entorno
npm run dev
```

3. **Configurar Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📂 Arquitectura del Proyecto

### Backend (Node.js + Express)

#### Estructura de Carpetas
```
backend/
├── controllers/         # Lógica de negocio
├── routes/             # Definición de rutas
├── db/                 # Configuración y modelos de datos
├── middleware/         # Middleware personalizado (futuro)
├── utils/              # Utilidades y helpers
└── server.js           # Punto de entrada
```

#### Controladores
- **productoController.js**: Maneja operaciones del marketplace
- **socialController.js**: Gestiona el feed social y posts

#### Base de Datos Simulada
Los datos están definidos en `db/config.js`:
- Array `productos`: Información del marketplace
- Array `posts`: Publicaciones sociales
- Función `conectarDB()`: Simula conexión a PostgreSQL

### Frontend (React + Vite + Tailwind)

#### Estructura de Carpetas
```
frontend/src/
├── components/         # Componentes reutilizables
├── pages/             # Vistas principales
├── hooks/             # Custom hooks
├── utils/             # Utilidades y helpers
├── assets/            # Recursos estáticos
└── styles/            # Estilos globales
```

#### Componentes Principales
- **Header.jsx**: Navegación principal
- **ProductoCard.jsx**: Tarjeta de producto
- **PostCard.jsx**: Tarjeta de publicación social

#### Custom Hooks
- **useApi.js**: Hook para consumo de APIs con estados de loading/error

## 🔧 Desarrollo y Mejores Prácticas

### Convenciones de Código

#### Backend
```javascript
// Controladores: usar async/await
const getAllProducts = async (req, res) => {
  try {
    // Lógica aquí
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Rutas: usar middleware de validación
router.get('/productos/:id', validateId, productoController.getProductById);
```

#### Frontend
```jsx
// Componentes: usar functional components con hooks
const MiComponente = ({ prop1, prop2 }) => {
  const [estado, setEstado] = useState(null);
  
  // JSX con Tailwind classes
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Contenido */}
    </div>
  );
};

// Custom hooks: prefijo 'use'
const useCustomHook = (param) => {
  // Lógica del hook
  return { data, loading, error };
};
```

### Manejo de Estados

#### Loading States
```jsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );
}
```

#### Error Handling
```jsx
if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-700">Error: {error}</p>
    </div>
  );
}
```

### Styling con Tailwind CSS

#### Paleta de Colores Personalizada
```css
primary: {
  50: '#f0f9ff',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
}
```

#### Patrones Comunes
```jsx
// Botón primario
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md">

// Card container
<div className="bg-white rounded-lg shadow-sm border border-gray-200">

// Layout responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

## 🛠️ Comandos de Desarrollo

### Backend
```bash
npm run dev          # Desarrollo con nodemon
npm start           # Producción
npm run test        # Ejecutar tests (futuro)
```

### Frontend
```bash
npm run dev         # Servidor de desarrollo
npm run build       # Build para producción
npm run preview     # Preview del build
npm run lint        # ESLint
```

## 📊 API Reference

### Endpoints del Marketplace

#### GET /api/productos
Obtiene todos los productos disponibles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Producto Ejemplo",
      "descripcion": "Descripción del producto",
      "precio": 50000,
      "stock": 10,
      "tiendaId": 1,
      "categoria": "Arte"
    }
  ],
  "total": 5
}
```

#### GET /api/productos/:id
Obtiene un producto específico por ID.

#### GET /api/productos/categoria/:categoria
Filtra productos por categoría (Arte, Tecnología, Servicios).

### Endpoints de Red Social

#### GET /api/social/posts
Obtiene todas las publicaciones ordenadas por fecha.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tiendaId": 1,
      "contenido": "Contenido del post",
      "imagenUrl": "https://example.com/image.jpg",
      "fecha": "2024-03-15T10:30:00Z",
      "likes": 23
    }
  ]
}
```

#### POST /api/social/posts/:id/like
Incrementa el contador de likes de un post.

## 🚨 Debugging y Troubleshooting

### Problemas Comunes

#### CORS Error
```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

#### Puerto ocupado
```bash
# Cambiar puerto en .env
PORT=3002

# O encontrar y cerrar proceso
lsof -ti:3001 | xargs kill -9
```

#### Tailwind no funciona
```bash
# Verificar configuración
npm run build:css

# Limpiar cache
rm -rf node_modules/.cache
```

### Logs y Monitoring

#### Backend Logging
```javascript
console.log('🚀 Servidor iniciado en puerto', PORT);
console.log('📊 Base de datos conectada');
console.error('❌ Error:', error.message);
```

#### Frontend Development Tools
- React Developer Tools
- Redux DevTools (si se implementa Redux)
- Network tab para APIs

## 🔮 Próximas Funcionalidades

### Corto Plazo
- [ ] Búsqueda de productos
- [ ] Filtros avanzados
- [ ] Paginación
- [ ] Optimización de imágenes

### Mediano Plazo
- [ ] Autenticación de usuarios
- [ ] Perfil de emprendedores
- [ ] Sistema de comentarios
- [ ] Notificaciones

### Largo Plazo
- [ ] Pagos integrados
- [ ] Chat en tiempo real
- [ ] App móvil
- [ ] Analytics dashboard

## 📝 Contribución

1. Fork el repositorio
2. Crear una rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

### Code Review Checklist
- [ ] Tests pasan
- [ ] Código documentado
- [ ] Estilos consistentes
- [ ] No hay console.logs
- [ ] Performance optimizado