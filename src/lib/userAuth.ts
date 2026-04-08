import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAILS } from "@/lib/adminAuth";

/**
 * Onayli kullanici kontrolu (server-side)
 *
 * Onayli sayilanlar:
 * - Admin email (ADMIN_EMAILS listesinde)
 * - Waitlist'te status="invited" veya status="registered"
 *
 * Diger durumlar (waiting, rejected, hic kayitli degil) -> false
 *
 * Kullanim: Tool API route'larinda auth gate olarak.
 * Eger Supabase yapilandirilmamissa fail-open (true doner) - geri uyumluluk.
 */
export async function isApprovedUser(): Promise<{
  approved: boolean;
  isAdmin: boolean;
  email: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const email = data?.user?.email?.toLowerCase() ?? null;

    if (!email) {
      return { approved: false, isAdmin: false, email: null };
    }

    if (ADMIN_EMAILS.includes(email)) {
      return { approved: true, isAdmin: true, email };
    }

    const { data: row } = await supabase
      .from("waitlist")
      .select("status")
      .eq("email", email)
      .maybeSingle();

    const status = row?.status;
    const approved = status === "invited" || status === "registered";

    return { approved, isAdmin: false, email };
  } catch {
    // Supabase yapilandirilmamis - eski davranis (fail-open)
    return { approved: true, isAdmin: false, email: null };
  }
}

/**
 * Json error response (auth gate fail)
 */
export const NOT_APPROVED_RESPONSE = {
  error: "Bu özelliği kullanmak için bekleme listesinden onaylanmanız gerekiyor.",
  code: "NOT_APPROVED",
};
