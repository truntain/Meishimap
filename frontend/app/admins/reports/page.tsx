'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import Cookies from 'js-cookie';
import { useAppLanguage, adminCopy } from '@/config/i18n';

export default function AdminReportsPage() {
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reportedReviews, setReportedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ msg: string; type: string } | null>(null);
  const { language } = useAppLanguage();
  const copy = adminCopy[language];

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
        throw new Error('alertLoadReviewsError');
      }

      const data = await res.json();
      setAllReviews(data);
      setReportedReviews(data.filter((r: any) => r.isReported));
    } catch (err: any) {
      console.error(err);
      showAlert(err.message === 'alertLoadReviewsError' ? copy.alertLoadReviewsError : copy.alertLoadReviewsErrorFallback, 'warning');
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

  const handleClearContent = async (id: number) => {
    if (window.confirm(copy.confirmClearContent)) {
      const token = Cookies.get('access_token');
      if (!token) {
        showAlert(copy.alertSessionExpired, 'warning');
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/review/${id}/admin-clear`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ clearContent: true })
        });

        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (!res.ok) {
          throw new Error('alertClearError');
        }

        showAlert(copy.alertClearSuccess);
        fetchReviews();
      } catch (err: any) {
        console.error(err);
        showAlert(copy.alertClearError, 'warning');
      }
    }
  };

  const handleClearReply = async (id: number) => {
    if (window.confirm(copy.confirmClearReply)) {
      const token = Cookies.get('access_token');
      if (!token) {
        showAlert(copy.alertSessionExpired, 'warning');
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/review/${id}/admin-clear`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ clearReply: true })
        });

        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (!res.ok) {
          throw new Error('alertClearError');
        }

        showAlert(copy.alertClearSuccess);
        fetchReviews();
      } catch (err: any) {
        console.error(err);
        showAlert(copy.alertClearError, 'warning');
      }
    }
  };

  const handleDismissReport = async (id: number) => {
    if (window.confirm(copy.confirmDismissReport)) {
      const token = Cookies.get('access_token');
      if (!token) {
        showAlert(copy.alertSessionExpired, 'warning');
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
          throw new Error('alertDismissError');
        }

        showAlert(copy.alertDismissSuccess);
        fetchReviews();
      } catch (err: any) {
        console.error(err);
        showAlert(err.message === 'alertDismissError' ? copy.alertDismissError : copy.alertDismissErrorFallback, 'warning');
      }
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (window.confirm(copy.confirmDeleteReview)) {
      const token = Cookies.get('access_token');
      if (!token) {
        showAlert(copy.alertSessionExpired, 'warning');
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
          throw new Error('alertDeleteError');
        }

        showAlert(copy.alertDeleteSuccess);
        fetchReviews();
      } catch (err: any) {
        console.error(err);
        showAlert(err.message === 'alertDeleteError' ? copy.alertDeleteError : copy.alertDeleteErrorFallback, 'warning');
      }
    }
  };

  return (
    <>
      <AdminHeader title={copy.reportsTitle} />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--clr-muted)', fontWeight: 500 }}>
            {copy.loadingReviews}
          </div>
        )}

        {/* 1. Đánh giá bị báo cáo vi phạm */}
        <div className="db-card" style={{ marginBottom: '30px' }}>
          <h2 className="db-card__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{copy.reportedReviewsTitle}</span>
            <span style={{ fontSize: '14px', background: '#fee2e2', color: '#c53030', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {copy.reportsCount.replace('{{count}}', String(reportedReviews.length))}
            </span>
          </h2>
          
          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>{copy.colRestaurant}</th>
                  <th>{copy.colReviewer}</th>
                  <th>{copy.colReviewContent}</th>
                  <th>{copy.colStars}</th>
                  <th>{copy.colReportReason}</th>
                  <th>{copy.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {reportedReviews.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>
                      {copy.noReportedReviews}
                    </td>
                  </tr>
                )}
                {reportedReviews.map((rev) => (
                  <tr key={rev.id}>
                    <td style={{ fontWeight: 600 }}>{rev.restaurant?.name || copy.unknownRestaurant}</td>
                    <td style={{ fontWeight: 600 }}>{rev.user?.name || rev.user?.email || copy.anonymousUser}</td>
                    <td style={{ maxWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        {rev.content ? (
                          <>
                            <span 
                              style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                              title={rev.content}
                            >
                              "{rev.content}"
                            </span>
                            <button 
                              onClick={() => handleClearContent(rev.id)} 
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Xóa nội dung"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <span style={{ color: 'var(--clr-muted)', fontSize: 13, fontStyle: 'italic' }}>
                            {copy.contentCleared}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--clr-yellow)' }}>
                      {'⭐'.repeat(rev.stars)}
                    </td>
                    <td style={{ color: '#c53030', fontSize: 13, fontWeight: 500 }}>
                      {rev.reportReason || copy.defaultReportReason}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          className="btn" 
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleDismissReport(rev.id)}
                        >
                          {copy.btnDismiss}
                        </button>
                        <button 
                          className="btn" 
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleDeleteReview(rev.id)}
                        >
                          {copy.btnDelete}
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
            <span>{copy.allReviewsTitle}</span>
            <span style={{ fontSize: '14px', background: 'var(--clr-cream)', color: 'var(--clr-medium)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {copy.totalReviewsCount.replace('{{count}}', String(allReviews.length))}
            </span>
          </h2>
          
          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>{copy.colRestaurant}</th>
                  <th>{copy.colReviewer}</th>
                  <th>{copy.colReviewContent}</th>
                  <th>{copy.colOwnerReply}</th>
                  <th>{copy.colStars}</th>
                  <th>{copy.colCreatedDate}</th>
                </tr>
              </thead>
              <tbody>
                {allReviews.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>
                      {copy.noReviewsSystem}
                    </td>
                  </tr>
                )}
                {allReviews.map((rev) => (
                  <tr key={rev.id}>
                    <td style={{ fontWeight: 600 }}>{rev.restaurant?.name || copy.unknownRestaurant}</td>
                    <td style={{ fontWeight: 600 }}>{rev.user?.name || rev.user?.email || copy.anonymousUser}</td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        {rev.content ? (
                          <>
                            <span 
                              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                              title={rev.content}
                            >
                              "{rev.content}"
                            </span>
                            <button 
                              onClick={() => handleClearContent(rev.id)} 
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Xóa nội dung"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <span style={{ color: 'var(--clr-muted)', fontSize: 13, fontStyle: 'italic' }}>
                            {copy.contentCleared}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        {rev.ownerReply ? (
                          <>
                            <span style={{ color: '#059669', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rev.ownerReply}>
                              "{rev.ownerReply}"
                            </span>
                            <button 
                              onClick={() => handleClearReply(rev.id)} 
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Xóa phản hồi"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <span style={{ color: 'var(--clr-muted)', fontStyle: 'italic', fontSize: 13 }}>{copy.noReplyYet}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--clr-yellow)' }}>
                      {'⭐'.repeat(rev.stars)}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {new Date(rev.createdAt).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'vi-VN')}
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

