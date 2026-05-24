'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('user');
    localStorage.removeItem('meshimap_user');
    router.push('/login');
  };

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar__brand">
        <div className="db-sidebar__brand-logo">MESHI<span>MAP</span></div>
        <div className="db-sidebar__role">Quản trị viên / Admin</div>
      </div>
      
      <nav className="db-sidebar__nav">
        <Link 
          href="/admins" 
          className={`db-sidebar__link ${pathname === '/admins' ? 'is-active' : ''}`}
        >
          <span>Thống kê & Báo cáo</span>
        </Link>
        <Link 
          href="/admins/approvals" 
          className={`db-sidebar__link ${pathname === '/admins/approvals' ? 'is-active' : ''}`}
        >
          <span>Duyệt nhà hàng</span>
        </Link>
        <Link 
          href="/admins/reports" 
          className={`db-sidebar__link ${pathname === '/admins/reports' ? 'is-active' : ''}`}
        >
          <span>Báo cáo vi phạm</span>
        </Link>
      </nav>

      <div className="db-sidebar__footer">
        <button className="db-sidebar__link" onClick={handleLogout}>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
