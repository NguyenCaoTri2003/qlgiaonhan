import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { OrderService } from "../../services/order.service";
import { Router } from "@angular/router";
import { LoadingComponent } from "../../app/shared/loading/loading.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  template: `
    @if (loading()) {
      <app-loading />
    }
    <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-blue-700">NHỊ GIA</h1>
          <p class="text-gray-500 mt-2">Hệ thống quản lý giao nhận</p>
        </div>

        @if (errorMsg()) {
          <div
            class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span class="block sm:inline">{{ errorMsg() }}</span>
          </div>
        }

        <div class="space-y-4">
          <div>
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="email"
            >
              Email
            </label>
            <input
              [(ngModel)]="email"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              type="email"
              placeholder="email@nhigia.vn"
            />
          </div>
          <div>
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="password"
            >
              Mật khẩu
            </label>
            <input
              [(ngModel)]="password"
              (keyup.enter)="onLogin()"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              type="password"
              placeholder="***********"
            />
          </div>

          <button
            (click)="onLogin()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          >
            Đăng Nhập
          </button>

          <div class="mt-6">
            <p class="text-xs text-gray-500 mb-2 text-center">
              Đăng nhập nhanh
            </p>

            <div class="grid grid-cols-2 gap-2">
              <button
                (click)="fillAccount('admingpld@abc.com', '123456789')"
                class="text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded"
              >
                Admin GPLD
              </button>

              <button
                (click)="fillAccount('adminvisavn@abc.com', '123456789')"
                class="text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded"
              >
                Admin Visa VN
              </button>

              <button
                (click)="fillAccount('adminvisann@abc.com', '123456789')"
                class="text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded"
              >
                Admin Visa NN
              </button>

              <button
                (click)="fillAccount('tpgn@abc.com', '123456789')"
                class="text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded"
              >
                Trưởng phòng
              </button>

              <button
                (click)="fillAccount('giaonhan1@abc.com', '123456789')"
                class="text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded col-span-2"
              >
                Nhân viên giao nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = "";
  password = "";
  errorMsg = signal("");

  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  loading = signal(false);

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMsg.set("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    this.loading.set(true);

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.authService.setUser(res.user, res.token);

        // load order trước khi vào dashboard
        this.orderService.loadOrders();

        setTimeout(() => {
          this.loading.set(false);
          this.errorMsg.set("");
          this.router.navigate(["/dashboard"]);
        }, 500); // cho loading hiện 1 chút cho mượt
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set("Sai thông tin đăng nhập");
      },
    });
  }

  fillAccount(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
