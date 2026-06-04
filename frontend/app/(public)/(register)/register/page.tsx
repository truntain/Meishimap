"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppLanguage } from '@/config/i18n';

const copy = {
  vi: {
    heroTitle: "Kết nối văn hóa qua ẩm thực",
    heroSubtitle: "Khám phá và đặt bàn tại những nhà hàng Nhật Bản tinh hoa nhất tại Việt Nam. Trải nghiệm sự chuyên nghiệp và ấm áp.",
    cardTitle: "Đăng ký",
    cardSubtitle: "Chào mừng bạn đến với MESHIMAP",
    nameLabel: "Tên người dùng",
    namePlaceholder: "Họ và tên",
    emailLabel: "Email",
    emailPlaceholder: "example@gmail.com",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "••••••••",
    confirmPasswordLabel: "Xác nhận lại mật khẩu",
    confirmPasswordPlaceholder: "••••••••",
    submitBtn: "Đăng ký tài khoản",
    submitBtnLoading: "Đang xử lý...",
    footerPrefix: "Đã có tài khoản? ",
    footerLink: "Đăng nhập",
    errorEmpty: "Vui lòng điền đầy đủ các trường.",
    errorMismatch: "Mật khẩu xác nhận không khớp.",
    errorShort: "Mật khẩu phải có ít nhất 6 ký tự theo chuẩn hệ thống.",
    errorFail: "Đăng ký thất bại. Vui lòng thử lại.",
    successAlert: "Đăng ký tài khoản thành công! Xin mời đăng nhập.",
    langBtnLabel: "Chuyển sang tiếng Nhật",
    passwordToggleAria: "Hiện/Ẩn mật khẩu"
  },
  ja: {
    heroTitle: "食を通じて文化を繋ぐ",
    heroSubtitle: "ベトナムで最高の日本食レストランを探して予約。プロフェッショナルで温かいおもてなしを体験してください。",
    cardTitle: "新規登録",
    cardSubtitle: "MESHIMAPへようこそ",
    nameLabel: "お名前",
    namePlaceholder: "フルネーム",
    emailLabel: "メールアドレス",
    emailPlaceholder: "example@gmail.com",
    passwordLabel: "パスワード",
    passwordPlaceholder: "••••••••",
    confirmPasswordLabel: "パスワード（確認）",
    confirmPasswordPlaceholder: "••••••••",
    submitBtn: "アカウント登録",
    submitBtnLoading: "処理中...",
    footerPrefix: "既にアカウントをお持ちの方は ",
    footerLink: "ログイン",
    errorEmpty: "すべての項目を入力してください。",
    errorMismatch: "パスワードが一致しません。",
    errorShort: "パスワードは6文字以上にしてください。",
    errorFail: "登録に失敗しました。もう一度お試しください。",
    successAlert: "アカウント登録が完了しました！ログインしてください。",
    langBtnLabel: "ベトナム語に切り替え",
    passwordToggleAria: "パスワードを表示/非表示"
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const { language, toggleLanguage } = useAppLanguage();
  const c = copy[language];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg(c.errorEmpty);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(c.errorMismatch);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(c.errorShort);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || c.errorFail);
      }

      // Đăng ký thành công, thông báo và chuyển hướng sang trang đăng nhập
      alert(c.successAlert);
      router.push('/login');

    } catch (error: any) {
      // Bắt lỗi email trùng lặp từ backend trả về
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-hero" id="register-hero">
      <div className="auth-hero__text">
        <div>
          <h1 className="auth-hero__title">{c.heroTitle}</h1>
        </div>
        <p className="auth-hero__subtitle">
          {c.heroSubtitle}
        </p>
      </div>

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
          <div className="auth-alert is-visible" role="alert" style={{ marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form id="register-form" className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Tên người dùng */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">{c.nameLabel}</label>
            <div className="auth-input-wrap">
              <input
                type="text"
                id="reg-name"
                className="auth-input"
                placeholder={c.namePlaceholder}
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="auth-input-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="#877369" strokeWidth="1.2" /><path d="M2.25 15.75c0-3.728 3.022-6.75 6.75-6.75s6.75 3.022 6.75 6.75" stroke="#877369" strokeWidth="1.2" strokeLinecap="round" /></svg>
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">{c.emailLabel}</label>
            <div className="auth-input-wrap">
              <input
                type="email"
                id="reg-email"
                className="auth-input"
                placeholder={c.emailPlaceholder}
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="auth-input-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="3.75" width="15" height="10.5" rx="2" stroke="#877369" strokeWidth="1.2" /><path d="M1.5 6.75 9 11.25l7.5-4.5" stroke="#877369" strokeWidth="1.2" /></svg>
              </span>
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">{c.passwordLabel}</label>
            <div className="auth-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                id="reg-password"
                className="auth-input"
                placeholder={c.passwordPlaceholder}
                autoComplete="new-password"
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
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1.5 9C1.5 9 4.125 3.75 9 3.75S16.5 9 16.5 9 13.875 14.25 9 14.25 1.5 9 1.5 9Z" stroke="#877369" strokeWidth="1.2" /><circle cx="9" cy="9" r="2.25" stroke="#877369" strokeWidth="1.2" /></svg>
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">{c.confirmPasswordLabel}</label>
            <div className="auth-input-wrap">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="reg-confirm"
                className="auth-input"
                placeholder={c.confirmPasswordPlaceholder}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-input-toggle"
                aria-label={c.passwordToggleAria}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1.5 9C1.5 9 4.125 3.75 9 3.75S16.5 9 16.5 9 13.875 14.25 9 14.25 1.5 9 1.5 9Z" stroke="#877369" strokeWidth="1.2" /><circle cx="9" cy="9" r="2.25" stroke="#877369" strokeWidth="1.2" /></svg>
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" id="btn-register-submit" disabled={isLoading}>
            {isLoading ? c.submitBtnLoading : c.submitBtn}
          </button>
        </form>

        <p className="auth-card__footer">
          {c.footerPrefix}<Link href="/login" id="link-to-login">{c.footerLink}</Link>
        </p>
      </div>
    </section>
  );
}
