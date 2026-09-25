import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentViewer } from "@/features/documents/components/document-viewer";
import { ScreenBar } from "@/components/shell/screen-bar";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { DocumentRow } from "@/lib/supabase/types";

export async function generateMetadata({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("documents").select("title").eq("id", docId).maybeSingle();
  return { title: data?.title ?? "Document" };
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const { id, docId } = await params;
  const supabase = await createClient();

  // RLS decides what is visible. A document that is not theirs is simply not found.
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("id", docId)
    .eq("property_id", id)
    .maybeSingle();
  const doc = data as DocumentRow | null;
  if (!doc) notFound();

  const fileName = doc.file_path.split("/").pop() ?? `${doc.title}.pdf`;
  const detail = [
    DOCUMENT_TYPE_LABELS[doc.doc_type],
    doc.expires_on ? `Expires ${formatDate(doc.expires_on)}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <ScreenBar
        backHref={`/properties/${id}?tab=documents`}
        backLabel="Documents"
        title={doc.title}
        subtitle={detail}
      />
      <header className="mb-4 hidden md:block">
        <h1 className="text-[length:var(--text-title)]">{doc.title}</h1>
        <p className="mt-1.5 text-[var(--ink-soft)]">{detail}</p>
      </header>
      <DocumentViewer documentId={doc.id} title={doc.title} mimeType={doc.mime_type} fileName={fileName} />
    </div>
  );
}
