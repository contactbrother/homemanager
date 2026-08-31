import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";
import type { ClientSummary } from "./types";

/** FR-035. Admin only; the policies enforce that, not this function. */
export async function listClients(): Promise<ClientSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, properties(id, name, community)")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  return (data as ClientSummary[]) ?? [];
}

export async function getClient(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Profile) ?? null;
}
