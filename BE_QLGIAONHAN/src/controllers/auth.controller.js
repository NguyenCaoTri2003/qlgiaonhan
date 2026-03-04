const pool = require("../config/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM nhigia_logistics_users WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    delete user.password;

    res.json({
      message: "Login thành công",
      user,
      token,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

//     // Map role theo hệ thống bạn
//     const roleMap = {
//       8: "QL",
//       7: "NV",
//     };

//     const role = roleMap[user.idquyen] || "USER";

//     const token = jwt.sign(
//       {
//         id: user.iduser,
//         email: user.diachiemail,
//         role: role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES }
//     );

//     res.json({
//       user: {
//         id: user.iduser,
//         name: user.tendangnhap,
//         email: user.diachiemail,
//         role: role,
//       },
//       token,
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };