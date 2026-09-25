type Tone = "quiet" | "warn" | "alert" | "ok";

const tones: Record<Tone, string> = {
  // A healthy screen carries no status colour at all. Build plan section 4.3.
  quiet: "text-[var(--ink-soft)] bg-[var(--surface-2)] border-[var(--line)]",
  warn: "text-[var(--warn)] bg-[var(--warn-soft)] border-transparent",
  alert: "text-[var(--alert)] bg-[var(--alert-soft)] border-transparent",
  ok: "text-[var(--ok)] bg-[var(--ok-soft)] border-transparent",
};

export function StatusPill({
  children,
  tone = "quiet",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[var(--r-full)] border px-2.5 py-0.5 text-[length:var(--text-small)] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
