import { Component, inject, computed, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ViewStateService } from '../../services/view-state.service';
import { DepartmentType } from '../../type/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border-l-8 border-blue-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">
            Chào buổi chiều, {{ user()?.name }}!
          </h1>
          <p class="text-gray-500 font-medium">Hệ thống Nhị Gia Logistics đang hoạt động ổn định.</p>
        </div>
        <div class="flex gap-2">
           <button *ngIf="user()?.role === 'NVADMIN'" (click)="create.emit()" 
             class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center shadow transition transition-all hover:scale-105 active:scale-95">
             <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
             <span>Tạo Yêu Cầu Mới</span>
           </button>
        </div>
      </div>

      <!-- Statistics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        <!-- Total Jobs Card -->
        <div (click)="goToOrders('ALL')" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-blue-200 transition-all cursor-pointer hover:shadow-md">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
          </div>
          <span class="text-3xl font-black text-gray-900">{{ stats().total }}</span>
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Tổng cộng</span>
        </div>

        <!-- Pending Jobs Card -->
        <div (click)="goToOrders('PENDING_GROUP')" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-orange-200 transition-all cursor-pointer hover:shadow-md">
          <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <span class="text-3xl font-black text-gray-900">{{ stats().pending }}</span>
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Đang thực hiện</span>
        </div>

        <!-- Needs Supplement Card -->
        <div (click)="goToOrders('SUPPLEMENT')" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-red-200 transition-all cursor-pointer hover:shadow-md">
          <div class="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <span class="text-3xl font-black text-gray-900">{{ stats().supplement }}</span>
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Cần bổ sung</span>
        </div>

        <!-- Completed Card -->
        <div (click)="goToOrders('DONE_GROUP')" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-green-200 transition-all cursor-pointer hover:shadow-md">
          <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <span class="text-3xl font-black text-gray-900">{{ stats().completed }}</span>
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Hoàn tất</span>
        </div>

      </div>

      <!-- Detailed Breakdown Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Jobs by Department -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center border-b pb-2">
            <span class="mr-2">📊</span> Thống kê theo bộ phận
          </h2>
          <div class="space-y-4">
             <div *ngFor="let dept of deptStats()" class="group">
                <div class="flex justify-between items-end mb-1">
                   <span class="text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">{{ dept.name }}</span>
                   <span class="text-xs font-black text-gray-400">{{ dept.count }} đơn</span>
                </div>
                <!-- Progress Bar -->
                <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                   <div [class]="dept.color" [style.width.%]="(dept.count / (stats().total || 1)) * 100" class="h-full rounded-full transition-all duration-1000"></div>
                </div>
             </div>
          </div>
        </div>

        <!-- Recent Status Info -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center border-b pb-2">
            <span class="mr-2">💡</span> Thông tin hữu ích
          </h2>
          <div class="space-y-3">
             <div class="flex items-start bg-blue-50 p-3 rounded-xl border border-blue-100">
                <div class="text-blue-600 mr-3 mt-0.5">ℹ️</div>
                <div class="text-xs text-blue-800 leading-relaxed font-medium">
                  <strong>Thông báo:</strong> Hiện tại công việc trong tab <strong>'Cần Xử Lý'</strong> tại Danh sách Đơn hàng là các đơn quan trọng nhất.
                </div>
             </div>
             <div class="flex items-start bg-orange-50 p-3 rounded-xl border border-orange-100">
                <div class="text-orange-600 mr-3 mt-0.5">🔔</div>
                <div class="text-xs text-orange-800 leading-relaxed font-medium">
                  Bạn có <strong>{{ stats().waiting }}</strong> đơn hàng chưa được điều phối. Hãy nhắc QL kiểm tra.
                </div>
             </div>
             <div class="flex items-start bg-purple-50 p-3 rounded-xl border border-purple-100">
                <div class="text-purple-600 mr-3 mt-0.5">✈️</div>
                <div class="text-xs text-purple-800 leading-relaxed font-medium">
                   Bộ phận <strong>Visa Việt Nam</strong> đang chiếm tỉ lệ cao nhất ({{ getDeptPercentage('Visa Việt Nam') }}%).
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent {
  create = output<void>();
  orderService = inject(OrderService);
  viewState = inject(ViewStateService);
  authService = inject(AuthService);
  user = this.authService.currentUser;

  // Compute overall stats
  stats = computed(() => {
    const orders = this.orderService.orders();
    return {
      total: orders.length,
      pending: orders.filter(o => ['Đang xử lý', 'Đã điều phối'].includes(o.status)).length,
      supplement: orders.filter(o => o.status === 'Bổ sung').length,
      completed: orders.filter(o => o.status === 'Hoàn tất' || o.status === 'Xử lý Xong').length,
      waiting: orders.filter(o => o.status === 'Chờ tiếp nhận').length
    };
  });

  // Breakdown by Dept
  deptStats = computed(() => {
    const orders = this.orderService.orders();
    const depts = ['Visa Việt Nam', 'Visa Nước Ngoài', 'Giấy Phép Lao Động'];
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500'];

    return depts.map((name, i) => ({
      name,
      count: orders.filter(o => o.department === name).length,
      color: colors[i]
    }));
  });

  getDeptPercentage(name: string): string {
    const total = this.stats().total || 1;
    const count = this.deptStats().find(d => d.name === name)?.count || 0;
    return ((count / total) * 100).toFixed(0);
  }

  goToOrders(filter: string) {
    this.orderService.orderListFilter.set(filter as any);
    this.viewState.activeView.set('ORDERS');
  }

  mockCreateOrder() {
    const r = Math.floor(Math.random() * 1000);
    const priorities: any[] = ['high', 'medium', 'normal', 'low'];
    const depts = ['Visa Việt Nam', 'Visa Nước Ngoài', 'Giấy Phép Lao Động'];
    const provs = ['TP.HCM', 'Long An', 'Hà Nội'];

    this.orderService.addOrder({
      company: `Khách hàng Gấp ${r}`,
      address: 'Phường Hiệp Bình Phước, Thủ Đức',
      purpose: 'Giao hồ sơ TEST',
      senderName: 'Admin System',
      department: depts[Math.floor(Math.random() * depts.length)] as DepartmentType,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      province: provs[Math.floor(Math.random() * provs.length)],
      district: 'Thủ Đức'
    });
  }
}