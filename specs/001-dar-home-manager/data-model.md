# Phase 1 Data Model: Dar Home Manager MVP

**Date**: 2026-08-31 | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

Six tables, as fixed by section 3 of the build plan. This document records what each holds,
the rules the specification places on it, and the one migration this design adds.

Migrations `20260831000001_schema.sql`, `20260831000002_rls.sql` and
`20260831000003_storage.sql` are already written and unchanged by this plan, save for the two
deletion policies already amended to admin only. A fourth migration is required and is
specified in full at the end.

---

## profiles

One row per auth user, created automatically by the `handle_new_user` trigger.

| Field | Type | Rules from the specification |
|---|---|---|
| `id` | uuid, PK, FK to `auth.users` | |
| `full_name` | text | Set by the team at creation (FR-036); editable by the person (FR-006) |
| `phone` | text | Editable by the person (FR-006) |
| `role` | `user_role`, default `client` | Two roles only (FR-003). Promotion to admin is a manual SQL step, never an application action |
| `created_at` | timestamptz | |
| **`deactivated_at`** | **timestamptz, null** | **New.** Null means active. Set stops sign-in and existing sessions (FR-046) and starts the 90 day retention clock (FR-047, FR-048) |

**Entity note**: the specification's Person is this table plus `auth.users`. The email address
lives in `auth.users`, not here, which is why FR-002's identifier check happens in the auth
layer rather than in a query against `profiles`.

---

## properties

| Field | Type | Rules |
|---|---|---|
| `id` | uuid, PK | |
| `owner_id` | uuid, FK to `profiles`, not null | One owner. A client may own several (FR-008) |
| `name` | text, not null | Required (FR-007) |
| `community`, `address` | text, null | Optional (FR-007) |
| `photo_path` | text, null | Object path in `dar-files`, served by signed URL like any other file |
| `created_at` | timestamptz | |

Created only by a team member (FR-007). The RLS insert, update and delete policies are already
`is_admin()` only.

---

## documents

| Field | Type | Rules |
|---|---|---|
| `id` | uuid, PK | |
| `property_id` | uuid, FK to `properties`, not null | Exactly one property (FR-009) |
| `uploaded_by` | uuid, FK to `profiles`, not null | Client or team member (FR-011) |
| `title` | text, not null | Required (FR-011) |
| `doc_type` | `document_type`, default `other` | Ten values (FR-012) |
| `file_path` | text, not null | `{property_id}/{document_id}/{filename}` |
| `file_size`, `mime_type` | bigint, text | Enforced against the bucket limits (FR-020) |
| `expires_on` | date, null | Null is valid and means never marked (FR-013) |
| `notes` | text, null | |
| `created_at` | timestamptz | |

**Derived state, not stored.** Expiry status is computed at read time in
`features/documents/expiry.ts`, never written to a column:

| Condition | Status | Requirement |
|---|---|---|
| `expires_on is null` | `none` | FR-013 |
| `expires_on <= today` | `expired` | FR-015. Today counts as expired, per the edge case in the spec |
| `expires_on <= today + 30 days` | `expiring` | FR-014 |
| otherwise | `none` | FR-016 |

The 30 day window is a single constant, `EXPIRY_WARNING_DAYS` in `lib/constants.ts`. FR-014
fixes it for every document type and forbids exposing it as a setting, so it is a constant in
code rather than a row in a table.

**Deletion is admin only** (FR-019), for both the row and the stored file. Both policies were
amended on 31 August 2026.

---

## tasks

| Field | Type | Rules |
|---|---|---|
| `id` | uuid, PK | |
| `property_id` | uuid, FK to `properties`, not null | Exactly one property (FR-009, FR-030) |
| `created_by` | uuid, FK to `profiles`, not null | |
| `title` | text, not null | Generated for a voice-only task as `Voice note, DD Month YYYY` (FR-023); renameable by the team |
| `body` | text, null | |
| `voice_path` | text, null | At least one of `body` or `voice_path` must be present (FR-022), enforced in the Server Action |
| `status` | `task_status`, default `received` | Five values. New tasks are `received` (FR-026) |
| `created_at`, `updated_at` | timestamptz | `updated_at` maintained by the existing trigger |

