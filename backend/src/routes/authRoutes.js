const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');
const { validateRegister, validateLogin } = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');

router.post('/register', validateRegister, catchAsync(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ ok: true, ...data });
}));

router.post('/login', validateLogin, catchAsync(async (req, res) => {
  const data = await authService.login(req.body);
  res.status(200).json({ ok: true, ...data });
}));

router.get('/me', protect, (req, res) => {
  res.status(200).json({ ok: true, user: { id: req.user._id, nombre: req.user.nombre, email: req.user.email } });
});

module.exports = router;
