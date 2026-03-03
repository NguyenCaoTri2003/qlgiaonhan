import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface Notification {
  id: number;
  message: string;
  targetEmail?: string;
  targetRole?: string;
  read: number; // 0 | 1 từ MySQL
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private API = 'http://localhost:3000/api';

  private _notifications = signal<Notification[]>([]);
  notifications = this._notifications.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ================= LOAD =================
  loadNotifications() {
    this.http.get<Notification[]>(`${this.API}/notifications`)
      .subscribe({
        next: (data) => this._notifications.set(data),
        error: (err) => console.error('Load notifications error:', err)
      });
  }

  // ================= COMPUTED =================
  myNotifications = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    return this._notifications()
      .filter(n => {
        if (n.targetEmail && n.targetEmail === user.email) return true;
        if (n.targetRole && n.targetRole === user.role) return true;
        return false;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  });

  unreadCount = computed(() =>
    this.myNotifications().filter(n => n.read === 0).length
  );

  // ================= MARK AS READ =================
  markAllAsRead() {
    this.http.put(`${this.API}/notifications/mark-all`, {})
      .subscribe({
        next: () => {
          // Update local state
          this._notifications.update(current =>
            current.map(n => ({ ...n, read: 1 }))
          );
        },
        error: (err) => console.error('Mark read error:', err)
      });
  }
}