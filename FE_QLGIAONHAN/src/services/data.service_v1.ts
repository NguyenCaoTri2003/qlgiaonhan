import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService, User } from "./auth.service";

export interface CustomerData {
  phone: string;
  company: string;
  address: string;
  contact: string;
}

export type OrderStatus =
  | "Chờ tiếp nhận"
  | "Đã điều phối"
  | "Đang xử lý"
  | "Bổ sung"
  | "Từ chối nhận"
  | "Xử lý Xong"
  | "Hoàn tất"
  | "Chưa hoàn thành";
export type ViewState =
  | "DASHBOARD"
  | "ORDERS"
  | "LOGS"
  | "USER_MANAGEMENT"
  | "GUIDE";
export type DepartmentType =
  | "Visa Việt Nam"
  | "Visa Nước Ngoài"
  | "Giấy Phép Lao Động";
export type FilterType = "ALL" | "PENDING_GROUP" | "DONE_GROUP" | "SUPPLEMENT";

export interface Attachment {
  name: string;
  qty: number;
  checked: boolean;
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

export interface ActivityLog {
  timestamp: number;
  userEmail: string;
  userName: string;
  action: string;
  orderId: string;
  details: string;
}

export interface Notification {
  id: string;
  timestamp: number;
  message: string;
  read: boolean;
  targetRole?: "QL" | "NVADMIN" | "NVGN" | "IT";
  targetEmail?: string;
}

export interface Sender {
  name: string;
  phone: string;
}

export const DEPARTMENTS: DepartmentType[] = [
  "Visa Việt Nam",
  "Visa Nước Ngoài",
  "Giấy Phép Lao Động",
];

export const SENDERS: Sender[] = [
  { name: "Thùy Dương GPLĐ", phone: "0906604788" },
  { name: "Kim Chi Visa", phone: "0901234567" },
  { name: "Minh Tâm Admin", phone: "0909888999" },
  { name: "Lễ Tân Nhị Gia", phone: "02838456789" },
];

export interface Order {
  id: string;
  createDate: number;
  creator: string;
  receiver: string | null;
  receiverName?: string;
  department: DepartmentType;
  senderName: string;
  senderPhone: string;
  time: string;
  date: string;
  company: string;
  address: string;
  addressLine?: string; 
  ward?: string;
  district?: string;
  province?: string;
  contact: string;
  phone: string;
  purpose: string;
  notes: string;
  amountVND: number;
  amountUSD: number;
  attachments: Attachment[];
  uploadedFiles?: { name: string; type: string; data: string }[];
  missingDocs?: string;
  orderId?: string;
  status: OrderStatus;
  statusUpdateDate?: number;
  completionImages?: string[];
  completionNote?: string;
  deliveryLocation?: LocationData;
  signature?: string;
  rejectionReason?: string;
  supplementNote?: string;
  supplementRequesterName?: string;
  supplementDate?: number;
  requestNote?: string;
  reviewNote?: string;
  adminResponse?: string;
  priority: "high" | "medium" | "normal" | "low";
  sort_index: number;
  shipperHighlightColor?: "red" | "blue" | "yellow" | null;
}

@Injectable({ providedIn: "root" })
export class DataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private API = "http://localhost:5000/api";

  orderListFilter = signal<FilterType>("ALL");

  private _orders = signal<Order[]>([]);
  private _logs = signal<ActivityLog[]>([]);
  private _notifications = signal<Notification[]>([]);

  private _customers = signal<CustomerData[]>([]);
  customers = this._customers.asReadonly();

  orders = this._orders.asReadonly();
  logs = this._logs.asReadonly();
  notifications = this._notifications.asReadonly();

  activeView = signal<ViewState>("DASHBOARD");

  setView(view: ViewState) {
    this.activeView.set(view);
  }

  unreadCount = computed(
    () => this._notifications().filter((n) => !n.read).length,
  );

  constructor() {
    this.refreshAll();
  }

  refreshAll() {
    this.loadOrders();
    this.loadLogs();
    this.loadNotifications();
  }

  loadOrders() {
    this.http.get<Order[]>(`${this.API}/orders`).subscribe({
      next: (data) => this._orders.set(data),
      error: (err) => console.error("Load orders error:", err),
    });
  }

