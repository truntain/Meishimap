"use client";

import Link from 'next/link';
import React from 'react';

export default function ForbiddenPage() {
  return (
    <div style={{ textAlign: 'center', margin: '120px auto', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '80px', color: '#d93025', fontWeight: 800, margin: 0 }}>403</h1>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '24px' }}>
        Truy cập bị từ chối
      </h2>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Tài khoản của bạn không có đủ quyền hạn để truy cập vào trang này. 
        Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là một sự nhầm lẫn.
      </p>
      <Link href="/" className="btn btn--primary">
        Quay lại Trang chủ
      </Link>
    </div>
  );
}
