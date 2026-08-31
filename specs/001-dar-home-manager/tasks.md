---
description: "Task list for Dar Home Manager MVP"
---

# Tasks: Dar Home Manager MVP

**Input**: Design documents from `/specs/001-dar-home-manager/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Playwright only, covering cross-client RLS isolation and the sign-in journey. This
is the project owner's decision, recorded in plan.md. There is no unit test layer in this
release, so no unit test tasks appear below.

**Organization**: grouped by user story, in the priority order set by spec.md, so each story
can be implemented, tested and demonstrated on its own.

**Build status, 31 August 2026**: 75 of 80 tasks complete. The five unticked are the
three Supabase steps that must be done in a browser (T010 to T012), the phone walk that
must be done on a real device (T077), and the Vercel deploy the project owner is doing
themselves (T078).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel, different files, no dependency on incomplete work
- **[Story]**: the user story this task serves
- **[MANUAL]**: performed by the project owner in a browser, not by an implementer in code

## Path Conventions

Single Next.js project at the repository root, per the Structure Decision in plan.md.
`app/` for routes, `features/` for feature folders, `components/ui/` for shared primitives,
`lib/` for clients and helpers, `e2e/` for Playwright.

---

## Phase 1: Setup

**Purpose**: get an empty, correctly configured Next.js project standing.

- [x] T001 Scaffold the project with `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir` at the repository root
- [x] T002 Verify `create-next-app` did not replace the repository `.gitignore`, and restore the `.env*.local`, `__pycache__/` and `*.pyc` entries if it did, in `.gitignore`
- [x] T003 Install runtime dependencies `@supabase/supabase-js` and `@supabase/ssr`, pinning exact versions in `package.json`
- [x] T004 [P] Install `@playwright/test` as a dev dependency and run `npx playwright install --with-deps chromium`
- [x] T005 [P] Confirm all four environment variables are present by name only, never by value, per the standing instruction: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPPORT_WHATSAPP` in `.env.local`
- [x] T006 [P] Write the corrected design tokens from build plan section 4.1 into `app/globals.css`: `--gold` as fill only, `--gold-text` `#8F6631`, `--warn` `#8F6631`, `--mute` `#63706B`, no `--gold-deep`
- [x] T007 [P] Load Fraunces (400, 600) and Inter (400, 500, 600) via `next/font/google` and apply the type scale in `app/layout.tsx`
- [x] T008 [P] Create `lib/constants.ts` with `EXPIRY_WARNING_DAYS = 30`, `SIGNED_URL_TTL = 60`, `RESEND_LOCK_SECONDS = 60` and the ten document type labels
- [x] T009 [P] Create `lib/format.ts` with a DD Month YYYY date formatter and an AED amount formatter

---

## Phase 2: Foundational

**Purpose**: blocking prerequisites. Every user story depends on all of these. Nothing in
Phase 3 or later can start until this phase is complete.

### Database

- [ ] T010 [MANUAL] Apply `supabase/migrations/20260831000001_schema.sql`, then `20260831000002_rls.sql`, then `20260831000003_storage.sql`, then `20260831000004_deactivation_and_status_history.sql`, in that order, in the Supabase SQL editor as project owner
- [ ] T011 [MANUAL] Set the three Supabase Authentication settings that no migration can carry: email OTP expiry to 900 seconds (FR-001), email rate limit to 5 per hour per address (FR-045), and Site URL plus `<url>/**` in redirect URLs

### Supabase clients

- [x] T013 [P] Create the browser client using the anon key only in `lib/supabase/client.ts`
- [x] T014 [P] Create the Server Component and Server Action client, anon key plus the caller's session, in `lib/supabase/server.ts`
- [x] T015 Create the service role client in `lib/supabase/admin.ts`, marked server-only, exposing exactly three auth admin operations (create user and send first link, ban, unban) and nothing that reads or writes application tables, per research.md R6

### Authentication

- [x] T016 Implement `requestSignInLink` and `signOut` in `features/auth/actions.ts`. `requestSignInLink` calls `signInWithOtp` with `shouldCreateUser: false` and returns `{ ok: true }` whether or not the address is registered, logging the distinction server side only (FR-002, research.md R1)
- [x] T017 Implement `requireSession`, `requireActive`, `requireClient` and `requireAdmin` in `features/auth/guards.ts`, with `requireAdmin` returning 404 rather than 403 (FR-005)
- [x] T018 Implement `middleware.ts`: refresh the session, route by role between the client and admin groups, and end the session when the client is deactivated. Read `deactivated_at` and `role` once per session and carry them in the session rather than querying on every request, accepting a bounded staleness window. RLS `is_active()` is the real guarantee, not this check (FR-046, analyze finding R1)
- [x] T019 Build the email entry screen with a single primary action and the WhatsApp contact route read from `NEXT_PUBLIC_SUPPORT_WHATSAPP`, hidden when unset, in `app/(auth)/sign-in/page.tsx` (FR-052)
- [x] T020 Build the confirmation screen with the spam-folder line and a resend control locked for 60 seconds in `app/(auth)/sign-in/check-email/page.tsx` (FR-051)
- [x] T021 Implement the code exchange and the expired-or-used refusal with an offer to request another in `app/auth/callback/route.ts` (FR-001)
- [ ] T012 [MANUAL] Sign in once as yourself, then promote your account with the one-off SQL in build plan section 3.4. Ordered after T021 because it cannot be done until sign-in works

