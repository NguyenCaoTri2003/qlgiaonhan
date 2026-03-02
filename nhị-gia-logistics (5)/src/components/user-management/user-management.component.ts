import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User, UserRole } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col space-y-4">
      <!-- Header -->
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Quản Trị Tài Khoản</h2>
          <p class="text-sm text-gray-500">Quản lý danh sách người dùng và phân quyền hệ thống</p>
        </div>
        <button (click)="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Thêm Tài Khoản
        </button>
      </div>

      <!-- User List -->
      <div class="bg-white rounded-lg shadow overflow-hidden flex-1">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email (Đăng nhập)</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai Trò</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (u of users(); track u.email) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full" [src]="u.avatar" alt="">
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ u.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ u.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' + getRoleBadgeClass(u.role)">
                      {{ getRoleLabel(u.role) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    @if (u.email !== currentUser()?.email) {
                      <button (click)="deleteUser(u)" class="text-red-600 hover:text-red-900 ml-4">Xóa</button>
                    } @else {
                      <span class="text-gray-400 italic">Đang sử dụng</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeModal()"></div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">Tạo Tài Khoản Mới</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tên hiển thị</label>
                  <input type="text" [(ngModel)]="newUser.name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email (Đăng nhập)</label>
                  <input type="email" [(ngModel)]="newUser.email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Vai trò</label>
                  <select [(ngModel)]="newUser.role" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="QL">Quản Lý Điều Phối</option>
                    <option value="NVADMIN">Nhân Viên Admin</option>
                    <option value="NVGN">Nhân Viên Giao Nhận (Shipper)</option>
                    <option value="IT">IT Quản Trị</option>
                  </select>
                </div>
                <div class="bg-yellow-50 p-2 rounded text-xs text-yellow-800">
                  * Mật khẩu mặc định sẽ là: <strong>123456</strong>
                </div>
                
                @if (errorMsg()) {
                  <p class="text-red-500 text-sm">{{ errorMsg() }}</p>
                }
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button (click)="submitUser()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Tạo
              </button>
              <button (click)="closeModal()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class UserManagementComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  
  users = this.authService.users;
  currentUser = this.authService.currentUser;
  
  showModal = signal(false);
  errorMsg = signal('');
  
  newUser: Partial<User> = {
    name: '',
    email: '',
    role: 'NVGN'
  };

  openModal() {
    this.newUser = { name: '', email: '', role: 'NVGN' };
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  submitUser() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.role) {
      this.errorMsg.set('Vui lòng nhập đủ thông tin');
      return;
    }
    
    if (this.authService.userExists(this.newUser.email)) {
      this.errorMsg.set('Email này đã tồn tại');
      return;
    }
    
    this.authService.addUser(this.newUser as User);
    this.dataService.logActivity('Tạo User', 'SYSTEM', `Đã tạo tài khoản ${this.newUser.email} (${this.newUser.role})`);
    this.closeModal();
  }

  deleteUser(user: User) {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.name}?`)) {
      this.authService.deleteUser(user.email);
      this.dataService.logActivity('Xóa User', 'SYSTEM', `Đã xóa tài khoản ${user.email}`);
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'QL': return 'Quản Lý';
      case 'NVADMIN': return 'Admin';
      case 'NVGN': return 'Shipper';
      case 'IT': return 'IT Admin';
      default: return role;
    }
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'QL': return 'bg-blue-100 text-blue-800';
      case 'NVADMIN': return 'bg-red-100 text-red-800';
      case 'NVGN': return 'bg-green-100 text-green-800';
      case 'IT': return 'bg-gray-800 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}