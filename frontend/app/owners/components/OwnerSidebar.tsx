'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = () => {
    Cookies.remove('user');
    localStorage.removeItem('meshimap_user');
    router.push('/login');
  };

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar__brand">
        <div className="db-sidebar__brand-logo">MESHI<span>MAP</span></div>
        <div className="db-sidebar__role">{t('owner.sidebar.role')}</div>
      </div>

      <nav className="db-sidebar__nav">
        <Link
          href="/owners"
          className={`db-sidebar__link ${pathname === '/owners' ? 'is-active' : ''}`}
        >
          <span>{t('owner.sidebar.restaurant')}</span>
        </Link>
        <Link
          href="/owners/bookings"
          className={`db-sidebar__link ${pathname === '/owners/bookings' ? 'is-active' : ''}`}
        >
          <span>{t('owner.sidebar.bookings')}</span>
        </Link>
        <Link
          href="/owners/reviews"
          className={`db-sidebar__link ${pathname === '/owners/reviews' ? 'is-active' : ''}`}
        >
          <span>{t('owner.sidebar.reviews')}</span>
        </Link>
      </nav>

      <div className="db-sidebar__footer">
        <button className="db-sidebar__link" onClick={handleLogout}>
          <span>{t('owner.sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
