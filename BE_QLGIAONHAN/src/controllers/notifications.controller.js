const pool = require("../config/database");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        message,
        target_user_id,
        target_role AS targetRole,
        read_status,
        target_email AS targetEmail,
        timestamp
      FROM nhigia_logistics_notifications
      WHERE target_user_id = ?
         OR target_role = ?
      ORDER BY timestamp DESC
      `,
      [userId, role]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        message,
        target_user_id,
        target_role AS targetRole,
        read_status,
        order_id AS orderId,
        target_email AS targetEmail,
        timestamp
      FROM nhigia_logistics_notifications
      WHERE target_user_id = ?
         OR target_role = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
      `,
      [userId, role, limit, offset]
    );

    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM nhigia_logistics_notifications
      WHERE target_user_id = ?
         OR target_role = ?
      `,
      [userId, role]
    );

    const [unreadRows] = await pool.query(
      `
      SELECT COUNT(*) as unreadCount
      FROM nhigia_logistics_notifications
      WHERE (target_user_id = ? OR target_role = ?)
      AND read_status = 0
      `,
      [userId, role]
    );

    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    const unreadCount = unreadRows[0].unreadCount;

    res.json({
      data: rows,
      page,
      totalPages,
      totalItems,
      unreadCount,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    await pool.query(
      `
      UPDATE nhigia_logistics_notifications
      SET read_status = 1
      WHERE target_user_id = ?
         OR target_role = ?
      `,
      [userId, role]
    );

    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      `
      UPDATE nhigia_logistics_notifications
      SET read_status = 1
      WHERE id = ?
      `,
      [id]
    );

    res.json({ message: "Marked as read" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};