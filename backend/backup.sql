--
-- PostgreSQL database dump
--

\restrict KDi3hF7tkAZ7G5fJyb2EgrBracIWOfPo2a1oOXFEHba7bhddqfSYYjcFn8YksvZ

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-27 17:01:14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 889 (class 1247 OID 17474)
-- Name: approval_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.approval_status OWNER TO postgres;

--
-- TOC entry 883 (class 1247 OID 16971)
-- Name: bookings_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bookings_status_enum AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed'
);


ALTER TYPE public.bookings_status_enum OWNER TO postgres;

--
-- TOC entry 895 (class 1247 OID 17498)
-- Name: document_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_status AS ENUM (
    'pending',
    'verified',
    'rejected',
    'expired'
);


ALTER TYPE public.document_status OWNER TO postgres;

--
-- TOC entry 892 (class 1247 OID 17489)
-- Name: document_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_type AS ENUM (
    'japanese_proof',
    'business_license',
    'food_safety_cert',
    'identity_card'
);


ALTER TYPE public.document_type OWNER TO postgres;

--
-- TOC entry 886 (class 1247 OID 17026)
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'customer',
    'restaurant_owner',
    'admin'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16894)
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer,
    restaurant_id integer,
    booking_date date NOT NULL,
    booking_time time without time zone NOT NULL,
    guests integer NOT NULL,
    note text,
    status public.bookings_status_enum DEFAULT 'pending'::public.bookings_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reject_reason text
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16893)
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 225
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- TOC entry 224 (class 1259 OID 16876)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    id integer NOT NULL,
    restaurant_id integer,
    name character varying(255) NOT NULL,
    name_jp character varying(255),
    price numeric(10,2) NOT NULL,
    description text,
    category character varying(100),
    image_url character varying(255),
    badge character varying(50),
    emoji character varying(10),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16875)
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_items_id_seq OWNER TO postgres;

--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 223
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- TOC entry 230 (class 1259 OID 16945)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    type character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16944)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 229
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 232 (class 1259 OID 17528)
-- Name: restaurant_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_documents (
    id integer NOT NULL,
    restaurant_id integer,
    japanese_proof character varying(255),
    business_license character varying(255),
    food_safety_cert character varying(255),
    identity_card character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.restaurant_documents OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17527)
-- Name: restaurant_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurant_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurant_documents_id_seq OWNER TO postgres;

--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 231
-- Name: restaurant_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurant_documents_id_seq OWNED BY public.restaurant_documents.id;


--
-- TOC entry 222 (class 1259 OID 16846)
-- Name: restaurants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurants (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    name_jp character varying(255),
    category character varying(100) NOT NULL,
    rating numeric(2,1) DEFAULT '0'::numeric NOT NULL,
    address text NOT NULL,
    district character varying(100),
    city character varying(100),
    description text,
    phone character varying(20),
    has_japanese_support boolean DEFAULT false NOT NULL,
    latitude double precision DEFAULT '0'::double precision NOT NULL,
    longitude double precision DEFAULT '0'::double precision NOT NULL,
    image_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    owner_id integer,
    status public.approval_status DEFAULT 'pending'::public.approval_status,
    reject_reason text
);


ALTER TABLE public.restaurants OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16845)
-- Name: restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurants_id_seq OWNER TO postgres;

--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 221
-- Name: restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurants_id_seq OWNED BY public.restaurants.id;


--
-- TOC entry 228 (class 1259 OID 16921)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer,
    restaurant_id integer,
    stars integer NOT NULL,
    title character varying(255),
    content text NOT NULL,
    owner_reply text,
    visit_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_reported boolean DEFAULT false,
    report_reason text,
    CONSTRAINT "CHK_76682f10516849abb17cd501b9" CHECK (((stars >= 1) AND (stars <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16920)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 227
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 220 (class 1259 OID 16826)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public.users_role_enum DEFAULT 'customer'::public.users_role_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(255),
    name_kana character varying(100),
    nickname character varying(50)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16825)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4916 (class 2604 OID 16897)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 4914 (class 2604 OID 16879)
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 16948)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 17531)
-- Name: restaurant_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_documents ALTER COLUMN id SET DEFAULT nextval('public.restaurant_documents_id_seq'::regclass);


--
-- TOC entry 4906 (class 2604 OID 16849)
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_id_seq'::regclass);


--
-- TOC entry 4920 (class 2604 OID 16924)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 16829)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5112 (class 0 OID 16894)
-- Dependencies: 226
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, user_id, restaurant_id, booking_date, booking_time, guests, note, status, created_at, updated_at, reject_reason) FROM stdin;
\.


