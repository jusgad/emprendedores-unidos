// 🛠️ Funciones de Utilidad - Emprendedores Unidos

import { CURRENCY, DATE_CONFIG, CATEGORIA_COLORS, CATEGORIAS } from './constants.js';

/**
 * Formatea un precio en pesos colombianos
 * @param {number} price - El precio a formatear
 * @returns {string} Precio formateado
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0';
  }
  
  return new Intl.NumberFormat(CURRENCY.LOCALE, CURRENCY.FORMAT_OPTIONS).format(price);
};

/**
 * Formatea una fecha de forma legible
 * @param {string|Date} dateString - La fecha a formatear
 * @param {boolean} isLong - Si usar formato largo o corto
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString, isLong = false) => {
  try {
    const date = new Date(dateString);
    const options = isLong ? DATE_CONFIG.LONG_FORMAT : DATE_CONFIG.SHORT_FORMAT;
    return date.toLocaleDateString(DATE_CONFIG.LOCALE, options);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Obtiene los colores correspondientes a una categoría
 * @param {string} categoria - La categoría del producto
 * @returns {object} Objeto con clases de colores
 */
export const getCategoryColor = (categoria) => {
  return CATEGORIA_COLORS[categoria] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  };
};

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - El texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Crea una URL completa para la API
 * @param {string} endpoint - El endpoint de la API
 * @returns {string} URL completa
 */
export const createApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${baseUrl}${endpoint}`;
};

/**
 * Debounce function para optimizar búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Delay en millisegundos
 * @returns {Function} Función debounced
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Valida si una URL de imagen es válida
 * @param {string} url - URL a validar
 * @returns {boolean} True si es válida
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Calcula el tiempo transcurrido desde una fecha
 * @param {string|Date} date - Fecha de referencia
 * @returns {string} Tiempo transcurrido en formato legible
 */
export const getTimeAgo = (date) => {
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return formatDate(date);
  } catch (error) {
    console.error('Error calculando tiempo transcurrido:', error);
    return formatDate(date);
  }
};

/**
 * Genera un ID único simple
 * @returns {string} ID único
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena capitalizada
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formatea un número como K, M, B para visualización compacta
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
export const formatCompactNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  
  const formatters = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ];

  for (const formatter of formatters) {
    if (num >= formatter.value) {
      return (num / formatter.value).toFixed(1).replace(/\.0$/, '') + formatter.suffix;
    }
  }

  return num.toString();
};

/**
 * Valida si un email tiene formato válido
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Obtiene el emoji correspondiente a una categoría
 * @param {string} categoria - Categoría del producto
 * @returns {string} Emoji correspondiente
 */
export const getCategoryEmoji = (categoria) => {
  const emojiMap = {
    [CATEGORIAS.ARTE]: '🎨',
    [CATEGORIAS.TECNOLOGIA]: '💻',
    [CATEGORIAS.SERVICIOS]: '🛠️'
  };
  
  return emojiMap[categoria] || '📦';
};

/**
 * Simula un delay para desarrollo/testing
 * @param {number} ms - Millisegundos de delay
 * @returns {Promise} Promesa que se resuelve después del delay
 */
export const delay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Maneja errores de API de forma consistente
 * @param {Error} error - Error a manejar
 * @returns {string} Mensaje de error legible para el usuario
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (!navigator.onLine) {
    return 'Sin conexión a internet. Verifica tu conexión.';
  }

  if (error.name === 'AbortError') {
    return 'La solicitud fue cancelada.';
  }

  if (error.message?.includes('fetch')) {
    return 'Error de conexión con el servidor. Inténtalo de nuevo.';
  }

  return error.message || 'Ha ocurrido un error inesperado.';
};

/**
 * Guarda datos en localStorage de forma segura
 * @param {string} key - Clave del localStorage
 * @param {any} data - Datos a guardar
 * @returns {boolean} True si se guardó exitosamente
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    return false;
  }
};

/**
 * Recupera datos del localStorage de forma segura
 * @param {string} key - Clave del localStorage
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {any} Datos recuperados o valor por defecto
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error leyendo de localStorage:', error);
    return defaultValue;
  }
};