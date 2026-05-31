"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import maplibregl, { type ExpressionSpecification } from 'maplibre-gl';
import { searchCopy, useAppLanguage, type AppLanguage } from '@/config/i18n';
import { getBeautifulImage } from '@/utils/image';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const MAP_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';
const HANOI_CENTER: [number, number] = [105.8544, 21.0285];
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
  openingTime?: string | null;
  closingTime?: string | null;
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
  sushi_sashimi: { label: 'Sushi & Sashimi', color: '#EA4335', stroke: '#B3261E', dot: '#FFE8E5', shortLabel: 'S' },
  ramen_udon_soba: { label: 'Ramen & Udon & Soba', color: '#FBBC04', stroke: '#B06000', dot: '#FFF4CC', shortLabel: 'R' },
  yakiniku_bbq: { label: 'Yakiniku (BBQ)', color: '#FF6D01', stroke: '#B74400', dot: '#FFE6D1', shortLabel: 'Y' },
  izakaya: { label: 'Izakaya', color: '#00A878', stroke: '#006B4F', dot: '#DFF8EF', shortLabel: 'I' },
  omakase_kaiseki: { label: 'Omakase & Kaiseki', color: '#A142F4', stroke: '#681DA8', dot: '#F3E8FF', shortLabel: 'K' },
};

const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  label: 'Nhà hàng Nhật',
  color: '#5F6368',
  stroke: '#3C4043',
  dot: '#F1F3F4',
  shortLabel: 'J',
};

function getNormalizedCategoryKey(category: string): string {
  const cat = category ? category.toLowerCase() : '';
  if (cat.includes('sushi') || cat.includes('sashimi') || cat.includes('seafood')) return 'sushi_sashimi';
  if (cat.includes('ramen') || cat.includes('udon') || cat.includes('soba') || cat.includes('noodle')) return 'ramen_udon_soba';
  if (cat.includes('bbq') || cat.includes('yakiniku')) return 'yakiniku_bbq';
  if (cat.includes('izakaya')) return 'izakaya';
  if (cat.includes('omakase') || cat.includes('kaiseki')) return 'omakase_kaiseki';
  return 'other';
}

const MAP_VIEW_OPTIONS: Array<{ key: MapViewMode; label: string }> = [
  { key: 'map', label: 'Bản đồ' },
  { key: 'satellite', label: 'Vệ tinh' },
];

const CATEGORIES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'sushi_sashimi', label: 'Sushi & Sashimi' },
  { key: 'ramen_udon_soba', label: 'Ramen & Udon & Soba' },
  { key: 'yakiniku_bbq', label: 'Yakiniku (BBQ)' },
  { key: 'izakaya', label: 'Izakaya' },
  { key: 'omakase_kaiseki', label: 'Omakase & Kaiseki' },
];

const LOCATION_OPTIONS = [
  { key: 'all', label: 'Hà Nội' },
  { key: 'Ba Đình', label: 'Quận Ba Đình' },
  { key: 'Hoàn Kiếm', label: 'Quận Hoàn Kiếm' },
  { key: 'Tây Hồ', label: 'Quận Tây Hồ' },
  { key: 'Cầu Giấy', label: 'Quận Cầu Giấy' },
  { key: 'Đống Đa', label: 'Quận Đống Đa' },
  { key: 'Hai Bà Trưng', label: 'Quận Hai Bà Trưng' },
  { key: 'Thanh Xuân', label: 'Quận Thanh Xuân' },
  { key: 'Hoàng Mai', label: 'Quận Hoàng Mai' },
  { key: 'Hà Đông', label: 'Quận Hà Đông' },
];
const CATEGORY_LABELS = new Map(CATEGORIES.map((category) => [category.key, category.label]));
const LOCATION_LABELS = new Map(LOCATION_OPTIONS.map((location) => [location.key, location.label]));

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
  const norm = getNormalizedCategoryKey(category);
  return CATEGORY_STYLES[norm] || DEFAULT_CATEGORY_STYLE;
}

