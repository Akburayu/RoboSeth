CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: entegrator_buyuklugu; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.entegrator_buyuklugu AS ENUM (
    'kucuk',
    'orta',
    'buyuk'
);


--
-- Name: firma_olcegi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.firma_olcegi AS ENUM (
    'kucuk',
    'orta',
    'buyuk',
    'global'
);


--
-- Name: ihale_durumu; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ihale_durumu AS ENUM (
    'aktif',
    'beklemede',
    'tamamlandi',
    'iptal'
);


--
-- Name: ihale_turu; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ihale_turu AS ENUM (
    'acik_eksiltme',
    'ingiliz',
    'hollanda',
    'japon',
    'turlu_kapali',
    'muhurlu_kapali'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'firma',
    'entegrator'
);


--
-- Name: has_role(uuid, public.user_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.user_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: notify_on_new_teklif(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_on_new_teklif() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    firma_user_id UUID;
    entegrator_user_id UUID;
    ilan_baslik TEXT;
BEGIN
    -- Get firma user_id from ilan
    SELECT f.user_id, i.baslik INTO firma_user_id, ilan_baslik
    FROM public.ilanlar i
    JOIN public.firma f ON i.firma_id = f.id
    WHERE i.id = NEW.ilan_id;
    
    -- Get entegrator user_id
    SELECT user_id INTO entegrator_user_id
    FROM public.entegrator
    WHERE id = NEW.entegrator_id;
    
    -- Notify firma about new proposal
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
        firma_user_id,
        'new_proposal',
        'Yeni Teklif Aldınız',
        'İlanınıza yeni bir teklif geldi: ' || COALESCE(ilan_baslik, 'İlan'),
        NEW.id
    );
    
    -- Notify entegrator about their submission
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
        entegrator_user_id,
        'proposal_sent',
        'Teklifiniz Gönderildi',
        'Teklifiniz başarıyla gönderildi: ' || COALESCE(ilan_baslik, 'İlan'),
        NEW.id
    );
    
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: entegrator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entegrator (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    entegrator_adi character varying(255) NOT NULL,
    faaliyet_alanlari text,
    uzmanlik_alani text,
    referans text,
    kac_kisi integer,
    tecrube character varying(255),
    sektor character varying(255),
    iletisim_sosyal_medya text,
    konum character varying(255),
    hizmet_verilen_iller text,
    yorumlar text,
    puan double precision DEFAULT 0,
    entegrator_buyuklugu public.entegrator_buyuklugu DEFAULT 'kucuk'::public.entegrator_buyuklugu,
    belgesi1 character varying(255),
    belgesi2 character varying(255),
    belgesi3 character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    email character varying
);


--
-- Name: firma; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.firma (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    firma_adi character varying(255) NOT NULL,
    belgesi1 character varying(255),
    belgesi2 character varying(255),
    belgesi3 character varying(255),
    firma_tanitim_yazisi text,
    firma_olcegi public.firma_olcegi DEFAULT 'kucuk'::public.firma_olcegi NOT NULL,
    kredi integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    belgesi4 character varying,
    email character varying
);


--
-- Name: firma_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.firma_ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    firma_id uuid NOT NULL,
    entegrator_id uuid NOT NULL,
    kalite_puan integer NOT NULL,
    musteri_iliskisi_puan integer NOT NULL,
    surec_yonetimi_puan integer NOT NULL,
    yorum text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT firma_ratings_kalite_puan_check CHECK (((kalite_puan >= 1) AND (kalite_puan <= 5))),
    CONSTRAINT firma_ratings_musteri_iliskisi_puan_check CHECK (((musteri_iliskisi_puan >= 1) AND (musteri_iliskisi_puan <= 5))),
    CONSTRAINT firma_ratings_surec_yonetimi_puan_check CHECK (((surec_yonetimi_puan >= 1) AND (surec_yonetimi_puan <= 5)))
);


