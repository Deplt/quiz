const { Router } = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const wrongService = require('../services/wrongService');
const { success } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

const router = Router();

router.get('/list', auth, [
  query('exam_category_id').isInt().withMessage('exam_category_id required'),
  validate,
], async (req, res, next) => {
  try {
    const { offset, limit, page, pageSize } = parsePagination(req.query);
    const { total, list } = await wrongService.getWrongList(req.userId, req.query.exam_category_id, { offset, limit });
    success(res, { list, total, page, pageSize });
  } catch (err) { next(err); }
});

router.post('/remove', auth, [
  body('question_id').isInt().withMessage('question_id required'),
  validate,
], async (req, res, next) => {
  try {
    await wrongService.removeWrong(req.userId, req.body.question_id);
    success(res);
  } catch (err) { next(err); }
});

router.post('/practice', auth, [
  body('exam_category_id').isInt().withMessage('exam_category_id required'),
  validate,
], async (req, res, next) => {
  try {
    const result = await wrongService.practiceWrong(req.userId, req.body.exam_category_id);
    success(res, result);
  } catch (err) { next(err); }
});

module.exports = router;
