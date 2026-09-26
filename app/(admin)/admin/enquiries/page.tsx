import Link from "next/link";
import { listEnquiries, type EnquiryStatus } from "@/features/enquiries/queries";
import { EnquiryCard } from "@/features/enquiries/components/enquiry-card";
import { Panel, PanelEmpty } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Enquiries" };

const FILTERS: Array<[EnquiryStatus | undefined, string]> = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["closed", "Closed"],
  [undefined, "All"],
];

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const status = (["new", "contacted", "closed", "all"].includes(show ?? "") ? show : "new") as EnquiryStatus | "all";
  const enquiries = await listEnquiries(status === "all" ? undefined : status);

  return (
    <>
      <PageHeader title="Enquiries" subtitle="People who wrote in through the website." />
      <nav aria-label="Show" className="-mx-5 mb-4 overflow-x-auto px-5 md:mx-0 md:px-0">
        <ul className="flex min-w-max gap-2">
          {FILTERS.map(([value, label]) => {
            const key = value ?? "all";
            const active = key === status;
            return (
              <li key={key}>
                <Link
                  href={key === "new" ? "/admin/enquiries" : `/admin/enquiries?show=${key}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-[40px] items-center rounded-[var(--r-full)] px-4 text-[length:var(--text-small)] font-semibold ${
                    active ? "bg-[var(--accent)] text-white" : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Panel as="div">
        {enquiries.length === 0 ? (
          <PanelEmpty>{status === "new" ? "No new enquiries. New ones from the website appear here." : "Nothing here."}</PanelEmpty>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {enquiries.map((e) => (
              <EnquiryCard key={e.id} enquiry={e} />
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
