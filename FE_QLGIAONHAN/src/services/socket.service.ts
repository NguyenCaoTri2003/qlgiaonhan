import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class SocketService {

  private socket!: Socket;

  connect() {
    if (!this.socket) {
      this.socket = io(environment.BE_URL, {
        transports: ["websocket"],
      });
    }
  }

  join(userId: number, role: string) {
    this.connect();
    this.socket.emit("join", { userId, role });
  }

  onNotification(callback: (data: any) => void) {
    this.socket.off("newNotification");
    this.socket.on("newNotification", callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}