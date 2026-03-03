const pool = require("../config/database");

exports.getUsers = async (req, res) => {
  const { role } = req.query;

  try {
    let query = "SELECT id, email, name, role, avatar FROM nhigia_logistics_users";
    let params = [];

    if (role) {
      query += " WHERE role = ?";
      params.push(role);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};