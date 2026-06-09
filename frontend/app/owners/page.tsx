'use client';

import { useEffect, useRef, useState } from 'react';
import OwnerHeader from './components/OwnerHeader';
import Cookies from 'js-cookie';
import { getBeautifulImage } from '@/utils/image';
import { useAppLanguage, ownerCopy } from '@/config/i18n';
import { notFound } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';


const defaultRestaurant = {
  name: 'Sakura Garden',
  address: '123 Le Loi Street, District 1, Ho Chi Minh City',
  openTime: '10:00',
  closeTime: '22:00',
  jpSupport: true,
  jpSupportText: 'Tiếng Việt, Tiếng Nhật, English',
  phone: '+84 28 3823 4567',
  banner: '',
  menu: [
    { name: 'Premium Sashimi Set', price: '450.000đ', cat: 'sashimi', icon: '🐟', imageUrl: '', desc: 'A curated selection of seasonal fish including Otoro, Sake, and Hamachi.' },
    { name: 'Sashimi Deluxe', price: '380.000đ', cat: 'sashimi', icon: '🍱', imageUrl: '', desc: 'Premium cut fish with authentic wasabi and soy sauce.' },
    { name: 'Tempura Set', price: '280.000đ', cat: 'tempura', icon: '🍤', imageUrl: '', desc: 'Crispy light-battered shrimp and vegetables with dipping sauce.' },
    { name: 'Tonkotsu Ramen', price: '195.000đ', cat: 'ramen', icon: '🍜', imageUrl: '', desc: 'Rich pork bone broth simmered 18 hours, chashu pork, soft egg.' }
  ],
  reviews: [
    { author: 'Anh Nguyen', rating: 5, date: 'Tháng 5, 2024', content: 'Nhà hàng tuyệt vời! Sashimi tươi ngon, nhân viên thân thiện và hỗ trợ tiếng Nhật rất tốt. Sẽ quay lại lần sau.', replies: [], reported: false },
    { author: 'Minh Tran', rating: 4, date: 'Tháng 4, 2024', content: 'Không gian đẹp, món ăn chất lượng cao. Giá hơi cao nhưng xứng đáng với trải nghiệm đem lại.', replies: [], reported: false }
  ]
};

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

function parseAddressParts(address: string) {
  const parts = { houseNumber: '', street: '', district: HANOI_DISTRICTS[0] };
  if (!address) return parts;

  // Try to detect district from address
  for (const d of HANOI_DISTRICTS) {
    if (address.toLowerCase().includes(d.toLowerCase())) {
      parts.district = d;
      break;
    }
  }

  // Remove city and district from address to extract street + house number
  let remaining = address
    .replace(/,?\s*Hà Nội\s*$/i, '')
    .replace(/,?\s*Quận\s*/i, ',')
    .replace(new RegExp(`,?\\s*${parts.district}\\s*$`, 'i'), '')
    .trim()
    .replace(/,\s*$/, '')
    .trim();

  // Try pattern: "Số 123, Đường Abc" or "123 Đường Abc" or "123, Abc"
  const match = remaining.match(/^(?:Số\s*)?([\d\/A-Za-z]+)[,\s]+(.+)$/i);
  if (match) {
    parts.houseNumber = match[1].trim();
    parts.street = match[2].replace(/^(?:Đường|Phố)\s+/i, '').trim();
  } else {
    parts.street = remaining.replace(/^(?:Đường|Phố)\s+/i, '').trim();
  }

  return parts;
}

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

  // Stage 1: Exact address query using clean OSM formats
  if (cleanHouseNumber && cleanStreet) {
    // Format 1: "12A Đường Láng, Đống Đa, Hà Nội"
    const query1 = `${cleanHouseNumber} Đường ${cleanStreet}, ${district}, Hà Nội`;
    let coords = await queryNominatim(query1);
    if (coords) return { ...coords, isFallback: false };

    // Format 2: "12A Láng, Đống Đa, Hà Nội"
    const query2 = `${cleanHouseNumber} ${cleanStreet}, ${district}, Hà Nội`;
    coords = await queryNominatim(query2);
    if (coords) return { ...coords, isFallback: false };

    // Format 3: "Số 12A Đường Láng, Đống Đa, Hà Nội"
    const query3 = `Số ${cleanHouseNumber} Đường ${cleanStreet}, ${district}, Hà Nội`;
    coords = await queryNominatim(query3);
    if (coords) return { ...coords, isFallback: false };
  }

  // Stage 2: Street + District + Hanoi query (cleaning standard prefixes to increase match rates)
  if (cleanStreet) {
    const streetQuery1 = `Đường ${cleanStreet}, ${district}, Hà Nội`;
    let coords = await queryNominatim(streetQuery1);
    if (coords) return { ...coords, isFallback: false };

    const streetQuery2 = `${cleanStreet}, ${district}, Hà Nội`;
    coords = await queryNominatim(streetQuery2);
    if (coords) return { ...coords, isFallback: false };
  }

  // Stage 3: District + Hanoi query
  const districtQuery1 = `Quận ${district}, Hà Nội`;
  let coords = await queryNominatim(districtQuery1);
  if (coords) return { ...coords, isFallback: true };

  const districtQuery2 = `${district}, Hà Nội`;
  coords = await queryNominatim(districtQuery2);
  if (coords) return { ...coords, isFallback: true };

  // Stage 4: Local coordinates fallback
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

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
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
          className="db-input"
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

