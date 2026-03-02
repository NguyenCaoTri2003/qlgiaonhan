export interface Job {
    id: string;
    status: 'Chờ tiếp nhận' | 'Đã điều phối' | 'Đang xử lý' | 'Bổ sung' | 'Từ chối nhận' | 'xử lý Xong' | 'Hoàn tất' | 'Chưa hoàn thành';
    priorityColor: 'Red' | 'Yellow' | 'Blue' | 'White';
    assignedTo: string; // Ví dụ: "Trung Hiếu"
    purpose: 'Giao Hồ Sơ' | 'Lấy Hồ Sơ' | 'Thu Tiền' | 'Nộp Hồ Sơ';

    // Các trường bổ sung theo yêu cầu của bạn
    amountVND?: number;
    amountUSD?: number;
    attachments: { name: string; quantity: number }[]; // Danh sách hồ sơ động

    // Dữ liệu xác nhận khi DONE
    gpsLocation?: { lat: number; lng: number };
    signatureImage?: string; // Lưu dạng Base64 hoặc URL
    images?: string[]; // Mảng chứa các file hình ảnh/PDF

    reason?: string; // Lưu lý do "Từ chối" hoặc "Chưa hoàn thành"
    sortOrder: number; // Dùng để lưu vị trí sắp xếp của NVGN
}