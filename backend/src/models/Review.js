const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    ubicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: [true, 'La ubicación es obligatoria'] },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    calificacion: { type: Number, required: [true, 'La calificación es obligatoria'], min: 1, max: 5 },
    comentario: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
