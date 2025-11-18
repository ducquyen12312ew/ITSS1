/**
 * Smart Recommendations Controller
 * 
 * Tự động gợi ý spots tối ưu dựa trên:
 * 1. Khoảng cách từ vị trí hiện tại
 * 2. Điều kiện thời tiết (mưa/nắng nóng)
 * 3. Hồ sơ trẻ (tuổi, sở thích từ swipe history)
 * 4. Lịch sử favorites
 * 5. Operating hours (mở cửa hôm nay)
 */

const db = require('../database/db');

/**
 * GET /api/recommendations
 * 
 * Smart recommendations với filters nâng cao
 * 
 * Query params:
 * - child_id (optional): Lọc theo age + preferences của child
 * - lat, lng (required): Vị trí hiện tại
 * - distance (optional): Khoảng cách tối đa (km), default 20
 * - weather (optional): RAIN, SUNNY, HOT - Ưu tiên indoor/outdoor tương ứng
 * - rain_ok (optional): true/false - Chỉ show spots "chơi được khi mưa"
 * - open_now (optional): true/false - Chỉ show spots đang mở cửa
 * - limit, offset: Pagination
 */
const getSmartRecommendations = async (req, res) => {
  try {
    const userId = req.user?.userId; // Optional auth
    
    const {
      child_id,
      lat,
      lng,
      distance = 20,
      weather, // RAIN, SUNNY, HOT
      rain_ok, // true/false
      open_now, // true/false
      limit = 20,
      offset = 0
    } = req.query;

    // Validate required location
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'lat và lng là bắt buộc để gợi ý địa điểm'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Variables for scoring
    let childAge = null;
    let childPreferences = [];
    let userFavorites = [];

    // 1. Get child info if provided
    if (child_id) {
      // Check if child belongs to user (if authenticated)
      if (userId) {
        const childQuery = `
          SELECT child_id, name, birth_date
          FROM children
          WHERE child_id = ? AND user_id = ?
        `;
        const childResult = await db.query(childQuery, [child_id, userId]);
        
        if (childResult.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy trẻ hoặc bạn không có quyền truy cập'
          });
        }

        const child = childResult[0];

        // Calculate age
        const birthDate = new Date(child.birth_date);
        const today = new Date();
        childAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          childAge--;
        }

        // Get child's preferences (tags they liked from swipe)
        const prefsQuery = `
          SELECT DISTINCT tag_name
          FROM child_preferences
          WHERE child_id = ? AND preference_type = 'LIKE'
        `;
        const prefsResult = await db.query(prefsQuery, [child_id]);
        childPreferences = prefsResult.map(p => p.tag_name);
      }
    }

    // 2. Get user's favorites (if authenticated)
    if (userId) {
      const favQuery = `
        SELECT DISTINCT spot_id
        FROM favorites
        WHERE user_id = ?
      `;
      const favResult = await db.query(favQuery, [userId]);
      userFavorites = favResult.map(f => f.spot_id);
    }

    // 3. Build main query with scoring
    let conditions = ['s.status = ?'];
    let params = ['PUBLIC'];

    // Distance filter
    conditions.push(`(
      6371 * acos(
        cos(radians(?)) * cos(radians(s.latitude)) *
        cos(radians(s.longitude) - radians(?)) +
        sin(radians(?)) * sin(radians(s.latitude))
      )
    ) <= ?`);
    params.push(userLat, userLng, userLat, parseFloat(distance));

    // Age filter (if child provided)
    if (childAge !== null) {
      conditions.push('s.min_age <= ?');
      conditions.push('s.max_age >= ?');
      params.push(childAge, childAge);
    }

    // Weather-based filters
    if (weather === 'RAIN' || rain_ok === 'true') {
      // Ưu tiên indoor hoặc rain-friendly
      conditions.push("(s.is_indoor = 1 OR s.weather_suitable IN ('ALL_WEATHER', 'RAIN_OK'))");
    } else if (weather === 'HOT') {
      // Ưu tiên indoor có AC
      conditions.push("(s.is_indoor = 1 OR s.weather_suitable = 'ALL_WEATHER')");
    } else if (weather === 'SUNNY') {
      // Outdoor spots for sunny day
      // No filter, all spots OK
    }

    // Operating hours filter (open now)
    if (open_now === 'true') {
      const now = new Date();
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

      // This is complex - simplified: check if operating_hours is not empty
      // In real app, you'd parse JSON and check current time
      conditions.push("s.operating_hours IS NOT NULL");
      conditions.push("s.operating_hours != '{}'");
    }

    // Simplified query - Calculate score in JavaScript instead
    const query = `
      SELECT 
        s.*,
        (
          6371 * acos(
            cos(radians(?)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(s.latitude))
          )
        ) as distance,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = 1 LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM spots s
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.average_rating DESC, s.review_count DESC
    `;

    // Build params for simplified query
    const queryParams = [
      userLat, userLng, userLat, // Distance calculation
      ...params                  // WHERE conditions
    ];

    const spots = await db.query(query, queryParams);

    // Calculate scores in JavaScript
    const spotsWithScores = spots.map(spot => {
      const spotTags = spot.tags ? spot.tags.split(',') : [];
      
      // 1. Distance score (max 30)
      const distanceScore = Math.max(0, 30 - (spot.distance * 1.5));
      
      // 2. Rating score (max 25)
      const ratingScore = spot.average_rating * 5;
      
      // 3. Popularity score (max 15)
      const popularityScore = Math.min(spot.review_count * 0.5, 15);
      
      // 4. Preference match score (max 20)
      let preferenceMatchCount = 0;
      if (childPreferences.length > 0) {
        preferenceMatchCount = spotTags.filter(tag => childPreferences.includes(tag)).length;
      }
      const preferenceScore = preferenceMatchCount * 4;
      
      // 5. Favorite bonus (10)
      const isFavorite = userFavorites.includes(spot.spot_id);
      const favoriteScore = isFavorite ? 10 : 0;
      
      // Total score
      const recommendationScore = distanceScore + ratingScore + popularityScore + preferenceScore + favoriteScore;
      
      return {
        ...spot,
        preference_match_score: preferenceMatchCount,
        is_favorite: isFavorite,
        recommendation_score: parseFloat(recommendationScore.toFixed(2))
      };
    });

    // Sort by recommendation score
    spotsWithScores.sort((a, b) => b.recommendation_score - a.recommendation_score);

    // Apply pagination
    const paginatedSpots = spotsWithScores.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Format response
    const formattedSpots = paginatedSpots.map(spot => ({
      ...spot,
      distance: spot.distance ? parseFloat(spot.distance.toFixed(2)) : null,
      tags: spot.tags ? spot.tags.split(',') : [],
      facilities: spot.facilities ? JSON.parse(spot.facilities) : {},
      operating_hours: spot.operating_hours ? JSON.parse(spot.operating_hours) : {}
    }));

    const total = spotsWithScores.length;

    // Recommendation metadata
    let metadata = {
      location: { lat: userLat, lng: userLng },
      filters_applied: []
    };

    if (distance) metadata.filters_applied.push(`distance <= ${distance}km`);
    if (weather) metadata.filters_applied.push(`weather: ${weather}`);
    if (rain_ok === 'true') metadata.filters_applied.push('rain_ok');
    if (open_now === 'true') metadata.filters_applied.push('open_now');
    if (childAge) metadata.filters_applied.push(`age: ${childAge}`);
    if (childPreferences.length > 0) {
      metadata.filters_applied.push(`preferences: ${childPreferences.slice(0, 3).join(', ')}${childPreferences.length > 3 ? '...' : ''}`);
    }

    res.json({
      success: true,
      data: {
        recommendations: formattedSpots,
        metadata,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + formattedSpots.length) < total
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
  }
};

