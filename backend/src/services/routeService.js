const Route = require('../models/Route');
const Location = require('../models/Location');
const AppError = require('../utils/AppError');
const { ensureOwner } = require('../utils/ownership');

const MSG_OWNER = 'Solo quien creó esta ruta puede modificarla o eliminarla';

const populate = [
  {
    path: 'ubicaciones',
    select: 'nombre descripcion ubicacion categoria',
    populate: { path: 'categoria', select: 'nombre color' },
  },
  { path: 'creadoPor', select: 'nombre' },
];

async function ensureLocations(ids = []) {
  const unique = [...new Set(ids.map(String))];
  const count = await Location.countDocuments({ _id: { $in: unique } });
  if (count !== unique.length) throw new AppError('Alguna ubicación de la ruta no existe', 400);
  return unique;
}

exports.list = () => Route.find().populate(populate).sort({ createdAt: -1 });

exports.getById = async (id) => {
  const route = await Route.findById(id).populate(populate);
  if (!route) throw new AppError('Ruta no encontrada', 404);
  return route;
};

exports.create = async ({ nombre, descripcion, duracion, ubicaciones = [] }, userId) => {
  const ids = await ensureLocations(ubicaciones);
  const route = await Route.create({ nombre, descripcion, duracion, ubicaciones: ids, creadoPor: userId });
  return Route.findById(route._id).populate(populate);
};

exports.update = async (id, { nombre, descripcion, duracion, ubicaciones }, userId) => {
  const route = await Route.findById(id);
  if (!route) throw new AppError('Ruta no encontrada', 404);
  ensureOwner(route.creadoPor, userId, MSG_OWNER);
  if (nombre !== undefined) route.nombre = nombre;
  if (descripcion !== undefined) route.descripcion = descripcion;
  if (duracion !== undefined) route.duracion = duracion;
  if (ubicaciones !== undefined) route.ubicaciones = await ensureLocations(ubicaciones);
  await route.save();
  return Route.findById(id).populate(populate);
};

exports.remove = async (id, userId) => {
  const route = await Route.findById(id);
  if (!route) throw new AppError('Ruta no encontrada', 404);
  ensureOwner(route.creadoPor, userId, MSG_OWNER);
  await route.deleteOne();
};
