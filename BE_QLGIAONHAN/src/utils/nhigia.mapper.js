// function mapStatus(step) {
//   switch (step) {
//     case "TRUONGPHONGGIAONHAN":
//       return "Chờ tiếp nhận";
//     case "NHANVIENGIAONHAN":
//       return "Đã điều phối";
//     default:
//       return "Chờ tiếp nhận";
//   }
// }

// function mapNhigiaToOrder(item) {
//   const deliveryDate = item.thoigiangiao
//     ? new Date(item.thoigiangiao)
//     : null;

//   return {
//     id: "NHG-" + item.id,
//     external_id: Number(item.id),
//     company: item.tenkh || "",
//     contact: item.nguoilienhe || "",
//     phone: item.sodienthoai || "",
//     address: item.diachi || "",
//     date: deliveryDate
//       ? deliveryDate.toISOString().split("T")[0]
//       : null,
//     time: deliveryDate
//       ? deliveryDate.toTimeString().substring(0, 5)
//       : null,
//     status: mapStatus(item.buoc_hien_tai),
//   };
// }

// module.exports = {
//   mapNhigiaToOrder,
//   mapStatus,
// };

function mapStatus(step) {
  switch (step) {
    case "TRUONGPHONGGIAONHAN":
      return "Chờ tiếp nhận";

    case "NHANVIENGIAONHAN":
      return "Đã điều phối";

    default:
      return "Chờ tiếp nhận";
  }
}

function mapDepartment(name) {
  if (!name) return null;

  const normalized = name.toUpperCase();

  if (normalized.includes("VISA VIỆT NAM"))
    return "Visa Việt Nam";

  if (normalized.includes("GIẤY PHÉP LAO ĐỘNG"))
    return "Giấy Phép Lao Động";

  if (normalized.includes("VISA NƯỚC NGOÀI"))
    return "Visa Nước Ngoài";

  return null;
}

function splitAddress(fullAddress) {
  if (!fullAddress) {
    return {
      address_line: null,
      ward: null,
      district: null,
      province: null,
    };
  }

  const parts = fullAddress.split(",").map(p => p.trim());

  return {
    address_line: parts[0] || null,
    ward: parts[1] || null,
    district: parts[2] || null,
    province: parts[3] || null,
  };
}

function mapNhigiaToOrder(item) {
  const deliveryDate = item.thoigiangiao
    ? new Date(item.thoigiangiao)
    : null;

  const addressParts = splitAddress(item.diachi);

  return {
    external_id: Number(item.id),
    external_department_id: item.idbopan
      ? Number(item.idbopan)
      : null,
    external_company_id: item.idcongty
      ? Number(item.idcongty)
      : null,
    external_sender_id: item.idnguoigiao
      ? Number(item.idnguoigiao)
      : null,

    creator: item.nguoitao || null,
    sender_name: item.nguoigiao || null,
    sender_phone: item.sodienthoai || null,

    company: item.tenkh || null,
    customer_name: item.tenkh || null,
    contact: item.nguoigiao || null,
    contact_person: item.nguoilienhe || null,
    phone: item.sodienthoai || null,

    address: item.diachi || null,
    address_line: addressParts.address_line,
    ward: addressParts.ward,
    district: addressParts.district,
    province: addressParts.province,

    date: deliveryDate
      ? deliveryDate.toISOString().split("T")[0]
      : null,

    time: deliveryDate
      ? deliveryDate.toTimeString().substring(0, 5)
      : item.giogiao || null,

    department: mapDepartment(item.tenbophan),
    purpose: item.mucdich || null,
    notes: item.ghichu || null,

    status: mapStatus(item.buoc_hien_tai),
    current_step: item.buoc_hien_tai || null,
    external_status: item.trang_thai || null,
    external_status_text: item.ten_trang_thai || null,

    create_date: item.ngaytao
      ? new Date(item.ngaytao).getTime()
      : Date.now(),

    status_update_date: item.ngaysua
      ? new Date(item.ngaysua).getTime()
      : null,
  };
}

module.exports = {
  mapNhigiaToOrder,
  mapStatus,
};