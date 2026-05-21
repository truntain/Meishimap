"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { detailCopy, useAppLanguage } from '@/config/language';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type ApiRestaurant = {
  id: number;
  name: string;
  nameJp: string | null;
  category: string;
  rating: number;
  address: string;
  district: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  phone: string | null;
  imageUrl: string | null;
  hasJapaneseSupport: boolean;
};

type RestaurantDetail = ApiRestaurant & {
  reviewCount: number;
  hours: string;
  languages: string;
  tags: string[];
  amenities: string[];
};

const FALLBACK_RESTAURANT: RestaurantDetail = {
  id: 1,
  name: 'Miyabi Japanese Dining',
  nameJp: 'みやび 日本料理',
  address: '123 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
  category: 'sushi',
  rating: 4.9,
  district: 'Quận 1',
  city: 'Hồ Chí Minh',
  latitude: 10.7769,
  longitude: 106.7009,
  description: 'Nhà hàng Nhật phục vụ sushi, sashimi và các set ăn tối trong không gian yên tĩnh.',
  imageUrl: '/restaurant-card-13d489.png',
  hasJapaneseSupport: true,
  reviewCount: 240,
  phone: '+84 28 3823 4567',
  hours: '10:00 - 22:00 (Hàng ngày)',
  languages: 'Tiếng Việt, Tiếng Nhật, English',
  tags: ['Japanese Speaking', 'Hygiene Certified'],
  amenities: ['📶 Free Wifi', '🅿️ Free Parking', '💳 Cards Accepted', '♿ Accessibility'],
};

const CATEGORY_LABELS = new Map([
  ['sushi', 'Sushi & Grill'],
  ['ramen', 'Ramen'],
  ['kaiseki', 'Kaiseki'],
  ['izakaya', 'Izakaya'],
  ['bbq', 'Yakiniku'],
  ['soba', 'Soba & Udon'],
]);

function buildRestaurantDetailUrl(id: string) {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return new URL(`restaurants/${id}`, baseUrl).toString();
}

function getSafeRating(rating: number) {
  return Math.max(0, Math.min(5, Math.round(rating)));
}

function normalizeRestaurantDetail(raw: Partial<ApiRestaurant>, fallbackId: string): RestaurantDetail | null {
  const id = Number(raw.id ?? fallbackId);
  const latitude = Number(raw.latitude);
  const longitude = Number(raw.longitude);

  if (!Number.isFinite(id) || !raw.name) {
    return null;
  }

  const category = raw.category || 'other';
  const hasJapaneseSupport = Boolean(raw.hasJapaneseSupport);
  const categoryLabel = CATEGORY_LABELS.get(category) || category;

  return {
    id,
    name: String(raw.name),
    nameJp: raw.nameJp ?? null,
    category,
    rating: Number(raw.rating ?? 0),
    address: raw.address || 'Chưa cập nhật địa chỉ',
    district: raw.district ?? null,
    city: raw.city ?? null,
    latitude: Number.isFinite(latitude) ? latitude : FALLBACK_RESTAURANT.latitude,
    longitude: Number.isFinite(longitude) ? longitude : FALLBACK_RESTAURANT.longitude,
    description: raw.description ?? null,
    phone: raw.phone || 'Chưa cập nhật',
    imageUrl: raw.imageUrl ?? null,
    hasJapaneseSupport,
    reviewCount: FALLBACK_RESTAURANT.reviewCount,
    hours: FALLBACK_RESTAURANT.hours,
    languages: hasJapaneseSupport ? 'Tiếng Việt, Tiếng Nhật, English' : 'Tiếng Việt, English',
    tags: [
      categoryLabel,
      hasJapaneseSupport ? 'Japanese Speaking' : 'Japanese Style',
    ],
    amenities: FALLBACK_RESTAURANT.amenities,
  };
}

function getMapsQuery(restaurant: RestaurantDetail) {
  if (Number.isFinite(restaurant.latitude) && Number.isFinite(restaurant.longitude)) {
    return `${restaurant.latitude},${restaurant.longitude}`;
  }

  return restaurant.address;
}

