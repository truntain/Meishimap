# 🍣 MESHIMAP — Hệ thống Tìm kiếm Nhà hàng Nhật Bản

> Dự án Frontend thuần (Vanilla HTML / CSS / JS) — Không dùng framework, không dùng Tailwind/Bootstrap.

---

## 📁 Cấu trúc thư mục

```
meshimap-html/
├── index.html                    # Trang chủ (Homepage)
│
├── pages/                        # Các trang chức năng
│   ├── login.html                # Đăng nhập
│   ├── register.html             # Đăng ký tài khoản
│   ├── search-results.html       # Kết quả tìm kiếm
│   ├── tim-kiem.html             # Trang tìm kiếm (phiên bản mở rộng)
│   ├── restaurant-detail.html    # Chi tiết nhà hàng + Đặt bàn
│   ├── dat-ban.html              # Trang đặt bàn riêng
│   ├── write-review.html         # Viết đánh giá nhà hàng
│   ├── profile.html              # Hồ sơ cá nhân người dùng
│   ├── owner-dashboard.html      # Dashboard Chủ nhà hàng (Role: Owner)
│   └── admin-dashboard.html      # Dashboard Quản trị viên (Role: Admin)
│
├── components/                   # Shared UI components (inject qua JS)
│   ├── header.html               # Header chung (nav, search, avatar)
│   └── footer.html               # Footer chung
│
├── css/
│   ├── style.css                 # Design system: CSS Variables, BEM classes
│   └── dashboard.css             # Styles riêng cho Owner/Admin Dashboard
│
├── js/
│   └── script.js                 # Logic toàn cục: Auth, Routing, Events, Forms
│
└── assets/
    └── images/                   # Ảnh tĩnh (hero, card, avatar...)
        ├── hero-bg-35c07e.png
        ├── restaurant-card-13d489.png
        ├── cta-bg.png
        └── user-profile-avatar.png
```

---

## 🔄 Luồng UI theo vai trò

### 👤 Role 1: User (Khách hàng)

```
[login.html] ←──────────────────────────────── [register.html]
     │  Đăng nhập thành công (email thường)
     ▼
[index.html]  ←── Trang chủ
     │  Nhập từ khóa → Submit search
     ▼
[search-results.html]  ←── Danh sách nhà hàng có filter/sort
     │  Click vào card nhà hàng
     ▼
[restaurant-detail.html]  ←── Chi tiết: ảnh, giờ, menu, đánh giá, đặt bàn
     │  Bấm "Viết đánh giá"
     ▼
[write-review.html]  ←── Form đánh giá (sao + nội dung)
     │  Submit thành công → quay về restaurant-detail.html
     ▼
[profile.html]  ←── Xem/Sửa hồ sơ cá nhân (qua User Menu trên header)
```

---

### 🏢 Role 2: Owner (Chủ nhà hàng)

```
[login.html]  ←── Nhập email chứa "owner" (vd: owner@meshimap.com)
     │  Đăng nhập thành công
     ▼
[owner-dashboard.html]  ←── Dashboard độc lập (không qua trang chủ)
     │
     ├── Tab: Quản lý nhà hàng  → Chỉnh sửa thông tin, ảnh, giờ mở cửa
     ├── Tab: Quản lý thực đơn  → Thêm / Sửa / Xóa món ăn
     ├── Tab: Quản lý đặt bàn   → Duyệt / Từ chối booking của khách
     ├── Tab: Xem đánh giá      → Phản hồi & Báo cáo vi phạm
     └── Tab: Xem trước         → Preview giao diện restaurant-detail.html
     │
     └── [Đăng xuất] → [login.html]
```

---

### 🛡️ Role 3: Admin (Quản trị viên)

```
[login.html]  ←── Nhập email chứa "admin" (vd: admin@meshimap.com)
     │  Đăng nhập thành công
     ▼
[admin-dashboard.html]  ←── Dashboard độc lập (không qua trang chủ)
     │
     ├── Tab: Thống kê & Báo cáo  → Biểu đồ doanh thu, tăng trưởng user (Chart.js)
     ├── Tab: Duyệt nhà hàng      → Phê duyệt / Từ chối đăng ký mới của Owner
     └── Tab: Báo cáo vi phạm     → Kiểm duyệt đánh giá bị báo cáo (ẩn / bỏ qua)
     │
     └── [Đăng xuất] → [login.html]
```

