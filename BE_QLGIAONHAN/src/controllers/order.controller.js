const pool = require("../config/database");
const nhigiaService = require("../services/nhigia.service");

// exports.getAllOrders = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const offset = (page - 1) * limit;

//     const [rows] = await pool.query(
//       `SELECT * FROM nhigia_logistics_orders
//        ORDER BY sort_index ASC
//        LIMIT ? OFFSET ?`,
//       [limit, offset]
//     );

//     const [count] = await pool.query(
//       `SELECT COUNT(*) as total FROM nhigia_logistics_orders`
//     );

//     res.json({
//       data: rows,
//       total: count[0].total,
//       page,
//       totalPages: Math.ceil(count[0].total / limit),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getAllOrders = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const offset = (page - 1) * limit;

//     const [rows] = await pool.query(
//       `SELECT * FROM nhigia_logistics_orders
//        ORDER BY sort_index ASC
//        LIMIT ? OFFSET ?`,
//       [limit, offset]
//     );

//     const [count] = await pool.query(
//       `SELECT COUNT(*) as total FROM nhigia_logistics_orders`
//     );

//     const mapped = rows.map((r) => ({
//       id: String(r.id),
//       createDate: r.create_date,
//       creator: r.creator,
//       receiver: r.receiver,
//       receiverName: r.receiver_name,

//       department: r.department,

//       senderName: r.sender_name,
//       senderPhone: r.sender_phone,

//       time: r.time,
//       date: r.date,

//       company: r.company,
//       address: r.address,
//       addressLine: r.address_line,
//       ward: r.ward,
//       district: r.district,
//       province: r.province,

//       contact: r.contact,
//       phone: r.phone,

//       purpose: r.purpose,
//       notes: r.notes,

//       amountVND: r.amount_vnd,
//       amountUSD: r.amount_usd,

//       missingDocs: r.missing_docs,

//       status: r.status,
//       statusUpdateDate: r.status_update_date,

//       completionNote: r.completion_note,
//       rejectionReason: r.rejection_reason,

//       supplementNote: r.supplement_note,
//       supplementRequesterName: r.supplement_requester_name,
//       supplementDate: r.supplement_date,

//       requestNote: r.request_note,
//       reviewNote: r.review_note,
//       adminResponse: r.admin_response,

//       priority: r.priority,
//       sort_index: r.sort_index,
//       shipperHighlightColor: r.shipper_highlight_color,
//     }));

