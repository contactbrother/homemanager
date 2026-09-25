/**
 * The Dar mark: a villa doorway, an arch in sand set into a palm square.
 * "Dar" means home. This is the one decorative element in the product.
 */
export function DarMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
    >
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path d="M10 25V15a6 6 0 0 1 12 0v10z" fill="var(--sand)" />
      <path d="M13.5 25v-8.5a2.5 2.5 0 0 1 5 0V25z" fill="var(--accent)" />
    </svg>
  );
}

export function DarWordmark({ team = false }: { team?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <DarMark size={30} />
      <span className="text-[1.25rem] font-bold tracking-[-0.02em] text-[var(--ink)]">Dar</span>
      {team ? (
        <span className="rounded-[var(--r-full)] bg-[var(--surface-2)] border border-[var(--line)] px-2 py-0.5 text-[length:var(--text-tiny)] font-medium text-[var(--ink-soft)]">
          Team
        </span>
      ) : null}
    </span>
  );
}
