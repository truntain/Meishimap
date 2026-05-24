'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';

export default function AdminReportsPage() {
  const [reportedReviews, setReportedReviews] = useState<any[]>([]);
  const [alertMsg, setAlertMsg] = useState<{msg: string, type: string} | null>(null);

  const loadData = () => {
    const restaurantData = JSON.parse(localStorage.getItem('meshimap_restaurant') || '{}');
    const restaurantReviews = restaurantData.reviews || [];
    const userWrittenReviews = JSON.parse(localStorage.getItem('meshimap_reviews') || '[]');

    let merged = [...restaurantReviews];
    userWrittenReviews.forEach((ur: any) => {
      if (!merged.some(cr => cr.content === ur.content && cr.author === ur.author)) {
        merged.push({
          author: ur.author,
          rating: parseInt(ur.rating) || 5,
          date: ur.date || 'Tháng 5, 2026',
          content: ur.content,
          replies: ur.replies || [],
          reported: ur.reported || false,
          reportReason: ur.reportReason || '',
          deleted: ur.deleted || false
        });
      }
    });

    const reported = merged.filter(r => r.reported && !r.deleted);
    setReportedReviews(reported);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleHide = (contentKey: string) => {
    if (window.confirm('Bạn có chắc chắn muốn ẨN/XÓA đánh giá này vĩnh viễn khỏi trang hiển thị của khách hàng? Tác giả đánh giá sẽ bị cảnh báo vi phạm.')) {
      // Sync to localStorage 'meshimap_restaurant'
      const restaurantData = JSON.parse(localStorage.getItem('meshimap_restaurant') || '{}');
      if (restaurantData.reviews) {
        const rIdx = restaurantData.reviews.findIndex((r: any) => r.content === contentKey);
        if (rIdx !== -1) {
          restaurantData.reviews[rIdx].deleted = true;
          restaurantData.reviews[rIdx].reported = false;
          localStorage.setItem('meshimap_restaurant', JSON.stringify(restaurantData));
        }
      }

      // Sync to localStorage 'meshimap_reviews'
      const storedReviews = JSON.parse(localStorage.getItem('meshimap_reviews') || '[]');
      const storedIdx = storedReviews.findIndex((r: any) => r.content === contentKey);
      if (storedIdx !== -1) {
        storedReviews[storedIdx].deleted = true;
        storedReviews[storedIdx].reported = false;
        localStorage.setItem('meshimap_reviews', JSON.stringify(storedReviews));
      }

      showAlert('Đã ẩn đánh giá vi phạm và gửi thông báo cảnh cáo ảo đến người viết bài.');
      loadData();
    }
  };

  const handleDismiss = (contentKey: string) => {
    if (window.confirm('Bỏ qua báo cáo vi phạm đối với đánh giá này? Đánh giá vẫn sẽ được hiển thị bình thường trên trang khách hàng.')) {
      // Sync to localStorage 'meshimap_restaurant'
      const restaurantData = JSON.parse(localStorage.getItem('meshimap_restaurant') || '{}');
      if (restaurantData.reviews) {
        const rIdx = restaurantData.reviews.findIndex((r: any) => r.content === contentKey);
        if (rIdx !== -1) {
          restaurantData.reviews[rIdx].reported = false;
          localStorage.setItem('meshimap_restaurant', JSON.stringify(restaurantData));
        }
      }

      // Sync to localStorage 'meshimap_reviews'
      const storedReviews = JSON.parse(localStorage.getItem('meshimap_reviews') || '[]');
      const storedIdx = storedReviews.findIndex((r: any) => r.content === contentKey);
      if (storedIdx !== -1) {
        storedReviews[storedIdx].reported = false;
        localStorage.setItem('meshimap_reviews', JSON.stringify(storedReviews));
      }

      showAlert('Đã bỏ qua báo cáo vi phạm.');
      loadData();
    }
  };

  return (
    <>
      <AdminHeader title="Quản lý báo cáo vi phạm" />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        <div className="db-card">
          <h2 className="db-card__title">Đánh giá bị báo cáo vi phạm</h2>
          
          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Nhà hàng</th>
                  <th>Người đánh giá</th>
                  <th>Nội dung đánh giá</th>
                  <th>Sao</th>
                  <th>Lý do báo cáo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reportedReviews.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>
                      Không có đánh giá nào bị báo cáo vi phạm.
                    </td>
                  </tr>
                )}
                {reportedReviews.map((rev, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>Sakura Garden</td>
                    <td style={{ fontWeight: 600 }}>{rev.author}</td>
                    <td 
                      style={{ maxWidth: 240, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                      title={rev.content}
                    >
                      "{rev.content}"
                    </td>
                    <td style={{ color: 'var(--clr-yellow)' }}>
                      {'⭐'.repeat(rev.rating)}
                    </td>
                    <td style={{ color: '#c53030', fontSize: 13, fontWeight: 500 }}>
                      {rev.reportReason || 'Báo cáo vi phạm'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          className="btn btn--dark" 
                          style={{ padding: '4px 10px', fontSize: 12, background: '#dc2626' }} 
                          onClick={() => handleHide(rev.content)}
                        >
                          Ẩn đánh giá
                        </button>
                        <button 
                          className="btn btn--dark" 
                          style={{ padding: '4px 10px', fontSize: 12, background: 'var(--clr-muted)' }} 
                          onClick={() => handleDismiss(rev.content)}
                        >
                          Bỏ qua
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
