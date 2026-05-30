"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { detailCopy, useAppLanguage } from '@/config/i18n';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

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

const MENU_ITEM_IMAGES: Record<string, string> = {
  'Premium Sashimi Set': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
  'Sashimi Deluxe': 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80',
  'Tempura Set': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  'Tonkotsu Ramen': 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=600&q=80',
  'Shoyu Ramen': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
  'Matcha Ice Cream': 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80',
};

const MENU_ITEM_EMOJIS: Record<string, string> = {
  'sashimi': '🐟',
  'tempura': '🍤',
  'ramen': '🍜',
  'dessert': '🍡',
};

function normalizeRestaurantDetail(raw: Partial<ApiRestaurant> & { menuItems?: any[], hours?: string, languages?: string, reviewCount?: number }, fallbackId: string, language: string): RestaurantDetail | null {
  const id = Number(raw.id ?? fallbackId);
  const latitude = Number(raw.latitude);
  const longitude = Number(raw.longitude);

  if (!Number.isFinite(id) || !raw.name) {
    return null;
  }

  const category = raw.category || 'other';
  const hasJapaneseSupport = Boolean(raw.hasJapaneseSupport);
  const categoryLabel = CATEGORY_LABELS.get(category) || category;
  const isJa = language === 'ja';

  const rawMenuItems = raw.menuItems || [];
  const menuItems = rawMenuItems.map((item: any) => {
    // 1. Áp dụng logic dịch tên món ăn
    const displayName = (isJa && item.nameJp) ? String(item.nameJp).trim() : String(item.name || '').trim();
    
    const rawItemImageUrl = item.imageUrl || item.image_url;

    // Case-insensitive lookup in MENU_ITEM_IMAGES
    const fallbackImageKey = Object.keys(MENU_ITEM_IMAGES).find(
      key => key.toLowerCase() === displayName.toLowerCase()
    );

    const itemImageUrl = (rawItemImageUrl && rawItemImageUrl !== 'null' && rawItemImageUrl !== 'undefined')
      ? rawItemImageUrl
      : (fallbackImageKey ? MENU_ITEM_IMAGES[fallbackImageKey] : null);

    // 2. Áp dụng logic dịch mô tả món ăn
    const displayDesc = (isJa && item.descJp) ? item.descJp : (item.desc || item.description || '');

    return {
      id: Number(item.id),
      cat: item.category || 'other',
      emoji: MENU_ITEM_EMOJIS[item.category] || '🍽️',
      imageUrl: itemImageUrl,
      name: displayName, // ➔ Sử dụng tên đã được xử lý dịch
      price: item.price || '0đ',
      desc: displayDesc, // ➔ Sử dụng mô tả đã được xử lý dịch
      badge: item.badge || '',
    };
  });

  const rawImageUrl = raw.imageUrl || raw.imageUrl;
  const imageUrl = (rawImageUrl && rawImageUrl !== 'null' && rawImageUrl !== 'undefined')
    ? rawImageUrl
    : 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80';

  return {
    id,
    name: String(raw.name),
    nameJp: raw.nameJp ?? null,
    category,
    rating: Number(raw.rating ?? 0),
    address: raw.address || (isJa ? '住所未登録' : 'Chưa cập nhật địa chỉ'),
    district: raw.district ?? null,
    city: raw.city ?? null,
    latitude: Number.isFinite(latitude) ? latitude : 0,
    longitude: Number.isFinite(longitude) ? longitude : 0,
    description: raw.description ?? null,
    phone: raw.phone || (isJa ? '未登録' : 'Chưa cập nhật'),
    imageUrl,
    hasJapaneseSupport,
    reviewCount: raw.reviewCount || 0,
    hours: (typeof raw.hours === 'object' && raw.hours !== null)
      ? `${Object.values(raw.hours)[0]} ${isJa ? '(毎日)' : '(Hàng ngày)'}`
      : (raw.hours || (isJa ? '未登録' : 'Chưa cập nhật')),
    languages: raw.languages || (hasJapaneseSupport
      ? (isJa ? 'ベトナム語、日本語、英語' : 'Tiếng Việt, Tiếng Nhật, English')
      : (isJa ? 'ベトナム語、英語' : 'Tiếng Việt, English')),
    tags: [
      categoryLabel,
      hasJapaneseSupport
        ? (isJa ? '日本語対応' : 'Japanese Speaking')
        : (isJa ? '和食スタイル' : 'Japanese Style'),
    ],
    amenities: isJa ? ['📶 無料Wi-Fi', '💳 カード支払い可'] : ['📶 Free Wifi', '💳 Cards Accepted'],
    menuItems: menuItems.length > 0 ? menuItems : undefined,
  } as any;
}

