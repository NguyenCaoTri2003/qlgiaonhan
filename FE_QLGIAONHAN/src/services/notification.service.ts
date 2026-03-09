import { Injectable, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";

export interface Notification {
  id: number;
  message: string;
  targetEmail?: string;
  targetRole?: string;
  read: number; 
  timestamp: number;
}

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private API = "http://localhost:5000/api";

  private _notifications = signal<Notification[]>([]);
  notifications = this._notifications.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  loadNotifications() {
    this.http.get<Notification[]>(`${this.API}/notifications`).subscribe({
      next: (data) => this._notifications.set(data),
      error: (err) => console.error("Load notifications error:", err),
    });
  }

  myNotifications = computed(() =>
    [...this._notifications()].sort((a, b) => b.timestamp - a.timestamp),
  );

  unreadCount = computed(
    () => this.myNotifications().filter((n) => n.read === 0).length,
  );

  markAllAsRead() {
    this.http.put(`${this.API}/notifications/mark-all`, {}).subscribe({
      next: () => {
        // Update local state
        this._notifications.update((current) =>
          current.map((n) => ({ ...n, read: 1 })),
        );
      },
      error: (err) => console.error("Mark read error:", err),
    });
  }
}
