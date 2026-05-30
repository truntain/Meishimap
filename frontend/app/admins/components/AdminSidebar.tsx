'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppLanguage, adminCopy } from '@/config/i18n';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useAppLanguage();
  const copy = adminCopy[language];

  const handleLogout = () => {
    Cookies.remove('user');
    localStorage.removeItem('meshimap_user');
    router.push('/login');
  };

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar__brand">
        <div className="db-sidebar__brand-logo">MESHI<span>MAP</span></div>
        <div className="db-sidebar__role">{copy.roleLabel}</div>
      </div>
      
      <nav className="db-sidebar__nav">
        <Link 
          href="/admins" 
          className={`db-sidebar__link ${pathname === '/admins' ? 'is-active' : ''}`}
        >
          <span>{copy.navStats}</span>
        </Link>
        <Link 
          href="/admins/approvals" 
          className={`db-sidebar__link ${pathname === '/admins/approvals' ? 'is-active' : ''}`}
        >
          <span>{copy.navApprovals}</span>
        </Link>
        <Link 
          href="/admins/reports" 
          className={`db-sidebar__link ${pathname === '/admins/reports' ? 'is-active' : ''}`}
        >
          <span>{copy.navReports}</span>
        </Link>
      </nav>

      <div className="db-sidebar__footer">
        <button className="db-sidebar__link" onClick={handleLogout}>
          <span>{copy.logout}</span>
        </button>
      </div>
    </aside>
  );
}