--
-- Name: ihale_katilimcilar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ihale_katilimcilar (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ihale_id uuid NOT NULL,
    entegrator_id uuid NOT NULL,
    aktif boolean DEFAULT true,
    son_onay_turu integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ihale_teklifleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ihale_teklifleri (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ihale_id uuid NOT NULL,
    entegrator_id uuid NOT NULL,
    teklif_tutari integer NOT NULL,
    tur_no integer DEFAULT 1,
    durum text DEFAULT 'aktif'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ihaleler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ihaleler (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    firma_id uuid NOT NULL,
    ihale_turu public.ihale_turu NOT NULL,
    baslik text NOT NULL,
    aciklama text,
    teknik_sartlar text,
    dokuman_url text,
    baslangic_fiyati integer,
    minimum_fiyat integer,
    fiyat_adimi integer DEFAULT 100,
    mevcut_fiyat integer,
    deadline timestamp with time zone NOT NULL,
    mevcut_tur integer DEFAULT 1,
    toplam_tur integer DEFAULT 3,
    durum public.ihale_durumu DEFAULT 'aktif'::public.ihale_durumu NOT NULL,
    kazanan_entegrator_id uuid,
    kazanan_teklif integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ilanlar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ilanlar (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    firma_id uuid NOT NULL,
    aranan_faaliyet_alanlari text,
    aranan_uzmanlik text,
    aranan_sektor text,
    aranan_tecrube text,
    aranan_kisiler text,
    aciklama text,
    created_at timestamp with time zone DEFAULT now(),
    baslik text,
    butce_min integer,
    butce_max integer,
    son_tarih date,
    hizmet_verilen_iller text
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    gonderen_id uuid NOT NULL,
    alan_id uuid NOT NULL,
    mesaj text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    conversation_id uuid,
    ilan_id uuid
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text,
    related_id uuid,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: revealed_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revealed_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    firma_id uuid NOT NULL,
    entegrator_id uuid NOT NULL,
    harcanan_kredi integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: teklifler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teklifler (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ilan_id uuid NOT NULL,
    entegrator_id uuid NOT NULL,
    mesaj text,
    created_at timestamp with time zone DEFAULT now(),
    teklif_tutari integer
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: entegrator entegrator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entegrator
    ADD CONSTRAINT entegrator_pkey PRIMARY KEY (id);


--
-- Name: firma firma_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma
    ADD CONSTRAINT firma_pkey PRIMARY KEY (id);


--
-- Name: firma_ratings firma_ratings_firma_id_entegrator_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma_ratings
    ADD CONSTRAINT firma_ratings_firma_id_entegrator_id_key UNIQUE (firma_id, entegrator_id);


--
-- Name: firma_ratings firma_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma_ratings
    ADD CONSTRAINT firma_ratings_pkey PRIMARY KEY (id);


--
-- Name: ihale_katilimcilar ihale_katilimcilar_ihale_id_entegrator_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihale_katilimcilar
    ADD CONSTRAINT ihale_katilimcilar_ihale_id_entegrator_id_key UNIQUE (ihale_id, entegrator_id);


--
-- Name: ihale_katilimcilar ihale_katilimcilar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihale_katilimcilar
    ADD CONSTRAINT ihale_katilimcilar_pkey PRIMARY KEY (id);


--
-- Name: ihale_teklifleri ihale_teklifleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihale_teklifleri
    ADD CONSTRAINT ihale_teklifleri_pkey PRIMARY KEY (id);


--
-- Name: ihaleler ihaleler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihaleler
    ADD CONSTRAINT ihaleler_pkey PRIMARY KEY (id);


--
-- Name: ilanlar ilanlar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ilanlar
    ADD CONSTRAINT ilanlar_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: revealed_contacts revealed_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revealed_contacts
    ADD CONSTRAINT revealed_contacts_pkey PRIMARY KEY (id);


--
-- Name: teklifler teklifler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT teklifler_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_ilan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_ilan ON public.messages USING btree (ilan_id);


--
-- Name: teklifler on_new_teklif; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_new_teklif AFTER INSERT ON public.teklifler FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_teklif();


--
-- Name: firma_ratings update_firma_ratings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_firma_ratings_updated_at BEFORE UPDATE ON public.firma_ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ihaleler update_ihaleler_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ihaleler_updated_at BEFORE UPDATE ON public.ihaleler FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: entegrator entegrator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entegrator
    ADD CONSTRAINT entegrator_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: firma firma_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma
    ADD CONSTRAINT firma_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ihale_katilimcilar ihale_katilimcilar_entegrator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihale_katilimcilar
    ADD CONSTRAINT ihale_katilimcilar_entegrator_id_fkey FOREIGN KEY (entegrator_id) REFERENCES public.entegrator(id) ON DELETE CASCADE;


--
-- Name: ihale_katilimcilar ihale_katilimcilar_ihale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihale_katilimcilar
    ADD CONSTRAINT ihale_katilimcilar_ihale_id_fkey FOREIGN KEY (ihale_id) REFERENCES public.ihaleler(id) ON DELETE CASCADE;


--
-- Name: ihale_teklifleri ihale_teklifleri_entegrator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihale_teklifleri
    ADD CONSTRAINT ihale_teklifleri_entegrator_id_fkey FOREIGN KEY (entegrator_id) REFERENCES public.entegrator(id) ON DELETE CASCADE;


--
-- Name: ihale_teklifleri ihale_teklifleri_ihale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihale_teklifleri
    ADD CONSTRAINT ihale_teklifleri_ihale_id_fkey FOREIGN KEY (ihale_id) REFERENCES public.ihaleler(id) ON DELETE CASCADE;


--
-- Name: ihaleler ihaleler_firma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihaleler
    ADD CONSTRAINT ihaleler_firma_id_fkey FOREIGN KEY (firma_id) REFERENCES public.firma(id) ON DELETE CASCADE;


--
-- Name: ihaleler ihaleler_kazanan_entegrator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ihaleler
    ADD CONSTRAINT ihaleler_kazanan_entegrator_id_fkey FOREIGN KEY (kazanan_entegrator_id) REFERENCES public.entegrator(id);


--
-- Name: ilanlar ilanlar_firma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ilanlar
    ADD CONSTRAINT ilanlar_firma_id_fkey FOREIGN KEY (firma_id) REFERENCES public.firma(id) ON DELETE CASCADE;


--
-- Name: messages messages_alan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_alan_id_fkey FOREIGN KEY (alan_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_gonderen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_gonderen_id_fkey FOREIGN KEY (gonderen_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_ilan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_ilan_id_fkey FOREIGN KEY (ilan_id) REFERENCES public.ilanlar(id);


--
-- Name: revealed_contacts revealed_contacts_entegrator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revealed_contacts
    ADD CONSTRAINT revealed_contacts_entegrator_id_fkey FOREIGN KEY (entegrator_id) REFERENCES public.entegrator(id) ON DELETE CASCADE;


--
-- Name: revealed_contacts revealed_contacts_firma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revealed_contacts
    ADD CONSTRAINT revealed_contacts_firma_id_fkey FOREIGN KEY (firma_id) REFERENCES public.firma(id) ON DELETE CASCADE;


--
-- Name: teklifler teklifler_entegrator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT teklifler_entegrator_id_fkey FOREIGN KEY (entegrator_id) REFERENCES public.entegrator(id) ON DELETE CASCADE;


--
-- Name: teklifler teklifler_ilan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT teklifler_ilan_id_fkey FOREIGN KEY (ilan_id) REFERENCES public.ilanlar(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: entegrator Anyone can view entegrator profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view entegrator profiles" ON public.entegrator FOR SELECT USING (true);


--
-- Name: firma Anyone can view firma listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view firma listings" ON public.firma FOR SELECT USING (true);


--
-- Name: revealed_contacts Açılan iletişimler firma sahiplerine görünür; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Açılan iletişimler firma sahiplerine görünür" ON public.revealed_contacts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.firma
  WHERE ((firma.id = revealed_contacts.firma_id) AND (firma.user_id = auth.uid())))));


--
-- Name: entegrator Entegratorler herkese açık okunabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Entegratorler herkese açık okunabilir" ON public.entegrator FOR SELECT USING (true);


--
-- Name: ihale_katilimcilar Entegratorler katılabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Entegratorler katılabilir" ON public.ihale_katilimcilar FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.entegrator
  WHERE ((entegrator.id = ihale_katilimcilar.entegrator_id) AND (entegrator.user_id = auth.uid())))));


--
-- Name: ihale_katilimcilar Entegratorler kendi katılımlarını güncelleyebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Entegratorler kendi katılımlarını güncelleyebilir" ON public.ihale_katilimcilar FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.entegrator
  WHERE ((entegrator.id = ihale_katilimcilar.entegrator_id) AND (entegrator.user_id = auth.uid())))));


