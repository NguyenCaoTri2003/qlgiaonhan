import { Injectable, signal, computed, inject, effect } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { Order, LocationData, FilterType } from "../type/models";

@Injectable({ providedIn: "root" })
export class OrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private API = "http://localhost:5000/api";

  orderListFilter = signal<FilterType>("ALL");

  private _orders = signal<Order[]>([]);
  orders = this._orders.asReadonly();

  private _totalPages = signal<number>(0);
  totalPages = this._totalPages.asReadonly();

  // constructor() {
  //   this.loadOrders();
  // }

  constructor() {
    effect(
      () => {
        const user = this.authService.currentUser();

        if (user) {
          this.loadOrders();
        } else {
          this._orders.set([]);
        }
      },
      { allowSignalWrites: true }, // 👈 QUAN TRỌNG
    );
  }

  refreshOrders() {
    this.loadOrders();
  }

  clearOrders() {
    this._orders.set([]);
  }

  // loadOrders() {
  //   this.http.get<Order[]>(`${this.API}/orders`).subscribe({
  //     next: (data) => this._orders.set(data),
  //     error: (err) => console.error("Load orders error:", err),
  //   });
  // }

  loadOrders(page: number = 1, limit: number = 20) {
    this.http
      .get<any>(`${this.API}/orders?page=${page}&limit=${limit}`)
      .subscribe({
        next: (res) => {
          this._orders.set(res.data);
          this._totalPages.set(res.totalPages);
        },
        error: (err) => console.error("Load orders error:", err),
      });
  }

  addOrder(order: Partial<Order>) {
    this.http.post(`${this.API}/orders`, order).subscribe({
      next: () => this.refreshOrders(),
      error: (err) => console.error("Add order error:", err),
    });
  }

  assignReceiver(id: string, email: string, name: string) {
    this.http
      .post(`${this.API}/orders/${id}/assign`, {
        receiverEmail: email,
        receiverName: name,
      })
      .subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error("Assign error:", err),
      });
  }

  shipperAccept(id: string, missingDocs?: string) {
    this.http
      .post(`${this.API}/orders/${id}/accept`, {
        missingDocs,
      })
      .subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error("Accept error:", err),
      });
  }

  shipperReject(id: string, reason: string) {
    this.http
      .post(`${this.API}/orders/${id}/shipper-reject`, {
        reason,
      })
      .subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error("Shipper reject error:", err),
      });
  }

  shipperComplete(
    id: string,
    images: string[],
    location: LocationData,
    signature: string,
    note: string,
  ) {
    this.http
      .post(`${this.API}/orders/${id}/shipper-complete`, {
        images,
        location,
        signature,
        note,
      })
      .subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error("Shipper complete error:", err),
      });
  }

  shipperReturnSupplement(id: string, note: string) {
    this.http
      .post(`${this.API}/orders/${id}/shipper-return-supplement`, {
        note,
      })
      .subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error("Return supplement error:", err),
      });
  }

  rejectOrder(id: string, reason: string) {
    this.http
      .post(`${this.API}/orders/${id}/reject`, {
        reason,
      })
      .subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error("Reject error:", err),
      });
  }

  completeOrder(id: string) {
    this.http.post(`${this.API}/orders/${id}/complete`, {}).subscribe({
      next: () => this.refreshOrders(),
      error: (err) => console.error("Complete error:", err),
    });
  }

  adminFinalize(id: string, approved: boolean, reason?: string) {
    this.http
      .post(`${this.API}/orders/${id}/finalize`, {
        approved,
        reason,
      })
      .subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error("Finalize error:", err),
      });
  }

  deleteOrder(id: string) {
    this.http.delete(`${this.API}/orders/${id}`).subscribe({
      next: () => this.refreshOrders(),
      error: (err) => console.error("Delete error:", err),
    });
  }

  qlRequestSupplement(id: string, content: string) {
    this.http
      .post(`${this.API}/orders/${id}/request-supplement`, {
        content,
      })
      .subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error("Request supplement error:", err),
      });
  }

  updateOrder(id: string, updates: Partial<Order>) {
    this.http.put(`${this.API}/orders/${id}`, updates).subscribe({
      next: () => this.refreshOrders(),
      error: (err) => console.error("Update order error:", err),
    });
  }

  updateOrderSort(userId: string, orderIds: string[]) {
    this.http
      .post(`${this.API}/orders/update-sort`, {
        userId,
        orderIds,
      })
      .subscribe({
        next: () => this.loadOrders(),
        error: (err) => console.error("Update sort error:", err),
      });
  }

  resolveRequest(orderId: string, note: string) {
    this.http
      .put(`${this.API}/orders/${orderId}`, {
        status: "Chờ tiếp nhận",
        statusUpdateDate: Date.now(),
        adminResponse: note,
      })
      .subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error("Resolve request error:", err),
      });
  }

  requestInfo(orderId: string, note: string) {
    this.qlRequestSupplement(orderId, note);
  }

  setShipperHighlightColor(
    orderId: string,
    color: "red" | "blue" | "yellow" | null,
  ) {
    this.updateOrder(orderId, { shipperHighlightColor: color });
  }

  getShippers() {
    this.authService.getUsers("NVGN");
    return this.authService.users;
  }
}
