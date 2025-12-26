const db = require('../database/db');

/**
 * User Management Controller
 * Admin quản lý tập trung thông tin người dùng
 */

/**
 * Get all users with filtering and search
 * GET /api/admin/user-management
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      search,           // Tìm kiếm theo name hoặc email
      role,             // Filter: 'USER' | 'ADMIN' | 'all'
      status,           // Filter: 'ACTIVE' | 'BANNED' | 'all'
      email_domain,     // Filter theo email domain (gmail.com, yahoo.com, etc)
      date_from,        // Ngày đăng ký từ (YYYY-MM-DD)
      date_to,          // Ngày đăng ký đến (YYYY-MM-DD)
      sort = 'latest',  // 'latest' | 'oldest' | 'name' | 'last_login'
      limit = 20,
      offset = 0
    } = req.query;

    // Build WHERE clauses
    const conditions = [];
    const params = [];

    // Search by name, email or child's name
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      // Match name, email and children's name (case-insensitive)
      conditions.push("((LOWER(u.name) LIKE ?) OR (LOWER(u.email) LIKE ?) OR EXISTS (SELECT 1 FROM children cc WHERE cc.user_id = u.user_id AND LOWER(cc.name) LIKE ?))");
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by role
    if (role && role !== 'all') {
      conditions.push('u.role = ?');
      params.push(role.toUpperCase());
    }

    // Filter by status (use status column)
    if (status && status !== 'all') {
      if (status.toLowerCase() === 'active') {
        conditions.push("u.status = 'ACTIVE'");
      } else if (status.toLowerCase() === 'banned') {
        conditions.push("u.status = 'BANNED'");
      }
    }

    // Filter by email domain
    if (email_domain) {
      conditions.push('u.email LIKE ?');
      params.push(`%@${email_domain}`);
    }

    // Filter by date range
    if (date_from) {
      conditions.push('DATE(u.created_at) >= ?');
      params.push(date_from);
    }
    if (date_to) {
      conditions.push('DATE(u.created_at) <= ?');
      params.push(date_to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Determine sort order
    let orderBy = 'u.created_at DESC'; // Default: latest
    if (sort === 'oldest') {
      orderBy = 'u.created_at ASC';
    } else if (sort === 'name') {
      orderBy = 'u.name ASC';
    } else if (sort === 'last_login') {
      orderBy = 'u.last_login_at DESC';
    }

    // Get users with statistics
    const usersQuery = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.created_at,
        u.last_login_at,
        COUNT(DISTINCT r.review_id) as total_reviews,
        COUNT(DISTINCT f.favorite_id) as total_favorites,
        COUNT(DISTINCT s.schedule_id) as total_schedules,
        COUNT(DISTINCT c.child_id) as total_children
      FROM users u
      LEFT JOIN reviews r ON u.user_id = r.user_id
      LEFT JOIN favorites f ON u.user_id = f.user_id
      LEFT JOIN schedules s ON u.user_id = s.user_id
      LEFT JOIN children c ON u.user_id = c.user_id
      ${whereClause}
      GROUP BY u.user_id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const users = await db.query(usersQuery, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT u.user_id) as total
      FROM users u
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'USER' THEN 1 ELSE 0 END) as user_count,
        SUM(CASE WHEN status = 'BANNED' THEN 1 ELSE 0 END) as banned_count,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_users_7days,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_30days
      FROM users u
      ${whereClause}
    `;
    const statsResult = await db.query(statsQuery, params);
    const statistics = statsResult[0] || {};

    // Format users data
    const formattedUsers = users.map(user => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'ACTIVE',
      is_banned: (user.status === 'BANNED'),
      created_at: user.created_at,
      last_login_at: user.last_login_at,
      activity: {
        total_reviews: user.total_reviews || 0,
        total_favorites: user.total_favorites || 0,
        total_schedules: user.total_schedules || 0,
        total_children: user.total_children || 0
      }
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        statistics: {
          total_users: statistics.total_users || 0,
          admin_count: statistics.admin_count || 0,
          user_count: statistics.user_count || 0,
          banned_count: statistics.banned_count || 0,
          active_count: statistics.active_count || 0,
          new_users_7days: statistics.new_users_7days || 0,
          new_users_30days: statistics.new_users_30days || 0
        },
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách users',
      error: error.message
    });
  }
};

/**
 * Get user detail
 * GET /api/admin/user-management/:userId
 */
