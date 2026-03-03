const pool = require("../config/database");

exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM nhigia_logistics_notifications ORDER BY timestamp DESC"
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await pool.query(`UPDATE nhigia_logistics_notifications SET read=1`);
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};