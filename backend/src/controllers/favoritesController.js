/**
 * Favorites Controller - Quản lý địa điểm yêu thích
 * Cho phép user lưu/xóa/xem danh sách favorites
 * Yêu cầu authentication
 */

const db = require('../database/db');

/**
 * GET /api/favorites
 * Lấy danh sách tất cả địa điểm yêu thích của user
 * Có thể filter theo collection_tag
 */
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { collection_tag, limit = 20, offset = 0 } = req.query;

    // Build WHERE conditions
    let conditions = ['f.user_id = ?'];
    let params = [userId];

    if (collection_tag) {
      conditions.push('f.collection_tag = ?');
      params.push(collection_tag);
    }

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM favorites f
      WHERE ${conditions.join(' AND ')}
    `;
    const countResult = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Get favorites with spot details
    const query = `
      SELECT 
        f.favorite_id,
        f.spot_id,
        f.collection_tag,
        f.created_at,
        s.name,
        s.description,
        s.address,
        s.latitude,
        s.longitude,
        s.average_rating,
        s.review_count,
        s.operating_hours,
        s.facilities,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM favorites f
      JOIN spots s ON f.spot_id = s.spot_id
      WHERE ${conditions.join(' AND ')} AND s.status = 'PUBLIC'
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));
    const favorites = await db.query(query, params);

    // Parse tags
    const favoritesWithParsedTags = favorites.map(fav => ({
      ...fav,
      tags: fav.tags ? fav.tags.split(',') : []
    }));

    res.json({
      success: true,
      data: {
        favorites: favoritesWithParsedTags,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + favorites.length) < total
        }
      }
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách yêu thích',
      error: error.message
    });
  }
};

/**
 * GET /api/favorites/check/:spotId
 * Kiểm tra xem spot có được yêu thích chưa
 * Dùng để toggle button ♡ trên UI
 */
const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { spotId } = req.params;

    const query = `
      SELECT favorite_id, collection_tag
      FROM favorites
      WHERE user_id = ? AND spot_id = ?
    `;

    const result = await db.query(query, [userId, spotId]);

    res.json({
      success: true,
      data: {
        is_favorite: result.length > 0,
        favorite_id: result.length > 0 ? result[0].favorite_id : null,
        collection_tag: result.length > 0 ? result[0].collection_tag : null
      }
    });

  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra yêu thích',
      error: error.message
    });
  }
};

/**
 * POST /api/favorites
 * Thêm spot vào danh sách yêu thích
 * Toggle: Nếu đã có thì xóa, chưa có thì thêm
 */
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { spot_id, collection_tag = null } = req.body;

    if (!spot_id) {
      return res.status(400).json({
        success: false,
        message: 'spot_id là bắt buộc'
      });
    }

    // Check if spot exists
    const spotCheck = await db.query(
      'SELECT spot_id FROM spots WHERE spot_id = ? AND status = ?',
      [spot_id, 'PUBLIC']
    );

    if (spotCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    // Check if already favorited
    const existingFavorite = await db.query(
      'SELECT favorite_id FROM favorites WHERE user_id = ? AND spot_id = ?',
      [userId, spot_id]
    );

    if (existingFavorite.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Địa điểm đã có trong danh sách yêu thích',
        data: {
          favorite_id: existingFavorite[0].favorite_id
        }
      });
    }

    // Insert favorite
    const query = `
      INSERT INTO favorites (user_id, spot_id, collection_tag)
      VALUES (?, ?, ?)
    `;

    const result = await db.query(query, [userId, spot_id, collection_tag]);

    // Get the newly created favorite with spot info
    const newFavorite = await db.query(
      `SELECT 
        f.favorite_id,
        f.spot_id,
        f.collection_tag,
        f.created_at,
        s.name,
        s.address,
        s.average_rating,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM favorites f
      JOIN spots s ON f.spot_id = s.spot_id
      WHERE f.favorite_id = ?`,
      [result.insertId]
    );

    // Parse tags from string to array
    const favoriteWithParsedTags = {
      ...newFavorite[0],
      tags: newFavorite[0].tags ? newFavorite[0].tags.split(',') : []
    };

    res.status(201).json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      data: favoriteWithParsedTags
    });

  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm yêu thích',
      error: error.message
    });
  }
};

