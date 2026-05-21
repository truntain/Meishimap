"use client";

import { useCallback, useSyncExternalStore } from 'react';

export type AppLanguage = 'vi' | 'ja';

const LANGUAGE_STORAGE_KEY = 'meshimap_language';
const LANGUAGE_EVENT = 'meshimap-language-change';
const DEFAULT_LANGUAGE: AppLanguage = 'vi';

function isAppLanguage(value: string | null): value is AppLanguage {
  return value === 'vi' || value === 'ja';
}

function readLanguage(): AppLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isAppLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;
}

function subscribeLanguage(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LANGUAGE_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(LANGUAGE_EVENT, onStoreChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(LANGUAGE_EVENT, onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

export function setAppLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  window.dispatchEvent(new Event(LANGUAGE_EVENT));
}

export function useAppLanguage() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    readLanguage,
    () => DEFAULT_LANGUAGE,
  );

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setAppLanguage(nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setAppLanguage(language === 'vi' ? 'ja' : 'vi');
  }, [language]);

  return {
    language,
    setLanguage,
    toggleLanguage,
  };
}

export const headerCopy = {
  vi: {
    home: 'Trang chủ',
    search: 'Tìm kiếm',
    booking: 'Đặt bàn',
    profile: 'Hồ sơ cá nhân',
    logout: 'Đăng xuất',
    login: 'Đăng nhập',
    languageLabel: 'Chuyển ngôn ngữ',
    languageValue: 'VN / JP',
    openMenu: 'Mở menu',
    logoutConfirm: 'Bạn có chắc chắn muốn đăng xuất?',
  },
  ja: {
    home: 'ホーム',
    search: '検索',
    booking: '予約',
    profile: 'プロフィール',
    logout: 'ログアウト',
    login: 'ログイン',
    languageLabel: '言語を切り替え',
    languageValue: 'JP / VN',
    openMenu: 'メニューを開く',
    logoutConfirm: 'ログアウトしますか？',
  },
} satisfies Record<AppLanguage, Record<string, string>>;

export const searchCopy = {
  vi: {
    searchPlaceholder: 'Tên nhà hàng, món ăn, địa chỉ...',
    searchButton: 'Tìm kiếm',
    area: 'Khu vực',
    results: 'Kết quả',
    resultsAt: 'kết quả tại',
    sortRating: 'Đánh giá cao nhất',
    sortName: 'Tên A-Z',
    noResultsTitle: 'Không tìm thấy kết quả',
    noResultsHint: 'Thử tìm với từ khóa khác hoặc chọn "Tất cả"',
    loadingRestaurants: 'Đang tải nhà hàng...',
    mapLabel: 'Bản đồ nhà hàng',
    mapTypeLabel: 'Chọn kiểu bản đồ',
    map: 'Bản đồ',
    satellite: 'Vệ tinh',
    legendLabel: 'Chú giải loại nhà hàng',
    selected: 'Đang chọn',
    bookNow: 'Đặt bàn ngay',
    loadingMap: 'Đang tải bản đồ...',
    all: 'Tất cả',
    hcm: 'Hồ Chí Minh',
    book: 'Đặt bàn',
    supportJapanese: 'Hỗ trợ tiếng Nhật',
    japaneseStyle: 'Phong cách Nhật',
    sidebarLabel: 'Bộ lọc và danh sách',
    locationFilterLabel: 'Lọc theo khu vực',
    sortLabel: 'Sắp xếp kết quả',
  },
  ja: {
    searchPlaceholder: 'レストラン、料理、住所を検索...',
    searchButton: '検索',
    area: 'エリア',
    results: '検索結果',
    resultsAt: '件・エリア',
    sortRating: '評価が高い順',
    sortName: '名前 A-Z',
    noResultsTitle: '結果が見つかりません',
    noResultsHint: '別のキーワード、または「すべて」を試してください',
    loadingRestaurants: 'レストランを読み込み中...',
    mapLabel: 'レストラン地図',
    mapTypeLabel: '地図タイプを選択',
    map: '地図',
    satellite: '衛星',
    legendLabel: 'カテゴリ凡例',
    selected: '選択中',
    bookNow: '今すぐ予約',
    loadingMap: '地図を読み込み中...',
    all: 'すべて',
    hcm: 'ホーチミン',
    book: '予約',
    supportJapanese: '日本語対応',
    japaneseStyle: '日本料理',
    sidebarLabel: 'フィルターと一覧',
    locationFilterLabel: 'エリアで絞り込み',
    sortLabel: '検索結果を並び替え',
  },
} satisfies Record<AppLanguage, Record<string, string>>;

