const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const svc = require('../services/zoneService');
const { protect } = require('../middlewares/auth');
const { validateId, validateZone } = require('../middlewares/validate');

router.use(protect);

router.get('/', catchAsync(async (req, res) => {
  const data = await svc.list();
  res.status(200).json({ ok: true, count: data.length, data });
}));

router.get('/:id', validateId, catchAsync(async (req, res) => {
  res.status(200).json({ ok: true, data: await svc.getById(req.params.id) });
}));

// Ubicaciones dentro del polígono de la zona
router.get('/:id/locations', validateId, catchAsync(async (req, res) => {
  const data = await svc.locationsInside(req.params.id);
  res.status(200).json({ ok: true, count: data.length, data });
}));

router.post('/', validateZone(false), catchAsync(async (req, res) => {
  res.status(201).json({ ok: true, data: await svc.create(req.body, req.user._id) });
}));

router.put('/:id', validateId, validateZone(true), catchAsync(async (req, res) => {
  res.status(200).json({ ok: true, data: await svc.update(req.params.id, req.body) });
}));

router.delete('/:id', validateId, catchAsync(async (req, res) => {
  await svc.remove(req.params.id);
  res.status(200).json({ ok: true, message: 'Zona eliminada' });
}));

module.exports = router;
