import { requireClient } from "@/features/auth/guards";
import { listProperties } from "@/features/properties/queries";
import { NewTaskSheet } from "@/features/tasks/components/new-task-sheet";
import { AppShell, SidebarHelp } from "@/components/shell/app-shell";
import { CLIENT_NAV } from "@/components/shell/nav-items";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();
  const properties = await listProperties();

  return (
    <AppShell
      items={CLIENT_NAV}
      homeHref="/"
      action={<NewTaskSheet properties={properties} trigger="sidebar" />}
      phoneAction={<NewTaskSheet properties={properties} trigger="fab" />}
      sidebarFooter={<SidebarHelp />}
    >
      {children}
    </AppShell>
  );
}
