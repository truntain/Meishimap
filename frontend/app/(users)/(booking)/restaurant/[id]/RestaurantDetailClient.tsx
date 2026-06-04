"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { detailCopy, bookingSuccessCopy, useAppLanguage } from '@/config/i18n';
import { getBeautifulImage } from '@/utils/image';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type ApiRestaurant = {
  id: number;
  name: string;
  nameJp: string | null;
  category: string;
  rating: number;
  address: string;
  district: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  phone: string | null;
  imageUrl: string | null;
  hasJapaneseSupport: boolean;
};

type RestaurantDetail = ApiRestaurant & {
  reviewCount: number;
  hours: string;
  languages: string;
  tags: string[];
  amenities: string[];
  menuItems?: Array<{
    id: number;
    cat: string;
    emoji: string;
    imageUrl: string;
    name: string;
    price: string;
    desc: string;
    badge: string;
  }>;
  openingTime?: string;
  closingTime?: string;
};

const CATEGORY_LABELS = new Map([
  ['sushi', 'Sushi & Grill'],
  ['ramen', 'Ramen'],
  ['kaiseki', 'Kaiseki'],
  ['izakaya', 'Izakaya'],
  ['bbq', 'Yakiniku'],
  ['soba', 'Soba & Udon'],
]);

function buildRestaurantDetailUrl(id: string) {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return new URL(`restaurants/${id}`, baseUrl).toString();
}

function getSafeRating(rating: number) {
  return Math.max(0, Math.min(5, Math.round(rating)));
}

const MENU_ITEM_IMAGES: Record<string, string> = {
  'Premium Sashimi Set': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
  'Sashimi Deluxe': 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80',
  'Tempura Set': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  'Tonkotsu Ramen': 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=600&q=80',
  'Shoyu Ramen': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
  'Matcha Ice Cream': 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80',
};

const MENU_ITEM_EMOJIS: Record<string, string> = {
  'sashimi': '🐟',
  'tempura': '🍤',
  'ramen': '🍜',
  'dessert': '🍡',
  'desserts': '🍡',
  'drink': '🍹',
  'drinks': '🍹',
  'sushi': '🍣',
  'maki': '🥢',
  'noodle': '🍜',
  'noodles': '🍜',
  'bbq': '🥩',
  'yakiniku': '🥩',
  'omakase': '🍱',
  'kaiseki': '🍱',
  'main dish': '🍛',
  'side dish': '🥗',
  'buffet': '🍽️',
  'seafood': '🦞',
  'pizza': '🍕',
  'pasta': '🍝',
  'combo': '🍟',
  'set menu': '🍱',
};

function normalizeRestaurantDetail(raw: Partial<ApiRestaurant> & { menuItems?: any[], hours?: string, languages?: string, reviewCount?: number, openingTime?: string, closingTime?: string }, fallbackId: string, language: string): RestaurantDetail | null {
  const id = Number(raw.id ?? fallbackId);
  const latitude = Number(raw.latitude);
  const longitude = Number(raw.longitude);

  if (!Number.isFinite(id) || !raw.name) {
    return null;
  }

  const category = raw.category || 'other';
  const hasJapaneseSupport = Boolean(raw.hasJapaneseSupport);
  const categoryLabel = CATEGORY_LABELS.get(category) || category;
  const isJa = language === 'ja';

  const rawMenuItems = raw.menuItems || [];
  const menuItems = rawMenuItems.map((item: any) => {
    const name = String(item.name).trim();
    const rawItemImageUrl = item.imageUrl || item.image_url;

    const hasRealImage = rawItemImageUrl && (
      rawItemImageUrl.startsWith('http://') ||
      rawItemImageUrl.startsWith('https://') ||
      rawItemImageUrl.startsWith('/uploads/') ||
      rawItemImageUrl.startsWith('uploads/') ||
      rawItemImageUrl.startsWith('data:image/')
    );
    const itemImageUrl = hasRealImage ? getBeautifulImage(rawItemImageUrl, name) : '';

    let priceVal = item.price;
    if (typeof priceVal === 'string') {
      const numericString = priceVal.replace(/[^\d]/g, '');
      priceVal = parseInt(numericString, 10) || 0;
    }

    return {
      id: Number(item.id),
      cat: item.category || item.cat || 'other',
      emoji: item.emoji || item.icon || MENU_ITEM_EMOJIS[String(item.category || item.cat || '').toLowerCase()] || item.badge || '🍣',
      imageUrl: itemImageUrl,
      name: name,
      price: new Intl.NumberFormat('vi-VN').format(priceVal || 0) + 'đ',
      desc: item.description || item.desc || '',
      badge: item.badge || '',
    };
  });

  const rawImageUrl = raw.imageUrl || (raw as any).image_url;
  const imageUrl = getBeautifulImage(rawImageUrl, raw.name);

  return {
    id,
    name: String(raw.name),
    nameJp: raw.nameJp ?? null,
    category,
    rating: Number(raw.rating ?? 0),
    address: raw.address || (isJa ? '住所未登録' : 'Chưa cập nhật địa chỉ'),
    district: raw.district ?? null,
    city: raw.city ?? null,
    latitude: Number.isFinite(latitude) ? latitude : 0,
    longitude: Number.isFinite(longitude) ? longitude : 0,
    description: raw.description ?? null,
    phone: raw.phone || (isJa ? '未登録' : 'Chưa cập nhật'),
    imageUrl,
    hasJapaneseSupport,
    reviewCount: raw.reviewCount || 0,
    hours: (typeof raw.hours === 'object' && raw.hours !== null)
      ? `${Object.values(raw.hours)[0]} ${isJa ? '(毎日)' : '(Hàng ngày)'}`
      : (raw.hours || (isJa ? '未登録' : 'Chưa cập nhật')),
    languages: raw.languages || (hasJapaneseSupport
      ? (isJa ? 'ベトナム語、日本語、英語' : 'Tiếng Việt, Tiếng Nhật, English')
      : (isJa ? 'ベトナム語、英語' : 'Tiếng Việt, English')),
    tags: [
      categoryLabel,
      hasJapaneseSupport
        ? (isJa ? '日本語対応' : 'Japanese Speaking')
        : (isJa ? '和食スタイル' : 'Japanese Style'),
    ],
    amenities: isJa ? ['📶 無料Wi-Fi', '💳 カード支払い可'] : ['📶 Free Wifi', '💳 Cards Accepted'],
    menuItems: menuItems.length > 0 ? menuItems : undefined,
    openingTime: raw.openingTime || '08:00',
    closingTime: raw.closingTime || '22:00',
  } as any;
}

