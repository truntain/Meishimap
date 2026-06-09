"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppLanguage, registerRestaurantCopy, ownerCopy } from '@/config/i18n';
import { API_BASE_URL } from '@/config/api';

const HANOI_DISTRICTS = [
  'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Cầu Giấy', 'Đống Đa',
  'Hai Bà Trưng', 'Thanh Xuân', 'Hoàng Mai', 'Hà Đông',
  'Long Biên', 'Nam Từ Liêm', 'Bắc Từ Liêm',
];

const DISTRICT_STREETS: Record<string, string[]> = {
  'Ba Đình': [
    'Hoàng Diệu', 'Phan Đình Phùng', 'Đội Cấn', 'Kim Mã', 'Liễu Giai',
    'Nguyễn Thái Học', 'Sơn Tây', 'Chu Văn An', 'Hùng Vương', 'Thanh Niên',
    'Ngọc Hà', 'Đào Tấn', 'Vạn Phúc', 'La Thành', 'Hoàng Hoa Thám',
    'Bưởi', 'Nguyễn Tri Phương', 'Trần Phú', 'Giang Văn Minh', 'Cống Vị',
  ],
  'Hoàn Kiếm': [
    'Hàng Bài', 'Tràng Tiền', 'Lý Thường Kiệt', 'Hai Bà Trưng', 'Đinh Tiên Hoàng',
    'Hàng Khay', 'Bà Triệu', 'Hàng Đào', 'Hàng Ngang', 'Hàng Bông',
    'Hàng Gai', 'Hàng Trống', 'Cầu Gỗ', 'Lương Văn Can', 'Hàng Bạc',
    'Hàng Buồm', 'Mã Mây', 'Tạ Hiện', 'Lò Sũ', 'Ngô Quyền',
  ],
  'Tây Hồ': [
    'Lạc Long Quân', 'Âu Cơ', 'Xuân Diệu', 'Tô Ngọc Vân', 'Quảng An',
    'Nghi Tàm', 'Đặng Thai Mai', 'Từ Hoa', 'Trích Sài', 'Võng Thị',
    'Thuỵ Khuê', 'Yên Phụ', 'An Dương', 'Phú Thượng', 'Vệ Hồ',
  ],
  'Cầu Giấy': [
    'Xuân Thủy', 'Cầu Giấy', 'Trần Duy Hưng', 'Nguyễn Phong Sắc', 'Trần Thái Tông',
    'Duy Tân', 'Hoàng Quốc Việt', 'Nguyễn Khang', 'Trung Kính', 'Yên Hoà',
    'Quan Hoa', 'Nguyễn Văn Huyên', 'Phạm Văn Đồng', 'Phạm Hùng', 'Tôn Thất Thuyết',
    'Mễ Trì', 'Nguyễn Chánh', 'Lê Văn Lương', 'Khuất Duy Tiến', 'Trung Hoà',
  ],
  'Đống Đa': [
    'Láng', 'Láng Hạ', 'Thái Hà', 'Tây Sơn', 'Chùa Bộc',
    'Xã Đàn', 'Khâm Thiên', 'Tôn Đức Thắng', 'Nguyễn Lương Bằng', 'Đặng Tiến Đông',
    'Hoàng Cầu', 'Nguyễn Chí Thanh', 'Huỳnh Thúc Kháng', 'Giảng Võ', 'Nguyên Hồng',
    'Phạm Ngọc Thạch', 'Đông Các', 'Hào Nam', 'La Thành', 'Ô Chợ Dừa',
  ],
  'Hai Bà Trưng': [
    'Bà Triệu', 'Phố Huế', 'Lò Đúc', 'Trần Khát Chân', 'Bạch Mai',
    'Minh Khai', 'Thanh Nhàn', 'Kim Ngưu', 'Lạc Trung', 'Đại Cồ Việt',
    'Trần Đại Nghĩa', 'Tạ Quang Bửu', 'Lê Thanh Nghị', 'Phạm Đình Hổ', 'Hàng Chuối',
    'Trần Xuân Soạn', 'Nguyễn Công Trứ', 'Lê Đại Hành', 'Mai Hắc Đế', 'Yec Xanh',
  ],
  'Thanh Xuân': [
    'Nguyễn Trãi', 'Nguyễn Xiển', 'Lê Văn Lương', 'Khuất Duy Tiến', 'Nguyễn Tuân',
    'Vũ Trọng Phụng', 'Lương Thế Vinh', 'Hoàng Văn Thái', 'Khương Đình', 'Triều Khúc',
    'Quan Nhân', 'Vũ Hữu', 'Ngụy Như Kon Tum', 'Hoàng Đạo Thành', 'Lê Trọng Tấn',
  ],
  'Hoàng Mai': [
    'Giải Phóng', 'Lĩnh Nam', 'Tam Trinh', 'Nguyễn Hữu Thọ', 'Kim Giang',
    'Nguyễn Xiển', 'Hoàng Mai', 'Tân Mai', 'Trương Định', 'Bùi Huy Bích',
    'Ngọc Hồi', 'Pháo Đài Láng', 'Linh Đường', 'Đền Lừ', 'Yên Sở',
  ],
  'Hà Đông': [
    'Quang Trung', 'Nguyễn Trãi', 'Trần Phú', 'Lê Lợi', 'Tô Hiệu',
    'Ngô Thì Nhậm', 'Lê Trọng Tấn', 'Văn Phú', 'Xa La', 'Phúc La',
    'Vạn Phúc', 'Ba La', 'Mỗ Lao', 'Lê Văn Lương', 'Nguyễn Khuyến',
  ],
  'Long Biên': [
    'Nguyễn Văn Cừ', 'Ngô Gia Tự', 'Long Biên', 'Cổ Linh', 'Ngọc Lâm',
    'Nguyễn Sơn', 'Đức Giang', 'Gia Lâm', 'Việt Hưng', 'Phúc Đồng',
    'Sài Đồng', 'Bồ Đề', 'Vũ Xuân Thiều', 'Thạch Bàn', 'Hội Xá',
  ],
  'Nam Từ Liêm': [
    'Phạm Hùng', 'Lê Đức Thọ', 'Nguyễn Hoàng', 'Trần Văn Lai', 'Mễ Trì',
    'Trung Văn', 'Đại Mỗ', 'Tây Mỗ', 'Châu Văn Liêm', 'Hàm Nghi',
    'Nguyễn Cơ Thạch', 'Lưu Hữu Phước', 'Thiên Hiền', 'Dương Đình Nghệ', 'Mạc Thái Tổ',
  ],
  'Bắc Từ Liêm': [
    'Cổ Nhuế', 'Phạm Văn Đồng', 'Hoàng Quốc Việt', 'Xuân Đỉnh', 'Phú Diễn',
    'Thụy Phương', 'Liên Mạc', 'Tây Tựu', 'Đông Ngạc', 'Minh Khai',
    'Cổ Nhuế 2', 'An Khánh', 'Đức Thắng', 'Văn Tiến Dũng', 'Hoàng Tăng Bí',
  ],
};

