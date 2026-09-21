-- ===========================================================
-- aitekin.com - Tiyatro AI: karakter ses profilleri (cok karakter destegi)
-- ===========================================================
-- Bu SQL'i Supabase Dashboard > SQL Editor uzerinden calistirin.
-- Mevcut senaryolar silinmez; eski tek sesli kayitlar okunurken
-- otomatik olarak tek profilli yeni yapiya cevrilir.
-- ===========================================================

-- 1. Profil sutunu
alter table public.tiyatro_scenarios
  add column if not exists profiller jsonb not null default '[]'::jsonb;

-- 2. Eski tek sesli sutunlar artik zorunlu degil (yeni kayitlar bunlari yazmaz)
alter table public.tiyatro_scenarios alter column ses_modeli drop not null;
alter table public.tiyatro_scenarios alter column ses_modeli drop default;

-- ===========================================================
-- Dogrulama
-- ===========================================================
select
  id,
  oyun_adi,
  karakter,
  jsonb_array_length(profiller)  as profil_sayisi,
  jsonb_array_length(replikler)  as replik_sayisi,
  ses_modeli                     as eski_ses
from public.tiyatro_scenarios
order by updated_at desc;
