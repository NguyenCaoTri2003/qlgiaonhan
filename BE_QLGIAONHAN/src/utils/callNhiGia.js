const axios = require("axios");

const NHIGIA_API =
  process.env.API_URL ||
  "http://demoapi.nhigia.vn/quanli/apigiaonhan/apigiaonhan.php";

const callNhiGia = async (action, token, data = {}) => {
  const response = await axios.post(NHIGIA_API, {
    action,
    token,
    ...data,
  });

  return response.data;
};

module.exports = callNhiGia;