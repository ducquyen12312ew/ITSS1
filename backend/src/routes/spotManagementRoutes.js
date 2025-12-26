/**
 * Spot Management Routes (Admin Only)
 * 
 * Routes cho chức năng thêm/chỉnh sửa địa điểm đơn giản
 */

const express = require('express');
const router = express.Router();
const spotManagementController = require('../controllers/spotManagementController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require Admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/spot-management
 * Lấy danh sách tất cả spots
 */
router.get('/', spotManagementController.getAllSpots);

/**
 * POST /api/admin/spot-management
 * Tạo spot mới (đơn giản)
 */
router.post('/', spotManagementController.createSpot);

/**
 * PUT /api/admin/spot-management/:spotId
 * Chỉnh sửa spot
 */
router.put('/:spotId', spotManagementController.updateSpot);

/**
 * GET /api/admin/spot-management/:spotId/preview
 * Preview spot trước khi publish
 */
router.get('/:spotId/preview', spotManagementController.previewSpot);

/**
 * POST /api/admin/spot-management/:spotId/publish
 * Publish spot từ DRAFT → PUBLIC
 */
router.post('/:spotId/publish', spotManagementController.publishSpot);

/**
 * DELETE /api/admin/spot-management/:spotId/images/:imageId
 * Xóa hình ảnh của spot
 */
router.delete('/:spotId/images/:imageId', spotManagementController.deleteSpotImage);

module.exports = router;
