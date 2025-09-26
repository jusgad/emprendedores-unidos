// 🌐 Cliente API - Emprendedores Unidos

import { API_BASE_URL, API_ENDPOINTS, UI_CONFIG } from './constants.js';
import { handleApiError } from './helpers.js';

/**
 * Configuración base para fetch
 */
const defaultFetchOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'same-origin', // Para futuro soporte de autenticación
};

/**
 * Cliente API principal
 */
class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.timeout = UI_CONFIG.API_TIMEOUT;
  }

  /**
   * Crea una URL completa con la base URL
   * @param {string} endpoint - Endpoint de la API
   * @returns {string} URL completa
   */
  createUrl(endpoint) {
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * Realiza una petición HTTP con timeout
   * @param {string} url - URL completa
   * @param {object} options - Opciones de fetch
   * @returns {Promise} Respuesta de la API
   */
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...defaultFetchOptions,
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - Endpoint de la API
   * @param {object} options - Opciones adicionales
   * @returns {Promise} Datos de respuesta
   */
  async get(endpoint, options = {}) {
    try {
      const url = this.createUrl(endpoint);
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        ...options,
      });

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * POST request
   * @param {string} endpoint - Endpoint de la API
   * @param {object} data - Datos a enviar
   * @param {object} options - Opciones adicionales
   * @returns {Promise} Datos de respuesta
   */
  async post(endpoint, data = {}, options = {}) {
    try {
      const url = this.createUrl(endpoint);
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options,
      });

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * PUT request
   * @param {string} endpoint - Endpoint de la API
   * @param {object} data - Datos a enviar
   * @param {object} options - Opciones adicionales
   * @returns {Promise} Datos de respuesta
   */
  async put(endpoint, data = {}, options = {}) {
    try {
      const url = this.createUrl(endpoint);
      const response = await this.fetchWithTimeout(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options,
      });

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * DELETE request
   * @param {string} endpoint - Endpoint de la API
   * @param {object} options - Opciones adicionales
   * @returns {Promise} Datos de respuesta
   */
  async delete(endpoint, options = {}) {
    try {
      const url = this.createUrl(endpoint);
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE',
        ...options,
      });

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Instancia global del cliente API
export const apiClient = new ApiClient();

/**
 * APIs específicas para productos (Marketplace)
 */
export const productApi = {
  /**
   * Obtiene todos los productos
   * @returns {Promise} Lista de productos
   */
  getAll: () => apiClient.get(API_ENDPOINTS.PRODUCTOS),

  /**
   * Obtiene un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise} Datos del producto
   */
  getById: (id) => apiClient.get(API_ENDPOINTS.PRODUCTO_BY_ID(id)),

  /**
   * Obtiene productos por categoría
   * @param {string} categoria - Categoría a filtrar
   * @returns {Promise} Lista de productos filtrados
   */
  getByCategory: (categoria) => apiClient.get(API_ENDPOINTS.PRODUCTOS_BY_CATEGORIA(categoria)),
};

/**
 * APIs específicas para posts sociales
 */
export const socialApi = {
  /**
   * Obtiene todos los posts
   * @returns {Promise} Lista de posts
   */
  getAllPosts: () => apiClient.get(API_ENDPOINTS.POSTS),

  /**
   * Obtiene un post por ID
   * @param {number} id - ID del post
   * @returns {Promise} Datos del post
   */
  getPostById: (id) => apiClient.get(API_ENDPOINTS.POST_BY_ID(id)),

  /**
   * Da like a un post
   * @param {number} id - ID del post
   * @returns {Promise} Resultado de la operación
   */
  likePost: (id) => apiClient.post(API_ENDPOINTS.LIKE_POST(id)),

  /**
   * Obtiene posts por tienda
   * @param {number} tiendaId - ID de la tienda
   * @returns {Promise} Lista de posts de la tienda
   */
  getPostsByTienda: (tiendaId) => apiClient.get(API_ENDPOINTS.POSTS_BY_TIENDA(tiendaId)),
};

/**
 * APIs de utilidad
 */
export const utilApi = {
  /**
   * Verifica el estado de salud de la API
   * @returns {Promise} Estado de la API
   */
  healthCheck: () => apiClient.get(API_ENDPOINTS.HEALTH),
};

/**
 * Hook personalizado que podría usarse con React Query en el futuro
 * Por ahora es una función simple que envuelve las llamadas de API
 */
export const createApiHook = (apiFunction) => {
  return async (...args) => {
    try {
      const result = await apiFunction(...args);
      return {
        data: result,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error.message,
        isLoading: false,
      };
    }
  };
};

// Exportar API functions envueltas para fácil uso
export const wrappedProductApi = {
  getAll: createApiHook(productApi.getAll),
  getById: createApiHook(productApi.getById),
  getByCategory: createApiHook(productApi.getByCategory),
};

export const wrappedSocialApi = {
  getAllPosts: createApiHook(socialApi.getAllPosts),
  getPostById: createApiHook(socialApi.getPostById),
  likePost: createApiHook(socialApi.likePost),
  getPostsByTienda: createApiHook(socialApi.getPostsByTienda),
};

export default apiClient;