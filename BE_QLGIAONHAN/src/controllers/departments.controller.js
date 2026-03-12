const pool = require("../config/database");
const nhigiaService = require("../services/nhigia.service");

// exports.getDepartment = async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       "SELECT * FROM nhigia_logistics_departments ORDER BY created_at DESC"
//     );

//     res.json(rows);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getDepartment = async (req, res) => {
  try {
    const token = req.user?.nhigia_token;
    const departmentId = req.user?.departmentId;
    const role = req.user?.role;

    if (!token) {
      return res.status(401).json({ message: "Thiếu token Nhị Gia" });
    }

    const result = await nhigiaService.fetchNhigiaDepartments(token);

    if (!result?.results) {
      return res.status(400).json({
        message: "Không lấy được danh sách bộ phận",
        data: result,
      });
    }

    let departments;

    if (role === "QL" || role === "NVGN") {
      departments = result.results;
    } else {
      departments = result.results.filter(
        (d) => d.external_id === departmentId
      );
    }

    res.json(departments);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttachmentsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const data =
      await nhigiaService.fetchNhigiaAttachmentsByDepartment(departmentId);

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

    const data = await nhigiaService.fetchNhigiaVisaVNType(
      departmentId,
      typeId,
    );

    const mapped = data.map((item) => ({
      id: item.id,
      departmentId: item.idbopan,
      requestId: item.idyeucau,

      name: item.ten,
      departmentName: item.tenbophan,

      headerTitle: item.tieudeheader,
      note: item.luuy,
      description: item.ghichu,

      order: item.thutu,
      displayOrder: item.stt,

      visible: item.hienthi === 1,

      createAt: item.ngaytao,
      createBy: item.nguoitao,
      updateAt: item.ngaysua,
      updateBy: item.nguoisua,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVisaVNTypeDetailsByDepartment = async (req, res) => {
  try {
    const { departmentId, typeId, detailId } = req.params;

    const data = await nhigiaService.fetchNhigiaVisaVNTypeDetails(
      departmentId,
      typeId,
      detailId,
    );

    const mapped = data.map((item) => ({
      id: item.id,
      departmentId: item.idbopan,
      requestId: item.idyeucau,

      departmentName: item.tenbophan,
      name: item.tenhoso,
      typeName: item.tenloaihsvsvn,
      typyId: item.id_loaihosovsvn,

      quantity: item.soluong,

      description: item.ghichu,

      order: item.thutu,
      displayOrder: item.stt,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
