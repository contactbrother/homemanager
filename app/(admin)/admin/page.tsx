import { listClients } from "@/features/clients/queries";
import { CreateClientSheet } from "@/features/clients/components/create-client-sheet";
import { Panel, PanelEmpty, PanelList, PanelRow } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = { title: "Clients" };

export default async function AdminClientsPage() {
  const clients = await listClients();

  return (
    <>
      <PageHeader title="Clients" subtitle={`${clients.length} ${clients.length === 1 ? "client" : "clients"}`} action={<CreateClientSheet />} />
      <Panel as="div">
        {clients.length === 0 ? (
          <PanelEmpty>No clients yet. Add one to set up their home file.</PanelEmpty>
        ) : (
          <PanelList>
            {clients.map((client) => (
              <PanelRow key={client.id} href={`/admin/clients/${client.id}`}>
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-semibold">{client.full_name ?? "Unnamed client"}</span>
                    <span className="mt-0.5 block text-[length:var(--text-small)] text-[var(--mute)]">
                      {client.properties?.length ? client.properties.map((p) => p.name).join(", ") : "No home yet"}
                    </span>
                  </span>
                  {client.deactivated_at ? <StatusPill tone="alert">Deactivated</StatusPill> : null}
                </span>
              </PanelRow>
            ))}
          </PanelList>
        )}
      </Panel>
    </>
  );
}
