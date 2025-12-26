/**
 * Spot Management Controller (Admin Only)
 * 
 * Chức năng thêm/chỉnh sửa địa điểm đơn giản
 * 
 * Features:
 * - Tạo/sửa spot đơn giản (name, google_maps_url, image_url)
 * - Checkbox "đã kiểm tra tiêu chuẩn đăng bài" (bắt buộc)
 * - Preview và Submit
 * - Validation: tên không chứa ký tự đặc biệt
 */

const db = require('../database/db');

/**
 * GET /api/admin/spot-management
 * 
 * Lấy danh sách tất cả spots cho admin
 * 
 * Returns: List of all spots with images
 */
const getAllSpots = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        (SELECT GROUP_CONCAT(image_url) FROM spot_images WHERE spot_id = s.spot_id) as images,
        COUNT(DISTINCT r.review_id) as review_count,
        AVG(r.rating) as average_rating,
        COUNT(DISTINCT f.favorite_id) as favorite_count
      FROM spots s
      LEFT JOIN reviews r ON s.spot_id = r.spot_id
      LEFT JOIN favorites f ON s.spot_id = f.spot_id
      GROUP BY s.spot_id
      ORDER BY s.created_at DESC
    `;

    const spots = await db.query(query);

    // Convert images from comma-separated string to array
    spots.forEach(spot => {
      if (spot.images) {
        spot.images = spot.images.split(',');
      } else {
        spot.images = [];
      }
      spot.average_rating = spot.average_rating ? parseFloat(spot.average_rating).toFixed(1) : '0.0';
    });

    res.json({
      success: true,
      data: {
        spots,
        total: spots.length
      }
    });

  } catch (error) {
    console.error('Get all spots error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách địa điểm',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/spot-management
 * Tạo spot mới (đơn giản)
 * Body: name, google_maps_url, image_url, standards_checked
 */
const createSpot = async (req, res) => {
  try {
    const {
      name,
      google_maps_url,
      image_url,
      standards_checked
    } = req.body;

    // Validation 1: Name is required
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Tên địa điểm là bắt buộc'
      });
    }

    // Validation 2: Name không chứa ký tự đặc biệt
    const specialCharPattern = /[!@#$%^&*+=\[\]{};':"\\|,.<>/?~`]/;
    if (specialCharPattern.test(name)) {
      return res.status(400).json({
        success: false,
        message: 'Tên địa điểm không được chứa ký tự đặc biệt'
      });
    }

    // Validation 3: Standards checked là bắt buộc
    if (!standards_checked || standards_checked !== true) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải xác nhận đã kiểm tra tiêu chuẩn đăng bài'
      });
    }

    // Create spot
    const query = `
      INSERT INTO spots (
        name,
        google_maps_url,
        status,
        created_by_admin_id,
        created_at,
        updated_at
      ) VALUES (?, ?, 'DRAFT', ?, NOW(), NOW())
    `;

    const result = await db.query(query, [
      name.trim(),
      google_maps_url || null,
      req.user.userId
    ]);

    const spotId = result.insertId;

    // Add image if provided
    if (image_url) {
      await db.query(
        'INSERT INTO spot_images (spot_id, image_url, is_main, display_order) VALUES (?, ?, true, 1)',
        [spotId, image_url]
      );
    }

    // Get created spot
    const createdSpot = await getSpotWithDetails(spotId);

    res.status(201).json({
      success: true,
      message: 'Đã tạo địa điểm thành công',
      data: { spot: createdSpot }
    });

  } catch (error) {
    console.error('Create spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo địa điểm',
      error: error.message
    });
  }
};

/**
 * PUT /api/admin/spot-management/:spotId
 * Cập nhật spot (đơn giản)
 * Body: name, google_maps_url, image_url, standards_checked
 */