--
-- Name: ihale_teklifleri Entegratorler kendi tekliflerini güncelleyebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Entegratorler kendi tekliflerini güncelleyebilir" ON public.ihale_teklifleri FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.entegrator
  WHERE ((entegrator.id = ihale_teklifleri.entegrator_id) AND (entegrator.user_id = auth.uid())))));


--
-- Name: teklifler Entegratorler kendi tekliflerini güncelleyebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Entegratorler kendi tekliflerini güncelleyebilir" ON public.teklifler FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.entegrator
  WHERE ((entegrator.id = teklifler.entegrator_id) AND (entegrator.user_id = auth.uid())))));


--
-- Name: teklifler Entegratorler kendi tekliflerini silebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Entegratorler kendi tekliflerini silebilir" ON public.teklifler FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.entegrator
  WHERE ((entegrator.id = teklifler.entegrator_id) AND (entegrator.user_id = auth.uid())))));


--
-- Name: teklifler Entegratorler teklif oluşturabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Entegratorler teklif oluşturabilir" ON public.teklifler FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.entegrator
  WHERE ((entegrator.id = teklifler.entegrator_id) AND (entegrator.user_id = auth.uid())))));


--
-- Name: ihale_teklifleri Entegratorler teklif verebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Entegratorler teklif verebilir" ON public.ihale_teklifleri FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.entegrator
  WHERE ((entegrator.id = ihale_teklifleri.entegrator_id) AND (entegrator.user_id = auth.uid())))));


