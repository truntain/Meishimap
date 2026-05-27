'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import Cookies from 'js-cookie';

export default function AdminReportsPage() {
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reportedReviews, setReportedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ msg: string; type: string } | null>(null);

  const fetchReviews = async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/review/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        throw new Error('Lỗi lấy danh sách đánh giá từ server');
      }

      const data = await res.json();
      setAllReviews(data);
      setReportedReviews(data.filter((r: any) => r.isReported));
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || 'Không thể tải danh sách đánh giá', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN đánh giá này khỏi hệ thống? Điểm đánh giá trung bình của nhà hàng tương ứng sẽ được cập nhật lại.')) {
      const token = Cookies.get('access_token');
      if (!token) {
        showAlert('Vui lòng đăng nhập lại.', 'warning');
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/review/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (!res.ok) {
          throw new Error('Lỗi từ hệ thống khi xóa đánh giá');
        }

        showAlert('Đã xóa đánh giá vĩnh viễn và cập nhật lại điểm nhà hàng.');
        fetchReviews();
      } catch (err: any) {
        console.error(err);
        showAlert(err.message || 'Không thể xóa đánh giá', 'warning');
      }
    }
  };

  const handleDismissReport = async (id: number) => {
    if (window.confirm('Bỏ qua báo cáo vi phạm đối với đánh giá này? Đánh giá vẫn sẽ được giữ lại và hiển thị bình thường.')) {
      const token = Cookies.get('access_token');
      if (!token) {
        showAlert('Vui lòng đăng nhập lại.', 'warning');
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/review/${id}/dismiss-report`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (!res.ok) {
          throw new Error('Lỗi từ hệ thống khi bỏ qua báo cáo');
        }

        showAlert('Đã bỏ qua báo cáo vi phạm thành công.');
        fetchReviews();
      } catch (err: any) {
        console.error(err);
        showAlert(err.message || 'Không thể bỏ qua báo cáo', 'warning');
      }
    }
  };

  return (
    <>
      <AdminHeader title="Quản lý đánh giá & Báo cáo" />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--clr-muted)', fontWeight: 500 }}>
            Đang tải dữ liệu đánh giá...
          </div>
        )}

        {/* 1. Đánh giá bị báo cáo vi phạm */}
        <div className="db-card" style={{ marginBottom: '30px' }}>
          <h2 className="db-card__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Đánh giá bị báo cáo vi phạm</span>
            <span style={{ fontSize: '14px', background: '#fee2e2', color: '#c53030', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {reportedReviews.length} báo cáo
            </span>
          </h2>
          
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
                {reportedReviews.map((rev) => (
                  <tr key={rev.id}>
                    <td style={{ fontWeight: 600 }}>{rev.restaurant?.name || 'Chưa xác định'}</td>
                    <td style={{ fontWeight: 600 }}>{rev.user?.name || rev.user?.email || 'Khách vãng lai'}</td>
                    <td 
                      style={{ maxWidth: 240, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                      title={rev.content}
                    >
                      "{rev.content}"
                    </td>
                    <td style={{ color: 'var(--clr-yellow)' }}>
                      {'⭐'.repeat(rev.stars)}
                    </td>
                    <td style={{ color: '#c53030', fontSize: 13, fontWeight: 500 }}>
                      {rev.reportReason || 'Báo cáo vi phạm'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          className="btn btn--dark" 
                          style={{ padding: '4px 10px', fontSize: 12, background: '#dc2626' }} 
                          onClick={() => handleDelete(rev.id)}
                        >
                          Ẩn/Xóa đánh giá
                        </button>
                        <button 
                          className="btn btn--dark" 
                          style={{ padding: '4px 10px', fontSize: 12, background: 'var(--clr-muted)' }} 
                          onClick={() => handleDismissReport(rev.id)}
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

        {/* 2. Quản lý toàn bộ đánh giá trong hệ thống */}
        <div className="db-card">
          <h2 className="db-card__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Quản lý toàn bộ đánh giá & Phản hồi</span>
            <span style={{ fontSize: '14px', background: 'var(--clr-cream)', color: 'var(--clr-medium)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
              Tổng cộng: {allReviews.length} đánh giá
            </span>
          </h2>
          
          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Nhà hàng</th>
                  <th>Người đánh giá</th>
                  <th>Nội dung đánh giá</th>
                  <th>Phản hồi của chủ nhà hàng</th>
                  <th>Sao</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {allReviews.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>
                      Chưa có đánh giá nào được lưu trong hệ thống.
                    </td>
                  </tr>
                )}
                {allReviews.map((rev) => (
                  <tr key={rev.id}>
                    <td style={{ fontWeight: 600 }}>{rev.restaurant?.name || 'Chưa xác định'}</td>
                    <td style={{ fontWeight: 600 }}>{rev.user?.name || rev.user?.email || 'Khách vãng lai'}</td>
                    <td 
                      style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                      title={rev.content}
                    >
                      "{rev.content}"
                    </td>
                    <td 
                      style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={rev.ownerReply}
                    >
                      {rev.ownerReply ? (
                        <span style={{ color: '#059669', fontWeight: 500 }}>"{rev.ownerReply}"</span>
                      ) : (
                        <span style={{ color: 'var(--clr-muted)', fontStyle: 'italic', fontSize: 13 }}>Chưa phản hồi</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--clr-yellow)' }}>
                      {'⭐'.repeat(rev.stars)}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <button 
                        className="btn btn--dark" 
                        style={{ padding: '4px 10px', fontSize: 12, background: '#dc2626' }} 
                        onClick={() => handleDelete(rev.id)}
                      >
                        Xóa
                      </button>
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
