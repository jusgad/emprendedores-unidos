// Sanitización de inputs para prevenir XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Eliminar < y >
    .trim();
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
};

const validatePassword = (password) => {
  // Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
  if (!password || password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber;
};

const validateId = (id) => {
  const numId = parseInt(id, 10);
  return Number.isInteger(numId) && numId > 0;
};

const validateRegistration = (req, res, next) => {
  let { email, password, nombre, rol, telefono, direccion } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Email válido es requerido' });
  }

  if (!password || !validatePassword(password)) {
    return res.status(400).json({
      error: 'Contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas y números'
    });
  }

  if (!nombre || nombre.trim().length < 2 || nombre.length > 100) {
    return res.status(400).json({ error: 'Nombre debe tener entre 2 y 100 caracteres' });
  }

  if (!rol || !['comprador', 'vendedor'].includes(rol)) {
    return res.status(400).json({ error: 'Rol debe ser comprador o vendedor' });
  }

  // Sanitizar inputs
  req.body.email = email.toLowerCase().trim();
  req.body.nombre = sanitizeInput(nombre);
  if (telefono) req.body.telefono = sanitizeInput(telefono);
  if (direccion) req.body.direccion = sanitizeInput(direccion);

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
  let { nombre, descripcion, precio, stock, categoria } = req.body;

  if (!nombre || nombre.trim().length < 3 || nombre.length > 200) {
    return res.status(400).json({ error: 'Nombre del producto debe tener entre 3 y 200 caracteres' });
  }

  if (!descripcion || descripcion.trim().length < 10 || descripcion.length > 2000) {
    return res.status(400).json({ error: 'Descripción debe tener entre 10 y 2000 caracteres' });
  }

  const precioNum = parseFloat(precio);
  if (isNaN(precioNum) || precioNum <= 0 || precioNum > 999999999) {
    return res.status(400).json({ error: 'Precio inválido' });
  }

  const stockNum = parseInt(stock, 10);
  if (isNaN(stockNum) || stockNum < 0 || stockNum > 999999) {
    return res.status(400).json({ error: 'Stock inválido' });
  }

  if (!categoria || categoria.trim().length < 2 || categoria.length > 100) {
    return res.status(400).json({ error: 'Categoría inválida' });
  }

  // Sanitizar
  req.body.nombre = sanitizeInput(nombre);
  req.body.descripcion = sanitizeInput(descripcion);
  req.body.categoria = sanitizeInput(categoria);
  req.body.precio = precioNum;
  req.body.stock = stockNum;

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
  let { contenido } = req.body;

  if (!contenido || contenido.trim().length < 10) {
    return res.status(400).json({ error: 'Contenido debe tener al menos 10 caracteres' });
  }

  if (contenido.length > 500) {
    return res.status(400).json({ error: 'Contenido no puede exceder 500 caracteres' });
  }

  // Sanitizar contenido
  req.body.contenido = sanitizeInput(contenido);

  next();
};

const validateComentario = (req, res, next) => {
  let { contenido } = req.body;

  if (!contenido || contenido.trim().length < 3) {
    return res.status(400).json({ error: 'Comentario debe tener al menos 3 caracteres' });
  }

  if (contenido.length > 200) {
    return res.status(400).json({ error: 'Comentario no puede exceder 200 caracteres' });
  }

  // Sanitizar contenido
  req.body.contenido = sanitizeInput(contenido);

  next();
};

const validatePedido = (req, res, next) => {
  const { items, direccion_envio } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos un item' });
  }

  if (items.length > 50) {
    return res.status(400).json({ error: 'Máximo 50 items por pedido' });
  }

  for (const item of items) {
    if (!validateId(item.producto_id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    const cantidad = parseInt(item.cantidad, 10);
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > 1000) {
      return res.status(400).json({ error: 'Cantidad inválida en items' });
    }
  }

  if (!direccion_envio || !direccion_envio.direccion || !direccion_envio.ciudad) {
    return res.status(400).json({ error: 'Dirección de envío completa es requerida' });
  }

  // Sanitizar dirección
  req.body.direccion_envio.direccion = sanitizeInput(direccion_envio.direccion);
  req.body.direccion_envio.ciudad = sanitizeInput(direccion_envio.ciudad);
  if (direccion_envio.departamento) {
    req.body.direccion_envio.departamento = sanitizeInput(direccion_envio.departamento);
  }

  next();
};

const validateIdParam = (req, res, next) => {
  const id = req.params.id || req.params.productoId || req.params.tiendaId || req.params.pedidoId;

  if (!validateId(id)) {
    return res.status(400).json({ error: 'ID inválido' });
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
  validatePedido,
  validateIdParam,
  sanitizeInput,
  validateId
};