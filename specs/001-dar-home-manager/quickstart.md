# Quickstart: Dar Home Manager MVP

**Date**: 2026-08-31 | **Plan**: [plan.md](./plan.md)

How to stand the application up and prove it works. This is a validation guide, not an
implementation guide: it says what to run and what you should see, not how the code is
written. Implementation belongs in `tasks.md`.

---

## 1. Prerequisites

- Node 24 and npm 11, present in Codespaces
- Access to Supabase project `jqeuxnkvmhhuvcrorcgh` as project owner
- Two email addresses you can receive mail at, for the isolation check
- A WhatsApp number for `NEXT_PUBLIC_SUPPORT_WHATSAPP`, or leave it unset and the contact
  route hides itself

## 2. Scaffold and install

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install @supabase/supabase-js @supabase/ssr
npm install -D @playwright/test && npx playwright install --with-deps chromium
```

**Immediately after `create-next-app`**, confirm it did not replace the repository's
`.gitignore`:

```bash
grep -q '^\.env\*\.local$' .gitignore && echo OK || echo 'RESTORE .env.local IGNORE'
```

## 3. Environment

Four variables in `.env.local`, and the same four in Vercel project settings. Confirm they are
present without printing their values:

```bash
grep -o '^[A-Z_]*=' .env.local
```

Expect `NEXT_PUBLIC_SUPABASE_URL=`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=`,
`SUPABASE_SERVICE_ROLE_KEY=` and `NEXT_PUBLIC_SUPPORT_WHATSAPP=`.

## 4. Database

In the Supabase SQL editor, as project owner, in this order:

1. `supabase/migrations/20260831000001_schema.sql`
2. `supabase/migrations/20260831000002_rls.sql`
3. `supabase/migrations/20260831000003_storage.sql`
4. `supabase/migrations/20260831000004_deactivation_and_status_history.sql`

Then three settings that no migration can carry, under Authentication:

| Setting | Value | Requirement |
|---|---|---|
| Email OTP expiry | 900 seconds | FR-001 |
| Email rate limit | 5 per hour per address | FR-045 |
| Site URL, and `<url>/**` in redirect URLs | your Vercel or Codespaces URL | sign-in fails silently without this |

Finally, make yourself admin, once, with your own address:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'your@email.com');
```

## 5. Run

```bash
npm run dev
```

---

## Validation scenarios

Each one maps to a success criterion. Run them in order; later ones depend on earlier data.

### V1. Team sets up a client (User Story 1, SC-005)

Sign in as yourself, reach `/admin`, create a client using your second email address, create a
property against them, and upload two documents: one with an expiry 10 days out, one with no
expiry at all.

**Expect**: both appear against the property. The one with no expiry carries no status marking
whatsoever. Under 5 minutes end to end.

### V2. Client finds an answer (User Story 2, SC-001, SC-002)

In a separate browser profile, sign in as the second client on a phone-sized viewport.

**Expect**: the sign-in link arrives; tapping it lands on the home screen with no password
step; the property is reachable and the document opens. Under 10 seconds from app open to
reading the expiry date, and under 60 seconds for the whole sign-in including fetching the
email.

### V3. Expiry marking (FR-014, FR-015, FR-016, SC-004)

Look at the property's document list, then at the home screen.

**Expect**: the 10 day document is marked expiring soon and appears on the home screen as an
attention item. The no-expiry document is marked nothing and appears nowhere. Set a third
document's expiry to today and confirm it reads as expired, not as expiring soon.

### V4. Voice task (User Story 3, SC-003)

As the client, hold the record button, speak, release.

**Expect**: the task sends without typing, in three interactions or fewer and under 15
seconds; its title reads `Voice note, DD Month YYYY`; its status is received. On a browser
without `MediaRecorder`, or with the microphone refused, the record button is absent and the
text field alone still works.

### V5. Team responds, and reopens (User Story 4, FR-049, FR-050)

As yourself in `/admin/tasks`, filter by status, open the task, reply, move it to done, then
move it back to in progress.

**Expect**: the client sees both status changes and the reply in one chronological history.
Nothing blocks the backwards move.

### V6. Calm home screen (FR-033, SC-009)

Resolve or clear everything outstanding for a client, then open their home screen.

**Expect**: a plain sentence saying nothing needs their attention. Not an empty list, not an
illustration, not a spinner.

### V7. Deactivation (FR-046, FR-047, SC-014)

With the client signed in and sitting on their home screen, deactivate them from
`/admin/clients/[id]`. Then have the client act.

**Expect**: their next action is refused and they are returned to sign-in. Requesting a new
link gives the same response as an unregistered address. Their records remain fully visible to
you in the admin area.

### V8. Signed URLs expire (FR-018, SC-007)

Copy a document's URL, wait 60 seconds, open it again.

**Expect**: refused. No file in `dar-files` is reachable without a current grant.

### V9. Accessibility (FR-053, FR-054, SC-017)

On each route, tab through from the top with no pointer, and check contrast.

**Expect**: every action reachable and operable, focus always visible, no trap, and a bottom
sheet returns focus to whatever opened it. No `--gold` used as text anywhere.

---

## Automated checks

Playwright covers the two things that must never silently regress. Everything else above is
verified by hand.

```bash
npx playwright test
```

| Spec | Covers | Asserts |
|---|---|---|
| `e2e/isolation.spec.ts` | SC-006, FR-004 | Two clients, both directions. Client A cannot reach B's property, document or task by direct URL, and receives not-found rather than a permission error. Repeated for a deactivated client |
| `e2e/sign-in.spec.ts` | SC-002, SC-012, SC-013 | A registered and an unregistered address produce identical screens; a used link is refused; a sixth request inside an hour is refused |

**Not covered by tests, by decision**: everything else. There is no unit layer in this
release. If a regression matters more than these two, it belongs in the same folder, not in a
new testing strategy.
