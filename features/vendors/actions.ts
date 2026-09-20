"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import { VENDOR_CATEGORIES, type VendorCategory } from "@/lib/constants";

export interface VendorInput {
  name: string;
  category: VendorCategory;
  phone?: string;
  email?: string;
  rateNotes?: string;
  notes?: string;
  isActive?: boolean;
}

type VendorRow = {
  name: string;
  category: VendorCategory;
  phone: string | null;
  email: string | null;
  rate_notes: string | null;
  notes: string | null;
  is_active: boolean;
};

function clean(input: VendorInput): { error: string; row?: never } | { error?: never; row: VendorRow } {
  const name = input.name.trim();
  if (!name) return { error: "Give the vendor a name." };
  if (!VENDOR_CATEGORIES.includes(input.category)) return { error: "Choose a category." };
  return {
    row: {
      name,
      category: input.category,
      phone: input.phone?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      rate_notes: input.rateNotes?.trim() || null,
      notes: input.notes?.trim() || null,
      is_active: input.isActive ?? true,
    },
  };
}

/** Team only by policy. */
export async function createVendor(input: VendorInput): Promise<ActionResult<{ id: string }>> {
  const result = clean(input);
  if (result.error !== undefined || !result.row) return fail(result.error ?? "Check the details and try again.");

  const supabase = await createClient();
  const { data, error } = await supabase.from("vendors").insert(result.row).select("id").single();
  if (error || !data) return fail("We could not save that vendor. Try again.");

  revalidatePath("/admin/vendors");
  return ok({ id: data.id });
}

export async function updateVendor(id: string, input: VendorInput): Promise<ActionResult> {
  const result = clean(input);
  if (result.error !== undefined || !result.row) return fail(result.error ?? "Check the details and try again.");

  const supabase = await createClient();
  const { error } = await supabase.from("vendors").update(result.row).eq("id", id);
  if (error) return fail("We could not save those changes. Try again.");

  revalidatePath("/admin/vendors");
  return ok();
}
