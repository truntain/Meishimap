"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// ── Dữ liệu nhà hàng mẫu (sau này thay bằng API) ──
const MOCK_RESTAURANTS = [
  { id: 1, name: 'Miyabi Japanese Dining', nameJp: 'みやび 日本料理', category: 'sushi', rating: 4.9, location: 'Quận 1, HCM', tags: ['SUSHI & GRILL', 'Hỗ trợ tiếng Nhật'] },
  { id: 2, name: 'Sakura Kaiseki',         nameJp: 'さくら 懐石料理',  category: 'kaiseki', rating: 4.8, location: 'Quận 3, HCM',    tags: ['KAISEKI', 'Hỗ trợ tiếng Nhật'] },
  { id: 3, name: 'Hanami Ramen House',     nameJp: 'はなみ ラーメン',  category: 'ramen',   rating: 4.7, location: 'Bình Thạnh, HCM', tags: ['RAMEN', 'Phong cách Nhật'] },
  { id: 4, name: 'Tokyoto Izakaya',        nameJp: '東京都 居酒屋',   category: 'izakaya', rating: 4.6, location: 'Quận 7, HCM',    tags: ['IZAKAYA', 'Hỗ trợ tiếng Nhật'] },
  { id: 5, name: 'Kobe Yakiniku',          nameJp: '神戸 焼肉',      category: 'bbq',     rating: 4.5, location: 'Quận 2, HCM',    tags: ['YAKINIKU', 'BBQ Nhật'] },
  { id: 6, name: 'Fuji Soba House',        nameJp: '富士 そば',      category: 'soba',    rating: 4.4, location: 'Quận 10, HCM',   tags: ['SOBA', 'Udon'] },
  { id: 7, name: 'Sushi Sakura',           nameJp: 'さくら 寿司',    category: 'sushi',   rating: 4.8, location: 'Quận 1, HCM',    tags: ['SUSHI & GRILL', 'Hỗ trợ tiếng Nhật'] },
  { id: 8, name: 'Ramen Ichiban',          nameJp: 'いちばん ラーメン',category: 'ramen',   rating: 4.7, location: 'Quận 3, HCM',    tags: ['RAMEN', 'Hỗ trợ tiếng Nhật'] },
];

const CATEGORIES = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'sushi',   label: 'Sushi & Grill' },
  { key: 'ramen',   label: 'Ramen' },
  { key: 'kaiseki', label: 'Kaiseki' },
  { key: 'izakaya', label: 'Izakaya' },
  { key: 'bbq',     label: 'Yakiniku' },
  { key: 'soba',    label: 'Soba & Udon' },
];

