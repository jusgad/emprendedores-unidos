const { pool } = require('../db/connection');

const getAllTiendas = async (req, res) => {
  try {
    const { sector, buscar, limite = 20, pagina = 1 } = req.query;
    
    let query = `
      SELECT t.*, u.nombre as propietario_nombre
      FROM tiendas t
      JOIN usuarios u ON t.usuario_id = u.id
      WHERE t.activa = true
    `;
    const params = [];
    let paramIndex = 1;

    if (sector) {
      query += ` AND t.sector ILIKE $${paramIndex}`;
      params.push(`%${sector}%`);
      paramIndex++;
    }

    if (buscar) {
      query += ` AND (t.nombre_tienda ILIKE $${paramIndex} OR t.descripcion ILIKE $${paramIndex})`;
      params.push(`%${buscar}%`);
      paramIndex++;
    }

    query += ` ORDER BY t.verificada DESC, t.calificacion_promedio DESC, t.fecha_creacion DESC`;
    
    const offset = (pagina - 1) * limite;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limite, offset);

    const result = await pool.query(query, params);

    const countQuery = query.split('ORDER BY')[0].replace('SELECT t.*, u.nombre as propietario_nombre', 'SELECT COUNT(*)');
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
    console.error('Error obteniendo tiendas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tiendas',
      error: error.message
    });
  }
};

const getTiendaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tiendaResult = await pool.query(`
      SELECT t.*, u.nombre as propietario_nombre
      FROM tiendas t
      JOIN usuarios u ON t.usuario_id = u.id
      WHERE t.id = $1 AND t.activa = true
    `, [id]);
    
    if (tiendaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tienda no encontrada'
      });
    }

    const tienda = tiendaResult.rows[0];

    const productosResult = await pool.query(`
      SELECT * FROM productos 
      WHERE tienda_id = $1 AND activo = true 
      ORDER BY destacado DESC, fecha_creacion DESC 
      LIMIT 12
    `, [id]);

    const seguidoresResult = await pool.query(
      'SELECT COUNT(*) as total FROM seguidores WHERE tienda_id = $1',
      [id]
    );

    let siguiendo = false;
    if (req.user) {
      const siguiendoResult = await pool.query(
        'SELECT id FROM seguidores WHERE seguidor_id = $1 AND tienda_id = $2',
        [req.user.id, id]
      );
      siguiendo = siguiendoResult.rows.length > 0;
    }

    res.json({
      success: true,
      data: {
        ...tienda,
        productos: productosResult.rows,
        seguidores_count: parseInt(seguidoresResult.rows[0].total),
        siguiendo
      }
    });
  } catch (error) {
    console.error('Error obteniendo tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tienda',
      error: error.message
    });
  }
};

const getTiendaByUrl = async (req, res) => {
  try {
    const { url } = req.params;
    
    const tiendaResult = await pool.query(`
      SELECT t.*, u.nombre as propietario_nombre
      FROM tiendas t
      JOIN usuarios u ON t.usuario_id = u.id
      WHERE t.url_tienda = $1 AND t.activa = true
    `, [url]);
    
    if (tiendaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tienda no encontrada'
      });
    }

    const tienda = tiendaResult.rows[0];

    const productosResult = await pool.query(`
      SELECT * FROM productos 
      WHERE tienda_id = $1 AND activo = true 
      ORDER BY destacado DESC, fecha_creacion DESC 
      LIMIT 12
    `, [tienda.id]);

    const seguidoresResult = await pool.query(
      'SELECT COUNT(*) as total FROM seguidores WHERE tienda_id = $1',
      [tienda.id]
    );

    let siguiendo = false;
    if (req.user) {
      const siguiendoResult = await pool.query(
        'SELECT id FROM seguidores WHERE seguidor_id = $1 AND tienda_id = $2',
        [req.user.id, tienda.id]
      );
      siguiendo = siguiendoResult.rows.length > 0;
    }

    res.json({
      success: true,
      data: {
        ...tienda,
        productos: productosResult.rows,
        seguidores_count: parseInt(seguidoresResult.rows[0].total),
        siguiendo
      }
    });
  } catch (error) {
    console.error('Error obteniendo tienda por URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tienda',
      error: error.message
    });
  }
};

