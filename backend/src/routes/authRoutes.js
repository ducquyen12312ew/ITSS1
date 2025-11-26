/**
 * Authentication Routes
 * Định nghĩa các endpoint cho đăng ký/đăng nhập
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 * @body    { firstName, lastName, email, password, confirmPassword, agreement, role? }
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất
 * @access  Private (cần token)
 * @headers Authorization: Bearer TOKEN
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Lấy thông tin user đang đăng nhập
 * @access  Private (cần token)
 * @headers Authorization: Bearer TOKEN
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Cập nhật thông tin user
 * @access  Private (cần token)
 * @headers Authorization: Bearer TOKEN
 * @body    { firstName?, lastName?, email? }
 */
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
