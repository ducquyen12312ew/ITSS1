/**
 * Authentication Middleware
 * Xác thực JWT token và kiểm tra quyền truy cập
 */

const jwt = require('jsonwebtoken');
const db = require('../database/db');

// Secret key cho JWT (nên để trong .env)
const JWT_SECRET = process.env.JWT_SECRET || 'kodomo_weekend_navi_secret_key_2025';
const JWT_EXPIRES_IN = '7d'; // Token hết hạn sau 7 ngày

/**
 * Middleware: Xác thực token
 * Kiểm tra JWT token trong header Authorization
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Lấy token từ header Authorization: "Bearer TOKEN"
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'トークンが提供されていません (Token không được cung cấp)'
            });
        }

        // Verify token
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'トークンが無効または期限切れです (Token không hợp lệ hoặc đã hết hạn)'
                });
            }

            // Kiểm tra user còn tồn tại và active không
            const users = await db.query(
                'SELECT user_id, email, role, status FROM users WHERE user_id = ?',
                [decoded.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'ユーザーが見つかりません (Không tìm thấy người dùng)'
                });
            }

            const user = users[0];

            // Kiểm tra user có bị banned không
            if (user.status === 'BANNED') {
                return res.status(403).json({
                    success: false,
                    message: 'アカウントが停止されています (Tài khoản đã bị khóa)'
                });
            }

            // Lưu thông tin user vào request để dùng ở các middleware/controller tiếp theo
            req.user = {
                userId: user.user_id,
                email: user.email,
                role: user.role,
                status: user.status
            };

            next();
        });
    } catch (error) {
        console.error('❌ Auth Middleware Error:', error);
        return res.status(500).json({
            success: false,
            message: 'サーバーエラー (Lỗi server)'
        });
    }
};

/**
 * Middleware: Kiểm tra quyền ADMIN
 * Chỉ cho phép user có role = 'ADMIN' truy cập
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '認証が必要です (Cần xác thực)'
        });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: '管理者権限が必要です (Cần quyền quản trị viên)'
        });
    }

    next();
};

/**
 * Middleware: Kiểm tra quyền USER
 * Chỉ cho phép user có role = 'USER' hoặc 'ADMIN' truy cập
 */
const requireUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '認証が必要です (Cần xác thực)'
        });
    }

    // USER hoặc ADMIN đều được phép
    if (req.user.role !== 'USER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'ユーザー権限が必要です (Cần quyền người dùng)'
        });
    }

    next();
};

/**
 * Helper function: Tạo JWT token
 */
const generateToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireUser,
    generateToken,
    JWT_SECRET,
    JWT_EXPIRES_IN
};
