import { Injectable, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { environment } from "../environments/environment";

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
  private API = environment.API_URL;

  private _notifications = signal<Notification[]>([]);
  notifications = this._notifications.asReadonly();

  myNotifications = signal<any[]>([]);
  unreadCount = signal(0);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  page = 1;
  totalPages = 1;
  loading = signal(false);

  loadNotifications(reset = true) {
    if (reset) {
      this.page = 1;
      this.myNotifications.set([]);
    }

    if (this.loading()) return;

    this.loading.set(true);

    this.http
      .get<any>(`${this.API}/notifications?page=${this.page}&limit=10`)
      .subscribe({
        next: (res) => {
          const current = this.myNotifications();

          this.myNotifications.set([...current, ...res.data]);

          this.unreadCount.set(res.unreadCount);
          this.totalPages = res.totalPages;

          this.page++;
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  loadMore() {
    if (this.page > this.totalPages) return;
    this.loadNotifications(false);
  }

  markAllAsRead() {
    this.http
      .post(`${this.API}/api/notifications/read-all`, {})
      .subscribe(() => {
        this.unreadCount.set(0);

        const updated = this.myNotifications().map((n) => ({
          ...n,
          read_status: 1,
        }));

        this.myNotifications.set(updated);
      });
  }

  markAsRead(id: number) {
    this.http.put(`${this.API}/notifications/${id}/read`, {}).subscribe(() => {
      const updated = this.myNotifications().map((n) =>
        n.id === id ? { ...n, read_status: 1 } : n,
      );

      this.myNotifications.set(updated);

      this.unreadCount.update((v) => (v > 0 ? v - 1 : 0));
    });
  }
}
