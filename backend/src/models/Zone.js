const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    // GeoJSON Polygon: [[ [lng, lat], ... ]] con el anillo cerrado
    area: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: { type: [[[Number]]], required: [true, 'El polígono es obligatorio'] },
    },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

zoneSchema.index({ area: '2dsphere' });

module.exports = mongoose.model('Zone', zoneSchema);
