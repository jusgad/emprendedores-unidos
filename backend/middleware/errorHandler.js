/**
 * Middleware de manejo centralizado de errores
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleDatabaseError = (error) => {
  // Errores de PostgreSQL
  if (error.code === '23505') {
    return new AppError('El registro ya existe', 409);
  }
  if (error.code === '23503') {
    return new AppError('Referencia inválida', 400);
  }
  if (error.code === '22P02') {
    return new AppError('Formato de datos inválido', 400);
  }
  return new AppError('Error en la base de datos', 500);
};

const handleJWTError = () => new AppError('Token inválido', 401);
const handleJWTExpiredError = () => new AppError('Token expirado', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Errores operacionales: enviar al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status || 'error',
      message: err.message
    });
  } else {
    // Errores de programación o desconocidos: no filtrar detalles
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Algo salió mal'
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Manejar errores específicos
    if (err.code) error = handleDatabaseError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  } else {
    // Por defecto, modo desarrollo
    sendErrorDev(err, res);
  }
};

// Manejador para rutas no encontradas
const notFound = (req, res, next) => {
  const error = new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404);
  next(error);
};

// Envolver funciones async para capturar errores
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  catchAsync
};
