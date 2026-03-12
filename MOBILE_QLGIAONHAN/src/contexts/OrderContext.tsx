import React, { createContext, useContext, useState, useEffect } from "react";
import { orderService } from "../services/order.service";

const OrderContext = createContext<any>(null);

export function OrderProvider({ children }: any) {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const loadCounts = async () => {
    const res = await orderService.getOrderCounts();
    setPendingOrdersCount(res.PENDING_GROUP || 0);
  };

  useEffect(() => {
    loadCounts();
  }, []);

  return (
    <OrderContext.Provider
      value={{
        pendingOrdersCount,
        reloadOrderCounts: loadCounts,
        setPendingOrdersCount,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  return useContext(OrderContext);
}
