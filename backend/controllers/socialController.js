const { pool } = require('../db/connection');

const getFeedPosts = async (req, res) => {
  try {
    const { limite = 20, pagina = 1 } = req.query;
    const offset = (pagina - 1) * limite;
    
    let query;
    let params;
    
    if (req.user) {
      query = `
        SELECT DISTINCT p.*, t.nombre_tienda, t.logo_url as tienda_logo,
               t.url_tienda, t.sector,
               CASE WHEN lp.id IS NOT NULL THEN true ELSE false END as liked_by_user
        FROM posts p
        JOIN tiendas t ON p.tienda_id = t.id
        LEFT JOIN likes_posts lp ON p.id = lp.post_id AND lp.usuario_id = $1
        LEFT JOIN seguidores s ON t.id = s.tienda_id AND s.seguidor_id = $1
        WHERE p.activo = true AND t.activa = true
        ORDER BY 
          CASE WHEN s.id IS NOT NULL THEN 1 ELSE 2 END,
          p.fecha_publicacion DESC
        LIMIT $2 OFFSET $3
      `;
      params = [req.user.id, limite, offset];
    } else {
      query = `
        SELECT p.*, t.nombre_tienda, t.logo_url as tienda_logo,
               t.url_tienda, t.sector, false as liked_by_user
        FROM posts p
        JOIN tiendas t ON p.tienda_id = t.id
        WHERE p.activo = true AND t.activa = true
        ORDER BY p.fecha_publicacion DESC
        LIMIT $1 OFFSET $2
      `;
      params = [limite, offset];
    }
    
    const result = await pool.query(query, params);
    
    const countQuery = `
      SELECT COUNT(*) FROM posts p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.activo = true AND t.activa = true
    `;
    const countResult = await pool.query(countQuery);
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
    console.error('Error obteniendo feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts del feed',
      error: error.message
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT p.*, t.nombre_tienda, t.logo_url as tienda_logo,
             t.url_tienda, t.sector,
             ${req.user ? 
               'CASE WHEN lp.id IS NOT NULL THEN true ELSE false END as liked_by_user' : 
               'false as liked_by_user'}
      FROM posts p
      JOIN tiendas t ON p.tienda_id = t.id
      ${req.user ? 'LEFT JOIN likes_posts lp ON p.id = lp.post_id AND lp.usuario_id = $2' : ''}
      WHERE p.id = $1 AND p.activo = true
    `;
    
    const params = req.user ? [id, req.user.id] : [id];
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const comentariosResult = await pool.query(`
      SELECT c.*, u.nombre as usuario_nombre,
             ${req.user ? 
               'CASE WHEN lc.id IS NOT NULL THEN true ELSE false END as liked_by_user' : 
               'false as liked_by_user'}
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      ${req.user ? 'LEFT JOIN likes_comentarios lc ON c.id = lc.comentario_id AND lc.usuario_id = $2' : ''}
      WHERE c.post_id = $1 AND c.activo = true
      ORDER BY c.fecha ASC
    `, req.user ? [id, req.user.id] : [id]);

    const post = result.rows[0];
    post.comentarios = comentariosResult.rows;

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error obteniendo post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener post',
      error: error.message
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { contenido, imagen_url, tipo = 'post' } = req.body;

    const tiendaResult = await pool.query(
      'SELECT id FROM tiendas WHERE usuario_id = $1 AND activa = true',
      [req.user.id]
    );

    if (tiendaResult.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes una tienda activa' });
    }

    const result = await pool.query(`
      INSERT INTO posts (tienda_id, contenido, imagen_url, tipo)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [tiendaResult.rows[0].id, contenido, imagen_url, tipo]);

    const postCreado = await pool.query(`
      SELECT p.*, t.nombre_tienda, t.logo_url as tienda_logo,
             t.url_tienda, t.sector
      FROM posts p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.id = $1
    `, [result.rows[0].id]);

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: postCreado.rows[0]
    });
  } catch (error) {
    console.error('Error creando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear post',
      error: error.message
    });
  }
};

