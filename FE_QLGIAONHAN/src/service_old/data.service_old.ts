// import { Injectable, signal, computed, inject } from '@angular/core';
// import { User, AuthService } from './auth.service';

// export type OrderStatus = 'Chờ tiếp nhận' | 'Đã điều phối' | 'Đang xử lý' | 'Bổ sung' | 'Từ chối nhận' | 'Xử lý Xong' | 'Hoàn tất' | 'Chưa hoàn thành';
// export type ViewState = 'DASHBOARD' | 'ORDERS' | 'LOGS' | 'USER_MANAGEMENT' | 'GUIDE';
// export type DepartmentType = 'Visa Việt Nam' | 'Visa Nước Ngoài' | 'Giấy Phép Lao Động';
// export type FilterType = 'ALL' | 'PENDING_GROUP' | 'DONE_GROUP' | 'SUPPLEMENT';

// export interface Attachment {
//   name: string;
//   qty: number;
//   checked: boolean;
// }

// export interface LocationData {
//   lat: number;
//   lng: number;
//   address?: string;
// }

// export interface ActivityLog {
//   timestamp: number;
//   userEmail: string;
//   userName: string;
//   action: string;
//   orderId: string;
//   details: string;
// }

// export interface Notification {
//   id: string;
//   timestamp: number;
//   message: string;
//   read: boolean;
//   targetRole?: 'QL' | 'NVADMIN' | 'NVGN' | 'IT';
//   targetEmail?: string;
// }

// export interface Sender {
//   name: string;
//   phone: string;
// }

// export const DEPARTMENTS: DepartmentType[] = ['Visa Việt Nam', 'Visa Nước Ngoài', 'Giấy Phép Lao Động'];

// export const SENDERS: Sender[] = [
//   { name: 'Thùy Dương GPLĐ', phone: '0906604788' },
//   { name: 'Kim Chi Visa', phone: '0901234567' },
//   { name: 'Minh Tâm Admin', phone: '0909888999' },
//   { name: 'Lễ Tân Nhị Gia', phone: '02838456789' }
// ];

// export interface Order {
//   id: string;
//   createDate: number;
//   creator: string;
//   receiver: string | null;
//   receiverName?: string;
//   department: DepartmentType;
//   senderName: string;
//   senderPhone: string;
//   time: string;
//   date: string;
//   company: string;
//   address: string; // Combined full address
//   addressLine?: string; // Formerly addressNumber/Số địa chỉ
//   ward?: string;
//   district?: string;
//   province?: string;
//   contact: string;
//   phone: string;
//   purpose: string;
//   notes: string;
//   amountVND: number;
//   amountUSD: number;
//   attachments: Attachment[];
//   uploadedFiles?: { name: string, type: string, data: string }[];
//   missingDocs?: string;
//   orderId?: string;
//   status: OrderStatus;
//   statusUpdateDate?: number;
//   completionImages?: string[];
//   completionNote?: string;
//   deliveryLocation?: LocationData;
//   signature?: string;
//   rejectionReason?: string;
//   supplementNote?: string;
//   supplementRequesterName?: string;
//   supplementDate?: number;
//   requestNote?: string;
//   reviewNote?: string;
//   adminResponse?: string;
//   priority: 'high' | 'medium' | 'normal' | 'low';
//   sort_index: number;
//   shipperHighlightColor?: 'red' | 'blue' | 'yellow' | null;
// }

// export interface CustomerData {
//   phone: string;
//   company: string;
//   address: string;
//   contact: string;
// }

// const MOCK_CUSTOMERS: CustomerData[] = [
//   { phone: '0901234567', company: 'Công ty TNHH ABC', address: '123 Nguyễn Văn Linh, Q.7, TP.HCM', contact: 'Anh Nam' },
//   { phone: '0909888777', company: 'Tập đoàn XYZ', address: '45 Lê Duẩn, Q.1, TP.HCM', contact: 'Chị Lan' },
//   { phone: '0912345678', company: 'Nhị Gia Holdings', address: '186-188 Nguyễn Duy, Q.8, TP.HCM', contact: 'Lễ Tân' },
// ];

