import {
  Component,
  inject,
  output,
  signal,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { NotificationService } from "../../services/notification.service";
import { ViewStateService } from "../../services/view-state.service";
import { RouterOutlet } from "@angular/router";
import { Router } from "@angular/router";
import { SocketService } from "../../services/socket.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="h-screen flex flex-col bg-gray-100">
      <!-- Top Header (Fixed Height) -->
      <header class="bg-blue-700 text-white shadow-md z-30 flex-shrink-0 h-16">
        <div class="w-full h-full px-4 flex items-center justify-between">
          <!-- Logo & Sidebar Toggle -->
          <div class="flex items-center">
            <button
              (click)="toggleSidebar()"
              class="mr-4 p-1 rounded hover:bg-blue-600 focus:outline-none transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div
              class="font-bold text-xl tracking-tight cursor-pointer select-none"
              (click)="navigate.emit('DASHBOARD')"
            >
              NHỊ GIA
            </div>
            <span
              class="ml-2 text-xs bg-blue-800 px-2 py-1 rounded text-blue-200 hidden sm:inline-block select-none"
              >Logistics</span
            >
          </div>

          <!-- User & Notifications -->
          <div class="flex items-center space-x-4">
            <!-- Notification Bell -->
            <div class="relative" #notifContainer>
              <button
                (click)="toggleNotif(); $event.stopPropagation()"
                class="p-1 rounded-full text-blue-200 hover:text-white focus:outline-none relative transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                @if (unreadCount() > 0) {
                  <span
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full"
                  >
                    {{ unreadCount() }}
                  </span>
                }
              </button>

              <!-- Dropdown -->
              @if (showNotif()) {
                <div
                  class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                >
                  <div
                    class="px-4 py-2 border-b border-gray-100 flex justify-between items-center"
                  >
                    <h3 class="text-sm font-medium text-gray-900">Thông báo</h3>
                    <button
                      (click)="markRead()"
                      class="text-xs text-blue-600 hover:text-blue-500"
                    >
                      Đọc tất cả
                    </button>
                  </div>
                  <div
                    class="max-h-72 overflow-y-auto"
                    (scroll)="loadMoreNotifications($event)"
                  >
                    @for (notif of notifications(); track notif.id) {
                      <div
                        (click)="openNotification(notif)"
                        class="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                        [class.bg-blue-50]="notif.read_status === 0"
                      >
                        <p class="text-sm text-gray-800">{{ notif.message }}</p>

                        <p class="text-xs text-gray-400 mt-1">
                          {{ notif.timestamp | date: "HH:mm dd/MM" }}
                        </p>
                      </div>
                    }
                    @if (notificationService.loading()) {
                      <div class="py-3 text-center text-gray-400 text-xs">
                        Đang tải thêm...
                      </div>
                    }
                    @if (notifications().length === 0) {
                      <div class="px-4 py-4 text-center text-sm text-gray-500">
                        Không có thông báo mới
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="text-right hidden sm:block">
              <div class="text-sm font-medium">{{ user()?.name }}</div>
              <div class="text-xs text-blue-300">
                {{ getRoleName(user()?.role) }}
              </div>
            </div>
            <div class="avatar-ring">
              @if (user()?.avatar) {
                <img [src]="user()?.avatar" class="avatar-img" />
              } @else {
                <div
                  class="avatar-fallback"
                  [ngClass]="getAvatarColor(user()?.name)"
                >
                  {{ getInitial(user()?.name) }}
                </div>
              }
            </div>
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
          [class.overflow-hidden]="true"
        >
          <nav class="flex-1 py-4 space-y-1 min-w-[16rem] overflow-hidden">
            <!-- Dashboard -->
            <a
              (click)="onNavigate('dashboard')"
              class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
              [class.bg-blue-100]="isActive('dashboard')"
              [class.text-blue-700]="isActive('dashboard')"
              [class.text-gray-700]="!isActive('dashboard')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span
                class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                [class.opacity-100]="isSidebarOpen()"
                [class.w-auto]="isSidebarOpen()"
                [class.opacity-0]="!isSidebarOpen()"
                [class.w-0]="!isSidebarOpen() && !isMobile()"
                [class.overflow-hidden]="true"
                >Dashboard</span
              >
            </a>

            <!-- Job List -->
            <button
              (click)="onNavigate('orders')"
              class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
              [class.bg-blue-100]="isActive('orders')"
              [class.text-blue-700]="isActive('orders')"
              [class.text-gray-700]="!isActive('orders')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span
                class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                [class.opacity-100]="isSidebarOpen()"
                [class.w-auto]="isSidebarOpen()"
                [class.opacity-0]="!isSidebarOpen()"
                [class.w-0]="!isSidebarOpen() && !isMobile()"
                [class.overflow-hidden]="true"
                >DANH SÁCH CÔNG VIỆC</span
              >
            </button>

            <!-- User Management (IT Only) -->
            @if (user()?.role === "IT") {
              <a
                (click)="onNavigate('users')"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
                [class.bg-blue-100]="isActive('users')"
                [class.text-blue-700]="isActive('users')"
                [class.text-gray-700]="!isActive('users')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span
                  class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                  [class.opacity-100]="isSidebarOpen()"
                  [class.w-auto]="isSidebarOpen()"
                  [class.opacity-0]="!isSidebarOpen()"
                  [class.w-0]="!isSidebarOpen() && !isMobile()"
                  [class.overflow-hidden]="true"
                  >Quản Trị Hệ Thống</span
                >
              </a>
            }

            <!-- Activity Logs (Manager OR IT) -->
            @if (user()?.role === "QL" || user()?.role === "IT") {
              <a
                (click)="onNavigate('logs')"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
                [class.bg-blue-100]="isActive('logs')"
                [class.text-blue-700]="isActive('logs')"
                [class.text-gray-700]="!isActive('logs')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                  [class.opacity-100]="isSidebarOpen()"
                  [class.w-auto]="isSidebarOpen()"
                  [class.opacity-0]="!isSidebarOpen()"
                  [class.w-0]="!isSidebarOpen() && !isMobile()"
                  [class.overflow-hidden]="true"
                  >Lịch Sử Hoạt Động</span
                >
              </a>
            }

            <!-- Help/Guide -->
            <a
              (click)="onNavigate('guide')"
              class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer group transition-colors"
              [class.bg-blue-100]="isActive('guide')"
              [class.text-blue-700]="isActive('guide')"
              [class.text-gray-700]="!isActive('guide')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                [class.opacity-100]="isSidebarOpen()"
                [class.w-auto]="isSidebarOpen()"
                [class.opacity-0]="!isSidebarOpen()"
                [class.w-0]="!isSidebarOpen() && !isMobile()"
                [class.overflow-hidden]="true"
                >Hướng dẫn sử dụng</span
              >
            </a>
          </nav>

          <div
            class="p-4 border-t border-gray-200 min-w-[16rem] overflow-hidden"
          >
            <button
              (click)="onLogout()"
              class="flex items-center w-full text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span
                class="ml-3 font-medium whitespace-nowrap transition-all duration-200"
                [class.opacity-100]="isSidebarOpen()"
                [class.w-auto]="isSidebarOpen()"
                [class.opacity-0]="!isSidebarOpen()"
                [class.w-0]="!isSidebarOpen() && !isMobile()"
                [class.overflow-hidden]="true"
                >Đăng xuất</span
              >
            </button>
          </div>
        </aside>

        <!-- Page Content -->
        <main
          class="flex-1 overflow-auto p-4 sm:p-6 bg-gray-100 relative w-full h-full"
        >
          <!-- Overlay on Mobile when Sidebar is open -->
          @if (isSidebarOpen()) {
            <div
              class="absolute inset-0 bg-black bg-opacity-25 z-10 sm:hidden"
              (click)="toggleSidebar()"
            ></div>
          }
          <router-outlet></router-outlet>
        </main>
      </div>

      <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        @for (toast of toastService.toasts(); track toast.id) {
          <div
            (click)="openToast(toast)"
            class="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-start gap-3 cursor-pointer hover:bg-blue-700 min-w-[300px]"
          >
            <span class="text-lg">🔔</span>

            <div class="flex-1 text-sm">
              {{ toast.message }}
            </div>

            <button
              (click)="$event.stopPropagation(); toastService.remove(toast.id)"
              class="text-white/80 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class LayoutComponent {
  @ViewChild("notifContainer") notifContainer!: ElementRef;
  logout = output<void>();
  navigate = output<string>();
  router = inject(Router);

  authService = inject(AuthService);
  viewStateService = inject(ViewStateService);
  notificationService = inject(NotificationService);

  user = this.authService.currentUser;
  notifications = this.notificationService.myNotifications;
  unreadCount = this.notificationService.unreadCount;

  showNotif = signal(false);
  isSidebarOpen = signal(false);

  socketService = inject(SocketService);
  toastService = inject(ToastService);

  elementRef = inject(ElementRef);

  @HostListener("document:click", ["$event"])
  onClickOutside(event: MouseEvent) {
    if (!this.showNotif()) return;

    const clickedInside = this.notifContainer?.nativeElement.contains(
      event.target,
    );

    if (!clickedInside) {
      this.showNotif.set(false);
    }
  }

  getInitial(name?: string): string {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase();
  }

  openToast(toast: any) {
    this.toastService.remove(toast.id);
    this.openNotification(toast);
  }

  socketEffect = effect(() => {
    const user = this.user();

    if (!user) return;

    this.socketService.join(user.id, user.role);

    this.socketService.onNotification((data) => {
      this.notificationService.loadNotifications(true);

      this.toastService.show(data);
    });
  });

  ngOnInit() {
    this.notificationService.loadNotifications(true);
  }

  loadMoreNotifications(event: any) {
    const el = event.target;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      this.notificationService.loadMore();
    }
  }

  openNotification(notif: any) {
    if (notif.read_status === 0) {
      this.notificationService.markAsRead(notif.id);
    }

    if (notif.orderId) {
      this.router.navigate(["/orders"], {
        queryParams: { orderId: notif.orderId },
      });
    }

    this.showNotif.set(false);
  }

  getAvatarColor(name?: string) {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
    ];

    if (!name) return colors[0];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  toggleNotif() {
    this.showNotif.update((v) => !v);
  }

  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  isActive(path: string): boolean {
    return this.router.url === "/" + path;
  }

  onNavigate(path: string) {
    this.router.navigate(["/" + path.toLowerCase()]);

    if (window.innerWidth < 640) {
      this.isSidebarOpen.set(false);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  markRead() {
    this.notificationService.markAllAsRead();
  }

  getRoleName(role: string | undefined): string {
    switch (role) {
      case "QL":
        return "Quản Lý Điều Phối";
      case "NVADMIN":
        return "Admin";
      case "NVGN":
        return "Nhân Viên Giao Nhận";
      case "IT":
        return "IT Quản Trị";
      default:
        return "";
    }
  }

  isMobile() {
    return typeof window !== "undefined" && window.innerWidth < 640;
  }
}
