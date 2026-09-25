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

/** Client overview: the home and its access details as two labelled groups. */
export function PropertyOverview({ property }: { property: Property }) {
  const groups: Array<{ title: string; rows: Array<[string, string | null | undefined]> }> = [
    {
      title: "About the home",
      rows: [
        ["Community", property.community],
        ["Villa", property.villa_number],
        ["Address", property.address],
        ["Bedrooms", property.bedrooms != null ? String(property.bedrooms) : null],
      ],
    },
    {
      title: "Access and contacts",
      rows: [
        ["Access", property.access_notes],
        ["Key holders", property.key_holders],
        ["Emergency contacts", property.emergency_contacts],
      ],
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-5">
      {groups.map((group) => {
        const filled = group.rows.filter(([, value]) => value);
        return (
          <section
            key={group.title}
            className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)]"
          >
            <h2 className="flex min-h-[56px] items-center border-b border-[var(--line)] px-4 text-[length:var(--text-heading)] md:px-5">
              {group.title}
            </h2>
            {filled.length === 0 ? (
              <p className="px-4 py-6 text-[var(--mute)] md:px-5">
                Not recorded yet. The team fills this in when your home is set up.
              </p>
            ) : (
              <dl className="divide-y divide-[var(--line)]">
                {filled.map(([label, value]) => (
                  <div key={label} className="grid gap-0.5 px-4 py-3 md:px-5 lg:grid-cols-[150px_minmax(0,1fr)] lg:gap-4">
                    <dt className="text-[length:var(--text-small)] text-[var(--mute)] lg:text-[length:var(--text-body)]">{label}</dt>
                    <dd className="whitespace-pre-line">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        );
      })}
    </div>
  );
}
