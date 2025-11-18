/**
 * Spot Management Controller (Admin Only)
 * 
 * Chức năng thêm/chỉnh sửa địa điểm đơn giản cho Admin
 * 
 * Features:
 * - Tạo spot mới
 * - Chỉnh sửa spot
 * - Preview trước khi publish
 * - Upload hình ảnh
 * 
 * Validation:
 * - Tên spot: required, không chứa ký tự đặc biệt
 * - Checkbox "đã kiểm tra tiêu chuẩn đăng bài": required
 */

const db = require('../database/db');

/**
 * POST /api/admin/spot-management
 * 
 * Tạo spot mới (đơn giản)
 * 
 * Body:
 * - name: string (required, no special chars)
 * - google_maps_url: string (optional)
 * - image_url: string (optional, from upload)
 * - standards_checked: boolean (required, must be true)
 * - status: 'DRAFT' | 'PUBLIC' (default: DRAFT)
 * 
 * Returns: Created spot info
 */
const createSpot = async (req, res) => {
  try {
    const {
      name,
      google_maps_url,
      image_url,
      standards_checked,
      status = 'DRAFT'
    } = req.body;

    // Validation 1: Name is required
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Tên địa điểm là bắt buộc'
      });
    }

    // Validation 2: Name must not contain special characters
    // Allow: letters (all languages), numbers, spaces, hyphens, parentheses
    const specialCharPattern = /[!@#$%^&*+=\[\]{};':"\\|,.<>/?~`]/;
    if (specialCharPattern.test(name)) {
      return res.status(400).json({
        success: false,
        message: 'Tên địa điểm không được chứa ký tự đặc biệt (!@#$%^&*+=[]{};\':"|,.<>/?~`)'
      });
    }

    // Validation 3: Standards checked is required
    if (!standards_checked || standards_checked !== true) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải xác nhận đã kiểm tra tiêu chuẩn đăng bài'
      });
    }

    // Validation 4: Status must be valid
    if (!['DRAFT', 'PUBLIC'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận DRAFT hoặc PUBLIC'
      });
    }

    // Create spot with minimal required fields
    const query = `
      INSERT INTO spots (
        name,
        description,
        google_maps_url,
        status,
        created_by_admin_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await db.query(query, [
      name.trim(),
      `Spot created by admin ${req.user.userId}`, // Default description
      google_maps_url || null,
      status,
      req.user.userId
    ]);

    const spotId = result.insertId;

    // If image_url provided, insert into spot_images
    if (image_url) {
      const imageQuery = `
        INSERT INTO spot_images (spot_id, image_url, display_order, created_at)
        VALUES (?, ?, 1, NOW())
      `;
      await db.query(imageQuery, [spotId, image_url]);
    }

    // Get created spot
    const getSpotQuery = `
      SELECT 
        s.*,
        (SELECT GROUP_CONCAT(image_url) FROM spot_images WHERE spot_id = s.spot_id) as images
      FROM spots s
      WHERE s.spot_id = ?
    `;
    const spots = await db.query(getSpotQuery, [spotId]);
    
    // Convert images from comma-separated string to array
    if (spots[0] && spots[0].images) {
      spots[0].images = spots[0].images.split(',');
    }

    res.status(201).json({
      success: true,
      message: status === 'DRAFT' ? 'Đã lưu nháp thành công' : 'Đã tạo địa điểm thành công',
      data: {
        spot: spots[0]
      }
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
 * 
 * Chỉnh sửa spot (đơn giản)
 * 
 * Body: Same as createSpot
 * 
 * Returns: Updated spot info
 */
const updateSpot = async (req, res) => {
  try {
    const { spotId } = req.params;
    const {
      name,
      google_maps_url,
      image_url,
      standards_checked,
      status = 'DRAFT'
    } = req.body;

    // Check if spot exists
    const checkQuery = 'SELECT spot_id FROM spots WHERE spot_id = ?';
    const existingSpots = await db.query(checkQuery, [spotId]);

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

    // Validation 2: Name must not contain special characters
    const specialCharPattern = /[!@#$%^&*+=\[\]{};':"\\|,.<>/?~`]/;
    if (specialCharPattern.test(name)) {
      return res.status(400).json({
        success: false,
        message: 'Tên địa điểm không được chứa ký tự đặc biệt (!@#$%^&*+=[]{};\':"|,.<>/?~`)'
      });
    }

    // Validation 3: Standards checked is required
    if (!standards_checked || standards_checked !== true) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải xác nhận đã kiểm tra tiêu chuẩn đăng bài'
      });
    }

    // Validation 4: Status must be valid
    if (!['DRAFT', 'PUBLIC', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    // Update spot
    const updateQuery = `
      UPDATE spots
      SET 
        name = ?,
        google_maps_url = ?,
        status = ?,
        updated_at = NOW()
      WHERE spot_id = ?
    `;

    await db.query(updateQuery, [
      name.trim(),
      google_maps_url || null,
      status,
      spotId
    ]);

    // If new image_url provided, add to spot_images
    if (image_url) {
      // Get current max display_order
      const maxOrderQuery = 'SELECT COALESCE(MAX(display_order), 0) as max_order FROM spot_images WHERE spot_id = ?';
      const maxOrderResult = await db.query(maxOrderQuery, [spotId]);
      const nextOrder = maxOrderResult[0].max_order + 1;

      const imageQuery = `
        INSERT INTO spot_images (spot_id, image_url, display_order, created_at)
        VALUES (?, ?, ?, NOW())
      `;
      await db.query(imageQuery, [spotId, image_url, nextOrder]);
    }

    // Get updated spot
    const getSpotQuery = `
      SELECT 
        s.*,
        (SELECT GROUP_CONCAT(image_url) FROM spot_images WHERE spot_id = s.spot_id) as images
      FROM spots s
      WHERE s.spot_id = ?
    `;
    const spots = await db.query(getSpotQuery, [spotId]);
    
    // Convert images from comma-separated string to array
    if (spots[0] && spots[0].images) {
      spots[0].images = spots[0].images.split(',');
    }

    res.json({
      success: true,
      message: status === 'DRAFT' ? 'Đã lưu nháp thành công' : 'Đã cập nhật địa điểm thành công',
      data: {
        spot: spots[0]
      }
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

module.exports = {
  createSpot,
  updateSpot,
  previewSpot,
  publishSpot,
  deleteSpotImage
};
