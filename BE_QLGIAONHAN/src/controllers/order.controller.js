const { v4: uuidv4 } = require("uuid");
const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

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
      ORDER BY o.updated_at DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset],
    );

    const [count] = await pool.query(
      `SELECT COUNT(*) as total FROM nhigia_logistics_orders`,
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

      updatedAt: r.updated_at,
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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const user = req.user;
    const now = Date.now();
    // const body = req.body;
    const body = JSON.parse(req.body.data);
    const files = req.files;

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const [result] = await connection.query(
      `
      INSERT INTO nhigia_logistics_orders
      (
        create_date,
        creator,
        receiver,
        receiver_name,
        department_id,
        sender_name,
        sender_phone,
        time,
        date,
        company,
        address,
        address_line,
        ward,
        district,
        province,
        contact,
        phone,
        purpose,
        notes,
        amount_vnd,
        amount_usd,
        missing_docs,
        status,
        status_update_date,
        priority,
        sort_index,
        external_id,
        source,
        customer_name,
        contact_person,
        current_step,
        external_department_id,
        external_company_id,
        external_sender_id,
        external_status,
        external_status_text,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        now,
        user.email,
        body.receiver ?? null,
        body.receiver_name ?? null,
        body.department_id ?? null,
        body.sender_name ?? null,
        body.sender_phone ?? null,
        body.time ?? null,
        body.date ?? null,
        body.company ?? null,
        body.address ?? null,
        body.address_line ?? null,
        body.ward ?? null,
        body.district ?? null,
        body.province ?? null,
        body.contact ?? null,
        body.phone ?? null,
        body.purpose ?? null,
        body.notes ?? null,
        body.amount_vnd ?? 0,
        body.amount_usd ?? 0,
        body.missing_docs ?? null,
        "PENDING",
        now,
        body.priority ?? "normal",
        body.sort_index ?? 0,
        body.external_id ?? null,
        body.source ?? "NHIGIA",
        body.customer_name ?? null,
        body.contact_person ?? null,
        body.current_step ?? null,
        body.external_department_id ?? null,
        body.external_company_id ?? null,
        body.external_sender_id ?? null,
        body.external_status ?? null,
        body.external_status_text ?? null,
      ],
    );

    const orderId = result.insertId;

    if (Array.isArray(body.attachments) && body.attachments.length > 0) {
      for (const item of body.attachments) {
        await connection.query(
          `
          INSERT INTO nhigia_logistics_attachments
          (
            order_id,
            name,
            qty,
            checked,
            department_id,
            external_department_id,
            external_profile_id,
            external_visa_type_id,
            external_visa_detail_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            orderId,
            item.name ?? null,
            item.qty ?? 1,
            item.checked ? 1 : 0,
            body.department_id ?? null,
            body.external_department_id ?? null,
            item.external_profile_id ?? null,
            item.external_visa_type_id ?? null,
            item.external_visa_detail_id ?? null,
          ],
        );
      }
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const relativePath = file.path
          .split("uploads\\")[1]
          .replace(/\\/g, "/");

        await connection.query(
          `
      INSERT INTO nhigia_logistics_files
      (
        order_id,
        file_name,
        file_path,
        file_type,
        file_size,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, NOW())
      `,
          [
            orderId,
            file.originalname,
            relativePath,
            file.mimetype,
            file.size,
          ],
        );
      }
    }

    await connection.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [now, user.email, user.name, "CREATE", orderId, "Tạo đơn mới"],
    );

    await connection.query(
      `
      INSERT INTO nhigia_logistics_notifications
      (timestamp, message, read_status, target_role)
      VALUES (?, ?, 0, ?)
      `,
      [now, `Đơn ${orderId} cần điều phối`, "QL"],
    );

    await connection.commit();

    res.json({
      message: "Created successfully",
      id: orderId,
    });

    console.log("Created successfully", orderId);
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

