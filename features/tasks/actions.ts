"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import {
  TASK_PRIORITIES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";
import type { UploadedAttachment } from "./types";

const MAX_ATTACHMENTS = 6;

/** Files for a request must sit in that request's own folder. RLS decides whether the request is visible. */
async function attachmentPrefix(taskId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("property_id").eq("id", taskId).maybeSingle();
  return data ? `${data.property_id}/${taskId}/attachments/` : null;
}

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

/** FR-028. Client or team. A note can carry photos and videos, or be only those. */
export async function addTaskNote(input: {
  taskId: string;
  body: string;
  attachments?: UploadedAttachment[];
}): Promise<ActionResult> {
  const body = input.body.trim();
  const files = input.attachments ?? [];
  if (!body && files.length === 0) return fail("Write a note first.");
  if (files.length > MAX_ATTACHMENTS) return fail(`Up to ${MAX_ATTACHMENTS} photos or videos at a time.`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You are not signed in.");

  if (files.length) {
    const prefix = await attachmentPrefix(input.taskId);
    if (!prefix || files.some((f) => !f.path.startsWith(prefix))) {
      return fail("Those files could not be attached. Try again.");
    }
  }

  const { data: message, error } = await supabase
    .from("task_messages")
    .insert({ task_id: input.taskId, author_id: user.id, body: body || null })
    .select("id")
    .single();

  if (error || !message) return fail("That note did not send. Try again.");

  if (files.length) {
    const { error: attachError } = await supabase.from("task_attachments").insert(
      files.map((f) => ({
        task_id: input.taskId,
        message_id: message.id,
        uploaded_by: user.id,
        file_path: f.path,
        mime_type: f.mimeType,
        file_size: f.size,
        width: f.width ?? null,
        height: f.height ?? null,
      })),
    );
    if (attachError) {
      console.error("[task] attachments failed", attachError.message);
      return fail("Your note was sent, but the photos did not attach. Try adding them again.");
    }
  }

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

/** Opening a request marks everything in it as read for this person. */
export async function markTaskRead(taskId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return fail("You are not signed in.");
  const { error } = await supabase
    .from("task_reads")
    .upsert({ user_id: userId, task_id: taskId, last_read_at: new Date().toISOString() }, { onConflict: "user_id,task_id" });
  if (error) return fail("Could not update read status.");
  return ok();
}

/** Photos and videos added along with a new request. */
export async function addRequestAttachments(input: {
  taskId: string;
  attachments: UploadedAttachment[];
}): Promise<ActionResult> {
  if (input.attachments.length === 0) return ok();
  if (input.attachments.length > MAX_ATTACHMENTS) return fail(`Up to ${MAX_ATTACHMENTS} photos or videos at a time.`);
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return fail("You are not signed in.");
  const prefix = await attachmentPrefix(input.taskId);
  if (!prefix || input.attachments.some((f) => !f.path.startsWith(prefix))) {
    return fail("Those files could not be attached.");
  }
  const { error } = await supabase.from("task_attachments").insert(
    input.attachments.map((f) => ({
      task_id: input.taskId,
      message_id: null,
      uploaded_by: userId,
      file_path: f.path,
      mime_type: f.mimeType,
      file_size: f.size,
      width: f.width ?? null,
      height: f.height ?? null,
    })),
  );
  if (error) return fail("Your request was sent, but the photos did not attach. Add them in the conversation.");
  revalidatePath(`/tasks/${input.taskId}`);
  return ok();
}
