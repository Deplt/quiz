const { Router } = require('express');
const { body } = require('express-validator');
const adminAuth = require('../../middleware/adminAuth');
const validate = require('../../middleware/validate');
const svc = require('../../services/admin/questionService');
const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');

const router = Router();

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { offset, limit, page, pageSize } = parsePagination(req.query);
    const { total, list } = await svc.listQuestions(req.query, { offset, limit });
    success(res, { list, total, page, pageSize });
  } catch (e) { next(e); }
});

router.post('/', adminAuth, [
  body('exam_category_id').isInt(),
  body('chapter_id').isInt(),
  body('type').isIn(['single_choice', 'multi_choice', 'true_false', 'fill_blank']),
  body('content').notEmpty(),
  body('answer').notEmpty(),
  validate,
], async (req, res, next) => {
  try { success(res, await svc.createQuestion(req.body), 201); } catch (e) { next(e); }
});

router.put('/:id', adminAuth, async (req, res, next) => {
  try { success(res, await svc.updateQuestion(req.params.id, req.body)); } catch (e) { next(e); }
});

router.put('/:id/archive', adminAuth, async (req, res, next) => {
  try { success(res, await svc.archiveQuestion(req.params.id)); } catch (e) { next(e); }
});

router.delete('/batch', adminAuth, [
  body('ids').isArray({ min: 1 }),
  validate,
], async (req, res, next) => {
  try {
    await svc.batchArchive(req.body.ids);
    success(res);
  } catch (e) { next(e); }
});

module.exports = router;