--
-- Name: entegrator Entegrators can manage their own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Entegrators can manage their own data" ON public.entegrator USING ((auth.uid() = user_id));


--
-- Name: firma Firma owners can manage their own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firma owners can manage their own data" ON public.firma USING ((auth.uid() = user_id));


--
-- Name: ihaleler Firma sahipleri ihale oluşturabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firma sahipleri ihale oluşturabilir" ON public.ihaleler FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.firma
  WHERE ((firma.id = ihaleler.firma_id) AND (firma.user_id = auth.uid())))));


--
-- Name: ihaleler Firma sahipleri ihalelerini güncelleyebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firma sahipleri ihalelerini güncelleyebilir" ON public.ihaleler FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.firma
  WHERE ((firma.id = ihaleler.firma_id) AND (firma.user_id = auth.uid())))));


--
-- Name: ihaleler Firma sahipleri ihalelerini silebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firma sahipleri ihalelerini silebilir" ON public.ihaleler FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.firma
  WHERE ((firma.id = ihaleler.firma_id) AND (firma.user_id = auth.uid())))));


--
-- Name: ilanlar Firma sahipleri ilan oluşturabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firma sahipleri ilan oluşturabilir" ON public.ilanlar FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.firma
  WHERE ((firma.id = ilanlar.firma_id) AND (firma.user_id = auth.uid())))));


--
-- Name: ilanlar Firma sahipleri ilanlarını güncelleyebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firma sahipleri ilanlarını güncelleyebilir" ON public.ilanlar FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.firma
  WHERE ((firma.id = ilanlar.firma_id) AND (firma.user_id = auth.uid())))));


--
-- Name: ilanlar Firma sahipleri ilanlarını silebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firma sahipleri ilanlarını silebilir" ON public.ilanlar FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.firma
  WHERE ((firma.id = ilanlar.firma_id) AND (firma.user_id = auth.uid())))));


--
-- Name: firma Firmalar herkese açık okunabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firmalar herkese açık okunabilir" ON public.firma FOR SELECT USING (true);


--
-- Name: revealed_contacts Firmalar iletişim açabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firmalar iletişim açabilir" ON public.revealed_contacts FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.firma
  WHERE ((firma.id = revealed_contacts.firma_id) AND (firma.user_id = auth.uid())))));


--
-- Name: firma_ratings Firmalar iletişim açtıkları entegratörleri değerlendirebi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firmalar iletişim açtıkları entegratörleri değerlendirebi" ON public.firma_ratings FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.firma f
  WHERE ((f.id = firma_ratings.firma_id) AND (f.user_id = auth.uid())))) AND (EXISTS ( SELECT 1
   FROM public.revealed_contacts rc
  WHERE ((rc.firma_id = firma_ratings.firma_id) AND (rc.entegrator_id = firma_ratings.entegrator_id))))));


--
-- Name: firma_ratings Firmalar kendi değerlendirmelerini güncelleyebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firmalar kendi değerlendirmelerini güncelleyebilir" ON public.firma_ratings FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.firma f
  WHERE ((f.id = firma_ratings.firma_id) AND (f.user_id = auth.uid())))));


