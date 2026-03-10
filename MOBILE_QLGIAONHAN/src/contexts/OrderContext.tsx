import React, { createContext, useContext, useState, useEffect } from "react";
import { orderService } from "../services/order.service";

const OrderContext = createContext<any>(null);

export function OrderProvider({ children }: any) {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  
  const loadCounts = async () => {
    try {
      const res = await orderService.getOrderCounts();
      console.log("Res: ", res.data)
      setPendingOrdersCount(res.PENDING_GROUP || 0);
    } catch (err) {
      console.log("Load order counts error:", err);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  return (
    <OrderContext.Provider
      value={{
        pendingOrdersCount,
        reloadOrderCounts: loadCounts,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  return useContext(OrderContext);
}