// const INITIAL_MOCK_ORDERS: Order[] = [
//   {
//     id: '251023-VSVN-01-KimChi',
//     createDate: Date.now() - 86400000,
//     creator: 'nvadmin@nhigia.vn',
//     receiver: null,
//     department: 'Visa Việt Nam',
//     senderName: 'Kim Chi Visa',
//     senderPhone: '0901234567',
//     time: '09:30',
//     date: '2023-10-25',
//     company: 'Tập đoàn XYZ',
//     address: '45 Lê Duẩn, Q.1, TP.HCM',
//     contact: 'Chị Lan',
//     phone: '0909888777',
//     purpose: 'Giao hồ sơ visa',
//     notes: 'Giao gấp trước 10h',
//     amountVND: 150000,
//     amountUSD: 0,
//     attachments: [{ name: 'Hộ chiếu', qty: 2, checked: false }],
//     priority: 'high',
//     sort_index: 0,
//     province: 'TP.HCM',
//     district: 'Quận 1',
//     status: 'Chờ tiếp nhận',
//     statusUpdateDate: Date.now() - 86400000
//   },
//   {
//     id: '261023-GPLĐ-01-ThuyDuong',
//     createDate: Date.now() - 172800000,
//     creator: 'nvadmin@nhigia.vn',
//     receiver: 'nvgiaonhan1@nhigia.vn',
//     receiverName: 'Văn Giàu',
//     department: 'Giấy Phép Lao Động',
//     senderName: 'Thùy Dương GPLĐ',
//     senderPhone: '0906604788',
//     time: '14:00',
//     date: new Date().toISOString().split('T')[0],
//     company: 'Công ty TNHH ABC',
//     address: '123 Nguyễn Văn Linh',
//     contact: 'Anh Nam',
//     phone: '0901234567',
//     purpose: 'Lấy dấu mộc',
//     notes: '',
//     amountVND: 0,
//     amountUSD: 50,
//     attachments: [{ name: 'GPLĐ', qty: 1, checked: true }],
//     priority: 'normal',
//     sort_index: 1,
//     province: 'TP.HCM',
//     district: 'Quận 7',
//     status: 'Đã điều phối',
//     statusUpdateDate: Date.now() - 3600000
//   }
// ];

// @Injectable({
//   providedIn: 'root'
// })
// export class DataService {
//   private authService = inject(AuthService);
//   activeView = signal<ViewState>('DASHBOARD');
//   orderListFilter = signal<FilterType>('ALL');

//   private _orders = signal<Order[]>([]);
//   private _logs = signal<ActivityLog[]>([]);
//   private _notifications = signal<Notification[]>([]);

//   constructor() {
//     this.loadFromStorage();
//   }

//   orders = this._orders.asReadonly();
//   logs = this._logs.asReadonly();

//   myNotifications = computed(() => {
//     const user = this.authService.currentUser();
//     if (!user) return [];
//     return this._notifications().filter(n => {
//       if (n.targetEmail && n.targetEmail === user.email) return true;
//       if (n.targetRole && n.targetRole === user.role) return true;
//       return false;
//     }).sort((a, b) => b.timestamp - a.timestamp);
//   });

//   unreadCount = computed(() => this.myNotifications().filter(n => !n.read).length);

//   addOrder(order: Partial<Order>) {
//     const department = order.department || 'Visa Việt Nam';
//     const senderName = order.senderName || 'Unknown';
//     const now = new Date();
//     const d = String(now.getDate()).padStart(2, '0');
//     const m = String(now.getMonth() + 1).padStart(2, '0');
//     const y = String(now.getFullYear()).slice(-2);
//     const dateStr = `${d}${m}${y}`;

