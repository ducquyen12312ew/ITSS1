/**
 * Spots Controller - Quản lý địa điểm vui chơi
 * Hỗ trợ: Search, Filter, Sort
 */

const db = require('../database/db');

/**
 * GET /api/spots/search
 * Tìm kiếm địa điểm theo keyword (tên hoặc category)
 * Không cần đăng nhập (Public API cho cả Guest)
 */
const searchSpots = async (req, res) => {
  try {
    const { 
      keyword = '',           // Từ khóa tìm kiếm
      category,               // Lọc theo category
      min_age,                // Lọc theo độ tuổi
      max_age,
      price_range,            // Lọc theo giá
      is_indoor,              // Lọc trong nhà/ngoài trời
      weather,                // Lọc theo thời tiết
      min_rating,             // Lọc theo đánh giá
      lat,                    // Vĩ độ (để tính khoảng cách)
      lng,                    // Kinh độ
      distance,               // Khoảng cách tối đa (km)
      sort = 'recommended',   // Sắp xếp: recommended, distance, rating, name
      limit = 20,             // Số kết quả trên 1 trang
      offset = 0              // Vị trí bắt đầu
    } = req.query;

    // Build WHERE conditions
    let conditions = ['spots.status = ?'];
    let params = ['PUBLIC'];

    // Keyword search (tên hoặc mô tả)
    if (keyword) {
      conditions.push('(spots.name LIKE ? OR spots.description LIKE ? OR spots.category LIKE ?)');
      const searchPattern = `%${keyword}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by category
    if (category) {
      conditions.push('spots.category = ?');
      params.push(category);
    }

    // Filter by age range
    if (min_age !== undefined) {
      conditions.push('spots.max_age >= ?');
      params.push(parseInt(min_age));
    }
    if (max_age !== undefined) {
      conditions.push('spots.min_age <= ?');
      params.push(parseInt(max_age));
    }

    // Filter by price range
    if (price_range) {
      conditions.push('spots.price_range = ?');
      params.push(price_range);
    }

    // Filter by indoor/outdoor
    if (is_indoor !== undefined) {
      conditions.push('spots.is_indoor = ?');
      params.push(is_indoor === 'true' ? 1 : 0);
    }

    // Filter by weather
    if (weather) {
      conditions.push('spots.weather_suitable = ?');
      params.push(weather);
    }

    // Filter by rating
    if (min_rating) {
      conditions.push('spots.average_rating >= ?');
      params.push(parseFloat(min_rating));
    }

    // Calculate distance if lat/lng provided
    let distanceSelect = 'NULL as distance';
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      // Haversine formula to calculate distance (km)
      distanceSelect = `
        (6371 * acos(
          cos(radians(?)) * cos(radians(spots.latitude)) 
          * cos(radians(spots.longitude) - radians(?)) 
          + sin(radians(?)) * sin(radians(spots.latitude))
        )) as distance
      `;
      params.unshift(userLat, userLng, userLat); // Add to beginning for SELECT
      
      // Filter by max distance
      if (distance) {
        conditions.push(`(
          6371 * acos(
            cos(radians(?)) * cos(radians(spots.latitude)) 
            * cos(radians(spots.longitude) - radians(?)) 
            + sin(radians(?)) * sin(radians(spots.latitude))
          )
        ) <= ?`);
        params.push(userLat, userLng, userLat, parseFloat(distance));
      }
    }

    // Build ORDER BY clause
    let orderBy = '';
    switch (sort) {
      case 'distance':
        if (lat && lng) {
          orderBy = 'distance ASC';
        } else {
          orderBy = 'spots.created_at DESC'; // Fallback if no location
        }
        break;
      case 'rating':
        orderBy = 'spots.average_rating DESC, spots.review_count DESC';
        break;
      case 'name':
        orderBy = 'spots.name ASC';
        break;
      case 'recommended':
      default:
        // Recommended = high rating + popular (có nhiều reviews)
        orderBy = '(spots.average_rating * 0.7 + LEAST(spots.review_count / 10, 5) * 0.3) DESC';
        break;
    }

    // Count total results
    const countQuery = `
      SELECT COUNT(*) as total
      FROM spots
      WHERE ${conditions.join(' AND ')}
    `;
    
    const countParams = params.filter((_, i) => {
      // Remove distance calculation params for count query
      if (lat && lng) {
        return i >= 3; // Skip first 3 params (lat, lng, lat for SELECT)
      }
      return true;
    });

    const countResult = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    // Main query with pagination
    const query = `
      SELECT 
        spots.*,
        ${distanceSelect},
        (SELECT image_url FROM spot_images WHERE spot_id = spots.spot_id AND is_main = TRUE LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = spots.spot_id) as tags
      FROM spots
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    const spots = await db.query(query, params);

    // Parse tags from string to array
    const spotsWithParsedTags = spots.map(spot => ({
      ...spot,
      tags: spot.tags ? spot.tags.split(',') : [],
      distance: spot.distance ? parseFloat(spot.distance.toFixed(2)) : null,
      facilities: spot.facilities ? JSON.parse(spot.facilities) : {},
      operating_hours: spot.operating_hours ? JSON.parse(spot.operating_hours) : {}
    }));

    res.json({
      success: true,
      data: {
        spots: spotsWithParsedTags,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + parseInt(limit)) < total
        },
        filters_applied: {
          keyword: keyword || null,
          category: category || null,
          age_range: min_age || max_age ? { min: min_age, max: max_age } : null,
          price_range: price_range || null,
          is_indoor: is_indoor !== undefined ? is_indoor === 'true' : null,
          weather: weather || null,
          min_rating: min_rating || null,
          distance: distance || null
        },
        sort_by: sort
      }
    });

  } catch (error) {
    console.error('Search spots error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm địa điểm',
      error: error.message
    });
  }
};

