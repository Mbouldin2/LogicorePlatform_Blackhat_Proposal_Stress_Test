"use client";
import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client. Returns null in demo mode so the UI can short-circuit
 *  auth calls and treat the user as the demo operator. */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
