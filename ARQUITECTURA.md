# 🏗️ Arquitectura - Emprendedores Unidos

## 📋 Visión General

**Emprendedores Unidos** es una plataforma MVP que implementa una arquitectura de **separación frontend/backend** con comunicación vía APIs REST. El diseño prioriza la escalabilidad, mantenibilidad y desarrollo rápido.

## 🎯 Objetivos Arquitectónicos

- **Escalabilidad**: Fácil adición de nuevas funcionalidades
- **Mantenibilidad**: Código limpio y bien organizado
- **Performance**: Carga rápida y experiencia fluida
- **Flexibilidad**: Capacidad de cambiar tecnologías específicas
- **Desarrollo Ágil**: Setup rápido y desarrollo iterativo

## 🏢 Arquitectura de Alto Nivel

```
┌─────────────────┐    HTTP/JSON     ┌─────────────────┐
│                 │    REST APIs     │                 │
│   Frontend      │◄────────────────►│   Backend       │
│   (React)       │                  │   (Node.js)     │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
                                              │
                                              │ Simulated
                                              ▼
                                     ┌─────────────────┐
                                     │   Database      │
                                     │   (PostgreSQL)  │
                                     │   [Simulada]    │
                                     └─────────────────┘
```

## 🔧 Stack Tecnológico Detallado

### Frontend Layer

#### React + Vite
```
┌─────────────────────────────────────────┐
│              React App                  │
├─────────────────────────────────────────┤
│  Components    │  Pages    │  Hooks     │
│  - Header      │  - Home   │  - useApi  │
│  - Cards       │  - Market │            │
│  - UI Elements │  - Social │            │
├─────────────────────────────────────────┤
│           React Router DOM              │
├─────────────────────────────────────────┤
│            Tailwind CSS                 │
└─────────────────────────────────────────┘
```

**Tecnologías:**
- **React 18**: Framework principal
- **Vite**: Build tool y dev server
- **React Router DOM**: Navegación SPA
- **Tailwind CSS**: Framework de estilos
- **Custom Hooks**: Lógica reutilizable

### Backend Layer

#### Node.js + Express
```
┌─────────────────────────────────────────┐
│             Express Server              │
├─────────────────────────────────────────┤
│  Routes        │  Controllers           │
│  - /api/*      │  - productoController  │
│                │  - socialController    │
├─────────────────────────────────────────┤
│  Middleware    │  Database Layer        │
│  - CORS        │  - config.js           │
│  - JSON Parser │  - Simulated Data      │
├─────────────────────────────────────────┤
│            Node.js Runtime              │
└─────────────────────────────────────────┘
```

**Tecnologías:**
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web
- **CORS**: Manejo de políticas de origen cruzado
- **dotenv**: Gestión de variables de entorno

## 📊 Modelo de Datos

### Entidades Principales

#### Producto (Marketplace)
```javascript
{
  id: number,           // Identificador único
  nombre: string,       // Nombre del producto
  descripcion: string,  // Descripción detallada
  precio: number,       // Precio en COP
  stock: number,        // Cantidad disponible
  tiendaId: number,     // Referencia al emprendedor
  categoria: string     // Arte, Tecnología, Servicios
}
```

#### Post (Red Social)
```javascript
{
  id: number,           // Identificador único
  tiendaId: number,     // Referencia al emprendedor
  contenido: string,    // Texto de la publicación
  imagenUrl: string,    // URL de imagen
  fecha: string,        // ISO timestamp
  likes: number         // Contador de likes
}
```

### Relaciones de Datos
```
Tienda (Emprendedor)
    ├── 1:N → Productos
    └── 1:N → Posts
```

## 🔄 Flujo de Datos

### Marketplace Flow
```
User Action → React Component → useApi Hook → Backend API → Controller → Simulated DB → Response Chain
```

#### Ejemplo: Cargar Productos
1. **Usuario** navega a `/marketplace`
2. **Marketplace.jsx** se monta
3. **useApi** hook ejecuta `fetch('/api/productos')`
4. **Backend** recibe request en `/api/productos`
5. **productoController.getAllProducts()** se ejecuta
6. **Simulated DB** retorna array de productos
7. **Response** se envía como JSON
8. **useApi** actualiza estado `data`
9. **React** re-renderiza con productos

