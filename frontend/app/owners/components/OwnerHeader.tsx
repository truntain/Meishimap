'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function OwnerHeader({ title }: { title: string }) {
  const [ownerName, setOwnerName] = useState('Owner');

  useEffect(() => {
    try {
      const userCookie = Cookies.get('user');
      if (userCookie) {
        const user = JSON.parse(userCookie);
        setOwnerName(user.name || 'Owner');
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
          <span>{ownerName}</span>
          <div className="db-header__avatar">
            {ownerName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
