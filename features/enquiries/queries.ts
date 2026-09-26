import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type EnquiryStatus = "new" | "contacted" | "closed";

export interface Enquiry {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  community: string | null;
  service: string | null;
  message: string | null;
  source_path: string | null;
  status: EnquiryStatus;
}

/** Team only, by policy. Newest first. */
export async function listEnquiries(status?: EnquiryStatus): Promise<Enquiry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("enquiries")
    .select("id, created_at, name, phone, email, community, service, message, source_path, status")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  const { data } = await query;
  return (data as Enquiry[]) ?? [];
}

/** For the nav badge. Once per request. */
export const countNewEnquiries = cache(async (): Promise<number> => {
  const supabase = await createClient();
  const { count } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  return count ?? 0;
});
