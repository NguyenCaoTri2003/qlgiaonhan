import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivityLog } from "../type/models";
import { environment } from "../environments/environment";

@Injectable({ providedIn: "root" })
export class DepartmentService {
  private http = inject(HttpClient);
  private API = environment.API_URL;

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
      `${this.API}/departments/${departmentId}/attachments`,
    );
  }

  getVisaVNTypeByDepartment(departmentId: number, typeId: number) {
    return this.http.get<any[]>(
      `${this.API}/departments/${departmentId}/visa-vn-type/${typeId}`,
    );
  }

  getVisaVNTypeDetailsByDepartment(
    departmentId: number,
    typeId: number,
    detailId: number,
  ) {
    return this.http.get<any[]>(
      `${this.API}/departments/${departmentId}/visa-vn-type/${typeId}/details/${detailId}`,
    );
  }
}
