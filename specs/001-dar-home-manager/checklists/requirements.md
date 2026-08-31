# Specification Quality Checklist: Dar Home Manager MVP

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-31
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Items marked incomplete require spec updates before `/speckit-clarify` or `/speckit-plan`

### Validation record

**Iteration 1** — one item failed, one deviation recorded, all others passed.

- *Success criteria are measurable*: **failed initially.** SC-011 read "clients stop
  raising routine home questions by message, measured by the team as a fall in inbound
  WhatsApp questions", which set no threshold and no period. Rewritten to name a
  proportion (at least half) and a period (within one month of onboarding). Now passes.
- *No implementation details*: passes, but deliberately close to the line in three places.
  FR-001 says "a single-use link" rather than naming magic-link authentication, FR-018
  says access "granted on request and expires after a short period" rather than naming
  signed URLs, and FR-012 lists the document types. The document types are a business
  vocabulary agreed with the service, not a technical enumeration, so they belong here.
- *No [NEEDS CLARIFICATION] markers*: passes. Three genuine ambiguities were found in the
  source description and resolved with the project owner before drafting rather than left
  as markers: the expiring-soon threshold (30 days, FR-014), the title of a voice-only
  task (generated placeholder, FR-023), and the treatment of an unrecognised email at
  sign-in (refused, invite-only, FR-002). All three are recorded in Assumptions.

**Iteration 2** — all items pass. No further changes.

### Carried into planning

Both items raised at iteration 2 were settled by the project owner on 31 August 2026 and
written back into the spec. Nothing is carried forward.

- **Warning window.** Resolved: a fixed 30 days for every document type, not configurable
  and not exposed in any interface. FR-014 now states this explicitly.
- **Client deletion of documents.** Resolved: withdrawn. Only a team member may delete a
  document. FR-019 now forbids it and no client screen offers the action. The access rules
  in `supabase/migrations/20260831000002_rls.sql` were amended to match, so the documents
  delete policy now requires `is_admin()`. This is a deliberate divergence from section 3.2
  of the build plan.
