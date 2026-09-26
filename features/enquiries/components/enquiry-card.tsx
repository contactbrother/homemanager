"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { setEnquiryStatus } from "@/features/enquiries/actions";
import type { Enquiry, EnquiryStatus } from "@/features/enquiries/queries";
import { formatRelative, formatDate } from "@/lib/format";

const LABELS: Record<EnquiryStatus, string> = { new: "New", contacted: "Contacted", closed: "Closed" };

/** One website enquiry: who, how to reach them, what they asked, and where it stands. */
export function EnquiryCard({ enquiry }: { enquiry: Enquiry }) {
  const [status, setStatus] = useOptimistic(enquiry.status);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const digits = enquiry.phone?.replace(/[^\d]/g, "") ?? "";
  const wa = digits ? `https://wa.me/${digits.startsWith("0") ? `971${digits.slice(1)}` : digits}` : null;

  function change(next: EnquiryStatus) {
    setError(null);
    start(async () => {
      setStatus(next);
      const result = await setEnquiryStatus({ id: enquiry.id, status: next });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li className="px-4 py-4 md:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`${status === "new" ? "font-bold" : "font-semibold"}`}>{enquiry.name}</p>
          <p className="mt-0.5 text-[length:var(--text-small)] text-[var(--mute)]">
            {[enquiry.community, enquiry.service].filter(Boolean).join(", ") || "No details given"}
          </p>
        </div>
        <time suppressHydrationWarning title={formatDate(enquiry.created_at)} className="shrink-0 text-[length:var(--text-tiny)] text-[var(--mute)]">
          {formatRelative(enquiry.created_at)}
        </time>
      </div>
      {enquiry.message ? <p className="mt-2 whitespace-pre-line text-[var(--ink-soft)]">{enquiry.message}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[var(--r-full)] bg-[var(--accent)] px-3.5 text-[length:var(--text-small)] font-semibold text-white">
            <MessageCircle aria-hidden size={16} /> WhatsApp
          </a>
        ) : null}
        {enquiry.phone ? (
          <a href={`tel:${enquiry.phone}`} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[var(--r-full)] border border-[var(--line-strong)] px-3.5 text-[length:var(--text-small)] font-semibold">
            <Phone aria-hidden size={16} /> {enquiry.phone}
          </a>
        ) : null}
        {enquiry.email ? (
          <a href={`mailto:${enquiry.email}`} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[var(--r-full)] border border-[var(--line-strong)] px-3.5 text-[length:var(--text-small)] font-semibold">
            <Mail aria-hidden size={16} /> {enquiry.email}
          </a>
        ) : null}
        <label className="ml-auto inline-flex items-center gap-2 text-[length:var(--text-small)] font-medium">
          <span className="sr-only">Status</span>
          <select
            value={status}
            onChange={(e) => change(e.target.value as EnquiryStatus)}
            className="min-h-[40px] px-3 text-[length:var(--text-small)]"
          >
            {(Object.keys(LABELS) as EnquiryStatus[]).map((s) => (
              <option key={s} value={s}>{LABELS[s]}</option>
            ))}
          </select>
        </label>
      </div>
      {error ? <p role="alert" className="mt-2 text-[length:var(--text-small)] text-[var(--alert)]">{error}</p> : null}
    </li>
  );
}
