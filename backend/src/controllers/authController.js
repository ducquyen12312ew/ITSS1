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
                message: 'すべての必須フィールドを入力してください',
                errors: {
                    firstName: !firstName ? '名前を入力してください ' : null,
                    lastName: !lastName ? '姓を入力してください ' : null,
                    email: !email ? 'メールアドレスを入力してください ' : null,
                    password: !password ? 'パスワードを入力してください ' : null,
                    confirmPassword: !confirmPassword ? 'パスワード確認を入力してください ' : null
                }
            });
        }

        // 2. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '有効なメールアドレスを入力してください '
            });
        }

        // 3. Kiểm tra password tối thiểu 8 ký tự
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'パスワードは8文字以上にしてください '
            });
        }

        // 4. Kiểm tra password và confirmPassword khớp
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'パスワードが一致しません '
            });
        }

        // 5. Kiểm tra đồng ý điều khoản
        if (!agreement) {
            return res.status(400).json({
                success: false,
                message: '利用規約とプライバシーポリシーに同意してください '
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
                message: 'このメールアドレスは既に登録されています '
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
            message: '登録が完了しました ',
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
            message: 'サーバーエラーが発生しました ',
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
                message: 'メールアドレスとパスワードを入力してください '
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
                message: 'メールアドレスまたはパスワードが間違っています '
            });
        }

        const user = users[0];

        // === KIỂM TRA TÀI KHOẢN BỊ BANNED ===
        if (user.status === 'BANNED') {
            return res.status(403).json({
                success: false,
                message: 'アカウントが停止されています。管理者にお問い合わせください '
            });
        }

        // === SO SÁNH PASSWORD ===
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが間違っています '
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
            message: 'ログインに成功しました ',
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
            message: 'サーバーエラーが発生しました',
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
            message: 'ログアウトしました '
        });
    } catch (error) {
        console.error('❌ Logout Error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました '
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
                message: 'ユーザーが見つかりません '
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
            message: 'サーバーエラーが発生しました '
        });
    }
};

/**
 * PUT /api/auth/profile
 * Cập nhật thông tin user
 * 
 * Headers:
 * - Authorization: Bearer TOKEN
 * 
 * Body:
 * - firstName: Tên (optional)
 * - lastName: Họ (optional)
 * - email: Email (optional)
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Từ middleware authenticateToken
        const { firstName, lastName, email } = req.body;

        // Kiểm tra ít nhất 1 trường được cung cấp
        if (!firstName && !lastName && !email) {
            return res.status(400).json({
                success: false,
                message: '更新する情報を入力してください'
            });
        }

        // Validate email format nếu có
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: '有効なメールアドレスを入力してください'
                });
            }

            // Kiểm tra email đã tồn tại chưa (trừ email của chính user)
            const existingUsers = await db.query(
                'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
                [email, userId]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'このメールアドレスは既に使用されています'
                });
            }
        }

        // Chuẩn bị câu query động
        const updateFields = [];
        const values = [];

        if (firstName) {
            updateFields.push('first_name = ?');
            values.push(firstName);
        }
        if (lastName) {
            updateFields.push('last_name = ?');
            values.push(lastName);
        }
        if (email) {
            updateFields.push('email = ?');
            values.push(email);
        }

        values.push(userId); // Thêm userId cho WHERE clause

        // Cập nhật database
        await db.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
            values
        );

        // Lấy thông tin user đã cập nhật
        const updatedUsers = await db.query(
            `SELECT user_id, email, first_name, last_name, role FROM users WHERE user_id = ?`,
            [userId]
        );

        const updatedUser = updatedUsers[0];

        res.status(200).json({
            success: true,
            message: 'プロフィールを更新しました',
            data: {
                userId: updatedUser.user_id,
                email: updatedUser.email,
                firstName: updatedUser.first_name,
                lastName: updatedUser.last_name,
                role: updatedUser.role
            }
        });

    } catch (error) {
        console.error('❌ Update Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile
};
