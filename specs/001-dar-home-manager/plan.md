# Implementation Plan: Dar Home Manager MVP

**Branch**: `main` (spec directory `001-dar-home-manager`) | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-dar-home-manager/spec.md`

## Summary

Dar gives a villa owner in Dubai one place to see their home: the property, the documents
held for it, what is expiring, and the status of everything they have asked the team to do.
The team gets a plain admin area to set clients up, hold their documents, and work a task
queue across all clients.

Technical approach: a single Next.js App Router application with two route groups, client
and admin, both served from one deployment. Supabase provides authentication, Postgres and
private file storage. Every read is a Server Component query through row level security
using the anon key and the caller's session; every write is a Server Action. The service
role key is confined to three auth administration calls that RLS cannot express, and is
never used for data access. No API layer, no ORM, no state library, no component library.

## Technical Context

**Language/Version**: TypeScript 5.x on Node 24 (Codespaces and Vercel both current LTS or later)

**Primary Dependencies**: Next.js 15 App Router with React 19, Tailwind CSS 4,
`@supabase/supabase-js`, `@supabase/ssr`. Nothing else. Versions pinned at scaffold time.

**Storage**: Supabase Postgres (project `jqeuxnkvmhhuvcrorcgh`) with row level security on
all six tables, plus one private Supabase Storage bucket `dar-files`.

**Testing**: Playwright only, covering two things: cross-client RLS isolation (SC-006) and
the sign-in journey (SC-002, SC-012, SC-013). No unit test layer in this release, by
decision of the project owner. Everything else is verified by hand against the quickstart.

**Target Platform**: mobile browsers first (iOS Safari 17+, Chrome Android), desktop
browsers for the admin area. Deployed on Vercel.

**Project Type**: web application, single Next.js project, two route groups.

**Performance Goals**: SC-001, a signed-in client reaches a document's expiry date in under
10 seconds. In practice this means the home and property screens render from the server
with no client-side data fetch on first paint, and no screen waits on a network round trip
before showing structure.

**Constraints**: no file is ever publicly reachable; signed URLs expire in 60 seconds; the
service role key never reaches the browser; every mutation updates the interface
optimistically; skeletons never spinners; WCAG 2.2 AA contrast and full keyboard operability.

**Scale/Scope**: tens of clients, a handful of properties each, low hundreds of documents
and tasks in total. No search, pagination or bulk operations are specified or needed. 13
routes, 6 tables, 5 feature folders.

## Constitution Check

*GATE: checked before Phase 0 and re-checked after Phase 1 design.*

| # | Principle | Pre-Phase 0 | Post-Phase 1 | How the design satisfies it |
|---|---|---|---|---|
| I | Calm Over Busy | PASS | PASS | One primary action per route, listed in `contracts/ui-contracts.md`. Gold fill with `--ink` label; everything else text or outline |
| II | Every Feature Serves a Real Client Task | PASS | PASS | `service_records` is inert schema, permitted by the narrow exception added to Principles II and VI in constitution 1.1.0. Still listed in Complexity Tracking |
| III | Mobile First | PASS | PASS | Client routes designed at 390px and adapted upward. Primary actions in the lower third. Bottom sheets, not full-page navigation, for create and detail flows |
| IV | Private by Default | PASS | PASS | RLS on all six tables plus `storage.objects`. Browser holds the anon key only. Service role confined to three auth admin calls in `lib/supabase/admin.ts`, never for data access. Signed URLs at 60 seconds |
| V | Simple Over Clever | PASS | PASS | No ORM, no state library, no component library. Framework primitives only: Server Components, Server Actions, `useOptimistic`, `useFormStatus` |
| VI | Extensible by Structure, Not by Prediction | PASS | PASS | Six feature folders, each self-contained. `service_records` falls under the same narrow schema exception |
| VII | Nothing Blocks on the Network | PASS | PASS | `useOptimistic` on every mutation, skeletons via `loading.tsx` per route segment, revert on failure |
| VIII | Honest States | PASS | PASS | Every route segment has a defined empty, loading and error state. Enumerated in `contracts/ui-contracts.md` |

**Gate result: PASS.** The one conflict found at Phase 1, `service_records` being created
with no screen, was raised by `/speckit-analyze` as finding D1 and resolved on 31 August 2026
by amending the constitution to 1.1.0 with a narrow exception for inert schema, rather than
by justifying it in this plan. It remains listed in Complexity Tracking so the exception stays
visible.

## Project Structure

### Documentation (this feature)

```text
specs/001-dar-home-manager/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── README.md
│   ├── server-actions.md
│   └── ui-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Created by /speckit-tasks, not by this command
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   └── sign-in/
│       ├── page.tsx                    # email entry, WhatsApp contact route
│       └── check-email/page.tsx        # confirmation, 60s resend lock
├── auth/callback/route.ts              # exchanges the code for a session
├── (client)/
│   ├── layout.tsx                      # nav, session guard, active-client guard
│   ├── page.tsx                        # home, attention list
│   ├── loading.tsx
│   ├── error.tsx
│   ├── properties/
│   │   ├── page.tsx                    # redirects to detail when only one
│   │   └── [id]/page.tsx
│   ├── tasks/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── profile/page.tsx
├── (admin)/
│   └── admin/
│       ├── layout.tsx                  # admin role guard
│       ├── page.tsx                    # clients list, create client
│       ├── clients/[id]/page.tsx       # properties, documents, tasks, deactivate
│       └── tasks/
│           ├── page.tsx                # queue across all clients, status filter
│           └── [id]/page.tsx
├── layout.tsx                          # fonts, tokens
└── globals.css                         # design tokens from build plan section 4.1

