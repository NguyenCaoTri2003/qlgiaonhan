// const pool = require("../config/database");

// exports.upsertOrder = async (item) => {
//   await pool.query(
//     `
//     INSERT INTO nhigia_logistics_orders
//     (
//       id,
//       external_id,
//       company,
//       contact,
//       phone,
//       address,
//       \`date\`,
//       \`time\`,
//       status,
//       source,
//       create_date
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NHIGIA', ?)
//     ON DUPLICATE KEY UPDATE
//       company = VALUES(company),
//       contact = VALUES(contact),
//       phone = VALUES(phone),
//       address = VALUES(address),
//       \`date\` = VALUES(\`date\`),
//       \`time\` = VALUES(\`time\`),
//       status = VALUES(status)
//     `,
//     [
//       item.id,
//       item.external_id,
//       item.company,
//       item.contact,
//       item.phone,
//       item.address,
//       item.date,
//       item.time,
//       item.status,
//       Date.now(),
//     ]
//   );
// };

const pool = require("../config/database");

exports.upsertOrder = async (item) => {
  await pool.query(
    `
    INSERT INTO nhigia_logistics_orders
    (
      external_id,
      external_company_id,
      external_department_id,
      external_sender_id,

      company,
      customer_name,
      contact,
      contact_person,
      phone,
      address,

      department,
      purpose,
      notes,

      \`date\`,
      \`time\`,

      status,
      external_status,
      external_status_text,
      current_step,

      create_date,
      sort_index,
      source
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NHIGIA')

    ON DUPLICATE KEY UPDATE
      external_company_id = VALUES(external_company_id),
      external_department_id = VALUES(external_department_id),
      external_sender_id = VALUES(external_sender_id),

      company = VALUES(company),
      customer_name = VALUES(customer_name),
      contact = VALUES(contact),
      contact_person = VALUES(contact_person),
      phone = VALUES(phone),
      address = VALUES(address),

      department = VALUES(department),
      purpose = VALUES(purpose),
      notes = VALUES(notes),

      \`date\` = VALUES(\`date\`),
      \`time\` = VALUES(\`time\`),

      status = VALUES(status),
      external_status = VALUES(external_status),
      external_status_text = VALUES(external_status_text),
      current_step = VALUES(current_step),

      sort_index = VALUES(sort_index)
    `,
    [
      item.external_id,
      item.external_company_id,
      item.external_department_id,
      item.external_sender_id,

      item.company,
      item.customer_name,
      item.contact,
      item.contact_person,
      item.phone,
      item.address,

      item.department,
      item.purpose,
      item.notes,

      item.date,
      item.time,

      item.status,
      item.external_status,
      item.external_status_text,
      item.current_step,

      item.create_date,
      item.sort_index,
    ]
  );
};