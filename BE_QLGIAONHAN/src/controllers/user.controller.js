const pool = require("../config/database");
const nhigiaService = require("../services/nhigia.service");

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

exports.getSenders = async (req, res) => {
  try {
    const data = await nhigiaService.fetchNhigiaUsers();

    const mapped = data.data.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};