const CUISINE_CATEGORIES = [
  'Sushi & Sashimi',
  'Ramen & Udon & Soba',
  'Yakiniku (BBQ)',
  'Izakaya',
  'Omakase & Kaiseki',
  'Tempura (Món chiên)',
  'Tonkatsu (Thịt chiên xù)',
  'Donburi (Cơm tô Nhật)',
  'Curry (Cà ri Nhật)',
  'Bento (Cơm hộp)',
  'Takoyaki & Okonomiyaki (Ăn vặt Nhật)',
  'Hotpot / Shabu Shabu (Lẩu Nhật)',
  'Dessert (Món tráng miệng)',
  'Drinks / Sake (Đồ uống)',
  'Món ăn Việt Nam',
];

const HOUSE_NUMBERS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
  '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
  '55', '60', '65', '70', '75', '80', '85', '90', '95', '100',
  '105', '110', '115', '120', '125', '130', '135', '140', '150',
  '160', '170', '180', '190', '200', '250', '300', '350', '400',
  '1A', '2A', '3A', '5A', '7A', '10A', '12A', '15A', '20A',
  '1B', '2B', '3B', '5B', '7B', '10B',
  '1/1', '1/2', '2/1', '2/2', '3/1', '5/1', '10/1',
];

function buildFullAddress(houseNumber: string, street: string, district: string) {
  const parts: string[] = [];
  if (houseNumber.trim()) parts.push(`Số ${houseNumber.trim()}`);
  if (street.trim()) parts.push(`Đường ${street.trim()}`);
  parts.push(`Quận ${district}`);
  parts.push('Hà Nội');
  return parts.join(', ');
}

