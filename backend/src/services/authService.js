const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function publicUser(u) {
  return { id: u._id, nombre: u.nombre, email: u.email };
}

exports.register = async ({ nombre, email, password }) => {
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError('Ya existe una cuenta con ese correo', 400);
  const user = await User.create({ nombre, email, password });
  return { token: signToken(user._id), user: publicUser(user) };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Correo o contraseña incorrectos', 401);
  }
  return { token: signToken(user._id), user: publicUser(user) };
};
