'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import Cookies from 'js-cookie';
import { useAppLanguage, adminCopy } from '@/config/i18n';

export default function AdminApprovalsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [alertMsg, setAlertMsg] = useState<{msg: string, type: string} | null>(null);
  const { language } = useAppLanguage();
  const copy = adminCopy[language];

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
        throw new Error('alertFetchApprovalsError');
      }

      const data = await res.json();
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.owner?.email || 'ownerNotLinked',
        address: item.address,
        phone: item.phone || 'notUpdated',
        createdAt: item.created_at || item.createdAt,
        cuisine: (item.category || 'sushi').toUpperCase(),
        status: item.status, // 'pending' | 'approved' | 'rejected'
        description: item.description || 'defaultNoDesc',
        rejectReason: item.rejectReason || '',
        documents: item.documents || null
      }));
      setRestaurants(mapped);
    } catch (err: any) {
      console.error(err);
      showAlert(err.message === 'alertFetchApprovalsError' ? copy.alertFetchApprovalsError : copy.alertFetchApprovalsErrorFallback, 'warning');
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
      showAlert(copy.alertSessionExpired, 'warning');
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
        throw new Error('alertApproveError');
      }

      setShowDetailModal(false);
      showAlert(copy.alertApproveSuccess);
      fetchApprovals();
    } catch (err: any) {
      console.error(err);
      showAlert(err.message === 'alertApproveError' ? copy.alertApproveError : `Lỗi: ${err.message}`, 'warning');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResId === null) return;

    const token = Cookies.get('access_token');
    if (!token) {
      showAlert(copy.alertSessionExpired, 'warning');
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
        throw new Error('alertRejectError');
      }

      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectReason('');
      showAlert(copy.alertRejectSuccess, 'warning');
      fetchApprovals();
    } catch (err: any) {
      console.error(err);
      showAlert(err.message === 'alertRejectError' ? copy.alertRejectError : `Lỗi: ${err.message}`, 'warning');
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

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <>
      <AdminHeader title={copy.approvalsTitle} />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        <div className="db-card">
          <h2 className="db-card__title">{copy.pendingRequestsTitle}</h2>
          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Tên nhà hàng</th>
                  <th>{copy.colEmail}</th>
                  <th>{copy.colAddress}</th>
                  <th>{copy.colRequestDate}</th>
                  <th>{copy.colStatus}</th>
                  <th>{copy.colDetail}</th>
                  <th>{copy.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>
                      {copy.noApprovalRequests}
                    </td>
                  </tr>
                )}
                {restaurants.map(res => (
                  <tr key={res.id}>
                    <td style={{ fontWeight: 600 }}>{res.name}</td>
                    <td>{res.email === 'ownerNotLinked' ? copy.ownerNotLinked : res.email}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {res.address}
                    </td>
                    <td>{formatDate(res.createdAt)}</td>
                    <td>
                      {res.status === 'pending' && <span className="db-badge db-badge--pending">{copy.statusPending}</span>}
                      {res.status === 'approved' && <span className="db-badge db-badge--approved">{copy.statusApproved}</span>}
                      {res.status === 'rejected' && <span className="db-badge db-badge--rejected">{copy.statusRejected}</span>}
                    </td>
                    <td>
                      <button className="db-icon-btn" onClick={() => openDetail(res.id)}>
                        {copy.btnView}
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
                              {copy.btnApprove}
                            </button>
                            <button 
                              className="btn btn--dark" 
                              style={{ padding: '4px 10px', fontSize: 12, background: '#dc2626' }} 
                              onClick={() => openReject(res.id)}
                            >
                              {copy.btnReject}
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--clr-muted)' }}>{copy.statusCompleted}</span>
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
            <h3 className="db-modal__title">{copy.modalDetailTitle}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div><strong>{copy.labelRestaurantName}</strong> {selectedRes.name}</div>
              <div><strong>{copy.labelCuisine}</strong> <span className="badge badge--sm">{selectedRes.cuisine}</span></div>
              <div><strong>{copy.labelAddress}</strong> {selectedRes.address}</div>
              <div><strong>{copy.labelPhone}</strong> {selectedRes.phone === 'notUpdated' ? copy.notUpdated : selectedRes.phone}</div>
              <div><strong>{copy.labelEmail}</strong> {selectedRes.email === 'ownerNotLinked' ? copy.ownerNotLinked : selectedRes.email}</div>
              <div><strong>{copy.labelRequestDate}</strong> {formatDate(selectedRes.createdAt)}</div>
              {selectedRes.status === 'rejected' && selectedRes.rejectReason && (
                <div style={{ color: '#dc2626' }}><strong>{copy.labelRejectReason}</strong> {selectedRes.rejectReason}</div>
              )}
              <p style={{ background: 'var(--clr-cream)', padding: 10, borderRadius: 6, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--clr-medium)' }}>
                "{selectedRes.description === 'defaultNoDesc' ? copy.defaultNoDesc : selectedRes.description}"
              </p>
              {selectedRes.documents && (
                <div style={{ marginTop: 8, borderTop: '1px solid var(--clr-border)', paddingTop: 12 }}>
                  <strong style={{ display: 'block', marginBottom: 8 }}>{copy.documentsSectionTitle}</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {selectedRes.documents.japaneseProof && (
                      <a 
                        href={`http://localhost:3001${selectedRes.documents.japaneseProof}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn--outline"
                        style={{ padding: '8px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center', minHeight: '38px' }}
                      >
                        {copy.docJapaneseProof}
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
                        {copy.docBusinessLicense}
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
                        {copy.docFoodSafetyCert}
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
                        {copy.docIdentityCard}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="db-modal__actions" style={{ marginTop: 24 }}>
              <button type="button" className="modal__cancel" onClick={() => setShowDetailModal(false)}>{copy.btnClose}</button>
              {selectedRes.status === 'pending' && (
                <>
                  <button type="button" className="btn btn--dark" style={{ background: '#dc2626' }} onClick={() => {setShowDetailModal(false); setShowRejectModal(true);}}>{copy.btnReject}</button>
                  <button type="button" className="btn btn--primary" style={{ background: '#059669' }} onClick={() => handleApprove(selectedRes.id)}>{copy.btnApprove}</button>
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
            <h3 className="db-modal__title">{copy.modalRejectTitle}</h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="db-form-field">
                <label>{copy.labelRejectReasonInput}</label>
                <textarea 
                  className="db-textarea" 
                  placeholder={copy.placeholderRejectReason} 
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="db-modal__actions">
                <button type="button" className="modal__cancel" onClick={() => setShowRejectModal(false)}>{copy.btnCancel}</button>
                <button type="submit" className="modal__submit" style={{ background: '#dc2626' }}>{copy.btnSubmitReject}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

