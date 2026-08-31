/**
 * FR-052. A person who cannot sign in has no other route to us, so the contact route
 * must work without an account. WhatsApp, because that is the channel clients already
 * use. Read from the environment, never hardcoded, and hidden when unset rather than
 * rendered broken.
 */
export function SupportLink({ className = "" }: { className?: string }) {
  const number = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/[^\d]/g, "");
  if (!number) return null;

  return (
    <p className={className}>
      <a
        href={`https://wa.me/${number}`}
        className="text-[var(--gold-text)] underline underline-offset-4 inline-flex min-h-[44px] items-center"
      >
        Message the team on WhatsApp
      </a>
    </p>
  );
}
