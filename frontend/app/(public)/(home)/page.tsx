"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Restaurant {
  id: number;
  name: string;
  nameJp: string | null;
  category: string;
  rating: number;
  address: string;
  district: string | null;
  city: string | null;
  imageUrl: string | null;
  hasJapaneseSupport: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/restaurants/featured')
      .then(res => res.json())
      .then(data => {
        setFeaturedRestaurants(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching featured restaurants:', err);
        setIsLoading(false);
      });
  }, []);

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
            <h2 className="section__title">
              
            </h2>
            <p className="section__subtitle">Lựa chọn hàng đầu cho trải nghiệm ẩm thực tinh tế</p>
          </div>
          <Link href="/search" className="btn btn--outline" id="btn-see-all">
            Xem tất cả
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.333 8h9.334M8.667 5l3 3-3 3" stroke="#6C2F00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>

        <div className="section__grid" id="featured-grid">
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>Đang tải...</div>
          ) : featuredRestaurants.length > 0 ? (
            featuredRestaurants.map((restaurant) => (
              <article className="card" key={restaurant.id} id={`card-${restaurant.id}`}>
                <div className="card__image-wrap">
                  <img src={restaurant.imageUrl || '/restaurant-card-13d489.png'} alt={restaurant.name} className="card__image" />
                  <div className="card__rating">
                    <svg width="12" height="11" viewBox="0 0 12 11" fill="#EAB308"><path d="M6 .5 7.545 4.185 11.5 4.635 8.75 7.27l.795 3.925L6 9.125 2.455 11.195l.795-3.925L.5 4.635l3.955-.45Z"/></svg>
                    {restaurant.rating.toFixed(1)}
                  </div>
                </div>
                <div className="card__body">
                  <div className="card__title-row">
                    <div>
                      <h3 className="card__title">{restaurant.name}</h3>
                      {restaurant.nameJp && <p className="card__title-jp">{restaurant.nameJp}</p>}
                    </div>
                    <svg width="20" height="19" viewBox="0 0 20 19" fill="none"><path d="M15.833 16.833 10 13.167 4.167 16.833V3.5A1.667 1.667 0 0 1 5.833 1.833h8.334A1.667 1.667 0 0 1 15.833 3.5v13.333Z" stroke="#877369" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="card__tags">
                    <span className="badge">{restaurant.category.toUpperCase()}</span>
                    {restaurant.hasJapaneseSupport && <span className="badge badge--sm">Hỗ trợ tiếng nhật</span>}
                  </div>
                  <div className="card__footer">
                    <span className="card__location">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="#8A8A8A" strokeWidth="1.2"/><circle cx="7" cy="4.667" r="1.167" stroke="#8A8A8A" strokeWidth="1.2"/></svg>
                      {restaurant.district || restaurant.city || restaurant.address}
                    </span>
                    <Link href={`/restaurant/${restaurant.id}`} className="btn btn--dark" id={`btn-book-${restaurant.id}`}>
                      Đặt bàn
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 3l3 3-3 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>Không có nhà hàng nổi bật.</div>
          )}
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
              <Link href="/register-restaurant" className="btn btn--primary btn--primary-lg" id="btn-register">Đăng ký nhà hàng</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
