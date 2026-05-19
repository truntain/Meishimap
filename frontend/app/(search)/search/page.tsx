import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Tìm kiếm nhà hàng — MESHIMAP',
  description: 'Khám phá hàng trăm nhà hàng Nhật Bản chuẩn vị tại Việt Nam. Lọc theo món ăn, địa điểm và đánh giá.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--clr-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--clr-muted)' }}>Đang tải...</p>
      </div>
    }>
      <SearchClient />
    </Suspense>
  );
}