// ── SVG Icons ──
const StarIcon = () => (
  <svg width="12" height="11" viewBox="0 0 12 11" fill="#EAB308">
    <path d="M6 .5 7.545 4.185 11.5 4.635 8.75 7.27l.795 3.925L6 9.125 2.455 11.195l.795-3.925L.5 4.635l3.955-.45Z" />
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="#8A8A8A" strokeWidth="1.2" />
    <circle cx="7" cy="4.667" r="1.167" stroke="#8A8A8A" strokeWidth="1.2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M8.167 14.333A6.167 6.167 0 1 0 8.167 2a6.167 6.167 0 0 0 0 12.333ZM16 16l-2.792-2.792" stroke="#877369" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6h8M6.5 3l3 3-3 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Restaurant Card Component ──
function RestaurantCard({ restaurant, isActive, onClick }: {
  restaurant: typeof MOCK_RESTAURANTS[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`result-card${isActive ? ' result-card--active' : ''}`}
      data-category={restaurant.category}
      id={`result-card-${restaurant.id}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="result-card__image-wrap">
        <div className="result-card__image-placeholder">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.4">
            <rect x="4" y="10" width="40" height="28" rx="4" stroke="#6C2F00" strokeWidth="2" />
            <circle cx="16" cy="22" r="4" stroke="#6C2F00" strokeWidth="2" />
            <path d="M4 32l8-8 6 6 8-10 18 14" stroke="#6C2F00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="result-card__rating-badge">
          <StarIcon /> {restaurant.rating}
        </div>
      </div>
      <div className="result-card__body">
        <h3 className="result-card__title">{restaurant.name}</h3>
        <p style={{ fontSize: '12px', color: 'var(--clr-muted)', margin: '2px 0 6px' }}>{restaurant.nameJp}</p>
        <div className="result-card__tags">
          {restaurant.tags.map(tag => (
            <span key={tag} className="result-card__tag">{tag}</span>
          ))}
        </div>
      </div>
      <div className="result-card__footer">
        <span className="result-card__location">
          <PinIcon /> {restaurant.location}
        </span>
        <Link
          href={`/restaurant/${restaurant.id}`}
          className="result-card__book-btn"
          onClick={e => e.stopPropagation()}
        >
          Đặt bàn <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}

// ── Map Placeholder ──
function MapSection({ count, activeRestaurant }: { count: number; activeRestaurant: typeof MOCK_RESTAURANTS[0] | null }) {
  return (
    <section className="map-section" aria-label="Bản đồ" id="map-section">
      <div className="map-placeholder">
        {activeRestaurant ? (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--clr-dark)', marginBottom: '8px' }}>
              {activeRestaurant.name}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--clr-muted)', marginBottom: '4px' }}>
              {activeRestaurant.nameJp}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--clr-muted)', marginBottom: '24px' }}>
              📌 {activeRestaurant.location}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              {activeRestaurant.tags.map(tag => (
                <span key={tag} className="badge" style={{ fontSize: '11px' }}>{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
              <StarIcon />
              <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--clr-dark)' }}>{activeRestaurant.rating}</span>
              <span style={{ color: 'var(--clr-muted)', fontSize: '13px' }}>/ 5.0</span>
            </div>
            <Link href={`/restaurant/${activeRestaurant.id}`} className="btn btn--primary" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
              Đặt bàn ngay <ArrowIcon />
            </Link>
          </div>
        ) : (
          <>
            <div className="map-placeholder__icon">🗺</div>
            <p className="map-placeholder__text">Chọn một nhà hàng để xem thông tin</p>
          </>
        )}
      </div>
      <button className="map-result-btn" id="btn-map-results">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="#6C2F00" strokeWidth="1.3" />
          <path d="M11 11 14 14" stroke="#6C2F00" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span data-results-count>{count}</span> Kết quả
      </button>
    </section>
  );
}

// ── Main Search Client Component ──
export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');
  const [activeRestaurant, setActiveRestaurant] = useState<typeof MOCK_RESTAURANTS[0] | null>(null);

  // ── Khởi tạo từ URL params (q, filter) ──
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || 'all';
    setQuery(q);
    setInputValue(q);
    setActiveCategory(filter);
  }, [searchParams]);

  // ── Logic lọc kết quả ──
  const filteredResults = useCallback(() => {
    let results = [...MOCK_RESTAURANTS];

    // Lọc theo danh mục
    if (activeCategory !== 'all') {
      results = results.filter(r => r.category === activeCategory);
    }

    // Lọc theo từ khóa tìm kiếm
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.nameJp.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sắp xếp
    results.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.name.localeCompare(b.name, 'vi');
    });

    return results;
  }, [query, activeCategory, sortBy]);

  const results = filteredResults();

  // ── Xử lý tìm kiếm: cập nhật URL param ──
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (inputValue.trim()) params.set('q', inputValue.trim());
    if (activeCategory !== 'all') params.set('filter', activeCategory);
    router.push(`/search?${params.toString()}`);
    setQuery(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategoryFilter = (cat: string) => {
    setActiveCategory(cat);
    setActiveRestaurant(null);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (cat !== 'all') params.set('filter', cat);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="search-layout" id="search-main">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="sidebar" role="complementary" aria-label="Bộ lọc và danh sách">
        <div className="sidebar__filter">
          {/* Search Input */}
          <div className="sidebar-search">
            <SearchIcon />
            <input
              type="text"
              id="search-input"
              className="sidebar-search__input"
              placeholder="Tên nhà hàng, món ăn, địa chỉ..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button
              className="sidebar-search__btn"
              id="btn-sidebar-search"
              onClick={handleSearch}
            >
              Tìm kiếm
            </button>
          </div>

          {/* Filter chips */}
          <div className="filter-chips">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`filter-chip${activeCategory === cat.key ? ' is-active' : ''}`}
                id={`chip-${cat.key}`}
                onClick={() => handleCategoryFilter(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results header */}
        <div className="sidebar__results-header">
          <span className="sidebar__results-title">Kết quả</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="sidebar__results-count">
              <span data-results-count>{results.length}</span> kết quả tại Hồ Chí Minh
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'rating' | 'name')}
              style={{ fontSize: '12px', border: '1px solid var(--clr-border)', borderRadius: '6px', padding: '2px 6px', color: 'var(--clr-dark)', background: 'white', cursor: 'pointer' }}
            >
              <option value="rating">Đánh giá cao nhất</option>
              <option value="name">Tên A–Z</option>
            </select>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="sidebar__list" id="results-list">
          {results.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--clr-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>Không tìm thấy kết quả</p>
              <p style={{ fontSize: '13px' }}>Thử tìm với từ khóa khác hoặc chọn "Tất cả"</p>
            </div>
          ) : (
            results.map(r => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                isActive={activeRestaurant?.id === r.id}
                onClick={() => setActiveRestaurant(activeRestaurant?.id === r.id ? null : r)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── RIGHT: Map / Detail ── */}
      <MapSection count={results.length} activeRestaurant={activeRestaurant} />
    </main>
  );
}
