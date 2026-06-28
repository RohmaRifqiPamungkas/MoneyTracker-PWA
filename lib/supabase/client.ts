import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Supabase client untuk digunakan di komponen "use client".
 * Buat instance baru setiap kali dipanggil — @supabase/ssr menangani
 * caching secara internal agar tidak ada duplikasi koneksi.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
