import Link from "next/link";
import { redirect } from "next/navigation";
import { listProperties } from "@/features/properties/queries";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Your home" };

export default async function PropertiesPage() {
  const properties = await listProperties();

  // FR-008. One property is not a list of one.
  if (properties.length === 1) redirect(`/properties/${properties[0].id}`);

  if (properties.length === 0) {
    return (
      <>
        <h1 className="text-[length:var(--text-title)]">Your home</h1>
        <EmptyState>
          No property yet. The team is setting yours up.
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">Your homes</h1>
      <ul className="mt-6 space-y-3">
        {properties.map((property) => (
          <Card as="li" key={property.id}>
            <Link href={`/properties/${property.id}`} className="block p-4 min-h-[44px]">
              <span className="font-medium">{property.name}</span>
              {property.community ? (
                <span className="block text-[var(--mute)]">{property.community}</span>
              ) : null}
            </Link>
          </Card>
        ))}
      </ul>
    </>
  );
}
