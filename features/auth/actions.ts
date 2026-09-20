"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import { ACTOR_CACHE_COOKIE, MIN_PASSWORD_LENGTH } from "@/lib/constants";

/**
 * FR-001 (revised). Email and password sign-in.
 *
 * The magic-link flow was replaced because the built-in mailer's hourly allowance made
 * testing impractical and links opened in a different browser could not complete the
 * PKCE exchange. The identical-response rule from FR-002 is kept in spirit: a wrong
 * password and an unknown address produce the same message.
 */
export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !email.includes("@")) {
    return fail("That does not look like an email address.");
  }
  if (!password) return fail("Enter your password.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.info("[sign-in] refused", { reason: error.message });
    return fail("Email or password is incorrect.");
  }

  await clearActorCache();
  // Middleware routes to /admin or / by role on the next request.
  redirect("/");
}

/**
 * Self-service sign-up. Every account created here is a client; the
 * `handle_new_user` trigger creates the profile row from the `full_name` metadata,
 * and admin is only ever granted by the team directly in the database.
 *
 * When "Confirm email" is on in Supabase, sign-up returns a user with no session and
 * the person must click the emailed link first. The form explains that case.
 */
export async function signUpWithPassword(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<ActionResult<{ needsConfirmation: boolean }>> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!fullName) return fail("Give us a name to call you by.");
  if (!email || !email.includes("@")) {
    return fail("That does not look like an email address.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail(`Use a password of at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    console.info("[sign-up] refused", { reason: error.message });
    if (error.message.toLowerCase().includes("already")) {
      return fail("That email address already has an account. Sign in instead.");
    }
    return fail("We could not create your account. Try again.");
  }

  // Supabase returns a user with an empty identities list when the address is already
  // registered and confirmation is on, rather than an error. Treat it as taken.
  if (data.user && data.user.identities?.length === 0) {
    return fail("That email address already has an account. Sign in instead.");
  }

  if (!data.session) return ok({ needsConfirmation: true });

  await clearActorCache();
  redirect("/");
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearActorCache();
  redirect("/sign-in");
}

/** The middleware caches the signed-in person's role in a cookie. Any change of
 *  account must drop it, or the next person routes as the previous one. */
async function clearActorCache() {
  const store = await cookies();
  store.delete(ACTOR_CACHE_COOKIE);
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
