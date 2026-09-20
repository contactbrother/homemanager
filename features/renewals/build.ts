import { ASSET_CATEGORY_LABELS, DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import { daysUntil } from "@/lib/format";
import { nextServiceOn } from "@/features/assets/service";
import type { Asset, DocumentRow, Property } from "@/lib/supabase/types";
import type { RenewalItem } from "./types";

/**
 * Every dated thing in a home becomes one row here: a document expiry, a warranty
 * end, a service falling due. Pure, so the daily job and the pages share it and
 * cannot disagree. Ordered soonest first, overdue at the top.
 */
export function buildRenewals(input: {
  properties: Property[];
  documents: DocumentRow[];
  assets: Asset[];
}): RenewalItem[] {
  const byId = new Map(input.properties.map((p) => [p.id, p]));
  const items: RenewalItem[] = [];

  for (const doc of input.documents) {
    const property = byId.get(doc.property_id);
    if (!property || !doc.expires_on) continue;
    items.push({
      key: `document_expiry-${doc.id}`,
      kind: "document_expiry",
      id: doc.id,
      propertyId: property.id,
      propertyName: property.name,
      ownerId: property.owner_id,
      title: doc.title,
      category: DOCUMENT_TYPE_LABELS[doc.doc_type],
      dueOn: doc.expires_on,
      days: daysUntil(doc.expires_on),
      docType: doc.doc_type,
    });
  }

  for (const asset of input.assets) {
    const property = byId.get(asset.property_id);
    if (!property) continue;
    if (asset.warranty_until) {
      items.push({
        key: `asset_warranty-${asset.id}`,
        kind: "asset_warranty",
        id: asset.id,
        propertyId: property.id,
        propertyName: property.name,
        ownerId: property.owner_id,
        title: `${asset.name} warranty`,
        category: ASSET_CATEGORY_LABELS[asset.category],
        dueOn: asset.warranty_until,
        days: daysUntil(asset.warranty_until),
        assetCategory: asset.category,
      });
    }
    const next = nextServiceOn(asset);
    if (next) {
      const dueOn = toDateOnly(next);
      items.push({
        key: `asset_service-${asset.id}`,
        kind: "asset_service",
        id: asset.id,
        propertyId: property.id,
        propertyName: property.name,
        ownerId: property.owner_id,
        title: `${asset.name} service`,
        category: ASSET_CATEGORY_LABELS[asset.category],
        dueOn,
        days: daysUntil(dueOn),
        assetCategory: asset.category,
      });
    }
  }

  return items.sort((a, b) => a.days - b.days);
}

export function toDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** How a renewal reads on screen. */
export function renewalLabel(item: RenewalItem): string {
  const verb = item.kind === "asset_service" ? "Due" : "Expires";
  if (item.days < 0) {
    const ago = -item.days;
    return item.kind === "asset_service"
      ? `Overdue by ${ago} ${ago === 1 ? "day" : "days"}`
      : `Expired ${ago} ${ago === 1 ? "day" : "days"} ago`;
  }
  if (item.days === 0) return item.kind === "asset_service" ? "Due today" : "Expires today";
  if (item.days === 1) return `${verb} tomorrow`;
  return `${verb} in ${item.days} days`;
}

export function renewalTone(item: RenewalItem): "alert" | "warn" | "quiet" {
  if (item.days <= 0) return "alert";
  if (item.days <= 14) return "warn";
  return "quiet";
}
