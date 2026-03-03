import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CustomerData } from "../type/models";

@Injectable({ providedIn: "root" })
export class CustomerService {
  private http = inject(HttpClient);
  private API = "http://localhost:5000/api";

  private _customers = signal<CustomerData[]>([]);
  customers = this._customers.asReadonly();

  getAllCustomers() {
    this.http.get<CustomerData[]>(`${this.API}/customers`).subscribe({
      next: (data) => this._customers.set(data),
      error: (err) => console.error("Load customers error:", err),
    });
  }

  findCustomerByPhone(phone: string) {
    return this.http.get<CustomerData>(
      `${this.API}/customers/phone/${phone}`,
    );
  }

  findCustomerByCompany(company: string) {
    return this.http.get<CustomerData>(
      `${this.API}/customers/company/${company}`,
    );
  }
}