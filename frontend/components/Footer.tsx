import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer__top">
        <div className="footer__brand">
          <div className="footer__brand-logo">MESHI<span>MAP</span></div>
          <p className="footer__brand-desc">Nền tảng đặt chỗ và khám phá ẩm thực hàng đầu, kết nối tinh hoa ẩm thực Việt Nam và Nhật Bản.</p>
        </div>
        <div className="footer__links">
          <div className="footer__col">
            <span className="footer__col-heading">Khám phá</span>
            <Link href="/search" className="footer__link">Nhà hàng</Link>
            <Link href="/about" className="footer__link">Về chúng tôi</Link>
          </div>
          <div className="footer__col">
            <span className="footer__col-heading">Support</span>
            <Link href="/language" className="footer__link">Hỗ trợ ngôn ngữ</Link>
            <Link href="/policy" className="footer__link">Chính sách</Link>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <p className="footer__copy">© 2024 Meshimap. Connecting Cultures Through Cuisine.</p>
        <div className="footer__socials">
          <a href="#" className="footer__social-link" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="#" className="footer__social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="#" className="footer__social-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
