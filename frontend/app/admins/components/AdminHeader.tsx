'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function AdminHeader({ title }: { title: string }) {
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    // Read from localStorage first or cookie
    try {
      const userCookie = Cookies.get('user');
      if (userCookie) {
        const user = JSON.parse(userCookie);
        setAdminName(user.name || 'Admin');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <header className="db-header">
      <h1 className="db-header__title">{title}</h1>
      <div className="db-header__meta">
        <div className="db-header__user">
          <span>{adminName}</span>
          <div className="db-header__avatar" style={{ background: '#FD8A3E', color: '#fff' }}>
            {adminName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
