"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppLanguage } from '@/config/i18n';

const copy = {
  vi: {
    heroTitle: "Kết nối văn hóa qua ẩm thực",
    heroSubtitle: "Khám phá và đặt bàn tại những nhà hàng Nhật Bản tinh hoa nhất tại Việt Nam. Trải nghiệm sự chuyên nghiệp và ấm áp.",
    cardTitle: "Đăng nhập",
    cardSubtitle: "Chào mừng bạn trở lại!",
    emailLabel: "Email",
    emailPlaceholder: "example@gmail.com",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "••••••••",
    forgotPassword: "Quên mật khẩu?",
    submitBtn: "Đăng nhập",
    submitBtnLoading: "Đang đăng nhập...",
    footerPrefix: "Chưa có tài khoản? ",
    footerLink: "Đăng ký ngay",
    errorEmpty: "Vui lòng nhập đầy đủ email và mật khẩu.",
    errorInvalid: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
    langBtnLabel: "Chuyển sang tiếng Nhật",
    passwordToggleAria: "Hiện/Ẩn mật khẩu"
  },
  ja: {
    heroTitle: "食を通じて文化を繋ぐ",
    heroSubtitle: "ベトナムで最高の日本食レストランを探して予約。プロフェッショナルで温かいおもてなしを体験してください。",
    cardTitle: "ログイン",
    cardSubtitle: "おかえりなさい！",
    emailLabel: "メールアドレス",
    emailPlaceholder: "example@gmail.com",
    passwordLabel: "パスワード",
    passwordPlaceholder: "••••••••",
    forgotPassword: "パスワードを忘れた場合",
    submitBtn: "ログイン",
    submitBtnLoading: "ログイン中...",
    footerPrefix: "アカウントをお持ちでない方は ",
    footerLink: "新規登録",
    errorEmpty: "メールアドレスとパスワードを入力してください。",
    errorInvalid: "メールアドレスまたはパスワードが正しくありません。もう一度お試しください。",
    langBtnLabel: "ベトナム語に切り替え",
    passwordToggleAria: "パスワードを表示/非表示"
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { language, toggleLanguage } = useAppLanguage();
  const c = copy[language];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg(c.errorEmpty);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || c.errorInvalid);
      }

      // Lưu token vào Cookies thay vì localStorage (hết hạn sau 7 ngày)
      Cookies.set('access_token', data.access_token, { expires: 7 });
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });

      // Chuyển hướng dựa theo Role
      if (data.user.role === 'customer') {
        router.push('/');
      } else if (data.user.role === 'admin') {
        router.push('/admins');
      } else if (data.user.role === 'restaurant_owner') {
        router.push('/owners');
      } else {
        router.push('/');
      }

    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-hero" id="login-hero">
      {/* Left: Branding text */}
      <div className="auth-hero__text">
        <div>
          <h1 className="auth-hero__title">{c.heroTitle}</h1>
        </div>
        <p className="auth-hero__subtitle">
          {c.heroSubtitle}
        </p>
      </div>

      {/* Right: Auth card */}
      <div className="auth-card" role="main">
        {/* Language Toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="header__lang btn"
          aria-label={c.langBtnLabel}
          style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="#6C2F00" strokeWidth="1.2" />
            <path d="M9 1.5C9 1.5 6 4.5 6 9s3 7.5 3 7.5M9 1.5C9 1.5 12 4.5 12 9s-3 7.5-3 7.5M1.5 9h15" stroke="#6C2F00" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>{language === 'vi' ? 'VN / JP' : 'JP / VN'}</span>
        </button>

        <div className="auth-card__header">
          <h2 className="auth-card__title">{c.cardTitle}</h2>
          <p className="auth-card__subtitle">{c.cardSubtitle}</p>
        </div>

        {errorMsg && (
          <div className="auth-alert is-visible" id="login-alert" role="alert">
            {errorMsg}
          </div>
        )}

        <form id="login-form" className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">{c.emailLabel}</label>
            <div className="auth-input-wrap">
              <input
                type="email"
                id="login-email"
                className="auth-input"
                placeholder={c.emailPlaceholder}
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="auth-input-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1.5" y="3.75" width="15" height="10.5" rx="2" stroke="#877369" strokeWidth="1.2" />
                  <path d="M1.5 6.75 9 11.25l7.5-4.5" stroke="#877369" strokeWidth="1.2" />
                </svg>
              </span>
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="auth-label" htmlFor="login-password">{c.passwordLabel}</label>
              <a href="#" className="auth-forgot" style={{ fontSize: '14px', color: 'var(--clr-dark)' }}>{c.forgotPassword}</a>
            </div>
            <div className="auth-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                className="auth-input"
                placeholder={c.passwordPlaceholder}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-input-toggle"
                aria-label={c.passwordToggleAria}
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1.5 9C1.5 9 4.125 3.75 9 3.75S16.5 9 16.5 9 13.875 14.25 9 14.25 1.5 9 1.5 9Z" stroke="#877369" strokeWidth="1.2" />
                  <circle cx="9" cy="9" r="2.25" stroke="#877369" strokeWidth="1.2" />
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" id="btn-login-submit" disabled={isLoading}>
            {isLoading ? c.submitBtnLoading : c.submitBtn}
          </button>
        </form>

        <p className="auth-card__footer">
          {c.footerPrefix}<Link href="/register" id="link-to-register">{c.footerLink}</Link>
        </p>
      </div>
    </section>
  );
}
