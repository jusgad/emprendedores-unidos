import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML para prevenir XSS
 * @param {string} dirty - String potencialmente peligroso
 * @returns {string} - String sanitizado
 */
export const sanitizeHtml = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitiza texto plano eliminando caracteres peligrosos
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[<>]/g, '') // Eliminar < y >
    .trim();
};

/**
 * Valida y sanitiza URL
 * @param {string} url - URL a validar
 * @returns {string|null} - URL sanitizada o null si es inválida
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  try {
    const urlObj = new URL(url);
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.href;
  } catch {
    return null;
  }
};

/**
 * Escapa caracteres especiales para mostrar como texto
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
export const escapeHtml = (text) => {
  if (!text || typeof text !== 'string') return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Valida email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
};

/**
 * Valida contraseña segura
 * @param {string} password - Contraseña a validar
 * @returns {object} - {valid: boolean, errors: string[]}
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
