import { requireClient } from "@/features/auth/guards";
import { listProperties } from "@/features/properties/queries";
import { NewTaskSheet } from "@/features/tasks/components/new-task-sheet";
import { AppShell, SidebarHelp } from "@/components/shell/app-shell";
import { CLIENT_NAV } from "@/components/shell/nav-items";
import { getMyActivity } from "@/features/tasks/activity";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();
  const [properties, activity] = await Promise.all([listProperties(), getMyActivity()]);
  const unread = [...activity.values()].filter((a) => a.unread > 0).length;
  const items = CLIENT_NAV.map((item) => (item.icon === "requests" ? { ...item, badge: unread } : item));

  return (
    <AppShell
      items={items}
      homeHref="/"
      action={<NewTaskSheet properties={properties} trigger="sidebar" />}
      phoneAction={<NewTaskSheet properties={properties} trigger="fab" />}
      sidebarFooter={<SidebarHelp />}
      width="full"
    >
      {children}
    </AppShell>
  );
}
