"use client";

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useAppLanguage, footerCopy } from '@/config/i18n';

export default function Footer() {
  const pathname = usePathname();
  const { language } = useAppLanguage();
  const copy = footerCopy[language];

  if (pathname?.startsWith('/owners') || pathname?.startsWith('/admins')) {
    return null;
  }

  return (
    <footer className="footer" id="main-footer">
      <div className="footer__top">
        <div className="footer__brand">
          <div className="footer__brand-logo">MESHI<span>MAP</span></div>
          <p className="footer__brand-desc">{copy.brandDesc}</p>
        </div>
        <div className="footer__links">
          <div className="footer__col">
            <span className="footer__col-heading">{copy.discover}</span>
            <Link href="/search" className="footer__link">{copy.restaurants}</Link>
            <Link href="/about" className="footer__link">{copy.aboutUs}</Link>
          </div>
          <div className="footer__col">
            <span className="footer__col-heading">{copy.support}</span>
            <Link href="/language" className="footer__link">{copy.languageSupport}</Link>
            <Link href="/policy" className="footer__link">{copy.policy}</Link>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <p className="footer__copy">{copy.copyright}</p>
        <div className="footer__socials">
          <a href="#" className="footer__social-link" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="#" className="footer__social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="#" className="footer__social-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
