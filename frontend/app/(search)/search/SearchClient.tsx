"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import maplibregl from 'maplibre-gl';
import type { ExpressionSpecification } from '@maplibre/maplibre-gl-style-spec';
import { searchCopy, useAppLanguage, type AppLanguage } from '@/config/language';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const MAP_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
const HCM_CENTER: [number, number] = [106.7009, 10.7769];
const SATELLITE_SOURCE_ID = 'esri-world-imagery';
const SATELLITE_LAYER_ID = 'esri-world-imagery-layer';

type MapViewMode = 'map' | 'satellite';
type SearchSort = 'rating' | 'name';

type Restaurant = {
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
  menuItems?: Array<{
    id: number;
    name: string;
    nameJp: string | null;
    price: number | string;
    description: string | null;
    category: string;
  }>;
};

type RestaurantFeatureProperties = {
  id: number;
  name: string;
  nameJp: string;
  rating: number;
  address: string;
  category: string;
  district: string;
  hasJapaneseSupport: boolean;
};

type RestaurantFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: RestaurantFeatureProperties;
  }>;
};

const EMPTY_FEATURE_COLLECTION: RestaurantFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

type CategoryStyle = {
  label: string;
  color: string;
  stroke: string;
  dot: string;
  shortLabel: string;
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  sushi: { label: 'Sushi & Grill', color: '#EA4335', stroke: '#B3261E', dot: '#FFE8E5', shortLabel: 'S' },
  ramen: { label: 'Ramen', color: '#FBBC04', stroke: '#B06000', dot: '#FFF4CC', shortLabel: 'R' },
  kaiseki: { label: 'Kaiseki', color: '#A142F4', stroke: '#681DA8', dot: '#F3E8FF', shortLabel: 'K' },
  izakaya: { label: 'Izakaya', color: '#00A878', stroke: '#006B4F', dot: '#DFF8EF', shortLabel: 'I' },
  bbq: { label: 'Yakiniku', color: '#FF6D01', stroke: '#B74400', dot: '#FFE6D1', shortLabel: 'Y' },
  soba: { label: 'Soba & Udon', color: '#34A853', stroke: '#1E7E34', dot: '#E6F4EA', shortLabel: 'U' },
};

const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  label: 'Nhà hàng Nhật',
  color: '#5F6368',
  stroke: '#3C4043',
  dot: '#F1F3F4',
  shortLabel: 'J',
};

const MAP_VIEW_OPTIONS: Array<{ key: MapViewMode; label: string }> = [
  { key: 'map', label: 'Bản đồ' },
  { key: 'satellite', label: 'Vệ tinh' },
];

const MOCK_ITEMS_BY_CAT: Record<string, Array<{ name: string; nameJp: string; category: string; price: string; description: string }>> = {
  sushi: [
    { name: 'Premium Sashimi Set', nameJp: 'プレミアム刺身セット', category: 'sashimi', price: '450.000đ', description: 'A curated selection of seasonal fish including Otoro, Sake, and Hamachi.' },
    { name: 'Sashimi Deluxe', nameJp: 'デラックス刺身', category: 'sashimi', price: '380.000đ', description: 'Premium cut fish with authentic wasabi and soy sauce.' },
    { name: 'Tempura Set', nameJp: '天ぷらセット', category: 'tempura', price: '280.000đ', description: 'Crispy light-battered shrimp and vegetables with dipping sauce.' },
  ],
  ramen: [
    { name: 'Tonkotsu Ramen', nameJp: '豚骨ラーメン', category: 'ramen', price: '195.000đ', description: 'Rich pork bone broth simmered 18 hours, chashu pork, soft egg.' },
    { name: 'Shoyu Ramen', nameJp: '醤油ラーメン', category: 'ramen', price: '175.000đ', description: 'Aromatic soy-based broth with tender chicken and bamboo shoots.' },
  ],
  kaiseki: [
    { name: 'Kaiseki Course', nameJp: '懐石料理コース', category: 'kaiseki', price: '1.200.000đ', description: 'Traditional multi-course Japanese dinner.' },
  ],
  izakaya: [
    { name: 'Yakitori Platter', nameJp: '焼き鳥盛り合わせ', category: 'izakaya', price: '180.000đ', description: 'Skewered grilled chicken with special tare sauce.' },
  ],
  bbq: [
    { name: 'Kobe Beef Set', nameJp: '神戸牛セット', category: 'bbq', price: '850.000đ', description: 'Premium marbled Kobe beef for grilling.' },
  ],
  soba: [
    { name: 'Tempura Soba', nameJp: '天ぷらそば', category: 'soba', price: '160.000đ', description: 'Buckwheat noodles with crispy tempura.' },
  ],
};

