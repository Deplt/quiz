const { Router } = require('express');
const { body } = require('express-validator');
const adminAuth = require('../../middleware/adminAuth');
const validate = require('../../middleware/validate');
const svc = require('../../services/admin/mockConfigService');
const { success } = require('../../utils/response');

const router = Router();

router.get('/', adminAuth, async (req, res, next) => {
  try {
    success(res, await svc.list());
  } catch (e) {
    next(e);
  }
});

router.post('/', adminAuth, [
  body('exam_category_id').isInt(),
  body('name').notEmpty(),
  body('question_count').isInt(),
  body('time_limit_minutes').isInt(),
  validate,
], async (req, res, next) => {
  try {
    success(res, await svc.create(req.body), 201);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    success(res, await svc.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    await svc.remove(req.params.id);
    success(res);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
