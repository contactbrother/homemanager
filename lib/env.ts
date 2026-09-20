/**
 * Reads a required environment variable and fails loudly when it is missing, so a
 * misconfigured deployment breaks at the first request with a clear message rather
 * than as an opaque 500 somewhere downstream.
 *
 * The two public values are read by their literal names because Next.js only inlines
 * `process.env.NEXT_PUBLIC_*` into browser bundles when the name is written out.
 */
export function requiredEnv(name: string, value = process.env[name]): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Set it in the Vercel project settings and redeploy.`,
    );
  }
  return value;
}

export const SUPABASE_URL = requiredEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
export const SUPABASE_ANON_KEY = requiredEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
