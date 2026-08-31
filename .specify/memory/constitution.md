<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0 (see amendment note at the foot of this report)
Rationale: First ratification. The document moves from an unfilled scaffold to a
complete governing constitution, so it is issued at 1.0.0 rather than bumped.

Modified principles: none. The prior file contained only placeholder tokens.

Added sections:
  - Core Principles I to VIII (Calm Over Busy; Every Feature Serves a Real Client
    Task; Mobile First; Private by Default; Simple Over Clever; Extensible by
    Structure, Not by Prediction; Nothing Blocks on the Network; Honest States)
  - Additional Constraints (renamed from [SECTION_2_NAME])
  - Development Workflow and Quality Gates (renamed from [SECTION_3_NAME])
  - Governance

Removed sections: none.

Template deviation: the scaffold provides five principle slots. The project defines
eight, so the Core Principles section is extended to eight subsections. Heading
levels are unchanged.

Follow-up TODOs: none. No placeholder tokens remain.

--- Amendment, 31 August 2026, 1.0.0 → 1.1.0 ---
MINOR: guidance materially expanded, no principle removed or redefined.
Principles II and VI gain a single narrow exception permitting inert schema created ahead
of a specified feature. Raised by /speckit-analyze finding D1, which correctly held that
justifying the service_records table in the plan's Complexity Tracking diluted Principle II
rather than resolving it. Resolved here, in the constitution, which is the only place it
can be resolved.
-->

# Dar Constitution

Dar is a personal home manager for villa families in Dubai. This constitution governs
how the product is built. Trust matters more than features: a client who cannot rely on
what Dar tells them has no reason to open it a second time.

## Core Principles

### I. Calm Over Busy

Every screen MUST have exactly one primary action. Secondary actions are text or outline
treatments and MUST NOT compete visually with the primary. If a screen presents two
equally weighted buttons, the design is wrong and MUST be revised before it ships.

Rationale: the client uses Dar a few times a month with a question in mind. A screen that
makes them choose is a screen that makes them think, and thinking is what they hired us
to avoid.

### II. Every Feature Serves a Real Client Task

No feature ships without a screen a client actually reaches by following a real path
through the product. Work that exists only to support a future feature, an internal
convenience, or a hypothetical user MUST NOT ship.

Rationale: an unreached screen is untested, unmaintained and misleading to the next
developer. It costs more than it appears to.

**Narrow exception, added 31 August 2026.** Inert database schema MAY be created ahead of
the feature that will use it, where that feature is named in the product plan, the schema
is small, and nothing in the codebase reads or writes it. "Inert" is strict: no query, no
type, no import, no screen. The `service_records` table is the sole instance at the time of
writing. Any such table MUST be listed in the plan's Complexity Tracking with the feature it
awaits. This exception covers schema only. It is not a licence to add unreached code, routes,
components or actions, and a second unreached table SHOULD prompt a review of whether the
exception is being used as intended rather than a third being added.

### III. Mobile First

Every screen MUST be designed for a phone held in one hand and then adapted upward to
larger viewports, never the reverse. Tap targets MUST be at least 44px. Primary actions
MUST sit within thumb reach in the lower third of the viewport.

Rationale: the client is standing in their villa with one hand on the phone. Desktop is
the adaptation, not the baseline. The admin area is the stated exception and is built
laptop first.

### IV. Private by Default

Row level security MUST be enabled on every table, with no exceptions and no temporary
disabling for convenience. A client MUST be able to read and write only rows belonging to
them. The browser MUST use the anon key only. The service role key MUST be used solely in
server side code, MUST NOT appear in any `NEXT_PUBLIC_` variable, and MUST NOT be
committed. Files MUST live in a private bucket and be served through short lived signed
URLs, never public URLs.

Rationale: this is the principle the business rests on. We hold clients' passports,
tenancy contracts and insurance papers. One cross-client leak ends the product.

### V. Simple Over Clever

Prefer boring, readable code and framework defaults over abstraction. A new developer
MUST be able to understand any single file in about two minutes. No state management
library, no component library, no ORM: Supabase client and framework primitives only.
Abstraction MUST wait until a pattern has repeated at least three times.

