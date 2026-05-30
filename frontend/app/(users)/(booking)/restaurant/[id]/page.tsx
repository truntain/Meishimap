import { Suspense } from 'react';
import type { Metadata } from 'next';
import RestaurantDetailClient from './RestaurantDetailClient';
import style from 'styled-jsx/style';

export const metadata: Metadata = {
  title: 'Chi tiết nhà hàng — MESHIMAP',
  description: 'Xem thông tin chi tiết, menu và đặt bàn tại nhà hàng Nhật Bản.',
};

export default function RestaurantDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--clr-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--clr-muted)' }}>Đang tải...</p>
      </div>
    }>
      <RestaurantDetailClient />
    </Suspense>
  );
}