const BASE_FALLBACK_RESTAURANTS = [
  { id: 1001, name: 'Miyabi Japanese Dining', nameJp: 'みやび 日本料理', category: 'sushi', rating: 4.9, address: '123 Lê Thánh Tôn, Quận 1, TP.HCM', district: 'Quận 1', city: 'Hồ Chí Minh', latitude: 10.7769, longitude: 106.7009, description: 'Sushi, sashimi và set nướng Nhật trong không gian yên tĩnh.', phone: '+84 28 3823 4567', imageUrl: '/restaurant-card-13d489.png', hasJapaneseSupport: true },
  { id: 1002, name: 'Sakura Kaiseki', nameJp: 'さくら 懐石料理', category: 'kaiseki', rating: 4.8, address: '45 Võ Văn Tần, Quận 3, TP.HCM', district: 'Quận 3', city: 'Hồ Chí Minh', latitude: 10.7828, longitude: 106.6922, description: 'Kaiseki theo mùa, đặt bàn trước cho phòng riêng.', phone: '+84 28 3910 8899', imageUrl: '/restaurant-card-13d489.png', hasJapaneseSupport: true },
  { id: 1003, name: 'Hanami Ramen House', nameJp: 'はなみ ラーメン', category: 'ramen', rating: 4.7, address: '88 Phan Xích Long, Phú Nhuận, TP.HCM', district: 'Phú Nhuận', city: 'Hồ Chí Minh', latitude: 10.8008, longitude: 106.6855, description: 'Ramen tonkotsu, shoyu và gyoza cho bữa tối nhanh.', phone: '+84 28 3990 1212', imageUrl: null, hasJapaneseSupport: false },
  { id: 1004, name: 'Tokyoto Izakaya', nameJp: '東京都 居酒屋', category: 'izakaya', rating: 4.6, address: '12 Nguyễn Thị Thập, Quận 7, TP.HCM', district: 'Quận 7', city: 'Hồ Chí Minh', latitude: 10.7392, longitude: 106.7043, description: 'Izakaya sau giờ làm với yakitori và món nhắm Nhật.', phone: '+84 28 5412 7788', imageUrl: null, hasJapaneseSupport: true },
  { id: 1005, name: 'Kobe Yakiniku', nameJp: '神戸 焼肉', category: 'bbq', rating: 4.5, address: '22 Nguyễn Cơ Thạch, TP.Thủ Đức, TP.HCM', district: 'TP.Thủ Đức', city: 'Hồ Chí Minh', latitude: 10.7806, longitude: 106.7288, description: 'Yakiniku bàn than, set bò Nhật và rau nướng.', phone: '+84 28 6288 7788', imageUrl: null, hasJapaneseSupport: false },
  { id: 1006, name: 'Fuji Soba House', nameJp: '富士 そば', category: 'soba', rating: 4.4, address: '64 Thành Thái, Quận 10, TP.HCM', district: 'Quận 10', city: 'Hồ Chí Minh', latitude: 10.7717, longitude: 106.6679, description: 'Soba lạnh, udon nóng và tempura giòn nhẹ.', phone: '+84 28 3868 5566', imageUrl: null, hasJapaneseSupport: false },
  { id: 1007, name: 'Sushi Sakura', nameJp: 'さくら 寿司', category: 'sushi', rating: 4.8, address: '18 Mạc Đĩnh Chi, Quận 1, TP.HCM', district: 'Quận 1', city: 'Hồ Chí Minh', latitude: 10.7844, longitude: 106.7021, description: 'Quầy sushi nhỏ, chef phục vụ omakase theo ngày.', phone: '+84 28 3822 7788', imageUrl: '/restaurant-card-13d489.png', hasJapaneseSupport: true },
  { id: 1008, name: 'Ramen Ichiban', nameJp: 'いちばん ラーメン', category: 'ramen', rating: 4.7, address: '31 Cao Thắng, Quận 3, TP.HCM', district: 'Quận 3', city: 'Hồ Chí Minh', latitude: 10.7704, longitude: 106.6824, description: 'Ramen đậm vị, mở cửa tới khuya.', phone: '+84 28 3930 9090', imageUrl: null, hasJapaneseSupport: true },
  { id: 1009, name: 'Ueno Sushi Bar', nameJp: '上野 寿司', category: 'sushi', rating: 4.6, address: '74 Pasteur, Quận 1, TP.HCM', district: 'Quận 1', city: 'Hồ Chí Minh', latitude: 10.7796, longitude: 106.6992, description: 'Sushi bar trung tâm, hợp gặp khách và ăn trưa.', phone: '+84 28 3824 1122', imageUrl: null, hasJapaneseSupport: true },
  { id: 1010, name: 'Nikko Bento', nameJp: '日光 弁当', category: 'soba', rating: 4.3, address: '15 Nguyễn Đình Chiểu, Quận 1, TP.HCM', district: 'Quận 1', city: 'Hồ Chí Minh', latitude: 10.7879, longitude: 106.6984, description: 'Bento trưa, cơm cá saba và set udon.', phone: '+84 28 3911 2020', imageUrl: null, hasJapaneseSupport: false },
  { id: 1011, name: 'Osaka Okonomiyaki', nameJp: '大阪 お好み焼き', category: 'izakaya', rating: 4.5, address: '99 Nguyễn Trãi, Quận 5, TP.HCM', district: 'Quận 5', city: 'Hồ Chí Minh', latitude: 10.7557, longitude: 106.6691, description: 'Okonomiyaki áp chảo, takoyaki và đồ uống Nhật.', phone: '+84 28 3923 7788', imageUrl: null, hasJapaneseSupport: false },
  { id: 1012, name: 'Hokkaido Grill', nameJp: '北海道 グリル', category: 'bbq', rating: 4.6, address: '182 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM', district: 'Phú Nhuận', city: 'Hồ Chí Minh', latitude: 10.7999, longitude: 106.6768, description: 'Grill hải sản và thịt nướng phong cách Hokkaido.', phone: '+84 28 3844 9191', imageUrl: null, hasJapaneseSupport: true },
  { id: 1013, name: 'Kyoto Tea Dining', nameJp: '京都 茶寮', category: 'kaiseki', rating: 4.7, address: '21 Tú Xương, Quận 3, TP.HCM', district: 'Quận 3', city: 'Hồ Chí Minh', latitude: 10.7822, longitude: 106.6875, description: 'Món Nhật nhẹ, trà matcha và set ăn tối theo mùa.', phone: '+84 28 3932 1212', imageUrl: null, hasJapaneseSupport: true },
  { id: 1014, name: 'Shibuya Ramen Lab', nameJp: '渋谷 ラーメン', category: 'ramen', rating: 4.4, address: '40 Lý Tự Trọng, Quận 1, TP.HCM', district: 'Quận 1', city: 'Hồ Chí Minh', latitude: 10.7787, longitude: 106.7039, description: 'Ramen vị hiện đại, topping trứng lòng đào.', phone: '+84 28 3821 4444', imageUrl: null, hasJapaneseSupport: false },
  { id: 1015, name: 'Asakusa Tempura', nameJp: '浅草 天ぷら', category: 'soba', rating: 4.5, address: '7 Hoa Mai, Phú Nhuận, TP.HCM', district: 'Phú Nhuận', city: 'Hồ Chí Minh', latitude: 10.7972, longitude: 106.6895, description: 'Tempura tôm, rau củ và soba thủ công.', phone: '+84 28 3995 1717', imageUrl: null, hasJapaneseSupport: true },
  { id: 1016, name: 'Ginzan Izakaya', nameJp: '銀山 居酒屋', category: 'izakaya', rating: 4.6, address: '58 Tôn Thất Thiệp, Quận 1, TP.HCM', district: 'Quận 1', city: 'Hồ Chí Minh', latitude: 10.7732, longitude: 106.7037, description: 'Không gian nhỏ, nhiều món nướng xiên và sake.', phone: '+84 28 3827 8899', imageUrl: null, hasJapaneseSupport: true },
  { id: 1017, name: 'Nagoya Miso Ramen', nameJp: '名古屋 味噌ラーメン', category: 'ramen', rating: 4.3, address: '11 Trần Não, TP.Thủ Đức, TP.HCM', district: 'TP.Thủ Đức', city: 'Hồ Chí Minh', latitude: 10.7897, longitude: 106.7373, description: 'Miso ramen, karaage và cơm cà ri Nhật.', phone: '+84 28 3740 2323', imageUrl: null, hasJapaneseSupport: false },
  { id: 1018, name: 'Tsukiji Sushi Corner', nameJp: '築地 寿司', category: 'sushi', rating: 4.6, address: '26 Lê Văn Sỹ, Quận 3, TP.HCM', district: 'Quận 3', city: 'Hồ Chí Minh', latitude: 10.7891, longitude: 106.6781, description: 'Sushi casual, sashimi theo ngày và set lunch.', phone: '+84 28 3845 6622', imageUrl: null, hasJapaneseSupport: true },
  { id: 1019, name: 'Akari Yakiniku', nameJp: 'あかり 焼肉', category: 'bbq', rating: 4.4, address: '92 Hoàng Văn Thụ, Tân Bình, TP.HCM', district: 'Tân Bình', city: 'Hồ Chí Minh', latitude: 10.8015, longitude: 106.6637, description: 'Yakiniku gia đình, set thịt nướng và salad Nhật.', phone: '+84 28 3848 9933', imageUrl: null, hasJapaneseSupport: false },
  { id: 1020, name: 'Nara Soba & Udon', nameJp: '奈良 そば うどん', category: 'soba', rating: 4.2, address: '132 Nguyễn Tri Phương, Quận 10, TP.HCM', district: 'Quận 10', city: 'Hồ Chí Minh', latitude: 10.7639, longitude: 106.6687, description: 'Soba, udon và donburi cho bữa trưa nhanh.', phone: '+84 28 3835 2626', imageUrl: null, hasJapaneseSupport: false },
  { id: 1021, name: 'Yokohama Curry', nameJp: '横浜 カレー', category: 'izakaya', rating: 4.3, address: '44 Phậm Viết Chánh, Bình Thạnh, TP.HCM', district: 'Bình Thạnh', city: 'Hồ Chí Minh', latitude: 10.7911, longitude: 106.7105, description: 'Cà ri Nhật, katsu và set cơm tối.', phone: '+84 28 3510 0101', imageUrl: null, hasJapaneseSupport: false },
  { id: 1022, name: 'Kamakura Kaiseki', nameJp: '鎌倉 懐石', category: 'kaiseki', rating: 4.9, address: '3 Nguyễn Ư Dĩ, TP.Thủ Đức, TP.HCM', district: 'TP.Thủ Đức', city: 'Hồ Chí Minh', latitude: 10.8046, longitude: 106.7367, description: 'Kaiseki cao cấp, đặt phòng riêng theo yêu cầu.', phone: '+84 28 7300 8080', imageUrl: '/restaurant-card-13d489.png', hasJapaneseSupport: true },
  { id: 1023, name: 'Marukame Ramen', nameJp: '丸亀 ラーメン', category: 'ramen', rating: 4.4, address: '66 Bạch Đằng, Bình Thạnh, TP.HCM', district: 'Bình Thạnh', city: 'Hồ Chí Minh', latitude: 10.8052, longitude: 106.7136, description: 'Ramen bình dân, topping đa dạng và phục vụ nhanh.', phone: '+84 28 3512 6868', imageUrl: null, hasJapaneseSupport: false },
  { id: 1024, name: 'Daikoku Sushi Lounge', nameJp: '大黒 寿司', category: 'sushi', rating: 4.7, address: '10 Đồng Khởi, Quận 1, TP.HCM', district: 'Quận 1', city: 'Hồ Chí Minh', latitude: 10.7751, longitude: 106.7055, description: 'Sushi lounge gần phố đi bộ, view trung tâm.', phone: '+84 28 3829 2929', imageUrl: '/restaurant-card-13d489.png', hasJapaneseSupport: true },
];

