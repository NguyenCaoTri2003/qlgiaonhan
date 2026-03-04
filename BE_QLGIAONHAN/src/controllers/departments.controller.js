const pool = require("../config/database");
const nhigiaService = require("../services/nhigia.service");

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
      create_at: item.ngaytao,
      create_by: item.nguoitao,
      id: item.id,
    }));

    res.json(mapped);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVisaVNTypeByDepartment = async (req, res) => {
  try {
    const { departmentId, typeId } = req.params;

    const data = await nhigiaService.fetchNhigiaVisaVNType(departmentId, typeId);

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVisaVNTypeDetailsByDepartment = async (req, res) => {
  try {
    const { departmentId, typeId } = req.params;

    const data = await nhigiaService.fetchNhigiaVisaVNTypeDetails(departmentId, typeId);

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};