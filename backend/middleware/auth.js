const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    const result = await pool.query(
      'SELECT id, email, rol, nombre FROM usuarios WHERE id = $1 AND activo = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

const authorizeVendedor = async (req, res, next) => {
  try {
    if (req.user.rol !== 'vendedor' && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo vendedores pueden realizar esta acción' });
    }

    if (req.user.rol === 'vendedor') {
      const tiendaResult = await pool.query(
        'SELECT id FROM tiendas WHERE usuario_id = $1 AND activa = true',
        [req.user.id]
      );

      if (tiendaResult.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes una tienda activa' });
      }

      req.tienda = tiendaResult.rows[0];
    }

    next();
  } catch (error) {
    console.error('Error en autorización de vendedor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const authorizeTiendaOwner = async (req, res, next) => {
  try {
    const tiendaId = req.params.tiendaId || req.body.tienda_id;
    
    if (!tiendaId) {
      return res.status(400).json({ error: 'ID de tienda requerido' });
    }

    if (req.user.rol === 'admin') {
      return next();
    }

    const result = await pool.query(
      'SELECT id FROM tiendas WHERE id = $1 AND usuario_id = $2',
      [tiendaId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para esta tienda' });
    }

    next();
  } catch (error) {
    console.error('Error en autorización de propietario de tienda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    const result = await pool.query(
      'SELECT id, email, rol, nombre FROM usuarios WHERE id = $1 AND activo = true',
      [decoded.id]
    );

    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }
  } catch (error) {
    console.log('Token opcional inválido');
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeVendedor,
  authorizeTiendaOwner,
  optionalAuth
};