### Social Flow
```
User Interaction → State Update → API Call → Backend Processing → State Sync
```

#### Ejemplo: Like en Post
1. **Usuario** hace click en botón like
2. **PostCard** actualiza estado local
3. **onClick** handler ejecuta API call
4. **Backend** incrementa contador en memoria
5. **Response** confirma operación
6. **UI** refleja nuevo estado

## 🗂️ Organización de Código

### Frontend Structure
```
src/
├── components/          # Componentes reutilizables
│   ├── Header.jsx      # Navegación principal
│   ├── ProductoCard.jsx # Tarjeta de producto
│   └── PostCard.jsx    # Tarjeta de post
├── pages/              # Vistas principales (rutas)
│   ├── Home.jsx        # Landing page
│   ├── Marketplace.jsx # Vista del marketplace
│   └── Comunidad.jsx   # Vista social
├── hooks/              # Custom hooks
│   └── useApi.js       # Hook para APIs
├── utils/              # Utilidades (futuro)
├── assets/             # Recursos estáticos
└── styles/             # Estilos globales
```

### Backend Structure
```
backend/
├── controllers/         # Lógica de negocio
│   ├── productoController.js
│   └── socialController.js
├── routes/             # Definición de endpoints
│   └── api.js          # Rutas principales
├── db/                 # Capa de datos
│   └── config.js       # Configuración y datos simulados
├── middleware/         # Middleware personalizado (futuro)
├── utils/              # Utilidades compartidas (futuro)
└── server.js           # Punto de entrada
```

## 🔒 Seguridad y Configuración

### Variables de Entorno
```bash
# Backend (.env)
PORT=3001                    # Puerto del servidor
DB_HOST=localhost           # Host de PostgreSQL
DB_USER=emprendedores_user  # Usuario de DB
DB_PASSWORD=password123     # Contraseña de DB
DB_NAME=emprendedores_unidos_db # Nombre de DB
DB_PORT=5432                # Puerto de PostgreSQL
```

### CORS Configuration
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📈 Escalabilidad y Performance

### Optimizaciones Actuales
- **Component Memoization**: React.memo en componentes pesados
- **Lazy Loading**: Carga diferida de rutas
- **API Caching**: Cache en useApi hook
- **CSS Purging**: Tailwind elimina CSS no usado

### Escalabilidad Futura

#### Backend Scaling
```
Load Balancer
    ├── Node.js Instance 1
    ├── Node.js Instance 2
    └── Node.js Instance N
            │
    Database Cluster
    ├── Primary PostgreSQL
    └── Read Replicas
```

#### Frontend Scaling
```
CDN (Cloudflare/AWS)
    │
Static Assets
    │
React App Bundle
    ├── Code Splitting
    ├── Lazy Loading
    └── Service Worker Cache
```

## 🔧 Herramientas de Desarrollo

### Frontend Tools
- **Vite**: Fast HMR y build optimizado
- **ESLint**: Linting de código
- **Prettier**: Formateo automático
- **React DevTools**: Debugging de componentes

### Backend Tools
- **Nodemon**: Auto-restart en desarrollo
- **Postman**: Testing de APIs
- **dotenv**: Gestión de configuración

## 🚀 Deployment Strategy

### Desarrollo Local
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Producción (Futuro)
```
Frontend: Vercel/Netlify
Backend: Railway/Heroku
Database: PostgreSQL en la nube
CDN: Cloudflare
```

## 🔮 Arquitectura Futura

### Microservicios Evolution
```
API Gateway
    ├── User Service
    ├── Product Service
    ├── Social Service
    ├── Payment Service
    └── Notification Service
```

### Real-time Features
```
WebSocket Server
    ├── Chat Service
    ├── Live Updates
    └── Notifications
```

### Mobile Strategy
```
Shared API Layer
    ├── React Web App
    ├── React Native App
    └── Future Platforms
```

## 📊 Monitoring y Analytics

### Métricas Clave (Futuro)
- **Performance**: Core Web Vitals
- **Business**: Conversión, engagement
- **Technical**: Error rates, API latency
- **User**: Behavioral analytics

### Herramientas de Monitoreo
- **Frontend**: Sentry, Google Analytics
- **Backend**: Winston logging, New Relic
- **Infrastructure**: Datadog, Grafana