const FALLBACK_RESTAURANTS: Restaurant[] = BASE_FALLBACK_RESTAURANTS.map((r) => {
  const categoryItems = MOCK_ITEMS_BY_CAT[r.category] || [
    { name: 'Matcha Ice Cream', nameJp: '抹茶アイスクリーム', category: 'dessert', price: '65.000đ', description: 'Premium Uji matcha ice cream served with red bean paste.' }
  ];
  return {
    ...r,
    menuItems: categoryItems.map((item, itemIndex) => ({
      id: r.id * 10 + itemIndex,
      name: item.name,
      nameJp: item.nameJp,
      price: item.price,
      description: item.description,
      category: item.category,
    })),
  };
});

const CATEGORIES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'sushi', label: 'Sushi & Grill' },
  { key: 'ramen', label: 'Ramen' },
  { key: 'kaiseki', label: 'Kaiseki' },
  { key: 'izakaya', label: 'Izakaya' },
  { key: 'bbq', label: 'Yakiniku' },
  { key: 'soba', label: 'Soba & Udon' },
];

const LOCATION_OPTIONS = [
  { key: 'all', label: 'Hồ Chí Minh' },
  { key: 'Quận 1', label: 'Quận 1' },
  { key: 'Quận 3', label: 'Quận 3' },
  { key: 'Quận 5', label: 'Quận 5' },
  { key: 'Quận 7', label: 'Quận 7' },
  { key: 'Quận 10', label: 'Quận 10' },
  { key: 'Phú Nhuận', label: 'Phú Nhuận' },
  { key: 'Bình Thạnh', label: 'Bình Thạnh' },
  { key: 'Tân Bình', label: 'Tân Bình' },
  { key: 'TP.Thủ Đức', label: 'TP.Thủ Đức' },
];

const CATEGORY_LABELS = new Map(CATEGORIES.map((category) => [category.key, category.label]));
const LOCATION_LABELS = new Map(LOCATION_OPTIONS.map((location) => [location.key, location.label]));
const MIN_DEMO_RESTAURANTS = 18;

type SearchUrlOptions = {
  q?: string;
  category?: string;
  location?: string;
  sort?: SearchSort;
};

function getSearchSort(value: string | null): SearchSort {
  return value === 'name' ? 'name' : 'rating';
}

