import {
  Component,
  computed,
  inject,
  OnInit,
  input,
  output,
  signal,
  HostListener,
  effect,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from "@angular/forms";
import { Attachment, Order, SENDERS } from "../../type/models";
import { CustomerService } from "../../services/customer.service";
import { UsersService } from "../../services/users.service";
import { DepartmentService } from "../../services/department.service";
import { OrderService } from "../../services/order.service";
import { FormLabelComponent } from "../../app/shared/form-label.component";
import { ToastComponent } from "../../app/shared/toast/toast.component";

@Component({
  selector: "app-order-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormLabelComponent,
    ToastComponent,
  ],
  template: `
    <div class="bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <h2 class="text-xl font-bold text-gray-800 uppercase">
          {{ isEditMode() ? "Chỉnh Sửa Yêu Cầu" : "Tạo Yêu Cầu Mới" }}
        </h2>
        <button
          (click)="cancel.emit()"
          class="text-gray-500 hover:text-gray-700"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      @if (form) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Warning Notes -->
          @if (orderData()?.requestNote) {
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg
                    class="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-700">
                    <strong>Yêu cầu bổ sung:</strong>
                    {{ orderData()?.requestNote }}
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- SECTION 1: SENDER & DEPARTMENT (NEW) -->
          <div
            class="bg-blue-50 p-4 rounded border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <app-form-label
                label="Bộ phận"
                [control]="form.get('department')"
                [required]="true"
              ></app-form-label>
              <select
                formControlName="department"
                class="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              >
                @for (dept of departments(); track dept.id) {
                  <option [value]="dept.id">
                    {{ dept.name }}
                  </option>
                }
              </select>
            </div>
            <div>
              <app-form-label
                label="Người giao"
                [control]="form.get('senderName')"
                [required]="true"
              ></app-form-label>
              <div class="flex flex-col">
                <select
                  formControlName="senderName"
                  (change)="onSenderChange()"
                  class="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                >
                  <option value="">-- Chọn Người Giao --</option>
                  @for (sender of senders(); track sender.id) {
                    <option [value]="sender.name">{{ sender.name }}</option>
                  }
                </select>
                @if (selectedSenderPhone()) {
                  <a
                    [href]="'tel:' + selectedSenderPhone()"
                    class="text-xs text-blue-600 mt-1 font-medium flex items-center hover:underline"
                  >
                    📞 {{ selectedSenderPhone() }} (Bấm gọi ngay)
                  </a>
                }
              </div>
            </div>
          </div>

          <hr class="border-gray-200" />

          <!-- SECTION 2: CUSTOMER INFO -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Phone & Auto-fill -->
            <div>
              <app-form-label
                label="Số điện thoại"
                [control]="form.get('phone')"
                [required]="true"
              ></app-form-label>
              <div class="relative">
                <input
                  type="text"
                  formControlName="phone"
                  class="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-500]="
                    form.get('phone')?.invalid && form.get('phone')?.touched
                  "
                  placeholder="Nhập SĐT để tự động điền"
                />
                @if (isAutofilled()) {
                  <span class="absolute right-2 top-2 text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                }
                @if (form.get("phone")?.invalid && form.get("phone")?.touched) {
                  <p class="text-xs text-red-500 mt-1">
                    Vui lòng nhập số điện thoại
                  </p>
                }
              </div>
            </div>

            <!-- Company -->
            <div class="relative company-dropdown-wrapper">
              <app-form-label
                label="Tên công ty / Khách hàng"
                [control]="form.get('company')"
                [required]="true"
              ></app-form-label>

              <input
                type="text"
                formControlName="company"
                (input)="onCompanySearch($event)"
                (focus)="openDropdown()"
                class="w-full border rounded-md py-2 px-3 text-sm"
                placeholder="Nhập tên công ty để tìm kiếm..."
              />

              @if (showDropdown()) {
                <div
                  class="absolute z-50 bg-white border w-full max-h-60 overflow-y-auto shadow-lg rounded-md mt-1 text-sm"
                  (scroll)="onCompanyScroll($event)"
                >
                  @if (!currentKeyword()) {
                    <div class="p-3 text-gray-400 italic text-center">
                      🔎 Hãy nhập tên công ty để bắt đầu tìm kiếm...
                    </div>
                  }

                  @if (
                    currentKeyword() && companies().length === 0 && !isLoading()
                  ) {
                    <div class="p-3 text-gray-400 text-center">
                      Không tìm thấy công ty phù hợp
                    </div>
                  }

                  @for (cust of companies(); track cust.id) {
                    <div
                      class="px-3 py-2 hover:bg-blue-50 cursor-pointer transition text-[13px]"
                      (click)="selectCompany(cust)"
                    >
                      {{ cust?.company_name }}
                    </div>
                  }

                  @if (isLoading()) {
                    <div class="p-2 text-center text-gray-500 text-xs">
                      Đang tải dữ liệu...
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Address & Contact -->
          <div class="bg-gray-50 p-4 rounded border border-gray-100 space-y-3">
            <h4
              class="text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Địa chỉ giao nhận
            </h4>

            <div>
              <app-form-label
                label="Địa chỉ đầy đủ"
                [control]="form.get('addressLine')"
                [required]="true"
              ></app-form-label>

              <textarea
                formControlName="addressLine"
                rows="3"
                placeholder="Ví dụ: 186-188 Nguyễn Duy, Phường 9, Quận 8, TP.HCM"
                class="w-full border rounded-md py-3 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                [class.border-red-500]="
                  form.get('addressLine')?.invalid &&
                  form.get('addressLine')?.touched
                "
              ></textarea>
              @if (
                form.get("addressLine")?.invalid &&
                form.get("addressLine")?.touched
              ) {
                <p class="text-xs text-red-500 mt-1">
                  Vui lòng nhập địa chỉ đầy đủ để tạo link Google Maps
                </p>
              }
            </div>

            @if (form.get("addressLine")?.value) {
              <div
                class="text-[11px] text-gray-600 italic bg-white p-2 border rounded flex justify-between items-center"
              >
                <div class="truncate">
                  Link Google Maps sẽ được tạo:
                  <b class="ml-1">
                    {{ form.get("addressLine")?.value }}
                  </b>
                </div>

                <a
                  [href]="googleMapLink()"
                  target="_blank"
                  class="ml-3 text-blue-600 hover:underline font-semibold text-xs whitespace-nowrap"
                >
                  📍 Mở Google Maps
                </a>
              </div>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <app-form-label
                label="Người liên hệ (Gặp)"
                [control]="form.get('contact')"
                [required]="true"
              ></app-form-label>

              <input
                type="text"
                formControlName="contact"
                class="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Người sẽ gặp khi giao nhận"
                [class.border-red-500]="
                  form.get('contact')?.invalid && form.get('contact')?.touched
                "
              />

              @if (
                form.get("contact")?.invalid && form.get("contact")?.touched
              ) {
                <p class="text-xs text-red-500 mt-1">
                  Vui lòng nhập tên người liên hệ
                </p>
              }
            </div>
          </div>

          <!-- Time & Date -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Thời gian
                @if (isRequired("time")) {
                  <span class="text-red-500 ml-1">*</span>
                }
              </label>
              <input
                type="time"
                formControlName="time"
                class="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Ngày
                @if (isRequired("date")) {
                  <span class="text-red-500 ml-1">*</span>
                }
              </label>
              <input
                type="date"
                formControlName="date"
                class="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Purpose & Notes -->
          <div>
            <app-form-label
              label="Mục đích"
              [control]="form.get('purpose')"
              [required]="true"
            ></app-form-label>
            <input
              type="text"
              formControlName="purpose"
              class="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Vd: Giao hồ sơ, Lấy dấu..."
              [class.border-red-500]="
                form.get('purpose')?.invalid && form.get('purpose')?.touched
              "
            />
            @if (form.get("purpose")?.invalid && form.get("purpose")?.touched) {
              <p class="text-xs text-red-500 mt-1">
                Vui lòng nhập mục đích giao nhận
              </p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Ghi chú</label
            >
            <textarea
              formControlName="notes"
              rows="2"
              class="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Amounts -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Số tiền (VNĐ)</label
              >
              <input
                type="text"
                formControlName="amountVND"
                (input)="formatCurrency($event, 'amountVND')"
                class="w-full border rounded-md py-2 px-3 text-right font-mono"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Số tiền (USD)</label
              >
              <input
                type="text"
                formControlName="amountUSD"
                (input)="formatCurrency($event, 'amountUSD')"
                class="w-full border rounded-md py-2 px-3 text-right font-mono"
                placeholder="0"
              />
            </div>
          </div>

          @if (isVisaVN()) {
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- CẤP 1 -->
              <div>
                <label class="block text-sm font-bold mb-1">Loại Visa</label>
                <select
                  formControlName="visaType1"
                  class="w-full border rounded-md py-2 px-3 bg-white"
                >
                  <option [ngValue]="null">-- Chọn loại --</option>
                  @for (v of visaLevel1(); track v.id) {
                    <option [value]="v.id">{{ v.name }}</option>
                  }
                </select>
              </div>

              <!-- CẤP 2 -->
              <div>
                <label class="block text-sm font-bold mb-1">Chi tiết</label>
                <select
                  formControlName="visaType2"
                  class="w-full border rounded-md py-2 px-3 bg-white"
                >
                  <option [ngValue]="null">-- Chọn chi tiết --</option>
                  @for (v of visaLevel2(); track v.id) {
                    <option [value]="v.id">{{ v.name }}</option>
                  }
                </select>
              </div>
            </div>
          }

          <!-- New Attachments UI -->
          <div class="bg-white border rounded-lg overflow-hidden">
            <div
              class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
            >
              <label class="text-sm font-bold text-gray-700 uppercase"
                >Hồ sơ đính kèm</label
              >
              <button
                type="button"
                (click)="addNewAttachment()"
                class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm hover:bg-blue-700 font-bold"
              >
                +
              </button>
            </div>
            <!-- Uploaded Files Section -->
            @if (
              orderData()?.uploadedFiles &&
              orderData()!.uploadedFiles!.length > 0
            ) {
              <div class="mt-6">
                <h4
                  class="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest"
                >
                  Tài liệu đính kèm (File)
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (file of existingFiles(); track file.id) {
                    <div
                      class="p-3 border rounded-lg bg-gray-50 flex items-center justify-between group hover:border-blue-300 transition-colors transition-all duration-200"
                      [class.opacity-0]="file._deleting"
                    >
                      <div class="flex items-center gap-3 overflow-hidden">
                        <div
                          class="w-12 h-12 flex items-center justify-center overflow-hidden rounded border bg-white"
                        >
                          @if (file.type.includes("image")) {
                            <img
                              [src]="file.data"
                              alt="preview"
                              class="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                            />
                          } @else {
                            <span class="text-xl">
                              {{ file.type.includes("pdf") ? "📕" : "📄" }}
                            </span>
                          }
                        </div>
                        <div class="flex flex-col overflow-hidden">
                          <span class="text-xs font-bold truncate">{{
                            file.name
                          }}</span>
                          <span class="text-[8px] text-gray-400 uppercase">{{
                            file.type.split("/")[1] || "FILE"
                          }}</span>
                        </div>
                      </div>
                      <a
                        [href]="file.data"
                        [download]="file.name"
                        class="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </a>
                      <button
                        type="button"
                        (click)="removeExistingFile(file)"
                        class="text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

            <div class="p-4 space-y-3">
              <div
                *ngFor="let att of customAttachments(); let i = index"
                class="flex items-center gap-3 animate-fade-in group"
              >
                <input
                  type="checkbox"
                  [checked]="att.checked"
                  (change)="toggleCustomAtt(i)"
                  class="w-4 h-4 text-blue-600 rounded"
                />
                <div class="flex-1">
                  <input
                    type="text"
                    [(ngModel)]="att.name"
                    [ngModelOptions]="{ standalone: true }"
                    placeholder="Tên hồ sơ..."
                    class="w-full border-b border-gray-200 focus:border-blue-500 outline-none text-sm py-1 font-medium bg-transparent"
                  />
                </div>
                <div class="flex items-center border rounded h-8">
                  <button
                    type="button"
                    (click)="updateCustomQty(i, -1)"
                    class="px-2 py-1 bg-gray-50 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span class="px-3 text-xs font-mono font-bold">{{
                    att.qty
                  }}</span>
                  <button
                    type="button"
                    (click)="updateCustomQty(i, 1)"
                    class="px-2 py-1 bg-gray-50 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  (click)="removeCustomAtt(i)"
                  class="text-red-400 hover:text-red-600 font-bold px-2"
                >
                  X
                </button>
              </div>
              <div
                *ngIf="customAttachments.length === 0"
                class="text-center py-4 text-gray-400 text-xs italic border-2 border-dashed rounded"
              >
                Bấm "+" để thêm hồ sơ cần bàn giao.
              </div>
            </div>
          </div>

          <!-- File Upload Framework -->
          <div class="bg-white border rounded-lg overflow-hidden">
            <div
              class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
            >
              <label class="text-sm font-bold text-gray-700 uppercase"
                >Tài liệu bổ sung (PDF, Ảnh, Word)</label
              >
            </div>
            <div class="p-4">
              <div
                class="relative border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer group"
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,image/*"
                  (change)="onFilesUploaded($event)"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-10 w-10 text-gray-400 mb-2 group-hover:text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p class="text-xs text-gray-500">
                  Chọn hoặc kéo thả tệp vào đây
                </p>
                <p class="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                  Hỗ trợ File PDF, Hình ảnh, Word (.doc, .docx) và kích thước
                  tối đa 5MB mỗi file
                </p>
              </div>

              @if (uploadedFileList().length > 0) {
                <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (file of uploadedFileList(); track $index) {
                    <div
                      class="flex items-center justify-between p-2 bg-gray-50 rounded border text-xs border-gray-100 group"
                    >
                      <div class="flex items-center gap-2 truncate">
                        <span class="text-blue-500">📎</span>
                        <span class="truncate font-medium">{{
                          file.name
                        }}</span>
                        <span class="text-[8px] text-gray-400 uppercase"
                          >({{ file.type }})</span
                        >
                      </div>
                      <button
                        type="button"
                        (click)="removeUploadedFile($index)"
                        class="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Actions -->
          <div
            class="flex items-center justify-end space-x-4 pt-4 border-t mt-4"
          >
            <button
              type="button"
              (click)="cancel.emit()"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 uppercase tracking-tight"
            >
              {{ isEditMode() ? "Cập Nhật" : "Tạo Yêu Cầu" }}
            </button>
          </div>
        </form>
        <app-toast></app-toast>
      }
    </div>
  `,
})
export class OrderFormComponent implements OnInit {
  @ViewChild(ToastComponent) toast!: ToastComponent;

