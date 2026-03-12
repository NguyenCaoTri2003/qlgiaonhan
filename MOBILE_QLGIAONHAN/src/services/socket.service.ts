import { io, Socket } from "socket.io-client";
import { BE_URL } from "../constants/api";

let socket: Socket | null = null;

export const connectSocket = (
  userId: number,
  role: string,
  handlers?: {
    notification?: (data: any) => void;
    orderAssigned?: (data: any) => void;
  }
) => {
  socket = io(BE_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Mobile socket connected");

    socket?.emit("join", {
      userId,
      role,
    });

    console.log("User joined room:", userId);

    if (handlers?.notification) {
      socket!.on("newNotification", handlers.notification);
    }

    if (handlers?.orderAssigned) {
      socket!.on("orderAssigned", handlers.orderAssigned);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
};

export const disconnectSocket = () => {
  socket?.disconnect();
};