### Shared UI primitives

- [x] T022 [P] Build the button primitive with gold fill and `--ink` label, pressed state by scale not colour, 44px minimum target, in `components/ui/button.tsx`
- [x] T023 [P] Build the card primitive, white on ivory, `--r-md`, 1px `--line`, no shadow, in `components/ui/card.tsx`
- [x] T024 [P] Build the status pill in `components/ui/status-pill.tsx`, colour only when genuinely due or wrong
- [x] T025 [P] Build the bottom sheet in `components/ui/sheet.tsx`, trapping focus while open and restoring focus to its trigger on close (FR-054)
- [x] T026 [P] Build the empty state primitive, a sentence not an illustration, in `components/ui/empty-state.tsx`
- [x] T027 [P] Build the skeleton primitive in `components/ui/skeleton.tsx`, shaped to the content it stands in for

### Foundational tests

- [x] T028 Write `e2e/sign-in.spec.ts` asserting that a registered and an unregistered address produce identical screens, that a used link is refused, and that a sixth request inside an hour is refused (SC-002, SC-012, SC-013)

**Checkpoint**: a person can sign in, reach an empty shell, and be routed by role.

---

## Phase 3: User Story 1, team sets up a client and their home (P1)

**Goal**: the team can create a client, their property and their documents, so a client never
meets an empty app.

**Independent test**: from an empty database, sign in as a team member, create a client and a
property, upload one document with an expiry and one without, and confirm both appear.

- [x] T029 [US1] Define the admin client types in `features/clients/types.ts`
- [x] T030 [US1] Implement `createClient` in `features/clients/actions.ts`, creating the auth user through `lib/supabase/admin.ts` and sending their first sign-in link (FR-036)
- [x] T031 [P] [US1] Implement `deactivateClient` and `reactivateClient` in `features/clients/actions.ts`, setting and clearing `deactivated_at` and banning or unbanning the auth user (FR-046, FR-047, FR-055)
- [x] T032 [P] [US1] Implement the client list and client detail reads in `features/clients/queries.ts`
- [x] T033 [P] [US1] Define property types in `features/properties/types.ts`
- [x] T034 [US1] Implement `createProperty` in `features/properties/actions.ts`, uploading the photo to `{property_id}/photo/{filename}` (FR-007)
- [x] T035 [P] [US1] Define document types in `features/documents/types.ts`
- [x] T036 [US1] Implement `uploadDocument` in `features/documents/actions.ts`, accepting an absent expiry, rejecting over-size and disallowed types with the allowed list in the message, pathing to `{property_id}/{document_id}/{filename}` (FR-011, FR-013, FR-020)
- [x] T037 [P] [US1] Implement `deleteDocument` in `features/documents/actions.ts`, admin only, removing the stored object and then the row (FR-019)
- [x] T038 [US1] Build the admin route group layout with the admin role guard in `app/(admin)/admin/layout.tsx`
- [x] T039 [US1] Build the clients list with a create-client sheet as the single primary action, plus its empty and loading states, in `app/(admin)/admin/page.tsx` (FR-035, FR-036)
- [x] T040 [US1] Build the client detail page showing properties, documents and tasks, with create-property as the primary action and deactivate as a secondary outline action behind a confirmation, in `app/(admin)/admin/clients/[id]/page.tsx` (FR-037, FR-038, FR-046)
- [x] T041 [P] [US1] Build the document upload sheet with title, type and optional expiry in `features/documents/components/upload-sheet.tsx`

**Checkpoint**: User Story 1 is independently demonstrable.

---

## Phase 4: User Story 2, client finds an answer about their home (P2)

**Goal**: a client signs in on a phone, reaches their property, and opens a document in under
ten seconds.

**Independent test**: with data from Story 1 present, sign in as that client on a phone
viewport and time the path from opening the app to reading a document's expiry date.