--
-- TOC entry 5110 (class 0 OID 16876)
-- Dependencies: 224
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menu_items (id, restaurant_id, name, name_jp, price, description, category, image_url, badge, emoji, created_at) VALUES
(1, 1, 'Phở Bò Tái Nạm', '牛肉のフォー (レア＆煮込み)', 60000.00, 'Phở với thịt bò tái ngọt mềm và nạm giòn', 'Main Dish', 'url_pho_tainam.jpg', 'Signature', '🍜', NOW()),
(2, 1, 'Quẩy Giòn', '揚げパン', 5000.00, 'Quẩy giòn ăn kèm nước dùng phở', 'Side Dish', 'url_quay.jpg', NULL, '🥖', NOW()),
(3, 2, 'Sashimi Tổng Hợp (Đặc biệt)', '特上刺身盛り合わせ', 450000.00, 'Cá hồi, cá trích, bụng cá ngừ, sò đỏ, bạch tuộc', 'Sashimi', 'url_sashimi.jpg', 'Chef Choice', '🐟', NOW()),
(4, 2, 'Cơm Cuộn Lươn Nhật', 'うなぎロール', 180000.00, 'Cơm cuộn lươn nướng sốt Kabayaki', 'Maki', 'url_unagi.jpg', 'Popular', '🍣', NOW()),
(5, 2, 'Rượu Sake Nóng (Bình nhỏ)', '熱燗 (小)', 120000.00, 'Sake hâm nóng, nồng độ cồn nhẹ', 'Drink', 'url_sake.jpg', 'Recommend', '🍶', NOW()),
(6, 3, 'Suất Chả Cá Lăng', 'ラン魚 của炭火焼きコース', 160000.00, 'Chả cá lăng kèm bún, mắm tôm, lạc rang và rau thơm', 'Main Dish', 'url_chaca_lang.jpg', 'Signature', '🥘', NOW()),
(7, 3, 'Dạ Dày Cá Bóp Gỏi', '魚の胃袋サラダ', 85000.00, 'Gỏi dạ dày cá giòn sần sật trộn chua ngọt', 'Appetizer', 'url_daday.jpg', NULL, '🥗', NOW()),
(8, 4, 'Pizza Burrata Parma Ham', 'ブッラータチーズと生ハムのピザ', 290000.00, 'Pizza nướng củi với phô mai Burrata tươi và thịt xông khói', 'Pizza', 'url_burrata.jpg', 'Signature', '🍕', NOW()),
(9, 4, 'Mì Ý Cua Sốt Cà Chua Kem', '蟹のトマトクリームパスタ', 240000.00, 'Mì Ý với thịt cua biển tươi, sốt kem cà chua béo ngậy', 'Pasta', 'url_crabpasta.jpg', 'Popular', '🍝', NOW()),
(10, 5, 'Buffet Trưa Tiêu Chuẩn', 'ランチビュッフェ', 350000.00, 'Trải nghiệm hơn 100 món ăn Á Âu và hải sản tươi sống', 'Buffet', 'url_buffet_lunch.jpg', 'Recommend', '🍽️', NOW()),
(11, 5, 'Hàu Sữa Ăn Sống', '生牡蠣', 0.00, 'Hàu sữa tươi vắt chanh (Nằm trong giá buffet)', 'Seafood', 'url_oyster.jpg', 'Popular', '🦪', NOW()),
(12, 6, 'Bún Bò Huế Đặc Biệt', '特製ブンボーフエ (全部のせ)', 65000.00, 'Đầy đủ bắp bò, nạm, móng, chả cua và chả bò', 'Main Dish', 'url_bbh_dacbiet.jpg', 'Signature', '🍜', NOW()),
(13, 6, 'Trà Đá', '冷たいお茶 (チャーダー)', 5000.00, 'Trà đá mát lạnh giải khát', 'Drink', 'url_trada.jpg', NULL, '🥤', NOW()),
(14, 7, 'Suất Bún Chả', 'ブンチャーセット', 55000.00, 'Bún, thịt nướng than hoa (chả băm và chả miếng), nước chấm chua ngọt', 'Main Dish', 'url_buncha_haha_suat.jpg', 'Popular', '🍲', NOW()),
(15, 7, 'Nem Rán (1 chiếc)', '揚げ春巻き (1本)', 10000.00, 'Nem thịt rán giòn ăn kèm bún chả', 'Side Dish', 'url_nemran.jpg', NULL, '🌯', NOW()),
(16, 8, 'Bánh Mì Thập Cẩm', 'ミックスバインミー', 35000.00, 'Pate, xá xíu, chả lụa, ruốc bông, dưa góp và sốt bí truyền', 'Main Dish', 'url_bm_thapcam.jpg', 'Signature', '🥖', NOW()),
(17, 8, 'Sữa Đậu Nành', '豆乳', 15000.00, 'Sữa đậu nành nguyên chất, ít ngọt', 'Drink', 'url_suadaunanh.jpg', 'Recommend', '🥛', NOW()),
(18, 9, 'Combo 2 Miếng Gà Giòn Vui Vẻ', 'フライドチキン2ピースセット', 85000.00, 'Gà rán giòn rụm kèm khoai tây chiên và nước ngọt', 'Combo', 'url_jolli_chicken.jpg', 'Popular', '🍗', NOW()),
(19, 9, 'Mì Ý Sốt Xúc Xích', 'ソーセージトマトスパゲッティ', 45000.00, 'Mì Ý sốt cà chua băm thịt và xúc xích đặc trưng', 'Main Dish', 'url_jolli_spaghetti.jpg', 'Chef Choice', '🍝', NOW()),
(20, 10, 'Trà Sữa Trân Châu Hoàng Gia', 'ロイヤルタピオカミルクティー', 48000.00, 'Trà sữa đậm vị hồng trà, thêm trân châu đen dẻo dai', 'Drink', 'url_toco_milktea.jpg', 'Signature', '🧋', NOW()),
(21, 10, 'Trà Đào Cam Sả', 'ピーチオレンジレモングラスティー', 52000.00, 'Trà trái cây thanh mát, giải nhiệt cực tốt', 'Drink', 'url_toco_peach.jpg', 'Recommend', '🍹', NOW()),
(22, 11, 'Set Sashimi Tổng Hợp Premium', '特上刺身盛り合わせ (プレミアム)', 1250000.00, 'Bụng cá ngừ vây xanh, cá hồi, sò đỏ, nhím biển (Uni)', 'Sashimi', 'url_hato_sashimi.jpg', 'Signature', '🍱', NOW()),
(23, 11, 'Bò Wagyu A5 Nướng Đá', '和牛A5 石焼き', 1500000.00, 'Thịt bò Wagyu A5 thượng hạng nướng trên đá nóng', 'Main Dish', 'url_hato_wagyu.jpg', 'Chef Choice', '🥩', NOW()),
(24, 11, 'Sushi Cuộn Lươn Bơ', 'うなぎアボカドロール', 220000.00, 'Cơm cuộn lươn nướng Nhật Bản và quả bơ tươi', 'Sushi', 'url_hato_roll.jpg', 'Popular', '🍣', NOW()),
(25, 11, 'Mì Udon Nước Sốt Tảo Bẹ', '昆布だしうどん', 150000.00, 'Mì Udon sợi dai với nước dùng thanh tao từ tảo bẹ Kombu', 'Noodle', 'url_hato_udon.jpg', NULL, '🍜', NOW()),
(26, 12, 'Sashimi Bụng Cá Ngừ Vây Xanh', '本マグロ大トロ刺身', 450000.00, 'Phần bụng cá ngừ cao cấp nhất (Otoro), béo ngậy tan trong miệng', 'Sashimi', 'url_otoro.jpg', 'Signature', '🐟', NOW()),
(27, 12, 'Sushi Lươn Nướng', 'うなぎ握り', 120000.00, 'Sushi lươn nướng sốt ngọt Kabayaki', 'Sushi', 'url_unagi_sushi.jpg', 'Popular', '🍣', NOW()),
(28, 13, 'Sườn Bò Mỹ Rút Xương', '牛角カルビ', 220000.00, 'Sườn bò mềm mọng nướng trên than hoa', 'BBQ', 'url_karubi.jpg', 'Signature', '🥩', NOW()),
(29, 13, 'Lưỡi Bò Nướng Muối Hành', 'ネギ塩牛タン', 180000.00, 'Lưỡi bò giòn sần sật, thái mỏng nướng cùng sốt muối hành', 'BBQ', 'url_gyutan.jpg', 'Popular', '👅', NOW()),
(30, 14, 'Mì Udon Bò Kake', '肉うどん', 89000.00, 'Mì Udon nước thanh ngọt ăn kèm thịt bò Mỹ', 'Noodle', 'url_niku_udon.jpg', 'Signature', '🍜', NOW()),
(31, 14, 'Tempura Tôm', 'えび天', 35000.00, 'Tôm tẩm bột chiên xù kiểu Nhật', 'Side Dish', 'url_ebiten.jpg', 'Recommend', '🍤', NOW()),
(32, 15, 'Cá Ngừ Nướng Rơm', 'かつおの藁焼き', 250000.00, 'Katsuo Tataki - Cá ngừ áp chảo bằng rơm rực lửa thơm mùi khói', 'Main Dish', 'url_katsuo.jpg', 'Signature', '🔥', NOW()),
(33, 15, 'Cơm Nắm Nướng Tương', '焼きおにぎり', 45000.00, 'Cơm nắm phết nước tương nướng trên than hồng', 'Side Dish', 'url_yaki_onigiri.jpg', NULL, '🍙', NOW()),
(34, 16, 'Buffet Sakura', '桜ビュッフェ', 450000.00, 'Gói buffet tiêu chuẩn bao gồm Sashimi cá hồi, Sushi và thịt nướng', 'Buffet', 'url_isushi_sakura.jpg', 'Popular', '🍱', NOW()),
(35, 16, 'Hàu Nướng Phô Mai', '牡蠣のチーズ焼き', 0.00, 'Hàu nướng phô mai bỏ lò (Nằm trong giá buffet)', 'Seafood', 'url_oyster_cheese.jpg', 'Recommend', '🦪', NOW()),
(36, 17, 'Bánh Xèo Nhật Bản', 'お好み焼き', 120000.00, 'Okonomiyaki nhân hải sản và bắp cải, sốt Mayonnaise đậm đà', 'Main Dish', 'url_okonomiyaki.jpg', 'Popular', '🥞', NOW()),
(37, 17, 'Rượu Shochu Mugi', '麦焼酎', 80000.00, 'Rượu Shochu lúa mạch (Giá phục vụ theo ly)', 'Drink', 'url_shochu.jpg', NULL, '🍶', NOW()),
(38, 18, 'Miso Ramen Hokkaido', '北海道味噌ラーメン', 150000.00, 'Ramen với nước dùng tương miso đặc trưng của vùng Hokkaido', 'Noodle', 'url_miso_ramen.jpg', 'Signature', '🍜', NOW()),
(39, 18, 'Cơm Thịt Heo Nướng', '豚丼 (ぶたどん)', 140000.00, 'Cơm trắng ăn kèm thịt heo nướng sốt ngọt đậm đà', 'Main Dish', 'url_butadon.jpg', 'Recommend', '🍛', NOW()),
(40, 19, 'Cơm Cuộn California', 'カリフォルニアロール', 110000.00, 'Cơm cuộn bơ, thanh cua và trứng cá chuồn', 'Sushi', 'url_cali_roll.jpg', 'Popular', '🍣', NOW()),
(41, 19, 'Set Cơm Trưa Cá Hồi Nướng', '鮭塩焼き定食', 160000.00, 'Set Bento trưa gồm cá hồi nướng muối, cơm, súp miso và salad', 'Set Menu', 'url_sake_teishoku.jpg', 'Chef Choice', '🍱', NOW()),
(42, 20, 'Tonkotsu Ramen Truyền Thống', '豚骨ラーメン', 110000.00, 'Ramen nước hầm xương heo béo ngậy kèm thịt xá xíu (Chashu)', 'Noodle', 'url_tonkotsu.jpg', 'Signature', '🍜', NOW()),
(43, 20, 'Há Cảo Gyoza (5 chiếc)', '焼き餃子 (5個)', 45000.00, 'Há cảo nhân thịt và bắp cải áp chảo viền giòn', 'Side Dish', 'url_gyoza.jpg', 'Popular', '🥟', NOW()),
(44, 21, 'Set Omakase Đặc Biệt', 'おまかせ コース', 2500000.00, 'Set ăn cao cấp 12 món do Chef Nhật Bản tự tay lựa chọn nguyên liệu', 'Omakase', 'url_omakase.jpg', 'Signature', '🔪', NOW()),
(45, 21, 'Kem Matcha Nhật Bản', '抹茶アイスクリーム', 80000.00, 'Kem trà xanh nguyên chất vị đắng nhẹ và thanh mát', 'Dessert', 'url_matcha_ice.jpg', NULL, '🍨', NOW());


