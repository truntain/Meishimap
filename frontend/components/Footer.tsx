"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useAppLanguage, footerCopy } from '@/config/i18n';

export default function Footer() {
  const { language } = useAppLanguage();
  const copy = footerCopy[language];

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Tiếng Việt làm mặc định cho Server SSR
  const defaultCopy = footerCopy['vi'];
  const activeCopy = isMounted ? copy : defaultCopy;

  return (
    <footer className="footer" id="main-footer">
      <div className="footer__top">
        <div className="footer__brand">
          <div className="footer__brand-logo">MESHI<span>MAP</span></div>
          <p className="footer__brand-desc">{activeCopy.brandDesc}</p>
        </div>
        <div className="footer__links">
          <div className="footer__col">
            <span className="footer__col-heading">{activeCopy.discover}</span>
            <Link href="/search" className="footer__link">{activeCopy.restaurants}</Link>
            <Link href="/about" className="footer__link">{activeCopy.aboutUs}</Link>
          </div>
          <div className="footer__col">
            <span className="footer__col-heading">{activeCopy.support}</span>
            <Link href="/language" className="footer__link">{activeCopy.languageSupport}</Link>
            <Link href="/policy" className="footer__link">{activeCopy.policy}</Link>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <p className="footer__copy">{activeCopy.copyright}</p>
        <div className="footer__socials">
          <a href="#" className="footer__social-link" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="#" className="footer__social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="#" className="footer__social-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
