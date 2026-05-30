'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

export default function AdminApprovalsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [alertMsg, setAlertMsg] = useState<{msg: string, type: string} | null>(null);
  const { t } = useTranslation();

  const fetchApprovals = async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/admin/approvals', {
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
        throw new Error('Lỗi lấy danh sách phê duyệt từ backend');
      }

      const data = await res.json();
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.owner?.email || 'Chưa liên kết chủ',
        address: item.address,
        phone: item.phone || 'Chưa cập nhật',
        date: new Date(item.created_at || item.createdAt).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        cuisine: (item.category || 'sushi').toUpperCase(),
        status: item.status, // 'pending' | 'approved' | 'rejected'
        description: item.description || 'Không có mô tả giới thiệu.',
        rejectReason: item.rejectReason || '',
        documents: item.documents || null
      }));
      setRestaurants(mapped);
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi: ${err.message || 'Không thể lấy dữ liệu'}`, 'warning');
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleApprove = async (id: number) => {
    const token = Cookies.get('access_token');
    if (!token) {
      showAlert(t('admin.approvals.alertLogin'), 'warning');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/admin/approvals/${id}/approve`, {
        method: 'POST',
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
        throw new Error('Lỗi phê duyệt nhà hàng');
      }

      setShowDetailModal(false);
      showAlert(t('admin.approvals.alertSuccess'));
      fetchApprovals();
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi: ${err.message}`, 'warning');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResId === null) return;

    const token = Cookies.get('access_token');
    if (!token) {
      showAlert(t('admin.approvals.alertLogin'), 'warning');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/admin/approvals/${selectedResId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejectReason })
      });

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        throw new Error('Lỗi từ chối phê duyệt');
      }

      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectReason('');
      showAlert(t('admin.approvals.alertReject'), 'warning');
      fetchApprovals();
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi: ${err.message}`, 'warning');
    }
  };

  const openDetail = (id: number) => {
    setSelectedResId(id);
    setShowDetailModal(true);
  };

  const openReject = (id: number) => {
    setSelectedResId(id);
    setShowRejectModal(true);
  };

  const selectedRes = restaurants.find(r => r.id === selectedResId);

  return (
    <>
      <AdminHeader title={t('admin.approvals.title')} />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        <div className="db-card">
          <h2 className="db-card__title">{t('admin.approvals.cardTitle')}</h2>
          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>{t('admin.approvals.thResName')}</th>
                  <th>{t('admin.approvals.thEmail')}</th>
                  <th>{t('admin.approvals.thAddress')}</th>
                  <th>{t('admin.approvals.thDate')}</th>
                  <th>{t('admin.approvals.thStatus')}</th>
                  <th>{t('admin.approvals.thDetail')}</th>
                  <th>{t('admin.approvals.thAction')}</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>
                      {t('admin.approvals.noRequests')}
                    </td>
                  </tr>
                )}
                {restaurants.map(res => (
                  <tr key={res.id}>
                    <td style={{ fontWeight: 600 }}>{res.name}</td>
                    <td>{res.email}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {res.address}
                    </td>
                    <td>{res.date}</td>
                    <td>
                      {res.status === 'pending' && <span className="db-badge db-badge--pending">{t('admin.approvals.statusPending')}</span>}
                      {res.status === 'approved' && <span className="db-badge db-badge--approved">{t('admin.approvals.statusApproved')}</span>}
                      {res.status === 'rejected' && <span className="db-badge db-badge--rejected">{t('admin.approvals.statusRejected')}</span>}
                    </td>
                    <td>
                      <button className="db-icon-btn" onClick={() => openDetail(res.id)}>
                        {t('admin.approvals.btnView')}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {res.status === 'pending' ? (
                          <>
                            <button 
                              className="btn btn--dark" 
                              style={{ padding: '4px 10px', fontSize: 12, background: '#059669' }} 
                              onClick={() => handleApprove(res.id)}
                            >
                              {t('admin.approvals.btnApprove')}
                            </button>
                            <button 
                              className="btn btn--dark" 
                              style={{ padding: '4px 10px', fontSize: 12, background: '#dc2626' }} 
                              onClick={() => openReject(res.id)}
                            >
                              {t('admin.approvals.btnReject')}
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--clr-muted)' }}>{t('admin.approvals.btnDone')}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedRes && (
        <div className="db-modal" style={{ display: 'flex' }}>
          <div className="db-modal__box" style={{ maxWidth: 500 }}>
            <h3 className="db-modal__title">{t('admin.approvals.modalDetailTitle')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div><strong>{t('admin.approvals.modalResName')}</strong> {selectedRes.name}</div>
              <div><strong>{t('admin.approvals.modalCuisine')}</strong> <span className="badge badge--sm">{selectedRes.cuisine}</span></div>
              <div><strong>{t('admin.approvals.modalAddress')}</strong> {selectedRes.address}</div>
              <div><strong>{t('admin.approvals.modalPhone')}</strong> {selectedRes.phone}</div>
              <div><strong>{t('admin.approvals.modalEmail')}</strong> {selectedRes.email}</div>
              <div><strong>{t('admin.approvals.modalDate')}</strong> {selectedRes.date}</div>
              {selectedRes.status === 'rejected' && selectedRes.rejectReason && (
                <div style={{ color: '#dc2626' }}><strong>{t('admin.approvals.modalRejectReason')}</strong> {selectedRes.rejectReason}</div>
              )}
              <p style={{ background: 'var(--clr-cream)', padding: 10, borderRadius: 6, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--clr-medium)' }}>
                "{selectedRes.description}"
              </p>
              {selectedRes.documents && (
                <div style={{ marginTop: 8, borderTop: '1px solid var(--clr-border)', paddingTop: 12 }}>
                  <strong style={{ display: 'block', marginBottom: 8 }}>{t('admin.approvals.modalDocTitle')}</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {selectedRes.documents.japaneseProof && (
                      <a 
                        href={`http://localhost:3001${selectedRes.documents.japaneseProof}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn--outline"
                        style={{ padding: '8px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center', minHeight: '38px' }}
                      >
                        {t('admin.approvals.docJa')}
                      </a>
                    )}
                    {selectedRes.documents.businessLicense && (
                      <a 
                        href={`http://localhost:3001${selectedRes.documents.businessLicense}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn--outline"
                        style={{ padding: '8px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center', minHeight: '38px' }}
                      >
                        {t('admin.approvals.docLicense')}
                      </a>
                    )}
                    {selectedRes.documents.foodSafetyCert && (
                      <a 
                        href={`http://localhost:3001${selectedRes.documents.foodSafetyCert}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn--outline"
                        style={{ padding: '8px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center', minHeight: '38px' }}
                      >
                        {t('admin.approvals.docSafety')}
                      </a>
                    )}
                    {selectedRes.documents.identityCard && (
                      <a 
                        href={`http://localhost:3001${selectedRes.documents.identityCard}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn--outline"
                        style={{ padding: '8px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center', minHeight: '38px' }}
                      >
                        {t('admin.approvals.docId')}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="db-modal__actions" style={{ marginTop: 24 }}>
              <button type="button" className="modal__cancel" onClick={() => setShowDetailModal(false)}>{t('admin.approvals.btnClose')}</button>
              {selectedRes.status === 'pending' && (
                <>
                  <button type="button" className="btn btn--dark" style={{ background: '#dc2626' }} onClick={() => {setShowDetailModal(false); setShowRejectModal(true);}}>{t('admin.approvals.btnReject')}</button>
                  <button type="button" className="btn btn--primary" style={{ background: '#059669' }} onClick={() => handleApprove(selectedRes.id)}>{t('admin.approvals.btnApprove')}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="db-modal" style={{ display: 'flex' }}>
          <div className="db-modal__box">
            <h3 className="db-modal__title">{t('admin.approvals.modalRejectTitle')}</h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="db-form-field">
                <label>{t('admin.approvals.labelRejectReason')}</label>
                <textarea 
                  className="db-textarea" 
                  placeholder={t('admin.approvals.placeholderRejectReason')} 
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="db-modal__actions">
                <button type="button" className="modal__cancel" onClick={() => setShowRejectModal(false)}>{t('admin.approvals.btnCancel')}</button>
                <button type="submit" className="modal__submit" style={{ background: '#dc2626' }}>{t('admin.approvals.btnRejectSubmit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
