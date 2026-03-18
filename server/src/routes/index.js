const { Router } = require('express');
const router = Router();

// Client API
router.use('/api/v1/user', require('./user'));
router.use('/api/v1/exam', require('./exam'));
router.use('/api/v1/practice', require('./practice'));
router.use('/api/v1/mock', require('./mock'));
router.use('/api/v1/wrong', require('./wrong'));
router.use('/api/v1/stats', require('./stats'));

// Admin API
router.use('/admin/v1/auth', require('./admin/auth'));
router.use('/admin/v1/categories', require('./admin/categories'));
router.use('/admin/v1/chapters', require('./admin/chapters'));
router.use('/admin/v1/questions', require('./admin/questions'));
router.use('/admin/v1/mock-configs', require('./admin/mockConfigs'));
router.use('/admin/v1/users', require('./admin/users'));
router.use('/admin/v1/stats', require('./admin/stats'));

module.exports = router;
