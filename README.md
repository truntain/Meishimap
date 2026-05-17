
# 🗺️ MEISHI MAP - Business Card Networking Platform

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
  <img src="https://nextjs.org/static/favicon/favicon-32x32.png" width="45" alt="Next.js Logo" style="margin: 0 20px;"/>
</p>

<p align="center">
  <b>Hệ thống quản lý và kết nối danh thiếp thông minh</b><br>
  Sử dụng sức mạnh của <i>Next.js</i> (Frontend) và <i>NestJS</i> (Backend).
</p>

---

## 📖 Giới thiệu Dự án
**MEISHI MAP** là nền tảng giúp số hóa việc trao đổi danh thiếp. Tên gọi lấy cảm hứng từ "Meishi" (名刺) trong tiếng Nhật có nghĩa là danh thiếp. Dự án cho phép người dùng quản lý các mối quan hệ chuyên nghiệp thông qua bản đồ tương tác và hồ sơ cá nhân hiện đại.

### ✨ Tính năng nổi bật
* **Quản lý danh thiếp:** Tạo và lưu trữ thông tin liên lạc kỹ thuật số.
* **Bản đồ tương tác:** Định vị các kết nối kinh doanh trên bản đồ.
* **Tối ưu hiệu năng:** Sử dụng Next.js App Router để đạt tốc độ tải trang nhanh nhất.
* **Kiến trúc bền vững:** Backend NestJS được xây dựng theo mô hình module, dễ bảo trì.

---

## 🏗️ Công nghệ sử dụng (Tech Stack)

### 🎨 Frontend
- **Framework:** Next.js (App Router)
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS
- **Font:** Geist (Tự động tối ưu hóa)

### ⚙️ Backend
- **Framework:** NestJS (Node.js)
- **Ngôn ngữ:** TypeScript
- **Cấu trúc:** Modular Architecture
- **API:** RESTful API

---

## 🚀 Hướng dẫn Cài đặt

### 1. Yêu cầu hệ thống
- **Node.js:** Phiên bản >= 18.x
- **NPM** hoặc **Yarn**

### 2. Cấu trúc thư mục
```text
meishi-map/
├── client/   # Thư mục mã nguồn Frontend (Next.js)
└── server/   # Thư mục mã nguồn Backend (NestJS)

```

### 3. Thiết lập Backend (Server)

Mở cửa sổ Terminal và chạy các lệnh sau:

```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt các thư viện cần thiết
npm install

# Chạy server ở chế độ phát triển (Development)
npm run start:dev

```

### 4. Thiết lập Frontend (Client)

Mở một cửa sổ Terminal mới và chạy các lệnh sau:

```bash
# Di chuyển vào thư mục client
cd client

# Cài đặt các thư viện cần thiết
npm install

# Chạy giao diện ở chế độ phát triển
npm run dev

```

Sau đó, truy cập ứng dụng tại: **http://localhost:3000**

---

## 🛠️ Các lệnh quan trọng (Scripts)

| Tính năng | Backend (NestJS) | Frontend (Next.js) |
| --- | --- | --- |
| **Phát triển** | `npm run start:dev` | `npm run dev` |
| **Build sản phẩm** | `npm run build` | `npm run build` |
| **Chạy Production** | `npm run start:prod` | `npm run start` |
| **Kiểm thử (Test)** | `npm run test` | `npm run lint` |

---

## 🌐 Triển khai (Deployment)

* **Frontend:** Khuyến nghị triển khai trên **Vercel** để tối ưu hóa tốt nhất cho Next.js.
* **Backend:** Có thể triển khai trên các dịch vụ hỗ trợ Node.js hoặc sử dụng **NestJS Mau** để đẩy lên AWS nhanh chóng.

> [!IMPORTANT]
> **Lưu ý về CORS:** Để Frontend có thể gọi API thành công, hãy đảm bảo bạn đã thêm `app.enableCors()` vào file `main.ts` của Backend.


