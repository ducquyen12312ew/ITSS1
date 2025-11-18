const db = require('../database/db');

/**
 * POST /api/reviews
 * Tạo review mới cho một spot
 * 
 * Body:
 * - spot_id: INT (required)
 * - rating: INT 1-5 (required)
 * - comment: TEXT (optional, max 140 chars)
 * - facilities_check: JSON (optional) - Amenities: {"clean": true, "kid_toilet": true, "stroller_friendly": true}
 * - image_url: VARCHAR (optional)
 */
const createReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { spot_id, rating, comment, facilities_check, image_url } = req.body;

    // Validation
    if (!spot_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'spot_id và rating là bắt buộc'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating phải từ 1 đến 5 sao'
      });
    }

    // Validate comment length (max 140 chars)
    if (comment && comment.length > 140) {
      return res.status(400).json({
        success: false,
        message: 'Comment không được quá 140 ký tự'
      });
    }

    // Check if spot exists and is PUBLIC
    const spotCheck = await db.query(
      'SELECT spot_id, status FROM spots WHERE spot_id = ?',
      [spot_id]
    );

    if (spotCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    if (spotCheck[0].status !== 'PUBLIC') {
      return res.status(400).json({
        success: false,
        message: 'Không thể đánh giá địa điểm này'
      });
    }

    // Note: User có thể review cùng 1 spot nhiều lần (ví dụ: đi lại nhiều lần)
    // Không cần check duplicate review

    // Parse facilities_check if provided as string
    let facilitiesData = null;
    if (facilities_check) {
      try {
        facilitiesData = typeof facilities_check === 'string' 
          ? JSON.parse(facilities_check) 
          : facilities_check;
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'facilities_check phải là JSON hợp lệ'
        });
      }
    }

    // Insert review
    const insertQuery = `
      INSERT INTO reviews (spot_id, user_id, rating, comment, image_url, facilities_check)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(insertQuery, [
      spot_id,
      userId,
      rating,
      comment || null,
      image_url || null,
      facilitiesData ? JSON.stringify(facilitiesData) : null
    ]);

    const reviewId = result.insertId;

    // Get created review with spot info
    const reviewQuery = `
      SELECT 
        r.review_id,
        r.spot_id,
        r.user_id,
        r.rating,
        r.comment,
        r.image_url,
        r.facilities_check,
        r.created_at,
        s.name as spot_name,
        s.category,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email
      FROM reviews r
      INNER JOIN spots s ON r.spot_id = s.spot_id
      INNER JOIN users u ON r.user_id = u.user_id
      WHERE r.review_id = ?
    `;

    const createdReview = await db.query(reviewQuery, [reviewId]);

    // Parse facilities_check back to object
    if (createdReview[0].facilities_check) {
      try {
        createdReview[0].facilities_check = JSON.parse(createdReview[0].facilities_check);
      } catch (e) {
        // Keep as string if parse fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Đã đăng review thành công',
      data: createdReview[0]
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo review',
      error: error.message
    });
  }
};

/**
 * GET /api/reviews/user/:userId
 * Lấy tất cả reviews của một user (optional: chỉ user hoặc admin)
 */
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const userRole = req.user.role;

    // Only allow user to see their own reviews, or admin can see all
    if (userId != currentUserId && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem reviews của user khác'
      });
    }

    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Get total count
    const countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE user_id = ? AND is_hidden = FALSE';
    const countResult = await db.query(countQuery, [userId]);
    const total = countResult[0].total;

    // Get reviews
    const reviewsQuery = `
      SELECT 
        r.review_id,
        r.spot_id,
        r.rating,
        r.comment,
        r.image_url,
        r.facilities_check,
        r.created_at,
        r.updated_at,
        s.name as spot_name,
        s.category,
        s.address,
        s.price_range,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as spot_main_image
      FROM reviews r
      INNER JOIN spots s ON r.spot_id = s.spot_id
      WHERE r.user_id = ? AND r.is_hidden = FALSE
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const reviews = await db.query(reviewsQuery, [userId, limit, offset]);

    // Parse facilities_check
    reviews.forEach(review => {
      if (review.facilities_check) {
        try {
          review.facilities_check = JSON.parse(review.facilities_check);
        } catch (e) {
          // Keep as string
        }
      }
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách reviews',
      error: error.message
    });
  }
};

/**
 * GET /api/reviews/:reviewId
 * Lấy chi tiết một review
 */
const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const reviewQuery = `
      SELECT 
        r.review_id,
        r.spot_id,
        r.user_id,
        r.rating,
        r.comment,
        r.image_url,
        r.facilities_check,
        r.report_count,
        r.is_hidden,
        r.created_at,
        r.updated_at,
        s.name as spot_name,
        s.category,
        s.address,
        s.latitude,
        s.longitude,
        s.price_range,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as spot_main_image
      FROM reviews r
      INNER JOIN spots s ON r.spot_id = s.spot_id
      INNER JOIN users u ON r.user_id = u.user_id
      WHERE r.review_id = ?
    `;

    const result = await db.query(reviewQuery, [reviewId]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    const review = result[0];

    // Parse facilities_check
    if (review.facilities_check) {
      try {
        review.facilities_check = JSON.parse(review.facilities_check);
      } catch (e) {
        // Keep as string
      }
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Error getting review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy review',
      error: error.message
    });
  }
};

