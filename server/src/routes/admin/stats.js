const { Router } = require('express');
const adminAuth = require('../../middleware/adminAuth');
const svc = require('../../services/admin/statsService');
const { success } = require('../../utils/response');

const router = Router();

router.get('/dashboard', adminAuth, async (req, res, next) => {
  try {
    success(res, await svc.getDashboard());
  } catch (e) {
    next(e);
  }
});

module.exports = router;
