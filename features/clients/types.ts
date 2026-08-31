import type { Profile, Property } from "@/lib/supabase/types";

export interface ClientSummary extends Profile {
  properties: Pick<Property, "id" | "name" | "community">[];
}

export function isDeactivated(profile: Pick<Profile, "deactivated_at">): boolean {
  return profile.deactivated_at !== null;
}
