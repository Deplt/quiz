const { Router } = require('express');
const adminAuth = require('../../middleware/adminAuth');
const svc = require('../../services/admin/userService');
const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');

const router = Router();

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { offset, limit, page, pageSize } = parsePagination(req.query);
    const { total, list } = await svc.listUsers(req.query.search, { offset, limit });
    success(res, { list, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', adminAuth, async (req, res, next) => {
  try {
    success(res, await svc.getUserDetail(req.params.id));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
