"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";

/**
 * FR-001, FR-002.
 *
 * `shouldCreateUser: false` is what makes sign-in invite-only: without it Supabase
 * creates an auth user for any address, which would give a stranger an account and an
 * empty app.
 *
 * The identical-response half of FR-002 is this function's job, not the platform's.
 * Supabase returns a distinguishable error for an unregistered address, so we swallow
 * the difference here and return the same result either way. The screen must never
 * reveal who holds an account.
 */
export async function requestSignInLink(email: string): Promise<ActionResult> {
  const address = email.trim().toLowerCase();

  if (!address || !address.includes("@")) {
    return fail("That does not look like an email address.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: address,
    options: { shouldCreateUser: false },
  });

  if (error) {
    // Logged server side only. Never surfaced, never returned.
    console.info("[sign-in] request not fulfilled", { reason: error.message });
  }

  // Deliberately identical whether or not the address is registered.
  return ok();
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

/** FR-006. The signed-in person's own row only; the policy enforces that. */
export async function updateProfile(input: {
  fullName: string;
  phone?: string;
}): Promise<ActionResult> {
  const fullName = input.fullName.trim();
  if (!fullName) return fail("Please give us a name to call you by.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You are not signed in.");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: input.phone?.trim() || null })
    .eq("id", user.id);

  if (error) return fail("That did not save. Try again.");

  revalidatePath("/profile");
  return ok();
}
