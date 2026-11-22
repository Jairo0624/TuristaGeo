const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true },
    descripcion: { type: String, trim: true, default: '' },
    color: { type: String, default: '#0ea5e9' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
