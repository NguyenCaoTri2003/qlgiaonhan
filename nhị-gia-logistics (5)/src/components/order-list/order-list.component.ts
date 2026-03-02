import { Component, inject, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DataService, Order, OrderStatus, DepartmentType, FilterType, LocationData } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="space-y-4">
      
      <!-- Search & Filters Toolbar -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <div class="relative">
          <input type="text" 
                 [ngModel]="searchTerm()" 
                 (ngModelChange)="searchTerm.set($event)"
                 placeholder="Tìm theo Mã, Khách hàng, Địa chỉ, Người giao..." 
                 class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select [ngModel]="filterDept()" (ngModelChange)="filterDept.set($event)" class="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả Bộ phận</option>
            <option value="Visa Việt Nam">Visa Việt Nam</option>
            <option value="Visa Nước Ngoài">Visa Nước Ngoài</option>
            <option value="Giấy Phép Lao Động">Giấy Phép Lao Động</option>
          </select>
          
          <select [ngModel]="filterProvince()" (ngModelChange)="filterProvince.set($event); filterDistrict.set('')" class="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả Tỉnh/Thành</option>
            <option *ngFor="let p of provinces" [value]="p">{{ p }}</option>
          </select>

          <select [ngModel]="filterDistrict()" (ngModelChange)="filterDistrict.set($event)" [disabled]="!filterProvince()" class="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
            <option value="">Tất cả Quận/Huyện</option>
            <option *ngFor="let d of districts[filterProvince()]" [value]="d">{{ d }}</option>
          </select>
        </div>
      </div>

      <!-- Advanced Filters (Tabs) -->
      <div class="flex space-x-2 border-b border-gray-200 bg-white px-4 rounded-t-lg shadow-sm overflow-x-auto">
        <button (click)="setFilter('ALL')"
          [class]="currentFilter() === 'ALL' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
          Tất cả
        </button>
        <button (click)="setFilter('PENDING_GROUP')"
          [class]="currentFilter() === 'PENDING_GROUP' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
          Cần Xử Lý (Gấp)
        </button>
        <button (click)="setFilter('DONE_GROUP')"
          [class]="currentFilter() === 'DONE_GROUP' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
          Đã Hoàn Tất
        </button>
        <div class="flex-1"></div>
      </div>

      <!-- Main Order List -->
      <div class="bg-white rounded-b-lg rounded-tr-lg shadow overflow-hidden">
        
        <!-- Mobile View with Drag & Drop -->
        <div class="block md:hidden" cdkDropList (cdkDropListDropped)="onDrop($event)" [cdkDropListDisabled]="authService.userRole() !== 'NVGN'">
          @for (order of filteredOrders(); track order.id) {
            <div [class]="'p-4 border-b border-gray-200 cursor-pointer transition-colors relative ' + getShipperHighlightClass(order.shipperHighlightColor)" 
                 cdkDrag (click)="clickItem($event, order)">
              
              <div *cdkDragPlaceholder class="bg-gray-100 h-32 border-2 border-dashed border-gray-300"></div>

              <!-- Department Strip -->
              <div [class]="'absolute left-0 top-0 bottom-0 w-1 ' + getDeptColorClass(order.department)"></div>

              <!-- Top Row: ID + Status -->
              <div class="flex justify-between items-start mb-2 pl-2">
                <div class="flex flex-col">
                  <span class="font-bold text-sm text-blue-700 leading-tight">#{{ order.orderId || order.id }}</span>
                  <span [class]="'text-[10px] font-bold uppercase tracking-wide ' + getDeptTextColorClass(order.department)">{{ order.department }}</span>
                </div>
                <div class="flex flex-col items-end gap-2 shrink-0 ml-2">
                  <div class="flex items-center">
                    <span [class]="getStatusClass(order.status) + ' px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap shadow-sm'">
                      {{ getStatusLabel(order.status) }}
                    </span>
                    <button *ngIf="authService.userRole() === 'NVADMIN' && order.status === 'Chờ tiếp nhận'" 
                            (click)="confirmDelete($event, order)"
                            class="ml-2 bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold hover:bg-red-100 transition-colors uppercase">
                      Xóa
                    </button>
                  </div>
                </div>
              </div>

              <!-- Main Info Block -->
              <div class="space-y-2 text-sm text-gray-700 pl-2">
                
                <!-- Feedback/Warnings -->
                @if (order.rejectionReason) {
                   <div class="text-[10px] text-red-700 font-bold break-words bg-red-50 p-1 rounded border border-red-100">
                     🚫 Từ chối: {{ order.rejectionReason }}
                   </div>
                }
                @if (order.status === 'Bổ sung' && order.supplementNote) {
                   <div class="text-[10px] text-orange-700 font-bold break-words bg-orange-50 p-1 rounded border border-orange-100">
                     🔔 Bổ sung: {{ order.supplementNote }}
                     <div class="text-[9px] text-orange-400 mt-1">
                        {{ order.supplementRequesterName }} - {{ order.supplementDate | date:'HH:mm dd/MM/yy' }}
                     </div>
                   </div>
                }
                @if (order.status === 'Đang xử lý' && order.missingDocs) {
                   <div class="text-[10px] text-orange-700 font-bold break-words bg-orange-50 p-1 rounded border border-orange-100">
                     ⚠️ Thiếu hồ sơ: {{ order.missingDocs }}
                   </div>
                }
                @if (order.status === 'Chưa hoàn thành' && order.reviewNote) {
                   <div class="text-[10px] text-red-700 font-bold break-words bg-red-50 p-1 rounded border border-red-100">
                     ❌ Không duyệt: {{ order.reviewNote }}
                   </div>
                }

                <div class="break-words">
                  <span class="font-bold text-gray-900 uppercase">{{ order.company }}</span>
                </div>

                <!-- Address -->
                <div class="flex items-start break-words text-xs">
                  <a [href]="'https://www.google.com/maps/search/?api=1&query=' + encodeAddress(order.address)"
                     target="_blank" 
                     (click)="$event.stopPropagation()"
                     class="flex items-start text-blue-600 hover:text-blue-800 hover:underline">
                    <span class="shrink-0 mr-1.5 mt-0.5">📍</span>
                    <span>{{ order.address }}</span>
                  </a>
                </div>

                <!-- Receiver / Purpose -->
                 <div class="pt-2 mt-2 border-t border-gray-50 flex items-start justify-between text-[10px] text-gray-500">
                    <span class="break-words pr-2 max-w-[65%] font-bold text-orange-600 uppercase">{{ order.purpose }}</span>
                    <span class="italic shrink-0">{{ order.receiverName || 'Chưa phân công' }}</span>
                 </div>

              </div>
            </div>
          }
          @if (filteredOrders().length === 0) {
            <div class="p-8 text-center text-gray-500">Chưa có công việc nào.</div>
          }
        </div>

        <!-- Desktop View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã / Bộ Phận</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người Giao</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách Hàng / Địa Chỉ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mục Đích</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (order of filteredOrders(); track order.id) {
                <tr [class]="'cursor-pointer transition-colors ' + (order.shipperHighlightColor ? getShipperHighlightClass(order.shipperHighlightColor) : 'hover:bg-blue-50')" (click)="select.emit(order)">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-xs font-medium text-blue-600">#{{ order.orderId || order.id }}</div>
                    <div [class]="'text-xs font-semibold mt-1 ' + getDeptTextColorClass(order.department)">
                      {{ order.department }}
                    </div>
                    <div class="text-xs text-gray-400 mt-1">{{ order.date | date:'dd/MM' }} - {{ order.time }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="font-medium text-gray-900">{{ order.senderName }}</div>
                    @if (order.senderPhone) {
                       <a [href]="'tel:' + order.senderPhone" (click)="$event.stopPropagation()" class="text-xs text-blue-500 hover:underline flex items-center">
                         📞 {{ order.senderPhone }}
                       </a>
                    }
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    <div class="font-medium text-gray-900 uppercase">{{ order.company }}</div>
                    
                    @if (order.rejectionReason) {
                       <div class="text-[10px] text-red-700 font-bold mt-1 bg-red-50 inline-block px-1 rounded">🚫 {{ order.rejectionReason }}</div>
                    }

                    <div class="flex flex-col text-xs mt-1">
                      <a [href]="'https://www.google.com/maps/search/?api=1&query=' + encodeAddress(order.address)" 
                         target="_blank" (click)="$event.stopPropagation()" class="text-blue-500 hover:underline flex items-center mb-1">
                         <span class="mr-1">📍</span> {{ order.address }}
                      </a>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {{ order.purpose }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col gap-2">
                      <div class="flex items-center gap-2">
                        <span [class]="getStatusClass(order.status) + ' px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit justify-center'">
                          {{ getStatusLabel(order.status) }}
                        </span>
                        <button *ngIf="authService.userRole() === 'NVADMIN' && order.status === 'Chờ tiếp nhận'" 
                                (click)="confirmDelete($event, order)"
                                class="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-red-100 transition-colors uppercase">
                          Xóa
                        </button>
                      </div>
                      @if (order.status === 'Bổ sung' && order.supplementNote) {
                         <div class="text-[10px] text-orange-600 max-w-[150px] truncate">{{ order.supplementNote }}</div>
                         <div class="text-[8px] text-gray-400 italic">bởi {{ order.supplementRequesterName }} - {{ order.supplementDate | date:'HH:mm dd/MM' }}</div>
                      }
                      @if (order.status === 'Đang xử lý' && order.missingDocs) {
                         <div class="text-[10px] text-orange-600">⚠️ Thiếu: {{ order.missingDocs }}</div>
                      }
                      @if (order.status === 'Chưa hoàn thành' && order.reviewNote) {
                         <div class="text-[10px] text-red-600 font-bold">❌ {{ order.reviewNote }}</div>
                      }
                    </div>
                    @if (order.statusUpdateDate) {
                      <div class="text-[9px] text-gray-400 mt-1 ml-1">{{ order.statusUpdateDate | date:'HH:mm dd/MM/yyyy' }}</div>
                    }
                  </td>
                </tr>
              }
              @if (filteredOrders().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                    Không tìm thấy công việc nào phù hợp.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Overlay -->
      <div *ngIf="selectedActionOrder() as sel" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="bg-blue-600 p-4 text-white flex justify-between items-center">
             <h3 class="font-bold text-lg">Chi tiết yêu cầu: {{ sel.orderId || sel.id }}</h3>
             <button (click)="closeAction()" class="text-white hover:bg-blue-700 px-2 rounded font-bold text-xl">✕</button>
          </div>
          
          <div class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
             <div class="text-sm text-gray-600">
                <p><strong>Khách hàng:</strong> {{ sel.company }}</p>
                <p><strong>Trạng thái:</strong> {{ sel.status }}</p>
                <p><strong>Nội dung:</strong> {{ sel.purpose }}</p>
                
                <div *ngIf="sel.rejectionReason" class="mt-2 p-2 bg-red-50 border border-red-100 rounded text-red-700 text-xs">
                   <strong>Lý do từ chối:</strong> {{ sel.rejectionReason }}
                </div>
                <div *ngIf="sel.supplementNote" class="mt-2 p-2 bg-orange-50 border border-orange-100 rounded text-orange-700 text-xs">
                   <strong>Yêu cầu bổ sung:</strong> {{ sel.supplementNote }}
                </div>
                <div *ngIf="sel.reviewNote" class="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-gray-700 font-bold text-xs">
                   <strong>Lý do chưa hoàn thành:</strong> {{ sel.reviewNote }}
                </div>
             </div>

             <!-- Dynamic Forms -->
             <div *ngIf="authService.userRole() === 'NVADMIN'">
                <div *ngIf="sel.status === 'Xử lý Xong'" class="space-y-3">
                   <p class="text-green-600 font-bold">Shipper đã hoàn thành! Kiểm tra ngay.</p>
                   <div class="grid grid-cols-2 gap-2">
                      <button (click)="approveOrder()" class="bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 uppercase transition-all shadow-sm">Chấp Nhận Duyệt</button>
                      <button (click)="rejectOrderAdmin()" class="bg-red-100 text-red-600 py-2 rounded font-bold hover:bg-red-200 uppercase transition-all">Không duyệt</button>
                   </div>
                   <textarea [(ngModel)]="actionReason" placeholder="Nhập lý do nếu bấm 'Không duyệt'..." class="w-full border p-2 rounded text-sm mt-2"></textarea>
                </div>
                <div *ngIf="sel.status === 'Chờ tiếp nhận'" class="mt-4 pt-4 border-t">
                   <button (click)="confirmDelete($event, sel)" class="w-full bg-red-600 text-white py-3 rounded font-bold uppercase shadow-md hover:bg-red-700 transition-all">
                      Xóa yêu cầu công việc
                   </button>
                </div>
             </div>

             <div *ngIf="authService.userRole() === 'QL'">
                <div *ngIf="['Chờ tiếp nhận', 'Từ chối nhận', 'Bổ sung'].includes(sel.status)" class="space-y-4">
                   <button (click)="assignOrder()" class="w-full bg-blue-600 text-white py-3 rounded font-bold uppercase shadow-md hover:bg-blue-700 transition-all">Điều phối nhân viên</button>
                   
                   <div class="pt-2 border-t mt-4">
                      <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Yêu cầu bổ sung hồ sơ:</p>
                      <textarea [(ngModel)]="actionNote" class="w-full border p-2 rounded text-sm min-h-[80px] outline-none focus:ring-1 focus:ring-orange-500" placeholder="Ghi chú yêu cầu chi tiết..."></textarea>
                      <button (click)="requestSupplementQL()" class="w-full bg-orange-500 text-white py-2 rounded font-bold text-xs mt-1 uppercase hover:bg-orange-600">Gửi yêu cầu bổ sung</button>
                   </div>
                </div>
             </div>

             <div *ngIf="authService.userRole() === 'NVGN'">
                <div *ngIf="sel.status === 'Đã điều phối'" class="space-y-3">
                     <div class="bg-gray-50 p-3 rounded border">
                        <p class="text-[10px] font-bold mb-2 uppercase text-gray-400">Kiểm tra hồ sơ tại chỗ</p>
                        <div *ngFor="let doc of sel.attachments" class="flex items-center gap-2 text-sm mb-1">
                           <input type="checkbox" [(ngModel)]="doc.checked" class="w-4 h-4 text-blue-600 rounded">
                           <span>{{ doc.name }} ({{ doc.qty }})</span>
                        </div>
                     </div>
                     <textarea [(ngModel)]="actionReason" placeholder="Ghi chú nếu thiếu hồ sơ hoặc lý do từ chối..." class="w-full border p-2 rounded text-sm"></textarea>
                     <div class="grid grid-cols-2 gap-2">
                        <button (click)="acceptJob()" class="bg-blue-600 text-white py-3 rounded font-bold uppercase hover:bg-blue-700">Nhận đơn</button>
                        <button (click)="rejectJob()" class="bg-red-50 text-red-600 py-3 rounded font-bold uppercase hover:bg-red-100">Từ chối</button>
                     </div>
                </div>

                <div *ngIf="sel.status === 'Đang xử lý'" class="space-y-3">
                     <div class="border p-3 rounded bg-gray-50">
                        <p class="text-[10px] font-bold mb-2 uppercase text-gray-400">Upload Ảnh hiện trường</p>
                        <div class="text-[10px] text-gray-500 italic font-medium">Hệ thống đã tự động gán 3 ảnh mock từ máy ảnh.</div>
                     </div>
                     <div>
                        <label class="block text-xs font-bold mb-1 uppercase text-gray-400">Chữ ký khách hàng</label>
                        <div class="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-white relative">
                           <input [(ngModel)]="mockSignature" placeholder="Nhập tên KH để xác nhận..." class="w-full border-b border-gray-100 outline-none text-center italic font-serif text-lg py-2 uppercase tracking-widest">
                           <div class="text-[8px] text-gray-300 absolute bottom-1 right-2">SIGNATURE FIELD</div>
                        </div>
                     </div>
                     <button (click)="completeJob()" class="w-full bg-purple-600 text-white py-3 rounded font-bold shadow-lg uppercase hover:bg-purple-700 transition-all">Hoàn tất công việc</button>
                     
                     <div class="pt-2 border-t mt-2 text-center">
                        <button (click)="returnJob()" class="text-red-500 text-[10px] font-bold underline uppercase hover:text-red-700">Báo thiếu hồ sơ (Trả về QL)</button>
                     </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrderListComponent {
  select = output<Order>();
  create = output<void>();

  dataService = inject(DataService);
  authService = inject(AuthService);

  // Filter signals
  currentFilter = this.dataService.orderListFilter;
  searchTerm = signal('');
  filterDept = signal('');
  filterProvince = signal('');
  filterDistrict = signal('');

  // Local UI state
  selectedActionOrder = signal<Order | null>(null);
  actionNote = '';
  actionReason = '';
  mockSignature = '';

  // Mock data for dropdowns
  provinces = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Long An', 'Bình Dương'];
  districts: Record<string, string[]> = {
    'TP.HCM': ['Quận 1', 'Quận 3', 'Quận 7', 'Quận 8', 'Bình Thạnh', 'Thủ Đức'],
    'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Cầu Giấy'],
    'Long An': ['Tân An', 'Bến Lức'],
    'Bình Dương': ['Thủ Dầu Một', 'Thuận An'],
  };

  onCreate() {
    this.create.emit();
  }

  setFilter(filter: FilterType) {
    this.dataService.orderListFilter.set(filter);
  }

  confirmDelete(event: Event, order: Order) {
    event.stopPropagation();
    if (confirm(`Bạn có chắc muốn xóa yêu cầu ${order.orderId || order.id || order.id}?`)) {
      this.dataService.deleteOrder(order.id);
    }
  }

  // Action logic
  clickItem(event: Event, order: Order) {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || (target as any).type === 'checkbox') return;
    this.select.emit(order);
  }

  openAction(event: Event, order: Order) {
    event.stopPropagation();
    this.selectedActionOrder.set(order);
    this.actionNote = '';
    this.actionReason = '';
    this.mockSignature = '';
  }

  closeAction() {
    this.selectedActionOrder.set(null);
  }

  canShowAction(o: Order): boolean {
    const role = this.authService.userRole();
    if (!role) return false;

    if (role === 'NVADMIN') return o.status === 'Xử lý Xong';
    if (role === 'QL') return ['Chờ tiếp nhận', 'Từ chối nhận', 'Bổ sung'].includes(o.status);
    if (role === 'NVGN') return ['Đã điều phối', 'Đang xử lý'].includes(o.status);
    return false;
  }

  // --- Actions ---
  approveOrder() {
    const o = this.selectedActionOrder();
    if (!o) return;
    this.closeAction();
    this.dataService.adminFinalize(o.id, true);
  }

  rejectOrderAdmin() {
    const o = this.selectedActionOrder();
    if (!o || !this.actionReason) return alert('Vui lòng nhập lý do chưa hoàn thành!');
    this.closeAction();
    this.dataService.adminFinalize(o.id, false, this.actionReason);
  }

  assignOrder() {
    const o = this.selectedActionOrder();
    if (!o) return;
    const shipper = prompt('Nhập email Shipper (VD: nvgiaonhan1@nhigia.vn):', 'nvgiaonhan1@nhigia.vn');
    if (shipper) {
      this.closeAction();
      const name = shipper.includes('1') ? 'Văn Giàu' : 'Trung Hiếu';
      this.dataService.assignReceiver(o.id, shipper, name);
    }
  }

  requestSupplementQL() {
    const o = this.selectedActionOrder();
    if (!o || !this.actionNote) return alert('Nhập ghi chú chi tiết hồ sơ cần bổ sung!');
    this.closeAction();
    this.dataService.qlRequestSupplement(o.id, this.actionNote);
  }

  acceptJob() {
    const o = this.selectedActionOrder();
    if (!o) return;
    this.closeAction();
    this.dataService.shipperAccept(o.id);
  }

  rejectJob() {
    const o = this.selectedActionOrder();
    if (!o || !this.actionReason) return alert('Vui lòng nhập lý do từ chối đơn hàng này!');
    this.closeAction();
    this.dataService.shipperReject(o.id, this.actionReason);
  }

  returnJob() {
    const o = this.selectedActionOrder();
    if (!o || !this.actionReason) return alert('Vui lòng ghi rõ hồ sơ bị thiếu!');
    this.closeAction();
    this.dataService.shipperReturnSupplement(o.id, this.actionReason);
  }

  completeJob() {
    const o = this.selectedActionOrder();
    if (!o || !this.mockSignature) return alert('Bắt buộc khách hàng phải ký xác nhận (Mock)!');
    const loc: LocationData = { lat: 10.762622, lng: 106.660172, address: 'Current Location' };
    const imgs = ['image1.jpg', 'image2.pdf'];
    this.closeAction();
    this.dataService.shipperComplete(o.id, imgs, loc, this.mockSignature, this.actionNote || 'Đã xong');
  }

  onDrop(event: CdkDragDrop<Order[]>) {
    const list = this.filteredOrders();
    const newItems = [...list];
    moveItemInArray(newItems, event.previousIndex, event.currentIndex);
    const orderIds = newItems.map((o) => o.id);
    this.dataService.updateOrderSort(this.authService.currentUser()?.email || 'unknown', orderIds);
  }

  // 1. Scope Data by Role first
  rawScopedOrders = computed(() => {
    const all = this.dataService.orders();
    const role = this.authService.userRole();
    const userEmail = this.authService.currentUser()?.email;

    if (role === 'QL' || role === 'IT') return all;
    if (role === 'NVADMIN') return all.filter((o) => o.creator === userEmail || o.status === 'Xử lý Xong');
    if (role === 'NVGN') {
      return all.filter((o) => o.receiver === userEmail && o.status !== 'Bổ sung');
    }
    return [];
  });

  // 2. Apply Filters & Sorting
  filteredOrders = computed(() => {
    const orders = this.rawScopedOrders();
    const filter = this.currentFilter();
    const search = this.searchTerm().toLowerCase();
    const dept = this.filterDept();
    const prov = this.filterProvince();
    const dist = this.filterDistrict();

    let result = [...orders];

    if (search) {
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(search) ||
          (o.orderId && o.orderId.toLowerCase().includes(search)) ||
          (o.company || '').toLowerCase().includes(search) ||
          o.address.toLowerCase().includes(search) ||
          o.senderName.toLowerCase().includes(search)
      );
    }

    if (dept) result = result.filter((o) => o.department === dept);
    if (prov) result = result.filter((o) => o.province === prov);
    if (dist) result = result.filter((o) => o.district === dist);

    if (filter === 'PENDING_GROUP') {
      result = result.filter((o) => ['Chờ tiếp nhận', 'Đã điều phối', 'Đang xử lý', 'Bổ sung'].includes(o.status));
    } else if (filter === 'DONE_GROUP') {
      result = result.filter((o) => ['Xử lý Xong', 'Hoàn tất'].includes(o.status));
    }

    if (this.authService.userRole() === 'NVGN') {
      return result.sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0));
    }

    const todayStr = new Date().toISOString().split('T')[0];

    return result.sort((a, b) => {
      const isTodayA = a.date === todayStr;
      const isTodayB = b.date === todayStr;

      if (isTodayA && !isTodayB) return -1;
      if (!isTodayA && isTodayB) return 1;

      const timeA = new Date(`${a.date}T${a.time}`).getTime();
      const timeB = new Date(`${b.date}T${b.time}`).getTime();

      return timeA - timeB;
    });
  });

  // UI Helpers
  encodeAddress(addr: string): string {
    return encodeURIComponent(addr);
  }

  getStatusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      'Chờ tiếp nhận': 'Chờ tiếp nhận',
      'Đã điều phối': 'Đã điều phối',
      'Đang xử lý': 'Đang thực hiện',
      'Xử lý Xong': 'Đã xong',
      'Hoàn tất': 'Hoàn tất',
      'Từ chối nhận': 'Đã từ chối',
      'Bổ sung': 'Cần bổ sung',
      'Chưa hoàn thành': 'Không duyệt',
    };
    return map[status] || status;
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      'Chờ tiếp nhận': 'bg-red-100 text-red-800',
      'Đã điều phối': 'bg-blue-100 text-blue-800',
      'Đang xử lý': 'bg-yellow-100 text-yellow-800',
      'Xử lý Xong': 'bg-purple-100 text-purple-800',
      'Hoàn tất': 'bg-green-100 text-green-800',
      'Từ chối nhận': 'bg-gray-100 text-gray-800',
      'Bổ sung': 'bg-orange-100 text-orange-800',
      'Chưa hoàn thành': 'bg-red-50 text-red-600',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  }

  getDeptColorClass(dept: DepartmentType): string {
    switch (dept) {
      case 'Visa Việt Nam':
        return 'bg-blue-500';
      case 'Visa Nước Ngoài':
        return 'bg-purple-500';
      case 'Giấy Phép Lao Động':
        return 'bg-teal-500';
      default:
        return 'bg-gray-400';
    }
  }

  getDeptTextColorClass(dept: DepartmentType): string {
    switch (dept) {
      case 'Visa Việt Nam':
        return 'text-blue-600';
      case 'Visa Nước Ngoài':
        return 'text-purple-600';
      case 'Giấy Phép Lao Động':
        return 'text-teal-600';
      default:
        return 'text-gray-600';
    }
  }

  getShipperHighlightClass(color: string | undefined | null): string {
    if (!color) return '';
    switch (color) {
      case 'red': return 'bg-red-50 hover:bg-red-100';
      case 'blue': return 'bg-blue-50 hover:bg-blue-100';
      case 'yellow': return 'bg-yellow-50 hover:bg-yellow-100';
      default: return '';
    }
  }
}