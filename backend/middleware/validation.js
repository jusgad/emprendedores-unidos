const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRegistration = (req, res, next) => {
  const { email, password, nombre, rol } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Email válido es requerido' });
  }

  if (!password || !validatePassword(password)) {
    return res.status(400).json({ error: 'Contraseña debe tener al menos 6 caracteres' });
  }

  if (!nombre || nombre.trim().length < 2) {
    return res.status(400).json({ error: 'Nombre debe tener al menos 2 caracteres' });
  }

  if (!rol || !['comprador', 'vendedor'].includes(rol)) {
    return res.status(400).json({ error: 'Rol debe ser comprador o vendedor' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Email válido es requerido' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Contraseña es requerida' });
  }

  next();
};

const validateProducto = (req, res, next) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;

  if (!nombre || nombre.trim().length < 3) {
    return res.status(400).json({ error: 'Nombre del producto debe tener al menos 3 caracteres' });
  }

  if (!descripcion || descripcion.trim().length < 10) {
    return res.status(400).json({ error: 'Descripción debe tener al menos 10 caracteres' });
  }

  if (!precio || precio <= 0) {
    return res.status(400).json({ error: 'Precio debe ser mayor a 0' });
  }

  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: 'Stock debe ser mayor o igual a 0' });
  }

  if (!categoria || categoria.trim().length < 2) {
    return res.status(400).json({ error: 'Categoría es requerida' });
  }

  next();
};

const validateTienda = (req, res, next) => {
  const { nombre_tienda, descripcion, sector } = req.body;

  if (!nombre_tienda || nombre_tienda.trim().length < 3) {
    return res.status(400).json({ error: 'Nombre de tienda debe tener al menos 3 caracteres' });
  }

  if (!descripcion || descripcion.trim().length < 20) {
    return res.status(400).json({ error: 'Descripción debe tener al menos 20 caracteres' });
  }

  if (!sector || sector.trim().length < 3) {
    return res.status(400).json({ error: 'Sector es requerido' });
  }

  req.body.url_tienda = nombre_tienda.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  next();
};

const validatePost = (req, res, next) => {
  const { contenido } = req.body;

  if (!contenido || contenido.trim().length < 10) {
    return res.status(400).json({ error: 'Contenido debe tener al menos 10 caracteres' });
  }

  if (contenido.length > 500) {
    return res.status(400).json({ error: 'Contenido no puede exceder 500 caracteres' });
  }

  next();
};

const validateComentario = (req, res, next) => {
  const { contenido } = req.body;

  if (!contenido || contenido.trim().length < 3) {
    return res.status(400).json({ error: 'Comentario debe tener al menos 3 caracteres' });
  }

  if (contenido.length > 200) {
    return res.status(400).json({ error: 'Comentario no puede exceder 200 caracteres' });
  }

  next();
};

const validatePedido = (req, res, next) => {
  const { items, direccion_envio } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos un item' });
  }

  for (const item of items) {
    if (!item.producto_id || !item.cantidad || item.cantidad <= 0) {
      return res.status(400).json({ error: 'Items inválidos en el pedido' });
    }
  }

  if (!direccion_envio || !direccion_envio.direccion || !direccion_envio.ciudad) {
    return res.status(400).json({ error: 'Dirección de envío completa es requerida' });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProducto,
  validateTienda,
  validatePost,
  validateComentario,
  validatePedido
};