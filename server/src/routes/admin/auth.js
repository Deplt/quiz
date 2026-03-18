const { Router } = require('express');
const { body } = require('express-validator');
const adminAuth = require('../../middleware/adminAuth');
const validate = require('../../middleware/validate');
const authService = require('../../services/admin/authService');
const { success } = require('../../utils/response');

const router = Router();

router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty(),
  validate,
], async (req, res, next) => {
  try {
    const result = await authService.login(req.body.username, req.body.password);
    success(res, result);
  } catch (err) { next(err); }
});

router.put('/password', adminAuth, [
  body('old_password').notEmpty(),
  body('new_password').isLength({ min: 6 }),
  validate,
], async (req, res, next) => {
  try {
    await authService.changePassword(req.adminId, req.body.old_password, req.body.new_password);
    success(res);
  } catch (err) { next(err); }
});

module.exports = router;
