/**
 * Schedules Routes - API cho tính năng lịch trình cuối tuần
 */

const express = require('express');
const router = express.Router();
const schedulesController = require('../controllers/schedulesController');
const { authenticateToken } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authentication
router.use(authenticateToken);

/**
 * GET /api/schedules
 * Lấy danh sách lịch trình của user
 * Query params: status, from_date, to_date, limit, offset
 */
router.get('/', schedulesController.getSchedules);

/**
 * GET /api/schedules/calendar/:year/:month
 * Lấy lịch trình theo tháng (calendar view)
 * Params: year (2025), month (1-12)
 */
router.get('/calendar/:year/:month', schedulesController.getCalendarSchedules);

/**
 * GET /api/schedules/:scheduleId
 * Lấy chi tiết một lịch trình
 */
router.get('/:scheduleId', schedulesController.getScheduleById);

/**
 * POST /api/schedules
 * Thêm lịch trình mới
 * Body: { spot_id, scheduled_date, time_slot, notes }
 */
router.post('/', schedulesController.addSchedule);

/**
 * PUT /api/schedules/:scheduleId
 * Cập nhật lịch trình
 * Body: { scheduled_date, time_slot, notes, status }
 */
router.put('/:scheduleId', schedulesController.updateSchedule);

/**
 * DELETE /api/schedules/:scheduleId
 * Xóa lịch trình
 * Query param: ?soft_delete=true để chỉ đổi status thành CANCELLED
 */
router.delete('/:scheduleId', schedulesController.deleteSchedule);

module.exports = router;
