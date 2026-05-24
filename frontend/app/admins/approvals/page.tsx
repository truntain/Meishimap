'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';

const defaultPendingRestaurants = [
  { id: 1, name: 'Kyoto Ramen House', email: 'sato@kyoto.com', address: '45 Phan Xich Long, Phu Nhuan, HCM', phone: '0909887766', date: '2026-05-22', cuisine: 'RAMEN', status: 'pending', description: 'Mô hình ramen truyền thống của vùng Kyoto, nước dùng xương heo ninh nhừ 15 tiếng.' },
  { id: 2, name: 'Nagoya Bento', email: 'nagoya@bento.com', address: '12 Nguyễn Thị Thập, Quận 7, HCM', phone: '0912334455', date: '2026-05-23', cuisine: 'BENTO', status: 'pending', description: 'Cơm hộp Bento chuẩn vị Nhật Bản tiện lợi, đầy đủ dinh dưỡng cho giới văn phòng.' },
  { id: 3, name: 'Tokyo Sushi Bar', email: 'tokyo@sushi.com', address: '78 Lê Thánh Tôn, Quận 1, HCM', phone: '0988112233', date: '2026-05-23', cuisine: 'SUSHI', status: 'pending', description: 'Sushi quầy bar cao cấp do đầu bếp Nhật trực tiếp đứng quầy và làm món.' }
];

export default function AdminApprovalsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [alertMsg, setAlertMsg] = useState<{msg: string, type: string} | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('meshimap_pending_restaurants');
    if (stored) {
      setRestaurants(JSON.parse(stored));
    } else {
      setRestaurants(defaultPendingRestaurants);
      localStorage.setItem('meshimap_pending_restaurants', JSON.stringify(defaultPendingRestaurants));
    }
  }, []);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const saveToStorage = (data: any[]) => {
    setRestaurants(data);
    localStorage.setItem('meshimap_pending_restaurants', JSON.stringify(data));
  };

  const handleApprove = (id: number) => {
    const updated = restaurants.map(r => r.id === id ? { ...r, status: 'approved' } : r);
    saveToStorage(updated);
    setShowDetailModal(false);
    showAlert('Đã phê duyệt nhà hàng thành công!');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResId === null) return;
    
    const updated = restaurants.map(r => 
      r.id === selectedResId ? { ...r, status: 'rejected', rejectReason } : r
    );
    saveToStorage(updated);
    setShowRejectModal(false);
    setShowDetailModal(false);
    setRejectReason('');
    showAlert('Đã từ chối đăng ký nhà hàng.', 'warning');
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
      <AdminHeader title="Kiểm duyệt nhà hàng" />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        <div className="db-card">
          <h2 className="db-card__title">Yêu cầu đăng ký nhà hàng chờ phê duyệt</h2>
          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Tên nhà hàng</th>
                  <th>Email liên hệ</th>
                  <th>Địa chỉ</th>
                  <th>Ngày gửi yêu cầu</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>
                      Không có yêu cầu phê duyệt nhà hàng nào.
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
                      {res.status === 'pending' && <span className="db-badge db-badge--pending">Chờ duyệt</span>}
                      {res.status === 'approved' && <span className="db-badge db-badge--approved">Đã duyệt</span>}
                      {res.status === 'rejected' && <span className="db-badge db-badge--rejected">Từ chối</span>}
                    </td>
                    <td>
                      <button className="db-icon-btn" onClick={() => openDetail(res.id)}>
                        🔍 Xem
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
                              Duyệt
                            </button>
                            <button 
                              className="btn btn--dark" 
                              style={{ padding: '4px 10px', fontSize: 12, background: '#dc2626' }} 
                              onClick={() => openReject(res.id)}
                            >
                              Từ chối
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--clr-muted)' }}>Hoàn tất</span>
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
            <h3 className="db-modal__title">Chi tiết hồ sơ đăng ký nhà hàng</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div><strong>Tên nhà hàng:</strong> {selectedRes.name}</div>
              <div><strong>Ẩm thực:</strong> <span className="badge badge--sm">{selectedRes.cuisine}</span></div>
              <div><strong>Địa chỉ:</strong> {selectedRes.address}</div>
              <div><strong>Số điện thoại:</strong> {selectedRes.phone}</div>
              <div><strong>Email:</strong> {selectedRes.email}</div>
              <div><strong>Ngày gửi yêu cầu:</strong> {selectedRes.date}</div>
              <div><strong>Mô tả giới thiệu:</strong></div>
              <p style={{ background: 'var(--clr-cream)', padding: 10, borderRadius: 6, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--clr-medium)' }}>
                "{selectedRes.description}"
              </p>
            </div>
            <div className="db-modal__actions" style={{ marginTop: 24 }}>
              <button type="button" className="modal__cancel" onClick={() => setShowDetailModal(false)}>Đóng</button>
              {selectedRes.status === 'pending' && (
                <>
                  <button type="button" className="btn btn--dark" style={{ background: '#dc2626' }} onClick={() => {setShowDetailModal(false); setShowRejectModal(true);}}>Từ chối</button>
                  <button type="button" className="btn btn--primary" style={{ background: '#059669' }} onClick={() => handleApprove(selectedRes.id)}>Phê duyệt</button>
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
            <h3 className="db-modal__title">Lý do từ chối hồ sơ đăng ký</h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="db-form-field">
                <label>Lý do từ chối phê duyệt <span>/ 却下理由</span></label>
                <textarea 
                  className="db-textarea" 
                  placeholder="Nhập lý do cụ thể..." 
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="db-modal__actions">
                <button type="button" className="modal__cancel" onClick={() => setShowRejectModal(false)}>Hủy</button>
                <button type="submit" className="modal__submit" style={{ background: '#dc2626' }}>Từ chối phê duyệt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