/**
 * PUT /api/favorites/:id
 * Cập nhật collection_tag của favorite
 */
const updateFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { collection_tag } = req.body;

    // Check if favorite exists and belongs to user
    const checkQuery = `
      SELECT * FROM favorites WHERE favorite_id = ? AND user_id = ?
    `;
    const existingFavorite = await db.query(checkQuery, [id, userId]);

    if (existingFavorite.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu thích hoặc bạn không có quyền chỉnh sửa'
      });
    }

    // Update collection_tag
    const query = `
      UPDATE favorites 
      SET collection_tag = ?
      WHERE favorite_id = ? AND user_id = ?
    `;

    await db.query(query, [collection_tag, id, userId]);

    // Get updated favorite
    const updatedFavorite = await db.query(
      `SELECT 
        f.favorite_id,
        f.spot_id,
        f.collection_tag,
        f.created_at,
        s.name,
        s.address,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM favorites f
      JOIN spots s ON f.spot_id = s.spot_id
      WHERE f.favorite_id = ?`,
      [id]
    );

    // Parse tags
    const favoriteWithParsedTags = {
      ...updatedFavorite[0],
      tags: updatedFavorite[0].tags ? updatedFavorite[0].tags.split(',') : []
    };

    res.json({
      success: true,
      message: 'Cập nhật collection tag thành công',
      data: favoriteWithParsedTags
    });

  } catch (error) {
    console.error('Update favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật yêu thích',
      error: error.message
    });
  }
};

/**
 * DELETE /api/favorites/:id
 * Xóa favorite theo favorite_id
 */
const deleteFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if favorite exists and belongs to user
    const checkQuery = `
      SELECT * FROM favorites WHERE favorite_id = ? AND user_id = ?
    `;
    const existingFavorite = await db.query(checkQuery, [id, userId]);

    if (existingFavorite.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu thích hoặc bạn không có quyền xóa'
      });
    }

    // Delete favorite
    const query = `
      DELETE FROM favorites WHERE favorite_id = ? AND user_id = ?
    `;

    await db.query(query, [id, userId]);

    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích'
    });

  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa yêu thích',
      error: error.message
    });
  }
};

/**
 * DELETE /api/favorites/spot/:spotId
 * Xóa favorite theo spot_id (Toggle button ♡)
 */
const deleteFavoriteBySpotId = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { spotId } = req.params;

    // Check if favorite exists
    const checkQuery = `
      SELECT favorite_id FROM favorites WHERE user_id = ? AND spot_id = ?
    `;
    const existingFavorite = await db.query(checkQuery, [userId, spotId]);

    if (existingFavorite.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Địa điểm này chưa có trong danh sách yêu thích'
      });
    }

    // Delete favorite
    const query = `
      DELETE FROM favorites WHERE user_id = ? AND spot_id = ?
    `;

    await db.query(query, [userId, spotId]);

    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích'
    });

  } catch (error) {
    console.error('Delete favorite by spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa yêu thích',
      error: error.message
    });
  }
};

/**
 * GET /api/favorites/collections
 * Lấy danh sách các collection_tag đã dùng
 * Để hiển thị filter dropdown
 */
const getCollections = async (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT 
        collection_tag,
        COUNT(*) as count
      FROM favorites
      WHERE user_id = ? AND collection_tag IS NOT NULL
      GROUP BY collection_tag
      ORDER BY count DESC
    `;

    const collections = await db.query(query, [userId]);

    res.json({
      success: true,
      data: {
        collections: collections
      }
    });

  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách collections',
      error: error.message
    });
  }
};

module.exports = {
  getFavorites,
  checkFavorite,
  addFavorite,
  updateFavorite,
  deleteFavorite,
  deleteFavoriteBySpotId,
  getCollections
};
