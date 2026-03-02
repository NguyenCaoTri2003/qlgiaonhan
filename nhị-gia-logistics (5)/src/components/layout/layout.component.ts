import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen flex flex-col bg-gray-100">
      
      <!-- Top Header (Fixed Height) -->
      <header class="bg-blue-700 text-white shadow-md z-30 flex-shrink-0 h-16">
        <div class="w-full h-full px-4 flex items-center justify-between">
          
          <!-- Logo & Sidebar Toggle -->
          <div class="flex items-center">
             <button (click)="toggleSidebar()" class="mr-4 p-1 rounded hover:bg-blue-600 focus:outline-none transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
             </button>
             <div class="font-bold text-xl tracking-tight cursor-pointer select-none" (click)="navigate.emit('DASHBOARD')">NHỊ GIA</div>
             <span class="ml-2 text-xs bg-blue-800 px-2 py-1 rounded text-blue-200 hidden sm:inline-block select-none">Logistics</span>
          </div>

          <!-- User & Notifications -->
          <div class="flex items-center space-x-4">
             <!-- Notification Bell -->
             <div class="relative">
                <button (click)="toggleNotif()" class="p-1 rounded-full text-blue-200 hover:text-white focus:outline-none relative transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  @if (unreadCount() > 0) {
                    <span class="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-blue-700 bg-red-500 animate-pulse"></span>
                  }
                </button>

                <!-- Dropdown -->
                @if (showNotif()) {
                  <div class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div class="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 class="text-sm font-medium text-gray-900">Thông báo</h3>
                      <button (click)="markRead()" class="text-xs text-blue-600 hover:text-blue-500">Đọc tất cả</button>
                    </div>
                    <div class="max-h-60 overflow-y-auto">
                      @for (notif of notifications(); track notif.id) {
                        <div class="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0" [class.bg-blue-50]="!notif.read">
                          <p class="text-sm text-gray-800">{{ notif.message }}</p>
                          <p class="text-xs text-gray-400 mt-1">{{ notif.timestamp | date:'HH:mm dd/MM' }}</p>
                        </div>
                      }
                      @if (notifications().length === 0) {
                        <div class="px-4 py-4 text-center text-sm text-gray-500">Không có thông báo mới</div>
                      }
                    </div>
                  </div>
                }
             </div>

             <div class="text-right hidden sm:block">
               <div class="text-sm font-medium">{{ user()?.name }}</div>
               <div class="text-xs text-blue-300">{{ getRoleName(user()?.role) }}</div>
             </div>
             <img [src]="user()?.avatar" class="h-8 w-8 rounded-full border-2 border-white">
          </div>
        </div>
      </header>

      <!-- Main Layout: Sidebar + Content -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- Sidebar -->
        <aside 
          class="bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out absolute z-20 h-full sm:relative"
          [class.w-0]="!isSidebarOpen()" 
          [class.w-64]="isSidebarOpen()"
          [class.sm:w-16]="!isSidebarOpen()"
          [class.sm:w-64]="isSidebarOpen()"
          [class.overflow-hidden]="true">
          
          <nav class="flex-1 py-4 space-y-1 min-w-[16rem] overflow-hidden">
             <!-- Dashboard -->
             <a (click)="onNavigate('DASHBOARD')" 
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
                [class.bg-blue-50]="activeView() === 'DASHBOARD'">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
               </svg>
               <span class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                  [class.opacity-100]="isSidebarOpen()"
                  [class.w-auto]="isSidebarOpen()"
                  [class.opacity-0]="!isSidebarOpen()"
                  [class.w-0]="!isSidebarOpen() && !isMobile()" 
                  [class.overflow-hidden]="true"
                  >Dashboard</span>
             </a>

             <!-- Job List -->
             <a (click)="onNavigate('ORDERS')" 
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
                [class.bg-blue-50]="activeView() === 'ORDERS'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
               <span class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                  [class.opacity-100]="isSidebarOpen()"
                  [class.w-auto]="isSidebarOpen()"
                  [class.opacity-0]="!isSidebarOpen()"
                  [class.w-0]="!isSidebarOpen() && !isMobile()" 
                  [class.overflow-hidden]="true"
                  >DANH SÁCH CÔNG VIỆC</span>
             </a>

             <!-- User Management (IT Only) -->
             @if (user()?.role === 'IT') {
               <a (click)="onNavigate('USER_MANAGEMENT')" 
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
                  [class.bg-blue-50]="activeView() === 'USER_MANAGEMENT'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                 <span class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                    [class.opacity-100]="isSidebarOpen()"
                    [class.w-auto]="isSidebarOpen()"
                    [class.opacity-0]="!isSidebarOpen()"
                    [class.w-0]="!isSidebarOpen() && !isMobile()" 
                    [class.overflow-hidden]="true"
                    >Quản Trị Hệ Thống</span>
               </a>
             }

             <!-- Activity Logs (Manager OR IT) -->
             @if (user()?.role === 'QL' || user()?.role === 'IT') {
               <a (click)="onNavigate('LOGS')" 
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
                  [class.bg-blue-50]="activeView() === 'LOGS'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                 <span class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                    [class.opacity-100]="isSidebarOpen()"
                    [class.w-auto]="isSidebarOpen()"
                    [class.opacity-0]="!isSidebarOpen()"
                    [class.w-0]="!isSidebarOpen() && !isMobile()" 
                    [class.overflow-hidden]="true"
                    >Lịch Sử Hoạt Động</span>
               </a>
             }

             <!-- Help/Guide -->
             <a (click)="onNavigate('GUIDE')" 
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
                [class.bg-blue-50]="activeView() === 'GUIDE'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
               <span class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                  [class.opacity-100]="isSidebarOpen()"
                  [class.w-auto]="isSidebarOpen()"
                  [class.opacity-0]="!isSidebarOpen()"
                  [class.w-0]="!isSidebarOpen() && !isMobile()" 
                  [class.overflow-hidden]="true"
                  >Hướng dẫn sử dụng</span>
             </a>
          </nav>

          <div class="p-4 border-t border-gray-200 min-w-[16rem] overflow-hidden">
             <button (click)="logout.emit()" class="flex items-center w-full text-gray-600 hover:text-red-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                    [class.opacity-100]="isSidebarOpen()"
                    [class.w-auto]="isSidebarOpen()"
                    [class.opacity-0]="!isSidebarOpen()"
                    [class.w-0]="!isSidebarOpen() && !isMobile()" 
                    [class.overflow-hidden]="true"
                    >Đăng xuất</span>
             </button>
          </div>
        </aside>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto p-4 sm:p-6 bg-gray-100 relative w-full h-full">
           <!-- Overlay on Mobile when Sidebar is open -->
           @if (isSidebarOpen()) {
             <div class="absolute inset-0 bg-black bg-opacity-25 z-10 sm:hidden" (click)="toggleSidebar()"></div>
           }
           <ng-content></ng-content>
        </main>

      </div>
    </div>
  `
})
export class LayoutComponent {
  logout = output<void>();
  navigate = output<string>();

  authService = inject(AuthService);
  dataService = inject(DataService);

  user = this.authService.currentUser;
  notifications = this.dataService.myNotifications;
  unreadCount = this.dataService.unreadCount;

  showNotif = signal(false);
  isSidebarOpen = signal(false); // Default hidden/collapsed

  // Use shared state from DataService
  activeView = this.dataService.activeView;

  toggleNotif() {
    this.showNotif.update(v => !v);
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  onNavigate(view: string) {
    this.navigate.emit(view);
    // On mobile, close sidebar after nav
    if (window.innerWidth < 640) {
      this.isSidebarOpen.set(false);
    }
  }

  markRead() {
    this.dataService.markAllAsRead();
  }

  getRoleName(role: string | undefined): string {
    switch (role) {
      case 'QL': return 'Quản Lý Điều Phối';
      case 'NVADMIN': return 'Admin';
      case 'NVGN': return 'Nhân Viên Giao Nhận';
      case 'IT': return 'IT Quản Trị';
      default: return '';
    }
  }

  isMobile() {
    return typeof window !== 'undefined' && window.innerWidth < 640;
  }
}