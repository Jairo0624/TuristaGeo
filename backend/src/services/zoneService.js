const Zone = require('../models/Zone');
const Location = require('../models/Location');
const AppError = require('../utils/AppError');
const { toPolygon } = require('../utils/geo');

const populate = [{ path: 'creadoPor', select: 'nombre' }];

exports.list = () => Zone.find().populate(populate).sort({ createdAt: -1 });

exports.getById = async (id) => {
  const zone = await Zone.findById(id).populate(populate);
  if (!zone) throw new AppError('Zona no encontrada', 404);
  return zone;
};

exports.create = async ({ nombre, area }, userId) => {
  const zone = await Zone.create({ nombre, area: toPolygon(area), creadoPor: userId });
  return Zone.findById(zone._id).populate(populate);
};

exports.update = async (id, { nombre, area }) => {
  const zone = await Zone.findById(id);
  if (!zone) throw new AppError('Zona no encontrada', 404);
  if (nombre !== undefined) zone.nombre = nombre;
  if (area !== undefined) zone.area = toPolygon(area);
  await zone.save();
  return Zone.findById(id).populate(populate);
};

exports.remove = async (id) => {
  const zone = await Zone.findByIdAndDelete(id);
  if (!zone) throw new AppError('Zona no encontrada', 404);
};

// Ubicaciones que caen dentro del polígono (consulta geoespacial con 2dsphere)
exports.locationsInside = async (id) => {
  const zone = await Zone.findById(id);
  if (!zone) throw new AppError('Zona no encontrada', 404);
  return Location.find({
    ubicacion: { $geoWithin: { $geometry: { type: 'Polygon', coordinates: zone.toObject().area.coordinates } } },
  })
    .populate({ path: 'categoria', select: 'nombre color' })
    .sort({ nombre: 1 });
};
