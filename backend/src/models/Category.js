const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true },
    descripcion: { type: String, trim: true, default: '' },
    color: { type: String, default: '#0ea5e9' },
    // Quién la creó (las categorías anteriores a este campo no lo tienen)
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
