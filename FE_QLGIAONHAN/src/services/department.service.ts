import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivityLog } from "../type/models";

@Injectable({ providedIn: "root" })
export class DepartmentService {
  private http = inject(HttpClient);
  private API = "http://localhost:5000/api";

  private _departments = signal<any[]>([]);
  departments = this._departments.asReadonly();

  loadDepartments() {
    return this.http.get<any[]>(`${this.API}/departments`).subscribe({
      next: (data) => this._departments.set(data),
      error: (err) => console.error("Load departments error:", err),
    });
  }

  getAttachmentsByDepartment(departmentId: number) {
    return this.http.get<any[]>(
      `${this.API}/departments/${departmentId}/attachments`
    );
  }
}