features/
├── auth/
│   ├── actions.ts                      # requestSignInLink, signOut
│   └── guards.ts                       # requireClient, requireAdmin, requireActive
├── properties/
│   ├── components/
│   ├── queries.ts
│   ├── actions.ts
│   └── types.ts
├── documents/
│   ├── components/
│   ├── queries.ts
│   ├── actions.ts                      # upload, signed URL, delete (admin only)
│   ├── expiry.ts                       # EXPIRY_WARNING_DAYS = 30, status derivation
│   └── types.ts
├── tasks/
│   ├── components/
│   ├── queries.ts
│   ├── actions.ts
│   └── types.ts
├── clients/                            # admin only: create, deactivate
│   ├── components/
│   ├── queries.ts
│   ├── actions.ts
│   └── types.ts
└── dashboard/
    └── attention.ts                    # assembles the home list from documents + tasks

components/ui/
├── button.tsx
├── card.tsx
├── status-pill.tsx
├── sheet.tsx
├── empty-state.tsx
├── skeleton.tsx
└── voice-recorder.tsx

lib/
├── supabase/
│   ├── client.ts                       # browser, anon key
│   ├── server.ts                       # Server Components and Actions, anon key + session
│   └── admin.ts                        # service role, auth admin calls only, server only
├── format.ts                           # DD Month YYYY, AED amounts
└── constants.ts                        # EXPIRY_WARNING_DAYS, SIGNED_URL_TTL, doc types

supabase/migrations/                    # applied by hand in the Supabase SQL editor
├── 20260831000001_schema.sql
├── 20260831000002_rls.sql
├── 20260831000003_storage.sql
└── 20260831000004_deactivation_and_status_history.sql   # NEW, see data-model.md

e2e/
├── isolation.spec.ts                   # SC-006, two clients, both directions
└── sign-in.spec.ts                     # SC-002, SC-012, SC-013

middleware.ts                           # session refresh, role routing, deactivation check
```

**Structure Decision**: one Next.js project, not a frontend and backend pair. There is no
separate API tier because reads are Server Component queries against Supabase and writes are
Server Actions, so no wire protocol exists between two deployables. The client and admin
apps are route groups within the same application, sharing `components/ui` and `lib`, each
guarded independently. `features/` holds one folder per feature exactly as the constitution
requires, with `clients/` added beyond the build plan's list because admin client creation
and deactivation is a distinct feature with its own actions, not part of `properties`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `service_records` table created with no screen reaching it. Permitted by the narrow inert-schema exception in constitution 1.1.0; listed here as that exception requires | Section 3 of the build plan mandates it, so the Record pillar of the business has a home when it is built. It is six columns and one index, applied once by hand | Omitting the table now and adding it later was rejected by the project owner in the build plan. The cost of carrying it is close to zero: no code imports it, no query reads it, no type describes it. It is inert. Recorded here so the exception is explicit rather than silently normalised, and so that a later reviewer does not read it as licence to add further unreached tables |
