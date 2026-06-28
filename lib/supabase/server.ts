import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Supabase client untuk digunakan di Server Components, Server Actions,
 * dan Route Handlers. Menggunakan Next.js cookies() agar session aman di sisi server.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll bisa dipanggil dari Server Component — boleh diabaikan
            // jika Anda punya middleware untuk refresh session.
          }
        },
      },
    }
  );
}
