/**
 * Schedules Controller - Quản lý lịch trình cuối tuần
 * Cho phép user thêm/xem/sửa/xóa lịch trình đến các địa điểm
 * Yêu cầu authentication
 */

const db = require('../database/db');

/**
 * GET /api/schedules
 * Lấy danh sách tất cả lịch trình của user
 * Có thể filter theo status và date range
 */
const getSchedules = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      status,           // PLANNED, COMPLETED, CANCELLED
      from_date,        // YYYY-MM-DD
      to_date,          // YYYY-MM-DD
      limit = 50, 
      offset = 0 
    } = req.query;

    // Build WHERE conditions
    let conditions = ['sc.user_id = ?'];
    let params = [userId];

    if (status) {
      conditions.push('sc.status = ?');
      params.push(status);
    }

    if (from_date) {
      conditions.push('sc.scheduled_date >= ?');
      params.push(from_date);
    }

    if (to_date) {
      conditions.push('sc.scheduled_date <= ?');
      params.push(to_date);
    }

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM schedules sc
      WHERE ${conditions.join(' AND ')}
    `;
    const countResult = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Get schedules with spot details
    const query = `
      SELECT 
        sc.schedule_id,
        sc.spot_id,
        DATE_FORMAT(sc.scheduled_date, '%Y-%m-%d') as scheduled_date,
        sc.time_slot,
        sc.status,
        sc.notes,
        sc.created_at,
        s.name as spot_name,
        s.category,
        s.address as spot_address,
        s.latitude,
        s.longitude,
        s.price_range,
        s.is_indoor,
        s.weather_suitable,
        s.estimated_visit_duration,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM schedules sc
      JOIN spots s ON sc.spot_id = s.spot_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY sc.scheduled_date ASC, sc.time_slot ASC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));
    const schedules = await db.query(query, params);

    // Parse tags and format
    const schedulesWithParsedData = schedules.map(schedule => ({
      ...schedule,
      tags: schedule.tags ? schedule.tags.split(',') : []
    }));

    res.json({
      success: true,
      data: {
        schedules: schedulesWithParsedData,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + schedules.length) < total
        }
      }
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch trình',
      error: error.message
    });
  }
};

/**
 * GET /api/schedules/:scheduleId
 * Lấy chi tiết một lịch trình
 */
const getScheduleById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scheduleId } = req.params;

    const query = `
      SELECT 
        sc.schedule_id,
        sc.user_id,
        sc.spot_id,
        DATE_FORMAT(sc.scheduled_date, '%Y-%m-%d') as scheduled_date,
        sc.time_slot,
        sc.status,
        sc.notes,
        sc.created_at,
        sc.updated_at,
        s.name as spot_name,
        s.description as spot_description,
        s.category,
        s.min_age,
        s.max_age,
        s.price_range,
        s.is_indoor,
        s.address,
        s.latitude,
        s.longitude,
        s.google_maps_url,
        s.operating_hours,
        s.weather_suitable,
        s.estimated_visit_duration,
        s.facilities,
        s.average_rating,
        s.review_count,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM schedules sc
      JOIN spots s ON sc.spot_id = s.spot_id
      WHERE sc.schedule_id = ? AND sc.user_id = ?
    `;

    const schedules = await db.query(query, [scheduleId, userId]);

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch trình hoặc bạn không có quyền truy cập'
      });
    }

    const schedule = schedules[0];

    // Parse JSON fields
    const formattedSchedule = {
      ...schedule,
      operating_hours: schedule.operating_hours ? JSON.parse(schedule.operating_hours) : {},
      facilities: schedule.facilities ? JSON.parse(schedule.facilities) : {},
      tags: schedule.tags ? schedule.tags.split(',') : []
    };

    res.json({
      success: true,
      data: formattedSchedule
    });

  } catch (error) {
    console.error('Get schedule by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết lịch trình',
      error: error.message
    });
  }
};

/**
 * POST /api/schedules
 * Thêm lịch trình mới
 * Body: { spot_id, scheduled_date, time_slot, notes }
 */
