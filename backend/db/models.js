const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/emprendedores_unidos',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('comprador', 'vendedor', 'admin')),
        nombre VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        direccion TEXT,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        avatar_url TEXT,
        fecha_nacimiento DATE,
        genero VARCHAR(20)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tiendas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        nombre_tienda VARCHAR(255) UNIQUE NOT NULL,
        url_tienda VARCHAR(255) UNIQUE NOT NULL,
        descripcion TEXT,
        logo_url TEXT,
        sector VARCHAR(100),
        telefono VARCHAR(20),
        direccion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activa BOOLEAN DEFAULT true,
        verificada BOOLEAN DEFAULT false,
        calificacion_promedio DECIMAL(3,2) DEFAULT 0,
        total_ventas INTEGER DEFAULT 0,
        redes_sociales JSONB
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        tienda_id INTEGER REFERENCES tiendas(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        categoria VARCHAR(100),
        imagen_urls JSONB,
        especificaciones JSONB,
        peso DECIMAL(8,2),
        dimensiones VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        destacado BOOLEAN DEFAULT false,
        descuento_porcentaje INTEGER DEFAULT 0,
        tags TEXT[]
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        comprador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        total DECIMAL(10,2) NOT NULL,
        estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        direccion_envio JSONB NOT NULL,
        metodo_pago VARCHAR(50),
        numero_tracking VARCHAR(100),
        fecha_entrega_estimada DATE,
        notas TEXT,
        descuento_aplicado DECIMAL(10,2) DEFAULT 0,
        impuestos DECIMAL(10,2) DEFAULT 0,
        costo_envio DECIMAL(10,2) DEFAULT 0
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS items_pedido (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        descuento_unitario DECIMAL(10,2) DEFAULT 0,
        UNIQUE(pedido_id, producto_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        tienda_id INTEGER REFERENCES tiendas(id) ON DELETE CASCADE,
        contenido TEXT NOT NULL,
        imagen_url TEXT,
        fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        likes_count INTEGER DEFAULT 0,
        comentarios_count INTEGER DEFAULT 0,
        tipo VARCHAR(20) DEFAULT 'post' CHECK (tipo IN ('post', 'promocion', 'evento', 'noticia'))
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        contenido TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        likes_count INTEGER DEFAULT 0
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS seguidores (
        id SERIAL PRIMARY KEY,
        seguidor_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        tienda_id INTEGER REFERENCES tiendas(id) ON DELETE CASCADE,
        fecha_seguimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(seguidor_id, tienda_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS likes_posts (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, post_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS likes_comentarios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        comentario_id INTEGER REFERENCES comentarios(id) ON DELETE CASCADE,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, comentario_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS conversaciones (
        id SERIAL PRIMARY KEY,
        comprador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        vendedor_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        ultimo_mensaje TEXT,
        fecha_ultimo_mensaje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activa BOOLEAN DEFAULT true,
        UNIQUE(comprador_id, vendedor_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id SERIAL PRIMARY KEY,
        conversacion_id INTEGER REFERENCES conversaciones(id) ON DELETE CASCADE,
        remitente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        contenido TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        leido BOOLEAN DEFAULT false,
        tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagen', 'archivo'))
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS valoraciones (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
        comentario TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(producto_id, usuario_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        icono VARCHAR(100),
        activa BOOLEAN DEFAULT true,
        orden INTEGER DEFAULT 0
      )
    `);

    -- Índices para optimizar búsquedas y rendimiento
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
      CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
      CREATE INDEX IF NOT EXISTS idx_tiendas_usuario ON tiendas(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_tiendas_activa ON tiendas(activa);
      CREATE INDEX IF NOT EXISTS idx_tiendas_url ON tiendas(url_tienda);
      CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
      CREATE INDEX IF NOT EXISTS idx_productos_tienda ON productos(tienda_id);
      CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
      CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos(destacado);
      CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio);
      CREATE INDEX IF NOT EXISTS idx_productos_fecha ON productos(fecha_creacion DESC);
      CREATE INDEX IF NOT EXISTS idx_pedidos_comprador ON pedidos(comprador_id);
      CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
      CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_pedido DESC);
      CREATE INDEX IF NOT EXISTS idx_items_pedido ON items_pedido(pedido_id);
      CREATE INDEX IF NOT EXISTS idx_items_producto ON items_pedido(producto_id);
      CREATE INDEX IF NOT EXISTS idx_posts_tienda ON posts(tienda_id);
      CREATE INDEX IF NOT EXISTS idx_posts_activo ON posts(activo);
      CREATE INDEX IF NOT EXISTS idx_posts_fecha ON posts(fecha_publicacion DESC);
      CREATE INDEX IF NOT EXISTS idx_comentarios_post ON comentarios(post_id);
      CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON comentarios(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_seguidores_usuario ON seguidores(seguidor_id);
      CREATE INDEX IF NOT EXISTS idx_seguidores_tienda ON seguidores(tienda_id);
      CREATE INDEX IF NOT EXISTS idx_likes_posts_usuario ON likes_posts(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_likes_posts_post ON likes_posts(post_id);
      CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
      CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON mensajes(fecha DESC);
      CREATE INDEX IF NOT EXISTS idx_valoraciones_producto ON valoraciones(producto_id);
      CREATE INDEX IF NOT EXISTS idx_valoraciones_usuario ON valoraciones(usuario_id);
    `);

    await client.query('COMMIT');
    console.log('Tablas creadas exitosamente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando tablas:', error);
    throw error;
  } finally {
    client.release();
  }
};

const insertDefaultCategories = async () => {
  const client = await pool.connect();
  
  try {
    const categorias = [
      { nombre: 'Tecnología', descripcion: 'Productos tecnológicos y electrónicos', icono: 'tech' },
      { nombre: 'Ropa y Moda', descripcion: 'Vestimenta y accesorios', icono: 'fashion' },
      { nombre: 'Hogar y Jardín', descripcion: 'Artículos para el hogar', icono: 'home' },
      { nombre: 'Deportes', descripcion: 'Artículos deportivos y fitness', icono: 'sports' },
      { nombre: 'Belleza y Salud', descripcion: 'Productos de belleza y cuidado personal', icono: 'beauty' },
      { nombre: 'Libros y Educación', descripcion: 'Libros y material educativo', icono: 'books' },
      { nombre: 'Juguetes y Bebés', descripcion: 'Productos para niños y bebés', icono: 'toys' },
      { nombre: 'Alimentos y Bebidas', descripcion: 'Productos alimenticios', icono: 'food' },
      { nombre: 'Arte y Manualidades', descripcion: 'Productos artísticos y manualidades', icono: 'art' },
      { nombre: 'Automóviles', descripcion: 'Productos para vehículos', icono: 'auto' }
    ];

    for (let i = 0; i < categorias.length; i++) {
      const cat = categorias[i];
      await client.query(`
        INSERT INTO categorias (nombre, descripcion, icono, orden)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (nombre) DO NOTHING
      `, [cat.nombre, cat.descripcion, cat.icono, i + 1]);
    }

    console.log('Categorías por defecto insertadas');
  } catch (error) {
    console.error('Error insertando categorías:', error);
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  createTables,
  insertDefaultCategories
};