import { AuthFrame } from "@/components/brand/auth-frame";
import { ForgotForm } from "@/features/auth/components/forgot-form";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthFrame title="Reset your password" subtitle="Enter your email and we will send you a link to choose a new one.">
      <ForgotForm />
    </AuthFrame>
  );
}
