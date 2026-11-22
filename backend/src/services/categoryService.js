const Category = require('../models/Category');
const Location = require('../models/Location');
const AppError = require('../utils/AppError');

exports.list = () => Category.find().sort({ nombre: 1 });

exports.getById = async (id) => {
  const cat = await Category.findById(id);
  if (!cat) throw new AppError('Categoría no encontrada', 404);
  return cat;
};

exports.create = ({ nombre, descripcion, color }) => Category.create({ nombre, descripcion, color });

exports.update = async (id, { nombre, descripcion, color }) => {
  const cat = await Category.findByIdAndUpdate(
    id,
    { nombre, descripcion, color },
    { new: true, runValidators: true, omitUndefined: true }
  );
  if (!cat) throw new AppError('Categoría no encontrada', 404);
  return cat;
};

exports.remove = async (id) => {
  if (await Location.exists({ categoria: id })) {
    throw new AppError('No se puede eliminar: hay ubicaciones con esta categoría', 400);
  }
  const cat = await Category.findByIdAndDelete(id);
  if (!cat) throw new AppError('Categoría no encontrada', 404);
};
