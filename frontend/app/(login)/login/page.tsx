"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
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
        throw new Error(data.message || 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
      }

      // Lưu token vào Cookies thay vì localStorage (hết hạn sau 7 ngày)
      Cookies.set('access_token', data.access_token, { expires: 7 });
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });

      // Chuyển hướng dựa theo Role
      if (data.user.role === 'khách hàng') {
        router.push('/');
      } else if (data.user.role === 'quản lý') {
        alert('Đăng nhập thành công với quyền Quản lý. (Trang Admin đang được phát triển)');
        // router.push('/admin');
      } else if (data.user.role === 'chủ nhà hàng') {
        alert('Đăng nhập thành công với quyền Chủ nhà hàng. (Trang chủ nhà hàng đang được phát triển)');
        // router.push('/manager');
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
            <h1 className="auth-hero__title">Kết nối văn hóa qua ẩm thực</h1>
            <p className="auth-hero__title-jp">食を通じて文化を繋ぐ</p>
          </div>
          <p className="auth-hero__subtitle">
            Khám phá và đặt bàn tại những nhà hàng Nhật Bản tinh hoa nhất tại Việt Nam. Trải nghiệm sự chuyên nghiệp và ấm áp.
          </p>
        </div>

        {/* Right: Auth card */}
        <div className="auth-card" role="main">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Đăng nhập</h2>
            <p className="auth-card__subtitle">Chào mừng bạn trở lại!</p>
          </div>

          {errorMsg && (
            <div className="auth-alert is-visible" id="login-alert" role="alert">
              {errorMsg}
            </div>
          )}

          <form id="login-form" className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email</label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  id="login-email"
                  className="auth-input"
                  placeholder="example@meshimap.com"
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
                <label className="auth-label" htmlFor="login-password">Mật khẩu</label>
                <a href="#" className="auth-forgot" style={{ fontSize: '14px', color: 'var(--clr-dark)' }}>Quên mật khẩu?</a>
              </div>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  className="auth-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  aria-label="Hiện/Ẩn mật khẩu"
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
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-card__footer">
            Chưa có tài khoản? <Link href="/register" id="link-to-register">Đăng ký ngay</Link>
          </p>
        </div>
      </section>
  );
}
