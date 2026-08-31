# Server Action Contracts

Every mutation in Dar is a Server Action. This file is the agreed signature of each one before
it is written. All of them return a discriminated result rather than throwing, so the caller
can revert an optimistic update and show the FR-043 message.

```ts
type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }   // error is the sentence shown to the person
```

All actions are `'use server'`, all validate their own input, and all rely on row level
security for authorisation rather than checking permissions themselves. The guard helpers in
`features/auth/guards.ts` establish who is calling; RLS decides what they may touch.

---

## features/auth/actions.ts

| Action | Signature | Behaviour |
|---|---|---|
| `requestSignInLink` | `(email: string) => Promise<ActionResult>` | Calls `signInWithOtp` with `shouldCreateUser: false`. **Returns `{ ok: true }` whether or not the address is registered** (FR-002). Logs the distinction server side only. Never reveals which case occurred |
| `signOut` | `() => Promise<never>` | Ends the session and redirects to `/sign-in` (FR-006) |

## features/properties/actions.ts

| Action | Signature | Behaviour |
|---|---|---|
| `createProperty` | `(input: { ownerId: string; name: string; community?: string; address?: string; photo?: File }) => Promise<ActionResult<{ id: string }>>` | Admin only by RLS. `name` required (FR-007). Photo uploaded to `{property_id}/photo/{filename}` |
| `updateProfile` | `(input: { fullName: string; phone?: string }) => Promise<ActionResult>` | The signed-in person's own row only (FR-006) |

## features/documents/actions.ts

| Action | Signature | Behaviour |
|---|---|---|
| `uploadDocument` | `(input: { propertyId: string; title: string; docType: DocumentType; expiresOn?: string; file: File }) => Promise<ActionResult<{ id: string }>>` | Client or admin (FR-011). `expiresOn` omitted is valid (FR-013). Rejects over-size or disallowed types with the allowed list in the message (FR-020). Path `{property_id}/{document_id}/{filename}` |
| `getDocumentUrl` | `(documentId: string) => Promise<ActionResult<{ url: string }>>` | Returns a signed URL valid for `SIGNED_URL_TTL` of 60 seconds (FR-017, FR-018). Never returns a public URL |
| `deleteDocument` | `(documentId: string) => Promise<ActionResult>` | **Admin only** (FR-019). Deletes the stored object and then the row. No client screen calls this |

## features/tasks/actions.ts

| Action | Signature | Behaviour |
|---|---|---|
| `createTask` | `(input: { propertyId: string; body?: string; voice?: Blob }) => Promise<ActionResult<{ id: string }>>` | Rejects when both `body` and `voice` are absent (FR-022). Generates `Voice note, DD Month YYYY` as the title when only a voice note is given (FR-023). Status starts `received` (FR-026). Never asks for a category (FR-024) |
| `addTaskNote` | `(input: { taskId: string; body?: string; voice?: Blob }) => Promise<ActionResult>` | Client or admin (FR-028). Writes a `task_messages` row with `status_to` null |
| `setTaskStatus` | `(input: { taskId: string; status: TaskStatus }) => Promise<ActionResult>` | **Admin only** (FR-027). Any status to any status, no transition check (FR-049). Writes the task row **and** a `task_messages` row with `status_to` set, in that order, so the history is complete (FR-050) |
| `renameTask` | `(input: { taskId: string; title: string }) => Promise<ActionResult>` | Admin only. Exists so the team can replace a generated voice-note title (FR-023) |

## features/clients/actions.ts

Admin only. These are the three places the service role key is used, and the only places.

| Action | Signature | Behaviour |
|---|---|---|
| `createClient` | `(input: { email: string; fullName: string }) => Promise<ActionResult<{ id: string }>>` | Creates the auth user through the admin API and sends their first sign-in link. The `handle_new_user` trigger creates the profile. Registers the address, which is what makes FR-002's invite-only rule possible |
| `deactivateClient` | `(profileId: string) => Promise<ActionResult>` | Sets `deactivated_at`, then bans the auth user. Access stops immediately via middleware and `is_active()` in RLS (FR-046). Records remain reachable by the team (FR-047). Lives on `/admin/clients/[id]` |
| `reactivateClient` | `(profileId: string) => Promise<ActionResult>` | Clears `deactivated_at` and unbans. Present because deactivation would otherwise be irreversible by mistake |

**Not built**: anything that acts on FR-048's 90 day clock. No cron, no scheduled function, no
recurring job. Deletion at 90 days is a manual team action in this release.
