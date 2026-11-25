const Category = require('../models/Category');
const Location = require('../models/Location');
const AppError = require('../utils/AppError');
const { ensureOwner } = require('../utils/ownership');

const populate = [{ path: 'creadoPor', select: 'nombre' }];
const MSG_OWNER = 'Solo quien creó esta categoría puede modificarla o eliminarla';

// Las categorías que existían antes del campo creadoPor (sin autor) las puede modificar cualquier usuario con sesión
const checkOwner = (cat, userId) => {
  if (cat.creadoPor) ensureOwner(cat.creadoPor, userId, MSG_OWNER);
};

exports.list = () => Category.find().populate(populate).sort({ nombre: 1 });

exports.getById = async (id) => {
  const cat = await Category.findById(id).populate(populate);
  if (!cat) throw new AppError('Categoría no encontrada', 404);
  return cat;
};

exports.create = async ({ nombre, descripcion, color }, userId) => {
  const cat = await Category.create({ nombre, descripcion, color, creadoPor: userId });
  return Category.findById(cat._id).populate(populate);
};

exports.update = async (id, { nombre, descripcion, color }, userId) => {
  const cat = await Category.findById(id);
  if (!cat) throw new AppError('Categoría no encontrada', 404);
  checkOwner(cat, userId);

  if (nombre !== undefined) cat.nombre = nombre;
  if (descripcion !== undefined) cat.descripcion = descripcion;
  if (color !== undefined) cat.color = color;
  await cat.save();
  return Category.findById(id).populate(populate);
};

exports.remove = async (id, userId) => {
  const cat = await Category.findById(id);
  if (!cat) throw new AppError('Categoría no encontrada', 404);
  checkOwner(cat, userId);
  if (await Location.exists({ categoria: id })) {
    throw new AppError('No se puede eliminar: hay ubicaciones con esta categoría', 400);
  }
  await cat.deleteOne();
};
