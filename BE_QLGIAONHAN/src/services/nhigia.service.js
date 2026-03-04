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