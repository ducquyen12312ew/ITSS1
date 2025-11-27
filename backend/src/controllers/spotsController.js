/**
 * Spots Controller - Quản lý địa điểm vui chơi
 * Hỗ trợ: Search, Filter, Sort
 */

const db = require('../database/db');

/**
 * Helper function to get user's children ages
 * Returns array of age tags like ['3-5歳', '6-8歳']
 */
const getUserChildrenAges = async (userId) => {
  try {
    const children = await db.query(
      'SELECT birth_date FROM children WHERE user_id = ?',
      [userId]
    );
    
    if (children.length === 0) return [];
    
    const ageTags = children.map(child => {
      const birthDate = new Date(child.birth_date);
      const today = new Date();
      const ageYears = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      
      // Map age to tag ranges
      if (ageYears <= 2) return '0-2歳';
      if (ageYears <= 5) return '3-5歳';
      if (ageYears <= 8) return '6-8歳';
      if (ageYears <= 12) return '9-12歳';
      return '13-18歳';
    });
    
    // Remove duplicates
    return [...new Set(ageTags)];
  } catch (error) {
    console.error('Error getting children ages:', error);
    return [];
  }
};

/**
 * GET /api/spots/search
 * Tìm kiếm địa điểm theo keyword (tên hoặc tag)
 * Không cần đăng nhập (Public API cho cả Guest)
 */
