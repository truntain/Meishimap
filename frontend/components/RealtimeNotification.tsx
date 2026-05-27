'use client';

import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { usePathname } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type BookingNotification = {
  id: number;
  restaurantName: string;
  date: string;
  time: string;
  status: 'approved' | 'rejected' | string;
  rejectReason?: string;
};

export default function RealtimeNotification() {
  const pathname = usePathname();
  const [notification, setNotification] = useState<BookingNotification | null>(null);
  const [visible, setVisible] = useState(false);

  const socketRef = useRef<any>(null);
  const connectedUserRef = useRef<number | null>(null);

  // Cleanup on final component unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Listen to cookie/pathname changes to trigger connection if not already connected
  useEffect(() => {
    const token = Cookies.get('access_token');
    const userData = Cookies.get('user');

    if (!token || !userData) {
      // User logged out, disconnect existing socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        connectedUserRef.current = null;
      }
      return;
    }

    let userId: number | null = null;
    try {
      const userObj = JSON.parse(decodeURIComponent(userData));
      userId = userObj.id;
    } catch (e) {
      try {
        const userObj = JSON.parse(userData);
        userId = userObj.id;
      } catch (err) {
        console.error('Failed to parse user cookie:', err);
      }
    }

    if (!userId) return;

    // If already connected to the current user, keep the connection active
    if (connectedUserRef.current === userId && socketRef.current?.connected) {
      return;
    }

    // Disconnect old socket if userId changed
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(API_BASE_URL);
    socketRef.current = socket;
    connectedUserRef.current = userId;

    socket.on('connect', () => {
      socket.emit('join_user_room', userId);
    });

    socket.on('booking_status_updated', (data: any) => {
      // Set the notification details
      setNotification({
        id: data.id,
        restaurantName: data.restaurantName,
        date: data.date,
        time: data.time?.substring(0, 5) || data.time,
        status: data.status,
        rejectReason: data.rejectReason,
      });
      setVisible(true);

      // Play sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
        audio.play().catch(e => {
          console.warn('Autoplay sound blocked until interaction:', e.message);
        });
      } catch (e) {
        console.error(e);
      }
    });
  }, [pathname]);

  // Auto close toast after 8 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible || !notification) return null;

  const isApproved = notification.status === 'approved' || notification.status === 'confirmed';

  return (
    <div className="fixed top-6 right-6 z-[9999] max-w-sm w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-100 p-4 transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in pointer-events-auto">
      <div className="flex gap-3">
        {/* Status Icon */}
        <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-50' : 'bg-red-50'}`}>
          {isApproved ? (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">
              {isApproved ? 'Đơn Đặt Bàn Được Nhận! ✅' : 'Đơn Đặt Bàn Bị Từ Chối! ❌'}
            </span>
            <button 
              onClick={() => setVisible(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
            Yêu cầu đặt bàn của bạn tại <span className="font-semibold text-gray-900">"{notification.restaurantName}"</span> lúc <span className="font-semibold">{notification.time}</span> ngày <span className="font-semibold">{notification.date}</span> đã được {isApproved ? 'chấp nhận' : 'từ chối'}.
          </p>

          {/* Rejection Reason */}
          {!isApproved && notification.rejectReason && (
            <div className="mt-2 bg-red-50/70 border border-red-100 rounded-lg p-2 text-[11px] text-red-900 leading-normal">
              <span className="font-bold">Lý do từ chối:</span> {notification.rejectReason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
