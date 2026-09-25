import { LogOut, MessageCircle } from "lucide-react";
import { requireClient } from "@/features/auth/guards";
import { signOut } from "@/features/auth/actions";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { PasswordForm } from "@/features/auth/components/password-form";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Account" };

export default async function ProfilePage() {
  const profile = await requireClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const whatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/[^\d]/g, "");

  return (
    <div className="max-w-2xl">
      <PageHeader title="Account" subtitle={user?.email ? `Signed in as ${user.email}` : undefined} />

      <div className="grid gap-4 md:gap-5">
        <Panel title="Your details">
          <div className="px-4 py-5 md:px-5">
            <ProfileForm fullName={profile.full_name ?? ""} phone={profile.phone ?? ""} />
          </div>
        </Panel>

        <Panel title="Password">
          <div className="px-4 py-5 md:px-5">
            <PasswordForm />
          </div>
        </Panel>

        <Panel as="div">
          <ul className="divide-y divide-[var(--line)]">
            {whatsapp ? (
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  className="flex min-h-[56px] items-center gap-3 px-4 font-medium text-[var(--accent-text)] hover:bg-[var(--surface-2)] md:px-5"
                >
                  <MessageCircle aria-hidden size={20} strokeWidth={1.75} />
                  Message the team on WhatsApp
                </a>
              </li>
            ) : null}
            <li>
              <form action={signOut}>
                <button className="flex w-full min-h-[56px] items-center gap-3 px-4 font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-2)] md:px-5">
                  <LogOut aria-hidden size={20} strokeWidth={1.75} />
                  Sign out
                </button>
              </form>
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
