"use client";

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { headerCopy, useAppLanguage } from '@/config/language';

type HeaderUser = {
  name?: string;
  email: string;
  role: string;
};

export default function Header() {
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { language, toggleLanguage } = useAppLanguage();
  const copy = headerCopy[language];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const userData = Cookies.get('user');
      if (!userData) return;

      try {
        setUser(JSON.parse(userData));
      } catch {
        console.error('Failed to parse user data');
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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
    if (window.confirm(copy.logoutConfirm)) {
      Cookies.remove('user');
      Cookies.remove('access_token');
      setUser(null);
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      router.push('/login');
    }
  };

  const displayName = user?.name || user?.email || 'U';

  return (
    <header className="header" id="main-header">
      <Link href="/" className="header__logo" data-action="go-home">
        <span>
          MESHI<span className="header__logo-accent">MAP</span>
        </span>
      </Link>

      <nav className="header__nav" id="desktop-nav">
        <Link href="/" className="header__nav-link" data-page="home">
          {copy.home}
        </Link>
        <Link href="/search" className="header__nav-link" data-page="search">
          {copy.search}
        </Link>
        <Link href="/restaurant/1" className="header__nav-link" data-page="booking">
          {copy.booking}
        </Link>
      </nav>

      <div className="header__actions">
        <button
          className="header__lang btn"
          aria-label={copy.languageLabel}
          onClick={toggleLanguage}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="#6C2F00" strokeWidth="1.2" />
            <path
              d="M9 1.5C9 1.5 6 4.5 6 9s3 7.5 3 7.5M9 1.5C9 1.5 12 4.5 12 9s-3 7.5-3 7.5M1.5 9h15"
              stroke="#6C2F00"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span>{copy.languageValue}</span>
        </button>
        <div className="header__divider" />

        {user ? (
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
                fontFamily: 'var(--font-body)',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </button>

            {isUserMenuOpen && (
              <div
                style={{
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
                  zIndex: 100,
                }}
              >
                <Link
                  href="/profile"
                  style={{
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '14px',
                    borderBottom: '1px solid #eee',
                  }}
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {copy.profile}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '12px 16px',
                    color: '#d93025',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {copy.logout}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn btn--login" id="btn-login">
            {copy.login}
          </Link>
        )}
      </div>

      <button
        className="header__hamburger"
        aria-label={copy.openMenu}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`header__mobile-menu ${isMobileMenuOpen ? 'is-open' : ''}`} id="mobile-menu">
        <Link href="/" className="header__nav-link" onClick={() => setIsMobileMenuOpen(false)}>
          {copy.home}
        </Link>
        <Link href="/search" className="header__nav-link" onClick={() => setIsMobileMenuOpen(false)}>
          {copy.search}
        </Link>
        <Link href="/restaurant/1" className="header__nav-link" onClick={() => setIsMobileMenuOpen(false)}>
          {copy.booking}
        </Link>

        {user ? (
          <button className="btn btn--login" style={{ marginTop: '8px' }} onClick={handleLogout}>
            {copy.logout}
          </button>
        ) : (
          <Link
            href="/login"
            className="btn btn--login"
            style={{ marginTop: '8px' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {copy.login}
          </Link>
        )}
      </div>
    </header>
  );
}
