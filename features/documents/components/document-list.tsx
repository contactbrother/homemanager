"use client";

import { useOptimistic, useState } from "react";
import { DocumentRowItem } from "./document-row";
import { UploadSheet } from "./upload-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelEmpty, PanelList } from "@/components/ui/panel";
import type { DocumentWithStatus } from "@/features/documents/types";

/**
 * FR-041. The uploaded document appears the moment it is chosen, before the server
 * has finished, and disappears again if the upload fails. The interface responds
 * instantly and the server catches up. Principle VII.
 */
export function DocumentList({
  documents,
  propertyId,
  assets = [],
  canDelete = false,
  uploadVariant = "primary",
  uploadLabel,
  variant = "cards",
}: {
  documents: DocumentWithStatus[];
  propertyId: string;
  assets?: Array<{ id: string; name: string }>;
  canDelete?: boolean;
  uploadVariant?: "primary" | "outline";
  uploadLabel?: string;
  /** cards: the team layout. panel: one titled panel with the upload in its header. */
  variant?: "cards" | "panel";
}) {
  const [pendingUpload, setPendingUpload] = useState<DocumentWithStatus | null>(null);
  const [optimistic] = useOptimistic(
    pendingUpload ? [pendingUpload, ...documents] : documents,
  );

  if (variant === "panel") {
    return (
      <Panel
        title="Documents"
        count={optimistic.length}
        action={
          <UploadSheet
            propertyId={propertyId}
            assets={assets}
            variant="outline"
            label={uploadLabel ?? "Upload"}
            onOptimistic={setPendingUpload}
          />
        }
      >
        {optimistic.length === 0 ? (
          <PanelEmpty>
            No documents yet. Upload the title deed, Ejari, DEWA bills and anything with an
            expiry date, and we will track it.
          </PanelEmpty>
        ) : (
          <PanelList>
            {optimistic.map((doc) => (
              <DocumentRowItem
                key={doc.id}
                document={doc}
                variant="row"
                pending={doc.id.startsWith("pending-")}
              />
            ))}
          </PanelList>
        )}
      </Panel>
    );
  }

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
          assets={assets}
          variant={uploadVariant}
          label={uploadLabel}
          onOptimistic={setPendingUpload}
        />
      </div>
    </>
  );
}
