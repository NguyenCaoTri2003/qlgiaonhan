import axiosClient from "../api/axiosClient";

export const notificationService = {
  async getNotifications() {
    const res = await axiosClient.get("/notifications");
    return res.data;
  },

  async markAllRead() {
    const res = await axiosClient.put("/notifications/mark-all");
    return res.data;
  },
};