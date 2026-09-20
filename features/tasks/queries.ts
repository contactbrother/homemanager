import { createClient } from "@/lib/supabase/server";
import {
  OPEN_TASK_STATUSES,
  TASK_PRIORITY_RANK,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";
import type { Task, TaskMessageWithAuthor, TaskWithProperty } from "./types";

/** FR-029. Open tasks before completed ones, newest first within each group. */
export async function listTasks(): Promise<TaskWithProperty[]> {
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

export async function getTask(id: string): Promise<TaskWithProperty | null> {
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
    .select("*, profiles(id, full_name, role)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  return (data as TaskMessageWithAuthor[]) ?? [];
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
