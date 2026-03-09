const pool = require("../config/database");

exports.getLogs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        l.id,
        l.user_id,
        l.timestamp,
        l.user_email AS userEmail,
        l.user_name AS userName,
        l.action,
        l.order_id AS orderId,
        o.order_code AS orderCode,
        l.details
      FROM nhigia_logistics_logs l
      LEFT JOIN nhigia_logistics_orders o
        ON l.order_id = o.id
      ORDER BY l.timestamp DESC
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};