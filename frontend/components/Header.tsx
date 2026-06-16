"use client";

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation'; // Import useRouter và usePathname của Next.js
import { useTranslation } from 'react-i18next';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string, email: string, role: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = (i18n.language || 'vi').split('-')[0];
    const nextLang = currentLang === 'vi' ? 'ja' : 'vi';
    i18n.changeLanguage(nextLang);
  };

  // Đọc dữ liệu user từ cookie khi mount hoặc khi chuyển trang (chuyển đổi client-side)
  useEffect(() => {
    setIsMounted(true);
    const userData = Cookies.get('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  // Xử lý click ra ngoài để đóng menu user
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm(t('header.logoutConfirm'))) {
      Cookies.remove('user');
      Cookies.remove('access_token');
      setUser(null);
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      router.push('/login');
    }
  };

  const displayName = user?.name || user?.email || 'U';

  // Hide global header on dashboard pages (admin/owner have their own header)
  if (pathname?.startsWith('/owners') || pathname?.startsWith('/admins')) {
    return null;
  }

  if (!isMounted) {
    return (
      <header className="header" id="main-header">
        <Link href="/" className="header__logo" data-action="go-home">
          <span>MESHI<span className="header__logo-accent">MAP</span></span>
        </Link>

        <nav className="header__nav" id="desktop-nav">
          <Link href="/" className="header__nav-link" data-page="home">Trang chủ</Link>
          <Link href="/search" className="header__nav-link" data-page="search">Tìm kiếm</Link>
        </nav>

        <div className="header__actions">
          <button className="header__lang btn" aria-label="Chuyển ngôn ngữ">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="#6C2F00" strokeWidth="1.2" />
              <path d="M9 1.5C9 1.5 6 4.5 6 9s3 7.5 3 7.5M9 1.5C9 1.5 12 4.5 12 9s-3 7.5-3 7.5M1.5 9h15" stroke="#6C2F00" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span>VN / JP</span>
          </button>
          <div className="header__divider"></div>
          <div style={{ width: '100px', height: '36px' }} />
        </div>

        <button className="header__hamburger" aria-label="Mở menu">
          <span></span><span></span><span></span>
        </button>
      </header>
    );
  }


  return (
    <header className="header" id="main-header">
      <Link href="/" className="header__logo" data-action="go-home">
        <span>MESHI<span className="header__logo-accent">MAP</span></span>
      </Link>

      {/* Nav links — hidden on /profile route */}
      {pathname && !pathname.startsWith('/profile') && (
        <nav className="header__nav" id="desktop-nav">
          <Link href="/" className="header__nav-link" data-page="home">{t('header.home')}</Link>
          <Link href="/search" className="header__nav-link" data-page="search">{t('header.search')}</Link>
        </nav>
      )}

      <div className="header__actions">
        <button onClick={toggleLanguage} className="header__lang btn" aria-label={t('header.languageLabel')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="#6C2F00" strokeWidth="1.2" />
            <path d="M9 1.5C9 1.5 6 4.5 6 9s3 7.5 3 7.5M9 1.5C9 1.5 12 4.5 12 9s-3 7.5-3 7.5M1.5 9h15" stroke="#6C2F00" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>{t('header.languageValue')}</span>
        </button>
        <div className="header__divider"></div>

        {isMounted && user ? (
          // Thêm ref vào div bọc ngoài cùng
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              title={displayName}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#f0e9e2',
                color: '#333',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'var(--font-body)'
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </button>

            {isUserMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                minWidth: '150px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 100
              }}>
                {user && (user.role === 'admin' || user.role === 'quản lý') && (
                  <Link
                    href="/admins"
                    style={{ padding: '12px 16px', color: '#333', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #eee' }}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {i18n.language?.startsWith('ja') ? '管理者画面' : 'Trang quản trị'}
                  </Link>
                )}
                {user && (user.role === 'restaurant_owner' || user.role === 'owner' || user.role === 'chủ nhà hàng') && (
                  <Link
                    href="/owners"
                    style={{ padding: '12px 16px', color: '#333', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #eee' }}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {i18n.language?.startsWith('ja') ? '店舗管理画面' : 'Trang nhà hàng'}
                  </Link>
                )}
                <Link
                  href="/profile"
                  style={{ padding: '12px 16px', color: '#333', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #eee' }}
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {t('header.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ padding: '12px 16px', color: '#d93025', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}
                >
                  {t('header.logout')}
                </button>
              </div>
            )}
          </div>
        ) : isMounted && !user ? (
          <Link href="/login" className="btn btn--login" id="btn-login">{t('header.login')}</Link>
        ) : (
          <div style={{ width: '100px', height: '36px' }} />
        )}
      </div>

      <button
        className="header__hamburger"
        aria-label={t('header.openMenu')}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span></span><span></span><span></span>
      </button>

      <div className={`header__mobile-menu ${isMobileMenuOpen ? 'is-open' : ''}`} id="mobile-menu">
        {/* Thêm onClick để tự đóng menu khi chọn trang */}
        {pathname && !pathname.startsWith('/owners') && !pathname.startsWith('/admins') && (
          <>
            <Link href="/" className="header__nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t('header.home')}</Link>
            <Link href="/search" className="header__nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t('header.search')}</Link>
          </>
        )}

        {isMounted && user ? (
          <button className="btn btn--login" style={{ marginTop: '8px' }} onClick={handleLogout}>{t('header.logout')}</button>
        ) : isMounted && !user ? (
          <Link href="/login" className="btn btn--login" style={{ marginTop: '8px' }} onClick={() => setIsMobileMenuOpen(false)}>{t('header.login')}</Link>
        ) : (
          <div style={{ height: '36px' }} />
        )}
      </div>
    </header>
  );
}