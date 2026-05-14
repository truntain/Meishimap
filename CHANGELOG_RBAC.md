# LỊCH SỬ THAY ĐỔI (CHANGELOG) - CHUYỂN ĐỔI RBAC BẰNG MIDDLEWARE/PROXY

File này liệt kê toàn bộ các thay đổi mà mình đã thực hiện để chuyển đổi hệ thống phân quyền của ứng dụng sang cơ chế bảo mật trên máy chủ (Edge Runtime) của Next.js bằng Cookies và Proxy (phiên bản thay thế của Middleware trên Next 16).

---

## 1. Các Thư Viện Đã Cài Đặt
- **`js-cookie` và `@types/js-cookie`**: Cài đặt vào `frontend` để có thể ghi/đọc/xóa Cookie ở môi trường Client (Trình duyệt) một cách dễ dàng, giúp dữ liệu đồng bộ mượt mà với Proxy trên Server.

## 2. Các File Đã Xóa Bỏ
Mình đã dọn dẹp các logic kiểm tra quyền bằng Client-side (vừa chậm vừa kém bảo mật):
- ❌ **`frontend/components/AuthGuard.tsx`**: Đã bị xóa hoàn toàn.
- ❌ **`frontend/app/(protected)/layout.tsx`**: Đã bị xóa vì chức năng "bọc" (wrap) các trang cần bảo vệ đã được chuyển giao lên tầng cao nhất là `proxy.ts`.

## 3. Các File Đã Cập Nhật (Sửa Đổi)

### `frontend/app/(login)/login/page.tsx`
- **Thêm import**: `import Cookies from 'js-cookie';`
- **Sửa logic lưu Token**: 
  - Gỡ bỏ `localStorage.setItem('access_token', ...)` và `localStorage.setItem('user', ...)`.
  - Thay bằng `Cookies.set('access_token', ...)` và `Cookies.set('user', ...)` với thời hạn lưu là 7 ngày.

### `frontend/components/Header.tsx`
- **Thêm import**: `import Cookies from 'js-cookie';`
- **Sửa logic đọc User**: 
  - Thay vì `localStorage.getItem('user')`, bây giờ Header sẽ lấy trạng thái qua `Cookies.get('user')`.
- **Sửa logic Đăng Xuất (`handleLogout`)**: 
  - Gỡ bỏ `localStorage.removeItem(...)`.
  - Thay bằng `Cookies.remove('user')` và `Cookies.remove('access_token')`.

## 4. Các File Tạo Mới Hoàn Toàn

### `frontend/config/roles.ts`
- Là "Trái tim" của hệ thống phân quyền mới. Tại đây khai báo các hằng số:
  - `roleConfig`: Object quy định đường dẫn nào thì Role nào được vào. Ví dụ `/admin` dành cho `['quản lý']`, `/profile` dành cho cả 3 role.
  - `publicRoutes`: Danh sách các đường dẫn không cần bảo vệ (như `/login`, `/register`, `/`).

### `frontend/proxy.ts` (Thay cho `middleware.ts` ở Next 16)
- **Nhiệm vụ**: Chạy trước mọi Request (HTTP) từ người dùng.
- **Quy trình hoạt động**:
  1. Đọc cookie `user`.
  2. Bỏ qua các file tĩnh (như hình ảnh, css) và các trang public (như đăng nhập, đăng ký).
  3. Kiểm tra xem người dùng đang cố vào trang nào (so với `roleConfig`).
  4. Nếu là trang cần bảo vệ:
     - Chưa đăng nhập (không có cookie) -> **Đá về `/login`**.
     - Có đăng nhập nhưng Role không nằm trong mảng cho phép -> **Điều hướng ngầm tới `/403`**.

### `frontend/app/403/page.tsx`
- Trang giao diện báo lỗi "403 - Cấm Truy Cập". Sẽ hiển thị một thông báo đỏ rực báo cho người dùng biết họ không có quyền hạn vào trang này và cho nút để "Về Trang Chủ".

---

**GHI CHÚ KỸ THUẬT QUAN TRỌNG:**
Với Next.js phiên bản 16, việc sử dụng tên file `middleware.ts` đã chính thức bị **Khai Tử (Deprecated)** và bắt buộc sử dụng tên file là **`proxy.ts`**. Đồng thời, bên trong phải `export default function proxy()`. Việc này gây ra lỗi "Cannot find middleware module" như bạn vừa gặp, nhưng mình đã đổi thành `proxy.ts` và export default chuẩn quy tắc mới nhất của Next.js 16.2.6 rồi.
