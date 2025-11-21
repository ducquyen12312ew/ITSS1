const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserDetail,
  toggleUserBan,
  changeUserRole,
  deleteUser
} = require('../controllers/userManagementController');

// Middleware
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * User Management Routes
 * Base: /api/admin/user-management
 */

// Get all users with filters
router.get('/', getAllUsers);

// Get user detail
router.get('/:userId', getUserDetail);

// Toggle ban status
router.patch('/:userId/toggle-ban', toggleUserBan);

// Change user role
router.patch('/:userId/change-role', changeUserRole);

// Delete user
router.delete('/:userId', deleteUser);

module.exports = router;