const updateSpot = async (req, res) => {
  try {
    const { spotId } = req.params;
    const {
      name,
      google_maps_url,
      image_url,
      standards_checked
    } = req.body;

    // Check if spot exists
    const existingSpots = await db.query('SELECT spot_id FROM spots WHERE spot_id = ?', [spotId]);
    if (!existingSpots || existingSpots.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    // Validation 1: Name is required
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Tên địa điểm là bắt buộc'
      });
    }

    // Validation 2: Name không chứa ký tự đặc biệt
    const specialCharPattern = /[!@#$%^&*+=\[\]{};':"\\|,.<>/?~`]/;
    if (specialCharPattern.test(name)) {
      return res.status(400).json({
        success: false,
        message: 'Tên địa điểm không được chứa ký tự đặc biệt'
      });
    }

    // Validation 3: Standards checked là bắt buộc
    if (!standards_checked || standards_checked !== true) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải xác nhận đã kiểm tra tiêu chuẩn đăng bài'
      });
    }

    // Update spot
    const updateQuery = `
      UPDATE spots
      SET 
        name = ?,
        google_maps_url = ?,
        updated_at = NOW()
      WHERE spot_id = ?
    `;

    await db.query(updateQuery, [
      name.trim(),
      google_maps_url || null,
      spotId
    ]);

    // Update image if provided
    if (image_url) {
      // Delete old images
      await db.query('DELETE FROM spot_images WHERE spot_id = ?', [spotId]);
      // Add new image
      await db.query(
        'INSERT INTO spot_images (spot_id, image_url, is_main, display_order) VALUES (?, ?, true, 1)',
        [spotId, image_url]
      );
    }

    // Get updated spot
    const updatedSpot = await getSpotWithDetails(spotId);

    res.json({
      success: true,
      message: 'Đã cập nhật địa điểm thành công',
      data: { spot: updatedSpot }
    });

  } catch (error) {
    console.error('Update spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật địa điểm',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/spot-management/:spotId/preview
 * 
 * Preview spot trước khi publish
 * 
 * Returns: Spot info for preview
 */
const previewSpot = async (req, res) => {
  try {
    const { spotId } = req.params;

    // Get spot info
    const spotQuery = 'SELECT * FROM spots WHERE spot_id = ?';
    const spots = await db.query(spotQuery, [spotId]);

    if (!spots || spots.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    const spot = spots[0];

    // Get images separately
    const imagesQuery = 'SELECT image_url, display_order FROM spot_images WHERE spot_id = ? ORDER BY display_order';
    const images = await db.query(imagesQuery, [spotId]);

    // Get tags separately
    const tagsQuery = 'SELECT tag_name FROM spot_tags WHERE spot_id = ?';
    const tags = await db.query(tagsQuery, [spotId]);

    // Parse JSON fields
    spot.images = images || [];
    spot.tags = tags ? tags.map(t => t.tag_name) : [];
    spot.facilities = spot.facilities ? JSON.parse(spot.facilities) : {};
    spot.operating_hours = spot.operating_hours ? JSON.parse(spot.operating_hours) : {};

    res.json({
      success: true,
      data: {
        spot,
        preview_mode: true,
        can_publish: spot.status === 'DRAFT'
      }
    });

  } catch (error) {
    console.error('Preview spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xem trước địa điểm',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/spot-management/:spotId/publish
 * 
 * Publish spot từ DRAFT → PUBLIC
 * 
 * Returns: Success message
 */
const publishSpot = async (req, res) => {
  try {
    const { spotId } = req.params;

    // Check if spot exists and is DRAFT
    const checkQuery = 'SELECT spot_id, status, name FROM spots WHERE spot_id = ?';
    const spots = await db.query(checkQuery, [spotId]);

    if (!spots || spots.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    if (spots[0].status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể publish địa điểm ở trạng thái DRAFT'
      });
    }

    // Update status to PUBLIC
    const updateQuery = `
      UPDATE spots
      SET status = 'PUBLIC', updated_at = NOW()
      WHERE spot_id = ?
    `;
    await db.query(updateQuery, [spotId]);

    res.json({
      success: true,
      message: `Đã publish địa điểm "${spots[0].name}" thành công`,
      data: {
        spot_id: spotId,
        status: 'PUBLIC'
      }
    });

  } catch (error) {
    console.error('Publish spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi publish địa điểm',
      error: error.message
    });
  }
};

/**
 * DELETE /api/admin/spot-management/:spotId/images/:imageId
 * 
 * Xóa hình ảnh của spot
 * 
 * Returns: Success message
 */
const deleteSpotImage = async (req, res) => {
  try {
    const { spotId, imageId } = req.params;

    // Check if image exists
    const checkQuery = 'SELECT image_id, spot_id FROM spot_images WHERE image_id = ? AND spot_id = ?';
    const images = await db.query(checkQuery, [imageId, spotId]);

    if (!images || images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hình ảnh'
      });
    }

    // Delete image
    const deleteQuery = 'DELETE FROM spot_images WHERE image_id = ?';
    await db.query(deleteQuery, [imageId]);

    res.json({
      success: true,
      message: 'Đã xóa hình ảnh thành công'
    });

  } catch (error) {
    console.error('Delete spot image error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hình ảnh',
      error: error.message
    });
  }
};

/**
 * Helper function: Get spot with all details
 */
const getSpotWithDetails = async (spotId) => {
  const spotQuery = 'SELECT * FROM spots WHERE spot_id = ?';
  const spots = await db.query(spotQuery, [spotId]);
  
  if (!spots || spots.length === 0) {
    return null;
  }

  const spot = spots[0];

  // Get images
  const images = await db.query(
    'SELECT image_id, image_url, is_main, display_order FROM spot_images WHERE spot_id = ? ORDER BY display_order',
    [spotId]
  );
  spot.images = images || [];

  // Get tags
  const tags = await db.query(
    'SELECT tag_id, tag_name FROM spot_tags WHERE spot_id = ?',
    [spotId]
  );
  spot.tags = tags ? tags.map(t => t.tag_name) : [];

  // Parse JSON fields
  if (spot.operating_hours && typeof spot.operating_hours === 'string') {
    try {
      spot.operating_hours = JSON.parse(spot.operating_hours);
    } catch (e) {
      spot.operating_hours = null;
    }
  }

  if (spot.facilities && typeof spot.facilities === 'string') {
    try {
      spot.facilities = JSON.parse(spot.facilities);
    } catch (e) {
      spot.facilities = null;
    }
  }

  return spot;
};

module.exports = {
  getAllSpots,
  createSpot,
  updateSpot,
  previewSpot,
  publishSpot,
  deleteSpotImage
};
