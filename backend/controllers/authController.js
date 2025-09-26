const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, nombre, rol, telefono, direccion } = req.body;
    
    await client.query('BEGIN');

    const existingUser = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userResult = await client.query(
      `INSERT INTO usuarios (email, password, rol, nombre, telefono, direccion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, rol, nombre, fecha_registro`,
      [email, hashedPassword, rol, nombre, telefono, direccion]
    );

    const user = userResult.rows[0];

    if (rol === 'vendedor') {
      const nombreTienda = `${nombre}'s Store`;
      const urlTienda = nombreTienda.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      await client.query(
        `INSERT INTO tiendas (usuario_id, nombre_tienda, url_tienda, descripcion, sector)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, nombreTienda, urlTienda, `Tienda de ${nombre}`, 'General']
      );
    }

    await client.query('COMMIT');

    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        fecha_registro: user.fecha_registro
      },
      token
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, password, rol, nombre, activo FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    if (!user.activo) {
      return res.status(401).json({ error: 'Cuenta desactivada' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    let tienda = null;
    if (user.rol === 'vendedor') {
      const tiendaResult = await pool.query(
        'SELECT id, nombre_tienda, url_tienda FROM tiendas WHERE usuario_id = $1 AND activa = true',
        [user.id]
      );
      if (tiendaResult.rows.length > 0) {
        tienda = tiendaResult.rows[0];
      }
    }

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      },
      tienda,
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, nombre, telefono, direccion, fecha_registro, avatar_url,
              fecha_nacimiento, genero
       FROM usuarios WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    let tienda = null;
    if (req.user.rol === 'vendedor') {
      const tiendaResult = await pool.query(
        `SELECT id, nombre_tienda, url_tienda, descripcion, logo_url, sector,
                telefono, direccion, fecha_creacion, verificada, calificacion_promedio,
                total_ventas, redes_sociales
         FROM tiendas WHERE usuario_id = $1 AND activa = true`,
        [req.user.id]
      );
      if (tiendaResult.rows.length > 0) {
        tienda = tiendaResult.rows[0];
      }
    }

    res.json({
      user,
      tienda
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nombre, telefono, direccion, fecha_nacimiento, genero } = req.body;

    const result = await pool.query(
      `UPDATE usuarios 
       SET nombre = COALESCE($1, nombre),
           telefono = COALESCE($2, telefono),
           direccion = COALESCE($3, direccion),
           fecha_nacimiento = COALESCE($4, fecha_nacimiento),
           genero = COALESCE($5, genero)
       WHERE id = $6
       RETURNING id, email, nombre, telefono, direccion, fecha_nacimiento, genero`,
      [nombre, telefono, direccion, fecha_nacimiento, genero, req.user.id]
    );

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nueva contraseña debe tener al menos 6 caracteres' });
    }

    const result = await pool.query(
      'SELECT password FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await pool.query(
      'UPDATE usuarios SET password = $1 WHERE id = $2',
      [hashedNewPassword, req.user.id]
    );

    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, rol, nombre FROM usuarios WHERE id = $1 AND activo = true',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const token = generateToken(result.rows[0]);

    res.json({ token });

  } catch (error) {
    console.error('Error refrescando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken
};