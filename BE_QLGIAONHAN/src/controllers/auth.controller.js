// const pool = require("../config/database");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// require("dotenv").config();

// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [rows] = await pool.query(
//       `SELECT * FROM nhigia_logistics_users WHERE email = ?`,
//       [email]
//     );

//     if (rows.length === 0) {
//       return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
//     }

//     const user = rows[0];

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
//     }

//     const token = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES }
//     );

//     delete user.password;

//     res.json({
//       message: "Login thành công",
//       user,
//       token,
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// const axios = require("axios");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const response = await axios.post(
//       "https://demoapi.nhigia.vn/quanli/apigiaonhan/apigiaonhan.php",
//       {
//         action: "login",
//         email,
//         password,
//       }
//     );

//     const result = response.data;

//     if (!result.status) {
//       return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
//     }

//     const user = result.data;

//     const roleMap = {
//       10: "QL",
//       17: "NVGN",
//       20: "NVADMIN",
//     };

//     const role = roleMap[user.role] || "USER";

//     // lấy 1 id bộ phận
//     const departmentId = result.idbophan?.[0]?.idbophan || null;

//     const token = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: role,
//         departmentId,
//         permissions: result.dataquyen || [],
//         nhigia_token: result.datatoken?.token || null,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES }
//     );

//     res.json({
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: role,
//         departmentId,
//       },
//       token,
//       nhigia_token: result.datatoken?.token || null,
//       nhigia_expired: result.datatoken?.expired || null,
//       permissions: result.dataquyen || [],
//       departmentId
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: result } = await axios.post(
      "http://demoapi.nhigia.vn/quanli/apigiaonhan/apigiaonhan.php",
      {
        action: "login",
        email,
        password,
      }
    );

    if (!result?.status) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    const user = result.data;
    const permissions = result.dataquyen || [];

    // role map
    const roleMap = {
      10: "QL",
      17: "NVGN",
      20: "NVADMIN",
    };

    let role = roleMap[user.role] || "NVGN";

    // nếu NVGN nhưng có quyền xem tất cả đơn -> QL
    const canViewAll = permissions.some((p) => p.xem_tatca_don);
    if (user.role === 17 && canViewAll) role = "QL";

    const departmentId = result.idbophan?.[0]?.idbophan || null;

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      departmentId,
      permissions,
      nhigia_token: result.datatoken?.token || null,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        departmentId,
      },
      token,
      nhigia_token: result.datatoken?.token || null,
      nhigia_expired: result.datatoken?.expired || null,
      permissions,
      departmentId,
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};