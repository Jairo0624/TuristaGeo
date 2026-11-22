const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    descripcion: { type: String, trim: true, default: '' },
    duracion: { type: String, trim: true, default: '' },
    ubicaciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
