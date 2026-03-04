const pool = require("../config/database");

exports.getDepartment = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM nhigia_logistics_departments ORDER BY created_at DESC"
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttachmentsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const data = await nhigiaService.fetchNhigiaAttachmentsByDepartment(departmentId);

    const mapped = data.map((item) => ({
      name: item.tenhoso,
      code: item.mahoso,
      required: item.batbuoc === 1,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};