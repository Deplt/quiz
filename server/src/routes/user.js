const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const userService = require('../services/userService');
const { success, fail } = require('../utils/response');

const router = Router();

router.post('/login', [
  body('code').notEmpty().withMessage('code is required'),
  validate,
], async (req, res, next) => {
  try {
    const result = await userService.loginByWechat(req.body.code);
    success(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.userId);
    if (!user) return fail(res, 'User not found', 404);
    success(res, user);
  } catch (err) {
    next(err);
  }
});

router.post('/bindPhone', auth, [
  body('phone').notEmpty().withMessage('phone is required'),
  validate,
], async (req, res, next) => {
  try {
    const user = await userService.bindPhone(req.userId, req.body.phone);
    success(res, user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
