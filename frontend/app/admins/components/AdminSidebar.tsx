'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar() {
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
        <div className="db-sidebar__role">{t('admin.sidebar.role')}</div>
      </div>
      
      <nav className="db-sidebar__nav">
        <Link 
          href="/admins" 
          className={`db-sidebar__link ${pathname === '/admins' ? 'is-active' : ''}`}
        >
          <span>{t('admin.sidebar.stats')}</span>
        </Link>
        <Link 
          href="/admins/approvals" 
          className={`db-sidebar__link ${pathname === '/admins/approvals' ? 'is-active' : ''}`}
        >
          <span>{t('admin.sidebar.approvals')}</span>
        </Link>
        <Link 
          href="/admins/reports" 
          className={`db-sidebar__link ${pathname === '/admins/reports' ? 'is-active' : ''}`}
        >
          <span>{t('admin.sidebar.reports')}</span>
        </Link>
      </nav>

      <div className="db-sidebar__footer">
        <button className="db-sidebar__link" onClick={handleLogout}>
          <span>{t('admin.sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
