import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { SupportLink } from "@/features/auth/components/support-link";

export const metadata = { title: "Create your Dar account" };

export default function SignUpPage() {
  return (
    <main className="min-h-dvh flex flex-col px-6 py-10 max-w-md w-full mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-[length:var(--text-display)]">Dar</h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          Create an account to keep everything about your home in one place.
        </p>
      </div>

      <SignUpForm />
      <SupportLink className="mt-6 text-center" />
    </main>
  );
}
