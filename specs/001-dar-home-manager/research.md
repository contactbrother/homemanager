# Phase 0 Research: Dar Home Manager MVP

**Date**: 2026-08-31 | **Plan**: [plan.md](./plan.md)

The stack was fixed by the project owner, so this phase resolves how the specification's
requirements are met on that stack, not whether to use it. Nine questions were open. All
nine are resolved; none is left as NEEDS CLARIFICATION.

Five resolutions carry a manual step or a schema change. Those are collected at the end.

---

## R1. Invite-only sign-in with an identical response either way (FR-002)

**Decision**: call `signInWithOtp` with `shouldCreateUser: false`, catch the resulting error,
and render the same confirmation screen regardless of outcome. The Server Action returns
`{ ok: true }` in both cases and logs the distinction server side only.

**Rationale**: `shouldCreateUser: false` is the switch that makes sign-in invite-only. Without
it Supabase creates an auth user for any address, which would give a stranger an account and
an empty app, exactly what FR-002 forbids. Supabase returns a distinguishable error for an
unregistered address, so the identical-response half of FR-002 is the application's job, not
the platform's: the action must swallow the difference before it reaches the browser.

**Alternatives considered**: allowing account creation and gating on a profile row was
rejected because the auth user still exists, so the address is now registered and the refusal
is cosmetic. Checking the address against `profiles` before calling Supabase was rejected
because it needs a service-role read from an unauthenticated screen, and the timing
difference between a hit and a miss reintroduces the enumeration leak FR-002 closes.

---

## R2. Credential lifetime and single use (FR-001)

**Decision**: set the email OTP expiry to 900 seconds in Supabase Authentication settings.
Links are single use by default; no work is needed for that half.

**Rationale**: Supabase's default expiry is one hour, which fails FR-001's 15 minutes. This
is a dashboard setting, not code, so it cannot be enforced by the repository and must be
recorded as a deployment step and re-checked after any project restore.

**Alternatives considered**: implementing a shorter expiry in application code on top of the
platform's was rejected. Two expiry clocks that can disagree is precisely the cleverness
Principle V exists to prevent.

---

## R3. Rate limiting sign-in requests (FR-045)

**Decision**: two layers. Set the Supabase Auth email rate limit to 5 per hour per address in
the dashboard, which is the enforcing layer. In the application, lock the resend control for
60 seconds (FR-051) so ordinary impatience never reaches the limit.

**Rationale**: the platform holds the only state that survives a page reload, a new tab or a
different device, so it has to be the enforcing layer. The 60 second lock is a courtesy that
keeps a real client from burning their allowance by double-tapping, not a security control,
and the plan should not pretend otherwise.

**Alternatives considered**: an application-side counter in Postgres was rejected as a second
source of truth for the same limit, and it would need an unauthenticated write path.

---

## R4. Deactivation taking effect immediately (FR-046)

**Decision**: three parts. Ban the auth user through the admin API; record `deactivated_at`
on `profiles`; and have `middleware.ts` read `deactivated_at` on every request and end the
session when it is set. RLS additionally excludes deactivated clients through an `is_active()`
predicate.

**Rationale**: banning a user stops new sign-ins but does not invalidate a JWT that has
already been issued, which stays valid until it expires. FR-046 says a session the client
already holds must cease to give access, so something must check on each request. Middleware
is the only place that sees every request before it reaches a route. RLS carries the same
check independently, so a missed middleware path cannot become a data leak, which is what
Principle IV means by no shortcuts for convenience.

**Alternatives considered**: relying on the ban alone was rejected because it leaves a window
of up to the token lifetime. Shortening the token lifetime to close that window was rejected
because it degrades every client's experience to handle a rare administrative event.

**Consequence**: `profiles.deactivated_at` does not exist in the three existing migrations. A
fourth migration is required.

---

## R5. Recording status changes in task history (FR-050)

**Decision**: add a nullable `status_to task_status` column to `task_messages`. A row with
`status_to` set is a status change; a row with `body` or `voice_path` set is a note. Both
render in one chronological history.

**Rationale**: FR-050 requires every status change to appear in the history the client sees,
and FR-049 allows any status to move to any other, including reopening, so the history is the
only thing that keeps the record honest. `task_messages` as drafted holds only notes, so a
status change has nowhere to live. One nullable column on the existing table is the smallest
change that satisfies it and keeps the history a single ordered query.

