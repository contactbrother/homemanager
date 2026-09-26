import { LogOut } from "lucide-react";
import { requireAdmin } from "@/features/auth/guards";
import { signOut } from "@/features/auth/actions";
import { AppShell } from "@/components/shell/app-shell";
import { TEAM_NAV } from "@/components/shell/nav-items";
import { getMyActivity } from "@/features/tasks/activity";
import { countNewEnquiries } from "@/features/enquiries/queries";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const [activity, newEnquiries] = await Promise.all([getMyActivity(), countNewEnquiries()]);
  const unread = [...activity.values()].filter((a) => a.unread > 0).length;
  const items = TEAM_NAV.map((item) =>
    item.icon === "inbox" ? { ...item, badge: unread } : item.icon === "enquiries" ? { ...item, badge: newEnquiries } : item,
  );

  return (
    <AppShell
      items={items}
      homeHref="/admin"
      team
      width="wide"
      sidebarFooter={
        <form action={signOut}>
          <button className="flex w-full min-h-[60px] flex-col items-center justify-center gap-1 rounded-[var(--r-md)] px-1 text-[length:var(--text-tiny)] font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-2)] lg:min-h-[44px] lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-[length:var(--text-body)]">
            <LogOut aria-hidden size={20} strokeWidth={1.75} />
            <span className="leading-tight">Sign out</span>
          </button>
        </form>
      }
      topBarEnd={
        <form action={signOut}>
          <button
            aria-label="Sign out"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] text-[var(--ink-soft)] hover:bg-[var(--surface-2)]"
          >
            <LogOut aria-hidden size={20} strokeWidth={1.75} />
          </button>
        </form>
      }
    >
      {children}
    </AppShell>
  );
}
