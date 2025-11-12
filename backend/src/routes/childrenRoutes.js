/**
 * Children Routes - Định tuyến cho API quản lý hồ sơ trẻ em
 */

const express = require('express');
const router = express.Router();
const childrenController = require('../controllers/childrenController');
const { authenticateToken } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authentication
router.use(authenticateToken);

/**
 * GET /api/children
 * Lấy danh sách tất cả trẻ em của user
 */
router.get('/', childrenController.getChildren);

/**
 * GET /api/children/:id
 * Lấy thông tin chi tiết 1 trẻ
 */
router.get('/:id', childrenController.getChildById);

/**
 * POST /api/children
 * Thêm hồ sơ trẻ mới
 * Body: { name, birth_date, gender, interests, dislikes, special_needs }
 */
router.post('/', childrenController.createChild);

/**
 * PUT /api/children/:id
 * Cập nhật thông tin trẻ
 * Body: { name, birth_date, gender, interests, dislikes, special_needs }
 */
router.put('/:id', childrenController.updateChild);

/**
 * DELETE /api/children/:id
 * Xóa hồ sơ trẻ
 */
router.delete('/:id', childrenController.deleteChild);

module.exports = router;
