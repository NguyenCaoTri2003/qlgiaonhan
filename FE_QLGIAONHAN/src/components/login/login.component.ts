import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
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
        </div>

        <div class="mt-6 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p><strong>Demo Accounts (Pass: Nhigia&#64;2016):</strong></p>
          <p
            class="cursor-pointer hover:text-blue-600"
            (click)="fill('Qlgiaonhan@nhigia.vn')"
          >
            QL: Qlgiaonhan&#64;nhigia.vn
          </p>
          <p
            class="cursor-pointer hover:text-blue-600"
            (click)="fill('nvadmin@nhigia.vn')"
          >
            Admin: nvadmin&#64;nhigia.vn
          </p>
          <p
            class="cursor-pointer hover:text-blue-600"
            (click)="fill('nvgiaonhan1@nhigia.vn')"
          >
            Shipper: nvgiaonhan1&#64;nhigia.vn
          </p>
          <p
            class="cursor-pointer hover:text-blue-600 font-bold"
            (click)="fill('it@nhigia.vn')"
          >
            IT Admin: it&#64;nhigia.vn
          </p>
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

  // onLogin() {
  //   if (!this.email || !this.password) {
  //     this.errorMsg.set('Vui lòng nhập đầy đủ thông tin');
  //     return;
  //   }

  //   const success = this.authService.login(this.email, this.password);
  //   if (!success) {
  //     this.errorMsg.set('Sai thông tin đăng nhập');
  //   } else {
  //     this.errorMsg.set('');
  //   }
  // }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMsg.set("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.authService.setUser(res.user, res.token);
        this.errorMsg.set("");
      },
      error: () => {
        this.errorMsg.set("Sai thông tin đăng nhập");
      },
    });
  }

  fill(email: string) {
    this.email = email;
    this.password = "Nhigia@2016";
  }
}