--
-- Name: firma_ratings Firmalar kendi değerlendirmelerini silebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firmalar kendi değerlendirmelerini silebilir" ON public.firma_ratings FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.firma f
  WHERE ((f.id = firma_ratings.firma_id) AND (f.user_id = auth.uid())))));


--
-- Name: firma_ratings Firmalar tüm değerlendirmeleri görebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Firmalar tüm değerlendirmeleri görebilir" ON public.firma_ratings FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.firma f
  WHERE (f.user_id = auth.uid()))));


--
-- Name: ihale_katilimcilar Katılımcılar görülebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Katılımcılar görülebilir" ON public.ihale_katilimcilar FOR SELECT USING (true);


--
-- Name: entegrator Kullanıcılar kendi entegrator profillerini güncelleyebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Kullanıcılar kendi entegrator profillerini güncelleyebilir" ON public.entegrator FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: entegrator Kullanıcılar kendi entegrator profillerini oluşturabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Kullanıcılar kendi entegrator profillerini oluşturabilir" ON public.entegrator FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: entegrator Kullanıcılar kendi entegrator profillerini silebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Kullanıcılar kendi entegrator profillerini silebilir" ON public.entegrator FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: firma Kullanıcılar kendi firmalarını güncelleyebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Kullanıcılar kendi firmalarını güncelleyebilir" ON public.firma FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: firma Kullanıcılar kendi firmalarını oluşturabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Kullanıcılar kendi firmalarını oluşturabilir" ON public.firma FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: firma Kullanıcılar kendi firmalarını silebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Kullanıcılar kendi firmalarını silebilir" ON public.firma FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: messages Kullanıcılar kendi mesajlarını görebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Kullanıcılar kendi mesajlarını görebilir" ON public.messages FOR SELECT USING (((auth.uid() = gonderen_id) OR (auth.uid() = alan_id)));


--
-- Name: messages Kullanıcılar mesaj gönderebilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Kullanıcılar mesaj gönderebilir" ON public.messages FOR INSERT WITH CHECK ((auth.uid() = gonderen_id));


--
-- Name: notifications System can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: user_roles System can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert roles" ON public.user_roles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ihale_teklifleri Teklifler ilgili taraflara görünür; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teklifler ilgili taraflara görünür" ON public.ihale_teklifleri FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.entegrator
  WHERE ((entegrator.id = ihale_teklifleri.entegrator_id) AND (entegrator.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (public.ihaleler i
     JOIN public.firma f ON ((i.firma_id = f.id)))
  WHERE ((i.id = ihale_teklifleri.ihale_id) AND (f.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.ihaleler i
  WHERE ((i.id = ihale_teklifleri.ihale_id) AND (i.ihale_turu = ANY (ARRAY['acik_eksiltme'::public.ihale_turu, 'ingiliz'::public.ihale_turu])))))));


--
-- Name: teklifler Teklifler ilgili taraflara görünür; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teklifler ilgili taraflara görünür" ON public.teklifler FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.entegrator
  WHERE ((entegrator.id = teklifler.entegrator_id) AND (entegrator.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (public.ilanlar i
     JOIN public.firma f ON ((i.firma_id = f.id)))
  WHERE ((i.id = teklifler.ilan_id) AND (f.user_id = auth.uid()))))));


--
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: entegrator; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.entegrator ENABLE ROW LEVEL SECURITY;

--
-- Name: firma; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.firma ENABLE ROW LEVEL SECURITY;

--
-- Name: firma_ratings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.firma_ratings ENABLE ROW LEVEL SECURITY;

--
-- Name: ihale_katilimcilar; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ihale_katilimcilar ENABLE ROW LEVEL SECURITY;

--
-- Name: ihale_teklifleri; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ihale_teklifleri ENABLE ROW LEVEL SECURITY;

--
-- Name: ihaleler; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ihaleler ENABLE ROW LEVEL SECURITY;

--
-- Name: ilanlar; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ilanlar ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: revealed_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.revealed_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: teklifler; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teklifler ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: ihaleler İhaleler herkese açık okunabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "İhaleler herkese açık okunabilir" ON public.ihaleler FOR SELECT USING (true);


--
-- Name: ilanlar İlanlar herkese açık okunabilir; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "İlanlar herkese açık okunabilir" ON public.ilanlar FOR SELECT USING (true);


--
-- PostgreSQL database dump complete
--


