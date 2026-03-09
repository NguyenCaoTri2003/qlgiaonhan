import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

const axiosClient = axios.create({
  baseURL: API_URL,
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("nhigia_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;