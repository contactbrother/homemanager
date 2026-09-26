import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  OPEN_TASK_STATUSES,
  TASK_PRIORITY_RANK,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";
import type { Task, TaskAttachment, TaskMessageWithAuthor, TaskWithProperty } from "./types";
import { STORAGE_BUCKET } from "@/lib/constants";

/** FR-029. Open tasks before completed ones, newest first within each group. */
async function listTasksUncached(): Promise<TaskWithProperty[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*, properties(id, name)")
    .order("updated_at", { ascending: false });

  return sortOpenFirst((data as TaskWithProperty[]) ?? []);
}

export async function listTasksForProperty(propertyId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("property_id", propertyId)
    .order("updated_at", { ascending: false });

  return sortOpenFirst((data as Task[]) ?? []);
}

/** FR-039. Every task across all clients, filterable by status. Admin only by policy. */
export async function listAllTasks(
  status?: TaskStatus,
): Promise<TaskWithProperty[]> {
  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select("*, properties(id, name)")
    .order("updated_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data } = await query;
  return sortOpenFirst((data as TaskWithProperty[]) ?? []);
}

async function getTaskUncached(id: string): Promise<TaskWithProperty | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*, properties(id, name)")
    .eq("id", id)
    .maybeSingle();
  return (data as TaskWithProperty) ?? null;
}

/** FR-028, FR-050. Notes and status changes in one chronological history. */
export async function listTaskHistory(
  taskId: string,
): Promise<TaskMessageWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("task_messages")
    .select("*, profiles(id, full_name, role), task_attachments(*)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  const rows = (data as TaskMessageWithAuthor[]) ?? [];
  const all = rows.flatMap((r) => r.task_attachments ?? []);
  await signAttachments(all);
  return rows;
}

/** Photos and videos added with the request itself, not with a later message. */
export async function listRequestAttachments(taskId: string): Promise<TaskAttachment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("task_attachments")
    .select("*")
    .eq("task_id", taskId)
    .is("message_id", null)
    .order("created_at", { ascending: true });
  const rows = (data as TaskAttachment[]) ?? [];
  await signAttachments(rows);
  return rows;
}

/**
 * One batch call signs every attachment on the page. Links last an hour so a photo
 * does not break while someone is looking at it; storage rules still decide who can
 * create them.
 */
async function signAttachments(rows: TaskAttachment[]): Promise<void> {
  if (rows.length === 0) return;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(rows.map((r) => r.file_path), 3600);
  const byPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  for (const row of rows) row.url = byPath.get(row.file_path) ?? null;
}

/** Open before closed; within open, emergency and high first, then most recent. */
function sortOpenFirst<T extends { status: TaskStatus; priority: TaskPriority }>(
  rows: T[],
): T[] {
  const open = rows
    .filter((t) => OPEN_TASK_STATUSES.includes(t.status))
    .sort((a, b) => TASK_PRIORITY_RANK[a.priority] - TASK_PRIORITY_RANK[b.priority]);
  const closed = rows.filter((t) => !OPEN_TASK_STATUSES.includes(t.status));
  return [...open, ...closed];
}

/** Deduplicated within one request: the layout and the page share one lookup. */
export const listTasks = cache(listTasksUncached);

/** Deduplicated within one request: the layout and the page share one lookup. */
export const getTask = cache(getTaskUncached);