const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Ba Đình': { lat: 21.0360, lng: 105.8342 },
  'Hoàn Kiếm': { lat: 21.0287, lng: 105.8525 },
  'Tây Hồ': { lat: 21.0600, lng: 105.8150 },
  'Cầu Giấy': { lat: 21.0357, lng: 105.7958 },
  'Đống Đa': { lat: 21.0125, lng: 105.8250 },
  'Hai Bà Trưng': { lat: 21.0100, lng: 105.8500 },
  'Thanh Xuân': { lat: 20.9944, lng: 105.8167 },
  'Hoàng Mai': { lat: 20.9708, lng: 105.8528 },
  'Hà Đông': { lat: 20.9686, lng: 105.7739 },
  'Long Biên': { lat: 21.0333, lng: 105.8889 },
  'Nam Từ Liêm': { lat: 21.0139, lng: 105.7650 },
  'Bắc Từ Liêm': { lat: 21.0667, lng: 105.7708 },
};

async function geocodeAddress(
  houseNumber: string,
  street: string,
  district: string
): Promise<{ lat: number; lng: number; isFallback: boolean }> {
  const cleanStreet = street.trim();
  const cleanHouseNumber = houseNumber.trim();

  const queryNominatim = async (query: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=vn`,
        { headers: { 'Accept-Language': 'vi' } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  };

  if (cleanHouseNumber && cleanStreet) {
    const query1 = `${cleanHouseNumber} Đường ${cleanStreet}, ${district}, Hà Nội`;
    let coords = await queryNominatim(query1);
    if (coords) return { ...coords, isFallback: false };

    const query2 = `${cleanHouseNumber} ${cleanStreet}, ${district}, Hà Nội`;
    coords = await queryNominatim(query2);
    if (coords) return { ...coords, isFallback: false };

    const query3 = `Số ${cleanHouseNumber} Đường ${cleanStreet}, ${district}, Hà Nội`;
    coords = await queryNominatim(query3);
    if (coords) return { ...coords, isFallback: false };
  }

  if (cleanStreet) {
    const streetQuery1 = `Đường ${cleanStreet}, ${district}, Hà Nội`;
    let coords = await queryNominatim(streetQuery1);
    if (coords) return { ...coords, isFallback: false };

    const streetQuery2 = `${cleanStreet}, ${district}, Hà Nội`;
    coords = await queryNominatim(streetQuery2);
    if (coords) return { ...coords, isFallback: false };
  }

  const districtQuery1 = `Quận ${district}, Hà Nội`;
  let coords = await queryNominatim(districtQuery1);
  if (coords) return { ...coords, isFallback: true };

  const districtQuery2 = `${district}, Hà Nội`;
  coords = await queryNominatim(districtQuery2);
  if (coords) return { ...coords, isFallback: true };

  const fallback = DISTRICT_COORDINATES[district] || { lat: 21.0285, lng: 105.8544 };
  return { ...fallback, isFallback: true };
}

function AddressComboBox({
  label,
  placeholder,
  value,
  onChange,
  options,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleSelect = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-muted)', marginBottom: 4, display: 'block' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="auth-input"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          style={{ width: '100%', paddingRight: 30 }}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            fontSize: 10,
            color: 'var(--clr-muted, #9a8a7a)',
            transition: 'transform 0.2s ease',
            lineHeight: 1,
          }}
          tabIndex={-1}
          aria-label="Toggle dropdown"
        >
          ▼
        </button>
      </div>
      {isOpen && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          maxHeight: 200,
          overflowY: 'auto',
          background: '#fff',
          border: '1px solid var(--clr-border, #e5d5c5)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(60,36,24,0.13)',
          marginTop: 4,
        }}>
          {filtered.map((opt) => {
            const isSelected = opt === value;
            return (
              <div
                key={opt}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: '8px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--clr-cream, #fdf8f3)' : 'transparent',
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? '#6C2F00' : '#333',
                  borderBottom: '1px solid #f5f0eb',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLDivElement).style.background = '#fef3e8';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLDivElement).style.background = isSelected ? 'var(--clr-cream, #fdf8f3)' : 'transparent';
                }}
              >
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RegisterRestaurantPage() {
  const { language } = useAppLanguage();
  const copy = registerRestaurantCopy[language];
  const ownerTranslations = ownerCopy[language];
  const router = useRouter();

  // Owner state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Restaurant state
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantNameJp, setRestaurantNameJp] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [phone, setPhone] = useState('');
  const [addrDistrict, setAddrDistrict] = useState(HANOI_DISTRICTS[0]);
  const [addrStreet, setAddrStreet] = useState('');
  const [addrHouseNumber, setAddrHouseNumber] = useState('');
  const [description, setDescription] = useState('');

  const handleAddCustomCategory = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
    }
    setCustomCategory('');
    setShowCustomInput(false);
  };

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

    let finalCategories = [...categories];
    if (showCustomInput && customCategory.trim()) {
      const trimmedCustom = customCategory.trim();
      if (!finalCategories.includes(trimmedCustom)) {
        finalCategories.push(trimmedCustom);
      }
    }

    // Validations
    if (!name || !email || !password || !confirmPassword || !restaurantName || finalCategories.length === 0 || !addrStreet || !addrDistrict) {
      setErrorMsg(copy.validationFieldsError);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(copy.validationPasswordLength);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(copy.validationPasswordMismatch);
      return;
    }

    if (!japaneseProof || !businessLicense || !foodSafetyCert || !identityCard) {
      setErrorMsg(copy.validationDocsError);
      return;
    }

    setIsLoading(true);

    try {
      // Geocode address and compile full address
      const coords = await geocodeAddress(addrHouseNumber, addrStreet, addrDistrict);
      const fullAddress = buildFullAddress(addrHouseNumber, addrStreet, addrDistrict);

      const res = await fetch(`${API_BASE_URL}/auth/register-owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          restaurantName,
          restaurantNameJp: restaurantNameJp || undefined,
          category: finalCategories.join(', '),
          address: fullAddress,
          district: addrDistrict,
          city: 'Hà Nội',
          phone: phone || undefined,
          description: description || undefined,
          japaneseProof,
          businessLicense,
          foodSafetyCert,
          identityCard,
          latitude: coords.lat,
          longitude: coords.lng,
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
          <p className="auth-hero__title-jp">{language === 'vi' ? 'Meshimap Partner Registration' : 'Meshimap パートナー登録'}</p>
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

            {/* Mật khẩu */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="partner-password">{copy.ownerPassword}</label>
              <div className="auth-input-wrap">
                <input
                  type="password"
                  id="partner-password"
                  className="auth-input"
                  placeholder={copy.ownerPasswordPlaceholder}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="partner-confirm-password">{copy.ownerConfirmPassword}</label>
              <div className="auth-input-wrap">
                <input
                  type="password"
                  id="partner-confirm-password"
                  className="auth-input"
                  placeholder={copy.ownerConfirmPasswordPlaceholder}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    if (val === 'Khác') {
                      setShowCustomInput(true);
                    } else {
                      if (!categories.includes(val)) {
                        setCategories([...categories, val]);
                      }
                      setShowCustomInput(false);
                    }
                  }}
                >
                  <option value="" disabled>{language === 'vi' ? '-- Chọn loại hình ẩm thực --' : '-- 料理ジャンルを選択 --'}</option>
                  {CUISINE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Khác">{language === 'vi' ? 'Khác (Tự điền)...' : 'その他 (自由入力)...'}</option>
                </select>
              </div>

              {showCustomInput && (
                <div className="auth-input-wrap" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder={language === 'vi' ? 'Nhập loại hình ẩm thực khác...' : 'その他の料理ジャンルを入力...'}
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomCategory(e);
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleAddCustomCategory}
                    style={{ padding: '0 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  >
                    {language === 'vi' ? 'Thêm' : '追加'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomCategory('');
                    }}
                    style={{ padding: '0 12px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  >
                    {language === 'vi' ? 'Hủy' : 'キャンセル'}
                  </button>
                </div>
              )}

              {categories.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '10px',
                  padding: '8px 12px',
                  background: 'var(--clr-cream, #fdf8f3)',
                  border: '1px solid var(--clr-border, #e5d5c5)',
                  borderRadius: '8px',
                }}>
                  {categories.map((cat, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#e5d5c5',
                        color: '#6C2F00',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => setCategories(categories.filter(c => c !== cat))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#b91c1c',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '14px',
                          lineHeight: '1',
                          padding: '0 2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.2s',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
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

          {/* Địa chỉ phân rã */}
          <div className="auth-field" style={{ gridColumn: 'span 2' }}>
            <label className="auth-label">{copy.address}</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px 16px',
              background: 'var(--clr-cream, #fdf8f3)',
              borderRadius: 12,
              padding: '16px',
              border: '1px solid var(--clr-border, #e5d5c5)',
              marginTop: '4px'
            }}>
              {/* Thành phố - Cố định */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-muted)', marginBottom: 4, display: 'block' }}>
                  🏙️ {ownerTranslations.city}
                </label>
                <div style={{
                  padding: '9px 12px',
                  background: '#f0ebe5',
                  borderRadius: 8,
                  border: '1px solid var(--clr-border, #e5d5c5)',
                  fontWeight: 700,
                  color: '#6C2F00',
                  fontSize: 14,
                  cursor: 'not-allowed',
                  opacity: 0.85,
                }}>
                  Hà Nội
                </div>
              </div>

              {/* Quận */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-muted)', marginBottom: 4, display: 'block' }}>
                  📍 {ownerTranslations.district}
                </label>
                <select
                  className="auth-input"
                  value={addrDistrict}
                  onChange={(e) => setAddrDistrict(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer', appearance: 'auto', paddingRight: '16px' }}
                >
                  {HANOI_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{language === 'vi' ? `Quận ${d}` : `${d}区`}</option>
                  ))}
                </select>
              </div>

              {/* Đường */}
              <AddressComboBox
                label={` Streets/Đường Phố: 🛣️ ${ownerTranslations.street}`}
                placeholder={ownerTranslations.streetPlaceholder}
                value={addrStreet}
                onChange={val => setAddrStreet(val)}
                options={DISTRICT_STREETS[addrDistrict] || []}
              />

              {/* Số nhà */}
              <AddressComboBox
                label={` House Number/Số nhà: 🏠 ${ownerTranslations.houseNumber}`}
                placeholder={ownerTranslations.houseNumberPlaceholder}
                value={addrHouseNumber}
                onChange={val => setAddrHouseNumber(val)}
                options={HOUSE_NUMBERS}
              />
            </div>

            {/* Xem trước địa chỉ đầy đủ */}
            {(addrStreet || addrHouseNumber) && (
              <div style={{
                marginTop: 8,
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #fdf8f3 0%, #FAF6F0 100%)',
                borderRadius: 8,
                border: '1px solid var(--clr-border, #e5d5c5)',
                fontSize: 13,
                color: '#6C2F00',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span>📌</span>
                <span><strong>{ownerTranslations.addressLabel}</strong> {buildFullAddress(addrHouseNumber, addrStreet, addrDistrict)}</span>
              </div>
            )}
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
