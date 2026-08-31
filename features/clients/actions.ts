"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { banUser, inviteClient, unbanUser } from "@/lib/supabase/admin";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";

/**
 * FR-036. Creates the client's auth user and sends their first sign-in link. The
 * `handle_new_user` trigger creates the matching profile row.
 *
 * Registering the address here is what makes the invite-only rule in FR-002 possible:
 * sign-in refuses anything that has not been through this action.
 */
export async function createClientAccount(input: {
  email: string;
  fullName: string;
}): Promise<ActionResult<{ id: string }>> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  if (!email.includes("@")) return fail("That does not look like an email address.");
  if (!fullName) return fail("Give the client a name.");

  const { data, error } = await inviteClient(email, fullName);

  if (error || !data?.user) {
    if (error?.message?.toLowerCase().includes("already")) {
      return fail("That email address already has an account.");
    }
    return fail("We could not create that client. Try again.");
  }

  // The trigger sets full_name from the invite metadata, but only when it is present.
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", data.user.id);

  revalidatePath("/admin");
  return ok({ id: data.user.id });
}

/**
 * FR-046, FR-047. Access stops immediately and the deactivation moment is recorded,
 * which starts the 90 day clock in FR-048. Nothing acts on that clock automatically
 * in this release; deletion at 90 days is a manual team action.
 */
export async function deactivateClient(profileId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ deactivated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return fail("We could not deactivate that client. Try again.");

  const { error: banError } = await banUser(profileId);
  if (banError) {
    // The row is the source of truth for is_active(), so access has already stopped.
    console.error("[deactivate] ban failed, row already set", banError.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${profileId}`);
  return ok();
}

/** FR-055. Reverses a deactivation made in error, from the same screen. */
export async function reactivateClient(profileId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ deactivated_at: null })
    .eq("id", profileId);

  if (error) return fail("We could not restore that client. Try again.");

  await unbanUser(profileId);

  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${profileId}`);
  return ok();
}
