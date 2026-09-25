export function PageHeader({
  title,
  subtitle,
  action,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 md:mb-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[length:var(--text-title)]">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-[var(--ink-soft)]">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </header>
  );
}
