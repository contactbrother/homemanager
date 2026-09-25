"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import {
  TASK_PRIORITIES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";

/**
 * FR-021 to FR-026, revised. A request is a short title, optional detail and a
 * priority the client chooses. The team may re-triage the priority afterwards.
 */
export async function createTask(input: {
  propertyId: string;
  title: string;
  body?: string;
  priority: TaskPriority;
}): Promise<ActionResult<{ id: string }>> {
  const title = input.title.trim().slice(0, 80);
  const body = input.body?.trim() || null;

  if (!title) return fail("Give your request a short title.");
  if (!TASK_PRIORITIES.includes(input.priority)) {
    return fail("Choose how urgent this is.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You are not signed in.");

  const { data: row, error } = await supabase
    .from("tasks")
    .insert({
      property_id: input.propertyId,
      created_by: user.id,
      title,
      body,
      status: "received",
      priority: input.priority,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("[task] insert failed", error?.message);
    return fail("That did not send. Try again.");
  }

  revalidatePath("/tasks");
  revalidatePath("/");
  revalidatePath("/admin/tasks");
  return ok({ id: row.id });
}

/** FR-028. Client or team. */
export async function addTaskNote(input: {
  taskId: string;
  body: string;
}): Promise<ActionResult> {
  const body = input.body.trim();
  if (!body) return fail("Write a note first.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You are not signed in.");

  const { error } = await supabase.from("task_messages").insert({
    task_id: input.taskId,
    author_id: user.id,
    body,
  });

  if (error) return fail("That note did not send. Try again.");

  revalidatePath(`/tasks/${input.taskId}`);
  revalidatePath(`/admin/tasks/${input.taskId}`);
  return ok();
}

/**
 * FR-027, FR-049, FR-050. Team only. Any status may move to any other, including
 * reopening something already done: a vendor's repair that fails a week later is the
 * same request, not a new one. There is no transition check, deliberately. What keeps
 * the record honest is the history row written alongside.
 */
export async function setTaskStatus(input: {
  taskId: string;
  status: TaskStatus;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You are not signed in.");

  const { error } = await supabase
    .from("tasks")
    .update({ status: input.status })
    .eq("id", input.taskId);

  if (error) return fail("That status did not change. Try again.");

  const { error: historyError } = await supabase.from("task_messages").insert({
    task_id: input.taskId,
    author_id: user.id,
    status_to: input.status,
  });

  if (historyError) {
    console.error("[task] status changed but history row failed", historyError.message);
  }

  revalidatePath(`/tasks/${input.taskId}`);
  revalidatePath(`/admin/tasks/${input.taskId}`);
  revalidatePath("/admin/tasks");
  revalidatePath("/");
  return ok();
}

/** Team only by policy. Re-triage a client's chosen priority. */
export async function setTaskPriority(input: {
  taskId: string;
  priority: TaskPriority;
}): Promise<ActionResult> {
  if (!TASK_PRIORITIES.includes(input.priority)) return fail("Choose a priority.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ priority: input.priority })
    .eq("id", input.taskId);

  if (error) return fail("That priority did not change. Try again.");

  revalidatePath(`/tasks/${input.taskId}`);
  revalidatePath(`/admin/tasks/${input.taskId}`);
  revalidatePath("/admin/tasks");
  return ok();
}

/** FR-023. Lets the team correct a title at triage. */
export async function renameTask(input: {
  taskId: string;
  title: string;
}): Promise<ActionResult> {
  const title = input.title.trim();
  if (!title) return fail("Give the task a title.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ title })
    .eq("id", input.taskId);

  if (error) return fail("That did not save. Try again.");

  revalidatePath(`/admin/tasks/${input.taskId}`);
  return ok();
}
