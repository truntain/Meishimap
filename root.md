Vai trò: Bạn là một Chuyên gia Frontend Developer chuyên cắt HTML/CSS/JS thuần từ thiết kế với độ chính xác Pixel-Perfect và thiết kế logic hệ thống bài bản.

Nhiệm vụ: Tôi có file Figma dự án "MESHIMAP" tại địa chỉ: [https://www.figma.com/design/aznuuzfOCd4HbEk95SaYsx/MESHIMAP?node-id=0-1&p=f&m=dev](https://www.figma.com/design/aznuuzfOCd4HbEk95SaYsx/MESHIMAP?node-id=0-1&p=f&m=dev). Hãy đọc toàn bộ file này và viết code HTML, CSS, JS thuần theo các bước chuyên nghiệp sau:

Bước 1. Trích xuất Global Styles (CSS Variables):
Quét thiết kế và tạo file style.css. Khai báo ở :root tất cả biến CSS: Bảng màu (Primary, Secondary, Neutral...), Typography (Font, size, weight), Spacing và Border-radius.

Bước 2. Xây dựng Reusable CSS Classes (BEM):
Phân tích các component lặp lại (Button, Card, Input, Header, Footer) và viết CSS dùng chung theo chuẩn BEM (.block__element--modifier). Tuyệt đối không dùng framework (như Bootstrap/Tailwind), chỉ dùng CSS thuần.

Bước 3. Cắt HTML từng trang:
Viết HTML Semantic cho 2 trang quan trọng nhất trước (ví dụ: Trang chủ và Trang chi tiết). Lắp ráp các class đã tạo ở Bước 2 vào. Kích thước, margin, padding phải khớp 100% với Figma.

Bước 4. Thiết lập Liên kết Logic chuẩn (Standard Logic Linking):
Đây là phần rất quan trọng để hệ thống hoạt động trơn tru:

Routing (Luồng điều hướng): Thiết lập thẻ <a href="..."> chính xác giữa các trang html để user có thể click chuyển trang theo đúng flow trong Figma.

Data Attributes cho JS: Tuyệt đối không dùng class CSS (như .btn, .menu) để gán sự kiện JavaScript. Hãy dùng các attribute như data-action="open-menu", data-target="#modal-1" để tách biệt hoàn toàn giao diện (CSS) và logic (JS).

Quản lý Component chung: Đề xuất logic gộp Header/Footer (ví dụ: dùng một hàm JS nhỏ để fetch('/header.html') chèn vào các trang, giúp tôi không phải copy-paste HTML Header nhiều lần).

Bước 5. Xử lý logic tương tác (Vanilla JS):
Viết file script.js xử lý các DOM events dựa trên các data-action đã định nghĩa ở Bước 4 (ví dụ: Đóng/mở Sidebar, hiển thị Popup, Tab navigation).

Hãy bắt đầu bằng việc phân tích tổng quan dự án MESHIMAP, sau đó in ra Bước 1 và Bước 2 trước nhé!