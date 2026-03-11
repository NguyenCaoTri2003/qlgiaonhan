import { createContext, useContext, useEffect } from "react";
import useNotifications from "../hooks/useNotifications";
import { authService } from "../services/auth.service";
import { connectSocket, disconnectSocket } from "../services/socket.service";
import { useOrderContext } from "./OrderContext";

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: any) => {
  const notifications = useNotifications();
  const { reloadOrderCounts, setPendingOrdersCount } = useOrderContext();

  useEffect(() => {
    const init = async () => {
      const user = await authService.getUser();

      notifications.reload();

      if (user) {
        connectSocket(user.id, user.role, {
          notification: () => {
            notifications.reload();
          },

          orderAssigned: (data) => {
            console.log("ORDER SOCKET:", data);

            if (data.pendingOrdersCount !== undefined) {
              setPendingOrdersCount(data.pendingOrdersCount);
            } else {
              reloadOrderCounts();
            }
          },
        });
      }
    };

    init();

    return () => {
      disconnectSocket();
    };
  }, []);
  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};
