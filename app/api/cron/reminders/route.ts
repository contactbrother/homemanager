import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildRenewals, renewalLabel } from "@/features/renewals/build";
import { emailConfigured, sendEmail } from "@/lib/email/send";
import { formatDate } from "@/lib/format";
import type { Asset, DocumentRow, Property } from "@/lib/supabase/types";
import type { RenewalItem } from "@/features/renewals/types";

export const dynamic = "force-dynamic";

/** Days before the due date on which a reminder goes out. 0 is the day itself. */
const OFFSETS = [30, 14, 3, 0] as const;

/**
 * Runs once a day (vercel.json). For every renewal that is exactly 30, 14, 3 or 0
 * days away, it sends one email to the home's owner and one to the team, and
 * records the send so tomorrow's run does not repeat it. Overdue items are not
 * nagged daily: they already sit at the top of the home screen.
 *
 * Uses the service role because it runs with no user. Reads only; the single write
 * is the reminder log.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const [properties, documents, assets, sent] = await Promise.all([
    admin.from("properties").select("*"),
    admin.from("documents").select("*").not("expires_on", "is", null),
    admin.from("assets").select("*"),
    admin.from("reminders").select("item_kind, item_id, due_on, offset_days"),
  ]);

  const items = buildRenewals({
    properties: (properties.data as Property[]) ?? [],
    documents: (documents.data as DocumentRow[]) ?? [],
    assets: (assets.data as Asset[]) ?? [],
  });

  const already = new Set(
    (sent.data ?? []).map((r) => `${r.item_kind}|${r.item_id}|${r.due_on}|${r.offset_days}`),
  );

  const due = items.filter(
    (item) =>
      OFFSETS.includes(item.days as (typeof OFFSETS)[number]) &&
      !already.has(`${item.kind}|${item.id}|${item.dueOn}|${item.days}`),
  );

  const byOwner = new Map<string, RenewalItem[]>();
  for (const item of due) {
    byOwner.set(item.ownerId, [...(byOwner.get(item.ownerId) ?? []), item]);
  }

  const teamAddress = process.env.TEAM_NOTIFY_EMAIL;
  const configured = emailConfigured();
  const results: Array<{ owner: string; items: number; channel: string; error?: string }> = [];

  for (const [ownerId, ownerItems] of byOwner) {
    const { data: user } = await admin.auth.admin.getUserById(ownerId);
    const email = user?.user?.email ?? null;
    let channel: "email" | "skipped" = "skipped";
    let error: string | undefined;

    // Clients can turn reminder emails off in Account. The team copy still goes out.
    const { data: prefs } = await admin
      .from("profiles")
      .select("email_reminders")
      .eq("id", ownerId)
      .maybeSingle();
    const optedOut = prefs?.email_reminders === false;

    if (configured && optedOut && teamAddress) {
      await sendEmail({
        to: teamAddress,
        subject: `[Dar team] ${subjectFor(ownerItems)} (${ownerItems[0].propertyName}, client emails off)`,
        text: bodyFor(ownerItems),
      });
    } else if (configured && email) {
      const result = await sendEmail({
        to: email,
        subject: subjectFor(ownerItems),
        text: bodyFor(ownerItems),
      });
      channel = result.ok ? "email" : "skipped";
      error = result.error;
      if (result.ok && teamAddress) {
        await sendEmail({
          to: teamAddress,
          subject: `[Dar team] ${subjectFor(ownerItems)} (${ownerItems[0].propertyName})`,
          text: bodyFor(ownerItems),
        });
      }
    }

    await admin.from("reminders").insert(
      ownerItems.map((item) => ({
        property_id: item.propertyId,
        item_kind: item.kind,
        item_id: item.id,
        due_on: item.dueOn,
        offset_days: item.days,
        channel,
        recipient: channel === "email" ? email : null,
      })),
    );

    results.push({ owner: ownerId, items: ownerItems.length, channel, error });
  }

  return NextResponse.json({
    checked: items.length,
    due: due.length,
    emailConfigured: configured,
    results,
  });
}

function subjectFor(items: RenewalItem[]): string {
  if (items.length === 1) return `${items[0].title}: ${renewalLabel(items[0]).toLowerCase()}`;
  return `${items.length} things coming up at home`;
}

function bodyFor(items: RenewalItem[]): string {
  const lines = items.map(
    (item) => `• ${item.title} (${item.category}): ${renewalLabel(item)}, ${formatDate(item.dueOn)}`,
  );
  return [
    "Hello,",
    "",
    "A reminder from Dar about your home:",
    "",
    ...lines,
    "",
    "Open Dar to ask us to handle any of these: https://homemanager.ansy.in",
    "",
    "Dar",
  ].join("\n");
}
