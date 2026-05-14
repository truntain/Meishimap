"use client";

import React, { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<{name?: string, email: string, role: string} | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '48px auto', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: '#6C2F00' }}>Hồ sơ cá nhân</h1>
      
      {user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: 600, color: '#877369' }}>Tên người dùng:</label>
            <p style={{ fontSize: '18px', marginTop: '4px' }}>{user.name || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label style={{ fontWeight: 600, color: '#877369' }}>Email:</label>
            <p style={{ fontSize: '18px', marginTop: '4px' }}>{user.email}</p>
          </div>
          <div>
            <label style={{ fontWeight: 600, color: '#877369' }}>Vai trò:</label>
            <p style={{ fontSize: '18px', marginTop: '4px', textTransform: 'capitalize' }}>{user.role}</p>
          </div>
        </div>
      ) : (
        <p>Đang tải dữ liệu...</p>
      )}
    </div>
  );
}
