import { Injectable, signal, computed, inject, effect } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { Order, LocationData, FilterType } from "../type/models";
import { tap } from "rxjs";

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

  loading = signal(false);

  setOrders(list: Order[]) {
    this._orders.set(list);
  }

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
      { allowSignalWrites: true },
    );
  }

  refreshOrders() {
    this.loadOrders();
  }

  clearOrders() {
    this._orders.set([]);
  }

  loadOrders(
    page: number = 1,
    limit: number = 20,
    search: string = "",
    dept: string = "",
    filter: string = "ALL",
  ) {
    this.loading.set(true);

    this.http
      .get<any>(
        `${this.API}/orders?page=${page}&limit=${limit}&search=${search}&dept=${dept}&filter=${filter}`,
      )
      .subscribe({
        next: (res) => {
          this._orders.set(res.data);
          this._totalPages.set(res.totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          console.error("Load orders error:", err);
          this.loading.set(false);
        },
      });
  }

  getOrderDetail(id: number) {
    return this.http.get<Order>(`${this.API}/orders/${id}`);
  }

  createOrder(order: Partial<Order>) {
    return this.http.post<{ message: string; id: number }>(
      `${this.API}/orders`,
      order,
    );
  }

  addOrder(order: any) {
    return this.http.post(`${this.API}/orders`, order);
  }

  updateOrder(id: number, updates: any) {
    return this.http.put(`${this.API}/orders/${id}`, updates);
  }

  assignReceiver(
    id: number,
    order_code: string,
    receiver_id: number,
    receiver_email: string,
    receiver_name: string,
  ) {
    return this.http
      .post(`${this.API}/orders/${id}/assign`, {
        order_code,
        receiver_id,
        receiver_email,
        receiver_name,
      })
      .pipe(tap(() => this.refreshOrders()));
  }

  shipperAccept(id: number, checklist: any[], missingDocs?: string) {
    return this.http
      .post(`${this.API}/orders/${id}/accept`, {
        checklist,
        missingDocs,
      })
      .pipe(tap(() => this.refreshOrders()));
  }

  shipperReject(id: number, reason: string) {
    return this.http
      .post(`${this.API}/orders/${id}/shipper-reject`, {
        reason,
      })
      .pipe(tap(() => this.refreshOrders()));
  }

  shipperComplete(
    id: number,
    files: File[],
    location: LocationData,
    signature: File,
    note: string,
  ) {
    const formData = new FormData();

    files.forEach((file) => formData.append("files", file));

    formData.append("signature", signature);
    formData.append("note", note);
    formData.append("location", JSON.stringify(location));

    return this.http.post(
      `${this.API}/orders/${id}/shipper-complete`,
      formData,
    );
  }

  shipperReturnSupplement(id: number, note: string) {
    return this.http
      .post(`${this.API}/orders/${id}/shipper-return-supplement`, {
        note,
      })
      .pipe(tap(() => this.refreshOrders()));
  }

  rejectOrder(id: number, reason: string) {
    return this.http
      .post(`${this.API}/orders/${id}/reject`, {
        reason,
      })
      .pipe(tap(() => this.refreshOrders()));
  }

  completeOrder(id: number) {
    return this.http
      .post(`${this.API}/orders/${id}/complete`, {})
      .pipe(tap(() => this.refreshOrders()));
  }

  adminFinalize(id: number, approved: boolean, reason?: string) {
    return this.http
      .post(`${this.API}/orders/${id}/finalize`, {
        approved,
        reason,
      })
      .pipe(tap(() => this.refreshOrders()));
  }

  deleteOrder(id: number) {
    return this.http
      .delete(`${this.API}/orders/${id}`)
      .pipe(tap(() => this.refreshOrders()));
  }

  qlRequestSupplement(id: number, note: string) {
    return this.http
      .post(`${this.API}/orders/${id}/request-supplement`, {
        note,
      })
      .pipe(tap(() => this.refreshOrders()));
  }

  updateOrderSort(userId: number, orderIds: string[]) {
    this.http
      .post(`${this.API}/orders/update-sort`, {
        userId,
        orderIds,
      })
      .subscribe({
        next: () => {
          console.log("Sort saved");
        },
        error: (err) => console.error("Update sort error:", err),
      });
  }

  resolveRequest(id: number, note: string) {
    return this.http.put(`${this.API}/orders/${id}/resolve`, { note }).pipe(
      tap(() => {
        this._orders.update((list) => {
          const updated = list.map((o) =>
            o.id === id
              ? ({
                  ...o,
                  status: "PENDING",
                  supplementNote: undefined,
                  adminResponse: note,
                  updatedAt: new Date().toISOString(),
                } as unknown as Order)
              : o,
          );

          return updated.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          );
        });
      }),
    );
  }

  requestInfo(orderId: number, note: string) {
    return this.qlRequestSupplement(orderId, note);
  }

  setShipperHighlightColor(
    orderId: number,
    color: "red" | "blue" | "yellow" | null,
  ) {
    return this.http
      .put(`${this.API}/orders/${orderId}/highlight`, { color })
      .pipe(
        tap(() => {
          this._orders.update((list) =>
            list.map((o) =>
              o.id === orderId ? { ...o, shipperHighlightColor: color } : o,
            ),
          );
        }),
      );
  }

  getShippers() {
    this.authService.getUsers("NVGN");
    return this.authService.users;
  }
}