export default function OwnerRestaurantPage() {
  const { language } = useAppLanguage();
  const copy = ownerCopy[language];
  const [restaurant, setRestaurant] = useState<any>(null);
  const [alertMsg, setAlertMsg] = useState<{msg: string, type: string} | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  if (isNotFound) {
    notFound();
  }

  // Address parts state
  const [addrDistrict, setAddrDistrict] = useState(HANOI_DISTRICTS[0]);
  const [addrStreet, setAddrStreet] = useState('');
  const [addrHouseNumber, setAddrHouseNumber] = useState('');
  const [addrInitialized, setAddrInitialized] = useState(false);
  
  // Menu Modal State
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', cat: 'Sushi & Sashimi', customCat: '', icon: '🍣', imageUrl: '', desc: '' });

  useEffect(() => {
    const fetchRestaurant = async () => {
      const token = Cookies.get('access_token');
      if (!token) {
        const stored = localStorage.getItem('meshimap_restaurant');
        if (stored) {
          setRestaurant(JSON.parse(stored));
        } else {
          setRestaurant(defaultRestaurant);
        }
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/restaurants/my-restaurant`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.status === 404) {
          setIsNotFound(true);
          return;
        }
        if (res.status === 401) {
          Cookies.remove('access_token');
          Cookies.remove('user');
          showAlert(copy.alertSessionExpired, 'warning');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Không thể lấy thông tin nhà hàng từ backend. Status: ${res.status}. Msg: ${errText}`);
        }
        const data = await res.json();
        const mappedRes = {
          ...data,
          name: data.name,
          address: data.address,
          phone: data.phone || '',
          banner: data.imageUrl || '',
          jpSupport: data.hasJapaneseSupport,
          jpSupportText: data.languages || 'Tiếng Việt, English',
          openTime: data.openingTime || data.hours?.monday?.split(' - ')[0] || '10:00',
          closeTime: data.closingTime || data.hours?.monday?.split(' - ')[1] || '22:00',
          menu: data.menuItems || [],
          reviews: data.reviews || [],
        };
        setRestaurant(mappedRes);
        localStorage.setItem('meshimap_restaurant', JSON.stringify(mappedRes));
      } catch (err) {
        console.error(err);
        const stored = localStorage.getItem('meshimap_restaurant');
        if (stored) {
          setRestaurant(JSON.parse(stored));
        } else {
          setRestaurant(defaultRestaurant);
        }
      }
    };

    fetchRestaurant();
  }, [copy.alertSessionExpired]);

  // Parse address into parts when restaurant loads
  useEffect(() => {
    if (restaurant && !addrInitialized) {
      const parts = parseAddressParts(restaurant.address || '');
      // If restaurant has a district field from backend, prefer that
      if (restaurant.district) {
        const found = HANOI_DISTRICTS.find(d => d.toLowerCase() === restaurant.district.toLowerCase());
        if (found) parts.district = found;
      }
      setAddrDistrict(parts.district);
      setAddrStreet(parts.street);
      setAddrHouseNumber(parts.houseNumber);
      setAddrInitialized(true);
    }
  }, [restaurant, addrInitialized]);

  // Update restaurant.address whenever address parts change
  useEffect(() => {
    if (!addrInitialized || !restaurant) return;
    const fullAddress = buildFullAddress(addrHouseNumber, addrStreet, addrDistrict);
    setRestaurant((prev: any) => (prev ? { ...prev, address: fullAddress } : prev));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addrDistrict, addrStreet, addrHouseNumber, addrInitialized]);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Geocode the full address
    const fullAddress = buildFullAddress(addrHouseNumber, addrStreet, addrDistrict);
    const coords = await geocodeAddress(addrHouseNumber, addrStreet, addrDistrict);

    const updatedRestaurantLocal = { 
      ...restaurant, 
      address: fullAddress,
      latitude: coords.lat,
      longitude: coords.lng
    };
    setRestaurant(updatedRestaurantLocal);
    localStorage.setItem('meshimap_restaurant', JSON.stringify(updatedRestaurantLocal));

    const token = Cookies.get('access_token');
    if (!token) {
      setIsSaving(false);
      showAlert(
        coords.isFallback
          ? copy.alertOfflineCenter
          : copy.alertOfflineSuccess
      );
      return;
    }

    try {
      const body: any = {
        name: restaurant.name,
        phone: restaurant.phone,
        address: fullAddress,
        district: addrDistrict,
        city: 'Hà Nội',
        imageUrl: restaurant.banner,
        hasJapaneseSupport: restaurant.jpSupport,
        description: restaurant.description || '',
        latitude: coords.lat,
        longitude: coords.lng,
        openingTime: restaurant.openTime,
        closingTime: restaurant.closeTime,
      };

      const res = await fetch(`${API_BASE_URL}/restaurants/my-restaurant`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        showAlert(copy.alertSessionExpired, 'warning');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        setIsSaving(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi cập nhật nhà hàng');
      }

      const updatedData = await res.json();
      const mappedRes = {
        ...updatedData,
        name: updatedData.name,
        address: updatedData.address,
        phone: updatedData.phone || '',
        banner: updatedData.imageUrl || '',
        jpSupport: updatedData.hasJapaneseSupport,
        jpSupportText: updatedData.languages || 'Tiếng Việt, English',
        openTime: updatedData.openingTime || updatedData.hours?.monday?.split(' - ')[0] || '10:00',
        closeTime: updatedData.closingTime || updatedData.hours?.monday?.split(' - ')[1] || '22:00',
        menu: updatedData.menuItems || [],
        reviews: updatedData.reviews || [],
      };
      
      setRestaurant(mappedRes);
      setAddrInitialized(false); // re-parse from fresh data
      localStorage.setItem('meshimap_restaurant', JSON.stringify(mappedRes));
      showAlert(
        coords.isFallback
          ? copy.alertOnlineCenter
          : copy.alertOnlineSuccess
      );
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi kết nối: ${err.message || 'Không thể lưu lên hệ thống'}`, 'warning');
    } finally {
      setIsSaving(false);
    }
  };


  const handleInfoChange = (field: string, value: any) => {
    setRestaurant((prev: any) => ({ ...prev, [field]: value }));
  };

  const isRealImage = (url: string | null) => {
    if (!url) return false;
    const clean = url.toLowerCase();
    return (
      clean.startsWith('http://') ||
      clean.startsWith('https://') ||
      clean.startsWith('/uploads/') ||
      clean.startsWith('uploads/') ||
      clean.startsWith('data:image/')
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert(copy.alertImageSize, 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert(copy.alertImageSize, 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleInfoChange('banner', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

const MENU_CATEGORIES = [
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

  const openMenuModal = (index: number | null = null) => {
    setEditingIndex(index);
    if (index !== null) {
      const item = restaurant.menu[index];
      const itemCat = item.cat || item.category || 'Sushi & Sashimi';
      const isStandardCat = MENU_CATEGORIES.includes(itemCat);
      setMenuForm({
        name: item.name || '',
        price: typeof item.price === 'number' ? `${item.price}` : (item.price || ''),
        cat: isStandardCat ? itemCat : 'Khác',
        customCat: isStandardCat ? '' : itemCat,
        icon: item.icon || item.emoji || '🍣',
        imageUrl: item.imageUrl || item.image_url || '',
        desc: item.desc || item.description || '',
      });
    } else {
      setMenuForm({ name: '', price: '', cat: 'Sushi & Sashimi', customCat: '', icon: '🍣', imageUrl: '', desc: '' });
    }
    setShowMenuModal(true);
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('access_token');
    if (!token) {
      showAlert(copy.alertNoToken, 'warning');
      return;
    }

    const cleanPrice = typeof menuForm.price === 'number' ? menuForm.price : (parseInt(String(menuForm.price).replace(/[^\d]/g, '')) || 0);
    const body = {
      name: menuForm.name,
      price: cleanPrice,
      category: menuForm.cat === 'Khác' ? menuForm.customCat : menuForm.cat,
      icon: menuForm.icon,
      imageUrl: menuForm.imageUrl || '',
      description: menuForm.desc,
    };

    try {
      let res;
      if (editingIndex !== null) {
        const itemId = restaurant.menu[editingIndex].id;
        res = await fetch(`${API_BASE_URL}/restaurants/my-restaurant/menu-items/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch(`${API_BASE_URL}/restaurants/my-restaurant/menu-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
      }

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        showAlert(copy.alertSessionExpired, 'warning');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi lưu món ăn');
      }

      const updatedRestaurant = await res.json();
      const mappedRes = {
        ...updatedRestaurant,
        name: updatedRestaurant.name,
        address: updatedRestaurant.address,
        phone: updatedRestaurant.phone || '',
        banner: updatedRestaurant.imageUrl || '',
        jpSupport: updatedRestaurant.hasJapaneseSupport,
        jpSupportText: updatedRestaurant.languages || 'Tiếng Việt, English',
        openTime: updatedRestaurant.openingTime || updatedRestaurant.hours?.monday?.split(' - ')[0] || '10:00',
        closeTime: updatedRestaurant.closingTime || updatedRestaurant.hours?.monday?.split(' - ')[1] || '22:00',
        menu: updatedRestaurant.menuItems || [],
        reviews: updatedRestaurant.reviews || [],
      };

      setRestaurant(mappedRes);
      localStorage.setItem('meshimap_restaurant', JSON.stringify(mappedRes));
      showAlert(editingIndex !== null ? copy.alertUpdateSuccess : copy.alertAddSuccess);
      setShowMenuModal(false);
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi: ${err.message || 'Không thể cập nhật món ăn'}`, 'warning');
    }
  };

  const deleteMenuItem = async (index: number) => {
    if (!window.confirm(copy.confirmDelete)) {
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) {
      showAlert(copy.alertNoToken, 'warning');
      return;
    }

    const itemId = restaurant.menu[index].id;
    if (!itemId) {
      const updated = { ...restaurant };
      updated.menu.splice(index, 1);
      setRestaurant(updated);
      localStorage.setItem('meshimap_restaurant', JSON.stringify(updated));
      showAlert(copy.alertDeleteSuccess, 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/restaurants/my-restaurant/menu-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        showAlert(copy.alertSessionExpired, 'warning');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi xóa món ăn');
      }

      const updatedRestaurant = await res.json();
      const mappedRes = {
        ...updatedRestaurant,
        name: updatedRestaurant.name,
        address: updatedRestaurant.address,
        phone: updatedRestaurant.phone || '',
        banner: updatedRestaurant.imageUrl || '',
        jpSupport: updatedRestaurant.hasJapaneseSupport,
        jpSupportText: updatedRestaurant.languages || 'Tiếng Việt, English',
        openTime: updatedRestaurant.openingTime || updatedRestaurant.hours?.monday?.split(' - ')[0] || '10:00',
        closeTime: updatedRestaurant.closingTime || updatedRestaurant.hours?.monday?.split(' - ')[1] || '22:00',
        menu: updatedRestaurant.menuItems || [],
        reviews: updatedRestaurant.reviews || [],
      };

      setRestaurant(mappedRes);
      localStorage.setItem('meshimap_restaurant', JSON.stringify(mappedRes));
      showAlert(copy.alertDeleteSuccess, 'warning');
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi: ${err.message || 'Không thể xóa món ăn'}`, 'warning');
    }
  };

  if (!restaurant) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--clr-cream, #fdf8f3)' }}>
        <div style={{ fontSize: 18, color: '#6C2F00', fontWeight: 'bold' }}>{copy.loading || 'Đang tải...'}</div>
      </div>
    );
  }

  return (
    <>
      <OwnerHeader title={copy.title} />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        {/* General Info Card */}
        <div className="db-card">
          <h2 className="db-card__title">{copy.cardTitle}</h2>
          <form onSubmit={handleInfoSubmit}>
            <div className="db-form-row">
              <div className="db-form-field">
                <label>{copy.restaurantName}</label>
                <input type="text" className="db-input" required 
                  value={restaurant.name || ''} 
                  onChange={(e) => handleInfoChange('name', e.target.value)} 
                />
              </div>
              <div className="db-form-field">
                <label>{copy.phone}</label>
                <input type="text" className="db-input" required 
                  value={restaurant.phone || ''} 
                  onChange={(e) => handleInfoChange('phone', e.target.value)} 
                />
              </div>
            </div>

            <div className="db-form-row">
              <div className="db-form-field" style={{ gridColumn: 'span 2' }}>
                <label style={{ marginBottom: 8 }}>{copy.address}</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px 16px',
                  background: 'var(--clr-cream, #fdf8f3)',
                  borderRadius: 12,
                  padding: '16px',
                  border: '1px solid var(--clr-border, #e5d5c5)',
                }}>
                  {/* Thành phố - Fixed */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-muted)', marginBottom: 4, display: 'block' }}>
                      🏙️ {copy.city}
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
                      📍 {copy.district}
                    </label>
                    <select
                      className="db-input"
                      value={addrDistrict}
                      onChange={(e) => setAddrDistrict(e.target.value)}
                      style={{ width: '100%', cursor: 'pointer' }}
                    >
                      {HANOI_DISTRICTS.map((d) => (
                        <option key={d} value={d}>Quận {d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Đường */}
                  <AddressComboBox
                    label={`🛣️ ${copy.street}`}
                    placeholder={copy.streetPlaceholder}
                    value={addrStreet}
                    onChange={setAddrStreet}
                    options={DISTRICT_STREETS[addrDistrict] || []}
                  />

                  {/* Số nhà */}
                  <AddressComboBox
                    label={`🏠 ${copy.houseNumber}`}
                    placeholder={copy.houseNumberPlaceholder}
                    value={addrHouseNumber}
                    onChange={setAddrHouseNumber}
                    options={HOUSE_NUMBERS}
                  />
                </div>

                {/* Preview of full address */}
                {(addrStreet || addrHouseNumber) && (
                  <div style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderRadius: 8,
                    border: '1px solid #bae6fd',
                    fontSize: 13,
                    color: '#0c4a6e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span>📌</span>
                    <span><strong>{copy.addressLabel}</strong> {buildFullAddress(addrHouseNumber, addrStreet, addrDistrict)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="db-form-row">
              <div className="db-form-field">
                <label>{copy.openTime}</label>
                <input type="time" className="db-input" required 
                  value={restaurant.openTime || ''} 
                  onChange={(e) => handleInfoChange('openTime', e.target.value)} 
                />
              </div>
              <div className="db-form-field">
                <label>{copy.closeTime}</label>
                <input type="time" className="db-input" required 
                  value={restaurant.closeTime || ''} 
                  onChange={(e) => handleInfoChange('closeTime', e.target.value)} 
                />
              </div>
            </div>

            <div className="db-form-row">
              <div className="db-form-field" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10 }}>
                <input type="checkbox" style={{ width: 18, height: 18, cursor: 'pointer' }} id="jp-support"
                  checked={restaurant.jpSupport || false}
                  onChange={(e) => handleInfoChange('jpSupport', e.target.checked)} 
                />
                <label htmlFor="jp-support" style={{ cursor: 'pointer', fontWeight: 700 }}>{copy.jpSupport}</label>
              </div>
              <div className="db-form-field">
                <label>{copy.jpSupportText}</label>
                <input type="text" className="db-input" placeholder="Ví dụ: Tiếng Việt, Tiếng Nhật, English" 
                  value={restaurant.jpSupportText || ''} 
                  onChange={(e) => handleInfoChange('jpSupportText', e.target.value)} 
                />
              </div>
            </div>

            <div className="db-form-row" style={{ marginTop: 12 }}>
              <div className="db-form-field" style={{ gridColumn: 'span 2' }}>
                <label>{copy.banner}</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="db-input" 
                  onChange={handleBannerFileChange} 
                />
                {isRealImage(restaurant.banner) && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--clr-muted)' }}>{copy.currentImage}</span>
                    <img 
                      src={restaurant.banner.startsWith('data:') ? restaurant.banner : getBeautifulImage(restaurant.banner, restaurant.name)} 
                      alt="Banner preview" 
                      style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--clr-border)' }} 
                    />
                    <button 
                      type="button" 
                      style={{
                        padding: '4px 10px',
                        fontSize: 12,
                        background: '#fee2e2',
                        border: '1px solid #fcd34d',
                        borderRadius: 4,
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      onClick={() => handleInfoChange('banner', '')}
                    >
                      {copy.deleteImage}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="submit" className="btn btn--primary" disabled={isSaving} style={{ opacity: isSaving ? 0.7 : 1 }}>
                {isSaving ? copy.savingButton : copy.saveButton}
              </button>
            </div>
          </form>
        </div>

        {/* Menu Management Card */}
        <div className="db-card">
          <div className="db-card__title">
            <span>{copy.menuTitle}</span>
            <button className="btn btn--primary" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => openMenuModal()}>
              {copy.addMenuBtn}
            </button>
          </div>
          
          <div className="db-menu-list">
            {restaurant.menu?.map((item: any, index: number) => (
              <div className="db-menu-card" key={index}>
                <div className="db-menu-card__icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isRealImage(item.imageUrl || item.image_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getBeautifulImage(item.imageUrl || item.image_url, item.name)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    item.icon || '🍣'
                  )}
                </div>
                <div className="db-menu-card__info">
                  <h4 className="db-menu-card__name">{item.name}</h4>
                  <div className="db-menu-card__price">{item.price}</div>
                  <p className="db-menu-card__desc">{item.desc || item.description || ''}</p>
                </div>
                <div className="db-menu-card__actions">
                  <button className="db-icon-btn" title={copy.editMenuModalTitle} onClick={() => openMenuModal(index)}>✏️</button>
                  <button className="db-icon-btn db-icon-btn--danger" title={copy.alertDeleteSuccess} onClick={() => deleteMenuItem(index)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MENU MODAL */}
      {showMenuModal && (
        <div className="db-modal" style={{ display: 'flex' }}>
          <div className="db-modal__box">
            <h3 className="db-modal__title">{editingIndex !== null ? copy.editMenuModalTitle : copy.addMenuModalTitle}</h3>
            <form onSubmit={handleMenuSubmit}>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{copy.menuName}</label>
                <input type="text" className="db-input" required 
                  value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{copy.menuPrice}</label>
                <input type="text" className="db-input" placeholder="Ví dụ: 150.000đ" required 
                  value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{copy.menuCat}</label>
                <select className="db-select" value={menuForm.cat} onChange={e => setMenuForm({...menuForm, cat: e.target.value})}>
                  {MENU_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="Khác">{language === 'vi' ? 'Khác' : 'その他'}</option>
                </select>
                {menuForm.cat === 'Khác' && (
                  <input 
                    type="text" 
                    className="db-input" 
                    placeholder={language === 'vi' ? 'Nhập phân loại khác...' : 'その他のカテゴリを入力...'} 
                    required 
                    value={menuForm.customCat} 
                    onChange={e => setMenuForm({...menuForm, customCat: e.target.value})} 
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{copy.menuIcon}</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="text" className="db-input" placeholder="Ví dụ: 🍣, 🍥, 🍜" required 
                    value={menuForm.icon} onChange={e => setMenuForm({...menuForm, icon: e.target.value})} style={{ flex: 1 }} />
                  <div style={{ fontSize: 24, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-cream)', borderRadius: 8, border: '1px solid var(--clr-border)' }}>
                    {menuForm.icon || '🍣'}
                  </div>
                </div>
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{copy.menuImage}</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="db-input" 
                  onChange={handleFileChange} 
                />
                {isRealImage(menuForm.imageUrl) && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--clr-muted)' }}>{copy.preview}</span>
                    <img 
                      src={menuForm.imageUrl.startsWith('data:') ? menuForm.imageUrl : getBeautifulImage(menuForm.imageUrl, menuForm.name)} 
                      alt="Preview" 
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--clr-border)' }} 
                    />
                    <button 
                      type="button" 
                      style={{
                        padding: '4px 10px',
                        fontSize: 12,
                        background: '#fee2e2',
                        border: '1px solid #fcd34d',
                        borderRadius: 4,
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      onClick={() => setMenuForm(prev => ({ ...prev, imageUrl: '' }))}
                    >
                      {copy.deleteImage}
                    </button>
                  </div>
                )}
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{copy.menuDesc}</label>
                <textarea className="db-textarea" required 
                  value={menuForm.desc} onChange={e => setMenuForm({...menuForm, desc: e.target.value})} />
              </div>
              <div className="db-modal__actions">
                <button type="button" className="modal__cancel" onClick={() => setShowMenuModal(false)}>{copy.cancel}</button>
                <button type="submit" className="modal__submit">{copy.confirm}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
