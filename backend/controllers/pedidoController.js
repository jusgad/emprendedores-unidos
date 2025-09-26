const { pool } = require('../db/connection');

const createPedido = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { items, direccion_envio, metodo_pago } = req.body;
    
    await client.query('BEGIN');

    let total = 0;
    const itemsValidos = [];

    for (const item of items) {
      const productoResult = await client.query(
        'SELECT id, precio, stock, nombre FROM productos WHERE id = $1 AND activo = true',
        [item.producto_id]
      );

      if (productoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Producto ${item.producto_id} no encontrado` });
      }

      const producto = productoResult.rows[0];

      if (producto.stock < item.cantidad) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}` 
        });
      }

      const subtotal = producto.precio * item.cantidad;
      total += subtotal;

      itemsValidos.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
        subtotal
      });
    }

    const costo_envio = total >= 50000 ? 0 : 5000;
    const impuestos = total * 0.19;
    total = total + costo_envio + impuestos;

    const pedidoResult = await client.query(`
      INSERT INTO pedidos (
        comprador_id, total, estado, direccion_envio, metodo_pago,
        costo_envio, impuestos
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      req.user.id, total, 'pendiente', JSON.stringify(direccion_envio), 
      metodo_pago, costo_envio, impuestos
    ]);

    const pedido = pedidoResult.rows[0];

    for (const item of itemsValidos) {
      await client.query(`
        INSERT INTO items_pedido (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)
      `, [pedido.id, item.producto_id, item.cantidad, item.precio_unitario]);

      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [item.cantidad, item.producto_id]
      );
    }

    await client.query('COMMIT');

    const pedidoCompleto = await pool.query(`
      SELECT p.*, 
             array_agg(
               json_build_object(
                 'producto_id', ip.producto_id,
                 'nombre', pr.nombre,
                 'cantidad', ip.cantidad,
                 'precio_unitario', ip.precio_unitario,
                 'subtotal', ip.cantidad * ip.precio_unitario
               )
             ) as items
      FROM pedidos p
      JOIN items_pedido ip ON p.id = ip.pedido_id
      JOIN productos pr ON ip.producto_id = pr.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [pedido.id]);

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: pedidoCompleto.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear pedido',
      error: error.message
    });
  } finally {
    client.release();
  }
};

const getMyPedidos = async (req, res) => {
  try {
    const { limite = 20, pagina = 1, estado } = req.query;
    const offset = (pagina - 1) * limite;

    let query = `
      SELECT p.*,
             array_agg(
               json_build_object(
                 'producto_id', ip.producto_id,
                 'nombre', pr.nombre,
                 'cantidad', ip.cantidad,
                 'precio_unitario', ip.precio_unitario,
                 'subtotal', ip.cantidad * ip.precio_unitario,
                 'imagen_url', (pr.imagen_urls->0)::text
               )
             ) as items
      FROM pedidos p
      JOIN items_pedido ip ON p.id = ip.pedido_id
      JOIN productos pr ON ip.producto_id = pr.id
      WHERE p.comprador_id = $1
    `;
    
    const params = [req.user.id];
    let paramIndex = 2;

    if (estado) {
      query += ` AND p.estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    query += ` GROUP BY p.id ORDER BY p.fecha_pedido DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limite, offset);

    const result = await pool.query(query, params);

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) 
      FROM pedidos p 
      WHERE p.comprador_id = $1 ${estado ? 'AND p.estado = $2' : ''}
    `;
    const countParams = estado ? [req.user.id, estado] : [req.user.id];
    const countResult = await pool.query(countQuery, countParams);
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
    console.error('Error obteniendo mis pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: error.message
    });
  }
};

const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT p.*,
             array_agg(
               json_build_object(
                 'producto_id', ip.producto_id,
                 'nombre', pr.nombre,
                 'cantidad', ip.cantidad,
                 'precio_unitario', ip.precio_unitario,
                 'subtotal', ip.cantidad * ip.precio_unitario,
                 'imagen_url', (pr.imagen_urls->0)::text,
                 'tienda_nombre', t.nombre_tienda
               )
             ) as items
      FROM pedidos p
      JOIN items_pedido ip ON p.id = ip.pedido_id
      JOIN productos pr ON ip.producto_id = pr.id
      JOIN tiendas t ON pr.tienda_id = t.id
      WHERE p.id = $1 AND p.comprador_id = $2
      GROUP BY p.id
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedido',
      error: error.message
    });
  }
};

const getVentasPedidos = async (req, res) => {
  try {
    const { limite = 20, pagina = 1, estado } = req.query;
    const offset = (pagina - 1) * limite;

    const tiendaResult = await pool.query(
      'SELECT id FROM tiendas WHERE usuario_id = $1 AND activa = true',
      [req.user.id]
    );

    if (tiendaResult.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes una tienda activa' });
    }

    const tiendaId = tiendaResult.rows[0].id;

    let query = `
      SELECT DISTINCT p.*,
             u.nombre as comprador_nombre,
             u.email as comprador_email,
             array_agg(
               json_build_object(
                 'producto_id', ip.producto_id,
                 'nombre', pr.nombre,
                 'cantidad', ip.cantidad,
                 'precio_unitario', ip.precio_unitario,
                 'subtotal', ip.cantidad * ip.precio_unitario
               )
             ) as items
      FROM pedidos p
      JOIN usuarios u ON p.comprador_id = u.id
      JOIN items_pedido ip ON p.id = ip.pedido_id
      JOIN productos pr ON ip.producto_id = pr.id
      WHERE pr.tienda_id = $1
    `;
    
    const params = [tiendaId];
    let paramIndex = 2;

    if (estado) {
      query += ` AND p.estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    query += ` GROUP BY p.id, u.nombre, u.email ORDER BY p.fecha_pedido DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limite, offset);

    const result = await pool.query(query, params);

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) 
      FROM pedidos p 
      JOIN items_pedido ip ON p.id = ip.pedido_id
      JOIN productos pr ON ip.producto_id = pr.id
      WHERE pr.tienda_id = $1 ${estado ? 'AND p.estado = $2' : ''}
    `;
    const countParams = estado ? [tiendaId, estado] : [tiendaId];
    const countResult = await pool.query(countQuery, countParams);
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
    console.error('Error obteniendo pedidos de ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: error.message
    });
  }
};

const updatePedidoEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, numero_tracking } = req.body;

    const validStates = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
    if (!validStates.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const pedidoResult = await pool.query(`
      SELECT DISTINCT p.id
      FROM pedidos p
      JOIN items_pedido ip ON p.id = ip.pedido_id
      JOIN productos pr ON ip.producto_id = pr.id
      JOIN tiendas t ON pr.tienda_id = t.id
      WHERE p.id = $1 AND t.usuario_id = $2
    `, [id, req.user.id]);

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado o no autorizado' });
    }

    const updateFields = ['estado = $2'];
    const params = [id, estado];
    let paramIndex = 3;

    if (numero_tracking) {
      updateFields.push(`numero_tracking = $${paramIndex}`);
      params.push(numero_tracking);
      paramIndex++;
    }

    if (estado === 'enviado') {
      updateFields.push(`fecha_entrega_estimada = CURRENT_DATE + INTERVAL '3 days'`);
    }

    const result = await pool.query(`
      UPDATE pedidos SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `, params);

    res.json({
      success: true,
      message: 'Estado del pedido actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando estado del pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar pedido',
      error: error.message
    });
  }
};

module.exports = {
  createPedido,
  getMyPedidos,
  getPedidoById,
  getVentasPedidos,
  updatePedidoEstado
};