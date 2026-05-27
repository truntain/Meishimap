'use client';

import { useEffect, useState } from 'react';
import OwnerHeader from '../components/OwnerHeader';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3001';

export default function OwnerBookingsPage() {
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const showAlert = (msg: string, type = 'success') => {
    if (type === 'success') {
      toast.success(msg);
    } else if (type === 'warning') {
      toast.error(msg);
    } else {
      toast(msg);
    }
  };

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Step 1: Lấy thông tin nhà hàng của chủ quán hiện tại
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/restaurants/my-restaurant`, {
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
          throw new Error('Không thể tải thông tin nhà hàng sở hữu');
        }
        const data = await res.json();
        setRestaurantId(data.id);
      } catch (err: any) {
        console.error(err);
        showAlert('Lỗi: ' + (err.message || 'Không thể kết nối tới máy chủ'), 'warning');
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  // Step 2: Load bookings và thiết lập socket khi đã có restaurantId
  useEffect(() => {
    if (restaurantId === null) return;
    const token = Cookies.get('access_token');

    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/booking/restaurant/${restaurantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Không thể lấy danh sách đặt bàn');
        const data = await res.json();

        // Map dữ liệu DB sang giao diện
        const mapped = data.map((b: any) => ({
          id: b.id,
          name: b.user?.name || 'Khách vãng lai',
          phone: b.user?.email || 'Chưa cập nhật', // email làm thông tin liên hệ
          date: b.bookingDate,
          time: b.bookingTime?.substring(0, 5) || b.bookingTime,
          guests: b.guests + ' người',
          note: b.note || '',
          status: b.status === 'confirmed' ? 'approved' : b.status === 'cancelled' ? 'rejected' : 'pending',
          rejectReason: b.rejectReason || '',
        }));

        setBookings(mapped);
      } catch (err: any) {
        console.error(err);
        showAlert('Lỗi tải đặt bàn: ' + err.message, 'warning');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      socket.emit('join_restaurant_room', restaurantId);
    });

    socket.on('new_booking', (newBooking: any) => {
      setBookings(prev => [newBooking, ...prev]);
      
      // Play chime sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
        audio.play().catch(e => {
          console.warn('Autoplay sound blocked:', e.message);
        });
      } catch (e) {
        console.error(e);
      }

      // Beautiful custom toast
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-bounce' : 'opacity-0'
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex border border-gray-150 p-4`}
        >
          <div className="flex-1 w-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5 text-2xl">
                🔔
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900">
                  Yêu Cầu Đặt Bàn Mới!
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Giờ hẹn lúc {newBooking.time} ngày {newBooking.date} cho {newBooking.guests}.
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-white rounded-md inline-flex text-[#6C2F00] hover:text-[#8A3E03] focus:outline-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ), { duration: 8000 });
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  const handleApprove = async (id: any) => {
    const token = Cookies.get('access_token');
    try {
      const res = await fetch(`${API_BASE_URL}/booking/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });

      if (!res.ok) throw new Error('Không thể duyệt đặt bàn');

      const updated = bookings.map(b => String(b.id) === String(id) ? { ...b, status: 'approved' } : b);
      setBookings(updated);
      showAlert('Đã duyệt chấp nhận đặt bàn!');
    } catch (err: any) {
      showAlert('Lỗi: ' + err.message, 'warning');
    }
  };

  const openRejectModal = (id: any) => {
    setSelectedBookingId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookingId === null) return;
    const token = Cookies.get('access_token');

    try {
      const res = await fetch(`${API_BASE_URL}/booking/${selectedBookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled', rejectReason })
      });

      if (!res.ok) throw new Error('Không thể từ chối đặt bàn');

      const updated = bookings.map(b => String(b.id) === String(selectedBookingId) ? { ...b, status: 'rejected', rejectReason } : b);
      setBookings(updated);
      setShowRejectModal(false);
      showAlert('Đã từ chối đơn đặt bàn này.', 'warning');
    } catch (err: any) {
      showAlert('Lỗi: ' + err.message, 'warning');
    }
  };

  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <OwnerHeader title="Quản lý đặt bàn" />
      <div className="db-content">


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
                  <th>Email liên hệ</th>
                  <th>Ngày đặt</th>
                  <th>Thời gian</th>
                  <th>Số người</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>Đang tải danh sách đặt bàn...</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>Không tìm thấy lượt đặt bàn nào.</td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id}>
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
                  ))
                )}
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
