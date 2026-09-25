"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/supabase/types";
import { emailConfigured, sendEmail } from "@/lib/email/send";

/**
 * Website enquiry. Goes through submit_enquiry(), which validates and rate-limits in
 * the database; visitors never touch the table. The connection address is kept only
 * as a salted hash, for the rate limit.
 */
export async function sendEnquiry(input: {
  name: string;
  phone: string;
  email: string;
  community: string;
  service: string;
  message: string;
  path: string;
  website: string; // honeypot: people never fill this in
}): Promise<ActionResult> {
  if (input.website) return ok(); // quietly drop bots

  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();
  if (!name) return fail("Please tell us your name.");
  if (!phone && !email) return fail("Please give a phone number or an email address, so we can reply.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("That email address does not look right.");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.CRON_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-16) ?? "dar";
  const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_enquiry", {
    p_name: name,
    p_phone: phone,
    p_email: email,
    p_community: input.community,
    p_service: input.service,
    p_message: input.message,
    p_source_path: input.path,
    p_ip_hash: ipHash,
  });

  if (error) {
    const known = ["Please tell us your name.", "Please give a phone number or an email address.", "Too many enquiries just now. Please message us on WhatsApp instead."];
    const message = known.find((k) => error.message.includes(k));
    console.info("[enquiry] refused", { code: error.code });
    return fail(message ?? "Your enquiry did not send. Please try again, or message us on WhatsApp.");
  }

  const team = process.env.TEAM_NOTIFY_EMAIL;
  if (emailConfigured() && team) {
    await sendEmail({
      to: team,
      subject: `[Dar] New enquiry from ${name}`,
      text: [
        `Name: ${name}`,
        phone ? `Phone: ${phone}` : null,
        email ? `Email: ${email}` : null,
        input.community ? `Community: ${input.community}` : null,
        input.service ? `Interested in: ${input.service}` : null,
        input.message ? `\n${input.message}` : null,
        `\nSent from ${input.path}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  return ok();
}
