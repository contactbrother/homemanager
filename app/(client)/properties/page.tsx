import { redirect } from "next/navigation";
import { listProperties } from "@/features/properties/queries";
import { Panel, PanelEmpty, PanelList, PanelRow } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Home file" };

export default async function PropertiesPage() {
  const properties = await listProperties();

  // FR-008. One property is not a list of one.
  if (properties.length === 1) redirect(`/properties/${properties[0].id}`);

  return (
    <>
      <PageHeader
        title={properties.length > 1 ? "Your homes" : "Your home"}
        subtitle="Documents, the things in each home, and everything we are handling there."
      />
      <Panel as="div">
        {properties.length === 0 ? (
          <PanelEmpty>No home yet. The team is setting yours up and it will appear here.</PanelEmpty>
        ) : (
          <PanelList>
            {properties.map((property) => (
              <PanelRow key={property.id} href={`/properties/${property.id}`}>
                <span className="block font-medium">{property.name}</span>
                {property.community ? (
                  <span className="block text-[length:var(--text-small)] text-[var(--mute)]">{property.community}</span>
                ) : null}
              </PanelRow>
            ))}
          </PanelList>
        )}
      </Panel>
    </>
  );
}
