'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

export default function OwnerSidebar() {
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

  const roleText = isMounted ? t('owner.sidebar.role') : 'Chủ nhà hàng / Owner';
  const restaurantText = isMounted ? t('owner.sidebar.restaurant') : 'Nhà hàng của tôi';
  const bookingsText = isMounted ? t('owner.sidebar.bookings') : 'Quản lý đặt bàn';
  const reviewsText = isMounted ? t('owner.sidebar.reviews') : 'Xem đánh giá';
  const logoutText = isMounted ? t('owner.sidebar.logout') : 'Đăng xuất';

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar__brand">
        <div className="db-sidebar__brand-logo">MESHI<span>MAP</span></div>
        <div className="db-sidebar__role">{roleText}</div>
      </div>

      <nav className="db-sidebar__nav">
        <Link
          href="/owners"
          className={`db-sidebar__link ${pathname === '/owners' ? 'is-active' : ''}`}
        >
          <span>{restaurantText}</span>
        </Link>
        <Link
          href="/owners/bookings"
          className={`db-sidebar__link ${pathname === '/owners/bookings' ? 'is-active' : ''}`}
        >
          <span>{bookingsText}</span>
        </Link>
        <Link
          href="/owners/reviews"
          className={`db-sidebar__link ${pathname === '/owners/reviews' ? 'is-active' : ''}`}
        >
          <span>{reviewsText}</span>
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