  orderData = input<Order | null>(null);
  save = output<Partial<Order>>();
  cancel = output<void>();

  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);

  form!: FormGroup;
  customers = this.customerService.customers;

  private departmentService = inject(DepartmentService);
  departments = this.departmentService.departments;

  private usersService = inject(UsersService);
  senders = signal<any[]>([]);

  private orderService = inject(OrderService);

  uploadedFileList = signal<File[]>([]);

  selectedAttachments = signal<Map<string, number>>(new Map());
  isAutofilled = signal(false);
  selectedSenderPhone = signal("");

  isEditMode = computed(() => !!this.orderData());

  private defaultDepartmentEffect = effect(() => {
    const list = this.departments();
    const isEdit = this.isEditMode();

    if (!this.form || isEdit) return;

    if (list?.length && !this.form.get("department")?.value) {
      const defaultDept = list.find((d: any) => Number(d.is_default) === 1);

      if (defaultDept) {
        this.form.patchValue({
          department: defaultDept.id,
        });
      }
    }
  });

  companies = signal<any[]>([]);
  showDropdown = signal(false);
  isLoading = signal(false);
  currentPage = signal(1);
  hasMore = signal(true);
  currentKeyword = signal("");
  isSelectedFromDropdown = signal(false);
  visaLevel1 = signal<any[]>([]);
  visaLevel2 = signal<any[]>([]);
  isVisaVN = signal(false);
  googleMapLink = signal("");

  existingFiles = signal<any[]>([]);
  filesToDelete = signal<number[]>([]);

  private el = inject(ElementRef);

  customAttachments = signal<{ name: string; qty: number; checked: boolean }[]>(
    [],
  );

  isRequired(controlName: string) {
    const control = this.form.get(controlName);
    if (!control) return false;
    return control.hasValidator(Validators.required);
  }

  ngOnInit() {
    const data = this.orderData();

    if (data && data.attachments) {
      this.customAttachments.set(data.attachments.map((a) => ({ ...a })));
    }

    // if (data && data.uploadedFiles) {
    //   this.uploadedFileList.set([...(data.uploadedFiles as any)]);
    // }

    if (data && data.uploadedFiles) {
      this.existingFiles.set([...(data.uploadedFiles as any)]);
    }

    if (data && data.senderPhone) {
      this.selectedSenderPhone.set(data.senderPhone);
    }

    this.form = this.fb.group({
      department: [data?.department?.id || null, Validators.required],
      senderName: [data?.senderName || "", Validators.required],
      phone: [data?.phone || "", Validators.required],
      company: [data?.company || "", Validators.required],
      addressLine: [data?.addressLine || "", Validators.required],
      contact: [data?.contact || "", Validators.required],
      time: [data?.time || "08:00", Validators.required],
      date: [
        data?.date || new Date().toISOString().split("T")[0],
        Validators.required,
      ],
      purpose: [data?.purpose || "", Validators.required],
      notes: [data?.notes || ""],
      amountVND: [data?.amountVND ? this.formatNumber(data.amountVND) : ""],
      amountUSD: [data?.amountUSD ? this.formatNumber(data.amountUSD) : ""],
    });

    this.form.get("addressLine")?.valueChanges.subscribe((val) => {
      if (!val) {
        this.googleMapLink.set("");
        return;
      }

      const encoded = encodeURIComponent(val);
      this.googleMapLink.set(
        `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      );
    });

    this.usersService.getSenders().subscribe((res) => {
      this.senders.set(res);
    });

    this.departmentService.loadDepartments();

    this.form.get("department")?.valueChanges.subscribe((deptId) => {
      if (!deptId) return;

      const dept = this.departments().find((d) => d.id == deptId);
      if (!dept) return;

      // reset
      this.visaLevel1.set([]);
      this.visaLevel2.set([]);
      this.customAttachments.set([]);

      if (dept.code === "VSVN") {
        this.isVisaVN.set(true);

        this.departmentService
          .getAttachmentsByDepartment(dept.external_id)
          .subscribe((res) => {
            this.visaLevel1.set(res);
          });
      } else {
        this.isVisaVN.set(false);

        this.departmentService
          .getAttachmentsByDepartment(dept.external_id)
          .subscribe((res) => {
            const mapped = res.map((item: any) => ({
              name: item.name,
              qty: 1,
              checked: false,
              external_profile_id: item.id ?? null,
            }));

            this.customAttachments.set(mapped);
          });
      }
    });

    //
    this.form.addControl("visaType1", this.fb.control(null));
    this.form.addControl(
      "visaType2",
      this.fb.control({ value: null, disabled: true }),
    );

    this.form.get("visaType1")?.valueChanges.subscribe((typeId) => {
      if (!typeId) {
        this.form.get("visaType2")?.reset();
        this.form.get("visaType2")?.disable();
        return;
      }

      const dept = this.departments().find(
        (d) => d.id == this.form.get("department")?.value,
      );

      const externalId = dept?.external_id;

      this.visaLevel2.set([]);
      this.customAttachments.set([]);

      this.departmentService
        .getVisaVNTypeByDepartment(externalId, typeId)
        .subscribe((res) => {
          this.visaLevel2.set(res);

          if (res.length > 0) {
            this.form.get("visaType2")?.enable();
          }
        });
    });

    //
    this.form.get("visaType2")?.valueChanges.subscribe((detailId) => {
      if (!detailId) return;

      const dept = this.departments().find(
        (d) => d.id == this.form.get("department")?.value,
      );

      const externalId = dept?.external_id;
      const typeId = this.form.get("visaType1")?.value;

      this.departmentService
        .getVisaVNTypeDetailsByDepartment(externalId, typeId, detailId)
        .subscribe((res) => {
          const mapped = res
            .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              qty: item.quantity ?? 1,
              checked: false,
            }));

          this.customAttachments.set(mapped);
        });
    });
  }

  loadCompanies() {
    if (!this.hasMore()) return;

    this.isLoading.set(true);

    this.customerService
      .searchCompanies(this.currentKeyword(), this.currentPage())
      .subscribe((res: any) => {
        const newData = res.data || [];

        if (newData.length === 0) {
          this.hasMore.set(false);
        } else {
          this.companies.update((list) => [...list, ...newData]);
        }

        this.isLoading.set(false);
      });
  }

  onCompanyScroll(event: any) {
    const element = event.target;

    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 10) {
      if (!this.isLoading() && this.hasMore()) {
        this.currentPage.update((p) => p + 1);
        this.loadCompanies();
      }
    }
  }

  selectCompany(cust: any) {
    this.form.patchValue({
      company: cust?.company_name || "",
      addressLine: cust?.address || "",
      contact: cust?.contact || "",
      phone: cust?.phone || "",
    });

    this.isSelectedFromDropdown.set(true);
    this.showDropdown.set(false);
  }

  combinedAddress = computed(() => {
    return this.form?.get("addressLine")?.value || "";
  });

  onCompanySearch(event: any) {
    const keyword = event.target.value;
    this.currentKeyword.set(keyword);
    this.currentPage.set(1);
    this.hasMore.set(true);
    this.companies.set([]);

    if (keyword.length < 1) return;

    this.loadCompanies();
  }

  openDropdown() {
    this.showDropdown.set(true);
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  @HostListener("document:click", ["$event"])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest(".company-dropdown-wrapper")) {
      this.showDropdown.set(false);
    }
  }

  onProvinceChange(event: any) {
    this.form.get("district")?.setValue("");
  }

  onDistrictChange(event: any) {}

  onSenderChange() {
    const name = this.form.get("senderName")?.value;
    const sender = this.senders().find((s) => s.name === name);
    this.selectedSenderPhone.set(sender ? sender.phone : "");
  }

  onCompanyChange() {
    const company = this.form.get("company")?.value;
    if (company) {
      const customer = this.customerService.findCustomerByCompany(company);
      if (customer) {
        this.fillCustomerData(customer);
      }
    }
  }

  fillCustomerData(customer: any) {
    this.form.patchValue({
      company: customer.company,
      addressLine: customer.address,
      contact: customer.contact,
      phone: customer.phone,
    });
    this.isAutofilled.set(true);
    setTimeout(() => this.isAutofilled.set(false), 2000);
  }

  addNewAttachment() {
    this.customAttachments.update((attachments) => [
      ...attachments,
      { name: "", qty: 1, checked: false },
    ]);
  }

  toggleCustomAtt(index: number) {
    this.customAttachments.update((attachments) => {
      const updated = [...attachments];
      updated[index].checked = !updated[index].checked;
      return updated;
    });
  }

  updateCustomQty(index: number, delta: number) {
    this.customAttachments.update((attachments) => {
      const updated = [...attachments];
      updated[index].qty = Math.max(1, updated[index].qty + delta);
      return updated;
    });
  }

  removeCustomAtt(index: number) {
    this.customAttachments.update((attachments) =>
      attachments.filter((_, i) => i !== index),
    );
  }

  removeExistingFile(file: any) {
    this.filesToDelete.update((list) => [...list, file.id]);

    this.existingFiles.update((list) =>
      list.map((f) => (f.id === file.id ? { ...f, _deleting: true } : f)),
    );

    setTimeout(() => {
      this.existingFiles.update((list) => list.filter((f) => f.id !== file.id));
    }, 200);
  }

  onFilesUploaded(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    const newFiles = Array.from(input.files);

    const validFiles = newFiles.filter((file) => {
      const isValidType =
        allowedTypes.includes(file.type) ||
        allowedImageTypes.includes(file.type);

      const isValidSize = file.size <= MAX_SIZE;

      return isValidType && isValidSize;
    });

    if (validFiles.length !== newFiles.length) {
      this.toast.show(
        "Chỉ được upload PDF, Word, hình ảnh và <= 5MB!",
        "error",
      );
    }

    this.uploadedFileList.update((list) => [...list, ...validFiles]);

    input.value = "";
  }

  removeUploadedFile(index: number) {
    this.uploadedFileList.update((list) => list.filter((_, i) => i !== index));
  }

  formatNumber(val: number): string {
    return new Intl.NumberFormat("en-US").format(val);
  }

  formatCurrency(event: any, controlName: string) {
    let val = event.target.value.replace(/,/g, "");
    if (!isNaN(val) && val !== "") {
      const formatted = this.formatNumber(parseInt(val));
      this.form.get(controlName)?.setValue(formatted, { emitEvent: false });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const formVal = this.form.value;

    const dept = this.departments().find(
      (d: any) => d.id == formVal.department,
    );

    const deptcode = dept?.code || "";

    const attachments = this.customAttachments()
      .filter((a) => a.name.trim() !== "")
      .map((a: any) => ({
        name: a.name.trim(),
        qty: a.qty ?? 1,
        checked: a.checked ? 1 : 0,
        external_profile_id: a.external_profile_id ?? null,
        external_visa_type_id: formVal.visaType1 ?? null,
        external_visa_detail_id: formVal.visaType2 ?? null,
      }));

    console.log("FORM VALUE:", formVal);
    console.log("ATTACHMENTS:", attachments);

    const payload: any = {
      department_id: formVal.department,
      external_department_id: dept?.external_id ?? null,

      external_visa_type_id: formVal.visaType1 ?? null,
      external_visa_detail_id: formVal.visaType2 ?? null,
      sender_name: formVal.senderName,
      sender_phone: this.selectedSenderPhone(),
      company: formVal.company,
      address: formVal.addressLine,
      address_line: formVal.addressLine,
      contact: formVal.contact,
      phone: formVal.phone,
      time: formVal.time,
      date: formVal.date,
      purpose: formVal.purpose,
      notes: formVal.notes,
      amount_vnd: formVal.amountVND
        ? parseInt(formVal.amountVND.replace(/,/g, ""))
        : 0,
      amount_usd: formVal.amountUSD
        ? parseInt(formVal.amountUSD.replace(/,/g, ""))
        : 0,
      attachments,
      profile_code: deptcode,
    };

    console.log("Dữ liệu gửi đi:", payload);

    payload.files_to_delete = this.filesToDelete();

    const formData = new FormData();

    formData.append("data", JSON.stringify(payload));

    const hasNewFiles = this.uploadedFileList().length > 0;

    if (hasNewFiles) {
      this.uploadedFileList().forEach((file: File) => {
        formData.append("files", file);
      });
    }

    if (this.isEditMode()) {
      const id = this.orderData()?.id;

      if (!id) return;

      this.orderService.updateOrder(id, formData).subscribe({
        next: () => {
          this.toast.show("Cập nhật yêu cầu giao nhận thành công", "success");

          setTimeout(() => {
            this.cancel.emit();
          }, 1200);
        },
        error: (err) => {
          console.error(err);
          this.toast.show("Có lỗi khi cập nhật yêu cầu giao nhận", "error");
        },
      });
    } else {
      this.orderService.addOrder(formData).subscribe({
        next: () => {
          this.toast.show("Tạo yêu cầu giao nhận thành công", "success");

          setTimeout(() => {
            this.cancel.emit();
          }, 1200);
        },
        error: (err) => {
          console.error(err);
          this.toast.show("Có lỗi khi tạo yêu cầu giao nhận", "error");
        },
      });
    }
  }
}