const MENU_ITEMS = [
  { id: 1, cat: 'sashimi', emoji: '🐟', name: 'Premium Sashimi Set', price: '450.000đ', desc: 'A curated selection of seasonal fish including Otoro, Sake, and Hamachi.', badge: '✅ Fresh Daily' },
  { id: 2, cat: 'sashimi', emoji: '🍱', name: 'Sashimi Deluxe',        price: '380.000đ', desc: 'Premium cut fish with authentic wasabi and soy sauce.',                badge: '✅ Fresh Daily' },
  { id: 3, cat: 'tempura', emoji: '🍤', name: 'Tempura Set',           price: '280.000đ', desc: 'Crispy light-battered shrimp and vegetables with dipping sauce.',   badge: '✅ Fresh Daily' },
  { id: 4, cat: 'ramen',   emoji: '🍜', name: 'Tonkotsu Ramen',        price: '195.000đ', desc: 'Rich pork bone broth simmered 18 hours, chashu pork, soft egg.',    badge: '✅ Signature Dish' },
  { id: 5, cat: 'ramen',   emoji: '🍝', name: 'Shoyu Ramen',           price: '175.000đ', desc: 'Aromatic soy-based broth with tender chicken and bamboo shoots.',   badge: '✅ Popular' },
  { id: 6, cat: 'dessert', emoji: '🍡', name: 'Matcha Ice Cream',      price: '65.000đ',  desc: 'Premium Uji matcha ice cream served with red bean paste.',           badge: '✅ Seasonal' },
];

const MENU_CATS = [
  { key: 'all',     label: 'Tất cả (All)' },
  { key: 'sashimi', label: 'Sashimi' },
  { key: 'tempura', label: 'Tempura' },
  { key: 'ramen',   label: 'Ramen' },
  { key: 'dessert', label: 'Desserts' },
];

const MOCK_REVIEWS = [
  { id: 1, author: 'Anh Nguyen', initial: 'A', date: 'Tháng 5, 2025', stars: 5, text: 'Nhà hàng tuyệt vời! Sashimi tươi ngon, nhân viên thân thiện và hỗ trợ tiếng Nhật rất tốt. Sẽ quay lại lần sau.' },
  { id: 2, author: 'Minh Tran',  initial: 'M', date: 'Tháng 4, 2025', stars: 4, text: 'Không gian đẹp, món ăn chất lượng cao. Giá hơi cao nhưng xứng đáng với trải nghiệm đem lại.' },
];

const TIME_SLOTS = ['11:00', '12:00', '13:00', '18:00', '19:00', '20:00', '21:00'];
const GUEST_OPTIONS = ['1 người', '2 người', '3 người', '4 người', '5+ người'];

// ── Icons ──
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="#fff" strokeWidth="1.3" />
    <path d="M2 7h12M5 1v4M11 1v4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const StarsFull = ({ count }: { count: number }) => (
  <span className="detail-meta__stars">
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
);

