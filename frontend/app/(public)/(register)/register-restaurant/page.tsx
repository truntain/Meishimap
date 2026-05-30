"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppLanguage, registerRestaurantCopy } from '@/config/i18n';

export default function RegisterRestaurantPage() {
  const { language } = useAppLanguage();
  const copy = registerRestaurantCopy[language];
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
      alert(copy.fileSizeError);
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
      setErrorMsg(copy.validationFieldsError);
      return;
    }

    if (!japaneseProof || !businessLicense || !foodSafetyCert || !identityCard) {
      setErrorMsg(copy.validationDocsError);
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
        throw new Error(data.message || (language === 'vi' ? 'Đăng ký đối tác thất bại. Vui lòng thử lại.' : 'パートナー加盟店登録に失敗しました。もう一度お試しください。'));
      }

      alert(copy.successAlert);
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
          <h1 className="auth-hero__title">{copy.heroTitle}</h1>
          <p className="auth-hero__title-jp">{language === 'vi' ? 'Meshimap パートナー登録' : 'Meshimap Partner Registration'}</p>
        </div>
        <p className="auth-hero__subtitle">
          {copy.heroSubtitle}
        </p>
      </div>

      <div className="auth-card" role="main" style={{ width: '100%', maxWidth: '680px' }}>
        <div className="auth-card__header">
          <h2 className="auth-card__title">{copy.cardTitle}</h2>
          <p className="auth-card__subtitle">{copy.cardSubtitle}</p>
        </div>

        {errorMsg && (
          <div className="auth-alert is-visible" role="alert" style={{ marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form id="register-partner-form" className="auth-form" onSubmit={handleSubmit} noValidate>
          
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--clr-primary)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '6px', marginBottom: '4px' }}>
            {copy.sectionAccount}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Tên chủ nhà hàng */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="partner-name">{copy.ownerName}</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="partner-name" 
                  className="auth-input" 
                  placeholder={copy.ownerNamePlaceholder} 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="partner-email">{copy.ownerEmail}</label>
              <div className="auth-input-wrap">
                <input 
                  type="email" 
                  id="partner-email" 
                  className="auth-input" 
                  placeholder={copy.ownerEmailPlaceholder} 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--clr-primary)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '6px', marginTop: '12px', marginBottom: '4px' }}>
            {copy.sectionRestaurant}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Tên nhà hàng */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-name">{copy.restaurantName}</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="restaurant-name" 
                  className="auth-input" 
                  placeholder={copy.restaurantNamePlaceholder} 
                  required 
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />
              </div>
            </div>

            {/* Tên tiếng Nhật */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-name-jp">{copy.restaurantNameJp}</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="restaurant-name-jp" 
                  className="auth-input" 
                  placeholder={copy.restaurantNameJpPlaceholder} 
                  value={restaurantNameJp}
                  onChange={(e) => setRestaurantNameJp(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Loại hình ẩm thực */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-category">{copy.cuisineType}</label>
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
                  <option value="Nướng">{language === 'vi' ? 'Yakiniku (Món nướng)' : '焼肉 (Yakiniku)'}</option>
                  <option value="Izakaya">{language === 'vi' ? 'Izakaya (Quán nhậu kiểu Nhật)' : '居酒屋 (Izakaya)'}</option>
                  <option value="Phở">{language === 'vi' ? 'Phở' : 'フォー (Phở)'}</option>
                  <option value="Bún chả">{language === 'vi' ? 'Bún chả' : 'ブンチャー (Bún chả)'}</option>
                  <option value="Bánh mì">{language === 'vi' ? 'Bánh mì' : 'バインミー (Bánh mì)'}</option>
                  <option value="Món Việt">{language === 'vi' ? 'Món ăn Việt Nam' : 'ベトナム料理'}</option>
                  <option value="Khác">{language === 'vi' ? 'Khác' : 'その他'}</option>
                </select>
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-phone">{copy.phone}</label>
              <div className="auth-input-wrap">
                <input 
                  type="tel" 
                  id="restaurant-phone" 
                  className="auth-input" 
                  placeholder={copy.phonePlaceholder} 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="restaurant-address">{copy.address}</label>
            <div className="auth-input-wrap">
              <input 
                type="text" 
                id="restaurant-address" 
                className="auth-input" 
                placeholder={copy.addressPlaceholder} 
                required 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Quận/Huyện */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-district">{copy.district}</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="restaurant-district" 
                  className="auth-input" 
                  placeholder={copy.districtPlaceholder} 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
            </div>

            {/* Tỉnh/Thành phố */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="restaurant-city">{copy.city}</label>
              <div className="auth-input-wrap">
                <input 
                  type="text" 
                  id="restaurant-city" 
                  className="auth-input" 
                  placeholder={copy.cityPlaceholder} 
                  required 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="restaurant-description">{copy.description}</label>
            <div className="auth-input-wrap">
              <textarea 
                id="restaurant-description" 
                className="auth-input" 
                style={{ height: '80px', resize: 'vertical' }}
                placeholder={copy.descriptionPlaceholder} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--clr-primary)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '6px', marginTop: '16px', marginBottom: '4px' }}>
            {copy.sectionDocuments}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Bằng chứng tiếng Nhật */}
            <div className="auth-field">
              <label className="auth-label">{copy.jpProof}</label>
              <div className="auth-input-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <label className="btn btn--outline" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                  <span>{copy.chooseFile}</span>
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
              <label className="auth-label">{copy.businessLicense}</label>
              <div className="auth-input-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <label className="btn btn--outline" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                  <span>{copy.chooseFile}</span>
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
              <label className="auth-label">{copy.foodSafetyCert}</label>
              <div className="auth-input-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <label className="btn btn--outline" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                  <span>{copy.chooseFile}</span>
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
              <label className="auth-label">{copy.identityCard}</label>
              <div className="auth-input-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <label className="btn btn--outline" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                  <span>{copy.chooseFile}</span>
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
            {isLoading ? copy.submittingBtn : copy.submitBtn}
          </button>
        </form>

        <p className="auth-card__footer">
          {copy.hasAccount} <Link href="/login" id="link-to-login">{copy.loginLink}</Link>
        </p>
      </div>
    </section>
  );
}
