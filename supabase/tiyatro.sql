-- ===========================================================
-- aitekin.com - Tiyatro AI: senaryo tablosu + ses bucket'i
-- ===========================================================
-- Bu SQL'i Supabase Dashboard > SQL Editor uzerinden calistirin
-- ===========================================================

-- 1. Senaryo tablosu
create table if not exists public.tiyatro_scenarios (
  id          text primary key,                                   -- slug ^[a-z0-9][a-z0-9-]{1,63}$
  oyun_adi    text not null,
  karakter    text not null,
  ses_modeli  text not null default 'tr-TR-Wavenet-B',
  ses_ayar    jsonb not null default '{"speakingRate":1.0,"pitch":0}'::jsonb,
  ayarlar     jsonb not null default '{"threshold":0.62,"mode":"sirali","bridgeEnabled":false}'::jsonb,
  replikler   jsonb not null default '[]'::jsonb,
  embed_model text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. updated_at otomatik guncelleme
create or replace function public.tiyatro_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_tiyatro_touch on public.tiyatro_scenarios;
create trigger trg_tiyatro_touch
  before update on public.tiyatro_scenarios
  for each row execute function public.tiyatro_touch_updated_at();

-- 3. RLS: acik, policy YOK -> anon/authenticated erisemez, sadece service role
alter table public.tiyatro_scenarios enable row level security;

-- 4. Ses dosyalari icin PRIVATE bucket (sadece service role + signed URL)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tiyatro-audio', 'tiyatro-audio', false, 10485760, array['audio/mpeg'])
on conflict (id) do nothing;

-- ===========================================================
-- Dogrulama
-- ===========================================================
select id, oyun_adi, jsonb_array_length(replikler) as replik_sayisi, updated_at
from public.tiyatro_scenarios;

select id, public, file_size_limit from storage.buckets where id = 'tiyatro-audio';
