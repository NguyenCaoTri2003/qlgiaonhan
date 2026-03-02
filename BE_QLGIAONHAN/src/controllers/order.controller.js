const pool = require("../config/db");

exports.getAllOrders = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM orders ORDER BY sort_index ASC"
  );
  res.json(rows);
};

exports.createOrder = async (req, res) => {
  const order = req.body;
  await pool.query("INSERT INTO orders SET ?", order);
  res.json({ message: "Order created" });
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE orders SET ? WHERE id=?", [
    req.body,
    id,
  ]);
  res.json({ message: "Order updated" });
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM orders WHERE id=?", [id]);
  res.json({ message: "Order deleted" });
};