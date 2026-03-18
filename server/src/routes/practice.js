const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const practiceService = require('../services/practiceService');
const { success } = require('../utils/response');

const router = Router();

router.post('/start', auth, [
  body('mode').isIn(['chapter', 'random']).withMessage('Invalid mode'),
  body('exam_category_id').isInt().withMessage('exam_category_id required'),
  validate,
], async (req, res, next) => {
  try {
    const result = await practiceService.startPractice(req.userId, req.body);
    success(res, result);
  } catch (err) { next(err); }
});

router.post('/submit', auth, [
  body('practice_record_id').isInt().withMessage('practice_record_id required'),
  body('question_id').isInt().withMessage('question_id required'),
  body('user_answer').notEmpty().withMessage('user_answer required'),
  validate,
], async (req, res, next) => {
  try {
    const result = await practiceService.submitAnswer(req.userId, req.body);
    success(res, result);
  } catch (err) { next(err); }
});

router.post('/finish', auth, [
  body('practice_record_id').isInt().withMessage('practice_record_id required'),
  body('duration_seconds').optional().isInt({ min: 0 }),
  validate,
], async (req, res, next) => {
  try {
    const result = await practiceService.finishPractice(req.userId, req.body.practice_record_id, req.body.duration_seconds);
    success(res, result);
  } catch (err) { next(err); }
});

module.exports = router;
