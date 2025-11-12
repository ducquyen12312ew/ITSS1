/**
 * Children Controller - Quản lý hồ sơ trẻ em
 * Cho phép user thêm/sửa/xóa thông tin con cái
 * Yêu cầu authentication
 */

const db = require('../database/db');

/**
 * GET /api/children
 * Lấy danh sách tất cả trẻ em của user đang đăng nhập
 */
const getChildren = async (req, res) => {
  try {
    const userId = req.user.userId; // Từ JWT token

    const query = `
      SELECT 
        child_id,
        name,
        birth_date,
        avatar_url,
        notes,
        created_at,
        updated_at
      FROM children
      WHERE user_id = ?
      ORDER BY birth_date ASC
    `;

    const children = await db.query(query, [userId]);

    // Calculate age for each child
    const childrenWithAge = children.map(child => {
      const birthDate = new Date(child.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return {
        ...child,
        age: age
      };
    });

    res.json({
      success: true,
      data: {
        children: childrenWithAge,
        total: children.length
      }
    });

  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách trẻ em',
      error: error.message
    });
  }
};

/**
 * GET /api/children/:id
 * Lấy thông tin chi tiết 1 trẻ
 */
const getChildById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const query = `
      SELECT 
        child_id,
        name,
        birth_date,
        avatar_url,
        notes,
        created_at,
        updated_at
      FROM children
      WHERE child_id = ? AND user_id = ?
    `;

    const children = await db.query(query, [id, userId]);

    if (children.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin trẻ hoặc bạn không có quyền truy cập'
      });
    }

    const child = children[0];

    // Calculate age
    const birthDate = new Date(child.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Get child preferences (interests/dislikes from child_preferences table)
    const preferencesQuery = `
      SELECT preference_type, tag_name
      FROM child_preferences
      WHERE child_id = ?
    `;
    const preferences = await db.query(preferencesQuery, [id]);

    const interests = preferences
      .filter(p => p.preference_type === 'LIKE')
      .map(p => p.tag_name);
    
    const dislikes = preferences
      .filter(p => p.preference_type === 'DISLIKE')
      .map(p => p.tag_name);

    const childWithDetails = {
      ...child,
      age: age,
      interests: interests,
      dislikes: dislikes
    };

    res.json({
      success: true,
      data: childWithDetails
    });

  } catch (error) {
    console.error('Get child by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin trẻ',
      error: error.message
    });
  }
};

/**
 * POST /api/children
 * Thêm hồ sơ trẻ mới
 */
