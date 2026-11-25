// Carga datos de ejemplo de Cancún y el usuario de prueba. Se puede correr varias veces
// sin duplicar nada (actualiza por nombre). Solo toca las colecciones de TuristaGeo.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Location = require('./models/Location');
const Zone = require('./models/Zone');
const Route = require('./models/Route');
const Review = require('./models/Review');
const { toPolygon } = require('./utils/geo');
const data = require('./data/cancunData');

const opts = { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true };

async function run() {
  await connectDB();

  const email = (process.env.SEED_EMAIL || 'demo@turistageo.com').toLowerCase();
  const password = process.env.SEED_PASSWORD || 'demo1234';
  let user = await User.findOne({ email });
  if (user) {
    console.log(`Usuario de prueba ya existía: ${email} (no se modificó su contraseña)`);
  } else {
    user = await User.create({ nombre: 'Usuario Demo', email, password });
    console.log(`Usuario de prueba creado: ${email} / ${password}`);
  }

  const cats = {};
  for (const c of data.categorias) {
    cats[c.nombre] = await Category.findOneAndUpdate({ nombre: c.nombre }, { ...c, creadoPor: user._id }, opts);
  }

  const locs = {};
  for (const l of data.lugares) {
    if (!cats[l.categoria]) throw new Error(`Categoría inexistente: ${l.categoria}`);
    locs[l.nombre] = await Location.findOneAndUpdate(
      { nombre: l.nombre },
      {
        nombre: l.nombre,
        descripcion: l.descripcion,
        categoria: cats[l.categoria]._id,
        precio: l.precio,
        ubicacion: { type: 'Point', coordinates: [l.lng, l.lat] }, // [longitud, latitud]
        creadoPor: user._id,
      },
      opts
    );
  }

  for (const z of data.zonas) {
    const area = toPolygon({ type: 'Polygon', coordinates: [z.coordinates] });
    await Zone.findOneAndUpdate({ nombre: z.nombre }, { nombre: z.nombre, area, creadoPor: user._id }, opts);
  }

  for (const r of data.rutas) {
    const ubicaciones = r.lugares.map((n) => {
      if (!locs[n]) throw new Error(`Lugar inexistente en la ruta "${r.nombre}": ${n}`);
      return locs[n]._id;
    });
    await Route.findOneAndUpdate(
      { nombre: r.nombre },
      { nombre: r.nombre, descripcion: r.descripcion, duracion: r.duracion, ubicaciones, creadoPor: user._id },
      opts
    );
  }

  for (const rv of data.resenas) {
    if (!locs[rv.lugar]) throw new Error(`Lugar inexistente en reseña: ${rv.lugar}`);
    await Review.findOneAndUpdate(
      { ubicacion: locs[rv.lugar]._id, usuario: user._id },
      { calificacion: rv.calificacion, comentario: rv.comentario },
      opts
    );
  }

  console.log(
    `Seed listo: ${data.categorias.length} categorías, ${data.lugares.length} lugares, ` +
      `${data.zonas.length} zonas, ${data.rutas.length} rutas, ${data.resenas.length} reseñas`
  );
}

run()
  .catch((err) => {
    console.error('Error en el seed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