function buildSearchUrl({ q, category, location, sort }: SearchUrlOptions) {
  const params = new URLSearchParams();
  const keyword = q?.trim();

  if (keyword) params.set('q', keyword);
  if (category && category !== 'all') params.set('filter', category);
  if (location && location !== 'all') params.set('location', location);
  if (sort && sort !== 'rating') params.set('sort', sort);

  const queryString = params.toString();
  return queryString ? `/search?${queryString}` : '/search';
}

function buildRestaurantsApiUrl({ q, category, location, sort }: SearchUrlOptions) {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  const url = new URL('restaurants', baseUrl);
  const keyword = q?.trim();

  if (keyword) url.searchParams.set('q', keyword);
  if (category && category !== 'all') url.searchParams.set('category', category);
  if (location && location !== 'all') url.searchParams.set('location', location);
  if (sort) url.searchParams.set('sort', sort);

  return url.toString();
}

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE;
}

function getCategoryColorExpression(defaultColor = DEFAULT_CATEGORY_STYLE.color): ExpressionSpecification {
  return [
    'match',
    ['get', 'category'],
    'sushi', CATEGORY_STYLES.sushi.color,
    'ramen', CATEGORY_STYLES.ramen.color,
    'kaiseki', CATEGORY_STYLES.kaiseki.color,
    'izakaya', CATEGORY_STYLES.izakaya.color,
    'bbq', CATEGORY_STYLES.bbq.color,
    'soba', CATEGORY_STYLES.soba.color,
    defaultColor,
  ] as ExpressionSpecification;
}

function getCategoryPinExpression(selectedId: number | null): ExpressionSpecification {
  return [
    'case',
    ['==', ['get', 'id'], selectedId ?? -1],
    'restaurant-pin-active',
    [
      'match',
      ['get', 'category'],
      'sushi', 'restaurant-pin-sushi',
      'ramen', 'restaurant-pin-ramen',
      'kaiseki', 'restaurant-pin-kaiseki',
      'izakaya', 'restaurant-pin-izakaya',
      'bbq', 'restaurant-pin-bbq',
      'soba', 'restaurant-pin-soba',
      'restaurant-pin-other',
    ],
  ] as ExpressionSpecification;
}

function addSatelliteLayer(map: maplibregl.Map, mode: MapViewMode) {
  if (!map.getSource(SATELLITE_SOURCE_ID)) {
    map.addSource(SATELLITE_SOURCE_ID, {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    });
  }

  if (!map.getLayer(SATELLITE_LAYER_ID)) {
    map.addLayer({
      id: SATELLITE_LAYER_ID,
      type: 'raster',
      source: SATELLITE_SOURCE_ID,
      layout: {
        visibility: mode === 'satellite' ? 'visible' : 'none',
      },
      paint: {
        'raster-opacity': 1,
        'raster-saturation': 0.02,
        'raster-contrast': 0.04,
      },
    });
  }
}

function applyMapViewMode(map: maplibregl.Map, mode: MapViewMode) {
  if (!map.getLayer(SATELLITE_LAYER_ID)) return;

  map.setLayoutProperty(
    SATELLITE_LAYER_ID,
    'visibility',
    mode === 'satellite' ? 'visible' : 'none',
  );
}

