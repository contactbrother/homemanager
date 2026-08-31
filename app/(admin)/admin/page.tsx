import Link from "next/link";
import { listClients } from "@/features/clients/queries";
import { CreateClientSheet } from "@/features/clients/components/create-client-sheet";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = { title: "Clients" };

export default async function AdminClientsPage() {
  const clients = await listClients();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[length:var(--text-title)]">Clients</h1>
        <CreateClientSheet />
      </div>

      {clients.length === 0 ? (
        <EmptyState>No clients yet.</EmptyState>
      ) : (
        <ul className="mt-6 space-y-3">
          {clients.map((client) => (
            <Card as="li" key={client.id}>
              <Link
                href={`/admin/clients/${client.id}`}
                className="block p-4 min-h-[44px]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">
                    {client.full_name ?? "Unnamed client"}
                  </span>
                  {client.deactivated_at ? (
                    <StatusPill tone="alert">Deactivated</StatusPill>
                  ) : null}
                </div>
                <p className="mt-1 text-[var(--mute)]">
                  {client.properties?.length
                    ? client.properties.map((p) => p.name).join(", ")
                    : "No property yet"}
                </p>
              </Link>
            </Card>
          ))}
        </ul>
      )}
    </>
  );
}