function getMapsQuery(restaurant: RestaurantDetail) {
  if (Number.isFinite(restaurant.latitude) && Number.isFinite(restaurant.longitude)) {
    return `${restaurant.latitude},${restaurant.longitude}`;
  }

  return restaurant.address;
}


const MENU_CATS = [
  { key: 'all', label: 'Tất cả (All)' },
  { key: 'sashimi', label: 'Sashimi' },
  { key: 'tempura', label: 'Tempura' },
  { key: 'ramen', label: 'Ramen' },
  { key: 'dessert', label: 'Desserts' },
];

const TIME_SLOTS = ['11:00', '12:00', '13:00', '18:00', '19:00', '20:00', '21:00'];
const GUEST_OPTIONS = [1, 2, 3, 4, 5];

// ── Icons ──
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="#fff" strokeWidth="1.3" />
    <path d="M2 7h12M5 1v4M11 1v4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const StarsFull = ({ count }: { count: number }) => (
  <span className="detail-meta__stars">
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
);

export default function RestaurantDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { language } = useAppLanguage();
  const copy = detailCopy[language];
  const successCopy = bookingSuccessCopy[language];
  const restaurantIdParam = params?.id;
  const restaurantId = Array.isArray(restaurantIdParam)
    ? restaurantIdParam[0]
    : restaurantIdParam || String(1);

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState('');

  const menuCats = React.useMemo(() => {
    const categoriesSet = new Set<string>();
    const items = restaurant?.menuItems || [];
    items.forEach((item: any) => {
      if (item.cat) {
        categoriesSet.add(item.cat);
      }
    });

    const list = Array.from(categoriesSet).map((catName) => {
      let label = catName;
      const lower = catName.toLowerCase();
      if (lower === 'sashimi') label = 'Sashimi';
      else if (lower === 'tempura') label = 'Tempura';
      else if (lower === 'ramen') label = 'Ramen';
      else if (lower === 'dessert' || lower === 'desserts') label = language === 'ja' ? 'デザート' : 'Tráng miệng';
      else if (lower === 'drink' || lower === 'drinks') label = language === 'ja' ? '飲み物' : 'Đồ uống';
      else if (lower === 'sushi') label = 'Sushi';
      else if (lower === 'maki') label = 'Maki';
      else if (lower === 'noodle' || lower === 'noodles') label = language === 'ja' ? '麺類' : 'Mì';
      else if (lower === 'bbq' || lower === 'yakiniku') label = 'Yakiniku (BBQ)';
      else if (lower === 'omakase') label = 'Omakase';
      else if (lower === 'kaiseki') label = 'Kaiseki';
      else if (lower === 'main dish') label = language === 'ja' ? 'メインディッシュ' : 'Món chính';
      else if (lower === 'side dish') label = language === 'ja' ? 'サイドディッシュ' : 'Món phụ';
      else if (lower === 'buffet') label = 'Buffet';
      else if (lower === 'seafood') label = language === 'ja' ? 'シーフード' : 'Hải sản';
      else if (lower === 'pizza') label = 'Pizza';
      else if (lower === 'pasta') label = 'Pasta';
      else if (lower === 'combo') label = 'Combo';
      else if (lower === 'set menu') label = language === 'ja' ? 'セットメニュー' : 'Set Menu';
      else {
        label = catName.charAt(0).toUpperCase() + catName.slice(1);
      }

      return {
        key: catName,
        label: label,
      };
    });

    return [
      { key: 'all', label: language === 'ja' ? 'すべて' : 'Tất cả' },
      ...list,
    ];
  }, [restaurant?.menuItems, language]);

  // ── Reviews state ──
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchReviews() {
      try {
        const res = await fetch(`${API_BASE_URL}/review/restaurant/${restaurantId}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        if (isMounted) {
          const formattedReviews = data.map((r: any) => {
            const dateObj = new Date(r.createdAt);
            const author = r.user?.name || (language === 'ja' ? 'ゲスト' : 'Khách');
            const date = language === 'ja'
              ? `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月`
              : `Tháng ${dateObj.getMonth() + 1}, ${dateObj.getFullYear()}`;
            return {
              id: r.id,
              author,
              initial: author.charAt(0).toUpperCase(),
              date,
              stars: r.stars,
              text: r.title ? `${r.title} — ${r.content}` : r.content,
              ownerReply: r.ownerReply || r.owner_reply || null,
              userId: r.user?.id || null,
            };
          });
          setReviews(formattedReviews);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setReviews([]);
      }
    }
    fetchReviews();
    return () => { isMounted = false; };
  }, [restaurantId, language]);

  const handleReportReview = async (reviewId: any) => {
    if (String(reviewId).startsWith('local-')) {
      toast.error(language === 'ja' ? 'このレビューは報告できません。' : 'Không thể báo cáo đánh giá này.');
      return;
    }

    const review = reviews.find(r => r.id === reviewId);
    if (review && currentUserId && String(review.userId) === String(currentUserId)) {
      toast.error(
        language === 'ja'
          ? '自分のレビューを報告することはできません。'
          : 'Không thể báo cáo đánh giá của chính bạn.'
      );
      return;
    }

    if (!window.confirm(copy.confirmReport)) return;

    const token = Cookies.get('access_token');
    if (!token) {
      toast.error(copy.alertReportError);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/review/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: language === 'ja' ? '違反報告' : 'Báo cáo vi phạm' })
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success(copy.alertReportSuccess);
    } catch (err) {
      toast.error(copy.alertReportError);
    }
  };

  // ── Menu state ──
  const [activeCat, setActiveCat] = useState('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuSearchInput, setMenuSearchInput] = useState('');

  // ── Booking modal state ──
  const [bookingOpen, setBookingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<{
    id: number;
    restaurantName: string;
    date: string;
    time: string;
    guests: number;
    note: string;
    status: 'pending' | 'approved' | 'rejected' | string;
    rejectReason?: string;
  } | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('18:00');
  const [bookingGuests, setBookingGuests] = useState(2);
  const [bookingNote, setBookingNote] = useState('');
  const [dateError, setDateError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── My Bookings state ──
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(false);

  // ── Current user state ──
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // ── Promo copy state ──
  const [promoCopied, setPromoCopied] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = Cookies.get('user');
    if (userData) {
      try {
        const userObj = JSON.parse(decodeURIComponent(userData));
        if (userObj && userObj.id) {
          setCurrentUserId(Number(userObj.id));
        }
      } catch {
        try {
          const userObj = JSON.parse(userData);
          if (userObj && userObj.id) {
            setCurrentUserId(Number(userObj.id));
          }
        } catch (err) {
          console.error('Failed to parse user cookie in useEffect:', err);
        }
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadRestaurant() {
      setRestaurantLoading(true);
      setRestaurantError('');

      try {
        const response = await fetch(buildRestaurantDetailUrl(restaurantId), {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`API trả về ${response.status}`);
        }

        const data = await response.json();
        const normalized = normalizeRestaurantDetail(data, restaurantId, language);

        if (!normalized) {
          throw new Error('Dữ liệu nhà hàng không hợp lệ');
        }

        if (isMounted) {
          setRestaurant(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setRestaurant(null);
          setRestaurantError(
            error instanceof Error
              ? (language === 'ja'
                ? `Không tải được chi tiết nhà hàng (${error.message}).`
                : `Không tải được chi tiết nhà hàng (${error.message}).`)
              : 'Không tải được chi tiết nhà hàng.',
          );
        }
      } finally {
        if (isMounted) {
          setRestaurantLoading(false);
        }
      }
    }

    loadRestaurant();

    return () => {
      isMounted = false;
    };
  }, [restaurantId, language]);

  // Close modal on backdrop click
  useEffect(() => {
    if (!bookingOpen && !successOpen && !myBookingsOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setBookingOpen(false); setSuccessOpen(false); setMyBookingsOpen(false); }
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [bookingOpen, successOpen, myBookingsOpen]);

  // Socket listener for real-time booking status update in the modal
  useEffect(() => {
    if (!activeBooking) return;

    const userData = Cookies.get('user');
    if (!userData) {
      console.warn('[Socket] No user data found in cookies.');
      return;
    }

    let userId: number | null = null;
    try {
      const userObj = JSON.parse(decodeURIComponent(userData));
      userId = userObj.id;
    } catch {
      try {
        const userObj = JSON.parse(userData);
        userId = userObj.id;
      } catch (err) {
        console.error('Failed to parse user cookie in RestaurantDetailClient:', err);
      }
    }

    if (!userId) {
      console.warn('[Socket] No userId parsed from user cookie.');
      return;
    }

    console.log('[Socket] Connecting to socket room for userId:', userId, 'activeBookingId:', activeBooking.id);
    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      console.log('[Socket] Connected successfully! Joining room:', `user_${userId}`);
      socket.emit('join_user_room', userId);
    });

    socket.on('booking_status_updated', (data: any) => {
      console.log('[Socket] Received booking_status_updated event:', data);
      setActiveBooking((prev) => {
        console.log('[Socket] Comparing prev booking:', prev, 'with updated data:', data);
        if (prev && String(prev.id) === String(data.id)) {
          let mappedStatus = data.status;
          if (data.status === 'confirmed') mappedStatus = 'approved';
          if (data.status === 'cancelled') mappedStatus = 'rejected';
          const updated = {
            ...prev,
            status: mappedStatus,
            rejectReason: data.rejectReason || ''
          };
          console.log('[Socket] Updating activeBooking state to:', updated);
          return updated;
        }
        console.log('[Socket] Event ignored. prev:', prev, 'data:', data);
        return prev;
      });
    });

    return () => {
      console.log('[Socket] Disconnecting socket for activeBookingId:', activeBooking.id);
      socket.disconnect();
    };
  }, [activeBooking?.id]);

  // ── Menu filter logic ──
  const filteredMenu = useCallback(() => {
    const itemsSource = (restaurant as any)?.menuItems || [];
    return itemsSource.filter((item: any) => {
      const matchCat = activeCat === 'all' || item.cat === activeCat;
      const q = menuSearch.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [restaurant, activeCat, menuSearch]);

  // ── Booking submit ──
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      setDateError(true);
      return;
    }
    setDateError(false);

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`; // YYYY-MM-DD

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

    if (bookingDate < todayStr) {
      toast.error(
        language === 'ja'
          ? '過去の日付は予約できません。'
          : 'Không thể đặt bàn vào ngày trong quá khứ.'
      );
      return;
    }

    if (bookingDate === todayStr && bookingTime < currentTimeStr) {
      toast.error(
        language === 'ja'
          ? '現在時刻より前の時間は予約できません。'
          : 'Không thể đặt bàn vào thời gian trước thời điểm hiện tại.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token = Cookies.get('access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/booking`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          date: bookingDate,
          time: bookingTime,
          guests: bookingGuests,
          note: bookingNote,
        }),
      });

      if (!res.ok) throw new Error('Booking failed');
      const data = await res.json();

      setTimeout(() => {
        setIsSubmitting(false);
        setBookingOpen(false);
        setActiveBooking({
          id: data.id,
          restaurantName: restaurant?.name || '',
          date: bookingDate,
          time: bookingTime,
          guests: bookingGuests,
          note: bookingNote,
          status: 'pending'
        });
        setSuccessOpen(true);
        setBookingDate('');
        setBookingNote('');
      }, 600);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      toast.error(
        language === 'ja'
          ? '予約中にエラーが発生しました。もう一度お試しください。'
          : 'Đã xảy ra lỗi khi đặt bàn. Vui lòng thử lại.'
      );
    }
  };

  const openBooking = () => {
    const token = Cookies.get('access_token');
    if (!token) {
      toast.error(
        language === 'ja'
          ? '予約するにはログインしてください。'
          : 'Vui lòng đăng nhập để thực hiện đặt bàn!'
      );
      router.push('/login');
      return;
    }
    setBookingOpen(true);
    setDateError(false);
  };

  const openMyBookings = () => {
    const token = Cookies.get('access_token');
    if (!token) {
      toast.error(
        language === 'ja'
          ? '予約履歴を見るにはログインしてください。'
          : 'Vui lòng đăng nhập để xem danh sách bàn đã đặt!'
      );
      router.push('/login');
      return;
    }
    setMyBookingsOpen(true);
    setMyBookingsLoading(true);
    fetch(`${API_BASE_URL}/booking/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const filtered = data.filter((b: any) => String(b.restaurant?.id) === String(restaurantId));
        setMyBookings(filtered);
      })
      .catch((err) => {
        console.error('Error fetching my bookings:', err);
        toast.error(
          language === 'ja'
            ? '予約履歴の取得に失敗しました。'
            : 'Không thể tải danh sách bàn đã đặt.'
        );
      })
      .finally(() => {
        setMyBookingsLoading(false);
      });
  };

  const getStatusBadge = (status: string, rejectReason?: string | null) => {
    let label = '';
    let bg = '';
    let color = '';
    const isVi = language !== 'ja';

    if (status === 'pending') {
      label = isVi ? 'Đang chờ duyệt' : '承認待ち';
      bg = '#fff3cd';
      color = '#856404';
    } else if (status === 'confirmed' || status === 'approved') {
      label = isVi ? 'Thành công' : '承認済み';
      bg = '#d4edda';
      color = '#155724';
    } else if (status === 'cancelled' || status === 'rejected') {
      label = isVi ? 'Thất bại' : 'キャンセル済';
      bg = '#f8d7da';
      color = '#721c24';
    } else if (status === 'completed') {
      label = isVi ? 'Hoàn thành' : '来店済み';
      bg = '#e2e3e5';
      color = '#383d41';
    } else {
      label = status;
      bg = '#e2e3e5';
      color = '#383d41';
    }

    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: bg,
          color: color,
          width: 'fit-content'
        }}>
          {label}
        </span>
        {rejectReason && (status === 'cancelled' || status === 'rejected') && (
          <span style={{ fontSize: '11px', color: '#c62828', fontStyle: 'italic' }}>
            {isVi ? 'Lý do từ chối: ' : '却下理由: '}{rejectReason}
          </span>
        )}
      </div>
    );
  };

  const handleGetPromo = () => {
    navigator.clipboard?.writeText('MESHIMAP15').catch(() => { });
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2500);
  };

  const today = new Date().toISOString().split('T')[0];
  const menuItems = filteredMenu();

  if (restaurantLoading && !restaurant) {
    return <div style={{ padding: '100px', textAlign: 'center', color: '#888' }}>{language === 'ja' ? 'データを読み込み中...' : 'Đang tải dữ liệu...'}</div>;
  }
  if (!restaurant) {
    return <div style={{ padding: '100px', textAlign: 'center', color: '#888' }}>{language === 'ja' ? 'レストランが見つかりません。' : 'Không tìm thấy nhà hàng.'}</div>;
  }

  const localReviewsCount = reviews.filter(r => String(r.id).startsWith('local-')).length;
  const displayReviewCount = restaurant.reviewCount + localReviewsCount;
  const displayRating = localReviewsCount > 0
    ? (restaurant.rating * restaurant.reviewCount + reviews.filter(r => String(r.id).startsWith('local-')).reduce((sum, r) => sum + r.stars, 0)) / displayReviewCount
    : restaurant.rating;
  const starCount = getSafeRating(displayRating);

  return (
    <>
      {/* ── Hero ── */}
      <section className="detail-hero" aria-label={copy.heroLabel} id="detail-hero">
        <div
          className="detail-hero__img"
          style={{
            background: `url('${restaurant.imageUrl}') center/cover no-repeat`,
          }}
        />
        <div className="detail-hero__overlay" />
      </section>

      {/* ── Info card (overlapping) ── */}
      <div className="detail-info-card">
        <div className="detail-info-card__inner">
          <div className="detail-info-card__left">
            <div className="detail-tags">
              {restaurant.tags.map(tag => (
                <span
                  key={tag}
                  className={`detail-tag${tag === 'Japanese Speaking' || tag === 'Hygiene Certified' ? ' detail-tag--green' : ''}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="detail-name">{restaurant.name}</h1>
            {restaurant.nameJp && (
              <p style={{ fontSize: '13px', color: 'var(--clr-muted)', marginBottom: '6px' }}>{restaurant.nameJp}</p>
            )}
            <div className="detail-meta">
              <span className="detail-meta__item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="#8A8A8A" strokeWidth="1.2" />
                  <circle cx="7" cy="4.667" r="1.167" stroke="#8A8A8A" strokeWidth="1.2" />
                </svg>
                {restaurant.address}
              </span>
              <span className="detail-meta__item">
                <StarsFull count={starCount} />
                ({displayRating.toFixed(1)}/5 • {displayReviewCount} {language === 'ja' ? 'レビュー' : 'reviews'})
              </span>
            </div>
            {restaurant.description && (
              <p style={{ fontSize: '13px', color: 'var(--clr-muted)', lineHeight: 1.6, maxWidth: '720px' }}>
                {restaurant.description}
              </p>
            )}
            {restaurantLoading && (
              <p className="detail-api-status">{copy.loadingApi}</p>
            )}
            {restaurantError && (
              <p className="detail-api-status detail-api-status--warning">{restaurantError}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="detail-book-btn" id="btn-open-booking" onClick={openBooking}>
              <CalendarIcon /> {copy.bookingButton}
            </button>
            <button 
              className="detail-book-btn" 
              id="btn-open-my-bookings" 
              style={{ 
                background: 'var(--clr-light)', 
                color: 'var(--clr-dark)', 
                border: '1px solid rgba(218,194,182,0.5)',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }} 
              onClick={openMyBookings}
            >
              📋 {language === 'ja' ? '予約履歴' : 'Bàn đã đặt'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="detail-main">
        {/* Left column */}
        <div className="detail-left">

          {/* Menu search */}
          <div className="menu-search">
            <span style={{ padding: '14px 16px', color: 'var(--clr-muted)', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="#877369" strokeWidth="1.3" />
                <path d="M12.5 12.5 16 16" stroke="#877369" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              className="menu-search__input"
              placeholder={copy.menuPlaceholder}
              id="menu-search-input"
              value={menuSearchInput}
              onChange={e => setMenuSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setMenuSearch(menuSearchInput)}
            />
            <div style={{ width: '1px', height: '28px', background: 'rgba(218,194,182,0.5)' }} />
            <button
              style={{ padding: '10px 20px', background: 'var(--clr-rich)', color: '#fff', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', margin: '6px', borderRadius: '8px' }}
              id="btn-menu-search"
              onClick={() => setMenuSearch(menuSearchInput)}
            >
              {copy.menuSearch}
            </button>
          </div>

          {/* Category tabs */}
          <div className="menu-cats" id="menu-cats">
            {menuCats.map((cat: { key: string, label: string }) => (
              <button
                key={cat.key}
                className={`menu-cat-btn${activeCat === cat.key ? ' is-active' : ''}`}
                id={`cat-${cat.key}`}
                onClick={() => setActiveCat(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="menu-grid" id="menu-grid">
            {menuItems.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--clr-muted)' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🍽️</div>
                <p>{copy.noMenu}</p>
              </div>
            ) : (
              menuItems.map((item: any) => (
                <div key={item.id} className="menu-item" data-cat={item.cat}>
                  <div className="menu-item__img">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      item.emoji || '🍽️'
                    )}
                  </div>
                  <div className="menu-item__body">
                    <div className="menu-item__name">{item.name}</div>
                    <div className="menu-item__price">{item.price}</div>
                    <p style={{ fontSize: '12px', color: 'var(--clr-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#2f7d32', marginTop: '4px' }}>{item.badge}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id="reviews-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: 700, fontSize: '20px', color: 'var(--clr-dark)' }}>{copy.reviews}</h2>
              <Link
                href={`/restaurant/${restaurantId}/review`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clr-dark)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
                id="btn-write-review"
              >
                {copy.writeReview}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14l1.5-4.5L11 2l3 3-7.5 7.5L2 14z" stroke="#6C2F00" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review__header">
                  <div className="review__avatar">{review.initial}</div>
                  <div className="review__body">
                    <div className="review__name">{review.author}</div>
                    <div className="review__date">{review.date}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {(!currentUserId || String(currentUserId) !== String(review.userId)) && (
                      <button
                        onClick={() => handleReportReview(review.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '2px',
                          color: 'var(--clr-muted)',
                          transition: 'color 0.2s',
                          lineHeight: 1
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--clr-muted)'}
                        title={language === 'ja' ? '違反報告' : 'Báo cáo vi phạm'}
                        className="btn-report-review"
                      >
                        🚩
                      </button>
                    )}
                    <div className="review__stars">
                      {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                    </div>
                  </div>
                </div>
                <p className="review__text">{review.text}</p>
                {review.ownerReply && (
                  <div className="review__reply">
                    <div className="review__reply-title">{copy.ownerReply || 'Phản hồi của chủ nhà hàng'}:</div>
                    <p className="review__reply-text">"{review.ownerReply}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="detail-right">
          {/* Contact info */}
          <div className="info-card">
            <h3 className="info-card__title">{copy.contact}</h3>
            <div className="info-card__row">
              <div style={{ color: 'var(--clr-dark)', flexShrink: 0, marginTop: '2px' }}>🕐</div>
              <div>
                <div className="info-card__label">{copy.hours}</div>
                <div className="info-card__value">{restaurant.hours}</div>
              </div>
            </div>
            <div className="info-card__row">
              <div style={{ color: 'var(--clr-dark)', flexShrink: 0, marginTop: '2px' }}>📞</div>
              <div>
                <div className="info-card__label">{copy.phone}</div>
                <div className="info-card__value">{restaurant.phone}</div>
              </div>
            </div>
            <div className="info-card__row">
              <div style={{ color: 'var(--clr-dark)', flexShrink: 0, marginTop: '2px' }}>🌐</div>
              <div>
                <div className="info-card__label">{copy.languages}</div>
                <div className="info-card__value">{restaurant.languages}</div>
              </div>
            </div>
            {/* Map placeholder */}
            <div style={{ height: '140px', background: 'linear-gradient(135deg,#e0d3cc,#d5c4ba)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginTop: '14px' }}>
              <span style={{ fontSize: '32px', opacity: 0.4 }}>🗺</span>
              <button
                style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--clr-dark)', color: '#fff', padding: '6px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                id="btn-view-map"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getMapsQuery(restaurant))}`, '_blank')}
              >
                {copy.viewMap}
              </button>
            </div>
          </div>

          {/* Amenities */}
          <div className="info-card">
            <h3 className="info-card__title">{copy.amenities}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {restaurant.amenities.map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--clr-muted)' }}>{a}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Booking Modal ── */}
      {bookingOpen && (
        <div
          className="modal"
          id="modal-booking"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-booking-title"
          style={{ display: 'flex' }}
          onClick={e => { if (e.target === e.currentTarget) setBookingOpen(false); }}
        >
          <div className="modal__box" ref={modalRef}>
            <h3 className="modal__title" id="modal-booking-title">
              {copy.bookingTitle} — {restaurant.name}
            </h3>
            <form id="booking-form" onSubmit={handleBookingSubmit} noValidate>
              <div className="modal__field">
                <label className="modal__label" htmlFor="booking-date">{copy.date} <span style={{ color: '#e53e3e' }}>*</span></label>
                <input
                  type="date"
                  id="booking-date"
                  className={`modal__input${dateError ? ' is-error' : ''}`}
                  min={today}
                  value={bookingDate}
                  onChange={e => { setBookingDate(e.target.value); setDateError(false); }}
                  required
                />
                {dateError && <span className="field-error is-visible">{copy.dateRequired}</span>}
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="booking-time">{copy.time}</label>
                <select id="booking-time" className="modal__select" value={bookingTime} onChange={e => setBookingTime(e.target.value)}>
                  {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="booking-guests">{copy.guests}</label>
                <select id="booking-guests" className="modal__select" value={bookingGuests} onChange={e => setBookingGuests(Number(e.target.value))}>
                  {GUEST_OPTIONS.map(g => (
                    <option key={g} value={g}>
                      {g === 5
                        ? (language === 'ja' ? '5人以上' : '5+ người')
                        : (language === 'ja' ? `${g}人` : `${g} người`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="booking-note">{copy.note}</label>
                <input
                  type="text"
                  id="booking-note"
                  className="modal__input"
                  placeholder={copy.notePlaceholder}
                  value={bookingNote}
                  onChange={e => setBookingNote(e.target.value)}
                />
              </div>

              <div className="modal__actions">
                <button type="button" className="modal__cancel" id="btn-cancel-booking" onClick={() => setBookingOpen(false)}>
                  {copy.cancel}
                </button>
                <button type="submit" className="modal__submit" id="btn-confirm-booking" disabled={isSubmitting}>
                  {isSubmitting ? copy.submitting : copy.submitBooking}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Success/Status Modal ── */}
      {successOpen && activeBooking && (
        <div
          className="modal"
          id="modal-booking-success"
          style={{ display: 'flex' }}
          onClick={e => { if (e.target === e.currentTarget) setSuccessOpen(false); }}
        >
          <div className="modal__box" style={{ textAlign: 'center', maxWidth: '480px', width: '90%' }}>
            {/* Dynamic Status Icon and Title */}
            {activeBooking.status === 'pending' && (
              <>
                <div style={{ fontSize: '56px', marginBottom: '16px', animation: 'pulse 2s infinite' }}>⏳</div>
                <h3 style={{ fontWeight: 700, fontSize: '22px', color: 'var(--clr-dark)', marginBottom: '8px' }}>
                  {language === 'ja' ? '予約リクエスト送信完了 (承認待ち)' : 'Yêu cầu đặt bàn đang chờ duyệt'}
                </h3>
                <p style={{ color: 'var(--clr-muted)', marginBottom: '24px', fontSize: '14px' }}>
                  {language === 'ja'
                    ? 'システムがリクエストを記録しました。レストランからの返信をお待ちください。'
                    : 'Hệ thống đã ghi nhận yêu cầu của bạn, vui lòng chờ phản hồi của nhà hàng.'}
                </p>
              </>
            )}

            {activeBooking.status === 'approved' && (
              <>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ fontWeight: 700, fontSize: '22px', color: '#2f7d32', marginBottom: '8px' }}>
                  {language === 'ja' ? '予約が承認されました！' : 'Đặt bàn thành công!'}
                </h3>
                <p style={{ color: 'var(--clr-muted)', marginBottom: '24px', fontSize: '14px' }}>
                  {language === 'ja'
                    ? 'ご予約ありがとうございます。ご来店をお待ちしております。'
                    : 'Yêu cầu đặt bàn của bạn đã được nhà hàng chấp nhận.'}
                </p>
              </>
            )}

            {activeBooking.status === 'rejected' && (
              <>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>❌</div>
                <h3 style={{ fontWeight: 700, fontSize: '22px', color: '#d32f2f', marginBottom: '8px' }}>
                  {language === 'ja' ? '予約が拒否されました' : 'Đặt bàn thất bại'}
                </h3>
                <p style={{ color: 'var(--clr-muted)', marginBottom: '16px', fontSize: '14px' }}>
                  {language === 'ja'
                    ? '申し訳ありませんが、ご予約は拒否されました。'
                    : 'Yêu cầu đặt bàn của bạn đã bị nhà hàng từ chối.'}
                </p>
                {activeBooking.rejectReason && (
                  <div style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px', padding: '12px', marginBottom: '24px', textAlign: 'left' }}>
                    <strong style={{ color: '#c62828', fontSize: '13px' }}>
                      {language === 'ja' ? '却下理由: ' : 'Lý do từ chối: '}
                    </strong>
                    <span style={{ fontSize: '13px', color: '#333' }}>{activeBooking.rejectReason}</span>
                  </div>
                )}
              </>
            )}

            {/* Booking Info Box */}
            <div style={{ backgroundColor: '#FAF6F0', borderRadius: '12px', padding: '16px', border: '1px solid rgba(218,194,182,0.3)', textAlign: 'left', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(218,194,182,0.3)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#877369', textTransform: 'uppercase' }}>
                  {language === 'ja' ? 'レストラン' : 'Nhà hàng'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--clr-dark)' }}>
                  {activeBooking.restaurantName}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#877369', display: 'block', marginBottom: '2px' }}>
                    {language === 'ja' ? '日付' : 'Ngày'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                    {activeBooking.date}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#877369', display: 'block', marginBottom: '2px' }}>
                    {language === 'ja' ? '時間' : 'Giờ'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                    {activeBooking.time}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(218,194,182,0.3)', paddingTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#877369' }}>
                  {language === 'ja' ? '人数' : 'Số người'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                  {activeBooking.guests === 5
                    ? (language === 'ja' ? '5人以上' : '5+ người')
                    : (language === 'ja' ? `${activeBooking.guests}人` : `${activeBooking.guests} người`)}
                </span>
              </div>
              {activeBooking.note && (
                <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(218,194,182,0.3)', paddingTop: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#877369', marginBottom: '2px' }}>
                    {language === 'ja' ? '備考' : 'Ghi chú'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#555', fontStyle: 'italic' }}>
                    {activeBooking.note}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="detail-book-btn"
                style={{ display: 'inline-flex' }}
                id="btn-close-success"
                onClick={() => setSuccessOpen(false)}
              >
                {language === 'ja' ? '閉じる' : 'Đóng'}
              </button>
              <Link
                href="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'var(--clr-light)', color: 'var(--clr-dark)', borderRadius: '10px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
              >
                {language === 'ja' ? 'ホームへ' : 'Trang chủ'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── My Bookings List Modal ── */}
      {myBookingsOpen && (
        <div
          className="modal"
          id="modal-my-bookings"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-my-bookings-title"
          style={{ display: 'flex' }}
          onClick={e => { if (e.target === e.currentTarget) setMyBookingsOpen(false); }}
        >
          <div className="modal__box" style={{ maxWidth: '540px', width: '95%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 className="modal__title" id="modal-my-bookings-title" style={{ marginBottom: '20px' }}>
              {language === 'ja' ? 'ご予約履歴' : 'Danh sách bàn đã đặt'} — {restaurant.name}
            </h3>
            
            {myBookingsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--clr-muted)', fontFamily: 'var(--font-body)' }}>
                {language === 'ja' ? '読み込み中...' : 'Đang tải dữ liệu...'}
              </div>
            ) : myBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--clr-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                <p>{language === 'ja' ? 'この店舗 of 予約履歴はありません。' : 'Bạn chưa có bàn đặt nào tại nhà hàng này.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                {myBookings.map((b) => (
                  <div 
                    key={b.id} 
                    style={{ 
                      backgroundColor: '#FAF6F0', 
                      borderRadius: '12px', 
                      padding: '16px', 
                      border: '1px solid rgba(218,194,182,0.3)', 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(218,194,182,0.3)', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--clr-dark)' }}>
                        #{b.id}
                      </span>
                      {getStatusBadge(b.status, b.rejectReason)}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#877369', display: 'block', marginBottom: '2px' }}>
                          {language === 'ja' ? '日付' : 'Ngày'}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                          {b.bookingDate}
                        </span>
                      </div>
                      
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#877369', display: 'block', marginBottom: '2px' }}>
                          {language === 'ja' ? '時間' : 'Giờ'}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                          {b.bookingTime?.substring(0, 5) || b.bookingTime}
                        </span>
                      </div>
                      
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#877369', display: 'block', marginBottom: '2px' }}>
                          {language === 'ja' ? '人数' : 'Số người'}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                          {b.guests === 5
                            ? (language === 'ja' ? '5人以上' : '5+ người')
                            : (language === 'ja' ? `${b.guests}人` : `${b.guests} người`)}
                        </span>
                      </div>
                      
                      {b.note && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#877369', display: 'block', marginBottom: '2px' }}>
                            {language === 'ja' ? '備考' : 'Ghi chú'}
                          </span>
                          <span style={{ fontSize: '13px', color: '#555', fontStyle: 'italic' }}>
                            {b.note}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                type="button" 
                className="modal__cancel" 
                onClick={() => setMyBookingsOpen(false)}
                style={{ margin: 0 }}
              >
                {language === 'ja' ? '閉じる' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