--
-- TOC entry 5116 (class 0 OID 16945)
-- Dependencies: 230
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, content, is_read, type, created_at) FROM stdin;
\.


--
-- TOC entry 5118 (class 0 OID 17528)
-- Dependencies: 232
-- Data for Name: restaurant_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_documents (id, restaurant_id, japanese_proof, business_license, food_safety_cert, identity_card, created_at, updated_at) FROM stdin;
1	4	/uploads/documents/1779867262836-847629346.jpg	/uploads/documents/1779867262838-839257470.jpg	/uploads/documents/1779867262839-578347039.jpg	/uploads/documents/1779867262841-122802540.jpg	2026-05-27 14:34:22.845458+07	2026-05-27 14:34:22.845458+07
\.


--
-- TOC entry 5108 (class 0 OID 16846)
-- Dependencies: 222
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.restaurants (id, name, name_jp, category, rating, address, district, city, description, phone, has_japanese_support, latitude, longitude, image_url, created_at, updated_at, owner_id, status, reject_reason) VALUES
(1, 'Phở Gia Truyền Bát Đàn', 'フォー・ザー・チュエン（バッダン通り）', 'Vietnamese / Pho', 4.8, '49 Bát Đàn, Phường Cửa Đông, Quận Hoàn Kiếm, Hà Nội', 'Hoàn Kiếm', 'Hà Nội', 'Quán phở bò truyền thống nổi tiếng bậc nhất phố cổ Hà Nội. Nước dùng đậm đà, thịt bò tươi ngon.', '+842438287960', true, 21.0318, 105.8471, 'url_pho_batdan.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(2, 'Sushi Kei Lotte Center', '寿司 慶 (Sushi Kei)', 'Japanese / Sushi', 4.6, 'Tầng 3 Lotte Center, 54 Liễu Giai, Quận Ba Đình, Hà Nội', 'Ba Đình', 'Hà Nội', 'Nhà hàng Nhật Bản cao cấp với nguyên liệu tươi nhập khẩu trực tiếp từ chợ Tsukiji. Không gian sang trọng, yên tĩnh.', '+842433332222', true, 21.0317, 105.8123, 'url_sushikei.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(3, 'Chả Cá Thăng Long', 'チャーカータンロン（白身魚のディル炒め）', 'Vietnamese / Local', 4.5, '21 Đường Thành, Phường Cửa Đông, Quận Hoàn Kiếm, Hà Nội', 'Hoàn Kiếm', 'Hà Nội', 'Đặc sản chả cá lăng tẩm ướp đậm đà, xào cùng hành và thì là. Không gian rộng rãi, phù hợp tiếp khách.', '+842438286007', true, 21.0308, 105.8468, 'url_chaca.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(4, 'Pizza 4P''s Tràng Tiền', 'ピザ 4P''s チャンティエン', 'Italian / Fusion', 4.9, '43 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', 'Hoàn Kiếm', 'Hà Nội', 'Sự kết hợp hoàn hảo giữa ẩm thực Ý và tinh hoa Nhật Bản. Nổi tiếng với phô mai tự làm và không gian bếp mở.', '+8419006043', true, 21.0250, 105.8540, 'url_pizza4ps.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(5, 'Maison Sen Buffet', 'メゾン セン ビュッフェ', 'Buffet / Asian-European', 4.4, '61 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 'Hoàn Kiếm', 'Hà Nội', 'Buffet hải sản và các món Á - Âu đẳng cấp trong biệt thự Pháp cổ. Phù hợp cho nhóm đông người và gia đình.', '+842439344186', false, 21.0210, 105.8480, 'url_maisonsen.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(6, 'Bún Bò Huế Anh Quân', 'ブンボーフエ アンクアン', 'Vietnamese / Noodle', 4.5, '15 Thái Hà, Phường Trung Liệt, Quận Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'Nước dùng đậm đà, thơm mùi mắm ruốc, chả cua tự làm và móng giò giòn sần sật.', '+84987654321', false, 21.0112, 105.8214, 'url_bunbo_anhquan.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(7, 'Bún Chả Ha Ha', 'ブンチャー ハハ', 'Vietnamese / Local', 4.3, '30 Đội Cấn, Phường Đội Cấn, Quận Ba Đình, Hà Nội', 'Ba Đình', 'Hà Nội', 'Quán bún chả với công thức tẩm ướp thịt nướng than hoa truyền thống, chả viên nướng mềm ngọt.', '+84901239876', false, 21.0345, 105.8201, 'url_buncha_haha.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(8, 'Bánh Mì Cô Bình', 'バインミー コービン', 'Vietnamese / Street Food', 4.6, '12 Phố Huế, Quận Hai Bà Trưng, Hà Nội', 'Hai Bà Trưng', 'Hà Nội', 'Bánh mì pate truyền thống với vỏ giòn rụm, pate gan béo ngậy và thịt xá xíu đậm đà.', '+84912345678', false, 21.0150, 105.8500, 'url_banhmi_cobinh.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(9, 'Jollibee - Vincom Phạm Ngọc Thạch', 'ジョリビー ファムゴックタック店', 'Fast Food', 4.4, 'Tầng 5, Vincom Phạm Ngọc Thạch, 2 Phạm Ngọc Thạch, Quận Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'Gà rán giòn rụm, mì Ý sốt cà chua thịt băm truyền thống và thực đơn phù hợp cho gia đình, trẻ em.', '+8419001533', true, 21.0068, 105.8322, 'url_jollibee.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(10, 'TocoToco Tea - Ngã Tư Sở', 'トコトコ タピオカミルクティー', 'Cafe / Drink', 4.2, 'Số 2 Tôn Thất Tùng, Quận Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'Thương hiệu trà sữa Việt Nam. Trà sữa trân châu, trà trái cây nhiệt đới với không gian trẻ trung.', '+841900636936', false, 21.0022, 105.8285, 'url_tocotoco.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(11, 'Nhà hàng Hải sản Hatoyama', 'シーフードレストラン ハトヤマ', 'Japanese / Seafood', 4.9, '8 Vạn Phúc, Phường Liễu Giai, Quận Ba Đình, Hà Nội', 'Ba Đình', 'Hà Nội', 'Hải sản cao cấp bay trực tiếp từ Nhật Bản về Hà Nội trong 24h. Phòng riêng VIP sang trọng.', '+84917992288', true, 21.0321, 105.8155, 'url_hatoyama.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(12, 'Asahi Sushi', '朝日寿司', 'Japanese / Sushi', 4.7, '288 Bà Triệu, Phường Lê Đại Hành, Quận Hai Bà Trưng, Hà Nội', 'Hai Bà Trưng', 'Hà Nội', 'Nhà hàng sushi truyền thống lâu đời tại Hà Nội, không gian đậm chất văn hóa Nhật Bản.', '+842439745945', true, 21.0118, 105.8492, 'url_asahi.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(13, 'Gyu-Kaku Japanese BBQ', '牛角 牛肉バーベキュー', 'Japanese / Yakiniku', 4.6, 'Tầng 1, Tòa nhà V-Tower, 649 Kim Mã, Quận Ba Đình, Hà Nội', 'Ba Đình', 'Hà Nội', 'Hệ thống thịt nướng Yakiniku số 1 Nhật Bản, thịt bò mềm mọng với nước sốt độc quyền.', '+842432115405', true, 21.0289, 105.8111, 'url_gyukaku.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(14, 'Marukame Udon', '丸亀製麺', 'Japanese / Noodle', 4.5, 'Tầng 2, Vincom Metropolis, 29 Liễu Giai, Quận Ba Đình, Hà Nội', 'Ba Đình', 'Hà Nội', 'Mì Udon tươi làm thủ công tại chỗ, nước dùng thanh ngọt và các loại tempura chiên giòn.', '+84931234567', true, 21.0315, 105.8128, 'url_marukame.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(15, 'Shamoji Robata Yaki', 'しゃもじ 炉端焼き', 'Japanese / Izakaya', 4.8, '25 Tông Đản, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', 'Hoàn Kiếm', 'Hà Nội', 'Quán nhậu kiểu ngư dân Nhật Bản. Các món nướng than hoa rực lửa và không khí cực kỳ náo nhiệt.', '+84923456789', true, 21.0261, 105.8569, 'url_shamoji.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(16, 'iSushi Buffet', 'iSushi ビュッフェ', 'Japanese / Buffet', 4.3, '158 Thái Hà, Phường Trung Liệt, Quận Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'Buffet ẩm thực Nhật Bản với hơn 100 món Sashimi, Sushi, Teppanyaki thỏa thích.', '+8419006622', false, 21.0125, 105.8208, 'url_isushi.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(17, 'Kỷ Y - Kiyi Izakaya', '紀伊 居酒屋', 'Japanese / Izakaya', 4.5, '166 Triệu Việt Vương, Phường Bùi Thị Xuân, Quận Hai Bà Trưng, Hà Nội', 'Hai Bà Trưng', 'Hà Nội', 'Quán nhậu nhỏ mang phong cách gia đình Nhật, nổi tiếng với các món ăn kèm rượu Sake.', '+842439781386', true, 21.0130, 105.8480, 'url_kiyi.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(18, 'Hokkaido Ramen & Butadon Oyama', '北海道ラーメン 大山', 'Japanese / Ramen', 4.7, 'Khu ngoại giao đoàn, Tòa nhà Syrena, 51 Xuân Diệu, Quận Tây Hồ, Hà Nội', 'Tây Hồ', 'Hà Nội', 'Mì Ramen chuẩn vị Hokkaido và Cơm thịt heo nướng Butadon trứ danh.', '+842437188891', true, 21.0633, 105.8245, 'url_hokkaido_ramen.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(19, 'The Sushi Bar', '寿司バー', 'Japanese / Sushi', 4.4, '120 Trung Hòa, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'Không gian hiện đại, menu đa dạng từ sushi, sashimi đến các set bento ăn trưa tiện lợi.', '+842437646666', true, 21.0111, 105.7981, 'url_sushibar.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(20, 'Tonchan Ramen', 'とんちゃん ラーメン', 'Japanese / Ramen', 4.2, '76 Bùi Thị Xuân, Quận Hai Bà Trưng, Hà Nội', 'Hai Bà Trưng', 'Hà Nội', 'Mì Tonkotsu Ramen với nước dùng xương heo hầm nhiều giờ béo ngậy, đậm đà.', '+84981239999', false, 21.0145, 105.8490, 'url_tonchan.jpg', NOW(), NOW(), NULL, 'approved', NULL),
(21, 'Yuzu Omakase', '柚子 おまかせ', 'Japanese / Omakase', 4.9, '34 Lý Thái Tổ, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', 'Hoàn Kiếm', 'Hà Nội', 'Trải nghiệm ẩm thực cao cấp nghệ thuật, Chef Nhật Bản trực tiếp chế biến theo nguyên liệu tươi trong ngày.', '+84988776655', true, 21.0268, 105.8552, 'url_yuzu.jpg', NOW(), NOW(), NULL, 'approved', NULL);


--
-- TOC entry 5114 (class 0 OID 16921)
-- Dependencies: 228
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, user_id, restaurant_id, stars, title, content, owner_reply, visit_date, created_at, is_reported, report_reason) FROM stdin;
1	8	1	5	本場の味！素晴らしい (Hương vị đích thực! Tuyệt vời)	フォーがとても美味しかったです。日本語のメニューもあり、写真付きだったので安心して注文できました。店内も清潔です。 (Phở rất ngon. Có menu tiếng Nhật kèm hình ảnh nên tôi rất yên tâm khi gọi món. Quán cũng sạch sẽ.)	Cảm ơn Tanaka-san rất nhiều! Rất hân hạnh được phục vụ bạn. Lần tới đến Việt Nam công tác, mong bạn lại ghé quán nhé!	2026-05-20	2026-05-21 23:03:31.291232+07	f	\N
2	9	2	4	美味しいですが、言葉が少し... (Ngon nhưng ngôn ngữ hơi...)	ブンチャーは絶品でした！お肉の香ばしさが最高です。ただ、日本語が通じるスタッフがいなかったのが少し残念でした。指さしで注文しました。(Bún chả tuyệt vời! Thịt nướng rất thơm. Nhưng hơi tiếc là không có nhân viên nói tiếng Nhật. Tôi phải chỉ tay để gọi món.)	\N	2026-05-22	2026-05-23 23:03:31.291232+07	f	\N
3	8	3	2	期待外れでした (Hơi thất vọng)	「日本語対応」とアプリに書いてありましたが、実際は英語のメニューしかありませんでした。店内も少し騒がしくて、接待には不向きです。(Trên app ghi là có hỗ trợ tiếng Nhật, nhưng thực tế chỉ có menu tiếng Anh. Quán cũng hơi ồn ào, không phù hợp để tiếp khách.)	Thành thật xin lỗi quý khách về trải nghiệm không tốt này. Chúng tôi đang khẩn trương dịch lại menu sang tiếng Nhật chuẩn. Rất mong quý khách thông cảm!	2026-05-15	2026-05-17 23:03:31.291232+07	f	\N
4	9	1	5	最高の朝食 (Bữa sáng tuyệt vời)	出張の朝食で利用しました。提供スピードが早くて助かりました。スープが優しくて胃に沁みます。(Tôi ăn sáng ở đây khi đi công tác. Phục vụ rất nhanh nên rất tiện. Nước dùng thanh ngọt rất dễ chịu.)	Cảm ơn bạn đã ghé thăm Phở Hòa!	2026-05-24	2026-05-25 23:03:31.291232+07	f	\N
5	4	1	5	本場の味！素晴らしい (Hương vị đích thực! Tuyệt vời)	フォーがとても美味しかったです。日本語のメニューもあり、写真付きだったので安心して注文できました。店内も清潔です。 (Phở rất ngon. Có menu tiếng Nhật kèm hình ảnh nên tôi rất yên tâm khi gọi món. Quán cũng sạch sẽ.)	Cảm ơn Tanaka-san rất nhiều! Rất hân hạnh được phục vụ bạn. Lần tới đến Việt Nam công tác, mong bạn lại ghé quán nhé!	2026-05-20	2026-05-21 23:03:34.291506+07	f	\N
6	5	2	4	美味しいですが、言葉が少し... (Ngon nhưng ngôn ngữ hơi...)	ブンチャーは絶品でした！お肉の香ばしさが最高です。ただ、日本語が通じるスタッフがいなかったのが少し残念でした。指さしで注文しました。(Bún chả tuyệt vời! Thịt nướng rất thơm. Nhưng hơi tiếc là không có nhân viên nói tiếng Nhật. Tôi phải chỉ tay để gọi món.)	\N	2026-05-22	2026-05-23 23:03:34.291506+07	f	\N
7	4	3	2	期待外れでした (Hơi thất vọng)	「日本語対応」とアプリに書いてありましたが、実際は英語のメニューしかありませんでした。店内も少し騒がしくて、接待には不向きです。(Trên app ghi là có hỗ trợ tiếng Nhật, nhưng thực tế chỉ có menu tiếng Anh. Quán cũng hơi ồn ào, không phù hợp để tiếp khách.)	Thành thật xin lỗi quý khách về trải nghiệm không tốt này. Chúng tôi đang khẩn trương dịch lại menu sang tiếng Nhật chuẩn. Rất mong quý khách thông cảm!	2026-05-15	2026-05-17 23:03:34.291506+07	f	\N
8	5	1	5	最高の朝食 (Bữa sáng tuyệt vời)	出張の朝食で利用しました。提供スピードが早くて助かりました。スープが優しくて胃に沁みます。(Tôi ăn sáng ở đây khi đi công tác. Phục vụ rất nhanh nên rất tiện. Nước dùng thanh ngọt rất dễ chịu.)	Cảm ơn bạn đã ghé thăm Phở Hòa!	2026-05-24	2026-05-25 23:03:34.291506+07	f	\N
9	4	1	5	本場の味！素晴らしい (Hương vị đích thực! Tuyệt vời)	フォーがとても美味しかったです。日本語のメニューもあり、写真付きだったので安心して注文できました。店内も清潔です。 (Phở rất ngon. Có menu tiếng Nhật kèm hình ảnh nên tôi rất yên tâm khi gọi món. Quán cũng sạch sẽ.)	Cảm ơn Tanaka-san rất nhiều! Rất hân hạnh được phục vụ bạn. Lần tới đến Việt Nam công tác, mong bạn lại ghé quán nhé!	2026-05-20	2026-05-21 23:04:00.482969+07	f	\N
10	5	2	4	美味しいですが、言葉が少し... (Ngon nhưng ngôn ngữ hơi...)	ブンチャーは絶品でした！お肉の香ばしさが最高です。ただ、日本語が通じるスタッフがいなかったのが少し残念でした。指さしで注文しました。(Bún chả tuyệt vời! Thịt nướng rất thơm. Nhưng hơi tiếc là không có nhân viên nói tiếng Nhật. Tôi phải chỉ tay để gọi món.)	\N	2026-05-22	2026-05-23 23:04:00.482969+07	f	\N
11	4	3	2	期待外れでした (Hơi thất vọng)	「日本語対応」とアプリに書いてありましたが、実際は英語のメニューしかありませんでした。店内も少し騒がしくて、接待には不向きです。(Trên app ghi là có hỗ trợ tiếng Nhật, nhưng thực tế chỉ có menu tiếng Anh. Quán cũng hơi ồn ào, không phù hợp để tiếp khách.)	Thành thật xin lỗi quý khách về trải nghiệm không tốt này. Chúng tôi đang khẩn trương dịch lại menu sang tiếng Nhật chuẩn. Rất mong quý khách thông cảm!	2026-05-15	2026-05-17 23:04:00.482969+07	f	\N
12	5	1	5	最高の朝食 (Bữa sáng tuyệt vời)	出張の朝食で利用しました。提供スピードが早くて助かりました。スープが優しくて胃に沁みます。(Tôi ăn sáng ở đây khi đi công tác. Phục vụ rất nhanh nên rất tiện. Nước dùng thanh ngọt rất dễ chịu.)	Cảm ơn bạn đã ghé thăm Phở Hòa!	2026-05-24	2026-05-25 23:04:00.482969+07	f	\N
13	7	2	5	oke	oke	\N	2026-05-25	2026-05-25 23:12:42.557249+07	f	\N
14	4	1	4	vinh ngu nhu cho	vinh chuppy chuppy	ngu con cac, khach thi biet cai deo gi	2026-05-26	2026-05-26 15:43:44.696695+07	f	\N
\.


--
-- TOC entry 5106 (class 0 OID 16826)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, role, created_at, is_active, updated_at, name, name_kana, nickname) FROM stdin;
1	admin@vietnambooking.jp	hashed_pass	admin	2026-05-24 08:12:04.272656+07	t	2026-05-24 08:38:02.57153+07	\N	\N	\N
2	owner.pho@gmail.com	hashed_pass	restaurant_owner	2026-05-24 08:12:04.272656+07	t	2026-05-24 08:38:02.57153+07	\N	\N	\N
3	owner.buncha@gmail.com	hashed_pass	restaurant_owner	2026-05-24 08:12:04.272656+07	t	2026-05-24 08:38:02.57153+07	\N	\N	\N
4	doductuan9999@gmail.com	$2b$10$TNxyMLEuDKfx42VGKtT.0ecK3aY/Us6aLBT4Ha9Xo1CKuM4qIEwH.	customer	2026-05-24 08:38:57.079124+07	t	2026-05-24 08:38:57.079124+07	\N	\N	\N
5	vinh@gmail.com	$2b$10$mIGXuKxvPLnz1RocTpCMe.4cti6tLm7YRLZX.oIU46nUxr8Gt81Ve	restaurant_owner	2026-05-25 01:26:18.529744+07	t	2026-05-25 01:26:18.529744+07	\N	\N	\N
6	Minhcute@gmail.com	$2b$10$0IL/Bd7JGmC1IOw1zdhvi.6wP9T7XELiDtwJwj3FZkLOQO23WGI7e	admin	2026-05-25 01:49:20.995356+07	t	2026-05-25 01:49:20.995356+07	\N	\N	\N
7	abcxyz@gmail.com	$2b$10$1ScLBX8M8ZLyWCby09IUZuCMz8Ep.wWnvMBE1XQlaTMPs93hdlrbK	customer	2026-05-25 03:37:10.592729+07	t	2026-05-25 03:37:10.592729+07	tuan	\N	\N
8	tanaka.taro@example.jp	hashed_pass	customer	2026-05-25 23:03:31.291232+07	t	2026-05-25 23:03:31.291232+07	田中 太郎	タナカ タロウ	TanakaSan
9	suzuki.hana@example.jp	hashed_pass	customer	2026-05-25 23:03:31.291232+07	t	2026-05-25 23:03:31.291232+07	鈴木 花子	スズキ ハナコ	HanaChan
10	dhminh2000@gmail.com	$2b$10$3vvtz3KZCHUNSQCo6nhiPewBImhXuO58SzRHssLxWvPW63n8VtnFK	restaurant_owner	2026-05-27 14:34:22.81703+07	t	2026-05-27 15:21:58.076513+07	Nguyễn Sĩ Vinh	\N	\N
\.


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 225
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 223
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 45, true);


--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 229
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 231
-- Name: restaurant_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.restaurant_documents_id_seq', 1, true);


--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 221
-- Name: restaurants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.restaurants_id_seq', 21, true);


--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 227
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 14, true);


--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- TOC entry 4939 (class 2606 OID 16909)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 16887)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 16957)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 17538)
-- Name: restaurant_documents restaurant_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_documents
    ADD CONSTRAINT restaurant_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 17540)
-- Name: restaurant_documents restaurant_documents_restaurant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_documents
    ADD CONSTRAINT restaurant_documents_restaurant_id_key UNIQUE (restaurant_id);


--
-- TOC entry 4935 (class 2606 OID 16864)
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 16933)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4931 (class 2606 OID 16844)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4933 (class 2606 OID 16842)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 1259 OID 16965)
-- Name: idx_bookings_restaurant_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_restaurant_date ON public.bookings USING btree (restaurant_id, booking_date);


--
-- TOC entry 4943 (class 1259 OID 17044)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 4954 (class 2606 OID 17061)
-- Name: reviews FK_2269110d10df8d494b99e1381d2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_2269110d10df8d494b99e1381d2" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- TOC entry 4952 (class 2606 OID 17046)
-- Name: bookings FK_64cd97487c5c42806458ab5520c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_64cd97487c5c42806458ab5520c" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4955 (class 2606 OID 17056)
-- Name: reviews FK_728447781a30bc3fcfe5c2f1cdf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4951 (class 2606 OID 17066)
-- Name: menu_items FK_8d1ee4780bf64ae94cbf3e53705; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT "FK_8d1ee4780bf64ae94cbf3e53705" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- TOC entry 4953 (class 2606 OID 17051)
-- Name: bookings FK_92afb2242f19277334cbdd39b19; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_92afb2242f19277334cbdd39b19" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- TOC entry 4956 (class 2606 OID 17081)
-- Name: notifications FK_9a8a82462cab47c73d25f49261f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4950 (class 2606 OID 17465)
-- Name: restaurants fk_restaurant_owner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT fk_restaurant_owner FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4957 (class 2606 OID 17541)
-- Name: restaurant_documents restaurant_documents_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_documents
    ADD CONSTRAINT restaurant_documents_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


-- Completed on 2026-05-27 17:01:15

--
-- PostgreSQL database dump complete
--

\unrestrict KDi3hF7tkAZ7G5fJyb2EgrBracIWOfPo2a1oOXFEHba7bhddqfSYYjcFn8YksvZ

