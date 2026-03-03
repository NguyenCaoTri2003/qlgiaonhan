const pool = require("../config/database");

exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM customers ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerByPhone = async (req, res) => {
  const { phone } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM customers WHERE phone=?",
      [phone]
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
      "SELECT * FROM customers WHERE company=?",
      [company]
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
    await pool.query("INSERT INTO customers SET ?", {
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
    await pool.query("UPDATE customers SET ? WHERE id=?", [updates, id]);
    res.json({ message: "Customer updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM customers WHERE id=?", [id]);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};