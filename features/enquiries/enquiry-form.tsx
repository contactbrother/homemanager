"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { sendEnquiry } from "./actions";

export function EnquiryForm({
  communities,
  services,
  whatsapp,
}: {
  communities: readonly string[];
  services: string[];
  whatsapp: string | null;
}) {
  const path = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  function submit(form: FormData) {
    setError(null);
    start(async () => {
      const result = await sendEnquiry({
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        community: String(form.get("community") ?? ""),
        service: String(form.get("service") ?? ""),
        message: String(form.get("message") ?? ""),
        website: String(form.get("website") ?? ""),
        path,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div role="status" className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8">
        <CheckCircle2 aria-hidden size={32} className="text-[var(--accent)]" />
        <p className="mt-4 text-[1.25rem] font-semibold">Thank you. We have your enquiry.</p>
        <p className="mt-2 text-[var(--ink-soft)]">We will be in touch soon.{whatsapp ? " If it is urgent, message us on WhatsApp." : ""}</p>
        {whatsapp ? (
          <a href={whatsapp} className="mt-6 inline-flex min-h-[48px] items-center rounded-[var(--r-full)] bg-[var(--accent)] px-6 font-semibold text-white">
            Chat on WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  const field = "w-full min-h-[48px] px-4";
  return (
    <form action={submit} className="space-y-5 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 md:p-8">
      <div>
        <label htmlFor="enq-name" className="mb-2 block">Your name</label>
        <input id="enq-name" name="name" required autoComplete="name" className={field} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="enq-phone" className="mb-2 block">Phone or WhatsApp</label>
          <input id="enq-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className={field} />
        </div>
        <div>
          <label htmlFor="enq-email" className="mb-2 block">
            Email <span className="text-[var(--mute)]">Optional</span>
          </label>
          <input id="enq-email" name="email" type="email" autoComplete="email" className={field} />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="enq-community" className="mb-2 block">Community</label>
          <select id="enq-community" name="community" className={field} defaultValue="">
            <option value="">Choose one</option>
            {communities.map((c) => (
              <option key={c}>{c}</option>
            ))}
            <option>Somewhere else</option>
          </select>
        </div>
        <div>
          <label htmlFor="enq-service" className="mb-2 block">Interested in</label>
          <select id="enq-service" name="service" className={field} defaultValue="">
            <option value="">Choose one</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
            <option>Not sure yet</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="enq-message" className="mb-2 block">
          Anything we should know? <span className="text-[var(--mute)]">Optional</span>
        </label>
        <textarea id="enq-message" name="message" rows={4} maxLength={2000} className="w-full px-4 py-3" />
      </div>
      {/* Hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="enq-website">Website</label>
        <input id="enq-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {error ? (
        <p role="alert" className="text-[var(--alert)]">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[var(--r-full)] bg-[var(--accent)] px-7 text-[1.0625rem] font-semibold text-white transition-[transform,background-color] hover:bg-[var(--accent-text)] active:scale-[0.98] disabled:opacity-60 md:w-auto"
      >
        {pending ? "Sending" : "Send enquiry"}
      </button>
      <p className="text-[length:var(--text-small)] text-[var(--mute)]">
        We use your details only to reply to you. See our <a href="/privacy" className="underline">privacy policy</a>.
      </p>
    </form>
  );
}
