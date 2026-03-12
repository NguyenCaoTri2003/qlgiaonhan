const pool = require("../config/database");

exports.saveDeviceToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    await pool.query(
      `
      INSERT INTO nhigia_logistics_device_tokens (user_id, token)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE token=VALUES(token)
      `,
      [userId, token]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};