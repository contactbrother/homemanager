import { createClient } from "@/lib/supabase/server";
import type { Asset, DocumentRow, Property } from "@/lib/supabase/types";
import { buildRenewals } from "./build";
import type { RenewalItem } from "./types";

/**
 * Renewals the caller may see, within a horizon. RLS scopes every table, so a client
 * sees their homes and the team sees all. Principle IV.
 */
export async function listRenewals(options: {
  withinDays: number;
  propertyId?: string;
}): Promise<RenewalItem[]> {
  const supabase = await createClient();

  let propertiesQuery = supabase.from("properties").select("*");
  let documentsQuery = supabase.from("documents").select("*").not("expires_on", "is", null);
  let assetsQuery = supabase.from("assets").select("*");
  if (options.propertyId) {
    propertiesQuery = propertiesQuery.eq("id", options.propertyId);
    documentsQuery = documentsQuery.eq("property_id", options.propertyId);
    assetsQuery = assetsQuery.eq("property_id", options.propertyId);
  }

  const [properties, documents, assets] = await Promise.all([
    propertiesQuery,
    documentsQuery,
    assetsQuery,
  ]);

  return buildRenewals({
    properties: (properties.data as Property[]) ?? [],
    documents: (documents.data as DocumentRow[]) ?? [],
    assets: (assets.data as Asset[]) ?? [],
  }).filter((item) => item.days <= options.withinDays);
}
