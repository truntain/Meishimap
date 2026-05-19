// Định nghĩa danh sách các route cần bảo vệ và Role được phép truy cập
// Bạn có thể thêm bất kỳ đường dẫn nào vào đây và cấu hình mảng role cho phép.
export const roleConfig: Record<string, string[]> = {
  // Các trang chỉ dành cho Quản lý
  '/admin': ['quản lý'],
  
  // Các trang chỉ dành cho Chủ nhà hàng
  '/manager': ['chủ nhà hàng'],
  
  // Các trang dành cho bất kỳ ai đã đăng nhập
  '/profile': ['khách hàng', 'quản lý', 'chủ nhà hàng'],
};

// Các trang công khai (ai cũng vào được)
export const publicRoutes = ['/login', '/register', '/', '/search', '/restaurant', '/booking'];