const searchSpots = async (req, res) => {
  try {
    const { 
      keyword = '',           // Từ khóa tìm kiếm (tên, mô tả hoặc tag)
      category,               // Lọc theo category tags (動物園, 博物館, 公園, 室内, 屋外, 雨OK, etc.)
      age,                    // Lọc theo độ tuổi tags (3-5歳, 6-8歳, etc.)
      price,                  // Lọc theo giá tags (無料, 1000円以下, etc.)
      rating,                 // Lọc theo đánh giá (can be comma-separated for multiple ratings)
      lat,                    // Vĩ độ (để tính khoảng cách)
      lng,                    // Kinh độ
      distance,               // Khoảng cách tối đa (km)
      sort = 'recommended',   // Sắp xếp: recommended, distance, rating, name
      limit = 20,             // Số kết quả trên 1 trang
      offset = 0              // Vị trí bắt đầu
    } = req.query;

    // Build base query with tag filtering
    let tagJoins = '';
    let tagConditions = [];
    let tagParams = [];
    
    // Build WHERE conditions for spots table
    let conditions = ['spots.status = ?'];
    let params = ['PUBLIC'];

    // Keyword search (tên, mô tả hoặc tags)
    if (keyword) {
      // Search in name, description, or tags using subquery to avoid JOIN duplicates
      const searchPattern = `%${keyword}%`;
      conditions.push(`(
        spots.name LIKE ? 
        OR spots.description LIKE ? 
        OR EXISTS (
          SELECT 1 FROM spot_tags 
          WHERE spot_tags.spot_id = spots.spot_id 
          AND spot_tags.tag_name LIKE ?
        )
      )`);
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by category tags (動物園, 博物館, 公園, 図書館, 遊び場, プール, 科学, 室内, 屋外, 雨OK, 施設)
    // Each selected category must exist (AND logic) - spot must have ALL selected tags
    // Example: 雨OK + 屋外 → spot must have BOTH tags (which is impossible, so 0 results)
    if (category) {
      const categories = category.split(',');
      categories.forEach(cat => {
        tagConditions.push(`EXISTS (
          SELECT 1 FROM spot_tags 
          WHERE spot_tags.spot_id = spots.spot_id 
          AND spot_tags.tag_name = ?
        )`);
        tagParams.push(cat);
      });
    }

    // Filter by age tags (0-2歳, 3-5歳, 6-8歳, 9-12歳, 13-18歳)
    // Each selected age must exist (AND logic) - spot must be suitable for ALL selected ages
    if (age) {
      const ages = age.split(',');
      // Convert age like "3-5" to tag format "3-5歳"
      const ageTags = ages.map(a => a.includes('歳') ? a : `${a}歳`);
      ageTags.forEach(ageTag => {
        tagConditions.push(`EXISTS (
          SELECT 1 FROM spot_tags 
          WHERE spot_tags.spot_id = spots.spot_id 
          AND spot_tags.tag_name = ?
        )`);
        tagParams.push(ageTag);
      });
    }

    // Filter by price tags (無料, 1000円以下, 1000-3000円, 3000-5000円, 5000円以上)
    // Each selected price must exist (AND logic) - spot must match ALL selected prices
    if (price) {
      const prices = price.split(',');
      prices.forEach(priceTag => {
        tagConditions.push(`EXISTS (
          SELECT 1 FROM spot_tags 
          WHERE spot_tags.spot_id = spots.spot_id 
          AND spot_tags.tag_name = ?
        )`);
        tagParams.push(priceTag);
      });
    }

    // indoor, rain parameters are now handled via category parameter above

    // Handle age-based filtering for sort='age' BEFORE merging tag conditions
    if (sort === 'age' && req.user && req.user.user_id) {
      const childrenAges = await getUserChildrenAges(req.user.user_id);
      
      if (childrenAges.length > 0) {
        // Add filter condition: ONLY show spots that match children's age tags
        const ageFilterConditions = childrenAges.map(ageTag => {
          return `EXISTS (SELECT 1 FROM spot_tags WHERE spot_tags.spot_id = spots.spot_id AND spot_tags.tag_name = ?)`;
        });
        
        // Use OR logic for age filter when sorting by age (show if matches ANY child's age)
        tagConditions.push(`(${ageFilterConditions.join(' OR ')})`);
        childrenAges.forEach(ageTag => tagParams.push(ageTag));
      }
    }

    // Merge tag conditions into main conditions (using AND between different filter types)
    if (tagConditions.length > 0) {
      conditions.push(...tagConditions);
      params.push(...tagParams);
    }

    // Filter by rating - take the highest rating value if multiple selected
    if (rating) {
      const ratings = rating.split(',').map(r => parseFloat(r));
      const minRating = Math.max(...ratings); // Use highest rating selected
      conditions.push('spots.average_rating >= ?');
      params.push(minRating);
    }

    // Debug logging
    console.log('=== SEARCH FILTERS DEBUG ===');
    console.log('Filters received:', { keyword, category, age, price, rating, sort });
    console.log('User authenticated:', !!req.user, 'User ID:', req.user?.user_id);
    console.log('SQL Conditions:', conditions);
    console.log('SQL Params:', params);
    console.log('==========================');

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
          // Default location: Hanoi University of Science and Technology (HUST)
          // Coordinates: 21.0055° N, 105.8433° E
          const defaultLat = 21.0055;
          const defaultLng = 105.8433;
          // Calculate distance from default location
          distanceSelect = `
            (6371 * acos(
              cos(radians(${defaultLat})) * cos(radians(spots.latitude)) 
              * cos(radians(spots.longitude) - radians(${defaultLng})) 
              + sin(radians(${defaultLat})) * sin(radians(spots.latitude))
            )) as distance
          `;
          orderBy = 'distance ASC';
        }
        break;
      case 'rating':
        // Sort by rating DESC (highest first), then by review count
        orderBy = 'CAST(spots.average_rating AS DECIMAL(3,2)) DESC, spots.review_count DESC';
        break;
      case 'age':
        // Age-appropriate sorting based on user's children
        // For logged-in users: get children ages and prioritize matching spots
        // For guest users: fallback to recommended sorting
        if (req.user && req.user.user_id) {
          // Get user's children ages (filtering already done above)
          const childrenAges = await getUserChildrenAges(req.user.user_id);
          
          if (childrenAges.length > 0) {
            // Add age match score to prioritize spots matching children's ages
            const ageMatchCase = childrenAges.map((ageTag, index) => 
              `WHEN EXISTS (SELECT 1 FROM spot_tags WHERE spot_tags.spot_id = spots.spot_id AND spot_tags.tag_name = '${ageTag}') THEN ${childrenAges.length - index}`
            ).join(' ');
            
            orderBy = `(CASE ${ageMatchCase} ELSE 0 END) DESC, CAST(spots.average_rating AS DECIMAL(3,2)) DESC, spots.review_count DESC`;
          } else {
            // User has no children - sort by rating
            orderBy = 'CAST(spots.average_rating AS DECIMAL(3,2)) DESC, spots.review_count DESC';
          }
        } else {
          // Guest user - use recommended algorithm
          orderBy = '(spots.average_rating * 0.7 + LEAST(spots.review_count / 10, 5) * 0.3) DESC';
        }
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

    // Main query with pagination - no joins needed, all filtering via subqueries
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
          age: age || null,
          price: price || null,
          rating: rating || null,
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
 * GET /api/spots/:id/reviews
 * Lấy danh sách reviews chi tiết cho một spot
 * Bao gồm: user info, rating, comment, images, helpful_count
 * Hỗ trợ sorting và pagination
 */
const getSpotReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0, sort = 'newest' } = req.query;

    // Validate sort parameter
    const validSorts = {
      newest: 'r.created_at DESC',
      oldest: 'r.created_at ASC',
      highest_rating: 'r.rating DESC, r.created_at DESC',
      lowest_rating: 'r.rating ASC, r.created_at DESC',
      most_helpful: 'r.report_count ASC, r.created_at DESC' // Use report_count (lower is better)
    };

    const orderBy = validSorts[sort] || validSorts.newest;

    // Get reviews with user information
    const reviewsQuery = `
      SELECT 
        r.review_id,
        r.rating,
        r.comment,
        r.image_url,
        r.facilities_check,
        r.created_at,
        r.updated_at,
        u.user_id,
        u.name as user_name,
        u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.spot_id = ? AND r.is_hidden = FALSE
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const reviews = await db.query(reviewsQuery, [
      id,
      parseInt(limit),
      parseInt(offset)
    ]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM reviews 
      WHERE spot_id = ? AND is_hidden = FALSE
    `;
    const countResult = await db.query(countQuery, [id]);
    const total = countResult[0].total;

    // Format reviews with parsed JSON fields
    const formattedReviews = reviews.map(review => ({
      ...review,
      facilities_check: review.facilities_check 
        ? JSON.parse(review.facilities_check) 
        : null
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          total: total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + reviews.length) < total
        },
        sort_by: sort
      }
    });

  } catch (error) {
    console.error('Error fetching spot reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đánh giá'
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
  getSpotReviews,
  getSearchSuggestions
};
