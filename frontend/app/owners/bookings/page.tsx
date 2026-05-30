'use client';

import { useEffect, useState } from 'react';
import OwnerHeader from '../components/OwnerHeader';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = 'http://localhost:3001';

export default function OwnerBookingsPage() {
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

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
      toast.custom((tActive) => (
        <div
          className={`${
            tActive.visible ? 'animate-bounce' : 'opacity-0'
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex border border-gray-150 p-4`}
        >
          <div className="flex-1 w-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5 text-2xl">
                🔔
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900">
                  {t('owner.bookings.toastNewBooking')}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t('owner.bookings.toastNewBookingDesc', { time: newBooking.time, date: newBooking.date, guests: newBooking.guests })}
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(tActive.id)}
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
  }, [restaurantId, t]);

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
      showAlert(t('owner.bookings.alertApproveSuccess'));
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
      showAlert(t('owner.bookings.alertRejectSuccess'), 'warning');
    } catch (err: any) {
      showAlert('Lỗi: ' + err.message, 'warning');
    }
  };

  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <OwnerHeader title={t('owner.bookings.headerTitle')} />
      <div className="db-content">
        <div className="db-card">
          <div className="db-card__title">
            <span>{t('owner.bookings.cardTitle')}</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <select className="db-select" style={{ padding: '6px 12px', fontSize: 13 }} value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">{t('owner.bookings.filterAll')}</option>
                <option value="pending">{t('owner.bookings.filterPending')}</option>
                <option value="approved">{t('owner.bookings.filterApproved')}</option>
                <option value="rejected">{t('owner.bookings.filterRejected')}</option>
              </select>
            </div>
          </div>

          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>{t('owner.bookings.thEmail')}</th>
                  <th>{t('owner.bookings.thDate')}</th>
                  <th>{t('owner.bookings.thTime')}</th>
                  <th>{t('owner.bookings.thGuests')}</th>
                  <th>{t('owner.bookings.thNote')}</th>
                  <th>{t('owner.bookings.thStatus')}</th>
                  <th>{t('owner.bookings.thAction')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>{t('owner.bookings.loadingBookings')}</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>{t('owner.bookings.noBookings')}</td>
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
                        {b.status === 'pending' && <span className="db-badge db-badge--pending">{t('owner.bookings.statusPending')}</span>}
                        {b.status === 'approved' && <span className="db-badge db-badge--approved">{t('owner.bookings.statusApproved')}</span>}
                        {b.status === 'rejected' && <span className="db-badge db-badge--rejected" title={`Lý do: ${b.rejectReason || ''}`}>{t('owner.bookings.statusRejected')}</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {b.status === 'pending' ? (
                            <>
                              <button className="btn btn--dark" style={{ padding: '4px 10px', fontSize: 12, background: '#059669' }} onClick={() => handleApprove(b.id)}>{t('owner.bookings.btnApprove')}</button>
                              <button className="btn btn--dark" style={{ padding: '4px 10px', fontSize: 12, background: '#dc2626' }} onClick={() => openRejectModal(b.id)}>{t('owner.bookings.btnReject')}</button>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--clr-muted)' }}>{t('owner.bookings.btnDone')}</span>
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
            <h3 className="db-modal__title">{t('owner.bookings.modalRejectTitle')}</h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="db-form-field">
                <label>{t('owner.bookings.labelRejectReason')} <span>/ 却下の理由</span></label>
                <textarea className="db-textarea" placeholder={t('owner.bookings.placeholderRejectReason')} required
                  value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
              </div>
              <div className="db-modal__actions">
                <button type="button" className="modal__cancel" onClick={() => setShowRejectModal(false)}>{t('owner.restaurant.btnCancel')}</button>
                <button type="submit" className="modal__submit" style={{ background: '#dc2626' }}>{t('owner.bookings.btnRejectSubmit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
