import type { Task, TaskMessage, Profile, Property } from "@/lib/supabase/types";

export type { Task, TaskMessage };

export interface TaskWithProperty extends Task {
  properties: Pick<Property, "id" | "name"> | null;
}

export interface TaskMessageWithAuthor extends TaskMessage {
  profiles: Pick<Profile, "id" | "full_name" | "role"> | null;
  task_attachments?: TaskAttachment[];
}

/** A photo or video on a request. `url` is a signed link added when the page renders. */
export interface TaskAttachment {
  id: string;
  task_id: string;
  message_id: string | null;
  uploaded_by: string;
  file_path: string;
  mime_type: string;
  file_size: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
  url?: string | null;
}

/** What the browser reports after uploading a file, before it is recorded. */
export interface UploadedAttachment {
  path: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
}
