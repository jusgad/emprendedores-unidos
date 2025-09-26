const { pool } = require('../db/connection');

const getAllProducts = async (req, res) => {
  try {
    const { categoria, precio_min, precio_max, buscar, limite = 20, pagina = 1 } = req.query;
    
    let query = `
      SELECT p.*, t.nombre_tienda, t.logo_url as tienda_logo
      FROM productos p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.activo = true AND t.activa = true
    `;
    const params = [];
    let paramIndex = 1;

    if (categoria) {
      query += ` AND p.categoria ILIKE $${paramIndex}`;
      params.push(`%${categoria}%`);
      paramIndex++;
    }

    if (precio_min) {
      query += ` AND p.precio >= $${paramIndex}`;
      params.push(precio_min);
      paramIndex++;
    }

    if (precio_max) {
      query += ` AND p.precio <= $${paramIndex}`;
      params.push(precio_max);
      paramIndex++;
    }

    if (buscar) {
      query += ` AND (p.nombre ILIKE $${paramIndex} OR p.descripcion ILIKE $${paramIndex})`;
      params.push(`%${buscar}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.destacado DESC, p.fecha_creacion DESC`;
    
    const offset = (pagina - 1) * limite;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limite, offset);

    const result = await pool.query(query, params);

    const countQuery = query.split('ORDER BY')[0].replace('SELECT p.*, t.nombre_tienda, t.logo_url as tienda_logo', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      total_paginas: Math.ceil(total / limite)
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT p.*, t.nombre_tienda, t.logo_url as tienda_logo, t.url_tienda,
             t.descripcion as tienda_descripcion, t.calificacion_promedio as tienda_calificacion
      FROM productos p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.id = $1 AND p.activo = true AND t.activa = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const valoracionesResult = await pool.query(`
      SELECT v.*, u.nombre as usuario_nombre
      FROM valoraciones v
      JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.producto_id = $1
      ORDER BY v.fecha DESC
      LIMIT 10
    `, [id]);

    const producto = result.rows[0];
    producto.valoraciones = valoracionesResult.rows;

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { categoria } = req.params;
    const { limite = 20, pagina = 1 } = req.query;
    
    const offset = (pagina - 1) * limite;
    
    const result = await pool.query(`
      SELECT p.*, t.nombre_tienda, t.logo_url as tienda_logo
      FROM productos p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.categoria ILIKE $1 AND p.activo = true AND t.activa = true
      ORDER BY p.destacado DESC, p.fecha_creacion DESC
      LIMIT $2 OFFSET $3
    `, [`%${categoria}%`, limite, offset]);

    const countResult = await pool.query(`
      SELECT COUNT(*)
      FROM productos p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.categoria ILIKE $1 AND p.activo = true AND t.activa = true
    `, [`%${categoria}%`]);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      total_paginas: Math.ceil(total / limite)
    });
  } catch (error) {
    console.error('Error filtrando productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al filtrar productos por categoría',
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      nombre, descripcion, precio, stock, categoria, imagen_urls,
      especificaciones, peso, dimensiones, tags, descuento_porcentaje
    } = req.body;

    const tiendaResult = await pool.query(
      'SELECT id FROM tiendas WHERE usuario_id = $1 AND activa = true',
      [req.user.id]
    );

    if (tiendaResult.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes una tienda activa' });
    }

    const tiendaId = tiendaResult.rows[0].id;

    const result = await pool.query(`
      INSERT INTO productos (
        tienda_id, nombre, descripcion, precio, stock, categoria,
        imagen_urls, especificaciones, peso, dimensiones, tags, descuento_porcentaje
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      tiendaId, nombre, descripcion, precio, stock, categoria,
      JSON.stringify(imagen_urls || []), JSON.stringify(especificaciones || {}),
      peso, dimensiones, tags, descuento_porcentaje || 0
    ]);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, descripcion, precio, stock, categoria, imagen_urls,
      especificaciones, peso, dimensiones, tags, descuento_porcentaje, destacado
    } = req.body;

    const productResult = await pool.query(`
      SELECT p.id FROM productos p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.id = $1 AND t.usuario_id = $2
    `, [id, req.user.id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado o no autorizado' });
    }

    const result = await pool.query(`
      UPDATE productos SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        precio = COALESCE($3, precio),
        stock = COALESCE($4, stock),
        categoria = COALESCE($5, categoria),
        imagen_urls = COALESCE($6, imagen_urls),
        especificaciones = COALESCE($7, especificaciones),
        peso = COALESCE($8, peso),
        dimensiones = COALESCE($9, dimensiones),
        tags = COALESCE($10, tags),
        descuento_porcentaje = COALESCE($11, descuento_porcentaje),
        destacado = COALESCE($12, destacado)
      WHERE id = $13
      RETURNING *
    `, [
      nombre, descripcion, precio, stock, categoria,
      imagen_urls ? JSON.stringify(imagen_urls) : null,
      especificaciones ? JSON.stringify(especificaciones) : null,
      peso, dimensiones, tags, descuento_porcentaje, destacado, id
    ]);

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(`
      SELECT p.id FROM productos p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.id = $1 AND t.usuario_id = $2
    `, [id, req.user.id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado o no autorizado' });
    }

    await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const { limite = 20, pagina = 1 } = req.query;
    const offset = (pagina - 1) * limite;

    const tiendaResult = await pool.query(
      'SELECT id FROM tiendas WHERE usuario_id = $1 AND activa = true',
      [req.user.id]
    );

    if (tiendaResult.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes una tienda activa' });
    }

    const tiendaId = tiendaResult.rows[0].id;

    const result = await pool.query(`
      SELECT * FROM productos
      WHERE tienda_id = $1 AND activo = true
      ORDER BY fecha_creacion DESC
      LIMIT $2 OFFSET $3
    `, [tiendaId, limite, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM productos WHERE tienda_id = $1 AND activo = true',
      [tiendaId]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      total_paginas: Math.ceil(total / limite)
    });
  } catch (error) {
    console.error('Error obteniendo mis productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
};