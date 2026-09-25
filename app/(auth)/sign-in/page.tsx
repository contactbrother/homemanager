import { SignInForm } from "@/features/auth/components/sign-in-form";
import { SupportLink } from "@/features/auth/components/support-link";
import { AuthFrame } from "@/components/brand/auth-frame";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ ended?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthFrame
      title="Sign in"
      subtitle="Your documents, renewals and requests, all in one place."
      footer={<SupportLink className="text-center" />}
    >
      {params.ended ? (
        <p className="mb-6 rounded-[var(--r-md)] bg-[var(--surface-2)] px-4 py-3 text-[var(--ink-soft)]">
          You have been signed out. If you think that is a mistake, message the team.
        </p>
      ) : null}

      {params.error === "link" ? (
        <p role="alert" className="mb-6 rounded-[var(--r-md)] bg-[var(--alert-soft)] px-4 py-3 text-[var(--alert)]">
          That link has expired or has already been used. Sign in with your email and password
          instead.
        </p>
      ) : null}

      <SignInForm />
    </AuthFrame>
  );
}