---

## 🔐 Hệ thống xác thực (Auth)

Xác thực được mô phỏng hoàn toàn qua **`localStorage`**, không có backend thực.

| Loại email đăng nhập | Vai trò được gán | Chuyển hướng đến |
|---|---|---|
| Chứa `"owner"` | `owner` | `owner-dashboard.html` |
| Chứa `"admin"` | `admin` | `admin-dashboard.html` |
| Email bất kỳ khác | `user` | `index.html` |

**Key localStorage:**
| Key | Mô tả |
|---|---|
| `meshimap_user` | Thông tin user đang đăng nhập (JSON) |
| `meshimap_restaurant` | Dữ liệu nhà hàng của Owner |
| `meshimap_bookings` | Booking do User tạo |
| `meshimap_bookings_db` | DB đặt bàn của Owner |
| `meshimap_reviews` | Đánh giá do User viết |
| `meshimap_pending_restaurants` | Danh sách nhà hàng chờ Admin duyệt |

---

## 🎨 Design System (`css/style.css`)

Toàn bộ màu sắc, font, spacing được khai báo qua **CSS Custom Properties** tại `:root`:

```css
--clr-primary:   #FD8A3E   /* Cam chính */
--clr-dark:      #6C2F00   /* Nâu đậm */
--clr-light:     #FFF8F5   /* Trắng kem */
--clr-cream:     #DAC2B6   /* Kem nhạt */
--clr-muted:     #54433A   /* Xám nâu */
--clr-border:    #E8D5C8   /* Viền */
--font-heading:  'Playfair Display'
--font-body:     'Be Vietnam Pro'
```

Các component BEM tái sử dụng: `.btn`, `.card`, `.header`, `.footer`, `.form-field`, `.badge`, `.modal`, `.search-bar`, `.chip`, ...

---

## ⚙️ Kiến trúc `js/script.js`

File JS duy nhất xử lý toàn bộ logic theo mô hình **Event Delegation**:

| Hàm | Chức năng |
|---|---|
| `initComponents()` | Inject header/footer vào trang qua `fetch()` |
| `handleLogin()` | Xử lý đăng nhập, phân role, redirect |
| `handleRegister()` | Xử lý đăng ký, lưu user vào localStorage |
| `handleLogout()` | Xóa session, chuyển về login.html |
| `handleSearch()` | Lấy từ khóa, redirect sang search-results |
| `handleBooking()` | Lưu đặt bàn vào localStorage |
| `handleReview()` | Lưu đánh giá vào localStorage |
| `handleProfileSubmit()` | Cập nhật thông tin hồ sơ |
| `updateHeaderAuthState()` | Cập nhật avatar/nút login trên header |
| `showUserMenu()` | Hiện dropdown menu người dùng |
| `initScrollAnimations()` | Hiệu ứng fade-in khi scroll |

---

## 🚀 Chạy demo

```bash
# Cài http-server (nếu chưa có)
npm install -g http-server

# Chạy server tại thư mục gốc dự án
cd meshimap-html
npx http-server . -p 5500 -o
```

Trình duyệt sẽ tự mở tại **`http://localhost:5500`**

### Tài khoản test nhanh:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| 👤 User | `user@example.com` | bất kỳ |
| 🏢 Owner | `owner@meshimap.com` | bất kỳ |
| 🛡️ Admin | `admin@meshimap.com` | bất kỳ |

---

## 🔗 Sơ đồ liên kết trang

```
                        ┌─────────────────┐
                        │   login.html    │◄────────────────────────┐
                        └────────┬────────┘                         │
                    ┌────────────┼────────────┐                     │
                    ▼            ▼            ▼                     │
           index.html    owner-dashboard  admin-dashboard      [logout]
          (User)         (Owner)          (Admin)
              │
    ┌─────────┴──────────┐
    ▼                    ▼
search-results.html   profile.html
    │
    ▼
restaurant-detail.html
    │              │
    ▼              ▼
write-review.html  dat-ban.html
```

---

> **Nguồn thiết kế:** [Figma MESHIMAP](https://www.figma.com/design/aznuuzfOCd4HbEk95SaYsx/MESHIMAP?node-id=0-1&p=f&m=dev)