  loadLogs() {
    this.http.get<ActivityLog[]>(`${this.API}/logs`).subscribe({
      next: (data) => this._logs.set(data),
      error: (err) => console.error("Load logs error:", err),
    });
  }

  loadNotifications() {
    this.http.get<Notification[]>(`${this.API}/notifications`).subscribe({
      next: (data) => this._notifications.set(data),
      error: (err) => console.error("Load notifications error:", err),
    });
  }

  addOrder(order: Partial<Order>) {
    this.http.post(`${this.API}/orders`, order).subscribe({
      next: () => this.refreshAll(),
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
        next: () => this.refreshAll(),
        error: (err) => console.error("Assign error:", err),
      });
  }

  shipperAccept(id: string, missingDocs?: string) {
    this.http
      .post(`${this.API}/orders/${id}/accept`, {
        missingDocs,
      })
      .subscribe({
        next: () => this.refreshAll(),
        error: (err) => console.error("Accept error:", err),
      });
  }

  shipperReject(id: string, reason: string) {
    this.http
      .post(`${this.API}/orders/${id}/shipper-reject`, {
        reason,
      })
      .subscribe({
        next: () => this.refreshAll(),
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
        next: () => this.refreshAll(),
        error: (err) => console.error("Shipper complete error:", err),
      });
  }

  shipperReturnSupplement(id: string, note: string) {
    this.http
      .post(`${this.API}/orders/${id}/shipper-return-supplement`, {
        note,
      })
      .subscribe({
        next: () => this.refreshAll(),
        error: (err) => console.error("Return supplement error:", err),
      });
  }

  rejectOrder(id: string, reason: string) {
    this.http
      .post(`${this.API}/orders/${id}/reject`, {
        reason,
      })
      .subscribe({
        next: () => this.refreshAll(),
        error: (err) => console.error("Reject error:", err),
      });
  }

  completeOrder(id: string) {
    this.http.post(`${this.API}/orders/${id}/complete`, {}).subscribe({
      next: () => this.refreshAll(),
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
        next: () => this.refreshAll(),
        error: (err) => console.error("Finalize error:", err),
      });
  }

  deleteOrder(id: string) {
    this.http.delete(`${this.API}/orders/${id}`).subscribe({
      next: () => this.refreshAll(),
      error: (err) => console.error("Delete error:", err),
    });
  }

  qlRequestSupplement(id: string, content: string) {
    this.http
      .post(`${this.API}/orders/${id}/request-supplement`, {
        content,
      })
      .subscribe({
        next: () => this.refreshAll(),
        error: (err) => console.error("Request supplement error:", err),
      });
  }

  updateOrder(id: string, updates: Partial<Order>) {
    this.http.put(`${this.API}/orders/${id}`, updates).subscribe({
      next: () => this.refreshAll(),
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
        next: () => {
          // reload orders
          this.loadOrders();

          // gọi log API
          this.http
            .post(`${this.API}/logs`, {
              action: "Bổ sung hồ sơ",
              orderId,
              note,
            })
            .subscribe();

          // gọi notification API
          this.http
            .post(`${this.API}/notifications`, {
              message: `Đơn ${orderId} đã được bổ sung hồ sơ`,
              role: "QL",
            })
            .subscribe();
        },
        error: (err) => console.error("Resolve request error:", err),
      });
  }


  markAsRead(id: number) {
    this.http.post(`${this.API}/notifications/${id}/read`, {}).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error("Mark read error:", err),
    });
  }

  markAllAsRead() {
    this.http.post(`${this.API}/notifications/read-all`, {}).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error("Mark all read error:", err),
    });
  }

  getAllCustomers() {
    this.http.get<CustomerData[]>(`${this.API}/customers`).subscribe({
      next: (data) => this._customers.set(data),
      error: (err) => console.error("Load customers error:", err),
    });
  }

  findCustomerByPhone(phone: string) {
    return this.http.get<CustomerData>(`${this.API}/customers/phone/${phone}`);
  }

  findCustomerByCompany(company: string) {
    return this.http.get<CustomerData>(
      `${this.API}/customers/company/${company}`,
    );
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
