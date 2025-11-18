/**
 * Admin Routes - Dashboard & Management
 * 
 * Chỉ dành cho Admin users (requireAdmin middleware)
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authentication + admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * 
 * Dashboard KPIs với filters:
 * - period: 7, 30, 90 (days)
 * 
 * Returns: Totals, ratings, growth, activity, popular spots, trends
 */
router.get('/dashboard', adminController.getDashboardKPIs);

/**
 * GET /api/admin/users
 * 
 * Danh sách tất cả users với stats
 * Query: limit, offset, sort (created_at, favorites, reviews)
 */
router.get('/users', adminController.getAllUsers);

/**
 * GET /api/admin/spots
 * 
 * Danh sách tất cả spots (PUBLIC, DRAFT, ARCHIVED)
 * Query: limit, offset, status
 */
router.get('/spots', adminController.getAllSpots);

module.exports = router;
