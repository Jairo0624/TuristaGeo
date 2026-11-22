const AppError = require('../utils/AppError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.validateRegister = (req, res, next) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) throw new AppError('Nombre, correo y contraseña son obligatorios', 400);
  if (!EMAIL_RE.test(email)) throw new AppError('El correo no tiene un formato válido', 400);
  if (password.length < 6) throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Correo y contraseña son obligatorios', 400);
  next();
};

// ---------- Validaciones de los CRUD ----------
const mongoose = require('mongoose');
const PRECIOS = ['gratis', 'bajo', 'medio', 'alto'];
const isId = (v) => mongoose.isValidObjectId(v);
const blank = (v) => v === undefined || v === null || String(v).trim() === '';

exports.validateId = (req, res, next) => {
  if (!isId(req.params.id)) throw new AppError('El id no es válido', 400);
  next();
};

exports.validateCategory = (req, res, next) => {
  if (blank(req.body.nombre)) throw new AppError('El nombre de la categoría es obligatorio', 400);
  next();
};

// partial = true en PUT (solo valida lo que venga)
exports.validateLocation = (partial) => (req, res, next) => {
  const b = req.body;
  if ((!partial || b.nombre !== undefined) && blank(b.nombre)) {
    throw new AppError('El nombre es obligatorio', 400);
  }
  if ((!partial || b.categoria !== undefined) && !isId(b.categoria)) {
    throw new AppError('La categoría es obligatoria y debe ser válida', 400);
  }
  if (b.precio !== undefined && !PRECIOS.includes(b.precio)) {
    throw new AppError(`El precio debe ser: ${PRECIOS.join(', ')}`, 400);
  }
  const hasCoords = b.lat !== undefined || b.lng !== undefined || b.ubicacion;
  if (!partial && !hasCoords) throw new AppError('Las coordenadas son obligatorias (lat y lng)', 400);
  next();
};

exports.validateZone = (partial) => (req, res, next) => {
  const b = req.body;
  if ((!partial || b.nombre !== undefined) && blank(b.nombre)) {
    throw new AppError('El nombre de la zona es obligatorio', 400);
  }
  if (!partial && !b.area) throw new AppError('El polígono de la zona es obligatorio', 400);
  next();
};

exports.validateRoute = (req, res, next) => {
  const b = req.body;
  if (blank(b.nombre)) throw new AppError('El nombre de la ruta es obligatorio', 400);
  if (b.ubicaciones !== undefined) {
    if (!Array.isArray(b.ubicaciones) || !b.ubicaciones.every(isId)) {
      throw new AppError('ubicaciones debe ser una lista de ids válidos', 400);
    }
  }
  next();
};

exports.validateReview = (partial) => (req, res, next) => {
  const b = req.body;
  if (!partial && !isId(b.ubicacion)) throw new AppError('La ubicación es obligatoria y debe ser válida', 400);
  if (!partial || b.calificacion !== undefined) {
    const n = Number(b.calificacion);
    if (!Number.isInteger(n) || n < 1 || n > 5) throw new AppError('La calificación debe ser un entero de 1 a 5', 400);
  }
  next();
};