export default function RestaurantDetailClient() {
  const params = useParams();
  const { language } = useAppLanguage();
  const copy = detailCopy[language];
  const restaurantIdParam = params?.id;
  const restaurantId = Array.isArray(restaurantIdParam)
    ? restaurantIdParam[0]
    : restaurantIdParam || String(FALLBACK_RESTAURANT.id);

  const [restaurant, setRestaurant] = useState<RestaurantDetail>({
    ...FALLBACK_RESTAURANT,
    id: Number(restaurantId) || FALLBACK_RESTAURANT.id,
  });
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState('');

  // ── Menu state ──
  const [activeCat, setActiveCat]         = useState('all');
  const [menuSearch, setMenuSearch]       = useState('');
  const [menuSearchInput, setMenuSearchInput] = useState('');

  // ── Booking modal state ──
  const [bookingOpen, setBookingOpen]     = useState(false);
  const [successOpen, setSuccessOpen]     = useState(false);
  const [bookingDate, setBookingDate]     = useState('');
  const [bookingTime, setBookingTime]     = useState('18:00');
  const [bookingGuests, setBookingGuests] = useState('2 người');
  const [bookingNote, setBookingNote]     = useState('');
  const [dateError, setDateError]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  // ── Promo copy state ──
  const [promoCopied, setPromoCopied] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRestaurant() {
      setRestaurantLoading(true);
      setRestaurantError('');

      try {
        const response = await fetch(buildRestaurantDetailUrl(restaurantId), {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`API trả về ${response.status}`);
        }

        const data = await response.json();
        const normalized = normalizeRestaurantDetail(data, restaurantId);

        if (!normalized) {
          throw new Error('Dữ liệu nhà hàng không hợp lệ');
        }

        if (isMounted) {
          setRestaurant(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setRestaurant({
            ...FALLBACK_RESTAURANT,
            id: Number(restaurantId) || FALLBACK_RESTAURANT.id,
          });
          setRestaurantError(
            error instanceof Error
              ? `Không tải được API chi tiết nhà hàng (${error.message}). Đang dùng dữ liệu demo.`
              : 'Không tải được API chi tiết nhà hàng. Đang dùng dữ liệu demo.',
          );
        }
      } finally {
        if (isMounted) {
          setRestaurantLoading(false);
        }
      }
    }

    loadRestaurant();

    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  // Close modal on backdrop click
  useEffect(() => {
    if (!bookingOpen && !successOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setBookingOpen(false); setSuccessOpen(false); }
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [bookingOpen, successOpen]);

  // ── Menu filter logic ──
  const filteredMenu = useCallback(() => {
    return MENU_ITEMS.filter(item => {
      const matchCat = activeCat === 'all' || item.cat === activeCat;
      const q = menuSearch.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCat, menuSearch]);

  // ── Booking submit ──
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      setDateError(true);
      return;
    }
    setDateError(false);
    setIsSubmitting(true);

    // Simulate API save
    const booking = {
      restaurantId,
      restaurantName: restaurant.name,
      date: bookingDate,
      time: bookingTime,
      guests: bookingGuests,
      note: bookingNote,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('meshimap_bookings') || '[]');
    existing.push(booking);
    localStorage.setItem('meshimap_bookings', JSON.stringify(existing));

    setTimeout(() => {
      setIsSubmitting(false);
      setBookingOpen(false);
      setSuccessOpen(true);
      // Reset form
      setBookingDate('');
      setBookingNote('');
    }, 600);
  };

  const openBooking = () => {
    setBookingOpen(true);
    setDateError(false);
  };

  const handleGetPromo = () => {
    navigator.clipboard?.writeText('MESHIMAP15').catch(() => {});
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2500);
  };

  const today = new Date().toISOString().split('T')[0];
  const menuItems = filteredMenu();
  const starCount = getSafeRating(restaurant.rating);

  return (
    <>
      {/* ── Hero ── */}
      <section className="detail-hero" aria-label={copy.heroLabel} id="detail-hero">
        <div
          className="detail-hero__img"
          style={restaurant.imageUrl ? {
            backgroundImage: `url("${restaurant.imageUrl}")`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          } : undefined}
        />
        <div className="detail-hero__overlay" />
      </section>

      {/* ── Info card (overlapping) ── */}
      <div className="detail-info-card">
        <div className="detail-info-card__inner">
          <div className="detail-info-card__left">
            <div className="detail-tags">
              {restaurant.tags.map(tag => (
                <span
                  key={tag}
                  className={`detail-tag${tag === 'Japanese Speaking' || tag === 'Hygiene Certified' ? ' detail-tag--green' : ''}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="detail-name">{restaurant.name}</h1>
            {restaurant.nameJp && (
              <p style={{ fontSize: '13px', color: 'var(--clr-muted)', marginBottom: '6px' }}>{restaurant.nameJp}</p>
            )}
            <div className="detail-meta">
              <span className="detail-meta__item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="#8A8A8A" strokeWidth="1.2" />
                  <circle cx="7" cy="4.667" r="1.167" stroke="#8A8A8A" strokeWidth="1.2" />
                </svg>
                {restaurant.address}
              </span>
              <span className="detail-meta__item">
                <StarsFull count={starCount} />
                ({restaurant.rating.toFixed(1)}/5 • {restaurant.reviewCount} reviews)
              </span>
            </div>
            {restaurant.description && (
              <p style={{ fontSize: '13px', color: 'var(--clr-muted)', lineHeight: 1.6, maxWidth: '720px' }}>
                {restaurant.description}
              </p>
            )}
            {restaurantLoading && (
              <p className="detail-api-status">{copy.loadingApi}</p>
            )}
            {restaurantError && (
              <p className="detail-api-status detail-api-status--warning">{restaurantError}</p>
            )}
          </div>
          <button className="detail-book-btn" id="btn-open-booking" onClick={openBooking}>
            <CalendarIcon /> {copy.bookingButton}
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="detail-main">
        {/* Left column */}
        <div className="detail-left">

          {/* Menu search */}
          <div className="menu-search">
            <span style={{ padding: '14px 16px', color: 'var(--clr-muted)', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="#877369" strokeWidth="1.3" />
                <path d="M12.5 12.5 16 16" stroke="#877369" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              className="menu-search__input"
              placeholder={copy.menuPlaceholder}
              id="menu-search-input"
              value={menuSearchInput}
              onChange={e => setMenuSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setMenuSearch(menuSearchInput)}
            />
            <div style={{ width: '1px', height: '28px', background: 'rgba(218,194,182,0.5)' }} />
            <button
              style={{ padding: '10px 20px', background: 'var(--clr-rich)', color: '#fff', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', margin: '6px', borderRadius: '8px' }}
              id="btn-menu-search"
              onClick={() => setMenuSearch(menuSearchInput)}
            >
              {copy.menuSearch}
            </button>
          </div>

          {/* Category tabs */}
          <div className="menu-cats" id="menu-cats">
            {MENU_CATS.map(cat => (
              <button
                key={cat.key}
                className={`menu-cat-btn${activeCat === cat.key ? ' is-active' : ''}`}
                id={`cat-${cat.key}`}
                onClick={() => setActiveCat(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="menu-grid" id="menu-grid">
            {menuItems.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--clr-muted)' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🍽️</div>
                <p>{copy.noMenu}</p>
              </div>
            ) : (
              menuItems.map(item => (
                <div key={item.id} className="menu-item" data-cat={item.cat}>
                  <div className="menu-item__img">{item.emoji}</div>
                  <div className="menu-item__body">
                    <div className="menu-item__name">{item.name}</div>
                    <div className="menu-item__price">{item.price}</div>
                    <p style={{ fontSize: '12px', color: 'var(--clr-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#2f7d32', marginTop: '4px' }}>{item.badge}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id="reviews-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: 700, fontSize: '20px', color: 'var(--clr-dark)' }}>{copy.reviews}</h2>
              <Link
                href={`/restaurant/${restaurantId}/review`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clr-dark)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
                id="btn-write-review"
              >
                {copy.writeReview}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14l1.5-4.5L11 2l3 3-7.5 7.5L2 14z" stroke="#6C2F00" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {MOCK_REVIEWS.map(review => (
              <div key={review.id} className="review-card">
                <div className="review__header">
                  <div className="review__avatar">{review.initial}</div>
                  <div className="review__body">
                    <div className="review__name">{review.author}</div>
                    <div className="review__date">{review.date}</div>
                  </div>
                  <div className="review__stars">
                    {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                  </div>
                </div>
                <p className="review__text">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="detail-right">
          {/* Contact info */}
          <div className="info-card">
            <h3 className="info-card__title">{copy.contact}</h3>
            <div className="info-card__row">
              <div style={{ color: 'var(--clr-dark)', flexShrink: 0, marginTop: '2px' }}>🕐</div>
              <div>
                <div className="info-card__label">{copy.hours}</div>
                <div className="info-card__value">{restaurant.hours}</div>
              </div>
            </div>
            <div className="info-card__row">
              <div style={{ color: 'var(--clr-dark)', flexShrink: 0, marginTop: '2px' }}>📞</div>
              <div>
                <div className="info-card__label">{copy.phone}</div>
                <div className="info-card__value">{restaurant.phone}</div>
              </div>
            </div>
            <div className="info-card__row">
              <div style={{ color: 'var(--clr-dark)', flexShrink: 0, marginTop: '2px' }}>🌐</div>
              <div>
                <div className="info-card__label">{copy.languages}</div>
                <div className="info-card__value">{restaurant.languages}</div>
              </div>
            </div>
            {/* Map placeholder */}
            <div style={{ height: '140px', background: 'linear-gradient(135deg,#e0d3cc,#d5c4ba)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginTop: '14px' }}>
              <span style={{ fontSize: '32px', opacity: 0.4 }}>🗺</span>
              <button
                style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--clr-dark)', color: '#fff', padding: '6px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                id="btn-view-map"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getMapsQuery(restaurant))}`, '_blank')}
              >
                {copy.viewMap}
              </button>
            </div>
          </div>

          {/* Amenities */}
          <div className="info-card">
            <h3 className="info-card__title">{copy.amenities}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {restaurant.amenities.map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--clr-muted)' }}>{a}</div>
              ))}
            </div>
          </div>

          {/* Promo */}
          <div style={{ background: 'var(--clr-dark)', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 16px rgba(108,47,0,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>{copy.promoLabel}</div>
            <div style={{ fontWeight: 700, fontSize: '18px', color: '#fff', lineHeight: 1.4, marginBottom: '16px' }}>{copy.promoText}</div>
            <button
              style={{ background: '#fff', color: 'var(--clr-dark)', border: 'none', borderRadius: '10px', padding: '8px 18px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.2s' }}
              id="btn-get-promo"
              onClick={handleGetPromo}
            >
              {promoCopied ? `✅ ${copy.promoCopied}` : copy.promoButton}
            </button>
          </div>
        </aside>
      </div>

      {/* ── Booking Modal ── */}
      {bookingOpen && (
        <div
          className="modal"
          id="modal-booking"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-booking-title"
          style={{ display: 'flex' }}
          onClick={e => { if (e.target === e.currentTarget) setBookingOpen(false); }}
        >
          <div className="modal__box" ref={modalRef}>
            <h3 className="modal__title" id="modal-booking-title">
              {copy.bookingTitle} — {restaurant.name}
            </h3>
            <form id="booking-form" onSubmit={handleBookingSubmit} noValidate>
              <div className="modal__field">
                <label className="modal__label" htmlFor="booking-date">{copy.date} <span style={{ color: '#e53e3e' }}>*</span></label>
                <input
                  type="date"
                  id="booking-date"
                  className={`modal__input${dateError ? ' is-error' : ''}`}
                  min={today}
                  value={bookingDate}
                  onChange={e => { setBookingDate(e.target.value); setDateError(false); }}
                  required
                />
                {dateError && <span className="field-error is-visible">{copy.dateRequired}</span>}
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="booking-time">{copy.time}</label>
                <select id="booking-time" className="modal__select" value={bookingTime} onChange={e => setBookingTime(e.target.value)}>
                  {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="booking-guests">{copy.guests}</label>
                <select id="booking-guests" className="modal__select" value={bookingGuests} onChange={e => setBookingGuests(e.target.value)}>
                  {GUEST_OPTIONS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="booking-note">{copy.note}</label>
                <input
                  type="text"
                  id="booking-note"
                  className="modal__input"
                  placeholder={copy.notePlaceholder}
                  value={bookingNote}
                  onChange={e => setBookingNote(e.target.value)}
                />
              </div>

              <div className="modal__actions">
                <button type="button" className="modal__cancel" id="btn-cancel-booking" onClick={() => setBookingOpen(false)}>
                  {copy.cancel}
                </button>
                <button type="submit" className="modal__submit" id="btn-confirm-booking" disabled={isSubmitting}>
                  {isSubmitting ? copy.submitting : copy.submitBooking}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {successOpen && (
        <div
          className="modal"
          id="modal-booking-success"
          style={{ display: 'flex' }}
          onClick={e => { if (e.target === e.currentTarget) setSuccessOpen(false); }}
        >
          <div className="modal__box" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontWeight: 700, fontSize: '22px', color: 'var(--clr-dark)', marginBottom: '8px' }}>{copy.successTitle}</h3>
            <p style={{ color: 'var(--clr-muted)', marginBottom: '8px' }}>
              {copy.successMessagePrefix} <strong>{restaurant.name}</strong>.
            </p>
            <p style={{ color: 'var(--clr-muted)', marginBottom: '24px' }}>
              {copy.successMessageSuffix}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="detail-book-btn"
                style={{ display: 'inline-flex' }}
                id="btn-close-success"
                onClick={() => setSuccessOpen(false)}
              >
                {copy.close}
              </button>
              <Link
                href="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'var(--clr-light)', color: 'var(--clr-dark)', borderRadius: '10px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
              >
                {copy.home}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
