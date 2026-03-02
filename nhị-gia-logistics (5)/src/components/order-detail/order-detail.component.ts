import { Component, inject, input, Output, EventEmitter, signal, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DataService, Order, OrderStatus, DepartmentType, Attachment } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="close.emit()"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          
          <!-- Header -->
          <div class="bg-blue-600 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h3 class="text-lg leading-6 font-medium text-white" id="modal-title">
              Chi tiết yêu cầu: {{ order().id }}
            </h3>
            <button (click)="close.emit()" class="text-white hover:text-blue-200 ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- PDF Export Action Bar -->
          <div class="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
             <button (click)="exportPdf()" class="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-bold hover:bg-gray-100 flex items-center shadow-sm">
                <span class="mr-1">🖨️</span> Xuất đơn (PDF)
             </button>
             
             @if (pdfUrl()) {
                <div class="flex items-center animate-pulse">
                   <a [href]="pdfUrl()" target="_blank" class="text-blue-600 font-bold text-sm hover:underline mr-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Tải PDF (Hết hạn sau 60s)
                   </a>
                   <button (click)="pdfUrl.set(null)" class="text-gray-400 hover:text-gray-600">✕</button>
                </div>
             }
          </div>

          <!-- Body -->
          <div #pdfContent class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[70vh] overflow-y-auto">
            
             <!-- Status Banner & Dept -->
             <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center space-x-2">
                   <span [class]="'px-3 py-1 rounded text-xs font-bold uppercase text-white ' + getDeptColorClass(order().department)">
                     {{ order().department }}
                   </span>
                   <span [class]="'px-3 py-1 rounded-full text-sm font-bold ' + getStatusClass(order().status)">
                    {{ getStatusLabel(order().status) }}
                   </span>

                   <!-- Shipper Color Pickers -->
                   @if (isShipper()) {
                      <div class="flex items-center space-x-3 ml-4 bg-gray-100 p-2 rounded-full border shadow-inner">
                         <button (click)="setHighlight('red')" 
                           [class.ring-2]="order().shipperHighlightColor === 'red'" 
                           class="w-6 h-6 rounded-full bg-red-500 shadow hover:scale-110 transition ring-offset-2 ring-red-400"></button>
                         <button (click)="setHighlight('blue')" 
                           [class.ring-2]="order().shipperHighlightColor === 'blue'" 
                           class="w-6 h-6 rounded-full bg-blue-500 shadow hover:scale-110 transition ring-offset-2 ring-blue-400"></button>
                         <button (click)="setHighlight('yellow')" 
                           [class.ring-2]="order().shipperHighlightColor === 'yellow'" 
                           class="w-6 h-6 rounded-full bg-yellow-400 shadow hover:scale-110 transition ring-offset-2 ring-yellow-300"></button>
                         <button (click)="setHighlight(null)" class="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition">XÓA</button>
                      </div>
                   }
                </div>
             </div>

             <!-- Missing Docs Alert (Persistent View) -->
             @if (order().missingDocs) {
                <div class="mb-4 bg-red-50 border-l-4 border-red-500 p-3">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-red-700 font-bold">
                        Thiếu hồ sơ: {{ order().missingDocs }}
                      </p>
                    </div>
                  </div>
                </div>
             }
             
             <!-- Sender Info Block -->
             <div class="mb-4 bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center">
               <div>
                  <p class="text-xs text-gray-500 uppercase">Người Giao (Sender)</p>
                  <p class="font-bold text-gray-900">{{ order().senderName }}</p>
               </div>
               @if (order().senderPhone) {
                  <a [href]="'tel:' + order().senderPhone" class="flex items-center text-blue-600 font-bold hover:bg-blue-100 px-3 py-1 rounded border border-blue-200 transition">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                     </svg>
                     {{ order().senderPhone }}
                  </a>
               }
             </div>

             <!-- Rejection/Request Alert -->
             @if (order().status === 'Từ chối nhận') {
                <div class="mb-4 bg-red-50 p-3 rounded border border-red-200">
                  <p class="text-red-800 text-sm"><strong>Lý do từ chối:</strong> {{ order().rejectionReason }}</p>
                </div>
             }

             <!-- Request Note (Warning) -->
             @if (order().requestNote && order().status === 'Bổ sung') {
                <div class="mb-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p class="text-yellow-800 text-sm"><strong>Yêu cầu bổ sung:</strong> {{ order().requestNote }}</p>
                </div>
             }
             
             <!-- Admin Response (Success) -->
             @if (order().adminResponse) {
                <div class="mb-4 bg-green-50 p-3 rounded border border-green-200">
                  <p class="text-green-800 text-sm font-bold flex items-center">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                     </svg>
                     {{ order().adminResponse }}
                  </p>
                </div>
             }

             <!-- Main Info -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-500 uppercase">Khách Hàng / Công Ty</p>
                  <p class="font-bold text-gray-900 uppercase">{{ order().company }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 uppercase">SĐT Khách</p>
                  <a [href]="'tel:' + order().phone" class="font-medium text-blue-600 hover:underline flex items-center">
                    {{ order().phone }} <span class="ml-1 text-xs">📞</span>
                  </a>
                </div>
                <div class="sm:col-span-2 border-t pt-2">
                   <p class="text-xs text-gray-500 uppercase">Địa Chỉ Giao Nhận</p>
                    <div class="flex flex-col">
                      <span class="font-medium">{{ order().address }}</span>
                      @if (order().addressLine) {
                        <div class="text-[10px] text-gray-500 bg-gray-50 p-1.5 mt-1 rounded border border-gray-100 italic">
                           Thành phần: {{ order().addressLine }}{{ order().ward ? ', ' + order().ward : '' }}{{ order().district ? ', ' + order().district : '' }}{{ order().province ? ', ' + order().province : '' }}
                        </div>
                      }
                      <a [href]="'https://www.google.com/maps/search/?api=1&query=' + encodeAddress(order().address)" 
                         target="_blank" class="text-blue-600 hover:underline text-[10px] flex items-center mt-1 font-bold">
                         <span class="mr-1">📍</span> XEM TRÊN GOOGLE MAPS
                      </a>
                   </div>
                </div>
                <div class="border-t pt-2">
                  <p class="text-xs text-gray-500 uppercase">Người Liên Hệ</p>
                  <p class="font-medium">{{ order().contact }}</p>
                </div>
                <div class="border-t pt-2">
                  <p class="text-xs text-gray-500 uppercase">Ngày Giờ</p>
                  <p class="font-medium">{{ order().date | date:'dd/MM/yyyy' }} - {{ order().time }}</p>
                </div>
                <div class="border-t pt-2 sm:col-span-2">
                  <p class="text-xs text-gray-500 uppercase">Mục Đích</p>
                  <p class="font-medium text-blue-700">{{ order().purpose }}</p>
                </div>
              </div>
             
             <!-- Money -->
             <div class="bg-gray-50 p-3 rounded mb-4 flex justify-between">
                <div>
                   <p class="text-xs text-gray-500">Tiền VNĐ</p>
                   <p class="font-bold text-lg">{{ order().amountVND | number }} ₫</p>
                </div>
                <div class="text-right">
                   <p class="text-xs text-gray-500">Tiền USD</p>
                   <p class="font-bold text-lg">{{ order().amountUSD | number }} $</p>
                </div>
             </div>
             
             <!-- Checklist Attachments -->
             <div class="mb-4 border rounded-lg overflow-hidden">
               <div class="bg-gray-100 px-3 py-2 border-b flex justify-between items-center">
                 <h4 class="text-sm font-bold text-gray-700 uppercase">Checklist Hồ Sơ</h4>
                 @if (isChecklistActive()) {
                   <button (click)="checkAll()" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 font-medium">
                     Đã nhận đủ
                   </button>
                 }
               </div>
               <div class="divide-y divide-gray-200">
                 @for (att of localAttachments(); track att.name; let i = $index) {
                   <div class="flex items-center p-3 hover:bg-gray-50 transition-colors" [class.bg-green-50]="att.checked">
                     <div class="flex-shrink-0 mr-3">
                        <input type="checkbox" 
                          [checked]="att.checked" 
                          [disabled]="!isChecklistActive()"
                          (change)="toggleItem(i)"
                          class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50">
                     </div>
                     <div class="flex-1 min-w-0">
                       <p class="text-sm font-medium text-gray-900 truncate">
                         {{ att.name }}
                       </p>
                     </div>
                     <div class="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white">
                       x{{ att.qty }}
                     </div>
                   </div>
                 }
                 @if (localAttachments().length === 0) {
                   <div class="p-4 text-center text-gray-500 text-sm italic">Không có hồ sơ đính kèm</div>
                 }
               </div>
             </div>

             <!-- Notes -->
             @if (order().notes) {
               <div class="mb-4">
                 <p class="text-xs text-gray-500 uppercase">Ghi chú thêm</p>
                 <p class="text-sm bg-gray-50 p-2 rounded">{{ order().notes }}</p>
               </div>
             }

             <!-- Completion Info (Read Only) -->
             @if (order().status === 'Xử lý Xong' || order().status === 'Hoàn tất') {
                <div class="border-t pt-4 mt-4 bg-green-50 p-4 rounded-lg">
                  <h4 class="font-bold text-green-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Thông tin hoàn tất
                  </h4>
                  
                  <!-- Images Grid -->
                  @if (order().completionImages?.length) {
                    <div class="grid grid-cols-3 gap-2 mb-3">
                      @for (img of order().completionImages; track $index) {
                         <img [src]="img" class="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-75" title="Click to view">
                      }
                    </div>
                  }

                   <!-- Signature View -->
                  @if (order().signature) {
                     <div class="mb-3">
                       <p class="text-xs text-gray-500">Chữ ký khách hàng:</p>
                       <img [src]="order().signature" class="h-20 bg-white border border-dashed border-gray-400 rounded">
                     </div>
                  }
                  
                  @if (order().deliveryLocation) {
                    <div class="text-xs text-gray-500 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Tọa độ: {{ order().deliveryLocation?.lat | number:'1.4-4' }}, {{ order().deliveryLocation?.lng | number:'1.4-4' }}
                    </div>
                  }

                  <p class="text-sm text-gray-800 italic">"{{ order().completionNote }}"</p>
                </div>
             }
             
            <!-- Uploaded Files Section -->
            @if (order().uploadedFiles && order().uploadedFiles!.length > 0) {
              <div class="mt-6 border-t pt-4">
                <h4 class="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Tài liệu đính kèm (File)</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (file of order().uploadedFiles; track $index) {
                    <div class="p-3 border rounded-lg bg-gray-50 flex items-center justify-between group hover:border-blue-300 transition-colors">
                      <div class="flex items-center gap-3 overflow-hidden">
                        <span class="text-xl">
                          {{ file.type.includes('image') ? '🖼️' : (file.type.includes('pdf') ? '📕' : '📄') }}
                        </span>
                        <div class="flex flex-col overflow-hidden">
                          <span class="text-xs font-bold truncate">{{ file.name }}</span>
                          <span class="text-[8px] text-gray-400 uppercase">{{ file.type.split('/')[1] || 'FILE' }}</span>
                        </div>
                      </div>
                      <a [href]="file.data" [download]="file.name" class="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Assignment Info -->
            @if (order().receiverName) {
                <div class="mt-4 pt-4 border-t flex items-center justify-between">
                   <span class="text-sm text-gray-500">Người thực hiện:</span>
                   <span class="font-bold text-indigo-700">{{ order().receiverName }}</span>
                </div>
            }

          </div>

          <!-- Footer Actions -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            
            <!-- ADMIN ACTIONS (OR IT) -->
            @if (canEdit()) {
              <button (click)="onEdit()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Chỉnh sửa
              </button>
            }
            
            <!-- ADMIN RESOLVE ACTION (OR IT) -->
            @if (canResolve()) {
               <button (click)="showResolveInput.set(true)" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                 Đã bổ sung
               </button>
            }

            <!-- NVADMIN DELETE ACTION -->
            @if (isAdmin() && order().status === 'Chờ tiếp nhận') {
              <button (click)="confirmDeleteDetail()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Xóa yêu cầu
              </button>
            }

            <!-- NVADMIN APPROVAL ACTIONS -->
            @if (isAdmin() && (order().status === 'Xử lý Xong' || order().status === 'Chưa hoàn thành')) {
               <div class="flex gap-2">
                  <button (click)="finalizeAdmin(true)" class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-sm font-bold text-white hover:bg-green-700">
                    Chấp Nhận Duyệt
                  </button>
                  <button (click)="showAdminRejectInput.set(true)" class="inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-sm font-bold text-red-700 hover:bg-red-50">
                    Không duyệt hồ sơ
                  </button>
               </div>
            }

            <!-- MANAGER ACTIONS (QL) OR IT -->
            @if ((isManager() || isIT()) && (order().status === 'Chờ tiếp nhận' || order().status === 'Từ chối nhận' || order().status === 'Bổ sung')) {
               <div class="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                  <select #shipperSelect class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
                     <option value="">Chọn Người Nhận</option>
                     @for (s of shippers; track s.email) {
                       <option [value]="s.email">{{ s.name }}</option>
                     }
                  </select>
                  <button (click)="assign(shipperSelect.value)" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm">
                     Điều phối
                  </button>
                  <button (click)="showRequestInput.set(false); showRequestInput.set(true)" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm">
                     Yêu cầu bổ sung
                  </button>
               </div>
            }

            <!-- SHIPPER ACTIONS -->
            @if (isShipper()) {
               @if (order().status === 'Đã điều phối') {
                 <button (click)="attemptAccept()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                   Nhận đơn
                 </button>
                 <button (click)="showRejectInput.set(true)" class="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                   Từ chối
                 </button>
               }
               @if (order().status === 'Đang xử lý') {
                 <button (click)="openCompleteModal()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                   Hoàn Tất (DONE)
                 </button>
               }
            }

            <button type="button" (click)="close.emit()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Đóng
            </button>
          </div>
          
          <!-- Modal Overlays for Specific Actions -->
          
          <!-- Manager Request Info Modal -->
          @if (showRequestInput()) {
            <div class="absolute inset-0 bg-white p-6 z-10">
               <h4 class="text-lg font-bold mb-4">Yêu cầu bổ sung thông tin</h4>
               <textarea [(ngModel)]="actionNote" class="w-full border rounded p-2 mb-4" rows="3" placeholder="Nhập nội dung cần chỉnh sửa..."></textarea>
               <div class="flex justify-end gap-2">
                 <button (click)="showRequestInput.set(false)" class="px-3 py-2 border rounded">Hủy</button>
                 <button (click)="submitRequest()" class="px-3 py-2 bg-blue-600 text-white rounded">Gửi Yêu Cầu</button>
               </div>
            </div>
          }
          
          <!-- Admin Resolve Input Modal -->
          @if (showResolveInput()) {
            <div class="absolute inset-0 bg-white p-6 z-10">
               <h4 class="text-lg font-bold mb-4 text-green-700">Đã bổ sung hồ sơ</h4>
               <p class="text-sm text-gray-600 mb-2">Vui lòng nhập tên hồ sơ hoặc thông tin đã bổ sung:</p>
               <input [(ngModel)]="actionNote" class="w-full border rounded p-2 mb-4" placeholder="Ví dụ: Hình ảnh hộ chiếu mới...">
               <div class="flex justify-end gap-2">
                 <button (click)="showResolveInput.set(false)" class="px-3 py-2 border rounded">Hủy</button>
                 <button (click)="submitResolve()" class="px-3 py-2 bg-green-600 text-white rounded">Xác nhận</button>
               </div>
            </div>
          }

          <!-- Missing Docs Warning Modal -->
          @if (showMissingAlert()) {
            <div class="absolute inset-0 z-20 flex items-center justify-center p-4 bg-gray-500 bg-opacity-90">
              <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <div class="text-center mb-4">
                  <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mt-2">Hồ sơ đang thiếu</h3>
                </div>
                
                <div class="mb-4 text-left bg-gray-50 p-3 rounded">
                   <p class="text-sm text-gray-600 font-bold mb-1">Danh sách thiếu:</p>
                   <ul class="list-disc pl-5 text-sm text-red-600 space-y-1">
                     @for (item of missingItemsList(); track item) {
                       <li>{{ item }}</li>
                     }
                   </ul>
                </div>

                <div class="flex flex-col space-y-2">
                   <button (click)="confirmAcceptMissing()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none sm:text-sm">
                    Chấp nhận (Ghi chú thiếu)
                  </button>
                  <button (click)="reportMissing()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:text-sm">
                    Yêu cầu bổ sung (Trả về)
                  </button>
                  <button (click)="showMissingAlert.set(false)" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm">
                    Trở lại kiểm tra
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Shipper Reject Modal -->
          @if (showRejectInput()) {
            <div class="absolute inset-0 bg-white p-6 z-10">
               <h4 class="text-lg font-bold mb-4 text-red-600">Từ chối đơn hàng</h4>
               <textarea [(ngModel)]="actionNote" class="w-full border rounded p-2 mb-4" rows="3" placeholder="Nhập lý do từ chối..."></textarea>
               <div class="flex justify-end gap-2">
                 <button (click)="showRejectInput.set(false)" class="px-3 py-2 border rounded">Hủy</button>
                 <button (click)="submitReject()" class="px-3 py-2 bg-red-600 text-white rounded">Xác nhận Từ chối</button>
               </div>
            </div>
          }

          <!-- Admin Reject Modal (NVADMIN) -->
          @if (showAdminRejectInput()) {
            <div class="absolute inset-0 bg-white p-6 z-10">
               <h4 class="text-lg font-bold mb-4 text-red-600 uppercase">Không duyệt hồ sơ</h4>
               <textarea [(ngModel)]="actionNote" class="w-full border rounded p-2 mb-4" rows="3" placeholder="Nhập lý do không duyệt..."></textarea>
               <div class="flex justify-end gap-2">
                 <button (click)="showAdminRejectInput.set(false)" class="px-3 py-2 border rounded">Hủy</button>
                 <button (click)="finalizeAdmin(false)" class="px-3 py-2 bg-red-600 text-white rounded font-bold uppercase transition-all shadow hover:bg-red-700">Xác nhận không duyệt</button>
               </div>
            </div>
          }
          
          <!-- Shipper Complete Modal -->
          @if (showCompleteForm()) {
            <div class="absolute inset-0 bg-white p-4 z-10 overflow-y-auto">
               <h4 class="text-lg font-bold mb-2 text-green-600">Hoàn tất đơn hàng</h4>
               
               @if (locationError()) {
                  <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-3 text-sm" role="alert">
                    <p class="font-bold">Lỗi Vị Trí</p>
                    <p>{{ locationError() }}</p>
                  </div>
               }

               <!-- 1. Photos -->
               <div class="mb-3">
                 <label class="block text-sm font-bold mb-1">1. Hình ảnh chứng từ (Bắt buộc > 0)</label>
                 <input type="file" multiple (change)="onFileSelected($event)" accept="image/*" class="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                 
                 @if (previewImages().length > 0) {
                    <div class="grid grid-cols-3 gap-2 mt-2">
                       @for (img of previewImages(); track $index) {
                          <div class="relative group">
                             <img [src]="img" class="h-16 w-full object-cover rounded border">
                             <button (click)="removeImage($index)" class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                          </div>
                       }
                    </div>
                 }
                 @if (previewImages().length === 0) {
                    <p class="text-xs text-red-500 mt-1">* Chưa có ảnh.</p>
                 }
               </div>
               
               <!-- 2. Signature Pad -->
               <div class="mb-3">
                  <label class="block text-sm font-bold mb-1">2. Chữ ký khách hàng (Bắt buộc)</label>
                  <div class="border border-gray-300 rounded touch-none relative" style="height: 150px;">
                    <canvas #canvas class="w-full h-full cursor-crosshair"></canvas>
                    <button (click)="clearSignature()" class="absolute bottom-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">Xóa ký lại</button>
                  </div>
                   @if (!hasSignature()) {
                      <p class="text-xs text-red-500 mt-1">* Chưa có chữ ký.</p>
                   }
               </div>

               <!-- 3. Notes -->
               <div class="mb-3">
                 <label class="block text-sm font-bold mb-1">3. Ghi chú</label>
                 <textarea [(ngModel)]="actionNote" class="w-full border rounded p-2 text-sm" rows="2" placeholder="Đã giao cho lễ tân..."></textarea>
               </div>
               
               <!-- 4. Submit -->
               <div class="flex justify-end gap-2 pt-2 border-t">
                 <button (click)="showCompleteForm.set(false)" class="px-3 py-2 border rounded text-sm">Hủy</button>
                 <button 
                    [disabled]="!canSubmitDone() || isCompleting()" 
                    (click)="submitComplete()" 
                    class="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm">
                    @if (isCompleting()) {
                      <span>Đang lấy GPS...</span>
                    } @else {
                      Xác nhận Hoàn Tất
                    }
                 </button>
               </div>
            </div>
          }

        </div>
      <!-- Hidden PDF Template -->
      <div #pdfTemplate class="fixed -left-[9999px] top-0 w-[800px] bg-white p-8 text-black font-mono text-base leading-relaxed border-2 border-green-500">
         <h1 class="text-2xl font-bold mb-4">{{ order().id }} - Tình Trạng: {{ getStatusLabel(order().status) }}</h1>
         <div class="border-b-2 border-dashed border-gray-800 my-6"></div>
         
         <div class="space-y-3">
             <p><span class="font-bold">Tên Khách:</span> {{ order().company || order().senderName }}</p>
             <p><span class="font-bold">SĐT:</span> {{ order().phone || order().senderPhone }}</p>
             <p><span class="font-bold">Địa Chỉ:</span> {{ order().address }}</p>
         </div>
         
         <div class="border-b-2 border-dashed border-gray-800 my-6"></div>
         
         <p class="mb-4"><span class="font-bold">Ghi Chú:</span> {{ order().notes || 'Không có' }}</p>
         
         <h2 class="font-bold text-lg mb-3">Check list hồ sơ</h2>
         <div class="ml-2 space-y-2">
            @for (att of (localAttachments().length ? localAttachments() : order().attachments || []); track att.name) {
                <div class="flex items-center">
                   <div class="w-6 h-6 border-2 border-black mr-3 flex-shrink-0"></div>
                   <span class="text-lg">- {{ att.name }} x {{ att.qty }}</span>
                </div>
            }
            @if (!order().attachments.length) {
               <p class="italic">(Không có hồ sơ đính kèm)</p>
            }
         </div>
         
         <div class="mt-8 pt-4 border-t border-gray-300 text-sm text-center italic text-gray-500">
            Phiếu xuất từ hệ thống Nhị Gia Logistics - {{ order().date | date:'dd/MM/yyyy' }}
         </div>
      </div>
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  order = input.required<Order>();
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Order>();

  dataService = inject(DataService);
  authService = inject(AuthService);

  shippers = this.dataService.getShippers();

  // Local UI State
  showRequestInput = signal(false);
  showRejectInput = signal(false);
  showCompleteForm = signal(false);
  showResolveInput = signal(false);
  showAdminRejectInput = signal(false);

  // Checklist Logic
  localAttachments = signal<Attachment[]>([]);
  showMissingAlert = signal(false);
  missingItemsList = signal<string[]>([]);

  actionNote = '';
  previewImages = signal<string[]>([]);
  isCompleting = signal(false);
  locationError = signal('');

  // PDF State
  pdfUrl = signal<string | null>(null);
  @ViewChild('pdfTemplate') pdfTemplate!: ElementRef;

  // Signature State
  @ViewChild('canvas') canvasEl!: ElementRef<HTMLCanvasElement>;
  private cx!: CanvasRenderingContext2D | null;
  hasSignature = signal(false);

  currentUserRole = this.authService.userRole;

  ngOnInit() {
    // Initialize checklist with deep copy
    if (this.order().attachments) {
      const cloned = this.order().attachments.map(a => ({ ...a }));
      this.localAttachments.set(cloned);
    }
  }

  // --- Checklist Logic ---

  isChecklistActive() {
    const status = this.order().status;
    return (status === 'Đã điều phối' || status === 'Chờ tiếp nhận' || status === 'Bổ sung') &&
      (this.currentUserRole() === 'NVGN' || this.currentUserRole() === 'QL');
  }

  toggleItem(index: number) {
    if (!this.isChecklistActive()) return;
    this.localAttachments.update(items => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], checked: !newItems[index].checked };
      return newItems;
    });
  }

  checkAll() {
    if (!this.isChecklistActive()) return;
    this.localAttachments.update(items => items.map(i => ({ ...i, checked: true })));
  }

  getMissingItemsString(): string {
    return this.localAttachments()
      .filter(a => !a.checked)
      .map(a => `${a.name} (${a.qty})`)
      .join(', ');
  }

  exportPdf() {
    if (!this.pdfTemplate) return;

    html2canvas(this.pdfTemplate.nativeElement, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      this.pdfUrl.set(url);

      // Auto revoke after 60s
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.pdfUrl.set(null);
      }, 60000);
    });
  }

  attemptAccept() {
    const missing = this.localAttachments().filter(a => !a.checked);
    if (missing.length > 0) {
      this.missingItemsList.set(missing.map(a => `${a.name} (x${a.qty})`));
      this.showMissingAlert.set(true);
    } else {
      this.commitChecklist();
      this.close.emit();
      this.dataService.shipperAccept(this.order().id);
    }
  }

  confirmAcceptMissing() {
    this.commitChecklist();
    const missingStr = this.getMissingItemsString();
    this.close.emit();
    this.dataService.shipperAccept(this.order().id, missingStr);
    this.showMissingAlert.set(false);
  }

  reportMissing() {
    this.commitChecklist();
    const missingStr = this.getMissingItemsString();
    this.close.emit();
    this.dataService.requestInfo(this.order().id, `Thiếu hồ sơ: ${missingStr}. Yêu cầu bổ sung.`);
    this.showMissingAlert.set(false);
  }

  private commitChecklist() {
    this.dataService.updateOrder(this.order().id, {
      attachments: this.localAttachments()
    });
  }

  // --- Standard Logic ---

  canEdit() {
    if (this.currentUserRole() === 'IT') return true;
    return this.currentUserRole() === 'NVADMIN' && (this.order().status === 'Chờ tiếp nhận' || this.order().status === 'Xử lý Xong');
  }

  canResolve() {
    const role = this.currentUserRole();
    if (role === 'IT' && !!this.order().requestNote) return true;
    return role === 'NVADMIN' && (this.order().status === 'Chờ tiếp nhận' || this.order().status === 'Bổ sung') && !!this.order().requestNote;
  }

  isManager() {
    return this.currentUserRole() === 'QL';
  }

  isShipper() {
    return this.currentUserRole() === 'NVGN';
  }

  isIT() {
    return this.currentUserRole() === 'IT';
  }

  isAdmin() {
    return this.currentUserRole() === 'NVADMIN';
  }

  confirmDeleteDetail() {
    if (confirm(`Bạn có chắc muốn xóa yêu cầu ${this.order().id}?`)) {
      this.close.emit();
      this.dataService.deleteOrder(this.order().id);
    }
  }

  setHighlight(color: 'red' | 'blue' | 'yellow' | null) {
    this.dataService.setShipperHighlightColor(this.order().id, color);
  }

  onEdit() {
    this.edit.emit(this.order());
  }

  encodeAddress(addr: string) {
    return encodeURIComponent(addr);
  }

  assign(email: string) {
    if (!email) return;
    const shipper = this.shippers.find(s => s.email === email);
    if (shipper) {
      this.close.emit();
      this.dataService.assignReceiver(this.order().id, shipper.email, shipper.name);
    }
  }

  submitRequest() {
    const note = this.actionNote.trim();
    if (!note) return;
    this.close.emit();
    this.dataService.requestInfo(this.order().id, note);
    this.showRequestInput.set(false);
  }

  submitResolve() {
    const note = this.actionNote.trim();
    if (!note) return;
    this.close.emit();
    this.dataService.resolveRequest(this.order().id, note);
    this.showResolveInput.set(false);
  }

  submitReject() {
    const note = this.actionNote.trim();
    if (!note) return;
    this.close.emit();
    this.dataService.shipperReject(this.order().id, note);
    this.showRejectInput.set(false);
  }

  finalizeAdmin(approved: boolean) {
    const note = this.actionNote.trim();
    if (!approved && !note) {
      alert('Vui lòng nhập lý do không duyệt!');
      return;
    }
    this.close.emit();
    this.dataService.adminFinalize(this.order().id, approved, note);
    this.showAdminRejectInput.set(false);
    this.actionNote = '';
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length) {
      const remainingSlots = 10 - this.previewImages().length;
      const count = Math.min(files.length, remainingSlots);

      for (let i = 0; i < count; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImages.update(imgs => [...imgs, e.target.result]);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removeImage(index: number) {
    this.previewImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  openCompleteModal() {
    this.showCompleteForm.set(true);
    setTimeout(() => this.initCanvas(), 100);
  }

  initCanvas() {
    if (!this.canvasEl) return;
    const canvas = this.canvasEl.nativeElement;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.cx = canvas.getContext('2d');
    if (this.cx) {
      this.cx.lineWidth = 2;
      this.cx.lineCap = 'round';
      this.cx.strokeStyle = '#000';
    }

    const start = (e: any) => this.startPosition(e);
    const finish = () => this.finishedPosition();
    const draw = (e: any) => this.draw(e);

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mouseup', finish);
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e.touches[0]); }, { passive: false });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); finish(); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); }, { passive: false });
  }

  private isPainting = false;

  startPosition(e: any) {
    this.isPainting = true;
    this.draw(e);
  }

  finishedPosition() {
    this.isPainting = false;
    this.cx?.beginPath();
    this.checkSignatureContent();
  }

  draw(e: any) {
    if (!this.isPainting || !this.cx) return;
    const rect = this.canvasEl.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.cx.lineTo(x, y);
    this.cx.stroke();
    this.cx.beginPath();
    this.cx.moveTo(x, y);
  }

  clearSignature() {
    if (!this.cx || !this.canvasEl) return;
    this.cx.clearRect(0, 0, this.canvasEl.nativeElement.width, this.canvasEl.nativeElement.height);
    this.hasSignature.set(false);
  }

  checkSignatureContent() {
    this.hasSignature.set(true);
  }

  canSubmitDone() {
    return this.previewImages().length > 0 && this.hasSignature();
  }

  submitComplete() {
    if (!this.canSubmitDone()) return;

    this.isCompleting.set(true);
    this.locationError.set('');

    if (!navigator.geolocation) {
      this.locationError.set('Trình duyệt không hỗ trợ Geolocation.');
      this.isCompleting.set(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const signatureBase64 = this.canvasEl.nativeElement.toDataURL();

        this.close.emit(); // Close immediately
        this.dataService.shipperComplete(
          this.order().id,
          this.previewImages(),
          location,
          signatureBase64,
          this.actionNote || 'Đã hoàn tất'
        );
        this.isCompleting.set(false);
      },
      (error) => {
        this.isCompleting.set(false);
        this.locationError.set('Bắt buộc bật GPS để hoàn tất.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
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
      'Chưa hoàn thành': 'Chưa hoàn thành'
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
      'Chưa hoàn thành': 'bg-red-50 text-red-600'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  }

  getDeptColorClass(dept: DepartmentType): string {
    switch (dept) {
      case 'Visa Việt Nam': return 'bg-blue-500';
      case 'Visa Nước Ngoài': return 'bg-purple-500';
      case 'Giấy Phép Lao Động': return 'bg-teal-500';
      default: return 'bg-gray-400';
    }
  }
}