"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
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
      setErrorMsg('Vui lòng điền đầy đủ các trường.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự theo chuẩn hệ thống.');
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
        throw new Error(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }

      // Đăng ký thành công, thông báo và chuyển hướng sang trang đăng nhập
      alert('Đăng ký tài khoản thành công! Xin mời đăng nhập.');
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
          <h1 className="auth-hero__title">Kết nối văn hóa qua ẩm thực</h1>
          <p className="auth-hero__title-jp">食を通じて culture を繋ぐ</p>
        </div>
        <p className="auth-hero__subtitle">
          Khám phá và đặt bàn tại những nhà hàng Nhật Bản tinh hoa nhất tại Việt Nam. Trải nghiệm sự chuyên nghiệp và ấm áp.
        </p>
      </div>

      <div className="auth-card" role="main">
        <div className="auth-card__header">
          <h2 className="auth-card__title">Đăng ký</h2>
          <p className="auth-card__subtitle">Chào mừng bạn đến với MESHIMAP</p>
        </div>

        {errorMsg && (
          <div className="auth-alert is-visible" role="alert" style={{ marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form id="register-form" className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Tên người dùng */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">Tên người dùng</label>
            <div className="auth-input-wrap">
              <input 
                type="text" 
                id="reg-name" 
                className="auth-input" 
                placeholder="Họ và tên" 
                autoComplete="name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="auth-input-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="#877369" strokeWidth="1.2"/><path d="M2.25 15.75c0-3.728 3.022-6.75 6.75-6.75s6.75 3.022 6.75 6.75" stroke="#877369" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">Email</label>
            <div className="auth-input-wrap">
              <input 
                type="email" 
                id="reg-email" 
                className="auth-input" 
                placeholder="example@meshimap.com" 
                autoComplete="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="auth-input-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="3.75" width="15" height="10.5" rx="2" stroke="#877369" strokeWidth="1.2"/><path d="M1.5 6.75 9 11.25l7.5-4.5" stroke="#877369" strokeWidth="1.2"/></svg>
              </span>
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">Mật khẩu</label>
            <div className="auth-input-wrap">
              <input 
                type={showPassword ? "text" : "password"} 
                id="reg-password" 
                className="auth-input" 
                placeholder="••••••••" 
                autoComplete="new-password" 
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
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1.5 9C1.5 9 4.125 3.75 9 3.75S16.5 9 16.5 9 13.875 14.25 9 14.25 1.5 9 1.5 9Z" stroke="#877369" strokeWidth="1.2"/><circle cx="9" cy="9" r="2.25" stroke="#877369" strokeWidth="1.2"/></svg>
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">Xác nhận lại mật khẩu</label>
            <div className="auth-input-wrap">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                id="reg-confirm" 
                className="auth-input" 
                placeholder="••••••••" 
                autoComplete="new-password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="auth-input-toggle" 
                aria-label="Hiện/Ẩn mật khẩu"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1.5 9C1.5 9 4.125 3.75 9 3.75S16.5 9 16.5 9 13.875 14.25 9 14.25 1.5 9 1.5 9Z" stroke="#877369" strokeWidth="1.2"/><circle cx="9" cy="9" r="2.25" stroke="#877369" strokeWidth="1.2"/></svg>
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" id="btn-register-submit" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <p className="auth-card__footer">
          Đã có tài khoản? <Link href="/login" id="link-to-login">Đăng nhập</Link>
        </p>
      </div>
    </section>
  );
}
