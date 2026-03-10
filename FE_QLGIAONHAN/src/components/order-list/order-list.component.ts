import { Component, inject, output, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { OrderService } from "../../services/order.service";
import { AuthService } from "../../services/auth.service";
import {
  DepartmentType,
  FilterType,
  LocationData,
  Order,
  OrderStatus,
} from "../../type/models";
import { OrderDetailComponent } from "../order-detail/order-detail.component";
import { OrderFormComponent } from "../order-form/order-form.component";
import { DepartmentService } from "../../services/department.service";
import { LoadingComponent } from "../../app/shared/loading/loading.component";

@Component({
  selector: "app-order-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    OrderDetailComponent,
    OrderFormComponent,
    LoadingComponent,
  ],
  template: `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">
        {{
          authService.userRole() === "NVADMIN" ||
          authService.userRole() === "QL" ||
          authService.userRole() === "IT"
            ? "DANH SÁCH YÊU CẦU GIAO NHẬN CẦN XỬ LÝ"
            : authService.userRole() === "NVGN"
              ? "DANH SÁCH HỒ SƠ CẦN GIAO"
              : "DANH SÁCH YÊU CẦU GIAO NHẬN"
        }}
      </h2>

      @if (
        authService.userRole() === "NVADMIN" || authService.userRole() === "IT"
      ) {
        <button
          (click)="openCreate()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center shadow transition"
        >
          <span>Tạo Yêu Cầu Mới</span>
        </button>
      }
    </div>
    <div class="space-y-4">
      <!-- Search & Filters Toolbar -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          <!-- SEARCH -->
          <div class="relative md:col-span-3">
            <input
              type="text"
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              (keyup.enter)="search()"
              placeholder="Tìm theo mã, khách hàng, địa chỉ, người giao..."
              class="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <!-- icon search -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <!-- clear button -->
            @if (searchTerm()) {
              <button
                (click)="searchTerm.set('')"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            }
          </div>

          <!-- FILTER -->
          <select
            [ngModel]="filterDept()"
            (ngModelChange)="filterDept.set($event)"
            class="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tất cả Bộ phận</option>

            @for (dept of departmentService.departments(); track dept.id) {
              <option [value]="dept.id">
                {{ dept.name }}
              </option>
            }
          </select>

          <!-- BUTTON GROUP -->
          <div class="flex gap-2">
            <!-- SEARCH -->
            <button
              (click)="search()"
              class="flex items-center gap-1 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-blue-700"
            >
              🔍 Tìm
            </button>

            <!-- RESET -->
            @if (isSearched()) {
              <button
                (click)="resetFilters()"
                class="flex items-center gap-1 bg-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm hover:bg-gray-300"
              >
                🔄 Reset
              </button>
            }
          </div>
        </div>

        <!-- Advanced Filters (Tabs) -->
        <div
          class="flex space-x-2 border-b border-gray-200 bg-white px-4 rounded-t-lg shadow-sm overflow-x-auto"
        >
          <button
            (click)="setFilter('ALL')"
            [class]="
              currentFilter() === 'ALL'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            "
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Tất cả
          </button>
          <button
            (click)="setFilter('PENDING_GROUP')"
            [class]="
              currentFilter() === 'PENDING_GROUP'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            "
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Cần Xử Lý (Gấp)
          </button>
          <button
            (click)="setFilter('DONE_GROUP')"
            [class]="
              currentFilter() === 'DONE_GROUP'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            "
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Đã Hoàn Tất
          </button>
          <div class="flex-1"></div>
        </div>

        <!-- Main Order List -->
        <div class="bg-white rounded-b-lg rounded-tr-lg shadow overflow-hidden">
          <!-- Mobile View with Drag & Drop -->
          <div
            class="block md:hidden"
            cdkDropList
            (cdkDropListDropped)="onDrop($event)"
            [cdkDropListDisabled]="authService.userRole() !== 'NVGN'"
          >
            @for (order of orders(); track order.id) {
              <div
                [class]="
                  'p-4 border-b border-gray-200 cursor-pointer transition-colors relative ' +
                  (isShipper() && order.shipperHighlightColor
                    ? getShipperHighlightClass(order.shipperHighlightColor)
                    : 'hover:bg-blue-50')
                "
                cdkDrag
                (click)="clickItem($event, order)"
              >
                <div
                  *cdkDragPlaceholder
                  class="bg-gray-100 h-32 border-2 border-dashed border-gray-300"
                ></div>

                <!-- Department Strip -->
                <div
                  [class]="
                    'absolute left-0 top-0 bottom-0 w-1 ' +
                    getDeptColorClass(order.department?.code || '')
                  "
                ></div>

                <!-- Top Row: ID + Status -->
                <div class="flex justify-between items-start mb-2 pl-2">
                  <div class="flex flex-col">
                    <span class="font-bold text-sm text-blue-700 leading-tight"
                      >#{{ order.orderCode || order.id }}</span
                    >
                    <span
                      [class]="
                        'text-[10px] font-bold uppercase tracking-wide ' +
                        getDeptTextColorClass(order.department?.code || '')
                      "
                      >{{
                        order.department?.name || "Không rõ phòng ban"
                      }}</span
                    >
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0 ml-2">
                    <div class="flex items-center">
                      <span
                        [class]="
                          getStatusClass(order.status) +
                          ' px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap shadow-sm'
                        "
                      >
                        {{ getStatusLabel(order.status) }}
                      </span>
                      <button
                        *ngIf="
                          authService.userRole() === 'NVADMIN' &&
                          order.status === 'PENDING'
                        "
                        (click)="confirmDelete($event, order)"
                        class="ml-2 bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold hover:bg-red-100 transition-colors uppercase"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Main Info Block -->
                <div class="space-y-2 text-sm text-gray-700 pl-2">
                  <!-- Feedback/Warnings -->
                  @if (order.rejectionReason) {
                    <div
                      class="text-[10px] text-red-700 font-bold break-words bg-red-50 p-1 rounded border border-red-100"
                    >
                      🚫 Từ chối: {{ order.rejectionReason }}
                    </div>
                  }
                  @if (
                    order.status === "SUPPLEMENT_REQUIRED" &&
                    order.supplementNote
                  ) {
                    <div
                      class="text-[10px] text-orange-700 font-bold break-words bg-orange-50 p-1 rounded border border-orange-100"
                    >
                      🔔 Bổ sung: {{ order.supplementNote }}
                      <div class="text-[9px] text-orange-400 mt-1">
                        {{ order.supplementRequesterName }} -
                        {{ order.supplementDate | date: "HH:mm dd/MM/yy" }}
                      </div>
                    </div>
                  }
                  @if (order.status === "PROCESSING" && order.missingDocs) {
                    <div
                      class="text-[10px] text-orange-700 font-bold break-words bg-orange-50 p-1 rounded border border-orange-100"
                    >
                      ⚠️ Thiếu hồ sơ: {{ order.missingDocs }}
                    </div>
                  }
                  @if (order.status === "INCOMPLETE" && order.reviewNote) {
                    <div
                      class="text-[10px] text-red-700 font-bold break-words bg-red-50 p-1 rounded border border-red-100"
                    >
                      ❌ Không duyệt: {{ order.reviewNote }}
                    </div>
                  }

                  <div class="break-words">
                    <span class="font-bold text-gray-900 uppercase">{{
                      order.company
                    }}</span>
                  </div>

                  <!-- Address -->
                  <div class="flex items-start break-words text-xs">
                    <a
                      [href]="
                        'https://www.google.com/maps/search/?api=1&query=' +
                        encodeAddress(order.address)
                      "
                      target="_blank"
                      (click)="$event.stopPropagation()"
                      class="flex items-start text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span class="shrink-0 mr-1.5 mt-0.5">📍</span>
                      <span>{{ order.address }}</span>
                    </a>
                  </div>

                  <!-- Receiver / Purpose -->
                  <div
                    class="pt-2 mt-2 border-t border-gray-50 flex items-start justify-between text-[10px] text-gray-500"
                  >
                    <span
                      class="break-words pr-2 max-w-[65%] font-bold text-orange-600 uppercase"
                      >{{ order.purpose }}</span
                    >
                    <span class="italic shrink-0">{{
                      order.receiverName || "Chưa phân công"
                    }}</span>
                  </div>
                </div>
              </div>
            }
            @if (orders().length === 0) {
              <div class="p-8 text-center text-gray-500">
                Chưa có công việc nào.
              </div>
            }
          </div>

          <!-- Desktop View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mã / Bộ Phận
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Người Giao
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Khách Hàng / Địa Chỉ
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mục Đích
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng Thái
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (order of orders(); track order.id) {
                  <tr
                    [class]="
                      'cursor-pointer transition-colors ' +
                      (isShipper() && order.shipperHighlightColor
                        ? getShipperHighlightClass(order.shipperHighlightColor)
                        : 'hover:bg-blue-50')
                    "
                    (click)="openDetail(order)"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-xs font-medium text-blue-600">
                        #{{ order.orderCode || order.id }}
                      </div>
                      <div
                        [class]="
                          'text-xs font-semibold mt-1 ' +
                          getDeptTextColorClass(order.department?.code || '')
                        "
                      >
                        {{ order.department?.name || "Không rõ phòng ban" }}
                      </div>
                      <div class="text-xs text-gray-400 mt-1">
                        {{ order.date | date: "dd/MM" }} - {{ order.time }}
                      </div>
                    </td>
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      <div class="font-medium text-gray-900">
                        {{ order.senderName }}
                      </div>
                      @if (order.senderPhone) {
                        <a
                          [href]="'tel:' + order.senderPhone"
                          (click)="$event.stopPropagation()"
                          class="text-xs text-blue-500 hover:underline flex items-center"
                        >
                          📞 {{ order.senderPhone }}
                        </a>
                      }
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      <div class="font-medium text-gray-900 uppercase">
                        {{ order.company }}
                      </div>

                      @if (order.rejectionReason) {
                        <div
                          class="text-[10px] text-red-700 font-bold mt-1 bg-red-50 inline-block px-1 rounded"
                        >
                          🚫 {{ order.rejectionReason }}
                        </div>
                      }

                      <div class="flex flex-col text-xs mt-1">
                        <a
                          [href]="
                            'https://www.google.com/maps/search/?api=1&query=' +
                            encodeAddress(order.address)
                          "
                          target="_blank"
                          (click)="$event.stopPropagation()"
                          class="text-blue-500 hover:underline flex items-center mb-1"
                        >
                          <span class="mr-1">📍</span> {{ order.address }}
                        </a>
                      </div>
                    </td>
                    <td
                      class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                    >
                      {{ order.purpose }} -
                      {{ order.updatedAt | date: "HH:mm dd/MM/yyyy" }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                          <span
                            [class]="
                              getStatusClass(order.status) +
                              ' px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit justify-center'
                            "
                          >
                            {{ getStatusLabel(order.status) }}
                          </span>
                          <button
                            *ngIf="
                              authService.userRole() === 'NVADMIN' &&
                              order.status === 'PENDING'
                            "
                            (click)="confirmDelete($event, order)"
                            class="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-red-100 transition-colors uppercase"
                          >
                            Xóa
                          </button>
                        </div>
                        @if (
                          order.status === "SUPPLEMENT_REQUIRED" &&
                          order.supplementNote
                        ) {
                          <div
                            class="text-[10px] text-orange-600 max-w-[150px] truncate"
                          >
                            {{ order.supplementNote }}
                          </div>
                          <div class="text-[8px] text-gray-400 italic">
                            bởi {{ order.supplementRequesterName }} -
                            {{ order.supplementDate | date: "HH:mm dd/MM" }}
                          </div>
                        }
                        @if (
                          order.status === "PROCESSING" && order.missingDocs
                        ) {
                          <div class="text-[10px] text-orange-600">
                            ⚠️ Thiếu: {{ order.missingDocs }}
                          </div>
                        }
                        @if (
                          order.status === "INCOMPLETE" && order.reviewNote
                        ) {
                          <div class="text-[10px] text-red-600 font-bold">
                            ❌ {{ order.reviewNote }}
                          </div>
                        }
                      </div>
                      @if (order.statusUpdateDate) {
                        <div class="text-[9px] text-gray-400 mt-1 ml-1">
                          {{
                            order.statusUpdateDate | date: "HH:mm dd/MM/yyyy"
                          }}
                        </div>
                      }
                    </td>
                  </tr>
                }
                @if (orders().length === 0) {
                  <tr>
                    <td
                      colspan="5"
                      class="px-6 py-10 text-center text-gray-500"
                    >
                      Không tìm thấy công việc nào phù hợp.
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <div class="flex items-center justify-between mt-4 px-2">
              <div class="text-sm text-gray-500">
                Trang {{ currentPage }} / {{ orderService.totalPages() }}
              </div>

              <div class="flex gap-2">
                <button
                  (click)="prevPage()"
                  [disabled]="currentPage === 1"
                  class="px-3 py-1 text-sm border rounded disabled:opacity-40"
                >
                  ← Trước
                </button>

                <button
                  (click)="nextPage()"
                  [disabled]="currentPage === orderService.totalPages()"
                  class="px-3 py-1 text-sm border rounded disabled:opacity-40"
                >
                  Sau →
                </button>
              </div>
            </div>
          </div>
        </div>

        @if (selectedOrder()) {
          <app-order-detail
            [order]="selectedOrder()!"
            (close)="selectedOrder.set(null)"
            (edit)="startEdit($event)"
          />
        }

        <!-- ===== MODAL FORM ===== -->
        @if (showCreateForm()) {
          <div
            class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
            (click)="closeForm()"
          >
            <div class="w-full max-w-4xl" (click)="$event.stopPropagation()">
              <app-order-form
                [orderData]="editingOrder()"
                (cancel)="closeForm()"
              />
            </div>
          </div>
        }

        <!-- Action Overlay -->
        <div
          *ngIf="selectedActionOrder() as sel"
          class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div
            class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div
              class="bg-blue-600 p-4 text-white flex justify-between items-center"
            >
              <h3 class="font-bold text-lg">
                Chi tiết yêu cầu: {{ sel.orderCode || sel.id }}
              </h3>
              <button
                (click)="closeAction()"
                class="text-white hover:bg-blue-700 px-2 rounded font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div class="text-sm text-gray-600">
                <p><strong>Khách hàng:</strong> {{ sel.company }}</p>
                <p><strong>Trạng thái:</strong> {{ sel.status }}</p>
                <p><strong>Nội dung:</strong> {{ sel.purpose }}</p>

                <div
                  *ngIf="sel.rejectionReason"
                  class="mt-2 p-2 bg-red-50 border border-red-100 rounded text-red-700 text-xs"
                >
                  <strong>Lý do từ chối:</strong> {{ sel.rejectionReason }}
                </div>
                <div
                  *ngIf="sel.supplementNote"
                  class="mt-2 p-2 bg-orange-50 border border-orange-100 rounded text-orange-700 text-xs"
                >
                  <strong>Yêu cầu bổ sung:</strong> {{ sel.supplementNote }}
                </div>
                <div
                  *ngIf="sel.reviewNote"
                  class="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-gray-700 font-bold text-xs"
                >
                  <strong>Lý do chưa hoàn thành:</strong> {{ sel.reviewNote }}
                </div>
              </div>

              <!-- Dynamic Forms -->
              <div *ngIf="authService.userRole() === 'NVADMIN'">
                <div *ngIf="sel.status === 'COMPLETED'" class="space-y-3">
                  <p class="text-green-600 font-bold">
                    Shipper đã hoàn thành! Kiểm tra ngay.
                  </p>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      (click)="approveOrder()"
                      class="bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 uppercase transition-all shadow-sm"
                    >
                      Chấp Nhận Duyệt
                    </button>
                    <button
                      (click)="rejectOrderAdmin()"
                      class="bg-red-100 text-red-600 py-2 rounded font-bold hover:bg-red-200 uppercase transition-all"
                    >
                      Không duyệt
                    </button>
                  </div>
                  <textarea
                    [(ngModel)]="actionReason"
                    placeholder="Nhập lý do nếu bấm 'Không duyệt'..."
                    class="w-full border p-2 rounded text-sm mt-2"
                  ></textarea>
                </div>
                <div
                  *ngIf="sel.status === 'PENDING'"
                  class="mt-4 pt-4 border-t"
                >
                  <button
                    (click)="confirmDelete($event, sel)"
                    class="w-full bg-red-600 text-white py-3 rounded font-bold uppercase shadow-md hover:bg-red-700 transition-all"
                  >
                    Xóa yêu cầu công việc
                  </button>
                </div>
              </div>

              <div *ngIf="authService.userRole() === 'QL'">
                <div
                  *ngIf="
                    ['PENDING', 'REJECTED', 'SUPPLEMENT_REQUIRED'].includes(
                      sel.status
                    )
                  "
                  class="space-y-4"
                >
                  <button
                    class="w-full bg-blue-600 text-white py-3 rounded font-bold uppercase shadow-md hover:bg-blue-700 transition-all"
                  >
                    Điều phối nhân viên
                  </button>

                  <div class="pt-2 border-t mt-4">
                    <p
                      class="text-[10px] font-bold text-gray-400 uppercase mb-2"
                    >
                      Yêu cầu bổ sung hồ sơ:
                    </p>
                    <textarea
                      [(ngModel)]="actionNote"
                      class="w-full border p-2 rounded text-sm min-h-[80px] outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Ghi chú yêu cầu chi tiết..."
                    ></textarea>
                    <button
                      (click)="requestSupplementQL()"
                      class="w-full bg-orange-500 text-white py-2 rounded font-bold text-xs mt-1 uppercase hover:bg-orange-600"
                    >
                      Gửi yêu cầu bổ sung
                    </button>
                  </div>
                </div>
              </div>

              <div *ngIf="authService.userRole() === 'NVGN'">
                <div *ngIf="sel.status === 'ASSIGNED'" class="space-y-3">
                  <div class="bg-gray-50 p-3 rounded border">
                    <p
                      class="text-[10px] font-bold mb-2 uppercase text-gray-400"
                    >
                      Kiểm tra hồ sơ tại chỗ
                    </p>
                    <div
                      *ngFor="let doc of sel.attachments"
                      class="flex items-center gap-2 text-sm mb-1"
                    >
                      <input
                        type="checkbox"
                        [(ngModel)]="doc.checked"
                        class="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>{{ doc.name }} ({{ doc.qty }})</span>
                    </div>
                  </div>
                  <textarea
                    [(ngModel)]="actionReason"
                    placeholder="Ghi chú nếu thiếu hồ sơ hoặc lý do từ chối..."
                    class="w-full border p-2 rounded text-sm"
                  ></textarea>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      (click)="acceptJob()"
                      class="bg-blue-600 text-white py-3 rounded font-bold uppercase hover:bg-blue-700"
                    >
                      Nhận đơn
                    </button>
                    <button
                      (click)="rejectJob()"
                      class="bg-red-50 text-red-600 py-3 rounded font-bold uppercase hover:bg-red-100"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>

                <div *ngIf="sel.status === 'PROCESSING'" class="space-y-3">
                  <div class="border p-3 rounded bg-gray-50">
                    <p
                      class="text-[10px] font-bold mb-2 uppercase text-gray-400"
                    >
                      Upload Ảnh hiện trường
                    </p>
                    <div class="text-[10px] text-gray-500 italic font-medium">
                      Hệ thống đã tự động gán 3 ảnh mock từ máy ảnh.
                    </div>
                  </div>
                  <div>
                    <label
                      class="block text-xs font-bold mb-1 uppercase text-gray-400"
                      >Chữ ký khách hàng</label
                    >
                    <div
                      class="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-white relative"
                    >
                      <input
                        [(ngModel)]="mockSignature"
                        placeholder="Nhập tên KH để xác nhận..."
                        class="w-full border-b border-gray-100 outline-none text-center italic font-serif text-lg py-2 uppercase tracking-widest"
                      />
                      <div
                        class="text-[8px] text-gray-300 absolute bottom-1 right-2"
                      >
                        SIGNATURE FIELD
                      </div>
                    </div>
                  </div>
                  <button
                    (click)="completeJob()"
                    class="w-full bg-purple-600 text-white py-3 rounded font-bold shadow-lg uppercase hover:bg-purple-700 transition-all"
                  >
                    Hoàn tất công việc
                  </button>

                  <div class="pt-2 border-t mt-2 text-center">
                    <button
                      (click)="returnJob()"
                      class="text-red-500 text-[10px] font-bold underline uppercase hover:text-red-700"
                    >
                      Báo thiếu hồ sơ (Trả về QL)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        @if (loading()) {
          <app-loading></app-loading>
        }
      </div>
    </div>
  `,
})
export class OrderListComponent {
  select = output<Order>();
  create = output<void>();

