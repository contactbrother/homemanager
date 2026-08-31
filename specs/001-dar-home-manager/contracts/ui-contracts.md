# Route Contracts

One row per route. The primary action column enforces Principle I: exactly one per screen.
Every route has a defined empty, loading and error state, which is how FR-042, FR-043 and
Principle VIII are verified rather than assumed.

## Client routes

| Route | Guard | Primary action | Empty state | Loading | Error |
|---|---|---|---|---|---|
| `/sign-in` | none | Send me a link | n/a | button disabled state | "That did not send. Try again, or message us on WhatsApp." |
| `/sign-in/check-email` | none | Send another (locked 60s) | n/a | n/a | n/a |
| `/auth/callback` | none | n/a | n/a | n/a | Expired or used link, with an offer to request another (FR-001) |
| `/` home | client, active | Ask for something | "Nothing needs your attention." (FR-033) | attention-card skeletons | "We could not load your home. Pull to refresh." |
| `/properties` | client, active | n/a, redirects to detail when there is one (FR-008) | "No property yet. We are setting yours up." | property-card skeletons | as above |
| `/properties/[id]` | client, active, owns | Upload a document | "No documents yet." | document-row skeletons | as above |
| `/tasks` | client, active | Ask for something | "No tasks yet." | task-row skeletons | as above |
| `/tasks/[id]` | client, active, owns | Add a note | history always has at least the opening entry | history skeletons | as above |
| `/profile` | client, active | Save | n/a | field skeletons | "That did not save." |

## Admin routes

| Route | Guard | Primary action | Empty state | Loading | Error |
|---|---|---|---|---|---|
| `/admin` | admin | Create client | "No clients yet." | row skeletons | plain message |
| `/admin/clients/[id]` | admin | Create property | "No properties yet." / "No documents yet." | section skeletons | plain message |
| `/admin/tasks` | admin | n/a, filter by status | "Nothing in this filter." | row skeletons | plain message |
| `/admin/tasks/[id]` | admin | Reply | n/a | history skeletons | plain message |

**Deactivation** sits on `/admin/clients/[id]` as a secondary, outline action with a
confirmation, not as the primary action. It is destructive in effect and must not be the
easiest thing to press on the screen.

## Guards

Defined once in `features/auth/guards.ts`, applied in `middleware.ts` and in each route group
layout.

| Guard | Checks | Failure |
|---|---|---|
| `requireSession` | a session exists | redirect to `/sign-in` |
| `requireActive` | `profiles.deactivated_at is null` | end the session, redirect to `/sign-in` (FR-046) |
| `requireClient` | role is `client` | redirect to `/` |
| `requireAdmin` | role is `admin` | 404, not 403, so the admin area's existence is not confirmed (FR-005) |

Ownership is never checked in application code. A client reaching another client's property
receives no rows because row level security returns none, which renders as the not-found state
(FR-004). This is the single mechanism, per Principle IV.

## Accessibility contract

Applies to every route above, from FR-053 and FR-054.

- Contrast: 4.5:1 body text, 3:1 large text, icons and control bounds. `--gold` is a fill
  colour only; `--gold-text` `#8F6631` carries gold text and icons; the primary button label
  is `--ink` on `--gold` at 4.85.
- Keyboard: every action reachable and operable by keyboard in a logical order, with a visible
  focus indicator meeting the contrast rule, and no focus trap. Bottom sheets trap focus while
  open by design and must release it and restore focus to the trigger on close.
- The pressed state of the primary action is a scale change, not a colour change, so it does
  not depend on colour perception.
