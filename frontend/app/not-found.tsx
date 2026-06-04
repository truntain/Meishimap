'use client';

import Link from 'next/link';
import { useAppLanguage } from '@/config/i18n';

export default function NotFound() {
  const { language } = useAppLanguage();

  const isVi = language === 'vi';

  const title = isVi ? 'Không tìm thấy trang' : 'ページが見つかりません';
  const subtitle = isVi 
    ? 'Nhà hàng này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.' 
    : 'このレストランは存在しないか、システムから削除されました。';
  const actionText = isVi ? 'Quay lại Trang chủ' : 'ホームに戻る';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '60px 20px',
      textAlign: 'center',
      background: 'radial-gradient(circle at center, #fdf8f3 0%, #f7eae1 100%)',
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid #e5d5c5',
        borderRadius: '24px',
        padding: '50px 40px',
        boxShadow: '0 20px 40px rgba(60, 36, 24, 0.08)',
        maxWidth: '500px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        {/* Animated Sushi Plate SVG Icon */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            {/* Wooden Board/Plate */}
            <ellipse cx="50" cy="70" rx="40" ry="15" fill="#C6893F" stroke="#8c5820" strokeWidth="3" />
            <ellipse cx="50" cy="65" rx="38" ry="12" fill="#EAD5C3" />
            {/* Empty Spot Shadow */}
            <ellipse cx="50" cy="63" rx="15" ry="5" fill="rgba(60, 36, 24, 0.15)" />
            {/* Chopsticks resting empty */}
            <line x1="20" y1="50" x2="80" y2="75" stroke="#3C2418" strokeWidth="4" strokeLinecap="round" />
            <line x1="18" y1="56" x2="78" y2="81" stroke="#3C2418" strokeWidth="3" strokeLinecap="round" />
            {/* Little cute steam rises from empty spot */}
            <path d="M45,45 C45,35 55,35 55,45 C55,50 45,50 45,45 Z" fill="none" stroke="#A78B71" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M48,32 C48,27 52,27 52,32" fill="none" stroke="#A78B71" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <style>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
              100% { transform: translateY(0px); }
            }
          `}</style>
        </div>

        <div>
          <h1 style={{
            fontSize: '72px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #FF6B00 0%, #C62F00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            lineHeight: 1,
          }}>
            404
          </h1>

          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#3C2418',
            margin: '12px 0 8px 0',
          }}>
            {title}
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#655043',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {subtitle}
          </p>
        </div>

        <Link 
          href="/" 
          style={{
            backgroundColor: '#FF6B00',
            color: '#fff',
            fontWeight: 700,
            padding: '12px 28px',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(255, 107, 0, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E55A00';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(255, 107, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FF6B00';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 107, 0, 0.3)';
          }}
        >
          {actionText}
        </Link>
      </div>
    </div>
  );
}
