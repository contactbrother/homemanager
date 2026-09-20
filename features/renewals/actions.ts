"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import { OPEN_TASK_STATUSES, type TaskPriority } from "@/lib/constants";
import { formatDate } from "@/lib/format";

/**
 * "Dar, handle this." Turns a renewal into a request with a sensible priority. If an
 * open request with the same title already exists for the home, it is returned
 * instead of a duplicate being made.
 */
export async function handleRenewal(input: {
  propertyId: string;
  title: string;
  dueOn: string;
  days: number;
  kind: "document_expiry" | "asset_warranty" | "asset_service";
}): Promise<ActionResult<{ id: string; existed: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You are not signed in.");

  const verb = input.kind === "asset_service" ? "Service" : "Renew";
  const title = `${verb}: ${input.title}`.slice(0, 80);

  const { data: existing } = await supabase
    .from("tasks")
    .select("id")
    .eq("property_id", input.propertyId)
    .eq("title", title)
    .in("status", OPEN_TASK_STATUSES)
    .limit(1)
    .maybeSingle();
  if (existing) return ok({ id: existing.id, existed: true });

  const priority: TaskPriority = input.days <= 0 ? "high" : input.days <= 7 ? "high" : "normal";
  const when = input.days < 0 ? "was due" : "is due";
  const body = `${input.title} ${when} on ${formatDate(input.dueOn)}. Please handle the ${
    input.kind === "asset_service" ? "service" : "renewal"
  } and let me know if anything is needed from me.`;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      property_id: input.propertyId,
      created_by: user.id,
      title,
      body,
      status: "received",
      priority,
    })
    .select("id")
    .single();

  if (error || !data) return fail("That did not send. Try again.");

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/renewals");
  return ok({ id: data.id, existed: false });
}
