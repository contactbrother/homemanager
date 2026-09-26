"use client";

import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";
import type { UploadedAttachment } from "./types";

export const MAX_ATTACHMENTS = 6;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_EDGE = 1920;

export interface PickedFile {
  id: string;
  file: File;
  kind: "image" | "video";
  preview: string;
}

/** Turn a picked file into something the form can preview, or explain why not. */
export function pickFile(file: File): PickedFile | string {
  const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
  if (!kind) return `${file.name} is not a photo or video.`;
  if (kind === "video" && file.size > MAX_FILE_BYTES) {
    return "That video is over 50 MB. Try a shorter clip.";
  }
  return { id: crypto.randomUUID(), file, kind, preview: URL.createObjectURL(file) };
}

/**
 * Photos are shrunk on the phone before upload: longest side 1920 px, JPEG. A 5 MB
 * camera photo usually becomes a few hundred KB, which uploads in seconds on mobile
 * data. Anything the browser cannot decode (some HEIC files) goes up unchanged.
 */
async function shrinkImage(file: File): Promise<{ blob: Blob; type: string; width: number | null; height: number | null }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (blob && blob.size < file.size) return { blob, type: "image/jpeg", width, height };
    return { blob: file, type: file.type, width, height };
  } catch {
    return { blob: file, type: file.type || "image/jpeg", width: null, height: null };
  }
}

/** Upload straight to storage under the request's own folder; storage rules check access. */
export async function uploadAttachments(
  propertyId: string,
  taskId: string,
  picked: PickedFile[],
): Promise<UploadedAttachment[]> {
  const supabase = createClient();
  const out: UploadedAttachment[] = [];
  for (const p of picked) {
    const prepared =
      p.kind === "image"
        ? await shrinkImage(p.file)
        : { blob: p.file as Blob, type: p.file.type || "video/mp4", width: null, height: null };
    if (prepared.blob.size > MAX_FILE_BYTES) throw new Error("A file is over 50 MB.");
    const ext = prepared.type === "image/jpeg" ? "jpg" : (p.file.name.split(".").pop() || "bin").toLowerCase();
    const path = `${propertyId}/${taskId}/attachments/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, prepared.blob, {
      contentType: prepared.type,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    out.push({ path, mimeType: prepared.type, size: prepared.blob.size, width: prepared.width, height: prepared.height });
  }
  return out;
}