const likePost = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    const postResult = await client.query(
      'SELECT id FROM posts WHERE id = $1 AND activo = true',
      [id]
    );

    if (postResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    const likeExists = await client.query(
      'SELECT id FROM likes_posts WHERE usuario_id = $1 AND post_id = $2',
      [req.user.id, id]
    );

    let liked = true;
    if (likeExists.rows.length > 0) {
      await client.query(
        'DELETE FROM likes_posts WHERE usuario_id = $1 AND post_id = $2',
        [req.user.id, id]
      );
      await client.query(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1',
        [id]
      );
      liked = false;
    } else {
      await client.query(
        'INSERT INTO likes_posts (usuario_id, post_id) VALUES ($1, $2)',
        [req.user.id, id]
      );
      await client.query(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1',
        [id]
      );
    }

    await client.query('COMMIT');

    const updatedPost = await pool.query(
      'SELECT likes_count FROM posts WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: liked ? 'Like agregado' : 'Like removido',
      data: {
        liked,
        likes_count: updatedPost.rows[0].likes_count
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error con like:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar like',
      error: error.message
    });
  } finally {
    client.release();
  }
};

const addComment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { contenido } = req.body;
    
    await client.query('BEGIN');
    
    const postResult = await client.query(
      'SELECT id FROM posts WHERE id = $1 AND activo = true',
      [id]
    );

    if (postResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    const comentarioResult = await client.query(`
      INSERT INTO comentarios (post_id, usuario_id, contenido)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, req.user.id, contenido]);

    await client.query(
      'UPDATE posts SET comentarios_count = comentarios_count + 1 WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    const comentarioCompleto = await pool.query(`
      SELECT c.*, u.nombre as usuario_nombre
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = $1
    `, [comentarioResult.rows[0].id]);

    res.status(201).json({
      success: true,
      message: 'Comentario agregado exitosamente',
      data: comentarioCompleto.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error agregando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar comentario',
      error: error.message
    });
  } finally {
    client.release();
  }
};

const followTienda = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { tiendaId } = req.params;
    
    await client.query('BEGIN');
    
    const tiendaResult = await client.query(
      'SELECT id FROM tiendas WHERE id = $1 AND activa = true',
      [tiendaId]
    );

    if (tiendaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }

    const followExists = await client.query(
      'SELECT id FROM seguidores WHERE seguidor_id = $1 AND tienda_id = $2',
      [req.user.id, tiendaId]
    );

    let siguiendo = true;
    if (followExists.rows.length > 0) {
      await client.query(
        'DELETE FROM seguidores WHERE seguidor_id = $1 AND tienda_id = $2',
        [req.user.id, tiendaId]
      );
      siguiendo = false;
    } else {
      await client.query(
        'INSERT INTO seguidores (seguidor_id, tienda_id) VALUES ($1, $2)',
        [req.user.id, tiendaId]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: siguiendo ? 'Ahora sigues esta tienda' : 'Dejaste de seguir esta tienda',
      data: { siguiendo }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error siguiendo tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al seguir/dejar de seguir tienda',
      error: error.message
    });
  } finally {
    client.release();
  }
};

const getMyPosts = async (req, res) => {
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

    const result = await pool.query(`
      SELECT p.*, t.nombre_tienda, t.logo_url as tienda_logo
      FROM posts p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.tienda_id = $1 AND p.activo = true
      ORDER BY p.fecha_publicacion DESC
      LIMIT $2 OFFSET $3
    `, [tiendaResult.rows[0].id, limite, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM posts WHERE tienda_id = $1 AND activo = true',
      [tiendaResult.rows[0].id]
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
    console.error('Error obteniendo mis posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts',
      error: error.message
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const postResult = await pool.query(`
      SELECT p.id FROM posts p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.id = $1 AND t.usuario_id = $2
    `, [id, req.user.id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post no encontrado o no autorizado' });
    }

    await pool.query('UPDATE posts SET activo = false WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Post eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar post',
      error: error.message
    });
  }
};

module.exports = {
  getFeedPosts,
  getPostById,
  createPost,
  likePost,
  addComment,
  followTienda,
  getMyPosts,
  deletePost
};