import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock client that doesn't throw when credentials aren't configured
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase henüz yapılandırılmamış" } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase henüz yapılandırılmamış" } }),
        signInWithOAuth: async () => ({ data: { provider: "", url: "" }, error: { message: "Supabase henüz yapılandırılmamış" } }),
        signOut: async () => ({ error: null }),
      },
    } as unknown as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, key);
}
