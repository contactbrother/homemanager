import Link from "next/link";
import { AuthFrame } from "@/components/brand/auth-frame";
import { ResetForm } from "@/features/auth/components/reset-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  return (
    <AuthFrame
      title="Choose a new password"
      subtitle={signedIn ? "You will stay signed in on this device." : "This reset link has expired or was already used."}
    >
      {signedIn ? (
        <ResetForm />
      ) : (
        <Link href="/forgot-password" className="inline-flex min-h-[48px] items-center rounded-[var(--r-md)] bg-[var(--accent)] px-6 font-semibold text-white">
          Send a new link
        </Link>
      )}
    </AuthFrame>
  );
}
