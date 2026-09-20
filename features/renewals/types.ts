import type { DocumentType, AssetCategory } from "@/lib/constants";

export type RenewalKind = "document_expiry" | "asset_warranty" | "asset_service";

export interface RenewalItem {
  /** Stable across renders: `${kind}-${id}`. */
  key: string;
  kind: RenewalKind;
  /** The document or asset id. */
  id: string;
  propertyId: string;
  propertyName: string;
  ownerId: string;
  title: string;
  /** What kind of thing it is, for the client's eye. */
  category: string;
  /** YYYY-MM-DD */
  dueOn: string;
  /** Negative when overdue. */
  days: number;
  docType?: DocumentType;
  assetCategory?: AssetCategory;
}
