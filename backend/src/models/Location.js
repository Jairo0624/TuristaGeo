const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    descripcion: { type: String, trim: true, default: '' },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'La categoría es obligatoria'] },
    precio: { type: String, enum: ['gratis', 'bajo', 'medio', 'alto'], default: 'medio' },
    // GeoJSON Point: SIEMPRE [longitud, latitud]
    ubicacion: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: {
        type: [Number],
        required: [true, 'Las coordenadas son obligatorias'],
        validate: {
          validator: (c) => c.length === 2 && c[0] >= -180 && c[0] <= 180 && c[1] >= -90 && c[1] <= 90,
          message: 'Coordenadas inválidas, usa [longitud, latitud]',
        },
      },
    },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

locationSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);