export const detailCopy = {
  vi: {
    bookingButton: 'Đặt bàn',
    loadingApi: 'Đang đồng bộ dữ liệu chi tiết từ API...',
    menuPlaceholder: 'Tìm kiếm món ăn...',
    menuSearch: 'Tìm kiếm',
    noMenu: 'Không tìm thấy món ăn nào',
    reviews: 'Đánh giá',
    writeReview: 'Viết đánh giá',
    contact: 'Thông tin liên hệ',
    hours: 'Giờ mở cửa',
    phone: 'Điện thoại',
    languages: 'Ngôn ngữ hỗ trợ',
    viewMap: 'Xem bản đồ',
    amenities: 'Tiện ích',
    promoLabel: 'Ưu đãi đặc biệt',
    promoText: 'Giảm 15% cho lần đặt bàn đầu tiên',
    promoButton: 'Lấy mã ưu đãi',
    promoCopied: 'Đã copy: MESHIMAP15',
    bookingTitle: 'Đặt bàn',
    date: 'Ngày',
    time: 'Giờ',
    guests: 'Số người',
    note: 'Ghi chú',
    cancel: 'Hủy',
    submitBooking: 'Xác nhận đặt bàn',
    submitting: 'Đang xử lý...',
    successTitle: 'Đặt bàn thành công!',
    close: 'Đóng',
    home: 'Về trang chủ',
    dateRequired: 'Vui lòng chọn ngày đặt bàn.',
    heroLabel: 'Ảnh nhà hàng',
    notePlaceholder: 'Yêu cầu đặc biệt, dị ứng thực phẩm...',
    successMessagePrefix: 'Cảm ơn bạn đã đặt bàn tại',
    successMessageSuffix: 'Chúng tôi sẽ liên hệ xác nhận qua điện thoại trong vòng 30 phút.',
  },
  ja: {
    bookingButton: '予約',
    loadingApi: 'APIから詳細データを同期中...',
    menuPlaceholder: '料理を検索...',
    menuSearch: '検索',
    noMenu: '料理が見つかりません',
    reviews: 'レビュー',
    writeReview: 'レビューを書く',
    contact: '連絡先情報',
    hours: '営業時間',
    phone: '電話番号',
    languages: '対応言語',
    viewMap: '地図を見る',
    amenities: '設備',
    promoLabel: '特別オファー',
    promoText: '初回予約は15%オフ',
    promoButton: 'クーポンを取得',
    promoCopied: 'コピー済み: MESHIMAP15',
    bookingTitle: '予約',
    date: '日付',
    time: '時間',
    guests: '人数',
    note: 'メモ',
    cancel: 'キャンセル',
    submitBooking: '予約を確定',
    submitting: '処理中...',
    successTitle: '予約が完了しました！',
    close: '閉じる',
    home: 'ホームへ',
    dateRequired: '予約日を選択してください。',
    heroLabel: 'レストラン写真',
    notePlaceholder: '特別なリクエスト、アレルギーなど...',
    successMessagePrefix: 'ご予約ありがとうございます:',
    successMessageSuffix: '30分以内に電話で確認いたします。',
  },
} satisfies Record<AppLanguage, Record<string, string>>;
