const AppError = require('../utils/AppError');

// Convierte errores comunes de Mongoose/JWT en AppError con el código correcto
function normalize(err) {
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map((e) => e.message).join('. ');
    return new AppError(msg, 400);
  }
  if (err.name === 'CastError') return new AppError(`Valor inválido en ${err.path}`, 400);
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    return new AppError(`Ya existe un registro con ese ${campo}`, 400);
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return new AppError('Sesión inválida o expirada, inicia sesión de nuevo', 401);
  }
  // express.json() lanza este error cuando el cuerpo no es JSON válido
  if (err.type === 'entity.parse.failed') {
    return new AppError('El cuerpo de la petición no es un JSON válido', 400);
  }
  return err;
}

module.exports = (err, req, res, next) => {
  const error = normalize(err);
  const status = error.statusCode || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    ok: false,
    message: error.isOperational ? error.message : 'Error interno del servidor',
  });
};
