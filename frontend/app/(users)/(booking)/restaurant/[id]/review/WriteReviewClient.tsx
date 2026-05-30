"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getBeautifulImage } from '@/utils/image';
import { writeReviewCopy, useAppLanguage } from '@/config/i18n';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function buildRestaurantDetailUrl(id: string) {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return new URL(`restaurants/${id}`, baseUrl).toString();
}

const VISIT_TYPES_KEYS = ['family', 'friends', 'partner', 'solo'];

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
  const { language } = useAppLanguage();
  const copy = writeReviewCopy[language];

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
    hours: language === 'ja' ? '10:00 - 22:00 (毎日)' : '10:00 - 22:00 (Hàng ngày)',
    languages: language === 'ja' ? 'ベトナム語、日本語、英語' : 'Tiếng Việt, Tiếng Nhật, English',
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
          const imageUrl = getBeautifulImage(data.imageUrl || data.image_url, data.name);

          setRestaurant({
            id: data.id,
            name: data.name,
            address: data.address || (language === 'ja' ? '住所未登録' : 'Chưa cập nhật địa chỉ'),
            rating: Number(data.rating ?? 4.9),
            reviewCount: 240,
            phone: data.phone || (language === 'ja' ? '未登録' : 'Chưa cập nhật'),
            hours: language === 'ja' ? '10:00 - 22:00 (毎日)' : '10:00 - 22:00 (Hàng ngày)',
            languages: (data.hasJapaneseSupport || data.has_japanese_support)
              ? (language === 'ja' ? 'ベトナム語、日本語、英語' : 'Tiếng Việt, Tiếng Nhật, English')
              : (language === 'ja' ? 'ベトナム語、英語' : 'Tiếng Việt, English'),
            amenities: language === 'ja' 
              ? ['📶 無料Wi-Fi', '🅿️ 無料駐車場', '💳 カード支払い可']
              : ['📶 Free Wifi', '🅿️ Free Parking', '💳 Cards Accepted'],
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
  }, [restaurantId, language]);

  // ── Form state ──
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitType, setVisitType] = useState(VISIT_TYPES_KEYS[0]);
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
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      rating: rating === 0,
      title: !title.trim(),
      content: !content.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsSubmitting(true);

    try {
      const token = Cookies.get('access_token');
      
      const res = await fetch(`${API_BASE_URL}/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          stars: rating,
          title: title.trim(),
          content: content.trim(),
          visitDate: visitDate || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Gửi đánh giá thất bại');
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      // Auto-redirect sau 2.5s
      setTimeout(() => {
        window.location.href = `/restaurant/${restaurantId}`;
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert(language === 'ja' ? 'レビューの送信中にエラーが発生しました。ログインし直してからもう一度お試しください。' : 'Đã xảy ra lỗi khi gửi đánh giá. Vui lòng đăng nhập lại và thử lại.');
    }
  }, [rating, title, content, visitDate, restaurantId, language]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="review-hero" aria-label={copy.heroLabel}>
        <div
          className="review-hero__img"
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
              <span className="detail-tag">{language === 'ja' ? '日本語対応' : 'Hỗ trợ tiếng Nhật'}</span>
              <span className="detail-tag detail-tag--green">{language === 'ja' ? '衛生証明済' : 'Chứng nhận vệ sinh'}</span>
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
                ★★★★★ <span style={{ color: 'var(--clr-muted)' }}>({restaurant.rating.toFixed(1)}/5 • {restaurant.reviewCount} {language === 'ja' ? '件のレビュー' : 'đánh giá'})</span>
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
            {language === 'ja' ? '予約' : 'Đặt bàn'}
          </Link>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="review-main">
        {/* Left sidebar */}
        <aside className="review-sidebar">
          <div className="info-card">
            <h3 className="info-card__title">{copy.contact}</h3>
            <div className="info-card__row">
              <div><div className="info-card__label">{copy.hours}</div><div className="info-card__value">{restaurant.hours}</div></div>
            </div>
            <div className="info-card__row">
              <div><div className="info-card__label">{copy.phone}</div><div className="info-card__value">{restaurant.phone}</div></div>
            </div>
            <div className="info-card__row">
              <div><div className="info-card__label">{copy.languages}</div><div className="info-card__value">{restaurant.languages}</div></div>
            </div>
            <div style={{ height: '110px', background: 'linear-gradient(135deg,#e0d3cc,#d5c4ba)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: '14px' }}>
              <span style={{ fontSize: '28px', opacity: 0.4 }}>🗺</span>
              <button
                style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: 'var(--clr-dark)', color: '#fff', padding: '5px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                id="btn-map"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`, '_blank')}
              >
                {copy.viewMap}
              </button>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card__title">{copy.amenities}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {restaurant.amenities.map((a: string) => (
                <div key={a} style={{ fontSize: '12px', color: 'var(--clr-muted)' }}>{a}</div>
              ))}
            </div>
          </div>
        </aside>

        {/* Review form */}
        <div className="review-form-card" role="main">
          {/* Success banner */}
          {showSuccess && (
            <div className="success-banner is-visible" id="success-banner">
              ✅ {copy.success}
            </div>
          )}

          <form id="review-form" onSubmit={handleSubmit} noValidate>
            {/* Star rating */}
            <div className="review-section">
              <div className="review-section__title">{copy.ratingLabel}</div>
              <div className="review-section__sub">{copy.starsSub}</div>
              <StarRating value={rating} onChange={setRating} />
              {errors.rating && (
                <span className="error-msg is-visible" id="star-error">{copy.starsError}</span>
              )}
            </div>

            {/* Review text */}
            <div className="review-section">
              <div className="review-section__title">{language === 'ja' ? 'あなたのレビュー' : 'Đánh giá của bạn'}</div>
              <div className="review-section__sub">{language === 'ja' ? '詳細な感想を教えてください' : 'Chia sẻ cảm nhận chi tiết của bạn'}</div>

              <div className="review-field">
                <label className="review-label" htmlFor="review-title">
                  {copy.titleLabel} <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="text"
                  id="review-title"
                  className={`review-input${errors.title ? ' is-error' : ''}`}
                  placeholder={copy.titlePlaceholder}
                  value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: false })); }}
                  required
                />
                {errors.title && <span className="error-msg is-visible" id="title-error">{copy.titleError}</span>}
              </div>

              <div className="review-field">
                <label className="review-label" htmlFor="review-content">
                  {copy.contentLabel} <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <textarea
                  id="review-content"
                  className={`review-textarea${errors.content ? ' is-error' : ''}`}
                  placeholder={copy.contentPlaceholder}
                  maxLength={500}
                  value={content}
                  onChange={e => { setContent(e.target.value); setErrors(prev => ({ ...prev, content: false })); }}
                  required
                />
                <div style={{ fontSize: '12px', color: 'var(--clr-muted)', textAlign: 'right', marginTop: '4px' }}>
                  {copy.contentLimit.replace('{{current}}', String(content.length))}
                </div>
                {errors.content && <span className="error-msg is-visible" id="content-error">{copy.contentError}</span>}
              </div>
            </div>

            {/* Visit info */}
            <div className="review-section">
              <div className="review-section__title">{copy.visitInfo}</div>

              <div className="review-field">
                <label className="review-label" htmlFor="visit-date">{copy.visitDate}</label>
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
                <label className="review-label" htmlFor="visit-type">{copy.visitType}</label>
                <select
                  id="visit-type"
                  className="review-select"
                  value={visitType}
                  onChange={e => setVisitType(e.target.value)}
                >
                  {VISIT_TYPES_KEYS.map(key => (
                    <option key={key} value={key}>
                      {copy.visitTypes[key as keyof typeof copy.visitTypes]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo upload */}
            <div className="review-section">
              <div className="review-section__title">{copy.photos}</div>
              <div
                className="upload-area"
                id="upload-area"
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--clr-dark)', marginBottom: '4px' }}>{copy.addPhoto}</div>
                <div style={{ fontSize: '12px', color: 'var(--clr-muted)' }}>{copy.photoLimit}</div>
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
                        alt={(language === 'ja' ? '写真' : 'Ảnh') + ' ' + (idx + 1)}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--clr-border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '50%', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                        aria-label={copy.removePhoto}
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
                  {copy.submitting}
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 16L16 2M16 2H6M16 2V12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {copy.submit}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