/**
 * PUT /api/reviews/:reviewId
 * Cập nhật review của user
 * 
 * Body (all optional):
 * - rating: INT 1-5
 * - comment: TEXT (max 140 chars)
 * - facilities_check: JSON
 * - image_url: VARCHAR
 */
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    const { rating, comment, facilities_check, image_url } = req.body;

    // Check if review exists and belongs to user
    const existingReview = await db.query(
      'SELECT review_id, user_id FROM reviews WHERE review_id = ?',
      [reviewId]
    );

    if (existingReview.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    if (existingReview[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật review này'
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating phải từ 1 đến 5 sao'
      });
    }

    // Validate comment length if provided
    if (comment !== undefined && comment !== null && comment.length > 140) {
      return res.status(400).json({
        success: false,
        message: 'Comment không được quá 140 ký tự'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (rating !== undefined) {
      updates.push('rating = ?');
      values.push(rating);
    }

    if (comment !== undefined) {
      updates.push('comment = ?');
      values.push(comment);
    }

    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }

    if (facilities_check !== undefined) {
      let facilitiesData = null;
      if (facilities_check) {
        try {
          facilitiesData = typeof facilities_check === 'string' 
            ? JSON.parse(facilities_check) 
            : facilities_check;
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: 'facilities_check phải là JSON hợp lệ'
          });
        }
      }
      updates.push('facilities_check = ?');
      values.push(facilitiesData ? JSON.stringify(facilitiesData) : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có gì để cập nhật'
      });
    }

    // Add updated_at
    updates.push('updated_at = NOW()');
    values.push(reviewId);

    const updateQuery = `UPDATE reviews SET ${updates.join(', ')} WHERE review_id = ?`;
    await db.query(updateQuery, values);

    // Get updated review
    const reviewQuery = `
      SELECT 
        r.review_id,
        r.spot_id,
        r.rating,
        r.comment,
        r.image_url,
        r.facilities_check,
        r.created_at,
        r.updated_at,
        s.name as spot_name,
        s.category,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM reviews r
      INNER JOIN spots s ON r.spot_id = s.spot_id
      INNER JOIN users u ON r.user_id = u.user_id
      WHERE r.review_id = ?
    `;

    const updatedReview = await db.query(reviewQuery, [reviewId]);

    // Parse facilities_check
    if (updatedReview[0].facilities_check) {
      try {
        updatedReview[0].facilities_check = JSON.parse(updatedReview[0].facilities_check);
      } catch (e) {
        // Keep as string
      }
    }

    res.json({
      success: true,
      message: 'Đã cập nhật review thành công',
      data: updatedReview[0]
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật review',
      error: error.message
    });
  }
};

/**
 * DELETE /api/reviews/:reviewId
 * Xóa review của user
 * 
 * Query params:
 * - soft_delete=true: Đánh dấu is_hidden = TRUE thay vì xóa hoàn toàn
 */
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const softDelete = req.query.soft_delete === 'true';

    // Check if review exists
    const existingReview = await db.query(
      'SELECT review_id, user_id FROM reviews WHERE review_id = ?',
      [reviewId]
    );

    if (existingReview.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    // Check permission: user can delete their own review, admin can delete any
    if (existingReview[0].user_id !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa review này'
      });
    }

    if (softDelete) {
      // Soft delete: Set is_hidden = TRUE
      await db.query(
        'UPDATE reviews SET is_hidden = TRUE, updated_at = NOW() WHERE review_id = ?',
        [reviewId]
      );

      res.json({
        success: true,
        message: 'Đã ẩn review'
      });
    } else {
      // Hard delete: Remove from database
      await db.query('DELETE FROM reviews WHERE review_id = ?', [reviewId]);

      res.json({
        success: true,
        message: 'Đã xóa review'
      });
    }

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa review',
      error: error.message
    });
  }
};

/**
 * POST /api/reviews/:reviewId/report
 * Report một review (spam, inappropriate, etc.)
 */
const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    // Check if review exists
    const review = await db.query(
      'SELECT review_id, report_count FROM reviews WHERE review_id = ?',
      [reviewId]
    );

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    // Increment report_count
    await db.query(
      'UPDATE reviews SET report_count = report_count + 1 WHERE review_id = ?',
      [reviewId]
    );

    // Auto-hide if report_count >= 5
    const newReportCount = review[0].report_count + 1;
    if (newReportCount >= 5) {
      await db.query(
        'UPDATE reviews SET is_hidden = TRUE WHERE review_id = ?',
        [reviewId]
      );
    }

    res.json({
      success: true,
      message: 'Đã báo cáo review',
      data: {
        report_count: newReportCount,
        auto_hidden: newReportCount >= 5
      }
    });

  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi báo cáo review',
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  reportReview
};