**State transitions: none are restricted.** FR-049 permits any status to move to any other,
including reopening a `done` or `cancelled` task. No check constraint, no transition table, no
guard in the action. The honesty of the record comes from FR-050's history, not from
restricting the move.

Only a team member may change status (FR-027); the RLS update policy is already `is_admin()`.

---

## task_messages

| Field | Type | Rules |
|---|---|---|
| `id` | uuid, PK | |
| `task_id` | uuid, FK to `tasks`, not null | |
| `author_id` | uuid, FK to `profiles`, not null | History is attributed (FR-028) |
| `body` | text, null | |
| `voice_path` | text, null | |
| **`status_to`** | **`task_status`, null** | **New.** Set means this row records a status change (FR-050) |
| `created_at` | timestamptz | Orders the history (FR-028) |

**Two kinds of row, one table.** A note carries `body` or `voice_path`. A status change
carries `status_to`. Both are visible to the client and both render in one chronological list,
which is what makes a reopened task legible rather than confusing.

---

## service_records

Unchanged from the build plan and **not reached by any code in this release**. No query, no
type, no import. Its presence is a recorded constitution violation, justified in the
Complexity Tracking table of [plan.md](./plan.md).

---

## Migration 4

`supabase/migrations/20260831000004_deactivation_and_status_history.sql`. Applied after the
first three, in the Supabase SQL editor, as project owner.

```sql
-- ============================================
-- Deactivation and task status history
-- Added by the Phase 1 design, 31 August 2026.
-- Supports FR-046, FR-047 and FR-050.
-- ============================================

alter table profiles      add column deactivated_at timestamptz;
alter table task_messages add column status_to task_status;

create index profiles_deactivated_idx on profiles(deactivated_at)
  where deactivated_at is not null;

comment on column profiles.deactivated_at is
  'Null means active. Set stops sign-in and existing sessions, and starts the 90 day '
  'retention clock in FR-048. Nothing acts on that clock automatically in this release.';

comment on column task_messages.status_to is
  'Set means this row records a status change rather than a note.';

-- Is the current user an active, non-deactivated person?
create or replace function is_active()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and deactivated_at is null
  );
$$;

-- A deactivated client keeps no read or write access, while their records
-- remain fully reachable by the team during the retention period (FR-047).
drop policy "read own properties"      on properties;
drop policy "read own documents"       on documents;
drop policy "upload to own property"   on documents;
drop policy "update own documents"     on documents;
drop policy "read own tasks"           on tasks;
drop policy "create own tasks"         on tasks;
drop policy "read messages on own tasks"  on task_messages;
drop policy "write messages on own tasks" on task_messages;
drop policy "read own service records" on service_records;

create policy "read own properties"
  on properties for select using (
    is_admin() or (is_active() and owner_id = auth.uid())
  );

create policy "read own documents"
  on documents for select using (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "upload to own property"
  on documents for insert with check (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "update own documents"
  on documents for update using (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "read own tasks"
  on tasks for select using (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "create own tasks"
  on tasks for insert with check (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "read messages on own tasks"
  on task_messages for select using (
    is_admin() or (is_active() and task_id in (
      select t.id from tasks t
      join properties p on p.id = t.property_id
      where p.owner_id = auth.uid()
    ))
  );

create policy "write messages on own tasks"
  on task_messages for insert with check (
    is_admin() or (is_active() and task_id in (
      select t.id from tasks t
      join properties p on p.id = t.property_id
      where p.owner_id = auth.uid()
    ))
  );

create policy "read own service records"
  on service_records for select using (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

-- Storage: a deactivated client reads no files either.
drop policy "read own files"   on storage.objects;
drop policy "upload own files" on storage.objects;

create policy "read own files"
  on storage.objects for select using (
    bucket_id = 'dar-files' and (
      is_admin() or (is_active() and (storage.foldername(name))[1] in (
        select id::text from properties where owner_id = auth.uid()
      ))
    )
  );

create policy "upload own files"
  on storage.objects for insert with check (
    bucket_id = 'dar-files' and (
      is_admin() or (is_active() and (storage.foldername(name))[1] in (
        select id::text from properties where owner_id = auth.uid()
      ))
    )
  );
```

**Note on the delete policies**: `admin deletes documents` and `admin deletes files` are
already `is_admin()` only, so neither needs an `is_active()` clause and neither is touched
here.
