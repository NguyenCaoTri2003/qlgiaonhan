import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivityLog } from "../type/models";

@Injectable({ providedIn: "root" })
export class LogService {
  private http = inject(HttpClient);
  private API = "http://localhost:5000/api";

  private _logs = signal<ActivityLog[]>([]);
  logs = this._logs.asReadonly();

  loadLogs() {
    this.http.get<ActivityLog[]>(`${this.API}/logs`).subscribe({
      next: (data) => this._logs.set(data),
      error: (err) => console.error("Load logs error:", err),
    });
  }
}