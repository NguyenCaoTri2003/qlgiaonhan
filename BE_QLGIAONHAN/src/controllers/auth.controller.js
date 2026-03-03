const pool = require("../config/database");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT id, email, name, role, avatar 
       FROM users 
       WHERE email = ? AND password = ?`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    const user = rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({
      message: "Login thành công",
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};