'use client';

import { useEffect, useState } from 'react';
import OwnerHeader from '../components/OwnerHeader';

export default function OwnerReviewsPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filterStars, setFilterStars] = useState('all');
  const [replyingIndex, setReplyingIndex] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [alertMsg, setAlertMsg] = useState<{msg: string, type: string} | null>(null);

  const loadData = () => {
    let currentRes = JSON.parse(localStorage.getItem('meshimap_restaurant') || '{}');
    if (!currentRes.reviews) currentRes.reviews = [];

    const storedReviews = JSON.parse(localStorage.getItem('meshimap_reviews') || '[]');
    const combinedReviews = [...currentRes.reviews];

    let hasChanges = false;
    storedReviews.forEach((ur: any) => {
      if (!combinedReviews.some((cr: any) => cr.content === ur.content && cr.author === ur.author)) {
        combinedReviews.push({
          author: ur.author,
          rating: parseInt(ur.rating) || 5,
          date: ur.date || 'Tháng 5, 2026',
          content: ur.content,
          replies: ur.replies || [],
          reported: ur.reported || false,
          deleted: ur.deleted || false
        });
        hasChanges = true;
      }
    });

    if (hasChanges) {
      currentRes.reviews = combinedReviews;
      localStorage.setItem('meshimap_restaurant', JSON.stringify(currentRes));
    }

    setRestaurant(currentRes);
    setReviews(combinedReviews.filter(r => !r.deleted));
  };

  useEffect(() => {
    loadData();
  }, []);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleReport = (contentKey: string) => {
    if (window.confirm('Bạn có chắc chắn muốn báo cáo đánh giá này là vi phạm tiêu chuẩn cộng đồng không?')) {
      const idx = restaurant.reviews.findIndex((r: any) => r.content === contentKey);
      if (idx !== -1) {
        restaurant.reviews[idx].reported = true;
        restaurant.reviews[idx].reportReason = 'Owner reported: Nội dung không chính xác hoặc phỉ báng.';
        localStorage.setItem('meshimap_restaurant', JSON.stringify(restaurant));
      }

      const storedReviews = JSON.parse(localStorage.getItem('meshimap_reviews') || '[]');
      const storedIdx = storedReviews.findIndex((r: any) => r.content === contentKey);
      if (storedIdx !== -1) {
        storedReviews[storedIdx].reported = true;
        storedReviews[storedIdx].reportReason = 'Owner reported: Nội dung không chính xác hoặc phỉ báng.';
        localStorage.setItem('meshimap_reviews', JSON.stringify(storedReviews));
      }

      showAlert('Đã gửi báo cáo vi phạm. Đang chờ Admin xử lý!', 'warning');
      loadData();
    }
  };

  const handleReplySubmit = (contentKey: string) => {
    if (!replyText.trim()) return;

    const idx = restaurant.reviews.findIndex((r: any) => r.content === contentKey);
    if (idx !== -1) {
      if (!restaurant.reviews[idx].replies) restaurant.reviews[idx].replies = [];
      restaurant.reviews[idx].replies.push(replyText.trim());
      localStorage.setItem('meshimap_restaurant', JSON.stringify(restaurant));

      const storedReviews = JSON.parse(localStorage.getItem('meshimap_reviews') || '[]');
      const storedIdx = storedReviews.findIndex((r: any) => r.content === contentKey);
      if (storedIdx !== -1) {
        if (!storedReviews[storedIdx].replies) storedReviews[storedIdx].replies = [];
        storedReviews[storedIdx].replies.push(replyText.trim());
        localStorage.setItem('meshimap_reviews', JSON.stringify(storedReviews));
      }

      showAlert('Đã gửi phản hồi đánh giá!');
      setReplyText('');
      setReplyingIndex(null);
      loadData();
    }
  };

  const filteredReviews = reviews.filter(r => filterStars === 'all' || String(r.rating) === filterStars);

  return (
    <>
      <OwnerHeader title="Xem đánh giá khách hàng" />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        <div className="db-card">
          <div className="db-card__title">
            <span>Đánh giá từ khách hàng</span>
            <select className="db-select" style={{ padding: '6px 12px', fontSize: 13 }} value={filterStars} onChange={e => setFilterStars(e.target.value)}>
              <option value="all">Tất cả số sao</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
              <option value="4">⭐⭐⭐⭐ (4 sao)</option>
              <option value="3">⭐⭐⭐ (3 sao)</option>
              <option value="2">⭐⭐ (2 sao)</option>
              <option value="1">⭐ (1 sao)</option>
            </select>
          </div>

          <div>
            {filteredReviews.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--clr-muted)' }}>
                Không có đánh giá nào thỏa mãn bộ lọc.
              </div>
            )}
            {filteredReviews.map((rev, index) => (
              <div className="db-review-item" key={index}>
                <div className="db-review-header">
                  <div>
                    <span className="db-review-author">{rev.author}</span>
                    <span className="db-review-date" style={{ marginLeft: 8 }}>{rev.date}</span>
                    {rev.reported ? (
                      <span className="db-badge db-badge--reported" style={{ marginLeft: 10 }}>Đã báo cáo</span>
                    ) : (
                      <button className="btn btn--outline" style={{ padding: '2px 8px', fontSize: 11, marginLeft: 10, borderColor: '#dc2626', color: '#dc2626' }} onClick={() => handleReport(rev.content)}>
                        🚩 Báo cáo vi phạm
                      </button>
                    )}
                  </div>
                  <div className="db-review-stars">
                    {'⭐'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                </div>
                <p className="db-review-content">"{rev.content}"</p>
                
                {rev.replies?.map((rep: string, i: number) => (
                  <div className="db-review-reply-box" style={{ marginTop: 8 }} key={i}>
                    <strong>Bạn đã phản hồi:</strong>
                    <p style={{ marginTop: 4, fontStyle: 'italic' }}>"{rep}"</p>
                  </div>
                ))}

                <div style={{ marginTop: 8 }}>
                  <button className="db-review-reply-btn" onClick={() => setReplyingIndex(replyingIndex === index ? null : index)}>
                    💬 Trả lời
                  </button>
                  {replyingIndex === index && (
                    <div style={{ marginTop: 8 }}>
                      <textarea className="db-textarea" style={{ width: '100%', minHeight: 60 }} placeholder="Viết phản hồi..." 
                        value={replyText} onChange={e => setReplyText(e.target.value)} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <button className="btn btn--outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setReplyingIndex(null)}>Hủy</button>
                        <button className="btn btn--primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => handleReplySubmit(rev.content)}>Gửi phản hồi</button>
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
