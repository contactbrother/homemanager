import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { SupportLink } from "@/features/auth/components/support-link";
import { AuthFrame } from "@/components/brand/auth-frame";

export const metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <AuthFrame
      title="Create your account"
      subtitle="Keep everything about your home in one place, with a team that handles it."
      footer={<SupportLink className="text-center" />}
    >
      <SignUpForm />
    </AuthFrame>
  );
}
