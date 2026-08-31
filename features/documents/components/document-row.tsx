"use client";

import { useState, useTransition } from "react";
import { deleteDocument, getDocumentUrl } from "@/features/documents/actions";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { expiryLabel, expiryTone } from "@/features/documents/expiry";
import type { DocumentWithStatus } from "@/features/documents/types";

/**
 * FR-014 to FR-017. Expiring soon is marked, expired is marked more prominently, and
 * everything else stays quiet with no status marking at all.
 *
 * `canDelete` is only ever passed on admin screens. FR-019 forbids client deletion,
 * and the policies refuse it regardless of what this component renders.
 */
export function DocumentRowItem({
  document: doc,
  canDelete = false,
}: {
  document: DocumentWithStatus;
  canDelete?: boolean;
}) {
  const [busy, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const label = expiryLabel(doc.expires_on);

  function open() {
    setError(null);
    start(async () => {
      const result = await getDocumentUrl(doc.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.open(result.data.url, "_blank", "noopener");
    });
  }

  function remove() {
    setError(null);
    start(async () => {
      const result = await deleteDocument(doc.id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <Card as="li">
      <div className="p-4 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={open}
          disabled={busy}
          className="text-left min-h-[44px] flex-1"
        >
          <span className="font-medium">{doc.title}</span>
          <span className="block text-[var(--mute)]">
            {DOCUMENT_TYPE_LABELS[doc.doc_type]}
            {doc.expires_on ? ` · ${formatDate(doc.expires_on)}` : ""}
          </span>
        </button>

        <div className="flex flex-col items-end gap-2">
          {label ? (
            <StatusPill tone={expiryTone(doc.status)}>{label}</StatusPill>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="text-[var(--alert)] min-h-[44px]"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p role="alert" className="px-4 pb-4 text-[var(--alert)]">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
