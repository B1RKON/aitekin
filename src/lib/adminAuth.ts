import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin email listesi (otomatik tanima)
 */
export const ADMIN_EMAILS = ["aytekinbirkon@gmail.com"];

/**
 * Admin yetkisi kontrolu:
 * 1. Eger Supabase session'da admin email varsa -> OK
 * 2. Eger x-admin-secret header'i ADMIN_SECRET ile eslesiyorsa -> OK
 * 3. Query param ?secret=... (geriye uyumluluk)
 */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  // 1. Supabase session kontrolu
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const email = data?.user?.email?.toLowerCase();
    if (email && ADMIN_EMAILS.includes(email)) {
      return true;
    }
  } catch {
    // supabase yapilandirilmamis olabilir
  }

  // 2. Header secret
  const headerSecret = req.headers.get("x-admin-secret");
  if (headerSecret && headerSecret === process.env.ADMIN_SECRET) {
    return true;
  }

  // 3. Query param secret (geriye uyumluluk)
  const querySecret = req.nextUrl.searchParams.get("secret");
  if (querySecret && querySecret === process.env.ADMIN_SECRET) {
    return true;
  }

  return false;
}