**Alternatives considered**: a separate `task_status_changes` table was rejected because the
client-facing history would then need a union of two tables ordered by time, for no gain. A
generic event table with a JSON payload was rejected as exactly the abstraction Principle V
forbids at this size.

**Consequence**: part of the same fourth migration.

---

## R6. Where the service role key is genuinely required

**Decision**: three calls only, all in `lib/supabase/admin.ts`, all reached from Server
Actions in `features/clients/actions.ts`: create a client's auth user and send their first
link; ban a user on deactivation; unban on reactivation. The service role client is never
used to read or write application tables.

**Rationale**: section 2.3 of the build plan says the service role key is for admin
operations, which reads as though admin data access needs it. It does not. `is_admin()` in
the RLS policies already grants a team member full read and write through the ordinary anon
key and their own session. The only operations RLS cannot express are the ones that act on
`auth.users` rather than on application tables. Confining the key to those three calls means
a bug in an admin data path cannot bypass RLS, which is a materially stronger position than
the build plan's wording implies.

**Alternatives considered**: using the service role for all admin data access, as the build
plan's wording suggests, was rejected on the above reasoning. It would mean every admin
query runs with policies disabled, so a missing `where` clause becomes a cross-client leak
rather than an empty result.

---

## R7. Voice recording that works on iOS (FR-021)

**Decision**: `MediaRecorder`, hold to record and release to send, letting the browser pick
its own container rather than requesting one. Read the resulting `Blob.type` and store the
file under the matching extension. Where `MediaRecorder` is absent or the microphone
permission is refused, hide the record button and leave the text field, which FR-022 already
requires to be sufficient on its own.

**Rationale**: iOS Safari produces `audio/mp4` while Chrome produces `audio/webm`. The bucket
in migration 3 already allows both, along with `audio/mpeg` and `audio/ogg`, so nothing needs
to change there. Requesting a specific mime type is the usual cause of silent failure on iOS,
so the code must not do it.

**Alternatives considered**: transcoding in the browser was rejected as a dependency and a
delay on the product's signature interaction. Server-side transcoding was rejected because
nothing in the MVP reads the audio except a person pressing play.

---

## R8. Haptics and pull to refresh (build plan section 4.4)

**Decision**: call the Vibration API where it exists and do nothing where it does not. Pull to
refresh uses the browser's own behaviour on the client list screens; no custom gesture handler
is built.

**Rationale**: iOS Safari does not implement the Vibration API and shows no sign of doing so,
so haptics will be absent for a large share of the intended audience. This is stated here so
the absence is understood as a platform limit rather than read later as an unimplemented
requirement. Neither appears in the specification as a requirement, only in the build plan's
interaction notes, so neither gates the release.

**Alternatives considered**: a custom pull-to-refresh gesture was rejected as a meaningful
amount of touch-handling code, with accessibility consequences under FR-054, for an effect the
browser already provides.

---

## R9. Optimistic updates and skeletons on the App Router (FR-041, FR-042)

**Decision**: `useOptimistic` in the Client Component that owns each mutation, paired with a
Server Action that calls `revalidatePath` on success. Failure clears the optimistic entry and
surfaces the message from FR-043. Loading states are `loading.tsx` files per route segment,
each shaped like the content that follows it.

**Rationale**: these are framework primitives, which is what Principle V asks for. Route-level
`loading.tsx` gives a skeleton with no client-side loading state to manage, and no spinner
anywhere, satisfying FR-042 by construction rather than by discipline.

**Alternatives considered**: a mutation library holding cache state was rejected under the no
state library constraint, and is unnecessary when Server Actions already revalidate.

---

## Consequences requiring action

**A fourth migration is required**, `20260831000004_deactivation_and_status_history.sql`,
adding `profiles.deactivated_at`, `task_messages.status_to`, an `is_active()` helper, and the
policy revisions that use it. Detailed in [data-model.md](./data-model.md). The three existing
migrations are unchanged.

**Three Supabase dashboard settings** are not expressible in the repository and must be set by
hand, then re-checked after any project restore:

| Setting | Value | Requirement |
|---|---|---|
| Email OTP expiry | 900 seconds | FR-001 |
| Email rate limit | 5 per hour per address | FR-045 |
| Site URL and redirect URLs | the Vercel URL and `<vercel-url>/**` | build plan section 7.3 |

**Two behaviours degrade by platform**, neither of them a specification requirement: haptics
are absent on iOS Safari, and pull to refresh is whatever the browser provides.
