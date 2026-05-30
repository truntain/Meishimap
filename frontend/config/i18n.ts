"use client";

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { useCallback } from 'react';

export type AppLanguage = 'vi' | 'ja';

const resources = {
  vi: {
    translation: {
      header: {
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
      search: {
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
        hcm: 'Hà Nội',
        book: 'Đặt bàn',
        supportJapanese: 'Hỗ trợ tiếng Nhật',
        japaneseStyle: 'Phong cách Nhật',
        sidebarLabel: 'Bộ lọc và danh sách',
        locationFilterLabel: 'Lọc theo khu vực',
        sortLabel: 'Sắp xếp kết quả',
      },
      detail: {
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
        ownerReply: 'Phản hồi của chủ nhà hàng',
      },
      home: {
        title: 'Tinh hoa ẩm thực Nhật Bản tại Việt Nam',
        subtitle: 'Khám phá những nhà hàng chuẩn vị, hỗ trợ ngôn ngữ và dịch vụ tận tâm nhất dành cho cộng đồng người Việt - Nhật',
        searchPlaceholder: 'Nhập tên nhà hàng, món ăn, địa chỉ...',
        searchButton: 'Tìm kiếm',
        chipNearMe: '📍 Tìm quanh đây',
        chipJapanese: '🇯🇵 Hỗ trợ tiếng Nhật',
        chipHygiene: '✨ Đảm bảo vệ sinh',
        featuredTitle: 'Nhà hàng nổi bật',
        featuredSubtitle: 'Lựa chọn hàng đầu cho trải nghiệm ẩm thực tinh tế',
        seeAll: 'Xem tất cả',
        loading: 'Đang tải...',
        noFeatured: 'Không có nhà hàng nổi bật.',
        supportJapanese: 'Hỗ trợ tiếng nhật',
        bookNow: 'Đặt bàn',
        support247: 'Hỗ trợ 24/7',
        supportDesc: 'Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ mọi lúc.',
        contactNow: 'Liên hệ ngay',
        connectCulture: 'Kết nối văn hóa qua từng bữa ăn',
        partnerDesc: 'Trở thành đối tác của Meshimap để tiếp cận cộng đồng thực khách tinh tế từ cả Việt Nam và Nhật Bản.',
        registerRestaurant: 'Đăng ký nhà hàng',
      },
      footer: {
        brandDesc: 'Nền tảng đặt chỗ và khám phá ẩm thực hàng đầu, kết nối tinh hoa ẩm thực Việt Nam và Nhật Bản.',
        discover: 'Khám phá',
        restaurants: 'Nhà hàng',
        aboutUs: 'Về chúng tôi',
        support: 'Hỗ trợ',
        languageSupport: 'Hỗ trợ ngôn ngữ',
        policy: 'Chính sách',
        copyright: '© 2024 Meshimap. Connecting Cultures Through Cuisine.',
      },
      bookingSuccess: {
        title: 'Đặt bàn thành công',
        description: 'Hệ thống đã ghi nhận yêu cầu của bạn, vui lòng chờ phản hồi của nhà hàng.',
        restaurant: 'Nhà hàng',
        backToRestaurant: 'Quay lại nhà hàng',
        guestsFormat: '{{count}} người',
        guestsMoreFormat: '5+ người',
      },
      writeReview: {
        title: 'Viết đánh giá',
        metaTitle: 'Viết đánh giá — MESHIMAP',
        metaDesc: 'Chia sẻ trải nghiệm của bạn và giúp cộng đồng khám phá ẩm thực Nhật Bản.',
        heroLabel: 'Ảnh nhà hàng',
        phone: 'Điện thoại',
        hours: 'Giờ mở cửa',
        languages: 'Ngôn ngữ hỗ trợ',
        viewMap: 'Xem bản đồ',
        amenities: 'Tiện ích',
        starsError: 'Vui lòng chọn số sao.',
        titleLabel: 'Tiêu đề đánh giá',
        titlePlaceholder: 'Tóm tắt trải nghiệm của bạn...',
        titleError: 'Vui lòng nhập tiêu đề đánh giá.',
        contentLabel: 'Nội dung',
        contentPlaceholder: 'Viết cảm nhận của bạn về nhà hàng, món ăn, phục vụ...',
        contentLimit: '{{current}} / 500 ký tự',
        contentError: 'Vui lòng nhập nội dung đánh giá.',
        visitInfo: 'Thông tin chuyến đi',
        visitDate: 'Ngày đến',
        visitType: 'Hình thức',
        visitTypes: {
          family: 'Đi cùng gia đình',
          friends: 'Đi cùng bạn bè',
          partner: 'Đi cùng đối tác',
          solo: 'Đi một mình',
        },
        photos: 'Hình ảnh',
        addPhoto: 'Thêm ảnh của bạn',
        photoLimit: 'PNG, JPG tối đa 5 ảnh',
        removePhoto: 'Xóa ảnh',
        submit: 'Gửi đánh giá',
        submitting: 'Đang gửi...',
        success: 'Đánh giá đã được gửi thành công! Đang chuyển hướng...',
        cancel: 'Hủy',
        contact: 'Thông tin liên hệ',
        ratingLabel: 'Trải nghiệm của bạn như thế nào',
        starsSub: 'Nhấn vào sao để đánh giá',
        writeReviewFor: 'Viết đánh giá cho',
      }
    }
  },
  ja: {
    translation: {
      header: {
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
      search: {
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
        hcm: 'ハノイ',
        book: '予約',
        supportJapanese: '日本語対応',
        japaneseStyle: '日本料理',
        sidebarLabel: 'フィルターと一覧',
        locationFilterLabel: 'エリアで絞り込み',
        sortLabel: '検索結果を並び替え',
      },
      detail: {
        bookingButton: '予約',
        loadingApi: 'APIから詳細データを同期中...',
        menuPlaceholder: '料理を検索...',
        menuSearch: '検索',
        noMenu: 'メニューが見つかりません',
        reviews: 'レビュー',
        writeReview: 'レビューを書く',
        contact: '連絡先',
        hours: '営業時間',
        phone: '電話番号',
        languages: '対応 ngôn ngữ',
        viewMap: '地図を見る',
        amenities: '設備・アメニティ',
        promoLabel: '特別プロモーション',
        promoText: '初回予約で15%オフ',
        promoButton: 'プロモコードを取得',
        promoCopied: 'コピーしました: MESHIMAP15',
        bookingTitle: '予約',
        date: '日付',
        time: '時間',
        guests: '人数',
        note: 'メモ・備考',
        cancel: 'キャンセル',
        submitBooking: '予約を確定する',
        submitting: '処理中...',
        successTitle: '予約完了！',
        close: '閉じる',
        home: 'ホームへ戻る',
        dateRequired: '予約日を選択してください。',
        heroLabel: 'レストラン写真',
        notePlaceholder: '特別なリクエスト、アレルギーなど...',
        successMessagePrefix: 'ご予約ありがとうございます：',
        successMessageSuffix: '30分以内にお電話で確認させていただきます。',
        ownerReply: 'オーナーからの返信',
      },
      home: {
        title: 'ベトナムにおける日本料理 of 真髄',
        subtitle: '日越コミュニティのために、本物の味、言語サポート、そして心のこもったサービスを提供するレストランを見つけましょう',
        searchPlaceholder: 'レストラン名、料理、住所を入力...',
        searchButton: '検索',
        chipNearMe: '📍 周辺を検索',
        chipJapanese: '🇯🇵 日本語対応',
        chipHygiene: '✨ 衛生管理徹底',
        featuredTitle: 'おすすめのレストラン',
        featuredSubtitle: '洗練されたグルメ体験のためのトップセレクション',
        seeAll: 'すべて見る',
        loading: '読み込み中...',
        noFeatured: 'おすすめのレストランはありません。',
        supportJapanese: '日本語対応',
        bookNow: '予約する',
        support247: '24/7 サポート',
        supportDesc: '当社のサポートチームがいつでもお手伝いいたします。',
        contactNow: '今すぐ問い合わせ',
        connectCulture: '食事を通じて文化をつなぐ',
        partnerDesc: 'Meshimapのパートナーになり、日越の洗練された美食家コミュニティへアプローチしましょう。',
        registerRestaurant: 'レストランを登録する',
      },
      footer: {
        brandDesc: 'ベトナムと日本のグルメの真髄をつなぐ、トップクラスのレストラン予約＆発見プラットフォーム。',
        discover: '探索',
        restaurants: 'レストラン',
        aboutUs: '会社概要',
        support: 'サポート',
        languageSupport: '言語サポート',
        policy: '利用規約・ポリシー',
        copyright: '© 2024 Meshimap. Connecting Cultures Through Cuisine.',
      },
      bookingSuccess: {
        title: '予約リクエスト送信完了',
        description: 'システムにリクエストが記録されました。レストランからの返信をお待ちください。',
        restaurant: 'レストラン',
        backToRestaurant: 'レストランに戻る',
        guestsFormat: '{{count}}人',
        guestsMoreFormat: '5人以上',
      },
      writeReview: {
        title: 'レビューを書く',
        metaTitle: 'レビューを書く — MESHIMAP',
        metaDesc: 'あなたの体験を共有し、コミュニティの日本食探訪をサポートしましょう。',
        heroLabel: 'レストラン画像',
        phone: '電話番号',
        hours: '営業時間',
        languages: '対応言語',
        viewMap: '地図を見る',
        amenities: '設備・サービス',
        starsError: '評価（星の数）を選択してください。',
        titleLabel: 'タイトル',
        titlePlaceholder: '体験の概要を簡単にまとめてください...',
        titleError: 'タイトルを入力してください。',
        contentLabel: '内容',
        contentPlaceholder: 'レストラン、料理、サービスについて感じたことを書いてください...',
        contentLimit: '{{current}} / 500 文字',
        contentError: 'レビュー内容を入力してください。',
        visitInfo: '訪問情報',
        visitDate: '訪問日',
        visitType: '訪問タイプ',
        visitTypes: {
          family: '家族と',
          friends: '友人と',
          partner: 'ビジネスパートナーと',
          solo: '一人で',
        },
        photos: '写真',
        addPhoto: '写真を追加',
        photoLimit: 'PNG、JPG 最大5枚まで',
        removePhoto: '写真を削除',
        submit: 'レビューを送信',
        submitting: '送信中...',
        success: 'レビューの送信に成功しました！リダイレクト中...',
        cancel: 'キャンセル',
        contact: '連絡先情報',
        ratingLabel: 'ご体験はいかがでしたか？',
        starsSub: '星をクリックして評価してください',
        writeReviewFor: 'レビューを書く：',
      }
    }
  }
};

// Initialize i18next
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'vi',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'meshimap_language',
      }
    });
}

