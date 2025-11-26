/**
 * Kids Swipe Routes - API cho tính năng swipe của trẻ em
 */

const express = require('express');
const router = express.Router();
const kidsSwipeController = require('../controllers/kidsSwipeController');
const { authenticateToken } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authentication
router.use(authenticateToken);

/**
 * POST /api/kids-swipe/:childId/swipe
 * Child swipe một spot (LIKE hoặc SKIP)
 * Body: { spot_id, action }
 */
router.post('/:childId/swipe', kidsSwipeController.swipeSpot);

/**
 * GET /api/kids-swipe/:childId/preferences
 * Lấy danh sách tags mà child thích
 */
router.get('/:childId/preferences', kidsSwipeController.getChildPreferences);

/**
 * GET /api/kids-swipe/:childId/recommendations
 * Gợi ý spots dựa trên preferences của child
 * Query params: limit, offset, min_match, lat, lng, distance
 */
router.get('/:childId/recommendations', kidsSwipeController.getRecommendations);

/**
 * GET /api/kids-swipe/:childId/spots
 * Lấy danh sách địa điểm chưa swipe để hiển thị
 * Query params: limit, offset, category, lat, lng, distance
 */
router.get('/:childId/spots', kidsSwipeController.getSpotsForSwipe);

/**
 * GET /api/kids-swipe/:childId/favorites
 * Lấy danh sách spots mà child đã LIKE
 */
router.get('/:childId/favorites', kidsSwipeController.getKidFavorites);

/**
 * DELETE /api/kids-swipe/:childId/swipe/:spotId
 * Xóa swipe của trẻ
 */
router.delete('/:childId/swipe/:spotId', kidsSwipeController.deleteKidSwipe);

module.exports = router;
