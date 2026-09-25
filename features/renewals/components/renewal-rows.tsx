import Link from "next/link";
import { PanelList } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";
import type { RenewalItem } from "@/features/renewals/types";
import { renewalLabel, renewalTone } from "@/features/renewals/build";
import { HandleRenewalButton } from "./handle-button";

/** Client renewals as rows inside a panel. The team's renewals page keeps RenewalList. */
export function RenewalRows({
  items,
  showProperty = false,
}: {
  items: RenewalItem[];
  showProperty?: boolean;
}) {
  return (
    <PanelList>
      {items.map((item) => (
        <li key={item.key} className="px-4 pt-3.5 pb-1.5 md:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/properties/${item.propertyId}?tab=${item.kind === "document_expiry" ? "documents" : "home"}`}
                className="font-medium hover:underline"
              >
                {item.title}
              </Link>
              <p className="mt-0.5 text-[length:var(--text-small)] text-[var(--mute)]">
                {[showProperty ? item.propertyName : null, item.category, formatDate(item.dueOn)]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <StatusPill tone={renewalTone(item)}>{renewalLabel(item)}</StatusPill>
          </div>
          <HandleRenewalButton item={item} compact />
        </li>
      ))}
    </PanelList>
  );
}
