import { useEffect, useState } from "react";
import { orderService } from "../services/order.service";

export default function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const loadOrders = async (
    page = 1,
    limit = 20,
    search = "",
    dept = "",
    filter = "ALL"
  ) => {
    try {
      setLoading(true);

      const res = await orderService.getOrders(
        page,
        limit,
        search,
        dept,
        filter
      );

      setOrders(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.log("Load orders error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return {
    orders,
    loading,
    totalPages,
    loadOrders,
    setOrders,
  };
}