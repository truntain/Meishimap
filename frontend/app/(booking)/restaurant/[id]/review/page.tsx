import { Suspense } from 'react';
import type { Metadata } from 'next';
import WriteReviewClient from './WriteReviewClient';

export const metadata: Metadata = {
  title: 'Viết đánh giá — MESHIMAP',
  description: 'Chia sẻ trải nghiệm của bạn và giúp cộng đồng khám phá ẩm thực Nhật Bản.',
};

export default function WriteReviewPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--clr-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--clr-muted)' }}>Đang tải...</p>
      </div>
    }>
      <WriteReviewClient />
    </Suspense>
  );
}
