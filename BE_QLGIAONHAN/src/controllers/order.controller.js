const { v4: uuidv4 } = require("uuid");
const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const nhigiaService = require("../services/nhigia.service");
const { fetchNhigiaDepartments } = require("../services/nhigia.service");

function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "")
    .trim();
}

function moveFileToOrderFolder(file, orderCode, type) {
  const oldPath = file.path;

  const newDir = path.join(__dirname, "../uploads", "orders", orderCode, type);

  fs.mkdirSync(newDir, { recursive: true });

  const newPath = path.join(newDir, file.filename);

  fs.renameSync(oldPath, newPath);

  let relativePath = path.relative(path.join(__dirname, "../uploads"), newPath);

  relativePath = relativePath.replace(/\\/g, "/");

  return {
    newFileName: file.filename,
    relativePath,
  };
}

let deptCache = null;
let deptCacheTime = 0;

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const dept = req.query.dept || "";
    const filter = req.query.filter || "ALL";

    const user = req.user || {};
    const userId = user.id || null;
    const role = user.role || "";
    const token = user.nhigia_token;

    console.log("user role: ", role);

    if (!["QL", "NVGN", "NVADMIN"].includes(role)) {
      return res.status(403).json({ message: "Không có quyền xem đơn" });
    }

    let where = [];
    let params = [];

    let orderBy = "ORDER BY o.updated_at DESC";

    // NVGN chỉ xem đơn của mình
    if (role === "NVGN") {
      orderBy = "ORDER BY o.sort_index ASC, o.updated_at DESC";

      where.push("o.shipper_id = ?");
      params.push(userId);

      where.push("o.status != 'SUPPLEMENT_REQUIRED'");
    }

    // NVADMIN chỉ xem đơn do mình tạo
    if (role === "NVADMIN") {
      where.push("o.created_by = ?");
      params.push(userId);
    }

    if (search) {
      where.push(`
        (
          o.order_code LIKE ? OR
          o.company LIKE ? OR
          o.address LIKE ? OR
          o.sender_name LIKE ?
        )
      `);

      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (dept) {
      where.push(`o.department_id = ?`);
      params.push(dept);
    }

    if (filter === "PENDING_GROUP") {
      where.push(`
        o.status IN ('PENDING','ASSIGNED','PROCESSING','SUPPLEMENT_REQUIRED')
      `);
    }

    if (filter === "DONE_GROUP") {
      where.push(`
        o.status IN ('COMPLETED','FINISHED')
      `);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT o.*
      FROM nhigia_logistics_orders o
      ${whereSQL}
      ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    const [count] = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM nhigia_logistics_orders o
      ${whereSQL}
      `,
      params,
    );

    let departments = [];

    if (!deptCache || Date.now() - deptCacheTime > 10 * 60 * 1000) {
      const resDept = await fetchNhigiaDepartments(token);

      deptCache = resDept.results || [];
      deptCacheTime = Date.now();
    }

    departments = deptCache;

    const deptMap = {};

    departments.forEach((d) => {
      deptMap[d.id] = d;
    });

    const mapped = rows.map((r) => ({
      id: String(r.id),
      orderCode: r.order_code,
      createDate: r.create_date,
      creator: r.creator,
      receiver: r.receiver,
      receiverName: r.receiver_name,

      department: r.department_id
        ? {
            id: r.department_id,
            name: deptMap[r.department_id]?.name || null,
            code: deptMap[r.department_id]?.code || null,
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

      shipperHighlightColor: r.shipper_highlight_color,
    }));

    res.json({
      data: mapped,
      total: count[0].total,
      page,
      totalPages: Math.ceil(count[0].total / limit),
    });
  } catch (err) {
    console.error("Get Orders Error:", err);
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
        created_by,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
        user.id,
      ],
    );

    const orderId = result.insertId;

    const date = new Date();

    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const datePart = `${dd}${mm}${yy}`;

    const profileCode = body.profile_code || "HOSO";

    const idPart = String(orderId).padStart(2, "0");

    const senderName = removeVietnameseTones(body.sender_name || "Unknown");

    const orderCode = `${datePart}-${profileCode}-${idPart}-${senderName}`;

    await connection.query(
      `UPDATE nhigia_logistics_orders SET order_code = ? WHERE id = ?`,
      [orderCode, orderId],
    );

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
        const { newFileName, relativePath } = moveFileToOrderFolder(
          file,
          orderCode,
          "attachments",
        );

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
            newFileName,
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
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [now, user.email, user.name, user.id, "CREATE", orderId, "Tạo đơn mới"],
    );

    await connection.query(
      `
      INSERT INTO nhigia_logistics_notifications
      (timestamp, message, read_status, target_role)
      VALUES (?, ?, 0, ?)
      `,
      [now, `Đơn hàng mới ${orderCode} cần điều phối`, "QL"],
    );

    await connection.commit();

    res.json({
      message: "Created successfully",
      id: orderId,
    });
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
    const user = req.user;
    const body = JSON.parse(req.body.data);
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
        shipper_highlight_color = ?,
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
        body.shipper_highlight_color ?? null,
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

    if (files && files.length > 0) {
      const [orderRows] = await connection.query(
        `SELECT order_code FROM nhigia_logistics_orders WHERE id = ?`,
        [orderId],
      );

      const orderCode = orderRows[0].order_code;

      for (const file of files) {
        const { newFileName, relativePath } = moveFileToOrderFolder(
          file,
          orderCode,
          "attachments",
        );

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
            newFileName,
            relativePath,
            file.mimetype,
            file.size,
          ],
        );
      }
    }

    if (body.files_to_delete && body.files_to_delete.length > 0) {
      for (const fileId of body.files_to_delete) {
        const [rows] = await connection.query(
          `SELECT * FROM nhigia_logistics_files WHERE id = ?`,
          [fileId],
        );

        if (rows.length > 0) {
          const file = rows[0];

          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            file.file_path,
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          await connection.query(
            `DELETE FROM nhigia_logistics_files WHERE id = ?`,
            [fileId],
          );
        }
      }
    }

    await connection.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [now, user.email, user.name, user.id, "UPDATE", orderId, "Cập nhật đơn"],
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
  const user = req.user;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET status = ?, status_update_date = ?, rejection_reason = ?
       WHERE id = ?`,
      ["REJECTED", now, reason, orderId],
    );

    await pool.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [now, user.email, user.name, user.id, "REJECT", orderId, reason],
    );

    res.json({ message: "Rejected successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { color } = req.body;

    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET shipper_highlight_color = ?
       WHERE id = ?`,
      [color, id],
    );

    res.json({ message: "Color updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderSort = async (req, res) => {
  const { orderIds } = req.body;

  try {
    const queries = orderIds.map((id, index) =>
      pool.query(
        `UPDATE nhigia_logistics_orders 
         SET sort_index = ? 
         WHERE id = ?`,
        [index, id],
      ),
    );

    await Promise.all(queries);

    res.json({ message: "Sort updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeOrder = async (req, res) => {
  const now = Date.now();
  const user = req.user;

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET status = ?, status_update_date = ?
       WHERE id = ?`,
      ["COMPLETED", now, req.params.id],
    );

    await pool.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        now,
        user.email,
        user.name,
        user.id,
        "COMPLETE",
        req.params.id,
        "Hoàn thành đơn",
      ],
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
  const user = req.user;

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
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [now, user.email, user.name, user.id, "DELETE", orderId, "Xóa đơn"],
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
  const { order_code, receiver_id, receiver_email, receiver_name } = req.body;
  const orderId = req.params.id;
  const user = req.user;
  const now = Date.now();

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET sort_index = sort_index + 1
       WHERE shipper_id = ?`,
      [receiver_id],
    );

    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET shipper_id = ?, 
           receiver = ?, 
           receiver_name = ?,
           sort_index = 0,
           status = ?, 
           status_update_date = ?,
           updated_at = NOW(),
           assigned_at = NOW()
       WHERE id = ?`,
      [receiver_id, receiver_email, receiver_name, "ASSIGNED", now, orderId],
    );

    await pool.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        now,
        user.email,
        user.name,
        user.id,
        "ASSIGNED",
        orderId,
        `Đơn hàng được giao cho ${receiver_name}`,
      ],
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_notifications
       (timestamp, message, read_status, target_role, target_email)
       VALUES (?, ?, 0, ?, ?)`,
      [now, `Bạn được giao đơn hàng mới: ${order_code}`, "NVGN", receiver_email],
    );

    res.json({ message: "Assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.shipperAccept = async (req, res) => {
  const now = Date.now();
  const { checklist, missingDocs } = req.body;
  const user = req.user;

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET status = ?, status_update_date = ?, missing_docs = ?
       WHERE id = ?`,
      ["PROCESSING", now, missingDocs || null, req.params.id],
    );

    if (checklist && checklist.length > 0) {
      for (const item of checklist) {
        await pool.query(
          `UPDATE nhigia_logistics_attachments
           SET checked = ?
           WHERE id = ?`,
          [item.checked ? 1 : 0, item.id],
        );

        await pool.query(
          `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
          [
            now,
            user.email,
            user.name,
            user.id,
            "SHIPPER_ACCEPTED",
            req.params.id,
            "Đồng ý nhận đơn",
          ],
        );
      }
    }

    res.json({ message: "Accepted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.shipperReject = async (req, res) => {
  const now = Date.now();
  const user = req.user;

  try {
    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET status = ?, 
           status_update_date = ?, 
           rejection_reason = ?,
           shipper_id = NULL,
           receiver = NULL,
           receiver_name = NULL,
           sort_index = NULL,
           shipper_highlight_color = NULL,
           updated_at = NOW()
       WHERE id = ?`,
      ["REJECTED", now, req.body.reason, req.params.id],
    );

    await pool.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [now, user.email, user.name, user.id, "SHIPPER_REJECTED", req.params.id, req.body.reason],
    );

    res.json({ message: "Shipper rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.shipperComplete = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const now = Date.now();
    const orderId = req.params.id;
    const files = req.files?.files || [];
    const signatureFile = req.files?.signature?.[0];
    const user = req.user;

    console.log("FILES:", req.files);

    const { note, location } = req.body;

    const loc = location ? JSON.parse(location) : null;

    const [orderRows] = await connection.query(
      `SELECT order_code FROM nhigia_logistics_orders WHERE id = ?`,
      [orderId],
    );

    if (!orderRows.length) {
      throw new Error("Order not found");
    }

    const orderCode = orderRows[0].order_code;

    await connection.query(
      `UPDATE nhigia_logistics_orders
       SET status = ?, 
           status_update_date = ?, 
           completion_note = ?,
           completion_lat = ?,
           completion_lng = ?
       WHERE id = ?`,
      [
        "COMPLETED",
        now,
        note || null,
        loc?.lat || null,
        loc?.lng || null,
        orderId,
      ],
    );

    if (files.length > 0) {
      for (const file of files) {
        const { newFileName, relativePath } = moveFileToOrderFolder(
          file,
          orderCode,
          "success",
        );

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
            type,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `,
          [
            orderId,
            file.originalname,
            newFileName,
            relativePath,
            file.mimetype,
            file.size,
            "COMPLETE_IMAGE",
          ],
        );
      }
    }

    if (signatureFile) {
      const { newFileName, relativePath } = moveFileToOrderFolder(
        signatureFile,
        orderCode,
        "signature",
      );

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
      type,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `,
        [
          orderId,
          signatureFile.originalname,
          newFileName,
          relativePath,
          signatureFile.mimetype,
          signatureFile.size,
          "SIGNATURE",
        ],
      );
    }

    await connection.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [now, user.email, user.name, user.id, "SHIPPER_COMPLETE", orderId, "Shipper hoàn tất đơn"],
    );

    await connection.commit();

    res.json({
      message: "Completed by shipper",
    });
  } catch (err) {
    await connection.rollback();

    res.status(500).json({
      error: err.message,
    });
  } finally {
    connection.release();
  }
};

