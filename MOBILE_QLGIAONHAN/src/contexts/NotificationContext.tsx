import React, { createContext, useContext, useEffect } from "react";
import useNotifications from "../hooks/useNotifications";

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: any) => {
  const notifications = useNotifications();

  // load ngay khi app start
  useEffect(() => {
    notifications.reload();

    const interval = setInterval(() => {
      notifications.reload();
    }, 10000); // polling 10s

    return () => clearInterval(interval);
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