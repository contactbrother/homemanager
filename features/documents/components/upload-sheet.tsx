"use client";

import { useState, useTransition } from "react";
import { uploadDocument } from "@/features/documents/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import type { DocumentWithStatus } from "@/features/documents/types";
import { expiryStatus } from "@/features/documents/expiry";
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
} from "@/lib/constants";

/** FR-011, FR-013. An expiry is optional: a floor plan has none and must still upload. */
export function UploadSheet({
  propertyId,
  label = "Upload a document",
  variant = "primary",
  onOptimistic,
}: {
  propertyId: string;
  label?: string;
  /** Secondary on the admin client page, where create-property is the primary
   *  action and two gold buttons would break Principle I. */
  variant?: "primary" | "outline";
  /** Lets the list show the document before the server has stored it. FR-041. */
  onOptimistic?: (row: DocumentWithStatus | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file") as File | null;
    if (!file || file.size === 0) {
      setError("Choose a file to upload.");
      return;
    }

    const title = String(form.get("title") ?? "");
    const docType = String(form.get("docType") ?? "other") as DocumentType;
    const expiresOn = String(form.get("expiresOn") ?? "") || null;

    setError(null);
    setOpen(false);
    onOptimistic?.({
      id: `pending-${Date.now()}`,
      property_id: propertyId,
      uploaded_by: "",
      title,
      doc_type: docType,
      file_path: "",
      file_size: file.size,
      mime_type: file.type,
      expires_on: expiresOn,
      notes: null,
      created_at: new Date().toISOString(),
      status: expiryStatus(expiresOn),
    });

    start(async () => {
      const result = await uploadDocument({
        propertyId,
        title,
        docType,
        expiresOn,
        file,
      });
      // Either way the optimistic row goes: on success the server row replaces it,
      // on failure it must visibly disappear rather than linger. FR-041.
      onOptimistic?.(null);
      if (!result.ok) {
        setError(result.error);
        setOpen(true);
      }
    });
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Upload a document">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-2">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)]"
            />
          </div>

          <div>
            <label htmlFor="docType" className="block mb-2">
              Kind
            </label>
            <select
              id="docType"
              name="docType"
              defaultValue="other"
              className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {DOCUMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expiresOn" className="block mb-2">
              Expires on
            </label>
            <input
              id="expiresOn"
              name="expiresOn"
              type="date"
              className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)]"
            />
            <p className="mt-2 text-[var(--mute)]">
              Leave blank if it does not expire, like a floor plan.
            </p>
          </div>

          <div>
            <label htmlFor="file" className="block mb-2">
              File
            </label>
            <input
              id="file"
              name="file"
              type="file"
              required
              accept="application/pdf,image/*"
              className="w-full min-h-[44px]"
            />
          </div>

          {error ? (
            <p role="alert" className="text-[var(--alert)]">
              {error}
            </p>
          ) : null}

          <Button type="submit" thumb disabled={pending}>
            {pending ? "Uploading" : "Upload"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
