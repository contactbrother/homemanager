import { LegalContact } from "@/features/legal/contact";

export const metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <>
      <h1>Terms of service</h1>
      <p className="updated">Last updated 25 September 2026</p>

      <h2>About these terms</h2>
      <p>
        These terms apply when you use Dar, the app and the service behind it. By creating an
        account you agree to them. If you do not agree, please do not use Dar.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must be 18 or over and give accurate details.</li>
        <li>Keep your password private. You are responsible for what is done through your account.</li>
        <li>Tell us straight away if you think someone else has used it.</li>
      </ul>

      <h2>What Dar does</h2>
      <p>
        We keep your home file, remind you about renewals and services, and handle the
        requests you send us, arranging vendors where work is needed. Work that costs money is
        arranged only after you approve a quote or agree it with us.
      </p>

      <h2>Vendors</h2>
      <p>
        Vendors are independent businesses. We choose them with care and follow up on their
        work, but the work itself, and any guarantee on it, is theirs. We will help you raise
        and resolve any problem with a vendor we arranged.
      </p>

      <h2>What you upload</h2>
      <p>
        You confirm you have the right to share the documents and details you upload, and that
        they are accurate to the best of your knowledge. You remain the owner of them.
      </p>

      <h2>Reminders</h2>
      <p>
        Reminders are a help, not a guarantee. Renewals and legal deadlines remain your
        responsibility, and we rely on the dates recorded in your home file.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not misuse Dar: no unlawful content, no attempts to reach other people&apos;s data,
        and no interfering with how the service runs. We may suspend an account that does.
      </p>

      <h2>Liability</h2>
      <p>
        We work hard to keep Dar accurate and available but cannot promise it will always be
        uninterrupted or error-free. To the extent the law allows, we are not responsible for
        indirect losses. Nothing in these terms limits rights you have that the law does not
        allow us to exclude.
      </p>

      <h2>Ending your account</h2>
      <p>
        You can close your account at any time from Account. We may close it with notice if we
        stop offering the service, or at once for serious misuse.
      </p>

      <h2>Changes to these terms</h2>
      <p>If we make a material change, we will tell you in the app or by email before it takes effect.</p>

      <h2>Law</h2>
      <p>These terms are governed by the laws of the United Arab Emirates as applied in the Emirate of Dubai.</p>

      <h2>Contact</h2>
      <LegalContact />
    </>
  );
}
