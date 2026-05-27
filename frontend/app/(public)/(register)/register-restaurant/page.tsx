"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterRestaurantPage() {
  const router = useRouter();

  // Owner state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Restaurant state
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantNameJp, setRestaurantNameJp] = useState('');
  const [category, setCategory] = useState('Sushi');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [description, setDescription] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Document state
  const [japaneseProof, setJapaneseProof] = useState('');
  const [japaneseProofName, setJapaneseProofName] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [businessLicenseName, setBusinessLicenseName] = useState('');
  const [foodSafetyCert, setFoodSafetyCert] = useState('');
  const [foodSafetyCertName, setFoodSafetyCertName] = useState('');
  const [identityCard, setIdentityCard] = useState('');
  const [identityCardName, setIdentityCardName] = useState('');

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFileBase64: (base64: string) => void,
    setFileName: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file quá lớn (tối đa 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileBase64(event.target.result as string);
        setFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!name || !email || !restaurantName || !category || !address || !city) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    if (!japaneseProof || !businessLicense || !foodSafetyCert || !identityCard) {
      setErrorMsg('Vui lòng tải lên đầy đủ các giấy tờ pháp lý yêu cầu.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/register-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          restaurantName,
          restaurantNameJp: restaurantNameJp || undefined,
          category,
          address,
          district: district || undefined,
          city,
          phone: phone || undefined,
          description: description || undefined,
          japaneseProof,
          businessLicense,
          foodSafetyCert,
          identityCard,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (Array.isArray(data.message)) {
          throw new Error(data.message.join(', '));
        }
        throw new Error(data.message || 'Đăng ký đối tác thất bại. Vui lòng thử lại.');
      }

      alert('Đăng ký tài khoản đối tác thành công! Đơn đăng ký của bạn đang chờ quản trị viên phê duyệt.');
      router.push('/login');
      
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-hero" id="register-partner-hero">
      <div className="auth-hero__text">
        <div>
          <h1 className="auth-hero__title">Trở thành đối tác ẩm thực</h1>
          <p className="auth-hero__title-jp">Meshimap パートナー登録</p>
        </div>
        <p className="auth-hero__subtitle">
          Mở rộng phạm vi tiếp cận của bạn tới hàng ngàn khách hàng yêu thích ẩm thực Nhật Bản và Việt Nam. Quản lý đặt bàn chuyên nghiệp, tăng trưởng doanh thu vượt trội.
        </p>
      </div>

      <div className="auth-card" role="main" style={{ width: '100%', maxWidth: '680px' }}>
        <div className="auth-card__header">
          <h2 className="auth-card__title">Đăng ký đối tác</h2>
          <p className="auth-card__subtitle">Tạo tài khoản chủ nhà hàng và đăng ký cửa hàng mới</p>
        </div>

        {errorMsg && (
          <div className="auth-alert is-visible" role="alert" style={{ marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form id="register-partner-form" className="auth-form" onSubmit={handleSubmit} noValidate>
          
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--clr-primary)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '6px', marginBottom: '4px' }}>
            1. Thông tin tài khoản chủ nhà hàng
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Tên chủ nhà hàng */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="partner-name">Họ và tên chủ nhà hàng *</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="partner-name" 
                  className="auth-input" 
                  placeholder="Nguyễn Văn A" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="partner-email">Email đăng nhập *</label>
              <div className="auth-input-wrap">
                <input 
                  type="email" 
                  id="partner-email" 
                  className="auth-input" 
                  placeholder="partner@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--clr-primary)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '6px', marginTop: '12px', marginBottom: '4px' }}>
            2. Thông tin nhà hàng đăng ký tuyển dụng đối tác
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Tên nhà hàng */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-name">Tên nhà hàng (Tiếng Việt) *</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="restaurant-name" 
                  className="auth-input" 
                  placeholder="Nhà hàng Sushi Sakura" 
                  required 
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />
              </div>
            </div>

            {/* Tên tiếng Nhật */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-name-jp">Tên nhà hàng (Tiếng Nhật - Optional)</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="restaurant-name-jp" 
                  className="auth-input" 
                  placeholder="さくら寿司" 
                  value={restaurantNameJp}
                  onChange={(e) => setRestaurantNameJp(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Loại hình ẩm thực */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-category">Loại hình ẩm thực *</label>
              <div className="auth-input-wrap">
                <select 
                  id="restaurant-category" 
                  className="auth-input" 
                  style={{ appearance: 'auto', paddingRight: '16px' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Sushi">Sushi & Sashimi</option>
                  <option value="Ramen">Ramen & Udon</option>
                  <option value="Nướng">Yakiniku (Món nướng)</option>
                  <option value="Izakaya">Izakaya (Quán nhậu kiểu Nhật)</option>
                  <option value="Phở">Phở</option>
                  <option value="Bún chả">Bún chả</option>
                  <option value="Bánh mì">Bánh mì</option>
                  <option value="Món Việt">Món ăn Việt Nam</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-phone">Số điện thoại liên hệ *</label>
              <div className="auth-input-wrap">
                <input 
                  type="tel" 
                  id="restaurant-phone" 
                  className="auth-input" 
                  placeholder="0987654321" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="restaurant-address">Địa chỉ chi tiết (Số nhà, tên đường...) *</label>
            <div className="auth-input-wrap">
              <input 
                type="text" 
                id="restaurant-address" 
                className="auth-input" 
                placeholder="Số 15 Kim Mã" 
                required 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Quận/Huyện */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-district">Quận / Huyện</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="restaurant-district" 
                  className="auth-input" 
                  placeholder="Ba Đình" 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
            </div>

            {/* Tỉnh/Thành phố */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-city">Tỉnh / Thành phố *</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="restaurant-city" 
                  className="auth-input" 
                  placeholder="Hà Nội" 
                  required 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="restaurant-description">Mô tả ngắn gọn về nhà hàng</label>
            <div className="auth-input-wrap">
              <textarea 
                id="restaurant-description" 
                className="auth-input" 
                style={{ height: '80px', resize: 'vertical' }}
                placeholder="Giới thiệu không gian, hương vị nổi bật..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--clr-primary)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '6px', marginTop: '16px', marginBottom: '4px' }}>
            3. Hồ sơ và giấy tờ pháp lý của nhà hàng
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Bằng chứng tiếng Nhật */}
            <div className="auth-field">
              <label className="auth-label">Bằng chứng tiếng Nhật (Menu, hình ảnh) *</label>
              <div className="auth-input-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <label className="btn btn--outline" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                  <span>📁 Chọn tệp...</span>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    required
                    onChange={(e) => handleFileChange(e, setJapaneseProof, setJapaneseProofName)}
                  />
                </label>
                {japaneseProofName && (
                  <span style={{ fontSize: '12px', color: 'var(--clr-primary)', wordBreak: 'break-all' }}>
                    📎 {japaneseProofName}
                  </span>
                )}
              </div>
            </div>

            {/* Giấy phép kinh doanh */}
            <div className="auth-field">
              <label className="auth-label">Giấy phép kinh doanh *</label>
              <div className="auth-input-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <label className="btn btn--outline" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                  <span>📁 Chọn tệp...</span>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    required
                    onChange={(e) => handleFileChange(e, setBusinessLicense, setBusinessLicenseName)}
                  />
                </label>
                {businessLicenseName && (
                  <span style={{ fontSize: '12px', color: 'var(--clr-primary)', wordBreak: 'break-all' }}>
                    📎 {businessLicenseName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Giấy Vệ sinh ATTP */}
            <div className="auth-field">
              <label className="auth-label">Giấy chứng nhận vệ sinh ATTP *</label>
              <div className="auth-input-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <label className="btn btn--outline" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                  <span>📁 Chọn tệp...</span>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    required
                    onChange={(e) => handleFileChange(e, setFoodSafetyCert, setFoodSafetyCertName)}
                  />
                </label>
                {foodSafetyCertName && (
                  <span style={{ fontSize: '12px', color: 'var(--clr-primary)', wordBreak: 'break-all' }}>
                    📎 {foodSafetyCertName}
                  </span>
                )}
              </div>
            </div>

            {/* CMND/CCCD */}
            <div className="auth-field">
              <label className="auth-label">CMND/CCCD của chủ quán *</label>
              <div className="auth-input-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <label className="btn btn--outline" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                  <span>📁 Chọn tệp...</span>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    required
                    onChange={(e) => handleFileChange(e, setIdentityCard, setIdentityCardName)}
                  />
                </label>
                {identityCardName && (
                  <span style={{ fontSize: '12px', color: 'var(--clr-primary)', wordBreak: 'break-all' }}>
                    📎 {identityCardName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="auth-btn" id="btn-register-partner-submit" style={{ marginTop: '20px' }} disabled={isLoading}>
            {isLoading ? 'Đang gửi đăng ký...' : 'Gửi đơn đăng ký đối tác'}
          </button>
        </form>

        <p className="auth-card__footer">
          Đã có tài khoản? <Link href="/login" id="link-to-login">Đăng nhập</Link>
        </p>
      </div>
    </section>
  );
}