exports.updateOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const orderId = req.params.id;
    const body = JSON.parse(req.body.data);
    const replaceFiles = req.body.replace_files === "1";
    const files = req.files;
    const now = Date.now();

    await connection.query(
      `
      UPDATE nhigia_logistics_orders SET
        receiver = ?,
        receiver_name = ?,
        department_id = ?,
        sender_name = ?,
        sender_phone = ?,
        time = ?,
        date = ?,
        company = ?,
        address = ?,
        address_line = ?,
        ward = ?,
        district = ?,
        province = ?,
        contact = ?,
        phone = ?,
        purpose = ?,
        notes = ?,
        amount_vnd = ?,
        amount_usd = ?,
        missing_docs = ?,
        priority = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        body.receiver ?? null,
        body.receiver_name ?? null,
        body.department_id ?? null,
        body.sender_name ?? null,
        body.sender_phone ?? null,
        body.time ?? null,
        body.date ?? null,
        body.company ?? null,
        body.address ?? null,
        body.address_line ?? null,
        body.ward ?? null,
        body.district ?? null,
        body.province ?? null,
        body.contact ?? null,
        body.phone ?? null,
        body.purpose ?? null,
        body.notes ?? null,
        body.amount_vnd ?? 0,
        body.amount_usd ?? 0,
        body.missing_docs ?? null,
        body.priority ?? "normal",
        orderId,
      ],
    );

    await connection.query(
      `DELETE FROM nhigia_logistics_attachments WHERE order_id = ?`,
      [orderId],
    );

    if (Array.isArray(body.attachments)) {
      for (const item of body.attachments) {
        await connection.query(
          `
          INSERT INTO nhigia_logistics_attachments
          (
            order_id,
            name,
            qty,
            checked,
            department_id,
            external_department_id,
            external_profile_id,
            external_visa_type_id,
            external_visa_detail_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            orderId,
            item.name ?? null,
            item.qty ?? 1,
            item.checked ? 1 : 0,
            body.department_id ?? null,
            body.external_department_id ?? null,
            item.external_profile_id ?? null,
            item.external_visa_type_id ?? null,
            item.external_visa_detail_id ?? null,
          ],
        );
      }
    }

    if (replaceFiles) {
      const [oldFiles] = await connection.query(
        `SELECT * FROM nhigia_logistics_files WHERE order_id = ?`,
        [orderId],
      );

      await connection.query(
        `DELETE FROM nhigia_logistics_files WHERE order_id = ?`,
        [orderId],
      );

      for (const file of oldFiles) {
        const filePath = path.join(__dirname, "..", "uploads", file.file_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      if (files && files.length > 0) {
        for (const file of files) {
          const relativePath = file.path
            .split("uploads\\")[1]
            .replace(/\\/g, "/");

          await connection.query(
            `
        INSERT INTO nhigia_logistics_files
        (
          order_id,
          original_name,
          file_name,
          file_path,
          file_type,
          file_size,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        `,
            [
              orderId,
              file.originalname,
              file.filename,
              relativePath,
              file.mimetype,
              file.size,
            ],
          );
        }
      }
    }

    await connection.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, action, order_id, details)
      VALUES (?, ?, ?, ?)
      `,
      [now, "UPDATE", orderId, "Cập nhật đơn"],
    );

    await connection.commit();

    res.json({ message: "Updated successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
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
      ["REJECTED", now, reason, orderId],
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_logs
       (timestamp, action, order_id, details)
       VALUES (?, ?, ?, ?)`,
      [now, "REJECT", orderId, reason],
    );

    res.json({ message: "Rejected successfully" });
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
        [i, order_ids[i]],
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
      ["COMPLETED", now, req.params.id],
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_logs
       (timestamp, action, order_id, details)
       VALUES (?, ?, ?, ?)`,
      [now, "COMPLETE", req.params.id, "Hoàn thành"],
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
        ["FINISHED", now, orderId],
      );
    } else {
      await pool.query(
        `UPDATE nhigia_logistics_orders
         SET status = ?, status_update_date = ?,
             review_note = ?, admin_response = ?
         WHERE id = ?`,
        ["INCOMPLETE", now, reason, reason, orderId],
      );
    }

    res.json({ message: "Admin processed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const connection = await pool.getConnection();
  const orderId = req.params.id;
  const now = Date.now();

  try {
    await connection.beginTransaction();

    const [files] = await connection.query(
      `SELECT file_path FROM nhigia_logistics_files WHERE order_id = ?`,
      [orderId],
    );

    const fs = require("fs");
    const path = require("path");

    for (const file of files) {
      const fullPath = path.join(__dirname, "../uploads", file.file_path);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await connection.query(`DELETE FROM nhigia_logistics_orders WHERE id = ?`, [
      orderId,
    ]);

    await connection.query(
      `INSERT INTO nhigia_logistics_logs
       (timestamp, action, order_id, details)
       VALUES (?, ?, ?, ?)`,
      [now, "DELETE", orderId, "Xóa đơn"],
    );

    await connection.commit();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
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
      [receiver_email, receiver_name, "ASSIGNED", now, orderId],
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_notifications
       (timestamp, message, read_status, target_role, target_email)
       VALUES (?, ?, 0, ?, ?)`,
      [now, `Bạn được giao đơn ${orderId}`, "NVGN", receiver_email],
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
    ["PROCESSING", now, req.params.id],
  );

  res.json({ message: "Accepted" });
};

