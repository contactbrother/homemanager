export type IconName =
  | "home"
  | "file"
  | "requests"
  | "account"
  | "clients"
  | "inbox"
  | "renewals"
  | "vendors"
  | "enquiries";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Active only on the exact path. Otherwise any path under href counts. */
  exact?: boolean;
  /** Other path prefixes that also mark this item as current. */
  also?: string[];
  /** A count shown on the item, such as requests with unread updates. */
  badge?: number;
}

export const CLIENT_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "home", exact: true },
  { href: "/properties", label: "Home file", icon: "file" },
  { href: "/tasks", label: "Requests", icon: "requests" },
  { href: "/profile", label: "Account", icon: "account" },
];

export const TEAM_NAV: NavItem[] = [
  { href: "/admin", label: "Clients", icon: "clients", exact: true, also: ["/admin/clients"] },
  { href: "/admin/tasks", label: "Requests", icon: "inbox" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "enquiries" },
  { href: "/admin/renewals", label: "Renewals", icon: "renewals" },
  { href: "/admin/vendors", label: "Vendors", icon: "vendors" },
];

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.also?.some((prefix) => pathname.startsWith(prefix))) return true;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