Rationale: the team is small. Cleverness is a loan against future attention that the team
cannot repay.

### VI. Extensible by Structure, Not by Prediction

Code MUST be organised by feature folder, each holding its own components, queries,
actions and types. Adding a feature MUST mean adding a folder and a route, not editing
files spread across the codebase. Structure that anticipates unspecified features MUST
NOT be built.

The narrow schema exception recorded under Principle II applies here identically.

Rationale: structure is cheap and prediction is expensive. Feature folders make later
work additive without guessing what that work will be.

### VII. Nothing Blocks on the Network

Mutations MUST update the interface optimistically and reconcile when the server
responds. Loading states MUST use skeletons shaped like the content that is arriving,
never spinners. The interface MUST NOT present a dead state where nothing has changed and
nothing explains why.

Rationale: the client is often on patchy mobile data. Perceived speed is the product.

### VIII. Honest States

Empty means empty and MUST say so in a plain sentence, not an illustration. Errors MUST
state what happened and what the client should do next. Status MUST reflect the true
server state once reconciled, and an optimistic update that fails MUST visibly revert.
Status colour MUST appear only when something is genuinely due or wrong.

Rationale: a client who catches Dar overstating its own health stops believing the parts
that matter, such as whether their Ejari has expired.

## Additional Constraints

**Stack.** Next.js App Router with TypeScript, Tailwind CSS, Supabase for authentication,
database and file storage, deployed on Vercel, developed in GitHub Codespaces.

**Data access.** Server Components fetch data by default. Client Components are used only
where interaction requires them. Mutations are Server Actions. All access passes through
row level security.

**Authentication.** Supabase magic link email sign in. Two roles, client and admin, held
on the profiles table. Route groups separate the client and admin apps, each guarded by
middleware that checks both session and role.

**Storage.** One private bucket. Path convention `{property_id}/{document_or_task_id}/{filename}`
so storage policies stay simple and mirror the table policies.

**Design.** The tokens, type scale and interaction rules in the build plan are binding.
Fraunces for headings and numbers, Inter for everything else. Dates render as
DD Month YYYY. Amounts render in AED.

**Language.** English only. British English in all client-facing copy.

## Development Workflow and Quality Gates

Work follows Spec-Driven Development: constitution, specify, plan, tasks, analyze,
implement, in that order. Implementation MUST NOT begin ahead of an accepted plan and
task list.

Before any feature is considered done:

1. It is reachable by a client or admin on a real path through the product (Principle II).
2. It has been used on a phone viewport, not only a laptop (Principle III).
3. Its tables carry row level security policies, and cross-client isolation has been
   verified by signing in as two different clients (Principle IV).
4. Its empty, loading and error states all exist and are honest (Principles VII, VIII).

Secrets MUST NOT enter the repository, a pull request, or a chat window. `.env.local`
MUST remain listed in `.gitignore`. A service role key believed to be exposed MUST be
rotated in Supabase immediately.

Database changes MUST be written as migration files in `supabase/migrations/` and applied
deliberately. Schema MUST NOT be edited ad hoc in the Supabase dashboard without a
matching migration file in the repository.

## Governance

This constitution supersedes other practices and conventions in this project. Where a
proposed approach conflicts with a principle here, the principle wins or the constitution
is amended first.

**Amendment procedure.** Amendments MUST be proposed as an explicit change to this file,
approved by the project owner, and accompanied by an updated Sync Impact Report at the
top of the document.

**Versioning policy.** Semantic versioning applies. MAJOR for a principle removed or
redefined in a backward incompatible way. MINOR for a principle or section added or
materially expanded. PATCH for clarifications, wording and non-semantic refinements.

**Compliance review.** Every review verifies compliance with these principles. Added
complexity MUST be justified against Principle V, and any justified exception MUST be
recorded in the relevant plan document rather than left implicit in the code.

**Version**: 1.1.0 | **Ratified**: 2026-08-31 | **Last Amended**: 2026-08-31