/**
 * GET /api/spots/:id
 * Lấy chi tiết 1 địa điểm
 * Public API (không cần đăng nhập)
 */
const getSpotById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get spot details
    const spotQuery = `
      SELECT * FROM spots WHERE spot_id = ? AND status = 'PUBLIC'
    `;
    const spots = await db.query(spotQuery, [id]);

    if (spots.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    const spot = spots[0];

    // Get all images
    const imagesQuery = `
      SELECT * FROM spot_images 
      WHERE spot_id = ? 
      ORDER BY is_main DESC, display_order ASC
    `;
    const images = await db.query(imagesQuery, [id]);

    // Get all tags
    const tagsQuery = `
      SELECT tag_name FROM spot_tags WHERE spot_id = ?
    `;
    const tags = await db.query(tagsQuery, [id]);

    // Get reviews summary
    const reviewsQuery = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
      FROM reviews 
      WHERE spot_id = ? AND is_hidden = FALSE
    `;
    const reviewStats = await db.query(reviewsQuery, [id]);

    // Parse JSON fields
    const spotDetails = {
      ...spot,
      facilities: spot.facilities ? JSON.parse(spot.facilities) : {},
      operating_hours: spot.operating_hours ? JSON.parse(spot.operating_hours) : {},
      images: images,
      tags: tags.map(t => t.tag_name),
      review_stats: reviewStats[0]
    };

    res.json({
      success: true,
      data: spotDetails
    });

  } catch (error) {
    console.error('Get spot by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin địa điểm',
      error: error.message
    });
  }
};

/**
 * GET /api/spots/suggestions
 * Gợi ý autocomplete khi user gõ keyword
 * Trả về danh sách ngắn gọn để hiển thị dropdown
 */
const getSearchSuggestions = async (req, res) => {
  try {
    const { keyword = '' } = req.query;

    if (keyword.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    const query = `
      SELECT 
        spot_id,
        name,
        category,
        (SELECT image_url FROM spot_images WHERE spot_id = spots.spot_id AND is_main = TRUE LIMIT 1) as image
      FROM spots
      WHERE status = 'PUBLIC' 
        AND (name LIKE ? OR category LIKE ?)
      ORDER BY average_rating DESC, review_count DESC
      LIMIT 5
    `;

    const searchPattern = `%${keyword}%`;
    const suggestions = await db.query(query, [searchPattern, searchPattern]);

    res.json({
      success: true,
      data: {
        suggestions
      }
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy gợi ý tìm kiếm',
      error: error.message
    });
  }
};

module.exports = {
  searchSpots,
  getSpotById,
  getSearchSuggestions
};
