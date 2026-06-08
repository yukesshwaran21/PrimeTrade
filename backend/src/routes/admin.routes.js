const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUserRole, getDashboardStats } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

router.use(authenticate, authorize('ADMIN')); // All admin routes require ADMIN role

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