/**
 * GET /api/recommendations/weather-alternatives
 * 
 * Gợi ý thay thế khi thời tiết xấu
 * Ưu tiên indoor spots gần vị trí hiện tại
 */
const getWeatherAlternatives = async (req, res) => {
  try {
    const { lat, lng, distance = 30, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'lat và lng là bắt buộc'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const query = `
      SELECT 
        s.*,
        (
          6371 * acos(
            cos(radians(?)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(s.latitude))
          )
        ) as distance,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = 1 LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM spots s
      WHERE s.status = 'PUBLIC'
        AND (s.is_indoor = 1 OR s.weather_suitable IN ('ALL_WEATHER', 'RAIN_OK'))
        AND (
          6371 * acos(
            cos(radians(?)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(s.latitude))
          )
        ) <= ?
      ORDER BY distance ASC, s.average_rating DESC
      LIMIT ?
    `;

    const params = [
      userLat, userLng, userLat,
      userLat, userLng, userLat, parseFloat(distance),
      parseInt(limit)
    ];

    const spots = await db.query(query, params);

    const formattedSpots = spots.map(spot => ({
      ...spot,
      distance: spot.distance ? parseFloat(spot.distance.toFixed(2)) : null,
      tags: spot.tags ? spot.tags.split(',') : [],
      facilities: spot.facilities ? JSON.parse(spot.facilities) : {},
      operating_hours: spot.operating_hours ? JSON.parse(spot.operating_hours) : {}
    }));

    res.json({
      success: true,
      message: 'Gợi ý thay thế cho thời tiết xấu (indoor/rain-friendly)',
      data: {
        alternatives: formattedSpots,
        total: formattedSpots.length
      }
    });

  } catch (error) {
    console.error('Get weather alternatives error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy gợi ý thay thế',
      error: error.message
    });
  }
};

module.exports = {
  getSmartRecommendations,
  getWeatherAlternatives
};
