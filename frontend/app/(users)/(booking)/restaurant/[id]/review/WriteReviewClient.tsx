"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function buildRestaurantDetailUrl(id: string) {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return new URL(`restaurants/${id}`, baseUrl).toString();
}

const VISIT_TYPES = ['Đi cùng gia đình', 'Đi cùng bạn bè', 'Đi cùng đối tác', 'Đi một mình'];

// ── Star Rating component ──
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating-interactive" id="star-rating" role="group" aria-label="Chọn số sao">
      {[5, 4, 3, 2, 1].map(star => (
        <button
          key={star}
          type="button"
          className={`star-btn${(hovered || value) >= star ? ' star-btn--active' : ''}`}
          aria-label={`${star} sao`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function WriteReviewClient() {
  const params = useParams();
  const router = useRouter();

  const restaurantIdParam = params?.id;
  const restaurantId = Array.isArray(restaurantIdParam)
    ? restaurantIdParam[0]
    : restaurantIdParam || '1';

  // ── Restaurant state ──
  const [restaurant, setRestaurant] = useState<any>({
    id: restaurantId,
    name: 'Miyabi Japanese Dining',
    address: '123 Kim Mã, Quận Ba Đình, Hà Nội',
    rating: 4.9,
    reviewCount: 240,
    phone: '+84 28 3823 4567',
    hours: '10:00 - 22:00 (Hàng ngày)',
    languages: 'Tiếng Việt, Tiếng Nhật, English',
    amenities: ['📶 Free Wifi', '🅿️ Free Parking', '💳 Cards Accepted', '♿ Accessibility'],
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadRestaurant() {
      if (!restaurantId) return;
      try {
        const response = await fetch(buildRestaurantDetailUrl(restaurantId), {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          const rawImageUrl = data.imageUrl || data.image_url;
          const imageUrl = (rawImageUrl && rawImageUrl !== 'null' && rawImageUrl !== 'undefined')
            ? rawImageUrl
            : 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80';

          setRestaurant({
            id: data.id,
            name: data.name,
            address: data.address || 'Chưa cập nhật địa chỉ',
            rating: Number(data.rating ?? 4.9),
            reviewCount: 240,
            phone: data.phone || 'Chưa cập nhật',
            hours: '10:00 - 22:00 (Hàng ngày)',
            languages: (data.hasJapaneseSupport || data.has_japanese_support)
              ? 'Tiếng Việt, Tiếng Nhật, English'
              : 'Tiếng Việt, English',
            amenities: ['📶 Free Wifi', '🅿️ Free Parking', '💳 Cards Accepted', '♿ Accessibility'],
            imageUrl,
          });
        }
      } catch (error) {
        console.error('Failed to load restaurant in WriteReview:', error);
      }
    }
    loadRestaurant();
    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  // ── Form state ──
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitType, setVisitType] = useState(VISIT_TYPES[0]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Validation errors ──
  const [errors, setErrors] = useState({ rating: false, title: false, content: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Photo upload handler ──
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setPhotos(files);
    const readers = files.map(file => new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(setPreviews);
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Form submit ──
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      rating: rating === 0,
      title: !title.trim(),
      content: !content.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsSubmitting(true);

    // Save to localStorage (sẽ thay bằng API call)
    const review = {
      restaurantId: String(restaurantId),
      restaurantName: restaurant.name,
      rating,
      title: title.trim(),
      content: content.trim(),
      visitDate,
      visitType,
      author: 'Bạn',
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('meshimap_reviews') || '[]');
    existing.push(review);
    localStorage.setItem('meshimap_reviews', JSON.stringify(existing));

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      // Auto-redirect sau 2.5s
      setTimeout(() => {
        window.location.href = `/restaurant/${restaurantId}`;
      }, 2500);
    }, 700);
  }, [rating, title, content, visitDate, visitType, restaurantId, restaurant.name]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="review-hero" aria-label="Ảnh nhà hàng">
        <div
          className="review-hero__it;ty6=mg"
          style={{
            background: `url('${restaurant.imageUrl}') center/cover no-repeat`,
          }}
        />
        <div className="review-hero__overlay" />
      </section>

      {/* ── Info card ── */}
      <div className="review-info-card">
        <div className="review-info-card__inner">
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
              <span className="detail-tag">Japanese Speaking</span>
              <span className="detail-tag detail-tag--green">Hygiene Certified</span>
            </div>
            <h1 style={{ fontWeight: 700, fontSize: '20px', color: 'var(--clr-dark)', marginBottom: '4px' }}>{restaurant.name}</h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--clr-muted)' }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="#8A8A8A" strokeWidth="1.2" />
                </svg>
                {restaurant.address}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--clr-yellow)' }}>
                ★★★★★ <span style={{ color: 'var(--clr-muted)' }}>({restaurant.rating.toFixed(1)}/5 • {restaurant.reviewCount} reviews)</span>
              </span>
            </div>
          </div>
          <Link
            href={`/restaurant/${restaurantId}`}
            className="detail-book-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            id="btn-back-detail"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="2" stroke="#fff" strokeWidth="1.3" />
              <path d="M2 7h12M5 1v4M11 1v4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Đặt bàn
          </Link>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="review-main">
        {/* Left sidebar */}
        <aside className="review-sidebar">
          <div className="info-card">
            <h3 className="info-card__title">Thông tin liên hệ</h3>
            <div className="info-card__row">
              <div><div className="info-card__label">Giờ mở cửa</div><div className="info-card__value">{restaurant.hours}</div></div>
            </div>
            <div className="info-card__row">
              <div><div className="info-card__label">Điện thoại</div><div className="info-card__value">{restaurant.phone}</div></div>
            </div>
            <div className="info-card__row">
              <div><div className="info-card__label">Ngôn ngữ hỗ trợ</div><div className="info-card__value">{restaurant.languages}</div></div>
            </div>
            <div style={{ height: '110px', background: 'linear-gradient(135deg,#e0d3cc,#d5c4ba)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: '14px' }}>
              <span style={{ fontSize: '28px', opacity: 0.4 }}>🗺</span>
              <button
                style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: 'var(--clr-dark)', color: '#fff', padding: '5px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                id="btn-map"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`, '_blank')}
              >
                Xem bản đồ
              </button>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card__title">Tiện ích</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {restaurant.amenities.map((a: string) => (
                <div key={a} style={{ fontSize: '12px', color: 'var(--clr-muted)' }}>{a}</div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--clr-dark)', borderRadius: '12px', padding: '18px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>Ưu đãi đặc biệt</div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', lineHeight: 1.4, marginBottom: '14px' }}>Giảm 15% cho lần đặt bàn đầu tiên</div>
            <Link href={`/restaurant/${restaurantId}`} style={{ background: '#fff', color: 'var(--clr-dark)', borderRadius: '8px', padding: '7px 16px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '12px', textDecoration: 'none', display: 'inline-block' }}>
              Đặt bàn ngay
            </Link>
          </div>
        </aside>

        {/* Review form */}
        <div className="review-form-card" role="main">
          {/* Success banner */}
          {showSuccess && (
            <div className="success-banner is-visible" id="success-banner">
              ✅ Đánh giá đã được gửi thành công! Đang chuyển hướng...
            </div>
          )}

          <form id="review-form" onSubmit={handleSubmit} noValidate>
            {/* Star rating */}
            <div className="review-section">
              <div className="review-section__title">Trải nghiệm của bạn như thế nào</div>
              <div className="review-section__sub">Nhấn vào sao để đánh giá</div>
              <StarRating value={rating} onChange={setRating} />
              {errors.rating && (
                <span className="error-msg is-visible" id="star-error">Vui lòng chọn số sao.</span>
              )}
            </div>

            {/* Review text */}
            <div className="review-section">
              <div className="review-section__title">Đánh giá của bạn</div>
              <div className="review-section__sub">Chia sẻ cảm nhận chi tiết của bạn</div>

              <div className="review-field">
                <label className="review-label" htmlFor="review-title">
                  Tiêu đề đánh giá <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="text"
                  id="review-title"
                  className={`review-input${errors.title ? ' is-error' : ''}`}
                  placeholder="Tóm tắt trải nghiệm của bạn..."
                  value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: false })); }}
                  required
                />
                {errors.title && <span className="error-msg is-visible" id="title-error">Vui lòng nhập tiêu đề đánh giá.</span>}
              </div>

              <div className="review-field">
                <label className="review-label" htmlFor="review-content">
                  Nội dung <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <textarea
                  id="review-content"
                  className={`review-textarea${errors.content ? ' is-error' : ''}`}
                  placeholder="Viết cảm nhận của bạn về nhà hàng, món ăn, phục vụ..."
                  maxLength={500}
                  value={content}
                  onChange={e => { setContent(e.target.value); setErrors(prev => ({ ...prev, content: false })); }}
                  required
                />
                <div style={{ fontSize: '12px', color: 'var(--clr-muted)', textAlign: 'right', marginTop: '4px' }}>
                  {content.length} / 500 ký tự
                </div>
                {errors.content && <span className="error-msg is-visible" id="content-error">Vui lòng nhập nội dung đánh giá.</span>}
              </div>
            </div>

            {/* Visit info */}
            <div className="review-section">
              <div className="review-section__title">Thông tin chuyến đi</div>

              <div className="review-field">
                <label className="review-label" htmlFor="visit-date">Ngày đến</label>
                <input
                  type="date"
                  id="visit-date"
                  className="review-input"
                  max={new Date().toISOString().split('T')[0]}
                  value={visitDate}
                  onChange={e => setVisitDate(e.target.value)}
                />
              </div>

              <div className="review-field">
                <label className="review-label" htmlFor="visit-type">Hình thức</label>
                <select
                  id="visit-type"
                  className="review-select"
                  value={visitType}
                  onChange={e => setVisitType(e.target.value)}
                >
                  {VISIT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Photo upload */}
            <div className="review-section">
              <div className="review-section__title">Hình ảnh</div>
              <div
                className="upload-area"
                id="upload-area"
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--clr-dark)', marginBottom: '4px' }}>Thêm ảnh của bạn</div>
                <div style={{ fontSize: '12px', color: 'var(--clr-muted)' }}>PNG, JPG tối đa 5 ảnh</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                id="photo-upload"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              {previews.length > 0 && (
                <div id="upload-preview" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {previews.map((src, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Ảnh ${idx + 1}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--clr-border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '50%', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                        aria-label="Xóa ảnh"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="review-submit"
              id="btn-submit-review"
              disabled={isSubmitting || showSuccess}
            >
              {isSubmitting ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Đang gửi...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 16L16 2M16 2H6M16 2V12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Gửi đánh giá
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
