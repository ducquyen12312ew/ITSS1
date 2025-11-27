/**
 * Spots Routes - Định tuyến cho API địa điểm
 */

const express = require('express');
const router = express.Router();
const spotsController = require('../controllers/spotsController');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (Không cần đăng nhập)
// ============================================

/**
 * GET /api/spots/search
 * Tìm kiếm địa điểm với filters và sorting
 * Query params: keyword, category, min_age, max_age, price_range, is_indoor, weather, min_rating, lat, lng, distance, sort, limit, offset
 * Uses optionalAuth to enable age-based sorting for logged-in users
 */
router.get('/search', optionalAuth, spotsController.searchSpots);

/**
 * GET /api/spots/suggestions
 * Autocomplete suggestions khi user gõ
 * Query params: keyword
 */
router.get('/suggestions', spotsController.getSearchSuggestions);

/**
 * GET /api/spots/:id/reviews
 * Lấy danh sách reviews của địa điểm
 * Query params: limit, offset, sort (newest|oldest|highest_rating|lowest_rating|most_helpful)
 * ⚠️ PHẢI ĐẶT TRƯỚC /:id ĐỂ TRÁNH CONFLICT
 */
router.get('/:id/reviews', spotsController.getSpotReviews);

/**
 * GET /api/spots/:id
 * Lấy chi tiết 1 địa điểm
 */
router.get('/:id', spotsController.getSpotById);

// ============================================
// ADMIN ROUTES (Chỉ admin mới được)
// ============================================

/**
 * POST /api/spots
 * Tạo địa điểm mới (Admin only)
 */
// router.post('/', authenticateToken, requireAdmin, spotsController.createSpot);

/**
 * PUT /api/spots/:id
 * Cập nhật địa điểm (Admin only)
 */
// router.put('/:id', authenticateToken, requireAdmin, spotsController.updateSpot);

/**
 * DELETE /api/spots/:id
 * Xóa địa điểm (Admin only)
 */
// router.delete('/:id', authenticateToken, requireAdmin, spotsController.deleteSpot);

module.exports = router;