//     res.json({
//       data: mapped,
//       total: count[0].total,
//       page,
//       totalPages: Math.ceil(count[0].total / limit),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `
      SELECT 
        o.*,
        d.id   AS department_id,
        d.name AS department_name,
        d.code AS department_code
      FROM nhigia_logistics_orders o
      LEFT JOIN nhigia_logistics_departments d
        ON o.department_id = d.id
      ORDER BY o.sort_index ASC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const [count] = await pool.query(
      `SELECT COUNT(*) as total FROM nhigia_logistics_orders`
    );

    const mapped = rows.map((r) => ({
      id: String(r.id),
      createDate: r.create_date,
      creator: r.creator,
      receiver: r.receiver,
      receiverName: r.receiver_name,

      department: r.department_id
        ? {
            id: r.department_id,
            name: r.department_name,
            code: r.department_code,
          }
        : null,

      senderName: r.sender_name,
      senderPhone: r.sender_phone,

      time: r.time,
      date: r.date,

      company: r.company,
      address: r.address,
      addressLine: r.address_line,
      ward: r.ward,
      district: r.district,
      province: r.province,

      contact: r.contact,
      phone: r.phone,

      purpose: r.purpose,
      notes: r.notes,

      amountVND: r.amount_vnd,
      amountUSD: r.amount_usd,

      missingDocs: r.missing_docs,

      status: r.status,
      statusUpdateDate: r.status_update_date,

      completionNote: r.completion_note,
      rejectionReason: r.rejection_reason,

      supplementNote: r.supplement_note,
      supplementRequesterName: r.supplement_requester_name,
      supplementDate: r.supplement_date,

      requestNote: r.request_note,
      reviewNote: r.review_note,
      adminResponse: r.admin_response,

      priority: r.priority,
      sort_index: r.sort_index,
      shipperHighlightColor: r.shipper_highlight_color,
    }));

    res.json({
      data: mapped,
      total: count[0].total,
      page,
      totalPages: Math.ceil(count[0].total / limit),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const user = req.user;
    const now = Date.now();

    const [result] = await pool.query(
      `INSERT INTO nhigia_logistics_orders
       (create_date, creator, department, sender_name, sender_phone,
        company, address, phone, status, status_update_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        now,
        user.email,
        req.body.department,
        req.body.sender_name,
        req.body.sender_phone,
        req.body.company,
        req.body.address,
        req.body.phone,
        "PENDING",
        now,
      ]
    );

    const orderId = result.insertId;

    await pool.query(
      `INSERT INTO nhigia_logistics_logs
       (timestamp, user_email, user_name, action, order_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [now, user.email, user.name, "CREATE", orderId, "Tạo đơn mới"]
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_notifications
       (timestamp, message, read_status, target_role)
       VALUES (?, ?, 0, ?)`,
      [now, `Đơn ${orderId} cần điều phối`, "QL"]
    );

    res.json({ message: "Created", id: orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectOrder = async (req, res) => {
  const orderId = req.params.id;
  const { reason } = req.body;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET status = ?, status_update_date = ?, rejection_reason = ?
       WHERE id = ?`,
      ["REJECTED", now, reason, orderId]
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_logs
       (timestamp, action, order_id, details)
       VALUES (?, ?, ?, ?)`,
      [now, "REJECT", orderId, reason]
    );

    res.json({ message: "Rejected successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders SET ? WHERE id = ?`,
      [req.body, req.params.id]
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderSort = async (req, res) => {
  const { order_ids } = req.body;

  try {
    for (let i = 0; i < order_ids.length; i++) {
      await pool.query(
        `UPDATE nhigia_logistics_orders
         SET sort_index = ?
         WHERE id = ?`,
        [i, order_ids[i]]
      );
    }

    res.json({ message: "Sort updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeOrder = async (req, res) => {
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET status = ?, status_update_date = ?
       WHERE id = ?`,
      ["COMPLETED", now, req.params.id]
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_logs
       (timestamp, action, order_id, details)
       VALUES (?, ?, ?, ?)`,
      [now, "COMPLETE", req.params.id, "Hoàn thành"]
    );

    res.json({ message: "Completed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminFinalize = async (req, res) => {
  const orderId = req.params.id;
  const { approved, reason } = req.body;
  const now = Date.now();

  try {
    if (approved) {
      await pool.query(
        `UPDATE nhigia_logistics_orders
         SET status = ?, status_update_date = ?
         WHERE id = ?`,
        ["FINISHED", now, orderId]
      );
    } else {
      await pool.query(
        `UPDATE nhigia_logistics_orders
         SET status = ?, status_update_date = ?,
             review_note = ?, admin_response = ?
         WHERE id = ?`,
        ["INCOMPLETE", now, reason, reason, orderId]
      );
    }

    res.json({ message: "Admin processed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const orderId = req.params.id;
  const now = Date.now();

  try {
    await pool.query(
      `DELETE FROM nhigia_logistics_orders WHERE id = ?`,
      [orderId]
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_logs
       (timestamp, action, order_id, details)
       VALUES (?, ?, ?, ?)`,
      [now, "DELETE", orderId, "Xóa đơn"]
    );

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignReceiver = async (req, res) => {
  const { receiver_email, receiver_name } = req.body;
  const orderId = req.params.id;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET receiver = ?, receiver_name = ?,
           status = ?, status_update_date = ?
       WHERE id = ?`,
      [receiver_email, receiver_name, "ASSIGNED", now, orderId]
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_notifications
       (timestamp, message, read_status, target_role, target_email)
       VALUES (?, ?, 0, ?, ?)`,
      [now, `Bạn được giao đơn ${orderId}`, "NVGN", receiver_email]
    );

    res.json({ message: "Assigned" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.shipperAccept = async (req, res) => {
  const now = Date.now();

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?
     WHERE id = ?`,
    ["PROCESSING", now, req.params.id]
  );

  res.json({ message: "Accepted" });
};

exports.shipperReject = async (req, res) => {
  const now = Date.now();

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?, rejection_reason = ?
     WHERE id = ?`,
    ["REJECTED", now, req.body.reason, req.params.id]
  );

  res.json({ message: "Shipper rejected" });
};

exports.shipperComplete = async (req, res) => {
  const now = Date.now();

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?, completion_note = ?
     WHERE id = ?`,
    ["COMPLETED", now, req.body.note, req.params.id]
  );

  res.json({ message: "Completed by shipper" });
};

exports.qlRequestSupplement = async (req, res) => {
  const now = Date.now();

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?,
         supplement_note = ?, supplement_requester_name = ?,
         supplement_date = ?, receiver = NULL, receiver_name = NULL
     WHERE id = ?`,
    [
      "SUPPLEMENT_REQUIRED",
      now,
      req.body.note,
      "QL",
      now,
      req.params.id,
    ]
  );

  res.json({ message: "Requested supplement" });
};

exports.resolveRequest = async (req, res) => {
  const now = Date.now();

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?, admin_response = ?
     WHERE id = ?`,
    ["PENDING", now, req.body.note, req.params.id]
  );

  res.json({ message: "Resolved" });
};

exports.shipperReturnSupplement = async (req, res) => {
  const now = Date.now();

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?,
         supplement_note = ?, supplement_requester_name = ?,
         supplement_date = ?
     WHERE id = ?`,
    [
      "SUPPLEMENT_REQUIRED",
      now,
      req.body.note,
      "NVGN",
      now,
      req.params.id,
    ]
  );

  res.json({ message: "Shipper requested supplement" });
};

exports.getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.id;

    const [[r]] = await pool.query(
      `
      SELECT 
        o.*,
        d.id AS department_id,
        d.name AS department_name,
        d.code AS department_code
      FROM nhigia_logistics_orders o
      LEFT JOIN nhigia_logistics_departments d
        ON o.department_id = d.id
      WHERE o.id = ?
      `,
      [orderId]
    );

    if (!r) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [attachmentRows] = await pool.query(
      `
      SELECT id, order_id, name, qty, checked
      FROM nhigia_logistics_attachments
      WHERE order_id = ?
      `,
      [orderId]
    );

    const attachments = attachmentRows.map(a => ({
      id: a.id,
      orderId: a.order_id,
      name: a.name,
      qty: a.qty,
      checked: !!a.checked
    }));

    const mapped = {
      id: String(r.id),

      createDate: r.create_date,
      creator: r.creator,

      receiver: r.receiver,
      receiverName: r.receiver_name,

      department: r.department_id
        ? {
            id: r.department_id,
            name: r.department_name,
            code: r.department_code,
          }
        : null,

      senderName: r.sender_name,
      senderPhone: r.sender_phone,

      time: r.time,
      date: r.date,

      company: r.company,
      address: r.address,
      addressLine: r.address_line,
      ward: r.ward,
      district: r.district,
      province: r.province,

      contact: r.contact,
      phone: r.phone,

      purpose: r.purpose,
      notes: r.notes,

      amountVND: r.amount_vnd,
      amountUSD: r.amount_usd,

      missingDocs: r.missing_docs,

      status: r.status,
      statusUpdateDate: r.status_update_date,

      completionNote: r.completion_note,
      rejectionReason: r.rejection_reason,

      supplementNote: r.supplement_note,
      supplementRequesterName: r.supplement_requester_name,
      supplementDate: r.supplement_date,

      requestNote: r.request_note,
      reviewNote: r.review_note,
      adminResponse: r.admin_response,

      priority: r.priority,
      sortIndex: r.sort_index,
      shipperHighlightColor: r.shipper_highlight_color,

      attachments
    };

    res.json(mapped);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};