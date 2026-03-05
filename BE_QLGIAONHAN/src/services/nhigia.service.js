const axios = require("axios");

const NHIGIA_API =
  "https://demoapi.nhigia.vn/quanli/apigiaonhan/apigiaonhan.php";

exports.fetchNhigiaOrders = async () => {
  const response = await axios.post(
    NHIGIA_API,
    {
      action: "gethosotruongphong",
      page: 1,
      limit: 50,
      status: 1,
      tenkh: "",
    }
  );

  return response.data.data || [];
};

exports.fetchNhigiaUsers = async () => {
  const response = await axios.post(
    NHIGIA_API,
    {
      action: "get_user"
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
};

exports.fetchNhigiaAttachmentsByDepartment = async (departmentId) => {
  try {
    const response = await axios.post(
      NHIGIA_API,
      {
        action: "get_giaonhan_listhoso_visann_gpld",
        idbophan: departmentId,
        trangthai: 1,
        page: 1,
        limit: 100,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Fetch Nhị Gia Attachments Error:", error.message);
    return [];
  }
};

exports.fetchNhigiaVisaVNType = async (departmentId, typeId) => {
  try {
    const response = await axios.post(
      NHIGIA_API,
      {
        action: "get_loai_dich_vu_visavn",
        idbophan: departmentId,
        iddvvisavn: typeId,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Fetch Nhị Gia Attachments Error:", error.message);
    return [];
  }
};

exports.fetchNhigiaVisaVNTypeDetails = async (departmentId, typeId, detailId) => {
  try {
    const response = await axios.post(
      NHIGIA_API,
      {
        action: "get_chitiet_visavn_hosoyeucau",
        idbophan: departmentId,
        iddvvisavn: typeId,
        idloaihosovisavn: detailId,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Fetch Nhị Gia Attachments Error:", error.message);
    return [];
  }
};