exports.qlRequestSupplement = async (req, res) => {
  const now = Date.now();
  const user = req.user;

  await pool.query(
    `UPDATE nhigia_logistics_orders
     SET status = ?, status_update_date = ?,
         supplement_note = ?, supplement_requester_name = ?,
         supplement_date = ?, receiver = NULL, receiver_name = NULL,
         updated_at = NOW()
     WHERE id = ?`,
    ["SUPPLEMENT_REQUIRED", now, req.body.note, "QL", now, req.params.id],
  );

  await pool.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [now, user.email, user.name, user.id, "SUPPLEMENT_REQUIRED", req.params.id, `Trưởng phòng yêu cầu bổ sung: ${req.body.note}`],
    );

  res.json({ message: "Requested supplement" });
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

  await pool.query(
      `
      INSERT INTO nhigia_logistics_logs
      (timestamp, user_email, user_name, user_id, action, order_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [now, user.email, user.name, user.id, "SUPPLEMENT_REQUIRED", req.params.id, `Shipper yêu cầu bổ sung: ${req.body.note}`],
    );

  res.json({ message: "Shipper requested supplement" });
};

exports.getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.id;
    const user = req.user || {};
    const token = user.nhigia_token;

    // ===== Load order =====
    const [[r]] = await pool.query(
      `
      SELECT *
      FROM nhigia_logistics_orders
      WHERE id = ?
      `,
      [orderId],
    );

    if (!r) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ===== Load attachments table =====
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

    // ===== Load files =====
    const [fileRows] = await pool.query(
      `
      SELECT id, file_name, file_type, file_path, type
      FROM nhigia_logistics_files
      WHERE order_id = ?
      `,
      [orderId],
    );

    const completionImages = [];
    const uploadedFiles = [];
    let signature = null;

    fileRows.forEach((f) => {
      const url = `${process.env.BASE_URL}/uploads/${f.file_path}`;

      if (f.type === "COMPLETE_IMAGE") {
        completionImages.push(url);
      }

      if (f.type === "SIGNATURE") {
        signature = url;
      }

      if (f.type === "OTHER") {
        uploadedFiles.push({
          id: f.id,
          name: f.file_name,
          type: f.file_type,
          data: url,
        });
      }
    });

    // ===== Delivery location =====
    const deliveryLocation =
      r.completion_lat && r.completion_lng
        ? {
            lat: Number(r.completion_lat),
            lng: Number(r.completion_lng),
          }
        : null;

    // ===== Department cache logic =====
    let departments = [];

    if (!deptCache || Date.now() - deptCacheTime > 10 * 60 * 1000) {
      const resDept = await fetchNhigiaDepartments(token);
      deptCache = resDept.results || [];
      deptCacheTime = Date.now();
    }

    departments = deptCache;

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.id] = d;
    });

    // ===== Map response =====
    const mapped = {
      id: String(r.id),

      orderCode: r.order_code,
      createDate: r.create_date,
      creator: r.creator,

      receiver: r.receiver,
      receiverName: r.receiver_name,

      department: r.department_id
        ? {
            id: r.department_id,
            name: deptMap[r.department_id]?.name || null,
            code: deptMap[r.department_id]?.code || null,
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

      updatedAt: r.updated_at,

      attachments,

      completionImages,
      signature,
      uploadedFiles,
      deliveryLocation,
    };

    console.log("Map: ", mapped);

    res.json(mapped);
  } catch (err) {
    console.error("Get Order Detail Error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.resolveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: "Thiếu nội dung bổ sung" });
    }

    const now = Date.now();
    const user = req.user || {};

    await pool.query(
      `UPDATE nhigia_logistics_orders
       SET status = 'PENDING',
           supplement_note = NULL,
           rejection_reason = NULL,
           admin_response = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [note, id],
    );

    await pool.query(
      `INSERT INTO nhigia_logistics_logs
      (user_id, timestamp, user_email, user_name, action, order_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id || null,
        now,
        user.email || null,
        user.name || null,
        "RESOLVE_SUPPLEMENT",
        id,
        `Đã bổ sung: ${note}`,
      ],
    );

    return res.json({ message: "Đã bổ sung thành công" });
  } catch (error) {
    console.error("Resolve error:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
