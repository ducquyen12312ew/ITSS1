const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/reviews
 * Tạo review mới
 * Body: { spot_id, rating (1-5), comment (max 140), facilities_check (JSON), image_url }
 */
router.post('/', authenticateToken, reviewsController.createReview);

/**
 * GET /api/reviews/user/:userId
 * Lấy tất cả reviews của một user
 */
router.get('/user/:userId', authenticateToken, reviewsController.getUserReviews);

/**
 * GET /api/reviews/:reviewId
 * Lấy chi tiết một review
 */
router.get('/:reviewId', reviewsController.getReviewById);

/**
 * PUT /api/reviews/:reviewId
 * Cập nhật review
 * Body: { rating, comment, facilities_check, image_url }
 */
router.put('/:reviewId', authenticateToken, reviewsController.updateReview);

/**
 * DELETE /api/reviews/:reviewId
 * Xóa review (hard delete) hoặc ẩn (soft delete với ?soft_delete=true)
 */
router.delete('/:reviewId', authenticateToken, reviewsController.deleteReview);

/**
 * POST /api/reviews/:reviewId/report
 * Báo cáo review (spam, inappropriate)
 */
router.post('/:reviewId/report', authenticateToken, reviewsController.reportReview);

module.exports = router;
