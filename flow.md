Vai trò: Bạn là một Senior Frontend Developer. Nhiệm vụ của bạn là chuyển đổi thiết kế từ file Figma thành hệ thống code HTML/CSS/JS thuần (Vanilla) pixel-perfect, có thể tương tác đầy đủ theo một luồng trải nghiệm người dùng (User Flow) cụ thể.

Nguồn dữ liệu: File Figma MESHIMAP tại địa chỉ: [https://www.figma.com/design/aznuuzfOCd4HbEk95SaYsx/MESHIMAP?node-id=0-1&p=f&m=dev](https://www.figma.com/design/aznuuzfOCd4HbEk95SaYsx/MESHIMAP?node-id=0-1&p=f&m=dev)

YÊU CẦU LUỒNG TƯƠNG TÁC (USER FLOW):
Tôi cần bạn thiết lập sẵn các liên kết (thông qua thẻ <a href="..."> hoặc JavaScript cơ bản) để kết nối các trang html tĩnh theo đúng luồng sau:

login.html (Đăng nhập) <---> Có nút chuyển qua lại với register.html (Đăng ký). Đăng nhập thành công chuyển tới index.html (Homepage).

index.html (Homepage).

Từ index.html, khi người dùng nhập vào thanh Search hoặc bấm nút Tìm kiếm -> Chuyển sang search-results.html (Kết quả tìm kiếm).

Tại search-results.html, khi click vào một Card nhà hàng bất kỳ -> Chuyển sang restaurant-detail.html (Trang chi tiết nhà hàng).

Tại restaurant-detail.html, khi bấm vào nút "Đánh giá" (hoặc Write Review) -> Chuyển sang write-review.html (Trang viết đánh giá).

KẾ HOẠCH TRIỂN KHAI (Hãy thực hiện tuần tự):

Bước 1: Khởi tạo Hệ thống (Core System)

Đọc toàn bộ Figma và xuất cho tôi file style.css tổng: Chứa toàn bộ CSS Variables (:root - màu sắc, font chữ, spacing) và các class UI dùng chung theo chuẩn BEM (Button, Card, Form Input, Header, Footer).

Đề xuất file script.js cấu trúc cơ bản chứa các hàm xử lý chung (như hàm xử lý form login giả lập chuyển trang, hoặc lưu trạng thái tìm kiếm vào localStorage nếu cần).

Bước 2: Xây dựng Cụm trang Xác thực (Auth)

Cung cấp toàn bộ mã HTML và CSS cụ thể cho 2 file: login.html và register.html. Đảm bảo nút điều hướng giữa 2 trang và nút Submit (dẫn về Homepage) hoạt động chuẩn logic.

Bước 3: Xây dựng Homepage & Search

(Tạm dừng và đợi tôi gõ "Tiếp tục Bước 3" trước khi làm phần này để tránh tràn bộ nhớ).

Cung cấp mã HTML/CSS cho index.html và search-results.html. Liên kết Form search ở Homepage sao cho khi submit sẽ mở trang Kết quả tìm kiếm.

Bước 4: Xây dựng Detail & Review

(Tạm dừng và đợi tôi gõ "Tiếp tục Bước 4").

Cung cấp mã HTML/CSS cho restaurant-detail.html và write-review.html. Đảm bảo các Card nhà hàng ở Bước 3 được link đúng bằng thẻ <a> tới trang Detail, và nút Đánh giá link tới trang Review.

Yêu cầu kỹ thuật:

Code thuần HTML, CSS, JS. Không dùng Tailwind/Bootstrap.

Code phải sạch, các component (như Header) nếu lặp lại hãy cấu trúc HTML thật chuẩn để sau này tôi dễ bóc tách thành React component.