'use client';

import { useEffect, useState } from 'react';
import OwnerHeader from '../components/OwnerHeader';
import Cookies from 'js-cookie';
import { useAppLanguage, ownerCopy } from '@/config/i18n';
import { notFound } from 'next/navigation';

export default function OwnerReviewsPage() {
  const { language } = useAppLanguage();
  const copy = ownerCopy[language];

  const [reviews, setReviews] = useState<any[]>([]);
  const [filterStars, setFilterStars] = useState('all');
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [alertMsg, setAlertMsg] = useState<{msg: string, type: string} | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  if (isNotFound) {
    notFound();
  }

  const fetchReviews = async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      showAlert(copy.alertNoSession, 'warning');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/review/my-restaurant', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        showAlert(copy.alertSessionExpired, 'warning');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (res.status === 404) {
        setIsNotFound(true);
        return;
      }

      if (!res.ok) {
        throw new Error('Error');
      }

      const data = await res.json();
      const mappedReviews = data.map((item: any) => ({
        id: item.id,
        author: item.user?.name || item.user?.email || (language === 'vi' ? 'Ẩn danh' : '匿名'),
        rating: item.stars,
        date: new Date(item.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        content: item.content,
        replies: item.ownerReply ? [item.ownerReply] : [],
        reported: item.isReported,
        reportReason: item.reportReason,
      }));

      setReviews(mappedReviews);
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || 'Error', 'warning');
    }
  };

  useEffect(() => {
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleReport = async (id: number) => {
    if (!window.confirm(copy.confirmReport)) {
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) {
      showAlert(copy.alertNoToken, 'warning');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/review/${id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Owner reported: Nội dung không chính xác hoặc phỉ báng.' })
      });

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        showAlert(copy.alertSessionExpired, 'warning');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error');
      }

      showAlert(copy.alertReportSuccess, 'warning');
      fetchReviews();
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || 'Error', 'warning');
    }
  };

  const handleReplySubmit = async (id: number) => {
    if (!replyText.trim()) return;

    const token = Cookies.get('access_token');
    if (!token) {
      showAlert(copy.alertNoToken, 'warning');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/review/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ replyText: replyText.trim() })
      });

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        showAlert(copy.alertSessionExpired, 'warning');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error');
      }

      showAlert(copy.alertReplySuccess);
      setReplyText('');
      setReplyingId(null);
      fetchReviews();
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || 'Error', 'warning');
    }
  };

  const filteredReviews = reviews.filter(r => filterStars === 'all' || String(r.rating) === filterStars);

  return (
    <>
      <OwnerHeader title={copy.reviewsTitle} />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        <div className="db-card">
          <div className="db-card__title">
            <span>{copy.reviewsCardTitle}</span>
            <select className="db-select" style={{ padding: '6px 12px', fontSize: 13 }} value={filterStars} onChange={e => setFilterStars(e.target.value)}>
              <option value="all">{copy.filterStarsAll}</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 {language === 'vi' ? 'sao' : '星'})</option>
              <option value="4">⭐⭐⭐⭐ (4 {language === 'vi' ? 'sao' : '星'})</option>
              <option value="3">⭐⭐⭐ (3 {language === 'vi' ? 'sao' : '星'})</option>
              <option value="2">⭐⭐ (2 {language === 'vi' ? 'sao' : '星'})</option>
              <option value="1">⭐ (1 {language === 'vi' ? 'sao' : '星'})</option>
            </select>
          </div>

          <div>
            {filteredReviews.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--clr-muted)' }}>
                {copy.noReviews}
              </div>
            )}
            {filteredReviews.map((rev) => (
              <div className="db-review-item" key={rev.id}>
                <div className="db-review-header">
                  <div>
                    <span className="db-review-author">{rev.author}</span>
                    <span className="db-review-date" style={{ marginLeft: 8 }}>{rev.date}</span>
                    {rev.reported ? (
                      <span className="db-badge db-badge--reported" style={{ marginLeft: 10 }}>{copy.badgeReported}</span>
                    ) : (
                      <button className="btn btn--outline" style={{ padding: '2px 8px', fontSize: 11, marginLeft: 10, borderColor: '#dc2626', color: '#dc2626' }} onClick={() => handleReport(rev.id)}>
                        {copy.actionReport}
                      </button>
                    )}
                  </div>
                  <div className="db-review-stars">
                    {'⭐'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                </div>
                {rev.content ? (
                  <p className="db-review-content">"{rev.content}"</p>
                ) : (
                  <p className="db-review-content" style={{ color: 'var(--clr-muted)', fontStyle: 'italic', fontSize: 13 }}>
                    {copy.contentCleared}
                  </p>
                )}
                
                {rev.replies?.map((rep: string, i: number) => (
                  <div className="db-review-reply-box" style={{ marginTop: 8 }} key={i}>
                    <strong>{copy.replyHeader}</strong>
                    <p style={{ marginTop: 4, fontStyle: 'italic' }}>"{rep}"</p>
                  </div>
                ))}

                <div style={{ marginTop: 8 }}>
                  <button className="db-review-reply-btn" onClick={() => { setReplyingId(replyingId === rev.id ? null : rev.id); setReplyText(''); }}>
                    {copy.actionReply}
                  </button>
                  {replyingId === rev.id && (
                    <div style={{ marginTop: 8 }}>
                      <textarea className="db-textarea" style={{ width: '100%', minHeight: 60 }} placeholder={copy.replyPlaceholder} 
                        value={replyText} onChange={e => setReplyText(e.target.value)} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <button className="btn btn--outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setReplyingId(null)}>{copy.cancel}</button>
                        <button className="btn btn--primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => handleReplySubmit(rev.id)}>{copy.replySubmit}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
