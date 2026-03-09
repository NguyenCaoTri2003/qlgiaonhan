const pool = require("../config/database");
const nhigiaService = require("../services/nhigia.service");

exports.getUsers = async (req, res) => {
  const { role } = req.query;

  try {
    let query =
      "SELECT id, email, name, role, avatar FROM nhigia_logistics_users";
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
      role: u.role,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const token = req.user?.nhigia_token;
    const departmentId = req.user?.departmentId;

    if (!token) {
      return res.status(401).json({ message: "Thiếu token Nhị Gia" });
    }

    const actionMap = {
      7: "getadmingpld",
      8: "getadminvisavn",
      9: "getadminvisann",
    };

    const action = actionMap[departmentId];

    if (!action) {
      return res.status(403).json({
        message: "Department không được phép truy cập",
      });
    }

    const result = await nhigiaService.fetchNhigiaAdmins(action, token);

    if (!result) {
      return res.status(400).json({
        message: "Không lấy được danh sách admin",
      });
    }

    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getShippers = async (req, res) => {
  try {
    const token = req.user?.nhigia_token;
    
    if (!token) {
      return res.status(401).json({ message: "Thiếu token Nhị Gia" });
    }

    const result = await nhigiaService.fetchNhigiaShippers("getshiiper", token);

    if (!result) {
      return res.status(400).json({
        message: "Không lấy được danh sách shipper",
      });
    }

    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
