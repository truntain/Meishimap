"use client";

import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useAppLanguage } from '@/config/i18n';

export interface UserProfile {
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

export const DEFAULT_USER: UserProfile = {
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

const profileCopy = {
  vi: {
    title: 'Chỉnh sửa hồ sơ',
    subtitle: 'Cập nhật thông tin tài khoản cá nhân của bạn',
    avatarBtn: 'Thay đổi ảnh',
    avatarHint: 'JPG, PNG hoặc GIF.',
    nicknameLabel: 'Biệt danh',
    nicknamePlaceholder: 'Nhập biệt danh của bạn',
    birthdateLabel: 'Ngày sinh',
    hometownLabel: 'Quê quán',
    hometownPlaceholder: 'Hà Nội, Việt Nam',
    bioLabel: 'Giới thiệu',
    bioPlaceholder: 'Hãy viết vài dòng giới thiệu về bản thân bạn...',
    cancelBtn: 'Hủy bỏ',
    saveBtn: 'Lưu thay đổi',
    savingBtn: 'Đang lưu...',
    successAlert: 'Đã lưu thay đổi hồ sơ cá nhân thành công!',
    emailLabel: 'Email',
    roleLabel: 'Vai trò',
    validationNickname: 'Vui lòng nhập biệt danh của bạn.',
    validationHometown: 'Vui lòng nhập quê quán của bạn.',
    validationBio: 'Vui lòng nhập vài dòng giới thiệu về bản thân.',
    validationImage: 'Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, GIF).',
    loading: 'Đang tải thông tin hồ sơ...',
    months: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    birthMonthLabel: 'Tháng sinh',
    birthDayLabel: 'Ngày sinh',
    birthYearLabel: 'Năm sinh',
  },
  ja: {
    title: 'プロフィール編集',
    subtitle: '個人アカウント情報を更新します',
    avatarBtn: '写真を変更',
    avatarHint: 'JPG、PNGまたはGIF。',
    nicknameLabel: 'ニックネーム',
    nicknamePlaceholder: 'ニックネームを入力してください',
    birthdateLabel: '誕生日',
    hometownLabel: '出身地',
    hometownPlaceholder: 'ハノイ、ベトナム',
    bioLabel: '自己紹介',
    bioPlaceholder: '自己紹介を数行で書いてください...',
    cancelBtn: 'キャンセル',
    saveBtn: '変更を保存',
    savingBtn: '保存中...',
    successAlert: 'プロフィールの変更が正常に保存されました！',
    emailLabel: 'メールアドレス',
    roleLabel: 'ロール',
    validationNickname: 'ニックネームを入力してください。',
    validationHometown: '出身地を入力してください。',
    validationBio: '自己紹介を入力してください。',
    validationImage: '有効な画像ファイル（PNG、JPG、GIF）を選択してください。',
    loading: 'プロフィール情報を読み込み中...',
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    birthMonthLabel: '誕生月',
    birthDayLabel: '誕生日',
    birthYearLabel: '誕生年',
  }
};

export default function ProfileClient({ initialUser }: { initialUser: UserProfile | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language, toggleLanguage } = useAppLanguage();
  const copy = profileCopy[language];

  const activeUser = initialUser || DEFAULT_USER;

  const [user, setUser] = useState<UserProfile>(activeUser);
  const [nickname, setNickname] = useState(activeUser.nickname || activeUser.name || '');
  const [birthMonth, setBirthMonth] = useState(activeUser.birthMonth || '1');
  const [birthDay, setBirthDay] = useState(activeUser.birthDay || '15');
  const [birthYear, setBirthYear] = useState(activeUser.birthYear || '1995');
  const [hometown, setHometown] = useState(activeUser.hometown || '');
  const [bio, setBio] = useState(activeUser.bio || '');
  const [avatar, setAvatar] = useState(activeUser.avatar || DEFAULT_USER.avatar || '');
  
  const [errors, setErrors] = useState<{ nickname?: string; hometown?: string; bio?: string }>({});
  
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // SEO Page Title
  useEffect(() => {
    document.title = language === 'ja' ? "プロフィール編集 — MESHIMAP" : "Chỉnh sửa hồ sơ — MESHIMAP";
  }, [language]);

  // Handle avatar upload click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Process avatar file and display premium local preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(copy.validationImage);
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
    
    const newErrors: { nickname?: string; hometown?: string; bio?: string } = {};

    if (!nickname.trim()) {
      newErrors.nickname = copy.validationNickname;
    }
    if (!hometown.trim()) {
      newErrors.hometown = copy.validationHometown;
    }
    if (!bio.trim()) {
      newErrors.bio = copy.validationBio;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Smoothly scroll and focus on the first input with error
      const firstErrorField = document.getElementById(`profile-${Object.keys(newErrors)[0]}`);
      firstErrorField?.focus();
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrors({});
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

      // Redirect to correct dashboard or home after a beautiful delay
      setTimeout(() => {
        if (user?.role === 'admin' || user?.role === 'quản lý') {
          router.push('/admins');
        } else if (user?.role === 'restaurant_owner' || user?.role === 'owner' || user?.role === 'chủ nhà hàng') {
          router.push('/owners');
        } else {
          router.push('/');
        }
        // Force refresh to update the global Header state across all components
        router.refresh();
      }, 1500);
    }, 800); // Simulate modern network speed delay
  };

