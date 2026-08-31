import { createClient } from "@/lib/supabase/server";
import type { DocumentRow } from "@/lib/supabase/types";
import { expiryStatus } from "./expiry";
import type { DocumentWithStatus } from "./types";

export async function listDocuments(
  propertyId: string,
): Promise<DocumentWithStatus[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  return withStatus((data as DocumentRow[]) ?? []);
}

/** Every document the caller can see, across all their properties. Used by the
 *  attention list. RLS scopes it. */
export async function listAllDocuments(): Promise<DocumentWithStatus[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .not("expires_on", "is", null)
    .order("expires_on", { ascending: true });

  return withStatus((data as DocumentRow[]) ?? []);
}

function withStatus(rows: DocumentRow[]): DocumentWithStatus[] {
  return rows.map((row) => ({ ...row, status: expiryStatus(row.expires_on) }));
}
