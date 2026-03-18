const { Router } = require('express');
const auth = require('../middleware/auth');
const statsService = require('../services/statsService');
const { success } = require('../utils/response');

const router = Router();

router.get('/overview', auth, async (req, res, next) => {
  try {
    const data = await statsService.getOverview(req.userId);
    success(res, data);
  } catch (err) { next(err); }
});

router.get('/category/:id', auth, async (req, res, next) => {
  try {
    const data = await statsService.getCategoryProgress(req.userId, req.params.id);
    success(res, data);
  } catch (err) { next(err); }
});

module.exports = router;
