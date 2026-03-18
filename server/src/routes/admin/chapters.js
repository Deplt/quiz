const { Router } = require('express');
const { body } = require('express-validator');
const adminAuth = require('../../middleware/adminAuth');
const validate = require('../../middleware/validate');
const svc = require('../../services/admin/categoryService');
const { success } = require('../../utils/response');

const router = Router();

router.post('/', adminAuth, [
  body('exam_category_id').isInt(),
  body('name').notEmpty(),
  validate,
], async (req, res, next) => {
  try { success(res, await svc.createChapter(req.body), 201); } catch (e) { next(e); }
});

router.put('/:id', adminAuth, async (req, res, next) => {
  try { success(res, await svc.updateChapter(req.params.id, req.body)); } catch (e) { next(e); }
});

router.put('/:id/archive', adminAuth, async (req, res, next) => {
  try { success(res, await svc.archiveChapter(req.params.id)); } catch (e) { next(e); }
});

module.exports = router;
