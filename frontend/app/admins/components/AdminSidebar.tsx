'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    Cookies.remove('user');
    localStorage.removeItem('meshimap_user');
    router.push('/login');
  };

  const roleText = isMounted ? t('admin.sidebar.role') : 'Quản trị viên / Admin';
  const statsText = isMounted ? t('admin.sidebar.stats') : 'Thống kê & Báo cáo';
  const approvalsText = isMounted ? t('admin.sidebar.approvals') : 'Duyệt nhà hàng';
  const reportsText = isMounted ? t('admin.sidebar.reports') : 'Báo cáo vi phạm';
  const logoutText = isMounted ? t('admin.sidebar.logout') : 'Đăng xuất';

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar__brand">
        <div className="db-sidebar__brand-logo">MESHI<span>MAP</span></div>
        <div className="db-sidebar__role">{roleText}</div>
      </div>
      
      <nav className="db-sidebar__nav">
        <Link 
          href="/admins" 
          className={`db-sidebar__link ${pathname === '/admins' ? 'is-active' : ''}`}
        >
          <span>{statsText}</span>
        </Link>
        <Link 
          href="/admins/approvals" 
          className={`db-sidebar__link ${pathname === '/admins/approvals' ? 'is-active' : ''}`}
        >
          <span>{approvalsText}</span>
        </Link>
        <Link 
          href="/admins/reports" 
          className={`db-sidebar__link ${pathname === '/admins/reports' ? 'is-active' : ''}`}
        >
          <span>{reportsText}</span>
        </Link>
      </nav>

      <div className="db-sidebar__footer">
        <button className="db-sidebar__link" onClick={handleLogout}>
          <span>{logoutText}</span>
        </button>
      </div>
    </aside>
  );
}
