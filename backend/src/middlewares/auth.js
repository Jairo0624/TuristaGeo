const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

// Sin token válido no se entra a las rutas internas
exports.protect = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) throw new AppError('No has iniciado sesión', 401);

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.id);
  if (!user) throw new AppError('El usuario de este token ya no existe', 401);

  req.user = user;
  next();
});
