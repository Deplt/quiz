const { Router } = require('express');
const { body } = require('express-validator');
const adminAuth = require('../../middleware/adminAuth');
const validate = require('../../middleware/validate');
const svc = require('../../services/admin/categoryService');
const { success } = require('../../utils/response');

const router = Router();

router.get('/', adminAuth, async (req, res, next) => {
  try { success(res, await svc.listCategories()); } catch (e) { next(e); }
});

router.post('/', adminAuth, [
  body('name').notEmpty(), validate,
], async (req, res, next) => {
  try { success(res, await svc.createCategory(req.body), 201); } catch (e) { next(e); }
});

router.put('/:id', adminAuth, async (req, res, next) => {
  try { success(res, await svc.updateCategory(req.params.id, req.body)); } catch (e) { next(e); }
});

router.put('/:id/archive', adminAuth, async (req, res, next) => {
  try { success(res, await svc.archiveCategory(req.params.id)); } catch (e) { next(e); }
});

router.get('/:id/chapters', adminAuth, async (req, res, next) => {
  try { success(res, await svc.listChapters(req.params.id)); } catch (e) { next(e); }
});

module.exports = router;
