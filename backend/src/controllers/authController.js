/**
 * Authentication Controller
 * Xử lý đăng ký, đăng nhập, đăng xuất
 */

const bcrypt = require('bcrypt');
const db = require('../database/db');
const { generateToken } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới
 * 
 * Body:
 * - firstName: Tên (bắt buộc)
 * - lastName: Họ (bắt buộc)
 * - email: Email (bắt buộc, unique)
 * - password: Mật khẩu (bắt buộc, tối thiểu 8 ký tự)
 * - confirmPassword: Xác nhận mật khẩu (bắt buộc)
 * - agreement: Đồng ý điều khoản (bắt buộc, true)
 * - role: USER hoặc ADMIN (optional, mặc định USER)
 */
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, agreement, role } = req.body;

        // === VALIDATION ===
        
        // 1. Kiểm tra các trường bắt buộc
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'すべての必須フィールドを入力してください (Vui lòng điền tất cả các trường bắt buộc)',
                errors: {
                    firstName: !firstName ? '名前を入力してください (Vui lòng nhập tên)' : null,
                    lastName: !lastName ? '姓を入力してください (Vui lòng nhập họ)' : null,
                    email: !email ? 'メールアドレスを入力してください (Vui lòng nhập email)' : null,
                    password: !password ? 'パスワードを入力してください (Vui lòng nhập mật khẩu)' : null,
                    confirmPassword: !confirmPassword ? 'パスワード確認を入力してください (Vui lòng xác nhận mật khẩu)' : null
                }
            });
        }

        // 2. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '有効なメールアドレスを入力してください (Vui lòng nhập email hợp lệ)'
            });
        }

        // 3. Kiểm tra password tối thiểu 8 ký tự
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'パスワードは8文字以上にしてください (Mật khẩu phải có ít nhất 8 ký tự)'
            });
        }

        // 4. Kiểm tra password và confirmPassword khớp
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'パスワードが一致しません (Mật khẩu không khớp)'
            });
        }

        // 5. Kiểm tra đồng ý điều khoản
        if (!agreement) {
            return res.status(400).json({
                success: false,
                message: '利用規約とプライバシーポリシーに同意してください (Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật)'
            });
        }

        // === CHECK EMAIL ĐÃ TỒN TẠI CHƯA ===
        const existingUsers = await db.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'このメールアドレスは既に登録されています (Email này đã được đăng ký)'
            });
        }

        // === MÃ HÓA PASSWORD ===
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // === TẠO USER MỚI ===
        const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER'; // Mặc định là USER
        
        const result = await db.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role, status, agreement, created_at) 
             VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, NOW())`,
            [email, passwordHash, firstName, lastName, userRole, agreement ? 1 : 0]
        );

        const userId = result.insertId;

        // === TẠO JWT TOKEN ===
        const token = generateToken(userId, email, userRole);

        // === CÂP NHẬT LAST LOGIN ===
        await db.query(
            'UPDATE users SET last_login_at = NOW() WHERE user_id = ?',
            [userId]
        );

        // === RESPONSE ===
        res.status(201).json({
            success: true,
            message: '登録が完了しました (Đăng ký thành công)',
            data: {
                user: {
                    userId,
                    email,
                    firstName,
                    lastName,
                    role: userRole
                },
                token,
                redirectTo: userRole === 'ADMIN' ? '/admin/dashboard' : '/home'
            }
        });

    } catch (error) {
        console.error('❌ Register Error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました (Đã xảy ra lỗi server)',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * POST /api/auth/login
 * Đăng nhập
 * 
 * Body:
 * - email: Email (bắt buộc)
 * - password: Mật khẩu (bắt buộc)
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // === VALIDATION ===
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'メールアドレスとパスワードを入力してください (Vui lòng nhập email và mật khẩu)'
            });
        }

        // === TÌM USER THEO EMAIL ===
        const users = await db.query(
            'SELECT user_id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが間違っています (Email hoặc mật khẩu không đúng)'
            });
        }

        const user = users[0];

        // === KIỂM TRA TÀI KHOẢN BỊ BANNED ===
        if (user.status === 'BANNED') {
            return res.status(403).json({
                success: false,
                message: 'アカウントが停止されています。管理者にお問い合わせください (Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên)'
            });
        }

        // === SO SÁNH PASSWORD ===
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが間違っています (Email hoặc mật khẩu không đúng)'
            });
        }

        // === TẠO JWT TOKEN ===
        const token = generateToken(user.user_id, user.email, user.role);

        // === CÂP NHẬT LAST LOGIN ===
        await db.query(
            'UPDATE users SET last_login_at = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        // === RESPONSE ===
        res.status(200).json({
            success: true,
            message: 'ログインに成功しました (Đăng nhập thành công)',
            data: {
                user: {
                    userId: user.user_id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                },
                token,
                redirectTo: user.role === 'ADMIN' ? '/admin/dashboard' : '/home'
            }
        });

    } catch (error) {
        console.error('❌ Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました (Đã xảy ra lỗi server)',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * POST /api/auth/logout
 * Đăng xuất (Frontend sẽ xóa token)
 * 
 * Headers:
 * - Authorization: Bearer TOKEN
 */
const logout = async (req, res) => {
    try {
        // Backend chỉ trả về success
        // Frontend sẽ xóa token khỏi localStorage/sessionStorage
        res.status(200).json({
            success: true,
            message: 'ログアウトしました (Đã đăng xuất)'
        });
    } catch (error) {
        console.error('❌ Logout Error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました (Đã xảy ra lỗi server)'
        });
    }
};

/**
 * GET /api/auth/profile
 * Lấy thông tin user đang đăng nhập
 * 
 * Headers:
 * - Authorization: Bearer TOKEN
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Từ middleware authenticateToken

        // Lấy thông tin chi tiết user
        const users = await db.query(
            `SELECT 
                user_id, email, first_name, last_name, role, status, 
                location_lat, location_lng, location_name, 
                created_at, last_login_at
             FROM users 
             WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません (Không tìm thấy người dùng)'
            });
        }

        const user = users[0];

        res.status(200).json({
            success: true,
            data: {
                userId: user.user_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                status: user.status,
                location: {
                    lat: user.location_lat,
                    lng: user.location_lng,
                    name: user.location_name
                },
                createdAt: user.created_at,
                lastLoginAt: user.last_login_at
            }
        });

    } catch (error) {
        console.error('❌ Get Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました (Đã xảy ra lỗi server)'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile
};