const addSchedule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { spot_id, scheduled_date, time_slot, notes } = req.body;

    // Validate required fields
    if (!spot_id || !scheduled_date) {
      return res.status(400).json({
        success: false,
        message: 'spot_id và scheduled_date là bắt buộc'
      });
    }

    // Validate time_slot
    if (time_slot && !['AM', 'PM', 'FULL_DAY'].includes(time_slot)) {
      return res.status(400).json({
        success: false,
        message: 'time_slot phải là AM, PM hoặc FULL_DAY'
      });
    }

    // Check if spot exists
    const spotCheck = await db.query(
      'SELECT spot_id, name, status FROM spots WHERE spot_id = ?',
      [spot_id]
    );

    if (spotCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm'
      });
    }

    if (spotCheck[0].status !== 'PUBLIC') {
      return res.status(400).json({
        success: false,
        message: 'Địa điểm này không khả dụng'
      });
    }

    // Validate date (không được là quá khứ)
    const scheduleDate = new Date(scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduleDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Không thể tạo lịch trình cho ngày trong quá khứ'
      });
    }

    // Check for duplicate schedule (same spot, same date, same time_slot)
    const duplicateCheck = await db.query(
      `SELECT schedule_id FROM schedules 
       WHERE user_id = ? AND spot_id = ? AND scheduled_date = ? AND time_slot = ? AND status = 'PLANNED'`,
      [userId, spot_id, scheduled_date, time_slot || 'FULL_DAY']
    );

    if (duplicateCheck.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bạn đã có lịch trình cho địa điểm này vào thời gian đã chọn'
      });
    }

    // Insert schedule
    const insertQuery = `
      INSERT INTO schedules (user_id, spot_id, scheduled_date, time_slot, notes, status)
      VALUES (?, ?, ?, ?, ?, 'PLANNED')
    `;

    const result = await db.query(insertQuery, [
      userId,
      spot_id,
      scheduled_date,
      time_slot || 'FULL_DAY',
      notes || null
    ]);

    const scheduleId = result.insertId;

    // Get created schedule with spot details
    const query = `
      SELECT 
        sc.schedule_id,
        sc.spot_id,
        DATE_FORMAT(sc.scheduled_date, '%Y-%m-%d') as scheduled_date,
        sc.time_slot,
        sc.status,
        sc.notes,
        sc.created_at,
        s.name as spot_name,
        s.category,
        s.address,
        s.price_range,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM schedules sc
      JOIN spots s ON sc.spot_id = s.spot_id
      WHERE sc.schedule_id = ?
    `;

    const schedules = await db.query(query, [scheduleId]);
    const schedule = schedules[0];

    res.json({
      success: true,
      message: 'Đã thêm lịch trình thành công',
      data: {
        ...schedule,
        tags: schedule.tags ? schedule.tags.split(',') : []
      }
    });

  } catch (error) {
    console.error('Add schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm lịch trình',
      error: error.message
    });
  }
};

/**
 * PUT /api/schedules/:scheduleId
 * Cập nhật lịch trình
 * Body: { scheduled_date, time_slot, notes, status }
 */
const updateSchedule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scheduleId } = req.params;
    const { scheduled_date, time_slot, notes, status } = req.body;

    // Check if schedule exists and belongs to user
    const scheduleCheck = await db.query(
      'SELECT schedule_id, spot_id FROM schedules WHERE schedule_id = ? AND user_id = ?',
      [scheduleId, userId]
    );

    if (scheduleCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch trình hoặc bạn không có quyền truy cập'
      });
    }

    // Validate time_slot
    if (time_slot && !['AM', 'PM', 'FULL_DAY'].includes(time_slot)) {
      return res.status(400).json({
        success: false,
        message: 'time_slot phải là AM, PM hoặc FULL_DAY'
      });
    }

    // Validate status
    if (status && !['PLANNED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status phải là PLANNED, COMPLETED hoặc CANCELLED'
      });
    }

    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];

    if (scheduled_date !== undefined) {
      // Validate date
      const scheduleDate = new Date(scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (scheduleDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Không thể đặt lịch trình cho ngày trong quá khứ'
        });
      }

      updateFields.push('scheduled_date = ?');
      updateValues.push(scheduled_date);
    }

    if (time_slot !== undefined) {
      updateFields.push('time_slot = ?');
      updateValues.push(time_slot);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có trường nào để cập nhật'
      });
    }

    // Update schedule
    const updateQuery = `
      UPDATE schedules 
      SET ${updateFields.join(', ')}
      WHERE schedule_id = ? AND user_id = ?
    `;

    updateValues.push(scheduleId, userId);
    await db.query(updateQuery, updateValues);

    // Get updated schedule
    const query = `
      SELECT 
        sc.schedule_id,
        sc.spot_id,
        DATE_FORMAT(sc.scheduled_date, '%Y-%m-%d') as scheduled_date,
        sc.time_slot,
        sc.status,
        sc.notes,
        sc.updated_at,
        s.name as spot_name,
        s.category,
        s.address,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(tag_name) FROM spot_tags WHERE spot_id = s.spot_id) as tags
      FROM schedules sc
      JOIN spots s ON sc.spot_id = s.spot_id
      WHERE sc.schedule_id = ?
    `;

    const schedules = await db.query(query, [scheduleId]);
    const schedule = schedules[0];

    res.json({
      success: true,
      message: 'Đã cập nhật lịch trình thành công',
      data: {
        ...schedule,
        tags: schedule.tags ? schedule.tags.split(',') : []
      }
    });

  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lịch trình',
      error: error.message
    });
  }
};