//     let deptCode = 'VSVN';
//     if (department === 'Giấy Phép Lao Động') deptCode = 'GPLĐ';
//     if (department === 'Visa Nước Ngoài') deptCode = 'VSNQ';

//     const todayPrefix = `${dateStr}-${deptCode}`;
//     const count = this._orders().filter(o => o.id.startsWith(todayPrefix)).length;
//     const seq = String(count + 1).padStart(2, '0');

//     let cleanName = this.removeAccents(senderName.replace(/GPLĐ|Visa|Admin|Nhị Gia/gi, '').trim()).replace(/\s+/g, '');
//     const newId = `${dateStr}-${deptCode}-${seq}-${cleanName}`;

//     const addressLine = order.addressLine || '';
//     const ward = order.ward || '';
//     const district = order.district || '';
//     const province = order.province || 'Unknown';
//     const combinedAddress = [addressLine, ward, district, province].filter(p => !!p).join(', ');

//     const newOrder: Order = {
//       id: newId,
//       createDate: Date.now(),
//       creator: this.authService.currentUser()?.email || 'unknown',
//       receiver: null,
//       status: 'Chờ tiếp nhận',
//       statusUpdateDate: Date.now(),
//       amountVND: order.amountVND || 0,
//       amountUSD: order.amountUSD || 0,
//       attachments: order.attachments || [],
//       uploadedFiles: order.uploadedFiles || [],
//       priority: order.priority || 'normal',
//       sort_index: count,
//       address: combinedAddress,
//       addressLine: addressLine,
//       ward: ward,
//       district: district,
//       province: province,
//       department: department,
//       senderName: senderName,
//       senderPhone: order.senderPhone || '',
//       company: order.company || '',
//       contact: order.contact || '',
//       phone: order.phone || '',
//       purpose: order.purpose || '',
//       notes: order.notes || '',
//       time: order.time || '08:00',
//       date: order.date || new Date().toISOString().split('T')[0]
//     };

//     this._orders.update(current => [newOrder, ...current]);
//     this.logActivity('Tạo mới', newOrder.id, `Đơn hàng được tạo cho ${newOrder.company}`);
//     this.pushNotification(`Đơn hàng mới ${newOrder.id} cần điều phối`, 'QL');
//     this.saveToStorage();
//   }

//   updateOrderSort(userId: string, orderIds: string[]) {
//     this._orders.update(current => {
//       const updated = [...current];
//       orderIds.forEach((id, index) => {
//         const idx = updated.findIndex(o => o.id === id);
//         if (idx !== -1) updated[idx] = { ...updated[idx], sort_index: index };
//       });
//       return updated;
//     });
//     this.saveToStorage();
//   }

//   updateOrder(id: string, updates: Partial<Order>) {
//     this._orders.update(current =>
//       current.map(o => o.id === id ? { ...o, ...updates } : o)
//     );
//     this.saveToStorage();
//   }

//   setShipperHighlightColor(orderId: string, color: 'red' | 'blue' | 'yellow' | null) {
//     this.updateOrder(orderId, { shipperHighlightColor: color });
//   }

//   deleteOrder(id: string) {
//     this._orders.update(current => current.filter(o => o.id !== id));
//     this.logActivity('Xóa đơn', id, `Admin đã xóa đơn hàng`);
//     this.saveToStorage();
//     this.pushNotification(`Đơn hàng ${id} đã bị xóa bởi Admin`, 'QL');
//   }

//   assignReceiver(orderId: string, receiverEmail: string, receiverName: string) {
//     this.updateOrder(orderId, {
//       receiver: receiverEmail,
//       receiverName: receiverName,
//       status: 'Đã điều phối',
//       statusUpdateDate: Date.now()
//     });
//     this.logActivity('Điều phối', orderId, `Giao cho ${receiverName}`);
//     this.pushNotification(`Bạn được giao đơn hàng mới: ${orderId}`, 'NVGN', receiverEmail);
//   }

