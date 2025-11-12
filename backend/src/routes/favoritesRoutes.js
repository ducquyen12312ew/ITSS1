/**
 * Favorites Routes - Định tuyến cho API yêu thích
 */

const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { authenticateToken } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authentication
router.use(authenticateToken);

/**
 * GET /api/favorites
 * Lấy danh sách tất cả favorites của user
 * Query params: collection_tag, limit, offset
 */
router.get('/', favoritesController.getFavorites);

/**
 * GET /api/favorites/collections
 * Lấy danh sách các collection_tag đã dùng
 */
router.get('/collections', favoritesController.getCollections);

/**
 * GET /api/favorites/check/:spotId
 * Kiểm tra xem spot có được yêu thích chưa
 */
router.get('/check/:spotId', favoritesController.checkFavorite);

/**
 * POST /api/favorites
 * Thêm spot vào favorites
 * Body: { spot_id, collection_tag }
 */
router.post('/', favoritesController.addFavorite);

/**
 * PUT /api/favorites/:id
 * Cập nhật collection_tag
 * Body: { collection_tag }
 */
router.put('/:id', favoritesController.updateFavorite);

/**
 * DELETE /api/favorites/:id
 * Xóa favorite theo favorite_id
 */
router.delete('/:id', favoritesController.deleteFavorite);

/**
 * DELETE /api/favorites/spot/:spotId
 * Xóa favorite theo spot_id (Toggle button)
 */
router.delete('/spot/:spotId', favoritesController.deleteFavoriteBySpotId);

module.exports = router;
