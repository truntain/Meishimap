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

COPY public.menu_items (id, restaurant_id, name, name_jp, price, description, category, image_url, badge, emoji, created_at) FROM stdin;
1	1	Phở Bò Đặc Biệt	牛肉のフォー（特別）	95000.00	Phở bò tái nạm gầu gân bò viên	Main Dish	url_pho_dacbiet.jpg	Signature	🍜	2026-05-24 08:12:04.272656+07
2	1	Chả Giò Chiên (3 cuốn)	揚げ春巻き（3本）	45000.00	Chả giò tôm thịt chiên giòn	Appetizer	url_chagio.jpg	Popular	🌯	2026-05-24 08:12:04.272656+07
4	1	Bia Saigon Special	サイゴンビール・スペシャル	25000.00	Bia Sài Gòn xanh	Drink	url_biasg.jpg	Recommend	🍺	2026-05-24 08:12:04.272656+07
5	2	Bún Chả	ブンチャー（豚肉の炭火焼き秘伝だれ）	70000.00	Bún chả thịt nướng than hoa	Main Dish	url_buncha.jpg	Popular	🍲	2026-05-24 08:12:04.272656+07
6	2	Nem Cua Bể	蟹の揚げ春巻き	35000.00	Nem cua bể vuông chiên giòn	Side Dish	url_nemcua.jpg	Chef Choice	🦀	2026-05-24 08:12:04.272656+07
7	2	Bia Hà Nội	ハノイビール	20000.00	Bia chai Hà Nội	Drink	url_biahanoi.jpg	\N	🍻	2026-05-24 08:12:04.272656+07
8	3	Mực Nướng Sa Tế	イカのサテ焼き	120000.00	Mực nướng cay	BBQ	url_mucnuong.jpg	Spicy	🦑	2026-05-24 08:12:04.272656+07
9	3	Đậu Phộng Luộc	茹でピーナッツ	20000.00	Món nhắm cơ bản	Snack	url_dauphong.jpg	\N	🥜	2026-05-24 08:12:04.272656+07
10	1	àasda	\N	100000.00	dfsdfase	sashimi	\N	\N	🍣	2026-05-26 14:40:13.740634+07
\.


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

COPY public.restaurants (id, name, name_jp, category, rating, address, district, city, description, phone, has_japanese_support, latitude, longitude, image_url, created_at, updated_at, owner_id, status, reject_reason) FROM stdin;
3	Quan Nhau 5 Do	居酒屋 5度	Izakaya / Beer	3.9	15B Lê Thánh Tôn	District 1	Ho Chi Minh City	Quán nhậu vỉa hè phong cách Việt Nam.	+84901234567	t	0	0	\N	2026-05-25 03:32:51.92453	2026-05-25 03:32:51.92453	\N	approved	\N
2	Bún Chả Đắc Kim	ブンチャータッキム	Vietnamese / Local	4.3	45 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội	Hoàn Kiếm	Hà Nội	Bún chả gia truyền phố cổ. Chủ quán có thể giao tiếp tiếng Nhật cơ bản.	+842438285022	t	21.0264	105.8575	\N	2026-05-25 03:32:51.92453	2026-05-25 23:12:42.579748	\N	approved	\N
1	Phở Hòa Pasteur vinh	フォーホア パスター	Vietnamese / Pho	4.9	123 Kim Mã, Quận Ba Đình, Hà Nội	Ba Đình	Hà Nội	Quán phở truyền thống lâu đời. Không gian rộng rãi, có menu tiếng Nhật.	123456789	t	21.0313	105.8263		2026-05-25 03:32:51.92453	2026-05-26 15:43:44.736686	5	approved	\N
4	vinhngudubai	vinhsan	Món Việt	0.0	15vietnam	2batrung	Hà Nội	nhà háng bán indomi	123456789	f	0	0	\N	2026-05-27 14:34:22.845458	2026-05-27 15:21:57.963247	10	approved	\N
\.


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

SELECT pg_catalog.setval('public.menu_items_id_seq', 10, true);


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

SELECT pg_catalog.setval('public.restaurants_id_seq', 4, true);


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

