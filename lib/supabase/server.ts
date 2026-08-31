import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** The client used by Server Components and Server Actions. Anon key plus the caller's
 *  session, so every query runs under row level security as that person. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where cookies cannot be written.
            // Middleware refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}
