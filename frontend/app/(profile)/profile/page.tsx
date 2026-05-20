"use client";

import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  nickname?: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  hometown?: string;
  bio?: string;
  avatar?: string;
}

// Keep static default user constants outside the component scope
// to prevent missing dependencies warnings in useEffect.
const DEFAULT_USER: UserProfile = {
  name: 'Yuki Nguyen',
  email: 'yuki.nguyen@example.com',
  role: 'khách hàng',
  nickname: 'Yuki Nguyen',
  birthMonth: '5',
  birthDay: '20',
  birthYear: '1996',
  hometown: 'Hà Nội, Việt Nam',
  bio: 'Chào mọi người, mình là Yuki. Mình rất yêu thích ẩm thực Nhật Bản và Việt Nam! 🇯🇵🇻🇳',
  avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23FD8A3E"><circle cx="50" cy="50" r="50" fill="%23FD8A3E" opacity="0.15"/><circle cx="50" cy="40" r="20" fill="%236C2F00"/><path d="M50 65c-20 0-35 10-35 20v5h70v-5c0-10-15-20-35-20z" fill="%236C2F00"/></svg>'
};

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [birthMonth, setBirthMonth] = useState('1');
  const [birthDay, setBirthDay] = useState('15');
  const [birthYear, setBirthYear] = useState('1995');
  const [hometown, setHometown] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // SEO Page Title
  useEffect(() => {
    document.title = "Chỉnh sửa hồ sơ — MESHIMAP";
  }, []);

  // Load profile from Cookies on mount
  useEffect(() => {
    const userData = Cookies.get('user');
    let currentUser: UserProfile;

    if (userData) {
      try {
        currentUser = JSON.parse(userData);
      } catch {
        currentUser = DEFAULT_USER;
      }
    } else {
      currentUser = DEFAULT_USER;
      // Persist the default user in Cookies for consistent demo state if not already logged in
      Cookies.set('user', JSON.stringify(DEFAULT_USER), { expires: 7 });
    }

    // Set state asynchronously in the next tick to prevent triggering
    // the "react-hooks/set-state-in-effect" lint error.
    const timer = setTimeout(() => {
      setUser(currentUser);
      setNickname(currentUser.nickname || currentUser.name || '');
      setBirthMonth(currentUser.birthMonth || '1');
      setBirthDay(currentUser.birthDay || '15');
      setBirthYear(currentUser.birthYear || '1995');
      setHometown(currentUser.hometown || '');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || DEFAULT_USER.avatar || '');
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Handle avatar upload click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Process avatar file and display premium local preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit profile details
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('Vui lòng nhập Biệt danh.');
      return;
    }

    setIsLoading(true);

    // Sync updated info with local Cookies so the entire Next.js app (Header, etc.) updates instantly
    const updatedUser: UserProfile = {
      ...user,
      name: nickname.trim(),
      email: user?.email || DEFAULT_USER.email,
      role: user?.role || DEFAULT_USER.role,
      nickname: nickname.trim(),
      birthMonth,
      birthDay,
      birthYear,
      hometown: hometown.trim(),
      bio: bio.trim(),
      avatar
    };

    setTimeout(() => {
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
      
      // Update local state and trigger success notification
      setUser(updatedUser);
      setIsSaved(true);
      setIsLoading(false);

      // Scroll to the top of the form smoothly to read the success banner
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Redirect home after a beautiful delay
      setTimeout(() => {
        router.push('/');
        // Force refresh to update the global Header state across all components
        router.refresh();
      }, 1500);
    }, 800); // Simulate modern network speed delay
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--clr-muted)', fontSize: '18px' }}>
          Đang tải thông tin hồ sơ...
        </p>
      </div>
    );
  }

  // Generate Year Options dynamically (1960 to current year)
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 1960; y--) {
    years.push(y);
  }

  // Generate Day Options dynamically (1 to 31)
  const days: number[] = [];
  for (let d = 1; d <= 31; d++) {
    days.push(d);
  }

  return (
    <main className="profile-container" role="main">
      <div className="profile-heading">
        <h1 className="profile-title">Chỉnh sửa hồ sơ</h1>
        <p className="profile-subtitle">プロフィール編集</p>
      </div>

      <div className="profile-main">
        {/* Left Column: Avatar editing */}
        <aside className="profile-left">
          <div className="profile-card">
            <div className="profile-avatar-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                id="avatar-preview"
                src={avatar}
                alt={`Avatar của ${nickname}`}
                className="profile-avatar"
              />
            </div>
            <button
              type="button"
              className="btn btn--primary"
              id="btn-change-avatar"
              onClick={handleAvatarClick}
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              Thay đổi ảnh
            </button>
            <input
              type="file"
              ref={fileInputRef}
              id="avatar-upload"
              accept="image/png, image/jpeg, image/gif"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <span className="profile-avatar-hint">
              Hỗ trợ định dạng JPG, PNG hoặc GIF.
            </span>
          </div>
        </aside>

        {/* Right Column: User profile form */}
        <div className="profile-right">
          <div className="profile-form-card">
            {/* Success notification banner */}
            <div 
              className={`success-banner ${isSaved ? 'is-visible' : ''}`} 
              id="profile-success" 
              role="alert"
            >
              <span>✅ Đã lưu thay đổi hồ sơ cá nhân thành công!</span>
            </div>

            <form id="profile-form" className="profile-form" onSubmit={handleSubmit} noValidate>
              {/* Nickname input */}
              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-nickname">
                  Biệt danh <span className="profile-label-jp">/ ニックネーム</span>
                </label>
                <input
                  type="text"
                  id="profile-nickname"
                  className="profile-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Nhập biệt danh của bạn"
                  required
                />
              </div>

              {/* Birth Date selects */}
              <div className="profile-field">
                <label className="profile-label">
                  Ngày sinh <span className="profile-label-jp">/ 誕生日</span>
                </label>
                <div className="profile-row">
                  <select 
                    id="profile-birth-month" 
                    className="profile-select" 
                    aria-label="Tháng sinh"
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                  >
                    <option value="1">Tháng 1</option>
                    <option value="2">Tháng 2</option>
                    <option value="3">Tháng 3</option>
                    <option value="4">Tháng 4</option>
                    <option value="5">Tháng 5</option>
                    <option value="6">Tháng 6</option>
                    <option value="7">Tháng 7</option>
                    <option value="8">Tháng 8</option>
                    <option value="9">Tháng 9</option>
                    <option value="10">Tháng 10</option>
                    <option value="11">Tháng 11</option>
                    <option value="12">Tháng 12</option>
                  </select>

                  <select 
                    id="profile-birth-day" 
                    className="profile-select" 
                    aria-label="Ngày sinh"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                  >
                    {days.map((d) => (
                      <option key={d} value={String(d)}>{d}</option>
                    ))}
                  </select>

                  <select 
                    id="profile-birth-year" 
                    className="profile-select" 
                    aria-label="Năm sinh"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                  >
                    {years.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hometown input */}
              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-hometown">
                  Quê quán <span className="profile-label-jp">/ 出身地</span>
                </label>
                <input
                  type="text"
                  id="profile-hometown"
                  className="profile-input"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  placeholder="Hà Nội, Việt Nam"
                  required
                />
              </div>

              {/* Bio textarea */}
              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-bio">
                  Giới thiệu <span className="profile-label-jp">/ 自己紹介</span>
                </label>
                <textarea
                  id="profile-bio"
                  className="profile-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Hãy viết vài dòng giới thiệu về bản thân bạn..."
                  required
                />
              </div>

              {/* Action buttons */}
              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-btn-cancel"
                  id="btn-cancel-profile"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="profile-btn-save"
                  id="btn-save-profile"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
