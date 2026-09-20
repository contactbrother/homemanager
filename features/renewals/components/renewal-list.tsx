import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";
import type { RenewalItem } from "@/features/renewals/types";
import { renewalLabel, renewalTone } from "@/features/renewals/build";
import { HandleRenewalButton } from "./handle-button";

export function RenewalList({
  items,
  showProperty = false,
  linkBase,
  taskBase = "/tasks",
  handleLabel,
}: {
  items: RenewalItem[];
  showProperty?: boolean;
  /** Where a row links: `/properties` for clients, `/admin/clients` needs the owner. */
  linkBase: "client" | "admin";
  taskBase?: string;
  handleLabel?: string;
}) {
  return (
    <ul className="mt-4 space-y-3 settle">
      {items.map((item) => {
        const href =
          linkBase === "client"
            ? `/properties/${item.propertyId}`
            : `/admin/clients/${item.ownerId}`;
        return (
          <Card as="li" key={item.key} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={href} className="font-medium hover:underline">
                  {item.title}
                </Link>
                <p className="text-[length:var(--text-small)] text-[var(--mute)]">
                  {[showProperty ? item.propertyName : null, item.category, formatDate(item.dueOn)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <StatusPill tone={renewalTone(item)}>{renewalLabel(item)}</StatusPill>
            </div>
            <div className="mt-2 -ml-3">
              <HandleRenewalButton item={item} href={taskBase} label={handleLabel} />
            </div>
          </Card>
        );
      })}
    </ul>
  );
}
