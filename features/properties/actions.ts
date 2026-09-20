"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import {
  ALLOWED_FILES_SENTENCE,
  MAX_FILE_BYTES,
  STORAGE_BUCKET,
} from "@/lib/constants";
import { safeName } from "@/lib/storage";

/** FR-007. Admin only; the policy enforces it. */
export async function createProperty(input: {
  ownerId: string;
  name: string;
  community?: string;
  address?: string;
  photo?: File | null;
}): Promise<ActionResult<{ id: string }>> {
  const name = input.name.trim();
  if (!name) return fail("Give the property a name.");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .insert({
      owner_id: input.ownerId,
      name,
      community: input.community?.trim() || null,
      address: input.address?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) return fail("We could not create that property. Try again.");

  if (input.photo && input.photo.size > 0) {
    if (input.photo.size > MAX_FILE_BYTES) {
      // The property exists; only the photo failed, and we say so plainly.
      return fail(`The property was created, but the photo is too large. ${ALLOWED_FILES_SENTENCE}`);
    }

    const path = `${data.id}/photo/${safeName(input.photo.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, input.photo, { contentType: input.photo.type });

    if (!uploadError) {
      await supabase.from("properties").update({ photo_path: path }).eq("id", data.id);
    }
  }

  revalidatePath(`/admin/clients/${input.ownerId}`);
  return ok({ id: data.id });
}

/** The home profile: what the team needs at the door. Admin only by policy. */
export async function updatePropertyProfile(input: {
  id: string;
  ownerId: string;
  name: string;
  community?: string;
  address?: string;
  villaNumber?: string;
  bedrooms?: string;
  accessNotes?: string;
  keyHolders?: string;
  emergencyContacts?: string;
}): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) return fail("Give the property a name.");
  const bedrooms = input.bedrooms ? Number(input.bedrooms) : null;
  if (bedrooms !== null && (!Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms > 20)) {
    return fail("Bedrooms must be a whole number.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      name,
      community: input.community?.trim() || null,
      address: input.address?.trim() || null,
      villa_number: input.villaNumber?.trim() || null,
      bedrooms,
      access_notes: input.accessNotes?.trim() || null,
      key_holders: input.keyHolders?.trim() || null,
      emergency_contacts: input.emergencyContacts?.trim() || null,
    })
    .eq("id", input.id);

  if (error) return fail("We could not save those changes. Try again.");

  revalidatePath(`/admin/clients/${input.ownerId}`);
  revalidatePath(`/properties/${input.id}`);
  revalidatePath("/properties");
  return ok();
}