function getCategoryColorExpression(defaultColor = DEFAULT_CATEGORY_STYLE.color): ExpressionSpecification {
  return [
    'match',
    ['get', 'category'],
    'sushi_sashimi', CATEGORY_STYLES.sushi_sashimi.color,
    'ramen_udon_soba', CATEGORY_STYLES.ramen_udon_soba.color,
    'yakiniku_bbq', CATEGORY_STYLES.yakiniku_bbq.color,
    'izakaya', CATEGORY_STYLES.izakaya.color,
    'omakase_kaiseki', CATEGORY_STYLES.omakase_kaiseki.color,
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
      'sushi_sashimi', 'restaurant-pin-sushi',
      'ramen_udon_soba', 'restaurant-pin-ramen',
      'yakiniku_bbq', 'restaurant-pin-bbq',
      'izakaya', 'restaurant-pin-izakaya',
      'omakase_kaiseki', 'restaurant-pin-kaiseki',
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
    openingTime: raw.openingTime ?? null,
    closingTime: raw.closingTime ?? null,
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

  const image = document.createElement('img');
  image.className = 'map-popup-image';
  image.src = getBeautifulImage(restaurant.imageUrl, restaurant.name);
  image.alt = restaurant.name;
  node.appendChild(image);

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
  meta.textContent = `★ ${restaurant.rating.toFixed(1)} · ${restaurant.district || restaurant.city || 'Hà Nội'}`;
  node.appendChild(meta);

  const address = document.createElement('div');
  address.className = 'map-popup-address';
  address.textContent = restaurant.address;
  node.appendChild(address);

  if (restaurant.openingTime && restaurant.closingTime) {
    const hoursRow = document.createElement('div');
    hoursRow.className = 'map-popup-address';
    hoursRow.style.marginTop = '4px';
    hoursRow.style.color = 'var(--clr-muted)';
    hoursRow.style.fontSize = '11px';
    hoursRow.style.display = 'flex';
    hoursRow.style.alignItems = 'center';
    hoursRow.style.gap = '4px';
    hoursRow.textContent = `🕐 ${restaurant.openingTime} - ${restaurant.closingTime}`;
    node.appendChild(hoursRow);
  }

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

  return node;
}

function isRestaurantOpen(openingTime: string | null | undefined, closingTime: string | null | undefined): boolean {
  if (!openingTime || !closingTime) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const parseTimeToMinutes = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  };

  const openTimeMinutes = parseTimeToMinutes(openingTime);
  const closeTimeMinutes = parseTimeToMinutes(closingTime);

  if (closeTimeMinutes > openTimeMinutes) {
    return currentTimeInMinutes >= openTimeMinutes && currentTimeInMinutes <= closeTimeMinutes;
  } else {
    return currentTimeInMinutes >= openTimeMinutes || currentTimeInMinutes <= closeTimeMinutes;
  }
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
  const { language } = useAppLanguage();

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getBeautifulImage(restaurant.imageUrl, restaurant.name)} alt={restaurant.name} className="result-card__image" />
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
          {restaurant.openingTime && restaurant.closingTime && (() => {
            const isOpen = isRestaurantOpen(restaurant.openingTime, restaurant.closingTime);
            const text = isOpen
              ? (language === 'ja' ? '営業中' : 'Đang mở cửa')
              : (language === 'ja' ? '準備中' : 'Đã đóng cửa');
            const color = isOpen ? '#2f7d32' : '#c62828';
            const bg = isOpen ? '#f0faf0' : '#ffebee';
            return (
              <span className="result-card__tag" style={{ color, background: bg, borderColor: color + '20', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                {text}
              </span>
            );
          })()}
        </div>
        {restaurant.openingTime && restaurant.closingTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--clr-muted)', marginTop: '8px' }}>
            <span>🕐</span>
            <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
          </div>
        )}
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

  // Draggable Bottom Sheet states
  const [sheetState, setSheetState] = useState<'collapsed' | 'expanded'>('collapsed');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, clientY: number) => {
    if (window.innerWidth > 900) return;

    // Prevent dragging when clicking on interactive elements like buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select')) {
      return;
    }

    setIsDragging(true);
    setStartY(clientY);
    setHasMoved(false);

    // Initialize currentTranslateY to match the starting visual position, preventing layout jumps
    if (sheetRef.current) {
      const rect = sheetRef.current.getBoundingClientRect();
      const sheetHeight = rect.height;
      const collapsedTranslate = Math.max(0, sheetHeight - 220);
      setCurrentTranslateY(sheetState === 'collapsed' ? collapsedTranslate : 0);
    }
  };

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging || !sheetRef.current) return;
    const diffY = clientY - startY;
    if (Math.abs(diffY) > 5) {
      setHasMoved(true);
    }

    const rect = sheetRef.current.getBoundingClientRect();
    const sheetHeight = rect.height;
    const collapsedTranslate = Math.max(0, sheetHeight - 220); // 220px is visible height when collapsed

    const baseTranslate = sheetState === 'collapsed' ? collapsedTranslate : 0;
    let newTranslate = baseTranslate + diffY;

    if (newTranslate < 0) newTranslate = 0;
    if (newTranslate > collapsedTranslate) newTranslate = collapsedTranslate;

    setCurrentTranslateY(newTranslate);
  }, [isDragging, startY, sheetState]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!hasMoved) {
      // Toggle state on click/tap
      setSheetState(prev => prev === 'collapsed' ? 'expanded' : 'collapsed');
      setCurrentTranslateY(0);
      return;
    }

    if (!sheetRef.current) return;
    const rect = sheetRef.current.getBoundingClientRect();
    const sheetHeight = rect.height;
    const collapsedTranslate = Math.max(0, sheetHeight - 220);

    if (sheetState === 'collapsed') {
      if (currentTranslateY < collapsedTranslate * 0.7) {
        setSheetState('expanded');
      }
    } else {
      if (currentTranslateY > collapsedTranslate * 0.3) {
        setSheetState('collapsed');
      }
    }
    setCurrentTranslateY(0);
  }, [isDragging, hasMoved, currentTranslateY, sheetState]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      // Prevent browser scrolling and bouncy page behaviors when dragging the bottom sheet
      e.preventDefault();
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientY);
      }
    };

    const onMouseUp = () => {
      handleDragEnd();
    };

    const onTouchEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const sheetStyle = useMemo(() => {
    if (!isMobile) return {};

    let translateYStr = '0px';
    if (isDragging) {
      translateYStr = `${currentTranslateY}px`;
    } else {
      translateYStr = sheetState === 'collapsed' ? 'calc(100% - 220px)' : '0px';
    }

    return {
      transform: `translateY(${translateYStr})`,
      transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    } as React.CSSProperties;
  }, [isMobile, isDragging, currentTranslateY, sheetState]);

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
          setRestaurants(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setRestaurants([]);
          setLoadError(
            error instanceof Error
              ? `Không tải được dữ liệu nhà hàng (${error.message}).`
              : 'Không tải được dữ liệu nhà hàng.',
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
      results = results.filter((restaurant) => {
        const restCategoryKey = getNormalizedCategoryKey(restaurant.category);
        if (restCategoryKey === activeCategory) return true;
        return (restaurant.menuItems || []).some(
          (item) => getNormalizedCategoryKey(item.category) === activeCategory
        );
      });
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
    .map((category) => ({
      key: category.key,
      label: category.label,
      count: filteredResults.filter((restaurant) => getNormalizedCategoryKey(restaurant.category) === category.key).length,
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
        category: getNormalizedCategoryKey(restaurant.category),
        district: restaurant.district || restaurant.city || 'Hà Nội',
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
      center: HANOI_CENTER,
      zoom: 11.5,
      pitch: 0,
      attributionControl: false,
    });

    // Suppress warnings about missing style images from the vector tile styling
    map.on('styleimagemissing', (e) => {
      const id = e.id;
      if (!map.hasImage(id)) {
        const placeholder = new Uint8Array(4); // Transparent pixel [0, 0, 0, 0]
        map.addImage(id, { width: 1, height: 1, data: placeholder });
      }
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
            <div className="location-select-wrapper">
              <span className="location-select-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.167A3.5 3.5 0 0 1 10.5 4.667C10.5 7.292 7 12.833 7 12.833S3.5 7.292 3.5 4.667A3.5 3.5 0 0 1 7 1.167Z" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="7" cy="4.667" r="1.167" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
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
              <span className="location-select-chevron">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div
          ref={sheetRef}
          className={`sidebar__results-sheet ${sheetState}`}
          style={sheetStyle}
        >
          <div
            className="sidebar__results-sheet-header-wrapper"
            onMouseDown={(e) => handleDragStart(e, e.clientY)}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                handleDragStart(e, e.touches[0].clientY);
              }
            }}
            style={{ cursor: isMobile ? (isDragging ? 'grabbing' : 'ns-resize') : 'default' }}
          >
            {isMobile && (
              <div className="sheet-drag-handle">
                <div className="sheet-drag-line" />
              </div>
            )}
            <div className="sidebar__results-header">
              <span className="sidebar__results-title">{copy.results}</span>
              <div className="sidebar__results-tools">
                <span className="sidebar__results-count">
                  <span data-results-count>{filteredResults.length}</span> {copy.resultsAt} {activeLocationLabel}
                </span>
                <div className="sort-toggle-group">
                  <button
                    type="button"
                    className={`sort-toggle-btn ${sortBy === 'rating' ? 'is-active' : ''}`}
                    onClick={() => handleSortChange('rating')}
                  >
                    ⭐ {copy.sortRating}
                  </button>
                  <button
                    type="button"
                    className={`sort-toggle-btn ${sortBy === 'name' ? 'is-active' : ''}`}
                    onClick={() => handleSortChange('name')}
                  >
                    🔤 {copy.sortName}
                  </button>
                </div>
              </div>
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
