const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const svc = require('../services/routeService');
const { protect } = require('../middlewares/auth');
const { validateId, validateRoute } = require('../middlewares/validate');

router.use(protect);

router.get('/', catchAsync(async (req, res) => {
  const data = await svc.list();
  res.status(200).json({ ok: true, count: data.length, data });
}));

router.get('/:id', validateId, catchAsync(async (req, res) => {
  res.status(200).json({ ok: true, data: await svc.getById(req.params.id) });
}));

router.post('/', validateRoute, catchAsync(async (req, res) => {
  res.status(201).json({ ok: true, data: await svc.create(req.body, req.user._id) });
}));

router.put('/:id', validateId, validateRoute, catchAsync(async (req, res) => {
  res.status(200).json({ ok: true, data: await svc.update(req.params.id, req.body, req.user._id) });
}));

router.delete('/:id', validateId, catchAsync(async (req, res) => {
  await svc.remove(req.params.id, req.user._id);
  res.status(200).json({ ok: true, message: 'Ruta eliminada' });
}));

module.exports = router;
