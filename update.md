Nhiệm vụ: Bạn là một Kỹ sư Frontend Senior. Nhiệm vụ của bạn là đọc hiểu tài liệu đặc tả và mã nguồn hiện có để TIẾN HÀNH LẬP TRÌNH (CODE) các trang chức năng cho "Role 2: Chủ nhà hàng (Owner)" và "Role 3: Quản trị viên (Admin)".

YÊU CẦU CỐT LÕI VỀ STYLE CODE:
1. Hãy tự quét folder dự án để đọc và phân tích code của các trang thuộc "Role: User" đã làm xong.
2. Bạn phải tuân thủ CHÍNH XÁC 100% Style Guide của dự án: từ kiến trúc thư mục, cách quản lý State (Context/Redux/Zustand), cách xử lý Form/Validation, các thư viện UI Components đang dùng (Tailwind, AntD, Shadcn...), cho đến cách gọi API và bắt lỗi (Error Handling). Code mới cho Owner và Admin phải đồng bộ hoàn toàn với code User cũ.

Hãy đọc kỹ các yêu cầu nghiệp vụ dưới đây (hoặc đối chiếu với file update.md) để tiến hành viết code:

PHẦN I: CODE CÁC TRANG CHO CHỦ NHÀ HÀNG (OWNER - ROLE 2)
Sau khi qua trang Đăng nhập, lập trình các màn hình điều hướng từ Dashboard:
1. Trang Quản lý thông tin nhà hàng:
   - Form Thêm/Sửa thông tin chung (Tên, địa chỉ, hình ảnh...).
   - Module Thêm/Sửa/Xóa thực đơn (Menu): Quản lý tên món, giá, ảnh, phân loại.
   - Trường nhập liệu cập nhật giờ đóng/mở cửa và khu vực nhập thông tin hỗ trợ tiếng Nhật (JP Support).
2. Trang Quản lý đặt bàn:
   - Component Bảng (Table) hiển thị danh sách yêu cầu đặt bàn (Tên, SĐT, số người, thời gian, ghi chú).
   - Bộ lọc trạng thái (Chờ duyệt, Đã chấp nhận, Đã từ chối).
   - Thao tác: Nút Duyệt (Approve) và Từ chối (Reject) kèm modal nhập lý do.
3. Trang Xem đánh giá khách hàng:
   - List/Card hiển thị các review, số sao (Rating), bình luận từ user.
   - Thao tác: Bộ lọc số sao, ô nhập Phản hồi (Reply) và nút Báo cáo vi phạm (Report).
4. Trang Xem trước giao diện người dùng (User View/Preview):
   - Render một view mô phỏng (hoặc iframe) hiển thị trực quan trang nhà hàng dưới góc nhìn của khách hàng (Role 1) dựa trên data hiện tại của Owner.

PHẦN II: CODE CÁC TRANG CHO QUẢN TRỊ VIÊN (ADMIN - ROLE 3)
Lập trình các màn hình thuộc phân khu Admin:
1. Trang Thống kê & Dashboard:
   - Các thẻ (Cards) hiển thị số liệu tổng hợp (Tổng nhà hàng, user, lượt đặt bàn).
   - Tích hợp biểu đồ trực quan (Biểu đồ đường/cột) thể hiện Doanh thu hệ thống và Tăng trưởng người dùng theo thời gian.
2. Trang Kiểm duyệt & Phê duyệt nhà hàng:
   - Bảng danh sách các nhà hàng mới đăng ký đang ở trạng thái "Chờ duyệt" (Pending).
   - Modal xem chi tiết hồ sơ nhà hàng -> Thao tác: Nút Phê duyệt (Approve) / Từ chối (Reject) kèm logic tự động kích hoạt thông báo (Notification) kết quả cho Owner.
3. Trang Quản lý Review vi phạm:
   - Bảng danh sách các bình luận bị báo cáo (Reported).
   - Thao tác: Nút Ẩn/Xóa đánh giá (kích hoạt logic gửi cảnh báo đến user viết bài) hoặc nút Bỏ qua báo cáo.

ĐẦU RA YÊU CẦU:
- Tiến hành tạo mới các file code (.tsx/.jsx/.vue... tùy thuộc vào framework hiện tại của dự án) vào đúng cấu trúc thư mục của Owner và Admin.
- Viết code hoàn chỉnh, sạch sẽ, có comment giải thích logic rõ ràng, tuyệt đối không viết code giả (mockup trống) hay bỏ sót tính năng.
- Sau khi code xong, hãy liệt kê danh sách các file bạn đã tạo mới hoặc chỉnh sửa để tôi kiểm tra.