"use client";

import { useOptimistic, useState } from "react";
import { DocumentRowItem } from "./document-row";
import { UploadSheet } from "./upload-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import type { DocumentWithStatus } from "@/features/documents/types";

/**
 * FR-041. The uploaded document appears the moment it is chosen, before the server
 * has finished, and disappears again if the upload fails. The interface responds
 * instantly and the server catches up. Principle VII.
 */
export function DocumentList({
  documents,
  propertyId,
  canDelete = false,
  uploadVariant = "primary",
  uploadLabel,
}: {
  documents: DocumentWithStatus[];
  propertyId: string;
  canDelete?: boolean;
  uploadVariant?: "primary" | "outline";
  uploadLabel?: string;
}) {
  const [pendingUpload, setPendingUpload] = useState<DocumentWithStatus | null>(null);
  const [optimistic] = useOptimistic(
    pendingUpload ? [pendingUpload, ...documents] : documents,
  );

  return (
    <>
      {optimistic.length === 0 ? (
        <EmptyState>No documents yet.</EmptyState>
      ) : (
        <ul className="mt-4 space-y-3 settle">
          {optimistic.map((doc) => (
            <DocumentRowItem
              key={doc.id}
              document={doc}
              canDelete={canDelete && !doc.id.startsWith("pending-")}
              pending={doc.id.startsWith("pending-")}
            />
          ))}
        </ul>
      )}

      <div className="mt-4">
        <UploadSheet
          propertyId={propertyId}
          variant={uploadVariant}
          label={uploadLabel}
          onOptimistic={setPendingUpload}
        />
      </div>
    </>
  );
}
