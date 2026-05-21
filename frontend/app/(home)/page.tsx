"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleSearchSubmit = () => {
    const input = document.getElementById('hero-search-input') as HTMLInputElement;
    const query = input?.value.trim() || '';
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <main>
      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="hero" id="hero-section">
        <img src="/hero-bg-35c07e.png" alt="Ẩm thực Nhật Bản tại Việt Nam" className="hero__bg" />
        <div className="hero__overlay"></div>
        <div className="hero__content">
          <h1 className="hero__heading fade-in-up">
            Tinh hoa ẩm thực Nhật Bản tại Việt Nam
          </h1>
          <p className="hero__subtitle fade-in-up delay-1">
            Khám phá những nhà hàng chuẩn vị, hỗ trợ ngôn ngữ và dịch vụ tận tâm nhất dành cho cộng đồng người Việt - Nhật
          </p>

          {/* Search bar */}
          <div className="search-bar fade-in-up delay-2">
            <span className="search-bar__icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M8.167 14.333A6.167 6.167 0 1 0 8.167 2a6.167 6.167 0 0 0 0 12.333ZM16 16l-2.792-2.792" stroke="#877369" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <input
              type="text"
              id="hero-search-input"
              className="search-bar__input"
              placeholder="Nhập tên nhà hàng, món ăn, địa chỉ..."
              onKeyDown={handleKeyDown}
            />
            <div className="search-bar__divider"></div>
            <button className="btn btn--primary" onClick={handleSearchSubmit} id="btn-search-hero">Tìm kiếm</button>
          </div>

          {/* Chips */}
          <div className="hero__chips fade-in-up delay-3">
            <button className="chip">📍 Tìm quanh đây</button>
            <button className="chip">🇯🇵 Hỗ trợ tiếng Nhật</button>
            <button className="chip">✨ Đảm bảo vệ sinh</button>
          </div>
        </div>
      </section>

      {/* ══ FEATURED ════════════════════════════════════════ */}
      <section className="section" id="featured-section">
        <div className="section__header">
          <div>
            <h2 className="section__title">Nhà hàng nổi bật</h2>
            <p className="section__subtitle">Lựa chọn hàng đầu cho trải nghiệm ẩm thực tinh tế</p>
          </div>
          <Link href="/search" className="btn btn--outline" id="btn-see-all">
            Xem tất cả
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.333 8h9.334M8.667 5l3 3-3 3" stroke="#6C2F00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>

        <div className="section__grid" id="featured-grid">

          {/* Card 1 */}
          <article className="card" id="card-miyabi">
            <div className="card__image-wrap">
              <img src="/restaurant-card-13d489.png" alt="Miyabi Japanese Dining" className="card__image" />
              <div className="card__rating">
                <svg width="12" height="11" viewBox="0 0 12 11" fill="#EAB308"><path d="M6 .5 7.545 4.185 11.5 4.635 8.75 7.27l.795 3.925L6 9.125 2.455 11.195l.795-3.925L.5 4.635l3.955-.45Z"/></svg>
                4.9
              </div>
            </div>
            <div className="card__body">
              <div className="card__title-row">
                <div>
                  <h3 className="card__title">Miyabi Japanese Dining</h3>
                  <p className="card__title-jp">みやび 日本料理</p>
                </div>
                <svg width="20" height="19" viewBox="0 0 20 19" fill="none"><path d="M15.833 16.833 10 13.167 4.167 16.833V3.5A1.667 1.667 0 0 1 5.833 1.833h8.334A1.667 1.667 0 0 1 15.833 3.5v13.333Z" stroke="#877369" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="card__tags">
                <span className="badge">SUSHI &amp; GRILL</span>
                <span className="badge badge--sm">Hỗ trợ tiếng nhật</span>
              </div>
              <div className="card__footer">
                <span className="card__location">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="#8A8A8A" strokeWidth="1.2"/><circle cx="7" cy="4.667" r="1.167" stroke="#8A8A8A" strokeWidth="1.2"/></svg>
                  Quận 1, HCM
                </span>
                <Link href="/restaurant/1" className="btn btn--dark" id="btn-book-1">
                  Đặt bàn
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 3l3 3-3 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            </div>
          </article>

          {/* Card 2 */}
          <article className="card" id="card-sakura">
            <div className="card__image-wrap">
              <img src="/restaurant-card-13d489.png" alt="Sakura Kaiseki" className="card__image" />
              <div className="card__rating">
                <svg width="12" height="11" viewBox="0 0 12 11" fill="#EAB308"><path d="M6 .5 7.545 4.185 11.5 4.635 8.75 7.27l.795 3.925L6 9.125 2.455 11.195l.795-3.925L.5 4.635l3.955-.45Z"/></svg>
                4.8
              </div>
            </div>
            <div className="card__body">
              <div className="card__title-row">
                <div>
                  <h3 className="card__title">Sakura Kaiseki</h3>
                  <p className="card__title-jp">さくら 懐石料理</p>
                </div>
                <svg width="20" height="19" viewBox="0 0 20 19" fill="none"><path d="M15.833 16.833 10 13.167 4.167 16.833V3.5A1.667 1.667 0 0 1 5.833 1.833h8.334A1.667 1.667 0 0 1 15.833 3.5v13.333Z" stroke="#877369" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="card__tags">
                <span className="badge">KAISEKI</span>
                <span className="badge badge--sm">Hỗ trợ tiếng nhật</span>
              </div>
              <div className="card__footer">
                <span className="card__location">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="#8A8A8A" strokeWidth="1.2"/><circle cx="7" cy="4.667" r="1.167" stroke="#8A8A8A" strokeWidth="1.2"/></svg>
                  Quận 3, HCM
                </span>
                <Link href="/restaurant/2" className="btn btn--dark" id="btn-book-2">
                  Đặt bàn
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 3l3 3-3 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            </div>
          </article>

          {/* Card 3 */}
          <article className="card" id="card-hanami">
            <div className="card__image-wrap">
              <img src="/restaurant-card-13d489.png" alt="Hanami Ramen" className="card__image" />
              <div className="card__rating">
                <svg width="12" height="11" viewBox="0 0 12 11" fill="#EAB308"><path d="M6 .5 7.545 4.185 11.5 4.635 8.75 7.27l.795 3.925L6 9.125 2.455 11.195l.795-3.925L.5 4.635l3.955-.45Z"/></svg>
                4.7
              </div>
            </div>
            <div className="card__body">
              <div className="card__title-row">
                <div>
                  <h3 className="card__title">Hanami Ramen House</h3>
                  <p className="card__title-jp">はなみ ラーメン</p>
                </div>
                <svg width="20" height="19" viewBox="0 0 20 19" fill="none"><path d="M15.833 16.833 10 13.167 4.167 16.833V3.5A1.667 1.667 0 0 1 5.833 1.833h8.334A1.667 1.667 0 0 1 15.833 3.5v13.333Z" stroke="#877369" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="card__tags">
                <span className="badge">RAMEN</span>
                <span className="badge badge--sm">Phong cách Nhật</span>
              </div>
              <div className="card__footer">
                <span className="card__location">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="#8A8A8A" strokeWidth="1.2"/><circle cx="7" cy="4.667" r="1.167" stroke="#8A8A8A" strokeWidth="1.2"/></svg>
                  Bình Thạnh, HCM
                </span>
                <Link href="/restaurant/3" className="btn btn--dark" id="btn-book-3">
                  Đặt bàn
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 3l3 3-3 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            </div>
          </article>

        </div>
      </section>

      {/* ══ CTA BENTO ══════════════════════════════════════ */}
      <section className="cta" id="cta-section">
        <div className="cta__grid">
          {/* Support card */}
          <div className="cta__card cta__card--support" id="cta-support">
            <div className="cta__icon-row">
              <span style={{ fontSize: '2rem' }}>🕐</span>
              <h2 className="cta__heading">Hỗ trợ 24/7</h2>
            </div>
            <p className="cta__text">Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ mọi lúc.</p>
            <a href="mailto:support@meshimap.com" className="btn btn--primary btn--primary-lg" id="btn-contact">Liên hệ ngay</a>
          </div>

          {/* Partner card */}
          <div className="cta__card cta__card--partner" id="cta-partner">
            <img src="/cta-bg.png" alt="Kết nối văn hóa" className="cta__card-bg" />
            <div className="cta__card-overlay"></div>
            <div className="cta__card-content">
              <h2 className="cta__heading cta__heading--light">Kết nối văn hóa qua từng bữa ăn</h2>
              <p className="cta__text cta__text--light">Trở thành đối tác của Meshimap để tiếp cận cộng đồng thực khách tinh tế từ cả Việt Nam và Nhật Bản.</p>
              <Link href="/register" className="btn btn--primary btn--primary-lg" id="btn-register">Đăng ký nhà hàng</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
