/**
 * Kids Swipe Controller - Tính năng swipe cho trẻ em
 * Child swipe spots → System học preferences → Recommend spots phù hợp
 */

const db = require('../database/db');

// Helper to get connection from pool
const getConnection = async () => {
  return await db.pool.getConnection();
};

/**
 * POST /api/kids-swipe/:childId/swipe
 * Child swipe một spot (LIKE hoặc SKIP)
 * Nếu LIKE → Lưu tất cả tags của spot vào child_preferences
 */
const swipeSpot = async (req, res) => {
  const connection = await getConnection();
  try {
    const userId = req.user.userId;
    const { childId } = req.params;
    const { spot_id, action } = req.body; // action: 'LIKE' hoặc 'SKIP'

    // Validate
    if (!spot_id || !action) {
      return res.status(400).json({
        success: false,
        message: 'spot_id và action là bắt buộc'
      });
    }

    if (!['LIKE', 'SKIP'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'action phải là LIKE hoặc SKIP'
      });
    }

    // Check if child belongs to user
    const [childCheck] = await connection.execute(
      'SELECT child_id FROM children WHERE child_id = ? AND user_id = ?',
      [childId, userId]
    );

    if (childCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trẻ hoặc bạn không có quyền truy cập'
      });
    }

    // Check if spot exists
    const [spotCheck] = await connection.execute(
      'SELECT spot_id, name FROM spots WHERE spot_id = ? AND status = ?',
      [spot_id, 'PUBLIC']
    );

    if (spotCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    const spotName = spotCheck[0].name;

    if (action === 'LIKE') {
      // Get all tags of the spot
      const [tags] = await connection.execute(
        'SELECT tag_name FROM spot_tags WHERE spot_id = ?',
        [spot_id]
      );

      // 1. Insert each tag into child_preferences with preference_type = 'LIKE'
      // Handle duplicates gracefully (UNIQUE constraint)
      let savedCount = 0;
      if (tags.length > 0) {
        for (const tag of tags) {
          try {
            await connection.execute(
              `INSERT INTO child_preferences (child_id, preference_type, tag_name)
               VALUES (?, ?, ?)`,
              [childId, 'LIKE', tag.tag_name]
            );
            savedCount++;
          } catch (error) {
            // Skip if tag already exists (UNIQUE constraint)
            if (error.code === 'ER_DUP_ENTRY') {
              console.log(`Tag "${tag.tag_name}" already exists for child ${childId}`);
              continue;
            }
            throw error;
          }
        }
      }

      // 2. Log swipe action to kid_swipe table
      try {
        await connection.execute(
          `INSERT INTO kid_swipe (child_id, spot_id, action)
           VALUES (?, ?, ?)`,
          [childId, spot_id, 'LIKE']
        );
      } catch (error) {
        // Ignore if already swiped (unique constraint)
        if (error.code !== 'ER_DUP_ENTRY') {
          throw error;
        }
      }

      res.json({
        success: true,
        message: `Đã lưu sở thích của trẻ - ${spotName}`,
        data: {
          action: 'LIKE',
          spot_id: spot_id,
          spot_name: spotName,
          tags_saved: savedCount,
          total_tags: tags.length
        }
      });
    } else {
      // SKIP - Log vào kid_swipe để không hiển thị lại địa điểm này
      try {
        await connection.execute(
          `INSERT INTO kid_swipe (child_id, spot_id, action)
           VALUES (?, ?, ?)`,
          [childId, spot_id, 'SKIP']
        );
      } catch (error) {
        // Ignore if already swiped
        if (error.code !== 'ER_DUP_ENTRY') {
          throw error;
        }
      }

      res.json({
        success: true,
        message: `Đã bỏ qua - ${spotName}`,
        data: {
          action: 'SKIP',
          spot_id: spot_id,
          spot_name: spotName
        }
      });
    }

  } catch (error) {
    console.error('Swipe spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý swipe',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * GET /api/kids-swipe/:childId/preferences
 * Lấy danh sách tags mà child đã thích
 * Hiển thị profile/preferences của child
 */
const getChildPreferences = async (req, res) => {
  const connection = await getConnection();
  try {
    const userId = req.user.userId;
    const { childId } = req.params;

    // Check if child belongs to user
    const [childCheck] = await connection.execute(
      'SELECT child_id, name FROM children WHERE child_id = ? AND user_id = ?',
      [childId, userId]
    );

    if (childCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trẻ hoặc bạn không có quyền truy cập'
      });
    }

    // Get all liked tags with count
    const query = `
      SELECT 
        tag_name,
        COUNT(*) as count,
        MAX(created_at) as last_updated
      FROM child_preferences
      WHERE child_id = ? AND preference_type = 'LIKE'
      GROUP BY tag_name
      ORDER BY count DESC, last_updated DESC
    `;

    const [preferences] = await connection.execute(query, [childId]);

    res.json({
      success: true,
      data: {
        child: childCheck[0],
        preferences: preferences,
        total_tags: preferences.length
      }
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sở thích',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * GET /api/kids-swipe/:childId/recommendations
 * Recommend spots dựa trên tags mà child thích
 * Sort theo số tags trùng khớp (matching score)
 */
const getRecommendations = async (req, res) => {
  const connection = await getConnection();
  try {
    const userId = req.user.userId;
    const { childId } = req.params;
    const { 
      limit = 10, 
      offset = 0,
      min_match = 1,  // Tối thiểu bao nhiêu tags trùng
      lat,            // Location filters (optional)
      lng,
      distance
    } = req.query;

    // Check if child belongs to user
    const [childCheck] = await connection.execute(
      'SELECT child_id, name, birth_date FROM children WHERE child_id = ? AND user_id = ?',
      [childId, userId]
    );

    if (childCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trẻ hoặc bạn không có quyền truy cập'
      });
    }

    const child = childCheck[0];

    // Calculate child's age
    const birthDate = new Date(child.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Get child's liked tags
    const likedTagsQuery = `
      SELECT DISTINCT tag_name
      FROM child_preferences
      WHERE child_id = ? AND preference_type = 'LIKE'
    `;
    const [likedTags] = await connection.execute(likedTagsQuery, [childId]);

    if (likedTags.length === 0) {
      return res.json({
        success: true,
        message: 'Trẻ chưa có sở thích nào. Hãy swipe một vài địa điểm trước!',
        data: {
          recommendations: [],
          child: { ...child, age },
          total_preferences: 0
        }
      });
    }

    const tagNames = likedTags.map(t => t.tag_name);

    // Build distance calculation
    let distanceSelect = 'NULL as distance';
    let distanceCondition = '';
    let params = [];

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      distanceSelect = `
        (6371 * acos(
          cos(radians(?)) * cos(radians(spots.latitude)) 
          * cos(radians(spots.longitude) - radians(?)) 
          + sin(radians(?)) * sin(radians(spots.latitude))
        )) as distance
      `;
      params.push(userLat, userLng, userLat);

      if (distance) {
        distanceCondition = `AND (
          6371 * acos(
            cos(radians(?)) * cos(radians(spots.latitude)) 
            * cos(radians(spots.longitude) - radians(?)) 
            + sin(radians(?)) * sin(radians(spots.latitude))
          )
        ) <= ?`;
        params.push(userLat, userLng, userLat, parseFloat(distance));
      }
    }

    // Build tag matching subquery
    const tagPlaceholders = tagNames.map(() => '?').join(',');
    params.push(...tagNames, age, age, parseInt(min_match));

    // Main query: Find spots with matching tags
    const query = `
      SELECT 
        spots.*,
        ${distanceSelect},
        (SELECT image_url FROM spot_images WHERE spot_id = spots.spot_id AND is_main = TRUE LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = spots.spot_id) as tags,
        (
          SELECT COUNT(DISTINCT st.tag_name)
          FROM spot_tags st
          WHERE st.spot_id = spots.spot_id
          AND st.tag_name IN (${tagPlaceholders})
        ) as match_score
      FROM spots
      WHERE spots.status = 'PUBLIC'
        AND spots.min_age <= ?
        AND spots.max_age >= ?
        ${distanceCondition}
      HAVING match_score >= ?
      ORDER BY match_score DESC, spots.average_rating DESC, spots.review_count DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    const [recommendations] = await connection.execute(query, params);

    // Parse tags and format response
    const formattedRecommendations = recommendations.map(spot => ({
      ...spot,
      tags: spot.tags ? spot.tags.split(',') : [],
      match_score: parseInt(spot.match_score),
      distance: spot.distance ? parseFloat(spot.distance.toFixed(2)) : null,
      facilities: spot.facilities ? JSON.parse(spot.facilities) : {},
      operating_hours: spot.operating_hours ? JSON.parse(spot.operating_hours) : {}
    }));

    // Count total matching spots
    const countQuery = `
      SELECT COUNT(DISTINCT spots.spot_id) as total
      FROM spots
      JOIN spot_tags st ON st.spot_id = spots.spot_id
      WHERE spots.status = 'PUBLIC'
        AND spots.min_age <= ?
        AND spots.max_age >= ?
        AND st.tag_name IN (${tagPlaceholders})
        ${distanceCondition}
    `;

    let countParams = [age, age, ...tagNames];
    if (lat && lng && distance) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      countParams.push(userLat, userLng, userLat, parseFloat(distance));
    }

    const [countResult] = await connection.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        recommendations: formattedRecommendations,
        child: { ...child, age },
        preferences_used: likedTags.map(t => t.tag_name),
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + recommendations.length) < total
        }
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy gợi ý',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * GET /api/kids-swipe/:childId/spots
 * Lấy danh sách địa điểm chưa swipe để hiển thị cho trẻ
 * Loại trừ các địa điểm đã swipe (LIKE hoặc SKIP)
 */
const getSpotsForSwipe = async (req, res) => {
  const connection = await getConnection();
  try {
    const userId = req.user.userId;
    const { childId } = req.params;
    const { 
      limit = 20, 
      offset = 0,
      category,
      lat,
      lng,
      distance = 50 // km
    } = req.query;

    // Check if child belongs to user
    const [childCheck] = await connection.execute(
      'SELECT child_id, name, birth_date FROM children WHERE child_id = ? AND user_id = ?',
      [childId, userId]
    );

    if (childCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trẻ hoặc bạn không có quyền truy cập'
      });
    }

    const child = childCheck[0];
    
    // Calculate child's age
    const birthDate = new Date(child.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Build query to get spots NOT yet swiped by this child
    let query = `
      SELECT 
        s.spot_id,
        s.name,
        s.description,
        s.category,
        s.min_age,
        s.max_age,
        s.price_range,
        s.is_indoor,
        s.address,
        s.latitude,
        s.longitude,
        s.average_rating,
        s.review_count,
        s.favorite_count,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = 1 LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
    `;

    let params = [];
    let conditions = ['s.status = ?'];
    params.push('PUBLIC');

    // Filter by age compatibility
    conditions.push('s.min_age <= ?');
    conditions.push('s.max_age >= ?');
    params.push(age, age);

    // Exclude already swiped spots
    query += `
      FROM spots s
      WHERE s.spot_id NOT IN (
        SELECT spot_id FROM kid_swipe WHERE child_id = ?
      )
    `;
    params.unshift(childId);

    // Apply other filters
    if (category) {
      conditions.push('s.category = ?');
      params.push(category);
    }

    // Distance filter (if location provided)
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      query += `, (
        6371 * acos(
          cos(radians(?)) * cos(radians(s.latitude)) *
          cos(radians(s.longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(s.latitude))
        )
      ) as distance`;
      
      params.push(userLat, userLng, userLat);
      conditions.push(`(
        6371 * acos(
          cos(radians(?)) * cos(radians(s.latitude)) *
          cos(radians(s.longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(s.latitude))
        )
      ) <= ?`);
      params.push(userLat, userLng, userLat, parseFloat(distance));
    }

    // Add WHERE conditions
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    // Order by rating and shuffle a bit for variety
    query += `
      ORDER BY RAND(), s.average_rating DESC, s.review_count DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const [spots] = await connection.execute(query, params);

    // Format response
    const formattedSpots = spots.map(spot => ({
      ...spot,
      tags: spot.tags ? spot.tags.split(',') : [],
      distance: spot.distance ? parseFloat(spot.distance.toFixed(2)) : null
    }));

    // Count total available spots
    let countQuery = `
      SELECT COUNT(*) as total
      FROM spots s
      WHERE s.spot_id NOT IN (
        SELECT spot_id FROM kid_swipe WHERE child_id = ?
      )
      AND s.status = ?
      AND s.min_age <= ?
      AND s.max_age >= ?
    `;
    let countParams = [childId, 'PUBLIC', age, age];

    if (category) {
      countQuery += ' AND s.category = ?';
      countParams.push(category);
    }

    const [countResult] = await connection.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        spots: formattedSpots,
        child: {
          child_id: child.child_id,
          name: child.name,
          age: age
        },
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + spots.length) < total
        }
      }
    });

  } catch (error) {
    console.error('Get spots for swipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách địa điểm',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * DELETE /api/kids-swipe/:childId/swipe/:spotId
 * Xóa swipe của trẻ (remove từ kid_swipe)
 */
const deleteKidSwipe = async (req, res) => {
  const connection = await getConnection();
  try {
    const userId = req.user.userId;
    const { childId, spotId } = req.params;

    // Check if child belongs to user
    const [childCheck] = await connection.execute(
      'SELECT child_id FROM children WHERE child_id = ? AND user_id = ?',
      [childId, userId]
    );

    if (childCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trẻ hoặc bạn không có quyền truy cập'
      });
    }

    // Delete from kid_swipe
    const [result] = await connection.execute(
      'DELETE FROM kid_swipe WHERE child_id = ? AND spot_id = ?',
      [childId, spotId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy swipe'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa khỏi yêu thích của trẻ'
    });

  } catch (error) {
    console.error('Delete kid swipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa swipe',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * GET /api/kids-swipe/:childId/favorites
 * Lấy danh sách spots mà trẻ đã LIKE (từ kid_swipe table)
 */
const getKidFavorites = async (req, res) => {
  const connection = await getConnection();
  try {
    const userId = req.user.userId;
    const { childId } = req.params;

    // Check if child belongs to user
    const [childCheck] = await connection.execute(
      'SELECT child_id, name FROM children WHERE child_id = ? AND user_id = ?',
      [childId, userId]
    );

    if (childCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trẻ hoặc bạn không có quyền truy cập'
      });
    }

    // Get all liked spots from kid_swipe
    const query = `
      SELECT 
        ks.swipe_id,
        ks.spot_id,
        ks.created_at,
        s.name,
        s.category,
        s.min_age,
        s.max_age,
        s.price_range,
        s.address,
        s.latitude,
        s.longitude,
        s.average_rating,
        s.review_count,
        s.is_indoor,
        s.weather_suitable,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM kid_swipe ks
      JOIN spots s ON ks.spot_id = s.spot_id
      WHERE ks.child_id = ? AND ks.action = 'LIKE' AND s.status = 'PUBLIC'
      ORDER BY ks.created_at DESC
    `;

    const [favorites] = await connection.execute(query, [childId]);

    // Parse tags
    const favoritesWithParsedTags = favorites.map(fav => ({
      ...fav,
      tags: fav.tags ? fav.tags.split(',') : [],
      child_id: parseInt(childId)
    }));

    res.json({
      success: true,
      data: {
        child: childCheck[0],
        favorites: favoritesWithParsedTags,
        total: favorites.length
      }
    });

  } catch (error) {
    console.error('Get kid favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy yêu thích của trẻ',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  swipeSpot,
  getChildPreferences,
  getRecommendations,
  getSpotsForSwipe,
  getKidFavorites,
  deleteKidSwipe
};