function getMapsQuery(restaurant: RestaurantDetail) {
  if (Number.isFinite(restaurant.latitude) && Number.isFinite(restaurant.longitude)) {
    return `${restaurant.latitude},${restaurant.longitude}`;
  }

  return restaurant.address;
}


const MENU_CATS = [
  { key: 'all', label: 'Tất cả (All)' },
  { key: 'sashimi', label: 'Sashimi' },
  { key: 'tempura', label: 'Tempura' },
  { key: 'ramen', label: 'Ramen' },
  { key: 'dessert', label: 'Desserts' },
];

const TIME_SLOTS = ['11:00', '12:00', '13:00', '18:00', '19:00', '20:00', '21:00'];
const GUEST_OPTIONS = [1, 2, 3, 4, 5];

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
  const router = useRouter();
  const { language } = useAppLanguage();
  const copy = detailCopy[language];
  const menuCats = [
    { key: 'all', label: language === 'ja' ? 'すべて' : 'Tất cả' },
    { key: 'sashimi', label: 'Sashimi' },
    { key: 'tempura', label: 'Tempura' },
    { key: 'ramen', label: 'Ramen' },
    { key: 'dessert', label: language === 'ja' ? 'デザート' : 'Tráng miệng' },
  ];
  const restaurantIdParam = params?.id;
  const restaurantId = Array.isArray(restaurantIdParam)
    ? restaurantIdParam[0]
    : restaurantIdParam || String(1);

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState('');

  // ── Reviews state ──
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchReviews() {
      try {
        const res = await fetch(`${API_BASE_URL}/review/restaurant/${restaurantId}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        if (isMounted) {
          const formattedReviews = data.map((r: any) => {
            const dateObj = new Date(r.createdAt);
            const author = r.user?.name || (language === 'ja' ? 'ゲスト' : 'Khách');
            const date = language === 'ja'
              ? `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月`
              : `Tháng ${dateObj.getMonth() + 1}, ${dateObj.getFullYear()}`;
            return {
              id: r.id,
              author,
              initial: author.charAt(0).toUpperCase(),
              date,
              stars: r.stars,
              text: r.title ? `${r.title} — ${r.content}` : r.content,
              ownerReply: r.ownerReply || r.owner_reply || null,
            };
          });
          setReviews(formattedReviews);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setReviews([]);
      }
    }
    fetchReviews();
    return () => { isMounted = false; };
  }, [restaurantId, language]);

  // ── Menu state ──
  const [activeCat, setActiveCat] = useState('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuSearchInput, setMenuSearchInput] = useState('');

  // ── Booking modal state ──
  const [bookingOpen, setBookingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('18:00');
  const [bookingGuests, setBookingGuests] = useState(2);
  const [bookingNote, setBookingNote] = useState('');
  const [dateError, setDateError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const normalized = normalizeRestaurantDetail(data, restaurantId, language);

        if (!normalized) {
          throw new Error('Dữ liệu nhà hàng không hợp lệ');
        }

        if (isMounted) {
          setRestaurant(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setRestaurant(null);
          setRestaurantError(
            error instanceof Error
              ? (language === 'ja'
                ? `Không tải được chi tiết nhà hàng (${error.message}).`
                : `Không tải được chi tiết nhà hàng (${error.message}).`)
              : 'Không tải được chi tiết nhà hàng.',
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
  }, [restaurantId, language]);

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
    const itemsSource = (restaurant as any)?.menuItems || [];
    return itemsSource.filter((item: any) => {
      const matchCat = activeCat === 'all' || item.cat === activeCat;
      const q = menuSearch.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [restaurant, activeCat, menuSearch]);

  // ── Booking submit ──
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      setDateError(true);
      return;
    }
    setDateError(false);
    setIsSubmitting(true);

    try {
      const token = Cookies.get('access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/booking`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          date: bookingDate,
          time: bookingTime,
          guests: bookingGuests,
          note: bookingNote,
        }),
      });

      if (!res.ok) throw new Error('Booking failed');

      setTimeout(() => {
        setIsSubmitting(false);
        setBookingOpen(false);
        router.push(
          `/booking-success?restaurantId=${restaurantId}&restaurantName=${encodeURIComponent(
            restaurant?.name || ''
          )}&date=${bookingDate}&time=${bookingTime}&guests=${bookingGuests}`
        );
        setBookingDate('');
        setBookingNote('');
      }, 600);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      toast.error(
        language === 'ja'
          ? '予約中にエラーが発生しました。もう一度お試しください。'
          : 'Đã xảy ra lỗi khi đặt bàn. Vui lòng thử lại.'
      );
    }
  };

  const openBooking = () => {
    const token = Cookies.get('access_token');
    if (!token) {
      toast.error(
        language === 'ja'
          ? '予約するにはログインしてください。'
          : 'Vui lòng đăng nhập để thực hiện đặt bàn!'
      );
      router.push('/login');
      return;
    }
    setBookingOpen(true);
    setDateError(false);
  };

  const handleGetPromo = () => {
    navigator.clipboard?.writeText('MESHIMAP15').catch(() => { });
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2500);
  };

  const today = new Date().toISOString().split('T')[0];
  const menuItems = filteredMenu();

  if (restaurantLoading && !restaurant) {
    return <div style={{ padding: '100px', textAlign: 'center', color: '#888' }}>{language === 'ja' ? 'データを読み込み中...' : 'Đang tải dữ liệu...'}</div>;
  }
  if (!restaurant) {
    return <div style={{ padding: '100px', textAlign: 'center', color: '#888' }}>{language === 'ja' ? 'レストランが見つかりません。' : 'Không tìm thấy nhà hàng.'}</div>;
  }

  const localReviewsCount = reviews.filter(r => String(r.id).startsWith('local-')).length;
  const displayReviewCount = restaurant.reviewCount + localReviewsCount;
  const displayRating = localReviewsCount > 0
    ? (restaurant.rating * restaurant.reviewCount + reviews.filter(r => String(r.id).startsWith('local-')).reduce((sum, r) => sum + r.stars, 0)) / displayReviewCount
    : restaurant.rating;
  const starCount = getSafeRating(displayRating);

  return (
    <>
      {/* ── Hero ── */}
      <section className="detail-hero" aria-label={copy.heroLabel} id="detail-hero">
        <div
          className="detail-hero__img"
          style={{
            background: `url('${restaurant.imageUrl}') center/cover no-repeat`,
          }}
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
            <h1 className="detail-name">
              {language === 'ja' && restaurant.nameJp ? restaurant.nameJp : restaurant.name}
            </h1>
            {restaurant.nameJp && language !== 'ja' && (
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
                ({displayRating.toFixed(1)}/5 • {displayReviewCount} {language === 'ja' ? 'レビュー' : 'reviews'})
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
            {menuCats.map((cat: { key: string, label: string }) => (
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
              menuItems.map((item: any) => (
                <div key={item.id} className="menu-item" data-cat={item.cat}>
                  <div className="menu-item__img">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      item.emoji || '🍽️'
                    )}
                  </div>
                  <div className="menu-item__body">
                    <div className="menu-item__name">
                      {item.name}
                    </div>
                    <div className="menu-item__price">{item.price}</div>
                    <p style={{ fontSize: '12px', color: 'var(--clr-muted)', lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
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

            {reviews.map(review => (
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
                {review.ownerReply && (
                  <div className="review__reply">
                    <div className="review__reply-title">{copy.ownerReply || 'Phản hồi của chủ nhà hàng'}:</div>
                    <p className="review__reply-text">"{review.ownerReply}"</p>
                  </div>
                )}
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
                <select id="booking-guests" className="modal__select" value={bookingGuests} onChange={e => setBookingGuests(Number(e.target.value))}>
                  {GUEST_OPTIONS.map(g => (
                    <option key={g} value={g}>
                      {g === 5
                        ? (language === 'ja' ? '5人以上' : '5+ người')
                        : (language === 'ja' ? `${g}人` : `${g} người`)}
                    </option>
                  ))}
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
