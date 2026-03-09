import { useEffect, useState } from "react";
import { notificationService } from "../services/notification.service";

export default function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();

      setNotifications(data);

      const unread = data.filter((n: any) => n.read === 0).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log("Notification error", err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    reload: loadNotifications,
  };
}