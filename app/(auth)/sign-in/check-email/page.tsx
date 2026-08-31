import { CheckEmail } from "@/features/auth/components/check-email";
import { SupportLink } from "@/features/auth/components/support-link";

export const metadata = { title: "Check your email" };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;

  return (
    <main className="min-h-dvh flex flex-col px-6 py-10 max-w-md w-full mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-[length:var(--text-title)]">Check your email</h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          {to ? (
            <>
              If <strong>{to}</strong> is registered with us, a sign-in link is on its
              way. The link works once and expires after 15 minutes.
            </>
          ) : (
            <>
              If that address is registered with us, a sign-in link is on its way. The
              link works once and expires after 15 minutes.
            </>
          )}
        </p>
        <p className="mt-3 text-[var(--mute)]">
          Nothing yet? Check your spam folder.
        </p>
      </div>

      <CheckEmail email={to ?? ""} />
      <SupportLink className="mt-6 text-center" />
    </main>
  );
}
