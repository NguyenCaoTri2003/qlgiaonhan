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