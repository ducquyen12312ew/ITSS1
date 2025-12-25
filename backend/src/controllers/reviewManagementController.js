/**
 * Review Management Controller (Admin Only)
 * 
 * Quản lý tập trung tất cả reviews - phát hiện nội dung không phù hợp
 * 
 * Features:
 * - Xem danh sách tất cả reviews (kể cả hidden)
 * - Filter theo rating, status, date range
 * - Toggle public/hidden status
 * - Xem chi tiết review với full info
 * - Xóa review không phù hợp
 * - Statistics: total reviews, rating distribution
 */

const db = require('../database/db');

/**
 * GET /api/admin/review-management
 * 
 * Danh sách tất cả reviews với filtering
 * 
 * Query params:
 * - rating: 1-5 (filter by rating)
 * - status: 'public' | 'hidden' | 'all' (default: all)
 * - spot_id: Filter by spot
 * - user_id: Filter by user
 * - has_image: true/false (có ảnh hay không)
 * - date_from, date_to: Date range filter
 * - sort: 'latest' | 'oldest' | 'rating_high' | 'rating_low' (default: latest)
 * - limit, offset: Pagination
 * 
 * Returns: Reviews list với user info, spot info, stats
 */
const getAllReviews = async (req, res) => {
  try {
    const {
      rating,
      status = 'all',
      spot_id,
      user_id,
      has_image,
      date_from,
      date_to,
      sort = 'latest',
      limit = 20,
      offset = 0
    } = req.query;

    // Build WHERE conditions
    const conditions = [];
    const params = [];

    // Filter by rating
    if (rating) {
      conditions.push('r.rating = ?');
      params.push(parseInt(rating));
    }

    // Filter by status
    if (status === 'public') {
      conditions.push('r.is_hidden = FALSE');
    } else if (status === 'hidden') {
      conditions.push('r.is_hidden = TRUE');
    }
    // 'all' = no filter

    // Filter by spot
    if (spot_id) {
      conditions.push('r.spot_id = ?');
      params.push(parseInt(spot_id));
    }

    // Filter by user
    if (user_id) {
      conditions.push('r.user_id = ?');
      params.push(parseInt(user_id));
    }

    // Filter by has_image
    if (has_image === 'true') {
      conditions.push('r.image_url IS NOT NULL');
    } else if (has_image === 'false') {
      conditions.push('r.image_url IS NULL');
    }

    // Filter by date range
    if (date_from) {
      conditions.push('DATE(r.created_at) >= ?');
      params.push(date_from);
    }
    if (date_to) {
      conditions.push('DATE(r.created_at) <= ?');
      params.push(date_to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Determine sort order
    let orderBy = 'r.created_at DESC'; // latest
    if (sort === 'oldest') {
      orderBy = 'r.created_at ASC';
    } else if (sort === 'rating_high') {
      orderBy = 'r.rating DESC, r.created_at DESC';
    } else if (sort === 'rating_low') {
      orderBy = 'r.rating ASC, r.created_at DESC';
    }

    // Get reviews with user and spot info
    const query = `
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email,
        s.name as spot_name,
        s.average_rating as spot_average_rating
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      JOIN spots s ON r.spot_id = s.spot_id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));
    const reviews = await db.query(query, params);

    // Parse JSON fields
    reviews.forEach(review => {
      review.facilities_check = review.facilities_check ? JSON.parse(review.facilities_check) : {};
    });

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      ${whereClause}
    `;
    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await db.query(countQuery, countParams);

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_reviews,
        SUM(CASE WHEN is_hidden = FALSE THEN 1 ELSE 0 END) as public_reviews,
        SUM(CASE WHEN is_hidden = TRUE THEN 1 ELSE 0 END) as hidden_reviews,
        SUM(CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END) as reviews_with_image,
        SUM(CASE WHEN report_count > 0 THEN 1 ELSE 0 END) as reported_reviews,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5_count,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4_count,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3_count,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2_count,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1_count
      FROM reviews r
      ${whereClause}
    `;
    const statsResult = await db.query(statsQuery, countParams);

    res.json({
      success: true,
      data: {
        reviews,
        statistics: {
          total_reviews: statsResult[0].total_reviews || 0,
          public_reviews: statsResult[0].public_reviews || 0,
          hidden_reviews: statsResult[0].hidden_reviews || 0,
          reviews_with_image: statsResult[0].reviews_with_image || 0,
          reported_reviews: statsResult[0].reported_reviews || 0,
          average_rating: statsResult[0].average_rating ? parseFloat(Number(statsResult[0].average_rating).toFixed(2)) : 0,
          rating_distribution: {
            5: statsResult[0].rating_5_count || 0,
            4: statsResult[0].rating_4_count || 0,
            3: statsResult[0].rating_3_count || 0,
            2: statsResult[0].rating_2_count || 0,
            1: statsResult[0].rating_1_count || 0
          }
        },
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + reviews.length) < countResult[0].total
        },
        filters_applied: {
          rating,
          status,
          spot_id,
          user_id,
          has_image,
          date_from,
          date_to,
          sort
        }
      }
    });

  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách reviews',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/review-management/:reviewId
 * 
 * Chi tiết review với full info
 * 
 * Returns: Review detail + user history + spot info
 */
const getReviewDetail = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Get review detail
    const reviewQuery = `
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email,
        u.created_at as user_registered_at,
        s.name as spot_name,
        s.address as spot_address,
        s.average_rating as spot_average_rating,
        s.review_count as spot_review_count
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      JOIN spots s ON r.spot_id = s.spot_id
      WHERE r.review_id = ?
    `;

    const reviews = await db.query(reviewQuery, [reviewId]);

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    const review = reviews[0];

    // Parse JSON
    review.facilities_check = review.facilities_check ? JSON.parse(review.facilities_check) : {};

    // Get user's other reviews
    const userReviewsQuery = `
      SELECT 
        r.review_id,
        r.spot_id,
        s.name as spot_name,
        r.rating,
        r.created_at
      FROM reviews r
      JOIN spots s ON r.spot_id = s.spot_id
      WHERE r.user_id = ? AND r.review_id != ?
      ORDER BY r.created_at DESC
      LIMIT 5
    `;
    const userOtherReviews = await db.query(userReviewsQuery, [review.user_id, reviewId]);

    // Get report history if any
    const reportHistoryQuery = `
      SELECT 
        report_count,
        updated_at as last_updated
      FROM reviews
      WHERE review_id = ? AND report_count > 0
    `;
    const reportHistory = await db.query(reportHistoryQuery, [reviewId]);

    res.json({
      success: true,
      data: {
        review,
        user_other_reviews: userOtherReviews,
        report_history: reportHistory[0] || null
      }
    });

  } catch (error) {
    console.error('Get review detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết review',
      error: error.message
    });
  }
};

/**
 * PATCH /api/admin/review-management/:reviewId/toggle-status
 * 
 * Toggle public/hidden status
 * 
 * Body: { is_hidden: true/false }
 * 
 * Returns: Updated review
 */
const toggleReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { is_hidden } = req.body;

    if (typeof is_hidden !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_hidden phải là boolean (true hoặc false)'
      });
    }

    // Check if review exists
    const checkQuery = 'SELECT review_id, is_hidden FROM reviews WHERE review_id = ?';
    const existingReviews = await db.query(checkQuery, [reviewId]);

    if (!existingReviews || existingReviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    // Update status
    const updateQuery = `
      UPDATE reviews
      SET is_hidden = ?, updated_at = NOW()
      WHERE review_id = ?
    `;
    await db.query(updateQuery, [is_hidden, reviewId]);

    res.json({
      success: true,
      message: is_hidden ? 'Đã ẩn review' : 'Đã công khai review',
      data: {
        review_id: parseInt(reviewId),
        is_hidden,
        status: is_hidden ? 'hidden' : 'public'
      }
    });

  } catch (error) {
    console.error('Toggle review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi trạng thái review',
      error: error.message
    });
  }
};

/**
 * DELETE /api/admin/review-management/:reviewId
 * 
 * Xóa review không phù hợp (hard delete)
 * 
 * Returns: Success message
 */
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists
    const checkQuery = 'SELECT review_id, spot_id FROM reviews WHERE review_id = ?';
    const existingReviews = await db.query(checkQuery, [reviewId]);

    if (!existingReviews || existingReviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    const spotId = existingReviews[0].spot_id;

    // Delete review (CASCADE will handle related data)
    const deleteQuery = 'DELETE FROM reviews WHERE review_id = ?';
    await db.query(deleteQuery, [reviewId]);

    // Update spot statistics
    const updateStatsQuery = `
      UPDATE spots
      SET 
        review_count = (SELECT COUNT(*) FROM reviews WHERE spot_id = ? AND is_hidden = FALSE),
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE spot_id = ? AND is_hidden = FALSE),
        updated_at = NOW()
      WHERE spot_id = ?
    `;
    await db.query(updateStatsQuery, [spotId, spotId, spotId]);

    res.json({
      success: true,
      message: 'Đã xóa review thành công'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa review',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/review-management/:reviewId/reset-reports
 * 
 * Reset report count (sau khi admin đã kiểm tra)
 * 
 * Returns: Success message
 */
const resetReportCount = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists
    const checkQuery = 'SELECT review_id FROM reviews WHERE review_id = ?';
    const existingReviews = await db.query(checkQuery, [reviewId]);

    if (!existingReviews || existingReviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    // Reset report count
    const updateQuery = `
      UPDATE reviews
      SET report_count = 0, updated_at = NOW()
      WHERE review_id = ?
    `;
    await db.query(updateQuery, [reviewId]);

    res.json({
      success: true,
      message: 'Đã reset report count'
    });

  } catch (error) {
    console.error('Reset report count error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi reset report count',
      error: error.message
    });
  }
};

module.exports = {
  getAllReviews,
  getReviewDetail,
  toggleReviewStatus,
  deleteReview,
  resetReportCount
};
