--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Servicios; Type: TABLE; Schema: public; Owner: EleStuAdmin
--

CREATE TABLE public."Servicios" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    price numeric NOT NULL,
    userid integer,
    image text
);


ALTER TABLE public."Servicios" OWNER TO "EleStuAdmin";

--
-- Name: Studios; Type: TABLE; Schema: public; Owner: EleStuAdmin
--

CREATE TABLE public."Studios" (
    id integer NOT NULL,
    name character varying NOT NULL,
    address character varying NOT NULL,
    location json NOT NULL,
    "mapsPlaceId" character varying NOT NULL
);


ALTER TABLE public."Studios" OWNER TO "EleStuAdmin";

--
-- Name: Usuarios; Type: TABLE; Schema: public; Owner: EleStuAdmin
--

CREATE TABLE public."Usuarios" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL
);


ALTER TABLE public."Usuarios" OWNER TO "EleStuAdmin";

--
-- Name: Usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: EleStuAdmin
--

CREATE SEQUENCE public."Usuarios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Usuarios_id_seq" OWNER TO "EleStuAdmin";

--
-- Name: Usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: EleStuAdmin
--

ALTER SEQUENCE public."Usuarios_id_seq" OWNED BY public."Usuarios".id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: EleStuAdmin
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO "EleStuAdmin";

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: EleStuAdmin
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO "EleStuAdmin";

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: EleStuAdmin
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: servicios_id_seq; Type: SEQUENCE; Schema: public; Owner: EleStuAdmin
--

CREATE SEQUENCE public.servicios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servicios_id_seq OWNER TO "EleStuAdmin";

--
-- Name: servicios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: EleStuAdmin
--

ALTER SEQUENCE public.servicios_id_seq OWNED BY public."Servicios".id;


--
-- Name: studio_id_seq; Type: SEQUENCE; Schema: public; Owner: EleStuAdmin
--

CREATE SEQUENCE public.studio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.studio_id_seq OWNER TO "EleStuAdmin";

--
-- Name: studio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: EleStuAdmin
--

ALTER SEQUENCE public.studio_id_seq OWNED BY public."Studios".id;


--
-- Name: Servicios id; Type: DEFAULT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public."Servicios" ALTER COLUMN id SET DEFAULT nextval('public.servicios_id_seq'::regclass);


--
-- Name: Studios id; Type: DEFAULT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public."Studios" ALTER COLUMN id SET DEFAULT nextval('public.studio_id_seq'::regclass);


--
-- Name: Usuarios id; Type: DEFAULT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public."Usuarios" ALTER COLUMN id SET DEFAULT nextval('public."Usuarios_id_seq"'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: Servicios; Type: TABLE DATA; Schema: public; Owner: EleStuAdmin
--

COPY public."Servicios" (id, title, description, price, userid, image) FROM stdin;
\.


--
-- Data for Name: Studios; Type: TABLE DATA; Schema: public; Owner: EleStuAdmin
--

COPY public."Studios" (id, name, address, location, "mapsPlaceId") FROM stdin;
\.


--
-- Data for Name: Usuarios; Type: TABLE DATA; Schema: public; Owner: EleStuAdmin
--

COPY public."Usuarios" (id, name, email, password) FROM stdin;
2	Ayoubb	ayoubmisbahfat.al19@emiliojimeno.edu.es	123456
3	Juanan	janunez@emiliojimeno.edu.es	123456
4	admin	admin@admin.com	123456
0	admin	admin	0000
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: EleStuAdmin
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
\.


--
-- Name: Usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: EleStuAdmin
--

SELECT pg_catalog.setval('public."Usuarios_id_seq"', 4, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: EleStuAdmin
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, false);


--
-- Name: servicios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: EleStuAdmin
--

SELECT pg_catalog.setval('public.servicios_id_seq', 13, true);


--
-- Name: studio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: EleStuAdmin
--

SELECT pg_catalog.setval('public.studio_id_seq', 1, false);


--
-- Name: Studios PK_4c17ecb2b175322407ebbaef5c7; Type: CONSTRAINT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public."Studios"
    ADD CONSTRAINT "PK_4c17ecb2b175322407ebbaef5c7" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: Usuarios UQ_ca3e46c76538a31e48348447503; Type: CONSTRAINT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public."Usuarios"
    ADD CONSTRAINT "UQ_ca3e46c76538a31e48348447503" UNIQUE (email);


--
-- Name: Usuarios Usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public."Usuarios"
    ADD CONSTRAINT "Usuarios_pkey" PRIMARY KEY (id);


--
-- Name: Servicios servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public."Servicios"
    ADD CONSTRAINT servicios_pkey PRIMARY KEY (id);


--
-- Name: Servicios servicios_usuarioid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: EleStuAdmin
--

ALTER TABLE ONLY public."Servicios"
    ADD CONSTRAINT servicios_usuarioid_fkey FOREIGN KEY (userid) REFERENCES public."Usuarios"(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO "EleStuAdmin";


--
-- PostgreSQL database dump complete
--

