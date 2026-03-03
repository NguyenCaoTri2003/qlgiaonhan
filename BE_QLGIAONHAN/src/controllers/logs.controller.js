const pool = require("../config/database");

exports.getLogs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM logs ORDER BY timestamp DESC"
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};