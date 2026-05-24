'use client';

import { useEffect, useState } from 'react';
import OwnerHeader from '../components/OwnerHeader';

const defaultBookings = [
  { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', date: '2026-05-24', time: '18:30', guests: '2 người', note: 'Chỗ ngồi gần cửa sổ', status: 'pending' },
  { id: 2, name: 'Trần Thị B', phone: '0912345678', date: '2026-05-25', time: '19:00', guests: '4 người', note: 'Không ăn cay được', status: 'approved' },
  { id: 3, name: 'Sato Kenji', phone: '0934567890', date: '2026-05-26', time: '12:00', guests: '3 người', note: 'Cần hỗ trợ tiếng Nhật', status: 'pending' }
];

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [alertMsg, setAlertMsg] = useState<{msg: string, type: string} | null>(null);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('meshimap_bookings_db');
    let db = stored ? JSON.parse(stored) : defaultBookings;
    
    // Sync customer-written bookings from user flow (key: 'meshimap_bookings')
    const userWrittenBookings = JSON.parse(localStorage.getItem('meshimap_bookings') || '[]');
    let hasChanges = false;
    userWrittenBookings.forEach((ub: any, index: number) => {
      // If not already in DB
      if (!db.some((b: any) => b.name === (ub.name || 'Khách vãng lai') && b.date === ub.date && b.time === ub.time)) {
        db.push({
          id: 'u-' + index,
          name: ub.name || 'Khách vãng lai',
          phone: ub.phone || '0987654321',
          date: ub.date,
          time: ub.time,
          guests: ub.guests || '2 người',
          note: ub.note || '',
          status: 'pending'
        });
        hasChanges = true;
      }
    });

    if (hasChanges || !stored) {
      localStorage.setItem('meshimap_bookings_db', JSON.stringify(db));
    }
    
    setBookings(db);
  }, []);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleApprove = (id: any) => {
    const updated = bookings.map(b => String(b.id) === String(id) ? { ...b, status: 'approved' } : b);
    setBookings(updated);
    localStorage.setItem('meshimap_bookings_db', JSON.stringify(updated));
    showAlert('Đã duyệt chấp nhận đặt bàn!');
  };

  const openRejectModal = (id: any) => {
    setSelectedBookingId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookingId === null) return;
    
    const updated = bookings.map(b => String(b.id) === String(selectedBookingId) ? { ...b, status: 'rejected', rejectReason } : b);
    setBookings(updated);
    localStorage.setItem('meshimap_bookings_db', JSON.stringify(updated));
    setShowRejectModal(false);
    showAlert('Đã từ chối đơn đặt bàn này.', 'warning');
  };

  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <OwnerHeader title="Quản lý đặt bàn" />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        <div className="db-card">
          <div className="db-card__title">
            <span>Danh sách yêu cầu đặt bàn</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <select className="db-select" style={{ padding: '6px 12px', fontSize: 13 }} value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt (Pending)</option>
                <option value="approved">Đã chấp nhận (Approved)</option>
                <option value="rejected">Đã từ chối (Rejected)</option>
              </select>
            </div>
          </div>

          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Ngày đặt</th>
                  <th>Thời gian</th>
                  <th>Số người</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>Không tìm thấy lượt đặt bàn nào.</td>
                  </tr>
                )}
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td>{b.phone}</td>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td>{b.guests}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.note || ''}>
                      {b.note || '-'}
                    </td>
                    <td>
                      {b.status === 'pending' && <span className="db-badge db-badge--pending">Chờ duyệt</span>}
                      {b.status === 'approved' && <span className="db-badge db-badge--approved">Đã nhận</span>}
                      {b.status === 'rejected' && <span className="db-badge db-badge--rejected" title={`Lý do: ${b.rejectReason || ''}`}>Đã từ chối</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {b.status === 'pending' ? (
                          <>
                            <button className="btn btn--dark" style={{ padding: '4px 10px', fontSize: 12, background: '#059669' }} onClick={() => handleApprove(b.id)}>Duyệt</button>
                            <button className="btn btn--dark" style={{ padding: '4px 10px', fontSize: 12, background: '#dc2626' }} onClick={() => openRejectModal(b.id)}>Từ chối</button>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--clr-muted)' }}>Đã xử lý</span>
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

      {showRejectModal && (
        <div className="db-modal" style={{ display: 'flex' }}>
          <div className="db-modal__box">
            <h3 className="db-modal__title">Từ chối yêu cầu đặt bàn</h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="db-form-field">
                <label>Lý do từ chối <span>/ 却下の理由</span></label>
                <textarea className="db-textarea" placeholder="Nhập lý do từ chối (vd: Hết bàn giờ này...)" required
                  value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
              </div>
              <div className="db-modal__actions">
                <button type="button" className="modal__cancel" onClick={() => setShowRejectModal(false)}>Hủy</button>
                <button type="submit" className="modal__submit" style={{ background: '#dc2626' }}>Từ chối đặt bàn</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
