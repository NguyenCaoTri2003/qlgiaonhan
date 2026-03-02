import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Header -->
      <div class="bg-blue-600 p-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-white tracking-tight uppercase">Hướng Dẫn Sử Dụng</h1>
          <p class="text-blue-100 font-medium">Trung tâm hỗ trợ vận hành Nhị Gia Logistics</p>
        </div>
        <div class="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar Navigation -->
        <div class="w-64 bg-gray-50 border-r border-gray-100 overflow-y-auto p-4 space-y-2">
          <button (click)="activeSection.set('overview')"
            [class]="activeSection() === 'overview' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600 hover:bg-gray-100 border-transparent'"
            class="w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm border flex items-center">
            <span class="mr-3 text-lg">🏠</span> Tổng Quan
          </button>
          
          <div class="pt-4 pb-2 px-4">
             <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quy trình theo vai trò</span>
          </div>

          <button (click)="activeSection.set('role-admin')"
            [class]="activeSection() === 'role-admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600 hover:bg-gray-100 border-transparent'"
            class="w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm border flex items-center">
            <span class="mr-3 text-lg">👩‍💼</span> Nhân Viên Admin
          </button>

          <button (click)="activeSection.set('role-ql')"
            [class]="activeSection() === 'role-ql' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600 hover:bg-gray-100 border-transparent'"
            class="w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm border flex items-center">
            <span class="mr-3 text-lg">👔</span> Quản Lý Điều Phối
          </button>

          <button (click)="activeSection.set('role-shipper')"
            [class]="activeSection() === 'role-shipper' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600 hover:bg-gray-100 border-transparent'"
            class="w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm border flex items-center">
            <span class="mr-3 text-lg">🚚</span> Nhân Viên Giao Nhận
          </button>

          <div class="pt-4 pb-2 px-4">
             <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Từ điển dữ liệu</span>
          </div>

          <button (click)="activeSection.set('fields')"
            [class]="activeSection() === 'fields' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600 hover:bg-gray-100 border-transparent'"
            class="w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm border flex items-center">
            <span class="mr-3 text-lg">📋</span> Trường Thông Tin
          </button>

          <button (click)="activeSection.set('ui')"
            [class]="activeSection() === 'ui' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600 hover:bg-gray-100 border-transparent'"
            class="w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm border flex items-center">
            <span class="mr-3 text-lg">🎨</span> Giao Diện & Trạng Thái
          </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-8 prose prose-blue max-w-none">
          
          <!-- Overview Section -->
          <div *ngIf="activeSection() === 'overview'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-3xl font-black text-gray-900 mb-6 border-b-4 border-blue-600 pb-2 inline-block">Chào mừng bạn đến với Hệ thống</h2>
            <p class="text-gray-600 text-lg leading-relaxed mb-6">
              Ứng dụng <strong>Nhị Gia Logistics</strong> được thiết kế để số hóa và tối ưu quy trình giao nhận hồ sơ giữa các bộ phận chuyên môn và đội ngũ giao nhận. Hệ thống đảm bảo tính minh bạch, tức thời và khả năng theo dõi lịch sử chặt chẽ.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 class="text-blue-800 font-bold mb-2 flex items-center text-lg">
                  <span class="mr-2">🚀</span> Nhanh chóng
                </h3>
                <p class="text-blue-700 text-sm">Khởi tạo và điều phối yêu cầu chỉ trong vài giây.</p>
              </div>
              <div class="bg-green-50 p-6 rounded-2xl border border-green-100">
                <h3 class="text-green-800 font-bold mb-2 flex items-center text-lg">
                  <span class="mr-2">🛡️</span> Chính xác
                </h3>
                <p class="text-green-700 text-sm">Checklist hồ sơ và chữ ký số xác thực tại chỗ.</p>
              </div>
            </div>
          </div>

          <!-- NVADMIN Section -->
          <div *ngIf="activeSection() === 'role-admin'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-3xl font-black text-gray-900 mb-6 border-b-4 border-blue-600 pb-2 inline-block">Nhân Viên Admin (Chuyên môn)</h2>
            
            <div class="space-y-8">
              <section>
                <h3 class="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-black">1</div>
                  Tạo yêu cầu mới
                </h3>
                <p class="text-gray-600 mb-4">Sử dụng nút <strong>"Tạo Yêu Cầu Mới"</strong> trên Dashboard hoặc Danh sách công dịch.</p>
                <ul class="list-disc pl-6 text-gray-600 space-y-2">
                  <li><strong>Thông tin bắt buộc:</strong> Khách hàng, Địa chỉ chi tiết, Mục đích công việc.</li>
                  <li><strong>Hồ sơ đính kèm:</strong> Chọn các loại hồ sơ cần Shipper nhận hoặc giao. Bạn có thể thêm hồ sơ tùy chỉnh bằng nút <strong>"+"</strong>.</li>
                  <li><strong>Mức độ ưu tiên:</strong> Xác định độ khẩn cấp (Hỏa tốc, Gấp, v.v.).</li>
                </ul>
              </section>

              <section>
                <h3 class="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-black">2</div>
                  Theo dõi và Duyệt kết quả
                </h3>
                <ul class="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Khi Shipper hoàn tất, trạng thái sẽ là <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Đã xong</span>.</li>
                  <li>Bạn cần vào chi tiết, kiểm tra Ảnh hiện trường và Chữ ký khách hàng.</li>
                  <li>Bấm <strong>"Chấp Nhận Duyệt"</strong> để kết thúc hoặc <strong>"Không duyệt"</strong> (kèm lý do) để yêu cầu Shipper xử lý lại.</li>
                </ul>
              </section>
            </div>
          </div>

          <!-- QL Section -->
          <div *ngIf="activeSection() === 'role-ql'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-3xl font-black text-gray-900 mb-6 border-b-4 border-blue-600 pb-2 inline-block">Quản Lý Điều Phối</h2>
            
            <div class="space-y-8">
              <section>
                <h3 class="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-black">1</div>
                  Điều phối nhân viên (Assign)
                </h3>
                <p class="text-gray-600 mb-4">Khi có yêu cầu mới trạng thái <span class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Chờ tiếp nhận</span>:</p>
                <ul class="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Nhấp vào đơn hàng -> Chọn <strong>"Điều phối nhân viên"</strong>.</li>
                  <li>Hệ thống sẽ gợi ý danh sách Shipper đang rảnh hoặc ở khu vực gần nhất.</li>
                </ul>
              </section>

              <section>
                <h3 class="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-black">2</div>
                  Yêu cầu bổ sung hồ sơ
                </h3>
                <p class="text-gray-600">Nếu thông tin đơn hàng thiếu sót, bạn có thể nhập ghi chú và bấm <strong>"Gửi yêu cầu bổ sung"</strong> để trả ngược lại cho Admin.</p>
              </section>
            </div>
          </div>

          <!-- Shipper Section -->
          <div *ngIf="activeSection() === 'role-shipper'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-3xl font-black text-gray-900 mb-6 border-b-4 border-blue-600 pb-2 inline-block">Nhân Viên Giao Nhận (Shipper)</h2>
            
            <div class="space-y-8">
              <section>
                <h3 class="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-black">1</div>
                  Sắp xếp lộ trình (Mobile)
                </h3>
                <p class="text-gray-600">Tại danh sách công việc, bạn có thể <strong>kéo và thả (Drag & Drop)</strong> các thẻ đơn hàng để sắp xếp thứ tự đi giao ưu tiên cho bản thân.</p>
              </section>

              <section>
                <h3 class="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-black">2</div>
                  Thao tác tại hiện trường
                </h3>
                <ul class="list-disc pl-6 text-gray-600 space-y-2">
                  <li><strong>Nhận đơn:</strong> Kiểm tra thực tế hồ sơ, tích chọn vào checklist trong app.</li>
                  <li><strong>Báo thiếu:</strong> Nếu hồ sơ khách đưa không đủ, dùng nút <strong>"Báo thiếu hồ sơ"</strong> để hệ thống ghi nhận.</li>
                  <li><strong>Hoàn tất:</strong> Chụp ảnh hiện trường (tối thiểu 1 ảnh), lấy chữ ký khách hàng trực tiếp trên màn hình, và xác nhận vị trí GPS.</li>
                </ul>
              </section>
            </div>
          </div>

          <!-- Fields Section -->
          <div *ngIf="activeSection() === 'fields'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-3xl font-black text-gray-900 mb-6 border-b-4 border-blue-600 pb-2 inline-block">Từ điển các trường thông tin</h2>
            
            <div class="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
               <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100">
                     <tr>
                        <th class="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Trường</th>
                        <th class="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Ý nghĩa</th>
                     </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                     <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">Mã yêu cầu</td>
                        <td class="px-6 py-4 text-sm text-gray-600">Mã định danh duy nhất (VD: #ORD-123).</td>
                     </tr>
                     <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">Bộ phận</td>
                        <td class="px-6 py-4 text-sm text-gray-600">Bộ phận chuyên môn yêu cầu (Visa Việt Nam, Visa Nước Ngoài, GPLĐ).</td>
                     </tr>
                     <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">Người Giao</td>
                        <td class="px-6 py-4 text-sm text-gray-600">Nhân viên Admin tạo yêu cầu và phụ trách kiểm tra hồ sơ.</td>
                     </tr>
                     <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">Địa chỉ</td>
                        <td class="px-6 py-4 text-sm text-gray-600">Gồm Số nhà/Tên đường, Phường, Quận, Tỉnh thành. Có link bản đồ tự động.</td>
                     </tr>
                  </tbody>
               </table>
            </div>
          </div>

          <!-- UI Section -->
          <div *ngIf="activeSection() === 'ui'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-3xl font-black text-gray-900 mb-6 border-b-4 border-blue-600 pb-2 inline-block">Giao diện & Trạng thái</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div class="flex items-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <span class="w-3 h-3 rounded-full bg-red-500 mr-3"></span>
                  <div>
                    <div class="text-xs font-black text-red-800 uppercase">Chờ tiếp nhận</div>
                    <div class="text-[10px] text-red-600">Mới tạo, chưa có Shipper.</div>
                  </div>
               </div>
               <div class="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span class="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                  <div>
                    <div class="text-xs font-black text-blue-800 uppercase">Đã điều phối</div>
                    <div class="text-[10px] text-blue-600">Đã giao cho Shipper, đang chờ Shipper nhận.</div>
                  </div>
               </div>
               <div class="flex items-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <span class="w-3 h-3 rounded-full bg-yellow-500 mr-3"></span>
                  <div>
                    <div class="text-xs font-black text-yellow-800 uppercase">Đang thực hiện</div>
                    <div class="text-[10px] text-yellow-600">Shipper đã nhận và đang di chuyển xử lý.</div>
                  </div>
               </div>
               <div class="flex items-center p-4 bg-green-50 rounded-xl border border-green-100">
                  <span class="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
                  <div>
                    <div class="text-xs font-black text-green-800 uppercase">Hoàn tất</div>
                    <div class="text-[10px] text-green-600">Admin đã duyệt kết quả cuối cùng.</div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .animate-in { animation: animate-in 0.5s ease-out; }
    @keyframes animate-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class GuideComponent {
  authService = inject(AuthService);
  activeSection = signal('overview');
}
