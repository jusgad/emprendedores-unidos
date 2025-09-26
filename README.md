# Emprendedores Unidos - MVP

Una plataforma que combina un **Marketplace** y una **Red Social** para emprendedores, diseñada para conectar, impulsar negocios y construir una comunidad próspera.

## 🚀 Características

### Marketplace
- Catálogo de productos y servicios de emprendedores
- Filtrado por categorías (Arte, Tecnología, Servicios)
- Información detallada de productos con precios y stock
- Interfaz intuitiva y responsive

### Red Social
- Feed de publicaciones de la comunidad
- Sistema de likes interactivo
- Perfiles de tiendas/emprendedores
- Interfaz para crear nuevas publicaciones

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** con **Express.js**
- **PostgreSQL** (simulado con datos estáticos)
- APIs REST con formato JSON
- CORS habilitado para desarrollo

### Frontend
- **React** con **Vite**
- **Tailwind CSS** para styling
- **React Router DOM** para navegación
- Custom hook `useApi` para consumo de APIs

## 📁 Estructura del Proyecto

```
emprendedores-unidos/
├── backend/
│   ├── controllers/
│   │   ├── productoController.js
│   │   └── socialController.js
│   ├── routes/
│   │   └── api.js
│   ├── db/
│   │   └── config.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── ProductoCard.jsx
    │   │   └── PostCard.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Marketplace.jsx
    │   │   └── Comunidad.jsx
    │   ├── hooks/
    │   │   └── useApi.js
    │   ├── App.jsx
    │   └── index.css
    ├── package.json
    └── tailwind.config.js
```

## 🔧 Configuración e Instalación

### Backend

1. Navegar al directorio backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor:
```bash
npm run dev
```

El backend estará disponible en: `http://localhost:3001`

### Frontend

1. Navegar al directorio frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 📊 APIs Disponibles

### Productos (Marketplace)
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener producto por ID
- `GET /api/productos/categoria/:categoria` - Filtrar por categoría

### Social (Comunidad)
- `GET /api/social/posts` - Obtener todos los posts
- `GET /api/social/posts/:id` - Obtener post por ID
- `POST /api/social/posts/:id/like` - Dar like a un post
- `GET /api/social/tienda/:tiendaId/posts` - Posts por tienda

### Salud
- `GET /api/health` - Estado de la API

## 💾 Datos Simulados

### Productos
El sistema incluye 5 productos de ejemplo:
- Artesanía Andina (Arte)
- App Mobile MVP (Tecnología)
- Consultoría Digital (Servicios)
- Joyería Sostenible (Arte)
- Curso Online Finanzas (Servicios)

### Posts Sociales
Incluye 5 publicaciones de ejemplo con:
- Contenido de texto
- Imágenes de placeholder
- Sistema de likes
- Información de fecha y tienda

## 🎨 Componentes Principales

### `useApi.js`
Custom hook para manejo de APIs con:
- Estados de loading, data y error
- Función de refetch
- Manejo automático de errores

### `ProductoCard.jsx`
Componente para mostrar productos con:
- Información completa del producto
- Formato de precio en COP
- Categorización con colores
- Botón de acción

### `PostCard.jsx`
Componente para publicaciones con:
- Sistema de likes interactivo
- Formato de fecha
- Soporte para imágenes
- Botones de interacción social

## 🚦 Próximos Pasos

Para convertir este MVP en una aplicación completa:

1. **Base de Datos Real**: Implementar PostgreSQL
2. **Autenticación**: Sistema de usuarios y autenticación
3. **CRUD Completo**: Crear, editar y eliminar productos/posts
4. **Pagos**: Integración con pasarelas de pago
5. **Chat**: Sistema de mensajería entre usuarios
6. **Notificaciones**: Sistema de notificaciones en tiempo real
7. **Mobile**: Aplicación móvil nativa

## 📝 Notas de Desarrollo

- El backend simula la conexión a PostgreSQL con datos estáticos
- Las rutas están configuradas para desarrollo local
- Tailwind CSS está configurado con colores personalizados
- El proyecto está optimizado para desarrollo rápido y demostración

---

**Emprendedores Unidos** - Conectando emprendedores, impulsando negocios 🚀