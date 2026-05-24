import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { roleConfig, publicRoutes } from './config/roles';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các file tĩnh (ảnh, font, css...) và các request nội bộ của Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Đọc thông tin user từ Cookie (do Server/Edge có thể đọc)
  const userCookie = request.cookies.get('user');
  let user: { role: string } | null = null;

  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value));
    } catch {
      // Cookie bị lỗi, coi như chưa đăng nhập
    }
  }

  // Nếu trang là public route (/, /login, /register, ...)
  // Dùng startsWith để hỗ trợ cả dynamic routes (ví dụ: /restaurant/1, /search?q=...)
  const isPublic = publicRoutes.some(route =>
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );

  if (isPublic) {
    // Nếu đã đăng nhập rồi mà cố vào /login hoặc /register -> đá về trang chủ
    if ((pathname === '/login' || pathname === '/register') && user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Kiểm tra xem route hiện tại có nằm trong roleConfig không
  let allowedRoles: string[] | undefined = undefined;

  for (const [route, roles] of Object.entries(roleConfig)) {
    if (pathname.startsWith(route)) {
      allowedRoles = roles;
      break;
    }
  }

  // Nếu route cần bảo vệ (có trong roleConfig)
  if (allowedRoles) {
    // Chưa đăng nhập -> về trang đăng nhập
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Đăng nhập rồi nhưng Role không đủ quyền -> trang 403
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.rewrite(new URL('/403', request.url));
    }
  }

  return NextResponse.next();
}
