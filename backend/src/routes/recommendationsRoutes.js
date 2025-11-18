/**
 * Smart Recommendations Routes
 * 
 * Gợi ý thông minh dựa trên location, weather, child profile, favorites
 */

const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/recommendations
 * 
 * Smart recommendations với filters:
 * - child_id: Lọc theo child (age + preferences)
 * - lat, lng: Vị trí (required)
 * - distance: Khoảng cách tối đa (km)
 * - weather: RAIN, SUNNY, HOT
 * - rain_ok: true/false - Chỉ indoor/rain-friendly
 * - open_now: true/false - Đang mở cửa
 * - limit, offset: Pagination
 * 
 * Auth: Optional (better recommendations if authenticated)
 */
router.get('/', authenticateToken, recommendationsController.getSmartRecommendations);

/**
 * GET /api/recommendations/weather-alternatives
 * 
 * Gợi ý thay thế khi thời tiết xấu
 * Ưu tiên indoor spots gần nhất
 * 
 * Query: lat, lng, distance, limit
 * Auth: Optional
 */
router.get('/weather-alternatives', authenticateToken, recommendationsController.getWeatherAlternatives);

module.exports = router;
