const pool = require("../config/database");

function removeAccents(str) {
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

async function generateOrderId(department, senderName) {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = String(now.getFullYear()).slice(-2);
  const dateStr = `${d}${m}${y}`;

  let deptCode = "VSVN";
  if (department === "Giấy Phép Lao Động") deptCode = "GPLĐ";
  if (department === "Visa Nước Ngoài") deptCode = "VSNQ";

  const prefix = `${dateStr}-${deptCode}`;

  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM orders WHERE id LIKE ?",
    [`${prefix}%`]
  );

  const seq = String(rows[0].count + 1).padStart(2, "0");

  let cleanName = removeAccents(
    senderName.replace(/GPLĐ|Visa|Admin|Nhị Gia/gi, "").trim()
  ).replace(/\s+/g, "");

  return `${prefix}-${seq}-${cleanName}`;
}

module.exports = generateOrderId;