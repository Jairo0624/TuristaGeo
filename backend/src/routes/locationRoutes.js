const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const svc = require('../services/locationService');
const { protect } = require('../middlewares/auth');
const { validateId, validateLocation } = require('../middlewares/validate');

router.use(protect);

// GET /api/locations?search=&category=&precio=&zona=
router.get('/', catchAsync(async (req, res) => {
  const data = await svc.list(req.query);
  res.status(200).json({ ok: true, count: data.length, data });
}));

router.get('/:id', validateId, catchAsync(async (req, res) => {
  res.status(200).json({ ok: true, data: await svc.getById(req.params.id) });
}));

router.post('/', validateLocation(false), catchAsync(async (req, res) => {
  res.status(201).json({ ok: true, data: await svc.create(req.body, req.user._id) });
}));

router.put('/:id', validateId, validateLocation(true), catchAsync(async (req, res) => {
  res.status(200).json({ ok: true, data: await svc.update(req.params.id, req.body) });
}));

router.delete('/:id', validateId, catchAsync(async (req, res) => {
  await svc.remove(req.params.id);
  res.status(200).json({ ok: true, message: 'Ubicación eliminada' });
}));

module.exports = router;