//   qlRequestSupplement(orderId: string, note: string) {
//     const user = this.authService.currentUser();
//     this.updateOrder(orderId, {
//       status: 'Bổ sung',
//       statusUpdateDate: Date.now(),
//       supplementNote: note,
//       supplementRequesterName: user?.name || 'QL',
//       supplementDate: Date.now(),
//       requestNote: note,
//       receiver: null,
//       receiverName: undefined
//     });
//     this.logActivity('QL Yêu cầu bổ sung', orderId, note);
//     this.pushNotification(`Đơn ${orderId} QL yêu cầu bổ sung`, 'NVADMIN');
//   }

//   // Alias for backward compatibility
//   requestInfo(orderId: string, note: string) {
//     this.qlRequestSupplement(orderId, note);
//   }

//   // Restore resolveRequest
//   resolveRequest(orderId: string, note: string) {
//     this.updateOrder(orderId, {
//       status: 'Chờ tiếp nhận',
//       statusUpdateDate: Date.now(),
//       adminResponse: note
//     });
//     this.logActivity('Bổ sung hồ sơ', orderId, note);
//     this.pushNotification(`Đơn ${orderId} đã được bổ sung hồ sơ`, 'QL');
//   }

//   shipperAccept(orderId: string, missingDocsNote?: string, updatedAttachments?: Attachment[]) {
//     const updates: Partial<Order> = {
//       status: 'Đang xử lý',
//       statusUpdateDate: Date.now()
//     };
//     if (missingDocsNote) updates.missingDocs = missingDocsNote;
//     if (updatedAttachments) updates.attachments = updatedAttachments;

//     this.updateOrder(orderId, updates);
//     this.logActivity('Nhận đơn', orderId, missingDocsNote ? `Thiếu: ${missingDocsNote}` : 'Đã nhận');
//     this.pushNotification(`Shipper đã nhận đơn ${orderId}`, 'QL');
//   }

//   shipperReturnSupplement(orderId: string, note: string) {
//     const user = this.authService.currentUser();
//     this.updateOrder(orderId, {
//       status: 'Bổ sung',
//       statusUpdateDate: Date.now(),
//       supplementNote: note,
//       supplementRequesterName: user?.name || 'Shipper',
//       supplementDate: Date.now(),
//       requestNote: note,
//       receiver: null,
//       receiverName: undefined
//     });
//     this.logActivity('NVGN Yêu cầu bổ sung', orderId, note);
//     this.pushNotification(`NVGN yêu cầu bổ sung for ${orderId}`, 'QL');
//   }

//   shipperReject(orderId: string, reason: string) {
//     this.updateOrder(orderId, {
//       status: 'Từ chối nhận',
//       statusUpdateDate: Date.now(),
//       rejectionReason: reason
//     });
//     this.logActivity('Từ chối', orderId, reason);
//     this.pushNotification(`Đơn ${orderId} bị từ chối`, 'QL');
//   }

//   shipperComplete(orderId: string, images: string[], location: LocationData, signature: string, note: string) {
//     this.updateOrder(orderId, {
//       status: 'Xử lý Xong',
//       statusUpdateDate: Date.now(),
//       completionImages: images,
//       deliveryLocation: location,
//       signature: signature,
//       completionNote: note
//     });
//     this.logActivity('Xử lý xong', orderId, 'Chờ duyệt');
//     this.pushNotification(`Đơn ${orderId} đã xử lý xong`, 'NVADMIN');
//   }

//   // Alias for backward compatibility or different casing
//   shipperReturn(orderId: string, note: string) {
//     this.shipperReturnSupplement(orderId, note);
//   }

