"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import {
  MAX_FILE_BYTES,
  SIGNED_URL_TTL,
  STORAGE_BUCKET,
  type TaskStatus,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { safeName } from "@/lib/storage";

/**
 * FR-021 to FR-026.
 *
 * A task needs either text or a voice note, never neither. Where only a voice note is
 * given, the title is generated: the client is never asked to name, categorise or
 * organise anything, and the team renames it when they triage.
 */
export async function createTask(input: {
  propertyId: string;
  body?: string;
  voice?: File | null;
}): Promise<ActionResult<{ id: string }>> {
  const body = input.body?.trim() || null;
  const voice = input.voice && input.voice.size > 0 ? input.voice : null;

  if (!body && !voice) {
    return fail("Write what you need, or record a voice note.");
  }
  if (voice && voice.size > MAX_FILE_BYTES) {
    return fail("That recording is too long. Try a shorter one.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You are not signed in.");

  const title = body
    ? body.split("\n")[0].slice(0, 80)
    : `Voice note, ${formatDate(new Date())}`;

  // The id is chosen here so the recording can be stored under it before the row
  // exists. Clients may insert tasks but not update them (policy), so the path has to
  // travel with the insert rather than follow it.
  const id = crypto.randomUUID();
  let voicePath: string | null = null;

  if (voice) {
    const path = `${input.propertyId}/${id}/${safeName(voiceName(voice))}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, voice, { contentType: voice.type });

    if (uploadError) {
      console.error("[task] voice upload failed", uploadError.message);
      // A voice-only task with no recording behind it would be an empty task.
      if (!body) return fail("That recording did not send. Try again.");
    } else {
      voicePath = path;
    }
  }

  const { error } = await supabase.from("tasks").insert({
    id,
    property_id: input.propertyId,
    created_by: user.id,
    title,
    body,
    status: "received",
    voice_path: voicePath,
  });

  if (error) {
    console.error("[task] insert failed", error.message);
    if (voicePath) await supabase.storage.from(STORAGE_BUCKET).remove([voicePath]);
    return fail("That did not send. Try again.");
  }

  revalidatePath("/tasks");
  revalidatePath("/");
  return ok({ id });
}

/**
 * A short-lived signed URL for a recording. The storage policies decide who may read
 * the file, so this returns nothing useful to anyone the task is not theirs to see.
 */
export async function getVoiceUrl(path: string): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);

  if (error || !data) return fail("We could not load that recording. Try again.");
  return ok({ url: data.signedUrl });
}

/** FR-028. Client or team. */
export async function addTaskNote(input: {
  taskId: string;
  body?: string;
  voice?: File | null;
}): Promise<ActionResult> {
  const body = input.body?.trim() || null;
  const voice = input.voice && input.voice.size > 0 ? input.voice : null;
  if (!body && !voice) return fail("Write a note, or record one.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You are not signed in.");

  const { data: task } = await supabase
    .from("tasks")
    .select("property_id")
    .eq("id", input.taskId)
    .maybeSingle();
  if (!task) return fail("We could not find that task.");

  let voicePath: string | null = null;
  if (voice) {
    const path = `${task.property_id}/${input.taskId}/${Date.now()}-${safeName(voiceName(voice))}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, voice, { contentType: voice.type });
    if (!error) voicePath = path;
  }

  const { error } = await supabase.from("task_messages").insert({
    task_id: input.taskId,
    author_id: user.id,
    body,
    voice_path: voicePath,
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

/** FR-023. Lets the team replace a generated voice-note title at triage. */
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

function voiceName(file: File): string {
  if (file.name && file.name !== "blob") return file.name;
  const extension = file.type.includes("mp4")
    ? "m4a"
    : file.type.includes("ogg")
      ? "ogg"
      : file.type.includes("mpeg")
        ? "mp3"
        : "webm";
  return `voice-note.${extension}`;
}
