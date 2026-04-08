-- ===========================================================
-- aitekin.com - Waitlist Tablosu RLS Politikalari
-- ===========================================================
-- Bu SQL'i Supabase Dashboard > SQL Editor uzerinden calistirin
-- ===========================================================

-- 1. Row Level Security'i aktif et
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 2. Mevcut politikalari temizle (varsa)
DROP POLICY IF EXISTS "anon_can_insert" ON public.waitlist;
DROP POLICY IF EXISTS "anon_no_select" ON public.waitlist;
DROP POLICY IF EXISTS "anon_no_update" ON public.waitlist;
DROP POLICY IF EXISTS "anon_no_delete" ON public.waitlist;

-- 3. Anon (anonim/public) icin politikalar:
--    Hicbiri yok cunku /api/waitlist artik service role ile insert yapiyor.
--    Bu, anon key ile direkt Supabase'e yazma denemelerini engeller.

-- ALTERNATIF: Eger ileride client-side direkt insert yapmak istersen:
-- CREATE POLICY "anon_can_insert" ON public.waitlist
--   FOR INSERT TO anon
--   WITH CHECK (true);

-- 4. Service role her seyi yapabilir (varsayilan, RLS bypass)
--    Ekstra politika gerekmiyor.

-- 5. Authenticated kullanicilar SADECE kendi kayitlarini gorebilir
--    (eger ileride kullanici dashboard'undan kendi waitlist durumunu gosterirsek)
CREATE POLICY "authenticated_can_read_own" ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- ===========================================================
-- Dogrulama: Politikalari listele
-- ===========================================================
SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'waitlist';
