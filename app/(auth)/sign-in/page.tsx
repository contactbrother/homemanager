import { SignInForm } from "@/features/auth/components/sign-in-form";
import { SupportLink } from "@/features/auth/components/support-link";

export const metadata = { title: "Sign in to Dar" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ ended?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-dvh flex flex-col px-6 py-10 max-w-md w-full mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--r-md)] bg-[var(--accent)] text-white font-display text-[length:var(--text-heading)] font-semibold" aria-hidden="true">
          D
        </div>
        <h1 className="mt-6 text-[length:var(--text-display)]">Dar</h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          Everything about your home, in one place.
        </p>

        {params.ended ? (
          <p className="mt-6 text-[var(--ink-soft)]">
            You have been signed out. If you think that is a mistake, message the
            team.
          </p>
        ) : null}

        {params.error === "link" ? (
          <p className="mt-6 text-[var(--alert)]">
            That link has expired or has already been used. Sign in with your email
            and password instead.
          </p>
        ) : null}
      </div>

      <SignInForm />
      <SupportLink className="mt-6 text-center" />
    </main>
  );
}
