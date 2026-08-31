"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import {
  ALLOWED_FILES_SENTENCE,
  ALLOWED_MIME_TYPES,
  MAX_FILE_BYTES,
  SIGNED_URL_TTL,
  STORAGE_BUCKET,
  type DocumentType,
} from "@/lib/constants";
import { safeName } from "@/lib/storage";

/** FR-011, FR-013, FR-020. Client or team. An absent expiry is valid. */
export async function uploadDocument(input: {
  propertyId: string;
  title: string;
  docType: DocumentType;
  expiresOn?: string | null;
  file: File;
}): Promise<ActionResult<{ id: string }>> {
  const title = input.title.trim();
  if (!title) return fail("Give the document a title.");
  if (!input.file || input.file.size === 0) return fail("Choose a file to upload.");

  if (input.file.size > MAX_FILE_BYTES) {
    return fail(`That file is too large. ${ALLOWED_FILES_SENTENCE}`);
  }
  if (!ALLOWED_MIME_TYPES.includes(input.file.type as never)) {
    return fail(`We cannot accept that kind of file. ${ALLOWED_FILES_SENTENCE}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You are not signed in.");

  const { data: row, error } = await supabase
    .from("documents")
    .insert({
      property_id: input.propertyId,
      uploaded_by: user.id,
      title,
      doc_type: input.docType,
      file_path: "pending",
      file_size: input.file.size,
      mime_type: input.file.type,
      expires_on: input.expiresOn || null,
    })
    .select("id")
    .single();

  if (error || !row) return fail("That did not upload. Try again.");

  const path = `${input.propertyId}/${row.id}/${safeName(input.file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, input.file, { contentType: input.file.type });

  if (uploadError) {
    // Never leave a document row pointing at a file that is not there. FR-019, SC-015.
    await supabase.from("documents").delete().eq("id", row.id);
    return fail("That did not upload. Try again.");
  }

  await supabase.from("documents").update({ file_path: path }).eq("id", row.id);

  revalidatePath(`/properties/${input.propertyId}`);
  revalidatePath("/");
  return ok({ id: row.id });
}

/** FR-017, FR-018. Short-lived and generated on request. Never a public URL. */
export async function getDocumentUrl(
  documentId: string,
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .maybeSingle();

  if (!doc) return fail("We could not find that document.");

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(doc.file_path, SIGNED_URL_TTL);

  if (error || !data) return fail("We could not open that document. Try again.");
  return ok({ url: data.signedUrl });
}

/**
 * FR-019. Team only, for the row and the stored file alike. No client screen calls
 * this, and the policies refuse it even if one did.
 */
export async function deleteDocument(documentId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("id, file_path, property_id")
    .eq("id", documentId)
    .maybeSingle();

  if (!doc) return fail("We could not find that document.");

  // File first: a row pointing at a missing file is worse than a file with no row.
  const { error: fileError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([doc.file_path]);

  if (fileError) return fail("We could not delete that document. Try again.");

  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) return fail("We could not delete that document. Try again.");

  revalidatePath(`/properties/${doc.property_id}`);
  return ok();
}
