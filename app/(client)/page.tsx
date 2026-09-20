import Link from "next/link";
import { requireClient } from "@/features/auth/guards";
import { getAttentionItems } from "@/features/dashboard/attention";
import { listProperties } from "@/features/properties/queries";
import { NewTaskSheet } from "@/features/tasks/components/new-task-sheet";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = { title: "Dar" };

export default async function HomePage() {
  const profile = await requireClient();
  const [items, properties] = await Promise.all([
    getAttentionItems(),
    listProperties(),
  ]);

  const firstName = profile.full_name?.split(" ")[0];

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">
        {firstName ? `Hello, ${firstName}` : "Hello"}
      </h1>

      {items.length === 0 ? (
        // FR-033. A sentence, not an empty list. Principle VIII.
        <p className="mt-6 text-[var(--ink-soft)]">
          Nothing needs your attention.
        </p>
      ) : (
        <>
          <p className="mt-2 text-[var(--ink-soft)]">
            {items.length === 1
              ? "One thing needs your attention."
              : `${items.length} things need your attention.`}
          </p>
          <ul className="mt-6 space-y-3 settle">
            {items.map((item) => (
              <Card as="li" key={item.id}>
                <Link href={item.href} className="block p-4 min-h-[44px]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium">{item.title}</span>
                    <StatusPill tone={item.tone}>{item.detail}</StatusPill>
                  </div>
                </Link>
              </Card>
            ))}
          </ul>
        </>
      )}

      {/* FR-034. One primary action, reachable without navigating first. */}
      <div className="fixed bottom-[56px] inset-x-0 border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto max-w-md px-5 py-3">
          <NewTaskSheet properties={properties} />
        </div>
      </div>
    </>
  );
}
