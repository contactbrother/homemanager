import { FileText, Info, KeyRound, LogOut, MessageCircle, ShieldCheck, Trash2, UserRound, CircleHelp, House } from "lucide-react";
import { requireClient } from "@/features/auth/guards";
import { signOut } from "@/features/auth/actions";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { PasswordForm } from "@/features/auth/components/password-form";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsGroup, LinkRow, RowContent, rowClass } from "@/features/account/components/settings";
import { SheetRow } from "@/features/account/components/sheet-row";
import { ReminderToggle } from "@/features/account/components/reminder-toggle";

export const metadata = { title: "Account" };

const FAQ: Array<[string, string]> = [
  [
    "What does Dar look after?",
    "The running of your home: documents and renewals, maintenance and repairs, the vendors who do the work, and anything you send us as a request.",
  ],
  [
    "How do I ask for something?",
    "Tap New request, say what is needed and how urgent it is. Every update from the team appears in that request's history, and you can reply there.",
  ],
  [
    "How will I know when something is due?",
    "Your home screen lists everything due in the next 30 days. We also email reminders, unless you turn them off under Notifications.",
  ],
  [
    "Who can see my documents?",
    "Only you and the Dar team. Files are stored privately and open through links that expire after a minute.",
  ],
  [
    "What if it is an emergency?",
    "Send the request as Emergency, then message us on WhatsApp so we see it straight away.",
  ],
];

export default async function ProfilePage() {
  const profile = await requireClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const whatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/[^\d]/g, "");
  const deletion = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        `Hello Dar, please delete my account and my data. My account email is ${user?.email ?? ""}.`,
      )}`
    : null;
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  const icon = { size: 20, strokeWidth: 1.75 } as const;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Account" subtitle={user?.email ? `Signed in as ${user.email}` : undefined} />

      <div className="grid gap-7">
        <SettingsGroup title="Profile">
          <SheetRow icon={<UserRound {...icon} />} label="Name and phone" value={profile.full_name ?? undefined} sheetTitle="Your details">
            <ProfileForm fullName={profile.full_name ?? ""} phone={profile.phone ?? ""} />
          </SheetRow>
          <LinkRow icon={<House {...icon} />} label="Your homes" href="/properties" />
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SheetRow icon={<KeyRound {...icon} />} label="Change password">
            <PasswordForm />
          </SheetRow>
        </SettingsGroup>

        <SettingsGroup
          title="Notifications"
          footnote="Reminders go to your account email 30, 14 and 3 days before something is due, and on the day."
        >
          <ReminderToggle on={profile.email_reminders !== false} />
        </SettingsGroup>

        <SettingsGroup title="Help">
          {whatsapp ? (
            <LinkRow icon={<MessageCircle {...icon} />} label="Message the team on WhatsApp" href={`https://wa.me/${whatsapp}`} external tone="accent" />
          ) : null}
          <SheetRow icon={<CircleHelp {...icon} />} label="Questions and answers">
            <dl className="divide-y divide-[var(--line)]">
              {FAQ.map(([q, a]) => (
                <div key={q} className="py-4 first:pt-0 last:pb-0">
                  <dt className="font-semibold">{q}</dt>
                  <dd className="mt-1.5 text-[var(--ink-soft)]">{a}</dd>
                </div>
              ))}
            </dl>
          </SheetRow>
        </SettingsGroup>

        <SettingsGroup title="Legal">
          <LinkRow icon={<ShieldCheck {...icon} />} label="Privacy policy" href="/privacy" />
          <LinkRow icon={<FileText {...icon} />} label="Terms of service" href="/terms" />
        </SettingsGroup>

        <SettingsGroup>
          <li>
            <form action={signOut}>
              <button className={rowClass}>
                <RowContent icon={<LogOut {...icon} />} label="Sign out" />
              </button>
            </form>
          </li>
          {deletion ? (
            <SheetRow icon={<Trash2 {...icon} />} label="Delete my account" tone="danger" sheetTitle="Delete your account">
              <div className="space-y-4">
                <p>
                  We will delete your account, your homes, documents and request history, and
                  confirm on WhatsApp when it is done.
                </p>
                <p className="text-[var(--ink-soft)]">
                  Anything we are required to keep by law, such as invoices, is kept only for as
                  long as the law requires.
                </p>
                <a
                  href={deletion}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[var(--r-md)] bg-[var(--alert)] px-5 font-semibold text-white active:scale-[0.98]"
                >
                  Send deletion request on WhatsApp
                </a>
              </div>
            </SheetRow>
          ) : null}
        </SettingsGroup>

        <p className="flex items-center justify-center gap-2 pb-2 text-[length:var(--text-small)] text-[var(--mute)]">
          <Info aria-hidden size={14} />
          Dar{version ? `, version ${version}` : ""}
        </p>
      </div>
    </div>
  );
}
