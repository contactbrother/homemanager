/**
 * A sample of the client portal's home screen, drawn in HTML with sample content so
 * visitors see exactly what clients get. Labelled as a sample.
 */
export function PhoneMock({ className = "" }: { className?: string }) {
  const row = (title: string, meta: string, pill: string, tone: "warn" | "alert" | "quiet" | "ok") => {
    const tones = {
      warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
      alert: "bg-[var(--alert-soft)] text-[var(--alert)]",
      quiet: "bg-[var(--surface-2)] text-[var(--ink-soft)] border border-[var(--line)]",
      ok: "bg-[var(--ok-soft)] text-[var(--ok)]",
    };
    return (
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-semibold leading-tight text-[var(--ink)]">{title}</p>
        <p className="text-[10px] text-[var(--mute)]">{meta}</p>
        <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9.5px] font-medium ${tones[tone]}`}>{pill}</span>
      </div>
    );
  };
  return (
    <figure className={className}>
      <div className="mx-auto w-[260px] rounded-[40px] border-[10px] border-[var(--ink)] bg-[var(--bg)] shadow-[0_24px_60px_rgba(24,34,30,0.25)]">
        <div className="h-[520px] overflow-hidden rounded-[30px]">
          <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 pb-2.5 pt-7">
            <span className="h-5 w-5 rounded-md bg-[var(--accent)]" />
            <span className="text-[13px] font-bold">Dar</span>
          </div>
          <div className="px-3 pt-3">
            <p className="text-[16px] font-semibold">Hello, Sara</p>
            <p className="text-[10.5px] text-[var(--ink-soft)]">One request needs a reply and two renewals coming up.</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
              <p className="border-b border-[var(--line)] px-3 py-2 text-[11.5px] font-semibold">Waiting on you</p>
              {row("Approve pool pump quote", "Updated yesterday", "Waiting on you", "warn")}
            </div>
            <div className="mt-2.5 overflow-hidden rounded-xl border border-[var(--line)] bg-white divide-y divide-[var(--line)]">
              <p className="px-3 py-2 text-[11.5px] font-semibold">Next 30 days</p>
              {row("Ejari", "Expires in 12 days", "Expires soon", "alert")}
              {row("Living room AC", "Service due", "Due in 15 days", "quiet")}
            </div>
            <div className="mt-2.5 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
              <p className="border-b border-[var(--line)] px-3 py-2 text-[11.5px] font-semibold">Dar is handling</p>
              {row("Garden irrigation leak", "Part ordered", "In progress", "ok")}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[length:var(--text-small)] text-[var(--mute)]">
        The client home screen, with sample content
      </figcaption>
    </figure>
  );
}