/**
 * DELETE /api/schedules/:scheduleId
 * Xóa lịch trình (hoặc đổi status thành CANCELLED)
 */
const deleteSchedule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scheduleId } = req.params;
    const { soft_delete } = req.query; // ?soft_delete=true để chỉ đổi status

    // Check if schedule exists and belongs to user
    const scheduleCheck = await db.query(
      'SELECT schedule_id FROM schedules WHERE schedule_id = ? AND user_id = ?',
      [scheduleId, userId]
    );

    if (scheduleCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch trình hoặc bạn không có quyền truy cập'
      });
    }

    if (soft_delete === 'true') {
      // Soft delete: Chỉ đổi status thành CANCELLED
      await db.query(
        "UPDATE schedules SET status = 'CANCELLED' WHERE schedule_id = ?",
        [scheduleId]
      );

      res.json({
        success: true,
        message: 'Đã hủy lịch trình'
      });
    } else {
      // Hard delete: Xóa hoàn toàn
      await db.query(
        'DELETE FROM schedules WHERE schedule_id = ?',
        [scheduleId]
      );

      res.json({
        success: true,
        message: 'Đã xóa lịch trình'
      });
    }

  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch trình',
      error: error.message
    });
  }
};

/**
 * GET /api/schedules/calendar/:year/:month
 * Lấy lịch trình theo tháng (calendar view)
 */
const getCalendarSchedules = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month } = req.params;

    // Validate year and month
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({
        success: false,
        message: 'Year và month không hợp lệ'
      });
    }

    // Get first and last day of month
    const firstDay = new Date(yearInt, monthInt - 1, 1);
    const lastDay = new Date(yearInt, monthInt, 0);

    const query = `
      SELECT 
        sc.schedule_id,
        sc.spot_id,
        DATE_FORMAT(sc.scheduled_date, '%Y-%m-%d') as scheduled_date,
        sc.time_slot,
        sc.status,
        s.name as spot_name,
        s.category,
        (SELECT image_url FROM spot_images WHERE spot_id = s.spot_id AND is_main = TRUE LIMIT 1) as main_image
      FROM schedules sc
      JOIN spots s ON sc.spot_id = s.spot_id
      WHERE sc.user_id = ? 
        AND sc.scheduled_date >= ? 
        AND sc.scheduled_date <= ?
        AND sc.status IN ('PLANNED', 'COMPLETED')
      ORDER BY sc.scheduled_date ASC, sc.time_slot ASC
    `;

    const schedules = await db.query(query, [
      userId,
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0]
    ]);

    // Group by date
    const schedulesByDate = {};
    schedules.forEach(schedule => {
      const dateKey = schedule.scheduled_date; // Already formatted as YYYY-MM-DD
      if (!schedulesByDate[dateKey]) {
        schedulesByDate[dateKey] = [];
      }
      schedulesByDate[dateKey].push(schedule);
    });

    res.json({
      success: true,
      data: {
        year: yearInt,
        month: monthInt,
        schedules: schedulesByDate,
        total_schedules: schedules.length
      }
    });

  } catch (error) {
    console.error('Get calendar schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch trình tháng',
      error: error.message
    });
  }
};

module.exports = {
  getSchedules,
  getScheduleById,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  getCalendarSchedules
};
