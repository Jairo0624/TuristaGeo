const mongoose = require('mongoose');
const Review = require('../models/Review');
const Location = require('../models/Location');
const AppError = require('../utils/AppError');

const populate = [
  { path: 'usuario', select: 'nombre' },
  { path: 'ubicacion', select: 'nombre' },
];

// ?ubicacion=<id> para ver solo las reseñas de un lugar
exports.list = async (q = {}) => {
  const filter = {};
  if (q.ubicacion) {
    if (!mongoose.isValidObjectId(String(q.ubicacion))) throw new AppError('ubicacion no es un id válido', 400);
    filter.ubicacion = String(q.ubicacion);
  }
  return Review.find(filter).populate(populate).sort({ createdAt: -1 });
};

exports.getById = async (id) => {
  const review = await Review.findById(id).populate(populate);
  if (!review) throw new AppError('Reseña no encontrada', 404);
  return review;
};

exports.create = async ({ ubicacion, calificacion, comentario }, userId) => {
  if (!(await Location.exists({ _id: ubicacion }))) throw new AppError('La ubicación no existe', 404);
  const review = await Review.create({ ubicacion, calificacion, comentario, usuario: userId });
  return Review.findById(review._id).populate(populate);
};

exports.update = async (id, { calificacion, comentario }) => {
  const review = await Review.findById(id);
  if (!review) throw new AppError('Reseña no encontrada', 404);
  if (calificacion !== undefined) review.calificacion = calificacion;
  if (comentario !== undefined) review.comentario = comentario;
  await review.save();
  return Review.findById(id).populate(populate);
};

exports.remove = async (id) => {
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new AppError('Reseña no encontrada', 404);
};
