/** Empty states are sentences, not illustrations. Principle VIII. */
export function EmptyState({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-12 text-center">
      <p className="text-[var(--mute)]">{children}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
