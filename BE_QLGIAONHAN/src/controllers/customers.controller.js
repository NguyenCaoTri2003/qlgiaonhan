const pool = require("../config/database");
const axios = require("axios");

exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM nhigia_logistics_customers BY id DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerByPhone = async (req, res) => {
  const { phone } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM nhigia_logistics_customers WHERE phone=?",
      [phone],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerByCompany = async (req, res) => {
  const { company } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM nhigia_logistics_customers WHERE company=?",
      [company],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  const { phone, company, address, contact } = req.body;

  try {
    await pool.query("INSERT INTO nhigia_logistics_customers SET ?", {
      phone,
      company,
      address,
      contact,
      created_at: Date.now(),
    });

    res.json({ message: "Customer created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    await pool.query("UPDATE nhigia_logistics_customers SET ? WHERE id=?", [
      updates,
      id,
    ]);
    res.json({ message: "Customer updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM nhigia_logistics_customers WHERE id=?", [id]);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchNhigiaCompanies = async (req, res) => {
  const { keyword = "", page = 1 } = req.body;

  try {
    const response = await axios.post(
      "https://demoapi.nhigia.vn/quanli/apigiaonhan/apigiaonhan.php",
      {
        action: "get_congty",
        tencongty: keyword,
        page: page.toString(),
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    const rawList = response?.data?.results || [];

    const formatted = rawList.map((item) => ({
      id: Number(item.id),
      company_name: item.data?.tenctyhd || "",
      address:
        item.data?.diachi ||
        item.data?.diadiemlamviec ||
        item.data?.diachixuathoadon ||
        "",
      contact:
        item.data?.contacts?.length > 0 ? item.data.contacts[0].hoten : "",
      phone:
        item.data?.contacts?.length > 0
          ? item.data.contacts[0].sodienthoai
          : "",
      source: "API",
    }));

    res.json({
      success: true,
      data: formatted,
      page: Number(page),
    });
  } catch (err) {
    console.error("Nhigia API error:", err.message);
    res.status(500).json({
      success: false,
      message: "Không lấy được dữ liệu công ty từ Nhị Gia",
    });
  }
};

// exports.searchNhigiaCompanies = async (req, res) => {
//   const { keyword = "", page = 1 } = req.body;

//   try {
//     if (!keyword) {
//       const [rows] = await pool.query(
//         `
//         SELECT external_id, local_snapshot
//         FROM nhigia_external_entities
//         WHERE external_type = 'company'
//         AND source = 'NHIGIA'
//         ORDER BY last_sync DESC
//         LIMIT 20
//         `
//       );

//       if (rows.length > 0) {
//         const formatted = rows.map((row) => {
//           const item = JSON.parse(row.local_snapshot);

//           return {
//             external_id: item.id,
//             company_name: item.data?.tenctyhd || "",
//             address:
//               item.data?.diachi ||
//               item.data?.diadiemlamviec ||
//               item.data?.diachixuathoadon ||
//               "",
//             contact:
//               item.data?.contacts?.length > 0
//                 ? item.data.contacts[0].hoten
//                 : "",
//             phone:
//               item.data?.contacts?.length > 0
//                 ? item.data.contacts[0].sodienthoai
//                 : "",
//           };
//         });

//         return res.json({
//           page,
//           results: formatted,
//           source: "CACHE",
//         });
//       }
//     }

//     const response = await axios.post(
//       "https://demoapi.nhigia.vn/quanli/apigiaonhan/apigiaonhan.php",
//       {
//         action: "get_congty",
//         tencongty: keyword,
//         page: page.toString(),
//       },
//       { headers: { "Content-Type": "application/json" } }
//     );

//     const results = response.data?.results || [];
//     const now = Date.now();

//     for (const item of results) {
//       await pool.query(
//         `
//         INSERT INTO nhigia_external_entities
//         (external_id, external_type, source, local_snapshot, last_sync)
//         VALUES (?, 'company', 'NHIGIA', ?, ?)
//         ON DUPLICATE KEY UPDATE
//           local_snapshot = VALUES(local_snapshot),
//           last_sync = VALUES(last_sync)
//         `,
//         [item.id, JSON.stringify(item), now]
//       );
//     }

//     const formatted = results.map((item) => ({
//       external_id: item.id,
//       company_name: item.data?.tenctyhd || "",
//       address:
//         item.data?.diachi ||
//         item.data?.diadiemlamviec ||
//         item.data?.diachixuathoadon ||
//         "",
//       contact:
//         item.data?.contacts?.length > 0
//           ? item.data.contacts[0].hoten
//           : "",
//       phone:
//         item.data?.contacts?.length > 0
//           ? item.data.contacts[0].sodienthoai
//           : "",
//     }));

//     res.json({
//       page,
//       results: formatted,
//       source: "API",
//     });

//   } catch (err) {
//     console.error("Nhigia API error:", err.message);
//     res.status(500).json({
//       error: "Failed to fetch from Nhigia API",
//     });
//   }
// };
