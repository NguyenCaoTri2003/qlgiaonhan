const pool = require("../config/database");
const generateOrderId = require("../utils/orderId");

// exports.getAllOrders = async (req, res) => {
//   console.log("USER:", req.user);
//   const [rows] = await pool.query(
//     "SELECT * FROM nhigia_logistics_orders ORDER BY sort_index ASC",
//   );
//   res.json(rows);
//   console.log("Fetched nhigia_logistics_orders:", rows);
// };

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT * FROM nhigia_logistics_orders 
       ORDER BY sort_index ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM nhigia_logistics_orders`
    );

    res.json({
      data: rows,
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const user = req.user; // từ middleware auth

  const id = await generateOrderId(req.body.department, req.body.senderName);

  const now = Date.now();

  await pool.query(`INSERT INTO nhigia_logistics_orders SET ?`, {
    ...req.body,
    id,
    createDate: now,
    creator: user.email,
    receiver: null,
    status: "Chờ tiếp nhận",
    statusUpdateDate: now,
  });

  await pool.query("INSERT INTO nhigia_logistics_logs SET ?", {
    timestamp: now,
    userEmail: user.email,
    userName: user.name,
    action: "Tạo mới",
    orderId: id,
    details: `Đơn hàng được tạo cho ${req.body.company}`,
  });

  await pool.query("INSERT INTO nhigia_logistics_notifications SET ?", {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: now,
    message: `Đơn hàng mới ${id} cần điều phối`,
    read: false,
    targetRole: "QL",
  });

  res.json({ message: "Created", id });
};

exports.rejectOrder = async (req, res) => {
  const orderId = req.params.id;
  const { reason } = req.body;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders 
       SET status=?, statusUpdateDate=?, rejectionReason=? 
       WHERE id=?`,
      ["Từ chối", now, reason, orderId],
    );

    await pool.query("INSERT INTO nhigia_logistics_logs SET ?", {
      timestamp: now,
      action: "Từ chối",
      orderId,
      details: `Đơn bị từ chối. Lý do: ${reason}`,
    });

    res.json({ message: "Rejected successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  const orderId = req.params.id;
  const updates = req.body;

  try {
    await pool.query(`UPDATE nhigia_logistics_orders SET ? WHERE id=?`, [updates, orderId]);

    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderSort = async (req, res) => {
  const { userId, orderIds } = req.body;

  try {
    for (let i = 0; i < orderIds.length; i++) {
      await pool.query(
        `UPDATE nhigia_logistics_orders SET sort_index=? WHERE id=? AND user_id=?`,
        [i, orderIds[i], userId],
      );
    }

    res.json({ message: "Sort updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeOrder = async (req, res) => {
  const orderId = req.params.id;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders 
       SET status=?, statusUpdateDate=? 
       WHERE id=?`,
      ["Hoàn thành", now, orderId],
    );

    await pool.query("INSERT INTO nhigia_logistics_logs SET ?", {
      timestamp: now,
      action: "Hoàn thành",
      orderId,
      details: `Đơn hàng đã hoàn thành`,
    });

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
         SET status=?, statusUpdateDate=? 
         WHERE id=?`,
        ["Đã xác nhận hoàn tất", now, orderId],
      );

      await pool.query("INSERT INTO nhigia_logistics_logs SET ?", {
        timestamp: now,
        action: "Admin xác nhận",
        orderId,
        details: "Admin đã duyệt hoàn tất",
      });
    } else {
      await pool.query(
        `UPDATE nhigia_logistics_orders 
         SET status=?, 
             statusUpdateDate=?, 
             reviewNote=?, 
             adminResponse=? 
         WHERE id=?`,
        ["Chưa hoàn thành", now, reason, reason, orderId],
      );

      await pool.query("INSERT INTO nhigia_logistics_logs SET ?", {
        timestamp: now,
        action: "Admin từ chối",
        orderId,
        details: reason || "Không duyệt",
      });
    }

    res.json({ message: "Admin finalize processed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const orderId = req.params.id;

  try {
    await pool.query(`DELETE FROM nhigia_logistics_orders WHERE id=?`, [orderId]);

    await pool.query("INSERT INTO nhigia_logistics_logs SET ?", {
      timestamp: Date.now(),
      action: "Xóa đơn",
      orderId,
      details: `Đơn hàng đã bị xóa`,
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignReceiver = async (req, res) => {
  const { receiverEmail, receiverName } = req.body;
  const orderId = req.params.id;

  await pool.query(
    `UPDATE nhigia_logistics_orders 
     SET receiver=?, receiverName=?, status=?, statusUpdateDate=? 
     WHERE id=?`,
    [receiverEmail, receiverName, "Đã điều phối", Date.now(), orderId],
  );

  await pool.query("INSERT INTO nhigia_logistics_notifications SET ?", {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    message: `Bạn được giao đơn hàng mới: ${orderId}`,
    read: false,
    targetRole: "NVGN",
    targetEmail: receiverEmail,
  });

  res.json({ message: "Assigned" });
};

exports.shipperAccept = async (req, res) => {
  const { missingDocs } = req.body;

  await pool.query(
    `UPDATE nhigia_logistics_orders 
     SET status=?, statusUpdateDate=?, missingDocs=? 
     WHERE id=?`,
    ["Đang xử lý", Date.now(), missingDocs || null, req.params.id],
  );

  res.json({ message: "Accepted" });
};

exports.shipperReject = async (req, res) => {
  const orderId = req.params.id;
  const { reason } = req.body;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders 
       SET status=?, statusUpdateDate=?, rejectionReason=? 
       WHERE id=?`,
      ["Từ chối nhận", now, reason, orderId],
    );

    res.json({ message: "Shipper rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.shipperComplete = async (req, res) => {
  const orderId = req.params.id;
  const { images, location, signature, note } = req.body;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders 
       SET status=?, 
           statusUpdateDate=?, 
           completionImages=?, 
           deliveryLocation=?, 
           signature=?, 
           completionNote=? 
       WHERE id=?`,
      [
        "Xử lý Xong",
        now,
        JSON.stringify(images),
        JSON.stringify(location),
        signature,
        note,
        orderId,
      ],
    );

    // Log
    await pool.query("INSERT INTO nhigia_logistics_logs SET ?", {
      timestamp: now,
      action: "Xử lý xong",
      orderId,
      details: "Chờ duyệt",
    });

    // Notification
    await pool.query("INSERT INTO nhigia_logistics_notifications SET ?", {
      timestamp: now,
      message: `Đơn ${orderId} đã xử lý xong`,
      targetRole: "NVADMIN",
      isRead: 0,
    });

    res.json({ message: "Completed by shipper" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.qlRequestSupplement = async (req, res) => {
  const orderId = req.params.id;
  const { note, requesterName } = req.body;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders 
       SET status=?, statusUpdateDate=?, supplementNote=?, supplementRequesterName=?, supplementDate=?, receiver=NULL, receiverName=NULL
       WHERE id=?`,
      ["Bổ sung", now, note, requesterName || "QL", now, orderId],
    );

    res.json({ message: "Requested supplement" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resolveRequest = async (req, res) => {
  const orderId = req.params.id;
  const { note } = req.body;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders 
       SET status=?, statusUpdateDate=?, adminResponse=? 
       WHERE id=?`,
      ["Chờ tiếp nhận", now, note, orderId],
    );

    res.json({ message: "Resolved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.shipperReturnSupplement = async (req, res) => {
  const orderId = req.params.id;
  const { note } = req.body;
  const now = Date.now();

  try {
    // Update order
    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET status = ?,
           statusUpdateDate = ?,
           supplementNote = ?,
           supplementRequesterName = ?,
           supplementDate = ?,
           requestNote = ?,
           receiver = NULL,
           receiverName = NULL
       WHERE id = ?`,
      [
        "Bổ sung",
        now,
        note,
        "Shipper", // nếu có auth middleware thì lấy từ user
        now,
        note,
        orderId,
      ],
    );

    // Log
    await pool.query("INSERT INTO nhigia_logistics_logs SET ?", {
      timestamp: now,
      action: "NVGN yêu cầu bổ sung",
      orderId,
      details: note,
    });

    // Notification (gửi cho QL)
    await pool.query("INSERT INTO nhigia_logistics_notifications SET ?", {
      timestamp: now,
      message: `NVGN yêu cầu bổ sung cho ${orderId}`,
      targetRole: "QL",
      isRead: 0,
    });

    res.json({ message: "Shipper returned supplement request" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
