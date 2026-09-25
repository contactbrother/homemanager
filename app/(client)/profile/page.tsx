import { requireClient } from "@/features/auth/guards";
import { signOut } from "@/features/auth/actions";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { SupportLink } from "@/features/auth/components/support-link";

export const metadata = { title: "Account" };

export default async function ProfilePage() {
  const profile = await requireClient();

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">Account</h1>
      <div className="mt-6">
        <ProfileForm
          fullName={profile.full_name ?? ""}
          phone={profile.phone ?? ""}
        />
      </div>

      <SupportLink className="mt-10" />

      <form action={signOut} className="mt-6">
        <button className="min-h-[44px] text-[var(--mute)]">Sign out</button>
      </form>
    </>
  );
}
