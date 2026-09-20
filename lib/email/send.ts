/**
 * Transactional email through Resend's HTTP API. No SDK, one fetch. When the keys are
 * not configured the caller gets `configured: false` and decides what to do; nothing
 * throws, because a missing mail provider must never take the job down.
 */
export interface Mail {
  to: string;
  subject: string;
  text: string;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.REMINDER_FROM);
}

export async function sendEmail(mail: Mail): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_FROM;
  if (!key || !from) return { ok: false, error: "Email is not configured." };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, text: mail.text }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { ok: false, error: `Resend ${response.status}: ${detail.slice(0, 200)}` };
  }
  return { ok: true };
}
