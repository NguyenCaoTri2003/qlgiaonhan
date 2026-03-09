import { useEffect, useState } from "react";
import { orderService } from "../services/order.service";

export default function useDashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    supplement: 0,
    completed: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);

      const res = await orderService.getOrders(1, 1000);

      const orders = res.data ?? res;

      setStats({
        total: orders.length,
        pending: orders.filter((o: any) =>
          ["PROCESSING", "ASSIGNED"].includes(o.status)
        ).length,
        supplement: orders.filter(
          (o: any) => o.status === "SUPPLEMENT_REQUIRED"
        ).length,
        completed: orders.filter((o: any) =>
          ["COMPLETED", "FINISHED"].includes(o.status)
        ).length,
      });
    } catch (err) {
      console.log("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    refresh: loadStats,
  };
}