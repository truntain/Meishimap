'use client';

import { useState } from 'react';
import OwnerHeader from '../components/OwnerHeader';

export default function OwnerPreviewPage() {
  const [key, setKey] = useState(0);

  const reloadPreview = () => {
    setKey(prev => prev + 1);
  };

  return (
    <>
      <OwnerHeader title="Xem trước giao diện người dùng" />
      <div className="db-content">
        <div className="db-card db-preview-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--clr-dark)' }}>
                Xem trước giao diện người dùng (Customer View)
              </h2>
              <p style={{ fontSize: 12, color: 'var(--clr-muted)' }}>
                Bản xem trước cập nhật trực tiếp từ dữ liệu hiện tại của bạn.
              </p>
            </div>
            <button className="btn btn--outline" style={{ padding: '6px 14px', fontSize: 13 }} onClick={reloadPreview}>
              🔄 Làm mới Preview
            </button>
          </div>
          <div className="db-preview-frame-wrap" style={{ position: 'relative', width: '100%', height: 600, border: '8px solid var(--clr-deeper)', borderRadius: 12, overflow: 'hidden' }}>
            <iframe 
              key={key}
              className="db-preview-frame" 
              src="/restaurant-detail" 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Preview"
            />
          </div>
        </div>
      </div>
    </>
  );
}