- [x] T042 [US2] Implement the expiry derivation in `features/documents/expiry.ts`: null is `none`, on or before today is `expired`, within `EXPIRY_WARNING_DAYS` is `expiring`, otherwise `none`. Derived at read time, never stored (FR-013 to FR-016)
- [x] T043 [P] [US2] Implement property reads in `features/properties/queries.ts`
- [x] T044 [P] [US2] Implement document reads in `features/documents/queries.ts`
- [x] T045 [US2] Implement `getDocumentUrl` in `features/documents/actions.ts`, returning a signed URL valid for `SIGNED_URL_TTL`, never a public URL (FR-017, FR-018)
- [x] T046 [US2] Build the client route group layout with the session, active and client guards, and the bottom navigation, in `app/(client)/layout.tsx`
- [x] T047 [US2] Build the properties screen, redirecting straight to detail when the client owns exactly one, in `app/(client)/properties/page.tsx` (FR-008)
- [x] T048 [US2] Build the property detail screen with photo, details, document list and recent tasks, upload as the single primary action, in `app/(client)/properties/[id]/page.tsx` (FR-010)
- [x] T049 [P] [US2] Build the document row with its expiring and expired marking, and no marking otherwise, in `features/documents/components/document-row.tsx`
- [x] T050 [P] [US2] Build the profile screen with name, phone and sign out in `app/(client)/profile/page.tsx` (FR-006)
- [x] T051 [P] [US2] Implement `updateProfile` in `features/auth/actions.ts`, not in the properties feature, since a profile is not a property (FR-006, analyze finding I1)
- [x] T052 [P] [US2] Add `loading.tsx` and `error.tsx` for the properties and property detail segments in `app/(client)/properties/`

**Checkpoint**: the product's core success criterion is demonstrable.

---

## Phase 5: User Story 3, client raises a task and follows it (P3)

**Goal**: a client asks for something by text or voice and watches it move.

**Independent test**: sign in as a client, raise one task by text and one by voice note,
confirm both read as received, and confirm a note appears in the history.

- [x] T053 [P] [US3] Define task types in `features/tasks/types.ts`
- [x] T054 [US3] Build the voice recorder in `components/ui/voice-recorder.tsx`: hold to record, release to send, letting the browser choose its own container rather than requesting a mime type, and hiding itself when `MediaRecorder` is absent or the microphone is refused (research.md R7)
- [x] T055 [US3] Implement `createTask` in `features/tasks/actions.ts`, rejecting a task with neither text nor voice, generating `Voice note, DD Month YYYY` as the title for a voice-only task, starting at `received`, and never asking for a category (FR-022, FR-023, FR-024, FR-026)
- [x] T056 [P] [US3] Implement `addTaskNote` in `features/tasks/actions.ts` (FR-028)
- [x] T057 [P] [US3] Implement task reads in `features/tasks/queries.ts`, open tasks before completed ones (FR-029)
- [x] T058 [US3] Build the tasks list screen with raise-a-task as the single primary action in `app/(client)/tasks/page.tsx`
- [x] T059 [US3] Build the new task sheet with text field, voice button, and a property selector shown only when the client owns more than one, in `features/tasks/components/new-task-sheet.tsx` (FR-030)
- [x] T060 [US3] Build the task detail screen showing status and a single chronological history of notes and status changes, with add-a-note as the primary action, in `app/(client)/tasks/[id]/page.tsx` (FR-025, FR-028, FR-050)
- [x] T061 [P] [US3] Add `loading.tsx` and `error.tsx` for the tasks segments in `app/(client)/tasks/`

**Checkpoint**: the second pillar of the service works end to end for the client.

---

## Phase 6: User Story 4, team works the task queue (P4)

**Goal**: every task across all clients in one queue, answerable and movable.

**Independent test**: with tasks present from two different clients, filter by status, reply,
change status, and confirm the client sees both.

- [x] T062 [US4] Implement `setTaskStatus` in `features/tasks/actions.ts`, admin only, permitting any status to any status with no transition check, writing the task row and then a `task_messages` row with `status_to` set (FR-027, FR-049, FR-050)
- [x] T063 [P] [US4] Implement `renameTask` in `features/tasks/actions.ts`, so the team can replace a generated voice-note title (FR-023)
- [x] T064 [P] [US4] Implement the cross-client task queue read with a status filter in `features/tasks/queries.ts` (FR-039)
- [x] T065 [US4] Build the admin task queue with status filtering in `app/(admin)/admin/tasks/page.tsx`
- [x] T066 [US4] Build the admin task detail with reply as the primary action and a status control, in `app/(admin)/admin/tasks/[id]/page.tsx` (FR-040)

**Checkpoint**: a task raised in Story 3 can be answered and closed.

---

## Phase 7: User Story 5, home screen attention list (P5)

**Goal**: the first screen answers one question, does anything need me?

**Independent test**: seed a client with a document expiring inside the window, an expired
document and a task waiting on them, confirm order and content; then clear everything and
confirm the calm empty state.

