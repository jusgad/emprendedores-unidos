// 🔧 Constantes de la Aplicación - Emprendedores Unidos

// URLs y APIs
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Productos (Marketplace)
  PRODUCTOS: '/api/productos',
  PRODUCTO_BY_ID: (id) => `/api/productos/${id}`,
  PRODUCTOS_BY_CATEGORIA: (categoria) => `/api/productos/categoria/${categoria}`,
  
  // Social (Comunidad)
  POSTS: '/api/social/posts',
  POST_BY_ID: (id) => `/api/social/posts/${id}`,
  LIKE_POST: (id) => `/api/social/posts/${id}/like`,
  POSTS_BY_TIENDA: (tiendaId) => `/api/social/tienda/${tiendaId}/posts`,
  
  // Salud
  HEALTH: '/api/health'
};

// Categorías del Marketplace
export const CATEGORIAS = {
  ARTE: 'Arte',
  TECNOLOGIA: 'Tecnología',
  SERVICIOS: 'Servicios'
};

export const CATEGORIAS_ARRAY = Object.values(CATEGORIAS);

// Colores por categoría
export const CATEGORIA_COLORS = {
  [CATEGORIAS.ARTE]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  },
  [CATEGORIAS.TECNOLOGIA]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  [CATEGORIAS.SERVICIOS]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  }
};

// Configuración de UI
export const UI_CONFIG = {
  // Paginación
  ITEMS_PER_PAGE: 12,
  POSTS_PER_PAGE: 10,
  
  // Timeouts
  API_TIMEOUT: 10000, // 10 segundos
  DEBOUNCE_DELAY: 300, // 300ms
  
  // Límites de caracteres
  MAX_PRODUCT_NAME_LENGTH: 100,
  MAX_PRODUCT_DESCRIPTION_LENGTH: 500,
  MAX_POST_CONTENT_LENGTH: 280,
  
  // Tamaños de archivo
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

// Estados de loading
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  SERVER_ERROR: 'Error del servidor. Inténtalo de nuevo más tarde.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  GENERIC_ERROR: 'Ha ocurrido un error inesperado.'
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  PRODUCT_LIKED: '¡Producto agregado a favoritos!',
  POST_LIKED: '¡Like agregado exitosamente!',
  DATA_LOADED: 'Datos cargados correctamente',
  ACTION_COMPLETED: 'Acción completada exitosamente'
};

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  MARKETPLACE: '/marketplace',
  COMUNIDAD: '/comunidad',
  PRODUCTO_DETAIL: '/producto/:id',
  PERFIL: '/perfil/:id',
  CONFIGURACION: '/configuracion'
};

// Breakpoints responsivos (para usar con JavaScript)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Configuración de moneda
export const CURRENCY = {
  LOCALE: 'es-CO',
  CURRENCY: 'COP',
  FORMAT_OPTIONS: {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
};

// Configuración de fechas
export const DATE_CONFIG = {
  LOCALE: 'es-ES',
  SHORT_FORMAT: {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  },
  LONG_FORMAT: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
};

// Emojis para diferentes acciones/estados
export const EMOJIS = {
  LOADING: '⏳',
  ERROR: '⚠️',
  SUCCESS: '✅',
  HEART: '❤️',
  HEART_EMPTY: '🤍',
  LIKE: '👍',
  COMMENT: '💬',
  SHARE: '📤',
  STORE: '🏪',
  PRODUCT: '📦',
  ART: '🎨',
  TECH: '💻',
  SERVICE: '🛠️'
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  LOG_LEVEL: import.meta.env.DEV ? 'debug' : 'error',
  SHOW_MOCK_DATA: import.meta.env.DEV,
  API_DELAY_SIMULATION: import.meta.env.DEV ? 500 : 0 // 500ms delay en desarrollo
};