exports.shipperReject = async (req, res) => {
  const now = Date.now();

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?, rejection_reason = ?
     WHERE id = ?`,
    ["REJECTED", now, req.body.reason, req.params.id],
  );

  res.json({ message: "Shipper rejected" });
};

exports.shipperComplete = async (req, res) => {
  const now = Date.now();

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?, completion_note = ?
     WHERE id = ?`,
    ["COMPLETED", now, req.body.note, req.params.id],
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
    ["SUPPLEMENT_REQUIRED", now, req.body.note, "QL", now, req.params.id],
  );

  res.json({ message: "Requested supplement" });
};

exports.resolveRequest = async (req, res) => {
  const now = Date.now();

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?, admin_response = ?
     WHERE id = ?`,
    ["PENDING", now, req.body.note, req.params.id],
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
    ["SUPPLEMENT_REQUIRED", now, req.body.note, "NVGN", now, req.params.id],
  );

  res.json({ message: "Shipper requested supplement" });
};

// exports.getOrderDetail = async (req, res) => {
//   try {
//     const orderId = req.params.id;

//     const [[r]] = await pool.query(
//       `
//       SELECT
//         o.*,
//         d.id AS department_id,
//         d.name AS department_name,
//         d.code AS department_code
//       FROM nhigia_logistics_orders o
//       LEFT JOIN nhigia_logistics_departments d
//         ON o.department_id = d.id
//       WHERE o.id = ?
//       `,
//       [orderId],
//     );

//     if (!r) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const [attachmentRows] = await pool.query(
//       `
//       SELECT id, order_id, name, qty, checked
//       FROM nhigia_logistics_attachments
//       WHERE order_id = ?
//       `,
//       [orderId],
//     );

//     const attachments = attachmentRows.map((a) => ({
//       id: a.id,
//       orderId: a.order_id,
//       name: a.name,
//       qty: a.qty,
//       checked: !!a.checked,
//     }));

//     const mapped = {
//       id: String(r.id),

//       createDate: r.create_date,
//       creator: r.creator,

//       receiver: r.receiver,
//       receiverName: r.receiver_name,

//       department: r.department_id
//         ? {
//             id: r.department_id,
//             name: r.department_name,
//             code: r.department_code,
//           }
//         : null,

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
//       sortIndex: r.sort_index,
//       shipperHighlightColor: r.shipper_highlight_color,

//       attachments,
//     };

//     res.json(mapped);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

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
      [orderId],
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
      [orderId],
    );

    const attachments = attachmentRows.map((a) => ({
      id: a.id,
      orderId: a.order_id,
      name: a.name,
      qty: a.qty,
      checked: !!a.checked,
    }));

    const [fileRows] = await pool.query(
      `
      SELECT id, file_name, file_type, file_path
      FROM nhigia_logistics_files
      WHERE order_id = ?
      `,
      [orderId],
    );

    const uploadedFiles = fileRows.map((f) => ({
      id: f.id,
      name: f.file_name,
      type: f.file_type,
      data: `${process.env.BASE_URL}/uploads/${f.file_path}`,
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

      attachments,
      uploadedFiles,
    };

    res.json(mapped);
    console.log("Fetched order detail", mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
