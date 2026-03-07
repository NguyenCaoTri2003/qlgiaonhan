CREATE TABLE `nhigia_logistics_orders` (
 `id` int(11) NOT NULL AUTO_INCREMENT, -- ID yêu cầu giao nhận
 `order_code` varchar(30) DEFAULT NULL, -- Mã yêu cầu giao nhận
 `create_date` bigint(20) DEFAULT NULL, -- Thời gian tạo yêu cầu (bigint(20))
 `creator` varchar(150) DEFAULT NULL, -- Người tạo yêu cầu
 `receiver` varchar(150) DEFAULT NULL, -- Email shipper được phân công
 `receiver_name` varchar(100) DEFAULT NULL, -- Tên shipper được phân công
 `department_id` int(11) DEFAULT NULL, -- ID phòng ban yêu cầu giao nhận
 `sender_name` varchar(100) DEFAULT NULL, -- Tên người gửi
 `sender_phone` varchar(20) DEFAULT NULL, -- Số điện thoại người gửi
 `time` varchar(10) DEFAULT NULL, -- Thời gian giao nhận
 `date` varchar(20) DEFAULT NULL, -- Ngày giao nhận
 `company` varchar(255) DEFAULT NULL, -- Công ty khách hàng
 `address` text DEFAULT NULL, -- Địa chỉ giao nhận
 `address_line` text DEFAULT NULL, -- Địa chỉ giao nhận

 `ward` varchar(100) DEFAULT NULL,
 `district` varchar(100) DEFAULT NULL,
 `province` varchar(100) DEFAULT NULL,

 `contact` varchar(100) DEFAULT NULL, -- Tên khách hàng liên hệ
 `phone` varchar(20) DEFAULT NULL, -- Số điện thoại khách hàng liên hệ
 `purpose` text DEFAULT NULL, -- Mục đích giao nhận
 `notes` text DEFAULT NULL, -- Ghi chú thêm về yêu cầu giao nhận
 `amount_vnd` double DEFAULT 0, -- Tiền VND
 `amount_usd` double DEFAULT 0, -- Tiền USD
 `missing_docs` text DEFAULT NULL, -- Giấy tờ thiếu (nếu có)
 `status` enum('PENDING','ASSIGNED','PROCESSING','SUPPLEMENT_REQUIRED','REJECTED','COMPLETED','FINISHED','INCOMPLETE') DEFAULT NULL, -- Trạng thái yêu cầu giao nhận
 `status_update_date` bigint(20) DEFAULT NULL, -- Thời gian cập nhật trạng thái (bigint(20))
 `completion_note` text DEFAULT NULL, -- Ghi chú khi hoàn thành yêu cầu giao nhận
 `rejection_reason` text DEFAULT NULL, -- Lý do từ chối yêu cầu giao nhận
 `supplement_note` text DEFAULT NULL, -- Ghi chú khi yêu cầu bổ sung thông tin
 `supplement_requester_name` varchar(100) DEFAULT NULL, -- Tên người yêu cầu bổ sung thông tin
 `supplement_date` bigint(20) DEFAULT NULL, -- Thời gian yêu cầu bổ sung thông tin (bigint(20))
 `request_note` text DEFAULT NULL, -- Ghi chú khi yêu cầu thông tin bổ sung
 `review_note` text DEFAULT NULL, -- Ghi chú khi xem xét yêu cầu giao nhận
 `admin_response` text DEFAULT NULL, -- Ghi chú phản hồi của admin
 `priority` enum('high','medium','normal','low') DEFAULT NULL, -- Mức độ ưu tiên yêu cầu giao nhận
 `sort_index` int(11) DEFAULT 0, -- Chỉ số sắp xếp yêu cầu giao nhận
 `shipper_highlight_color` enum('red','blue','yellow') DEFAULT NULL, -- Màu highlight cho shipper (nếu có)
 `created_at` timestamp NOT NULL DEFAULT current_timestamp(), -- Thời gian tạo yêu cầu giao nhận
 `external_id` int(11) DEFAULT NULL, -- ID yêu cầu giao nhận từ hệ thống bên ngoài 
 `source` varchar(50) DEFAULT 'NHIGIA', -- Nguồn tạo yêu cầu giao nhận (mặc định là 'NHIGIA')
 `customer_name` varchar(255) DEFAULT NULL, -- Tên khách hàng
 `contact_person` varchar(255) DEFAULT NULL, -- Người liên hệ
 `current_step` varchar(50) DEFAULT NULL, -- Bước hiện tại của quy trình giao nhận
 `external_department_id` int(11) DEFAULT NULL, -- ID phòng ban từ hệ thống bên ngoài 
 `external_company_id` int(11) DEFAULT NULL, -- ID công ty từ hệ thống bên ngoài
 `external_sender_id` int(11) DEFAULT NULL, -- ID người gửi từ hệ thống bên ngoài
 `external_status` varchar(20) DEFAULT NULL, -- Trạng thái yêu cầu giao nhận từ hệ thống bên ngoài
 `external_status_text` varchar(100) DEFAULT NULL, -- Mô tả trạng thái yêu cầu giao nhận từ hệ thống bên ngoài
 `shipper_id` int(11) DEFAULT NULL, -- ID shipper được phân công
 `updated_at` timestamp NULL DEFAULT NULL,
 PRIMARY KEY (`id`), 
 UNIQUE KEY `external_id` (`external_id`),
 UNIQUE KEY `order_code` (`order_code`),
 KEY `fk_orders_shipper` (`shipper_id`),
 KEY `fk_orders_department` (`department_id`),
 CONSTRAINT `fk_orders_department` FOREIGN KEY (`department_id`) REFERENCES `nhigia_logistics_departments` (`id`) ON DELETE SET NULL,
 CONSTRAINT `fk_orders_shipper` FOREIGN KEY (`shipper_id`) REFERENCES `nhigia_logistics_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4