import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/** The signed-in person, or null. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile) ?? null;
}

export async function requireSession(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");
  return profile;
}

/** FR-046. A deactivated person keeps no access, even mid-session. Middleware also
 *  checks this, and `is_active()` in the policies is the real guarantee; this is the
 *  layer that gives them a sensible screen rather than an empty one. */
export async function requireActive(): Promise<Profile> {
  const profile = await requireSession();
  if (profile.deactivated_at) redirect("/sign-in?ended=1");
  return profile;
}

export async function requireClient(): Promise<Profile> {
  const profile = await requireActive();
  if (profile.role !== "client") redirect("/admin");
  return profile;
}

/** FR-005. 404 rather than 403, so the admin area's existence is not confirmed to
 *  someone who should not know about it. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireActive();
  if (profile.role !== "admin") notFound();
  return profile;
}
