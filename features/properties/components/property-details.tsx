import type { Property } from "@/lib/supabase/types";

/** The facts about a home that matter at the door. Empty fields are not shown. */
export function PropertyDetails({ property, showPrivate = false }: { property: Property; showPrivate?: boolean }) {
  const rows: Array<[string, string | null | undefined]> = [
    ["Community", property.community],
    ["Villa", property.villa_number],
    ["Address", property.address],
    ["Bedrooms", property.bedrooms != null ? String(property.bedrooms) : null],
  ];
  if (showPrivate) {
    rows.push(
      ["Access", property.access_notes],
      ["Key holders", property.key_holders],
      ["Emergency contacts", property.emergency_contacts],
    );
  }
  const filled = rows.filter(([, value]) => value);
  if (filled.length === 0) return null;

  return (
    <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-[var(--r-md)] border border-[var(--line)] p-4 text-[length:var(--text-small)]">
      {filled.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-[var(--mute)]">{label}</dt>
          <dd className="whitespace-pre-line">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
