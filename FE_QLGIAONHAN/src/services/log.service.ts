import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivityLog } from "../type/models";
import { environment } from "../environments/environment";

@Injectable({ providedIn: "root" })
export class LogService {
  private http = inject(HttpClient);
  private API = environment.API_URL;

  private _logs = signal<ActivityLog[]>([]);
  logs = this._logs.asReadonly();

  loadLogs() {
    this.http.get<ActivityLog[]>(`${this.API}/logs`).subscribe({
      next: (data) => this._logs.set(data),
      error: (err) => console.error("Load logs error:", err),
    });
  }
}
