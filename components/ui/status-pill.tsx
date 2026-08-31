type Tone = "quiet" | "warn" | "alert" | "ok";

const tones: Record<Tone, string> = {
  // A healthy screen carries no status colour at all. Build plan section 4.3.
  quiet: "text-[var(--mute)] border-[var(--line)]",
  warn: "text-[var(--warn)] border-[var(--warn)]",
  alert: "text-[var(--alert)] border-[var(--alert)]",
  ok: "text-[var(--ok)] border-[var(--ok)]",
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
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[length:var(--text-small)] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
