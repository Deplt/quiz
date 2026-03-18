const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const mockService = require('../services/mockService');
const { success } = require('../utils/response');

const router = Router();

router.post('/start', auth, [
  body('mock_exam_config_id').isInt().withMessage('mock_exam_config_id required'),
  validate,
], async (req, res, next) => {
  try {
    const result = await mockService.startMock(req.userId, req.body.mock_exam_config_id);
    success(res, result);
  } catch (err) { next(err); }
});

router.post('/submit', auth, [
  body('practice_record_id').isInt().withMessage('practice_record_id required'),
  body('answers').isArray({ min: 1 }).withMessage('answers required'),
  validate,
], async (req, res, next) => {
  try {
    const result = await mockService.submitMock(req.userId, req.body);
    success(res, result);
  } catch (err) { next(err); }
});

module.exports = router;
