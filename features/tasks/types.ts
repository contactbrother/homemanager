import type { Task, TaskMessage, Profile, Property } from "@/lib/supabase/types";

export type { Task, TaskMessage };

export interface TaskWithProperty extends Task {
  properties: Pick<Property, "id" | "name"> | null;
}

export interface TaskMessageWithAuthor extends TaskMessage {
  profiles: Pick<Profile, "id" | "full_name" | "role"> | null;
}
