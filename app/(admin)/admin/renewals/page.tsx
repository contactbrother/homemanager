import Link from "next/link";
import { listRenewals } from "@/features/renewals/queries";
import { RenewalList } from "@/features/renewals/components/renewal-list";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Renewals" };

const HORIZONS = [30, 60, 90] as const;

/** Everything expiring or falling due across every client, soonest first. */
export default async function RenewalsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days } = await searchParams;
  const horizon = HORIZONS.includes(Number(days) as (typeof HORIZONS)[number])
    ? Number(days)
    : 60;

  const items = await listRenewals({ withinDays: horizon });
  const overdue = items.filter((i) => i.days <= 0);
  const upcoming = items.filter((i) => i.days > 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[length:var(--text-title)]">Renewals</h1>
          <p className="mt-1 text-[var(--mute)]">
            {overdue.length} overdue · {upcoming.length} due in the next {horizon} days
          </p>
        </div>
        <nav aria-label="Horizon" className="flex gap-2">
          {HORIZONS.map((value) => (
            <Link
              key={value}
              href={`/admin/renewals?days=${value}`}
              aria-current={horizon === value ? "page" : undefined}
              className={`inline-flex min-h-[40px] items-center rounded-[var(--r-md)] border px-3 text-[length:var(--text-small)] ${
                horizon === value
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white font-medium"
                  : "border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {value} days
            </Link>
          ))}
        </nav>
      </div>

      {items.length === 0 ? (
        <EmptyState>Nothing due in the next {horizon} days.</EmptyState>
      ) : (
        <>
          {overdue.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-[length:var(--text-heading)]">Overdue</h2>
              <RenewalList
                items={overdue}
                showProperty
                linkBase="admin"
                taskBase="/admin/tasks"
                handleLabel="Create request"
              />
            </section>
          ) : null}
          {upcoming.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-[length:var(--text-heading)]">Coming up</h2>
              <RenewalList
                items={upcoming}
                showProperty
                linkBase="admin"
                taskBase="/admin/tasks"
                handleLabel="Create request"
              />
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
