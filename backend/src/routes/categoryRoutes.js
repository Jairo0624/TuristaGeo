const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const svc = require('../services/categoryService');
const { protect } = require('../middlewares/auth');
const { validateId, validateCategory } = require('../middlewares/validate');

router.use(protect);

router.get('/', catchAsync(async (req, res) => {
  const data = await svc.list();
  res.status(200).json({ ok: true, count: data.length, data });
}));

router.get('/:id', validateId, catchAsync(async (req, res) => {
  res.status(200).json({ ok: true, data: await svc.getById(req.params.id) });
}));

router.post('/', validateCategory, catchAsync(async (req, res) => {
  res.status(201).json({ ok: true, data: await svc.create(req.body) });
}));

router.put('/:id', validateId, validateCategory, catchAsync(async (req, res) => {
  res.status(200).json({ ok: true, data: await svc.update(req.params.id, req.body) });
}));

router.delete('/:id', validateId, catchAsync(async (req, res) => {
  await svc.remove(req.params.id);
  res.status(200).json({ ok: true, message: 'Categoría eliminada' });
}));

module.exports = router;
