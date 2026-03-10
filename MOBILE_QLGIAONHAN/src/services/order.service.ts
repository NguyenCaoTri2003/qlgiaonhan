import axiosClient from "../api/axiosClient";

export const orderService = {
  // ===============================
  // ORDERS
  // ===============================

  async getOrders(
    page = 1,
    limit = 20,
    search = "",
    dept = "",
    filter = "ALL",
  ) {
    const res = await axiosClient.get(
      `/orders?page=${page}&limit=${limit}&search=${search}&dept=${dept}&filter=${filter}`,
    );

    return res.data;
  },

  async getOrderDetail(id: number) {
    const res = await axiosClient.get(`/orders/${id}`);
    return res.data;
  },

  async createOrder(order: any) {
    const res = await axiosClient.post(`/orders`, order);
    return res.data;
  },

  async updateOrder(id: number, updates: any) {
    const res = await axiosClient.put(`/orders/${id}`, updates);
    return res.data;
  },

  async deleteOrder(id: number) {
    const res = await axiosClient.delete(`/orders/${id}`);
    return res.data;
  },

  async getOrderCounts() {
    const res = await axiosClient.get("/orders/counts");
    console.log("RES: ", res.data)
    return res.data;
  },

  async assignReceiver(
    id: number,
    order_code: string,
    receiver_id: number,
    receiver_email: string,
    receiver_name: string,
  ) {
    const res = await axiosClient.post(`/orders/${id}/assign`, {
      order_code,
      receiver_id,
      receiver_email,
      receiver_name,
    });

    return res.data;
  },

  // ===============================
  // SHIPPER ACTION
  // ===============================

  async shipperAccept(id: number, checklist: any[], missingDocs?: string) {
    const res = await axiosClient.post(`/orders/${id}/accept`, {
      checklist,
      missingDocs,
    });

    return res.data;
  },

  async shipperReject(id: number, reason: string) {
    const res = await axiosClient.post(`/orders/${id}/shipper-reject`, {
      reason,
    });

    return res.data;
  },

  async shipperComplete(
    id: number,
    files: any[],
    location: any,
    signature: any,
    note: string,
  ) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", {
        uri: file.uri,
        type: file.type || "image/jpeg",
        name: file.fileName || "photo.jpg",
      } as any);
    });

    if (signature) {
      formData.append("signature", {
        uri: signature.uri,
        type: "image/png",
        name: "signature.png",
      } as any);
    }

    formData.append("note", note);
    formData.append("location", JSON.stringify(location));

    const res = await axiosClient.post(
      `/orders/${id}/shipper-complete`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return res.data;
  },

  async shipperReturnSupplement(id: number, note: string) {
    const res = await axiosClient.post(
      `/orders/${id}/shipper-return-supplement`,
      { note },
    );

    return res.data;
  },

  // ===============================
  // ADMIN / QL ACTION
  // ===============================

  async rejectOrder(id: number, reason: string) {
    const res = await axiosClient.post(`/orders/${id}/reject`, { reason });
    return res.data;
  },

  async completeOrder(id: number) {
    const res = await axiosClient.post(`/orders/${id}/complete`, {});
    return res.data;
  },

  async adminFinalize(id: number, approved: boolean, reason?: string) {
    const res = await axiosClient.post(`/orders/${id}/finalize`, {
      approved,
      reason,
    });

    return res.data;
  },

  async requestSupplement(id: number, note: string) {
    const res = await axiosClient.post(`/orders/${id}/request-supplement`, {
      note,
    });

    return res.data;
  },

  async resolveRequest(id: number, note: string) {
    const res = await axiosClient.put(`/orders/${id}/resolve`, { note });
    return res.data;
  },

  // ===============================
  // ORDER SORT
  // ===============================

  async updateOrderSort(userId: number, orderIds: number[]) {
    const res = await axiosClient.post(`/orders/update-sort`, {
      userId,
      orderIds,
    });

    return res.data;
  },

  // ===============================
  // HIGHLIGHT COLOR
  // ===============================

  async setShipperHighlightColor(
    orderId: number,
    color: "red" | "blue" | "yellow" | null,
  ) {
    const res = await axiosClient.put(`/orders/${orderId}/highlight`, {
      color,
    });

    return res.data;
  },

  // ===============================
  // USERS
  // ===============================

  async getShippers() {
    const res = await axiosClient.get(`/users?role=NVGN`);
    return res.data;
  },
};
