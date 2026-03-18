const { Router } = require('express');
const auth = require('../middleware/auth');
const examService = require('../services/examService');
const { success } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

const router = Router();

router.get('/categories', auth, async (req, res, next) => {
  try {
    const data = await examService.getCategories();
    success(res, data);
  } catch (err) { next(err); }
});

router.get('/categories/:id/chapters', auth, async (req, res, next) => {
  try {
    const data = await examService.getChaptersByCategory(req.params.id);
    success(res, data);
  } catch (err) { next(err); }
});

router.get('/chapters/:id/questions', auth, async (req, res, next) => {
  try {
    const { offset, limit, page, pageSize } = parsePagination(req.query);
    const { total, list } = await examService.getQuestionsByChapter(req.params.id, { offset, limit });
    success(res, { list, total, page, pageSize });
  } catch (err) { next(err); }
});

module.exports = router;
