'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppLanguage, ownerCopy } from '@/config/i18n';

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useAppLanguage();
  const copy = ownerCopy[language];

  const handleLogout = () => {
    Cookies.remove('user');
    localStorage.removeItem('meshimap_user');
    router.push('/login');
  };

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar__brand">
        <div className="db-sidebar__brand-logo">MESHI<span>MAP</span></div>
        <div className="db-sidebar__role">{copy.sidebarRole}</div>
      </div>

      <nav className="db-sidebar__nav">
        <Link
          href="/owners"
          className={`db-sidebar__link ${pathname === '/owners' ? 'is-active' : ''}`}
        >
          <span>{copy.navInfo}</span>
        </Link>
        <Link
          href="/owners/bookings"
          className={`db-sidebar__link ${pathname === '/owners/bookings' ? 'is-active' : ''}`}
        >
          <span>{copy.navBookings}</span>
        </Link>
        <Link
          href="/owners/reviews"
          className={`db-sidebar__link ${pathname === '/owners/reviews' ? 'is-active' : ''}`}
        >
          <span>{copy.navReviews}</span>
        </Link>
        {/* <Link 
          href="/owners/preview" 
          className={`db-sidebar__link ${pathname === '/owners/preview' ? 'is-active' : ''}`}
        >
          <span>Xem trước (Preview)</span>
        </Link> */}
      </nav>

      <div className="db-sidebar__footer">
        <button className="db-sidebar__link" onClick={handleLogout}>
          <span>{copy.logout}</span>
        </button>
      </div>
    </aside>
  );
}
