import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";

/** A titled group of settings rows, like a phone's Settings app. */
export function SettingsGroup({
  title,
  footnote,
  children,
}: {
  title?: string;
  footnote?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      {title ? (
        <h2 className="mb-2 px-1 text-[length:var(--text-small)] font-semibold text-[var(--mute)]">{title}</h2>
      ) : null}
      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)]">
        {children}
      </ul>
      {footnote ? (
        <p className="mt-2 px-1 text-[length:var(--text-small)] text-[var(--mute)]">{footnote}</p>
      ) : null}
    </section>
  );
}

export function RowContent({
  icon,
  label,
  value,
  tone = "default",
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  tone?: "default" | "danger" | "accent";
  trailing?: React.ReactNode;
}) {
  const color =
    tone === "danger" ? "text-[var(--alert)]" : tone === "accent" ? "text-[var(--accent-text)]" : "text-[var(--ink)]";
  return (
    <span className="flex min-h-[56px] w-full items-center gap-3 px-4 text-left md:px-5">
      <span aria-hidden className={`shrink-0 ${tone === "default" ? "text-[var(--ink-soft)]" : color}`}>
        {icon}
      </span>
      <span className={`min-w-0 flex-1 font-medium ${color}`}>{label}</span>
      {value ? <span className="min-w-0 truncate text-[var(--mute)]">{value}</span> : null}
      {trailing}
    </span>
  );
}

const rowClass =
  "block w-full transition-colors duration-[var(--fast)] hover:bg-[var(--surface-2)] active:bg-[var(--line)]";

export function LinkRow(props: React.ComponentProps<typeof RowContent> & { href: string; external?: boolean }) {
  const { href, external, ...content } = props;
  const trailing = external ? (
    <ExternalLink aria-hidden size={16} className="shrink-0 text-[var(--mute)]" />
  ) : (
    <ChevronRight aria-hidden size={18} className="shrink-0 text-[var(--mute)]" />
  );
  return (
    <li>
      {external ? (
        <a href={href} className={rowClass} target="_blank" rel="noopener noreferrer">
          <RowContent {...content} trailing={trailing} />
        </a>
      ) : (
        <Link href={href} className={rowClass}>
          <RowContent {...content} trailing={trailing} />
        </Link>
      )}
    </li>
  );
}

export { rowClass };
