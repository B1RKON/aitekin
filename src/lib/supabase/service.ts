import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service role Supabase client - RLS bypass
 * Sadece SERVER-SIDE kullanilabilir, asla browser'a gitmemeli
 *
 * Kullanim: Admin route'larinda (yetki kontrolu OLDUKTAN sonra)
 * waitlist tablosunu yazmak/okumak/silmek icin
 *
 * Eger SUPABASE_SERVICE_ROLE_KEY tanimli degilse mock client doner (geri uyumluluk)
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // Fallback: mock client (Supabase yapilandirilmamis)
    return {
      from: () => ({
        select: () => ({
          order: () => ({ data: [], error: null }),
          eq: () => ({
            single: () => ({ data: null, error: null }),
            maybeSingle: () => ({ data: null, error: null }),
          }),
        }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ eq: () => ({ data: null, error: null }) }),
        delete: () => ({ eq: () => ({ data: null, error: null }) }),
      }),
    } as unknown as ReturnType<typeof createSupabaseClient>;
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
