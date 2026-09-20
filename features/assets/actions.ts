"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import { ASSET_CATEGORIES, type AssetCategory } from "@/lib/constants";

export interface AssetInput {
  propertyId: string;
  category: AssetCategory;
  name: string;
  brand?: string;
  model?: string;
  serialNo?: string;
  location?: string;
  installedOn?: string;
  warrantyUntil?: string;
  serviceIntervalMonths?: string;
  lastServicedOn?: string;
  vendorId?: string;
  notes?: string;
}

type AssetRow = {
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
};

function clean(input: AssetInput): { error: string; row?: never } | { error?: never; row: AssetRow } {
  const name = input.name.trim();
  if (!name) return { error: "Give the item a name, like 'Master bedroom AC'." };
  if (!ASSET_CATEGORIES.includes(input.category)) return { error: "Choose a category." };
  const interval = input.serviceIntervalMonths ? Number(input.serviceIntervalMonths) : null;
  if (interval !== null && (!Number.isInteger(interval) || interval < 1 || interval > 60)) {
    return { error: "Service interval must be between 1 and 60 months." };
  }
  return {
    row: {
      property_id: input.propertyId,
      category: input.category,
      name,
      brand: input.brand?.trim() || null,
      model: input.model?.trim() || null,
      serial_no: input.serialNo?.trim() || null,
      location: input.location?.trim() || null,
      installed_on: input.installedOn || null,
      warranty_until: input.warrantyUntil || null,
      service_interval_months: interval,
      last_serviced_on: input.lastServicedOn || null,
      vendor_id: input.vendorId || null,
      notes: input.notes?.trim() || null,
    },
  };
}

function revalidate(propertyId: string) {
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/properties");
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

export async function createAsset(input: AssetInput): Promise<ActionResult<{ id: string }>> {
  const result = clean(input);
  if (result.error !== undefined || !result.row) return fail(result.error ?? "Check the details and try again.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .insert(result.row)
    .select("id")
    .single();
  if (error || !data) return fail("We could not save that item. Try again.");

  revalidate(input.propertyId);
  return ok({ id: data.id });
}

export async function updateAsset(
  id: string,
  input: AssetInput,
): Promise<ActionResult> {
  const result = clean(input);
  if (result.error !== undefined || !result.row) return fail(result.error ?? "Check the details and try again.");

  const supabase = await createClient();
  const { property_id: _omit, ...changes } = result.row;
  void _omit;
  const { error } = await supabase.from("assets").update(changes).eq("id", id);
  if (error) return fail("We could not save those changes. Try again.");

  revalidate(input.propertyId);
  return ok();
}

/** Marks a service as done today (or on the date given). */
export async function logService(input: {
  id: string;
  propertyId: string;
  servicedOn?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const servicedOn = input.servicedOn || new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("assets")
    .update({ last_serviced_on: servicedOn })
    .eq("id", input.id);
  if (error) return fail("We could not record that service. Try again.");

  revalidate(input.propertyId);
  return ok();
}

/** Team only by policy. */
export async function deleteAsset(input: { id: string; propertyId: string }): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("assets").delete().eq("id", input.id);
  if (error) return fail("We could not remove that item. Try again.");

  revalidate(input.propertyId);
  return ok();
}