  orderService = inject(OrderService);
  departmentService = inject(DepartmentService);
  authService = inject(AuthService);

  // Filter signals
  currentFilter = signal<FilterType>("ALL");
  searchTerm = signal("");
  filterDept = signal("");
  isSearched = signal(false);

  totalPages = this.orderService.totalPages;

  // Local UI state
  selectedActionOrder = signal<Order | null>(null);
  actionNote = "";
  actionReason = "";
  mockSignature = "";

  selectedOrder = signal<Order | null>(null);
  showCreateForm = signal(false);
  editingOrder = signal<Order | null>(null);

  currentPage = 1;
  limit = 20;

  loading = signal(false);

  isShipper = computed(() => this.authService.userRole() === "NVGN");

  ngOnInit() {
    this.load();
    this.departmentService.loadDepartments();
  }

  // load() {
  //   this.orderService.loadOrders(this.currentPage, this.limit);
  // }

  nextPage() {
    if (this.currentPage < this.orderService.totalPages()) {
      this.currentPage++;
      this.load();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.load();
    }
  }

  search() {
    this.currentPage = 1;

    const hasFilter =
      this.searchTerm().trim() !== "" || this.filterDept() !== "";

    this.isSearched.set(hasFilter);

    this.loading.set(true);

    this.orderService
      .loadOrders(
        this.currentPage,
        this.limit,
        this.searchTerm(),
        this.filterDept(),
        this.currentFilter(),
      )
      .subscribe({
        next: () => this.loading.set(false),
        error: (err) => {
          console.error("Search error:", err);
          this.loading.set(false);
        },
      });
  }