//   adminFinalize(orderId: string, approved: boolean, reason?: string) {
//     if (approved) {
//       this.updateOrder(orderId, {
//         status: 'Hoàn tất',
//         statusUpdateDate: Date.now()
//       });
//       this.logActivity('Hoàn tất', orderId, 'Admin đã duyệt');
//     } else {
//       this.updateOrder(orderId, {
//         status: 'Chưa hoàn thành',
//         statusUpdateDate: Date.now(),
//         reviewNote: reason,
//         adminResponse: reason
//       });
//       this.logActivity('Chưa hoàn thành', orderId, reason || 'Không duyệt');
//     }
//   }

//   logActivity(action: string, orderId: string, details: string) {
//     const user = this.authService.currentUser();
//     this._logs.update(logs => [{
//       timestamp: Date.now(),
//       userEmail: user?.email || 'system',
//       userName: user?.name || 'System',
//       action,
//       orderId,
//       details
//     }, ...logs]);
//     this.saveToStorage();
//   }

//   private saveToStorage() {
//     localStorage.setItem('nhigia_orders', JSON.stringify(this._orders()));
//     localStorage.setItem('nhigia_logs', JSON.stringify(this._logs()));
//     localStorage.setItem('nhigia_notifications', JSON.stringify(this._notifications()));
//   }

//   private loadFromStorage() {
//     const orders = localStorage.getItem('nhigia_orders');
//     const logs = localStorage.getItem('nhigia_logs');
//     const noteis = localStorage.getItem('nhigia_notifications');

//     if (orders) {
//       this._orders.set(JSON.parse(orders));
//     } else {
//       // Default mock data if empty
//       this._orders.set([
//         {
//           id: '251023-VSVN-01-KimChi',
//           createDate: Date.now() - 86400000,
//           creator: 'nvadmin@nhigia.vn',
//           receiver: null,
//           department: 'Visa Việt Nam',
//           senderName: 'Kim Chi Visa',
//           senderPhone: '0901234567',
//           time: '09:30',
//           date: '2023-10-25',
//           company: 'TẬP ĐOÀN XYZ',
//           address: '45 Lê Duẩn, Q.1, TP.HCM',
//           contact: 'Chị Lan',
//           phone: '0909888777',
//           purpose: 'Giao hồ sơ visa',
//           notes: 'Giao gấp trước 10h',
//           amountVND: 150000,
//           amountUSD: 0,
//           attachments: [{ name: 'Hộ chiếu', qty: 2, checked: false }],
//           priority: 'high',
//           sort_index: 0,
//           province: 'TP.HCM',
//           district: 'Quận 1',
//           status: 'Chờ tiếp nhận',
//           statusUpdateDate: Date.now() - 86400000
//         }
//       ]);
//     }
//     if (logs) this._logs.set(JSON.parse(logs));
//     if (noteis) this._notifications.set(JSON.parse(noteis));
//   }

//   private pushNotification(message: string, role?: 'QL' | 'NVADMIN' | 'NVGN' | 'IT', email?: string) {
//     this._notifications.update(ns => [{
//       id: Math.random().toString(36).substr(2, 9),
//       timestamp: Date.now(),
//       message,
//       read: false,
//       targetRole: role,
//       targetEmail: email
//     }, ...ns]);
//   }

//   markAllAsRead() {
//     const user = this.authService.currentUser();
//     this._notifications.update(ns => ns.map(n => {
//       const isTarget = (n.targetEmail && n.targetEmail === user?.email) || (n.targetRole && n.targetRole === user?.role);
//       return isTarget ? { ...n, read: true } : n;
//     }));
//   }

//   private removeAccents(str: string): string {
//     return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
//   }

//   findCustomerByPhone(phone: string): CustomerData | undefined {
//     return MOCK_CUSTOMERS.find(c => c.phone === phone);
//   }

//   findCustomerByCompany(company: string): CustomerData | undefined {
//     return MOCK_CUSTOMERS.find(c => c.company === company);
//   }

//   getAllCustomers() {
//     return MOCK_CUSTOMERS;
//   }

//   // getShippers(): User[] {
//   //   return this.authService.users().filter(u => u.role === 'NVGN');
//   // }  
// }