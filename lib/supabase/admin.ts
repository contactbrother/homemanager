import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requiredEnv } from "@/lib/env";

/**
 * The service role client.
 *
 * Confined to the three operations below, which act on `auth.users` and cannot be
 * expressed in row level security. It is never used to read or write application
 * tables: `is_admin()` in the policies already grants the team full access through
 * the ordinary anon key and their own session.
 *
 * This is stricter than section 2.3 of the build plan, which reads as though all
 * admin operations need the service role. They do not, and confining it means a bug
 * in an admin data path returns nothing rather than bypassing every policy.
 * See research.md R6.
 */
function adminAuth() {
  const client = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  return client.auth.admin;
}

/** Registers a client's email address and sends their first sign-in link.
 *  Registering the address is what makes the invite-only rule in FR-002 possible. */
export async function inviteClient(email: string, fullName: string) {
  return adminAuth().inviteUserByEmail(email, {
    data: { full_name: fullName },
  });
}

/** FR-046. Stops new sign-ins. Existing tokens are handled by middleware and by
 *  `is_active()` in the policies, because a ban does not invalidate a live token. */
export async function banUser(userId: string) {
  return adminAuth().updateUserById(userId, { ban_duration: "876000h" });
}

/** FR-055. Reverses a deactivation made in error. */
export async function unbanUser(userId: string) {
  return adminAuth().updateUserById(userId, { ban_duration: "none" });
}
