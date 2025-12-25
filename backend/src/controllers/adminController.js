/**
 * Admin Controller - Dashboard KPIs & Management
 * 
 * Chỉ dành cho Admin users
 * KPIs: Users, Spots, Reviews, Ratings, Growth trends
 */

const db = require('../database/db');

/**
 * GET /api/admin/dashboard
 * 
 * Dashboard KPIs với filter theo period
 * 
 * Query params:
 * - period: 7, 30, 90 (days) - default: 30
 * 
 * Returns:
 * - Total counts (users, spots, reviews, favorites, schedules)
 * - Average ratings
 * - Growth trends (new users, new reviews)
 * - Popular spots
 * - Active users stats
 */
const getDashboardKPIs = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const days = parseInt(period);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Use DATE() function in MySQL to compare only date part
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // 1. Total Counts
    const totalUsersQuery = 'SELECT COUNT(*) as total FROM users WHERE role = "USER"';
    const totalSpotsQuery = 'SELECT COUNT(*) as total FROM spots WHERE status = "PUBLIC"';
    const totalReviewsQuery = 'SELECT COUNT(*) as total FROM reviews WHERE is_hidden = FALSE';
    const totalFavoritesQuery = 'SELECT COUNT(*) as total FROM favorites';
    const totalSchedulesQuery = 'SELECT COUNT(*) as total FROM schedules';
    const totalChildrenQuery = 'SELECT COUNT(*) as total FROM children';

    const totalUsersRows = await db.query(totalUsersQuery);
    const totalSpotsRows = await db.query(totalSpotsQuery);
    const totalReviewsRows = await db.query(totalReviewsQuery);
    const totalFavoritesRows = await db.query(totalFavoritesQuery);
    const totalSchedulesRows = await db.query(totalSchedulesQuery);
    const totalChildrenRows = await db.query(totalChildrenQuery);

    const totalUsers = totalUsersRows && totalUsersRows.length > 0 ? totalUsersRows[0].total : 0;
    const totalSpots = totalSpotsRows && totalSpotsRows.length > 0 ? totalSpotsRows[0].total : 0;
    const totalReviews = totalReviewsRows && totalReviewsRows.length > 0 ? totalReviewsRows[0].total : 0;
    const totalFavorites = totalFavoritesRows && totalFavoritesRows.length > 0 ? totalFavoritesRows[0].total : 0;
    const totalSchedules = totalSchedulesRows && totalSchedulesRows.length > 0 ? totalSchedulesRows[0].total : 0;
    const totalChildren = totalChildrenRows && totalChildrenRows.length > 0 ? totalChildrenRows[0].total : 0;

    // 2. Average Review Rating
    const avgRatingQuery = `
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews
      FROM reviews 
      WHERE is_hidden = FALSE
    `;
    const avgRating = await db.query(avgRatingQuery);

    // 3. Growth in Period (New users, reviews, favorites in last X days)
    const newUsersQuery = `
      SELECT COUNT(*) as count
      FROM users 
      WHERE role = "USER" 
        AND DATE(created_at) >= ? 
        AND DATE(created_at) <= ?
    `;
    const newUsersRows = await db.query(newUsersQuery, [startDateStr, endDateStr]);
    const newUsers = newUsersRows && newUsersRows.length > 0 ? newUsersRows[0].count : 0;

    const newReviewsQuery = `
      SELECT COUNT(*) as count
      FROM reviews 
      WHERE is_hidden = FALSE 
        AND DATE(created_at) >= ? 
        AND DATE(created_at) <= ?
    `;
    const newReviewsRows = await db.query(newReviewsQuery, [startDateStr, endDateStr]);
    const newReviews = newReviewsRows && newReviewsRows.length > 0 ? newReviewsRows[0].count : 0;

    const newFavoritesQuery = `
      SELECT COUNT(*) as count
      FROM favorites 
      WHERE DATE(created_at) >= ? 
        AND DATE(created_at) <= ?
    `;
    const newFavoritesRows = await db.query(newFavoritesQuery, [startDateStr, endDateStr]);
    const newFavorites = newFavoritesRows && newFavoritesRows.length > 0 ? newFavoritesRows[0].count : 0;

    const newSchedulesQuery = `
      SELECT COUNT(*) as count
      FROM schedules 
      WHERE DATE(created_at) >= ? 
        AND DATE(created_at) <= ?
    `;
    const newSchedulesRows = await db.query(newSchedulesQuery, [startDateStr, endDateStr]);
    const newSchedules = newSchedulesRows && newSchedulesRows.length > 0 ? newSchedulesRows[0].count : 0;

    // 4. Monthly Active Users (users who created favorite/schedule/review in period)
    const activeUsersQuery = `
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM (
        SELECT user_id FROM favorites WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
        UNION
        SELECT user_id FROM schedules WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
        UNION
        SELECT user_id FROM reviews WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
      ) as active
    `;
    const activeUsersRows = await db.query(activeUsersQuery, [
      startDateStr, endDateStr,
      startDateStr, endDateStr,
      startDateStr, endDateStr
    ]);
    const activeUsers = activeUsersRows && activeUsersRows.length > 0 ? activeUsersRows[0].active_users : 0;

    // Calculate activity rate
    const activityRate = totalUsers > 0 
      ? ((activeUsers / totalUsers) * 100).toFixed(2)
      : 0;

    // 5. Top Popular Spots (by favorites + reviews in period)
    const popularSpotsQuery = `
      SELECT 
        s.spot_id,
        s.name,
        s.average_rating,
        s.review_count,
        s.favorite_count,
        (
          SELECT COUNT(*) 
          FROM favorites f 
          WHERE f.spot_id = s.spot_id 
            AND DATE(f.created_at) >= ? 
            AND DATE(f.created_at) <= ?
        ) as new_favorites,
        (
          SELECT COUNT(*) 
          FROM reviews r 
          WHERE r.spot_id = s.spot_id 
            AND DATE(r.created_at) >= ? 
            AND DATE(r.created_at) <= ?
        ) as new_reviews
      FROM spots s
      WHERE s.status = 'PUBLIC'
      ORDER BY (new_favorites + new_reviews * 2) DESC, s.average_rating DESC
      LIMIT 10
    `;
    const popularSpotsRows = await db.query(popularSpotsQuery, [
      startDateStr, endDateStr,
      startDateStr, endDateStr
    ]);
    const popularSpots = Array.isArray(popularSpotsRows) ? popularSpotsRows : [];

    // 6. Rating Distribution
    const ratingDistributionQuery = `
      SELECT 
        rating,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reviews WHERE is_hidden = FALSE)) as percentage
      FROM reviews
      WHERE is_hidden = FALSE
      GROUP BY rating
      ORDER BY rating DESC
    `;
    const ratingDistributionRows = await db.query(ratingDistributionQuery);
    const ratingDistribution = Array.isArray(ratingDistributionRows) ? ratingDistributionRows : [];

    // 7. Category Distribution of Spots - SKIPPED (spots table doesn't have category column)
    // Using tags instead would require complex JOIN with spot_tags table
    const categoryDistribution = [];

    // 8. User Engagement Metrics
    const engagementQuery = `
      SELECT 
        AVG(favorites_per_user) as avg_favorites_per_user,
        AVG(schedules_per_user) as avg_schedules_per_user,
        AVG(reviews_per_user) as avg_reviews_per_user
      FROM (
        SELECT 
          u.user_id,
          (SELECT COUNT(*) FROM favorites WHERE user_id = u.user_id) as favorites_per_user,
          (SELECT COUNT(*) FROM schedules WHERE user_id = u.user_id) as schedules_per_user,
          (SELECT COUNT(*) FROM reviews WHERE user_id = u.user_id) as reviews_per_user
        FROM users u
        WHERE u.role = 'USER'
      ) as user_stats
    `;
    const engagement = await db.query(engagementQuery);

    // 9. Daily Trend (last 7 days of activity)
    const dailyTrendQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as activities
      FROM (
        SELECT created_at FROM favorites WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        UNION ALL
        SELECT created_at FROM schedules WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        UNION ALL
        SELECT created_at FROM reviews WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ) as all_activities
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `;
    const dailyTrendRows = await db.query(dailyTrendQuery);
    const dailyTrend = Array.isArray(dailyTrendRows) ? dailyTrendRows : [];

    // Build response
    const kpis = {
      period: {
        days: days,
        start_date: startDateStr,
        end_date: endDateStr
      },
      totals: {
        users: totalUsers,
        spots: totalSpots,
        reviews: totalReviews,
        favorites: totalFavorites,
        schedules: totalSchedules,
        children: totalChildren
      },
      ratings: {
        average: avgRating[0]?.average_rating ? parseFloat(Number(avgRating[0].average_rating).toFixed(2)) : 0,
        total_reviews: avgRating[0]?.total_reviews || 0,
        distribution: ratingDistribution.map(r => ({
          rating: r.rating,
          count: r.count,
          percentage: r.percentage ? parseFloat(Number(r.percentage).toFixed(2)) : 0
        }))
      },
      growth: {
        new_users: newUsers,
        new_reviews: newReviews,
        new_favorites: newFavorites,
        new_schedules: newSchedules
      },
      activity: {
        active_users: activeUsers,
        activity_rate: parseFloat(activityRate),
        avg_favorites_per_user: engagement[0]?.avg_favorites_per_user ? parseFloat(Number(engagement[0].avg_favorites_per_user).toFixed(2)) : 0,
        avg_schedules_per_user: engagement[0]?.avg_schedules_per_user ? parseFloat(Number(engagement[0].avg_schedules_per_user).toFixed(2)) : 0,
        avg_reviews_per_user: engagement[0]?.avg_reviews_per_user ? parseFloat(Number(engagement[0].avg_reviews_per_user).toFixed(2)) : 0
      },
      popular_spots: popularSpots.map(s => ({
        spot_id: s.spot_id,
        name: s.name,
        average_rating: s.average_rating,
        review_count: s.review_count,
        favorite_count: s.favorite_count,
        new_favorites: s.new_favorites,
        new_reviews: s.new_reviews,
        popularity_score: s.new_favorites + (s.new_reviews * 2)
      })),
      categories: categoryDistribution,
      daily_trend: dailyTrend.reverse() // Oldest first
    };

    res.json({
      success: true,
      data: kpis
    });

  } catch (error) {
    console.error('Get dashboard KPIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy KPIs',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/users
 * 
 * Danh sách tất cả users với stats
 * 
 * Query params:
 * - limit, offset: Pagination
 * - sort: created_at, favorites, reviews (default: created_at)
 */
const getAllUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0, sort = 'created_at' } = req.query;

    let orderBy = 'u.created_at DESC';
    if (sort === 'favorites') {
      orderBy = 'favorites_count DESC';
    } else if (sort === 'reviews') {
      orderBy = 'reviews_count DESC';
    }

    const query = `
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.created_at,
        u.last_login_at,
        (SELECT COUNT(*) FROM children WHERE user_id = u.user_id) as children_count,
        (SELECT COUNT(*) FROM favorites WHERE user_id = u.user_id) as favorites_count,
        (SELECT COUNT(*) FROM schedules WHERE user_id = u.user_id) as schedules_count,
        (SELECT COUNT(*) FROM reviews WHERE user_id = u.user_id) as reviews_count
      FROM users u
      WHERE u.role = 'USER'
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const users = await db.query(query, [parseInt(limit), parseInt(offset)]);

    // Count total
    const countQuery = 'SELECT COUNT(*) as total FROM users WHERE role = "USER"';
    const countResult = await db.query(countQuery);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + users.length) < countResult[0].total
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách users',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/spots
 * 
 * Danh sách tất cả spots với stats (kể cả DRAFT, ARCHIVED)
 */
const getAllSpots = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    let conditions = [];
    let params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        s.*,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = 1 LIMIT 1) as main_image,
        (SELECT COUNT(*) FROM reviews WHERE spot_id = s.spot_id) as review_count,
        (SELECT COUNT(*) FROM favorites WHERE spot_id = s.spot_id) as favorite_count,
        (SELECT COUNT(*) FROM schedules WHERE spot_id = s.spot_id) as schedule_count
      FROM spots s
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));
    const spots = await db.query(query, params);

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM spots ${whereClause}`;
    const countParams = conditions.length > 0 ? [status] : [];
    const countResult = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        spots: spots.map(s => ({
          ...s,
          facilities: s.facilities ? JSON.parse(s.facilities) : {},
          operating_hours: s.operating_hours ? JSON.parse(s.operating_hours) : {}
        })),
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + spots.length) < countResult[0].total
        }
      }
    });

  } catch (error) {
    console.error('Get all spots error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách spots',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardKPIs,
  getAllUsers,
  getAllSpots
};
