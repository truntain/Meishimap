--
-- PostgreSQL database dump
--

\restrict eS6X3nKvRXcgT3SygeFtdxpQvD2DH8hQMnukP8wOm8O1JIpDMpZhiHKrpk9fRIS

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-21 02:22:42

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
-- TOC entry 860 (class 1247 OID 16469)
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'khách hàng',
    'quản lý',
    'chủ nhà hàng'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 16509)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    name character varying(255) NOT NULL,
    name_jp character varying(255),
    category character varying(100) NOT NULL,
    price numeric(10,0) NOT NULL,
    description text,
    description_jp text,
    image_url text,
    badge character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16508)
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
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 223
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- TOC entry 222 (class 1259 OID 16490)
-- Name: restaurants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurants (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    name_jp character varying(255),
    category character varying(100) NOT NULL,
    rating numeric(2,1) DEFAULT 0 NOT NULL,
    address text NOT NULL,
    district character varying(100),
    city character varying(100),
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    description text,
    phone character varying(20),
    image_url text,
    has_japanese_support boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.restaurants OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16489)
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
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 221
-- Name: restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurants_id_seq OWNED BY public.restaurants.id;


--
-- TOC entry 220 (class 1259 OID 16450)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public.users_role_enum DEFAULT 'khách hàng'::public.users_role_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16449)
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
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4879 (class 2604 OID 16512)
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- TOC entry 4874 (class 2604 OID 16493)
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_id_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 16453)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5043 (class 0 OID 16509)
-- Dependencies: 224
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_items (id, restaurant_id, name, name_jp, category, price, description, description_jp, image_url, badge, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5041 (class 0 OID 16490)
-- Dependencies: 222
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurants (id, name, name_jp, category, rating, address, district, city, latitude, longitude, description, phone, image_url, has_japanese_support, created_at, updated_at) FROM stdin;
1	Miyabi Japanese Dining	みやび 日本料理	sushi	4.9	123 Kim Mã, Quận Ba Đình, Hà Nội	Ba Đình	Hà Nội	21.0313	105.8263	\N	\N	\N	t	2026-05-20 02:14:21.140066	2026-05-20 02:14:21.140066
2	Sakura Kaiseki	さくら 懐石料理	kaiseki	4.8	45 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội	Hoàn Kiếm	Hà Nội	21.0264	105.8575	\N	\N	\N	t	2026-05-20 02:14:21.140066	2026-05-20 02:14:21.140066
\.


--
-- TOC entry 5039 (class 0 OID 16450)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, role, is_active, created_at, updated_at, name) FROM stdin;
1	khach1@gmail.com	hashed_password_123	khách hàng	t	2026-05-14 00:32:56.012075+07	2026-05-14 00:32:56.012075+07	Người dùng mặc định
2	admin@gmail.com	hashed_password_456	quản lý	t	2026-05-14 00:32:56.012075+07	2026-05-14 00:32:56.012075+07	Người dùng mặc định
3	owner@gmail.com	hashed_password_789	chủ nhà hàng	t	2026-05-14 00:32:56.012075+07	2026-05-14 00:32:56.012075+07	Người dùng mặc định
4	khach2@gmail.com	hashed_password_000	khách hàng	t	2026-05-14 00:32:56.012075+07	2026-05-14 00:32:56.012075+07	Người dùng mặc định
5	doductuan9999@gmail.com	$2b$10$NoD4Qp49WNBZNT7k5MFTie3wAxPGkeJsXBe1Cjq86Duz2YopO2KSW	khách hàng	t	2026-05-14 00:49:19.28699+07	2026-05-14 00:49:19.28699+07	Đỗ Đức Tuân
6	vinhancut@gmail.com	$2b$10$NgjvFxY.Oid1c2fx07ncu.AsxT9IuC8mtJyDqGu/zzwmZ84jQLuay	khách hàng	t	2026-05-14 01:17:04.068335+07	2026-05-14 01:17:04.068335+07	vinh ngu
7	abcxyz@gmail.com	$2b$10$cqdwnljEMU8OIWg0LFsZwuRvdbuAkr50AApWlJS/it5XqbCktsqLO	khách hàng	t	2026-05-14 14:48:10.680765+07	2026-05-14 14:48:10.680765+07	tuan
8	test@example.com	$2b$10$l.5IbfSidqXNrx/eYXtKjuJHXpR1se4dvUDCbxfsaVeZk.YBEw66q	khách hàng	t	2026-05-20 22:12:50.760249+07	2026-05-20 22:12:50.760249+07	adgsdg
\.


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 223
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 1, false);


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 221
-- Name: restaurants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.restaurants_id_seq', 2, true);


--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- TOC entry 4889 (class 2606 OID 16523)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 16507)
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 16467)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4885 (class 2606 OID 16465)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 16524)
-- Name: menu_items fk_restaurant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT fk_restaurant FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


-- Completed on 2026-05-21 02:22:42

--
-- PostgreSQL database dump complete
--

\unrestrict eS6X3nKvRXcgT3SygeFtdxpQvD2DH8hQMnukP8wOm8O1JIpDMpZhiHKrpk9fRIS