const StarIcon = () => (
  <svg width="12" height="11" viewBox="0 0 12 11" fill="#EAB308">
    <path d="M6 .5 7.545 4.185 11.5 4.635 8.75 7.27l.795 3.925L6 9.125 2.455 11.195l.795-3.925L.5 4.635l3.955-.45Z" />
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="#8A8A8A" strokeWidth="1.2" />
    <circle cx="7" cy="4.667" r="1.167" stroke="#8A8A8A" strokeWidth="1.2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M8.167 14.333A6.167 6.167 0 1 0 8.167 2a6.167 6.167 0 0 0 0 12.333ZM16 16l-2.792-2.792" stroke="#877369" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6h8M6.5 3l3 3-3 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function normalizeRestaurant(raw: Partial<Restaurant>): Restaurant | null {
  const latitude = Number(raw.latitude);
  const longitude = Number(raw.longitude);

  if (!raw.id || !raw.name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id: Number(raw.id),
    name: String(raw.name),
    nameJp: raw.nameJp ?? null,
    category: raw.category || 'other',
    rating: Number(raw.rating ?? 0),
    address: raw.address || 'Chưa cập nhật địa chỉ',
    district: raw.district ?? null,
    city: raw.city ?? null,
    latitude,
    longitude,
    description: raw.description ?? null,
    phone: raw.phone ?? null,
    imageUrl: raw.imageUrl ?? null,
    hasJapaneseSupport: Boolean(raw.hasJapaneseSupport),
    menuItems: raw.menuItems ? raw.menuItems.map(item => ({
      id: Number(item.id),
      name: String(item.name),
      nameJp: item.nameJp ?? null,
      price: item.price,
      description: item.description ?? null,
      category: item.category || 'other',
    })) : [],
  };
}

function withDemoRestaurants(restaurants: Restaurant[]) {
  if (restaurants.length >= MIN_DEMO_RESTAURANTS) {
    return restaurants;
  }

  const existingNames = new Set(restaurants.map((restaurant) => restaurant.name.toLowerCase()));
  const extras = FALLBACK_RESTAURANTS
    .filter((restaurant) => !existingNames.has(restaurant.name.toLowerCase()))
    .slice(0, MIN_DEMO_RESTAURANTS - restaurants.length);

  return [...restaurants, ...extras];
}

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createPinSvg(fill: string, stroke: string, dot: string, label = '') {
  const safeLabel = label.replace(/[<>&]/g, '');

  return `
    <svg width="72" height="92" viewBox="0 0 72 92" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="shadow" x="7" y="2" width="58" height="78" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#3C2418" flood-opacity="0.28"/>
      </filter>
      <ellipse cx="36" cy="82" rx="12" ry="4" fill="#3C2418" opacity="0.16"/>
      <path filter="url(#shadow)" d="M36 6C22.2 6 11 17.2 11 31C11 49.8 36 76 36 76C36 76 61 49.8 61 31C61 17.2 49.8 6 36 6Z" fill="${fill}" stroke="${stroke}" stroke-width="4"/>
      <circle cx="36" cy="31" r="12" fill="${dot}" stroke="white" stroke-width="4"/>
      ${safeLabel ? `<text x="36" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="${stroke}">${safeLabel}</text>` : ''}
    </svg>
  `;
}

async function loadMapImage(map: maplibregl.Map, id: string, svg: string) {
  if (map.hasImage(id)) return;

  const image = await map.loadImage(svgToDataUrl(svg));
  if (!map.hasImage(id)) {
    map.addImage(id, image.data, { pixelRatio: 2 });
  }
}

function createPopupNode(restaurant: Restaurant, copy: typeof searchCopy[AppLanguage]) {
  const node = document.createElement('div');
  const categoryStyle = getCategoryStyle(restaurant.category);
  node.className = 'map-popup-card';
  node.style.setProperty('--category-color', categoryStyle.color);

  if (restaurant.imageUrl) {
    const image = document.createElement('img');
    image.className = 'map-popup-image';
    image.src = restaurant.imageUrl;
    image.alt = restaurant.name;
    node.appendChild(image);
  }

  const title = document.createElement('div');
  title.className = 'map-popup-title';
  title.textContent = restaurant.name;
  node.appendChild(title);

  if (restaurant.nameJp) {
    const jpName = document.createElement('div');
    jpName.className = 'map-popup-subtitle';
    jpName.textContent = restaurant.nameJp;
    node.appendChild(jpName);
  }

  const meta = document.createElement('div');
  meta.className = 'map-popup-meta';
  meta.textContent = `★ ${restaurant.rating.toFixed(1)} · ${restaurant.district || restaurant.city || 'TP.HCM'}`;
  node.appendChild(meta);

  const address = document.createElement('div');
  address.className = 'map-popup-address';
  address.textContent = restaurant.address;
  node.appendChild(address);

  const tagRow = document.createElement('div');
  tagRow.className = 'map-popup-tags';

  const categoryTag = document.createElement('span');
  categoryTag.className = 'map-popup-tag map-popup-tag--category';
  categoryTag.textContent = CATEGORY_LABELS.get(restaurant.category) || restaurant.category;
  tagRow.appendChild(categoryTag);

  if (restaurant.hasJapaneseSupport) {
    const supportTag = document.createElement('span');
    supportTag.className = 'map-popup-tag';
    supportTag.textContent = copy.supportJapanese;
    tagRow.appendChild(supportTag);
  }

  node.appendChild(tagRow);

  const link = document.createElement('a');
  link.className = 'map-popup-link';
  link.href = `/restaurant/${restaurant.id}`;
  link.textContent = copy.book;
  node.appendChild(link);

  return node;
}

function RestaurantCard({
  restaurant,
  isActive,
  onSelect,
  onHover,
  cardRef,
  copy,
}: {
  restaurant: Restaurant;
  isActive: boolean;
  onSelect: (restaurant: Restaurant) => void;
  onHover: (restaurant: Restaurant | null) => void;
  cardRef: (node: HTMLDivElement | null) => void;
  copy: typeof searchCopy[AppLanguage];
}) {
  const categoryLabel = CATEGORY_LABELS.get(restaurant.category) || restaurant.category;
  const categoryStyle = getCategoryStyle(restaurant.category);
  const supportLabel = restaurant.hasJapaneseSupport ? copy.supportJapanese : copy.japaneseStyle;

  return (
    <div
      ref={cardRef}
      className={`result-card${isActive ? ' result-card--active' : ''}`}
      data-category={restaurant.category}
      id={`result-card-${restaurant.id}`}
      onClick={() => onSelect(restaurant)}
      onMouseEnter={() => onHover(restaurant)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(restaurant)}
      onBlur={() => onHover(null)}
      style={{ cursor: 'pointer', '--category-color': categoryStyle.color } as React.CSSProperties}
    >
      <div className="result-card__accent" />
      <div className="result-card__image-wrap">
        {restaurant.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={restaurant.imageUrl} alt={restaurant.name} className="result-card__image" />
        ) : (
          <div className="result-card__image-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.4">
              <rect x="4" y="10" width="40" height="28" rx="4" stroke="#6C2F00" strokeWidth="2" />
              <circle cx="16" cy="22" r="4" stroke="#6C2F00" strokeWidth="2" />
              <path d="M4 32l8-8 6 6 8-10 18 14" stroke="#6C2F00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <div className="result-card__rating-badge">
          <StarIcon /> {restaurant.rating.toFixed(1)}
        </div>
      </div>
      <div className="result-card__body">
        <h3 className="result-card__title">{restaurant.name}</h3>
        {restaurant.nameJp && (
          <p style={{ fontSize: '12px', color: 'var(--clr-muted)', margin: '2px 0 6px' }}>
            {restaurant.nameJp}
          </p>
        )}
        <div className="result-card__tags">
          <span className="result-card__tag result-card__tag--category">
            <span className="result-card__tag-dot" />
            {categoryLabel}
          </span>
          <span className="result-card__tag">{supportLabel}</span>
        </div>
      </div>
      <div className="result-card__footer">
        <span className="result-card__location">
          <PinIcon /> {restaurant.district || restaurant.city || restaurant.address}
        </span>
        <Link
          href={`/restaurant/${restaurant.id}`}
          className="result-card__book-btn"
          onClick={(event) => event.stopPropagation()}
        >
          {copy.book} <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const activeCategory = searchParams.get('filter') || 'all';
  const activeLocation = searchParams.get('location') || 'all';
  const sortBy = getSearchSort(searchParams.get('sort'));
  const { language } = useAppLanguage();
  const copy = searchCopy[language];
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const filteredResultsRef = useRef<Restaurant[]>([]);
  const focusRestaurantRef = useRef<(restaurant: Restaurant) => void>(() => { });
  const mapViewModeRef = useRef<MapViewMode>('map');

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState<number | null>(null);
  const [hoveredRestaurantId, setHoveredRestaurantId] = useState<number | null>(null);
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>('map');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const selectedMarkerId = hoveredRestaurantId ?? activeRestaurantId;

  useEffect(() => {
    let isMounted = true;

    async function loadRestaurants() {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch(buildRestaurantsApiUrl({
          q: query,
          category: activeCategory,
          location: activeLocation,
          sort: sortBy,
        }), {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`API trả về ${response.status}`);
        }

        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map(normalizeRestaurant).filter((item): item is Restaurant => Boolean(item))
          : [];

        if (isMounted) {
          setRestaurants(withDemoRestaurants(normalized));
        }
      } catch (error) {
        if (isMounted) {
          setRestaurants(FALLBACK_RESTAURANTS);
          setLoadError(
            error instanceof Error
              ? `Không tải được API restaurants (${error.message}). Đang dùng dữ liệu demo.`
              : 'Không tải được API restaurants. Đang dùng dữ liệu demo.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRestaurants();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, activeLocation, query, sortBy]);

  const filteredResults = useMemo(() => {
    let results = [...restaurants];

    if (activeCategory !== 'all') {
      results = results.filter((restaurant) => restaurant.category === activeCategory);
    }

    if (activeLocation !== 'all') {
      const normalizedLocation = activeLocation.toLowerCase();
      results = results.filter((restaurant) =>
        restaurant.address.toLowerCase().includes(normalizedLocation) ||
        (restaurant.district || '').toLowerCase().includes(normalizedLocation) ||
        (restaurant.city || '').toLowerCase().includes(normalizedLocation)
      );
    }

    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();
      results = results.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(normalizedQuery) ||
        (restaurant.nameJp || '').toLowerCase().includes(normalizedQuery) ||
        restaurant.address.toLowerCase().includes(normalizedQuery) ||
        (restaurant.district || '').toLowerCase().includes(normalizedQuery) ||
        (restaurant.city || '').toLowerCase().includes(normalizedQuery) ||
        restaurant.category.toLowerCase().includes(normalizedQuery) ||
        (restaurant.menuItems || []).some((item) =>
          item.name.toLowerCase().includes(normalizedQuery) ||
          (item.nameJp || '').toLowerCase().includes(normalizedQuery) ||
          (item.description || '').toLowerCase().includes(normalizedQuery)
        )
      );
    }

    results.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.name.localeCompare(b.name, 'vi');
    });

    return results;
  }, [restaurants, query, activeCategory, activeLocation, sortBy]);

  useEffect(() => {
    filteredResultsRef.current = filteredResults;
  }, [filteredResults]);

  const activeRestaurant = useMemo(
    () => filteredResults.find((restaurant) => restaurant.id === activeRestaurantId) || null,
    [filteredResults, activeRestaurantId],
  );
  const activeCategoryStyle = getCategoryStyle(activeRestaurant?.category || activeCategory);
  const activeLocationLabel = activeLocation === 'all'
    ? copy.hcm
    : LOCATION_LABELS.get(activeLocation) || activeLocation;

  const categoryLegend = useMemo(() => CATEGORIES
    .filter((category) => category.key !== 'all')
    .map((category) => ({
      ...category,
      count: filteredResults.filter((restaurant) => restaurant.category === category.key).length,
      style: getCategoryStyle(category.key),
    }))
    .filter((category) => category.count > 0), [filteredResults]);

  const featureCollection: RestaurantFeatureCollection = useMemo(() => ({
    type: 'FeatureCollection',
    features: filteredResults.map((restaurant) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [restaurant.longitude, restaurant.latitude],
      },
      properties: {
        id: restaurant.id,
        name: restaurant.name,
        nameJp: restaurant.nameJp || '',
        rating: restaurant.rating,
        address: restaurant.address,
        category: restaurant.category,
        district: restaurant.district || restaurant.city || 'TP.HCM',
        hasJapaneseSupport: restaurant.hasJapaneseSupport,
      },
    })),
  }), [filteredResults]);

  const showRestaurantPopup = useCallback((restaurant: Restaurant) => {
    if (!mapRef.current) return;

    popupRef.current?.remove();
    popupRef.current = new maplibregl.Popup({
      offset: 18,
      closeButton: false,
      className: 'restaurant-map-popup',
    })
      .setLngLat([restaurant.longitude, restaurant.latitude])
      .setDOMContent(createPopupNode(restaurant, copy))
      .addTo(mapRef.current);
  }, [copy]);

  const focusRestaurant = useCallback((restaurant: Restaurant) => {
    if (!mapRef.current) return;

    setActiveRestaurantId(restaurant.id);
    mapRef.current.flyTo({
      center: [restaurant.longitude, restaurant.latitude],
      zoom: 16,
      speed: 0.9,
      curve: 1.3,
      essential: true,
    });

    window.setTimeout(() => showRestaurantPopup(restaurant), 650);
  }, [showRestaurantPopup]);

  useEffect(() => {
    focusRestaurantRef.current = focusRestaurant;
  }, [focusRestaurant]);

  useEffect(() => {
    mapViewModeRef.current = mapViewMode;
    if (mapReady && mapRef.current) {
      applyMapViewMode(mapRef.current, mapViewMode);
    }
  }, [mapReady, mapViewMode]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_URL,
      center: HCM_CENTER,
      zoom: 11.5,
      pitch: 0,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      addSatelliteLayer(map, mapViewModeRef.current);

      const addRestaurantLayers = (usePinIcons: boolean) => {
        map.addSource('restaurants', {
          type: 'geojson',
          data: EMPTY_FEATURE_COLLECTION,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 52,
        });

        map.addLayer({
          id: 'restaurant-clusters',
          type: 'circle',
          source: 'restaurants',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': ['step', ['get', 'point_count'], '#34A853', 8, '#FBBC04', 18, '#EA4335'],
            'circle-radius': ['step', ['get', 'point_count'], 23, 8, 30, 18, 38],
            'circle-opacity': 0.92,
            'circle-stroke-width': 4,
            'circle-stroke-color': '#ffffff',
          },
        });

        map.addLayer({
          id: 'restaurant-cluster-count',
          type: 'symbol',
          source: 'restaurants',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['Noto Sans Bold'],
            'text-size': 13,
          },
          paint: {
            'text-color': '#ffffff',
          },
        });

        map.addLayer({
          id: 'restaurant-halo',
          type: 'circle',
          source: 'restaurants',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'case',
              ['==', ['get', 'id'], -1],
              '#1A73E8',
              getCategoryColorExpression(),
            ],
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 13, 14, 24, 17, 36],
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.08, 14, 0.15, 17, 0.2],
            'circle-blur': 0.35,
          },
        });

        if (usePinIcons) {
          map.addLayer({
            id: 'restaurant-points',
            type: 'symbol',
            source: 'restaurants',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'icon-image': getCategoryPinExpression(null),
              'icon-size': ['case', ['==', ['get', 'id'], -1], 1.02, 0.82],
              'icon-anchor': 'bottom',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'text-field': ['get', 'name'],
              'text-font': ['Noto Sans Regular'],
              'text-size': 12,
              'text-offset': [0, 0.85],
              'text-anchor': 'top',
              'text-optional': true,
            },
            paint: {
              'text-color': '#3C4043',
              'text-halo-color': '#ffffff',
              'text-halo-width': 1.4,
            },
          });
        } else {
          map.addLayer({
            id: 'restaurant-points',
            type: 'circle',
            source: 'restaurants',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': ['case', ['==', ['get', 'id'], -1], '#1A73E8', getCategoryColorExpression()],
              'circle-radius': ['case', ['==', ['get', 'id'], -1], 12, 8],
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            },
          });
        }

        map.on('click', 'restaurant-clusters', (event: maplibregl.MapLayerMouseEvent) => {
          const feature = event.features?.[0];
          if (!feature || feature.geometry.type !== 'Point') return;

          map.easeTo({
            center: feature.geometry.coordinates as [number, number],
            zoom: Math.min(map.getZoom() + 2.2, 15),
            duration: 700,
          });
        });

        map.on('click', 'restaurant-points', (event: maplibregl.MapLayerMouseEvent) => {
          const feature = event.features?.[0];
          const id = Number(feature?.properties?.id);
          const restaurant = filteredResultsRef.current.find((item) => item.id === id);

          if (restaurant) {
            focusRestaurantRef.current(restaurant);
            cardRefs.current[restaurant.id]?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        });

        map.on('mouseenter', 'restaurant-clusters', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'restaurant-clusters', () => {
          map.getCanvas().style.cursor = '';
        });

        map.on('mouseenter', 'restaurant-points', (event: maplibregl.MapLayerMouseEvent) => {
          map.getCanvas().style.cursor = 'pointer';
          const id = Number(event.features?.[0]?.properties?.id);
          if (Number.isFinite(id)) {
            setHoveredRestaurantId(id);
          }
        });

        map.on('mouseleave', 'restaurant-points', () => {
          map.getCanvas().style.cursor = '';
          setHoveredRestaurantId(null);
        });

        setMapReady(true);
      };

      Promise.all([
        ...Object.entries(CATEGORY_STYLES).map(([category, style]) =>
          loadMapImage(
            map,
            `restaurant-pin-${category}`,
            createPinSvg(style.color, style.stroke, style.dot, style.shortLabel),
          ),
        ),
        loadMapImage(
          map,
          'restaurant-pin-other',
          createPinSvg(
            DEFAULT_CATEGORY_STYLE.color,
            DEFAULT_CATEGORY_STYLE.stroke,
            DEFAULT_CATEGORY_STYLE.dot,
            DEFAULT_CATEGORY_STYLE.shortLabel,
          ),
        ),
        loadMapImage(
          map,
          'restaurant-pin-active',
          createPinSvg('#1A73E8', '#0B57D0', '#E8F0FE'),
        ),
      ])
        .then(() => addRestaurantLayers(true))
        .catch(() => addRestaurantLayers(false));
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const source = mapRef.current.getSource('restaurants') as maplibregl.GeoJSONSource | undefined;
    source?.setData(featureCollection as Parameters<maplibregl.GeoJSONSource['setData']>[0]);

    const restaurantPointsLayer = mapRef.current.getLayer('restaurant-points');

    if (restaurantPointsLayer?.type === 'symbol') {
      mapRef.current.setLayoutProperty('restaurant-points', 'icon-image', getCategoryPinExpression(selectedMarkerId));
      mapRef.current.setLayoutProperty('restaurant-points', 'icon-size', [
        'case',
        ['==', ['get', 'id'], selectedMarkerId ?? -1],
        1.02,
        0.82,
      ]);
    } else if (restaurantPointsLayer?.type === 'circle') {
      mapRef.current.setPaintProperty('restaurant-points', 'circle-color', [
        'case',
        ['==', ['get', 'id'], selectedMarkerId ?? -1],
        '#1A73E8',
        getCategoryColorExpression(),
      ]);
      mapRef.current.setPaintProperty('restaurant-points', 'circle-radius', [
        'case',
        ['==', ['get', 'id'], selectedMarkerId ?? -1],
        12,
        8,
      ]);
    }

    if (mapRef.current.getLayer('restaurant-halo')) {
      mapRef.current.setPaintProperty('restaurant-halo', 'circle-color', [
        'case',
        ['==', ['get', 'id'], selectedMarkerId ?? -1],
        '#1A73E8',
        getCategoryColorExpression(),
      ]);
      mapRef.current.setPaintProperty('restaurant-halo', 'circle-radius', [
        'interpolate',
        ['linear'],
        ['zoom'],
        10,
        ['case', ['==', ['get', 'id'], selectedMarkerId ?? -1], 22, 13],
        14,
        ['case', ['==', ['get', 'id'], selectedMarkerId ?? -1], 34, 24],
        17,
        ['case', ['==', ['get', 'id'], selectedMarkerId ?? -1], 46, 36],
      ]);
      mapRef.current.setPaintProperty('restaurant-halo', 'circle-opacity', [
        'interpolate',
        ['linear'],
        ['zoom'],
        10,
        ['case', ['==', ['get', 'id'], selectedMarkerId ?? -1], 0.16, 0.08],
        14,
        ['case', ['==', ['get', 'id'], selectedMarkerId ?? -1], 0.22, 0.15],
        17,
        ['case', ['==', ['get', 'id'], selectedMarkerId ?? -1], 0.26, 0.2],
      ]);
    }
  }, [featureCollection, mapReady, selectedMarkerId]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || activeRestaurant || filteredResults.length === 0) return;

    if (filteredResults.length === 1) {
      const restaurant = filteredResults[0];
      mapRef.current.easeTo({
        center: [restaurant.longitude, restaurant.latitude],
        zoom: 14,
        duration: 700,
      });
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    filteredResults.forEach((restaurant) => {
      bounds.extend([restaurant.longitude, restaurant.latitude]);
    });

    mapRef.current.fitBounds(bounds, {
      padding: { top: 90, right: 80, bottom: 80, left: 80 },
      maxZoom: 13,
      duration: 800,
    });
  }, [activeRestaurant, filteredResults, mapReady]);

  const handleSearch = () => {
    router.push(buildSearchUrl({
      q: inputRef.current?.value ?? query,
      category: activeCategory,
      location: activeLocation,
      sort: sortBy,
    }));
    setActiveRestaurantId(null);
    setHoveredRestaurantId(null);
    popupRef.current?.remove();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSearch();
  };

  const handleCategoryFilter = (category: string) => {
    setActiveRestaurantId(null);
    setHoveredRestaurantId(null);
    popupRef.current?.remove();

    router.push(buildSearchUrl({
      q: query,
      category,
      location: activeLocation,
      sort: sortBy,
    }));
  };

  const handleLocationFilter = (location: string) => {
    setActiveRestaurantId(null);
    setHoveredRestaurantId(null);
    popupRef.current?.remove();

    router.push(buildSearchUrl({
      q: query,
      category: activeCategory,
      location,
      sort: sortBy,
    }));
  };

  const handleSortChange = (sort: SearchSort) => {
    setActiveRestaurantId(null);
    setHoveredRestaurantId(null);
    popupRef.current?.remove();

    router.push(buildSearchUrl({
      q: query,
      category: activeCategory,
      location: activeLocation,
      sort,
    }));
  };

  return (
    <main className="search-layout" id="search-main">
      <aside className="sidebar" role="complementary" aria-label={copy.sidebarLabel}>
        <div className="sidebar__filter">
          <div className="sidebar-search">
            <SearchIcon />
            <input
              type="text"
              id="search-input"
              key={query}
              ref={inputRef}
              className="sidebar-search__input"
              placeholder={copy.searchPlaceholder}
              defaultValue={query}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button
              className="sidebar-search__btn"
              id="btn-sidebar-search"
              onClick={handleSearch}
            >
              {copy.searchButton}
            </button>
          </div>

          <div className="filter-chips">
            {CATEGORIES.map((category) => {
              const categoryStyle = category.key === 'all'
                ? { color: '#6C2F00' }
                : getCategoryStyle(category.key);

              return (
                <button
                  key={category.key}
                  className={`filter-chip${activeCategory === category.key ? ' is-active' : ''}`}
                  id={`chip-${category.key}`}
                  onClick={() => handleCategoryFilter(category.key)}
                  style={{ '--category-color': categoryStyle.color } as React.CSSProperties}
                >
                  <span className="filter-chip__dot" />
                  {category.key === 'all' ? copy.all : category.label}
                </button>
              );
            })}
          </div>

          <div className="location-filter">
            <span className="location-filter__label">{copy.area}</span>
            <select
              value={activeLocation}
              onChange={(event) => handleLocationFilter(event.target.value)}
              className="location-filter__select"
              aria-label={copy.locationFilterLabel}
            >
              {LOCATION_OPTIONS.map((location) => (
                <option key={location.key} value={location.key}>
                  {location.key === 'all' ? copy.hcm : location.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sidebar__results-header">
          <span className="sidebar__results-title">{copy.results}</span>
          <div className="sidebar__results-tools">
            <span className="sidebar__results-count">
              <span data-results-count>{filteredResults.length}</span> {copy.resultsAt} {activeLocationLabel}
            </span>
            <select
              value={sortBy}
              onChange={(event) => handleSortChange(event.target.value as SearchSort)}
              className="sidebar-sort"
              aria-label={copy.sortLabel}
            >
              <option value="rating">{copy.sortRating}</option>
              <option value="name">{copy.sortName}</option>
            </select>
          </div>
        </div>

        {loadError && (
          <div className="map-status map-status--warning">
            {loadError}
          </div>
        )}

        <div className="sidebar__list" id="results-list">
          {isLoading ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--clr-muted)' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--clr-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600 }}>{copy.loadingRestaurants}</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--clr-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>{copy.noResultsTitle}</p>
              <p style={{ fontSize: '13px' }}>{copy.noResultsHint}</p>
            </div>
          ) : (
            filteredResults.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isActive={activeRestaurantId === restaurant.id}
                onSelect={focusRestaurant}
                onHover={(item) => setHoveredRestaurantId(item?.id ?? null)}
                cardRef={(node) => {
                  cardRefs.current[restaurant.id] = node;
                }}
                copy={copy}
              />
            ))
          )}
        </div>
      </aside>

      <section
        className={`map-section map-section--interactive${mapViewMode === 'satellite' ? ' map-section--satellite' : ''}`}
        aria-label={copy.mapLabel}
        id="map-section"
      >
        <div ref={mapContainerRef} className="map-canvas" />
        <div className="map-color-wash" aria-hidden="true" />

        <div className="map-floating-count" id="btn-map-results">
          <SearchIcon />
          <strong data-results-count>{filteredResults.length}</strong>
          <span>{copy.results}</span>
        </div>

        <div className="map-view-toggle" role="group" aria-label={copy.mapTypeLabel}>
          {MAP_VIEW_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`map-view-toggle__btn${mapViewMode === option.key ? ' is-active' : ''}`}
              onClick={() => setMapViewMode(option.key)}
              aria-pressed={mapViewMode === option.key}
            >
              {option.key === 'map' ? copy.map : copy.satellite}
            </button>
          ))}
        </div>

        {categoryLegend.length > 0 && (
          <div className="map-category-legend" aria-label={copy.legendLabel}>
            {categoryLegend.map((category) => (
              <button
                key={category.key}
                className={`map-category-pill${activeCategory === category.key ? ' is-active' : ''}`}
                onClick={() => handleCategoryFilter(category.key)}
                style={{ '--category-color': category.style.color } as React.CSSProperties}
              >
                <span className="map-category-pill__dot" />
                <span>{category.label}</span>
                <strong>{category.count}</strong>
              </button>
            ))}
          </div>
        )}

        {activeRestaurant && (
          <div
            className="map-floating-detail"
            style={{ '--category-color': activeCategoryStyle.color } as React.CSSProperties}
          >
            <div>
              <div className="map-floating-detail__eyebrow">{copy.selected}</div>
              <h2>{activeRestaurant.name}</h2>
              <p>{activeRestaurant.address}</p>
            </div>
            <Link href={`/restaurant/${activeRestaurant.id}`} className="btn btn--primary">
              {copy.bookNow} <ArrowIcon />
            </Link>
          </div>
        )}

        {!mapReady && (
          <div className="map-loading-overlay">
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(108,47,0,0.18)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span>{copy.loadingMap}</span>
          </div>
        )}
      </section>
    </main>
  );
}