const createChild = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      name, 
      birth_date,
      avatar_url = null,
      notes = null,
      interests = [], 
      dislikes = []
    } = req.body;

    // Validation
    if (!name || !birth_date) {
      return res.status(400).json({
        success: false,
        message: 'Tên và ngày sinh là bắt buộc'
      });
    }

    // Calculate age from birth_date
    const birthDate = new Date(birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Validate age (0-18 years)
    if (age < 0 || age > 18) {
      return res.status(400).json({
        success: false,
        message: 'Độ tuổi phải từ 0-18 tuổi'
      });
    }

    // Insert child into children table
    const query = `
      INSERT INTO children (
        user_id, 
        name, 
        birth_date,
        avatar_url,
        notes
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const result = await db.query(query, [
      userId,
      name,
      birth_date,
      avatar_url,
      notes
    ]);

    const childId = result.insertId;

    // Insert interests into child_preferences
    if (interests.length > 0) {
      for (const tag of interests) {
        await db.query(
          'INSERT INTO child_preferences (child_id, preference_type, tag_name) VALUES (?, ?, ?)',
          [childId, 'LIKE', tag]
        );
      }
    }

    // Insert dislikes into child_preferences
    if (dislikes.length > 0) {
      for (const tag of dislikes) {
        await db.query(
          'INSERT INTO child_preferences (child_id, preference_type, tag_name) VALUES (?, ?, ?)',
          [childId, 'DISLIKE', tag]
        );
      }
    }

    // Get the newly created child with preferences
    const newChild = await db.query(
      'SELECT * FROM children WHERE child_id = ?',
      [childId]
    );

    const preferencesQuery = `
      SELECT preference_type, tag_name
      FROM child_preferences
      WHERE child_id = ?
    `;
    const preferences = await db.query(preferencesQuery, [childId]);

    const childWithDetails = {
      ...newChild[0],
      age: age,
      interests: preferences
        .filter(p => p.preference_type === 'LIKE')
        .map(p => p.tag_name),
      dislikes: preferences
        .filter(p => p.preference_type === 'DISLIKE')
        .map(p => p.tag_name)
    };

    res.status(201).json({
      success: true,
      message: 'Thêm hồ sơ trẻ thành công',
      data: childWithDetails
    });

  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm hồ sơ trẻ',
      error: error.message
    });
  }
};

/**
 * PUT /api/children/:id
 * Cập nhật thông tin trẻ
 */
const updateChild = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { 
      name, 
      birth_date,
      avatar_url,
      notes,
      interests, 
      dislikes
    } = req.body;

    // Check if child exists and belongs to user
    const checkQuery = `
      SELECT * FROM children WHERE child_id = ? AND user_id = ?
    `;
    const existingChild = await db.query(checkQuery, [id, userId]);

    if (existingChild.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin trẻ hoặc bạn không có quyền chỉnh sửa'
      });
    }

    // Validate age if birth_date is updated
    if (birth_date) {
      const birthDate = new Date(birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 0 || age > 18) {
        return res.status(400).json({
          success: false,
          message: 'Độ tuổi phải từ 0-18 tuổi'
        });
      }
    }

    // Build update query dynamically for children table
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (birth_date !== undefined) {
      updates.push('birth_date = ?');
      params.push(birth_date);
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatar_url);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    // Update children table if there are changes
    if (updates.length > 0) {
      const query = `
        UPDATE children 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE child_id = ? AND user_id = ?
      `;
      params.push(id, userId);
      await db.query(query, params);
    }

    // Update interests in child_preferences
    if (interests !== undefined) {
      // Delete old interests
      await db.query(
        'DELETE FROM child_preferences WHERE child_id = ? AND preference_type = ?',
        [id, 'LIKE']
      );
      
      // Insert new interests
      if (interests.length > 0) {
        for (const tag of interests) {
          await db.query(
            'INSERT INTO child_preferences (child_id, preference_type, tag_name) VALUES (?, ?, ?)',
            [id, 'LIKE', tag]
          );
        }
      }
    }

    // Update dislikes in child_preferences
    if (dislikes !== undefined) {
      // Delete old dislikes
      await db.query(
        'DELETE FROM child_preferences WHERE child_id = ? AND preference_type = ?',
        [id, 'DISLIKE']
      );
      
      // Insert new dislikes
      if (dislikes.length > 0) {
        for (const tag of dislikes) {
          await db.query(
            'INSERT INTO child_preferences (child_id, preference_type, tag_name) VALUES (?, ?, ?)',
            [id, 'DISLIKE', tag]
          );
        }
      }
    }

    // Get updated child with preferences
    const updatedChild = await db.query(
      'SELECT * FROM children WHERE child_id = ?',
      [id]
    );

    // Calculate age
    const birthDate = new Date(updatedChild[0].birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const preferencesQuery = `
      SELECT preference_type, tag_name
      FROM child_preferences
      WHERE child_id = ?
    `;
    const preferences = await db.query(preferencesQuery, [id]);

    const childWithDetails = {
      ...updatedChild[0],
      age: age,
      interests: preferences
        .filter(p => p.preference_type === 'LIKE')
        .map(p => p.tag_name),
      dislikes: preferences
        .filter(p => p.preference_type === 'DISLIKE')
        .map(p => p.tag_name)
    };

    res.json({
      success: true,
      message: 'Cập nhật thông tin trẻ thành công',
      data: childWithDetails
    });

  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin trẻ',
      error: error.message
    });
  }
};

/**
 * DELETE /api/children/:id
 * Xóa hồ sơ trẻ
 */
const deleteChild = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if child exists and belongs to user
    const checkQuery = `
      SELECT * FROM children WHERE child_id = ? AND user_id = ?
    `;
    const existingChild = await db.query(checkQuery, [id, userId]);

    if (existingChild.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin trẻ hoặc bạn không có quyền xóa'
      });
    }

    const query = `
      DELETE FROM children WHERE child_id = ? AND user_id = ?
    `;

    await db.query(query, [id, userId]);

    res.json({
      success: true,
      message: 'Xóa hồ sơ trẻ thành công'
    });

  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hồ sơ trẻ',
      error: error.message
    });
  }
};

module.exports = {
  getChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild
};
