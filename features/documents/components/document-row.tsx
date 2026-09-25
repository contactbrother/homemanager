"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
  pending = false,
  variant = "card",
}: {
  document: DocumentWithStatus;
  canDelete?: boolean;
  /** card: the team layout. row: a divided row inside a panel, columns from tablet up. */
  variant?: "card" | "row";
  /** An optimistic row, not yet stored. It cannot be opened or deleted. FR-041. */
  pending?: boolean;
}) {
  const [busy, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const label = pending ? null : expiryLabel(doc.expires_on);

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

  if (variant === "row") {
    // Opens the in-app viewer, so Back returns here rather than to a stray browser tab.
    const cells = (
      <>
        <span className="min-w-0">
          <span className="block truncate font-medium">{doc.title}</span>
          <span className="block text-[length:var(--text-small)] text-[var(--mute)]">
            {pending ? "Uploading" : DOCUMENT_TYPE_LABELS[doc.doc_type]}
            <span className="md:hidden">
              {doc.expires_on && !pending ? `, expires ${formatDate(doc.expires_on)}` : ""}
            </span>
          </span>
        </span>
        <span className="hidden text-[length:var(--text-small)] text-[var(--ink-soft)] md:block">
          {doc.expires_on && !pending ? `Expires ${formatDate(doc.expires_on)}` : "No expiry"}
        </span>
        <span className="flex items-center justify-end gap-1">
          {label ? <StatusPill tone={expiryTone(doc.status)}>{label}</StatusPill> : null}
          {!pending ? <ChevronRight aria-hidden size={18} className="text-[var(--mute)]" /> : null}
        </span>
      </>
    );
    const grid =
      "grid w-full min-h-[44px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 px-4 py-3.5 text-left md:grid-cols-[minmax(0,1fr)_200px_170px] md:px-5";
    return (
      <li>
        {pending ? (
          <div className={`${grid} opacity-60`}>{cells}</div>
        ) : (
          <Link
            href={`/properties/${doc.property_id}/documents/${doc.id}`}
            className={`${grid} transition-colors duration-[var(--fast)] hover:bg-[var(--surface-2)] active:bg-[var(--line)]`}
          >
            {cells}
          </Link>
        )}
      </li>
    );
  }

  return (
    <Card as="li">
      <div className="p-4 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={open}
          disabled={busy || pending}
          className="text-left min-h-[44px] flex-1"
        >
          <span className="font-medium">{doc.title}</span>
          <span className="block text-[var(--mute)]">
            {pending ? "Uploading" : DOCUMENT_TYPE_LABELS[doc.doc_type]}
            {doc.expires_on && !pending ? ` · ${formatDate(doc.expires_on)}` : ""}
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
