/** Dar's own line illustrations, built on the villa arch in the mark. No stock imagery. */

export function HeroArch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 520" className={className} aria-hidden>
      <circle cx="360" cy="112" r="46" fill="var(--sand)" opacity=".55" />
      <path d="M40 520V240a200 200 0 0 1 400 0v280z" fill="var(--accent)" />
      <path d="M92 520V250a148 148 0 0 1 296 0v270z" fill="none" stroke="var(--sand)" strokeWidth="2" opacity=".5" />
      <path d="M160 520V270a80 80 0 0 1 160 0v250z" fill="var(--sand)" />
      <path d="M204 520V300a36 36 0 0 1 72 0v220z" fill="var(--accent)" opacity=".85" />
      {/* palm */}
      <g stroke="var(--accent-text)" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M430 520c-6-90 4-160 18-210" />
        <path d="M448 310c-26-22-58-24-84-10" />
        <path d="M448 310c10-30 36-48 64-50" />
        <path d="M448 310c-14-28-12-58 4-84" />
      </g>
    </svg>
  );
}

export function ServiceIcon({ kind, size = 56 }: { kind: "house" | "documents" | "watch"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden>
      <rect width="56" height="56" rx="16" fill="var(--accent-soft)" />
      {kind === "house" ? (
        <g fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 27l13-10 13 10" />
          <path d="M18 25v14h20V25" />
          <path d="M25 39v-7a3 3 0 0 1 6 0v7" />
          <path d="M37 16v5" />
        </g>
      ) : null}
      {kind === "documents" ? (
        <g fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14h13l6 6v22H19z" />
          <path d="M32 14v6h6" />
          <path d="M24 28h9M24 33h9" />
          <circle cx="38" cy="38" r="6" fill="var(--accent-soft)" />
          <path d="M38 35.5V38l1.8 1.2" />
        </g>
      ) : null}
      {kind === "watch" ? (
        <g fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="37" cy="18" r="4" />
          <path d="M14 40V29a9 9 0 0 1 18 0v11" />
          <path d="M11 40h34" />
          <path d="M20 40v-8a3 3 0 0 1 6 0v8" />
          <path d="M37 26v4M43 24l-2 3M31 24l2 3" />
        </g>
      ) : null}
    </svg>
  );
}
