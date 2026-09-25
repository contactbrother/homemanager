import Link from "next/link";

/**
 * A panel is one white surface per topic, with its items divided inside it. One
 * panel reads as one thing; a stack of separate cards reads as many.
 */
export function Panel({
  title,
  count,
  action,
  children,
  className = "",
  as: Tag = "section",
}: {
  title?: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div";
}) {
  return (
    <Tag
      className={`min-w-0 overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] ${className}`}
    >
      {title ? (
        <header className="flex min-h-[56px] items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-2 md:px-5">
          <h2 className="flex items-center gap-2 text-[length:var(--text-heading)]">
            {title}
            {count != null && count > 0 ? (
              <span className="rounded-[var(--r-full)] bg-[var(--surface-2)] px-2 py-0.5 text-[length:var(--text-small)] font-semibold text-[var(--ink-soft)]">
                {count}
              </span>
            ) : null}
          </h2>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </Tag>
  );
}

export function PanelList({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-[var(--line)]">{children}</ul>;
}

/** A row that is a link when given an href. */
export function PanelRow({
  href,
  children,
  current = false,
}: {
  href?: string;
  children: React.ReactNode;
  current?: boolean;
}) {
  const pad = "block px-4 py-3.5 md:px-5";
  return (
    <li className={current ? "bg-[var(--accent-soft)]" : ""}>
      {href ? (
        <Link
          href={href}
          aria-current={current ? "page" : undefined}
          className={`${pad} min-h-[44px] transition-colors duration-[var(--fast)] ${current ? "" : "hover:bg-[var(--surface-2)] active:bg-[var(--line)]"}`}
        >
          {children}
        </Link>
      ) : (
        <div className={pad}>{children}</div>
      )}
    </li>
  );
}

/** An empty panel says what will appear here, in a sentence. */
export function PanelEmpty({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-6 md:px-5">
      <p className="text-[var(--mute)]">{children}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
