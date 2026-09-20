/** Hand-written to match `supabase/migrations/`. There is no ORM and no codegen step,
 *  per Principle V, so this file is the one place the schema is described to TypeScript.
 *  Keep it in step with the migrations by hand. */
import type {
  AssetCategory,
  DocumentType,
  TaskPriority,
  TaskStatus,
  VendorCategory,
} from "@/lib/constants";

export type UserRole = "client" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  deactivated_at: string | null;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  community: string | null;
  address: string | null;
  photo_path: string | null;
  bedrooms: number | null;
  villa_number: string | null;
  access_notes: string | null;
  key_holders: string | null;
  emergency_contacts: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  phone: string | null;
  email: string | null;
  rate_notes: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  property_id: string;
  category: AssetCategory;
  name: string;
  brand: string | null;
  model: string | null;
  serial_no: string | null;
  location: string | null;
  installed_on: string | null;
  warranty_until: string | null;
  service_interval_months: number | null;
  last_serviced_on: string | null;
  vendor_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRow {
  id: string;
  property_id: string;
  uploaded_by: string;
  title: string;
  doc_type: DocumentType;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  expires_on: string | null;
  notes: string | null;
  asset_id: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  property_id: string;
  created_by: string;
  title: string;
  body: string | null;
  voice_path: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface TaskMessage {
  id: string;
  task_id: string;
  author_id: string;
  body: string | null;
  voice_path: string | null;
  status_to: TaskStatus | null;
  created_at: string;
}

/** Every action returns this rather than throwing, so a caller can revert an
 *  optimistic update and show the FR-043 message. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok(): ActionResult;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}
