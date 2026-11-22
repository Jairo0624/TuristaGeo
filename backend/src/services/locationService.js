const mongoose = require('mongoose');
const Location = require('../models/Location');
const Category = require('../models/Category');
const Zone = require('../models/Zone');
const Review = require('../models/Review');
const Route = require('../models/Route');
const AppError = require('../utils/AppError');
const { toPoint, escapeRegex } = require('../utils/geo');

const PRECIOS = ['gratis', 'bajo', 'medio', 'alto'];
const populate = [
  { path: 'categoria', select: 'nombre color' },
  { path: 'creadoPor', select: 'nombre' },
];

async function ensureCategory(id) {
  if (!(await Category.exists({ _id: id }))) throw new AppError('La categoría no existe', 400);
}

// Filtros por query string: ?search=&category=&precio=&zona=
exports.list = async (q = {}) => {
  const filter = {};

  if (q.search && String(q.search).trim()) {
    filter.nombre = { $regex: escapeRegex(String(q.search).trim()), $options: 'i' };
  }
  if (q.category) {
    if (!mongoose.isValidObjectId(String(q.category))) throw new AppError('category no es un id válido', 400);
    filter.categoria = String(q.category);
  }
  if (q.precio) {
    if (!PRECIOS.includes(String(q.precio))) throw new AppError(`precio debe ser: ${PRECIOS.join(', ')}`, 400);
    filter.precio = String(q.precio);
  }
  if (q.zona) {
    if (!mongoose.isValidObjectId(String(q.zona))) throw new AppError('zona no es un id válido', 400);
    const zone = await Zone.findById(String(q.zona));
    if (!zone) throw new AppError('Zona no encontrada', 404);
    filter.ubicacion = { $geoWithin: { $geometry: { type: 'Polygon', coordinates: zone.toObject().area.coordinates } } };
  }

  return Location.find(filter).populate(populate).sort({ createdAt: -1 });
};

exports.getById = async (id) => {
  const loc = await Location.findById(id).populate(populate);
  if (!loc) throw new AppError('Ubicación no encontrada', 404);
  return loc;
};

exports.create = async (body, userId) => {
  const point = toPoint(body);
  if (!point) throw new AppError('Las coordenadas son obligatorias (lat y lng)', 400);
  await ensureCategory(body.categoria);
  const loc = await Location.create({
    nombre: body.nombre,
    descripcion: body.descripcion,
    categoria: body.categoria,
    precio: body.precio,
    ubicacion: point,
    creadoPor: userId,
  });
  return Location.findById(loc._id).populate(populate);
};

exports.update = async (id, body) => {
  const loc = await Location.findById(id);
  if (!loc) throw new AppError('Ubicación no encontrada', 404);

  ['nombre', 'descripcion', 'precio'].forEach((k) => {
    if (body[k] !== undefined) loc[k] = body[k];
  });
  if (body.categoria !== undefined) {
    await ensureCategory(body.categoria);
    loc.categoria = body.categoria;
  }
  const point = toPoint(body);
  if (point) loc.ubicacion = point;

  await loc.save();
  return Location.findById(id).populate(populate);
};

exports.remove = async (id) => {
  const loc = await Location.findByIdAndDelete(id);
  if (!loc) throw new AppError('Ubicación no encontrada', 404);
  // Limpieza de referencias
  await Review.deleteMany({ ubicacion: id });
  await Route.updateMany({ ubicaciones: id }, { $pull: { ubicaciones: id } });
};
