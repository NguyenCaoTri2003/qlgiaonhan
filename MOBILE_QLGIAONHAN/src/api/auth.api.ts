import axiosClient from "./axiosClient";

export const loginApi = (email: string, password: string) => {
  return axiosClient.post("/auth/login", {
    email,
    password,
  });
};