// Backward compatibility helper hook
export function useAppLanguage() {
  const { i18n: i18nInstance } = useTranslation();
  const detectedLang = i18nInstance.language?.split('-')[0] || 'vi';
  const language = (detectedLang === 'ja' ? 'ja' : 'vi') as AppLanguage;

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    i18nInstance.changeLanguage(nextLanguage);
  }, [i18nInstance]);

  const toggleLanguage = useCallback(() => {
    i18nInstance.changeLanguage(language === 'vi' ? 'ja' : 'vi');
  }, [language, i18nInstance]);

  return {
    language,
    setLanguage,
    toggleLanguage,
  };
}

// Backward compatibility translations objects
export const headerCopy = {
  vi: resources.vi.translation.header,
  ja: resources.ja.translation.header,
};

export const searchCopy = {
  vi: resources.vi.translation.search,
  ja: resources.ja.translation.search,
};

export const detailCopy = {
  vi: resources.vi.translation.detail,
  ja: resources.ja.translation.detail,
};

export const homeCopy = {
  vi: resources.vi.translation.home,
  ja: resources.ja.translation.home,
};

export const footerCopy = {
  vi: resources.vi.translation.footer,
  ja: resources.ja.translation.footer,
};

export const bookingSuccessCopy = {
  vi: resources.vi.translation.bookingSuccess,
  ja: resources.ja.translation.bookingSuccess,
};

export const writeReviewCopy = {
  vi: resources.vi.translation.writeReview,
  ja: resources.ja.translation.writeReview,
};

export default i18n;
