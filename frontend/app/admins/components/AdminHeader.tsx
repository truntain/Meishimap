'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { useAppLanguage } from '@/config/i18n';

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const router = useRouter();
  const { language, toggleLanguage } = useAppLanguage();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('A');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Try localStorage first
      const raw = localStorage.getItem('meshimap_user');
      if (raw) {
        const u = JSON.parse(raw);
        const name: string = u?.name || u?.username || u?.email || 'Admin';
        setUserName(name);
        return;
      }
      // Fallback: read from cookie
      const match = document.cookie.match(/(?:^|;\s*)user=([^;]*)/);
      if (match) {
        const u = JSON.parse(decodeURIComponent(match[1]));
        const name: string = u?.name || u?.username || u?.email || 'Admin';
        setUserName(name);
        localStorage.setItem('meshimap_user', JSON.stringify(u));
      }
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    Cookies.remove('user');
    localStorage.removeItem('meshimap_user');
    router.push('/login');
  };

  const initial = userName.charAt(0).toUpperCase();
  const profileLabel = language === 'ja' ? 'プロフィール' : 'Hồ sơ cá nhân';
  const logoutLabel = language === 'ja' ? 'ログアウト' : 'Đăng xuất';
  const roleLabel = language === 'ja' ? '管理者' : 'Quản trị viên';
  const langLabel = language === 'ja' ? 'JP / VN' : 'VN / JP';

  return (
    <header className="db-header">
      <h1 className="db-header__title">{title}</h1>

      <div className="db-header__meta">
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="db-lang-btn"
          aria-label={language === 'ja' ? 'ベトナム語に切り替え' : 'Chuyển sang tiếng Nhật'}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9 1.5C9 1.5 6 4.5 6 9s3 7.5 3 7.5M9 1.5C9 1.5 12 4.5 12 9s-3 7.5-3 7.5M1.5 9h15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>{langLabel}</span>
        </button>

        {/* Avatar + dropdown */}
        <div className="db-avatar-wrap" ref={dropRef}>
          <button
            className="db-header__avatar"
            onClick={() => setOpen((v) => !v)}
            aria-label="Tài khoản"
            aria-expanded={open}
          >
            {initial}
          </button>

          <div className={`db-avatar-dropdown${open ? ' is-open' : ''}`}>
            <div className="db-avatar-dropdown__header">
              <div className="db-avatar-dropdown__name">{userName}</div>
              <div className="db-avatar-dropdown__role">{roleLabel}</div>
            </div>

            <Link
              href="/profile"
              className="db-avatar-dropdown__item"
              onClick={() => setOpen(false)}
            >
              <span className="db-avatar-dropdown__icon">👤</span>
              {profileLabel}
            </Link>

            <button
              className="db-avatar-dropdown__item db-avatar-dropdown__item--danger"
              onClick={handleLogout}
            >
              <span className="db-avatar-dropdown__icon">🚪</span>
              {logoutLabel}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
