import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { DataService } from '../../services/data.service';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 class="text-lg font-bold text-gray-800">Lịch Sử Hoạt Động Hệ Thống</h2>
      </div>
      
      <div class="flex-1 overflow-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Đơn</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (log of logs(); track log.timestamp) {
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ log.userName }} <br>
                  <span class="text-xs text-gray-400 font-normal">{{ log.userEmail }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {{ log.action }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                  {{ log.orderId }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ log.details }}
                </td>
              </tr>
            }
            @if (logs().length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-10 text-center text-gray-500">Chưa có dữ liệu.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ActivityLogComponent {
  logService = inject(LogService);
  logs = this.logService.logs;
}