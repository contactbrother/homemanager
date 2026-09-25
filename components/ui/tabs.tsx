import Link from "next/link";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

/**
 * Tabs held in the address (?tab=), so a refresh, a shared link or coming back from a
 * document lands on the same tab. Tabs replace history rather than add to it, so Back
 * leaves the page instead of stepping through every tab visited.
 */
export function Tabs({
  items,
  active,
  basePath,
}: {
  items: TabItem[];
  active: string;
  basePath: string;
}) {
  return (
    <nav aria-label="Sections" className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <ul className="flex min-w-max gap-1 border-b border-[var(--line)]">
        {items.map((item, index) => {
          const current = item.key === active;
          const href = index === 0 ? basePath : `${basePath}?tab=${item.key}`;
          return (
            <li key={item.key}>
              <Link
                href={href}
                replace
                scroll={false}
                aria-current={current ? "page" : undefined}
                className={[
                  "-mb-px inline-flex min-h-[48px] items-center gap-2 border-b-2 px-3 font-medium transition-colors duration-[var(--fast)]",
                  current
                    ? "border-[var(--accent)] text-[var(--accent-text)]"
                    : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {item.label}
                {item.count ? (
                  <span
                    className={`rounded-[var(--r-full)] px-1.5 text-[length:var(--text-tiny)] font-semibold ${current ? "bg-[var(--accent-soft)]" : "bg-[var(--surface-2)] text-[var(--mute)]"}`}
                  >
                    {item.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
