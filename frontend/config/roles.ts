// Định nghĩa danh sách các route cần bảo vệ và Role được phép truy cập
export const roleConfig: Record<string, string[]> = {
  // Các trang chỉ dành cho Quản trị viên
  '/admins': ['admin'],
  
  // Các trang chỉ dành cho Chủ nhà hàng
  '/owners': ['restaurant_owner'],
  
  // Các trang dành cho bất kỳ ai đã đăng nhập
  '/profile': ['customer', 'restaurant_owner', 'admin'],
};

// Các trang công khai (ai cũng vào được)
export const publicRoutes = ['/login', '/register', '/', '/search', '/restaurant', '/booking', '/about'];