const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user basic info
    const userQuery = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.created_at,
        u.last_login_at,
        u.updated_at
      FROM users u
      WHERE u.user_id = ?
    `;
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    const user = userResult[0];

    // Get user's children
    const childrenQuery = `
      SELECT child_id, name, birth_date, avatar_url
      FROM children
      WHERE user_id = ?
      ORDER BY created_at ASC
    `;
    const children = await db.query(childrenQuery, [userId]);

    // Get user's reviews
    const reviewsQuery = `
      SELECT 
        r.review_id,
        r.spot_id,
        s.name as spot_name,
        r.rating,
        r.comment,
        r.is_hidden,
        r.report_count,
        r.created_at
      FROM reviews r
      JOIN spots s ON r.spot_id = s.spot_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    const reviews = await db.query(reviewsQuery, [userId]);

    // Get user's favorites
    const favoritesQuery = `
      SELECT 
        f.favorite_id,
        f.spot_id,
        s.name as spot_name,
        f.created_at
      FROM favorites f
      JOIN spots s ON f.spot_id = s.spot_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
      LIMIT 10
    `;
    const favorites = await db.query(favoritesQuery, [userId]);

    // Get user's schedules
    const schedulesQuery = `
      SELECT 
        sc.schedule_id,
        sc.spot_id,
        s.name as spot_name,
        sc.scheduled_date,
        sc.time,
        sc.status,
        sc.created_at
      FROM schedules sc
      JOIN spots s ON sc.spot_id = s.spot_id
      WHERE sc.user_id = ?
      ORDER BY sc.scheduled_date DESC
      LIMIT 10
    `;
    const schedules = await db.query(schedulesQuery, [userId]);

    // Get activity statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT r.review_id) as total_reviews,
        COUNT(DISTINCT f.favorite_id) as total_favorites,
        COUNT(DISTINCT s.schedule_id) as total_schedules,
        COUNT(DISTINCT c.child_id) as total_children,
        AVG(r.rating) as average_rating
      FROM users u
      LEFT JOIN reviews r ON u.user_id = r.user_id
      LEFT JOIN favorites f ON u.user_id = f.user_id
      LEFT JOIN schedules s ON u.user_id = s.user_id
      LEFT JOIN children c ON u.user_id = c.user_id
      WHERE u.user_id = ?
      GROUP BY u.user_id
    `;
    const statsResult = await db.query(statsQuery, [userId]);
    const stats = statsResult[0] || {};

    res.json({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || 'ACTIVE',
          is_banned: (user.status === 'BANNED'),
          created_at: user.created_at,
          last_login_at: user.last_login_at,
          updated_at: user.updated_at
        },
        children: children || [],
        recent_reviews: reviews || [],
        recent_favorites: favorites || [],
        recent_schedules: schedules || [],
        statistics: {
          total_reviews: stats.total_reviews || 0,
          total_favorites: stats.total_favorites || 0,
          total_schedules: stats.total_schedules || 0,
          total_children: stats.total_children || 0,
          average_rating: stats.average_rating ? Number(stats.average_rating).toFixed(1) : null
        }
      }
    });
  } catch (error) {
    console.error('Error getting user detail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết user',
      error: error.message
    });
  }
};

/**
 * Toggle user ban status
 * PATCH /api/admin/user-management/:userId/toggle-ban
 */
const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_banned } = req.body;

    // Validate
    if (typeof is_banned !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_banned phải là boolean (true/false)'
      });
    }

    // Check if user exists
    const userCheck = await db.query('SELECT user_id, role, status FROM users WHERE user_id = ?', [userId]);
    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Prevent banning admin users
    if (userCheck[0].role === 'ADMIN' && is_banned) {
      return res.status(403).json({
        success: false,
        message: 'Không thể ban tài khoản Admin'
      });
    }

    // Update ban status (use status column)
    const newStatus = is_banned ? 'BANNED' : 'ACTIVE';
    await db.query(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE user_id = ?',
      [newStatus, userId]
    );

    const message = is_banned ? 'アカウントがBANされました' : 'アカウントがUNBANされました';
    const status = is_banned ? 'BANNED' : 'ACTIVE';

    res.json({
      success: true,
      message,
      data: {
        user_id: parseInt(userId),
        is_banned,
        status
      }
    });
  } catch (error) {
    console.error('Error toggling user ban:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi trạng thái user',
      error: error.message
    });
  }
};

/**
 * Change user role
 * PATCH /api/admin/user-management/:userId/change-role
 */
const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role phải là USER hoặc ADMIN'
      });
    }

    // Check if user exists
    const userCheck = await db.query('SELECT user_id, role FROM users WHERE user_id = ?', [userId]);
    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Update role
    await db.query(
      'UPDATE users SET role = ?, updated_at = NOW() WHERE user_id = ?',
      [role, userId]
    );

    res.json({
      success: true,
      message: `Đã thay đổi role thành ${role}`,
      data: {
        user_id: parseInt(userId),
        role
      }
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi role user',
      error: error.message
    });
  }
};

/**
 * Delete user (hard delete)
 * DELETE /api/admin/user-management/:userId
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userCheck = await db.query('SELECT user_id, role FROM users WHERE user_id = ?', [userId]);
    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Prevent deleting admin users
    if (userCheck[0].role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa tài khoản Admin'
      });
    }

    // Delete user (CASCADE will delete related data)
    await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Đã xóa user thành công',
      data: {
        user_id: parseInt(userId)
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa user',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetail,
  toggleUserBan,
  changeUserRole,
  deleteUser
};
