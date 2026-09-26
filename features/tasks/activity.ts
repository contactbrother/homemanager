import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/constants";

export interface TaskActivity {
  unread: number;
  lastMessageAt: string | null;
  lastReadAt: string | null;
}

/** Unread counts and last activity for every request the person can see. Once per request. */
export const getMyActivity = cache(async (): Promise<Map<string, TaskActivity>> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_task_activity");
  const map = new Map<string, TaskActivity>();
  for (const row of (data ?? []) as Array<{ task_id: string; unread: number; last_message_at: string | null; last_read_at: string | null }>) {
    map.set(row.task_id, { unread: row.unread, lastMessageAt: row.last_message_at, lastReadAt: row.last_read_at });
  }
  return map;
});

export interface LatestUpdate {
  id: string;
  taskId: string;
  taskTitle: string;
  body: string | null;
  statusTo: TaskStatus | null;
  createdAt: string;
  author: string;
  unread: boolean;
}

/** The most recent updates from the team across all of this person's requests. */
export async function listLatestUpdates(userId: string, limit = 5): Promise<LatestUpdate[]> {
  const supabase = await createClient();
  const [{ data }, activity] = await Promise.all([
    supabase
      .from("task_messages")
      .select("id, task_id, body, status_to, created_at, author_id, tasks(title), profiles(full_name, role)")
      .neq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    getMyActivity(),
  ]);

  return ((data ?? []) as unknown as Array<{
    id: string;
    task_id: string;
    body: string | null;
    status_to: TaskStatus | null;
    created_at: string;
    tasks: { title: string } | null;
    profiles: { full_name: string | null; role: string } | null;
  }>).map((m) => {
    const read = activity.get(m.task_id)?.lastReadAt;
    return {
      id: m.id,
      taskId: m.task_id,
      taskTitle: m.tasks?.title ?? "Request",
      body: m.body,
      statusTo: m.status_to,
      createdAt: m.created_at,
      author: m.profiles?.role === "admin" ? "Dar" : (m.profiles?.full_name ?? "Dar"),
      unread: !read || new Date(m.created_at) > new Date(read),
    };
  });
}
