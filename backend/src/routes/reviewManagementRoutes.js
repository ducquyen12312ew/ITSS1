/**
 * Review Management Routes (Admin Only)
 * 
 * Routes cho quản lý reviews tập trung
 */

const express = require('express');
const router = express.Router();
const reviewManagementController = require('../controllers/reviewManagementController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require Admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/review-management
 * Danh sách tất cả reviews với filtering
 */
router.get('/', reviewManagementController.getAllReviews);

/**
 * GET /api/admin/review-management/:reviewId
 * Chi tiết review
 */
router.get('/:reviewId', reviewManagementController.getReviewDetail);

/**
 * PATCH /api/admin/review-management/:reviewId/toggle-status
 * Toggle public/hidden status
 */
router.patch('/:reviewId/toggle-status', reviewManagementController.toggleReviewStatus);

/**
 * POST /api/admin/review-management/:reviewId/reset-reports
 * Reset report count
 */
router.post('/:reviewId/reset-reports', reviewManagementController.resetReportCount);

/**
 * DELETE /api/admin/review-management/:reviewId
 * Xóa review
 */
router.delete('/:reviewId', reviewManagementController.deleteReview);

module.exports = router;
