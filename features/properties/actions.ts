"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import {
  ALLOWED_FILES_SENTENCE,
  MAX_FILE_BYTES,
  STORAGE_BUCKET,
} from "@/lib/constants";

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

export function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
}