  const handleCancel = () => {
    if (user?.role === 'admin' || user?.role === 'quản lý') {
      router.push('/admins');
    } else if (user?.role === 'restaurant_owner' || user?.role === 'owner' || user?.role === 'chủ nhà hàng') {
      router.push('/owners');
    } else {
      router.push('/');
    }
  };

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 1960; y--) {
    years.push(y);
  }

  const days: number[] = [];
  for (let d = 1; d <= 31; d++) {
    days.push(d);
  }

  return (
    <main className="profile-container" role="main">
      <div className="profile-heading">
        <h1 className="profile-title">{copy.title}</h1>
        <p className="profile-subtitle">{copy.subtitle}</p>
      </div>

      <div className="profile-main">
        <aside className="profile-left">
          <div className="profile-card">
            <div className="profile-avatar-wrap">
              <img
                id="avatar-preview"
                src={avatar}
                alt={language === 'ja' ? `${nickname}のプロフィール写真` : `Ảnh đại diện của ${nickname}`}
                className="profile-avatar"
              />
            </div>
            <button
              type="button"
              className="btn btn--primary"
              id="btn-change-avatar"
              data-action="trigger-avatar-upload"
              onClick={handleAvatarClick}
            >
              {copy.avatarBtn}
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
              {copy.avatarHint}
            </span>
            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--clr-border)', margin: '8px 0' }} />
            <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--clr-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{copy.emailLabel}</span>
                <span style={{ color: 'var(--clr-dark)', wordBreak: 'break-all', fontWeight: 500 }} id="profile-info-email">{user.email}</span>
              </div>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--clr-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{copy.roleLabel}</span>
                <span style={{ 
                  display: 'inline-block', 
                  marginTop: '4px',
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  textTransform: 'capitalize',
                  backgroundColor: user.role === 'quản lý' || user.role === 'admin' ? '#FEE2E2' : user.role === 'chủ nhà hàng' || user.role === 'owner' || user.role === 'restaurant_owner' ? '#FEF3C7' : '#E0F2FE',
                  color: user.role === 'quản lý' || user.role === 'admin' ? '#991B1B' : user.role === 'chủ nhà hàng' || user.role === 'owner' || user.role === 'restaurant_owner' ? '#92400E' : '#075985'
                }} id="profile-info-role">
                  {user.role === 'quản lý' || user.role === 'admin' 
                    ? (language === 'ja' ? '管理者' : 'Quản trị viên')
                    : user.role === 'chủ nhà hàng' || user.role === 'owner' || user.role === 'restaurant_owner'
                    ? (language === 'ja' ? '店舗オーナー' : 'Chủ nhà hàng')
                    : (language === 'ja' ? '顧客' : 'Khách hàng')}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <div className="profile-right">
          <div className="profile-form-card">
            <div 
              className={`success-banner ${isSaved ? 'is-visible' : ''}`} 
              id="profile-success" 
              role="alert"
              style={isSaved ? { display: 'flex' } : {}}
            >
              <span>✅ {copy.successAlert}</span>
            </div>

            <form 
              id="profile-form" 
              className="profile-form" 
              onSubmit={handleSubmit} 
              noValidate 
              data-action="submit-profile"
            >
              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-nickname">
                  {copy.nicknameLabel}
                </label>
                <input
                  type="text"
                  id="profile-nickname"
                  className={`profile-input ${errors.nickname ? 'is-error' : ''}`}
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    if (errors.nickname) {
                      setErrors(prev => ({ ...prev, nickname: undefined }));
                    }
                  }}
                  placeholder={copy.nicknamePlaceholder}
                  required
                  style={errors.nickname ? { borderColor: '#e53e3e', boxShadow: '0 0 0 3px rgba(229, 62, 94, 0.08)' } : {}}
                />
                <div className={`field-error ${errors.nickname ? 'is-visible' : ''}`} role="alert">
                  {errors.nickname}
                </div>
              </div>

              <div className="profile-field">
                <label className="profile-label">
                  {copy.birthdateLabel}
                </label>
                <div className="profile-row">
                  <select 
                    id="profile-birth-month" 
                    className="profile-select" 
                    aria-label={copy.birthMonthLabel}
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                  >
                    {copy.months.map((m, index) => (
                      <option key={index + 1} value={String(index + 1)}>{m}</option>
                    ))}
                  </select>

                  <select 
                    id="profile-birth-day" 
                    className="profile-select" 
                    aria-label={copy.birthDayLabel}
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
                    aria-label={copy.birthYearLabel}
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                  >
                    {years.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-hometown">
                  {copy.hometownLabel}
                </label>
                <input
                  type="text"
                  id="profile-hometown"
                  className={`profile-input ${errors.hometown ? 'is-error' : ''}`}
                  value={hometown}
                  onChange={(e) => {
                    setHometown(e.target.value);
                    if (errors.hometown) {
                      setErrors(prev => ({ ...prev, hometown: undefined }));
                    }
                  }}
                  placeholder={copy.hometownPlaceholder}
                  required
                  style={errors.hometown ? { borderColor: '#e53e3e', boxShadow: '0 0 0 3px rgba(229, 62, 94, 0.08)' } : {}}
                />
                <div className={`field-error ${errors.hometown ? 'is-visible' : ''}`} role="alert">
                  {errors.hometown}
                </div>
              </div>

              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-bio">
                  {copy.bioLabel}
                </label>
                <textarea
                  id="profile-bio"
                  className={`profile-textarea ${errors.bio ? 'is-error' : ''}`}
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    if (errors.bio) {
                      setErrors(prev => ({ ...prev, bio: undefined }));
                    }
                  }}
                  placeholder={copy.bioPlaceholder}
                  required
                  style={errors.bio ? { borderColor: '#e53e3e', boxShadow: '0 0 0 3px rgba(229, 62, 94, 0.08)' } : {}}
                />
                <div className={`field-error ${errors.bio ? 'is-visible' : ''}`} role="alert">
                  {errors.bio}
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-btn-cancel"
                  id="btn-cancel-profile"
                  data-action="profile-cancel"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {copy.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="profile-btn-save"
                  id="btn-save-profile"
                  disabled={isLoading}
                >
                  {isLoading ? copy.savingBtn : copy.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