  load() {
    this.loading.set(true);

    this.orderService
      .loadOrders(
        this.currentPage,
        this.limit,
        this.searchTerm(),
        this.filterDept(),
        this.currentFilter(),
      )
      .subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      });
  }

  clearSearch() {
    this.searchTerm.set("");

    const hasFilter = this.filterDept() !== "";
    this.isSearched.set(hasFilter);

    this.search();
  }

  resetFilters() {
    this.searchTerm.set("");
    this.filterDept.set("");

    this.currentPage = 1;
    this.isSearched.set(false);
    this.search();
  }

  orders = computed(() => {
    const orders = this.orderService.orders();
    return orders;
  });

  openCreate() {
    this.editingOrder.set(null);
    this.showCreateForm.set(true);
  }

  openDetail(order: Order) {
    this.orderService.getOrderDetail(order.id).subscribe((fullOrder) => {
      this.selectedOrder.set(fullOrder);
    });
  }

  startEdit(order: Order) {
    this.selectedOrder.set(null);
    this.editingOrder.set(order);
    this.showCreateForm.set(true);
  }

  closeForm() {
    this.showCreateForm.set(false);
    this.editingOrder.set(null);
    this.load();
  }

  onCreate() {
    this.create.emit();
  }

  setFilter(filter: FilterType) {
    this.currentFilter.set(filter);
    this.currentPage = 1;
    this.load();
  }

  confirmDelete(event: Event, order: Order) {
    event.stopPropagation();
    if (
      confirm(
        `Bạn có chắc muốn xóa yêu cầu ${order.orderId || order.id || order.id}?`,
      )
    ) {
      this.orderService.deleteOrder(order.id);
    }
  }

  clickItem(event: Event, order: Order) {
    const target = event.target as HTMLElement;

    if (
      target.closest("button") ||
      target.closest("a") ||
      (target as any).type === "checkbox"
    ) {
      return;
    }

    this.openDetail(order);
  }

  openAction(event: Event, order: Order) {
    event.stopPropagation();
    this.selectedActionOrder.set(order);
    this.actionNote = "";
    this.actionReason = "";
    this.mockSignature = "";
  }

  closeAction() {
    this.selectedActionOrder.set(null);
  }

  canShowAction(o: Order): boolean {
    const role = this.authService.userRole();
    if (!role) return false;

    if (role === "NVADMIN") return o.status === "COMPLETED";
    if (role === "QL")
      return ["PENDING", "REJECTED", "SUPPLEMENT_REQUIRED"].includes(o.status);
    if (role === "NVGN") return ["ASSIGNED", "PROCESSING"].includes(o.status);
    return false;
  }

  // --- Actions ---
  approveOrder() {
    const o = this.selectedActionOrder();
    if (!o) return;
    this.closeAction();
    this.orderService.adminFinalize(o.id, true);
  }

  rejectOrderAdmin() {
    const o = this.selectedActionOrder();
    if (!o || !this.actionReason)
      return alert("Vui lòng nhập lý do chưa hoàn thành!");
    this.closeAction();
    this.orderService.adminFinalize(o.id, false, this.actionReason);
  }

  requestSupplementQL() {
    const o = this.selectedActionOrder();
    if (!o || !this.actionNote)
      return alert("Nhập ghi chú chi tiết hồ sơ cần bổ sung!");
    this.closeAction();
    this.orderService.qlRequestSupplement(o.id, this.actionNote);
  }

  acceptJob() {
    const o = this.selectedActionOrder();
    if (!o) return;
    this.closeAction();
  }

  rejectJob() {
    const o = this.selectedActionOrder();
    if (!o || !this.actionReason)
      return alert("Vui lòng nhập lý do từ chối đơn hàng này!");
    this.closeAction();
    this.orderService.shipperReject(o.id, this.actionReason);
  }

  returnJob() {
    const o = this.selectedActionOrder();
    if (!o || !this.actionReason)
      return alert("Vui lòng ghi rõ hồ sơ bị thiếu!");
    this.closeAction();
    this.orderService.shipperReturnSupplement(o.id, this.actionReason);
  }

  completeJob() {
    const o = this.selectedActionOrder();
    if (!o || !this.mockSignature)
      return alert("Bắt buộc khách hàng phải ký xác nhận (Mock)!");
    const loc: LocationData = {
      lat: 10.762622,
      lng: 106.660172,
      address: "Current Location",
    };
    const imgs = ["image1.jpg", "image2.pdf"];
    this.closeAction();
  }

  onDrop(event: CdkDragDrop<Order[]>) {
    const list = [...this.orders()];

    moveItemInArray(list, event.previousIndex, event.currentIndex);

    this.orderService.setOrders(list);

    const orderIds = list.map((o) => String(o.id));

    const userId = this.authService.currentUser()?.id;
    if (userId !== undefined && userId !== null) {
      this.orderService.updateOrderSort(userId, orderIds);
    }
  }

  encodeAddress(addr: string): string {
    return encodeURIComponent(addr);
  }

  getStatusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: "Chờ tiếp nhận",
      ASSIGNED: "Đã điều phối",
      PROCESSING: "Đang thực hiện",
      COMPLETED: "Đã xong",
      FINISHED: "Hoàn tất",
      REJECTED: "Đã từ chối",
      SUPPLEMENT_REQUIRED: "Cần bổ sung",
      INCOMPLETE: "Chưa hoàn thành",
    };
    return map[status] || status;
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: "bg-red-100 text-red-800",
      ASSIGNED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-purple-100 text-purple-800",
      FINISHED: "bg-green-100 text-green-800",
      REJECTED: "bg-gray-100 text-gray-800",
      SUPPLEMENT_REQUIRED: "bg-orange-100 text-orange-800",
      INCOMPLETE: "bg-red-50 text-red-600",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  }

  getDeptColorClass(dept: string): string {
    switch (dept) {
      case "VSVN":
        return "bg-blue-500";
      case "VSNN":
        return "bg-purple-500";
      case "GPLD":
        return "bg-teal-500";
      default:
        return "bg-gray-400";
    }
  }

  getDeptTextColorClass(dept: string): string {
    switch (dept) {
      case "VSVN":
        return "text-blue-600";
      case "VSNN":
        return "text-purple-600";
      case "GPLD":
        return "text-teal-600";
      default:
        return "text-gray-600";
    }
  }

  getShipperHighlightClass(color: string | undefined | null): string {
    if (!color) return "";
    switch (color) {
      case "red":
        return "bg-red-50 hover:bg-red-100";
      case "blue":
        return "bg-blue-50 hover:bg-blue-100";
      case "yellow":
        return "bg-yellow-50 hover:bg-yellow-100";
      default:
        return "";
    }
  }
}