const updateMyTienda = async (req, res) => {
  try {
    const {
      nombre_tienda, descripcion, sector, telefono, direccion, 
      logo_url, redes_sociales
    } = req.body;

    const tiendaResult = await pool.query(
      'SELECT id FROM tiendas WHERE usuario_id = $1 AND activa = true',
      [req.user.id]
    );

    if (tiendaResult.rows.length === 0) {
      return res.status(404).json({ error: 'No tienes una tienda activa' });
    }

    const tiendaId = tiendaResult.rows[0].id;

    let url_tienda;
    if (nombre_tienda) {
      url_tienda = nombre_tienda.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const urlExists = await pool.query(
        'SELECT id FROM tiendas WHERE url_tienda = $1 AND id != $2',
        [url_tienda, tiendaId]
      );

      if (urlExists.rows.length > 0) {
        url_tienda = `${url_tienda}-${tiendaId}`;
      }
    }

    const result = await pool.query(`
      UPDATE tiendas SET
        nombre_tienda = COALESCE($1, nombre_tienda),
        url_tienda = COALESCE($2, url_tienda),
        descripcion = COALESCE($3, descripcion),
        sector = COALESCE($4, sector),
        telefono = COALESCE($5, telefono),
        direccion = COALESCE($6, direccion),
        logo_url = COALESCE($7, logo_url),
        redes_sociales = COALESCE($8, redes_sociales)
      WHERE id = $9
      RETURNING *
    `, [
      nombre_tienda, url_tienda, descripcion, sector, telefono, 
      direccion, logo_url, 
      redes_sociales ? JSON.stringify(redes_sociales) : null,
      tiendaId
    ]);

    res.json({
      success: true,
      message: 'Tienda actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tienda',
      error: error.message
    });
  }
};

const getMyTienda = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
             (SELECT COUNT(*) FROM productos WHERE tienda_id = t.id AND activo = true) as productos_count,
             (SELECT COUNT(*) FROM seguidores WHERE tienda_id = t.id) as seguidores_count,
             (SELECT COUNT(*) FROM pedidos p 
              JOIN items_pedido ip ON p.id = ip.pedido_id 
              JOIN productos pr ON ip.producto_id = pr.id 
              WHERE pr.tienda_id = t.id) as ventas_count
      FROM tiendas t
      WHERE t.usuario_id = $1 AND t.activa = true
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No tienes una tienda activa' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error obteniendo mi tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tienda',
      error: error.message
    });
  }
};

const getTiendaStats = async (req, res) => {
  try {
    const tiendaResult = await pool.query(
      'SELECT id FROM tiendas WHERE usuario_id = $1 AND activa = true',
      [req.user.id]
    );

    if (tiendaResult.rows.length === 0) {
      return res.status(404).json({ error: 'No tienes una tienda activa' });
    }

    const tiendaId = tiendaResult.rows[0].id;

    const [ventasHoy, ventasMes, topProductos, pedientesEnvio] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as total, COALESCE(SUM(p.total), 0) as monto
        FROM pedidos p
        JOIN items_pedido ip ON p.id = ip.pedido_id
        JOIN productos pr ON ip.producto_id = pr.id
        WHERE pr.tienda_id = $1 AND DATE(p.fecha_pedido) = CURRENT_DATE
      `, [tiendaId]),
      
      pool.query(`
        SELECT COUNT(*) as total, COALESCE(SUM(p.total), 0) as monto
        FROM pedidos p
        JOIN items_pedido ip ON p.id = ip.pedido_id
        JOIN productos pr ON ip.producto_id = pr.id
        WHERE pr.tienda_id = $1 AND DATE_TRUNC('month', p.fecha_pedido) = DATE_TRUNC('month', CURRENT_DATE)
      `, [tiendaId]),
      
      pool.query(`
        SELECT pr.nombre, SUM(ip.cantidad) as vendidos
        FROM items_pedido ip
        JOIN productos pr ON ip.producto_id = pr.id
        WHERE pr.tienda_id = $1
        GROUP BY pr.id, pr.nombre
        ORDER BY vendidos DESC
        LIMIT 5
      `, [tiendaId]),
      
      pool.query(`
        SELECT COUNT(*) as total
        FROM pedidos p
        JOIN items_pedido ip ON p.id = ip.pedido_id
        JOIN productos pr ON ip.producto_id = pr.id
        WHERE pr.tienda_id = $1 AND p.estado = 'pagado'
      `, [tiendaId])
    ]);

    res.json({
      success: true,
      data: {
        ventas_hoy: {
          total: parseInt(ventasHoy.rows[0].total),
          monto: parseFloat(ventasHoy.rows[0].monto)
        },
        ventas_mes: {
          total: parseInt(ventasMes.rows[0].total),
          monto: parseFloat(ventasMes.rows[0].monto)
        },
        top_productos: topProductos.rows,
        pedidos_pendientes_envio: parseInt(pedientesEnvio.rows[0].total)
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

module.exports = {
  getAllTiendas,
  getTiendaById,
  getTiendaByUrl,
  updateMyTienda,
  getMyTienda,
  getTiendaStats
};