- [x] T067 [US5] Implement the attention list assembly in `features/dashboard/attention.ts`, drawing from expiring and expired documents and from tasks that have moved or are waiting on the client, ordered by urgency soonest first (FR-031, FR-032)
- [x] T068 [US5] Build the home screen with the attention list, the calm empty sentence when there is nothing, and raise-a-task as the single primary action, in `app/(client)/page.tsx` (FR-033, FR-034)
- [x] T069 [P] [US5] Add `loading.tsx` with attention-card skeletons and `error.tsx` for the home segment in `app/(client)/`

**Checkpoint**: all five user stories are complete.

---

## Phase 8: Polish and cross-cutting concerns

- [x] T070 Write `e2e/isolation.spec.ts` asserting that two clients cannot reach each other's property, document or task in either direction, receiving not-found rather than a permission error, and that a deactivated client reaches nothing (SC-006, SC-014, FR-004)
- [x] T071 [P] Audit every route against the accessibility contract in `contracts/ui-contracts.md`: 4.5:1 text, 3:1 large text and control bounds, no `--gold` used as text anywhere (FR-053, SC-017)
- [x] T072 [P] Audit every route for keyboard operability: reachable in a logical order, visible focus, no trap, sheets restoring focus to their trigger (FR-054)
- [x] T073 [P] Confirm every route segment has a defined empty, loading and error state matching the table in `contracts/ui-contracts.md`; write the error copy so each message says what happened and what to do next; and confirm each screen's primary action sits in the lower third of the phone viewport (SC-009, FR-043, FR-044)
- [x] T079 [P] Audit every screen for exactly one primary action against the table in `contracts/ui-contracts.md`. Two equally weighted actions on one screen is a failure, per Principle I of the constitution (SC-008)
- [x] T074 [P] Apply optimistic updates with `useOptimistic` to every mutation, reverting visibly on failure (FR-041)
- [x] T075 [P] Add motion using `--ease`, `--base` and `--fast`: elements scale and settle, they do not slide in from off screen
- [x] T076 [P] Add haptics via the Vibration API on submit and status change, degrading silently where unsupported, which includes iOS Safari (research.md R8)
- [x] T080 [P] Confirm user-facing copy says "the team", never "admin". `admin` remains the database role and the route prefix only (analyze finding T1)
- [ ] T077 Walk the nine validation scenarios in `quickstart.md` end to end on a real phone, not a simulator
- [ ] T078 [MANUAL] [OWNER] Deploy to Vercel with all four environment variables, then set Site URL and redirect URLs in Supabase to the deployed URL and test sign-in on a phone before anything else

---

## Dependencies

```text
Phase 1 Setup
      ↓
Phase 2 Foundational        ← blocks everything below
      ↓
Phase 3 US1 (P1)            ← creates the data every other story needs
      ↓
Phase 4 US2 (P2)  ─┐
      ↓            │
Phase 5 US3 (P3)  ─┤        US3 needs a property from US1, not US2
      ↓            │
Phase 6 US4 (P4)  ─┘        US4 needs tasks from US3
      ↓
Phase 7 US5 (P5)            assembles what US2, US3 and US4 produce
      ↓
Phase 8 Polish
```

**Story independence**: US1 is testable from an empty database. US2 and US3 both need only a
property from US1 and are independent of each other. US4 needs tasks from US3. US5 assembles
the output of US2, US3 and US4 and is therefore built last, despite being the screen a client
sees first.

## Parallel execution examples

**Phase 1**: T004 through T009 are six independent files and can all run together after T003.

**Phase 2**: T013 and T014 in parallel; then T022 through T027, six independent UI primitives,
all together. T010 to T012 are manual and can be done by the project owner while an
implementer works on T013 onward, provided T010 completes before any query is run.

**Phase 3**: T031, T032, T033, T035 and T037 touch different files and can run in parallel
once T030 has established the clients feature folder.

**Phase 4**: T043, T044, T049, T050, T051 and T052 are independent once T042 exists.

**Phase 8**: T071 through T076 are six independent audits and can be split freely.

## Implementation strategy

**Suggested MVP**: Phases 1, 2 and 3. That is a working admin area on a real database with
real authentication, which moves the team's client records off spreadsheets and is worth
having on its own even before a client ever signs in.

**First client-visible increment**: add Phase 4. At that point the product's stated success
criterion, a client answering a question about their home in under ten seconds, is met.

**Deliberately excluded, do not add**: any scheduled, recurring or background job. FR-048's 90
day retention clock is recorded and its timestamp is captured by T031, but nothing acts on it
automatically in this release. Deletion at 90 days is a manual team action until the named
follow-up ships. No task below creates a cron entry, a scheduled function or a queue worker,
and none should be added.
