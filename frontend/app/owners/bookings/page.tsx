'use client';

import { useEffect, useState } from 'react';
import OwnerHeader from '../components/OwnerHeader';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAppLanguage, ownerCopy } from '@/config/i18n';
import { notFound } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';

export default function OwnerBookingsPage() {
  const { language } = useAppLanguage();
  const copy = ownerCopy[language];

  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  if (isNotFound) {
    notFound();
  }

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
        if (res.status === 404) {
          setIsNotFound(true);
          return;
        }
        if (!res.ok) {
          throw new Error(copy.alertLoadRestaurantError);
        }
        const data = await res.json();
        setRestaurantId(data.id);
      } catch (err: any) {
        console.error(err);
        showAlert(err.message || 'Error', 'warning');
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [copy.alertLoadRestaurantError]);

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
        if (!res.ok) throw new Error(copy.alertLoadBookingsError);
        const data = await res.json();

        // Map dữ liệu DB sang giao diện
        const mapped = data.map((b: any) => ({
          id: b.id,
          name: b.user?.name || 'Khách vãng lai',
          phone: b.user?.email || 'Chưa cập nhật', // email làm thông tin liên hệ
          date: b.bookingDate,
          time: b.bookingTime?.substring(0, 5) || b.bookingTime,
          guests: b.guests + ' ' + (language === 'vi' ? 'người' : '人'),
          note: b.note || '',
          status: b.status === 'confirmed' ? 'approved' : b.status === 'cancelled' ? 'rejected' : 'pending',
          rejectReason: b.rejectReason || '',
        }));

        setBookings(mapped);
      } catch (err: any) {
        console.error(err);
        showAlert(err.message || 'Error', 'warning');
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
                  {copy.toastNewBooking}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {copy.toastNewBookingDesc
                    .replace('{{time}}', newBooking.time)
                    .replace('{{date}}', newBooking.date)
                    .replace('{{guests}}', String(newBooking.guests))}
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
  }, [restaurantId, copy.alertLoadBookingsError, copy.toastNewBooking, copy.toastNewBookingDesc, language]);

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

      if (!res.ok) throw new Error('Error');

      const updated = bookings.map(b => String(b.id) === String(id) ? { ...b, status: 'approved' } : b);
      setBookings(updated);
      showAlert(copy.alertApproveSuccess);
    } catch (err: any) {
      showAlert(err.message || 'Error', 'warning');
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

      if (!res.ok) throw new Error('Error');

      const updated = bookings.map(b => String(b.id) === String(selectedBookingId) ? { ...b, status: 'rejected', rejectReason } : b);
      setBookings(updated);
      setShowRejectModal(false);
      showAlert(copy.alertRejectSuccess, 'warning');
    } catch (err: any) {
      showAlert(err.message || 'Error', 'warning');
    }
  };

  const handleDelete = async (id: any) => {
    if (!window.confirm(copy.confirmDeleteBooking)) return;
    const token = Cookies.get('access_token');
    try {
      const res = await fetch(`${API_BASE_URL}/booking/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error(copy.alertDeleteBookingError);

      setBookings(prev => prev.filter(b => String(b.id) !== String(id)));
      showAlert(copy.alertDeleteBookingSuccess);
    } catch (err: any) {
      showAlert(err.message || 'Error', 'warning');
    }
  };

  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <OwnerHeader title={copy.bookingsTitle} />
      <div className="db-content">
        <div className="db-card">
          <div className="db-card__title">
            <span>{copy.bookingsCardTitle}</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <select className="db-select" style={{ padding: '6px 12px', fontSize: 13 }} value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">{copy.filterStatusAll}</option>
                <option value="pending">{copy.filterStatusPending}</option>
                <option value="approved">{copy.filterStatusApproved}</option>
                <option value="rejected">{copy.filterStatusRejected}</option>
              </select>
            </div>
          </div>

          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>{copy.colEmail}</th>
                  <th>{copy.colDate}</th>
                  <th>{copy.colTime}</th>
                  <th>{copy.colGuests}</th>
                  <th>{copy.colNote}</th>
                  <th>{copy.colStatus}</th>
                  <th>{copy.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>{copy.loadingBookings}</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)' }}>{copy.noBookings}</td>
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
                        {b.status === 'pending' && <span className="db-badge db-badge--pending">{copy.statusPending}</span>}
                        {b.status === 'approved' && <span className="db-badge db-badge--approved">{copy.statusApproved}</span>}
                        {b.status === 'rejected' && <span className="db-badge db-badge--rejected" title={`${language === 'vi' ? 'Lý do' : '理由'}: ${b.rejectReason || ''}`}>{copy.statusRejected}</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {b.status === 'pending' ? (
                            <>
                              <button className="btn btn--dark" style={{ padding: '4px 10px', fontSize: 12, background: '#059669' }} onClick={() => handleApprove(b.id)}>{copy.actionApprove}</button>
                              <button className="btn btn--dark" style={{ padding: '4px 10px', fontSize: 12, background: '#dc2626' }} onClick={() => openRejectModal(b.id)}>{copy.actionReject}</button>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: 12, color: 'var(--clr-muted)' }}>{copy.actionProcessed}</span>
                              <button className="btn btn--dark" style={{ padding: '4px 10px', fontSize: 12, background: '#6b7280' }} onClick={() => handleDelete(b.id)}>{copy.actionDelete}</button>
                            </>
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
            <h3 className="db-modal__title">{copy.rejectModalTitle}</h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="db-form-field">
                <label>{copy.rejectReasonLabel}</label>
                <textarea className="db-textarea" placeholder={copy.rejectReasonPlaceholder} required
                  value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
              </div>
              <div className="db-modal__actions">
                <button type="button" className="modal__cancel" onClick={() => setShowRejectModal(false)}>{copy.cancel}</button>
                <button type="submit" className="modal__submit" style={{ background: '#dc2626' }}>{copy.rejectSubmit}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
